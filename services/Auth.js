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
        // First attempt popup
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Popup Failed, attempting Redirect:", error);
        
        // Handle common configuration errors
        if (error.code === 'auth/operation-not-allowed') {
            throw new Error("Google Login is not enabled in the Firebase Console.");
        }
        if (error.code === 'auth/unauthorized-domain') {
            throw new Error("This domain is not authorized. Please add it to Firebase -> Authentication -> Settings.");
        }

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
        if (result) return result.user;
        return null;
    } catch (e) {
        console.error("Error handling redirect:", e);
        throw e;
    }
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
