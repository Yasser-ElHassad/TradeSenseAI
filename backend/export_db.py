"""
Database Export Script
Exports SQLite database structure and data to PostgreSQL-compatible SQL file
"""

import sqlite3
import os
from datetime import datetime

def export_database():
    """Export SQLite database to PostgreSQL-compatible SQL dump"""
    
    # Database file path
    db_path = os.path.join('instance', 'tradesense.db')
    output_file = os.path.join('..', 'database.sql')
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        print("Run seed_data.py first to create the database with sample data.")
        return
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Write header
        f.write("-- TradeSense Database SQL Dump\n")
        f.write(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("-- Compatible with PostgreSQL\n")
        f.write("-- Development: SQLite | Production: PostgreSQL\n\n")
        
        # Drop existing tables (order matters due to foreign key constraints)
        f.write("-- Drop existing tables (order matters due to foreign key constraints)\n")
        f.write("DROP TABLE IF EXISTS payments CASCADE;\n")
        f.write("DROP TABLE IF EXISTS trades CASCADE;\n")
        f.write("DROP TABLE IF EXISTS portfolio CASCADE;\n")
        f.write("DROP TABLE IF EXISTS challenges CASCADE;\n")
        f.write("DROP TABLE IF EXISTS users CASCADE;\n\n")
        
        # Create Users table
        f.write("-- Create Users table\n")
        f.write("""CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE,
    is_superadmin BOOLEAN DEFAULT FALSE
);\n\n""")
        
        # Create Challenges table
        f.write("-- Create Challenges table\n")
        f.write("""CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL,
    starting_balance FLOAT NOT NULL,
    current_balance FLOAT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    max_daily_loss_percent FLOAT DEFAULT 5.0,
    max_total_loss_percent FLOAT DEFAULT 10.0,
    profit_target_percent FLOAT DEFAULT 10.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    failure_reason VARCHAR(100)
);\n\n""")
        
        # Create Trades table
        f.write("-- Create Trades table\n")
        f.write("""CREATE TABLE trades (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    action VARCHAR(10) NOT NULL,
    quantity FLOAT NOT NULL,
    price FLOAT NOT NULL,
    total_value FLOAT NOT NULL,
    balance_after_trade FLOAT NOT NULL,
    profit_loss FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);\n\n""")
        
        # Create Payments table
        f.write("-- Create Payments table\n")
        f.write("""CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE SET NULL,
    amount FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'DH',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);\n\n""")
        
        # Create Portfolio table (legacy)
        f.write("-- Create Portfolio table (legacy, for backward compatibility)\n")
        f.write("""CREATE TABLE portfolio (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    quantity FLOAT DEFAULT 0.0,
    avg_price FLOAT DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);\n\n""")
        
        # Export data from each table
        tables_config = [
            ('users', ['id', 'username', 'email', 'password_hash', 'created_at', 'is_admin', 'is_superadmin']),
            ('challenges', ['id', 'user_id', 'plan_type', 'starting_balance', 'current_balance', 'status', 
                           'max_daily_loss_percent', 'max_total_loss_percent', 'profit_target_percent', 
                           'created_at', 'ended_at', 'failure_reason']),
            ('trades', ['id', 'challenge_id', 'symbol', 'action', 'quantity', 'price', 'total_value', 
                       'balance_after_trade', 'profit_loss', 'created_at']),
            ('payments', ['id', 'user_id', 'challenge_id', 'amount', 'currency', 'payment_method', 
                         'status', 'transaction_id', 'created_at']),
            ('portfolio', ['id', 'symbol', 'quantity', 'avg_price', 'last_updated'])
        ]
        
        for table_name, expected_columns in tables_config:
            try:
                # Get actual columns from the table
                cursor.execute(f"PRAGMA table_info({table_name})")
                actual_columns = [col[1] for col in cursor.fetchall()]
                
                # Use only columns that exist in both expected and actual
                columns = [col for col in expected_columns if col in actual_columns]
                
                if not columns:
                    continue
                
                cursor.execute(f"SELECT {', '.join(columns)} FROM {table_name}")
                rows = cursor.fetchall()
                
                if rows:
                    f.write(f"-- Insert data into {table_name}\n")
                    
                    for row in rows:
                        formatted_values = []
                        for i, val in enumerate(row):
                            if val is None:
                                formatted_values.append('NULL')
                            elif isinstance(val, str):
                                escaped = val.replace("'", "''")
                                formatted_values.append(f"'{escaped}'")
                            elif isinstance(val, bool) or (columns[i] in ['is_admin', 'is_superadmin'] and isinstance(val, int)):
                                formatted_values.append('TRUE' if val else 'FALSE')
                            else:
                                formatted_values.append(str(val))
                        
                        values_str = ', '.join(formatted_values)
                        f.write(f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({values_str});\n")
                    
                    f.write('\n')
            except sqlite3.OperationalError as e:
                print(f"⚠️  Skipping table {table_name}: {e}")
        
        # Reset sequences for auto-increment columns
        f.write("-- Reset sequences for auto-increment columns (PostgreSQL)\n")
        f.write("SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));\n")
        f.write("SELECT setval('challenges_id_seq', COALESCE((SELECT MAX(id) FROM challenges), 1));\n")
        f.write("SELECT setval('trades_id_seq', COALESCE((SELECT MAX(id) FROM trades), 1));\n")
        f.write("SELECT setval('payments_id_seq', COALESCE((SELECT MAX(id) FROM payments), 1));\n")
        f.write("SELECT setval('portfolio_id_seq', COALESCE((SELECT MAX(id) FROM portfolio), 1));\n\n")
        
        # Create indexes
        f.write("-- Create indexes for performance\n")
        f.write("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);\n")
        f.write("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);\n")
        f.write("CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);\n")
        f.write("CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);\n")
        f.write("CREATE INDEX IF NOT EXISTS idx_trades_challenge_id ON trades(challenge_id);\n")
        f.write("CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);\n")
        f.write("CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);\n")
        f.write("CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);\n")
        f.write("CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);\n\n")
        
        f.write("-- Database export completed successfully\n")
    
    conn.close()
    
    # Count exported data
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    counts = {}
    for table in ['users', 'challenges', 'trades', 'payments', 'portfolio']:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            counts[table] = cursor.fetchone()[0]
        except:
            counts[table] = 0
    
    conn.close()
    
    print(f"✅ Database exported successfully to {output_file}")
    print(f"\n📊 Exported data summary:")
    print(f"   Users:      {counts['users']}")
    print(f"   Challenges: {counts['challenges']}")
    print(f"   Trades:     {counts['trades']}")
    print(f"   Payments:   {counts['payments']}")
    print(f"   Portfolio:  {counts['portfolio']}")
    print(f"\n📋 To import into PostgreSQL:")
    print(f"   psql $DATABASE_URL < database.sql")


if __name__ == '__main__':
    print("🔄 Exporting database to PostgreSQL-compatible SQL...\n")
    export_database()
