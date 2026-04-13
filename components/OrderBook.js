export function renderOrderBook(targetId = 'orderbook-container', isCompact = false, symbol = 'BTCUSDT') {
  const container = document.getElementById(targetId);
  if (!container) return;

  const headerHtml = isCompact ? '' : `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="font-size:1.8rem; color:#fff; display:flex; align-items:center; gap:8px;">
          <i data-lucide="layers" style="color:var(--color-primary); width:24px; height:24px;"></i> Market Depth
        </h2>
        <div style="display:flex; gap:10px; font-size:0.85rem; align-items:center;">
           <span style="color:var(--color-danger); font-weight:600; display:flex; align-items:center; gap:4px;">
             <div style="width:8px; height:8px; border-radius:50%; background:var(--color-danger);"></div> Asks
           </span>
           <span style="color:var(--color-text-muted);">|</span>
           <span style="color:var(--color-success); font-weight:600; display:flex; align-items:center; gap:4px;">
             <div style="width:8px; height:8px; border-radius:50%; background:var(--color-success);"></div> Bids
           </span>
        </div>
      </div>
  `;

  container.innerHTML = `
    ${isCompact ? '' : '<section class="section container gsap-reveal" style="padding-top:20px; padding-bottom:60px;">'}
      ${headerHtml}
      
      <div class="${isCompact ? '' : 'glass-panel'} orderbook-grid" style="display:flex; padding:${isCompact ? '5px' : '20px'}; gap:${isCompact ? '10px' : '40px'}; flex-direction:${isCompact ? 'column' : 'row'}; justify-content:space-between; max-height:${isCompact ? '800px' : '400px'}; overflow:hidden; width:100%;">
        <!-- ASKS COL (Top if compact) -->
        <div style="flex:1;">
           <div style="display:flex; justify-content:space-between; color:var(--color-text-muted); font-size:0.8rem; margin-bottom:5px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:5px;">
             <span>Price (USDT)</span>
             <span>Amount (BTC)</span>
             <span>Total</span>
           </div>
           <div id="asks-list-${targetId}" style="display:flex; flex-direction:column; gap:4px; font-family:var(--font-heading);"></div>
        </div>
        
        ${isCompact ? '<div style="padding:10px 0; font-size:1.2rem; color:var(--color-success); font-weight:bold; text-align:center;">64,230.50 <span style="font-size:0.8rem; color:var(--color-text-muted);">USDT</span></div>' : ''}

        <!-- BIDS COL (Bottom if compact) -->
        <div style="flex:1;">
           ${isCompact ? '' : `
           <div style="display:flex; justify-content:space-between; color:var(--color-text-muted); font-size:0.8rem; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">
             <span>Price (USDT)</span>
             <span>Amount (BTC)</span>
             <span>Total</span>
           </div>
           `}
           <div id="bids-list-${targetId}" style="display:flex; flex-direction:column; gap:4px; font-family:var(--font-heading);"></div>
        </div>
      </div>
    ${isCompact ? '' : '</section>'}
  `;

  if(window.lucide) window.lucide.createIcons();

  const bidsList = document.getElementById(`bids-list-${targetId}`);
  const asksList = document.getElementById(`asks-list-${targetId}`);

  // Orderbook generation logic matching Binance Data Array format: [ [price, qty], ... ]
  function generateRows(orders, type) {
     if (!orders || orders.length === 0) return '';
     
     let html = '';
     let aggregate = 0;
     const rowCount = isCompact ? 10 : 15;
     
     // Limit orders processed
     const renderLimit = Math.min(orders.length, rowCount);
     
     for(let i=0; i<renderLimit; i++) {
        const order = orders[i];
        const price = parseFloat(order[0]).toFixed(2);
        const amount = parseFloat(order[1]);
        aggregate += amount;
        
        const color = type === 'ask' ? 'var(--color-danger)' : 'var(--color-success)';
        
        html += `
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding: 3px 0; position:relative; overflow:hidden; font-variant-numeric: tabular-nums;">
            <div style="position:absolute; top:0; right:0; bottom:0; width:${Math.min(aggregate*2, 100)}%; background:${color}; opacity:0.12; z-index:0; transition: width 0.3s ease;"></div>
            <span style="color:${color}; font-weight:600; z-index:1; text-shadow: 0 0 5px rgba(255,255,255,0.1);">${price}</span>
            <span style="color:#fff; z-index:1;">${amount.toFixed(4)}</span>
            <span style="color:var(--color-text-muted); z-index:1;">${aggregate.toFixed(4)}</span>
          </div>
        `;
     }
     return html;
  }

  // Bind directly to Binance L2 WebSocket
  let activeSocket = null;
  
  function initDepthStream() {
      if (activeSocket) activeSocket.close();
      
      activeSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`);
      
      activeSocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if(data.b && bidsList) {
             bidsList.innerHTML = generateRows(data.b, 'bid');
          }
          
          if(data.a && asksList) {
              // Asks should be rendered highest to lowest price visually if not compact, 
              // Binance sends Lowest To Highest. We reverse for top-down display constraint usually.
             const asksToRender = data.a.slice().reverse();
             asksList.innerHTML = generateRows(asksToRender, 'ask');
          }
      };
      
      activeSocket.onerror = (e) => {
          console.error("Orderbook WS Feed Error:", e);
      };
  }
  
  initDepthStream();
}
