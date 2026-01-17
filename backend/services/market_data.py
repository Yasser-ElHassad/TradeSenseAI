"""
Market Data Service
Provides functions to fetch real-time market data using yfinance library.
Includes caching to avoid Yahoo Finance rate limiting (429 errors).
Updated January 2026 to fix yfinance API compatibility issues.
"""
import yfinance as yf
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
import threading
import time
import logging

# Configure logging
logger = logging.getLogger(__name__)

# ============ CACHE CONFIGURATION ============
# In-memory cache to avoid rate limiting
_price_cache = {}
_cache_lock = threading.Lock()

# Cache duration in seconds (increased to 120 seconds to reduce Yahoo rate limiting)
CACHE_DURATION_SECONDS = 120

# Rate limiting configuration
_last_request_time = {}
MIN_REQUEST_INTERVAL = 2.0  # Minimum seconds between requests for same symbol (increased)

# Yahoo Finance request timeout
YF_TIMEOUT = 10  # seconds


def _get_cache_key(symbol: str) -> str:
    """Generate cache key for a symbol."""
    return f"price_{symbol.upper().strip()}"


def _is_cache_valid(cache_entry: dict) -> bool:
    """Check if a cache entry is still valid."""
    if not cache_entry:
        return False
    cached_time = cache_entry.get('_cached_at')
    if not cached_time:
        return False
    age = (datetime.utcnow() - cached_time).total_seconds()
    return age < CACHE_DURATION_SECONDS


def _get_from_cache(symbol: str) -> Optional[Dict[str, Any]]:
    """Get price data from cache if valid."""
    cache_key = _get_cache_key(symbol)
    with _cache_lock:
        cache_entry = _price_cache.get(cache_key)
        if cache_entry and _is_cache_valid(cache_entry):
            # Return a copy without the internal _cached_at field
            result = {k: v for k, v in cache_entry.items() if not k.startswith('_')}
            result['_from_cache'] = True
            return result
    return None


def _save_to_cache(symbol: str, data: dict) -> None:
    """Save price data to cache."""
    if 'error' in data:
        return  # Don't cache errors
    cache_key = _get_cache_key(symbol)
    cache_entry = data.copy()
    cache_entry['_cached_at'] = datetime.utcnow()
    with _cache_lock:
        _price_cache[cache_key] = cache_entry


def _rate_limit_check(symbol: str) -> bool:
    """Check if we should wait before making a request."""
    symbol_upper = symbol.upper().strip()
    current_time = time.time()
    with _cache_lock:
        last_time = _last_request_time.get(symbol_upper, 0)
        if current_time - last_time < MIN_REQUEST_INTERVAL:
            return False  # Too soon, should wait
        _last_request_time[symbol_upper] = current_time
    return True


def clear_price_cache(symbol: str = None) -> None:
    """Clear price cache for a symbol or all symbols."""
    with _cache_lock:
        if symbol:
            cache_key = _get_cache_key(symbol)
            _price_cache.pop(cache_key, None)
        else:
            _price_cache.clear()


def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics for monitoring."""
    with _cache_lock:
        valid_entries = sum(1 for entry in _price_cache.values() if _is_cache_valid(entry))
        return {
            'total_entries': len(_price_cache),
            'valid_entries': valid_entries,
            'cache_duration_seconds': CACHE_DURATION_SECONDS,
            'symbols_cached': list(_price_cache.keys())
        }


def get_realtime_price(symbol: str) -> Dict[str, Any]:
    """
    Fetch current real-time price for a single symbol.
    Uses caching to avoid Yahoo Finance rate limiting.
    
    Args:
        symbol (str): Stock/crypto symbol (e.g., 'AAPL', 'TSLA', 'BTC-USD')
    
    Returns:
        dict: JSON object with symbol, current_price, change_percent, timestamp
              Returns error dict if symbol not found or error occurs
    
    Example:
        >>> get_realtime_price('AAPL')
        {
            'symbol': 'AAPL',
            'current_price': 150.50,
            'change_percent': 2.5,
            'timestamp': '2024-01-01T12:00:00'
        }
    """
    if not symbol or not isinstance(symbol, str):
        return {
            'error': 'Invalid symbol',
            'message': 'Symbol must be a non-empty string',
            'symbol': symbol
        }
    
    symbol_upper = symbol.upper().strip()
    
    # Check cache first
    cached_data = _get_from_cache(symbol_upper)
    if cached_data:
        return cached_data
    
    # Rate limit check - if too many requests, return cached or wait
    if not _rate_limit_check(symbol_upper):
        # Try cache again or return rate limit error
        cached_data = _get_from_cache(symbol_upper)
        if cached_data:
            return cached_data
        return {
            'error': 'Rate limited',
            'message': f'Too many requests for {symbol_upper}. Please wait a moment.',
            'symbol': symbol_upper
        }
    
    try:
        # Fetch ticker data with timeout
        ticker = yf.Ticker(symbol_upper)
        
        # First try fast_info which is faster and more reliable in newer yfinance versions
        fast_info = None
        try:
            fast_info = ticker.fast_info
        except Exception as e:
            logger.warning(f"fast_info failed for {symbol_upper}: {e}")
        
        # If fast_info works, use it (faster path)
        # Note: yfinance v1.0 uses camelCase keys in fast_info dict
        if fast_info:
            last_price = fast_info.get('lastPrice') or getattr(fast_info, 'last_price', None)
            prev_close = fast_info.get('previousClose') or getattr(fast_info, 'previous_close', None)
            
            if last_price:
                current_price = float(last_price)
                previous_close = float(prev_close) if prev_close else None
                
                change_percent = 0.0
                if previous_close and previous_close > 0:
                    change_percent = ((current_price - previous_close) / previous_close) * 100
                
                result = {
                    'symbol': symbol_upper,
                    'current_price': round(current_price, 2),
                    'change_percent': round(change_percent, 2),
                    'timestamp': datetime.utcnow().isoformat(),
                    'previous_close': round(previous_close, 2) if previous_close else None
                }
                _save_to_cache(symbol_upper, result)
                return result
        
        # Fallback: Get current price from latest history
        try:
            hist = ticker.history(period="5d", interval="1d", timeout=YF_TIMEOUT)
        except Exception as hist_error:
            logger.warning(f"History fetch failed for {symbol_upper}: {hist_error}")
            hist = None
        
        # Get info for previous close (can be slow, only if needed)
        info = {}
        try:
            info = ticker.info if ticker.info else {}
        except Exception as info_error:
            logger.warning(f"Info fetch failed for {symbol_upper}: {info_error}")
            info = {}
        
        # Determine current price
        if hist is not None and not hist.empty:
            current_price = float(hist['Close'].iloc[-1])
        elif 'currentPrice' in info and info['currentPrice']:
            current_price = float(info['currentPrice'])
        elif 'regularMarketPrice' in info and info['regularMarketPrice']:
            current_price = float(info['regularMarketPrice'])
        else:
            return {
                'error': 'Price not available',
                'message': f'Could not fetch price data for symbol {symbol_upper}',
                'symbol': symbol_upper
            }
        
        # Get previous close for change calculation
        previous_close = None
        if 'previousClose' in info and info['previousClose']:
            previous_close = float(info['previousClose'])
        elif hist is not None and not hist.empty and len(hist) > 1:
            # Use the previous day's close if available
            previous_close = float(hist['Close'].iloc[-2])
        elif 'regularMarketPreviousClose' in info and info['regularMarketPreviousClose']:
            previous_close = float(info['regularMarketPreviousClose'])
        
        # Calculate change percent
        change_percent = 0.0
        if previous_close and previous_close > 0:
            change_percent = ((current_price - previous_close) / previous_close) * 100
        
        # Get timestamp
        timestamp = datetime.utcnow().isoformat()
        
        result = {
            'symbol': symbol_upper,
            'current_price': round(current_price, 2),
            'change_percent': round(change_percent, 2),
            'timestamp': timestamp,
            'previous_close': round(previous_close, 2) if previous_close else None
        }
        
        # Save to cache for future requests
        _save_to_cache(symbol_upper, result)
        
        return result
    
    except Exception as e:
        # Handle various error cases
        error_message = str(e).lower()
        
        # Check for rate limiting (429 error)
        if '429' in str(e) or 'too many requests' in error_message or 'rate limit' in error_message:
            # Try to return cached data if available (even if expired)
            cache_key = _get_cache_key(symbol_upper)
            with _cache_lock:
                cache_entry = _price_cache.get(cache_key)
                if cache_entry:
                    result = {k: v for k, v in cache_entry.items() if not k.startswith('_')}
                    result['_from_cache'] = True
                    result['_cache_note'] = 'Rate limited, returning cached data'
                    return result
            return {
                'error': 'Rate limited',
                'message': f'Yahoo Finance rate limit reached for {symbol_upper}. Please try again in a few minutes.',
                'symbol': symbol_upper
            }
        elif 'symbol' in error_message or 'not found' in error_message or 'invalid' in error_message:
            return {
                'error': 'Symbol not found',
                'message': f'Symbol {symbol_upper} could not be found or is invalid',
                'symbol': symbol_upper
            }
        elif 'network' in error_message or 'connection' in error_message or 'timeout' in error_message:
            return {
                'error': 'Network error',
                'message': f'Failed to fetch data for {symbol_upper}: Network connection issue',
                'symbol': symbol_upper
            }
        else:
            return {
                'error': 'Fetch error',
                'message': f'An error occurred while fetching data for {symbol_upper}: {str(e)}',
                'symbol': symbol_upper
            }


def get_multiple_prices(symbols_list: List[str]) -> List[Dict[str, Any]]:
    """
    Fetch prices for multiple symbols at once.
    
    Args:
        symbols_list (List[str]): List of stock/crypto symbols
    
    Returns:
        List[Dict]: Array of price objects, each containing symbol, current_price, 
                   change_percent, timestamp. Failed symbols will have error fields.
    
    Example:
        >>> get_multiple_prices(['AAPL', 'TSLA', 'BTC-USD'])
        [
            {
                'symbol': 'AAPL',
                'current_price': 150.50,
                'change_percent': 2.5,
                'timestamp': '2024-01-01T12:00:00'
            },
            {
                'symbol': 'TSLA',
                'current_price': 250.75,
                'change_percent': -1.2,
                'timestamp': '2024-01-01T12:00:00'
            },
            ...
        ]
    """
    if not symbols_list:
        return []
    
    if not isinstance(symbols_list, list):
        return [{
            'error': 'Invalid input',
            'message': 'symbols_list must be a list'
        }]
    
    # Filter out empty strings and normalize
    valid_symbols = [s.upper().strip() for s in symbols_list if s and isinstance(s, str)]
    
    if not valid_symbols:
        return [{
            'error': 'Invalid input',
            'message': 'No valid symbols provided in symbols_list'
        }]
    
    results = []
    timestamp = datetime.utcnow().isoformat()
    
    # Fetch each symbol individually using the get_realtime_price function
    # This ensures consistency and proper error handling
    for symbol in valid_symbols:
        try:
            price_data = get_realtime_price(symbol)
            # Ensure timestamp is consistent across all results
            if 'timestamp' not in price_data or price_data.get('timestamp') is None:
                price_data['timestamp'] = timestamp
            results.append(price_data)
        except Exception as e:
            # Fallback error handling if get_realtime_price raises an exception
            error_message = str(e).lower()
            if 'symbol' in error_message or 'not found' in error_message:
                results.append({
                    'symbol': symbol,
                    'error': 'Symbol not found',
                    'message': f'Symbol {symbol} could not be found or is invalid',
                    'timestamp': timestamp
                })
            else:
                results.append({
                    'symbol': symbol,
                    'error': 'Fetch error',
                    'message': f'Error fetching data for {symbol}: {str(e)}',
                    'timestamp': timestamp
                })
    
    return results


def get_historical_data(symbol: str, period: str = '1mo', interval: str = '1h') -> Dict[str, Any]:
    """
    Fetch historical price data for charting.
    
    Args:
        symbol: Stock/crypto symbol (e.g., 'AAPL', 'BTC-USD')
        period: Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max)
        interval: Data interval (1m, 5m, 15m, 30m, 1h, 1d, 1wk, 1mo)
    
    Returns:
        dict: Historical OHLCV data formatted for charting
    """
    if not symbol or not isinstance(symbol, str):
        return {
            'error': 'Invalid symbol',
            'message': 'Symbol must be a non-empty string',
            'symbol': symbol
        }
    
    symbol_upper = symbol.upper().strip()
    
    try:
        ticker = yf.Ticker(symbol_upper)
        hist = ticker.history(period=period, interval=interval)
        
        if hist is None or hist.empty:
            return {
                'error': 'No data',
                'message': f'No historical data available for {symbol_upper}',
                'symbol': symbol_upper
            }
        
        # Format data for lightweight-charts (TradingView)
        data = []
        for idx, row in hist.iterrows():
            # Convert timestamp to Unix seconds
            timestamp = int(idx.timestamp())
            
            data.append({
                'time': timestamp,
                'open': round(float(row['Open']), 2),
                'high': round(float(row['High']), 2),
                'low': round(float(row['Low']), 2),
                'close': round(float(row['Close']), 2),
                'value': round(float(row['Close']), 2),  # For line charts
                'volume': int(row['Volume']) if 'Volume' in row else 0
            })
        
        return {
            'symbol': symbol_upper,
            'period': period,
            'interval': interval,
            'count': len(data),
            'data': data
        }
    
    except Exception as e:
        logger.error(f"Historical data error for {symbol_upper}: {e}")
        return {
            'error': 'Fetch error',
            'message': f'Failed to fetch historical data for {symbol_upper}: {str(e)}',
            'symbol': symbol_upper
        }

