# """
# Face Recognition Attendance System
# ===================================
# FIX: Removed threading.Lock from speak_and_wait() — it caused a deadlock
#      where the reply after listening would never play.

#      The conversation thread is already sequential (one step at a time),
#      so no lock is needed. speak_and_wait() simply calls engine.say() +
#      engine.runAndWait() directly — that's enough to block until done.

# Flow:
#   1. Face recognised
#   2. speak_and_wait("Hi [Name]! How are you today?")  ← blocks until spoken
#   3. mic.listen()                                      ← opens AFTER speech ends
#   4. analyze mood
#   5. mark attendance
#   6. speak_and_wait(mood reply)                        ← blocks until spoken
# """

# import cv2
# try:
#     import face_recognition
# except Exception:
#     face_recognition = None
#     print("face_recognition skipped")
# import os
# import numpy as np
# import pyttsx3
# import logging
# from datetime import datetime
# import csv
# import sys
# import time
# import threading
# import speech_recognition as sr

# # ============================================================================
# # CONFIGURATION
# # ============================================================================

# # Make file paths module-relative so the assets moved into the
# # `face_detection/` subfolder are picked up regardless of current cwd.
# BASE_DIR = os.path.dirname(__file__)
# KNOWN_FACES_DIR = os.path.join(BASE_DIR, "known_faces")
# ATTENDANCE_FILE = os.path.join(BASE_DIR, "attendance.csv")
# LOG_FILE = os.path.join(BASE_DIR, "face_recognition.log")
# FACE_DISTANCE_THRESHOLD      = 0.45
# PROXIMITY_WARNING_THRESHOLD  = 200
# AUTO_EXIT_AFTER_SECONDS      = 60
# FRAMES_TO_PROCESS            = 1000

# HAPPY_KEYWORDS = ['good', 'great', 'awesome', 'excellent', 'fine', 'happy', 'wonderful',
#                   'fantastic', 'amazing', 'perfect', 'nice', 'well', 'better', 'best']
# SAD_KEYWORDS   = ['bad', 'sad', 'terrible', 'awful', 'not good', 'upset', 'tired',
#                   'exhausted', 'stressed', 'worried', 'anxious', 'sick', 'unwell', 'not well']

# # ============================================================================
# # LOGGING
# # ============================================================================

# file_handler    = logging.FileHandler(LOG_FILE, encoding='utf-8')
# console_handler = logging.StreamHandler(sys.stdout)

# if sys.platform == 'win32':
#     try:
#         sys.stdout.reconfigure(encoding='utf-8')
#     except AttributeError:
#         import codecs
#         sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# fmt = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
# file_handler.setFormatter(fmt)
# console_handler.setFormatter(fmt)

# logger = logging.getLogger(__name__)
# logger.setLevel(logging.INFO)
# logger.addHandler(file_handler)
# logger.addHandler(console_handler)

# # ============================================================================
# # ATTENDANCE MANAGER
# # ============================================================================

# class AttendanceManager:
#     def __init__(self, filename=ATTENDANCE_FILE):
#         self.filename     = filename
#         self.marked_today = set()
#         self._init_file()
#         self._load_today()
#         logger.info("AttendanceManager ready")

#     def _init_file(self):
#         """Create file with headers if missing. Also fix empty or header-corrupt files."""
#         write_header = False

#         if not os.path.exists(self.filename):
#             write_header = True
#         else:
#             # File exists — check it actually has the right header
#             try:
#                 with open(self.filename, 'r', encoding='utf-8') as f:
#                     first_line = f.readline().strip()
#                 # If empty or header doesn't contain expected columns, rewrite
#                 if not first_line or 'Date' not in first_line or 'Name' not in first_line:
#                     logger.warning(f"attendance.csv has bad/missing headers — rewriting")
#                     write_header = True
#             except Exception:
#                 write_header = True

#         if write_header:
#             with open(self.filename, 'w', newline='', encoding='utf-8') as f:
#                 csv.writer(f).writerow(['Name', 'Date', 'Time', 'Mood'])
#             logger.info("attendance.csv initialised with headers")

#     def _load_today(self):
#         today = datetime.now().strftime("%Y-%m-%d")
#         try:
#             with open(self.filename, 'r', encoding='utf-8') as f:
#                 reader = csv.DictReader(f)
#                 # Guard: if headers are missing or wrong, skip silently
#                 if reader.fieldnames is None or 'Date' not in reader.fieldnames:
#                     logger.warning("attendance.csv has no valid headers — skipping load")
#                     return
#                 for row in reader:
#                     if row.get('Date') == today:
#                         self.marked_today.add(row['Name'])
#         except Exception as e:
#             logger.error(f"Load today error: {e}")
#         if self.marked_today:
#             logger.info(f"Already marked today: {', '.join(self.marked_today)}")

#     def mark(self, name, mood="Neutral"):
#         if name in self.marked_today:
#             return False
#         now = datetime.now()
#         with open(self.filename, 'a', newline='', encoding='utf-8') as f:
#             csv.writer(f).writerow([
#                 name,
#                 now.strftime("%Y-%m-%d"),
#                 now.strftime("%H:%M:%S"),
#                 mood
#             ])
#         self.marked_today.add(name)
#         logger.info(f"ATTENDANCE MARKED: {name} | {now.strftime('%H:%M:%S')} | {mood}")
#         return True

#     def is_marked(self, name):
#         return name in self.marked_today


# # ============================================================================
# # SPEECH MANAGER
# # FIX: No threading.Lock — that caused a deadlock inside the conversation
# #      thread when it tried to speak the reply after already holding the lock.
# #      engine.runAndWait() itself blocks until audio finishes, which is all we need.
# # ============================================================================

# class SpeechManager:
#     """
#     Single dedicated TTS worker thread owns the pyttsx3 engine exclusively.
#     All callers post to a queue — runAndWait() is NEVER called from two threads.
#     This eliminates 'run loop already started' completely.

#       speak_and_wait(text)  → blocks caller until that line is fully spoken
#       speak_async(text)     → fire-and-forget (warnings, proximity alerts, etc.)
#     """

#     def __init__(self):
#         self._queue    = []               # list of (text, threading.Event | None)
#         self._lock     = threading.Lock()
#         self._trigger  = threading.Event()
#         self._thread   = threading.Thread(target=self._worker, daemon=True)
#         self._thread.start()
#         logger.info("SpeechManager ready")

#     def _worker(self):
#         """The ONE thread that plays audio using edge-tts + pygame."""
#         import pygame
#         import tempfile
#         import asyncio
#         import edge_tts
#         pygame.mixer.init()

#         async def speak(text, path):
#             communicate = edge_tts.Communicate(text, voice="en-IN-NeerjaNeural", rate="-10%", pitch="+15Hz")
#             await communicate.save(path)

#         while True:
#             self._trigger.wait()
#             self._trigger.clear()

#             while True:
#                 with self._lock:
#                     if not self._queue:
#                         break
#                     text, done_event = self._queue.pop(0)

#                 try:
#                     logger.info(f"SPEAKING: {text}")
#                     with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as f:
#                         tmp_path = f.name
#                     loop = asyncio.new_event_loop()
#                     asyncio.set_event_loop(loop)
#                     loop.run_until_complete(speak(text, tmp_path))
#                     loop.close()
#                     pygame.mixer.music.load(tmp_path)
#                     pygame.mixer.music.play()
#                     while pygame.mixer.music.get_busy():
#                         pygame.time.wait(100)
#                     pygame.mixer.music.unload()
#                     os.remove(tmp_path)
#                     logger.info("DONE SPEAKING")
#                 except Exception as e:
#                     logger.error(f"TTS engine error: {e}")
#                     try:
#                         from gtts import gTTS
#                         tts = gTTS(text=text, lang='en', tld='co.in')
#                         tts.save(tmp_path)
#                         pygame.mixer.music.load(tmp_path)
#                         pygame.mixer.music.play()
#                         while pygame.mixer.music.get_busy():
#                             pygame.time.wait(100)
#                     except Exception as e2:
#                         logger.error(f"Fallback TTS also failed: {e2}")
#                 finally:
#                     if done_event:
#                         done_event.set()
#     def speak_and_wait(self, text):
#         """Queue text and block the calling thread until it is fully spoken."""
#         done = threading.Event()
#         with self._lock:
#             self._queue.append((text, done))
#         self._trigger.set()
#         done.wait()   # caller sleeps here; worker sets event when done

#     def speak_async(self, text, only_if_silent=False):
#         """Queue text and return immediately — caller does not wait.
#         If only_if_silent=True, drops the message if anything is already queued or playing.
#         """
#         with self._lock:
#             if only_if_silent and self._queue:
#                 return   # don't pile up warnings
#             self._queue.append((text, None))
#         self._trigger.set()

#     def clear_queue(self):
#         """Discard all queued-but-not-yet-spoken items (stale warnings)."""
#         with self._lock:
#             dropped = len(self._queue)
#             self._queue.clear()
#         if dropped:
#             logger.info(f"TTS queue cleared — dropped {dropped} stale item(s)")
 

# # ============================================================================
# # SPEECH RECOGNISER
# # ============================================================================

# class SpeechRecognizer:
#     def __init__(self):
#         try:
#             self.recognizer = sr.Recognizer()
#             self.microphone = sr.Microphone()
#             with self.microphone as source:
#                 logger.info("Calibrating microphone…")
#                 self.recognizer.adjust_for_ambient_noise(source, duration=1)
#             # CRITICAL: dynamic_energy_threshold drifts DOWN to noise floor in quiet rooms
#             # — this causes it to capture AC hum/fan noise instead of speech → "could not understand"
#             self.recognizer.dynamic_energy_threshold = False
#             # Set a firm minimum: 400 filters noise, human speech is typically 500–3000
#             self.recognizer.energy_threshold = max(self.recognizer.energy_threshold, 400)
#             self.recognizer.pause_threshold       = 0.9   # seconds of silence to end phrase
#             self.recognizer.non_speaking_duration = 0.5
#             logger.info("SpeechRecognizer ready")
#         except Exception as e:
#             logger.error(f"SpeechRecognizer init failed: {e}")
#             self.recognizer = None
#             self.microphone = None

#     def listen(self, timeout=10):
#         if not self.recognizer or not self.microphone:
#             return None
        
#         for attempt in range(3):  # 3 attempts
#             try:
#                 logger.info(f"LISTENING… (energy threshold: {self.recognizer.energy_threshold:.0f})")
#                 with sr.Microphone() as source:
#                     if attempt > 0:
#                         # Recalibrate on retry
#                         self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
#                     audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=10)
#                 logger.info("Audio captured — sending to Google STT…")
#                 text = self.recognizer.recognize_google(audio, language="en-IN")
#                 logger.info(f"HEARD: '{text}'")
#                 return text.lower()
#             except sr.WaitTimeoutError:
#                 logger.warning(f"LISTEN TIMEOUT (attempt {attempt+1}/3)")
#                 if attempt == 2:
#                     return None
#             except sr.UnknownValueError:
#                 logger.warning(f"COULD NOT UNDERSTAND (attempt {attempt+1}/3)")
#                 if attempt == 2:
#                     return None
#             except sr.RequestError as e:
#                 logger.error(f"Google STT error: {e}")
#                 return None
#             except Exception as e:
#                 logger.error(f"Listen error: {e}")
#                 return None
#         return None

# # ============================================================================
# # MOOD ANALYSER
# # ============================================================================

# class MoodAnalyzer:
#     @staticmethod
#     def analyze(text):
#         if not text:
#             return "Neutral"
#         t = text.lower()
#         for kw in HAPPY_KEYWORDS:
#             if kw in t:
#                 logger.info(f"Mood → Happy (matched '{kw}')")
#                 return "Happy"
#         for kw in SAD_KEYWORDS:
#             if kw in t:
#                 logger.info(f"Mood → Sad (matched '{kw}')")
#                 return "Sad"
#         logger.info("Mood → Neutral")
#         return "Neutral"


# # ============================================================================
# # FACE RECOGNITION SYSTEM
# # ============================================================================

# class FaceRecognitionSystem:
#     def __init__(self, known_faces_dir=KNOWN_FACES_DIR):
#         self.known_faces_dir = known_faces_dir
#         self.known_encodings = []
#         self.known_names     = []

#         self.attendance  = AttendanceManager()
#         self.speech      = SpeechManager()
#         self.mic         = SpeechRecognizer()
#         self.mood_engine = MoodAnalyzer()

#         # Flask /get-status attributes
#         self.current_person  = None
#         self.current_mood    = None
#         self.current_action  = "idle"   # idle | waving | talking
#         self.current_warning = None     # too_close | unknown | None
#         self.current_message = None     # already_marked | None

#         self.is_conversing              = False
#         self.processed_this_session     = set()
#         self.fully_handled_this_session = set()  # never re-trigger once fully done
#         self.last_recognized_person     = None
#         self.last_recognition_time      = 0
#         self.recognition_cooldown       = 20   # seconds before same person can re-trigger
#         self.last_conversation_end      = time.time()  # grace active from startup — suppress first-frame warnings

#         # ── ADD THESE TWO LINES ──
#         self.wake_word_active = False   # becomes True once run() starts
#         self._wake_word_thread = None
#         self._session_triggered  = False
        
#         logger.info("=" * 60)
#         logger.info("FACE RECOGNITION ATTENDANCE SYSTEM")
#         logger.info("=" * 60)
#         self._load_faces()

#     # ── Face loading ────────────────────────────────────────────────────────────

#     def _load_faces(self):
#         if not os.path.exists(self.known_faces_dir):
#             os.makedirs(self.known_faces_dir)
#             logger.warning(f"Created {self.known_faces_dir} — add face images!")
#             return

#         files = [f for f in os.listdir(self.known_faces_dir)
#                  if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
#         if not files:
#             logger.warning("No images in known_faces/")
#             return

#         for fname in files:
#             path = os.path.join(self.known_faces_dir, fname)
#             try:
#                 img       = face_recognition.load_image_file(path)
#                 encodings = face_recognition.face_encodings(img)
#                 if not encodings:
#                     logger.warning(f"No face in {fname}")
#                     continue
#                 self.known_encodings.append(encodings[0])
#                 self.known_names.append(os.path.splitext(fname)[0])
#                 logger.info(f"Loaded: {os.path.splitext(fname)[0]}")
#             except Exception as e:
#                 logger.error(f"Error loading {fname}: {e}")

#         logger.info(f"Known people ({len(self.known_names)}): {', '.join(self.known_names)}")

#     # ── Wake word ────────────────────────────────────────────────────────────────
 

#     def run(self):
#         import cv2
#         cap = cv2.VideoCapture(0)
#         if not cap.isOpened():
#           cap = cv2.VideoCapture(1)
#         if not cap.isOpened():
#           logger.error("No camera found!")
#           return
#         logger.info('Camera started')
#         while True:
#             ret, frame = cap.read()
#             if not ret:
#                 break
#             rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#             locations = face_recognition.face_locations(rgb)
#             encodings = face_recognition.face_encodings(rgb, locations)
#             for enc, loc in zip(encodings, locations):
#                 distances = face_recognition.face_distance(self.known_encodings, enc)
#                 if len(distances) and min(distances) < FACE_DISTANCE_THRESHOLD:
#                     name = self.known_names[int(np.argmin(distances))]
#                     if name not in self.fully_handled_this_session:
#                         self.fully_handled_this_session.add(name)
#                         self.current_person = name
#                         self.current_action = 'talking'
#                         self.speech.speak_and_wait(f'Hi {name}! How are you today?')
#                         mood_text = self.mic.listen(timeout=8)
#                         mood = self.mood_engine.analyze(mood_text)
#                         self.current_mood = mood
#                         self.attendance.mark(name, mood)
#                         self.speech.speak_and_wait(f'Great! Attendance marked. Have a wonderful day {name}!')
#                         self.current_action = 'idle'
#                         cap.release()
#                         cv2.destroyAllWindows()
#                         return
#             cv2.imshow('Alexi', frame)
#             if cv2.waitKey(1) & 0xFF == ord('q'):
#                 break
#         cap.release()
#         cv2.destroyAllWindows()




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

try:
    import cv2
    import numpy as np
    import pyttsx3
    import speech_recognition as sr
    import face_recognition
except Exception as e:
    print(f"Hardware-dependent imports skipped on server: {e}")
    cv2 = np = pyttsx3 = sr = face_recognition = None


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

# ============================================================================
# ATTENDANCE MANAGER
# ============================================================================

# class AttendanceManager:
#     def __init__(self, filename=ATTENDANCE_FILE):
#         self.filename     = filename
#         self.marked_today = set()
#         self._init_file()
#         self._load_today()
#         logger.info("AttendanceManager ready")

#     def _init_file(self):
#         """Create file with headers if missing. Also fix empty or header-corrupt files."""
#         write_header = False

#         if not os.path.exists(self.filename):
#             write_header = True
#         else:
#             # File exists — check it actually has the right header
#             try:
#                 with open(self.filename, 'r', encoding='utf-8') as f:
#                     first_line = f.readline().strip()
#                 # If empty or header doesn't contain expected columns, rewrite
#                 if not first_line or 'Date' not in first_line or 'Name' not in first_line:
#                     logger.warning(f"attendance.csv has bad/missing headers — rewriting")
#                     write_header = True
#             except Exception:
#                 write_header = True

#         if write_header:
#             with open(self.filename, 'w', newline='', encoding='utf-8') as f:
#                 csv.writer(f).writerow(['Name', 'Date', 'Time', 'Mood'])
#             logger.info("attendance.csv initialised with headers")

#     def _load_today(self):
#         today = datetime.now().strftime("%Y-%m-%d")
#         try:
#             with open(self.filename, 'r', encoding='utf-8') as f:
#                 reader = csv.DictReader(f)
#                 # Guard: if headers are missing or wrong, skip silently
#                 if reader.fieldnames is None or 'Date' not in reader.fieldnames:
#                     logger.warning("attendance.csv has no valid headers — skipping load")
#                     return
#                 for row in reader:
#                     if row.get('Date') == today:
#                         self.marked_today.add(row['Name'])
#         except Exception as e:
#             logger.error(f"Load today error: {e}")
#         if self.marked_today:
#             logger.info(f"Already marked today: {', '.join(self.marked_today)}")

#     def mark(self, name, mood="Neutral"):
#         if name in self.marked_today:
#             return False
#         now = datetime.now()
#         with open(self.filename, 'a', newline='', encoding='utf-8') as f:
#             csv.writer(f).writerow([
#                 name,
#                 now.strftime("%Y-%m-%d"),
#                 now.strftime("%H:%M:%S"),
#                 mood
#             ])
#         self.marked_today.add(name)
#         logger.info(f"ATTENDANCE MARKED: {name} | {now.strftime('%H:%M:%S')} | {mood}")
#         return True

#     def is_marked(self, name):
#         return name in self.marked_today


class AttendanceManager:
    def __init__(self, db_name="AlexiDB", collection_name="attendance"):
        # Yahan hum MongoDB se connect kar rahe hain
        MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")
        self.client = MongoClient(MONGO_URI)
        self.db = self.client[db_name]
        self.collection = self.db[collection_name]
        print("MongoDB AttendanceManager ready")

    def mark(self, name, mood="Neutral"):
        today = datetime.now().strftime("%Y-%m-%d")

        # Already marked check
        existing = self.collection.find_one({
            "name": name,
            "date": today
        })
        if existing:
            print("Attendance already marked")
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
        print(f"Attendance marked: {name} | student_id: {student_id}")
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
                communicate = edge_tts.Communicate(text, voice="en-IN-NeerjaNeural", rate="-10%", pitch="+15Hz")
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
            logger.error(f"SpeechRecognizer init failed: {e}")
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
        if face_recognition is None:
            logger.warning("face_recognition module is not available. Skipping face loading.")
            return

        if not os.path.exists(self.known_faces_dir):
            os.makedirs(self.known_faces_dir)
            logger.warning(f"Created {self.known_faces_dir} — add face images!")
            return

        files = [f for f in os.listdir(self.known_faces_dir)
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if not files:
            logger.warning("No images in known_faces/")
            return

        for fname in files:
            path = os.path.join(self.known_faces_dir, fname)
            try:
                img       = face_recognition.load_image_file(path)
                encodings = face_recognition.face_encodings(img)
                if not encodings:
                    logger.warning(f"No face in {fname}")
                    continue
                self.known_encodings.append(encodings[0])
                self.known_names.append(os.path.splitext(fname)[0])
                logger.info(f"Loaded: {os.path.splitext(fname)[0]}")
            except Exception as e:
                logger.error(f"Error loading {fname}: {e}")

        logger.info(f"Known people ({len(self.known_names)}): {', '.join(self.known_names)}")

    # ── Wake word ────────────────────────────────────────────────────────────────
 

    # def run(self):
    #     import cv2
    #     cap = cv2.VideoCapture(0)
    #     if not cap.isOpened():
    #       cap = cv2.VideoCapture(1)
    #     if not cap.isOpened():
    #       logger.error("No camera found!")
    #       return
    #     logger.info('Camera started')
    #     while True:
    #         ret, frame = cap.read()
    #         if not ret:
    #             break
    #         rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    #         locations = face_recognition.face_locations(rgb)
    #         encodings = face_recognition.face_encodings(rgb, locations)
    #         for enc, loc in zip(encodings, locations):
    #             distances = face_recognition.face_distance(self.known_encodings, enc)
    #             if len(distances) and min(distances) < FACE_DISTANCE_THRESHOLD:
    #                 name = self.known_names[int(np.argmin(distances))]
    #                 if name not in self.fully_handled_this_session:
    #                     self.fully_handled_this_session.add(name)
    #                     self.current_person = name
    #                     self.current_action = 'talking'
    #                     self.speech.speak_and_wait(f'Hi {name}! How are you today?')
    #                     mood_text = self.mic.listen(timeout=8)
    #                     mood = self.mood_engine.analyze(mood_text)
    #                     self.current_mood = mood
    #                     self.attendance.mark(name, mood)
    #                     self.speech.speak_and_wait(f'Great! Attendance marked. Have a wonderful day {name}!')
    #                     self.current_action = 'idle'
    #                     cap.release()
    #                     cv2.destroyAllWindows()
    #                     return
    #         cv2.imshow('Alexi', frame)
    #         if cv2.waitKey(1) & 0xFF == ord('q'):
    #             break
    #     cap.release()
    #     cv2.destroyAllWindows()



    def run(self):
            import cv2
            self.running = True

            while self.running:
                cap = cv2.VideoCapture(0)
                if not cap.isOpened():
                    cap = cv2.VideoCapture(1)
                if not cap.isOpened():
                    logger.error("No camera found! Retrying in 3 seconds...")
                    time.sleep(3)
                    continue

                logger.info('Camera started')

                try:
                    while self.running:
                        ret, frame = cap.read()
                        if not ret:
                            logger.warning("Frame read failed, retrying...")
                            time.sleep(0.1)
                            continue

                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        locations = face_recognition.face_locations(rgb)
                        encodings = face_recognition.face_encodings(rgb, locations)

                        for enc, loc in zip(encodings, locations):
                            distances = face_recognition.face_distance(self.known_encodings, enc)

                            if len(distances) and min(distances) < FACE_DISTANCE_THRESHOLD:
                                name = self.known_names[int(np.argmin(distances))]

                                if name not in self.fully_handled_this_session:
                                    self.fully_handled_this_session.add(name)
                                    self.current_person = name
                                    self.current_action = 'talking'

                                    url = "http://localhost:5000/check-attendance"

                                    data = {
                                        "student_name": name
                                    }

                                    response = requests.post(url, json=data)
                                    result = response.json()

                                    if result.get("message") == "already_marked":
                                        self.speech.speak_and_wait(
                                            f'Hi {name}, your attendance is already marked today.')
                                        continue

                                    self.speech.speak_and_wait(f'Hi {name}! How are you today?')
                                    mood_text = self.mic.listen(timeout=8)
                                    mood = self.mood_engine.analyze(mood_text)
                                    url = "http://localhost:5000/mark-attendance"

                                    data = {
                                        "student_name": name,
                                        "mood": mood
                                    }
                                    response = requests.post(url, json=data)

                                    result = response.json()


                                    self.current_mood = mood
                                    # self.attendance.mark(name, mood)
                                    if result.get("message") == "already_marked":
                                        self.current_message = "already_marked"
                                        self.speech.speak_and_wait(
                                            f'{name}, your attendance is already marked today.')
                                    else:
                                        self.speech.speak_and_wait(
                                            f'Great! Attendance marked. Have a wonderful day {name}!')
                                    # self.speech.speak_and_wait(
                                    #     f'Great! Attendance marked. Have a wonderful day {name}!')

                                    self.current_action = 'idle'
                                    self.current_person = None
                                    self.current_mood = None

                        if cv2.waitKey(1) & 0xFF == ord('q'):
                            self.running = False
                            break

                except Exception as e:
                    logger.error(f"Camera loop error: {e}")
                    traceback.print_exc()

                finally:
                    cap.release()
                    cv2.destroyAllWindows()
                    if self.running:
                        logger.info("Camera released. Restarting loop in 1 second...")
                        time.sleep(1)

    # def run(self):
    #         import cv2
    #         self.running = True

    #         while self.running:
    #             cap = cv2.VideoCapture(0)
    #             if not cap.isOpened():
    #                 cap = cv2.VideoCapture(1)
    #             if not cap.isOpened():
    #                 logger.error("No camera found! Retrying in 3 seconds...")
    #                 time.sleep(3)
    #                 continue

    #             logger.info('Camera started')

    #             try:
    #                 while self.running:
    #                     ret, frame = cap.read()
    #                     if not ret:
    #                         logger.warning("Frame read failed, retrying...")
    #                         time.sleep(0.1)
    #                         continue

    #                     rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    #                     locations = face_recognition.face_locations(rgb)
    #                     encodings = face_recognition.face_encodings(rgb, locations)

    #                     for enc, loc in zip(encodings, locations):
    #                         distances = face_recognition.face_distance(self.known_encodings, enc)

    #                         if len(distances) and min(distances) < FACE_DISTANCE_THRESHOLD:
    #                             name = self.known_names[int(np.argmin(distances))]

    #                             if name not in self.fully_handled_this_session:
    #                                 self.fully_handled_this_session.add(name)
    #                                 self.current_person = name
    #                                 self.current_action = 'talking'

    #                                 self.speech.speak_and_wait(f'Hi {name}! How are you today?')
    #                                 mood_text = self.mic.listen(timeout=8)
    #                                 mood = self.mood_engine.analyze(mood_text)

    #                                 self.current_mood = mood
    #                                 self.attendance.mark(name, mood)
    #                                 self.speech.speak_and_wait(
    #                                     f'Great! Attendance marked. Have a wonderful day {name}!')

    #                                 # Reset — next person ke liye loop continue karega
    #                                 self.current_action = 'idle'
    #                                 self.current_person = None
    #                                 self.current_mood = None

    #                     if cv2.waitKey(1) & 0xFF == ord('q'):
    #                         self.running = False
    #                         break

    #             except Exception as e:
    #                 logger.error(f"Camera loop error: {e}")
    #                 traceback.print_exc()

    #             finally:
    #                 cap.release()
    #                 cv2.destroyAllWindows()
    #                 if self.running:
    #                     logger.info("Camera released. Restarting loop in 1 second...")
    #                     time.sleep(1)

                        