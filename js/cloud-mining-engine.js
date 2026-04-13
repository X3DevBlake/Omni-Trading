/**
 * OMNI Cloud Mining Engine
 * ─────────────────────────────────────────────────────────────
 * Runs as a shared module imported by any page.
 * On every page load it checks if a paid node is active,
 * calculates all unclaimed OMNI since last visit, and
 * drips earnings into the wallet balance in real-time.
 *
 * Storage keys used:
 *   omni_cloud_nodes      – array of purchased node configs
 *   omni_wallet           – { address, cloudMiningBalance, ... }
 *   omni_cloud_live       – live state for dashboard rendering
 */
import { db, auth } from '../services/Auth.js';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

/** Syncs mining rewards to Firestore for global persistence */
export async function syncToFirestore(amount) {
  const user = auth.currentUser;
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    'miningState.cloudBalance': increment(amount),
    'miningState.totalMined': increment(amount),
    'miningState.lastSyncAt': Date.now()
  });
}

export async function fetchMiningState() {
  const user = auth.currentUser;
  if (!user) return null;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data().miningState : null;
}

// ── Constants ──────────────────
export const NETWORK_HASHRATE  = 14_200_000; // MH/s (14.2 TH/s)
export const GENESIS_REWARD    = 50;          // OMNI per block
export const HALVING_INTERVAL  = 210_000;     // blocks per era
export const AVG_BLOCK_TIME    = 60;          // seconds
export const BLOCKS_PER_DAY    = Math.floor(86400 / AVG_BLOCK_TIME); // 1440
export const OMNI_PRICE_USD    = 0.0042;      // default price

// ── Reward formula ──────────────
export function blockReward(blockHeight = 0) {
  const halvings = Math.floor(blockHeight / HALVING_INTERVAL);
  if (halvings >= 64) return 0;
  return GENESIS_REWARD / Math.pow(2, halvings);
}

/** Returns OMNI earned per second for a given hashrate (MH/s) */
export function omniPerSecond(hashrateMH, blockHeight = 0, diffFactor = 1) {
  const reward = blockReward(blockHeight);
  const shareOfNet = hashrateMH / (NETWORK_HASHRATE * diffFactor);
  return (shareOfNet * BLOCKS_PER_DAY * reward) / 86400;
}

/** Returns OMNI earned per day */
export function omniPerDay(hashrateMH, blockHeight = 0, diffFactor = 1) {
  return omniPerSecond(hashrateMH, blockHeight, diffFactor) * 86400;
}

// ── SaaS Node State ──────────────────
export async function getActiveNode() {
  const user = auth.currentUser;
  if (!user) return null;

  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  
  if (snap.exists() && snap.data().tier !== 'FREE') {
      return { 
          hashrate: snap.data().hashrateLimit || 0,
          tier: snap.data().tier,
          active: true
      };
  }
  return null;
}

export function getCloudBalance() {
  try {
    const w = JSON.parse(localStorage.getItem('omni_wallet') || '{}');
    return parseFloat(w.cloudMiningBalance || 0);
  } catch { return 0; }
}

export function addToCloudBalance(amount) {
  try {
    const w = JSON.parse(localStorage.getItem('omni_wallet') || '{}');
    w.cloudMiningBalance = (parseFloat(w.cloudMiningBalance || 0) + amount);
    localStorage.setItem('omni_wallet', JSON.stringify(w));
  } catch {}
}

export function executeClaim() {
  try {
    const w = JSON.parse(localStorage.getItem('omni_wallet') || '{}');
    const bal = parseFloat(w.cloudMiningBalance || 0);
    if (bal <= 0) return 0;

    w.spotOMNI = (parseFloat(w.spotOMNI || 0) + bal);
    w.cloudMiningBalance = 0;
    localStorage.setItem('omni_wallet', JSON.stringify(w));
    return bal;
  } catch { return 0; }
}

/** Settle any OMNI earned since the last time the engine ran (for returning visitors) */
export function settleOfflineEarnings() {
  const node = getActiveNode();
  if (!node) return 0;

  const live = JSON.parse(localStorage.getItem('omni_cloud_live') || '{}');
  const now = Date.now();
  const lastTick = live.lastTick || node.activatedAt || now;
  const secondsElapsed = Math.min((now - lastTick) / 1000, 86400 * 30); // cap at 30d

  if (secondsElapsed <= 0) return 0;

  const perSec = omniPerSecond(node.hashrate);
  const earned = perSec * secondsElapsed;
  addToCloudBalance(earned);

  // Update live state
  live.lastTick   = now;
  live.totalMined = (live.totalMined || 0) + earned;
  live.sessionStart = live.sessionStart || now;
  localStorage.setItem('omni_cloud_live', JSON.stringify(live));

  return earned;
}

// ── Real-time Ticker ────────────
let _tickerInterval = null;
const _listeners = new Set();

export function startMiningTicker(onTick) {
  // Run offline settlement first
  settleOfflineEarnings();

  if (onTick) _listeners.add(onTick);
  
  // If already running, just return immediately but keep listener
  if (_tickerInterval) {
    // Fire the listener once immediately so the UI doesn't wait 1s
    const node = getActiveNode();
    if (node) {
      const live = JSON.parse(localStorage.getItem('omni_cloud_live') || '{}');
      const snapshot = {
        perSec:       omniPerSecond(node.hashrate),
        perDay:       omniPerDay(node.hashrate),
        totalMined:   live.totalMined,
        cloudBalance: getCloudBalance(),
        node,
      };
      if (onTick) { try { onTick(snapshot); } catch {} }
    }
    return;
  }

  let ticksSinceSync = 0;

  _tickerInterval = setInterval(async () => {
    const node = await getActiveNode();
    if (!node) {
      stopMiningTicker();
      return;
    }

    const perSec = omniPerSecond(node.hashrate);
    
    // Increment local session counter and trigger cloud sync
    ticksSinceSync++;
    if (ticksSinceSync >= 10) {
        await syncToFirestore(perSec * 10);
        ticksSinceSync = 0;
    }

    // Update live state for UI listeners
    const live = JSON.parse(localStorage.getItem('omni_cloud_live') || '{}');
    live.lastTick   = Date.now();
    live.totalMined = (live.totalMined || 0) + perSec;
    localStorage.setItem('omni_cloud_live', JSON.stringify(live));

    // Broadcast to all registered listeners
    const snapshot = {
      perSec,
      perDay:       omniPerDay(node.hashrate),
      totalMined:   live.totalMined,
      node,
    };
    _listeners.forEach(fn => { try { fn(snapshot); } catch {} });
  }, 1000);
}

export function stopMiningTicker() {
  if (_tickerInterval) { clearInterval(_tickerInterval); _tickerInterval = null; }
}

export function addTickerListener(fn) {
  _listeners.add(fn);
}

export function removeTickerListener(fn) {
  _listeners.delete(fn);
}

/** Format OMNI amount nicely */
export function fmtOMNI(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(4) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(4) + 'K';
  return n.toFixed(6);
}

/** Auto-start on import if a node is active (runs on every page load) */
if (getActiveNode()) {
  settleOfflineEarnings();
}
