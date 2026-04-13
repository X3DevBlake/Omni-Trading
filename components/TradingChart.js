import { createChart } from 'lightweight-charts';

export async function renderTradingChart(containerId, symbol = 'BTCUSDT', interval = '1h') {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Cleanup old chart if exists
  container.innerHTML = '';
  
  const chartHeight = container.clientHeight || 400;

  const chart = createChart(container, {
    layout: {
      background: { color: 'transparent' },
      textColor: '#88929b',
    },
    grid: {
      vertLines: { color: '#2a2f3a' },
      horzLines: { color: '#2a2f3a' },
    },
    crosshair: {
      mode: 0,
    },
    timeScale: {
      borderColor: '#2a2f3a',
    },
    width: container.clientWidth,
    height: chartHeight,
  });

  const candlestickSeries = chart.addCandlestickSeries({
    upColor: '#00D2A6',
    downColor: '#FF4D4D',
    borderVisible: false,
    wickUpColor: '#00D2A6',
    wickDownColor: '#FF4D4D',
  });

  // Fetch initial REST data from Binance API
  // Interval format mapping: '1h' etc.
  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`);
    const data = await res.json();
    
    const formattedData = data.map(d => ({
      time: d[0] / 1000,
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4])
    }));

    candlestickSeries.setData(formattedData);
  } catch (err) {
    console.error("Failed to fetch initial kline data", err);
  }

  // Hook into WebSocket for live candle updates
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const kline = message.k;

    candlestickSeries.update({
      time: kline.t / 1000,
      open: parseFloat(kline.o),
      high: parseFloat(kline.h),
      low: parseFloat(kline.l),
      close: parseFloat(kline.c)
    });
  };

  // Handle Resize
  window.addEventListener('resize', () => {
    chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
  });
}
