import { useState } from 'react'
import axios from 'axios'

const TradeForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    quantity: '',
    price: '',
    trade_type: 'buy'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await axios.post('/api/trades', formData)
      setMessage({ type: 'success', text: 'Trade executed successfully!' })
      setFormData({ symbol: '', quantity: '', price: '', trade_type: 'buy' })
      if (onSubmit) onSubmit()
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to execute trade' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Execute Trade</h2>
      
      <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900/50 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Symbol
            </label>
            <input
              type="text"
              name="symbol"
              id="symbol"
              required
              value={formData.symbol}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
              placeholder="e.g., AAPL"
            />
          </div>

          <div>
            <label htmlFor="trade_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Trade Type
            </label>
            <select
              name="trade_type"
              id="trade_type"
              value={formData.trade_type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              required
              min="0.01"
              step="0.01"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price
            </label>
            <input
              type="number"
              name="price"
              id="price"
              required
              min="0.01"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
              placeholder="Enter price per share"
            />
          </div>

          {message && (
            <div className={`rounded-md p-4 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Executing...' : 'Execute Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TradeForm

