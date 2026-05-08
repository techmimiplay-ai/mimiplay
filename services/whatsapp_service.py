from twilio.rest import Client
from datetime import datetime
import os
import logging
from extensions import users, attendance_collection

logger = logging.getLogger(__name__)

# Twilio credentials — loaded from environment, never hardcoded
ACCOUNT_SID = "AC792e0c5cc48057e1f3fc3c516a202a58"
AUTH_TOKEN = "f1be5b629caed03aba53fa795b2907f4"
TWILIO_NUMBER = "whatsapp:+14155238886"
client = Client(ACCOUNT_SID, AUTH_TOKEN) if ACCOUNT_SID and AUTH_TOKEN else None


# ================================
# SEND SINGLE MESSAGE WITH LOGGING
# ================================
def send_whatsapp(number, message, message_type="unknown", recipient_name="Unknown"):
    if not client:
        logger.warning("[WP] Twilio client not initialised — check TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN env vars")
        return False
    # Check if WhatsApp is enabled in admin settings
    try:
        from extensions import db as _db
        doc = _db["settings"].find_one({"_id": "admin_settings"})
        if doc and not doc.get("feature_flags", {}).get("whatsappEnabled", True):
            logger.info("[WP] WhatsApp disabled by admin — skipping send")
            return False
    except Exception:
        pass  # fail open — don't block on a settings read error
    try:
        # Send message
        response = client.messages.create(
            from_=TWILIO_NUMBER,
            body=message,
            to=f'whatsapp:{number}'
        )
        
        # Log the message
        log_whatsapp_message(
            phone_number=number,
            recipient_name=recipient_name,
            message_type=message_type,
            message_content=message,
            status="delivered",
            twilio_sid=response.sid
        )
        
        return True
    except Exception as e:
        logger.error("WhatsApp error: %s", e)
        
        # Log the failed message
        log_whatsapp_message(
            phone_number=number,
            recipient_name=recipient_name,
            message_type=message_type,
            message_content=message,
            status="failed",
            error_message=str(e)
        )
        
        return False

def log_whatsapp_message(phone_number, recipient_name, message_type, message_content, status, twilio_sid=None, error_message=None):
    """Log WhatsApp message for delivery tracking"""
    try:
        from extensions import db
        
        log_entry = {
            "phone_number": phone_number,
            "recipient_name": recipient_name,
            "message_type": message_type,
            "message_content": message_content,
            "status": status,
            "sent_at": datetime.now().isoformat(),
            "twilio_sid": twilio_sid,
            "error_message": error_message
        }
        
        db["whatsapp_logs"].insert_one(log_entry)
        logger.info("[WP] Message logged: %s to %s", message_type, phone_number[-4:])
        
    except Exception as e:
        logger.error("[WP] Failed to log message: %s", e)

def send_test_message():
    try:
        test_number = os.environ.get("TWILIO_TEST_NUMBER", "")
        if not test_number:
            return {"success": False, "error": "TWILIO_TEST_NUMBER env var not set"}
        message = client.messages.create(
            from_=TWILIO_NUMBER,
            to=f'whatsapp:{test_number}',
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
def send_activity_result_to_parent(student_name, activity_name, stars, score, qa=None):
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        time_now = datetime.now().strftime("%H:%M")

        parent = users.find_one({
            "role": "parent",
            "child_name": {"$regex": f"^{student_name}$", "$options": "i"}
        })

        if not parent:
            logger.warning("[WP] No parent found for student: %s", student_name)
            return False

        parent_number = parent.get("phone")
        parent_name = parent.get("name", "Parent")
        if not parent_number:
            logger.warning("[WP] No phone number for parent of: %s", student_name)
            return False

        stars_emoji = "⭐" * int(stars)

        # Build Q&A breakdown if available
        qa_lines = ""
        if qa:
            lines = []
            for i, item in enumerate(qa, 1):
                q        = item.get("question", "").strip()
                said     = item.get("childSaid", "").strip()
                correct  = item.get("correct", False)
                tick     = "✅" if correct else "❌"
                said_str = f' (said: "{said}")' if said else ""
                lines.append(f"{tick} Q{i}: {q}{said_str}")
            qa_lines = "\n\n*Questions:*\n" + "\n".join(lines)

        msg = f"""🎓 *Alexi Activity Report*

👦 Student: {student_name}
📚 Activity: {activity_name}
⭐ Stars: {stars_emoji} ({stars}/5)
🏆 Score: {score}
📅 Date: {today}
🕐 Time: {time_now}{qa_lines}

Keep learning! 🚀
*Alexi Smart Learning*"""

        result = send_whatsapp(parent_number, msg, "activity_completion", parent_name)
        logger.info("[WP] Report sent to %s: %s", parent_number[-4:], result)
        return result

    except Exception as e:
        logger.error("[WP] Error sending activity result: %s", e)
        return False

# ================================
# SESSION VIDEO - SEND TO PARENT
# ================================
def send_session_video_to_parent(student_name, video_url, session_type='session', duration=0):
    """
    Send session video link to parent via WhatsApp
    """
    try:
        # Find parent by child name
        parent = users.find_one({
            "role": "parent",
            "child_name": {"$regex": f"^{student_name}$", "$options": "i"}
        })

        if not parent:
            logger.warning("[WP Video] No parent found for student: %s", student_name)
            return False

        parent_number = parent.get("phone")
        parent_name = parent.get("name", "Parent")
        if not parent_number:
            logger.warning("[WP Video] No phone number for parent of: %s", student_name)
            return False
            
        # Format duration
        duration_str = f"{duration // 60}:{duration % 60:02d}" if duration > 0 else "Unknown"
        
        # Create message
        session_emoji = "💬" if session_type == "chat" else "🎮"
        today = datetime.now().strftime("%Y-%m-%d")
        time_now = datetime.now().strftime("%H:%M")
        
        msg = f"""{session_emoji} *{student_name}'s Learning Session Video*

📹 *Session Type:* {session_type.title()}
⏱️ *Duration:* {duration_str}
📅 *Date:* {today} at {time_now}

🎥 *Watch Video:* {video_url}

_This video link is valid for 7 days. You can download it to keep it permanently._

💡 *Tip:* Click the link to watch your child's learning session!

---
🤖 *Sent by Alexi Learning System*"""
        
        # Send message
        result = send_whatsapp(parent_number, msg, "session_video", parent_name)
        
        if result:
            logger.info("[WP Video] Session video sent to parent of %s", student_name)
        else:
            logger.error("[WP Video] Failed to send session video for %s", student_name)
            
        return result
        
    except Exception as e:
        logger.error("[WP Video] Error sending session video: %s", e)
        return False


# ================================
# CHAT HISTORY - SEND TO PARENT
# ================================
def send_chat_history_to_parent(student_name, messages):
    """
    Called when a Mimi chat session ends.
    Sends the full Q&A transcript to the parent via WhatsApp.
    messages: list of { question, answer, time }
    """
    try:
        if not messages:
            logger.info("[WP Chat] No messages to send for %s", student_name)
            return False

        # Find parent by child name
        parent = users.find_one({
            "role": "parent",
            "child_name": {"$regex": f"^{student_name}$", "$options": "i"}
        })

        if not parent:
            logger.warning("[WP Chat] No parent found for student: %s", student_name)
            return False

        parent_number = parent.get("phone")
        parent_name   = parent.get("name", "Parent")
        if not parent_number:
            logger.warning("[WP Chat] No phone number for parent of: %s", student_name)
            return False

        today    = datetime.now().strftime("%Y-%m-%d")
        time_now = datetime.now().strftime("%H:%M")

        # Build transcript — cap at 10 Q&As so message stays readable
        transcript_lines = []
        for i, msg in enumerate(messages[:10], 1):
            q = msg.get("question", "").strip()
            a = msg.get("answer",   "").strip()
            if q and a:
                transcript_lines.append(f"*Q{i}:* {q}")
                transcript_lines.append(f"*A{i}:* {a}")

        if not transcript_lines:
            logger.info("[WP Chat] No valid Q&A pairs for %s", student_name)
            return False

        total = len(messages)
        shown = min(total, 10)
        footer = f"\n_...and {total - shown} more questions_" if total > 10 else ""

        transcript = "\n".join(transcript_lines)

        msg = f"""💬 *Alexi Chat Session Summary*

👦 *Student:* {student_name}
📅 *Date:* {today} at {time_now}
🗣️ *Total Questions:* {total}

{transcript}{footer}

---
🤖 *Sent by Alexi Learning System*"""

        result = send_whatsapp(parent_number, msg, "chat_history", parent_name)
        logger.info("[WP Chat] History sent to parent of %s: %s", student_name, result)
        return result

    except Exception as e:
        logger.error("[WP Chat] Error sending chat history: %s", e)
        return False