export function renderLiveTradesFeed() {
  const container = document.createElement('div');
  container.className = 'glass-panel live-trades-widget';
  container.style.position = 'fixed';
  container.style.left = '20px';
  container.style.bottom = '20px';
  container.style.width = '280px';
  container.style.height = '200px';
  container.style.zIndex = '100';
  container.style.overflow = 'hidden';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.padding = '15px';
  container.style.border = '1px solid rgba(255,255,255,0.1)';
  container.style.pointerEvents = 'none';

  container.innerHTML = `
    <h5 style="margin:0 0 10px 0; color:var(--color-primary); font-size:0.9rem; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;">Live Market Executions</h5>
    <div id="trades-list" style="flex:1; overflow:hidden; display:flex; flex-direction:column; gap:8px;"></div>
  `;

  document.body.appendChild(container);

  // We expose this globally so MarketStream can push to it
  window.pushLiveTrade = (symbol, price, amount, type) => {
    const list = document.getElementById('trades-list');
    if (!list) return;

    const item = document.createElement('div');
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.fontSize = '0.85rem';
    item.style.opacity = '0';
    item.style.transform = 'translateY(-10px)';
    item.style.transition = 'all 0.3s ease';

    const isWhale = parseFloat(amount) > 5.0;
    const color = type === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)';
    currentTrades++;
    
    // Format Timestamp
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour12: false });
    
    // Institutional Whale Highlight
    const bgEffect = isWhale ? (type === 'BUY' ? 'rgba(0, 210, 166, 0.3)' : 'rgba(255, 77, 77, 0.3)') : 'transparent';
    const textEffect = isWhale ? 'text-shadow: 0 0 5px ' + color + ';' : '';

    item.innerHTML = `
      <span style="color:var(--color-text-muted); font-family:monospace;">[${timeStr}]</span>
      <span style="color:#fff; font-weight:600; flex:1; text-align:center;">${symbol}</span>
      <span style="color:${color}; ${textEffect} font-variant-numeric: tabular-nums;">${price}</span>
      <span style="color:var(--color-text-muted); font-variant-numeric: tabular-nums; min-width:60px; text-align:right;">${amount}</span>
    `;
    
    if (isWhale) {
        item.style.background = bgEffect;
        item.style.borderRadius = '3px';
        item.style.padding = '2px 4px';
        item.style.fontWeight = 'bold';
    }

    list.insertBefore(item, list.firstChild);

    // Initial animation trigger
    requestAnimationFrame(() => {
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });

    if (list.children.length > 8) {
      list.removeChild(list.lastChild);
    }
  };
}

let currentTrades = 0;
