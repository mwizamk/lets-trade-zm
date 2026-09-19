// admin.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// REPLACE WITH YOUR ACTUAL ADMIN EMAIL
const ADMIN_EMAIL = "your-admin-email@gmail.com";

const ordersTable = document.getElementById("ordersTable");
const priceTable = document.getElementById("priceTable");
const customersCount = document.getElementById("customers");
const ordersCount = document.getElementById("orders");
const activeCount = document.getElementById("active");

// 1. Guard route & check Auth status
onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    window.location.href = "admin-login.html";
  } else {
    initAdminListeners();
  }
});

// 2. Realtime Firestore Synchronization
function initAdminListeners() {
  // Synchronize Orders
  onSnapshot(collection(db, "orders"), (snapshot) => {
    const orders = [];
    let active = 0;
    const userIds = new Set();

    snapshot.forEach((docSnap) => {
      const order = { id: docSnap.id, ...docSnap.data() };
      orders.push(order);
      if (order.userId) userIds.add(order.userId);
      if (order.status === "Approved") active++;
    });

    customersCount.textContent = userIds.size;
    ordersCount.textContent = orders.length;
    activeCount.textContent = active;

    if (orders.length === 0) {
      ordersTable.innerHTML = "<tr><td colspan='6'>No orders yet.</td></tr>";
    } else {
      ordersTable.innerHTML = orders.map(o => `
        <tr>
          <td>${o.id.substring(0, 6)}...</td>
          <td>${o.name || 'N/A'}<br>${o.number || 'N/A'}</td>
          <td>${Array.isArray(o.services) ? o.services.map(s => s.name).join("<br>") : (o.service || 'N/A')}</td>
          <td>K${o.total || o.price || 0}</td>
          <td><b>${o.status || 'Pending'}</b></td>
          <td>
            <button class="action" onclick="window.updateOrderStatus('${o.id}', 'Approved')">Approve</button>
            <button class="action deny" onclick="window.updateOrderStatus('${o.id}', 'Denied')">Deny</button>
          </td>
        </tr>
      `).join("");
    }
  });

  // Synchronize Prices
  onSnapshot(collection(db, "prices"), (snapshot) => {
    const prices = [];
    snapshot.forEach((docSnap) => {
      prices.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (prices.length === 0) {
      priceTable.innerHTML = "<tr><td colspan='3'>No custom prices added.</td></tr>";
    } else {
      priceTable.innerHTML = prices.map(p => `
        <tr>
          <td>${p.name}</td>
          <td>K${p.price}</td>
          <td><button class="action deny" onclick="window.deletePriceItem('${p.id}')">Delete</button></td>
        </tr>
      `).join("");
    }
  });
}

// 3. Global Action Handlers (Accessible from HTML onclick)
window.addPrice = async function() {
  const nameInput = document.getElementById("pname");
  const priceInput = document.getElementById("pprice");
  const name = nameInput.value.trim();
  const price = Number(priceInput.value);

  if (!name || !price) return alert("Please enter a valid name and price.");

  try {
    const customId = name.toLowerCase().replace(/\s+/g, '_');
    await setDoc(doc(db, "prices", customId), { name, price });
    nameInput.value = "";
    priceInput.value = "";
  } catch (err) {
    alert("Error adding item: " + err.message);
  }
};

window.updateOrderStatus = async function(orderId, status) {
  try {
    await updateDoc(doc(db, "orders", orderId), { status });
  } catch (err) {
    alert("Error updating order: " + err.message);
  }
};

window.deletePriceItem = async function(priceId) {
  try {
    await deleteDoc(doc(db, "prices", priceId));
  } catch (err) {
    alert("Error deleting item: " + err.message);
  }
};

window.logout = async function() {
  await signOut(auth);
  window.location.href = "admin-login.html";
};
