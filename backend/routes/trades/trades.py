from flask_restful import Resource
from flask import request, g
from extensions import db
from models import Trade, Challenge
from utils.auth_utils import token_required
from services.challenge_engine import execute_trade, check_challenge_rules, _get_today_trades
from routes.market import get_price_for_symbol
from datetime import datetime


class TradeList(Resource):
    """Get all trades endpoint"""
    method_decorators = [token_required]

    def get(self):
        user = g.current_user
        # Get all trades for user's challenges
        challenges = Challenge.query.filter_by(user_id=user.id).all()
        challenge_ids = [c.id for c in challenges]
        trades = Trade.query.filter(Trade.challenge_id.in_(challenge_ids)).order_by(Trade.created_at.desc()).all()
        return {'trades': [t.to_dict() for t in trades], 'count': len(trades)}, 200


class TradeDetail(Resource):
    """Get or delete a specific trade"""
    method_decorators = [token_required]

    def get(self, trade_id):
        trade = Trade.query.get(trade_id)
        if not trade:
            return {'error': 'Trade not found'}, 404
        # Verify ownership
        challenge = Challenge.query.get(trade.challenge_id)
        if not challenge or challenge.user_id != g.current_user.id:
            return {'error': 'Unauthorized'}, 403
        return trade.to_dict(), 200

    def delete(self, trade_id):
        trade = Trade.query.get(trade_id)
        if not trade:
            return {'error': 'Trade not found'}, 404
        # Verify ownership
        challenge = Challenge.query.get(trade.challenge_id)
        if not challenge or challenge.user_id != g.current_user.id:
            return {'error': 'Unauthorized'}, 403
        db.session.delete(trade)
        db.session.commit()
        return {'message': 'Trade deleted'}, 200


class ExecuteTrade(Resource):
    """
    POST /api/trades/execute
    Execute a new trade for a challenge.
    Requires authentication.
    """
    method_decorators = [token_required]

    def post(self):
        user = g.current_user
        data = request.get_json() or {}

        # Validate required fields
        challenge_id = data.get('challenge_id')
        symbol = data.get('symbol')
        action = data.get('action')
        quantity = data.get('quantity')

        if not challenge_id:
            return {'error': 'Missing field', 'message': 'challenge_id is required'}, 400
        if not symbol:
            return {'error': 'Missing field', 'message': 'symbol is required'}, 400
        if not action:
            return {'error': 'Missing field', 'message': 'action is required'}, 400
        if quantity is None:
            return {'error': 'Missing field', 'message': 'quantity is required'}, 400

        # Verify challenge exists and belongs to user
        challenge = Challenge.query.get(challenge_id)
        if not challenge:
            return {'error': 'Challenge not found', 'message': f'Challenge {challenge_id} does not exist'}, 404
        if challenge.user_id != user.id:
            return {'error': 'Unauthorized', 'message': 'This challenge does not belong to you'}, 403

        # Fetch real-time price for symbol
        price_data = get_price_for_symbol(symbol)
        if 'error' in price_data:
            return {'error': 'Price fetch failed', 'message': price_data.get('message', 'Could not fetch price'), 'symbol': symbol}, 400

        current_price = price_data.get('current_price')
        if current_price is None or current_price <= 0:
            return {'error': 'Invalid price', 'message': f'Invalid price received for {symbol}'}, 400

        # Execute the trade (this also triggers check_challenge_rules via decorator)
        result = execute_trade(
            challenge_id=challenge_id,
            symbol=symbol,
            action=action,
            quantity=float(quantity),
            current_price=float(current_price)
        )

        if 'error' in result:
            return result, 400

        # Refresh challenge to get updated status
        challenge = Challenge.query.get(challenge_id)

        return {
            'message': 'Trade executed successfully',
            'trade': result.get('trade'),
            'challenge': {
                'id': challenge.id,
                'current_balance': challenge.current_balance,
                'starting_balance': challenge.starting_balance,
                'status': challenge.status,
                'pnl_percent': result.get('pnl_percent'),
            },
            'rule_check': result.get('rule_check'),
            'price_info': {
                'symbol': symbol.upper(),
                'price_used': current_price,
                'source': price_data.get('source'),
                'market': price_data.get('market'),
            }
        }, 201


class TradeHistory(Resource):
    """
    GET /api/trades/history/<challenge_id>
    Return all trades for a challenge with P&L calculations.
    """
    method_decorators = [token_required]

    def get(self, challenge_id):
        user = g.current_user

        # Verify challenge exists and belongs to user
        challenge = Challenge.query.get(challenge_id)
        if not challenge:
            return {'error': 'Challenge not found'}, 404
        if challenge.user_id != user.id:
            return {'error': 'Unauthorized'}, 403

        # Get all trades ordered by created_at DESC
        trades = Trade.query.filter_by(challenge_id=challenge_id).order_by(Trade.created_at.desc()).all()

        # Calculate P&L for each trade
        trades_with_pnl = []
        for trade in trades:
            trade_dict = trade.to_dict()
            # Calculate profit/loss vs previous balance
            if trade.action == 'sell':
                # For sells, profit = trade value (simplified model)
                trade_dict['pnl'] = trade.total_value
            else:
                # For buys, it's an investment
                trade_dict['pnl'] = -trade.total_value
            trades_with_pnl.append(trade_dict)

        # Overall stats
        total_pnl = challenge.current_balance - challenge.starting_balance
        total_pnl_percent = (total_pnl / challenge.starting_balance * 100) if challenge.starting_balance > 0 else 0

        return {
            'challenge_id': challenge_id,
            'trades': trades_with_pnl,
            'count': len(trades),
            'summary': {
                'starting_balance': challenge.starting_balance,
                'current_balance': challenge.current_balance,
                'total_pnl': round(total_pnl, 2),
                'total_pnl_percent': round(total_pnl_percent, 2),
                'status': challenge.status,
            }
        }, 200


class ChallengeDetails(Resource):
    """
    GET /api/trades/challenges/<challenge_id>
    Return challenge details with balance, profit%, status, today's trades and daily P&L.
    """
    method_decorators = [token_required]

    def get(self, challenge_id):
        user = g.current_user

        # Verify challenge exists and belongs to user
        challenge = Challenge.query.get(challenge_id)
        if not challenge:
            return {'error': 'Challenge not found'}, 404
        if challenge.user_id != user.id:
            return {'error': 'Unauthorized'}, 403

        # Get today's trades
        today_trades = _get_today_trades(challenge_id)
        today_trades_count = len(today_trades)

        # Calculate daily P&L
        if today_trades:
            # Starting balance today = balance before first trade of today
            first_trade = today_trades[0]
            # Reconstruct starting balance: balance_after_trade +/- trade effect
            if first_trade.action == 'buy':
                starting_balance_today = first_trade.balance_after_trade + first_trade.total_value
            else:
                starting_balance_today = first_trade.balance_after_trade - first_trade.total_value
            end_balance_today = today_trades[-1].balance_after_trade
            daily_pnl = end_balance_today - starting_balance_today
        else:
            starting_balance_today = challenge.current_balance
            end_balance_today = challenge.current_balance
            daily_pnl = 0.0

        daily_pnl_percent = (daily_pnl / starting_balance_today * 100) if starting_balance_today > 0 else 0

        # Total P&L
        total_pnl = challenge.current_balance - challenge.starting_balance
        total_pnl_percent = (total_pnl / challenge.starting_balance * 100) if challenge.starting_balance > 0 else 0

        return {
            'challenge': {
                'id': challenge.id,
                'user_id': challenge.user_id,
                'plan_type': challenge.plan_type,
                'starting_balance': challenge.starting_balance,
                'current_balance': challenge.current_balance,
                'status': challenge.status,
                'max_daily_loss_percent': challenge.max_daily_loss_percent,
                'max_total_loss_percent': challenge.max_total_loss_percent,
                'profit_target_percent': challenge.profit_target_percent,
                'created_at': challenge.created_at.isoformat() if challenge.created_at else None,
                'ended_at': challenge.ended_at.isoformat() if challenge.ended_at else None,
            },
            'performance': {
                'total_pnl': round(total_pnl, 2),
                'total_pnl_percent': round(total_pnl_percent, 2),
                'daily_pnl': round(daily_pnl, 2),
                'daily_pnl_percent': round(daily_pnl_percent, 2),
            },
            'today': {
                'trades_count': today_trades_count,
                'starting_balance': round(starting_balance_today, 2),
                'current_balance': round(end_balance_today, 2),
            }
        }, 200

