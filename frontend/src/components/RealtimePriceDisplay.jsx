import { useState, useEffect, useRef, useCallback } from "react";
import { fetchPrice } from "../services/marketData";

/**
 * RealtimePriceDisplay Component
 * Displays live price updates for a trading symbol
 *
 * @param {Object} props
 * @param {string} props.symbol - Trading symbol (e.g., 'AAPL', 'BTC-USD', 'IAM')
 * @param {number} props.refreshInterval - Refresh interval in ms (default: 30000)
 * @param {boolean} props.compact - Use compact display mode
 * @param {function} props.onPriceUpdate - Callback when price updates
 */
const RealtimePriceDisplay = ({
  symbol,
  refreshInterval = 30000,
  compact = false,
  onPriceUpdate,
}) => {
  const [priceData, setPriceData] = useState(null);
  const [previousPrice, setPreviousPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // Fetch price data
  const fetchPriceData = useCallback(
    async (isInitial = false) => {
      if (!symbol) return;

      if (isInitial) {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await fetchPrice(symbol);

        // Check if component is still mounted
        if (!isMountedRef.current) return;

        if (result.success && result.data) {
          // Store previous price for comparison
          setPreviousPrice(priceData?.price || null);
          setPriceData(result.data);
          setLastUpdated(new Date());

          // Trigger flash animation
          setIsFlashing(true);
          setTimeout(() => {
            if (isMountedRef.current) {
              setIsFlashing(false);
            }
          }, 500);

          // Call callback if provided
          if (onPriceUpdate) {
            onPriceUpdate(result.data);
          }
        } else {
          setError(result.error || "Failed to fetch price");
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message || "An unexpected error occurred");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [symbol, priceData?.price, onPriceUpdate],
  );

  // Initial fetch and interval setup
  useEffect(() => {
    isMountedRef.current = true;

    // Initial fetch
    fetchPriceData(true);

    // Set up interval for periodic updates
    intervalRef.current = setInterval(() => {
      fetchPriceData(false);
    }, refreshInterval);

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [symbol, refreshInterval]);

  // Re-fetch when symbol changes
  useEffect(() => {
    setPriceData(null);
    setPreviousPrice(null);
    setLoading(true);
    fetchPriceData(true);
  }, [symbol]);

  // Calculate price change
  const priceChange =
    previousPrice && priceData?.price ? priceData.price - previousPrice : 0;

  const priceChangePercent =
    previousPrice && priceData?.price ? (priceChange / previousPrice) * 100 : 0;

  const isPositive = priceChange >= 0;

  // Format timestamp
  const formatTimestamp = (date) => {
    if (!date) return "--:--:--";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Loading state
  if (loading && !priceData) {
    return (
      <div
        className={`bg-gray-800 rounded-xl border border-gray-700 ${compact ? "p-3" : "p-4"}`}
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400 text-sm">Loading {symbol}...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !priceData) {
    return (
      <div
        className={`bg-gray-800 rounded-xl border border-red-500/50 ${compact ? "p-3" : "p-4"}`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-red-400 text-sm font-medium truncate">
              {symbol}
            </p>
            <p className="text-gray-500 text-xs truncate">{error}</p>
          </div>
          <button
            onClick={() => fetchPriceData(true)}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs text-gray-300 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Compact display
  if (compact) {
    return (
      <div
        className={`bg-gray-800 rounded-lg border border-gray-700 p-3 transition-all duration-300 ${
          isFlashing ? (isPositive ? "bg-green-900/30" : "bg-red-900/30") : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">{symbol}</span>
            {error && (
              <span
                className="w-2 h-2 bg-yellow-400 rounded-full"
                title="Update failed"
              ></span>
            )}
          </div>
          <div className="text-right">
            <p
              className={`font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}
            >
              $
              {priceData?.price?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </p>
            <p
              className={`text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}
            >
              {isPositive ? "+" : ""}
              {priceChangePercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Full display
  return (
    <div
      className={`bg-gray-800 rounded-xl border border-gray-700 overflow-hidden transition-all duration-300 ${
        isFlashing
          ? isPositive
            ? "border-green-500/50 shadow-lg shadow-green-500/10"
            : "border-red-500/50 shadow-lg shadow-red-500/10"
          : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isPositive ? "bg-green-500/20" : "bg-red-500/20"
            }`}
          >
            <span className="font-bold text-lg">{symbol[0]}</span>
          </div>
          <div>
            <h3 className="font-bold text-white">{symbol}</h3>
            <p className="text-xs text-gray-400">
              {priceData?.market || "Market"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          <div
            className={`w-2 h-2 rounded-full ${error ? "bg-yellow-400" : "bg-green-400"} ${!error && "animate-pulse"}`}
          ></div>
        </div>
      </div>

      {/* Price Display */}
      <div className="px-4 py-4">
        <div className="flex items-end justify-between">
          <div>
            <p
              className={`text-3xl font-bold transition-colors ${
                isFlashing
                  ? isPositive
                    ? "text-green-400"
                    : "text-red-400"
                  : "text-white"
              }`}
            >
              $
              {priceData?.price?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`flex items-center text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}
              >
                {isPositive ? (
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                )}
                {isPositive ? "+" : ""}
                {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Currency</p>
            <p className="text-sm font-medium text-gray-300">
              {priceData?.currency || "USD"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-t border-gray-700">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Updated: {formatTimestamp(lastUpdated)}</span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <span>Refresh: {refreshInterval / 1000}s</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && priceData && (
        <div className="px-4 py-2 bg-yellow-500/10 border-t border-yellow-500/30">
          <div className="flex items-center justify-between">
            <p className="text-xs text-yellow-400 flex items-center gap-1">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Update failed: {error}
            </p>
            <button
              onClick={() => fetchPriceData(false)}
              className="text-xs text-yellow-400 hover:text-yellow-300 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimePriceDisplay;
