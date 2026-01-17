from flask_restful import Resource
from flask import request, g
from extensions import db
from models import Challenge
from utils.auth_utils import token_required

# Plan configurations
PLAN_CONFIG = {
    'Starter': {
        'starting_balance': 5000.0,
        'max_daily_loss_percent': 5.0,
        'max_total_loss_percent': 10.0,
        'profit_target_percent': 10.0
    },
    'Pro': {
        'starting_balance': 10000.0,
        'max_daily_loss_percent': 5.0,
        'max_total_loss_percent': 10.0,
        'profit_target_percent': 10.0
    },
    'Elite': {
        'starting_balance': 25000.0,
        'max_daily_loss_percent': 5.0,
        'max_total_loss_percent': 10.0,
        'profit_target_percent': 10.0
    }
}

class ChallengeList(Resource):
    """Get all challenges for current user"""
    
    @token_required
    def get(self):
        """Get all challenges for the authenticated user"""
        user = g.current_user
        challenges = Challenge.query.filter_by(user_id=user.id).order_by(Challenge.created_at.desc()).all()
        return {
            'challenges': [c.to_dict() for c in challenges]
        }, 200
    
    @token_required
    def post(self):
        """Create a new challenge"""
        user = g.current_user
        data = request.get_json()
        
        if not data:
            return {'error': 'No data provided'}, 400
        
        plan_type = data.get('plan_type')
        if not plan_type or plan_type not in PLAN_CONFIG:
            return {'error': 'Invalid plan type. Must be Starter, Pro, or Elite'}, 400
        
        # Check if user already has an active challenge
        active_challenge = Challenge.query.filter_by(user_id=user.id, status='active').first()
        if active_challenge:
            return {'error': 'You already have an active challenge', 'challenge': active_challenge.to_dict()}, 409
        
        # Create new challenge
        config = PLAN_CONFIG[plan_type]
        challenge = Challenge(
            user_id=user.id,
            plan_type=plan_type,
            starting_balance=config['starting_balance'],
            current_balance=config['starting_balance'],
            status='active',
            max_daily_loss_percent=config['max_daily_loss_percent'],
            max_total_loss_percent=config['max_total_loss_percent'],
            profit_target_percent=config['profit_target_percent']
        )
        
        try:
            db.session.add(challenge)
            db.session.commit()
            return {
                'message': 'Challenge created successfully',
                'challenge': challenge.to_dict()
            }, 201
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to create challenge', 'message': str(e)}, 500

class ChallengeDetail(Resource):
    """Get, update, or delete a specific challenge"""
    
    @token_required
    def get(self, challenge_id):
        """Get a specific challenge"""
        user = g.current_user
        challenge = Challenge.query.filter_by(id=challenge_id, user_id=user.id).first()
        
        if not challenge:
            return {'error': 'Challenge not found'}, 404
        
        return {'challenge': challenge.to_dict()}, 200
    
    @token_required
    def put(self, challenge_id):
        """Update a challenge (admin only or specific fields)"""
        user = g.current_user
        challenge = Challenge.query.filter_by(id=challenge_id, user_id=user.id).first()
        
        if not challenge:
            return {'error': 'Challenge not found'}, 404
        
        data = request.get_json()
        if not data:
            return {'error': 'No data provided'}, 400
        
        # Only allow updating certain fields
        if 'status' in data and data['status'] in ['active', 'passed', 'failed']:
            challenge.status = data['status']
        
        try:
            db.session.commit()
            return {'message': 'Challenge updated', 'challenge': challenge.to_dict()}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to update challenge', 'message': str(e)}, 500
    
    @token_required
    def delete(self, challenge_id):
        """Delete a challenge"""
        user = g.current_user
        challenge = Challenge.query.filter_by(id=challenge_id, user_id=user.id).first()
        
        if not challenge:
            return {'error': 'Challenge not found'}, 404
        
        try:
            db.session.delete(challenge)
            db.session.commit()
            return {'message': 'Challenge deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to delete challenge', 'message': str(e)}, 500

class CreateChallenge(Resource):
    """Create a new challenge endpoint (alternative)"""
    
    @token_required
    def post(self):
        """Create a new challenge"""
        user = g.current_user
        data = request.get_json()
        
        if not data:
            return {'error': 'No data provided'}, 400
        
        plan_type = data.get('plan_type')
        if not plan_type or plan_type not in PLAN_CONFIG:
            return {'error': 'Invalid plan type. Must be Starter, Pro, or Elite'}, 400
        
        # Check if user already has an active challenge
        active_challenge = Challenge.query.filter_by(user_id=user.id, status='active').first()
        if active_challenge:
            return {'error': 'You already have an active challenge', 'challenge': active_challenge.to_dict()}, 409
        
        # Create new challenge
        config = PLAN_CONFIG[plan_type]
        challenge = Challenge(
            user_id=user.id,
            plan_type=plan_type,
            starting_balance=config['starting_balance'],
            current_balance=config['starting_balance'],
            status='active',
            max_daily_loss_percent=config['max_daily_loss_percent'],
            max_total_loss_percent=config['max_total_loss_percent'],
            profit_target_percent=config['profit_target_percent']
        )
        
        try:
            db.session.add(challenge)
            db.session.commit()
            return {
                'message': 'Challenge created successfully',
                'challenge': challenge.to_dict()
            }, 201
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to create challenge', 'message': str(e)}, 500

class StartChallenge(Resource):
    """Start a challenge endpoint"""
    
    @token_required
    def post(self, challenge_id):
        """Start/activate a challenge"""
        user = g.current_user
        challenge = Challenge.query.filter_by(id=challenge_id, user_id=user.id).first()
        
        if not challenge:
            return {'error': 'Challenge not found'}, 404
        
        if challenge.status == 'active':
            return {'message': 'Challenge is already active', 'challenge': challenge.to_dict()}, 200
        
        if challenge.status in ['passed', 'failed']:
            return {'error': 'Cannot restart a completed challenge'}, 400
        
        challenge.status = 'active'
        
        try:
            db.session.commit()
            return {
                'message': 'Challenge started successfully',
                'challenge': challenge.to_dict()
            }, 200
        except Exception as e:
            db.session.rollback()
            return {'error': 'Failed to start challenge', 'message': str(e)}, 500

