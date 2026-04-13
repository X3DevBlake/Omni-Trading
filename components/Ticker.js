import { TRADING_PAIRS_SPOT } from '../data/mock-data.js';
import { fetchTopPrices } from '../js/api/coingecko.js';

export async function renderTicker() {
  const container = document.getElementById('ticker-container');
  if (!container) return;

  // Try API first, fallback to mock data
  let pairs = [];
  try {
    const apiData = await fetchTopPrices();
    if (apiData && apiData.length > 0) {
      pairs = apiData.map(c => ({
        pair: `${c.symbol.toUpperCase()}/USDT`,
        lastPrice: c.current_price,
        change: c.price_change_percentage_24h
      }));
    }
  } catch (e) {
    console.log("Using mock data for ticker fallback");
  }

  if (pairs.length === 0) {
    pairs = TRADING_PAIRS_SPOT.slice(0, 10);
  }

  const tickerItems = pairs.map(p => {
    const isUp = p.change >= 0;
    const colorClass = isUp ? 'text-success' : 'text-danger';
    const sign = isUp ? '+' : '';
    // Strip the slash for the route, i.e., "BTC/USDT" -> "BTCUSDT"
    const routePair = p.pair.replace('/', '');
    return `<a href="/pages/spot.html?pair=${routePair}" class="ticker-item" style="text-decoration:none; cursor:pointer;" title="Trade ${p.pair}">
      <span class="ticker-pair" style="transition: color 0.2s;">${p.pair}</span>
      <span class="ticker-price">${p.lastPrice.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:6})}</span>
      <span class="ticker-change ${colorClass}">${sign}${p.change.toFixed(2)}%</span>
    </a>`;
  }).join('');

  container.innerHTML = `
    <div class="ticker-bar glass-panel">
      <div class="ticker-track">
        ${tickerItems}
        ${tickerItems} <!-- Duplicate for infinite scrolling -->
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.innerHTML = `
    .ticker-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 40px;
      overflow: hidden;
      border-radius: 0;
      border-bottom: none;
      border-left: none;
      border-right: none;
      z-index: 900;
      background: rgba(10, 10, 26, 0.95);
      display: flex;
      align-items: center;
    }
    .ticker-track {
      display: flex;
      white-space: nowrap;
      animation: tickerScroll 30s linear infinite;
    }
    .ticker-item {
      display: flex;
      gap: 15px;
      padding: 0 40px;
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 0.95rem;
    }
    .ticker-pair { color: var(--color-text-muted); }
    .ticker-price { color: var(--color-text-main); }
    @keyframes tickerScroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;
  document.head.appendChild(style);
}
