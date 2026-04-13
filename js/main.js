// Import CSS styles
import '../css/global.css';

// Import modules
import { renderNavbar, updateNavbarState } from '../components/Navbar.js';
import { renderFooter } from '../components/Footer.js';
import { renderLogo3D } from '../components/Logo3D.js';
import { initBackground3D } from '../components/Background3D.js';
import { initMarketStream } from '../services/MarketStream.js';
import { renderTradingChart } from '../components/TradingChart.js';
import { renderAICopilot } from '../components/AICopilot.js';
import { renderLiveTradesFeed } from '../components/LiveTradesFeed.js';
import { renderOrderBook } from '../components/OrderBook.js';
import { Sparkline } from '../components/Sparkline.js';
import { renderLoader, launchSequence } from '../components/Loader.js';
import { loginWithGoogle, logoutUser, onAuthStateChanged, auth, handleRedirectResult } from '../services/Auth.js';
import { getActiveNode, startMiningTicker, fmtOMNI } from './cloud-mining-engine.js';
import { defi } from './services/DeFiCore.js';
import { audio } from './services/AudioEngine.js';

  // 1. Show Cinematic Loader (ONLY ONCE PER SESSION)
  const loaderShown = sessionStorage.getItem('omni_loader_shown');
  
  if (!loaderShown) {
      renderLoader();
      sessionStorage.setItem('omni_loader_shown', 'true');
      
      // Monitor for Loaded Event to launch sequence
      window.addEventListener('omni_loaded', () => {
        launchSequence();
      });
  } else {
      // If already shown, hide the loader overlay immediately if it exists
      document.body.classList.add('app-ready');
      // Dispatch event to show app content
      setTimeout(() => window.dispatchEvent(new Event('omni_loaded')), 100);
  }

  // Global Haptic Feedback Listener

  // Render components
  renderNavbar();
  renderFooter();
  
  // Mobile Bottom Nav Setup
  const bottomNavContainer = document.createElement('div');
  bottomNavContainer.id = 'mobile-bottom-nav-container';
  document.body.appendChild(bottomNavContainer);
  
  import('../components/MobileBottomNav.js').then(({ renderMobileBottomNav }) => {
    renderMobileBottomNav();
    window.addEventListener('resize', renderMobileBottomNav);
  });

  renderAICopilot();
  renderLiveTradesFeed();
  renderOrderBook();
  initGlobalMining();

  // Initialize Firebase Auth Listener
  onAuthStateChanged(auth, (user) => {
      updateNavbarState(user, logoutUser, loginWithGoogle);
  });
  
  // Handle Redirect Result for Mobile Login
  handleRedirectResult().then(user => {
    if (user) {
        console.log("Sovereign Session Restored via Redirect:", user.email);
        updateNavbarState(user, logoutUser, loginWithGoogle);
    }
  });
  
  // Expose services to window for HTML element access
  window.omniAudio = audio;
  window.omniDefi = defi;
  // Execute initial un-authenticated or persisted state
  updateNavbarState(auth.currentUser, logoutUser, loginWithGoogle);

  // Global Cursor Trailer Enhancement
  const trailer = document.createElement('div');
  trailer.className = 'cursor-trailer';
  document.body.appendChild(trailer);

  document.addEventListener('mousemove', (e) => {
    gsap.to(trailer, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.5,
      ease: "power3.out"
    });
  });

  // Initialize Lucide SVG Icons globally
  if (typeof window.lucide !== 'undefined') {
      window.lucide.createIcons();
  }
  
  if (savedTheme) {
      const trigger = document.getElementById('copilot-trigger');
      if (trigger) trigger.style.background = savedTheme;
  }
  
  // Immersive Background and WebSocket Stream
  initBackground3D();
  initMarketStream();

  // Initialize Hero & Footer 3D Logos
  setTimeout(() => {
    const heroContainer = document.getElementById('hero-logo-3d-container');
    if (heroContainer) {
       renderLogo3D('hero-logo-3d-container', 0x00D2A6, 3.5); // Larger scale for hero
    }
    
    const footerContainer = document.getElementById('omni-footer-logo-container');
    if (footerContainer) {
       renderLogo3D('omni-footer-logo-container', 0x00D2A6); // Standard scale for footer
    }
  }, 200);

  // If a chart container exists on the page, render it
  if (document.getElementById('tv-chart')) {
    renderTradingChart('tv-chart', 'BTCUSDT', '1h');
  }

  // Initialize Sparklines on the dashboard
  const sparklines = document.querySelectorAll('canvas[data-sparkline]');
  sparklines.forEach(canvas => {
      const isDown = canvas.parentElement.querySelector('.text-danger');
      const color = isDown ? '#FF4D4D' : '#00D2A6';
      
      const spark = new Sparkline(canvas, color);
      
      // Generate highly volatile mock data tracking 24 hours
      let base = 100;
      for(let i=0; i<40; i++) {
          base += (Math.random() - (isDown ? 0.6 : 0.4)) * 10;
          spark.addPoint(base);
      }
      
      // Simulate live ticking
      setInterval(() => {
          base += (Math.random() - 0.5) * 5;
          spark.addPoint(base);
      }, 2000);
  });

  // Add GSAP Scroll Reveals with ScrollTrigger
  if (typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined') {
     window.gsap.registerPlugin(window.ScrollTrigger);

     window.gsap.utils.toArray('.gsap-reveal').forEach((elem) => {
         window.gsap.fromTo(elem, 
            { y: 50, opacity: 0 },
            {
               y: 0,
               opacity: 1,
               duration: 0.8,
               ease: "power3.out",
               scrollTrigger: {
                   trigger: elem,
                   start: "top 90%",
                   toggleActions: "play none none reverse"
               }
            }
         );
     });

     window.gsap.utils.toArray('.market-item').forEach((item, index) => {
        window.gsap.fromTo(item,
           { scale: 0.9, opacity: 0 },
           {
              scale: 1,
              opacity: 1,
              duration: 0.6,
              ease: "back.out(1.7)",
              scrollTrigger: {
                 trigger: ".market-grid",
                 start: "top 80%",
                 toggleActions: "play none none reverse"
              },
              delay: index * 0.1
           }
        );
     });
  }

  // Magnetic Buttons
  const magneticBtns = document.querySelectorAll('.magnetic-btn, .btn-hub, .site-nav a');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const position = btn.getBoundingClientRect();
      const x = e.pageX - position.left - position.width / 2;
      const y = e.pageY - position.top - position.height / 2;
      
      gsap.to(btn, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.4,
        ease: "power3.out"
      });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.3)"
      });
    });
  });
  // Initialize Global Notifier
  import('../components/GlobalNotifier.js').then(({ notifier }) => {
      window.omniNotify = (t, m, ty) => notifier.show(t, m, ty);
  });

  // Footer Ticker Logic
  import('./hooks/OmniHooks.js').then(({ useOmni }) => {
      const tickerContainer = document.getElementById('footer-ticker-content');
      if (tickerContainer) {
          useOmni.subscribe((s) => {
              tickerContainer.innerHTML = `
                <span class="ticker-stat">OMNI: <span style="color:#fff;">$${s.stats.omniPrice?.toFixed(2) || '2.47'}</span></span>
                <span class="ticker-divider">|</span>
                <span class="ticker-stat">Network TVL: <span style="color:#00d2a6;">$${(s.stats.totalValueLocked / 1e6).toFixed(1)}M</span></span>
                <span class="ticker-divider">|</span>
                <span class="ticker-stat">Total Burned: <span style="color:#ff4d4d;">${s.burnData.toLocaleString()} OMNI</span></span>
                <span class="ticker-divider">|</span>
                <span class="ticker-stat">Circulating: <span style="color:#F0A500;">${(s.stats.circulatingSupply / 1e6).toFixed(1)}M OMNI</span></span>
              `;
          });
      }
  });

function initGlobalMining() {
  const node = getActiveNode();
  if (!node) return;

  // Start the background ticker
  startMiningTicker((snap) => {
    updateGlobalMiningUI(snap);
  });
}

function updateGlobalMiningUI(snap) {
  // 1. Navbar Sync (if not already handled)
  if (window.syncMiningLink) window.syncMiningLink();

  // 2. Landing Page Banner
  const banner = document.getElementById('mining-status-banner');
  if (banner) {
    banner.style.display = 'block';
    renderMiningBanner(banner, snap);
  }

  // 3. Landing Page CTA
  const ctaContainer = document.getElementById('index-mining-cta-container');
  if (ctaContainer && !ctaContainer.dataset.synced) {
    ctaContainer.innerHTML = `
      <a href="/pages/cloud-dashboard.html" style="background:linear-gradient(135deg,#00d2a6,#F0A500);color:#000;text-decoration:none;padding:14px 36px;font-weight:800;font-size:1rem;border-radius:50px;transition:all 0.2s;box-shadow:0 8px 30px rgba(0,210,166,0.2);" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter=''">
        ⚡ Return to Dashboard
      </a>
    `;
    ctaContainer.dataset.synced = "true";
  }
}

function renderMiningBanner(container, snap) {
  if (container.dataset.initialized) {
    const balEl = container.querySelector('.banner-bal');
    if (balEl) balEl.textContent = fmtOMNI(snap.cloudBalance) + ' OMNI';
    return;
  }

  container.innerHTML = `
    <div style="background:linear-gradient(90deg, #00d2a6, #004d40); color:#000; padding:10px 20px; font-family:'JetBrains Mono',monospace; font-size:0.85rem; font-weight:700; display:flex; align-items:center; justify-content:center; gap:24px; position:sticky; top:var(--header-height); z-index:998; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="display:inline-block; width:10px; height:10px; background:#fff; border-radius:50%; animation: pulse 1.5s infinite;"></span>
        MINING ACTIVE: <span style="color:#fff;">${snap.node.planName}</span>
      </div>
      <div style="display:flex; align-items:center; gap:12px; border-left:1px solid rgba(0,0,0,0.1); padding-left:24px;">
        <span>EARNED: <span class="banner-bal" style="color:#fff;">${fmtOMNI(snap.cloudBalance)} OMNI</span></span>
        <span style="color:rgba(0,0,0,0.5); font-size:0.75rem;">+${(snap.perSec).toFixed(6)}/sec</span>
      </div>
      <a href="/pages/cloud-dashboard.html" style="background:#000; color:#00d2a6; text-decoration:none; padding:4px 14px; border-radius:30px; font-size:0.75rem; text-transform:uppercase; font-weight:800; transition:all 0.2s;" onmouseover="this.style.background='#222'" onmouseout="this.style.background='#000'">
        Dashboard →
      </a>
    </div>
  `;
  container.dataset.initialized = "true";
}
