"""
Quick database initialization
Run this if you get registration errors
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models import User, Challenge, Trade, Payment, Portfolio
from werkzeug.security import generate_password_hash

def init_database():
    """Initialize database with tables and optional sample data"""
    app = create_app()
    
    with app.app_context():
        print("🔧 Initializing database...")
        
        # Drop all tables (careful - this deletes all data!)
        print("⚠️  Dropping existing tables...")
        db.drop_all()
        
        # Create all tables
        print("📋 Creating tables...")
        db.create_all()
        
        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"✅ Created tables: {', '.join(tables)}")
        
        # Add sample admin user
        print("\n👤 Creating sample users...")
        
        admin = User(
            username='admin',
            email='admin@tradesense.ai',
            password_hash=generate_password_hash('admin123'),
            is_admin=True
        )
        db.session.add(admin)
        
        test_user = User(
            username='testuser',
            email='test@test.com',
            password_hash=generate_password_hash('test123'),
            is_admin=False
        )
        db.session.add(test_user)
        
        db.session.commit()
        print("✅ Sample users created")
        
        print("\n" + "="*60)
        print("✅ Database initialized successfully!")
        print("="*60)
        print("\n🔐 Sample login credentials:")
        print("   Username: admin | Password: admin123 (Admin)")
        print("   Username: testuser | Password: test123 (User)")
        print("\n💡 Now you can register new users or login with these credentials")
        print("="*60)

if __name__ == '__main__':
    init_database()
