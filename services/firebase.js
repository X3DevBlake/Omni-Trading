// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// UPDATE THESE WITH YOUR PRODUCTION PROJECT SETTINGS FROM THE FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "omni-trading-app.firebaseapp.com",
  projectId: "omni-trading-app",
  storageBucket: "omni-trading-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services to be utilized globally
export const auth = getAuth(app);
export const db = getFirestore(app);

// Example export to prove connectivity
export const isFirebaseInitialized = () => {
    return app != null;
};
