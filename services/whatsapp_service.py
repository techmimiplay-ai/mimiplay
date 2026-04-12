from twilio.rest import Client
from datetime import datetime
import os
import logging
from extensions import users, attendance_collection

logger = logging.getLogger(__name__)

# Twilio credentials
ACCOUNT_SID = "AC792e0c5cc48057e1f3fc3c516a202a58"
AUTH_TOKEN = "f1be5b629caed03aba53fa795b2907f4"
TWILIO_NUMBER = "whatsapp:+14155238886"

client = Client(ACCOUNT_SID, AUTH_TOKEN)


# ================================
# SEND SINGLE MESSAGE
# ================================
def send_whatsapp(number, message):
    try:
        client.messages.create(
            from_=TWILIO_NUMBER,
            body=message,
            to=f'whatsapp:{number}'
        )
        return True
    except Exception as e:
        logger.error("WhatsApp error: %s", e)
        return False

def send_test_message():
    try:
        message = client.messages.create(
            from_='whatsapp:+14155238886',  # Twilio Sandbox
            to='whatsapp:+919601930581',    # ⚠️ Static number (jis phone par test karna hai)
            body="🔥 TEST MESSAGE - Alexi WhatsApp working!"
        )

        logger.info("Message SID: %s", message.sid)
        return {"success": True, "sid": message.sid}

    except Exception as e:
        logger.error("[send_test] ERROR: %s", e)
        return {"success": False, "error": str(e)}

# ================================
# DAILY REPORT FUNCTION
# ================================
def send_daily_reports():
    today = datetime.now().strftime("%Y-%m-%d")

    logs = list(attendance_collection.find({"date": today}))

    results = []

    for log in logs:
        student_name = log.get("name")
        attendance = log.get("attendance", "Present")

        # find parent by child name
        parent = users.find_one({
            "role": "parent",
            "child_name": student_name
        })

        if not parent:
            continue

        parent_number = parent.get("phone")
        parent_name = parent.get("name")

        msg = f"""
📚 Daily School Report

👦 Student: {student_name}
📅 Date: {today}
✅ Attendance: {attendance}

Regards,
Alexi School AI
"""

        sent = send_whatsapp(parent_number, msg)

        results.append({
            "student": student_name,
            "parent": parent_name,
            "sent": sent
        })

    return results
# ================================
# ACTIVITY RESULT - INSTANT REPORT
# ================================
def send_activity_result_to_parent(student_name, activity_name, stars, score):
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        time_now = datetime.now().strftime("%H:%M")

        # Find parent by child name
        parent = users.find_one({
            "role": "parent",
            "child_name": {"$regex": f"^{student_name}$", "$options": "i"}
        })

        if not parent:
            logger.warning("[WP] No parent found for student: %s", student_name)
            return False

        parent_number = parent.get("phone")
        if not parent_number:
            logger.warning("[WP] No phone number for parent of: %s", student_name)
            return False

        stars_emoji = "⭐" * int(stars)
        msg = f"""🎓 *Alexi Activity Report*

👦 Student: {student_name}
📚 Activity: {activity_name}
⭐ Stars: {stars_emoji} ({stars}/5)
🏆 Score: {score}
📅 Date: {today}
🕐 Time: {time_now}

Keep learning! 🚀
*Alexi Smart Learning*"""

        result = send_whatsapp(parent_number, msg)
        logger.info("[WP] Report sent to %s: %s", parent_number[-4:], result)
        return result

    except Exception as e:
        logger.error("[WP] Error sending activity result: %s", e)
        return False