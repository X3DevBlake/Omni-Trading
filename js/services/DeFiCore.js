/**
 * Omni DeFi Core Engine
 * Manages LPs, Farms, Staking, and Real-time APY Distribution.
 */

import { SoundService } from '../../services/SoundService.js';

/**
 * Core engine for Omni DeFi operations.
 * Handles liquidity pools, yield farming, OMNI staking, and real-time reward distribution.
 * Implements an observer pattern to notify UI components of state changes.
 */
class DeFiCore {
  /**
   * Initializes the DeFi engine by loading state from local storage.
   */
  constructor() {
    this.state = this.loadState();
    this.interval = null;
    this.listeners = new Set();
  }

  /**
   * Loads the DeFi state from localStorage or initializes with default values.
   * @returns {Object} The current DeFi state.
   */
  loadState() {
    const defaultState = {
      liquidity: {}, // { pairName: { tA: 0, tB: 0, lp: 0 } }
      farming: {},   // { pairName: { stakedLP: 0, rewards: 0 } }
      staking: { stakedOMNI: 0, sOMNI: 0, rewards: 0 },
      sOMNIExchangeRate: 1.0, // OMNI per sOMNI
      totalBurned: 0, 
      lastAutoClaimAt: Date.now(),
      autoClaimEnabled: localStorage.getItem('omni_autoclaim_enabled') === 'true',
      networkState: {
        totalSupply: 10000000000,
        circulatingSupply: 542000000,
        totalStaked: 120000000,
        dailyVolume: 24700000,
        omniPrice: 2.47,
        deadWallet: '0x000000000000000000000000000000000000dEaD'
      },
      stats: { totalValueLocked: 42000000, dailyVolume: 24700000 }
    };
    try {
      const saved = localStorage.getItem('omni_defi_state');
      return saved ? JSON.parse(saved) : defaultState;
    } catch {
      return defaultState;
    }
  }

  /**
   * Persists the current state to localStorage and notifies subscribers.
   */
  saveState() {
    localStorage.setItem('omni_defi_state', JSON.stringify(this.state));
    localStorage.setItem('omni_autoclaim_enabled', this.state.autoClaimEnabled);
    this.notify();
  }

  /**
   * Starts the background ticker for reward accumulation and auto-claiming.
   */
  startTicker() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      this.accumulateRewards();
      if (this.state.autoClaimEnabled) {
        this.executeAutoClaim();
      }
    }, 1000);
  }

  /**
   * Calculates and accumulates farming and staking rewards based on elapsed time.
   * Uses simulated dynamic APY models.
   */
  accumulateRewards() {
    // 1. Farming Rewards
    // Dynamic Math: (Yearly Emissions / TVL) 
    // We allocate 2,000,000 OMNI per year per standard farm
    const FARM_EMISSIONS_YEARLY = 2000000;
    const SECONDS_IN_YEAR = 31536000;
    
    Object.keys(this.state.farming).forEach(pair => {
      const farm = this.state.farming[pair];
      if (farm.stakedLP > 0) {
        // Simple Dynamic APY calculation for simulation
        const poolTVL = Math.max(farm.stakedLP * 10, 1000000); // Simulated TVL
        const apr = (FARM_EMISSIONS_YEARLY / poolTVL);
        const reward = (farm.stakedLP * apr) / SECONDS_IN_YEAR;
        farm.rewards += reward;
      }
    });

    // 2. Staking APY (Distributed via sOMNI value growth)
    // Dynamic Math: 5% of all supply is distributed to stakers over time
    if (this.state.staking.sOMNI > 0) {
       const stakingRewardPool = 500000000;
       const totalStaked = this.state.networkState.totalStaked || 1000000;
       const apr = 0.18 + (Math.random() * 0.05); // Simulated dynamic around 18-23%
       const rateIncrease = (this.state.sOMNIExchangeRate * apr) / SECONDS_IN_YEAR;
       this.state.sOMNIExchangeRate += rateIncrease;
    }

    this.saveState();
  }

  /**
   * Automatically claims rewards if the auto-claim threshold is met.
   */
  executeAutoClaim() {
    const THIRTY_MINUTES = 30 * 60 * 1000;
    const now = Date.now();
    
    if (now - this.state.lastAutoClaimAt >= THIRTY_MINUTES) {
      const totalRewards = this.getTotalUnclaimed();
      if (totalRewards > 0.0001) {
        this.claimAll(false); // Play sound every 30 mins
        
        // Haptic Feedback for Claim
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
        
        this.state.lastAutoClaimAt = now;
        this.saveState();
      }
    }
  }

  /**
   * Calculates the total amount of unclaimed rewards across all farms.
   * @returns {number} Total unclaimed OMNI.
   */
  getTotalUnclaimed() {
    let total = 0; // Staking rewards are now in the token itself (growing value)
    Object.values(this.state.farming).forEach(f => total += f.rewards);
    return total;
  }

  // ── CORE ACTIONS ──────────────────────────────────────────

  /**
   * Adds liquidity to a specified pair.
   * @param {string} pairName - Name of the liquidity pair (e.g., 'BTC-OMNI').
   * @param {number} amountT1 - Amount of the first token.
   * @param {number} amountT2 - Amount of the second token.
   * @returns {Object} Result object containing success status and LP tokens gained.
   */
  addLiquidity(pairName, amountT1, amountT2) {
    if (!this.state.liquidity[pairName]) {
      this.state.liquidity[pairName] = { t1: 0, t2: 0, lp: 0 };
    }
    const pool = this.state.liquidity[pairName];
    pool.t1 += amountT1;
    pool.t2 += amountT2;
    
    // Constant Product LP Generation Logic (as defined in Python Engine)
    const lpGained = Math.sqrt(amountT1 * amountT2);
    pool.lp += lpGained;
    
    // Issue LP Tokens to User Wallet
    const wallet = JSON.parse(localStorage.getItem('omni_wallet') || '{"liquid":{}}');
    const lpSymbol = `${pairName}-LP`.toUpperCase();
    wallet.liquid[lpSymbol] = (wallet.liquid[lpSymbol] || 0) + lpGained;
    localStorage.setItem('omni_wallet', JSON.stringify(wallet));
    
    SoundService.play('zip');
    this.processBurn(amountT1, 'DEPOSIT');
    this.saveState();
    return { success: true, lpGained };
  }

  /**
   * Stakes LP tokens into a yield farm.
   * @param {string} pairName - Name of the pair to stake LP for.
   * @param {number} amountLP - Amount of LP tokens to stake.
   * @returns {Object} Result object with success status and optional error message.
   */
  stakeLP(pairName, amountLP) {
    const lpSymbol = `${pairName}-LP`.toUpperCase();
    const wallet = JSON.parse(localStorage.getItem('omni_wallet') || '{"liquid":{}}');
    
    if ((wallet.liquid[lpSymbol] || 0) < amountLP) {
      return { success: false, msg: `Insufficient ${lpSymbol} tokens` };
    }
    
    // Deduct from Wallet
    wallet.liquid[lpSymbol] -= amountLP;
    localStorage.setItem('omni_wallet', JSON.stringify(wallet));

    if (!this.state.farming[pairName]) {
      this.state.farming[pairName] = { stakedLP: 0, rewards: 0 };
    }
    this.state.farming[pairName].stakedLP += amountLP;
    
    SoundService.play('zip');
    this.saveState();
    return { success: true };
  }

  /**
   * Stakes OMNI tokens to receive sOMNI (staked OMNI).
   * @param {number} amount - Amount of OMNI to stake.
   * @returns {Object} Result object with success status and sOMNI gained.
   */
  stakeOMNI(amount) {
    // Current OMNI / Rate = sOMNI issued
    const sOMNIIssued = amount / this.state.sOMNIExchangeRate;
    this.state.staking.stakedOMNI += amount;
    this.state.staking.sOMNI += sOMNIIssued;
    
    // Issue sOMNI Reward Tokens to Wallet
    const wallet = JSON.parse(localStorage.getItem('omni_wallet') || '{"liquid":{}}');
    wallet.liquid.sOMNI = (wallet.liquid.sOMNI || 0) + sOMNIIssued;
    localStorage.setItem('omni_wallet', JSON.stringify(wallet));

    SoundService.play('zip');
    this.processBurn(amount, 'STAKE');
    this.saveState();
    return { success: true, sOMNIGained: sOMNIIssued };
  }

  /**
   * Claims all pending farming rewards and adds them to the user's OMNI balance.
   * @param {boolean} [silent=false] - If true, suppresses the claim sound effect.
   * @returns {number} Total OMNI harvested.
   */
  claimAll(silent = false) {
    // Note: Staking rewards are now embedded in sOMNI value. 
    // This claimAll primarily harvests Yield Farming rewards.
    let totalHarvested = 0;
    Object.keys(this.state.farming).forEach(p => {
      totalHarvested += this.state.farming[p].rewards;
      this.state.farming[p].rewards = 0;
    });

    if (totalHarvested > 0) {
      const wallet = JSON.parse(localStorage.getItem('omni_wallet') || '{"liquid":{}}');
      wallet.liquid.OMNI = (wallet.liquid.OMNI || 0) + totalHarvested;
      localStorage.setItem('omni_wallet', JSON.stringify(wallet));

      if (!silent) {
        SoundService.play('zip'); // Use spaceship sound per request
      }
      this.saveState();
    }
    return totalHarvested;
  }

  // ── DEFLATIONARY BURN ENGINE ─────────────────────────────
  
  /**
   * Process a burn event across the platform.
   * @param {number} amount - The base amount being transacted.
   * @param {string} type - TRADE, STAKE, DEPOSIT, WITHDRAW
   */
  processBurn(amount, type) {
    const rate = 0.015; // Global 1.5% Burn Rate
    
    const burned = amount * rate;
    this.state.totalBurned += burned;
    this.state.networkState.circulatingSupply -= burned;
    
    console.log(`🔥 [GLOBAL BURN] ${burned.toFixed(6)} OMNI removed from supply via ${type}`);
    
    // Notify ecosystem update
    if (window.omniNotify) {
      window.omniNotify('OMNI Burned (1.5%)', `${burned.toFixed(6)} OMNI sent to Dead Wallet via ${type}`, 'burn');
    }
  }

  /**
   * Adds a subscriber function to be notified on state changes.
   * @param {Function} fn - The callback function.
   */
  subscribe(fn) { this.listeners.add(fn); }

  /**
   * Removes a subscriber function.
   * @param {Function} fn - The callback function to remove.
   */
  unsubscribe(fn) { this.listeners.delete(fn); }

  /**
   * Notifies all subscribers of a state change.
   */
  notify() { this.listeners.forEach(fn => fn(this.state)); }
}

export const defi = new DeFiCore();
// Start background loop immediately
defi.startTicker();
