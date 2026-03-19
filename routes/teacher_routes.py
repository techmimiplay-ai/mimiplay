from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import os
from bson import ObjectId
from datetime import datetime, timedelta

teacher_bp = Blueprint('teacher_bp', __name__)

# ─────────────────────────────────────────────────────────────
# GET /api/teacher/dashboard-stats
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/dashboard-stats', methods=['GET'])
def get_teacher_dashboard_stats():
    try:
        teacher_id = request.args.get('teacher_id')
        today      = datetime.now().strftime("%Y-%m-%d")
        db         = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017/"))["AlexiDB"]

        # Teacher naam
        teacher_name = "Teacher"
        if teacher_id:
            try:
                teacher = db["users"].find_one({"_id": ObjectId(teacher_id)})
                if teacher:
                    teacher_name = teacher.get("name", "Teacher")
            except Exception:
                pass

        total_students  = db["students"].count_documents({})
        present_today   = db["attendance"].count_documents({"date": today})
        attendance_pct  = round((present_today / total_students * 100)) if total_students > 0 else 0

        today_results    = list(db["activity_results"].find({"date": today}))
        activities_today = len(today_results)
        avg_score        = round(
            sum(r.get("stars", 0) for r in today_results) / len(today_results), 1
        ) if today_results else 0

        week_start   = (datetime.now() - timedelta(days=6)).strftime("%Y-%m-%d")
        week_results = list(db["activity_results"].find({"date": {"$gte": week_start}}))
        weekly_stars = sum(r.get("stars", 0) for r in week_results)

        recent = list(db["activity_results"].find({"date": today})
                      .sort("timestamp", -1).limit(5))
        recent_formatted = [{
            "activity_name": r.get("activity_name", "Activity"),
            "student_name":  r.get("student_name",  "Student"),
            "stars":         r.get("stars",          0),
            "score":         r.get("score",          0),
            "timestamp":     r.get("timestamp",      ""),
        } for r in recent]

        return jsonify({
            "status":            "success",
            "teacher_name":      teacher_name,
            "total_students":    total_students,
            "present_today":     present_today,
            "attendance_pct":    attendance_pct,
            "activities_today":  activities_today,
            "avg_score":         avg_score,
            "weekly_stars":      weekly_stars,
            "recent_activities": recent_formatted,
        })

    except Exception as e:
        print(f"[dashboard-stats] ERROR: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# GET /api/teacher/attendance?date=YYYY-MM-DD
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/attendance', methods=['GET'])
def get_attendance_by_date():
    try:
        date = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
        db   = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017/"))["AlexiDB"]

        attendance_records = list(db["attendance"].find({"date": date}))
        marked_names = {r.get("name", "").lower(): r for r in attendance_records}

        all_students = list(db["students"].find())
        result = []
        for s in all_students:
            name   = s.get("name", "")
            record = marked_names.get(name.lower())
            result.append({
                "id":        str(s["_id"]),
                "name":      name,
                "rollNo":    s.get("roll_number", "—"),
                "status":    "present" if record else "absent",
                "time":      record.get("time")   if record else None,
                "mood":      record.get("mood")   if record else None,
                "method":    record.get("method", "auto") if record else None,
                "studentId": str(s["_id"]),
            })

        return jsonify({"status": "success", "data": result, "date": date})

    except Exception as e:
        print(f"[get-attendance] ERROR: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# POST /api/teacher/attendance/update
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/attendance/update', methods=['POST'])
def update_attendance_manual():
    try:
        data       = request.get_json() or {}
        name       = data.get("name",   "").strip()
        status     = data.get("status", "present")
        date       = data.get("date",   datetime.now().strftime("%Y-%m-%d"))
        student_id = data.get("student_id", "")

        if not name:
            return jsonify({"status": "error", "message": "name required"}), 400

        db       = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017/"))["AlexiDB"]
        existing = db["attendance"].find_one({"name": name, "date": date})

        if status == "absent":
            if existing:
                db["attendance"].delete_one({"name": name, "date": date})
            return jsonify({"status": "success", "action": "removed"})

        now = datetime.now().strftime("%H:%M:%S")
        try:
            oid = ObjectId(student_id)
        except Exception:
            oid = None

        if existing:
            db["attendance"].update_one(
                {"name": name, "date": date},
                {"$set": {"status": status, "time": now, "method": "manual"}}
            )
        else:
            db["attendance"].insert_one({
                "student_id": oid,
                "name":       name,
                "date":       date,
                "time":       now,
                "mood":       "Neutral",
                "method":     "manual",
                "status":     status,
            })

        return jsonify({"status": "success", "action": "updated", "time": now})

    except Exception as e:
        print(f"[update-attendance] ERROR: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# GET /api/admin/all-students-with-stats
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/admin/all-students-with-stats', methods=['GET'])
def get_all_students_with_stats():
    try:
        db = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017/"))["AlexiDB"]
        all_students = list(db["students"].find())
        result = []

        working_days = sum(
            1 for i in range(30)
            if (datetime.now() - timedelta(days=i)).weekday() < 5
        )

        for s in all_students:
            sid      = str(s["_id"])
            sid_name = s.get("name", "")

            total_att = db["attendance"].count_documents({
                "$or": [
                    {"student_id": s["_id"]},
                    {"name": {"$regex": f"^{sid_name}$", "$options": "i"}},
                ]
            })
            att_pct = min(round((total_att / working_days) * 100) if working_days > 0 else 0, 100)

            activity_results = list(db["activity_results"].find({
                "$or": [
                    {"student_id": sid},
                    {"student_name": {"$regex": f"^{sid_name}$", "$options": "i"}},
                ]
            }))

            avg_score = 0
            if activity_results:
                avg_score = round(
                    sum(r.get("stars", 0) for r in activity_results) / len(activity_results), 1
                )

            result.append({
                "_id":         sid,
                "name":        sid_name,
                "class":       s.get("class",        ""),
                "roll_number": s.get("roll_number",  ""),
                "parent_name": s.get("parent_name",  ""),
                "email":       s.get("email",        ""),
                "phone":       s.get("phone",        ""),
                "age":         s.get("age",          4),
                "avg_score":   avg_score,
                "attendance":  att_pct,
                "created_at":  str(s.get("created_at", "")),
            })

        return jsonify(result)

    except Exception as e:
        print(f"[all-students-with-stats] ERROR: {e}")
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# GET /api/teacher/profile
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/profile', methods=['GET'])
def get_teacher_profile():
    try:
        teacher_id = request.args.get('teacher_id')
        if not teacher_id:
            return jsonify({"status": "error", "message": "teacher_id required"}), 400

        db = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017/"))["AlexiDB"]
        teacher = db["users"].find_one({"_id": ObjectId(teacher_id)})
        if not teacher:
            return jsonify({"status": "error", "message": "Teacher not found"}), 404

        return jsonify({
            "status": "success",
            "profile": {
                "fullName": teacher.get("name",    ""),
                "email":    teacher.get("email",   ""),
                "phone":    teacher.get("phone",   ""),
                "school":   teacher.get("school",  ""),
                "class":    teacher.get("class",   ""),
                "subject":  teacher.get("subject", ""),
            }
        })

    except Exception as e:
        print(f"[teacher-profile GET] ERROR: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# PUT /api/teacher/profile
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/profile', methods=['PUT'])
def update_teacher_profile():
    try:
        teacher_id = request.args.get('teacher_id')
        if not teacher_id:
            return jsonify({"status": "error", "message": "teacher_id required"}), 400

        data = request.get_json() or {}
        db   = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017/"))["AlexiDB"]

        update_fields = {}
        for field, db_key in [
            ("fullName", "name"),
            ("email",    "email"),
            ("phone",    "phone"),
            ("school",   "school"),
            ("class",    "class"),
            ("subject",  "subject"),
        ]:
            if data.get(field) is not None:
                update_fields[db_key] = data[field]

        db["users"].update_one(
            {"_id": ObjectId(teacher_id)},
            {"$set": update_fields}
        )

        return jsonify({"status": "success", "message": "Profile updated"})

    except Exception as e:
        print(f"[teacher-profile PUT] ERROR: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# PUT /api/teacher/change-password
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/change-password', methods=['PUT'])
def change_teacher_password():
    try:
        teacher_id = request.args.get('teacher_id')
        if not teacher_id:
            return jsonify({"status": "error", "message": "teacher_id required"}), 400

        data = request.get_json() or {}
        current_password = data.get("currentPassword", "")
        new_password     = data.get("newPassword",     "")

        if not current_password or not new_password:
            return jsonify({"status": "error", "message": "Both passwords required"}), 400

        from flask_bcrypt import Bcrypt
        from extensions import bcrypt

        db      = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017/"))["AlexiDB"]
        teacher = db["users"].find_one({"_id": ObjectId(teacher_id)})
        if not teacher:
            return jsonify({"status": "error", "message": "Teacher not found"}), 404

        # Current password verify karo
        if not bcrypt.check_password_hash(teacher.get("password", ""), current_password):
            return jsonify({"status": "error", "message": "Current password is incorrect"}), 400

        # New password hash karke save karo
        new_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        db["users"].update_one(
            {"_id": ObjectId(teacher_id)},
            {"$set": {"password": new_hash}}
        )

        return jsonify({"status": "success", "message": "Password changed successfully"})

    except Exception as e:
        print(f"[change-password] ERROR: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500