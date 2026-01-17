import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, CrosshairMode, LineSeries, CandlestickSeries } from 'lightweight-charts';

/**
 * TradingChart Component
 * Professional trading chart using TradingView Lightweight Charts
 * 
 * @param {Object} props
 * @param {string} props.symbol - Trading symbol (e.g., 'AAPL', 'BTC-USD')
 * @param {Array} props.priceData - Array of price data points
 * @param {string} props.chartType - 'candlestick' or 'line' (default: 'line')
 * @param {boolean} props.loading - Loading state
 * @param {number} props.height - Chart height in pixels (default: 400)
 * @param {function} props.onCrosshairMove - Callback for crosshair movement
 */
const TradingChart = ({ 
  symbol = 'UNKNOWN',
  priceData = [],
  chartType = 'line',
  loading = false,
  height = 400,
  onCrosshairMove,
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState({ value: 0, percent: 0 });

  // Dark theme chart options
  const chartOptions = {
    layout: {
      background: { type: ColorType.Solid, color: '#1a1a2e' },
      textColor: '#9ca3af',
    },
    grid: {
      vertLines: { color: '#2d2d44' },
      horzLines: { color: '#2d2d44' },
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        color: '#6366f1',
        width: 1,
        style: 2,
        labelBackgroundColor: '#6366f1',
      },
      horzLine: {
        color: '#6366f1',
        width: 1,
        style: 2,
        labelBackgroundColor: '#6366f1',
      },
    },
    rightPriceScale: {
      borderColor: '#2d2d44',
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    timeScale: {
      borderColor: '#2d2d44',
      timeVisible: true,
      secondsVisible: false,
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: true,
    },
    handleScale: {
      axisPressedMouseMove: true,
      mouseWheel: true,
      pinch: true,
    },
  };

  // Line series options
  const lineSeriesOptions = {
    color: '#10b981',
    lineWidth: 2,
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 4,
    crosshairMarkerBorderColor: '#10b981',
    crosshairMarkerBackgroundColor: '#1a1a2e',
    lastValueVisible: true,
    priceLineVisible: true,
    priceLineWidth: 1,
    priceLineColor: '#10b981',
    priceLineStyle: 2,
  };

  // Candlestick series options
  const candlestickSeriesOptions = {
    upColor: '#10b981',
    downColor: '#ef4444',
    borderUpColor: '#10b981',
    borderDownColor: '#ef4444',
    wickUpColor: '#10b981',
    wickDownColor: '#ef4444',
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      ...chartOptions,
      width: chartContainerRef.current.clientWidth,
      height: height,
    });

    chartRef.current = chart;

    // Create series based on chart type
    if (chartType === 'candlestick') {
      seriesRef.current = chart.addSeries(CandlestickSeries, candlestickSeriesOptions);
    } else {
      seriesRef.current = chart.addSeries(LineSeries, lineSeriesOptions);
    }

    // Subscribe to crosshair move
    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.seriesData) {
        const data = param.seriesData.get(seriesRef.current);
        if (data) {
          const price = data.close || data.value;
          setCurrentPrice(price);
          if (onCrosshairMove) {
            onCrosshairMove({ time: param.time, price });
          }
        }
      }
    });

    // Cleanup
    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [chartType, height]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Initial resize
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (!seriesRef.current || !priceData || priceData.length === 0) return;

    try {
      // Format data based on chart type
      const formattedData = priceData.map((item) => {
        if (chartType === 'candlestick') {
          return {
            time: item.time || item.timestamp,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          };
        } else {
          return {
            time: item.time || item.timestamp,
            value: item.close || item.value || item.price,
          };
        }
      });

      // Sort by time
      formattedData.sort((a, b) => {
        if (typeof a.time === 'string') {
          return new Date(a.time) - new Date(b.time);
        }
        return a.time - b.time;
      });

      // Set data
      seriesRef.current.setData(formattedData);

      // Calculate price change
      if (formattedData.length >= 2) {
        const firstPrice = formattedData[0].close || formattedData[0].value;
        const lastPrice = formattedData[formattedData.length - 1].close || formattedData[formattedData.length - 1].value;
        const change = lastPrice - firstPrice;
        const changePercent = ((change / firstPrice) * 100);
        setPriceChange({ value: change, percent: changePercent });
        setCurrentPrice(lastPrice);
      }

      // Fit content
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }, [priceData, chartType]);

  // Update series color based on price direction
  useEffect(() => {
    if (!seriesRef.current || chartType !== 'line') return;

    const color = priceChange.value >= 0 ? '#10b981' : '#ef4444';
    seriesRef.current.applyOptions({
      color: color,
      priceLineColor: color,
    });
  }, [priceChange, chartType]);

  // Generate mock data if no data provided (for demo)
  const generateMockData = useCallback(() => {
    const data = [];
    const now = Math.floor(Date.now() / 1000);
    let price = 100 + Math.random() * 50;

    for (let i = 100; i >= 0; i--) {
      const time = now - i * 3600; // hourly data
      const change = (Math.random() - 0.48) * 5;
      price = Math.max(price + change, 50);

      if (chartType === 'candlestick') {
        const open = price;
        const close = price + (Math.random() - 0.5) * 3;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        data.push({ time, open, high, low, close });
        price = close;
      } else {
        data.push({ time, value: price });
      }
    }

    return data;
  }, [chartType]);

  // Use mock data if no priceData provided
  useEffect(() => {
    if (priceData.length === 0 && seriesRef.current) {
      const mockData = generateMockData();
      seriesRef.current.setData(mockData);
      
      if (mockData.length >= 2) {
        const firstPrice = mockData[0].close || mockData[0].value;
        const lastPrice = mockData[mockData.length - 1].close || mockData[mockData.length - 1].value;
        const change = lastPrice - firstPrice;
        const changePercent = ((change / firstPrice) * 100);
        setPriceChange({ value: change, percent: changePercent });
        setCurrentPrice(lastPrice);
      }

      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [priceData, generateMockData]);

  return (
    <div className="relative w-full bg-[#1a1a2e] rounded-xl overflow-hidden border border-gray-700">
      {/* Chart Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-lg font-bold text-white">{symbol}</h3>
            <div className="flex items-center space-x-2">
              {currentPrice && (
                <span className="text-xl font-bold text-white">
                  ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
              {priceChange && (
                <span className={`text-sm font-medium ${priceChange.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange.value >= 0 ? '+' : ''}{priceChange.value.toFixed(2)} ({priceChange.percent.toFixed(2)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chart Type Indicator */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 uppercase">{chartType}</span>
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#1a1a2e]/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400 text-sm">Loading chart data...</span>
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div 
        ref={chartContainerRef} 
        className="w-full"
        style={{ height: `${height}px` }}
      />

      {/* Chart Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-700 text-xs text-gray-500">
        <span>TradeSense AI · Powered by TradingView</span>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
};

export default TradingChart;
