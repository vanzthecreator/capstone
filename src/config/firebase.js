// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDMZ-tfRDtwXuPaJdR7l1Wl8HyEGbLKeLc",
  authDomain: "mygoals-b6ba8.firebaseapp.com",
  projectId: "mygoals-b6ba8",
  storageBucket: "mygoals-b6ba8.firebasestorage.app",
  messagingSenderId: "1005415982251",
  appId: "1:1005415982251:web:780f0376276279173f83ee",
  measurementId: "G-EMYE2SZCS3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth, Firestore, and Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;