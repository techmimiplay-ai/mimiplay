from twilio.rest import Client
from datetime import datetime
from pymongo import MongoClient

# Twilio credentials
ACCOUNT_SID = "AC792e0c5cc48057e1f3fc3c516a202a58"
AUTH_TOKEN = "f1be5b629caed03aba53fa795b2907f4"
TWILIO_NUMBER = "whatsapp:+14155238886"

client = Client(ACCOUNT_SID, AUTH_TOKEN)

# Mongo connection (same as app.py)
mongo = MongoClient("mongodb://localhost:27017/")
db = mongo["AlexiDB"]
users = db["users"]
attendance_collection = db["attendance"]


# ================================
# SEND SINGLE MESSAGE
# ================================
def send_whatsapp(number, message):
    try:
        client.messages.create(
            from_=TWILIO_NUMBER,
            body=message,
            to=f'whatsapp:{+919601930581}'
        )
        return True
    except Exception as e:
        print("WhatsApp error:", e)
        return False

def send_test_message():
    try:
        message = client.messages.create(
            from_='whatsapp:+14155238886',  # Twilio Sandbox
            to='whatsapp:+919601930581',    # ⚠️ Static number (jis phone par test karna hai)
            body="🔥 TEST MESSAGE - Alexi WhatsApp working!"
        )

        print("Message SID:", message.sid)
        return {"success": True, "sid": message.sid}

    except Exception as e:
        print("ERROR:", e)
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