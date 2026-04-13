import { renderLogo3D } from './Logo3D.js';
import { useOmni } from '../js/hooks/OmniHooks.js';

export function renderNavbar() {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const html = `
    <nav class="navbar glass-panel">
      <div class="nav-left">
        <a href="/" class="logo">
          <div id="omni-logo-container" style="width: 40px; height: 40px; margin-right: 10px;"></div>
          <span class="logo-text">Omni</span>
        </a>
        <div class="nav-links desktop-only">
          <a href="/pages/buy-crypto.html">Buy Crypto</a>
          <a href="/pages/markets.html">Markets</a>
          <div class="dropdown">
            <a href="/pages/ecosystem.html" class="dropdown-toggle">Ecosystem <span class="arrow">▼</span></a>
            <div class="dropdown-content glass-panel">
              <a href="/pages/ecosystem.html">🌐 Layer-1 Hub</a>
              <a href="/pages/create-wallet.html" style="color:var(--color-primary);">⚡ Create Wallet</a>
              <a href="/pages/explorer.html">OmniScan Explorer</a>
              <a href="/pages/burn.html" style="color:#ff4d4d;">🔥 Burn Tracker</a>
              <a href="/pages/bridge.html">Omni Bridge</a>
              <a href="/pages/dao.html">DAO Governance</a>
              <a href="/pages/mine.html" style="color:#F0A500;">⛏ Mine OMNI (Browser)</a>
              <div id="nav-mining-link-container">
                <a href="/pages/cloud-mining.html" style="color:#00d2a6; font-weight:700;">☁️ Cloud Mining — $10/mo</a>
              </div>
            </div>
          </div>
          <a href="/pages/spot.html">Spot Exchange</a>
          <a href="/pages/downloads.html" style="background:var(--color-primary); color:#000; padding:4px 10px; border-radius:6px; font-weight:700;">Download</a>
          <a href="/pages/copy-trading.html">Copy Trade</a>
          <div class="dropdown">
            <a href="/pages/earn-hub.html" class="dropdown-toggle" style="color:var(--color-primary); font-weight:700;">Earn <span style="font-size:0.6rem; vertical-align:top; margin-left:2px; background:var(--color-primary); color:#000; padding:1px 4px; border-radius:4px;">PRO</span> <span class="arrow">▼</span></a>
            <div class="dropdown-content glass-panel">
                <a href="/pages/staking.html">Staking</a>
                <a href="/pages/farming.html">Yield Farming</a>
                <a href="/pages/liquidity.html">Liquidity</a>
                <a href="/pages/earn-hub.html">Auto Earn</a>
                <div style="padding: 10px 20px; border-top: 1px solid rgba(255,255,255,0.05); margin-top:5px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.65rem; color:rgba(255,255,255,0.4);">30m Auto-Harvest <i data-lucide="zap" style="width:10px; height:10px; vertical-align:middle;"></i></span>
                    <label class="switch">
                      <input type="checkbox" id="nav-autoclaim-toggle" onchange="window.toggleAutoClaim(this.checked)">
                      <span class="slider round"></span>
                    </label>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      <div class="nav-right">
        <div class="desktop-only" style="display:flex; align-items:center; gap:32px;">
          <div id="nav-rewards-container" style="display:none; align-items:center; gap:8px; cursor:pointer;" onclick="window.omniDefi.claimAll()">
            <span style="font-size:0.75rem; color:var(--color-primary); font-family:'JetBrains Mono'; font-weight:700;" id="nav-rewards-amt">0.00 OMNI</span>
            <i data-lucide="zap" style="width:14px; color:var(--color-primary); animation: pulse 1s infinite;"></i>
          </div>
          
          <a href="#" class="nav-icon" title="Toggle Sound" onclick="window.toggleMute()"><i id="nav-mute-icon" data-lucide="volume-2" style="width:20px; height:20px;"></i></a>
          <div id="auth-container" style="display:flex; align-items:center; gap:15px;">
            <!-- Dynamic State -->
          </div>
        </div>
        <button class="mobile-menu-btn mobile-only" onclick="toggleMobileMenu()" id="mobile-menu-btn" aria-label="Open menu"><i data-lucide="menu" style="width:24px; height:24px;"></i></button>
      </div>
    </nav>

    <!-- Mobile Slide-Down Menu -->
    <div id="mobile-nav" style="
      display:none; position:fixed; top:var(--header-height); left:0; right:0;
      background:#0b0e14; border-bottom:1px solid rgba(255,255,255,0.08);
      z-index:999; padding:16px; max-height:calc(100vh - var(--header-height));
      overflow-y:auto; -webkit-overflow-scrolling:touch; touch-action:pan-y;
    ">
      <div style="display:flex; flex-direction:column; gap:4px;">
        <a href="/pages/buy-crypto.html" onclick="closeMobileMenu()" style="display:block; padding:12px 16px; color:rgba(255,255,255,0.7); border-radius:10px; font-weight:500;">Buy Crypto</a>
        <a href="/pages/markets.html" onclick="closeMobileMenu()" style="display:block; padding:12px 16px; color:rgba(255,255,255,0.7); border-radius:10px;">Markets</a>
        <a href="/pages/spot.html" onclick="closeMobileMenu()" style="display:block; padding:12px 16px; color:rgba(255,255,255,0.7); border-radius:10px;">Spot Exchange</a>
        <a href="/pages/ecosystem.html" onclick="closeMobileMenu()" style="display:block; padding:12px 16px; color:rgba(255,255,255,0.7); border-radius:10px;">🌐 Layer-1 Hub</a>
        <a href="/pages/create-wallet.html" onclick="closeMobileMenu()" style="display:block; padding:12px 16px; color:#00d2a6; border-radius:10px; font-weight:700;">⚡ Create Wallet (NEW)</a>
        <a href="/pages/downloads.html" onclick="closeMobileMenu()" style="display:block; padding:12px 16px; color:var(--color-primary); border-radius:10px; font-weight:700;">📲 Download Android App</a>
        <a href="/pages/mine.html" onclick="closeMobileMenu()" style="display:block; padding:12px 16px; color:#F0A500; border-radius:10px; font-weight:700;">⛏ Browser Mining</a>
        <div style="margin: 8px 16px; height:1px; background:rgba(255,255,255,0.05);"></div>
        <div style="padding-left:16px; color:rgba(255,255,255,0.4); font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">DeFi & Yield</div>
        <a href="/pages/farming.html" onclick="closeMobileMenu()" style="display:block; padding:12px 16px; color:#fff; border-radius:10px;">🚜 Yield Farming (High APY)</a>
        <a href="/pages/liquidity.html" onclick="closeMobileMenu()" style="display:block; padding:12px 16px; color:#fff; border-radius:10px;">💧 Liquidity Pools</a>
        <a href="/pages/staking.html" onclick="closeMobileMenu()" style="display:block; padding:12px 16px; color:#fff; border-radius:10px;">💎 OMNI Staking</a>
        <a href="/pages/earn-hub.html" onclick="closeMobileMenu()" style="display:block; padding:12px 16px; color:var(--color-primary); border-radius:10px; font-weight:700;">⚡ Auto-Harvest Farm</a>
        <div id="nav-mining-link-mobile">
          <a href="/pages/cloud-mining.html" onclick="closeMobileMenu()" style="display:block; padding:12px 16px; color:#00d2a6; border-radius:10px; font-weight:700;">☁️ Cloud Mining</a>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  window.toggleMobileMenu = function() {
    const nav = document.getElementById('mobile-nav');
    const btn = document.getElementById('mobile-menu-btn');
    const isOpen = nav.style.display === 'block';
    nav.style.display = isOpen ? 'none' : 'block';
    btn.innerHTML = isOpen 
      ? '<i data-lucide="menu" style="width:24px;height:24px;"></i>'
      : '<i data-lucide="x" style="width:24px;height:24px;"></i>';
    if (window.lucide) window.lucide.createIcons();
  };

  window.closeMobileMenu = function() {
    const nav = document.getElementById('mobile-nav');
    const btn = document.getElementById('mobile-menu-btn');
    if (nav) nav.style.display = 'none';
    if (btn) btn.innerHTML = '<i data-lucide="menu" style="width:24px;height:24px;"></i>';
    if (window.lucide) window.lucide.createIcons();
  };

  // Initialize the 3D Logo
  setTimeout(() => {
    if (import.meta.env.DEV) {
       console.log("Navbar: Initializing 3D Branding Node...");
    }
    renderLogo3D('omni-logo-container', 0x00D2A6);
  }, 100);

  // Subscribe to Global State
  useOmni.subscribe((state) => {
    updateNavbarUI(state);
  });

  syncMiningLink();
}

function updateNavbarUI(state) {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;

    if (state.user) {
        authContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="location.href='/pages/wallet.html'">
            <div style="text-align:right;" class="desktop-only">
              <div style="font-size:0.85rem; color:#fff; font-weight:700; font-family:'JetBrains Mono';">${state.user.shortAddr}</div>
              <div style="font-size:0.65rem; color:var(--color-primary);">${state.user.isGenesis ? 'GENESIS NODE' : 'SOVEREIGN NODE'}</div>
            </div>
            <div style="width:36px; height:36px; border-radius:50%; border:2px solid var(--color-primary); background:rgba(0,210,166,0.1); display:flex; align-items:center; justify-content:center; color:var(--color-primary);">
              <i data-lucide="shield-check" style="width:20px;height:20px;"></i>
            </div>
          </div>
          <button class="nav-icon desktop-only" onclick="window.omniLogout()" title="Logout"><i data-lucide="log-out" style="width:20px; height:20px;"></i></button>
        `;
        if (window.lucide) window.lucide.createIcons();
    } else {
        authContainer.innerHTML = `
            <a href="/pages/create-wallet.html" class="btn btn-outline" style="border:none;">Log In</a>
            <a href="/pages/create-wallet.html" class="btn btn-primary magnetic-btn">Get Started</a>
        `;
    }
}

window.omniLogout = () => {
    if (confirm('Logout of sovereign session?')) {
        useOmni.logout();
        location.href = '/';
    }
};

function syncMiningLink() {
  try {
    const nodes = JSON.parse(localStorage.getItem('omni_cloud_nodes') || '[]');
    const active = nodes.find(n => n.active);
    
    if (active) {
      const activeHtml = `
        <a href="/pages/cloud-dashboard.html" style="color:#00d2a6; font-weight:700; display:flex; align-items:center; gap:6px;">
          <span style="display:inline-block; width:8px; height:8px; background:#00d2a6; border-radius:50%; animation: pulse 1.5s infinite;"></span>
          Cloud Mining (Active)
        </a>`;
      
      const desktop = document.getElementById('nav-mining-link-container');
      const mobile = document.getElementById('nav-mining-link-mobile');
      if (desktop) desktop.innerHTML = activeHtml;
      if (mobile) mobile.innerHTML = activeHtml;
    }
  } catch(e) {}
}

window.toggleAutoClaim = function(enabled) {
  if (window.omniDefi) {
    window.omniDefi.state.autoClaimEnabled = enabled;
    window.omniDefi.saveState();
  }
};

window.toggleMute = function() {
  if (window.omniAudio) {
    const isMuted = window.omniAudio.toggleMute();
    const icon = document.getElementById('nav-mute-icon');
    if (icon) {
      icon.setAttribute('data-lucide', isMuted ? 'volume-x' : 'volume-2');
      if (window.lucide) window.lucide.createIcons();
    }
  }
};

setInterval(() => {
  if (window.omniDefi) {
    const rewards = window.omniDefi.getTotalUnclaimed();
    const container = document.getElementById('nav-rewards-container');
    const amt = document.getElementById('nav-rewards-amt');
    
    if (rewards > 0.0001) {
      if (container) container.style.display = 'flex';
      if (amt) amt.innerText = rewards.toFixed(4) + ' OMNI';
    } else {
      if (container) container.style.display = 'none';
    }
  }
}, 1000);

const style = document.createElement('style');
style.innerHTML = `
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } }
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    height: var(--header-height);
    background: var(--color-bg-deep);
    border-bottom: 1px solid var(--color-bg-light);
  }
  .nav-left, .nav-right { display: flex; align-items: center; gap: 32px; }
  .logo { display: flex; align-items: center; gap: 10px; font-size: 1.4rem; font-weight: 700; color: #fff; text-decoration: none; }
  .nav-links { display: flex; gap: 24px; align-items: center; font-size: 0.95rem; }
  .nav-links a { color: var(--color-text-main); text-decoration: none; }
  .nav-links a:hover { color: var(--color-primary); }
  .dropdown { position: relative; }
  .dropdown-toggle { display: flex; align-items: center; gap: 4px; color: #fff; text-decoration: none; }
  .dropdown-content {
    display: none; position: absolute; top: 100%; left: 0; min-width: 200px; padding: 10px 0;
    flex-direction: column; z-index: 100; background: #1a1d23; border: 1px solid #2d3139;
  }
  .dropdown:hover .dropdown-content { display: flex; }
  .dropdown-content a { padding: 8px 20px; color: #ccc; text-decoration: none; font-size: 0.9rem; }
  .dropdown-content a:hover { background: #2d3139; color: #fff; }
  .nav-icon { color: var(--color-text-main); text-decoration: none; }
  @media(max-width: 1024px) { .desktop-only { display: none !important; } }
`;
document.head.appendChild(style);

export function updateNavbarState(user) {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;

    if (user) {
        authContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="text-align:right;" class="desktop-only">
              <div style="font-size:0.85rem; color:#fff; font-weight:600;">${user.email.split('@')[0]}</div>
              <div style="font-size:0.65rem; color:#00d2a6;">Sovereign Node Active</div>
            </div>
            <img src="https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}" style="width:32px; height:32px; border-radius:50%; border:2px solid #00d2a6;" />
          </div>
        `;
    }
}
