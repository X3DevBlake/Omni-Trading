export function renderFooter() {
  const container = document.getElementById('footer-container');
  if (!container) return;

  container.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <div class="logo">
            <div id="omni-footer-logo-container" style="width: 50px; height: 50px; display:inline-block; vertical-align:middle;"></div>
            <span class="logo-text" style="font-size:2rem; font-weight:900; color:#fff; vertical-align:middle;">Omni</span>
          </div>
          <p class="text-muted" style="margin-top: 15px;">
            The optimal global crypto exchange. <br/> Empowering your trading journey.
          </p>
          <div class="social-links" style="margin-top: 20px; display:flex; gap: 15px;">
            <a href="#" title="Twitter"><i data-lucide="twitter"></i></a>
            <a href="#" title="Discord"><i data-lucide="message-circle"></i></a>
            <a href="#" title="Telegram"><i data-lucide="send"></i></a>
            <a href="#" title="Github"><i data-lucide="github"></i></a>
          </div>
        </div>
        
        <div class="footer-col">
          <h4 class="footer-title">About Us</h4>
          <ul>
            <li><a href="/pages/about.html">About Omni</a></li>
            <li><a href="/pages/media-kit.html">Media Kit</a></li>
            <li><a href="/pages/omni-zone.html">Omni Zone</a></li>
            <li><a href="/pages/announcements.html">Announcements</a></li>
            <li><a href="/pages/career.html">Career</a></li>
          </ul>
        </div>
        
        <div class="footer-col">
          <h4 class="footer-title">Help & Support</h4>
          <ul>
            <li><a href="/pages/help-center.html">Help Center</a></li>
            <li><a href="/pages/trading-rules.html">Trading Rules</a></li>
            <li><a href="/pages/fee-schedule.html">Fee Schedule</a></li>
            <li><a href="/pages/contact-verifier.html">Contact Verifier</a></li>
            <li><a href="/pages/help-center.html">Submit Feedback</a></li>
          </ul>
        </div>
        
        <div class="footer-col">
          <h4 class="footer-title">Legal & Security</h4>
          <ul>
            <li><a href="/pages/proof-of-reserves.html">Proof of Reserves</a></li>
            <li><a href="/pages/legal.html">Legal Statement</a></li>
            <li><a href="/pages/legal.html">Risk Disclosure</a></li>
            <li><a href="/pages/legal.html">Privacy Policy</a></li>
            <li><a href="/pages/legal.html">AML/CTF Policy</a></li>
          </ul>
        </div>
        
        <div class="footer-col">
          <h4 class="footer-title">Products</h4>
          <ul>
            <li><a href="/pages/futures.html">USDT-M Futures</a></li>
            <li><a href="/pages/spot.html">Spot Trading</a></li>
            <li><a href="/pages/copy-trading.html">Copy Trading</a></li>
            <li><a href="/pages/affiliate.html">VIP Program</a></li>
            <li><a href="/pages/affiliate.html">Affiliate Platform</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom text-muted">
        <div class="live-ticker-strip">
          <div class="ticker-content" id="footer-ticker-content">
            <!-- Injected by useOmni -->
            OMNI Price: Loading... | Network TVL: Loading... | Total Burned: Loading...
          </div>
        </div>
        <div class="container" style="display: flex; justify-content: space-between; padding-top: 30px; padding-bottom: 60px;">
          <p>&copy; 2026 Omni. All rights reserved.</p>
          <div style="display:flex; gap:20px;">
            <a href="#" class="text-muted">Status</a>
            <a href="#" class="text-muted">Security</a>
          </div>
        </div>
      </div>
    </footer>
  `;

  const style = document.createElement('style');
  style.innerHTML = `
    .site-footer {
      background: var(--color-bg-deep);
      border-top: 1px solid var(--color-bg-light);
      padding-top: 60px;
      margin-top: 60px;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr repeat(4, 1fr);
      gap: 40px;
      margin-bottom: 40px;
    }
    .footer-title {
      font-size: 1.1rem;
      margin-bottom: 20px;
      color: #fff;
      font-weight: 600;
    }
    .footer-col ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .footer-col ul li {
      margin-bottom: 12px;
    }
    .footer-col ul li a {
      color: var(--color-text-muted);
      font-size: 0.95rem;
    }
    .footer-col ul li a:hover {
      color: var(--color-primary);
    }
    .social-links a {
      color: var(--color-text-muted);
      font-size: 0.9rem;
    }
    .social-links a:hover {
      color: var(--color-primary);
    }
    .live-ticker-strip {
      background: rgba(0, 210, 166, 0.05);
      border-top: 1px solid rgba(0, 210, 166, 0.15);
      border-bottom: 1px solid rgba(0, 210, 166, 0.15);
      padding: 12px 0;
      overflow: hidden;
      display: flex;
      justify-content: center;
    }
    .ticker-content {
      display: flex;
      gap: 30px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      color: rgba(255, 255, 255, 0.5);
    }
    .ticker-stat { display: flex; align-items: center; gap: 8px; }
    .ticker-divider { color: rgba(255, 255, 255, 0.1); }

    @media (max-width: 900px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
      }
      .footer-brand {
        grid-column: 1 / -1;
      }
    }
  `;
  document.head.appendChild(style);
}
