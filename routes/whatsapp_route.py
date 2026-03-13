from flask import Blueprint, jsonify
# from services.whatsapp_service import send_daily_reports
from services.whatsapp_service import send_test_message

whatsapp_bp = Blueprint("whatsapp", __name__)


# ================================
# MANUAL TRIGGER API
# ================================
@whatsapp_bp.route("/api/send-daily-whatsapp", methods=["GET"])
def trigger_daily_whatsapp():
    try:
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