from flask_restful import Resource
import yfinance as yf
import requests
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class MarketData(Resource):
    def get(self, symbol):
        """Get market data for a symbol"""
        try:
            ticker = yf.Ticker(symbol.upper())
            
            # Try fast_info first (faster and more reliable)
            current_price = 0
            previous_close = 0
            
            try:
                fast_info = ticker.fast_info
                if fast_info and hasattr(fast_info, 'last_price') and fast_info.last_price:
                    current_price = float(fast_info.last_price)
                if fast_info and hasattr(fast_info, 'previous_close') and fast_info.previous_close:
                    previous_close = float(fast_info.previous_close)
            except Exception as e:
                logger.warning(f"fast_info failed for {symbol}: {e}")
            
            # Fallback to history if fast_info didn't work
            if not current_price:
                try:
                    hist = ticker.history(period="5d", timeout=10)
                    if not hist.empty:
                        current_price = float(hist['Close'].iloc[-1])
                        if len(hist) > 1 and not previous_close:
                            previous_close = float(hist['Close'].iloc[-2])
                except Exception as e:
                    logger.warning(f"history failed for {symbol}: {e}")
            
            # Get additional info (can be slow, wrap in try/except)
            info = {}
            try:
                info = ticker.info if ticker.info else {}
            except Exception as e:
                logger.warning(f"info failed for {symbol}: {e}")
            
            # Use info values as fallback
            if not current_price:
                current_price = info.get('currentPrice') or info.get('regularMarketPrice') or 0
            if not previous_close:
                previous_close = info.get('previousClose') or info.get('regularMarketPreviousClose') or 0
            
            change = float(current_price) - float(previous_close) if previous_close else 0
            change_percent = (change / float(previous_close)) * 100 if previous_close else 0
            
            return {
                'symbol': symbol.upper(),
                'name': info.get('longName', info.get('shortName', '')),
                'current_price': float(current_price),
                'previous_close': float(previous_close),
                'change': round(change, 2),
                'change_percent': round(change_percent, 2),
                'volume': info.get('volume', 0),
                'market_cap': info.get('marketCap', 0),
                'high_52w': info.get('fiftyTwoWeekHigh', 0),
                'low_52w': info.get('fiftyTwoWeekLow', 0)
            }
        except Exception as e:
            logger.error(f"MarketData error for {symbol}: {e}")
            return {'error': str(e)}, 400

class SymbolSearch(Resource):
    def get(self, query):
        """Search for symbols"""
        try:
            # Using yfinance search functionality
            ticker = yf.Ticker(query.upper())
            info = ticker.info
            
            if 'symbol' in info:
                return [{
                    'symbol': info.get('symbol', query.upper()),
                    'name': info.get('longName', ''),
                    'exchange': info.get('exchange', '')
                }]
            else:
                return []
        except Exception as e:
            return []

