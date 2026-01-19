-- TradeSense Database SQL Dump
-- Generated: 2026-01-19 13:19:17
-- Compatible with PostgreSQL
-- Development: SQLite | Production: PostgreSQL

-- Drop existing tables (order matters due to foreign key constraints)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS portfolio CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE,
    is_superadmin BOOLEAN DEFAULT FALSE
);

-- Create Challenges table
CREATE TABLE challenges (
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
);

-- Create Trades table
CREATE TABLE trades (
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
);

-- Create Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE SET NULL,
    amount FLOAT NOT NULL,
    currency VARCHAR(10) DEFAULT 'DH',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Portfolio table (legacy, for backward compatibility)
CREATE TABLE portfolio (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    quantity FLOAT DEFAULT 0.0,
    avg_price FLOAT DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data into users
INSERT INTO users (id, username, email, password_hash, created_at, is_admin, is_superadmin) VALUES (1, 'trader1', 'trader1@tradesense.ai', 'scrypt:32768:8:1$uZzIgIwaXArpQjHG$3b503ec4305e5fd024f148e6bcb1bf1823cdc4ae34c1d106e10259aaa57ee72ef376ac927ebf90c93e494385557dd57bdd01552a115e05a332f8a413311dbfd8', '2026-01-19 12:13:19.499653', FALSE, FALSE);
INSERT INTO users (id, username, email, password_hash, created_at, is_admin, is_superadmin) VALUES (2, 'trader2', 'trader2@tradesense.ai', 'scrypt:32768:8:1$ozMIgBqMhzbmrunM$7da0bdc5fbf6af426b3df274ce60f96cd979cdd2e690dbab10257574d9394d68fe11f84e0dcf3f30642929ffaa0587b6be46dd9ea51e42303cb1a6a2dc321080', '2026-01-19 12:13:19.499661', FALSE, FALSE);
INSERT INTO users (id, username, email, password_hash, created_at, is_admin, is_superadmin) VALUES (3, 'trader3', 'trader3@tradesense.ai', 'scrypt:32768:8:1$PNikwXF8XfOuPBTo$b77966235a1bec134678e3b97b2ab86189fa81ca1ff3338e1ea5108f3b89eb1ca05694bf501980ec239bd55a0c5d038eb3bf79d5da125159c7532c7372ee882f', '2026-01-19 12:13:19.499665', FALSE, FALSE);
INSERT INTO users (id, username, email, password_hash, created_at, is_admin, is_superadmin) VALUES (4, 'admin', 'admin@tradesense.ai', 'scrypt:32768:8:1$CDs617yX19bkNfNG$60c868c07bd0aea23807beb0eec3a88c978668a51b7af055dea1f9407219b4fc0b74e78fae4319cbb0e0fe4742e3b3169be230e764975b88db51463aa2e5c7f6', '2026-01-19 12:13:19.499668', TRUE, FALSE);

-- Insert data into challenges
INSERT INTO challenges (id, user_id, plan_type, starting_balance, current_balance, status, max_daily_loss_percent, max_total_loss_percent, profit_target_percent, created_at, ended_at, failure_reason) VALUES (1, 1, 'Elite', 25000.0, 27375.0, 'active', 5.0, 10.0, 10.0, '2026-01-04 12:13:19.511992', NULL, NULL);
INSERT INTO challenges (id, user_id, plan_type, starting_balance, current_balance, status, max_daily_loss_percent, max_total_loss_percent, profit_target_percent, created_at, ended_at, failure_reason) VALUES (2, 2, 'Pro', 10000.0, 9520.0, 'active', 5.0, 10.0, 10.0, '2026-01-11 12:13:19.517582', NULL, NULL);
INSERT INTO challenges (id, user_id, plan_type, starting_balance, current_balance, status, max_daily_loss_percent, max_total_loss_percent, profit_target_percent, created_at, ended_at, failure_reason) VALUES (3, 3, 'Starter', 5000.0, 5350.0, 'active', 5.0, 10.0, 10.0, '2026-01-07 12:13:19.519804', NULL, NULL);

-- Insert data into trades
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (1, 1, 'AAPL', 'buy', 50.0, 180.0, 9000.0, 24910.0, 0.0, '2026-01-04 12:13:19.533187');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (2, 1, 'AAPL', 'sell', 50.0, 185.5, 9275.0, 25002.75, 0.0, '2026-01-05 12:13:19.533509');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (3, 1, 'MSFT', 'buy', 30.0, 370.0, 11100.0, 24891.75, 0.0, '2026-01-06 12:13:19.534195');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (4, 1, 'MSFT', 'sell', 30.0, 380.0, 11400.0, 25005.75, 0.0, '2026-01-07 12:13:19.535043');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (5, 1, 'GOOGL', 'buy', 40.0, 140.0, 5600.0, 24949.75, 0.0, '2026-01-08 12:13:19.535185');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (6, 1, 'GOOGL', 'sell', 40.0, 145.0, 5800.0, 25007.75, 0.0, '2026-01-09 12:13:19.535300');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (7, 1, 'TSLA', 'buy', 20.0, 245.0, 4900.0, 24958.75, 0.0, '2026-01-10 12:13:19.535400');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (8, 1, 'TSLA', 'sell', 20.0, 242.0, 4840.0, 25007.15, 0.0, '2026-01-11 12:13:19.535493');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (9, 1, 'NVDA', 'buy', 25.0, 480.0, 12000.0, 24887.15, 0.0, '2026-01-12 12:13:19.535581');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (10, 1, 'NVDA', 'sell', 25.0, 495.0, 12375.0, 25010.9, 0.0, '2026-01-13 12:13:19.535663');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (11, 1, 'AMD', 'buy', 60.0, 150.0, 9000.0, 24920.9, 0.0, '2026-01-14 12:13:19.535792');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (12, 1, 'AMD', 'sell', 60.0, 156.0, 9360.0, 25014.5, 0.0, '2026-01-15 12:13:19.535867');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (13, 1, 'AMZN', 'buy', 15.0, 170.0, 2550.0, 24989.0, 0.0, '2026-01-16 12:13:19.535947');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (14, 1, 'META', 'buy', 20.0, 350.0, 7000.0, 24919.0, 0.0, '2026-01-17 12:13:19.536026');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (15, 2, 'AAPL', 'buy', 20.0, 178.0, 3560.0, 9964.4, 0.0, '2026-01-11 12:13:19.536115');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (16, 2, 'AAPL', 'sell', 20.0, 182.0, 3640.0, 10000.8, 0.0, '2026-01-12 12:13:19.536195');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (17, 2, 'TSLA', 'buy', 15.0, 250.0, 3750.0, 9963.3, 0.0, '2026-01-13 12:13:19.536282');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (18, 2, 'TSLA', 'sell', 15.0, 242.0, 3630.0, 9999.599999999999, 0.0, '2026-01-14 12:13:19.536354');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (19, 2, 'NVDA', 'buy', 10.0, 485.0, 4850.0, 9951.099999999999, 0.0, '2026-01-15 12:13:19.536404');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (20, 2, 'NVDA', 'sell', 10.0, 478.0, 4780.0, 9998.899999999998, 0.0, '2026-01-16 12:13:19.536452');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (21, 2, 'AMD', 'buy', 25.0, 155.0, 3875.0, 9960.149999999998, 0.0, '2026-01-18 12:13:19.536506');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (22, 2, 'AMD', 'sell', 25.0, 149.0, 3725.0, 9997.399999999998, 0.0, '2026-01-18 12:13:19.536553');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (23, 2, 'GOOGL', 'buy', 15.0, 143.0, 2145.0, 9975.949999999997, 0.0, '2026-01-18 12:13:19.536602');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (24, 2, 'GOOGL', 'sell', 15.0, 139.0, 2085.0, 9996.799999999997, 0.0, '2026-01-18 12:13:19.536654');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (25, 2, 'COIN', 'buy', 30.0, 180.0, 5400.0, 9942.799999999997, 0.0, '2026-01-19 12:13:19.536702');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (26, 3, 'AAPL', 'buy', 15.0, 179.0, 2685.0, 4973.15, 0.0, '2026-01-07 12:13:19.536751');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (27, 3, 'AAPL', 'sell', 15.0, 183.0, 2745.0, 5000.599999999999, 0.0, '2026-01-08 12:13:19.536799');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (28, 3, 'MSFT', 'buy', 8.0, 372.0, 2976.0, 4970.839999999999, 0.0, '2026-01-09 12:13:19.536846');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (29, 3, 'MSFT', 'sell', 8.0, 376.0, 3008.0, 5000.919999999999, 0.0, '2026-01-10 12:13:19.536907');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (30, 3, 'GOOGL', 'buy', 20.0, 141.0, 2820.0, 4972.719999999999, 0.0, '2026-01-11 12:13:19.536955');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (31, 3, 'GOOGL', 'sell', 20.0, 144.0, 2880.0, 5001.5199999999995, 0.0, '2026-01-12 12:13:19.537068');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (32, 3, 'TSLA', 'buy', 10.0, 246.0, 2460.0, 4976.919999999999, 0.0, '2026-01-13 12:13:19.537205');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (33, 3, 'TSLA', 'sell', 10.0, 243.0, 2430.0, 5001.219999999999, 0.0, '2026-01-14 12:13:19.537313');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (34, 3, 'NVDA', 'buy', 12.0, 482.0, 5784.0, 4943.379999999999, 0.0, '2026-01-15 12:13:19.537405');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (35, 3, 'NVDA', 'sell', 12.0, 490.0, 5880.0, 5002.179999999999, 0.0, '2026-01-16 12:13:19.537492');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (36, 3, 'AMD', 'buy', 25.0, 152.0, 3800.0, 4964.179999999999, 0.0, '2026-01-17 12:13:19.537585');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, profit_loss, created_at) VALUES (37, 3, 'INTC', 'buy', 40.0, 45.0, 1800.0, 4946.179999999999, 0.0, '2026-01-18 12:13:19.537668');

-- Reset sequences for auto-increment columns (PostgreSQL)
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('challenges_id_seq', COALESCE((SELECT MAX(id) FROM challenges), 1));
SELECT setval('trades_id_seq', COALESCE((SELECT MAX(id) FROM trades), 1));
SELECT setval('payments_id_seq', COALESCE((SELECT MAX(id) FROM payments), 1));
SELECT setval('portfolio_id_seq', COALESCE((SELECT MAX(id) FROM portfolio), 1));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_challenges_user_id ON challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_trades_challenge_id ON trades(challenge_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Database export completed successfully
