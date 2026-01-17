from flask import request
from flask_restful import Resource, abort
from extensions import db
from models import Trade, Portfolio

class TradesList(Resource):
    def get(self):
        """Get all trades - Legacy endpoint"""
        # Note: This uses the old Trade model structure
        # New trades should use /api/trades endpoint
        return {'message': 'Legacy trades endpoint - please use /api/trades for new implementation'}, 200
    
    def post(self):
        """Create a new trade - Legacy endpoint"""
        # Note: Legacy endpoint, new implementation should use challenge_id
        return {'message': 'Legacy trades endpoint - please use /api/trades/execute for new implementation'}, 200
        
        # Update portfolio
        portfolio_item = Portfolio.query.filter_by(symbol=trade.symbol).first()
        
        if trade.trade_type == 'buy':
            if portfolio_item:
                # Calculate new average price
                total_cost = (portfolio_item.quantity * portfolio_item.avg_price) + (trade.quantity * trade.price)
                total_quantity = portfolio_item.quantity + trade.quantity
                portfolio_item.avg_price = total_cost / total_quantity
                portfolio_item.quantity = total_quantity
            else:
                portfolio_item = Portfolio(
                    symbol=trade.symbol,
                    quantity=trade.quantity,
                    avg_price=trade.price
                )
                db.session.add(portfolio_item)
        else:  # sell
            if not portfolio_item or portfolio_item.quantity < trade.quantity:
                return {'error': 'Insufficient quantity to sell'}, 400
            portfolio_item.quantity -= trade.quantity
            if portfolio_item.quantity == 0:
                db.session.delete(portfolio_item)
        
        db.session.add(trade)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 400
        
        return trade.to_dict(), 201

class TradeDetail(Resource):
    def get(self, trade_id):
        """Get a specific trade"""
        trade = Trade.query.get(trade_id)
        if not trade:
            abort(404, message=f"Trade with id {trade_id} not found")
        return trade.to_dict()
    
    def delete(self, trade_id):
        """Delete a trade"""
        trade = Trade.query.get(trade_id)
        if not trade:
            abort(404, message=f"Trade with id {trade_id} not found")
        db.session.delete(trade)
        db.session.commit()
        return '', 204
