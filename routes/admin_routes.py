from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
from extensions import users, attendance_collection, bcrypt, students, db
from routes.auth_routes import token_required, admin_required
import re
import os
import logging

logger = logging.getLogger(__name__)
admin_bp = Blueprint("admin", __name__)

# ============================
# ADMIN DASHBOARD STATS
# ============================
@admin_bp.route('/api/admin/dashboard-stats', methods=['GET'])
@admin_required
def dashboard_stats():
    try:

        total_teachers    = db["users"].count_documents({"role": "teacher"})
        total_parents     = db["users"].count_documents({"role": "parent"})
        total_students    = db["students"].count_documents({})
        pending_approvals = db["users"].count_documents({"status": "pending"})
        active_today      = db["attendance"].count_documents({
            "date": datetime.now().strftime("%Y-%m-%d")
        })

        # ── Recent Activity: last 10 user registrations/approvals ──
        recent_users = list(
            db["users"]
            .find({}, {"name": 1, "role": 1, "status": 1, "created_at": 1})
            .sort("created_at", -1)
            .limit(10)
        )
        recent_activity = []
        for u in recent_users:
            role   = u.get("role", "user")
            status = u.get("status", "pending")
            created = u.get("created_at")

            if status == "approved":
                action = f"{'Teacher' if role == 'teacher' else 'Parent'} approved"
                atype  = "success"
            else:
                action = f"New {role} registered"
                atype  = "info"

            # Format time
            if isinstance(created, datetime):
                diff = datetime.utcnow() - created
                minutes = int(diff.total_seconds() / 60)
                if minutes < 60:
                    time_str = f"{minutes} min ago"
                elif minutes < 1440:
                    time_str = f"{minutes // 60} hours ago"
                else:
                    time_str = f"{minutes // 1440} days ago"
            else:
                time_str = "Recently"

            recent_activity.append({
                "action": action,
                "user":   u.get("name", "Unknown"),
                "time":   time_str,
                "type":   atype
            })

        # ── System Stats ──────────────────────────────────────────
        total_activity_results = db["activity_results"].count_documents({})
        total_attendance_logs  = db["attendance"].count_documents({})

        system_stats = [
            {"label": "Total Activity Sessions", "value": str(total_activity_results), "status": "good"},
            {"label": "Attendance Records",       "value": str(total_attendance_logs),  "status": "good"},
            {"label": "Pending Approvals",        "value": str(pending_approvals),      "status": "good" if pending_approvals == 0 else "warning"},
            {"label": "System Health",            "value": "Excellent",                 "status": "good"},
        ]

        return jsonify({
            "totalTeachers":   total_teachers,
            "totalParents":    total_parents,
            "totalStudents":   total_students,
            "pendingApprovals": pending_approvals,
            "activeToday":     active_today,
            "systemHealth":    "Excellent",
            "recentActivity":  recent_activity,
            "systemStats":     system_stats,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# @admin_bp.route('/api/admin/pending')
# def pending_users():
#     data = list(users.find({"status": "pending"}))
#     return dumps(data)

@admin_bp.route('/api/admin/pending-users', methods=['GET'])
# @token_required
@admin_required
def get_pending_users():
    pending = list(users.find({"status": "pending"}))

    formatted = []
    for u in pending:
        formatted.append({
            "id": str(u["_id"]),
            "type": u.get("role"),
            "name": u.get("name"),
            "email": u.get("email"),
            "date": u.get("created_at"),
            "child_name": u.get("child_name"),
            "roll_number": u.get("roll_number"),
            "school": u.get("school")
        })

    return jsonify(formatted)

# ============================
# APPROVE USER
# ============================
@admin_bp.route('/api/admin/approve/<id>', methods=['PUT'])
# @token_required
@admin_required
def approve_user(id):
    users.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"status": "approved"}}
    )
    return jsonify({"msg": "User approved"})
# ============================
# REJECT USER
# ============================
@admin_bp.route('/api/admin/reject/<id>', methods=['DELETE'])
# @token_required
@admin_required
def reject_user(id):
    try:
        result = users.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"msg": "User not found"}), 404
        return jsonify({"msg": "User rejected successfully"})
    except Exception as e:
        logger.error("[RejectUser] Error: %s", e, exc_info=True)
        return jsonify({"msg": "Error rejecting user", "error": str(e)}), 500


@admin_bp.route('/api/admin/all-users')
# @token_required
@admin_required
def all_users():
    all_users = list(users.find({"role": {"$in": ["parent", "teacher"]}}))

    formatted = []
    for u in all_users:
        formatted.append({
            "_id": str(u["_id"]),
            "name": u.get("name"),
            "email": u.get("email"),
            "phone": u.get("phone"),
            "school": u.get("school"),
            "class": u.get("class"),
            "status": u.get("status"),
            "child_name": u.get("child_name"),
            "child_class": u.get("child_class"),
            "role": u.get("role"),
            "created_at": u.get("created_at")
        })

    return jsonify(formatted)


@admin_bp.route('/api/admin/add-teacher', methods=['POST'])
# @token_required
@admin_required
def add_teacher():
    data = request.json
    email = data.get("email", "").lower()
    if users.find_one({"email": email}):
        return jsonify({"msg": "Email exists"}), 400

    teacher = {
        "name": data["name"],
        "email": email,
        "phone": data["phone"],
        "school": data.get("school"),
        "class": data.get("class"),
        "role": "teacher",
        "password": bcrypt.generate_password_hash(data["password"]).decode(),
        "status": "approved",
        "created_at": datetime.utcnow()
    }

    users.insert_one(teacher)
    return jsonify({"msg": "Teacher added"})

# ============================
# EDIT TEACHER
# ============================
@admin_bp.route('/api/admin/edit-teacher/<id>', methods=['PUT'])
# @token_required
@admin_required
def edit_teacher(id):
    data = request.json

    update_data = {
        "name": data.get("name"),
        "email": data.get("email", "").lower() if data.get("email") else None,
        "phone": data.get("phone"),
        "school": data.get("school"),
        "class": data.get("class"),
        "status": data.get("status"),
    }

    # Remove None values
    update_data = {k: v for k, v in update_data.items() if v is not None}

    # If password is updated
    if data.get("password"):
        update_data["password"] = bcrypt.generate_password_hash(
            data["password"]
        ).decode()

    users.update_one(
        {"_id": ObjectId(id), "role": "teacher"},
        {"$set": update_data}
    )

    return jsonify({"msg": "Teacher updated successfully"})

# ============================
# EDIT PARENT
# ============================
@admin_bp.route('/api/admin/edit-parent/<id>', methods=['PUT'])
# @token_required
@admin_required
def edit_parent(id):
    data = request.json

    update_data = {
        "name": data.get("name"),
        "email": data.get("email", "").lower() if data.get("email") else None,
        "phone": data.get("phone"),
        "child_name": data.get("childName"),
        "child_class": data.get("childClass"),
        "status": data.get("status"),
    }

    # Remove None values
    update_data = {k: v for k, v in update_data.items() if v is not None}

    # If password is updated
    if data.get("password"):
        update_data["password"] = bcrypt.generate_password_hash(
            data["password"]
        ).decode()

    users.update_one(
        {"_id": ObjectId(id), "role": "parent"},
        {"$set": update_data}
    )

    return jsonify({"msg": "Parent updated successfully"})


@admin_bp.route('/api/admin/add-student', methods=['POST'])
@token_required
# @admin_required
def add_student():
    data = request.json

    parent = users.find_one({
        "name": data.get("parentName"),
        "role": "parent"
    })

    student = {
        "name": data.get("name", ""),
        "class": data.get("class", ""),
        "parent_id": parent["_id"] if parent else None,
        "parent_name": data.get("parentName"),
        "email": data.get("email", "").lower() if data.get("email") else None,
        "phone": data.get("phone"),
        "roll_number": data.get("rollNumber"),
        "face_registered": False,
        "created_at": datetime.utcnow()
    }

    result = students.insert_one(student)
    student_id = result.inserted_id

    # students.insert_one(student)
    if parent:
        users.update_one(
            {"_id": parent["_id"]},
            {"$push": {"children_ids": student_id}}
        )

    return jsonify({"msg": "Student added successfully"})

@admin_bp.route('/api/admin/all-students', methods=['GET'])
# @token_required
@admin_required
def get_all_students():
    all_students = list(students.find())

    formatted = []
    for s in all_students:
        formatted.append({
            "_id": str(s["_id"]),
            "name": s.get("name"),
            "class": s.get("class"),
            "roll_number": s.get("roll_number"),
            "parent_name": s.get("parent_name"),
            "parent_id": str(s["parent_id"]) if s.get("parent_id") else None,
            "email": s.get("email"),
            "phone": s.get("phone"),
            "roll_number": s.get("roll_number"),
            "created_at": s.get("created_at"),
            "face_registered": s.get("face_registered", False)
        })

    return jsonify(formatted)

@admin_bp.route('/api/admin/edit-student/<id>', methods=['PUT'])
# @token_required
@admin_required
def edit_student(id):
    data = request.json

    update_data = {
        "name": data.get("name"),
        "class": data.get("class"),
        "parent_name": data.get("parentName"),
        "email": data.get("email", "").lower() if data.get("email") else None,
        "phone": data.get("phone"),
        "roll_number": data.get("rollNumber"),
    }
    # ID change logic: Agar parent_id aayi hai toh use update karo
    if data.get("parent_id"):
        update_data["parent_id"] = ObjectId(data["parent_id"])

    update_data = {k: v for k, v in update_data.items() if v is not None}

    students.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_data}
    )

    return jsonify({"msg": "Student updated successfully"})

@admin_bp.route('/api/admin/delete-student/<id>', methods=['DELETE'])
@admin_required
def delete_student(id):
    try:
        import gridfs

        student = students.find_one({"_id": ObjectId(id)})
        if not student:
            return jsonify({"msg": "Student not found"}), 404

        fs = gridfs.GridFS(db)
        for file_doc in db.fs.files.find({"filename": f"{id}.jpg"}):
            fs.delete(file_doc["_id"])

        students.delete_one({"_id": ObjectId(id)})

        return jsonify({"msg": "Student deleted successfully"})
    except Exception as e:
        logger.error("[DeleteStudent] Error: %s", e, exc_info=True)
        return jsonify({"msg": "Delete failed", "error": str(e)}), 500

# ============================
# CONFIG: BADGES
# ============================
@admin_bp.route('/api/config/badges', methods=['GET'])
def get_badges_config():
    badges = [
        {"id": 1, "icon": "🌟", "name": "First Star",    "description": "Earn your first star",   "unlockAt": 1,   "rarity": "common"},
        {"id": 2, "icon": "📚", "name": "Bookworm",      "description": "Complete 3 activities",  "unlockAt": 5,   "rarity": "common"},
        {"id": 3, "icon": "🏃", "name": "Fast Learner",  "description": "Earn 15 stars",          "unlockAt": 15,  "rarity": "common"},
        {"id": 4, "icon": "🔥", "name": "On Fire",       "description": "Earn 30 stars",          "unlockAt": 30,  "rarity": "uncommon"},
        {"id": 5, "icon": "🎨", "name": "Color Master",  "description": "Earn 50 stars",          "unlockAt": 50,  "rarity": "rare"},
        {"id": 6, "icon": "💯", "name": "Perfect Score", "description": "Earn 75 stars",          "unlockAt": 75,  "rarity": "rare"},
        {"id": 7, "icon": "🏆", "name": "Champion",      "description": "Earn 100 stars",         "unlockAt": 100, "rarity": "epic"},
        {"id": 8, "icon": "👑", "name": "Legend",        "description": "Earn 200 stars",         "unlockAt": 200, "rarity": "legendary"},
    ]
    return jsonify({"status": "success", "badges": badges})


# ============================
# CONFIG: LEVELS
# ============================
@admin_bp.route('/api/config/levels', methods=['GET'])
def get_levels_config():
    levels = [
        {"name": "Little Star",  "min": 0,   "max": 49,         "emoji": "⭐"},
        {"name": "Bright Star",  "min": 50,  "max": 99,         "emoji": "🌟"},
        {"name": "Super Star",   "min": 100, "max": 199,        "emoji": "💫"},
        {"name": "Rising Star",  "min": 200, "max": 349,        "emoji": "🚀"},
        {"name": "Champion",     "min": 350, "max": 499,        "emoji": "🏆"},
        {"name": "Legend",       "min": 500, "max": 999999999,  "emoji": "👑"},
    ]
    return jsonify({"status": "success", "levels": levels})


# ============================
# CONFIG: SKILLS
# ============================
@admin_bp.route('/api/config/skills', methods=['GET'])
def get_skills_config():
    skills = [
        {"name": "Alphabets",     "unlocksAt": 0,   "color": "green"},
        {"name": "Common Fruits", "unlocksAt": 0,   "color": "green"},
        {"name": "Colors",        "unlocksAt": 10,  "color": "blue"},
        {"name": "Animals",       "unlocksAt": 30,  "color": "purple"},
        {"name": "Numbers",       "unlocksAt": 50,  "color": "orange"},
        {"name": "Phonics",       "unlocksAt": 100, "color": "pink"},
    ]
    return jsonify({"status": "success", "skills": skills})


# ============================
# PARENT: CLASS LEADERBOARD
# ============================
@admin_bp.route('/api/parent/class-leaderboard', methods=['GET'])
@token_required
def get_class_leaderboard():
    try:

        # Aggregate total stars per student from activity_results
        pipeline = [
            {"$group": {
                "_id":        "$student_id",
                "name":       {"$first": "$student_name"},
                "total_stars": {"$sum": "$stars"}
            }},
            {"$sort": {"total_stars": -1}},
            {"$limit": 10}
        ]
        results = list(db["activity_results"].aggregate(pipeline))

        leaderboard = []
        for r in results:
            leaderboard.append({
                "student_id": str(r["_id"]),
                "name":       r.get("name", "Student"),
                "stars":      r.get("total_stars", 0)
            })

        return jsonify({"status": "success", "leaderboard": leaderboard})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500