from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_superadmin = db.Column(db.Boolean, default=False, nullable=False)
    
    # Relationships
    challenges = db.relationship('Challenge', backref='user', lazy=True, cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_admin': self.is_admin,
            'is_superadmin': self.is_superadmin
        }
    
    def __repr__(self):
        return f'<User {self.username}>'


class Challenge(db.Model):
    __tablename__ = 'challenges'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    plan_type = db.Column(db.String(20), nullable=False)  # 'Starter', 'Pro', 'Elite'
    starting_balance = db.Column(db.Float, default=5000.0, nullable=False)
    current_balance = db.Column(db.Float, default=5000.0, nullable=False)
    status = db.Column(db.String(20), default='active', nullable=False)  # 'active', 'passed', 'failed'
    max_daily_loss_percent = db.Column(db.Float, default=5.0, nullable=False)
    max_total_loss_percent = db.Column(db.Float, default=10.0, nullable=False)
    profit_target_percent = db.Column(db.Float, default=10.0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    ended_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    trades = db.relationship('Trade', backref='challenge', lazy=True, cascade='all, delete-orphan', order_by='Trade.created_at.desc()')
    payments = db.relationship('Payment', backref='challenge', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan_type': self.plan_type,
            'starting_balance': self.starting_balance,
            'current_balance': self.current_balance,
            'status': self.status,
            'max_daily_loss_percent': self.max_daily_loss_percent,
            'max_total_loss_percent': self.max_total_loss_percent,
            'profit_target_percent': self.profit_target_percent,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'total_pnl': self.current_balance - self.starting_balance,
            'total_pnl_percent': ((self.current_balance - self.starting_balance) / self.starting_balance * 100) if self.starting_balance > 0 else 0
        }
    
    def __repr__(self):
        return f'<Challenge {self.id} - {self.plan_type} - {self.status}>'


class Trade(db.Model):
    __tablename__ = 'trades'
    
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id'), nullable=False, index=True)
    symbol = db.Column(db.String(20), nullable=False, index=True)  # e.g., AAPL, BTC-USD, IAM
    action = db.Column(db.String(10), nullable=False)  # 'buy' or 'sell'
    quantity = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    total_value = db.Column(db.Float, nullable=False)
    balance_after_trade = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'challenge_id': self.challenge_id,
            'symbol': self.symbol,
            'action': self.action,
            'quantity': self.quantity,
            'price': self.price,
            'total_value': self.total_value,
            'balance_after_trade': self.balance_after_trade,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Trade {self.id} - {self.symbol} - {self.action}>'


class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id'), nullable=True, index=True)
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default='USD', nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # e.g., 'credit_card', 'paypal', 'stripe'
    status = db.Column(db.String(20), default='pending', nullable=False)  # 'pending', 'completed', 'failed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'challenge_id': self.challenge_id,
            'amount': self.amount,
            'currency': self.currency,
            'payment_method': self.payment_method,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Payment {self.id} - {self.status} - ${self.amount}>'


# Legacy models - kept for backward compatibility with existing routes
class Portfolio(db.Model):
    __tablename__ = 'portfolio'
    
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), unique=True, nullable=False)
    quantity = db.Column(db.Float, default=0.0)
    avg_price = db.Column(db.Float, default=0.0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'symbol': self.symbol,
            'quantity': self.quantity,
            'avg_price': self.avg_price,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }
