import { useState, useEffect, useCallback } from "react";
import { tradesService } from "../services/trades";

/**
 * TradeExecutionPanel Component
 * Handles trade execution with buy/sell functionality
 *
 * @param {Object} props
 * @param {string} props.symbol - Trading symbol (e.g., 'AAPL', 'BTC-USD')
 * @param {string} props.symbolName - Full name of the symbol
 * @param {number} props.currentPrice - Current market price
 * @param {number} props.challengeId - Active challenge ID
 * @param {string} props.challengeStatus - Challenge status ('active', 'passed', 'failed')
 * @param {number} props.availableBalance - Available balance for trading
 * @param {function} props.onTradeExecuted - Callback after successful trade
 * @param {function} props.onBalanceUpdate - Callback to update balance display
 * @param {function} props.onChallengeRefresh - Callback to refresh challenge status
 */
const TradeExecutionPanel = ({
  symbol = "",
  symbolName = "",
  currentPrice = 0,
  challengeId,
  challengeStatus = "active",
  availableBalance = 0,
  onTradeExecuted,
  onBalanceUpdate,
  onChallengeRefresh,
}) => {
  const [quantity, setQuantity] = useState("");
  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingSide, setExecutingSide] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTrade, setPendingTrade] = useState(null);

  // Calculate total value
  const price =
    orderType === "limit" && limitPrice ? parseFloat(limitPrice) : currentPrice;
  const qty = parseFloat(quantity) || 0;
  const totalValue = qty * price;

  // Check if trade is valid
  const isValidTrade = symbol && qty > 0 && price > 0 && challengeId;
  const canAffordBuy = totalValue <= availableBalance;
  const isActiveChallenge = challengeStatus === "active";

  // Clear message after delay
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Reset form when symbol changes
  useEffect(() => {
    setQuantity("");
    setLimitPrice("");
    setMessage({ type: "", text: "" });
  }, [symbol]);

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setQuantity(value);
    }
  };

  // Quick quantity buttons
  const setQuickQuantity = (percent) => {
    if (!currentPrice || currentPrice === 0) return;
    const maxQty = Math.floor((availableBalance * percent) / currentPrice);
    setQuantity(maxQty.toString());
  };

  // Execute trade
  const executeTrade = useCallback(
    async (side) => {
      if (!isValidTrade || !isActiveChallenge) return;

      if (side === "buy" && !canAffordBuy) {
        setMessage({
          type: "error",
          text: "Insufficient balance for this trade",
        });
        return;
      }

      setIsExecuting(true);
      setExecutingSide(side);
      setMessage({ type: "", text: "" });

      try {
        const response = await tradesService.executeTrade(
          challengeId,
          symbol,
          side,
          qty,
        );

        // Success message
        const executedPrice = response.price_info?.price_used || price;
        const total = (qty * executedPrice).toFixed(2);

        setMessage({
          type: "success",
          text: `✓ ${side.toUpperCase()} ${qty} ${symbol} @ $${executedPrice.toLocaleString()} (Total: $${total})`,
        });

        // Clear form
        setQuantity("");
        setLimitPrice("");

        // Callbacks
        if (onTradeExecuted) {
          onTradeExecuted({
            symbol,
            side,
            quantity: qty,
            price: executedPrice,
            total: qty * executedPrice,
            response,
          });
        }

        if (onBalanceUpdate && response.new_balance !== undefined) {
          onBalanceUpdate(response.new_balance);
        }

        if (onChallengeRefresh) {
          onChallengeRefresh();
        }

        // Check if challenge status changed
        if (
          response.challenge_status &&
          response.challenge_status !== "active"
        ) {
          setMessage({
            type: response.challenge_status === "passed" ? "success" : "error",
            text: `Challenge ${response.challenge_status.toUpperCase()}! ${response.message || ""}`,
          });
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Trade execution failed";
        setMessage({ type: "error", text: errorMessage });
      } finally {
        setIsExecuting(false);
        setExecutingSide(null);
        setShowConfirmation(false);
        setPendingTrade(null);
      }
    },
    [
      isValidTrade,
      isActiveChallenge,
      canAffordBuy,
      challengeId,
      symbol,
      qty,
      price,
      onTradeExecuted,
      onBalanceUpdate,
      onChallengeRefresh,
    ],
  );

  // Handle trade button click
  const handleTradeClick = (side) => {
    if (totalValue > 1000) {
      // Show confirmation for large trades
      setPendingTrade(side);
      setShowConfirmation(true);
    } else {
      executeTrade(side);
    }
  };

  // Confirm trade
  const confirmTrade = () => {
    if (pendingTrade) {
      executeTrade(pendingTrade);
    }
  };

  // Cancel confirmation
  const cancelConfirmation = () => {
    setShowConfirmation(false);
    setPendingTrade(null);
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">Trade Execution</h3>
            <p className="text-xs text-gray-400">Execute market orders</p>
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              isActiveChallenge
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {challengeStatus?.toUpperCase() || "NO CHALLENGE"}
          </div>
        </div>
      </div>

      {/* Selected Asset Display */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="font-bold text-primary-400">
                {symbol?.[0] || "?"}
              </span>
            </div>
            <div>
              <p className="font-bold text-white">{symbol || "Select Asset"}</p>
              <p className="text-xs text-gray-400">
                {symbolName || "No asset selected"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-white">
              $
              {currentPrice?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </p>
            <p className="text-xs text-gray-400">Current Price</p>
          </div>
        </div>
      </div>

      {/* Trade Form */}
      <div className="p-4 space-y-4">
        {/* Order Type Selector */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Order Type</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setOrderType("market")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                orderType === "market"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setOrderType("limit")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                orderType === "limit"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Limit
            </button>
          </div>
        </div>

        {/* Limit Price Input (if limit order) */}
        {orderType === "limit" && (
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Limit Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                $
              </span>
              <input
                type="text"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder={currentPrice?.toFixed(2) || "0.00"}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 pl-7 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400">Quantity</label>
            <span className="text-xs text-gray-500">
              Available: $
              {availableBalance?.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              }) || "0.00"}
            </span>
          </div>
          <input
            type="text"
            value={quantity}
            onChange={handleQuantityChange}
            placeholder="Enter quantity"
            disabled={!isActiveChallenge}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Quick Quantity Buttons */}
          <div className="flex space-x-2 mt-2">
            {[0.25, 0.5, 0.75, 1].map((percent) => (
              <button
                key={percent}
                onClick={() => setQuickQuantity(percent)}
                disabled={!isActiveChallenge}
                className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs text-gray-300 transition-colors"
              >
                {percent * 100}%
              </button>
            ))}
          </div>
        </div>

        {/* Total Value Display */}
        <div className="bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Estimated Total</span>
            <span
              className={`text-lg font-bold ${
                totalValue > availableBalance ? "text-red-400" : "text-white"
              }`}
            >
              $
              {totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          {totalValue > availableBalance && (
            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
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
              Exceeds available balance
            </p>
          )}
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Buy/Sell Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Buy Button */}
          <button
            onClick={() => handleTradeClick("buy")}
            disabled={
              !isValidTrade ||
              !isActiveChallenge ||
              !canAffordBuy ||
              isExecuting
            }
            className="relative py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 group overflow-hidden"
          >
            {isExecuting && executingSide === "buy" ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
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
                <span>BUY</span>
              </>
            )}
            {/* Hover effect */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>

          {/* Sell Button */}
          <button
            onClick={() => handleTradeClick("sell")}
            disabled={!isValidTrade || !isActiveChallenge || isExecuting}
            className="relative py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 group overflow-hidden"
          >
            {isExecuting && executingSide === "sell" ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Executing...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
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
                <span>SELL</span>
              </>
            )}
            {/* Hover effect */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>

        {/* Disabled State Message */}
        {!isActiveChallenge && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
              {challengeStatus === "passed" ? (
                <>
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Challenge completed! Start a new one to continue trading.
                </>
              ) : challengeStatus === "failed" ? (
                <>
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
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Challenge failed. Start a new challenge to trade again.
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 text-yellow-400"
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
                  No active challenge. Start a challenge to begin trading.
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-sm mx-4 shadow-2xl">
            <h4 className="text-lg font-bold text-white mb-2">Confirm Trade</h4>
            <p className="text-gray-400 mb-4">
              You are about to {pendingTrade?.toUpperCase()} {qty} {symbol} for
              a total of $
              {totalValue.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
              .
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelConfirmation}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmTrade}
                className={`flex-1 py-2 text-white rounded-lg transition-colors ${
                  pendingTrade === "buy"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirm {pendingTrade?.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeExecutionPanel;
