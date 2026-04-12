"""
Face Recognition Attendance System
===================================
FIX: Removed threading.Lock from speak_and_wait() — it caused a deadlock
     where the reply after listening would never play.

     The conversation thread is already sequential (one step at a time),
     so no lock is needed. speak_and_wait() simply calls engine.say() +
     engine.runAndWait() directly — that's enough to block until done.

Flow:
  1. Face recognised
  2. speak_and_wait("Hi [Name]! How are you today?")  ← blocks until spoken
  3. mic.listen()                                      ← opens AFTER speech ends
  4. analyze mood
  5. mark attendance
  6. speak_and_wait(mood reply)                        ← blocks until spoken
"""

import os
import logging
from datetime import datetime
import csv
import sys
import time
import threading
import traceback
import requests
from pymongo import MongoClient

# ============================================================================
# CONFIGURATION
# ============================================================================

# Make file paths module-relative so the assets moved into the
# `face_detection/` subfolder are picked up regardless of current cwd.
BASE_DIR = os.path.dirname(__file__)
KNOWN_FACES_DIR = os.path.join(BASE_DIR, "known_faces")
ATTENDANCE_FILE = os.path.join(BASE_DIR, "attendance.csv")
LOG_FILE = os.path.join(BASE_DIR, "face_recognition.log")
FACE_DISTANCE_THRESHOLD      = 0.45
PROXIMITY_WARNING_THRESHOLD  = 200
AUTO_EXIT_AFTER_SECONDS      = 60
FRAMES_TO_PROCESS            = 1000

HAPPY_KEYWORDS = ['good', 'great', 'awesome', 'excellent', 'fine', 'happy', 'wonderful',
                  'fantastic', 'amazing', 'perfect', 'nice', 'well', 'better', 'best']
SAD_KEYWORDS   = ['bad', 'sad', 'terrible', 'awful', 'not good', 'upset', 'tired',
                  'exhausted', 'stressed', 'worried', 'anxious', 'sick', 'unwell', 'not well']

# ============================================================================
# LOGGING
# ============================================================================

file_handler    = logging.FileHandler(LOG_FILE, encoding='utf-8')
console_handler = logging.StreamHandler(sys.stdout)

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

fmt = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
file_handler.setFormatter(fmt)
console_handler.setFormatter(fmt)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(console_handler)

try:
    import cv2
except ImportError:
    cv2 = None
    logger.warning("cv2 skipped")

try:
    import numpy as np
except ImportError:
    np = None
    logger.warning("numpy skipped")

try:
    import pyttsx3
except ImportError:
    pyttsx3 = None
    logger.warning("pyttsx3 skipped")

try:
    import speech_recognition as sr
except ImportError:
    sr = None
    logger.warning("speech_recognition skipped")

try:
    import face_recognition
except ImportError:
    face_recognition = None
    logger.warning("face_recognition skipped")

# ============================================================================
# ATTENDANCE MANAGER
# ============================================================================

class AttendanceManager:
    def __init__(self):
        from extensions import db
        self.collection = db["attendance"]
        self.db = db
        logger.info("MongoDB AttendanceManager ready")

    def mark(self, name, mood="Neutral"):
        today = datetime.now().strftime("%Y-%m-%d")

        # Already marked check
        existing = self.collection.find_one({
            "name": name,
            "date": today
        })
        if existing:
            logger.info("Attendance already marked")
            return {"message": "already_marked"}

        # Students collection se real _id lo
        students_col = self.db["students"]
        student = students_col.find_one(
            {"name": {"$regex": f"^{name}$", "$options": "i"}}
        )

        student_id = student["_id"] if student else None

        self.collection.insert_one({
            "student_id":   student_id,   # ✅ Real MongoDB ObjectId
            "name":         name,
            "date":         today,
            "time":         datetime.now().strftime("%H:%M:%S"),
            "mood":         mood
        })
        logger.info("Attendance marked: %s | student_id: %s", name, student_id)
        return True


    def is_marked(self, name):
        today = datetime.now().strftime("%Y-%m-%d")
        return self.collection.find_one({"name": name, "date": today}) is not None
# ============================================================================
# SPEECH MANAGER
# FIX: No threading.Lock — that caused a deadlock inside the conversation
#      thread when it tried to speak the reply after already holding the lock.
#      engine.runAndWait() itself blocks until audio finishes, which is all we need.
# ============================================================================

class SpeechManager:
    """
    Single dedicated TTS worker thread owns the pyttsx3 engine exclusively.
    All callers post to a queue — runAndWait() is NEVER called from two threads.
    This eliminates 'run loop already started' completely.

      speak_and_wait(text)  → blocks caller until that line is fully spoken
      speak_async(text)     → fire-and-forget (warnings, proximity alerts, etc.)
    """

    def __init__(self):
        self._queue    = []               # list of (text, threading.Event | None)
        self._lock     = threading.Lock()
        self._trigger  = threading.Event()
        self._thread   = threading.Thread(target=self._worker, daemon=True)
        self._thread.start()
        logger.info("SpeechManager ready")

    def _worker(self):
        """The ONE thread that plays audio using edge-tts + pygame."""
        try:
            import pygame
            import tempfile
            import asyncio
            import edge_tts
            pygame.mixer.init()

            async def speak(text, path):
                communicate = edge_tts.Communicate(text, voice="en-IN-NeerjaExpressiveNeural", rate="-10%", pitch="+15Hz")
                await communicate.save(path)
        except Exception as e:
            logger.warning(f"Audio TTS playback dependencies missing. Audio is disabled: {e}")
            while True:
                self._trigger.wait()
                self._trigger.clear()
                while True:
                    with self._lock:
                        if not self._queue: break
                        text, done_event = self._queue.pop(0)
                    if done_event: done_event.set()
            return

        while True:
            self._trigger.wait()
            self._trigger.clear()

            while True:
                with self._lock:
                    if not self._queue:
                        break
                    text, done_event = self._queue.pop(0)

                try:
                    logger.info(f"SPEAKING: {text}")
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as f:
                        tmp_path = f.name
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    loop.run_until_complete(speak(text, tmp_path))
                    loop.close()
                    pygame.mixer.music.load(tmp_path)
                    pygame.mixer.music.play()
                    while pygame.mixer.music.get_busy():
                        pygame.time.wait(100)
                    pygame.mixer.music.unload()
                    os.remove(tmp_path)
                    logger.info("DONE SPEAKING")
                except Exception as e:
                    logger.error(f"TTS engine error: {e}")
                    try:
                        from gtts import gTTS
                        tts = gTTS(text=text, lang='en', tld='co.in')
                        tts.save(tmp_path)
                        pygame.mixer.music.load(tmp_path)
                        pygame.mixer.music.play()
                        while pygame.mixer.music.get_busy():
                            pygame.time.wait(100)
                    except Exception as e2:
                        logger.error(f"Fallback TTS also failed: {e2}")
                finally:
                    if done_event:
                        done_event.set()
    def speak_and_wait(self, text):
        """Queue text and block the calling thread until it is fully spoken."""
        done = threading.Event()
        with self._lock:
            self._queue.append((text, done))
        self._trigger.set()
        done.wait()   # caller sleeps here; worker sets event when done

    def speak_async(self, text, only_if_silent=False):
        """Queue text and return immediately — caller does not wait.
        If only_if_silent=True, drops the message if anything is already queued or playing.
        """
        with self._lock:
            if only_if_silent and self._queue:
                return   # don't pile up warnings
            self._queue.append((text, None))
        self._trigger.set()

    def clear_queue(self):
        """Discard all queued-but-not-yet-spoken items (stale warnings)."""
        with self._lock:
            dropped = len(self._queue)
            self._queue.clear()
        if dropped:
            logger.info(f"TTS queue cleared — dropped {dropped} stale item(s)")
 

# ============================================================================
# SPEECH RECOGNISER
# ============================================================================

class SpeechRecognizer:
    def __init__(self):
        try:
            if sr is None:
                raise ImportError("speech_recognition module is disabled")
            self.recognizer = sr.Recognizer()
            self.microphone = sr.Microphone()
            with self.microphone as source:
                logger.info("Calibrating microphone…")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
            # CRITICAL: dynamic_energy_threshold drifts DOWN to noise floor in quiet rooms
            # — this causes it to capture AC hum/fan noise instead of speech → "could not understand"
            self.recognizer.dynamic_energy_threshold = False
            # Set a firm minimum: 400 filters noise, human speech is typically 500–3000
            self.recognizer.energy_threshold = max(self.recognizer.energy_threshold, 400)
            self.recognizer.pause_threshold       = 0.9   # seconds of silence to end phrase
            self.recognizer.non_speaking_duration = 0.5
            logger.info("SpeechRecognizer ready")
        except Exception as e:
            # Downgrade to WARNING: this is expected in Docker/Server environments 
            # where no physical microphone is present.
            logger.warning(f"Microphone/PyAudio not found (expected in Docker/Server): {e}")
            self.recognizer = None
            self.microphone = None

    def listen(self, timeout=10):
        if not self.recognizer or not self.microphone:
            return None
        
        for attempt in range(3):  # 3 attempts
            try:
                logger.info(f"LISTENING… (energy threshold: {self.recognizer.energy_threshold:.0f})")
                with sr.Microphone() as source:
                    if attempt > 0:
                        # Recalibrate on retry
                        self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                    audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=10)
                logger.info("Audio captured — sending to Google STT…")
                text = self.recognizer.recognize_google(audio, language="en-IN")
                logger.info(f"HEARD: '{text}'")
                return text.lower()
            except sr.WaitTimeoutError:
                logger.warning(f"LISTEN TIMEOUT (attempt {attempt+1}/3)")
                if attempt == 2:
                    return None
            except sr.UnknownValueError:
                logger.warning(f"COULD NOT UNDERSTAND (attempt {attempt+1}/3)")
                if attempt == 2:
                    return None
            except sr.RequestError as e:
                logger.error(f"Google STT error: {e}")
                return None
            except Exception as e:
                logger.error(f"Listen error: {e}")
                return None
        return None

# ============================================================================
# MOOD ANALYSER
# ============================================================================

class MoodAnalyzer:
    @staticmethod
    def analyze(text):
        if not text:
            return "Neutral"
        t = text.lower()
        for kw in HAPPY_KEYWORDS:
            if kw in t:
                logger.info(f"Mood → Happy (matched '{kw}')")
                return "Happy"
        for kw in SAD_KEYWORDS:
            if kw in t:
                logger.info(f"Mood → Sad (matched '{kw}')")
                return "Sad"
        logger.info("Mood → Neutral")
        return "Neutral"


# ============================================================================
# FACE RECOGNITION SYSTEM
# ============================================================================

class FaceRecognitionSystem:
    def __init__(self, known_faces_dir=KNOWN_FACES_DIR):
        self.known_faces_dir = known_faces_dir
        self.known_encodings = []
        self.known_names     = []

        self.attendance  = AttendanceManager()
        self.speech      = SpeechManager()
        self.mic         = SpeechRecognizer()
        self.mood_engine = MoodAnalyzer()

        # Flask /get-status attributes
        self.current_person  = None
        self.current_mood    = None
        self.current_action  = "idle"   # idle | waving | talking
        self.current_warning = None     # too_close | unknown | None
        self.current_message = None     # already_marked | None

        self.is_conversing              = False
        self.processed_this_session     = set()
        self.fully_handled_this_session = set()  # never re-trigger once fully done
        self.last_recognized_person     = None
        self.last_recognition_time      = 0
        self.recognition_cooldown       = 20   # seconds before same person can re-trigger
        self.last_conversation_end      = time.time()  # grace active from startup — suppress first-frame warnings

        # ── ADD THESE TWO LINES ──
        self.wake_word_active = False   # becomes True once run() starts
        self._wake_word_thread = None
        self._session_triggered  = False
        
        logger.info("=" * 60)
        logger.info("FACE RECOGNITION ATTENDANCE SYSTEM")
        logger.info("=" * 60)
        self._load_faces()

    # ── Face loading ────────────────────────────────────────────────────────────
    def _load_faces(self):
        """Load face encodings from MongoDB GridFS instead of local folder."""
        if face_recognition is None:
            logger.warning("face_recognition module is not available. Skipping face loading.")
            return

        try:
            import gridfs
            import cv2
            from pymongo import MongoClient

            MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")
            client = MongoClient(MONGO_URI)
            db = client["AlexiDB"]
            fs = gridfs.GridFS(db)

            # GridFS se saari face images lo
            all_files = list(db.fs.files.find({"filename": {"$regex": r"\.jpg$"}}))

            if not all_files:
                logger.warning("No face images found in MongoDB GridFS. Register faces first.")
                client.close()
                return

            for file_doc in all_files:
                try:
                    fname = file_doc["filename"]                    # e.g. "507f1f77bcf86cd799439011.jpg"
                    student_name = file_doc.get("student_name") or os.path.splitext(fname)[0]

                    # GridFS se image bytes lo
                    grid_out = fs.get(file_doc["_id"])
                    img_bytes = grid_out.read()

                    # Bytes → numpy array → decode as image
                    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
                    frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
                    if frame is None:
                        logger.warning(f"Could not decode image for {fname}")
                        continue

                    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    encodings = face_recognition.face_encodings(rgb)
                    if not encodings:
                        logger.warning(f"No face detected in {fname}")
                        continue

                    if student_name in self.known_names:
                        logger.warning(f"Duplicate face skipped: {student_name}")
                        continue
                    self.known_encodings.append(encodings[0])
                    self.known_names.append(student_name)
                    logger.info(f"Loaded from DB: {student_name}")

                except Exception as e:
                    logger.error(f"Error loading {file_doc.get('filename', '?')} from DB: {e}")

            client.close()
            logger.info(f"Known people from DB ({len(self.known_names)}): {', '.join(self.known_names)}")

        except Exception as e:
            logger.error(f"MongoDB face loading failed: {e}")

    # ── Wake word ────────────────────────────────────────────────────────────────
 
    def run(self):
        # Backend physical camera disabled per user request.
        # Ensure we set flags but do not open cv2.VideoCapture
        self.running = True
        logger.info("Backend physical camera loop disabled.")
        return