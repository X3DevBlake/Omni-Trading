/**
 * Mobile Bottom Navigation Component
 * Provides native-like navigation for phone users.
 */

export function renderMobileBottomNav() {
  const container = document.getElementById('mobile-bottom-nav-container');
  if (!container) return;

  // Only show on mobile screens
  if (window.innerWidth > 768) {
    container.style.display = 'none';
    return;
  }

  const currentPath = window.location.pathname;
  
  const navItems = [
    { label: 'Home', icon: 'home', path: '/' },
    { label: 'Markets', icon: 'line-chart', path: '/pages/markets.html' },
    { label: 'Trade', icon: 'arrow-left-right', path: '/pages/spot.html', highlight: true },
    { label: 'Earn', icon: 'zap', path: '/pages/farming.html' },
    { label: 'Wallet', icon: 'shield', path: '/pages/wallet.html' }
  ];

  const html = `
    <div class="mobile-bottom-nav glass-panel">
      ${navItems.map(item => {
        const isActive = currentPath === item.path || (item.path === '/' && currentPath === '');
        return `
          <a href="${item.path}" class="nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'highlight-item' : ''}">
            <i data-lucide="${item.icon}" style="width: 20px; height: 20px;"></i>
            <span>${item.label}</span>
          </a>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

// Add styles
const style = document.createElement('style');
style.innerHTML = `
  .mobile-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 65px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: rgba(13, 17, 23, 0.95);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    z-index: 2000;
    padding: 0 10px;
    padding-bottom: env(safe-area-inset-bottom);
  }
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: rgba(255, 255, 255, 0.4);
    text-decoration: none;
    font-size: 0.65rem;
    font-weight: 500;
    transition: all 0.2s;
    flex: 1;
  }
  .nav-item.active {
    color: var(--color-primary);
  }
  .nav-item:active {
    transform: scale(0.92);
    opacity: 0.7;
  }
  .nav-item i {
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .highlight-item i {
    background: var(--color-primary);
    color: #000;
    padding: 8px;
    border-radius: 12px;
    margin-bottom: -5px;
    box-shadow: 0 4px 15px rgba(0, 210, 166, 0.4);
  }
  .highlight-item span { margin-top: 4px; }
  
  @media (min-width: 769px) {
    .mobile-bottom-nav { display: none; }
  }
`;
document.head.appendChild(style);
