"""
Market Routes
Unified API for fetching market prices from both Moroccan and International stocks.
Includes caching to handle Yahoo Finance rate limiting.
"""
from flask import Blueprint, request, jsonify
from services.morocco_scraper import scrape_morocco_stock, MOROCCO_STOCKS
from services.market_data import get_realtime_price, get_cache_stats, clear_price_cache, get_historical_data

market_bp = Blueprint('market', __name__)

# List of known Moroccan stock symbols
MOROCCAN_SYMBOLS = set(MOROCCO_STOCKS.keys())


def is_moroccan_stock(symbol: str) -> bool:
    """
    Check if a symbol is a Moroccan stock.
    
    Args:
        symbol: Stock symbol to check
    
    Returns:
        True if Moroccan stock, False otherwise
    """
    return symbol.upper().strip() in MOROCCAN_SYMBOLS


def get_price_for_symbol(symbol: str) -> dict:
    """
    Get price for a single symbol, automatically detecting if it's Moroccan or International.
    
    Args:
        symbol: Stock symbol
    
    Returns:
        Unified JSON format with price data
    """
    symbol_upper = symbol.upper().strip()
    
    if is_moroccan_stock(symbol_upper):
        # Use morocco_scraper for Moroccan stocks
        data = scrape_morocco_stock(symbol_upper)
        
        # Unify format
        if 'error' in data:
            return data
        
        return {
            'symbol': data.get('symbol'),
            'name': data.get('stock_name'),
            'current_price': data.get('current_price'),
            'previous_close': data.get('previous_close'),
            'change': data.get('change'),
            'change_percent': data.get('change_percent'),
            'timestamp': data.get('timestamp'),
            'market': data.get('market', 'Casablanca Stock Exchange'),
            'currency': 'MAD',
            'source': data.get('source', 'morocco_scraper')
        }
    else:
        # Use yfinance for international stocks
        data = get_realtime_price(symbol_upper)
        
        # Unify format
        if 'error' in data:
            return data
        
        # Calculate change if we have previous_close
        change = None
        if data.get('previous_close') and data.get('current_price'):
            change = round(data['current_price'] - data['previous_close'], 2)
        
        return {
            'symbol': data.get('symbol'),
            'name': None,  # yfinance doesn't return name in get_realtime_price
            'current_price': data.get('current_price'),
            'previous_close': data.get('previous_close'),
            'change': change,
            'change_percent': data.get('change_percent'),
            'timestamp': data.get('timestamp'),
            'market': 'International',
            'currency': 'USD',
            'source': 'yfinance'
        }


@market_bp.route('/price/<symbol>', methods=['GET'])
def get_single_price(symbol: str):
    """
    Get price for a single stock symbol.
    
    Automatically detects if the symbol is Moroccan (IAM, ATW, etc.) or International
    and uses the appropriate data source.
    
    Args:
        symbol: Stock symbol (e.g., 'IAM', 'AAPL', 'TSLA')
    
    Returns:
        JSON with unified price data format:
        {
            "symbol": "IAM",
            "name": "Itissalat Al-Maghrib (IAM)",
            "current_price": 85.50,
            "previous_close": 84.00,
            "change": 1.50,
            "change_percent": 1.79,
            "timestamp": "2024-01-01T12:00:00",
            "market": "Casablanca Stock Exchange",
            "currency": "MAD",
            "source": "morocco_scraper"
        }
    """
    if not symbol:
        return jsonify({
            'error': 'Invalid symbol',
            'message': 'Symbol is required'
        }), 400
    
    result = get_price_for_symbol(symbol)
    
    if 'error' in result:
        return jsonify(result), 404
    
    return jsonify(result), 200


@market_bp.route('/prices', methods=['GET'])
def get_multiple_prices():
    """
    Get prices for multiple stock symbols.
    
    Query Parameters:
        symbols: Comma-separated list of stock symbols (e.g., 'IAM,AAPL,ATW,TSLA')
    
    Returns:
        JSON array with price data for all requested symbols:
        {
            "prices": [
                {
                    "symbol": "IAM",
                    "current_price": 85.50,
                    ...
                },
                {
                    "symbol": "AAPL",
                    "current_price": 150.50,
                    ...
                }
            ],
            "count": 2,
            "errors": []
        }
    """
    symbols_param = request.args.get('symbols', '')
    
    if not symbols_param:
        return jsonify({
            'error': 'Missing parameter',
            'message': 'Query parameter "symbols" is required (comma-separated list)'
        }), 400
    
    # Parse symbols from comma-separated string
    symbols = [s.strip() for s in symbols_param.split(',') if s.strip()]
    
    if not symbols:
        return jsonify({
            'error': 'Invalid symbols',
            'message': 'No valid symbols provided'
        }), 400
    
    prices = []
    errors = []
    
    for symbol in symbols:
        result = get_price_for_symbol(symbol)
        
        if 'error' in result:
            errors.append({
                'symbol': symbol.upper(),
                'error': result.get('error'),
                'message': result.get('message')
            })
        else:
            prices.append(result)
    
    return jsonify({
        'prices': prices,
        'count': len(prices),
        'errors': errors
    }), 200


@market_bp.route('/cache/stats', methods=['GET'])
def cache_stats():
    """
    Get cache statistics for monitoring.
    
    Returns:
        JSON with cache statistics
    """
    stats = get_cache_stats()
    return jsonify(stats), 200


@market_bp.route('/cache/clear', methods=['POST'])
def clear_cache():
    """
    Clear the price cache.
    
    Query Parameters:
        symbol (optional): Clear cache for specific symbol only
    
    Returns:
        JSON confirmation message
    """
    symbol = request.args.get('symbol')
    clear_price_cache(symbol)
    
    if symbol:
        return jsonify({
            'message': f'Cache cleared for symbol: {symbol.upper()}'
        }), 200
    else:
        return jsonify({
            'message': 'All cache cleared'
        }), 200


@market_bp.route('/history/<symbol>', methods=['GET'])
def get_history(symbol: str):
    """
    Get historical price data for a symbol (for charts).
    
    Query Parameters:
        period: Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max) - default: 1mo
        interval: Data interval (1m, 5m, 15m, 30m, 1h, 1d, 1wk, 1mo) - default: 1h
    
    Returns:
        JSON with historical OHLCV data for charting
    """
    if not symbol:
        return jsonify({
            'error': 'Invalid symbol',
            'message': 'Symbol is required'
        }), 400
    
    period = request.args.get('period', '1mo')
    interval = request.args.get('interval', '1h')
    
    # Validate period
    valid_periods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'max']
    if period not in valid_periods:
        period = '1mo'
    
    # Validate interval
    valid_intervals = ['1m', '5m', '15m', '30m', '1h', '1d', '1wk', '1mo']
    if interval not in valid_intervals:
        interval = '1h'
    
    symbol_upper = symbol.upper().strip()
    
    # For Moroccan stocks, generate mock historical data
    if is_moroccan_stock(symbol_upper):
        from services.morocco_scraper import generate_mock_historical_data
        result = generate_mock_historical_data(symbol_upper, period, interval)
    else:
        # Use yfinance for international stocks
        result = get_historical_data(symbol_upper, period, interval)
    
    if 'error' in result:
        return jsonify(result), 404
    
    return jsonify(result), 200
