from flask import Blueprint
from flask_restful import Api
from .trades import TradeList, TradeDetail, ExecuteTrade, TradeHistory, ChallengeDetails

# Create blueprint for new trades routes
trades_bp = Blueprint('trades_new', __name__)

# Create API instance
trades_api = Api(trades_bp)

# Register routes
trades_api.add_resource(TradeList, '')
trades_api.add_resource(ExecuteTrade, '/execute')
trades_api.add_resource(TradeDetail, '/<int:trade_id>')
trades_api.add_resource(TradeHistory, '/history/<int:challenge_id>')
trades_api.add_resource(ChallengeDetails, '/challenges/<int:challenge_id>')

