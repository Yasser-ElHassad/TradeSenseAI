import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchPrice } from '../services/marketData';

/**
 * useRealtimePrice Hook
 * Fetches and maintains real-time price data for a trading symbol
 * 
 * @param {string} symbol - Trading symbol (e.g., 'AAPL', 'BTC-USD', 'IAM')
 * @param {Object} options
 * @param {number} options.refreshInterval - Refresh interval in ms (default: 30000)
 * @param {boolean} options.enabled - Enable/disable fetching (default: true)
 * @returns {Object} { price, priceData, loading, error, refetch, lastUpdated }
 */
const useRealtimePrice = (symbol, options = {}) => {
  const { refreshInterval = 30000, enabled = true } = options;

  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const previousSymbolRef = useRef(symbol);

  /**
   * Fetch price data from API
   */
  const fetchPriceData = useCallback(async (showLoading = true) => {
    if (!symbol || !enabled) {
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await fetchPrice(symbol);

      if (!isMountedRef.current) return;

      if (result.success && result.data) {
        setPriceData(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to fetch price');
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [symbol, enabled]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(() => {
    return fetchPriceData(true);
  }, [fetchPriceData]);

  /**
   * Silent refresh (no loading state)
   */
  const silentRefresh = useCallback(() => {
    return fetchPriceData(false);
  }, [fetchPriceData]);

  // Handle symbol change - reset state and fetch new data
  useEffect(() => {
    if (previousSymbolRef.current !== symbol) {
      // Symbol changed - reset state
      setPriceData(null);
      setError(null);
      setLastUpdated(null);
      previousSymbolRef.current = symbol;
    }
  }, [symbol]);

  // Initial fetch and interval setup
  useEffect(() => {
    isMountedRef.current = true;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!symbol || !enabled) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchPriceData(true);

    // Setup refresh interval
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchPriceData(false); // Silent refresh
      }, refreshInterval);
    }

    // Cleanup on unmount or dependency change
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [symbol, refreshInterval, enabled, fetchPriceData]);

  // Convenience: extract price value
  const price = priceData?.price ?? null;

  return {
    // Core data
    price,
    priceData,
    loading,
    error,
    lastUpdated,
    
    // Actions
    refetch,
    silentRefresh,
    
    // Convenience
    isStale: lastUpdated ? (Date.now() - lastUpdated.getTime() > refreshInterval * 2) : false,
    hasData: !!priceData,
    symbol: priceData?.symbol || symbol,
    market: priceData?.market || null,
    currency: priceData?.currency || 'USD',
  };
};

export default useRealtimePrice;
