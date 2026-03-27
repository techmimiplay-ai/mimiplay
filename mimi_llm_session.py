import os
import time
import json
import threading
import requests
import logging
from extensions import mimi_chats
from datetime import datetime

try:
    from face_detection.face_detection import SpeechManager, SpeechRecognizer
except Exception:
    try:
        from face_detection_with_sentiment_analysis import SpeechManager, SpeechRecognizer
    except Exception:
        print("Face module skipped")
        SpeechManager = None
        SpeechRecognizer = None

logger = logging.getLogger(__name__)

try:
    import openai as _openai_sdk
except ImportError:
    _openai_sdk = None


class MimiLLMSession:
    """Simple LLM-backed interactive session for Mimi.

    Flow:
      - Wait for wake word (handled by a short blocking listener loop)
      - Greet and enter conversation loop
      - For each user utterance: send to LLM, expect JSON response with keys:
          text (string), image_url (optional string), yt_video (optional string)
      - Speak `text` and expose the current response via attributes accessed by Flask
    """

    def __init__(self, openai_api_key=None, anthropic_api_key=None):
        self.speech = SpeechManager()
        self.mic = SpeechRecognizer()

        # public state exposed to /mimi-get
        self.current_text = None
        self.current_image = None
        self.current_video = None
        self.current_audio = None
        self.current_audio_text = None
        self.current_action = 'idle'  # idle | speaking | listening | showing
        self.session_ended = False    # True when student session completes - frontend uses this
        self.current_student = None   # current student name
        self._stop = False
        self._thread = None
        self.student_name = ""   # ← YE ADD KARO
        self.session_id   = ""
        self.student_id   = None

        # Prefer explicit keys (e.g. from app.py); else environment
        self.openai_key = openai_api_key if openai_api_key is not None else os.environ.get("OPENAI_API_KEY")
        self.anthropic_key = anthropic_api_key if anthropic_api_key is not None else os.environ.get("ANTHROPIC_API_KEY")
        self.youtube_key = os.environ.get("YOUTUBE_API_KEY")

        logger.info(
            "MimiLLMSession ready (OpenAI:%s Anthropic:%s)",
            bool(self.openai_key),
            bool(self.anthropic_key),
        )

    # --------------------------- LLM helpers ---------------------------
    def _call_openai(self, prompt):
        api_key = self.openai_key
        if not api_key:
            logger.warning("_call_openai: no API key, skipping")
            return None
        logger.info("_call_openai: calling OpenAI (key len=%d)", len(api_key))
        system_instructions = (
            "ROLE: You are Mimi, a friendly, magical animal friend for children aged 3 to 5. Your goal is to educate and inform children in a simple, fun way.\n\n"
    "TONE & LANGUAGE: Speak in ENGLISH ONLY. No Hindi words at all. Use vocabulary a preschooler knows. Keep responses to 1-2 short sentences. Never ask questions.\n\n"
    "RULES & SAFETY: Never mention ghosts, monsters, death, violence, sickness, politics, or adult topics. If asked about a scary topic, pivot to something happy. If child sounds sad, give gentle emotional support. Always be encouraging and upbeat.\n\n"
    "RESPONSE FORMAT: Always reply with a JSON object only. Keys: text, image_search_term, youtube_search_term.\n"
    "- text: 1-2 short simple sentences in English only. No Hindi words. No questions.\n"
    "- image_search_term: A short search term to find a relevant image on Wikimedia Commons. Example: 'African elephant'\n"
    "- youtube_search_term: A short search term to find a relevant nursery rhyme or educational video on YouTube. Example: 'elephant song for kids'. Use null if not needed.\n\n"
    "Example: {\"text\": \"Elephant is a very big animal! It has a long trunk.\", \"image_search_term\": \"African elephant\", \"youtube_search_term\": \"elephant song for kids\"}"
        )
        user_message = (
            f'Transcribed speech from a child: "{prompt}"\n'
            "Answer helpfully as Mimi. Output JSON only."
        )
        try:
            if _openai_sdk is not None:
                client = _openai_sdk.OpenAI(api_key=api_key)
                resp = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_instructions},
                        {"role": "user", "content": user_message},
                    ],
                    temperature=0.6,
                    max_tokens=400,
                )
                text = resp.choices[0].message.content  # may be None
                if text:
                    logger.info("OpenAI SDK call success: %s...", text[:60])
                    return text
                else:
                    logger.warning("OpenAI SDK returned empty/None content (finish_reason=%s)",
                                   resp.choices[0].finish_reason)
                    return None
        except Exception as e:
            logger.error("OpenAI SDK call failed: %s", e, exc_info=True)

        # HTTP fallback
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        body = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_instructions},
                {"role": "user", "content": user_message},
            ],
            "temperature": 0.6,
            "max_tokens": 400,
        }
        try:
            r = requests.post(url, headers=headers, json=body, timeout=60)
            r.raise_for_status()
            text = r.json()["choices"][0]["message"]["content"]
            logger.info("OpenAI HTTP call success: %s...", (text or "")[:60])
            return text or None
        except Exception as e:
            logger.error("OpenAI HTTP call failed: %s", e, exc_info=True)
            return None

    def _call_anthropic(self, prompt):
        api_key = self.anthropic_key
        if not api_key:
            return None
        
        # Anthropic instructions
        anthropic_instructions = (
            "ROLE: You are Mimi, a friendly, magical animal friend for children aged 3 to 5. "
            "Speak mostly in simple English with only 1-2 Hindi words, use very simple words, keep tone happy and encouraging. Keep replies 1-2 short sentences.\n\n"
            "OUTPUT: Reply ONLY with a JSON object {text, image_url, yt_video} where 'text' is 1-2 short sentences for ages 3-5."
        )

        try:
            # Try using the SDK if available (matching app.py style)
            import anthropic as _anth_sdk
            client = _anth_sdk.Anthropic(api_key=api_key)
            resp = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=400,
                messages=[
                    {"role": "user", "content": f"{anthropic_instructions}\n\nUser: {prompt}"}
                ],
            )
            text = resp.content[0].text
            logger.info("Anthropic SDK call success: %s", text[:50] + "...")
            return text
        except ImportError:
            logger.warning("Anthropic SDK not installed, falling back to HTTP")
        except Exception as e:
            logger.error("Anthropic SDK call failed: %s", e)

        # Fallback to direct HTTP with Messages API (v1/messages)
        url = 'https://api.anthropic.com/v1/messages'
        headers = {
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
        }
        body = {
            'model': 'claude-3-haiku-20240307',
            'max_tokens': 400,
            'messages': [
                {'role': 'user', 'content': f"{anthropic_instructions}\n\nUser: {prompt}"}
            ]
        }
        try:
            r = requests.post(url, headers=headers, json=body, timeout=20)
            r.raise_for_status()
            data = r.json()
            text = data['content'][0]['text']
            return text
        except Exception as e:
            logger.error('Anthropic HTTP call failed: %s', e)
            return None


    def _fetch_wikimedia_image(self, search_term):
        print('WIKIMEDIA SEARCHING:', search_term)
        try:
            import requests as req
            r = req.get(
                'https://commons.wikimedia.org/w/api.php',
                params={'action':'query','generator':'search','gsrsearch':search_term,'gsrlimit':5,'gsrnamespace':6,'prop':'imageinfo','iiprop':'url','format':'json'},
                headers={'User-Agent':'MimiBot/1.0'},
                timeout=10
            )
            pages = r.json().get('query',{}).get('pages',{})
            for page in pages.values():
                url = page.get('imageinfo',[{}])[0].get('url')
                if url:
                    return url
        except Exception as e:
            print('Wikimedia error:', e)
        return None
    def _parse_json_response(self, text):
        if not text:
            return None
        # Attempt to extract json block from text
        try:
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end != -1 and end > start:
                js = text[start:end+1]
                return json.loads(js)
        except Exception as e:
            logger.warning('Failed to parse JSON from LLM response: %s', e)
        return None
    
    def _fetch_youtube_video_url(self, search_term):
        api_key = self.youtube_key
        if not api_key:
            return None
        try:
            r = requests.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "part": "snippet",
                    "q": search_term + " for kids",
                    "type": "video",
                    "safeSearch": "strict",
                    "videoEmbeddable": "true",
                    "maxResults": 1,
                    "key": api_key,
                },
                timeout=10,
            )
            items = r.json().get("items", [])
            if items:
                video_id = items[0]["id"]["videoId"]
                return f"https://www.youtube.com/watch?v={video_id}"
        except Exception as e:
            print("YouTube API error:", e)
        return None

    def _get_llm_response_json(self, user_text):
        def mask(k):
            if not k: return "None"
            s = str(k)
            if len(s) < 10: return "***"
            return f"{s[:6]}...{s[-4:]}"

        text = None
        openai_err = None
        anthropic_err = None

        logger.info("[LLM] Attempting OpenAI with key %s", mask(self.openai_key))
        if self.openai_key:
            try:
                text = self._call_openai(user_text)
            except Exception as e:
                openai_err = str(e)
                logger.error("[LLM] OpenAI call threw exception: %s", e)
        
        if not text and self.anthropic_key:
            logger.info("[LLM] Trying Anthropic fallback with key %s", mask(self.anthropic_key))
            try:
                text = self._call_anthropic(user_text)
            except Exception as e:
                anthropic_err = str(e)
                logger.error("[LLM] Anthropic call threw exception: %s", e)

        if not text:
            msg = "Sorry, I cannot reach any AI provider right now."
            if not self.openai_key and not self.anthropic_key:
                msg = "No API keys configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY."
            elif openai_err or anthropic_err:
                msg = f"AI Error. OpenAI: {openai_err or 'failed'}, Anthropic: {anthropic_err or 'failed'}"
            
            return {
                "text": msg,
                "image_url": None,
                "yt_video": None,
                "provider": None,
            }
        data = self._parse_json_response(text)
        if not data:
            return {
                "text": text.strip(),
                "image_url": None,
                "yt_video": None,
                "provider": "openai" if self.openai_key else "anthropic",
            }
        search = data.get("image_search_term") or ""
        print("WIKIMEDIA SEARCH:", search)
        image_url = self._fetch_wikimedia_image(search) if search else None
        print("WIKIMEDIA RESULT:", image_url)
        yt_search = data.get("youtube_search_term") or ""
        yt_video = None
        if yt_search and yt_search.lower() not in ("null", "none", ""):
            import urllib.parse
            # API key se try karo
            yt_video = self._fetch_youtube_video_url(yt_search)
            # API key nahi hai toh search URL banao (no key needed)
            if not yt_video:
                yt_video = "https://www.youtube.com/results?search_query=" + urllib.parse.quote(yt_search + " for kids")
            print("YOUTUBE URL:", yt_video)
            print("YOUTUBE SEARCH URL:", yt_video)
        return {
            "text": data.get("text") or "",
            "image_url": image_url,
            "yt_video": yt_video,
            "provider": "openai" if self.openai_key else "anthropic",
        }

    def run(self):
        # Simple wake-word loop (blocking until user says "hey alexi")
        logger.info('Mimi LLM session ready — say "Hey Alexi" to start')
        recognizer = self.mic.recognizer if self.mic and self.mic.recognizer else None
        while not self._stop:
            try:
                if recognizer:
                    with self.mic.microphone as source:
                        logger.info('Waiting for wake word...')
                        audio = recognizer.listen(source, timeout=5, phrase_time_limit=4)
                        try:
                            heard = recognizer.recognize_google(audio, language='en-IN').lower()
                            logger.info('Heard (wake loop): %s', heard)
                            if 'alexi' in heard or 'alexa' in heard or 'hey alexi' in heard:
                                logger.info('Wake word detected — starting interactive session')
                                self.session_ended = False  # reset for new student
                                self.session_ended = False
                                self._interactive_loop()
                                # After interactive loop ends, continue waiting for next session
                        except Exception:
                            pass
                else:
                    time.sleep(0.5)
            except Exception as e:
                logger.error('Wake loop error: %s', e)
                time.sleep(1)

    def _interactive_loop(self):
        self.current_action = 'speaking'
        self.speech.speak_and_wait("Yes! I'm here. You can ask me anything.")
        self.current_action = 'listening'

        while True:

            if self._stop:
                self.current_action = 'idle'
                self.current_text   = None
                print("[Mimi] Session stopped by user.")
                return
            # listen for a user query
            self.current_action = 'listening'
            user_text = self.mic.listen(timeout=8)
            logger.info('User said: %s', user_text)
            if self._stop:
                self.current_action = 'idle'
                return
            if not user_text:
                # prompt once
                self.current_action = 'speaking'
                self.speech.speak_and_wait("I didn't hear you. Can you say that again?")
                continue

            lower = user_text.lower()
            if any(term in lower for term in ['bye', 'thank you', 'ok mimi', 'ok thank you', 'ok mimi bye', 'stop mimi']):
                self.current_action = 'speaking'
                self.speech.speak_and_wait('Goodbye! See you soon. Take care!')
                time.sleep(1)
                self.current_action = 'idle'
                self.current_text = None
                self.current_image = None
                self.current_video = None
                self.session_ended = True   # signal frontend: student done, move to next
                return

            # If user says "play video" handle locally
            if 'play video' in lower and self.current_video:
                # trigger frontend to play
                self.current_action = 'playing_video'
                # speak a short ack
                self.speech.speak_async('Playing the video for you')
                time.sleep(2)
                continue

            # send to LLM
            self.current_action = 'speaking'
            self.current_text = 'Thinking...'
            llm_json = self._get_llm_response_json(user_text)

            # update public fields
            self.current_text = llm_json.get('text')
            self.current_image = llm_json.get('image_url')
            self.current_video = llm_json.get('yt_video')

            # ── MongoDB mein save karo ──────────────────────────
            try:
                now = datetime.now()
                mimi_chats.update_one(
                    {
                        "session_id":   self.session_id,
                        "student_name": self.student_name
                    },
                    {
                        "$push": {
                            "messages": {
                                "question":  user_text,
                                "answer":    self.current_text or "",
                                "image_url": self.current_image or "",
                                "time":      now.strftime("%I:%M %p")
                            }
                        },
                        "$setOnInsert": {
                            "student_id": self.student_id,
                            "date":       now.strftime("%Y-%m-%d"),
                            "started_at": now.isoformat()
                        },
                        "$set": {"updated_at": now.isoformat()},
                        "$inc": {"total_msgs": 1}
                    },
                    upsert=True
                )
                logger.info(f"[DB] Saved Q&A for '{self.student_name}': {user_text[:40]}")
            except Exception as db_err:
                logger.error(f"[DB] Save error: {db_err}")
            # ────────────────────────────────────────────────────

            # speak the text
            if self.current_text:
                self.current_action = 'speaking'
                self.speech.speak_and_wait(self.current_text)
                time.sleep(0.5)  # small pause after speaking before listening again

            # show result on screen for a short while
            self.current_action = 'showing'
            time.sleep(1)

    # def process_text(self, user_text):
    #     """Processes a single text input from the frontend."""
    #     self.current_action = 'thinking'
    #     self.current_text = 'Thinking...'
        
    #     try:
    #         llm_json = self._get_llm_response_json(user_text)
            
    #         # update instance fields for polling
    #         self.current_text = llm_json.get('text')
    #         self.current_image = llm_json.get('image_url')
    #         self.current_video = llm_json.get('yt_video')
    #         self.current_action = 'speaking'
            
    #         return llm_json
    #     except Exception as e:
    #         logger.error("Error in process_text: %s", e)
    #         return {"text": "Sorry, I encountered an error while thinking.", "error": str(e)}
    def process_text(self, user_text):
    # """Processes a single text input from the frontend."""
        self.current_action = 'thinking'
        self.current_text = 'Thinking...'

        try:
            llm_json = self._get_llm_response_json(user_text)

            # update instance fields for polling
            self.current_text   = llm_json.get('text')
            self.current_image  = llm_json.get('image_url')
            self.current_video  = llm_json.get('yt_video')
            self.current_action = 'speaking'

            # ── MongoDB mein save karo (return se PEHLE) ──────────
            try:
                now = datetime.now()
                mimi_chats.update_one(
                    {
                        "session_id":   self.session_id,
                        "student_name": self.student_name
                    },
                    {
                        "$push": {
                            "messages": {
                                "question":  user_text,
                                "answer":    self.current_text or "",
                                "image_url": self.current_image or "",
                                "time":      now.strftime("%I:%M %p")
                            }
                        },
                        "$setOnInsert": {
                            "date":       now.strftime("%Y-%m-%d"),
                            "started_at": now.isoformat()
                        },
                        "$set": {"updated_at": now.isoformat()},
                        "$inc": {"total_msgs": 1}
                    },
                    upsert=True
                )
                logger.info(f"[DB] Saved Q&A for '{self.student_name}': {user_text[:40]}")
            except Exception as db_err:
                logger.error(f"[DB] Save error: {db_err}")
            # ──────────────────────────────────────────────────────

            return llm_json

        except Exception as e:
            logger.error("Error in process_text: %s", e)
            return {"text": "Sorry, I encountered an error while thinking.", "error": str(e)}

        

    def start(self):
        if self._thread and self._thread.is_alive():
            return
        self._stop = False
        self._thread = threading.Thread(target=self.run, daemon=True)
        self._thread.start()

    def stop(self):
        self._stop = True


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    MimiLLMSession().run()
