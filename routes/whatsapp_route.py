from flask import Blueprint, jsonify, request
from services.whatsapp_service import send_test_message, send_activity_result_to_parent

whatsapp_bp = Blueprint("whatsapp", __name__)

# ================================
# MANUAL TRIGGER API
# ================================
@whatsapp_bp.route("/api/send-daily-whatsapp", methods=["GET"])
def trigger_daily_whatsapp():
    try:
        from services.whatsapp_service import send_daily_reports
        result = send_daily_reports()
        return jsonify({
            "status": "success",
            "reports": result
        })
    except Exception as e:
        return jsonify({"status": "error", "msg": str(e)}), 500


@whatsapp_bp.route("/api/test-whatsapp", methods=["GET"])
def test_whatsapp():
    result = send_test_message()
    return jsonify(result)


# ================================
# ACTIVITY COMPLETE - INSTANT WP
# ================================
@whatsapp_bp.route("/api/send-activity-result", methods=["POST"])
def send_activity_result():
    try:
        data = request.get_json() or {}
        student_name = data.get("student_name", "")
        activity_name = data.get("activity_name", "")
        stars = data.get("stars", 0)
        score = data.get("score", 0)

        if not student_name:
            return jsonify({"status": "error", "msg": "student_name required"}), 400

        result = send_activity_result_to_parent(student_name, activity_name, stars, score)
        return jsonify({
            "status": "success" if result else "failed",
            "sent": result
        })
    except Exception as e:
        return jsonify({"status": "error", "msg": str(e)}), 500