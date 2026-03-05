from flask import Flask, jsonify
from flask_cors import CORS
import threading
try:
    # Prefer the face_detection module inside the face_detection/ folder
    from face_detection.face_detection import FaceRecognitionSystem
except Exception:
    # Fallback to legacy module if present
    from face_detection_with_sentiment_analysis import FaceRecognitionSystem
from mimi_llm_session import MimiLLMSession

app = Flask(__name__)
CORS(app) 

# System initialize karein
system = FaceRecognitionSystem()
mimi_system = MimiLLMSession()

@app.route('/start-classroom', methods=['GET'])
def start_classroom():
    try:
        def run_integrated():
            system.run()
            mimi_system.run()

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
            # 'image_url': getattr(mimi_system, 'current_image', None),
            # 'yt_video': getattr(mimi_system, 'current_video', None),
            'image_url': getattr(mimi_system, 'image_url', None),  # <-- 'current_image' ko 'image_url' kiya
            'yt_video': getattr(mimi_system, 'yt_video', None),    # <-- 'current_video' ko 'yt_video' kiya
            'action': getattr(mimi_system, 'current_action', 'idle')
        }
        return jsonify(resp)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    # debug=False rakhein threading ke waqt, warna camera do baar khul sakta hai
    app.run(debug=False, port=5000, host='0.0.0.0')
