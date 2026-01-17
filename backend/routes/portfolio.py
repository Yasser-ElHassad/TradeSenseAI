from flask_restful import Resource
from flask import abort
from extensions import db
from models import Portfolio
import yfinance as yf

class PortfolioList(Resource):
    def get(self):
        """Get all portfolio positions"""
        positions = Portfolio.query.all()
        
        portfolio_data = []
        for position in positions:
            try:
                ticker = yf.Ticker(position.symbol)
                info = ticker.info
                hist = ticker.history(period="1d")
                
                current_price = hist['Close'].iloc[-1] if not hist.empty else info.get('currentPrice', 0)
                total_value = position.quantity * float(current_price)
                total_cost = position.quantity * position.avg_price
                unrealized_pnl = total_value - total_cost
                unrealized_pnl_percent = ((float(current_price) - position.avg_price) / position.avg_price * 100) if position.avg_price > 0 else 0
                
                portfolio_data.append({
                    **position.to_dict(),
                    'current_price': float(current_price),
                    'total_value': float(total_value),
                    'total_cost': float(total_cost),
                    'unrealized_pnl': float(unrealized_pnl),
                    'unrealized_pnl_percent': float(unrealized_pnl_percent)
                })
            except:
                # If market data fetch fails, include position without current data
                portfolio_data.append({
                    **position.to_dict(),
                    'current_price': position.avg_price,
                    'total_value': position.quantity * position.avg_price,
                    'total_cost': position.quantity * position.avg_price,
                    'unrealized_pnl': 0,
                    'unrealized_pnl_percent': 0
                })
        
        return portfolio_data

class PortfolioDetail(Resource):
    def get(self, symbol):
        """Get a specific portfolio position"""
        position = Portfolio.query.filter_by(symbol=symbol.upper()).first()
        if not position:
            abort(404, message=f"Position for symbol {symbol} not found")
        
        try:
            ticker = yf.Ticker(position.symbol)
            info = ticker.info
            hist = ticker.history(period="1d")
            
            current_price = hist['Close'].iloc[-1] if not hist.empty else info.get('currentPrice', 0)
            total_value = position.quantity * float(current_price)
            total_cost = position.quantity * position.avg_price
            unrealized_pnl = total_value - total_cost
            unrealized_pnl_percent = ((float(current_price) - position.avg_price) / position.avg_price * 100) if position.avg_price > 0 else 0
            
            return {
                **position.to_dict(),
                'current_price': float(current_price),
                'total_value': float(total_value),
                'total_cost': float(total_cost),
                'unrealized_pnl': float(unrealized_pnl),
                'unrealized_pnl_percent': float(unrealized_pnl_percent)
            }
        except Exception as e:
            return {
                **position.to_dict(),
                'current_price': position.avg_price,
                'total_value': position.quantity * position.avg_price,
                'total_cost': position.quantity * position.avg_price,
                'unrealized_pnl': 0,
                'unrealized_pnl_percent': 0,
                'error': str(e)
            }

