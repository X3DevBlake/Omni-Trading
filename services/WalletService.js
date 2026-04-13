import { auth, db } from './Auth.js';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { TOP_100_ASSETS } from '../data/CryptoDatabase.js';

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const BURN_RATE = 0.015; // 1.5% Deflationary Burn
const ADMINISTRATIVE_MASTER_ADDRESS = '0x71562b71999873DB5b286dF957af199Ec94617F7';

/**
 * Service for managing user wallets, balances, deposits, withdrawals, and trades.
 * Integrates with Firebase Firestore for cloud-based balance persistence and
 * simulates blockchain interactions for the OMNI ecosystem.
 */
export class WalletService {
    /**
     * Retrieves the current authenticated user's profile.
     * Supports both Firebase Auth and a custom administrative backdoor.
     * @returns {Promise<Object|null>} The user profile or null if not authenticated.
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
     * Retrieves the user's wallet balance from Firestore.
     * Initializes a default funded wallet for new users or when offline.
     * @returns {Promise<Object>} The wallet state containing liquid and staked balances.
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
     * Deposits a specified amount of an asset into the user's liquid wallet.
     * @param {string} asset - The asset symbol (e.g., 'USD', 'BTC').
     * @param {number|string} amount - The amount to deposit.
     * @returns {Promise<Object>} Result object with success status and new balance or error message.
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
     * Withdraws (removes) a specified amount of an asset from the user's liquid wallet.
     * @param {string} asset - The asset symbol.
     * @param {number} amount - The amount to withdraw.
     * @returns {Promise<Object>} Result object with success status and new balance or error message.
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
     * Stakes a liquid asset, moving it from the liquid wallet to the staked vault.
     * @param {string} asset - The asset symbol.
     * @param {number} amount - The amount to stake.
     * @param {number|string} lockDuration - (Optional) Duration of the stake lock.
     * @returns {Promise<Object>} Result object with success status and new balance.
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
     * Executes a buy trade: Deducts USD and adds the purchased asset after applying a burn fee.
     * @param {string} asset - The asset symbol to purchase.
     * @param {number} spendUSD - The amount of USD to spend.
     * @param {number} exchangeRate - The current market exchange rate.
     * @returns {Promise<Object>} Result object with success status and trade details.
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
     * Executes a sell trade: Deducts the asset and adds USD after applying a burn fee.
     * @param {string} asset - The asset symbol to sell.
     * @param {number} sellAmount - The amount of the asset to sell.
     * @param {number} exchangeRate - The current market exchange rate.
     * @returns {Promise<Object>} Result object with success status and trade details.
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
     * Generates a deterministic EVM-compatible address from a user's UID.
     * @param {string} uid - The user's unique identifier.
     * @returns {string|null} A hex address string or null.
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
     * Broadcasts a token burn event to the physical OMNI Layer-1 chain.
     * Sends the burned OMNI tokens to the null (dead) address.
     * @param {number} amount - The amount of OMNI to burn.
     * @private
     */
    static async _broadcastBurn(amount) {
        try {
            // Only burn OMNI on the real chain to affect Explorer supply
            // Production Fallback: Use a public provider or the user's connected node
            const rpcUrl = window.location.hostname === 'localhost' ? 'http://localhost:8545' : 'https://rpc.omni-chain.org';
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
            
            // In a production environment, this would hit the sovereign L1 node.
            // For the demo/store version, we wrap in a try/catch to ensure the app doesn't crash if the node is offline.
            await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(err => console.warn("L1 Broadcast skipped (Node Offline):", err));
            
        } catch(e) { console.error("Burn Broadcast failed:", e); }
    }
}
