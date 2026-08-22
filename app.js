import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, getDoc, doc,
  query, where, addDoc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA09R5oFLuSPRzLc58dUHamFW0NB8P2M1Q",
  authDomain: "lets-trade-zm-488d9.firebaseapp.com",
  projectId: "lets-trade-zm-488d9",
  storageBucket: "lets-trade-zm-488d9.firebasestorage.app",
  messagingSenderId: "702125763072",
  appId: "1:702125763072:web:c6b6114b2a23cdb89e06e5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const $ = id => document.getElementById(id);
const money = n => `K${Number(n || 0).toFixed(2)}`;

function normalizePhone(phone) {
  return phone.replace(/\s+/g, "");
}

function getCart() {
  return JSON.parse(localStorage.getItem("ltz_cart") || "[]");
}

function setCart(items) {
  localStorage.setItem("ltz_cart", JSON.stringify(items));
}

// CUSTOMER PHONE-ONLY ENTRY
async function customerContinue() {
  const phone = normalizePhone($("phone").value);

  if (!phone) {
    $("message").textContent = "Enter your phone number.";
    return;
  }

  const customerQ = query(
    collection(db, "customers"),
    where("phone", "==", phone)
  );

  const customerSnap = await getDocs(customerQ);

  if (customerSnap.empty) {
    location.href = "pricelist.html";
    return;
  }

  const customerDoc = customerSnap.docs[0];

  const subscriptionQ = query(
    collection(db, "subscriptions"),
    where("customerId", "==", customerDoc.id),
    where("status", "in", ["active", "pending_expiry"])
  );

  const subscriptionSnap = await getDocs(subscriptionQ);

  if (subscriptionSnap.empty) {
    location.href = "pricelist.html";
    return;
  }

  sessionStorage.setItem("customerId", customerDoc.id);
  sessionStorage.setItem("customerPhone", phone);
  location.href = "dashboard.html";
}

// MULTI-SERVICE PRICELIST
async function loadPriceList() {
  if (!$("products")) return;

  const q = query(
    collection(db, "priceList"),
    where("status", "==", "active"),
    where("visibleInPriceList", "==", true)
  );

  const snap = await getDocs(q);

  $("products").innerHTML = snap.docs.map(d => {
    const p = d.data();

    return `
      <div class="product">
        <label>
          <input
            type="checkbox"
            class="service"
            data-id="${d.id}"
            data-service="${p.service}"
            data-package="${p.package}"
            data-ownership="${p.ownership}"
            data-price="${p.price}"
          >
          <strong>${p.service} — ${p.package}</strong>
        </label>
        <p>${money(p.price)} / ${p.durationDays} days</p>
        <small>${p.description || ""}</small>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".service")
    .forEach(x => x.addEventListener("change", updateCart));
}

function updateCart() {
  const items = [...document.querySelectorAll(".service:checked")]
    .map(x => ({
      priceId: x.dataset.id,
      service: x.dataset.service,
      package: x.dataset.package,
      ownership: x.dataset.ownership,
      quantity: 1,
      unitPrice: Number(x.dataset.price)
    }));

  setCart(items);

  if ($("cartCount"))
    $("cartCount").textContent = `${items.length} selected`;

  if ($("cartTotal"))
    $("cartTotal").textContent =
      money(items.reduce((sum, x) => sum + x.unitPrice, 0));
}

// CREATE ONE ORDER WITH MANY ORDER ITEMS
async function createOrder() {
  const items = getCart();

  if (!items.length) {
    $("message").textContent = "Select at least one service.";
    return;
  }

  const name = $("name").value.trim();
  const phone = normalizePhone($("phone").value);
  const email = $("email").value.trim();

  if (!name || !phone) {
    $("message").textContent = "Name and phone number are required.";
    return;
  }

  const total = items.reduce(
    (sum, x) => sum + x.unitPrice * x.quantity, 0
  );

  // Prototype: simple Firestore writes.
  // Admin/payment/subscription records are managed from the admin side.

  const customerQ = query(
    collection(db, "customers"),
    where("phone", "==", phone)
  );

  const customerSnap = await getDocs(customerQ);

  let customerId;

  if (customerSnap.empty) {
    const customer = await addDoc(collection(db, "customers"), {
      name,
      phone,
      email,
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      notes: ""
    });

    customerId = customer.id;
  } else {
    customerId = customerSnap.docs[0].id;
    await updateDoc(doc(db, "customers", customerId), {
      name,
      email,
      updatedAt: serverTimestamp()
    });
  }

  const order = await addDoc(collection(db, "orders"), {
    customerId,
    totalAmount: total,
    currency: "ZMW",
    orderStatus: "pending",
    paymentStatus: "awaiting_verification",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    notes: ""
  });

  for (const item of items) {
    await addDoc(collection(db, "orderItems"), {
      orderId: order.id,
      priceId: item.priceId,
      service: item.service,
      package: item.package,
      ownership: item.ownership,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.unitPrice * item.quantity,
      createdAt: serverTimestamp(),
      notes: ""
    });
  }

  await addDoc(collection(db, "payments"), {
    orderId: order.id,
    customerId,
    amount: total,
    status: "awaiting_verification",
    createdAt: serverTimestamp(),
    notes: "Customer paid and must call admin for verification."
  });

  sessionStorage.setItem("customerId", customerId);
  sessionStorage.setItem("customerPhone", phone);

  setCart([]);
  location.href = `payment.html?order=${order.id}`;
}

// PAYMENT METHODS
async function loadPaymentMethods() {
  if (!$("paymentMethods")) return;

  const q = query(
    collection(db, "paymentMethods"),
    where("available", "==", true)
  );

  const snap = await getDocs(q);

  $("paymentMethods").innerHTML = snap.docs.map(d => {
    const p = d.data();

    return `
      <div class="item">
        <h2>${p.methodName}</h2>
        <strong>${p.accountNumber}</strong>
        <p>${p.accountName}</p>
        <p>${p.instructions || ""}</p>
      </div>
    `;
  }).join("");
}

// DASHBOARD
async function loadDashboard() {
  if (!$("dashboard")) return;

  const customerId = sessionStorage.getItem("customerId");

  if (!customerId) {
    location.href = "index.html";
    return;
  }

  const q = query(
    collection(db, "subscriptions"),
    where("customerId", "==", customerId),
    where("status", "in", ["active", "pending_expiry"])
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    location.href = "pricelist.html";
    return;
  }

  $("dashboard").innerHTML = snap.docs.map(d => {
    const s = d.data();

    return `
      <div class="item">
        <h3>${s.service} — ${s.package}</h3>
        <p>Status: <strong>${s.status}</strong></p>
        <p>Expires: ${s.expiryDate || ""}</p>
        <p>Account: ${s.accountId || "Pending assignment"}</p>
      </div>
    `;
  }).join("");
}

$("continueBtn")?.addEventListener("click", customerContinue);
$("submitOrder")?.addEventListener("click", createOrder);

loadPriceList();
loadPaymentMethods();
loadDashboard();
