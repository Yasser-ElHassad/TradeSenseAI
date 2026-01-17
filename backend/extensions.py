"""
Flask extensions
Separated to avoid circular imports
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
