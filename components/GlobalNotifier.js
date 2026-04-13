/**
 * Global Notifier Component
 * Provides premium, glassmorphic toast notifications with sound integration.
 */

import { audio } from '../js/services/AudioEngine.js';

class GlobalNotifier {
  constructor() {
    this.container = this._createContainer();
  }

  _createContainer() {
    let el = document.getElementById('omni-notifier-container');
    if (el) return el;
    
    el = document.createElement('div');
    el.id = 'omni-notifier-container';
    el.style.cssText = `
      position: fixed; top: 100px; right: 20px;
      display: flex; flex-direction: column; gap: 12px;
      z-index: 10000; pointer-events: none;
    `;
    document.body.appendChild(el);
    return el;
  }

  /**
   * Show a premium toast
   * @param {string} title 
   * @param {string} msg 
   * @param {string} type - info, success, primary, burn
   */
  show(title, msg, type = 'primary') {
    const toast = document.createElement('div');
    const color = type === 'burn' ? '#ff4d4d' : 'var(--color-primary)';
    const isBurn = type === 'burn';
    
    toast.style.cssText = `
      background: ${isBurn ? 'linear-gradient(135deg, rgba(30,10,10,0.95), rgba(18,22,28,0.95))' : 'rgba(18, 22, 28, 0.85)'};
      border-left: 4px solid ${color};
      border-radius: 12px; padding: 16px 20px;
      width: 320px; backdrop-filter: blur(15px);
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      transform: translateX(420px);
      pointer-events: auto; position: relative; overflow: hidden;
      border: 1px solid ${isBurn ? 'rgba(255,77,77,0.2)' : 'rgba(255,255,255,0.05)'};
    `;

    toast.innerHTML = `
      <div style="font-weight: 800; color: #fff; font-size: 0.9rem; margin-bottom: 4px; display:flex; align-items:center; gap:8px;">
        ${isBurn ? '🔥' : '⚡'} ${title}
      </div>
      <div style="color: rgba(255,255,255,0.7); font-size: 0.82rem; line-height: 1.45;">${msg}</div>
      <div style="position:absolute; bottom:0; left:0; height:2px; background:${color}; width:100%;" class="progress"></div>
      ${isBurn ? '<div style="position:absolute;top:-10px;right:-10px;font-size:3rem;opacity:0.05;pointer-events:none;">🔥</div>' : ''}
    `;

    this.container.appendChild(toast);
    
    // Trigger Sound
    if (audio) audio.play('zip');

    // GSAP Entrance
    gsap.to(toast, {
        x: 0,
        duration: 0.8,
        ease: "power4.out"
    });

    // GSAP Progress Bar
    gsap.to(toast.querySelector('.progress'), {
        width: 0,
        duration: 4,
        ease: "linear"
    });

    // GSAP Exit
    gsap.to(toast, {
        x: 420,
        opacity: 0,
        delay: 4.2,
        duration: 0.6,
        ease: "power2.in",
        onComplete: () => toast.remove()
    });
  }
}

export const notifier = new GlobalNotifier();
window.omniNotify = (title, msg, type) => notifier.show(title, msg, type);
