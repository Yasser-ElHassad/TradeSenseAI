const Portfolio = ({ portfolio }) => {
  const totalValue = portfolio.reduce((sum, pos) => sum + (pos.total_value || 0), 0)
  const totalCost = portfolio.reduce((sum, pos) => sum + (pos.total_cost || 0), 0)
  const totalPnL = totalValue - totalCost

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h2>

      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Portfolio Summary</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              ${totalValue.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cost</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              ${totalCost.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total P&L</div>
            <div className={`mt-1 text-2xl font-semibold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalPnL.toFixed(2)} ({(totalCost > 0 ? (totalPnL / totalCost) * 100 : 0).toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Positions</h3>
          {portfolio.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No positions yet. Start trading to build your portfolio!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Avg Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Unrealized P&L
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      P&L %
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {portfolio.map((position) => (
                    <tr key={position.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {position.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {position.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${position.avg_price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${position.current_price?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${position.total_value?.toFixed(2) || '0.00'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        (position.unrealized_pnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${position.unrealized_pnl?.toFixed(2) || '0.00'}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        (position.unrealized_pnl_percent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {position.unrealized_pnl_percent?.toFixed(2) || '0.00'}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Portfolio

