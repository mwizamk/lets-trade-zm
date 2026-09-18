// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  projectId: "lets-trade-zm-6849d",
  appId: "1:1052285066127:web:6884f38b2642613959c9fa",
  // Fetch your API key from Firebase Console -> Project Settings -> General
  apiKey: "AIzaSyCfTSZI9HNxiveExkl8y5ZujU3RhoGupds", 
  authDomain: "lets-trade-zm-6849d.firebaseapp.com",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

