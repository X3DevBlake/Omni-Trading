import * as THREE from 'three';
import { renderLogo3D } from './Logo3D.js';

/**
 * Omni Loader Component
 * Renders a cinematic 3D loading overlay with a progress bar and status labels.
 */
export function renderLoader() {
  const overlay = document.createElement('div');
  overlay.id = 'omni-loader-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: #000; z-index: 20000;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    transition: opacity 1s ease, transform 1.5s cubic-bezier(0.7, 0, 0.3, 1);
  `;

  overlay.innerHTML = `
    <div id="loader-3d-container" style="width: 200px; height: 200px; margin-bottom: 40px;"></div>
    <div style="width: 250px; background: rgba(255,255,255,0.05); height: 2px; border-radius: 4px; overflow: hidden; position: relative;">
      <div id="loader-progress-bar" style="width: 0%; height: 100%; background: var(--color-primary); box-shadow: 0 0 15px var(--color-primary); transition: width 0.3s ease;"></div>
    </div>
    <div id="loader-status" style="margin-top: 15px; color: var(--color-text-muted); font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; letter-spacing: 0.1em;">
      Initializing Omni Node...
    </div>
  `;

  document.body.appendChild(overlay);

  // Render the 3D Gyrosphere
  setTimeout(() => {
    renderLogo3D('loader-3d-container', 0x00D2A6);
  }, 100);

  const statusLabels = [
    "Establishing Quantum Link...",
    "Syncing Blockchain Ledger...",
    "Initializing 4D Starfield...",
    "Warming Spaceship Engines...",
    "Ready for Takeoff"
  ];

  let progress = 0;
  const progressBar = document.getElementById('loader-progress-bar');
  const statusEl = document.getElementById('loader-status');

  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      statusEl.innerText = statusLabels[statusLabels.length - 1];
      window.dispatchEvent(new CustomEvent('omni_loaded'));
    } else {
      const labelIdx = Math.floor((progress / 100) * (statusLabels.length - 1));
      statusEl.innerText = statusLabels[labelIdx];
    }
    progressBar.style.width = `${progress}%`;
  }, 300);

  return overlay;
}

import { haptics } from '../services/HapticService.js';

/**
 * Executes the 'Spaceship Launch' animation sequence.
 * Transitions from the loader to the app content.
 */
export function launchSequence() {
  const overlay = document.getElementById('omni-loader-overlay');
  const app = document.getElementById('app');
  
  // 1. Zoom the loader image (simulating takeoff)
  overlay.style.transform = 'scale(4)';
  overlay.style.opacity = '0';
  
  // 2. Trigger Takeoff Impact
  haptics.impact();
  
  // 3. Play sound via Global Notifier sound integration if possible
  // (Synthesized whoosh would go here)
  
  setTimeout(() => {
    overlay.remove();
    // 3. Reveal app with cinematic fade-up
    gsap.from(app, {
       opacity: 0,
       y: 50,
       duration: 1.2,
       ease: "power3.out"
    });
  }, 1000);
}
