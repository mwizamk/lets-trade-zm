import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfTSZI9HNxiveExkl8y5ZujU3RhoGupds",
  authDomain: "lets-trade-zm-6849d.firebaseapp.com",
  projectId: "lets-trade-zm-6849d",
  storageBucket: "lets-trade-zm-6849d.firebasestorage.app",
  messagingSenderId: "1052285066127",
  appId: "1:1052285066127:web:6884f38b2642613959c9fa"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export Auth & Firestore functions
export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  doc,
  setDoc,
  getDoc
};
