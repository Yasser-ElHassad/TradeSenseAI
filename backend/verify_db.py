"""
Script de vérification de la base de données TradeSense
"""
from app import create_app
from extensions import db
from models import User, Challenge, Trade, Payment, Portfolio
from sqlalchemy import func

def verify_database():
    app = create_app()
    with app.app_context():
        print("=" * 60)
        print("VERIFICATION DE LA BASE DE DONNEES TRADESENSE")
        print("=" * 60)
        
        # Vérifier les tables
        print("\n[1] TABLES EXISTANTES:")
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        for t in tables:
            print(f"    [OK] {t}")
        
        # Statistiques des utilisateurs
        print("\n[2] UTILISATEURS:")
        total_users = User.query.count()
        admins = User.query.filter_by(is_admin=True).count()
        superadmins = User.query.filter_by(is_superadmin=True).count()
        print(f"    Total: {total_users}")
        print(f"    Admins: {admins}")
        print(f"    Super Admins: {superadmins}")
        
        users = User.query.limit(10).all()
        if users:
            print("\n    Liste des utilisateurs:")
            for u in users:
                badge = "[SUPER]" if u.is_superadmin else ("[ADMIN]" if u.is_admin else "")
                print(f"    - {u.username} ({u.email}) {badge}")
        
        # Statistiques des challenges
        print("\n[3] CHALLENGES:")
        total_challenges = Challenge.query.count()
        active = Challenge.query.filter_by(status='active').count()
        passed = Challenge.query.filter_by(status='passed').count()
        failed = Challenge.query.filter_by(status='failed').count()
        print(f"    Total: {total_challenges}")
        print(f"    Actifs: {active}")
        print(f"    Reussis: {passed}")
        print(f"    Echoues: {failed}")
        
        # Détails des challenges
        challenges = Challenge.query.limit(5).all()
        if challenges:
            print("\n    Details des challenges:")
            for c in challenges:
                pnl = c.current_balance - c.starting_balance
                print(f"    - Challenge #{c.id}: {c.plan_type} | Balance: ${c.current_balance:.2f} | PnL: ${pnl:.2f} | Status: {c.status}")
        
        # Statistiques des trades
        print("\n[4] TRADES:")
        total_trades = Trade.query.count()
        print(f"    Total: {total_trades}")
        
        if total_trades > 0:
            buys = Trade.query.filter_by(action='buy').count()
            sells = Trade.query.filter_by(action='sell').count()
            print(f"    Achats: {buys}")
            print(f"    Ventes: {sells}")
            
            # Top symboles
            top_symbols = db.session.query(
                Trade.symbol, 
                func.count(Trade.id).label('count')
            ).group_by(Trade.symbol).order_by(func.count(Trade.id).desc()).limit(5).all()
            
            if top_symbols:
                print("\n    Top 5 symboles trades:")
                for symbol, count in top_symbols:
                    print(f"    - {symbol}: {count} trades")
        
        # Statistiques des paiements
        print("\n[5] PAIEMENTS:")
        total_payments = Payment.query.count()
        print(f"    Total: {total_payments}")
        
        if total_payments > 0:
            pending = Payment.query.filter_by(status='pending').count()
            completed = Payment.query.filter_by(status='completed').count()
            failed_pay = Payment.query.filter_by(status='failed').count()
            print(f"    En attente: {pending}")
            print(f"    Completes: {completed}")
            print(f"    Echoues: {failed_pay}")
            
            total_revenue = db.session.query(func.sum(Payment.amount)).filter_by(status='completed').scalar() or 0
            print(f"    Revenus totaux: ${total_revenue:.2f}")
        
        # Portfolio legacy
        print("\n[6] PORTFOLIO (Legacy):")
        portfolio_count = Portfolio.query.count()
        print(f"    Total positions: {portfolio_count}")
        
        print("\n" + "=" * 60)
        print("[OK] VERIFICATION TERMINEE AVEC SUCCES")
        print("=" * 60)

if __name__ == "__main__":
    verify_database()
