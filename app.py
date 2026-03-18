# from flask import Flask, jsonify
# from flask_cors import CORS
# import threading
# import json
# import re
# import os
# import csv

# try:
#     # Prefer the face_detection module inside the face_detection/ folder
#     from face_detection.face_detection import FaceRecognitionSystem
# except Exception:
#     # Fallback to legacy module if present
#     from face_detection_with_sentiment_analysis import FaceRecognitionSystem
# from mimi_llm_session import MimiLLMSession

# import time
# import traceback
# try:
#     import cv2
#     import numpy as np
#     import face_recognition as _face_recognition_lib
#     _cv_available = True
# except ImportError:
#     _cv_available = False

# # ── LLM clients ───────────────────────────────────────────────────────────────
# try:
#     import openai
#     _openai_available = True
# except ImportError:
#     _openai_available = False

# try:
#     import anthropic
#     _anthropic_available = True
# except ImportError:
#     _anthropic_available = False

# # =============================================================================
# # CONFIG — set your API keys here OR use environment variables
# # =============================================================================
# OPENAI_API_KEY    = os.environ.get("OPENAI_API_KEY",    "YOUR_OPENAI_KEY_HERE")
# ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "YOUR_ANTHROPIC_KEY_HERE")

# # Local file to store activity results (no MongoDB needed)
# RESULTS_FILE = os.path.join(os.path.dirname(__file__), "activity_results.json")

# app = Flask(__name__)
# CORS(app) 

# # System initialize karein
# system = FaceRecognitionSystem()
# mimi_system = MimiLLMSession()


# # =============================================================================
# # LLM HELPERS — used by /activity-check AND /generate-activity-questions
# # =============================================================================
# def _call_openai(prompt: str, max_tokens: int = 200) -> dict:
#     if not _openai_available:
#         raise RuntimeError("openai not installed")
#     client = openai.OpenAI(api_key=OPENAI_API_KEY)
#     resp = client.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=[{"role": "user", "content": prompt}],
#         max_tokens=max_tokens,
#         temperature=0.2,
#     )
#     return _parse_json(resp.choices[0].message.content)


# def _call_openai_raw(prompt: str, max_tokens: int = 1000, temperature: float = 1.0) -> str:
#     """Returns raw text (no JSON parse) — used for question generation. High temp = max variety."""
#     if not _openai_available:
#         raise RuntimeError("openai not installed")
#     client = openai.OpenAI(api_key=OPENAI_API_KEY)
#     resp = client.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=[{"role": "user", "content": prompt}],
#         max_tokens=max_tokens,
#         temperature=temperature,
#     )
#     return resp.choices[0].message.content


# def _call_anthropic(prompt: str, max_tokens: int = 200) -> dict:
#     if not _anthropic_available:
#         raise RuntimeError("anthropic not installed")
#     client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
#     resp = client.messages.create(
#         model="claude-haiku-4-5-20251001",
#         max_tokens=max_tokens,
#         messages=[{"role": "user", "content": prompt}],
#     )
#     return _parse_json(resp.content[0].text)


# def _call_anthropic_raw(prompt: str, max_tokens: int = 1000, temperature: float = 1.0) -> str:
#     """Returns raw text (no JSON parse) — used for question generation. High temp = max variety."""
#     if not _anthropic_available:
#         raise RuntimeError("anthropic not installed")
#     client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
#     resp = client.messages.create(
#         model="claude-haiku-4-5-20251001",
#         max_tokens=max_tokens,
#         temperature=temperature,           # <-- was missing before, now passed
#         messages=[{"role": "user", "content": prompt}],
#     )
#     return resp.content[0].text


# def _parse_json(text: str) -> dict:
#     clean = re.sub(r"```[a-z]*", "", text).replace("```", "").strip()
#     return json.loads(clean)


# def _build_prompt(word, child_said, activity_name, student_name):
#     return f"""You are a friendly AI teacher checking if a child said a word correctly.
# Activity: {activity_name}
# Target word: {word}
# Child said: "{child_said}"
# Child name: {student_name}
# Rules:
# - Accept minor pronunciation differences (e.g. "aipple" for "apple" is OK)
# - Accept if child said the word correctly even with extra words
# - Be encouraging
# Respond ONLY with valid JSON (no markdown):
# {{"correct": true/false, "feedback": "short encouraging message max 15 words", "hint": "optional hint if wrong"}}"""

# # =============================================================================
# # ACTIVITY RESULTS FILE HELPERS
# # =============================================================================
# def load_results() -> list:
#     try:
#         if os.path.exists(RESULTS_FILE):
#             with open(RESULTS_FILE, "r") as f:
#                 return json.load(f)
#     except Exception:
#         pass
#     return []


# def save_results(data: list):
#     try:
#         with open(RESULTS_FILE, "w") as f:
#             json.dump(data, f, indent=2)
#     except Exception as e:
#         print(f"[save_results] error: {e}")

# # =============================================================================
# # QUESTION GENERATION PROMPTS — per activity, per difficulty
# # =============================================================================
# QUESTION_PROMPTS = {
#     9: {
#         "easy": (
#             "Generate {count} picture-guess questions for preschool children (easy level, age 3-5). "
#             "Use very common animals and fruits a 3-year-old knows (cat, dog, apple, banana, cow, duck etc). "
#             "For each question: one emoji is shown, child must say the word aloud. "
#             "Return ONLY a valid JSON array, no markdown, no extra text: "
#             '[{{"emoji":"🐱","answer":"Cat"}}, {{"emoji":"🍎","answer":"Apple"}}, ...]'
#         ),
#         "medium": (
#             "Generate {count} picture-guess questions for preschool children (medium level, age 4-5). "
#             "Use less-common animals, vegetables, transport items (fox, deer, carrot, bus, boat etc). "
#             "Return ONLY a valid JSON array, no markdown, no extra text: "
#             '[{{"emoji":"🦊","answer":"Fox"}}, {{"emoji":"🥕","answer":"Carrot"}}, ...]'
#         ),
#         "hard": (
#             "Generate {count} picture-guess questions for preschool children (hard level, age 5+). "
#             "Use harder items: professions, space, weather, tools, less-common animals "
#             "(astronaut, rainbow, hammer, penguin, helicopter etc). "
#             "Return ONLY a valid JSON array, no markdown, no extra text: "
#             '[{{"emoji":"🌈","answer":"Rainbow"}}, {{"emoji":"🔨","answer":"Hammer"}}, ...]'
#         ),
#     },
#     10: {
#         "easy": (
#             "Generate {count} counting questions for preschool children (easy, count 1-5 items). "
#             "Each question shows ONE type of emoji repeated 1 to 5 times. "
#             "Use fun emojis: fruits, animals, stars, balls. "
#             "Return ONLY a valid JSON array, no markdown, no extra text: "
#             '[{{"display":"🍎🍎🍎","answer":"3","count":3}}, {{"display":"⭐⭐","answer":"2","count":2}}, ...]'
#         ),
#         "medium": (
#             "Generate {count} counting questions for preschool children (medium, count 6-10 items). "
#             "Each question shows ONE emoji repeated 6 to 10 times. "
#             "Use different emojis for each question. "
#             "Return ONLY a valid JSON array, no markdown, no extra text: "
#             '[{{"display":"🐶🐶🐶🐶🐶🐶🐶","answer":"7","count":7}}, ...]'
#         ),
#         "hard": (
#             "Generate {count} emoji addition problems for preschool children (hard level). "
#             "Show two groups of the SAME emoji separated by +, total between 5 and 10. "
#             "Use a different emoji for each question. "
#             "Return ONLY a valid JSON array, no markdown, no extra text: "
#             '[{{"display":"🍎🍎🍎 + 🍎🍎","answer":"5","addend1":3,"addend2":2}}, ...]'
#         ),
#     },
#     11: {
#         "easy": (
#             "Generate {count} simple AB repeating pattern questions for preschool children (easy level). "
#             "Use 2-element color emoji or shape emoji patterns. Show 3-4 elements then ?. "
#             "The answer should be a single English word (color or shape name). "
#             "Return ONLY a valid JSON array, no markdown, no extra text: "
#             '[{{"pattern":"🔴 → 🔵 → 🔴 → ?","answer":"Blue","hint":"Blue"}}, ...]'
#         ),
#         "medium": (
#             "Generate {count} pattern completion questions for preschool children (medium level). "
#             "Mix of: ABC emoji patterns, simple number sequences (1,2,3,?), and (5,4,3,?). "
#             "The answer should be a word (color name or number word like Four, Two). "
#             "Return ONLY a valid JSON array, no markdown, no extra text: "
#             '[{{"pattern":"1 → 2 → 3 → ?","answer":"Four","hint":"Four"}}, '
#             '{{"pattern":"🟢 → 🟡 → 🔴 → ?","answer":"Green","hint":"Green"}}, ...]'
#         ),
#         "hard": (
#             "Generate {count} hard pattern completion questions for preschool children (hard level). "
#             "Include: skip-counting by 2s or 3s (2,4,6,8,?), decreasing sequences (10,8,6,4,?), "
#             "and multiplication patterns (3,6,9,12,?). Answers must be number words (Eight, Ten, Fifteen etc). "
#             "Return ONLY a valid JSON array, no markdown, no extra text: "
#             '[{{"pattern":"2 → 4 → 6 → 8 → ?","answer":"Ten","hint":"Ten"}}, ...]'
#         ),
#     },
#     12: {
#         "easy": (
#             "Generate {count} mixed quiz questions for preschool children (easy level). "
#             "Mix of types — include at least one of each: "
#             "picture-guess (common animal/fruit emoji), word (child says the word shown), "
#             "pattern (simple AB). Use easy vocabulary only. "
#             "Return ONLY a valid JSON array, no markdown, no extra text. Use these exact type formats: "
#             '[{{"type":"picture","emoji":"🐱","answer":"Cat"}}, '
#             '{{"type":"word","word":"Dog","emoji":"🐶"}}, '
#             '{{"type":"pattern","pattern":"🔴→🔵→🔴→?","answer":"Red","hint":"Red"}}, ...]'
#         ),
#         "medium": (
#             "Generate {count} mixed quiz questions for preschool children (medium level). "
#             "Mix of: picture-guess (less-common animals), counting (6-10 items), pattern (ABC or number sequence). "
#             "Return ONLY a valid JSON array, no markdown, no extra text: "
#             '[{{"type":"picture","emoji":"🦁","answer":"Lion"}}, '
#             '{{"type":"count","display":"🌟🌟🌟🌟🌟🌟🌟","answer":"7","count":7}}, '
#             '{{"type":"pattern","pattern":"1→2→3→?","answer":"Four","hint":"Four"}}, ...]'
#         ),
#         "hard": (
#             "Generate {count} mixed quiz questions for preschool children (hard level). "
#             "Mix of: hard picture-guess (vehicles, professions, weather), addition counting, skip-count patterns. "
#             "Return ONLY a valid JSON array, no markdown, no extra text: "
#             '[{{"type":"picture","emoji":"🚁","answer":"Helicopter"}}, '
#             '{{"type":"count","display":"⭐⭐⭐ + ⭐⭐⭐⭐","answer":"7","addend1":3,"addend2":4}}, '
#             '{{"type":"pattern","pattern":"3→6→9→?","answer":"Twelve","hint":"Twelve"}}, ...]'
#         ),
#     },
# }

# @app.route('/start-classroom', methods=['GET'])
# def start_classroom():
#     try:
#         def run_integrated():
#             system.run()
#             mimi_system.run()

#         thread = threading.Thread(target=run_integrated)
#         thread.daemon = True
#         thread.start()

#         return jsonify({
#             "status": "success",
#             "message": "Mimi is now active and looking for faces!",
#             "character_state": "waving"
#         })
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


# @app.route('/start-face-detect', methods=['GET'])
# def start_face_detect():
#     """
#     Face detection for Activities — identifies WHO is in front of the camera
#     but does NOT mark attendance or trigger mood conversation.
#     """
#     try:
#         def _detect_only():
#             if not _cv_available:
#                 return
#             known_dir = os.path.join(os.path.dirname(__file__), "face_detection", "known_faces")
#             if not os.path.exists(known_dir):
#                 known_dir = os.path.join(os.path.dirname(__file__), "known_faces")

#             known_encodings, known_names = [], []
#             if os.path.exists(known_dir):
#                 for fname in os.listdir(known_dir):
#                     if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
#                         continue
#                     img = _face_recognition_lib.load_image_file(os.path.join(known_dir, fname))
#                     encs = _face_recognition_lib.face_encodings(img)
#                     if encs:
#                         known_encodings.append(encs[0])
#                         known_names.append(os.path.splitext(fname)[0].replace('_', ' ').title())

#             cap = cv2.VideoCapture(0)
#             system.current_person  = None
#             system.current_action  = 'detecting'
#             system.current_warning = None

#             try:
#                 while getattr(system, '_activity_detecting', False):
#                     ret, frame = cap.read()
#                     if not ret:
#                         time.sleep(0.1)
#                         continue
#                     small = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
#                     rgb   = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
#                     locs  = _face_recognition_lib.face_locations(rgb)
#                     encs  = _face_recognition_lib.face_encodings(rgb, locs)

#                     # Too-close warning
#                     system.current_warning = None
#                     for (top, right, bottom, left) in locs:
#                         if (bottom - top) > 80:
#                             system.current_warning = 'too_close'
#                             break

#                     # Match face — identify only, no attendance
#                     matched = None
#                     for enc in encs:
#                         if not known_encodings:
#                             break
#                         dists = _face_recognition_lib.face_distance(known_encodings, enc)
#                         best  = int(np.argmin(dists))
#                         if dists[best] < 0.6:
#                             matched = known_names[best]
#                             break
#                     system.current_person = matched
#                     system.current_action = 'recognized' if matched else 'detecting'
#                     time.sleep(0.05)
#             finally:
#                 cap.release()
#                 system.current_action  = 'idle'
#                 system.current_person  = None
#                 system._activity_detecting = False

#         system._activity_detecting = True
#         t = threading.Thread(target=_detect_only, daemon=True)
#         t.start()
#         return jsonify({"status": "success", "message": "Face detection started (no attendance)"})
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


# @app.route('/stop-face-detect', methods=['GET'])
# def stop_face_detect():
#     """Stop the activity face detection loop."""
#     try:
#         system._activity_detecting = False
#         return jsonify({"status": "success"})
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


# @app.route('/get-status', methods=['GET'])
# def get_status():
#     """
#     Real-time status from Python face recognition system.
#     Frontend polls this every 500ms for live updates.
#     """
#     try:
#         # Get current values from the system
#         person = getattr(system, 'current_person', None)
#         mood = getattr(system, 'current_mood', None)
#         action = getattr(system, 'current_action', 'idle')
        
#         # Get warning flags (if any)
#         warning = getattr(system, 'current_warning', None)
#         message = getattr(system, 'current_message', None)
        
#         response = {
#             "person": person,
#             "mood": mood if mood else None,
#             "action": action,
#             "warning": warning,
#             "message": message
#         }
        
#         return jsonify(response)
    
#     except Exception as e:
#         return jsonify({
#             "person": None,
#             "mood": None,
#             "action": "idle",
#             "warning": None,
#             "message": f"Error: {str(e)}"
#         })


# @app.route('/start-mimi-session', methods=['GET'])
# def start_mimi_session():
#     try:
#         thread = threading.Thread(target=mimi_system.start)
#         thread.daemon = True
#         thread.start()
#         return jsonify({"status": "success", "message": "Mimi LLM session started"})
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


# @app.route('/mimi-get', methods=['GET'])
# def mimi_get():
#     try:
#         resp = {
#             'text': getattr(mimi_system, 'current_text', None),
#             'image_url': getattr(mimi_system, 'current_image', None),
#             'yt_video': getattr(mimi_system, 'current_video', None),
#             # 'image_url': getattr(mimi_system, 'image_url', None),  # <-- 'current_image' ko 'image_url' kiya
#             # 'yt_video': getattr(mimi_system, 'yt_video', None),    # <-- 'current_video' ko 'yt_video' kiya
#             'action': getattr(mimi_system, 'current_action', 'idle')
#         }
#         return jsonify(resp)
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500



# @app.route('/activity-check', methods=['POST'])
# def activity_check():
#     """
#     Check if child said a word correctly using LLM.
#     Body: { word, child_said, activity_name, student_name }
#     Returns: { result: { correct, feedback, hint } }
#     """
#     try:
#         data         = request.get_json() or {}
#         word         = data.get("word", "")
#         child_said   = data.get("child_said", "")
#         activity_name = data.get("activity_name", "Word Practice")
#         student_name = data.get("student_name", "Student")

#         prompt = _build_prompt(word, child_said, activity_name, student_name)

#         result = None
#         try:
#             result = _call_openai(prompt)
#         except Exception as e1:
#             print(f"[activity-check] OpenAI failed: {e1}")
#         if result is None:
#             try:
#                 result = _call_anthropic(prompt)
#             except Exception as e2:
#                 print(f"[activity-check] Anthropic failed: {e2}")
#         if result is None:
#             ok = child_said.lower().strip() in word.lower()
#             result = {
#                 "correct":  ok,
#                 "feedback": f"Great job! {word} is correct!" if ok else f"Try again! The word is {word}",
#                 "hint":     "" if ok else f"Say it slowly: {word}",
#             }
#         return jsonify({"result": result})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @app.route('/generate-activity-questions', methods=['POST'])
# def generate_activity_questions():
#     """
#     Generate fresh LLM questions for activities 9-12.
#     Body: { activity_id, difficulty, count, session_seed }
#     Returns: { questions: [...] }

#     Activity 9  — Picture Guess   → [{ emoji, answer }, ...]
#     Activity 10 — Counting Game   → [{ display, answer, count } or { display, answer, addend1, addend2 }, ...]
#     Activity 11 — Pattern Fun     → [{ pattern, answer, hint }, ...]
#     Activity 12 — Quiz Mode       → [{ type, ...fields }, ...]
#     """
#     try:
#         data         = request.get_json() or {}
#         activity_id  = int(data.get("activity_id", 9))
#         difficulty   = data.get("difficulty", "easy")   # easy | medium | hard
#         count        = int(data.get("count", 6))
#         session_seed = data.get("session_seed", "")     # random seed from frontend

#         print(f"\n{'='*60}")
#         print(f"[generate-questions] REQUEST: activity={activity_id}, difficulty={difficulty}, count={count}, seed={session_seed}")
#         print(f"[generate-questions] OpenAI available: {_openai_available}, key set: {OPENAI_API_KEY != 'YOUR_OPENAI_KEY_HERE'}")
#         print(f"[generate-questions] Anthropic available: {_anthropic_available}, key set: {ANTHROPIC_API_KEY != 'YOUR_ANTHROPIC_KEY_HERE'}")

#         # Validate
#         if activity_id not in QUESTION_PROMPTS:
#             return jsonify({"questions": [], "error": "activity_id must be 9, 10, 11, or 12"}), 400
#         if difficulty not in ("easy", "medium", "hard"):
#             difficulty = "easy"

#         prompt_template = QUESTION_PROMPTS[activity_id][difficulty]
#         # Inject session_seed so every LLM call gets a slightly different prompt → different questions
#         seed_line = f"\n\nIMPORTANT: Session ID is '{session_seed}'. Generate COMPLETELY DIFFERENT questions than last time. Do NOT repeat previous answers."
#         prompt = prompt_template.format(count=count) + seed_line

#         print(f"[generate-questions] Prompt length: {len(prompt)} chars")

#         # Try OpenAI first, then Anthropic
#         raw = None
#         used_provider = None

#         try:
#             if _openai_available and OPENAI_API_KEY != "YOUR_OPENAI_KEY_HERE":
#                 print("[generate-questions] Trying OpenAI...")
#                 raw = _call_openai_raw(prompt, max_tokens=1000, temperature=1.0)
#                 used_provider = "OpenAI"
#                 print(f"[generate-questions] OpenAI responded, raw length={len(raw)}")
#                 print(f"[generate-questions] OpenAI raw (first 300): {raw[:300]}")
#             else:
#                 print("[generate-questions] OpenAI skipped (not available or key not set)")
#         except Exception as e1:
#             print(f"[generate-questions] OpenAI FAILED: {type(e1).__name__}: {e1}")

#         if not raw:
#             try:
#                 if _anthropic_available and ANTHROPIC_API_KEY != "YOUR_ANTHROPIC_KEY_HERE":
#                     print("[generate-questions] Trying Anthropic...")
#                     raw = _call_anthropic_raw(prompt, max_tokens=1000, temperature=1.0)
#                     used_provider = "Anthropic"
#                     print(f"[generate-questions] Anthropic responded, raw length={len(raw)}")
#                     print(f"[generate-questions] Anthropic raw (first 300): {raw[:300]}")
#                 else:
#                     print("[generate-questions] Anthropic skipped (not available or key not set)")
#             except Exception as e2:
#                 print(f"[generate-questions] Anthropic FAILED: {type(e2).__name__}: {e2}")

#         if not raw:
#             print("[generate-questions] BOTH LLMs failed — returning empty (frontend will use static fallback)")
#             return jsonify({
#                 "questions": [],
#                 "error": "LLM unavailable — check your API keys in app.py or environment variables"
#             }), 200

#         # Parse the JSON array out of the response
#         try:
#             clean = re.sub(r"```[a-z]*", "", raw).replace("```", "").strip()
#             start = clean.find('[')
#             end   = clean.rfind(']')
#             if start != -1 and end != -1 and end > start:
#                 questions = json.loads(clean[start:end + 1])
#                 print(f"[generate-questions] SUCCESS via {used_provider}: parsed {len(questions)} questions")
#                 for i, q in enumerate(questions):
#                     print(f"  Q{i+1}: {q}")
#                 return jsonify({"questions": questions})
#             else:
#                 print(f"[generate-questions] No JSON array brackets found in response: {raw[:500]}")
#         except Exception as pe:
#             print(f"[generate-questions] JSON parse error: {type(pe).__name__}: {pe}")
#             print(f"[generate-questions] Raw that failed to parse: {raw[:500]}")

#         return jsonify({"questions": [], "error": f"Parse failed from {used_provider} — check server logs"}), 200

#     except Exception as e:
#         print(f"[generate-questions] Unexpected error: {type(e).__name__}: {e}")
#         traceback.print_exc()
#         return jsonify({"error": str(e)}), 500


# @app.route('/save-activity-result', methods=['POST'])
# def save_activity_result():
#     """
#     Save student activity result to local JSON file.
#     Body: { student_id, student_name, activity_id, activity_name, stars, score }
#     """
#     try:
#         from datetime import datetime
#         data  = request.get_json() or {}
#         entry = {
#             "id":            int(datetime.now().timestamp() * 1000),
#             "student_id":    data.get("student_id",    "student-1"),
#             "student_name":  data.get("student_name",  "Student"),
#             "activity_id":   data.get("activity_id",   0),
#             "activity_name": data.get("activity_name", "Activity"),
#             "stars":         min(5, max(0, int(data.get("stars",  0)))),
#             "score":         int(data.get("score", 0)),
#             "timestamp":     datetime.now().isoformat(),
#             "date":          datetime.now().strftime("%a %b %d %Y"),
#         }
#         results = load_results()
#         results.insert(0, entry)
#         save_results(results)
#         return jsonify({"status": "success", "entry": entry})
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


# @app.route('/get-student-stars/<student_id>', methods=['GET'])
# def get_student_stars(student_id):
#     """Return total and today's stars for a student."""
#     try:
#         from datetime import datetime
#         today   = datetime.now().strftime("%a %b %d %Y")
#         results = load_results()
#         mine    = [r for r in results if r.get("student_id") == student_id]
#         return jsonify({
#             "student_id":   student_id,
#             "total_stars":  sum(r.get("stars", 0) for r in mine),
#             "today_stars":  sum(r.get("stars", 0) for r in mine if r.get("date") == today),
#             "results":      mine[:20],
#         })
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @app.route('/stop-classroom', methods=['GET'])
# def stop_classroom():
#     try:
#         if hasattr(system, 'stop'):
#             system.stop()
#         elif hasattr(system, 'running'):
#             system.running = False
#         return jsonify({"status": "success", "message": "Classroom stopped"})
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


# @app.route('/attendance', methods=['GET'])
# def get_attendance():
#     try:
#         attendance_file = os.path.join(os.path.dirname(__file__), "attendance.csv")
#         records = []
#         if os.path.exists(attendance_file):
#             with open(attendance_file, newline='') as f:
#                 records = list(csv.DictReader(f))
#         return jsonify({"status": "success", "records": records})
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


# if __name__ == "__main__":
#     # debug=False rakhein threading ke waqt, warna camera do baar khul sakta hai
#     app.run(debug=False, port=5000, host='0.0.0.0')







from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import threading
import json
import re
import os
import csv
from pymongo import MongoClient  # MongoDB ke liye import
from datetime import datetime
from bson import ObjectId
from bson.json_util import dumps
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.whatsapp_route import whatsapp_bp
from routes.parent_routes import parent_bp
from extensions import users, attendance_collection, bcrypt
import jwt
import base64
import numpy as np


try:
    # Prefer the face_detection module inside the face_detection/ folder
    from face_detection.face_detection import FaceRecognitionSystem
except Exception:
    # Fallback to legacy module if present
    from face_detection_with_sentiment_analysis import FaceRecognitionSystem
from mimi_llm_session import MimiLLMSession

import time
import traceback
try:
    import cv2
    import numpy as np
    import face_recognition as _face_recognition_lib
    _cv_available = True
except ImportError:
    _cv_available = False

# ── LLM clients ───────────────────────────────────────────────────────────────
try:
    import openai
    _openai_available = True
except ImportError:
    _openai_available = False

try:
    import anthropic
    _anthropic_available = True
except ImportError:
    _anthropic_available = False

# =============================================================================
# CONFIG — set your API keys here OR use environment variables
# =============================================================================
OPENAI_API_KEY    = os.environ.get("OPENAI_API_KEY",    "YOUR_OPENAI_KEY_HERE")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "YOUR_ANTHROPIC_KEY_HERE")

# Local file to store activity results (no MongoDB needed)
RESULTS_FILE = os.path.join(os.path.dirname(__file__), "activity_results.json")

app = Flask(__name__)
CORS(app) 

# System initialize karein
system = FaceRecognitionSystem()
mimi_system = MimiLLMSession()


# =============================================================================
# LLM HELPERS — used by /activity-check AND /generate-activity-questions
# =============================================================================
def _call_openai(prompt: str, max_tokens: int = 200) -> dict:
    if not _openai_available:
        raise RuntimeError("openai not installed")
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=0.2,
    )
    return _parse_json(resp.choices[0].message.content)


def _call_openai_raw(prompt: str, max_tokens: int = 1000, temperature: float = 1.0) -> str:
    """Returns raw text (no JSON parse) — used for question generation. High temp = max variety."""
    if not _openai_available:
        raise RuntimeError("openai not installed")
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    return resp.choices[0].message.content


def _call_anthropic(prompt: str, max_tokens: int = 200) -> dict:
    if not _anthropic_available:
        raise RuntimeError("anthropic not installed")
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}],
    )
    return _parse_json(resp.content[0].text)


def _call_anthropic_raw(prompt: str, max_tokens: int = 1000, temperature: float = 1.0) -> str:
    """Returns raw text (no JSON parse) — used for question generation. High temp = max variety."""
    if not _anthropic_available:
        raise RuntimeError("anthropic not installed")
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=max_tokens,
        temperature=temperature,           # <-- was missing before, now passed
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text


def _parse_json(text: str) -> dict:
    clean = re.sub(r"```[a-z]*", "", text).replace("```", "").strip()
    return json.loads(clean)


def _build_prompt(word, child_said, activity_name, student_name):
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
{{"correct": true/false, "feedback": "short encouraging message max 15 words", "hint": "optional hint if wrong"}}"""

# =============================================================================
# ACTIVITY RESULTS FILE HELPERS
# =============================================================================
def load_results() -> list:
    try:
        if os.path.exists(RESULTS_FILE):
            with open(RESULTS_FILE, "r") as f:
                return json.load(f)
    except Exception:
        pass
    return []


def save_results(data: list):
    try:
        with open(RESULTS_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"[save_results] error: {e}")

# =============================================================================
# QUESTION GENERATION PROMPTS — per activity, per difficulty
# =============================================================================
QUESTION_PROMPTS = {
    9: {
        "easy": (
            "Generate {count} picture-guess questions for preschool children (easy level, age 3-5). "
            "Use very common animals and fruits a 3-year-old knows (cat, dog, apple, banana, cow, duck etc). "
            "For each question: one emoji is shown, child must say the word aloud. "
            "Return ONLY a valid JSON array, no markdown, no extra text: "
            '[{{"emoji":"🐱","answer":"Cat"}}, {{"emoji":"🍎","answer":"Apple"}}, ...]'
        ),
        "medium": (
            "Generate {count} picture-guess questions for preschool children (medium level, age 4-5). "
            "Use less-common animals, vegetables, transport items (fox, deer, carrot, bus, boat etc). "
            "Return ONLY a valid JSON array, no markdown, no extra text: "
            '[{{"emoji":"🦊","answer":"Fox"}}, {{"emoji":"🥕","answer":"Carrot"}}, ...]'
        ),
        "hard": (
            "Generate {count} picture-guess questions for preschool children (hard level, age 5+). "
            "Use harder items: professions, space, weather, tools, less-common animals "
            "(astronaut, rainbow, hammer, penguin, helicopter etc). "
            "Return ONLY a valid JSON array, no markdown, no extra text: "
            '[{{"emoji":"🌈","answer":"Rainbow"}}, {{"emoji":"🔨","answer":"Hammer"}}, ...]'
        ),
    },
    10: {
        "easy": (
            "Generate {count} counting questions for preschool children (easy, count 1-5 items). "
            "Each question shows ONE type of emoji repeated 1 to 5 times. "
            "Use fun emojis: fruits, animals, stars, balls. "
            "Return ONLY a valid JSON array, no markdown, no extra text: "
            '[{{"display":"🍎🍎🍎","answer":"3","count":3}}, {{"display":"⭐⭐","answer":"2","count":2}}, ...]'
        ),
        "medium": (
            "Generate {count} counting questions for preschool children (medium, count 6-10 items). "
            "Each question shows ONE emoji repeated 6 to 10 times. "
            "Use different emojis for each question. "
            "Return ONLY a valid JSON array, no markdown, no extra text: "
            '[{{"display":"🐶🐶🐶🐶🐶🐶🐶","answer":"7","count":7}}, ...]'
        ),
        "hard": (
            "Generate {count} emoji addition problems for preschool children (hard level). "
            "Show two groups of the SAME emoji separated by +, total between 5 and 10. "
            "Use a different emoji for each question. "
            "Return ONLY a valid JSON array, no markdown, no extra text: "
            '[{{"display":"🍎🍎🍎 + 🍎🍎","answer":"5","addend1":3,"addend2":2}}, ...]'
        ),
    },
    11: {
        "easy": (
            "Generate {count} simple AB repeating pattern questions for preschool children (easy level). "
            "Use 2-element color emoji or shape emoji patterns. Show 3-4 elements then ?. "
            "The answer should be a single English word (color or shape name). "
            "Return ONLY a valid JSON array, no markdown, no extra text: "
            '[{{"pattern":"🔴 → 🔵 → 🔴 → ?","answer":"Blue","hint":"Blue"}}, ...]'
        ),
        "medium": (
            "Generate {count} pattern completion questions for preschool children (medium level). "
            "Mix of: ABC emoji patterns, simple number sequences (1,2,3,?), and (5,4,3,?). "
            "The answer should be a word (color name or number word like Four, Two). "
            "Return ONLY a valid JSON array, no markdown, no extra text: "
            '[{{"pattern":"1 → 2 → 3 → ?","answer":"Four","hint":"Four"}}, '
            '{{"pattern":"🟢 → 🟡 → 🔴 → ?","answer":"Green","hint":"Green"}}, ...]'
        ),
        "hard": (
            "Generate {count} hard pattern completion questions for preschool children (hard level). "
            "Include: skip-counting by 2s or 3s (2,4,6,8,?), decreasing sequences (10,8,6,4,?), "
            "and multiplication patterns (3,6,9,12,?). Answers must be number words (Eight, Ten, Fifteen etc). "
            "Return ONLY a valid JSON array, no markdown, no extra text: "
            '[{{"pattern":"2 → 4 → 6 → 8 → ?","answer":"Ten","hint":"Ten"}}, ...]'
        ),
    },
    12: {
        "easy": (
            "Generate {count} mixed quiz questions for preschool children (easy level). "
            "Mix of types — include at least one of each: "
            "picture-guess (common animal/fruit emoji), word (child says the word shown), "
            "pattern (simple AB). Use easy vocabulary only. "
            "Return ONLY a valid JSON array, no markdown, no extra text. Use these exact type formats: "
            '[{{"type":"picture","emoji":"🐱","answer":"Cat"}}, '
            '{{"type":"word","word":"Dog","emoji":"🐶"}}, '
            '{{"type":"pattern","pattern":"🔴→🔵→🔴→?","answer":"Red","hint":"Red"}}, ...]'
        ),
        "medium": (
            "Generate {count} mixed quiz questions for preschool children (medium level). "
            "Mix of: picture-guess (less-common animals), counting (6-10 items), pattern (ABC or number sequence). "
            "Return ONLY a valid JSON array, no markdown, no extra text: "
            '[{{"type":"picture","emoji":"🦁","answer":"Lion"}}, '
            '{{"type":"count","display":"🌟🌟🌟🌟🌟🌟🌟","answer":"7","count":7}}, '
            '{{"type":"pattern","pattern":"1→2→3→?","answer":"Four","hint":"Four"}}, ...]'
        ),
        "hard": (
            "Generate {count} mixed quiz questions for preschool children (hard level). "
            "Mix of: hard picture-guess (vehicles, professions, weather), addition counting, skip-count patterns. "
            "Return ONLY a valid JSON array, no markdown, no extra text: "
            '[{{"type":"picture","emoji":"🚁","answer":"Helicopter"}}, '
            '{{"type":"count","display":"⭐⭐⭐ + ⭐⭐⭐⭐","answer":"7","addend1":3,"addend2":4}}, '
            '{{"type":"pattern","pattern":"3→6→9→?","answer":"Twelve","hint":"Twelve"}}, ...]'
        ),
    },
}

# @app.route('/start-classroom', methods=['GET'])
# def start_classroom():
#     try:
#         def run_integrated():
#             system.run()
#             mimi_system.run()

#         thread = threading.Thread(target=run_integrated)
#         thread.daemon = True
#         thread.start()

#         return jsonify({
#             "status": "success",
#             "message": "Mimi is now active and looking for faces!",
#             "character_state": "waving"
#         })
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/get-attendance-logs', methods=['GET'])
def get_attendance_logs():
    try:
        # MongoDB se saara data nikalna (latest records pehle)
        logs = list(attendance_collection.find({}, {"_id": 0}).sort("date", -1))
        return jsonify({
            "status": "success",
            "data": logs
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/start-classroom', methods=['GET'])
def start_classroom():
    try:
        system.fully_handled_this_session.clear()
        system.running = False
        def run_face():
            try:
                system.run()
            except Exception as e:
                print(f"[FaceSystem] Error: {e}")
                traceback.print_exc()

        def run_mimi():
            try:
                mimi_system.start()
            except Exception as e:
                print(f"[MimiSystem] Error: {e}")

        t1 = threading.Thread(target=run_face, daemon=True)
        t2 = threading.Thread(target=run_mimi, daemon=True)
        t1.start()
        t2.start()

        return jsonify({
            "status": "success",
            "message": "Mimi is now active and looking for faces!",
            "character_state": "waving"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# @app.route('/start-face-detect', methods=['GET'])
# def start_face_detect():
#     """
#     Face detection for Activities — identifies WHO is in front of the camera
#     but does NOT mark attendance or trigger mood conversation.
#     """
#     try:
#         def _detect_only():
#             if not _cv_available:
#                 return
#             known_dir = os.path.join(os.path.dirname(__file__), "face_detection", "known_faces")
#             if not os.path.exists(known_dir):
#                 known_dir = os.path.join(os.path.dirname(__file__), "known_faces")

#             known_encodings, known_names = [], []
#             if os.path.exists(known_dir):
#                 for fname in os.listdir(known_dir):
#                     if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
#                         continue
#                     img = _face_recognition_lib.load_image_file(os.path.join(known_dir, fname))
#                     encs = _face_recognition_lib.face_encodings(img)
#                     if encs:
#                         known_encodings.append(encs[0])
#                         known_names.append(os.path.splitext(fname)[0].replace('_', ' ').title())

#             cap = cv2.VideoCapture(0)
#             system.current_person  = None
#             system.current_action  = 'detecting'
#             system.current_warning = None

#             try:
#                 while getattr(system, '_activity_detecting', False):
#                     ret, frame = cap.read()
#                     if not ret:
#                         time.sleep(0.1)
#                         continue
#                     small = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
#                     rgb   = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
#                     locs  = _face_recognition_lib.face_locations(rgb)
#                     encs  = _face_recognition_lib.face_encodings(rgb, locs)

#                     # Too-close warning
#                     system.current_warning = None
#                     for (top, right, bottom, left) in locs:
#                         if (bottom - top) > 80:
#                             system.current_warning = 'too_close'
#                             break

#                     # Match face — identify only, no attendance
#                     matched = None
#                     for enc in encs:
#                         if not known_encodings:
#                             break
#                         dists = _face_recognition_lib.face_distance(known_encodings, enc)
#                         best  = int(np.argmin(dists))
#                         if dists[best] < 0.6:
#                             matched = known_names[best]
#                             break
#                     system.current_person = matched
#                     system.current_action = 'recognized' if matched else 'detecting'
#                     time.sleep(0.05)
#             finally:
#                 cap.release()
#                 system.current_action  = 'idle'
#                 system.current_person  = None
#                 system._activity_detecting = False

#         system._activity_detecting = True
#         t = threading.Thread(target=_detect_only, daemon=True)
#         t.start()
#         return jsonify({"status": "success", "message": "Face detection started (no attendance)"})
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/start-face-detect', methods=['GET'])
def start_face_detect():
    try:
        # AGAR PEHLE SE CHAL RAHA HAI TOH DUBARA START NA KAREIN
        if getattr(system, '_activity_detecting', False):
            return jsonify({"status": "already_running", "message": "Detection is already active"})

        def _detect_only():
            if not _cv_available:
                return
            
            # 1. Load faces safely
            known_dir = os.path.join(os.path.dirname(__file__), "face_detection", "known_faces")
            if not os.path.exists(known_dir):
                known_dir = os.path.join(os.path.dirname(__file__), "known_faces")

            known_encodings, known_names = [], []
            if os.path.exists(known_dir):
                for fname in os.listdir(known_dir):
                    if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                        continue
                    try:
                        img = _face_recognition_lib.load_image_file(os.path.join(known_dir, fname))
                        encs = _face_recognition_lib.face_encodings(img)
                        if encs:
                            known_encodings.append(encs[0])
                            known_names.append(os.path.splitext(fname)[0].replace('_', ' ').title())
                    except Exception as e:
                        print(f"Error loading {fname}: {e}")

            # 2. Camera setup with error handling
            cap = cv2.VideoCapture(0)
            if not cap.isOpened():
                cap = cv2.VideoCapture(1) # Fallback camera
            
            system.current_person  = None
            system.current_action  = 'detecting'
            system.current_warning = None

            try:
                # YE LOOP CHALTA REHNA CHAHIYE
                while getattr(system, '_activity_detecting', False):
                    ret, frame = cap.read()
                    if not ret:
                        time.sleep(0.1)
                        continue
                    
                    # Optimization
                    small = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
                    rgb   = cv2.cvtColor(small, cv2.COLOR_BGR2RGB)
                    locs  = _face_recognition_lib.face_locations(rgb)
                    encs  = _face_recognition_lib.face_encodings(rgb, locs)

                    # Too-close check
                    system.current_warning = None
                    for (top, right, bottom, left) in locs:
                        if (bottom - top) > 80:
                            system.current_warning = 'too_close'
                            break

                    matched = None
                    for enc in encs:
                        if not known_encodings: break
                        dists = _face_recognition_lib.face_distance(known_encodings, enc)
                        best  = int(np.argmin(dists))
                        if dists[best] < 0.5: # Threshold improved
                            matched = known_names[best]
                            break
                    
                    system.current_person = matched
                    system.current_action = 'recognized' if matched else 'detecting'
                    time.sleep(0.05)
            
            except Exception as e:
                print(f"Inside Thread Error: {e}")
            
            finally:
                # CAMERA BAND HONE PAR BHI FLAG KO SILENTLY HANDLE KAREIN
                cap.release()
                system.current_action = 'idle'
                # system._activity_detecting = False <-- Ye line mat likhna yahan

        # FLAG SET KARKE THREAD START KAREIN
        system._activity_detecting = True
        t = threading.Thread(target=_detect_only, daemon=True)
        t.start()
        
        return jsonify({"status": "success", "message": "Face detection started"})

    except Exception as e:
        print(f"Route Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/stop-face-detect', methods=['GET'])
def stop_face_detect():
    """Stop the activity face detection loop."""
    try:
        system._activity_detecting = False
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/get-status', methods=['GET'])
def get_status():
    """
    Real-time status from Python face recognition system.
    Frontend polls this every 500ms for live updates.
    """
    try:
        # Get current values from the system
        person = getattr(system, 'current_person', None)
        mood = getattr(system, 'current_mood', None)
        action = getattr(system, 'current_action', 'idle')
        
        # Get warning flags (if any)
        warning = getattr(system, 'current_warning', None)
        message = getattr(system, 'current_message', None)
        
        response = {
            "person": person,
            "mood": mood if mood else None,
            "action": action,
            "warning": warning,
            "message": message
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            "person": None,
            "mood": None,
            "action": "idle",
            "warning": None,
            "message": f"Error: {str(e)}"
        })


@app.route('/start-mimi-session', methods=['GET'])
def start_mimi_session():
    try:
        thread = threading.Thread(target=mimi_system.start)
        thread.daemon = True
        thread.start()
        return jsonify({"status": "success", "message": "Mimi LLM session started"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/mimi-get', methods=['GET'])
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
        return jsonify({'error': str(e)}), 500



# @app.route('/activity-check', methods=['POST'])
# def activity_check():
#     """
#     Check if child said a word correctly using LLM.
#     Body: { word, child_said, activity_name, student_name }
#     Returns: { result: { correct, feedback, hint } }
#     """
#     try:
#         data         = request.get_json() or {}
#         word         = data.get("word", "")
#         child_said   = data.get("child_said", "")
#         activity_name = data.get("activity_name", "Word Practice")
#         student_name = data.get("student_name", "Student")

#         prompt = _build_prompt(word, child_said, activity_name, student_name)

#         result = None
#         try:
#             result = _call_openai(prompt)
#         except Exception as e1:
#             print(f"[activity-check] OpenAI failed: {e1}")
#         if result is None:
#             try:
#                 result = _call_anthropic(prompt)
#             except Exception as e2:
#                 print(f"[activity-check] Anthropic failed: {e2}")
#         if result is None:
#             ok = child_said.lower().strip() in word.lower()
#             result = {
#                 "correct":  ok,
#                 "feedback": f"Great job! {word} is correct!" if ok else f"Try again! The word is {word}",
#                 "hint":     "" if ok else f"Say it slowly: {word}",
#             }
#         return jsonify({"result": result})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


@app.route('/activity-check', methods=['POST'])
def activity_check():
    """
    Check if child said a word correctly using LLM.
    Body: { word, child_said, activity_name, student_name }
    Returns: { result: { correct, feedback, hint } }
    """
    try:
        data          = request.get_json() or {}
        print(f"[activity-check] DATA RECEIVED: {data}")  # debug

        word          = data.get("word", "")
        child_said    = data.get("child_said", "")
        activity_name = data.get("activity_name", "Word Practice")
        student_name  = data.get("student_name", "Student")

        print(f"[activity-check] word='{word}' | child_said='{child_said}'")  # debug

        prompt = _build_prompt(word, child_said, activity_name, student_name)

        result = None
        try:
            result = _call_openai(prompt)
            print(f"[activity-check] OpenAI result: {result}")
        except Exception as e1:
            print(f"[activity-check] OpenAI failed: {e1}")

        if result is None:
            try:
                result = _call_anthropic(prompt)
                print(f"[activity-check] Anthropic result: {result}")
            except Exception as e2:
                print(f"[activity-check] Anthropic failed: {e2}")

        if result is None:
            print("[activity-check] Both LLMs failed — using local fallback")
            w  = word.lower().strip()
            c  = child_said.lower().strip().rstrip('.,!? ')
            ok = (w in c) or (c in w)
            result = {
                "correct":  ok,
                "feedback": f"Great job! {word} is correct! 🌟" if ok else f"Try again! The word is {word}",
                "hint":     "" if ok else f"Say it slowly: {word}",
            }

        print(f"[activity-check] FINAL RESULT: {result}")
        return jsonify({"result": result})

    except Exception as e:
        print(f"[activity-check] FULL ERROR: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/generate-activity-questions', methods=['POST'])
def generate_activity_questions():
    """
    Generate fresh LLM questions for activities 9-12.
    Body: { activity_id, difficulty, count, session_seed }
    Returns: { questions: [...] }

    Activity 9  — Picture Guess   → [{ emoji, answer }, ...]
    Activity 10 — Counting Game   → [{ display, answer, count } or { display, answer, addend1, addend2 }, ...]
    Activity 11 — Pattern Fun     → [{ pattern, answer, hint }, ...]
    Activity 12 — Quiz Mode       → [{ type, ...fields }, ...]
    """
    try:
        data         = request.get_json() or {}
        activity_id  = int(data.get("activity_id", 9))
        difficulty   = data.get("difficulty", "easy")   # easy | medium | hard
        count        = int(data.get("count", 6))
        session_seed = data.get("session_seed", "")     # random seed from frontend

        print(f"\n{'='*60}")
        print(f"[generate-questions] REQUEST: activity={activity_id}, difficulty={difficulty}, count={count}, seed={session_seed}")
        print(f"[generate-questions] OpenAI available: {_openai_available}, key set: {OPENAI_API_KEY != 'YOUR_OPENAI_KEY_HERE'}")
        print(f"[generate-questions] Anthropic available: {_anthropic_available}, key set: {ANTHROPIC_API_KEY != 'YOUR_ANTHROPIC_KEY_HERE'}")

        # Validate
        if activity_id not in QUESTION_PROMPTS:
            return jsonify({"questions": [], "error": "activity_id must be 9, 10, 11, or 12"}), 400
        if difficulty not in ("easy", "medium", "hard"):
            difficulty = "easy"

        prompt_template = QUESTION_PROMPTS[activity_id][difficulty]
        # Inject session_seed so every LLM call gets a slightly different prompt → different questions
        seed_line = f"\n\nIMPORTANT: Session ID is '{session_seed}'. Generate COMPLETELY DIFFERENT questions than last time. Do NOT repeat previous answers."
        prompt = prompt_template.format(count=count) + seed_line

        print(f"[generate-questions] Prompt length: {len(prompt)} chars")

        # Try OpenAI first, then Anthropic
        raw = None
        used_provider = None

        try:
            if _openai_available and OPENAI_API_KEY != "YOUR_OPENAI_KEY_HERE":
                print("[generate-questions] Trying OpenAI...")
                raw = _call_openai_raw(prompt, max_tokens=1000, temperature=1.0)
                used_provider = "OpenAI"
                print(f"[generate-questions] OpenAI responded, raw length={len(raw)}")
                print(f"[generate-questions] OpenAI raw (first 300): {raw[:300]}")
            else:
                print("[generate-questions] OpenAI skipped (not available or key not set)")
        except Exception as e1:
            print(f"[generate-questions] OpenAI FAILED: {type(e1).__name__}: {e1}")

        if not raw:
            try:
                if _anthropic_available and ANTHROPIC_API_KEY != "YOUR_ANTHROPIC_KEY_HERE":
                    print("[generate-questions] Trying Anthropic...")
                    raw = _call_anthropic_raw(prompt, max_tokens=1000, temperature=1.0)
                    used_provider = "Anthropic"
                    print(f"[generate-questions] Anthropic responded, raw length={len(raw)}")
                    print(f"[generate-questions] Anthropic raw (first 300): {raw[:300]}")
                else:
                    print("[generate-questions] Anthropic skipped (not available or key not set)")
            except Exception as e2:
                print(f"[generate-questions] Anthropic FAILED: {type(e2).__name__}: {e2}")

        if not raw:
            print("[generate-questions] BOTH LLMs failed — returning empty (frontend will use static fallback)")
            return jsonify({
                "questions": [],
                "error": "LLM unavailable — check your API keys in app.py or environment variables"
            }), 200

        # Parse the JSON array out of the response
        try:
            clean = re.sub(r"```[a-z]*", "", raw).replace("```", "").strip()
            start = clean.find('[')
            end   = clean.rfind(']')
            if start != -1 and end != -1 and end > start:
                questions = json.loads(clean[start:end + 1])
                print(f"[generate-questions] SUCCESS via {used_provider}: parsed {len(questions)} questions")
                for i, q in enumerate(questions):
                    print(f"  Q{i+1}: {q}")
                return jsonify({"questions": questions})
            else:
                print(f"[generate-questions] No JSON array brackets found in response: {raw[:500]}")
        except Exception as pe:
            print(f"[generate-questions] JSON parse error: {type(pe).__name__}: {pe}")
            print(f"[generate-questions] Raw that failed to parse: {raw[:500]}")

        return jsonify({"questions": [], "error": f"Parse failed from {used_provider} — check server logs"}), 200

    except Exception as e:
        print(f"[generate-questions] Unexpected error: {type(e).__name__}: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# @app.route('/save-activity-result', methods=['POST'])
# def save_activity_result():
#     """
#     Save student activity result to local JSON file.
#     Body: { student_id, student_name, activity_id, activity_name, stars, score }
#     """
#     try:
#         from datetime import datetime
#         data  = request.get_json() or {}
#         entry = {
#             "id":            int(datetime.now().timestamp() * 1000),
#             "student_id":    data.get("student_id",    "student-1"),
#             "student_name":  data.get("student_name",  "Student"),
#             "activity_id":   data.get("activity_id",   0),
#             "activity_name": data.get("activity_name", "Activity"),
#             "stars":         min(5, max(0, int(data.get("stars",  0)))),
#             "score":         int(data.get("score", 0)),
#             "timestamp":     datetime.now().isoformat(),
#             "date":          datetime.now().strftime("%a %b %d %Y"),
#         }
#         results = load_results()
#         results.insert(0, entry)
#         save_results(results)
#         return jsonify({"status": "success", "entry": entry})
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/save-activity-result', methods=['POST'])
def save_activity_result():
    try:
        from datetime import datetime
        from extensions import users  # ya jo bhi tumhara DB collection import hai

        data = request.get_json() or {}

        entry = {
            "student_name":  data.get("student_name",  "Student"),
            "student_id":    data.get("student_id",    "student-1"),
            "activity_id":   data.get("activity_id",   0),
            "activity_name": data.get("activity_name", "Activity"),
            "stars":         min(5, max(0, int(data.get("stars",  0)))),
            "score":         int(data.get("score", 0)),
            "timestamp":     datetime.now().isoformat(),
            "date":          datetime.now().strftime("%Y-%m-%d"),
            "time":          datetime.now().strftime("%H:%M:%S"),
        }

        # ── 1. MongoDB mein save karo ──────────────────────────────
        db = MongoClient("mongodb://localhost:27017/")["AlexiDB"]
        activity_collection = db["activity_results"]
        activity_collection.insert_one(entry)

        # ── 2. Local JSON file mein bhi rakho (backup) ─────────────
        json_entry = {**entry, "id": int(datetime.now().timestamp() * 1000)}
        results = load_results()
        results.insert(0, json_entry)
        save_results(results)

        # MongoDB ka _id remove karo response se
        entry.pop("_id", None)

        return jsonify({"status": "success", "entry": entry})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/get-student-stars/<student_id>', methods=['GET'])
def get_student_stars(student_id):
    """Return total and today's stars for a student."""
    try:
        from datetime import datetime
        today   = datetime.now().strftime("%a %b %d %Y")
        results = load_results()
        mine    = [r for r in results if r.get("student_id") == student_id]
        return jsonify({
            "student_id":   student_id,
            "total_stars":  sum(r.get("stars", 0) for r in mine),
            "today_stars":  sum(r.get("stars", 0) for r in mine if r.get("date") == today),
            "results":      mine[:20],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/stop-classroom', methods=['GET'])
def stop_classroom():
    try:
        if hasattr(system, 'stop'):
            system.stop()
        elif hasattr(system, 'running'):
            system.running = False
        return jsonify({"status": "success", "message": "Classroom stopped"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/attendance', methods=['GET'])
def get_attendance():
    try:
        attendance_file = os.path.join(os.path.dirname(__file__), "attendance.csv")
        records = []
        if os.path.exists(attendance_file):
            with open(attendance_file, newline='') as f:
                records = list(csv.DictReader(f))
        return jsonify({"status": "success", "records": records})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/check-attendance', methods=['POST'])
def check_attendance():

    data = request.json
    name = data.get("student_name")

    if system.attendance.is_marked(name):
        return jsonify({"message": "already_marked"})
    else:
        return jsonify({"message": "not_marked"})


@app.route('/register-face', methods=['POST'])
def register_face():
    try:
        import cv2
        import face_recognition as fr
        data = request.get_json() or {}
        name = (data.get("name") or "").strip()
        image = data.get("image", "")

        if not name or not image:
            return jsonify({"status": "error", "message": "Name and Image required"}), 400

        if "," in image: image = image.split(",", 1)[1]
        img_bytes = base64.b64decode(image)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        encodings = fr.face_encodings(rgb, fr.face_locations(rgb))
        if not encodings:
            return jsonify({"status": "error", "message": "No face detected"}), 400

        safe_name = re.sub(r'[^a-zA-Z0-9_ ]', '', name).strip().replace(' ', '_')
        save_path = os.path.join(system.known_faces_dir, f"{safe_name}.jpg")
        cv2.imwrite(save_path, frame)

        # Hot-reload encodings
        system.known_encodings.append(encodings[0])
        system.known_names.append(safe_name)
        return jsonify({"status": "success", "name": safe_name})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/get-student-id-by-name', methods=['POST'])
def get_student_id_by_name():
    try:
        data = request.get_json() or {}
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"status": "error", "message": "Name required"}), 400

        db = MongoClient("mongodb://localhost:27017/")["AlexiDB"]
        students_col = db["students"]

        # Case-insensitive search karo naam se
        student = students_col.find_one(
            {"name": {"$regex": f"^{name}$", "$options": "i"}}
        )

        if student:
            return jsonify({
                "status": "found",
                "student_id": str(student["_id"]),
                "student_name": student.get("name", name)
            })
        else:
            return jsonify({
                "status": "not_found",
                "student_id": None
            })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/mark-attendance', methods=['POST'])
def mark_attendance():
    try:
        data = request.get_json() or {}
        name = data.get("student_name", "").strip()
        mood = data.get("mood", "Neutral")

        if not name:
            return jsonify({"message": "error", "reason": "name required"}), 400

        today = datetime.now().strftime("%Y-%m-%d")
        db = MongoClient("mongodb://localhost:27017/")["AlexiDB"]

        # Already marked check
        existing = db["attendance"].find_one({"name": name, "date": today})
        if existing:
            return jsonify({"message": "already_marked"})

        # Students collection se real _id lo
        student = db["students"].find_one(
            {"name": {"$regex": f"^{name}$", "$options": "i"}}
        )
        student_id = student["_id"] if student else None

        # Attendance save karo
        db["attendance"].insert_one({
            "student_id": student_id,   # ✅ Real MongoDB ObjectId
            "name":       name,
            "date":       today,
            "time":       datetime.now().strftime("%H:%M:%S"),
            "mood":       mood
        })

        print(f"[mark-attendance] ✅ {name} | student_id: {student_id} | mood: {mood}")
        return jsonify({"message": "marked"})

    except Exception as e:
        print(f"[mark-attendance] ERROR: {e}")
        return jsonify({"message": "error", "reason": str(e)}), 500  



@app.route('/speak', methods=['POST'])
def speak_text():
    import asyncio
    import edge_tts
    import tempfile
    import base64
    data = request.get_json()
    text = data.get('text', '')
    async def generate(text, path):
        communicate = edge_tts.Communicate(text, voice="en-IN-NeerjaNeural", rate="-10%", pitch="+15Hz")
        await communicate.save(path)
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as f:
        tmp_path = f.name
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(generate(text, tmp_path))
    loop.close()
    with open(tmp_path, 'rb') as f:
        audio_data = base64.b64encode(f.read()).decode()
    os.remove(tmp_path)
    return jsonify({'audio': audio_data})

@app.route('/process-frame', methods=['POST'])
def process_frame():
    import base64
    import numpy as np
    import cv2
    try:
        data = request.get_json()
        img_data = data.get('frame', '')
        img_data = img_data.split(',')[1] if ',' in img_data else img_data
        img_bytes = base64.b64decode(img_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        # locations = face_recognition.face_locations(rgb)
        # encodings = face_recognition.face_encodings(rgb, locations)
        locations = _face_recognition_lib.face_locations(rgb)      # ← NAYA
        encodings = _face_recognition_lib.face_encodings(rgb, locations)
        for enc in encodings:
            distances = face_recognition.face_distance(system.known_encodings, enc)
            if len(distances) and min(distances) < 0.45:
                name = system.known_names[int(np.argmin(distances))]
                return jsonify({'person': name, 'status': 'recognised'})
        return jsonify({'person': None, 'status': 'no_face'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


      

app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(whatsapp_bp)
app.register_blueprint(parent_bp)


if __name__ == "__main__":
    # debug=False rakhein threading ke waqt, warna camera do baar khul sakta hai
    app.run(debug=False, port=5000, host='0.0.0.0')
