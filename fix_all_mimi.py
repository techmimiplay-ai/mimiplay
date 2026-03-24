content = open('mimi_llm_session.py', 'r', encoding='utf-8').read()

# ─── FIX 1: Anthropic prompt - English only (no Hindi) ───────────────────────
old_anthropic = '''        anthropic_instructions = (
            "ROLE: You are Mimi, a friendly, magical animal friend for children aged 3 to 5. "       
            "Speak mostly in simple English with only 1-2 Hindi words, use very simple words, keep tone happy and encouraging. Keep replies 1-2 short sentences.\\n\\n"
            "OUTPUT: Reply ONLY with a JSON object {text, image_url, yt_video} where 'text' is 1-2 short sentences for ages 3-5."
        )'''

new_anthropic = '''        anthropic_instructions = (
            "ROLE: You are Mimi, a friendly, magical animal friend for children aged 3 to 5. "
            "Speak in English only. No Hindi at all. Use very simple words a 3-year-old knows. Keep replies 1-2 short sentences. Never ask questions.\\n\\n"
            "RULES: No scary, violent, or adult topics. Always encouraging and upbeat.\\n\\n"
            "OUTPUT: Reply ONLY with a valid JSON object. Keys: text, image_search_term, youtube_search_term.\\n"
            "- text: 1-2 short simple English sentences. No Hindi. No questions.\\n"
            "- image_search_term: short plain search phrase for Wikimedia (e.g. African bush elephant). Not a URL. Always provide this.\\n"
            "- youtube_search_term: short phrase for a kid-friendly YouTube clip only for poems/songs/stories. Otherwise null.\\n"
            'Example: {"text": "An elephant is a very big animal with a long trunk!", "image_search_term": "African bush elephant", "youtube_search_term": null}'
        )'''

content = content.replace(old_anthropic, new_anthropic)

# ─── FIX 2: YouTube links - stop hardcoding yt_video = None ─────────────────
old_yt = '''        search = data.get("image_search_term") or ""
        print("WIKIMEDIA SEARCH:", search)
        image_url = self._fetch_wikimedia_image(search)
        print("WIKIMEDIA RESULT:", image_url)
        yt_video = None
        return {
            "text": data.get("text") or "",
            "image_url": image_url,
            "yt_video": yt_video,
            "provider": "openai" if self.openai_key else "anthropic",
        }'''

new_yt = '''        search = data.get("image_search_term") or ""
        print("WIKIMEDIA SEARCH:", search)
        image_url = self._fetch_wikimedia_image(search) if search else None
        print("WIKIMEDIA RESULT:", image_url)

        # YouTube: use search term from LLM to build a search URL
        yt_search = data.get("youtube_search_term") or ""
        yt_video = None
        if yt_search and yt_search.lower() not in ("null", "none", ""):
            import urllib.parse
            yt_video = "https://www.youtube.com/results?search_query=" + urllib.parse.quote(yt_search + " for kids")
            print("YOUTUBE SEARCH URL:", yt_video)

        return {
            "text": data.get("text") or "",
            "image_url": image_url,
            "yt_video": yt_video,
            "provider": "openai" if self.openai_key else "anthropic",
        }'''

content = content.replace(old_yt, new_yt)

open('mimi_llm_session.py', 'w', encoding='utf-8').write(content)
print("mimi_llm_session.py DONE")

# ─── Now fix app.py ──────────────────────────────────────────────────────────
app_content = open('app.py', 'r', encoding='utf-8').read()

# ─── FIX 3: Repeat answer - /speak called twice fix ─────────────────────────
# The repeat happens because frontend calls /speak AND mimi_system also speaks internally
# Fix: add a flag so process_text skips internal speak when called via API
old_process = '''    def process_text(self, user_text):
        """Processes a single text input from the frontend."""
        self.current_action = 'thinking'
        self.current_text = 'Thinking...'

        try:
            llm_json = self._get_llm_response_json(user_text)

            # update instance fields for polling
            self.current_text = llm_json.get('text')
            self.current_image = llm_json.get('image_url')
            self.current_video = llm_json.get('yt_video')
            self.current_action = 'speaking'

            return llm_json
        except Exception as e:
            logger.error("Error in process_text: %s", e)
            return {"text": "Sorry, I encountered an error while thinking.", "error": str(e)}'''

new_process = '''    def process_text(self, user_text):
        """Processes a single text input from the frontend. Does NOT speak - frontend handles audio."""
        self.current_action = 'thinking'
        self.current_text = 'Thinking...'

        try:
            llm_json = self._get_llm_response_json(user_text)

            # update instance fields for polling
            self.current_text = llm_json.get('text')
            self.current_image = llm_json.get('image_url')
            self.current_video = llm_json.get('yt_video')
            self.current_action = 'showing'  # skip 'speaking' - frontend handles TTS via /speak

            return llm_json
        except Exception as e:
            logger.error("Error in process_text: %s", e)
            return {"text": "Sorry, I encountered an error while thinking.", "error": str(e)}'''

mimi_content = open('mimi_llm_session.py', 'r', encoding='utf-8').read()
mimi_content = mimi_content.replace(old_process, new_process)
open('mimi_llm_session.py', 'w', encoding='utf-8').write(mimi_content)
print("process_text fix DONE")

# ─── FIX 4: Last answer first - add last_response_id to /mimi-get ────────────
old_mimi_get = '''@app.route('/mimi-get', methods=['GET'])
def mimi_get():
    try:
        resp = {
            'text': getattr(mimi_system, 'current_text', None),
            'image_url': getattr(mimi_system, 'current_image', None),
            'yt_video': getattr(mimi_system, 'current_video', None),
            # 'image_url': getattr(mimi_system, 'image_url', None),  # <-- 'current_image' ko 'image_url' kiya
            # 'yt_video': getattr(mimi_system, 'yt_video', None),    # <-- 'current_video' ko 'yt_video' kiya
            'action': getattr(mimi_system, 'current_action', 'idle')
        }
        return jsonify(resp)
    except Exception as e:
        return jsonify({'error': str(e)}), 500'''

new_mimi_get = '''@app.route('/mimi-get', methods=['GET'])
def mimi_get():
    try:
        text = getattr(mimi_system, 'current_text', None)
        image = getattr(mimi_system, 'current_image', None)
        video = getattr(mimi_system, 'current_video', None)
        action = getattr(mimi_system, 'current_action', 'idle')

        # Don't show 'Thinking...' placeholder as a real answer
        if text == 'Thinking...':
            text = None

        # Don't send image_url if it's empty/None - frontend should hide image widget
        if not image:
            image = None

        # Don't send yt_video if None
        if not video:
            video = None

        resp = {
            'text': text,
            'image_url': image,
            'yt_video': video,
            'action': action,
            'has_response': bool(text and action not in ('idle', 'listening', 'thinking'))
        }
        return jsonify(resp)
    except Exception as e:
        return jsonify({'error': str(e)}), 500'''

app_content = app_content.replace(old_mimi_get, new_mimi_get)
open('app.py', 'w', encoding='utf-8').write(app_content)
print("app.py DONE")

print("\n✅ ALL FIXES APPLIED!")
print("Now run: python app.py")