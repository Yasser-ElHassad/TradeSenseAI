"""
Morocco Stock Scraper Service
Scrapes Moroccan stock prices from Casablanca Bourse and financial news sites.
Includes caching, retry logic, and fallback to mock data if scraping is blocked.
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import time
import random
import re

# Cache storage for stock prices (in-memory cache)
_price_cache = {}
_cache_duration = timedelta(seconds=60)  # Cache for 60 seconds

# Headers to mimic a real browser request
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

# Known Moroccan stock symbols and their company names
MOROCCO_STOCKS = {
    'IAM': 'Itissalat Al-Maghrib (IAM)',
    'ATW': 'Attijariwafa Bank',
    'BCP': 'Banque Centrale Populaire',
    'BMCE': 'Bank of Africa',
    'CIH': 'Crédit Immobilier et Hôtelier',
    'HPS': 'Holcim Maroc',
    'LESIEUR': 'Lesieur Cristal',
    'LBL': 'LafargeHolcim Maroc',
    'SNEP': 'Société Nouvelle d\'Électrothermie',
    'TOTAL': 'Total Maroc',
    'TAQA': 'TAQA Morocco',
}


def _get_from_cache(symbol: str) -> Optional[Dict[str, Any]]:
    """Check if symbol data is in cache and still valid"""
    if symbol in _price_cache:
        cached_data, cache_time = _price_cache[symbol]
        if datetime.utcnow() - cache_time < _cache_duration:
            return cached_data
        else:
            # Remove expired cache
            del _price_cache[symbol]
    return None


def _save_to_cache(symbol: str, data: Dict[str, Any]):
    """Save symbol data to cache"""
    _price_cache[symbol] = (data, datetime.utcnow())


def _generate_mock_data(symbol: str) -> Dict[str, Any]:
    """
    Generate mock data for Moroccan stocks if scraping is blocked or fails.
    Creates realistic price movements with random variations.
    """
    symbol_upper = symbol.upper()
    
    # Base prices for known stocks (in MAD - Moroccan Dirham)
    # Base prices for known stocks (in USD)
    base_prices = {
    "IAM": 12.21,        # Itissalat Al-Maghrib
    "ATW": 81.35,        # Attijariwafa Bank
    "BCP": 31.04,        # Banque Centrale Populaire
    "BMCE": 23.97,       # Bank of Africa
    "CIH": 43.98,        # Crédit Immobilier et Hôtelier
    "HPS": 63.54,        # HPS
    "LESIEUR": 40.06,    # Lesieur Cristal
    "LBL": 200.73,       # LafargeHolcim Maroc
    "SNEP": 53.38,       # SNEP
    "TOTAL": 187.78,     # Total Maroc
    "TAQA": 237.57       # TAQA Morocco
    }

    
    # Get base price or generate one
    if symbol_upper in base_prices:
        base_price = base_prices[symbol_upper]
        stock_name = MOROCCO_STOCKS.get(symbol_upper, f'{symbol_upper} Stock')
    else:
        # Generate a random base price for unknown symbols
        base_price = random.uniform(50, 500)
        stock_name = f'{symbol_upper} Stock'
    
    # Generate realistic price movement (-3% to +3%)
    change_percent = random.uniform(-3.0, 3.0)
    current_price = round(base_price * (1 + change_percent / 100), 2)
    previous_close = base_price
    
    return {
        'symbol': symbol_upper,
        'stock_name': stock_name,
        'current_price': current_price,
        'previous_close': round(previous_close, 2),
        'change_percent': round(change_percent, 2),
        'change': round(current_price - previous_close, 2),
        'timestamp': datetime.utcnow().isoformat(),
        'source': 'mock_data',
        'market': 'Casablanca Stock Exchange'
    }


def _scrape_casablanca_bourse(symbol: str, retries: int = 3) -> Optional[Dict[str, Any]]:
    """
    Attempt to scrape from Casablanca Bourse website.
    
    Args:
        symbol: Stock symbol (e.g., 'IAM', 'ATW')
        retries: Number of retry attempts
    
    Returns:
        Dict with stock data or None if scraping fails
    """
    symbol_upper = symbol.upper()
    
    # Try multiple URL patterns
    url_patterns = [
        f'https://www.casablanca-bourse.com/bourseweb/en/Negociation-History.aspx?CodeValue={symbol_upper}',
        f'https://www.casablanca-bourse.com/bourseweb/en/Stock-Prices.aspx?CodeValue={symbol_upper}',
        f'https://www.casablanca-bourse.com/bourseweb/Stock.aspx?CodeValue={symbol_upper}',
    ]
    
    for attempt in range(retries):
        for url in url_patterns:
            try:
                response = requests.get(url, headers=HEADERS, timeout=10, allow_redirects=True)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, 'html.parser')
                    
                    # Try to find price in various possible HTML structures
                    # Common patterns in financial websites
                    price_selectors = [
                        {'class': 'price'},
                        {'class': 'current-price'},
                        {'class': 'stock-price'},
                        {'id': 'currentPrice'},
                        {'class': 'quote-price'},
                    ]
                    
                    price = None
                    change = None
                    change_percent = None
                    stock_name = MOROCCO_STOCKS.get(symbol_upper, symbol_upper)
                    
                    # Search for price
                    for selector in price_selectors:
                        price_elem = soup.find('span', selector) or soup.find('div', selector) or soup.find('td', selector)
                        if price_elem:
                            try:
                                price_text = price_elem.get_text(strip=True).replace(',', '').replace(' MAD', '').replace(' DH', '')
                                price = float(price_text)
                                break
                            except (ValueError, AttributeError):
                                continue
                    
                    # If not found with classes, try common text patterns
                    if price is None:
                        # Look for price-like numbers in the page
                        text = soup.get_text()
                        # Try to find patterns like "85.50 MAD" or "Price: 450.00"
                        price_matches = re.findall(r'(\d+\.?\d*)\s*(?:MAD|DH|dirham)', text, re.IGNORECASE)
                        if price_matches:
                            try:
                                price = float(price_matches[0])
                            except (ValueError, IndexError):
                                pass
                    
                    # Search for change percent
                    change_selectors = [
                        {'class': 'change-percent'},
                        {'class': 'change'},
                        {'class': 'variation'},
                    ]
                    
                    for selector in change_selectors:
                        change_elem = soup.find('span', selector) or soup.find('div', selector)
                        if change_elem:
                            try:
                                change_text = change_elem.get_text(strip=True).replace('%', '').replace('+', '')
                                change_percent = float(change_text)
                                break
                            except (ValueError, AttributeError):
                                continue
                    
                    # If we found a price, construct the result
                    if price is not None:
                        # Calculate previous close and change
                        if change_percent is not None and change_percent != 0:
                            # If we have change_percent, calculate previous_close
                            previous_close = price / (1 + (change_percent / 100))
                            change = price - previous_close
                        else:
                            # If no change_percent, try to find previous_close separately
                            previous_close = None
                            change = 0.0
                            change_percent = 0.0
                            
                            # Try to find previous close in the page
                            prev_close_elem = soup.find('span', {'class': 'previous-close'}) or \
                                            soup.find('div', {'class': 'prev-close'}) or \
                                            soup.find('td', {'class': 'prev-close'})
                            if prev_close_elem:
                                try:
                                    prev_text = prev_close_elem.get_text(strip=True).replace(',', '').replace(' MAD', '').replace(' DH', '')
                                    previous_close = float(prev_text)
                                    change = price - previous_close
                                    change_percent = (change / previous_close * 100) if previous_close > 0 else 0.0
                                except (ValueError, AttributeError):
                                    pass
                        
                        return {
                            'symbol': symbol_upper,
                            'stock_name': stock_name,
                            'current_price': round(price, 2),
                            'previous_close': round(previous_close, 2) if previous_close else None,
                            'change_percent': round(change_percent, 2),
                            'change': round(change, 2) if previous_close else 0.0,
                            'timestamp': datetime.utcnow().isoformat(),
                            'source': 'casablanca_bourse',
                            'market': 'Casablanca Stock Exchange'
                        }
                
            except requests.exceptions.RequestException as e:
                # Network error, try next URL or retry
                continue
            except Exception as e:
                # Parsing error, try next URL
                continue
        
        # Wait before retry
        if attempt < retries - 1:
            time.sleep(2 ** attempt)  # Exponential backoff
    
    return None


def _scrape_alternative_sources(symbol: str) -> Optional[Dict[str, Any]]:
    """
    Try alternative sources for Moroccan stock data.
    This could include financial news sites or other aggregators.
    """
    symbol_upper = symbol.upper()
    
    # Alternative sources (example patterns - may need adjustment)
    alternative_urls = [
        f'https://www.investing.com/equities/{symbol_upper.lower()}-morocco',
        f'https://www.bloomberg.com/quote/{symbol_upper}:CM',
    ]
    
    for url in alternative_urls:
        try:
            response = requests.get(url, headers=HEADERS, timeout=10, allow_redirects=False)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                # Similar parsing logic as above
                # This would need to be customized per source
                # For now, return None to fall back to mock data
                pass
        except Exception:
            continue
    
    return None


def scrape_morocco_stock(symbol: str, use_cache: bool = True, fallback_to_mock: bool = True) -> Dict[str, Any]:
    """
    Scrape current price for Moroccan stocks (IAM, ATW, etc.).
    
    Args:
        symbol (str): Stock symbol (e.g., 'IAM', 'ATW')
        use_cache (bool): Whether to use cached data if available (default: True)
        fallback_to_mock (bool): Whether to use mock data if scraping fails (default: True)
    
    Returns:
        dict: JSON format matching yfinance structure with:
            - symbol
            - stock_name
            - current_price
            - previous_close
            - change_percent
            - change
            - timestamp
            - source (casablanca_bourse, alternative_source, or mock_data)
            - market
    
    Example:
        >>> scrape_morocco_stock('IAM')
        {
            'symbol': 'IAM',
            'stock_name': 'Itissalat Al-Maghrib (IAM)',
            'current_price': 85.50,
            'previous_close': 84.00,
            'change_percent': 1.79,
            'change': 1.50,
            'timestamp': '2024-01-01T12:00:00',
            'source': 'casablanca_bourse',
            'market': 'Casablanca Stock Exchange'
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
    if use_cache:
        cached_data = _get_from_cache(symbol_upper)
        if cached_data:
            return cached_data
    
    # Try scraping from Casablanca Bourse
    result = _scrape_casablanca_bourse(symbol_upper, retries=3)
    
    # If Casablanca Bourse fails, try alternative sources
    if result is None:
        result = _scrape_alternative_sources(symbol_upper)
    
    # If all scraping fails, use mock data or return error
    if result is None:
        if fallback_to_mock:
            result = _generate_mock_data(symbol_upper)
        else:
            return {
                'error': 'Scraping failed',
                'message': f'Could not fetch data for {symbol_upper} from available sources',
                'symbol': symbol_upper,
                'suggestion': 'The website may be blocking requests. Try again later or enable mock data fallback.'
            }
    
    # Save to cache
    if use_cache:
        _save_to_cache(symbol_upper, result)
    
    return result


def clear_cache():
    """Clear the price cache"""
    global _price_cache
    _price_cache = {}


def get_cache_info() -> Dict[str, Any]:
    """Get information about cached data"""
    cache_info = {
        'cached_symbols': list(_price_cache.keys()),
        'cache_size': len(_price_cache),
        'cache_duration_seconds': _cache_duration.total_seconds()
    }
    
    # Calculate age of each cached item
    now = datetime.utcnow()
    for symbol, (data, cache_time) in _price_cache.items():
        age_seconds = (now - cache_time).total_seconds()
        cache_info[f'{symbol}_age_seconds'] = age_seconds
    
    return cache_info


def generate_mock_historical_data(symbol: str, period: str = '1mo', interval: str = '1h') -> Dict[str, Any]:
    """
    Generate mock historical data for Moroccan stocks (for charting).
    
    Args:
        symbol: Stock symbol (e.g., 'IAM', 'ATW')
        period: Time period (1d, 5d, 1mo, 3mo, 6mo, 1y)
        interval: Data interval (1m, 5m, 15m, 30m, 1h, 1d)
    
    Returns:
        dict: Mock historical OHLCV data formatted for charting
    """
    symbol_upper = symbol.upper()
    
    # Base prices for Moroccan stocks (in USD)
    base_prices = {
        "IAM": 12.21,
        "ATW": 81.35,
        "BCP": 31.04,
        "BMCE": 23.97,
        "CIH": 43.98,
        "HPS": 63.54,
        "LESIEUR": 40.06,
        "LBL": 200.73,
        "SNEP": 53.38,
        "TOTAL": 187.78,
        "TAQA": 237.57
    }
    
    base_price = base_prices.get(symbol_upper, 100.0)
    
    # Calculate number of data points based on period and interval
    period_hours = {
        '1d': 24,
        '5d': 120,
        '1mo': 720,
        '3mo': 2160,
        '6mo': 4320,
        '1y': 8760
    }
    
    interval_hours = {
        '1m': 1/60,
        '5m': 5/60,
        '15m': 15/60,
        '30m': 30/60,
        '1h': 1,
        '1d': 24,
        '1wk': 168,
        '1mo': 720
    }
    
    total_hours = period_hours.get(period, 720)
    hours_per_point = interval_hours.get(interval, 1)
    num_points = min(int(total_hours / hours_per_point), 500)  # Cap at 500 points
    
    # Generate realistic price data
    now = datetime.utcnow()
    data = []
    price = base_price
    
    for i in range(num_points, 0, -1):
        # Calculate timestamp
        if interval in ['1d', '1wk', '1mo']:
            timestamp = int((now - timedelta(days=i * (hours_per_point / 24))).timestamp())
        else:
            timestamp = int((now - timedelta(hours=i * hours_per_point)).timestamp())
        
        # Generate OHLC with realistic variation
        volatility = base_price * 0.02  # 2% volatility
        change = random.uniform(-volatility, volatility)
        price = max(price + change, base_price * 0.7)
        price = min(price, base_price * 1.3)
        
        open_price = price + random.uniform(-volatility * 0.5, volatility * 0.5)
        high_price = max(open_price, price) + random.uniform(0, volatility * 0.3)
        low_price = min(open_price, price) - random.uniform(0, volatility * 0.3)
        close_price = price
        
        data.append({
            'time': timestamp,
            'open': round(open_price, 2),
            'high': round(high_price, 2),
            'low': round(low_price, 2),
            'close': round(close_price, 2),
            'value': round(close_price, 2),
            'volume': random.randint(10000, 500000)
        })
    
    return {
        'symbol': symbol_upper,
        'period': period,
        'interval': interval,
        'count': len(data),
        'data': data,
        'source': 'mock_data'
    }

