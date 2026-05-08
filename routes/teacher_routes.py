from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from datetime import datetime, timedelta, timezone
from extensions import db, bcrypt
from routes.auth_routes import token_required, teacher_required
import logging

logger = logging.getLogger(__name__)
teacher_bp = Blueprint('teacher_bp', __name__)

# ─────────────────────────────────────────────────────────────
# GET /api/teacher/dashboard-stats
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/dashboard-stats', methods=['GET'])
# @token_required
@teacher_required
def get_teacher_dashboard_stats():
    try:
        teacher_id = request.args.get('teacher_id') or g.user['id']
        
        # Security check: Teacher can only see their own dashboard or admin
        if g.user['role'] != 'admin' and g.user['id'] != teacher_id:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        today      = datetime.now().strftime("%Y-%m-%d")

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
        logger.error("[dashboard-stats] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# GET /api/teacher/attendance?date=YYYY-MM-DD
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/attendance', methods=['GET'])
# @token_required
@teacher_required
def get_attendance_by_date():
    try:
        date = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))

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
        logger.error("[get-attendance] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# POST /api/teacher/attendance/update
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/attendance/update', methods=['POST'])
# @token_required
@teacher_required
def update_attendance_manual():
    try:
        data       = request.get_json() or {}
        name       = data.get("name",   "").strip()
        status     = data.get("status", "present")
        date       = data.get("date",   datetime.now().strftime("%Y-%m-%d"))
        student_id = data.get("student_id", "")

        if not name:
            return jsonify({"status": "error", "message": "name required"}), 400

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
        logger.error("[update-attendance] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500





# ─────────────────────────────────────────────────────────────
# GET /api/teacher/profile
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/profile', methods=['GET'])
# @token_required
@teacher_required
def get_teacher_profile():
    try:
        teacher_id = request.args.get('teacher_id') or g.user['id']
        
        # Security check
        if g.user['role'] != 'admin' and g.user['id'] != teacher_id:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

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
        logger.error("[teacher-profile GET] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500



# ─────────────────────────────────────────────────────────────
# PUT /api/teacher/profile
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/profile', methods=['PUT'])
# @token_required
@teacher_required
def update_teacher_profile():
    try:
        teacher_id = request.args.get('teacher_id') or g.user['id']

        # Security check
        if g.user['role'] != 'admin' and g.user['id'] != teacher_id:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        data = request.get_json() or {}

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
                val = data[field]
                if field == "email":
                    val = val.lower()
                update_fields[db_key] = val

        db["users"].update_one(
            {"_id": ObjectId(teacher_id)},
            {"$set": update_fields}
        )

        return jsonify({"status": "success", "message": "Profile updated"})

    except Exception as e:
        logger.error("[teacher-profile PUT] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500



# ─────────────────────────────────────────────────────────────
# PUT /api/teacher/change-password
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/change-password', methods=['PUT'])
# @token_required
@teacher_required
def change_teacher_password():
    try:
        teacher_id = request.args.get('teacher_id') or g.user['id']

        # Security check
        if g.user['role'] != 'admin' and g.user['id'] != teacher_id:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        data = request.get_json() or {}
        current_password = data.get("currentPassword", "")
        new_password     = data.get("newPassword",     "")

        if not current_password or not new_password:
            return jsonify({"status": "error", "message": "Both passwords required"}), 400

        from extensions import bcrypt

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
        logger.error("[change-password] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500



# ─────────────────────────────────────────────────────────────
# GET /api/teacher/activity-stats
# Returns per-activity completion count and avg star score
# Used by ActivitiesTab.jsx to populate the stats cards
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/activity-stats', methods=['GET'])
@teacher_required
def get_activity_stats():
    try:
        pipeline = [
            {
                "$group": {
                    "_id":               "$activity_id",
                    "studentsCompleted": {"$sum": 1},
                    "totalStars":        {"$sum": "$stars"},
                }
            }
        ]
        results = list(db["activity_results"].aggregate(pipeline))

        stats = {}
        for r in results:
            activity_id = r["_id"]
            if activity_id is None:
                continue
            completed = r["studentsCompleted"]
            avg_score = round(r["totalStars"] / completed, 1) if completed > 0 else 0
            stats[str(activity_id)] = {
                "studentsCompleted": completed,
                "avgScore":          avg_score,
            }

        return jsonify({"status": "success", "stats": stats})

    except Exception as e:
        logger.error("[activity-stats] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# GET /api/teacher/reports
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/reports', methods=['GET'])
# @token_required
@teacher_required
def get_teacher_reports():
    try:
        start_date = request.args.get('start_date', (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d"))
        end_date   = request.args.get('end_date', datetime.now().strftime("%Y-%m-%d"))

        # All activity results in date range
        all_results = list(db["activity_results"].find({
            "date": {"$gte": start_date, "$lte": end_date}
        }))

        # Class Stats
        total_students   = db["students"].count_documents({})
        total_activities = len(all_results)
        total_stars      = sum(r.get("stars", 0) for r in all_results)
        avg_score        = round(sum(r.get("stars", 0) for r in all_results) / len(all_results), 1) if all_results else 0

        # Attendance average
        attendance_records = list(db["attendance"].find({
            "date": {"$gte": start_date, "$lte": end_date}
        }))
        avg_attendance = round((len(attendance_records) / (total_students * 7)) * 100) if total_students > 0 else 0
        avg_attendance = min(avg_attendance, 100)

        # Weekly Progress (last 5 days)
        weekly_progress = []
        for i in range(4, -1, -1):
            day       = datetime.now() - timedelta(days=i)
            day_str   = day.strftime("%Y-%m-%d")
            day_name  = day.strftime("%a")
            day_results = [r for r in all_results if r.get("date") == day_str]
            day_avg   = round(sum(r.get("stars", 0) for r in day_results) / len(day_results), 1) if day_results else 0
            weekly_progress.append({
                "day":        day_name,
                "activities": len(day_results),
                "avgScore":   day_avg
            })

        # Activity Breakdown
        activity_map = {}
        for r in all_results:
            name = r.get("activity_name", "Unknown")
            if name not in activity_map:
                activity_map[name] = {"scores": [], "completed": 0}
            activity_map[name]["scores"].append(r.get("stars", 0))
            activity_map[name]["completed"] += 1

        activity_breakdown = []
        for name, data in activity_map.items():
            avg = round(sum(data["scores"]) / len(data["scores"]), 1) if data["scores"] else 0
            pct = round((sum(1 for s in data["scores"] if s >= 3) / len(data["scores"])) * 100) if data["scores"] else 0
            activity_breakdown.append({
                "activity":   name,
                "avgScore":   avg,
                "completed":  data["completed"],
                "percentage": pct
            })

        # Top Performers
        student_map = {}
        for r in all_results:
            sname = r.get("student_name", "Unknown")
            if sname not in student_map:
                student_map[sname] = {"stars": 0, "scores": []}
            student_map[sname]["stars"] += r.get("stars", 0)
            student_map[sname]["scores"].append(r.get("stars", 0))

        sorted_students = sorted(student_map.items(), key=lambda x: x[1]["stars"], reverse=True)

        top_performers = []
        for rank, (name, data) in enumerate(sorted_students[:3], 1):
            avg = round(sum(data["scores"]) / len(data["scores"]), 1) if data["scores"] else 0
            top_performers.append({
                "rank":  rank,
                "name":  name,
                "score": avg,
                "stars": data["stars"],
                "trend": "up"
            })

        # Needs Attention (low scorers)
        needs_attention = []
        for name, data in sorted_students:
            avg = round(sum(data["scores"]) / len(data["scores"]), 1) if data["scores"] else 0
            if avg < 3.5:
                needs_attention.append({
                    "name":        name,
                    "score":       avg,
                    "subject":     "General",
                    "improvement": "needed"
                })

        return jsonify({
            "status": "success",
            "classStats": {
                "avgScore":        avg_score,
                "totalActivities": total_activities,
                "totalStars":      total_stars,
                "avgAttendance":   avg_attendance,
                "improvement":     "+0%"
            },
            "weeklyProgress":    weekly_progress,
            "activityBreakdown": activity_breakdown,
            "topPerformers":     top_performers,
            "needsAttention":    needs_attention
        })

    except Exception as e:
        logger.error("[teacher-reports] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500

# ─────────────────────────────────────────────────────────────
# GET /api/admin/all-students-with-stats
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/admin/all-students-with-stats', methods=['GET'])
# @token_required
@teacher_required
def get_all_students_with_stats():
    try:
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
                    {"student_id": s["_id"]},
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
                "face_registered": s.get("face_registered", False),
                "created_at":  str(s.get("created_at", "")),
            })

        return jsonify(result)

    except Exception as e:
        logger.error("[all-students-with-stats] ERROR: %s", e, exc_info=True)
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# POST /api/teacher/add-parent
# Teacher adds a parent — auto-approved, no admin needed
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/add-parent', methods=['POST'])
@teacher_required
def teacher_add_parent():
    try:
        data  = request.get_json() or {}
        email = data.get("email", "").lower().strip()

        if not email:
            return jsonify({"status": "error", "message": "Email is required"}), 400
        if db["users"].find_one({"email": email}):
            return jsonify({"status": "error", "message": "Email already exists"}), 400

        password = data.get("password", "").strip()
        if not password:
            return jsonify({"status": "error", "message": "Password is required"}), 400

        from extensions import bcrypt as _bcrypt
        parent = {
            "name":        data.get("name", "").strip(),
            "email":       email,
            "phone":       data.get("phone", "").strip(),
            "role":        "parent",
            "password":    _bcrypt.generate_password_hash(password).decode(),
            "status":      "approved",   # auto-approved when added by teacher
            "child_name":  data.get("childName", "").strip(),
            "roll_number": data.get("rollNumber", "").strip(),
            "added_by":    "teacher",
            "created_at":  datetime.now(timezone.utc),
        }
        result = db["users"].insert_one(parent)
        logger.info("[teacher-add-parent] Parent %s added by teacher %s", email, g.user.get('id'))
        return jsonify({"status": "success", "message": "Parent added successfully", "parent_id": str(result.inserted_id)})

    except Exception as e:
        logger.error("[teacher-add-parent] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# GET /api/teacher/all-parents
# Teacher ke liye parents list (dropdown ke liye)
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/all-parents', methods=['GET'])
@teacher_required
def get_all_parents():
    try:
        parents = list(db["users"].find({"role": "parent"}))
        result = []
        for p in parents:
            result.append({
                "_id":   str(p["_id"]),
                "name":  p.get("name", ""),
                "email": p.get("email", ""),
                "phone": p.get("phone", ""),
                "role":  "parent"
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@teacher_bp.route('/api/teacher/add-review', methods=['POST'])
@teacher_required
def add_teacher_review():
    """Add a teacher review/note for a student"""
    try:
        data         = request.get_json() or {}
        student_id   = data.get("student_id", "")
        student_name = data.get("student_name", "")
        review_text  = data.get("review", "").strip()
        rating       = data.get("rating", 0)
        teacher_id   = g.user.get('id')

        if not student_name or not review_text:
            return jsonify({"status": "error", "message": "Student name and review text are required"}), 400

        teacher      = db["users"].find_one({"_id": ObjectId(teacher_id)})
        teacher_name = teacher.get("name", "Teacher") if teacher else "Teacher"

        review_doc = {
            "student_id":   ObjectId(student_id) if student_id else None,
            "student_name": student_name,
            "teacher_id":   ObjectId(teacher_id),
            "teacher_name": teacher_name,
            "review":       review_text,
            "rating":       min(5, max(1, int(rating))) if rating else None,
            "date":         datetime.now().strftime("%Y-%m-%d"),
            "timestamp":    datetime.now(timezone.utc).isoformat(),
            "created_at":   datetime.now(timezone.utc)
        }

        result = db["teacher_reviews"].insert_one(review_doc)
        logger.info("[add-review] Teacher %s added review for %s", teacher_name, student_name)
        return jsonify({"status": "success", "message": "Review added successfully", "review_id": str(result.inserted_id)})

    except Exception as e:
        logger.error("[add-review] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# GET /api/teacher/reviews?student_id=<id>
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/reviews', methods=['GET'])
@teacher_required
def get_student_reviews():
    """Fetch all reviews for a student"""
    try:
        student_id   = request.args.get('student_id', '')
        student_name = request.args.get('student_name', '')

        query = {}
        if student_id:
            try:
                query['student_id'] = ObjectId(student_id)
            except Exception:
                pass
        elif student_name:
            query['student_name'] = {'$regex': f'^{student_name}$', '$options': 'i'}
        else:
            return jsonify({"status": "error", "message": "student_id or student_name required"}), 400

        reviews = list(db["teacher_reviews"].find(query).sort("created_at", -1))
        formatted = []
        for r in reviews:
            formatted.append({
                "id":           str(r["_id"]),
                "review":       r.get("review", ""),
                "rating":       r.get("rating"),
                "teacher_name": r.get("teacher_name", ""),
                "date":         r.get("date", ""),
                "timestamp":    r.get("timestamp", ""),
            })

        return jsonify({"status": "success", "reviews": formatted})

    except Exception as e:
        logger.error("[get-reviews] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# PUT /api/teacher/update-review/<review_id>
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/update-review/<review_id>', methods=['PUT'])
@teacher_required
def update_teacher_review(review_id):
    """Edit an existing review — only the teacher who wrote it can edit"""
    try:
        data        = request.get_json() or {}
        review_text = data.get("review", "").strip()
        rating      = data.get("rating", None)
        teacher_id  = g.user.get('id')

        if not review_text:
            return jsonify({"status": "error", "message": "Review text is required"}), 400

        review = db["teacher_reviews"].find_one({"_id": ObjectId(review_id)})
        if not review:
            return jsonify({"status": "error", "message": "Review not found"}), 404

        # Only the author or admin can edit
        if g.user['role'] != 'admin' and str(review.get('teacher_id')) != teacher_id:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        update_fields = {
            "review":     review_text,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        if rating is not None:
            update_fields["rating"] = min(5, max(1, int(rating)))

        db["teacher_reviews"].update_one(
            {"_id": ObjectId(review_id)},
            {"$set": update_fields}
        )

        logger.info("[update-review] Review %s updated by teacher %s", review_id, teacher_id)
        return jsonify({"status": "success", "message": "Review updated successfully"})

    except Exception as e:
        logger.error("[update-review] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# GET /api/teacher/chat-history
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/chat-history', methods=['GET'])
@teacher_required
def get_teacher_chat_history():
    """Get chat history for all students or specific student"""
    try:
        student_name = request.args.get('student_name', '')
        student_id = request.args.get('student_id', '')
        date_filter = request.args.get('date', '')
        limit = int(request.args.get('limit', 50))
        
        # Build query
        query = {}
        if student_name:
            query['student_name'] = {'$regex': f'^{student_name}$', '$options': 'i'}
        if student_id:
            try:
                query['student_id'] = ObjectId(student_id)
            except Exception:
                pass
        if date_filter:
            query['date'] = date_filter
            
        # Get chat sessions
        chat_sessions = list(db["mimi_chats"].find(query)
                           .sort("updated_at", -1)
                           .limit(limit))
        
        formatted_sessions = []
        for session in chat_sessions:
            messages = session.get('messages', [])
            total_messages = len(messages)
            
            # Get session duration if available
            started_at = session.get('started_at', '')
            updated_at = session.get('updated_at', '')
            
            formatted_sessions.append({
                'session_id': session.get('session_id', ''),
                'student_name': session.get('student_name', ''),
                'student_id': str(session.get('student_id', '')) if session.get('student_id') else '',
                'date': session.get('date', ''),
                'started_at': started_at,
                'updated_at': updated_at,
                'total_messages': total_messages,
                'messages': messages[-10:] if len(messages) > 10 else messages,  # Last 10 messages
                'has_more_messages': len(messages) > 10
            })
            
        return jsonify({
            'status': 'success',
            'sessions': formatted_sessions,
            'total_sessions': len(formatted_sessions)
        })
        
    except Exception as e:
        logger.error("[teacher-chat-history] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# GET /api/teacher/chat-session-details
# ─────────────────────────────────────────────────────────────
@teacher_bp.route('/api/teacher/chat-session-details', methods=['GET'])
@teacher_required
def get_chat_session_details():
    """Get full details of a specific chat session"""
    try:
        session_id = request.args.get('session_id', '')
        if not session_id:
            return jsonify({"status": "error", "message": "session_id required"}), 400
            
        session = db["mimi_chats"].find_one({'session_id': session_id})
        if not session:
            return jsonify({"status": "error", "message": "Session not found"}), 404
            
        return jsonify({
            'status': 'success',
            'session': {
                'session_id': session.get('session_id', ''),
                'student_name': session.get('student_name', ''),
                'student_id': str(session.get('student_id', '')) if session.get('student_id') else '',
                'date': session.get('date', ''),
                'started_at': session.get('started_at', ''),
                'updated_at': session.get('updated_at', ''),
                'total_messages': session.get('total_msgs', 0),
                'messages': session.get('messages', [])
            }
        })
        
    except Exception as e:
        logger.error("[chat-session-details] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500
 