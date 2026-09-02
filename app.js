// Point this to your deployed Firebase Function API endpoint
const API_BASE_URL = "https://us-central1-YOUR_FIREBASE_PROJECT.cloudfunctions.net/app/api";

let availableServices = [];
let selectedServiceIds = new Set();
let paymentMethods = [];

document.addEventListener("DOMContentLoaded", () => {
  initData();

  document.getElementById("proceed-btn").addEventListener("click", openCheckoutModal);
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("submit-order").addEventListener("click", submitCheckout);
});

async function initData() {
  try {
    const [srvRes, payRes] = await Promise.all([
      fetch(`${API_BASE_URL}/services`),
      fetch(`${API_BASE_URL}/payment-methods`)
    ]);

    availableServices = await srvRes.json();
    paymentMethods = await payRes.json();

    renderServices();
    renderPaymentMethods();
  } catch (err) {
    console.error("Failed to load initial data", err);
  }
}

function renderServices() {
  const container = document.getElementById("services-list");
  container.innerHTML = availableServices.map(s => `
    <div onclick="toggleService('${s.id}')" id="srv-${s.id}" class="p-4 border rounded-lg cursor-pointer hover:border-gray-400">
      <div class="flex justify-between items-start">
        <div>
          <h4 class="font-medium">${s.service_name}</h4>
          <p class="text-sm text-gray-500">${s.description}</p>
        </div>
        <span class="font-bold text-indigo-600">$${s.price}</span>
      </div>
    </div>
  `).join('');
}

function toggleService(id) {
  if (selectedServiceIds.has(id)) {
    selectedServiceIds.delete(id);
  } else {
    selectedServiceIds.add(id);
  }
  updateUI();
}

function updateUI() {
  availableServices.forEach(s => {
    const el = document.getElementById(`srv-${s.id}`);
    if (selectedServiceIds.has(s.id)) {
      el.className = "p-4 border rounded-lg cursor-pointer border-indigo-600 bg-indigo-50 shadow-sm";
    } else {
      el.className = "p-4 border rounded-lg cursor-pointer hover:border-gray-400";
    }
  });

  const selectedItems = availableServices.filter(s => selectedServiceIds.has(s.id));
  const cartList = document.getElementById("cart-items");
  const totalEl = document.getElementById("total-amount");
  const btn = document.getElementById("proceed-btn");

  if (selectedItems.length === 0) {
    cartList.innerHTML = `<li class="py-2 text-gray-400">No services selected.</li>`;
    totalEl.textContent = "$0.00";
    btn.disabled = true;
    return;
  }

  cartList.innerHTML = selectedItems.map(item => `
    <li class="py-2 flex justify-between">
      <span>${item.service_name}</span>
      <span class="font-medium">$${item.price}</span>
    </li>
  `).join('');

  const total = selectedItems.reduce((sum, item) => sum + Number(item.price), 0);
  totalEl.textContent = `$${total.toFixed(2)}`;
  btn.disabled = false;
}

function renderPaymentMethods() {
  const select = document.getElementById("payment-select");
  select.innerHTML = '<option value="">-- Choose Option --</option>' +
    paymentMethods.map(pm => `<option value="${pm.id}">${pm.method_name}</option>`).join('');
}

function openCheckoutModal() {
  document.getElementById("checkout-modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("checkout-modal").classList.add("hidden");
}

async function submitCheckout() {
  const name = document.getElementById("cust-name").value;
  const email = document.getElementById("cust-email").value;
  const phone = document.getElementById("cust-phone").value;
  const paymentMethodId = document.getElementById("payment-select").value;

  if (!name || !email || !phone || !paymentMethodId) {
    alert("Please fill in all customer details and select a payment method.");
    return;
  }

  const selectedServices = availableServices.filter(s => selectedServiceIds.has(s.id));

  const payload = {
    clientData: { name, email, phone_number: phone },
    selectedServices,
    paymentMethodId
  };

  try {
    const res = await fetch(`${API_BASE_URL}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.success) {
      alert(`Order created successfully! Ref: ${result.referenceCode}`);
      closeModal();
      window.location.reload();
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (err) {
    alert("Checkout process failed.");
  }
}
