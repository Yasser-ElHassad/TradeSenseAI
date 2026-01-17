import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Dashboard = ({ portfolio, trades }) => {
  const stats = useMemo(() => {
    const totalValue = portfolio.reduce((sum, pos) => sum + (pos.total_value || 0), 0)
    const totalCost = portfolio.reduce((sum, pos) => sum + (pos.total_cost || 0), 0)
    const totalPnL = totalValue - totalCost
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0
    
    return {
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercent,
      positionCount: portfolio.length,
      tradeCount: trades.length
    }
  }, [portfolio, trades])

  const recentTrades = trades.slice(0, 5)

  const chartData = trades.slice(-10).map(trade => ({
    date: new Date(trade.timestamp).toLocaleDateString(),
    value: trade.price * trade.quantity
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-900/50 rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Portfolio Value</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  ${stats.totalValue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-900/50 rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total P&L</div>
                <div className={`mt-1 text-2xl font-semibold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${stats.totalPnL.toFixed(2)} ({stats.totalPnLPercent.toFixed(2)}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-900/50 rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Positions</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.positionCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-900/50 rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trades</div>
                <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.tradeCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Trade Values</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#0ea5e9" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Trades */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Trades</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentTrades.map((trade) => (
                  <tr key={trade.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {trade.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trade.trade_type === 'buy' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                      }`}>
                        {trade.trade_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {trade.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ${trade.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(trade.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

