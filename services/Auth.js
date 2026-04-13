import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB_el1eFz-1VJfD6AjSU40rFgzxheuNX2w",
  authDomain: "omni-trading-c7ff4.firebaseapp.com",
  projectId: "omni-trading-c7ff4",
  storageBucket: "omni-trading-c7ff4.appspot.com",
  messagingSenderId: "838122721189",
  appId: "1:838122721189:web:9c9e3207b022ff0094e24c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export const loginCustom = async (email, password) => {
    // Master Admin Backdoor
    if (email === 'rgkdevx1@gmail.com' && password === 'Starbornx1*') {
        localStorage.setItem('omni_custom_auth', 'MASTER_ADMIN');
        return { uid: 'MASTER_ADMIN', email: email, isAdmin: true };
    }
    return null;
};

export const loginWithGoogle = async () => {
    try {
        // First attempt popup (Desktop)
        const result = await signInWithPopup(auth, provider);
        await initUserProfile(result.user);
        return result.user;
    } catch (error) {
        console.warn("Popup Failed, attempting Redirect:", error);
        
        // Fallback to Redirect for mobile/safari
        try {
            await signInWithRedirect(auth, provider);
        } catch (redirectError) {
            console.error("Redirect also failed:", redirectError);
            throw redirectError;
        }
    }
};

export const handleRedirectResult = async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            await initUserProfile(result.user);
            return result.user;
        }
        return null;
    } catch (e) {
        console.error("Error handling redirect:", e);
        throw e;
    }
};

const initUserProfile = async (user) => {
    if (!user) return;
    const { doc, getDoc, setDoc } = await import('firebase/firestore');
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
        console.log("Initializing new Sovereign Node Profile for:", user.email);
        await setDoc(userRef, {
            email: user.email,
            uid: user.uid,
            createdAt: new Date().toISOString(),
            isGenesis: false,
            shortAddr: user.email.split('@')[0].substring(0,6).toUpperCase(),
            // SaaS Tier Gating
            tier: 'FREE',
            hashrateLimit: 0, // MH/s
            status: 'INACTIVE',
            wallet: {
                liquid: { OMNI: 3000, USD: 75000, BTC: 0.5, ETH: 5.0 },
                staked: {}
            },
            miningState: {
                cloudBalance: 0,
                lastSyncAt: Date.now(),
                totalMined: 0
            }
        });
    }
};

export const getUserProfile = async (uid) => {
    const { doc, getDoc } = await import('firebase/firestore');
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? snap.data() : null;
};

export const logoutUser = async () => {
    try {
        localStorage.removeItem('omni_custom_auth');
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

export { auth, db, onAuthStateChanged };
