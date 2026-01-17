from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    
    # Configure CORS - allow all origins for API routes in production
    # This is necessary because Vercel generates dynamic preview URLs
    CORS(app, 
         resources={r"/api/*": {"origins": "*"}},
         methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
         supports_credentials=True,
         expose_headers=["Content-Type", "Authorization"]
    )
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.challenges import challenges_bp
    from routes.trades import trades_bp
    from routes.payments import payments_bp
    from routes.leaderboard import leaderboard_bp
    from routes.market import market_bp
    from routes.admin import admin_bp
    
    # Legacy blueprints (kept for backward compatibility)
    from routes import market_data_bp, portfolio_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(challenges_bp, url_prefix='/api/challenges')
    app.register_blueprint(trades_bp, url_prefix='/api/trades')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(leaderboard_bp, url_prefix='/api/leaderboard')
    app.register_blueprint(market_bp, url_prefix='/api/market')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Legacy routes (deprecated, consider removing in future versions)
    app.register_blueprint(market_data_bp, url_prefix='/api/market-data')
    app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')
    
    # Root route - API information
    @app.route('/', methods=['GET'])
    def index():
        """Root endpoint with API information"""
        return jsonify({
            'name': 'TradeSense AI API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'health': '/api/health',
                'auth': '/api/auth/*',
                'challenges': '/api/challenges/*',
                'trades': '/api/trades/*',
                'leaderboard': '/api/leaderboard/*',
                'market': '/api/market/*',
                'payments': '/api/payments/*',
                'admin': '/api/admin/*'
            },
            'documentation': 'https://github.com/yourusername/tradeapp',
            'message': 'Welcome to TradeSense AI API. Use /api/health to check system status.'
        }), 200
    
    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        try:
            # Test database connection
            from sqlalchemy import text
            db.session.execute(text('SELECT 1'))
            return jsonify({
                'status': 'healthy',
                'database': 'connected',
                'message': 'TradeSense API is running'
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'database': 'disconnected',
                'error': str(e)
            }), 503
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors"""
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested resource was not found on this server',
            'status_code': 404
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors"""
        db.session.rollback()
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An internal server error occurred',
            'status_code': 500
        }), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        """Handle 400 errors"""
        return jsonify({
            'error': 'Bad Request',
            'message': str(error.description) if hasattr(error, 'description') else 'Invalid request',
            'status_code': 400
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        """Handle 401 errors"""
        return jsonify({
            'error': 'Unauthorized',
            'message': 'Authentication required',
            'status_code': 401
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        """Handle 403 errors"""
        return jsonify({
            'error': 'Forbidden',
            'message': 'You do not have permission to access this resource',
            'status_code': 403
        }), 403
    
    # Import models to register them with SQLAlchemy
    from models import User, Challenge, Trade, Payment, Portfolio
    
    # Initialize database tables (deferred to first request in production)
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully")
        except Exception as e:
            print(f"Warning: Could not create database tables: {str(e)}")
    
    return app


def init_db(app):
    """
    Initialize the database by creating all tables.
    This function can be called to reset or initialize the database.
    """
    with app.app_context():
        try:
            db.create_all()
            print("Database initialized successfully")
        except Exception as e:
            print(f"Error initializing database: {str(e)}")
            raise


# Create app instance for gunicorn
# This must be at module level for gunicorn to find it
try:
    app = create_app()
except Exception as e:
    import sys
    print(f"Failed to create app: {e}", file=sys.stderr)
    raise

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
