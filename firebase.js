// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfTSZI9HNxiveExkl8y5ZujU3RhoGupds",
  authDomain: "lets-trade-zm-6849d.firebaseapp.com",
  projectId: "lets-trade-zm-6849d",
  storageBucket: "lets-trade-zm-6849d.firebasestorage.app",
  messagingSenderId: "1052285066127",
  appId: "1:1052285066127:web:6884f38b2642613959c9fa"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export Common Firestore Utilities
export { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  collection, 
  query, 
  where, 
  onSnapshot 
};
