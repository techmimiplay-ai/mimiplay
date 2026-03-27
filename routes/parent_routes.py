# from flask import Blueprint, jsonify
# from bson import ObjectId
# from extensions import students, users

# @admin_bp.route('/api/parent/my-children/<parent_id>', methods=['GET'])
# def get_parent_children(parent_id):
#     try:
#         # 1. Parent ko dhoondo
#         parent = users.find_one({"_id": ObjectId(parent_id), "role": "parent"})
#         if not parent:
#             return jsonify({"msg": "Parent not found"}), 404

#         # 2. Parent ke pass jo bachhon ki IDs hain unka data nikalo
#         child_ids = parent.get("children_ids", [])
#         # Convert string IDs to ObjectIds if stored as strings
#         query_ids = [ObjectId(cid) for cid in child_ids]
        
#         my_students = list(students.find({"_id": {"$in": query_ids}}))

#         formatted = []
#         for s in my_students:
#             formatted.append({
#                 "id": str(s["_id"]),
#                 "name": s.get("name"),
#                 "class": s.get("class"),
#                 "roll_number": s.get("roll_number")
#             })

#         return jsonify(formatted)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# parent_bp = Blueprint('parent_bp', __name__)

# @parent_bp.route('/api/parent/my-children/<parent_id>', methods=['GET'])
# def get_parent_children(parent_id):
#     try:
#         from bson import ObjectId
#         # Seedha students collection mein dhundo jinka parent_id ye hai
#         # Kyuki aapke screenshot mein student document mein parent_id field hai
#         my_students = list(students.find({"parent_id": ObjectId(parent_id)}))

#         formatted = []
#         for s in my_students:
#             formatted.append({
#                 "id": str(s["_id"]),
#                 "name": s.get("name", "Unknown"),
#                 "class": s.get("class", "N/A"),
#                 "roll_number": s.get("roll_number", "N/A"),
#                 # Initial nikalne ke liye avatar logic frontend handle kar lega
#             })

#         print(f"Found {len(formatted)} children for parent {parent_id}")
#         return jsonify(formatted), 200
#     except Exception as e:
        # return jsonify({"error": str(e)}), 500

from flask import Blueprint, jsonify, request
from bson import ObjectId
from datetime import datetime
import os
from pymongo import MongoClient
from extensions import students, users
from routes.auth_routes import token_required

parent_bp = Blueprint('parent_bp', __name__)

# ── Existing route — rakho jaise hai ────────────────────────
@parent_bp.route('/api/parent/my-children/<parent_id>', methods=['GET'])
@token_required
def get_parent_children(parent_id):
    try:
        my_students = list(students.find({"parent_id": ObjectId(parent_id)}))
        formatted = []
        for s in my_students:
            formatted.append({
                "id":          str(s["_id"]),
                "name":        s.get("name",        "Unknown"),
                "class":       s.get("class",        "N/A"),
                "roll_number": s.get("roll_number",  "N/A"),
            })
        print(f"Found {len(formatted)} children for parent {parent_id}")
        return jsonify(formatted), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── NEW: Child data for ParentHome ───────────────────────────
@parent_bp.route('/api/parent/child-data', methods=['GET'])
@token_required
def get_child_data():
    try:
        parent_id = request.args.get('parent_id')
        if not parent_id:
            return jsonify({"status": "error", "message": "parent_id required"}), 400

        db = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017/"))["AlexiDB"]

        # Parent dhundo
        parent = db["users"].find_one({"_id": ObjectId(parent_id)})
        if not parent:
            return jsonify({"status": "error", "message": "Parent not found"}), 404

        child_name = parent.get("child_name", "")
        if not child_name:
            return jsonify({"status": "not_found", "message": "No child linked"})

        # Student dhundo
        student = db["students"].find_one(
            {"name": {"$regex": f"^{child_name}$", "$options": "i"}}
        )
        if not student:
            return jsonify({"status": "not_found", "message": "Child not found"})

        today = datetime.now().strftime("%Y-%m-%d")

        print(f"[child-data] Student _id: {student['_id']} | child_name: {child_name} | today: {today}")


        # ✅ student_id SE check karo — naam case mismatch problem nahi aayegi
        attendance = db["attendance"].find_one({
            "$or": [
                # 1. student_id ObjectId se match
                {"student_id": student["_id"], "date": today},
                # 2. student_id string se match (purani records)
                {"student_id": str(student["_id"]), "date": today},
                # 3. naam se match (case-insensitive)
                {"name": {"$regex": f"^{child_name}$", "$options": "i"}, "date": today},
                # 4. student_name field se match (kuch purani records mein)
                {"student_name": {"$regex": f"^{child_name}$", "$options": "i"}, "date": today},
            ]
        })

        print(f"[child-data] Attendance found: {attendance is not None}")
        if attendance:
            print(f"[child-data] Attendance record: {attendance}")
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
        print(f"[child-data] ERROR: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ── NEW: Child stars for ParentHome ─────────────────────────
@parent_bp.route('/api/parent/child-stars', methods=['GET'])
@token_required
def get_child_stars():
    try:
        student_id = request.args.get('student_id')
        if not student_id:
            return jsonify({"status": "error", "message": "student_id required"}), 400

        db = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017/"))["AlexiDB"]
        today = datetime.now().strftime("%Y-%m-%d")

        # Activity results fetch karo
        results = list(db["activity_results"].find(
            {"student_id": student_id}
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
        print(f"[child-stars] ERROR: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@parent_bp.route('/api/parent/check-attendance', methods=['GET'])
@token_required
def check_child_attendance():
    try:
        student_id = request.args.get('student_id')
        name       = request.args.get('name', '')
        today      = datetime.now().strftime("%Y-%m-%d")

        db = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017/"))["AlexiDB"]

        # ObjectId banana try karo
        try:
            oid = ObjectId(student_id)
        except Exception:
            oid = None

        # Har possible field se check karo
        query = {"date": today, "$or": [
            {"name":         {"$regex": f"^{name}$", "$options": "i"}},
            {"student_name": {"$regex": f"^{name}$", "$options": "i"}},
        ]}
        if oid:
            query["$or"].append({"student_id": oid})
            query["$or"].append({"student_id": str(oid)})

        attendance = db["attendance"].find_one(query)

        print(f"[check-attendance] name={name} | id={student_id} | present={attendance is not None}")

        return jsonify({
            "status":  "success",
            "present": attendance is not None,
        })

    except Exception as e:
        print(f"[check-attendance] ERROR: {e}")
        return jsonify({"status": "error", "present": False}), 500


@parent_bp.route('/api/parent/profile', methods=['GET'])
@token_required
def get_parent_profile():
    try:
        parent_id = request.args.get('parent_id')
        if not parent_id:
            return jsonify({"status": "error", "message": "parent_id required"}), 400

        db = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017/"))["AlexiDB"]
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
        parent_id = request.args.get('parent_id')
        if not parent_id:
            return jsonify({"status": "error", "message": "parent_id required"}), 400

        data = request.get_json() or {}
        db   = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017/"))["AlexiDB"]

        update_fields = {}
        if data.get("name"):       update_fields["name"]       = data["name"]
        if data.get("email"):      update_fields["email"]      = data["email"]
        if data.get("phone"):      update_fields["phone"]      = data["phone"]
        if data.get("occupation"): update_fields["occupation"] = data["occupation"]

        db["users"].update_one(
            {"_id": ObjectId(parent_id)},
            {"$set": update_fields}
        )

        return jsonify({"status": "success", "message": "Profile updated"})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500