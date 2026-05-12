from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import (
    create_access_token, create_refresh_token, get_jwt_identity,
    get_jwt, jwt_required, set_access_cookies,
    set_refresh_cookies, unset_jwt_cookies
)
from datetime import datetime, timedelta
import bcrypt

from ..extensions import db, jwt, redis_client
from ..models.user import User
from ..schemas.user_schema import UserSchema, LoginSchema
from ..utils.errors import error_response, validation_error

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

user_schema = UserSchema()
login_schema = LoginSchema()

# --- JWT Helpers ---

@jwt.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
    jti = jwt_payload["jti"]
    token_in_redis = redis_client.get(f"blacklist:{jti}")
    return token_in_redis is not None

# --- Routes ---

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    errors = user_schema.validate(data)
    if errors:
        return validation_error(errors)

    if User.query.filter_by(email=data['email']).first():
        return error_response("USER_ALREADY_EXISTS", "A user with this email already exists", 409)

    hashed_pw = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')
    
    user = User(
        email=data['email'],
        password_hash=hashed_pw,
        full_name=data['full_name'],
        role='customer' # Default role
    )
    
    db.session.add(user)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "data": {"user": user.to_dict()}
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    # Simple rate limit check (5 attempts per minute)
    ip = request.remote_addr
    rate_key = f"rate_limit:login:{ip}"
    attempts = redis_client.get(rate_key)
    
    if attempts and int(attempts) >= 5:
        return error_response("TOO_MANY_REQUESTS", "Too many login attempts. Try again later.", 429)
    
    redis_client.set(rate_key, int(attempts or 0) + 1, ex=60)

    data = request.get_json()
    errors = login_schema.validate(data)
    if errors:
        return validation_error(errors)

    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        return error_response("INVALID_CREDENTIALS", "Invalid email or password", 401)

    if not user.is_active:
        return error_response("ACCOUNT_DISABLED", "Your account has been disabled", 403)

    # Create tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    response = make_response(jsonify({
        "success": True,
        "message": "Login successful",
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict()
        }
    }))

    # Set httpOnly cookies
    set_access_cookies(response, access_token)
    set_refresh_cookies(response, refresh_token)
    
    return response

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    
    response = make_response(jsonify({
        "success": True,
        "data": {"access_token": access_token}
    }))
    
    set_access_cookies(response, access_token)
    return response

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    # Get remaining TTL of the token
    exp = get_jwt()["exp"]
    now = datetime.timestamp(datetime.utcnow())
    ttl = int(exp - now)
    
    if ttl > 0:
        redis_client.set(f"blacklist:{jti}", "1", ex=ttl)

    response = make_response(jsonify({
        "success": True,
        "message": "Successfully logged out"
    }))
    
    unset_jwt_cookies(response)
    return response

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user:
        return error_response("USER_NOT_FOUND", "User not found", 404)

    return jsonify({
        "success": True,
        "data": {"user": user.to_dict()}
    })
