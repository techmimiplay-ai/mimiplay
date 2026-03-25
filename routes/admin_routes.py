from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime
# from extensions import users, bcrypt
from extensions import users, attendance_collection, bcrypt, students
# from routes.auth_routes import token_required
from routes.auth_routes import token_required, admin_required

admin_bp = Blueprint("admin", __name__)

# ============================
# ADMIN DASHBOARD STATS
# ============================
@admin_bp.route('/api/admin/dashboard-stats', methods=['GET'])
# @token_required
@admin_required
def dashboard_stats():
    try:
        total_teachers = users.count_documents({"role": "teacher"})
        total_parents = users.count_documents({"role": "parent"})
        total_students = students.count_documents({})

        pending_approvals = users.count_documents({"status": "pending"})

        active_today = attendance_collection.count_documents({
            "date": datetime.now().strftime("%Y-%m-%d")
        })

        return jsonify({
            "totalTeachers": total_teachers,
            "totalParents": total_parents,
            "totalStudents": total_students,
            "pendingApprovals": pending_approvals,
            "activeToday": active_today,
            "systemHealth": "Excellent"
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
            "date": u.get("created_at")
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

    if users.find_one({"email": data["email"]}):
        return jsonify({"msg": "Email exists"}), 400

    teacher = {
        "name": data["name"],
        "email": data["email"],
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
        "email": data.get("email"),
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
        "email": data.get("email"),
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
# @token_required
@admin_required
def add_student():
    data = request.json

    parent = users.find_one({
        "name": data.get("parentName"),
        "role": "parent"
    })

    student = {
        "name": data["name"],
        "class": data["class"],
        "parent_id": parent["_id"] if parent else None,
        "parent_name": data.get("parentName"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "roll_number": data.get("rollNumber"),
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
            "created_at": s.get("created_at")
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
        "email": data.get("email"),
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
# @token_required
@admin_required
def delete_student(id):
    students.delete_one({"_id": ObjectId(id)})
    return jsonify({"msg": "Student deleted successfully"})