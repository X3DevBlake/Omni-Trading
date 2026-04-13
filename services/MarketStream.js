import { Sparkline } from '../components/Sparkline.js';
import { defi } from '../js/services/DeFiCore.js';

/**
 * Initializes the market data stream via WebSocket and manages real-time price updates.
 * Connects to CoinCap for major crypto assets and simulates OMNI token price movements
 * based on a volatility model and DeFi exchange rates.
 *
 * This function handles:
 * - WebSocket connection for live price data.
 * - Initialization and updating of sparkline charts.
 * - Periodic price refreshes and UI element updates.
 * - Dispatching global 'omni_price_update' events.
 *
 * @function initMarketStream
 */
export function initMarketStream() {
  let ws;
  let reconnectAttempts = 0;
  let maxReconnectDelay = 30000; // 30s Max

  function connect() {
    console.log("🌐 Initiating Market Stream Connection...");
    ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana,dogecoin,ripple,cardano,polkadot');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      Object.keys(data).forEach(asset => {
        const sym = symbolMap[asset];
        if (sym) {
            prices[sym] = parseFloat(data[asset]);
            reconnectAttempts = 0; // Reset on successful message
        }
      });
    };

    ws.onclose = () => {
      reconnectAttempts++;
      const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, maxReconnectDelay);
      console.warn(`⚠️ WebSocket closed. Reconnecting in ${delay/1000}s...`);
      setTimeout(connect, delay);
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket Error:', error);
      ws.close();
    };
  }

  const prices = {
    'BTCUSDT': 82000,
    'ETHUSDT': 3100,
    'SOLUSDT': 185,
    'DOGEUSDT': 0.18,
    'XRPUSDT': 2.15,
    'ADAUSDT': 0.78,
    'DOTUSDT': 7.20,
    'OMNIUSDT': 2.47,
    'sOMNIUSDT': 2.47 * (defi.state.sOMNIExchangeRate || 1.0)
  };

  const symbolMap = {
    'bitcoin': 'BTCUSDT',
    'ethereum': 'ETHUSDT',
    'solana': 'SOLUSDT',
    'dogecoin': 'DOGEUSDT',
    'ripple': 'XRPUSDT',
    'cardano': 'ADAUSDT',
    'polkadot': 'DOTUSDT'
  };

  const sparklines = {};

  // Initialize Sparklines
  const sparklineCanvases = document.querySelectorAll('canvas[data-sparkline]');
  sparklineCanvases.forEach(canvas => {
      const sym = canvas.getAttribute('data-sparkline');
      sparklines[sym] = new Sparkline(canvas, '#00D2A6');
      const base = prices[sym] || 1;
      for(let i=0; i<40; i++) sparklines[sym].addPoint(base + (Math.random() * 2 - 1) * (base * 0.01));
  });

  // Start Connection
  connect();

  // 1s GLOBAL REFRESH LOOP
  setInterval(() => {
    // Simulate OMNI volatility
    prices['OMNIUSDT'] += (Math.random() - 0.48) * 0.01;
    
    // Growing Value Model: sOMNI price = OMNI price * Exchange Rate
    prices['sOMNIUSDT'] = prices['OMNIUSDT'] * defi.state.sOMNIExchangeRate;

    Object.keys(prices).forEach(symbol => {
      const rawPrice = prices[symbol];
      let formattedPrice = rawPrice.toFixed(rawPrice > 10 ? 2 : 4);
      if (rawPrice >= 1000) {
          formattedPrice = rawPrice.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      // Update Sparklines
      if (sparklines[symbol]) {
        sparklines[symbol].addPoint(rawPrice);
      }

      // Update Price Elements
      const priceElements = document.querySelectorAll(`[data-symbol-price="${symbol}"]`);
      priceElements.forEach(el => {
        const oldVal = parseFloat(el.innerText.replace(/[$,]/g, ''));
        el.innerText = `$${formattedPrice}`;
        el.style.color = rawPrice >= oldVal ? 'var(--color-success)' : 'var(--color-danger)';
        setTimeout(() => { if(el) el.style.color = ''; }, 400);
      });

      // Special Header Update
      if (symbol === 'BTCUSDT') {
        const headerPrice = document.getElementById('active-ticker-price');
        if (headerPrice) headerPrice.innerText = formattedPrice;
      }
    });

    // Broadcast price event for DeFi calculations if needed
    window.dispatchEvent(new CustomEvent('omni_price_update', { detail: prices }));
  }, 1000);
}
