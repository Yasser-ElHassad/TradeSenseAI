from flask_restful import Resource
from flask import request, g
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User
from utils.auth_utils import generate_token, token_required

class Register(Resource):
    """User registration endpoint"""
    
    def post(self):
        """Register a new user"""
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return {'error': 'No data provided'}, 400
        
        required_fields = ['username', 'email', 'password']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return {
                'error': 'Missing required fields',
                'missing': missing_fields
            }, 400
        
        username = data.get('username').strip()
        email = data.get('email').strip().lower()
        password = data.get('password')
        
        # Validate username
        if len(username) < 3:
            return {'error': 'Username must be at least 3 characters long'}, 400
        
        # Validate email format (basic validation)
        if '@' not in email or '.' not in email.split('@')[1]:
            return {'error': 'Invalid email format'}, 400
        
        # Validate password
        if len(password) < 6:
            return {'error': 'Password must be at least 6 characters long'}, 400
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return {'error': 'Username already exists'}, 409
        
        if User.query.filter_by(email=email).first():
            return {'error': 'Email already registered'}, 409
        
        # Create new user
        try:
            password_hash = generate_password_hash(password)
            user = User(
                username=username,
                email=email,
                password_hash=password_hash
            )
            
            db.session.add(user)
            db.session.commit()
            
            # Generate JWT token
            token = generate_token(user.id, user.username, user.email)
            
            return {
                'message': 'User registered successfully',
                'token': token,
                'user': user.to_dict()
            }, 201
        
        except Exception as e:
            db.session.rollback()
            return {
                'error': 'Registration failed',
                'message': str(e)
            }, 500


class Login(Resource):
    """User login endpoint"""
    
    def post(self):
        """Authenticate user and return JWT token"""
        data = request.get_json()
        
        if not data:
            return {'error': 'No data provided'}, 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return {
                'error': 'Missing required fields',
                'message': 'Email and password are required'
            }, 400
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return {
                'error': 'Invalid credentials',
                'message': 'Email or password is incorrect'
            }, 401
        
        # Verify password
        if not check_password_hash(user.password_hash, password):
            return {
                'error': 'Invalid credentials',
                'message': 'Email or password is incorrect'
            }, 401
        
        # Generate JWT token
        token = generate_token(user.id, user.username, user.email)
        
        return {
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }, 200


class UserProfile(Resource):
    """Get current user profile endpoint"""
    
    @token_required
    def get(self):
        """Get current authenticated user's profile"""
        user = g.current_user
        return {
            'user': user.to_dict()
        }, 200
    
    @token_required
    def put(self):
        """Update current user's profile"""
        user = g.current_user
        data = request.get_json()
        
        if not data:
            return {'error': 'No data provided'}, 400
        
        # Update allowed fields
        if 'username' in data:
            new_username = data['username'].strip()
            if len(new_username) < 3:
                return {'error': 'Username must be at least 3 characters long'}, 400
            
            # Check if username is already taken
            existing_user = User.query.filter_by(username=new_username).first()
            if existing_user and existing_user.id != user.id:
                return {'error': 'Username already exists'}, 409
            
            user.username = new_username
        
        if 'email' in data:
            new_email = data['email'].strip().lower()
            if '@' not in new_email:
                return {'error': 'Invalid email format'}, 400
            
            # Check if email is already taken
            existing_user = User.query.filter_by(email=new_email).first()
            if existing_user and existing_user.id != user.id:
                return {'error': 'Email already registered'}, 409
            
            user.email = new_email
        
        try:
            db.session.commit()
            return {
                'message': 'Profile updated successfully',
                'user': user.to_dict()
            }, 200
        except Exception as e:
            db.session.rollback()
            return {
                'error': 'Update failed',
                'message': str(e)
            }, 500


class Logout(Resource):
    """User logout endpoint"""
    
    @token_required
    def post(self):
        """Logout user (client-side token removal, server-side acknowledgment)"""
        # Since JWT tokens are stateless, logout is handled client-side
        # In a more advanced implementation, you might maintain a token blacklist
        return {
            'message': 'Logout successful',
            'note': 'Please remove the token from client storage'
        }, 200


class RefreshToken(Resource):
    """Refresh authentication token endpoint"""
    
    @token_required
    def post(self):
        """Generate a new token for the current user"""
        user = g.current_user
        
        # Generate new JWT token
        token = generate_token(user.id, user.username, user.email)
        
        return {
            'message': 'Token refreshed successfully',
            'token': token,
            'user': user.to_dict()
        }, 200


class Me(Resource):
    """Get current authenticated user info - alias for UserProfile.get"""
    
    @token_required
    def get(self):
        """Get current authenticated user's info"""
        user = g.current_user
        return {
            'user': user.to_dict()
        }, 200
