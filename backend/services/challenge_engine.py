"""
Challenge Engine Service
Implements trade execution and rule checks for challenges.
"""
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

from extensions import db
from models import Challenge, Trade


def _validate_trade_input(action: str, quantity: float, current_price: float) -> Optional[Dict[str, Any]]:
    """Validate basic trade inputs."""
    if action not in {"buy", "sell"}:
        return {"error": "Invalid action", "message": "Action must be 'buy' or 'sell'"}
    if quantity is None or quantity <= 0:
        return {"error": "Invalid quantity", "message": "Quantity must be > 0"}
    if current_price is None or current_price <= 0:
        return {"error": "Invalid price", "message": "Current price must be > 0"}
    return None


def after_trade_check_rules(func):
    """
    Decorator that runs check_challenge_rules() after a trade is executed.
    Assumes the first positional argument is challenge_id.
    """
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        try:
            # Determine challenge_id from args or result
            if args and isinstance(args[0], int):
                challenge_id = args[0]
            else:
                challenge_id = kwargs.get("challenge_id") or (result.get("challenge_id") if isinstance(result, dict) else None)
            if challenge_id:
                rules_result = check_challenge_rules(challenge_id)
                # Attach rule check outcome to the result if possible
                if isinstance(result, dict):
                    result["rule_check"] = rules_result
        except Exception as e:
            # Non-fatal; include error info
            if isinstance(result, dict):
                result["rule_check_error"] = str(e)
        return result
    return wrapper


@after_trade_check_rules
def execute_trade(challenge_id: int, symbol: str, action: str, quantity: float, current_price: float) -> Dict[str, Any]:
    """
    Execute a trade for a challenge.
    - Get challenge from database
    - Verify challenge is active
    - Calculate trade value
    - Update challenge.current_balance
    - Create Trade record
    - Calculate profit/loss percentage (vs initial starting_balance)
    - Return trade confirmation
    """
    # Validate inputs
    validation_error = _validate_trade_input(action, quantity, current_price)
    if validation_error:
        return validation_error

    # Fetch challenge
    challenge: Optional[Challenge] = Challenge.query.get(challenge_id)
    if not challenge:
        return {"error": "Challenge not found", "message": f"Challenge {challenge_id} does not exist"}
    if challenge.status != "active":
        return {"error": "Challenge inactive", "message": f"Challenge {challenge_id} status is '{challenge.status}'"}

    # Compute trade value
    total_value = round(quantity * current_price, 2)

    # Update balance: simple model (buy reduces, sell increases)
    if action == "buy":
        new_balance = round(challenge.current_balance - total_value, 2)
    else:  # sell
        new_balance = round(challenge.current_balance + total_value, 2)

    # Create trade record
    trade = Trade(
        challenge_id=challenge.id,
        symbol=symbol.upper().strip(),
        action=action,
        quantity=float(quantity),
        price=float(current_price),
        total_value=total_value,
        balance_after_trade=new_balance,
        created_at=datetime.utcnow(),
    )

    # Persist changes
    challenge.current_balance = new_balance
    db.session.add(trade)
    db.session.add(challenge)
    db.session.commit()

    # Calculate PnL percent vs initial starting balance
    pnl_percent = 0.0
    if challenge.starting_balance and challenge.starting_balance > 0:
        pnl_percent = ((challenge.current_balance - challenge.starting_balance) / challenge.starting_balance) * 100

    return {
        "challenge_id": challenge.id,
        "trade": trade.to_dict(),
        "current_balance": challenge.current_balance,
        "pnl_percent": round(pnl_percent, 2),
        "status": challenge.status,
    }


def _get_start_of_day(dt: Optional[datetime] = None) -> datetime:
    dt = dt or datetime.utcnow()
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


def _get_today_trades(challenge_id: int) -> List[Trade]:
    start_of_day = _get_start_of_day()
    return Trade.query.filter(Trade.challenge_id == challenge_id, Trade.created_at >= start_of_day).order_by(Trade.created_at.asc()).all()


def _get_last_trade_before_today(challenge_id: int) -> Optional[Trade]:
    start_of_day = _get_start_of_day()
    return Trade.query.filter(Trade.challenge_id == challenge_id, Trade.created_at < start_of_day).order_by(Trade.created_at.desc()).first()


def check_challenge_rules(challenge_id: int) -> Dict[str, Any]:
    """
    Check challenge rules:
      * Daily loss > max_daily_loss_percent -> fail (reason: max_daily_loss)
      * Total loss > max_total_loss_percent -> fail (reason: max_total_loss)
      * Profit > profit_target_percent -> pass (reason: profit_target)
    Updates challenge status if rules are triggered and returns the status update.
    """
    challenge: Optional[Challenge] = Challenge.query.get(challenge_id)
    if not challenge:
        return {"error": "Challenge not found", "message": f"Challenge {challenge_id} does not exist"}

    # Establish starting balance for the day
    last_before = _get_last_trade_before_today(challenge_id)
    if last_before:
        starting_balance_today = last_before.balance_after_trade
    else:
        # Fallback: if the challenge existed before today, use current_balance as of start of day; lacking a snapshot, use current state
        # If created today, use initial starting_balance
        start_of_day = _get_start_of_day()
        if challenge.created_at and challenge.created_at < start_of_day:
            starting_balance_today = challenge.current_balance
        else:
            starting_balance_today = challenge.starting_balance

    # Today's end balance
    today_trades = _get_today_trades(challenge_id)
    if today_trades:
        end_balance_today = today_trades[-1].balance_after_trade
    else:
        end_balance_today = starting_balance_today

    # Daily loss percent
    daily_loss_percent = 0.0
    if starting_balance_today and starting_balance_today > 0:
        daily_loss = max(0.0, starting_balance_today - end_balance_today)
        daily_loss_percent = (daily_loss / starting_balance_today) * 100

    # Total loss and profit percent vs initial starting_balance
    total_loss_percent = 0.0
    profit_percent = 0.0
    if challenge.starting_balance and challenge.starting_balance > 0:
        delta = challenge.current_balance - challenge.starting_balance
        profit_percent = (delta / challenge.starting_balance) * 100
        total_loss_percent = max(0.0, -profit_percent)  # if profit negative, it's a loss in percent

    # Determine rule triggers
    status_change: Optional[str] = None
    reason: Optional[str] = None

    if daily_loss_percent > (challenge.max_daily_loss_percent or 5.0):
        status_change = "failed"
        reason = "max_daily_loss"
    elif total_loss_percent > (challenge.max_total_loss_percent or 10.0):
        status_change = "failed"
        reason = "max_total_loss"
    elif profit_percent > (challenge.profit_target_percent or 10.0):
        status_change = "passed"
        reason = "profit_target"

    # Apply updates if needed
    if status_change and challenge.status != status_change:
        challenge.status = status_change
        challenge.ended_at = datetime.utcnow()
        db.session.add(challenge)
        db.session.commit()

    return {
        "challenge_id": challenge.id,
        "status": challenge.status,
        "reason": reason,
        "metrics": {
            "daily_loss_percent": round(daily_loss_percent, 2),
            "total_loss_percent": round(total_loss_percent, 2),
            "profit_percent": round(profit_percent, 2),
            "starting_balance_today": round(starting_balance_today, 2) if starting_balance_today is not None else None,
            "end_balance_today": round(end_balance_today, 2) if end_balance_today is not None else None,
        },
        "updated": bool(status_change),
    }
