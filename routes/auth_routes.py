from flask import Blueprint, request, jsonify
from datetime import datetime
import jwt
from config import SECRET
from extensions import users, bcrypt
from functools import wraps

auth_bp = Blueprint("auth", __name__)

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.json

    if users.find_one({"email": data["email"]}):
        return jsonify({"msg": "Email already exists"}), 400

    user = {
        "name": data["fullName"],
        "email": data["email"],
        "phone": data["phone"],
        "school": data.get("school"),
        "role": data["role"],
        "password": bcrypt.generate_password_hash(data["password"]).decode(),
        "status": "pending",
        "created_at": datetime.utcnow()
    }

    users.insert_one(user)
    return jsonify({"msg": "Registered successfully"})


@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json

    if data["email"] == "admin@alexi.com" and data["password"] == "admin123":
        token = jwt.encode(
            {"id": "admin_fixed", "role": "admin"},
            SECRET,
            algorithm="HS256"
        )
        return jsonify({"token": token, "role": "admin", "user_id": "admin_fixed"})

    user = users.find_one({"email": data["email"]})

    if not user:
        return jsonify({"msg": "Invalid credentials"}), 401

    if not bcrypt.check_password_hash(user["password"], data["password"]):
        return jsonify({"msg": "Invalid credentials"}), 401

    if user["status"] != "approved":
        return jsonify({"msg": "Waiting for approval"}), 403

    token = jwt.encode(
        {"id": str(user["_id"]), "role": user["role"]},
        SECRET,
        algorithm="HS256"
    )

    return jsonify({
        "token": token, 
        "role": user["role"],
        "user_id": str(user["_id"]) # Ye line miss thi!
    })


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'status': 'error', 'message': 'Token is missing!'}), 401

        try:
            jwt.decode(token, SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'status': 'error', 'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'status': 'error', 'message': 'Token is invalid!'}), 401

        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'status': 'error', 'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, SECRET, algorithms=['HS256'])
            if data.get('role') != 'admin':        # ← Role check
                return jsonify({'status': 'error', 'message': 'Admin access only!'}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'status': 'error', 'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'status': 'error', 'message': 'Token is invalid!'}), 401

        return f(*args, **kwargs)
    return decorated


def teacher_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'status': 'error', 'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, SECRET, algorithms=['HS256'])
            if data.get('role') not in ['admin', 'teacher']:   # ← admin bhi teacher pages dekh sake
                return jsonify({'status': 'error', 'message': 'Teacher access only!'}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'status': 'error', 'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'status': 'error', 'message': 'Token is invalid!'}), 401

        return f(*args, **kwargs)
    return decorated