c = open('mimi_llm_session.py', encoding='utf-8').read()

# Fix 1: English only - no Hindi
c = c.replace(
    '"TONE & LANGUAGE: Speak mostly in simple English. Use only 1-2 Hindi words occasionally like \'ek\', \'bahut\', \'aur\'. Use vocabulary a preschooler knows. Keep responses to 1-2 short sentences. Never ask questions.\\n\\n"',
    '"TONE & LANGUAGE: Speak in English only. No Hindi words at all. Use very simple vocabulary a 3-year-old knows. Keep responses to 1-2 short sentences. Never ask questions.\\n\\n"'
)

# Fix 2: Don't listen while speaking
c = c.replace(
    '            # speak the text\n            if self.current_text:\n                self.speech.speak_and_wait(self.current_text)\n\n            # show result on screen for a short while\n            self.current_action = \'showing\'\n            time.sleep(1)',
    '            # speak the text - dont listen while speaking\n            if self.current_text:\n                self.current_action = \'speaking\'\n                self.speech.speak_and_wait(self.current_text)\n                time.sleep(0.5)\n\n            # show result on screen for a short while\n            self.current_action = \'showing\'\n            time.sleep(1)'
)

# Fix 3: Reset state on session end
c = c.replace(
    "                self.speech.speak_and_wait('Goodbye! See you soon. Take care!')\n                time.sleep(3)\n                self.current_action = 'idle'\n                return",
    "                self.speech.speak_and_wait('Goodbye! See you soon. Take care!')\n                time.sleep(1)\n                self.current_action = 'idle'\n                self.current_text = None\n                self.current_image = None\n                self.current_video = None\n                self.session_ended = True\n                return"
)

# Fix 4: Add session_ended flag in __init__
c = c.replace(
    "        self._stop = False\n        self._thread = None\n\n        # Choose provider by env vars",
    "        self._stop = False\n        self._thread = None\n        self.session_ended = False\n\n        # Choose provider by env vars"
)

# Fix 5: Reset session_ended on new session
c = c.replace(
    "                                self._interactive_loop()\n                                # After interactive loop ends, continue waiting for next session",
    "                                self.session_ended = False\n                                self._interactive_loop()\n                                # After interactive loop ends, continue waiting for next session"
)

open('mimi_llm_session.py', 'w', encoding='utf-8').write(c)
print('Done')