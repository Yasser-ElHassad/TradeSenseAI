from flask import Blueprint
from flask_restful import Api
from .leaderboard import LeaderboardList, LeaderboardTop, UserRanking, MonthlyLeaderboard

# Create blueprint
leaderboard_bp = Blueprint('leaderboard', __name__)

# Create API instance
leaderboard_api = Api(leaderboard_bp)

# Register routes
leaderboard_api.add_resource(LeaderboardList, '')
leaderboard_api.add_resource(LeaderboardTop, '/top')
leaderboard_api.add_resource(MonthlyLeaderboard, '/monthly')
leaderboard_api.add_resource(UserRanking, '/user/<int:user_id>')

