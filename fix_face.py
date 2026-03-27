import re

with open("face_detection/face_detection.py", "r", encoding="utf-8") as f:
    content = f.read()

old = '''                        for enc, loc in zip(encodings, locations):
                            distances = face_recognition.face_distance(self.known_encodings, enc)

                            if len(distances) and min(distances) < FACE_DISTANCE_THRESHOLD:
                                name = self.known_names[int(np.argmin(distances))]

                                if name not in self.fully_handled_this_session:
                                    self.fully_handled_this_session.add(name)
                                    self.current_person = name
                                    self.current_action = \'talking\'

                                    url = os.getenv("BACKEND_URL", "http://localhost:5000") + "/check-attendance"

                                    data = {
                                        "student_name": name
                                    }

                                    response = requests.post(url, json=data, headers={"Authorization": f"Bearer {os.getenv(\\"API_TOKEN\\")}"})
                                    result = response.json()

                                    if result.get("message") == "already_marked":
                                        self.speech.speak_and_wait(
                                            f\'Hi {name}, your attendance is already marked today.\')
                                        continue'''

new = '''                        for enc, loc in zip(encodings, locations):
                            distances = face_recognition.face_distance(self.known_encodings, enc)

                            if len(distances) and min(distances) < FACE_DISTANCE_THRESHOLD:
                                name = self.known_names[int(np.argmin(distances))]

                                if name not in self.fully_handled_this_session:
                                    self.fully_handled_this_session.add(name)
                                    self.current_person = name
                                    self.current_action = \'talking\'

                                    url = os.getenv("BACKEND_URL", "http://localhost:5000") + "/check-attendance"
                                    data = {"student_name": name}
                                    response = requests.post(url, json=data, headers={"Authorization": f"Bearer {os.getenv(\'API_TOKEN\')}"})
                                    result = response.json()

                                    if result.get("message") == "already_marked":
                                        self.speech.speak_and_wait(f\'Hi {name}, your attendance is already marked today.\')
                                        self.current_action = \'idle\'
                                        self.current_person = None
                                        break'''

if old in content:
    content = content.replace(old, new)
    with open("face_detection/face_detection.py", "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: Fix applied!")
else:
    print("ERROR: Pattern not found - manual edit needed")
