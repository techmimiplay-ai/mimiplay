import os
import time
import json
import threading
import requests
import logging

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
class MimiLLMSession:
    """Simple LLM-backed interactive session for Mimi.

    Flow:
      - Wait for wake word (handled by a short blocking listener loop)
      - Greet and enter conversation loop
      - For each user utterance: send to LLM, expect JSON response with keys:
          text (string), image_url (optional string), yt_video (optional string)
      - Speak `text` and expose the current response via attributes accessed by Flask
    """

    def __init__(self):
        self.speech = SpeechManager()
        self.mic = SpeechRecognizer()

        # public state exposed to /mimi-get
        self.current_text = None
        self.current_image = None
        self.current_video = None
        self.current_action = 'idle'  # idle | speaking | listening | showing
        self._stop = False
        self._thread = None

        # Choose provider by env vars
        self.openai_key = os.environ.get('OPENAI_API_KEY')
        self.anthropic_key = os.environ.get('ANTHROPIC_API_KEY')

        logger.info('MimiLLMSession ready (OpenAI:%s Anthropic:%s)'
                    % (bool(self.openai_key), bool(self.anthropic_key)))

    # --------------------------- LLM helpers ---------------------------
    def _call_openai(self, prompt):
        api_key = self.openai_key
        if not api_key:
            return None
        url = 'https://api.openai.com/v1/chat/completions'
        headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}
        # Full Mimi persona + developer tips for child-safe interactive behavior
        system_instructions = (
            "ROLE: You are Mimi, a friendly, magical animal friend for children aged 3 to 5. "
            "Be playful and short; your goal is to be a playful companion who answers questions and tells tiny stories.\n\n"
            "TONE & LANGUAGE: Speak in simple Hinglish (mix of Hindi and English). Use vocabulary a preschooler knows. "
            "Keep responses to 1-2 short sentences. Always end with a simple, fun question to encourage interaction.\n\n"
            "RULES & SAFETY: Never mention ghosts, monsters, death, violence, sickness, politics, or adult topics. If asked about a scary topic, "
            "pivot to something happy (e.g., 'Chalo, let's play with colors!'). If child sounds sad, give gentle emotional support (e.g., 'Main hoon na, don't worry! Aapko hug chahiye?'). "
            "Always be encouraging and upbeat.\n\n"
            "INTERACTION GUIDELINES: Keep replies suitable for ages 3-5. If the user asks a question, give a 1-sentence answer and then ask a playful follow-up question (example: "
            "'Wo ek elephant hai! It has a long trunk. Kya aapne kabhi elephant dekha hai?'). Use sensory words: lal, peela, chota, bada, yummy, soft.\n\n"
            "DEV TIPS (for front-end/audio): Suggest a mouth SVG animation while speaking. Recommend gentle voices (alloy or shimmer); avoid deep onyx voices. "
            "When possible include metadata in the JSON response to help the frontend (e.g., 'voice':'alloy', 'turn_detection':'server_vad', 'silence_duration_ms':900).\n\n"
            "RESPONSE FORMAT: Always reply with a JSON object only. Keys: text, image_url, yt_video. 'text' must be 1-2 very short sentences suitable for a 3-5 year old. 'image_url' and 'yt_video' are optional and should be URLs or null. If you cannot answer, reply with a short comforting sentence and a follow-up question."
        )
        body = {
            'model': 'gpt-4o-mini',
            'messages': [
                {'role': 'system', 'content': system_instructions},
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.6,
            'max_tokens': 400
        }
        try:
            r = requests.post(url, headers=headers, json=body, timeout=20)
            r.raise_for_status()
            data = r.json()
            text = data['choices'][0]['message']['content']
            return text
        except Exception as e:
            logger.error('OpenAI call failed: %s', e)
            return ""

    def _call_anthropic(self, prompt):
        api_key = self.anthropic_key
        if not api_key:
            return None
        url = 'https://api.anthropic.com/v1/complete'
        headers = {'x-api-key': api_key, 'Content-Type': 'application/json'}
        # Anthropic: provide the same detailed Mimi instructions
        anthropic_instructions = (
            "ROLE: You are Mimi, a friendly, magical animal friend for children aged 3 to 5. "
            "Speak in simple Hinglish, use very simple words, keep tone happy and encouraging. Keep replies 1-2 short sentences and end with a playful question.\n\n"
            "RULES: No scary, violent, adult, or political topics. Provide emotional support when child is sad.\n\n"
            "DEV: Prefer gentle voices (alloy/shimmer) and suggest 'turn_detection: server_vad' and 'silence_duration_ms' ~800-1000ms when applicable.\n\n"
            "OUTPUT: Reply ONLY with a JSON object {text, image_url, yt_video} where 'text' is 1-2 short sentences for ages 3-5."
        )
        body = {
            'model': 'claude-2',
            'prompt': (
                anthropic_instructions + '\n\n' + f'User: {prompt}\nMimi:'
            ),
            'max_tokens': 400,
            'temperature': 0.6
        }
        try:
            r = requests.post(url, headers=headers, json=body, timeout=20)
            r.raise_for_status()
            data = r.json()
            # Anthropic returns 'completion' key
            text = data.get('completion') or data.get('completion_text')
            return text
        except Exception as e:
            logger.error('Anthropic call failed: %s', e)
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

    def _get_llm_response_json(self, user_text):
        # Compose a short prompt asking for JSON
        prompt = f'User asked: "{user_text}"\nRespond with JSON: text, image_url, yt_video (or null)'
        text = None
        if self.openai_key:
            text = self._call_openai(prompt)
        if not text and self.anthropic_key:
            text = self._call_anthropic(prompt)
        if not text:
            # fallback canned reply
            return {'text': "I'm sorry, I can't reach the brain right now.", 'image_url': None, 'yt_video': None}
        data = self._parse_json_response(text)
        if not data:
            # As a safe fallback, wrap plain text
            return {'text': text.strip(), 'image_url': None, 'yt_video': None}
        # Ensure keys
        return {
            'text': data.get('text') or '',
            'image_url': data.get('image_url'),
            'yt_video': data.get('yt_video')
        }

    # --------------------------- Conversation ---------------------------
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
            # listen for a user query
            self.current_action = 'listening'
            user_text = self.mic.listen(timeout=12)
            logger.info('User said: %s', user_text)
            if not user_text:
                # prompt once
                self.current_action = 'speaking'
                self.speech.speak_and_wait("I didn't hear you. Can you say that again?")
                continue

            lower = user_text.lower()
            if any(term in lower for term in ['bye', 'thank you', 'ok mimi', 'ok thank you', 'ok mimi bye', 'stop mimi']):
                self.current_action = 'speaking'
                self.speech.speak_and_wait('Goodbye! See you soon. Take care!')
                time.sleep(3)
                self.current_action = 'idle'
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

            # speak the text
            if self.current_text:
                self.speech.speak_and_wait(self.current_text)

            # show result on screen for a short while
            self.current_action = 'showing'
            time.sleep(4)

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
