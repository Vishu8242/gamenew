import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB7amZJW8rVnK7hUx6WCOZCGQaXtdym-jI",
  authDomain: "brand-9feb3.firebaseapp.com",
  projectId: "brand-9feb3",
  storageBucket: "brand-9feb3.firebasestorage.app",
  messagingSenderId: "1012900670460",
  appId: "1:1012900670460:web:a50083103945da23ade079",
  measurementId: "G-ZKLY2DJVWC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
