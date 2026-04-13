/**
 * Omni State Hooks
 * A centralized reactive system for cross-page state synchronization.
 * Inspired by modern React hooks but built for Vanilla JS components.
 */

import { defi } from '../services/DeFiCore.js';

class OmniState {
  constructor() {
    this.subscribers = new Set();
    this._stats = defi.state.networkState || {};
    this._wallet = this._loadWallet();
    this._user = this._loadUser();
    
    // Listen to DeFiCore changes
    defi.subscribe((s) => {
      this._stats = s.networkState;
      this.notify();
    });

    // Listen to wallet changes (local storage)
    window.addEventListener('storage', (e) => {
        if (e.key === 'omni_wallet') {
            this._wallet = this._loadWallet();
            this.notify();
        }
    });

    // Simulated Price Volatility
    setInterval(() => {
        if (this._stats) {
            this._stats.omniPrice += (Math.random() - 0.5) * 0.01;
            this.notify();
        }
    }, 5000);
  }

  _loadWallet() {
      try {
          return JSON.parse(localStorage.getItem('omni_wallet') || '{}');
      } catch { return {}; }
  }

  _loadUser() {
      // Check if wallet is active (BIP39 sovereign auth)
      const wallet = this._loadWallet();
      if (wallet && wallet.address && wallet.active) {
          return {
              address: wallet.address,
              shortAddr: wallet.address.slice(0, 6) + '...' + wallet.address.slice(-4),
              type: 'SOVEREIGN_BIP39',
              isGenesis: wallet.address.startsWith('0xG') || wallet.isGenesis
          };
      }
      return null;
  }

  login(walletData) {
      localStorage.setItem('omni_wallet', JSON.stringify({ ...walletData, active: true }));
      this._wallet = walletData;
      this._user = this._loadUser();
      this.notify();
  }

  logout() {
      const wallet = this._loadWallet();
      if (wallet) {
          wallet.active = false;
          localStorage.setItem('omni_wallet', JSON.stringify(wallet));
      }
      this._user = null;
      this.notify();
  }

  get stats() { return this._stats; }
  get wallet() { return this._wallet; }
  get user() { return this._user; }
  get burnData() { return defi.state.totalBurned; }

  subscribe(fn) {
    this.subscribers.add(fn);
    fn(this); // Initial call
    return () => this.subscribers.delete(fn);
  }

  notify() {
    this.subscribers.forEach(fn => fn(this));
  }
}

export const useOmni = new OmniState();
