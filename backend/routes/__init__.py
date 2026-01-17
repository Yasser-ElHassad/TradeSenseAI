# Legacy routes module - kept for backward compatibility
from flask import Blueprint
from flask_restful import Api
from .market_data import MarketData, SymbolSearch
from .portfolio import PortfolioList, PortfolioDetail

# Create blueprints for legacy routes
market_data_bp = Blueprint('market_data', __name__)
portfolio_bp = Blueprint('portfolio', __name__)

# Create API instances for each blueprint
market_data_api = Api(market_data_bp)
portfolio_api = Api(portfolio_bp)

# Register routes
market_data_api.add_resource(MarketData, '/<string:symbol>')
market_data_api.add_resource(SymbolSearch, '/search/<string:query>')

portfolio_api.add_resource(PortfolioList, '')
portfolio_api.add_resource(PortfolioDetail, '/<string:symbol>')

