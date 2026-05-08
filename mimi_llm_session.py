import os
import json
import requests
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

try:
    import openai as _openai_sdk
except ImportError:
    _openai_sdk = None


class MimiLLMSession:
    """
    LLM session for one student chat interaction.

    Lifecycle (per session_id):
      1. Instantiated by /start-mimi-session with student context
      2. process_text() called by /mimi-chat-audio for each user utterance
      3. Returns LLM response — DB save is handled by /mimi-save-chat in app.py
      4. session_ended flag set by /api/mimi/stop-session

    No server-side microphone, no background threads, no duplicate DB writes.
    """

    def __init__(self, openai_api_key=None, anthropic_api_key=None,
                 student_name="", session_id="", student_id=None, student_age=10):
        self.student_name = student_name
        self.session_id   = session_id
        self.student_id   = student_id
        self.student_age  = int(student_age) if student_age else 10  # Kept for compatibility but not used in prompts

        # Public state read by /mimi-get
        self.current_text       = None
        self.current_image      = None
        self.current_video      = None
        self.current_audio      = None
        self.current_audio_text = None
        self.current_action     = 'idle'
        self.session_ended      = False

        self.openai_key    = openai_api_key    or os.environ.get("OPENAI_API_KEY")
        self.anthropic_key = anthropic_api_key or os.environ.get("ANTHROPIC_API_KEY")
        self.youtube_key   = os.environ.get("YOUTUBE_API_KEY")

        logger.info(
            "MimiLLMSession created for '%s' | session=%s (OpenAI:%s Anthropic:%s)",
            student_name, session_id,
            bool(self.openai_key), bool(self.anthropic_key),
        )

    # ── Prompt builder ────────────────────────────────────────────────────────

    def _build_system_prompt(self) -> str:
        """
        Single source of truth for the system prompt.
        Standardized for all children aged 4-14 with consistent 2-3 sentence responses.
        Injects current date/time so the LLM can answer real-time questions.
        """
        now = datetime.now()
        current_datetime = now.strftime("%A, %d %B %Y, %I:%M %p")

        # Standardized settings for all children aged 4-14
        tone       = "Use simple, friendly language suitable for children aged 4-14. Be encouraging and fun."
        length     = "Keep your answer to 2-3 sentences."
        yt_suffix  = "for kids educational"
        max_tokens = 400

        return (
            f"ROLE: You are Mimi, a friendly AI tutor for children aged 4-14. "
            f"Your goal is to educate, inform and engage students.\n\n"
            f"TONE & LANGUAGE: Speak in ENGLISH ONLY. {tone} {length}\n\n"
            f"REAL-TIME CONTEXT: The current date and time is {current_datetime}. "
            f"Use this to answer any questions about today's date, day, time or year accurately.\n\n"
            f"TOPICS: Answer questions on any educational topic — science, history, geography, "
            f"current events, politics, sports, technology, maths, general knowledge and more. "
            f"For live weather or temperature questions, explain you don't have real-time weather data "
            f"but describe typical weather for that location or season.\n\n"
            f"SAFETY: Never produce violent, sexual or harmful content. "
            f"If asked something inappropriate, politely redirect to a related educational topic.\n\n"
            f"RESPONSE FORMAT: Always reply with a JSON object only. "
            f"Keys: text, image_search_term, youtube_search_term.\n"
            f"- text: Your answer in English. {length}\n"
            f"- image_search_term: Short Wikimedia Commons search term for a relevant image. "
            f"Example: 'Solar system planets'\n"
            f"- youtube_search_term: Short YouTube search term for a relevant video. "
            f"Always append '{yt_suffix}' unless already present. NEVER use null.\n\n"
            f"Example: {{\"text\": \"The Earth takes 365 days to orbit the Sun. This is why we have years!\", "
            f"\"image_search_term\": \"Earth orbit Sun diagram\", "
            f"\"youtube_search_term\": \"Earth orbit Sun {yt_suffix}\"}}"
        ), max_tokens

    # ── LLM helpers ───────────────────────────────────────────────────────────

    def _call_openai(self, prompt):
        api_key = self.openai_key
        if not api_key:
            return None
        system_instructions, max_tokens = self._build_system_prompt()
        user_message = (
            f'Student said: "{prompt}"\n'
            "Answer helpfully as Mimi. Output JSON only."
        )
        try:
            if _openai_sdk is not None:
                client = _openai_sdk.OpenAI(api_key=api_key)
                resp = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_instructions},
                        {"role": "user",   "content": user_message},
                    ],
                    temperature=0.6,
                    max_tokens=max_tokens,
                )
                text = resp.choices[0].message.content
                if text:
                    return text
                return None
        except Exception as e:
            logger.error("OpenAI SDK call failed: %s", e, exc_info=True)

        # HTTP fallback
        try:
            r = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system_instructions},
                        {"role": "user",   "content": user_message},
                    ],
                    "temperature": 0.6,
                    "max_tokens": max_tokens,
                },
                timeout=60,
            )
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"] or None
        except Exception as e:
            logger.error("OpenAI HTTP call failed: %s", e, exc_info=True)
            return None

    def _call_anthropic(self, prompt):
        api_key = self.anthropic_key
        if not api_key:
            return None
        system_instructions, max_tokens = self._build_system_prompt()
        user_message = (
            f'Student said: "{prompt}"\n'
            "Answer helpfully as Mimi. Output JSON only."
        )
        full_prompt = f"{system_instructions}\n\n{user_message}"
        try:
            import anthropic as _anth_sdk
            client = _anth_sdk.Anthropic(api_key=api_key)
            resp = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": full_prompt}],
            )
            return resp.content[0].text
        except ImportError:
            pass
        except Exception as e:
            logger.error("Anthropic SDK call failed: %s", e)

        # HTTP fallback
        try:
            r = requests.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": max_tokens,
                    "messages": [{"role": "user", "content": full_prompt}],
                },
                timeout=20,
            )
            r.raise_for_status()
            return r.json()["content"][0]["text"]
        except Exception as e:
            logger.error("Anthropic HTTP call failed: %s", e)
            return None

    def _parse_json_response(self, text):
        if not text:
            return None
        try:
            start = text.find("{")
            end   = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                return json.loads(text[start:end + 1])
        except Exception as e:
            logger.warning("Failed to parse JSON from LLM response: %s", e)
        return None

    def _fetch_wikimedia_image(self, search_term):
        try:
            r = requests.get(
                "https://commons.wikimedia.org/w/api.php",
                params={
                    "action": "query", "generator": "search",
                    "gsrsearch": search_term, "gsrlimit": 5,
                    "gsrnamespace": 6, "prop": "imageinfo",
                    "iiprop": "url", "format": "json",
                },
                headers={"User-Agent": "MimiBot/1.0"},
                timeout=10,
            )
            for page in r.json().get("query", {}).get("pages", {}).values():
                url = page.get("imageinfo", [{}])[0].get("url")
                if url:
                    return url
        except Exception as e:
            logger.error("Wikimedia error: %s", e)
        return None

    def _fetch_youtube_video_url(self, search_term):
        api_key = self.youtube_key
        if not api_key:
            return None
        # Use standardized suffix for all children aged 4-14
        suffix = "for kids educational"
        q = search_term if any(s in search_term.lower() for s in ["for kids", "explained", "educational"]) \
            else f"{search_term} {suffix}"
        try:
            r = requests.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "part": "snippet", "q": q, "type": "video",
                    "safeSearch": "strict", "videoEmbeddable": "true",
                    "maxResults": 3, "key": api_key,
                },
                timeout=10,
            )
            for item in r.json().get("items", []):
                id_block = item.get("id", {})
                if id_block.get("kind") == "youtube#video":
                    video_id = id_block.get("videoId", "")
                    if video_id:
                        return f"https://www.youtube.com/embed/{video_id}"
        except Exception as e:
            logger.error("YouTube API error: %s", e)
        return None

    def _get_llm_response_json(self, user_text):
        text = None
        openai_err = anthropic_err = None

        if self.openai_key:
            try:
                text = self._call_openai(user_text)
            except Exception as e:
                openai_err = str(e)

        if not text and self.anthropic_key:
            try:
                text = self._call_anthropic(user_text)
            except Exception as e:
                anthropic_err = str(e)

        if not text:
            if not self.openai_key and not self.anthropic_key:
                msg = "No API keys configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY."
            else:
                msg = f"AI Error. OpenAI: {openai_err or 'failed'}, Anthropic: {anthropic_err or 'failed'}"
            return {"text": msg, "image_url": None, "yt_video": None}

        data = self._parse_json_response(text)
        if not data:
            return {"text": text.strip(), "image_url": None, "yt_video": None}

        search    = data.get("image_search_term") or ""
        yt_search = data.get("youtube_search_term") or search or " ".join((data.get("text") or "").split()[:4])

        image_url = self._fetch_wikimedia_image(search) if search else None
        yt_video  = self._fetch_youtube_video_url(yt_search) if yt_search else None

        return {
            "text":      data.get("text") or "",
            "image_url": image_url,
            "yt_video":  yt_video,
        }

    # ── Public API ─────────────────────────────────────────────────────────────

    def process_text(self, user_text):
        """
        Called by /mimi-chat-audio for each user utterance.
        Returns the LLM response dict.
        DB save is intentionally NOT done here — /mimi-save-chat handles it.
        """
        self.current_action = "thinking"
        self.current_text   = "Thinking..."
        try:
            result = self._get_llm_response_json(user_text)
            self.current_text   = result.get("text")
            self.current_image  = result.get("image_url")
            self.current_video  = result.get("yt_video")
            self.current_action = "done"
            return result
        except Exception as e:
            logger.error("Error in process_text: %s", e)
            return {"text": "Sorry, I encountered an error while thinking.", "error": str(e)}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    s = MimiLLMSession(student_age=12)
    print(s.process_text("What is the capital of France?"))
