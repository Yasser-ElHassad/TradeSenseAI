from flask import Blueprint
from flask_restful import Api
from .auth import Register, Login, Logout, UserProfile, RefreshToken, Me

# Create blueprint
auth_bp = Blueprint('auth', __name__)

# Create API instance
auth_api = Api(auth_bp)

# Register routes
auth_api.add_resource(Register, '/register')
auth_api.add_resource(Login, '/login')
auth_api.add_resource(Logout, '/logout')
auth_api.add_resource(UserProfile, '/profile')  # Alternative endpoint for /me
auth_api.add_resource(Me, '/me')  # GET /api/auth/me
auth_api.add_resource(RefreshToken, '/refresh')

