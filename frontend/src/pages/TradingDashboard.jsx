import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import useChallenge from "../hooks/useChallenge";
import useRealtimePrice from "../hooks/useRealtimePrice";
import TradingChart from "../components/TradingChart";
import RealtimePriceDisplay from "../components/RealtimePriceDisplay";
import TradeExecutionPanel from "../components/TradeExecutionPanel";
import { tradesService } from "../services/trades";
import { fetchHistoricalData } from "../services/marketData";

const tradableAssets = [
  // Crypto
  { symbol: "BTC-USD", name: "Bitcoin", market: "CRYPTO" },
  { symbol: "ETH-USD", name: "Ethereum", market: "CRYPTO" },
  // US Stocks (NASDAQ)
  { symbol: "AAPL", name: "Apple Inc.", market: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", market: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft", market: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", market: "NASDAQ" },
  // Moroccan Stocks (CSE - Casablanca Stock Exchange)
  { symbol: "IAM", name: "Itissalat Al-Maghrib", market: "CSE" },
  { symbol: "ATW", name: "Attijariwafa Bank", market: "CSE" },
  { symbol: "BCP", name: "Banque Centrale Populaire", market: "CSE" },
  { symbol: "BMCE", name: "Bank of Africa", market: "CSE" },
  { symbol: "CIH", name: "Crédit Immobilier et Hôtelier", market: "CSE" },
  { symbol: "HPS", name: "Holcim Maroc", market: "CSE" },
  { symbol: "LESIEUR", name: "Lesieur Cristal", market: "CSE" },
  { symbol: "LBL", name: "LafargeHolcim Maroc", market: "CSE" },
  { symbol: "SNEP", name: "SNEP", market: "CSE" },
  { symbol: "TOTAL", name: "Total Maroc", market: "CSE" },
  { symbol: "TAQA", name: "TAQA Morocco", market: "CSE" },
];

const mockAISignals = [
  {
    id: 1,
    symbol: "AAPL",
    signal: "BUY",
    confidence: 87,
    reason: "Strong momentum + earnings beat",
    time: "2 min ago",
  },
  {
    id: 2,
    symbol: "BTC-USD",
    signal: "HOLD",
    confidence: 65,
    reason: "Consolidation phase",
    time: "5 min ago",
  },
  {
    id: 3,
    symbol: "TSLA",
    signal: "SELL",
    confidence: 72,
    reason: "Overbought RSI, resistance hit",
    time: "8 min ago",
  },
  {
    id: 4,
    symbol: "IAM",
    signal: "BUY",
    confidence: 78,
    reason: "Breakout pattern forming",
    time: "12 min ago",
  },
];

const generateChartData = (basePrice = 100) => {
  const data = [];
  const now = Math.floor(Date.now() / 1000);
  let price = basePrice;

  for (let i = 100; i >= 0; i--) {
    const time = now - i * 3600;
    const change = (Math.random() - 0.48) * (basePrice * 0.02);
    price = Math.max(price + change, basePrice * 0.7);
    data.push({ time, value: price });
  }
  return data;
};

const TradingDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedSymbol, setSelectedSymbol] = useState("BTC-USD");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMarket, setActiveMarket] = useState("ALL");
  const [trades, setTrades] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  const {
    challenge,
    loading: challengeLoading,
    error: challengeError,
    refetchChallenge,
    isActive,
    isPassed,
    isFailed,
    hasChallenge,
  } = useChallenge({ autoFetch: true, refreshInterval: 60000 });

  const {
    price: currentPrice,
    priceData,
    loading: priceLoading,
    error: priceError,
    refetch: refetchPrice,
    lastUpdated: priceLastUpdated,
  } = useRealtimePrice(selectedSymbol, { refreshInterval: 30000 });

  const selectedAsset = useMemo(
    () =>
      tradableAssets.find((a) => a.symbol === selectedSymbol) ||
      tradableAssets[0],
    [selectedSymbol],
  );

  // Fetch historical data for chart when symbol changes
  const loadChartData = useCallback(async (symbol) => {
    setChartLoading(true);
    try {
      const result = await fetchHistoricalData(symbol, '1mo', '1h');
      if (result.success && result.data?.length > 0) {
        setChartData(result.data);
      } else {
        // Fallback to generated data if fetch fails
        const basePrice = currentPrice || 100;
        const fallbackData = [];
        const now = Math.floor(Date.now() / 1000);
        let price = basePrice;
        for (let i = 100; i >= 0; i--) {
          const time = now - i * 3600;
          const change = (Math.random() - 0.48) * (basePrice * 0.02);
          price = Math.max(price + change, basePrice * 0.7);
          fallbackData.push({ time, value: price });
        }
        setChartData(fallbackData);
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setChartLoading(false);
    }
  }, [currentPrice]);

  useEffect(() => {
    loadChartData(selectedSymbol);
  }, [selectedSymbol, loadChartData]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (challenge?.id) {
      fetchTrades(challenge.id);
    }
  }, [challenge?.id]);

  const fetchTrades = async (challengeId) => {
    try {
      const response = await tradesService.getTradeHistory(challengeId);
      setTrades(response.trades || []);
    } catch (err) {
      console.error("Failed to load trades:", err);
    }
  };

  const filteredAssets = useMemo(() => {
    return tradableAssets.filter((asset) => {
      const matchesSearch =
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMarket =
        activeMarket === "ALL" || asset.market === activeMarket;
      return matchesSearch && matchesMarket;
    });
  }, [searchTerm, activeMarket]);

  const handleSelectSymbol = (symbol) => {
    setSelectedSymbol(symbol);
  };

  const handleTradeExecuted = async () => {
    if (challenge?.id) {
      await fetchTrades(challenge.id);
    }
    await refetchChallenge();
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchChallenge(),
        refetchPrice(),
        loadChartData(selectedSymbol),
        challenge?.id ? fetchTrades(challenge.id) : Promise.resolve(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "passed":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getFailureReason = () => {
    if (!isFailed) return null;
    if (challenge?.dailyLossUsed >= 5) return "Daily loss limit exceeded (5%)";
    if (challenge?.maxLossUsed >= 10)
      return "Maximum loss limit exceeded (10%)";
    return "Challenge rules violated";
  };

  if (challengeLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-gray-900 to-purple-600/10" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-32 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -right-16 top-20 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-15" />
      </div>

      {/* Top Bar */}
      <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30">
                <span className="text-sm font-bold">TS</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-lg font-bold">TradeSense AI</p>
                <p className="text-xs text-gray-400">
                  Live challenge dashboard
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 shadow-inner shadow-black/20 backdrop-blur">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-primary-200">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm text-gray-200">
                {user?.username || "Trader"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-gray-200 shadow-inner shadow-black/30 ring-1 ring-white/10 transition hover:bg-white/15 disabled:opacity-60"
              title="Refresh all data"
            >
              <svg
                className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            <div className="hidden lg:flex items-center gap-6 rounded-2xl bg-white/5 px-4 py-3 shadow-inner shadow-black/30 ring-1 ring-white/10 backdrop-blur">
              <div className="text-center">
                <p className="text-xs text-gray-400">Balance</p>
                <p className="text-lg font-bold">
                  ${(challenge?.currentBalance || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Daily P/L</p>
                <p
                  className={`text-lg font-bold ${(challenge?.dailyPnL || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {(challenge?.dailyPnL || 0) >= 0 ? "+" : ""}$
                  {(challenge?.dailyPnL || 0).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Total P/L</p>
                <p
                  className={`text-lg font-bold ${(challenge?.profitPercent || 0) >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {(challenge?.profitPercent || 0) >= 0 ? "+" : ""}
                  {(challenge?.profitPercent || 0).toFixed(2)}%
                </p>
              </div>
            </div>

            {hasChallenge && (
              <div
                className={`flex items-center gap-3 rounded-2xl px-3 py-2 shadow-inner shadow-black/30 ring-1 ring-white/10 ${
                  isActive
                    ? "bg-green-500/20"
                    : isPassed
                      ? "bg-blue-500/20"
                      : "bg-red-500/20"
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${getStatusColor(challenge?.status)} ${isActive ? "animate-pulse" : ""}`}
                ></div>
                <div>
                  <p className="text-xs text-gray-300">Challenge</p>
                  <p className="text-sm font-semibold capitalize text-white">
                    {challenge?.status}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {hasChallenge && (
          <div className="mx-auto mt-3 flex max-w-7xl items-center gap-4 px-4 pb-4 sm:px-6 lg:px-8">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-primary-400 via-green-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${challenge?.progressToTarget || 0}%` }}
              />
            </div>
            <span className="text-sm text-gray-300 whitespace-nowrap">
              {(challenge?.progressToTarget || 0).toFixed(0)}% to target
            </span>
          </div>
        )}

        {isFailed && (
          <div className="mx-auto mb-4 flex max-w-7xl items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 shadow-inner shadow-red-900/30">
            <div className="flex items-center gap-3">
              <svg
                className="h-5 w-5"
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
              <span>Challenge Failed: {getFailureReason()}</span>
            </div>
            <button
              onClick={() => navigate("/pricing")}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-700"
            >
              New Challenge
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      {!hasChallenge ? (
        <div className="relative z-10 flex h-[calc(100vh-80px)] items-center justify-center px-4">
          <div className="glass-panel w-full max-w-md rounded-3xl bg-white/5 p-12 text-center shadow-xl ring-1 ring-white/10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
              <svg
                className="w-10 h-10 text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">No Active Challenge</h2>
            <p className="mt-3 text-gray-300">
              Start a trading challenge to access the full dashboard and begin
              trading.
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 font-semibold shadow-lg hover:shadow-xl"
            >
              Start Challenge
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 grid min-h-[calc(100vh-120px)] grid-cols-12">
          {/* Left Sidebar */}
          <aside className="col-span-12 flex flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl md:col-span-3 lg:col-span-2 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
            <div className="border-b border-white/10 p-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-10 py-2 text-sm text-white placeholder:text-gray-400 shadow-inner shadow-black/30 focus:border-primary-400 focus:outline-none"
                />
                <svg
                  className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="flex border-b border-white/10 text-xs">
              {["ALL", "NASDAQ", "CRYPTO", "CSE"].map((market) => (
                <button
                  key={market}
                  onClick={() => setActiveMarket(market)}
                  className={`flex-1 py-2 font-semibold transition ${
                    activeMarket === market
                      ? "bg-white/10 text-primary-200 shadow-inner shadow-black/30"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {market}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => handleSelectSymbol(asset.symbol)}
                  className={`group flex w-full items-center justify-between border-b border-white/5 px-3 py-3 text-left transition ${
                    selectedSymbol === asset.symbol
                      ? "bg-white/10 ring-1 ring-primary-400/40"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div>
                    <p className="font-semibold">{asset.symbol}</p>
                    <p className="text-xs text-gray-400 group-hover:text-gray-300">
                      {asset.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <RealtimePriceDisplay
                      symbol={asset.symbol}
                      compact
                      refreshInterval={60000}
                    />
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Main Area */}
          <main className="col-span-12 flex flex-col bg-gradient-to-br from-gray-950/60 via-gray-900/70 to-gray-950/60 md:col-span-9 lg:col-span-7 overflow-y-auto">
            <div className="border-b border-white/10 bg-white/5 px-4 py-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 text-lg font-bold shadow-inner shadow-black/40">
                    {selectedSymbol[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedSymbol}</h2>
                    <p className="text-sm text-gray-300">
                      {selectedAsset.name} · {selectedAsset.market}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <RealtimePriceDisplay
                    symbol={selectedSymbol}
                    refreshInterval={30000}
                  />
                </div>
              </div>
            </div>

            <div className="relative flex-1 p-4">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-white/0 to-white/5" />
              <TradingChart
                symbol={selectedSymbol}
                priceData={chartData}
                chartType="line"
                height={400}
                loading={priceLoading || chartLoading}
              />
            </div>

            <div className="border-t border-white/10 bg-white/5 px-4 py-4 shadow-inner shadow-black/30 backdrop-blur-xl">
              <TradeExecutionPanel
                symbol={selectedSymbol}
                symbolName={selectedAsset.name}
                currentPrice={currentPrice || 0}
                challengeId={challenge?.id}
                challengeStatus={challenge?.status}
                availableBalance={challenge?.currentBalance || 0}
                onTradeExecuted={handleTradeExecuted}
                onChallengeRefresh={refetchChallenge}
              />
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col border-l border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">AI Signals</p>
                  <p className="text-xs text-gray-300">Powered by TradeSense</p>
                </div>
              </div>
              <span className="flex items-center text-xs text-green-400">
                <span className="mr-1 h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
                Live
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {mockAISignals.map((signal) => (
                <div
                  key={signal.id}
                  onClick={() => handleSelectSymbol(signal.symbol)}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/30 transition hover:border-primary-400/50 hover:bg-white/10 cursor-pointer"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-bold text-white">
                      {signal.symbol}
                    </span>
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold ${
                        signal.signal === "BUY"
                          ? "bg-green-500/20 text-green-300"
                          : signal.signal === "SELL"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-yellow-500/20 text-yellow-200"
                      }`}
                    >
                      {signal.signal}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200">{signal.reason}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <span>Confidence:</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${
                            signal.confidence >= 80
                              ? "bg-green-400"
                              : signal.confidence >= 60
                                ? "bg-yellow-400"
                                : "bg-red-400"
                          }`}
                          style={{ width: `${signal.confidence}%` }}
                        />
                      </div>
                      <span className="font-semibold text-white">
                        {signal.confidence}%
                      </span>
                    </div>
                    <span className="text-gray-400">{signal.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 bg-gradient-to-r from-purple-900/30 to-pink-900/30 px-4 py-4">
              <h4 className="mb-2 text-sm font-medium">Market Sentiment</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-green-400">Bullish</span>
                    <span className="text-red-400">Bearish</span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: "62%" }}
                    />
                    <div
                      className="h-full bg-red-500"
                      style={{ width: "38%" }}
                    />
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-400">62%</span>
              </div>
            </div>

            <div className="border-t border-white/10 px-4 py-4">
              <h4 className="mb-3 text-sm font-medium">Your Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/5 p-3 text-center shadow-inner shadow-black/30">
                  <p className="text-2xl font-bold text-primary-300">
                    {trades.length}
                  </p>
                  <p className="text-xs text-gray-300">Total Trades</p>
                </div>
                <div className="rounded-lg bg-white/5 p-3 text-center shadow-inner shadow-black/30">
                  <p className="text-2xl font-bold text-green-300">
                    {trades.length > 0
                      ? Math.round(
                          (trades.filter((t) => t.profit > 0).length /
                            trades.length) *
                            100,
                        )
                      : 0}
                    %
                  </p>
                  <p className="text-xs text-gray-300">Win Rate</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-4 py-4">
              <h4 className="mb-3 text-sm font-medium">Risk Monitor</h4>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs text-gray-300">
                    <span>Daily Loss Used</span>
                    <span
                      className={
                        Math.abs(challenge?.dailyLossUsed || 0) > 3
                          ? "text-red-300"
                          : "text-yellow-200"
                      }
                    >
                      {Math.abs(challenge?.dailyLossUsed || 0).toFixed(1)}% / 5%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full transition-all ${Math.abs(challenge?.dailyLossUsed || 0) > 3 ? "bg-red-500" : "bg-yellow-400"}`}
                      style={{
                        width: `${Math.min(100, (Math.abs(challenge?.dailyLossUsed || 0) / 5) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-gray-300">
                    <span>Max Loss Used</span>
                    <span className="text-green-200">
                      {Math.abs(challenge?.maxLossUsed || 0).toFixed(1)}% / 10%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{
                        width: `${Math.min(100, (Math.abs(challenge?.maxLossUsed || 0) / 10) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 px-4 py-4">
              <h4 className="mb-3 text-sm font-medium">Recent Trades</h4>
              <div className="max-h-32 space-y-2 overflow-y-auto">
                {trades.slice(0, 5).map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs shadow-inner shadow-black/30"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 ${
                          trade.action === "buy"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {trade.action?.toUpperCase()}
                      </span>
                      <span className="font-medium text-white">
                        {trade.symbol}
                      </span>
                    </div>
                    <span className="text-gray-300">
                      {trade.quantity} @ ${trade.price?.toFixed(2)}
                    </span>
                  </div>
                ))}
                {trades.length === 0 && (
                  <p className="py-4 text-center text-xs text-gray-400">
                    No trades yet
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default TradingDashboard;
