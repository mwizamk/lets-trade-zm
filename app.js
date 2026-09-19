// app.js
import { auth, db, collection, onSnapshot, addDoc } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Global Store for Services
let activeServices = [];

/**
 * Listens to Firestore 'services' collection and updates local state + UI
 * @param {Function} callback Optional render callback receiving (services)
 */
export function subscribeToServices(callback) {
  return onSnapshot(collection(db, "services"), (snapshot) => {
    activeServices = [];
    snapshot.forEach((doc) => {
      activeServices.push({ id: doc.id, ...doc.data() });
    });
    if (callback) callback(activeServices);
  });
}

/**
 * Filter services by ownership type
 * @param {Array} services List of services
 * @param {string} ownership 'All' | 'Shared' | 'Private'
 */
export function filterServicesByOwnership(services, ownership = "All") {
  if (ownership === "All") return services;
  return services.filter(
    (s) => (s.ownership || "").toLowerCase() === ownership.toLowerCase()
  );
}

/**
 * Calculate total price of selected elements
 * @param {string} selector CSS selector for checked checkboxes
 * @returns {number} Summed total
 */
export function calculateSelectedTotal(selector = "#services input:checked") {
  const selected = [...document.querySelectorAll(selector)];
  return selected.reduce((sum, item) => sum + Number(item.value || 0), 0);
}

/**
 * Listens for auth state changes across pages
 * @param {Function} onUserSignedIn Callback for signed-in user
 * @param {Function} onUserSignedOut Callback for signed-out user
 */
export function monitorAuthState(onUserSignedIn, onUserSignedOut) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (onUserSignedIn) onUserSignedIn(user);
    } else {
      if (onUserSignedOut) onUserSignedOut();
    }
  });
}

/**
 * Sign out current user session
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
}
