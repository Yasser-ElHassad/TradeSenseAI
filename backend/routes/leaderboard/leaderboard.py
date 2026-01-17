from flask_restful import Resource
from flask import request
from sqlalchemy import func, case, extract
from datetime import datetime
from extensions import db
from models import Challenge, User


def _calculate_profit_percent(starting_balance, current_balance):
    """Calculate profit percentage."""
    if starting_balance and starting_balance > 0:
        return ((current_balance - starting_balance) / starting_balance) * 100
    return 0.0


class LeaderboardList(Resource):
    """Get leaderboard endpoint"""
    def get(self):
        return {'message': 'Leaderboard list endpoint - to be implemented'}, 200


class LeaderboardTop(Resource):
    """Get top performers endpoint"""
    def get(self):
        query_params = request.args
        limit = query_params.get('limit', 10, type=int)
        return {'message': f'Top performers endpoint - to be implemented (limit: {limit})'}, 200


class UserRanking(Resource):
    """Get user ranking endpoint"""
    def get(self, user_id):
        return {'message': f'User ranking endpoint - to be implemented for user {user_id}'}, 200


class MonthlyLeaderboard(Resource):
    """
    GET /api/leaderboard/monthly
    
    Returns top 10 performers for the current month.
    - Queries challenges with status "passed" or "active"
    - Calculates profit percentage
    - Joins with users table to get usernames
    - Orders by profit_percent DESC
    - Filters by current month only
    """
    def get(self):
        # Get current month and year
        now = datetime.utcnow()
        current_month = now.month
        current_year = now.year

        # Optional query params
        limit = request.args.get('limit', 10, type=int)
        
        # SQLAlchemy ORM query with join, filter, and calculated profit_percent
        # Calculate profit_percent as a computed column
        profit_percent_expr = case(
            (Challenge.starting_balance > 0,
             ((Challenge.current_balance - Challenge.starting_balance) / Challenge.starting_balance) * 100),
            else_=0.0
        ).label('profit_percent')

        # Query challenges joined with users, filtered by current month and status
        query = db.session.query(
            User.id.label('user_id'),
            User.username,
            Challenge.id.label('challenge_id'),
            Challenge.starting_balance,
            Challenge.current_balance,
            Challenge.status,
            Challenge.plan_type,
            Challenge.created_at,
            profit_percent_expr
        ).join(
            User, Challenge.user_id == User.id
        ).filter(
            Challenge.status.in_(['passed', 'active']),
            extract('month', Challenge.created_at) == current_month,
            extract('year', Challenge.created_at) == current_year
        ).order_by(
            profit_percent_expr.desc()
        ).limit(limit)

        results = query.all()

        # Build response with rank
        leaderboard = []
        for rank, row in enumerate(results, start=1):
            leaderboard.append({
                'rank': rank,
                'user_id': row.user_id,
                'username': row.username,
                'challenge_id': row.challenge_id,
                'profit_percent': round(row.profit_percent, 2),
                'starting_balance': round(row.starting_balance, 2),
                'current_balance': round(row.current_balance, 2),
                'status': row.status,
                'plan_type': row.plan_type,
            })

        return {
            'period': {
                'month': current_month,
                'year': current_year,
                'month_name': now.strftime('%B'),
            },
            'leaderboard': leaderboard,
            'count': len(leaderboard),
        }, 200

