// admin.js
import { 
  db, 
  auth, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/**
 * Verify if the logged-in user has admin privileges
 * @param {Function} onSuccess Executed if admin verified
 * @param {Function} onFailure Executed if non-admin or unauthenticated
 */
export function verifyAdminAccess(onSuccess, onFailure) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (onFailure) onFailure("Unauthenticated user");
      return;
    }

    // Check user role from Firestore 'users' collection
    const userRef = doc(db, "users", user.uid);
    onSnapshot(userRef, (snap) => {
      if (snap.exists() && snap.data().role === "admin") {
        if (onSuccess) onSuccess(user);
      } else {
        if (onFailure) onFailure("Access denied. Admin privileges required.");
      }
    });
  });
}

/**
 * Real-time listener for customer orders
 * @param {Function} renderCallback Callback function receiving orders array
 */
export function subscribeToOrders(renderCallback) {
  return onSnapshot(collection(db, "orders"), (snapshot) => {
    const orders = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() });
    });
    if (renderCallback) renderCallback(orders);
  });
}

/**
 * Update the status and credentials of a customer order
 * @param {string} orderDocId Firestore document ID
 * @param {string} newStatus e.g. "Completed", "Pending", "Cancelled"
 * @param {string} credentials Account login details/credentials to assign
 */
export async function updateOrderStatus(orderDocId, newStatus, credentials = "") {
  try {
    const orderRef = doc(db, "orders", orderDocId);
    await updateDoc(orderRef, {
      status: newStatus,
      assignedCredentials: credentials,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (err) {
    console.error("Failed to update order:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a specific service from the catalog
 * @param {string} serviceDocId Firestore document ID
 */
export async function removeServiceFromCatalog(serviceDocId) {
  try {
    await deleteDoc(doc(db, "services", serviceDocId));
    return { success: true };
  } catch (err) {
    console.error("Failed to delete service:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Save or Update a service item in Firestore
 * @param {Object} serviceData Service details object
 * @param {string|null} docId Optional document ID for updates
 */
export async function saveCatalogService(serviceData, docId = null) {
  try {
    const data = {
      ...serviceData,
      price: Number(serviceData.price),
      updatedAt: new Date().toISOString()
    };

    if (docId) {
      await updateDoc(doc(db, "services", docId), data);
    } else {
      await addDoc(collection(db, "services"), data);
    }
    return { success: true };
  } catch (err) {
    console.error("Failed to save service:", err);
    return { success: false, error: err.message };
  }
}
