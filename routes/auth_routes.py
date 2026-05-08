from flask import Blueprint, request, jsonify, g
from datetime import datetime, timezone, timedelta
import jwt
from config import SECRET
from extensions import users, bcrypt
from functools import wraps
import secrets
import logging

logger = logging.getLogger(__name__)
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
        "token":   token,
        "role":    user["role"],
        "user_id": str(user["_id"]),
        "name":    user.get("name", "")
    })


@auth_bp.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    """Handle password reset requests"""
    try:
        data = request.get_json() or {}
        email = data.get("email", "").lower().strip()
        
        if not email:
            return jsonify({"msg": "Email is required"}), 400
            
        user = users.find_one({"email": email})
        if not user:
            # Don't reveal if email exists or not for security
            return jsonify({"msg": "If the email exists, a reset link has been sent"}), 200
            
        # Generate reset token (valid for 1 hour)
        reset_token = secrets.token_urlsafe(32)
        reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        
        # Store reset token in user document
        users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "reset_token": reset_token,
                "reset_expires": reset_expires
            }}
        )
        
        # TODO: Send email with reset link
        # For now, return the reset link in the response for dev/testing.
        # In production, replace this with an email service (e.g. SendGrid, SES).
        frontend_url = request.headers.get('Origin', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        logger.info(f"Password reset link for {email}: {reset_link}")
        
        return jsonify({
            "msg": "If the email exists, a reset link has been sent",
            "reset_link": reset_link   # Remove this line once email service is integrated
        }), 200
        
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        return jsonify({"msg": "An error occurred"}), 500


@auth_bp.route('/api/reset-password', methods=['POST'])
def reset_password():
    """Handle password reset with token"""
    try:
        data = request.get_json() or {}
        token = data.get("token", "").strip()
        new_password = data.get("password", "")
        
        if not token or not new_password:
            return jsonify({"msg": "Token and new password are required"}), 400
            
        # Find user with valid reset token
        user = users.find_one({
            "reset_token": token,
            "reset_expires": {"$gt": datetime.now(timezone.utc)}
        })
        
        if not user:
            return jsonify({"msg": "Invalid or expired reset token"}), 400
            
        # Update password and clear reset token
        hashed_password = bcrypt.generate_password_hash(new_password).decode()
        users.update_one(
            {"_id": user["_id"]},
            {"$set": {"password": hashed_password},
             "$unset": {"reset_token": "", "reset_expires": ""}}
        )
        
        return jsonify({"msg": "Password reset successfully"}), 200
        
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        return jsonify({"msg": "An error occurred"}), 500


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