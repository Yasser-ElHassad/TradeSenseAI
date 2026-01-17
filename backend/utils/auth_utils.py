import jwt
import secrets
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app, g
from extensions import db
from models import User

# Generate a secret key using secrets module (or use from config)
def get_jwt_secret():
    """Get JWT secret key from config or generate one"""
    from config import Config
    # In production, this should be set as an environment variable
    try:
        # Try to get from Flask app config first (when in app context)
        secret = current_app.config.get('JWT_SECRET_KEY')
        if secret:
            return secret
    except RuntimeError:
        # Not in app context, use Config class directly
        pass
    
    # Use Config class JWT_SECRET_KEY (which uses secrets module to generate if needed)
    return Config.JWT_SECRET_KEY

def generate_token(user_id, username, email):
    """
    Generate a JWT token for a user
    
    Args:
        user_id: User's database ID
        username: User's username
        email: User's email
    
    Returns:
        str: JWT token
    """
    payload = {
        'user_id': user_id,
        'username': username,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7),  # Token expires in 7 days
        'iat': datetime.utcnow()  # Issued at
    }
    
    # PyJWT 2.0+ returns a string, not bytes
    token = jwt.encode(payload, get_jwt_secret(), algorithm='HS256')
    # Ensure it's a string (for compatibility with older versions)
    if isinstance(token, bytes):
        return token.decode('utf-8')
    return token

def verify_token(token):
    """
    Verify a JWT token and return the payload
    
    Args:
        token: JWT token string
    
    Returns:
        dict: Token payload if valid, None if invalid
    """
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """
    Decorator for protecting routes with JWT authentication
    
    Usage:
        @token_required
        def my_protected_route():
            # Access current_user from g object
            user = g.current_user
            ...
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                # Format: "Bearer <token>"
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({
                    'error': 'Invalid token format',
                    'message': 'Token must be in format: Bearer <token>'
                }), 401
        
        if not token:
            return jsonify({
                'error': 'Token is missing',
                'message': 'Authorization token is required'
            }), 401
        
        # Verify token
        payload = verify_token(token)
        if not payload:
            return jsonify({
                'error': 'Token is invalid or expired',
                'message': 'Please login again'
            }), 401
        
        # Get user from database
        user = User.query.get(payload.get('user_id'))
        if not user:
            return jsonify({
                'error': 'User not found',
                'message': 'Token is invalid'
            }), 401
        
        # Store user in Flask's g object for access in the route
        g.current_user = user
        
        return f(*args, **kwargs)
    
    return decorated

