from flask import Blueprint, jsonify, request, g
from bson import ObjectId
from datetime import datetime
from extensions import students, users, db
from routes.auth_routes import token_required
import logging

logger = logging.getLogger(__name__)
parent_bp = Blueprint('parent_bp', __name__)

# ── Existing route — rakho jaise hai ────────────────────────
@parent_bp.route('/api/parent/my-children/<parent_id>', methods=['GET'])
@token_required
def get_parent_children(parent_id):
    try:
        # Security check: Match authenticated user or admin
        if g.user['role'] != 'admin' and g.user['id'] != parent_id:
            return jsonify({"status": "error", "message": "Unauthorized access"}), 403

        my_students = list(students.find({"parent_id": ObjectId(parent_id)}))
        formatted = []
        for s in my_students:
            formatted.append({
                "id":          str(s["_id"]),
                "name":        s.get("name",        "Unknown"),
                "class":       s.get("class",        "N/A"),
                "roll_number": s.get("roll_number",  "N/A"),
            })
        logger.info("Found %d children for parent %s", len(formatted), parent_id)
        return jsonify(formatted), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── NEW: Child data for ParentHome ───────────────────────────
@parent_bp.route('/api/parent/child-data', methods=['GET'])
@token_required
def get_child_data():
    try:
        # Use g.user['id'] if parent_id is missing or to enforce security
        parent_id = request.args.get('parent_id') or g.user['id']
        
        # Security: ensure parent can only see their own data
        if g.user['role'] != 'admin' and g.user['id'] != parent_id:
            return jsonify({"status": "error", "message": "Unauthorized access"}), 403

        # Preferred lookup: Using parent_id link in students collection
        student = db["students"].find_one({"parent_id": ObjectId(parent_id)})
        
        # Fallback to old name-based lookup if no link exists
        if not student:
            parent = db["users"].find_one({"_id": ObjectId(parent_id)})
            if parent and parent.get("child_name"):
                student = db["students"].find_one(
                    {"name": {"$regex": f"^{parent.get('child_name')}$", "$options": "i"}}
                )

        if not student:
            return jsonify({"status": "not_found", "message": "No child linked"})

        child_name = student.get("name", "")
        today = datetime.now().strftime("%Y-%m-%d")

        logger.debug("[child-data] Student _id: %s | child_name: %s | today: %s", student['_id'], child_name, today)

        attendance = db["attendance"].find_one({
            "$or": [
                {"student_id": student["_id"], "date": today},
                {"student_id": str(student["_id"]), "date": today},
                {"name": {"$regex": f"^{child_name}$", "$options": "i"}, "date": today},
            ]
        })

        return jsonify({
            "status": "success",
            "student": {
                "id":      str(student["_id"]),
                "name":    student.get("name",        ""),
                "class":   student.get("class",       ""),
                "rollNo":  student.get("roll_number", ""),
                "present": attendance is not None,
            }
        })

    except Exception as e:
        logger.error("[child-data] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ── NEW: Child stars for ParentHome ─────────────────────────
@parent_bp.route('/api/parent/child-stars', methods=['GET'])
@token_required
def get_child_stars():
    try:
        student_id = request.args.get('student_id')
        if not student_id:
            return jsonify({"status": "error", "message": "student_id required"}), 400

        try:
            student_oid = ObjectId(student_id)
        except Exception:
            return jsonify({"status": "error", "message": "Invalid student_id"}), 400

        # Security Check: Verify parent owns this student
        if g.user['role'] != 'admin':
            student_doc = db["students"].find_one({"_id": student_oid})
            if not student_doc or str(student_doc.get("parent_id")) != g.user['id']:
                # Second chance: check child_name if parent_id link is missing
                parent_doc = db["users"].find_one({"_id": ObjectId(g.user['id'])})
                if not parent_doc or parent_doc.get("child_name", "").lower() != student_doc.get("name", "").lower():
                    return jsonify({"status": "error", "message": "Unauthorized access to this student"}), 403

        today = datetime.now().strftime("%Y-%m-%d")

        results = list(db["activity_results"].find(
            {"student_id": student_oid}
        ).sort("timestamp", -1).limit(50))

        formatted = []
        for r in results:
            formatted.append({
                "id":           str(r["_id"]),
                "activityName": r.get("activity_name", "Activity"),
                "activityId":   r.get("activity_id",   0),
                "stars":        r.get("stars",          0),
                "score":        r.get("score",          0),
                "date":         r.get("date",           ""),
                "timestamp":    r.get("timestamp",      ""),
            })

        total_stars = sum(r["stars"] for r in formatted)
        today_stars = sum(r["stars"] for r in formatted if r["date"] == today)
        today_count = len([r for r in formatted if r["date"] == today])

        return jsonify({
            "status":      "success",
            "total_stars": total_stars,
            "today_stars": today_stars,
            "today_count": today_count,
            "results":     formatted,
        })

    except Exception as e:
        logger.error("[child-stars] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


@parent_bp.route('/api/parent/check-attendance', methods=['GET'])
@token_required
def check_child_attendance():
    try:
        student_id = request.args.get('student_id')
        name       = request.args.get('name', '')
        
        try:
            oid = ObjectId(student_id)
        except Exception:
            oid = None

        # Security Check
        if g.user['role'] != 'admin':
             student_doc = db["students"].find_one({"_id": oid}) if oid else None
             if not student_doc:
                 # Try finding by name if no ID
                 student_doc = db["students"].find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
             
             if not student_doc:
                 return jsonify({"status": "error", "message": "Student not found"}), 404
                 
             if str(student_doc.get("parent_id")) != g.user['id']:
                 parent_doc = db["users"].find_one({"_id": ObjectId(g.user['id'])})
                 if not parent_doc or parent_doc.get("child_name", "").lower() != student_doc.get("name", "").lower():
                     return jsonify({"status": "error", "message": "Unauthorized"}), 403

        today      = datetime.now().strftime("%Y-%m-%d")
        query = {"date": today, "$or": [
            {"name":         {"$regex": f"^{name}$", "$options": "i"}},
            {"student_name": {"$regex": f"^{name}$", "$options": "i"}},
        ]}
        if oid:
            query["$or"].append({"student_id": oid})
            query["$or"].append({"student_id": str(oid)})

        attendance = db["attendance"].find_one(query)

        return jsonify({
            "status":  "success",
            "present": attendance is not None,
        })

    except Exception as e:
        logger.error("[check-attendance] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "present": False}), 500


@parent_bp.route('/api/parent/profile', methods=['GET'])
@token_required
def get_parent_profile():
    try:
        parent_id = request.args.get('parent_id') or g.user['id']
        
        # Security check
        if g.user['role'] != 'admin' and g.user['id'] != parent_id:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        parent = db["users"].find_one({"_id": ObjectId(parent_id)})
        if not parent:
            return jsonify({"status": "error", "message": "Parent not found"}), 404

        return jsonify({
            "status": "success",
            "profile": {
                "name":       parent.get("name",       ""),
                "email":      parent.get("email",      ""),
                "phone":      parent.get("phone",      ""),
                "occupation": parent.get("occupation", ""),
                "child_name": parent.get("child_name", ""),
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@parent_bp.route('/api/parent/profile', methods=['PUT'])
@token_required
def update_parent_profile():
    try:
        parent_id = request.args.get('parent_id') or g.user['id']

        # Security check
        if g.user['role'] != 'admin' and g.user['id'] != parent_id:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        data = request.get_json() or {}

        update_fields = {}
        if data.get("name"):       update_fields["name"]       = data["name"]
        if data.get("email"):      update_fields["email"]      = data["email"].lower()
        if data.get("phone"):      update_fields["phone"]      = data["phone"]
        if data.get("occupation"): update_fields["occupation"] = data["occupation"]

        db["users"].update_one(
            {"_id": ObjectId(parent_id)},
            {"$set": update_fields}
        )

        return jsonify({"status": "success", "message": "Profile updated"})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@parent_bp.route('/api/parent/change-password', methods=['PUT'])
@token_required
def change_parent_password():
    try:
        parent_id = request.args.get('parent_id') or g.user['id']
        
        # Security check
        if g.user['role'] != 'admin' and g.user['id'] != parent_id:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403

        data = request.get_json() or {}
        current_password = data.get("currentPassword", "")
        new_password     = data.get("newPassword", "")

        if not current_password or not new_password:
            return jsonify({"status": "error", "message": "Both passwords required"}), 400

        from extensions import bcrypt

        parent = db["users"].find_one({"_id": ObjectId(parent_id)})
        if not parent:
            return jsonify({"status": "error", "message": "Parent not found"}), 404

        if not bcrypt.check_password_hash(parent.get("password", ""), current_password):
            return jsonify({"status": "error", "message": "Current password is incorrect"}), 400

        new_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        db["users"].update_one(
            {"_id": ObjectId(parent_id)},
            {"$set": {"password": new_hash}}
        )

        return jsonify({"status": "success", "message": "Password changed successfully"})

    except Exception as e:
        logger.error("[change-password] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# GET /api/parent/child-chat-history
# ─────────────────────────────────────────────────────────────
@parent_bp.route('/api/parent/child-chat-history', methods=['GET'])
@token_required
def get_child_chat_history():
    """Get chat history for parent's child"""
    try:
        parent_id = request.args.get('parent_id') or g.user['id']
        student_id = request.args.get('student_id', '')
        date_filter = request.args.get('date', '')
        limit = int(request.args.get('limit', 20))
        
        # Security check
        if g.user['role'] != 'admin' and g.user['id'] != parent_id:
            return jsonify({"status": "error", "message": "Unauthorized"}), 403
        
        # Get parent's child info
        parent = db["users"].find_one({"_id": ObjectId(parent_id)})
        if not parent:
            return jsonify({"status": "error", "message": "Parent not found"}), 404
            
        child_name = parent.get('child_name', '')
        
        # If student_id provided, verify it belongs to this parent
        if student_id:
            try:
                student_oid = ObjectId(student_id)
                student = db["students"].find_one({"_id": student_oid})
                if student:
                    # Check if parent owns this student
                    if str(student.get('parent_id')) != parent_id and student.get('name', '').lower() != child_name.lower():
                        return jsonify({"status": "error", "message": "Unauthorized access to this student"}), 403
                    child_name = student.get('name', child_name)
            except Exception:
                pass
        
        if not child_name:
            return jsonify({"status": "error", "message": "No child linked to this parent"}), 404
            
        # Build query for chat history
        query = {'student_name': {'$regex': f'^{child_name}$', '$options': 'i'}}
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
            
            formatted_sessions.append({
                'session_id': session.get('session_id', ''),
                'student_name': session.get('student_name', ''),
                'date': session.get('date', ''),
                'started_at': session.get('started_at', ''),
                'updated_at': session.get('updated_at', ''),
                'total_messages': total_messages,
                'messages': messages,  # Parents can see all messages
                'summary': {
                    'questions_asked': total_messages,
                    'session_duration': session.get('session_duration', 'N/A'),
                    'topics_discussed': list(set([msg.get('question', '')[:30] + '...' for msg in messages[:5] if msg.get('question')]))
                }
            })
            
        return jsonify({
            'status': 'success',
            'child_name': child_name,
            'sessions': formatted_sessions,
            'total_sessions': len(formatted_sessions)
        })
        
    except Exception as e:
        logger.error("[parent-chat-history] ERROR: %s", e, exc_info=True)
        return jsonify({"status": "error", "message": str(e)}), 500


# ─────────────────────────────────────────────────────────────
# GET /api/parent/class-leaderboard
# ─────────────────────────────────────────────────────────────
@parent_bp.route('/api/parent/class-leaderboard', methods=['GET'])
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