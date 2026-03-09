from flask import Flask, jsonify
from flask_cors import CORS
import threading
import json
import re
import os
import csv

try:
    # Prefer the face_detection module inside the face_detection/ folder
    from face_detection.face_detection import FaceRecognitionSystem
except Exception:
    # Fallback to legacy module if present
    from face_detection_with_sentiment_analysis import FaceRecognitionSystem
from mimi_llm_session import MimiLLMSession

# ── LLM clients for /activity-check ──────────────────────────────────────────
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

# ─────────────────────────────────────────────────────────────────────────────
# CONFIG  — set your API keys here OR use environment variables
# ─────────────────────────────────────────────────────────────────────────────
OPENAI_API_KEY    = os.environ.get("OPENAI_API_KEY",    "YOUR_OPENAI_KEY_HERE")
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "YOUR_ANTHROPIC_KEY_HERE")
# Local file to store activity results (no MongoDB needed)
RESULTS_FILE = os.path.join(os.path.dirname(__file__), "activity_results.json")


app = Flask(__name__)
CORS(app) 

# System initialize karein
system = FaceRecognitionSystem()
mimi_system = MimiLLMSession()
mimi_system.speech = system.speech


# ─────────────────────────────────────────────────────────────────────────────
# LLM HELPERS for /activity-check
# ─────────────────────────────────────────────────────────────────────────────
def _call_openai(prompt: str) -> dict:
    if not _openai_available:
        raise RuntimeError("openai not installed")
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.2,
    )
    return _parse_json(resp.choices[0].message.content)


def _call_anthropic(prompt: str) -> dict:
    if not _anthropic_available:
        raise RuntimeError("anthropic not installed")
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )
    return _parse_json(resp.content[0].text)


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

# ─────────────────────────────────────────────────────────────────────────────
# ACTIVITY RESULTS FILE HELPERS
# ─────────────────────────────────────────────────────────────────────────────
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

# ═════════════════════════════════════════════════════════════════════════════
# ROUTES
# ═════════════════════════════════════════════════════════════════════════════


@app.route('/start-classroom', methods=['GET'])
def start_classroom():
    try:
        def run_integrated():
            system.run()
            mimi_system.start()

        thread = threading.Thread(target=run_integrated)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "status": "success", 
            "message": "Mimi is now active and looking for faces!",
            "character_state": "waving"
        })
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
            'action': getattr(mimi_system, 'current_action', 'idle')
        }
        return jsonify(resp)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ── NEW ROUTES for Activities feature ────────────────────────────────────────

@app.route('/activity-check', methods=['POST'])
def activity_check():
    """
    Check if child said a word correctly using LLM.
    Body: { word, child_said, activity_name, student_name }
    Returns: { result: { correct, feedback, hint } }
    """
    try:
        data          = request.get_json() or {}
        word          = data.get("word", "")
        child_said    = data.get("child_said", "")
        activity_name = data.get("activity_name", "Word Practice")
        student_name  = data.get("student_name", "Student")

        prompt = _build_prompt(word, child_said, activity_name, student_name)

        # Try OpenAI → Anthropic → simple fallback
        result = None
        try:
            result = _call_openai(prompt)
        except Exception as e1:
            print(f"[activity-check] OpenAI failed: {e1}")
            try:
                result = _call_anthropic(prompt)
            except Exception as e2:
                print(f"[activity-check] Anthropic failed: {e2}")

        if result is None:
            ok     = child_said.lower().strip() in word.lower()
            result = {
                "correct":  ok,
                "feedback": f"Great job! {word} is correct!" if ok else f"Try again! The word is {word}",
                "hint":     "" if ok else f"Say it slowly: {word}",
            }

        return jsonify({"result": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/save-activity-result', methods=['POST'])
def save_activity_result():
    """
    Save student activity result to local JSON file.
    Body: { student_id, student_name, activity_id, activity_name, stars, score }
    """
    try:
        from datetime import datetime
        data  = request.get_json() or {}
        entry = {
            "id":            int(datetime.now().timestamp() * 1000),
            "student_id":    data.get("student_id",    "student-1"),
            "student_name":  data.get("student_name",  "Student"),
            "activity_id":   data.get("activity_id",   0),
            "activity_name": data.get("activity_name", "Activity"),
            "stars":         min(5, max(0, int(data.get("stars", 0)))),
            "score":         int(data.get("score", 0)),
            "timestamp":     datetime.now().isoformat(),
            "date":          datetime.now().strftime("%a %b %d %Y"),
        }
        results = load_results()
        results.insert(0, entry)
        save_results(results)
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
            "student_id":  student_id,
            "total_stars": sum(r.get("stars", 0) for r in mine),
            "today_stars": sum(r.get("stars", 0) for r in mine if r.get("date") == today),
            "results":     mine[:20],
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



if __name__ == "__main__":
    # debug=False rakhein threading ke waqt, warna camera do baar khul sakta hai
    app.run(debug=False, port=5000, host='0.0.0.0')