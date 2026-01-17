"""
Seed Data Script
Populates the database with impressive demo data for video demonstrations
"""

import sys
import os
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db
from models import User, Challenge, Trade, Payment

def clear_existing_data():
    """Clear all existing data from database"""
    print("🗑️  Clearing existing data...")
    Trade.query.delete()
    Payment.query.delete()
    Challenge.query.delete()
    User.query.delete()
    db.session.commit()
    print("✅ Existing data cleared")

def create_test_users():
    """Create 3 impressive test users"""
    print("\n👥 Creating test users...")
    
    users_data = [
        {
            'username': 'trader1',
            'email': 'trader1@tradesense.ai',
            'password': 'demo123',
            'is_admin': False
        },
        {
            'username': 'trader2',
            'email': 'trader2@tradesense.ai',
            'password': 'demo123',
            'is_admin': False
        },
        {
            'username': 'trader3',
            'email': 'trader3@tradesense.ai',
            'password': 'demo123',
            'is_admin': False
        },
        {
            'username': 'admin',
            'email': 'admin@tradesense.ai',
            'password': 'admin123',
            'is_admin': True
        }
    ]
    
    users = []
    for user_data in users_data:
        user = User(
            username=user_data['username'],
            email=user_data['email'],
            password_hash=generate_password_hash(user_data['password']),
            is_admin=user_data['is_admin']
        )
        db.session.add(user)
        users.append(user)
    
    db.session.commit()
    print(f"✅ Created {len(users)} users")
    return users

def create_impressive_challenges(users):
    """Create challenges with impressive performance"""
    print("\n🎯 Creating challenges...")
    
    challenges = []
    
    # User 1: Close to PASSING (9.5% profit) - Elite Challenge
    challenge1 = Challenge(
        user_id=users[0].id,
        plan_type='Elite',
        starting_balance=25000.0,
        current_balance=27375.0,  # +9.5% profit
        profit_target_percent=10.0,  # 10% target
        max_daily_loss_percent=5.0,  # 5% daily loss limit
        max_total_loss_percent=10.0,  # 10% max total loss
        status='active',
        created_at=datetime.utcnow() - timedelta(days=15)
    )
    db.session.add(challenge1)
    challenges.append(challenge1)
    
    # User 2: Close to FAILING (4.8% daily loss) - Pro Challenge
    challenge2 = Challenge(
        user_id=users[1].id,
        plan_type='Pro',
        starting_balance=10000.0,
        current_balance=9520.0,  # -4.8% loss (close to 5% limit)
        profit_target_percent=10.0,  # 10% target
        max_daily_loss_percent=5.0,  # 5% daily loss limit
        max_total_loss_percent=10.0,  # 10% max total loss
        status='active',
        created_at=datetime.utcnow() - timedelta(days=8)
    )
    db.session.add(challenge2)
    challenges.append(challenge2)
    
    # User 3: Moderate performance - Starter Challenge
    challenge3 = Challenge(
        user_id=users[2].id,
        plan_type='Starter',
        starting_balance=5000.0,
        current_balance=5350.0,  # +7% profit
        profit_target_percent=10.0,  # 10% target
        max_daily_loss_percent=5.0,  # 5% daily loss limit
        max_total_loss_percent=10.0,  # 10% max total loss
        status='active',
        created_at=datetime.utcnow() - timedelta(days=12)
    )
    db.session.add(challenge3)
    challenges.append(challenge3)
    
    db.session.commit()
    print(f"✅ Created {len(challenges)} challenges")
    return challenges

def create_realistic_trades(challenges):
    """Create realistic trading history with wins and losses"""
    print("\n📊 Creating realistic trades...")
    
    all_trades = []
    
    # Challenge 1: Elite trader (mostly winning trades)
    trades_c1 = [
        # Winning streak
        {'symbol': 'AAPL', 'type': 'buy', 'qty': 50, 'price': 180.00, 'days_ago': 15},
        {'symbol': 'AAPL', 'type': 'sell', 'qty': 50, 'price': 185.50, 'days_ago': 14},  # +$275 profit
        
        {'symbol': 'MSFT', 'type': 'buy', 'qty': 30, 'price': 370.00, 'days_ago': 13},
        {'symbol': 'MSFT', 'type': 'sell', 'qty': 30, 'price': 380.00, 'days_ago': 12},  # +$300 profit
        
        {'symbol': 'GOOGL', 'type': 'buy', 'qty': 40, 'price': 140.00, 'days_ago': 11},
        {'symbol': 'GOOGL', 'type': 'sell', 'qty': 40, 'price': 145.00, 'days_ago': 10},  # +$200 profit
        
        # Small loss
        {'symbol': 'TSLA', 'type': 'buy', 'qty': 20, 'price': 245.00, 'days_ago': 9},
        {'symbol': 'TSLA', 'type': 'sell', 'qty': 20, 'price': 242.00, 'days_ago': 8},  # -$60 loss
        
        # Big win
        {'symbol': 'NVDA', 'type': 'buy', 'qty': 25, 'price': 480.00, 'days_ago': 7},
        {'symbol': 'NVDA', 'type': 'sell', 'qty': 25, 'price': 495.00, 'days_ago': 6},  # +$375 profit
        
        {'symbol': 'AMD', 'type': 'buy', 'qty': 60, 'price': 150.00, 'days_ago': 5},
        {'symbol': 'AMD', 'type': 'sell', 'qty': 60, 'price': 156.00, 'days_ago': 4},  # +$360 profit
        
        # Current positions (open)
        {'symbol': 'AMZN', 'type': 'buy', 'qty': 15, 'price': 170.00, 'days_ago': 3},
        {'symbol': 'META', 'type': 'buy', 'qty': 20, 'price': 350.00, 'days_ago': 2},
    ]
    
    # Challenge 2: Struggling trader (more losses, close to daily limit)
    trades_c2 = [
        # Initial wins
        {'symbol': 'AAPL', 'type': 'buy', 'qty': 20, 'price': 178.00, 'days_ago': 8},
        {'symbol': 'AAPL', 'type': 'sell', 'qty': 20, 'price': 182.00, 'days_ago': 7},  # +$80 profit
        
        # Series of losses
        {'symbol': 'TSLA', 'type': 'buy', 'qty': 15, 'price': 250.00, 'days_ago': 6},
        {'symbol': 'TSLA', 'type': 'sell', 'qty': 15, 'price': 242.00, 'days_ago': 5},  # -$120 loss
        
        {'symbol': 'NVDA', 'type': 'buy', 'qty': 10, 'price': 485.00, 'days_ago': 4},
        {'symbol': 'NVDA', 'type': 'sell', 'qty': 10, 'price': 478.00, 'days_ago': 3},  # -$70 loss
        
        # Bad day (approaching daily limit)
        {'symbol': 'AMD', 'type': 'buy', 'qty': 25, 'price': 155.00, 'days_ago': 1},
        {'symbol': 'AMD', 'type': 'sell', 'qty': 25, 'price': 149.00, 'days_ago': 1},  # -$150 loss
        
        {'symbol': 'GOOGL', 'type': 'buy', 'qty': 15, 'price': 143.00, 'days_ago': 1},
        {'symbol': 'GOOGL', 'type': 'sell', 'qty': 15, 'price': 139.00, 'days_ago': 1},  # -$60 loss
        
        # Current risky position
        {'symbol': 'COIN', 'type': 'buy', 'qty': 30, 'price': 180.00, 'days_ago': 0},
    ]
    
    # Challenge 3: Moderate trader (balanced)
    trades_c3 = [
        {'symbol': 'AAPL', 'type': 'buy', 'qty': 15, 'price': 179.00, 'days_ago': 12},
        {'symbol': 'AAPL', 'type': 'sell', 'qty': 15, 'price': 183.00, 'days_ago': 11},  # +$60 profit
        
        {'symbol': 'MSFT', 'type': 'buy', 'qty': 8, 'price': 372.00, 'days_ago': 10},
        {'symbol': 'MSFT', 'type': 'sell', 'qty': 8, 'price': 376.00, 'days_ago': 9},  # +$32 profit
        
        {'symbol': 'GOOGL', 'type': 'buy', 'qty': 20, 'price': 141.00, 'days_ago': 8},
        {'symbol': 'GOOGL', 'type': 'sell', 'qty': 20, 'price': 144.00, 'days_ago': 7},  # +$60 profit
        
        # Small loss
        {'symbol': 'TSLA', 'type': 'buy', 'qty': 10, 'price': 246.00, 'days_ago': 6},
        {'symbol': 'TSLA', 'type': 'sell', 'qty': 10, 'price': 243.00, 'days_ago': 5},  # -$30 loss
        
        {'symbol': 'NVDA', 'type': 'buy', 'qty': 12, 'price': 482.00, 'days_ago': 4},
        {'symbol': 'NVDA', 'type': 'sell', 'qty': 12, 'price': 490.00, 'days_ago': 3},  # +$96 profit
        
        # Current positions
        {'symbol': 'AMD', 'type': 'buy', 'qty': 25, 'price': 152.00, 'days_ago': 2},
        {'symbol': 'INTC', 'type': 'buy', 'qty': 40, 'price': 45.00, 'days_ago': 1},
    ]
    
    # Create trades for each challenge
    challenge_trades = [
        (challenges[0], trades_c1),
        (challenges[1], trades_c2),
        (challenges[2], trades_c3)
    ]
    
    # Track balance for each challenge
    balance_trackers = {
        challenges[0].id: 25000.0,
        challenges[1].id: 10000.0,
        challenges[2].id: 5000.0
    }
    
    for challenge, trades_data in challenge_trades:
        for trade_data in trades_data:
            trade_value = trade_data['qty'] * trade_data['price']
            # Update balance (simplified - buy decreases, sell increases)
            if trade_data['type'] == 'buy':
                balance_trackers[challenge.id] -= trade_value * 0.01  # Small commission
            else:
                balance_trackers[challenge.id] += trade_value * 0.01  # Small profit
            
            trade = Trade(
                challenge_id=challenge.id,
                symbol=trade_data['symbol'],
                action=trade_data['type'],
                quantity=trade_data['qty'],
                price=trade_data['price'],
                total_value=trade_value,
                balance_after_trade=balance_trackers[challenge.id],
                created_at=datetime.utcnow() - timedelta(days=trade_data['days_ago'])
            )
            db.session.add(trade)
            all_trades.append(trade)
    
    db.session.commit()
    print(f"✅ Created {len(all_trades)} realistic trades")
    return all_trades

def print_summary(users, challenges):
    """Print impressive summary for demo"""
    print("\n" + "="*60)
    print("🎬 DEMO DATA SUMMARY - READY FOR VIDEO!")
    print("="*60)
    
    print("\n📊 CHALLENGE OVERVIEW:")
    print("-" * 60)
    
    for i, (user, challenge) in enumerate(zip(users[:3], challenges), 1):
        profit = challenge.current_balance - challenge.starting_balance
        profit_pct = (profit / challenge.starting_balance) * 100
        profit_target = challenge.starting_balance * (challenge.profit_target_percent / 100)
        daily_loss_limit = challenge.starting_balance * (challenge.max_daily_loss_percent / 100)
        
        status_emoji = "🔥" if profit_pct > 9 else "⚠️" if profit < 0 else "📈"
        
        print(f"\n{status_emoji} User: {user.username}")
        print(f"   Challenge: {challenge.plan_type} (${challenge.starting_balance:,.0f})")
        print(f"   Current Balance: ${challenge.current_balance:,.2f}")
        print(f"   Profit/Loss: ${profit:+,.2f} ({profit_pct:+.1f}%)")
        print(f"   Target: ${profit_target:,.0f} ({challenge.profit_target_percent:.0f}%)")
        
        if profit_pct >= 9:
            remaining = profit_target - profit
            print(f"   🎯 CLOSE TO PASSING! Only ${remaining:.2f} away!")
        elif profit < -400:
            remaining = abs(daily_loss_limit + profit)
            print(f"   ⚠️  DANGER ZONE! Only ${remaining:.2f} from daily loss limit!")
    
    print("\n" + "="*60)
    print("🔐 LOGIN CREDENTIALS:")
    print("-" * 60)
    print("   Username: trader1 | Password: demo123 (Elite - Near Passing)")
    print("   Username: trader2 | Password: demo123 (Pro - Near Failing)")
    print("   Username: trader3 | Password: demo123 (Starter - Moderate)")
    print("   Username: admin   | Password: admin123 (Admin Access)")
    print("="*60)
    
    print("\n✅ Database seeded successfully! Ready for impressive demo video! 🎥")

def seed_database():
    """Main function to seed the database"""
    app = create_app()
    
    with app.app_context():
        print("🌱 Starting database seeding for impressive demo...\n")
        
        # Clear existing data
        clear_existing_data()
        
        # Create users
        users = create_test_users()
        
        # Create challenges
        challenges = create_impressive_challenges(users)
        
        # Create trades
        create_realistic_trades(challenges)
        
        # Print summary
        print_summary(users, challenges)

if __name__ == '__main__':
    seed_database()
