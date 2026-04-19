from flask import Blueprint, request, jsonify, g
from datetime import datetime, timezone, timedelta
import jwt
from config import SECRET
from extensions import users, bcrypt
from functools import wraps

auth_bp = Blueprint("auth", __name__)

JWT_EXPIRY_HOURS = 24


def _make_token(payload: dict) -> str:
    payload["exp"] = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS)
    return jwt.encode(payload, SECRET, algorithm="HS256")

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}

    required = ["fullName", "email", "phone", "role", "password"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"msg": f"Missing fields: {', '.join(missing)}"}), 400

    email = data.get("email", "").lower()
    if users.find_one({"email": email}):
        return jsonify({"msg": "Email already exists"}), 400

    user = {
        "name":       data["fullName"],
        "email":      email,
        "phone":      data["phone"],
        "school":     data.get("school"),
        "role":       data["role"],
        "password":   bcrypt.generate_password_hash(data["password"]).decode(),
        "status":     "pending",
        "created_at": datetime.now(timezone.utc)
    }

    # Add optional child info for parents
    if data["role"] == "parent":
        user["child_name"] = data.get("childName")
        user["roll_number"] = data.get("rollNumber")

    users.insert_one(user)
    return jsonify({"msg": "Registered successfully"})


@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get("email", "").lower()
    user = users.find_one({"email": email})

    if not user or not bcrypt.check_password_hash(user["password"], data.get("password", "")):
        return jsonify({"msg": "Invalid credentials"}), 401

    if user["role"] != "admin" and user["status"] != "approved":
        return jsonify({"msg": "Waiting for approval"}), 403

    token = _make_token({"id": str(user["_id"]), "role": user["role"]})

    return jsonify({
        "token": token,
        "role": user["role"],
        "user_id": str(user["_id"])
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
            data = jwt.decode(token, SECRET, algorithms=['HS256'])
            g.user = data  # Store user info in flask.g
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
            g.user = data
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
            g.user = data
            if data.get('role') not in ['admin', 'teacher']:   # ← admin bhi teacher pages dekh sake
                return jsonify({'status': 'error', 'message': 'Teacher access only!'}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'status': 'error', 'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'status': 'error', 'message': 'Token is invalid!'}), 401

        return f(*args, **kwargs)
    return decorated