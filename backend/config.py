import os
import secrets

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Database URL - fix for PostgreSQL (Render uses postgresql:// prefix)
    database_url = os.environ.get('DATABASE_URL') or 'sqlite:///tradesense.db'
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = database_url
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    
    # JWT Secret Key - in production, set this as an environment variable
    # Using a fixed dev key to prevent token invalidation on server restart
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-jwt-secret-key-change-in-production-123456'
    
    # CORS Origins
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000,http://localhost:3001').split(',')
