import { useState } from 'react'
import axios from 'axios'

const MarketData = () => {
  const [symbol, setSymbol] = useState('')
  const [marketData, setMarketData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMarketData = async (e) => {
    e.preventDefault()
    if (!symbol.trim()) return

    setLoading(true)
    setError(null)
    setMarketData(null)

    try {
      const response = await axios.get(`/api/market-data/${symbol.toUpperCase()}`)
      setMarketData(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch market data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Market Data</h2>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 rounded-lg p-6">
        <form onSubmit={fetchMarketData} className="flex gap-4">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter symbol (e.g., AAPL, TSLA)"
            className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Market Data Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {marketData && (
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {marketData.name || marketData.symbol} ({marketData.symbol})
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="border-l-4 border-primary-500 pl-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Price</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                ${marketData.current_price?.toFixed(2) || 'N/A'}
              </div>
            </div>

            <div className="border-l-4 border-gray-300 dark:border-gray-600 pl-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Previous Close</div>
              <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                ${marketData.previous_close?.toFixed(2) || 'N/A'}
              </div>
            </div>

            <div className={`border-l-4 pl-4 ${
              (marketData.change || 0) >= 0 ? 'border-green-500' : 'border-red-500'
            }`}>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Change</div>
              <div className={`mt-1 text-2xl font-semibold ${
                (marketData.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ${marketData.change?.toFixed(2) || '0.00'} ({marketData.change_percent?.toFixed(2) || '0.00'}%)
              </div>
            </div>

            <div className="border-l-4 border-gray-300 dark:border-gray-600 pl-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Volume</div>
              <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                {marketData.volume ? marketData.volume.toLocaleString() : 'N/A'}
              </div>
            </div>

            <div className="border-l-4 border-gray-300 dark:border-gray-600 pl-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</div>
              <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
                {marketData.market_cap 
                  ? `$${(marketData.market_cap / 1e9).toFixed(2)}B` 
                  : 'N/A'}
              </div>
            </div>

            <div className="border-l-4 border-gray-300 dark:border-gray-600 pl-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">52 Week Range</div>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                ${marketData.low_52w?.toFixed(2) || 'N/A'} - ${marketData.high_52w?.toFixed(2) || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {!marketData && !loading && !error && (
        <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 rounded-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">Enter a symbol to view market data</p>
        </div>
      )}
    </div>
  )
}

export default MarketData

