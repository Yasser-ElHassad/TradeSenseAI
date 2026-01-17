-- TradeSense Database SQL Dump
-- Generated: 2026-01-17 15:40:55
-- Compatible with PostgreSQL

-- Drop existing tables
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Challenges table
CREATE TABLE challenges (
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
);

-- Create Positions table
CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    average_price FLOAT NOT NULL,
    current_price FLOAT,
    unrealized_pnl FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Trades table
CREATE TABLE trades (
    id SERIAL PRIMARY KEY,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    trade_type VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL,
    price FLOAT NOT NULL,
    total_value FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data into users
INSERT INTO users (id, username, email, password_hash, created_at, is_admin, is_superadmin) VALUES (1, 'admin', 'admin@tradesense.ai', 'scrypt:32768:8:1$8oCDyQLQ01UKAtKr$89e4c73c0c312be7b796d9039f9273ee02ca6c5f72b997c2e534ebafce35c6ab520230daf228ee8e63049efa8d3c6ced7515692a44184cfe22856e310289c81e', '2026-01-14 17:20:25.945260', 1, 0);
INSERT INTO users (id, username, email, password_hash, created_at, is_admin, is_superadmin) VALUES (2, 'testuser', 'test@test.com', 'scrypt:32768:8:1$AKv0O4v0AEa1crBf$a751a470c52a6beb6359a3960d17f0ede59d6b20f850a9c72b154e56669655b25f2388071598fadde701a630d81582bd429f9672035edd8f59f71c6f76f043ef', '2026-01-14 17:20:25.945271', 0, 0);
INSERT INTO users (id, username, email, password_hash, created_at, is_admin, is_superadmin) VALUES (3, 'Yasser13', 'ressay147@hotmail.com', 'scrypt:32768:8:1$mHxt6R8tcGg0lpIe$25615b383b3a047a451604942b2d0ca998640616bcd484ce474a7f7c378de6bf1f9fa126bca6bae5f648ca2e2a975bc154a5e3234bead7252620e405117aab22', '2026-01-14 17:39:43.280166', 0, 0);
INSERT INTO users (id, username, email, password_hash, created_at, is_admin, is_superadmin) VALUES (4, 'Yasser1', 'ressay147@gmail.com', 'scrypt:32768:8:1$NcPyLog6pxd9nYVb$3f7deb85bbde64c79756d430d857f725c1a82002ebae5510898961a7723822a9aaf00c6adb7faa91500296b6db36a652a5e3f6e9e5ca30461ae163ecef43bfe4', '2026-01-15 09:54:32.657023', 0, 0);
INSERT INTO users (id, username, email, password_hash, created_at, is_admin, is_superadmin) VALUES (5, 'Yasser14', 'ressay1473@hotmail.com', 'scrypt:32768:8:1$synbTEyEhNqGmubE$88e3f14ea659f12e2b8670c8f25f1fdd71116bde56500c3b12231e21040cef0d3a528f263bfb40ea05595bcc703e130f20d50900a64bf6ca9f98789f8eca27e8', '2026-01-17 12:03:03.588833', 0, 0);

-- Insert data into challenges
INSERT INTO challenges (id, user_id, plan_type, starting_balance, current_balance, status, max_daily_loss_percent, max_total_loss_percent, profit_target_percent, created_at, ended_at) VALUES (1, 3, 'Pro', 10000.0, 7156.9, 'failed', 5.0, 10.0, 10.0, '2026-01-14 17:48:17.024636', '2026-01-16 16:13:08.304969');
INSERT INTO challenges (id, user_id, plan_type, starting_balance, current_balance, status, max_daily_loss_percent, max_total_loss_percent, profit_target_percent, created_at, ended_at) VALUES (2, 1, 'Pro', 10000.0, 10000.0, 'active', 5.0, 10.0, 10.0, '2026-01-14 17:49:12.518646', NULL);
INSERT INTO challenges (id, user_id, plan_type, starting_balance, current_balance, status, max_daily_loss_percent, max_total_loss_percent, profit_target_percent, created_at, ended_at) VALUES (3, 4, 'Pro', 10000.0, 7968.5, 'failed', 5.0, 10.0, 10.0, '2026-01-15 09:54:58.790930', '2026-01-15 10:52:02.924565');
INSERT INTO challenges (id, user_id, plan_type, starting_balance, current_balance, status, max_daily_loss_percent, max_total_loss_percent, profit_target_percent, created_at, ended_at) VALUES (4, 5, 'Pro', 10000.0, 3385.66, 'failed', 5.0, 10.0, 10.0, '2026-01-17 12:03:17.819087', '2026-01-17 14:37:57.312755');

-- Insert data into trades
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, created_at) VALUES (1, 1, 'IAM', 'buy', 5.0, 84.52, 422.6, 9577.4, '2026-01-14 18:23:09.748414');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, created_at) VALUES (2, 3, 'LBL', 'buy', 10.0, 203.15, 2031.5, 7968.5, '2026-01-15 10:52:02.771149');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, created_at) VALUES (3, 1, 'TAQA', 'buy', 10.0, 242.05, 2420.5, 7156.9, '2026-01-16 16:13:08.017485');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, created_at) VALUES (4, 1, 'TAQA', 'buy', 10.0, 242.05, 2420.5, 7156.9, '2026-01-16 16:13:08.124681');
INSERT INTO trades (id, challenge_id, symbol, action, quantity, price, total_value, balance_after_trade, created_at) VALUES (5, 4, 'ETH-USD', 'buy', 2.0, 3307.17, 6614.34, 3385.66, '2026-01-17 14:37:56.727558');

-- Reset sequences for auto-increment columns
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('challenges_id_seq', (SELECT MAX(id) FROM challenges));
SELECT setval('positions_id_seq', (SELECT MAX(id) FROM positions));
SELECT setval('trades_id_seq', (SELECT MAX(id) FROM trades));

-- Create indexes for performance
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_trades_challenge_id ON trades(challenge_id);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_positions_challenge_id ON positions(challenge_id);
CREATE INDEX idx_positions_symbol ON positions(symbol);

-- Database export completed successfully
