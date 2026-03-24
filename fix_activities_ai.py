# ─── Fix mimi_llm_session.py - add session_ended flag ────────────────────────
content = open('mimi_llm_session.py', 'r', encoding='utf-8').read()

old_init = '''        self.current_text = None
        self.current_image = None
        self.current_video = None
        self.current_action = 'idle'  # idle | speaking | listening | showing
        self._stop = False
        self._thread = None'''

new_init = '''        self.current_text = None
        self.current_image = None
        self.current_video = None
        self.current_action = 'idle'  # idle | speaking | listening | showing
        self.session_ended = False    # True when student session completes - frontend uses this
        self.current_student = None   # current student name
        self._stop = False
        self._thread = None'''

content = content.replace(old_init, new_init)

# Fix session end - set session_ended = True on goodbye
old_goodbye = '''                self.speech.speak_and_wait('Goodbye! See you soon. Take care!')
                time.sleep(1)
                self.current_action = 'idle'
                self.current_text = None
                self.current_image = None
                self.current_video = None
                return'''

new_goodbye = '''                self.speech.speak_and_wait('Goodbye! See you soon. Take care!')
                time.sleep(1)
                self.current_action = 'idle'
                self.current_text = None
                self.current_image = None
                self.current_video = None
                self.session_ended = True   # signal frontend: student done, move to next
                return'''

content = content.replace(old_goodbye, new_goodbye)

# Fix run() - reset session_ended when new session starts via Hey Alexi
old_interactive_call = '''                                self._interactive_loop()
                                # After interactive loop ends, continue waiting for next session'''

new_interactive_call = '''                                self.session_ended = False  # reset for new student
                                self._interactive_loop()
                                # After interactive loop ends, continue waiting for next session'''

content = content.replace(old_interactive_call, new_interactive_call)

open('mimi_llm_session.py', 'w', encoding='utf-8').write(content)
print("mimi_llm_session.py - session_ended flag DONE")


# ─── Fix app.py - 1. expose session_ended in /mimi-get  2. improve activity-check prompt ────
app = open('app.py', 'r', encoding='utf-8').read()

# Fix 1: add session_ended to /mimi-get response
old_resp = '''        resp = {
            'text': text,
            'image_url': image,
            'yt_video': video,
            'action': action,
            'has_response': bool(text and action not in ('idle', 'listening', 'thinking'))
        }
        return jsonify(resp)'''

new_resp = '''        resp = {
            'text': text,
            'image_url': image,
            'yt_video': video,
            'action': action,
            'has_response': bool(text and action not in ('idle', 'listening', 'thinking')),
            'session_ended': getattr(mimi_system, 'session_ended', False)  # frontend: move to next student
        }
        return jsonify(resp)'''

app = app.replace(old_resp, new_resp)

# Fix 2: improve _build_prompt for better score accuracy
old_prompt = '''def _build_prompt(word, child_said, activity_name, student_name):
    return f"""You are a friendly AI teacher checking if a child said a word correctly.
Activity: {activity_name}
Target word: {word}
Child said: "{child_said}"
Child name: {student_name}
Rules:
- Accept minor pronunciation differences (e.g. "aipple" for "apple" is OK)
- Accept if child said the word correctly even with extra words
- Be encouraging
Respond ONLY with valid JSON (no markdown):
{{"correct": true/false, "feedback": "short encouraging message max 15 words", "hint": "optional hint if wrong"}}"""'''

new_prompt = '''def _build_prompt(word, child_said, activity_name, student_name):
    return f"""You are a friendly AI teacher evaluating a preschool child\'s spoken answer.

Activity: {activity_name}
Target word/answer: {word}
Child said: "{child_said}"
Child name: {student_name}

Evaluation rules:
- CORRECT if child said the target word, even with extra words around it
- CORRECT if pronunciation is close (e.g. "aipple"="apple", "elefant"="elephant", "bloo"="blue")
- CORRECT if child said a valid synonym (e.g. "bunny"="rabbit", "auto"="car")
- INCORRECT only if child said something completely different or said nothing meaningful
- Score: 10 if correct on first try, 5 if partially correct, 0 if wrong
- Be very encouraging and warm for a 3-5 year old child

Respond ONLY with valid JSON, no markdown, no extra text:
{{"correct": true/false, "score": 0/5/10, "feedback": "short warm encouraging message max 12 words", "hint": "simple one-word hint if wrong, else empty string"}}

Examples:
- word="cat", child_said="I see a cat" -> {{"correct": true, "score": 10, "feedback": "Amazing! You said cat perfectly!", "hint": ""}}
- word="elephant", child_said="elefant" -> {{"correct": true, "score": 10, "feedback": "Wonderful! That is an elephant!", "hint": ""}}
- word="blue", child_said="I don\'t know" -> {{"correct": false, "score": 0, "feedback": "Good try! Let\'s try again!", "hint": "blue"}}"""'''

app = app.replace(old_prompt, new_prompt)

open('app.py', 'w', encoding='utf-8').write(app)
print("app.py - session_ended in /mimi-get + better activity prompt DONE")

print("\n✅ ALL ACTIVITY AI FIXES DONE!")
print("\nFrontend developer ko batao:")
print("  - Poll /mimi-get every 500ms")
print("  - Jab session_ended == true aaye:")
print("    1. Listen for 'Hey Alexi' again")
print("    2. Move to next student")
print("    3. POST to /mimi-get reset karo")