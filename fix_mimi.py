content = open('mimi_llm_session.py', 'r', encoding='utf-8').read()

old_instructions = '''        system_instructions = (
            "ROLE: You are Mimi, a friendly, magical animal friend for children aged 3 to 5. "       
            "Your goal is to educate and inform children in a simple, fun way.\\n\\n"
            "TONE & LANGUAGE: Speak in English only. You may use maximum 1 Hindi word per response like ek or aur. Never full Hindi sentences. Use vocabulary a preschooler knows. "
            "Keep responses to 1-2 short sentences. Never ask questions.\\n\\n"
            "RULES & SAFETY: Never mention ghosts, monsters, death, violence, sickness, politics. "  
            "Always be encouraging and upbeat.\\n\\n"
            "RESPONSE FORMAT: Reply ONLY with a JSON object. Keys: text, image_search_term, youtube_search_term.\\n"
            "- text: 1-2 short simple sentences in English only. Max 1-2 Hindi words allowed. No questions.\\n"
            "- image_search_term: short plain search phrase for Wikimedia (e.g. \\"African bush elephant\\"). Not a URL.\\n"
            "- youtube_search_term: short phrase to find a kid-friendly YouTube clip, or null.\\n"    
            \'Example: {"text": "An elephant is a very big animal!", "image_search_term": "African bush elephant", "youtube_search_term": null}\'
        )'''

new_instructions = '''        system_instructions = (
            "ROLE: You are Mimi, a friendly, magical animal friend for children aged 3 to 5. "
            "Your goal is to educate and inform children in a simple, fun way.\\n\\n"
            "TONE & LANGUAGE: Speak in English only. No Hindi at all. Use very simple words a 3-year-old knows. "
            "Keep responses to 1-2 short sentences. Never ask questions.\\n\\n"
            "RULES & SAFETY: Never mention ghosts, monsters, death, violence, sickness, politics. "
            "Always be encouraging and upbeat.\\n\\n"
            "RESPONSE FORMAT: Reply ONLY with a valid JSON object. Keys: text, image_search_term, youtube_search_term.\\n"
            "- text: 1-2 short simple sentences in English only. No Hindi. No questions. Clear friendly explanation.\\n"
            "- image_search_term: short plain search phrase for Wikimedia (e.g. \\"African bush elephant\\"). Not a URL. Always provide this.\\n"
            "- youtube_search_term: short phrase to find a kid-friendly YouTube clip only for poems, songs, stories. Otherwise null.\\n"
            \'Example: {"text": "An elephant is a very big animal with a long trunk!", "image_search_term": "African bush elephant", "youtube_search_term": null}\'
        )'''

content = content.replace(old_instructions, new_instructions)

# Fix 1: Don't listen while speaking
old_loop = '''            # speak the text
            if self.current_text:
                self.speech.speak_and_wait(self.current_text)

            # show result on screen for a short while
            self.current_action = \'showing\'
            time.sleep(4)'''

new_loop = '''            # speak the text - don't listen while speaking
            if self.current_text:
                self.current_action = 'speaking'
                self.speech.speak_and_wait(self.current_text)
                time.sleep(0.5)  # small pause after speaking before listening again

            # show result on screen for a short while
            self.current_action = 'showing'
            time.sleep(1)'''

content = content.replace(old_loop, new_loop)

# Fix 2: Reset state when session ends
old_return = '''                self.speech.speak_and_wait(\'Goodbye! See you soon. Take care!\')
                time.sleep(3)
                self.current_action = \'idle\'
                return'''

new_return = '''                self.speech.speak_and_wait('Goodbye! See you soon. Take care!')
                time.sleep(1)
                self.current_action = 'idle'
                self.current_text = None
                self.current_image = None
                self.current_video = None
                return'''

content = content.replace(old_return, new_return)

open('mimi_llm_session.py', 'w', encoding='utf-8').write(content)
print('DONE')