from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps
from models import db, User, Challenge

admin_bp = Blueprint('admin', __name__)


def admin_required(fn):
    """Decorator to restrict access to admin users only"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_admin:
            return jsonify({'error': 'Admin access required'}), 403
        
        return fn(*args, **kwargs)
    return wrapper


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users with their challenge information"""
    try:
        # Get query parameters for filtering
        search = request.args.get('search', '').strip()
        status_filter = request.args.get('status', '').strip()
        
        # Base query
        users_query = User.query
        
        # Apply search filter
        if search:
            users_query = users_query.filter(
                db.or_(
                    User.username.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%')
                )
            )
        
        users = users_query.all()
        
        result = []
        for user in users:
            # Get user's challenges
            challenges = Challenge.query.filter_by(user_id=user.id).order_by(Challenge.created_at.desc()).all()
            
            # Apply status filter if provided
            if status_filter:
                challenges = [c for c in challenges if c.status == status_filter]
            
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_admin,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'challenges': [{
                    'id': c.id,
                    'plan_type': c.plan_type,
                    'status': c.status,
                    'initial_balance': c.starting_balance,
                    'current_balance': c.current_balance,
                    'profit_target': c.profit_target_percent,
                    'max_loss_limit': c.max_total_loss_percent,
                    'daily_loss_limit': c.max_daily_loss_percent,
                    'profit_percent': ((c.current_balance - c.starting_balance) / c.starting_balance * 100) if c.starting_balance else 0,
                    'created_at': c.created_at.isoformat() if c.created_at else None,
                    'updated_at': c.ended_at.isoformat() if c.ended_at else None,
                } for c in challenges]
            }
            
            # Only include users with challenges if status filter is applied
            if status_filter and not user_data['challenges']:
                continue
                
            result.append(user_data)
        
        return jsonify({
            'success': True,
            'users': result,
            'total': len(result)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/challenges', methods=['GET'])
@admin_required
def get_all_challenges():
    """Get all challenges with user information"""
    try:
        search = request.args.get('search', '').strip()
        status_filter = request.args.get('status', '').strip()
        plan_filter = request.args.get('plan', '').strip()
        
        # Build query with joins
        query = db.session.query(Challenge, User).join(User, Challenge.user_id == User.id)
        
        # Apply filters
        if search:
            query = query.filter(
                db.or_(
                    User.username.ilike(f'%{search}%'),
                    User.email.ilike(f'%{search}%')
                )
            )
        
        if status_filter:
            query = query.filter(Challenge.status == status_filter)
            
        if plan_filter:
            query = query.filter(Challenge.plan_type == plan_filter)
        
        # Order by most recent
        query = query.order_by(Challenge.created_at.desc())
        
        results = query.all()
        
        challenges_data = []
        for challenge, user in results:
            challenges_data.append({
                'id': challenge.id,
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'plan_type': challenge.plan_type,
                'status': challenge.status,
                'initial_balance': challenge.starting_balance,
                'current_balance': challenge.current_balance,
                'profit_target': challenge.profit_target_percent,
                'max_loss_limit': challenge.max_total_loss_percent,
                'daily_loss_limit': challenge.max_daily_loss_percent,
                'profit_percent': ((challenge.current_balance - challenge.starting_balance) / challenge.starting_balance * 100) if challenge.starting_balance else 0,
                'created_at': challenge.created_at.isoformat() if challenge.created_at else None,
                'updated_at': challenge.ended_at.isoformat() if challenge.ended_at else None,
            })
        
        return jsonify({
            'success': True,
            'challenges': challenges_data,
            'total': len(challenges_data)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/challenges/<int:challenge_id>/update-status', methods=['POST'])
@admin_required
def update_challenge_status(challenge_id):
    """Update challenge status (mark as passed or failed)"""
    try:
        data = request.get_json()
        
        if not data or 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
        
        new_status = data['status'].lower()
        
        if new_status not in ['active', 'passed', 'failed']:
            return jsonify({'error': 'Invalid status. Must be: active, passed, or failed'}), 400
        
        challenge = Challenge.query.get(challenge_id)
        
        if not challenge:
            return jsonify({'error': 'Challenge not found'}), 404
        
        # Update status
        old_status = challenge.status
        challenge.status = new_status
        
        db.session.commit()
        
        # Get user info for response
        user = User.query.get(challenge.user_id)
        
        return jsonify({
            'success': True,
            'message': f'Challenge status updated from {old_status} to {new_status}',
            'challenge': {
                'id': challenge.id,
                'user_id': challenge.user_id,
                'username': user.username if user else 'Unknown',
                'status': challenge.status,
                'current_balance': challenge.current_balance,
                'updated_at': challenge.updated_at.isoformat() if challenge.updated_at else None,
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        total_users = User.query.count()
        total_challenges = Challenge.query.count()
        active_challenges = Challenge.query.filter_by(status='active').count()
        passed_challenges = Challenge.query.filter_by(status='passed').count()
        failed_challenges = Challenge.query.filter_by(status='failed').count()
        
        # Calculate total revenue (sum of initial balances as proxy)
        # In real app, this would be actual payment records
        challenges = Challenge.query.all()
        
        # Plan pricing
        plan_prices = {
            'starter': 99,
            'pro': 199,
            'elite': 499
        }
        
        total_revenue = sum(
            plan_prices.get(c.plan_type, 0) for c in challenges
        )
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'total_challenges': total_challenges,
                'active_challenges': active_challenges,
                'passed_challenges': passed_challenges,
                'failed_challenges': failed_challenges,
                'total_revenue': total_revenue,
                'pass_rate': (passed_challenges / total_challenges * 100) if total_challenges > 0 else 0,
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
