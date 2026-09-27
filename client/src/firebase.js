import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Nikhila Foods Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPX4rexs-RK5AH-U9v-TvQXhLUz_lb570",
  authDomain: "nikhilafoods-38dc6.firebaseapp.com",
  projectId: "nikhilafoods-38dc6",
  storageBucket: "nikhilafoods-38dc6.firebasestorage.app",
  messagingSenderId: "221483472231",
  appId: "1:221483472231:web:dd12a2dd40f0fe86184bc2",
  measurementId: "G-KVFYH6121W"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Safe Analytics initialization for browser environments
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('📊 Firebase Analytics initialized for Nikhila Foods');
    }
  }).catch((err) => {
    console.warn('Analytics not supported in this environment:', err);
  });
}

console.log('🔥 Connected to Firebase project: nikhilafoods-38dc6');
