from flask import Blueprint
from flask_restful import Api
from .challenges import ChallengeList, ChallengeDetail, CreateChallenge, StartChallenge

# Create blueprint
challenges_bp = Blueprint('challenges', __name__)

# Create API instance
challenges_api = Api(challenges_bp)

# Register routes
challenges_api.add_resource(ChallengeList, '')
challenges_api.add_resource(CreateChallenge, '/create')
challenges_api.add_resource(ChallengeDetail, '/<int:challenge_id>')
challenges_api.add_resource(StartChallenge, '/<int:challenge_id>/start')

