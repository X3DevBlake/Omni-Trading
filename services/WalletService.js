import { auth, db } from './Auth.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { TOP_100_ASSETS } from '../data/CryptoDatabase.js';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const BURN_RATE = 0.015; // 1.5% Deflationary Burn
const ADMINISTRATIVE_MASTER_ADDRESS = '0x71562b71999873DB5b286dF957af199Ec94617F7';

export class WalletService {
    /**
     * Helper to get current Firebase User Profile.
     */
    static async getUserProfile() {
        // Fallback for custom DB auth
        const customAuth = localStorage.getItem('omni_custom_auth');
        if (customAuth) return { uid: customAuth, email: customAuth };

        return new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged(user => {
                unsubscribe();
                resolve(user);
            });
        });
    }

    /**
     * Initializes cloud wallet or returns live balance state asynchronously
     */
    static async getBalance() {
        const user = await this.getUserProfile();
        
        // Seed default 100 tokens list
        const defaultAssets = { USD: 75000.00 };
        TOP_100_ASSETS.forEach(coin => {
            if(['BTC','ETH','OMNI', 'sOMNI'].includes(coin.symbol)) return; // Special custom amounts below
            defaultAssets[coin.symbol] = 0;
        });
        defaultAssets['BTC'] = 0.5;
        defaultAssets['ETH'] = 5.0;
        defaultAssets['OMNI'] = user && user.uid === 'MASTER_ADMIN' ? 10_000_000_000 : 3000;
        defaultAssets['sOMNI'] = 0;
        
        if (!user) {
            console.warn("WalletService: Offline Mode Triggered (No User Auth Found). Running default fallbacks for demo.");
            return {
               liquid: defaultAssets,
               staked: {}
            };
        }

        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists() && docSnap.data().wallet) {
            return docSnap.data().wallet;
        } else {
             // Create highly-funded default testnet user state for sandbox testing
             const defaultData = {
                 wallet: {
                     liquid: defaultAssets,
                     staked: {}
                 }
             };
             await setDoc(userRef, defaultData, { merge: true });
             return defaultData.wallet;
        }
    }

    /**
     * Fundamental Banking: Add fiat or crypto directly natively
     */
    static async deposit(asset, amount) {
        const user = await this.getUserProfile();
        if(!user) return { success: false, msg: 'Authentication required' };
        
        try {
            const wallet = await this.getBalance();
            wallet.liquid[asset] = (wallet.liquid[asset] || 0) + parseFloat(amount);
            
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { wallet });
            return { success: true, newBalance: wallet };
        } catch(e) { return { success: false, msg: e.message }; }
    }

    /**
     * Fundamental Banking: Burn fiat or crypto
     */
    static async withdraw(asset, amount) {
        const user = await this.getUserProfile();
        if(!user) return { success: false, msg: 'Authentication required' };
        
        try {
            const wallet = await this.getBalance();
            const currentAmount = wallet.liquid[asset] || 0;
            
            if(currentAmount < amount) return { success: false, msg: `Insufficient ${asset} balance.` };
            
            wallet.liquid[asset] -= amount;
            
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { wallet });
            return { success: true, newBalance: wallet };
        } catch(e) { return { success: false, msg: e.message }; }
    }

    /**
     * Staking mechanism: Locks a liquid asset up into Vault yield pools.
     */
    static async stakeAsset(asset, amount, lockDuration) {
        const user = await this.getUserProfile();
        if(!user) return { success: false, msg: 'Authentication required' };
        
        try {
             const wallet = await this.getBalance();
             const currentLiquid = wallet.liquid[asset] || 0;
             if(currentLiquid < amount) return { success: false, msg: `Insufficient liquid ${asset} available for staking allocation.` };
             
             // Move to staked balances
             wallet.liquid[asset] -= amount;
             wallet.staked[asset] = (wallet.staked[asset] || 0) + parseFloat(amount);
             
             const userRef = doc(db, 'users', user.uid);
             await updateDoc(userRef, { wallet });
             return { success: true, newBalance: wallet };
        } catch(e) { return { success: false, msg: e.message }; }
    }

    /**
     * Spot Trading Executions - Market / Limit abstractions via Websocket feeds
     */
    static async executeBuy(asset, spendUSD, exchangeRate) {
        const user = await this.getUserProfile();
        if(!user) return { success: false, msg: "Login required to trace payload to backend networks." };
        
        try {
            const wallet = await this.getBalance();
            const availableUSD = wallet.liquid['USD'] || 0;
            
            if (availableUSD < spendUSD) return { success: false, msg: `Insufficient USD! Required: $${spendUSD.toLocaleString()}. Avaialble: $${availableUSD.toLocaleString()}.` };
            
            const amountGainedRaw = spendUSD / exchangeRate;
            const burnAmount = amountGainedRaw * BURN_RATE;
            const amountGained = amountGainedRaw - burnAmount;
            
            // Execute trade via backend doc payload map
            wallet.liquid['USD'] -= spendUSD;
            wallet.liquid[asset] = (wallet.liquid[asset] || 0) + amountGained;
            
            // Log the burn for the Explorer
            wallet.totalBurned = (wallet.totalBurned || 0) + burnAmount;
            
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { wallet });
            
            // Broadcast the Burn to the physical Layer-1 Chain
            if (asset === 'OMNI') this._broadcastBurn(burnAmount);
            
            return { success: true, assetGained: amountGained, newBalance: wallet };
        } catch(e) { return { success: false, msg: e.message }; }
    }
    
    /**
     * Real conversion loop closing a Spot Trade natively mapped to cloud.
     */
    static async executeSell(asset, sellAmount, exchangeRate) {
        const user = await this.getUserProfile();
        if(!user) return { success: false, msg: "Login required." };
        
        try {
            const wallet = await this.getBalance();
            const availableAsset = wallet.liquid[asset] || 0;
            
            if (availableAsset < sellAmount) return { success: false, msg: `Insufficient ${asset}! Available: ${availableAsset}. Required: ${sellAmount}.` };
            
            const usdGainedRaw = sellAmount * exchangeRate;
            const burnAmount = usdGainedRaw * BURN_RATE;
            const usdGained = usdGainedRaw - burnAmount;
            
            // Execute
            wallet.liquid[asset] -= sellAmount;
            wallet.liquid['USD'] = (wallet.liquid['USD'] || 0) + usdGained;
            
            // Log burn in USD value for tracking
            wallet.totalBurnedUSD = (wallet.totalBurnedUSD || 0) + burnAmount;
            
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { wallet });
            
            // Broadcast the Burn (in OMNI equivalent if applicable)
            if (asset === 'OMNI') this._broadcastBurn(sellAmount * BURN_RATE); 

            return { success: true, usdGained: usdGained, newBalance: wallet };
        } catch(e) { return { success: false, msg: e.message }; }
    }
    /**
     * Deterministic Chain Address: Hash the UID into a valid EVM Address
     */
    static getChainAddress(uid) {
        if (!uid) return null;
        if (uid === 'MASTER_ADMIN') return ADMINISTRATIVE_MASTER_ADDRESS;
        
        // Simple stable hash to create a unique but persistent 0x address from UID
        let hash = 0;
        for (let i = 0; i < uid.length; i++) {
            hash = ((hash << 5) - hash) + uid.charCodeAt(i);
            hash |= 0; 
        }
        
        const hex = Math.abs(hash).toString(16).padStart(40, '0');
        const addr = '0x' + hex.substring(0, 40);
        return addr;
    }
    /**
     * Broadcast Burn: Send OMNI to the zero address on the physical L1 chain.
     */
    static async _broadcastBurn(amount) {
        try {
            // Only burn OMNI on the real chain to affect Explorer supply
            const rpcUrl = 'http://localhost:8545';
            const payload = {
                jsonrpc: "2.0",
                method: "eth_sendTransaction",
                params: [{
                    from: ADMINISTRATIVE_MASTER_ADDRESS,
                    to: NULL_ADDRESS,
                    value: "0x" + (BigInt(Math.floor(amount * 10**9)) * 10n**9n).toString(16),
                    gas: "0x5208" // 21000
                }],
                id: 1
            };
            await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch(e) { console.error("Burn Broadcast failed:", e); }
    }
}
