import api from './api';

/**
 * Market Data Service
 * Handles all market price data fetching operations
 */

/**
 * Helper function to determine if error is retryable
 */
const isRetryableError = (error) => {
  // Network errors (no response)
  if (!error.response) return true;
  // Server errors (5xx)
  if (error.response.status >= 500) return true;
  // Timeout
  if (error.code === 'ECONNABORTED') return true;
  return false;
};

/**
 * Fetch price for a single symbol with automatic retry
 * @param {string} symbol - Stock/crypto symbol (e.g., 'AAPL', 'BTC-USD', 'IAM')
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<Object>} Price data object
 */
export const fetchPrice = async (symbol, retries = 2) => {
  if (!symbol || typeof symbol !== 'string') {
    return {
      success: false,
      error: 'Invalid symbol provided',
      data: null,
    };
  }

  let lastError = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await api.get(`/market/price/${symbol.toUpperCase().trim()}`);
      
      return {
        success: true,
        data: {
          symbol: response.data.symbol,
          price: response.data.current_price,
          market: response.data.market,
          currency: response.data.currency || 'USD',
          timestamp: response.data.timestamp || new Date().toISOString(),
        },
      };
    } catch (error) {
      lastError = error;
      
      // Only retry on retryable errors
      if (attempt < retries && isRetryableError(error)) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      break;
    }
  }

  const errorMessage = lastError?.response?.data?.error || lastError?.message || 'Failed to fetch price';
  
  return {
    success: false,
    error: errorMessage,
    data: null,
  };
};

/**
 * Fetch prices for multiple symbols at once
 * @param {string[]} symbols - Array of stock/crypto symbols
 * @returns {Promise<Object>} Object containing prices for all requested symbols
 */
export const fetchMultiplePrices = async (symbols) => {
  try {
    if (!Array.isArray(symbols) || symbols.length === 0) {
      throw new Error('Invalid symbols array provided');
    }

    // Clean and validate symbols
    const cleanSymbols = symbols
      .filter(s => typeof s === 'string' && s.trim())
      .map(s => s.toUpperCase().trim());

    if (cleanSymbols.length === 0) {
      throw new Error('No valid symbols provided');
    }

    const response = await api.get('/market/prices', {
      params: { symbols: cleanSymbols.join(',') },
    });

    // Normalize the response data
    const prices = {};
    const errors = {};

    if (response.data.prices) {
      Object.entries(response.data.prices).forEach(([symbol, priceData]) => {
        if (priceData.error) {
          errors[symbol] = priceData.error;
        } else {
          prices[symbol] = {
            symbol: symbol,
            price: priceData.current_price || priceData.price,
            market: priceData.market,
            currency: priceData.currency || 'USD',
            change: priceData.change || null,
            changePercent: priceData.change_percent || null,
            timestamp: priceData.timestamp || new Date().toISOString(),
          };
        }
      });
    }

    return {
      success: true,
      data: {
        prices,
        errors: Object.keys(errors).length > 0 ? errors : null,
        requestedSymbols: cleanSymbols,
        fetchedCount: Object.keys(prices).length,
      },
    };
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch prices';
    
    return {
      success: false,
      error: errorMessage,
      data: null,
    };
  }
};

/**
 * Fetch price with auto-retry on failure
 * @param {string} symbol - Stock/crypto symbol
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} delayMs - Delay between retries in milliseconds (default: 1000)
 * @returns {Promise<Object>} Price data object
 */
export const fetchPriceWithRetry = async (symbol, maxRetries = 3, delayMs = 1000) => {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await fetchPrice(symbol);
    
    if (result.success) {
      return result;
    }
    
    lastError = result.error;
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries} attempts: ${lastError}`,
    data: null,
  };
};

/**
 * Subscribe to price updates (polling-based)
 * @param {string} symbol - Stock/crypto symbol
 * @param {function} callback - Callback function to receive price updates
 * @param {number} intervalMs - Polling interval in milliseconds (default: 5000)
 * @returns {function} Unsubscribe function to stop polling
 */
export const subscribeToPriceUpdates = (symbol, callback, intervalMs = 5000) => {
  let isActive = true;

  const poll = async () => {
    if (!isActive) return;

    const result = await fetchPrice(symbol);
    callback(result);

    if (isActive) {
      setTimeout(poll, intervalMs);
    }
  };

  // Start polling
  poll();

  // Return unsubscribe function
  return () => {
    isActive = false;
  };
};

/**
 * Fetch historical price data for charting
 * @param {string} symbol - Stock/crypto symbol (e.g., 'AAPL', 'BTC-USD', 'IAM')
 * @param {string} period - Time period (1d, 5d, 1mo, 3mo, 6mo, 1y) - default: 1mo
 * @param {string} interval - Data interval (1m, 5m, 15m, 30m, 1h, 1d) - default: 1h
 * @returns {Promise<Object>} Historical data object with OHLCV data
 */
export const fetchHistoricalData = async (symbol, period = '1mo', interval = '1h') => {
  try {
    if (!symbol || typeof symbol !== 'string') {
      throw new Error('Invalid symbol provided');
    }

    const response = await api.get(`/market/history/${symbol.toUpperCase().trim()}`, {
      params: { period, interval }
    });

    return {
      success: true,
      data: response.data.data || [],
      symbol: response.data.symbol,
      period: response.data.period,
      interval: response.data.interval,
      count: response.data.count || 0
    };
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch historical data';
    
    return {
      success: false,
      error: errorMessage,
      data: [],
    };
  }
};

// Default export with all functions
const marketDataService = {
  fetchPrice,
  fetchMultiplePrices,
  fetchPriceWithRetry,
  subscribeToPriceUpdates,
  fetchHistoricalData,
};

export default marketDataService;
