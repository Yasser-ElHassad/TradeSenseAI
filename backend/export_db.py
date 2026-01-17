"""
Database Export Script
Exports SQLite database structure and sample data to PostgreSQL-compatible SQL file
"""

import sqlite3
import os
from datetime import datetime
from werkzeug.security import generate_password_hash

def export_database():
    """Export SQLite database to PostgreSQL-compatible SQL dump"""
    
    # Database file path
    db_path = os.path.join('instance', 'tradesense.db')
    output_file = 'database.sql'
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        print("Creating sample database with test data...")
        create_sample_database(db_path)
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Write header
        f.write("-- TradeSense Database SQL Dump\n")
        f.write(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("-- Compatible with PostgreSQL\n\n")
        
        # Drop existing tables
        f.write("-- Drop existing tables\n")
        f.write("DROP TABLE IF EXISTS trades CASCADE;\n")
        f.write("DROP TABLE IF EXISTS positions CASCADE;\n")
        f.write("DROP TABLE IF EXISTS challenges CASCADE;\n")
        f.write("DROP TABLE IF EXISTS users CASCADE;\n\n")
        
        # Create Users table
        f.write("-- Create Users table\n")
        f.write("""CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);\n\n""")
        
        # Create Challenges table
        f.write("-- Create Challenges table\n")
        f.write("""CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(50) NOT NULL,
    starting_balance FLOAT NOT NULL,
    current_balance FLOAT NOT NULL,
    profit_target FLOAT NOT NULL,
    daily_loss_limit FLOAT NOT NULL,
    max_total_loss FLOAT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    passed_at TIMESTAMP,
    failed_at TIMESTAMP
);\n\n""")
        
        # Create Positions table
        f.write("-- Create Positions table\n")
        f.write("""CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    average_price FLOAT NOT NULL,
    current_price FLOAT,
    unrealized_pnl FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);\n\n""")
        
        # Create Trades table
        f.write("-- Create Trades table\n")
        f.write("""CREATE TABLE trades (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    trade_type VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    price FLOAT NOT NULL,
    total_value FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);\n\n""")
        
        # Get actual data from SQLite
        tables = ['users', 'challenges', 'positions', 'trades']
        
        for table in tables:
            try:
                cursor.execute(f"SELECT * FROM {table}")
                rows = cursor.fetchall()
                
                if rows:
                    # Get column names
                    cursor.execute(f"PRAGMA table_info({table})")
                    columns = [col[1] for col in cursor.fetchall()]
                    
                    f.write(f"-- Insert data into {table}\n")
                    
                    for row in rows:
                        # Format values for PostgreSQL
                        formatted_values = []
                        for val in row:
                            if val is None:
                                formatted_values.append('NULL')
                            elif isinstance(val, str):
                                # Escape single quotes
                                escaped = val.replace("'", "''")
                                formatted_values.append(f"'{escaped}'")
                            elif isinstance(val, bool):
                                formatted_values.append('TRUE' if val else 'FALSE')
                            else:
                                formatted_values.append(str(val))
                        
                        values_str = ', '.join(formatted_values)
                        f.write(f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({values_str});\n")
                    
                    f.write('\n')
            except sqlite3.OperationalError:
                # Table doesn't exist, skip
                pass
        
        # Add sample data if database is empty
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            f.write("-- Sample data (if database is empty)\n\n")
            
            # Sample users
            f.write("-- Sample users (password: 'password123' for all)\n")
            password_hash = generate_password_hash('password123')
            f.write(f"""INSERT INTO users (username, email, password_hash, is_admin) VALUES
('john_trader', 'john@example.com', '{password_hash}', FALSE),
('sarah_pro', 'sarah@example.com', '{password_hash}', FALSE),
('admin_user', 'admin@tradesense.ai', '{password_hash}', TRUE);\n\n""")
            
            # Sample challenges
            f.write("-- Sample challenges\n")
            f.write("""INSERT INTO challenges (user_id, plan_name, starting_balance, current_balance, profit_target, daily_loss_limit, max_total_loss, status) VALUES
(1, 'Pro', 10000, 10450, 1000, 500, 1000, 'active'),
(2, 'Starter', 5000, 5250, 500, 250, 500, 'active'),
(1, 'Elite', 25000, 26500, 2500, 1250, 2500, 'active');\n\n""")
            
            # Sample trades
            f.write("-- Sample trades\n")
            f.write("""INSERT INTO trades (challenge_id, symbol, trade_type, quantity, price, total_value) VALUES
(1, 'AAPL', 'buy', 10, 150.00, 1500.00),
(1, 'AAPL', 'sell', 10, 155.00, 1550.00),
(2, 'GOOGL', 'buy', 5, 140.00, 700.00),
(2, 'GOOGL', 'sell', 5, 145.00, 725.00),
(3, 'MSFT', 'buy', 20, 370.00, 7400.00),
(3, 'TSLA', 'buy', 15, 245.00, 3675.00);\n\n""")
            
            # Sample positions
            f.write("-- Sample positions (current open positions)\n")
            f.write("""INSERT INTO positions (challenge_id, symbol, quantity, average_price, current_price, unrealized_pnl) VALUES
(3, 'MSFT', 20, 370.00, 375.00, 100.00),
(3, 'TSLA', 15, 245.00, 250.00, 75.00);\n\n""")
        
        # Add sequences reset
        f.write("-- Reset sequences for auto-increment columns\n")
        f.write("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));\n")
        f.write("SELECT setval('challenges_id_seq', (SELECT MAX(id) FROM challenges));\n")
        f.write("SELECT setval('positions_id_seq', (SELECT MAX(id) FROM positions));\n")
        f.write("SELECT setval('trades_id_seq', (SELECT MAX(id) FROM trades));\n\n")
        
        # Add indexes
        f.write("-- Create indexes for performance\n")
        f.write("CREATE INDEX idx_challenges_user_id ON challenges(user_id);\n")
        f.write("CREATE INDEX idx_challenges_status ON challenges(status);\n")
        f.write("CREATE INDEX idx_trades_challenge_id ON trades(challenge_id);\n")
        f.write("CREATE INDEX idx_trades_symbol ON trades(symbol);\n")
        f.write("CREATE INDEX idx_positions_challenge_id ON positions(challenge_id);\n")
        f.write("CREATE INDEX idx_positions_symbol ON positions(symbol);\n\n")
        
        f.write("-- Database export completed successfully\n")
    
    conn.close()
    
    print(f"✅ Database exported successfully to {output_file}")
    print(f"\n📋 Import instructions:")
    print(f"   1. On Render/Railway, connect to PostgreSQL:")
    print(f"      psql $DATABASE_URL")
    print(f"   2. Run the SQL file:")
    print(f"      \\i database.sql")
    print(f"   OR use command line:")
    print(f"      psql $DATABASE_URL < database.sql")
    print(f"\n🔐 Sample user credentials:")
    print(f"   Username: john_trader")
    print(f"   Username: sarah_pro")
    print(f"   Username: admin_user (admin)")
    print(f"   Password: password123 (for all)")


def create_sample_database(db_path):
    """Create a sample SQLite database with test data"""
    
    # Ensure instance directory exists
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(80) UNIQUE NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            password_hash VARCHAR(256) NOT NULL,
            is_admin BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            plan_name VARCHAR(50) NOT NULL,
            starting_balance REAL NOT NULL,
            current_balance REAL NOT NULL,
            profit_target REAL NOT NULL,
            daily_loss_limit REAL NOT NULL,
            max_total_loss REAL NOT NULL,
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            passed_at TIMESTAMP,
            failed_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS positions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id INTEGER NOT NULL,
            symbol VARCHAR(10) NOT NULL,
            quantity INTEGER NOT NULL,
            average_price REAL NOT NULL,
            current_price REAL,
            unrealized_pnl REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (challenge_id) REFERENCES challenges(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id INTEGER NOT NULL,
            symbol VARCHAR(10) NOT NULL,
            trade_type VARCHAR(10) NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            total_value REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (challenge_id) REFERENCES challenges(id)
        )
    """)
    
    # Insert sample data
    password_hash = generate_password_hash('password123')
    
    cursor.execute("""
        INSERT INTO users (username, email, password_hash, is_admin)
        VALUES 
        ('john_trader', 'john@example.com', ?, 0),
        ('sarah_pro', 'sarah@example.com', ?, 0),
        ('admin_user', 'admin@tradesense.ai', ?, 1)
    """, (password_hash, password_hash, password_hash))
    
    cursor.execute("""
        INSERT INTO challenges (user_id, plan_name, starting_balance, current_balance, profit_target, daily_loss_limit, max_total_loss, status)
        VALUES 
        (1, 'Pro', 10000, 10450, 1000, 500, 1000, 'active'),
        (2, 'Starter', 5000, 5250, 500, 250, 500, 'active'),
        (1, 'Elite', 25000, 26500, 2500, 1250, 2500, 'active')
    """)
    
    cursor.execute("""
        INSERT INTO trades (challenge_id, symbol, trade_type, quantity, price, total_value)
        VALUES 
        (1, 'AAPL', 'buy', 10, 150.00, 1500.00),
        (1, 'AAPL', 'sell', 10, 155.00, 1550.00),
        (2, 'GOOGL', 'buy', 5, 140.00, 700.00),
        (2, 'GOOGL', 'sell', 5, 145.00, 725.00),
        (3, 'MSFT', 'buy', 20, 370.00, 7400.00),
        (3, 'TSLA', 'buy', 15, 245.00, 3675.00)
    """)
    
    cursor.execute("""
        INSERT INTO positions (challenge_id, symbol, quantity, average_price, current_price, unrealized_pnl)
        VALUES 
        (3, 'MSFT', 20, 370.00, 375.00, 100.00),
        (3, 'TSLA', 15, 245.00, 250.00, 75.00)
    """)
    
    conn.commit()
    conn.close()
    
    print(f"✅ Sample database created at {db_path}")


if __name__ == '__main__':
    print("🔄 Exporting database...\n")
    export_database()
