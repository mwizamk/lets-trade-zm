/* =========================================================
   LET'S TRADE ZM
   SINGLE FIREBASE APPLICATION SCRIPT
   ========================================================= */

import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIGURATION
   ========================================================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyA09R5oFLuSPRzLc58dUHamFW0NB8P2M1Q",

  authDomain:
    "lets-trade-zm-488d9.firebaseapp.com",

  projectId:
    "lets-trade-zm-488d9",

  storageBucket:
    "lets-trade-zm-488d9.firebasestorage.app",

  messagingSenderId:
    "702125763072",

  appId:
    "1:702125763072:web:c6b6114b2a23cdb89e06e5"
};


/* =========================================================
   INITIALIZE FIREBASE ONCE
   ========================================================= */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/* =========================================================
   HELPERS
   ========================================================= */

const $ = id =>
  document.getElementById(id);


function money(value) {

  return `K${Number(value || 0).toFixed(2)}`;

}


function normalizePhone(phone) {

  return String(phone || "")
    .replace(/\s+/g, "")
    .trim();

}


function getCart() {

  try {

    return JSON.parse(
      localStorage.getItem("ltz_cart") || "[]"
    );

  } catch {

    return [];

  }

}


function setCart(items) {

  localStorage.setItem(
    "ltz_cart",
    JSON.stringify(items)
  );

}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/[&<>"']/g, character => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[character]));

}


/* =========================================================
   CUSTOMER LOGIN / HOME PAGE
   ========================================================= */

async function customerContinue() {

  const phoneInput = $("phone");

  const message = $("message");

  if (!phoneInput) return;


  const phone =
    normalizePhone(phoneInput.value);


  if (!phone) {

    if (message) {

      message.textContent =
        "Enter your phone number.";

    }

    return;

  }


  const button =
    $("continueBtn");


  if (button) {

    button.disabled = true;

    button.textContent =
      "Checking...";

  }


  try {

    const customerQuery = query(

      collection(
        db,
        "clients"
      ),

      where(
        "phone",
        "==",
        phone
      )

    );


    const customerSnapshot =
      await getDocs(customerQuery);


    /*
      New customer
    */

    if (customerSnapshot.empty) {

      location.href =
        "pricelist.html";

      return;

    }


    const customer =
      customerSnapshot.docs[0];


    const subscriptionQuery =
      query(

        collection(
          db,
          "subscriptions"
        ),

        where(
          "clientId",
          "==",
          customer.id
        ),

        where(
          "status",
          "in",
          [
            "active",
            "pending_expiry"
          ]
        )

      );


    const subscriptionSnapshot =
      await getDocs(
        subscriptionQuery
      );


    if (subscriptionSnapshot.empty) {

      location.href =
        "pricelist.html";

      return;

    }


    sessionStorage.setItem(
      "clientId",
      customer.id
    );

    sessionStorage.setItem(
      "customerPhone",
      phone
    );


    location.href =
      "dashboard.html";


  } catch (error) {

    console.error(error);

    if (message) {

      message.textContent =
        "Database connection error. Please try again.";

    }

    if (button) {

      button.disabled = false;

      button.textContent =
        "Continue";

    }

  }

}


/* =========================================================
   LOAD PRICELIST
   ========================================================= */

async function loadPriceList() {

  const products =
    $("products");


  if (!products) return;


  products.innerHTML =
    `<div class="loading">Loading services...</div>`;


  try {

    const priceQuery =
      query(

        collection(
          db,
          "pricelist"
        ),

        where(
          "status",
          "==",
          "active"
        )

      );


    const snapshot =
      await getDocs(priceQuery);


    if (snapshot.empty) {

      products.innerHTML =

        `<div class="notice">
          No services are currently available.
        </div>`;

      updateCartSummary();

      return;

    }


    const cart =
      getCart();


    products.innerHTML =
      snapshot.docs.map(document => {

        const p =
          document.data();


        const checked =
          cart.some(
            item =>
              item.priceId === document.id
          );


        return `

          <div class="product">

            <label>

              <input

                type="checkbox"

                class="service"

                data-id="${document.id}"

                data-service="${escapeHTML(p.service)}"

                data-package="${escapeHTML(p.package)}"

                data-ownership="${escapeHTML(p.ownership)}"

                data-price="${Number(p.price || 0)}"

                data-duration="${Number(p.durationDays || 30)}"

                ${checked ? "checked" : ""}

              >

              <strong>
                ${escapeHTML(p.service)}
                —
                ${escapeHTML(p.package)}
              </strong>

            </label>


            <p>

              ${money(p.price)}
              /
              ${Number(p.durationDays || 30)}
              days

            </p>


            <small>

              ${escapeHTML(p.description || "")}

            </small>

          </div>

        `;

      }).join("");


    document
      .querySelectorAll(".service")
      .forEach(input => {

        input.addEventListener(
          "change",
          updateCart
        );

      });


    updateCart();


  } catch (error) {

    console.error(error);

    products.innerHTML =

      `<div class="notice">
        Unable to load PriceList.
        Check Firebase/Firestore.
      </div>`;

  }

}


/* =========================================================
   MULTI-SERVICE CART
   ========================================================= */

function updateCart() {

  const selected =
    [
      ...document.querySelectorAll(
        ".service:checked"
      )
    ];


  const items =
    selected.map(input => ({

      priceId:
        input.dataset.id,

      service:
        input.dataset.service,

      package:
        input.dataset.package,

      ownership:
        input.dataset.ownership,

      durationDays:
        Number(
          input.dataset.duration || 30
        ),

      quantity:
        1,

      unitPrice:
        Number(
          input.dataset.price || 0
        )

    }));


  setCart(items);


  updateCartSummary();

}


function updateCartSummary() {

  const cart =
    getCart();


  const total =
    cart.reduce(

      (sum, item) =>

        sum +
        Number(item.unitPrice || 0) *
        Number(item.quantity || 1),

      0

    );


  if ($("cartCount")) {

    $("cartCount").textContent =
      `${cart.length} selected`;

  }


  if ($("cartTotal")) {

    $("cartTotal").textContent =
      money(total);

  }

}


/* =========================================================
   RENDER CART PAGE
   ========================================================= */

function renderCartPage() {

  const cartContainer =
    $("cart");


  if (!cartContainer) return;


  const cart =
    getCart();


  if (!cart.length) {

    cartContainer.innerHTML = `

      <div class="notice">

        Your cart is empty.

        <br><br>

        <a href="pricelist.html">
          Browse PriceList
        </a>

      </div>

    `;


    return;

  }


  cartContainer.innerHTML =

    cart.map((item, index) => `

      <div class="item cart-item">

        <div>

          <strong>
            ${escapeHTML(item.service)}
          </strong>

          <p>
            ${escapeHTML(item.package)}
            ·
            ${escapeHTML(item.ownership)}
          </p>

        </div>


        <div>

          <strong>
            ${money(item.unitPrice)}
          </strong>

          <button
            class="remove-cart"
            data-index="${index}"
            type="button"
          >
            Remove
          </button>

        </div>

      </div>

    `).join("");


  const total =
    cart.reduce(

      (sum, item) =>

        sum +
        Number(item.unitPrice || 0),

      0

    );


  cartContainer.insertAdjacentHTML(

    "beforeend",

    `

      <div class="total-card">

        <span>Total</span>

        <strong>
          ${money(total)}
        </strong>

      </div>

    `

  );


  document
    .querySelectorAll(".remove-cart")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const updatedCart =
            getCart();


          updatedCart.splice(

            Number(
              button.dataset.index
            ),

            1

          );


          setCart(
            updatedCart
          );


          renderCartPage();

        }
      );

    });

}


/* =========================================================
   CREATE ORDER
   ========================================================= */

async function createOrder() {

  const cart =
    getCart();


  const message =
    $("message");


  if (!cart.length) {

    if (message) {

      message.textContent =
        "Your cart is empty.";

    }

    return;

  }


  const name =
    $("name")?.value.trim();


  const phone =
    normalizePhone(
      $("phone")?.value
    );


  const email =
    $("email")?.value.trim() || "";


  if (!name || !phone) {

    if (message) {

      message.textContent =
        "Full name and phone number are required.";

    }

    return;

  }


  const button =
    $("submitOrder");


  if (button) {

    button.disabled = true;

    button.textContent =
      "Saving order...";

  }


  try {

    /*
      Find existing customer
    */

    const customerQuery =
      query(

        collection(
          db,
          "clients"
        ),

        where(
          "phone",
          "==",
          phone
        )

      );


    const customerSnapshot =
      await getDocs(
        customerQuery
      );


    let clientId;


    /*
      Create customer
    */

    if (
      customerSnapshot.empty
    ) {

      const customer =
        await addDoc(

          collection(
            db,
            "clients"
          ),

          {

            name,

            phone,

            email,

            customerCode:
              String(
                Math.floor(
                  1000 +
                  Math.random() *
                  9000
                )
              ),

            status:
              "active",

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }

        );


      clientId =
        customer.id;

    }


    /*
      Update existing customer
    */

    else {

      clientId =
        customerSnapshot
          .docs[0]
          .id;


      await updateDoc(

        doc(
          db,
          "clients",
          clientId
        ),

        {

          name,

          email,

          updatedAt:
            serverTimestamp()

        }

      );

    }


    /*
      Calculate total
    */

    const total =
      cart.reduce(

        (sum, item) =>

          sum +
          Number(
            item.unitPrice || 0
          ) *
          Number(
            item.quantity || 1
          ),

        0

      );


    /*
      Generate order number
    */

    const orderNumber =
      "LTZ-" +
      Date.now();


    /*
      Save ONE order containing
      MULTIPLE items.
    */

    const order =
      await addDoc(

        collection(
          db,
          "orders"
        ),

        {

          orderId:
            orderNumber,

          clientId,

          customer: {

            name,

            phone,

            email

          },


          items:
            cart,


          total,

          currency:
            "ZMW",


          paymentMethod:
            null,


          paymentStatus:
            "pending",


          orderStatus:
            "pending",


          createdAt:
            serverTimestamp(),


          updatedAt:
            serverTimestamp()

        }

      );


    /*
      Save session
    */

    sessionStorage.setItem(
      "clientId",
      clientId
    );


    sessionStorage.setItem(
      "customerPhone",
      phone
    );


    sessionStorage.setItem(
      "latestOrderId",
      order.id
    );


    /*
      Clear cart
    */

    setCart([]);


    /*
      Continue to payment
    */

    location.href =
      `payment.html?order=${order.id}`;


  } catch (error) {

    console.error(error);

    if (message) {

      message.textContent =
        "Order could not be saved: " +
        error.message;

    }


    if (button) {

      button.disabled = false;

      button.textContent =
        "Continue to Payment";

    }

  }

}


/* =========================================================
   PAYMENT PAGE
   ========================================================= */

async function loadPaymentMethods() {

  const container =
    $("paymentMethods");


  if (!container) return;


  try {

    const snapshot =
      await getDocs(

        query(

          collection(
            db,
            "paymentMethods"
          ),

          where(
            "available",
            "==",
            true
          )

        )

      );


    if (snapshot.empty) {

      container.innerHTML =

        `<div class="notice">
          Payment instructions are not configured yet.
        </div>`;

      return;

    }


    container.innerHTML =

      snapshot.docs.map(
        document => {

          const p =
            document.data();


          return `

            <div class="item">

              <h2>
                ${escapeHTML(
                  p.methodName
                )}
              </h2>

              <strong>
                ${escapeHTML(
                  p.accountNumber
                )}
              </strong>

              <p>
                ${escapeHTML(
                  p.accountName
                )}
              </p>

              <p>
                ${escapeHTML(
                  p.instructions
                )}
              </p>

            </div>

          `;

        }

      ).join("");


  } catch (error) {

    console.error(error);

    container.innerHTML =

      `<div class="notice">
        Unable to load payment methods.
      </div>`;

  }

}


/* =========================================================
   ADMIN — PRICE LIST
   ========================================================= */

async function loadAdminPriceList() {

  const container =
    $("adminPrices");


  if (!container) return;


  try {

    const snapshot =
      await getDocs(

        collection(
          db,
          "pricelist"
        )

      );


    if (snapshot.empty) {

      container.innerHTML =

        `<div class="notice">
          No PriceList items yet.
        </div>`;

      return;

    }


    container.innerHTML =

      snapshot.docs.map(
        document => {

          const p =
            document.data();


          return `

            <div class="item">

              <h3>

                ${escapeHTML(
                  p.service
                )}

                —

                ${escapeHTML(
                  p.package
                )}

              </h3>

              <p>

                ${escapeHTML(
                  p.ownership
                )}

                ·

                ${money(
                  p.price
                )}

                ·

                ${p.durationDays || 30}
                days

              </p>

              <p>
                Status:
                <strong>
                  ${escapeHTML(
                    p.status
                  )}
                </strong>
              </p>


              <button
                class="edit-price"
                data-id="${document.id}"
              >
                Edit
              </button>


              <button
                class="delete-price"
                data-id="${document.id}"
              >
                Delete
              </button>

            </div>

          `;

        }

      ).join("");


    document
      .querySelectorAll(".edit-price")
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            editPrice(
              button.dataset.id
            )
        );

      });


    document
      .querySelectorAll(".delete-price")
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            deletePrice(
              button.dataset.id
            )
        );

      });


  } catch (error) {

    console.error(error);

    container.innerHTML =

      `<div class="notice">
        Could not load PriceList.
        ${escapeHTML(
          error.message
        )}
      </div>`;

  }

}


/* =========================================================
   ADMIN — ADD / EDIT PRICE
   ========================================================= */

async function savePrice() {

  const form =
    $("priceForm");


  if (!form) return;


  const service =
    $("service")
      ?.value.trim();


  const packageName =
    $("packageName")
      ?.value.trim();


  const ownership =
    $("ownership")
      ?.value;


  const price =
    Number(
      $("price")
        ?.value
    );


  const durationDays =
    Number(
      $("durationDays")
        ?.value || 30
    );


  const status =
    $("priceStatus")
      ?.value || "active";


  if (
    !service ||
    !packageName ||
    !price
  ) {

    alert(
      "Please complete Service, Package and Price."
    );

    return;

  }


  const data = {

    service,

    package:
      packageName,

    ownership,

    price,

    currency:
      "ZMW",

    durationDays,

    description:
      $("description")
        ?.value.trim() || "",

    status,

    updatedAt:
      serverTimestamp()

  };


  const id =
    $("priceId")
      ?.value;


  try {

    if (id) {

      await updateDoc(

        doc(
          db,
          "pricelist",
          id
        ),

        data

      );

    }

    else {

      data.createdAt =
        serverTimestamp();


      await addDoc(

        collection(
          db,
          "pricelist"
        ),

        data

      );

    }


    form.reset();


    if ($("priceId")) {

      $("priceId")
        .value = "";

    }


    await loadAdminPriceList();


    alert(
      "PriceList saved successfully."
    );


  } catch (error) {

    console.error(error);

    alert(
      "Could not save PriceList: " +
      error.message
    );

  }

}


/* =========================================================
   ADMIN — EDIT PRICE
   ========================================================= */

async function editPrice(id) {

  try {

    const document =
      await getDoc(

        doc(
          db,
          "pricelist",
          id
        )

      );


    if (!document.exists()) {

      alert(
        "PriceList item not found."
      );

      return;

    }


    const p =
      document.data();


    $("priceId").value =
      id;


    $("service").value =
      p.service || "";


    $("packageName").value =
      p.package || "";


    $("ownership").value =
      p.ownership || "shared";


    $("price").value =
      p.price || "";


    $("durationDays").value =
      p.durationDays || 30;


    $("description").value =
      p.description || "";


    $("priceStatus").value =
      p.status || "active";


    window.scrollTo({

      top: 0,

      behavior:
        "smooth"

    });


  } catch (error) {

    alert(
      error.message
    );

  }

}


/* =========================================================
   ADMIN — DELETE PRICE
   ========================================================= */

async function deletePrice(id) {

  if (
    !confirm(
      "Delete this PriceList item?"
    )
  ) {

    return;

  }


  try {

    await deleteDoc(

      doc(
        db,
        "pricelist",
        id
      )

    );


    await loadAdminPriceList();


  } catch (error) {

    alert(
      "Delete failed: " +
      error.message
    );

  }

}


/* =========================================================
   ADMIN — SEED DATABASE
   ========================================================= */

async function seedDatabase() {

  try {

    /*
      Starter PriceList
    */

    await setDoc(

      doc(
        db,
        "pricelist",
        "netflix-premium-shared"
      ),

      {

        service:
          "Netflix",

        package:
          "Premium",

        ownership:
          "shared",

        price:
          65,

        currency:
          "ZMW",

        durationDays:
          30,

        description:
          "Netflix Premium shared subscription",

        status:
          "active",

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()

      },

      {
        merge:
          true
      }

    );


    /*
      Starter payment method
    */

    await setDoc(

      doc(
        db,
        "paymentMethods",
        "airtel-money"
      ),

      {

        methodName:
          "Airtel Money",

        accountName:
          "Let's Trade ZM",

        accountNumber:
          "0979276543",

        instructions:
          "Pay the exact order total, then contact admin for payment verification.",

        available:
          true,

        displayOrder:
          1,

        updatedAt:
          serverTimestamp()

      },

      {
        merge:
          true
      }

    );


    alert(
      "Database initialized successfully."
    );


    loadAdminPriceList();


  } catch (error) {

    console.error(error);

    alert(
      "Database initialization failed: " +
      error.message
    );

  }

}


/* =========================================================
   ADMIN — ORDERS
   ========================================================= */

async function loadOrders() {

  const container =
    $("adminOrders");


  if (!container) return;


  try {

    const snapshot =
      await getDocs(

        collection(
          db,
          "orders"
        )

      );


    if (snapshot.empty) {

      container.innerHTML =
        `<div class="notice">
          No orders yet.
        </div>`;

      return;

    }


    container.innerHTML =

      snapshot.docs.map(
        document => {

          const order =
            document.data();


          const items =
            Array.isArray(
              order.items
            )
              ? order.items
              : [];


          return `

            <div class="item">

              <h3>

                ${escapeHTML(
                  order.orderId ||
                  document.id
                )}

              </h3>


              <p>

                Customer:
                ${escapeHTML(
                  order.customer?.name
                )}

              </p>


              <p>

                Phone:
                ${escapeHTML(
                  order.customer?.phone
                )}

              </p>


              <p>

                Services:

                ${items
                  .map(
                    item =>
                      escapeHTML(
                        item.service
                      )
                  )
                  .join(
                    ", "
                  )}

              </p>


              <strong>

                Total:
                ${money(
                  order.total
                )}

              </strong>


              <p>

                Payment:
                <strong>
                  ${escapeHTML(
                    order.paymentStatus ||
                    "pending"
                  )}
                </strong>

              </p>


              <button
                class="approve-order"
                data-id="${document.id}"
              >
                Approve Payment
              </button>


              <button
                class="reject-order"
                data-id="${document.id}"
              >
                Reject
              </button>

            </div>

          `;

        }

      ).join("");


    document
      .querySelectorAll(
        ".approve-order"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            updateOrderStatus(
              button.dataset.id,
              "approved",
              "processing"
            )
        );

      });


    document
      .querySelectorAll(
        ".reject-order"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            updateOrderStatus(
              button.dataset.id,
              "rejected",
              "cancelled"
            )
        );

      });


  } catch (error) {

    console.error(error);

    container.innerHTML =
      `<div class="notice">
        Could not load orders.
      </div>`;

  }

}


/* =========================================================
   ADMIN — UPDATE ORDER
   ========================================================= */

async function updateOrderStatus(
  id,
  paymentStatus,
  orderStatus
) {

  try {

    await updateDoc(

      doc(
        db,
        "orders",
        id
      ),

      {

        paymentStatus,

        orderStatus,

        updatedAt:
          serverTimestamp()

      }

    );


    await loadOrders();


  } catch (error) {

    alert(
      "Could not update order: " +
      error.message
    );

  }

}


/* =========================================================
   DASHBOARD
   ========================================================= */

async function loadDashboard() {

  const dashboard =
    $("dashboard");


  if (!dashboard) return;


  const clientId =
    sessionStorage.getItem(
      "clientId"
    );


  if (!clientId) {

    location.href =
      "index.html";

    return;

  }


  try {

    const subscriptionQuery =
      query(

        collection(
          db,
          "subscriptions"
        ),

        where(
          "clientId",
          "==",
          clientId
        ),

        where(
          "status",
          "in",
          [
            "active",
            "pending_expiry"
          ]
        )

      );


    const snapshot =
      await getDocs(
        subscriptionQuery
      );


    if (snapshot.empty) {

      dashboard.innerHTML =
        `<div class="notice">
          No active subscriptions found.
        </div>`;

      return;

    }


    dashboard.innerHTML =

      snapshot.docs.map(
        document => {

          const s =
            document.data();


          return `

            <div class="item">

              <h3>

                ${escapeHTML(
                  s.service
                )}

                —

                ${escapeHTML(
                  s.package
                )}

              </h3>


              <p>

                Status:
                <strong>
                  ${escapeHTML(
                    s.status
                  )}
                </strong>

              </p>


              <p>

                Expiry:
                ${escapeHTML(
                  s.expiryDate || ""
                )}

              </p>


              <p>

                Account:
                ${escapeHTML(
                  s.accountId ||
                  "Pending assignment"
                )}

              </p>

            </div>

          `;

        }

      ).join("");


  } catch (error) {

    console.error(error);

    dashboard.innerHTML =
      `<div class="notice">
        Unable to load dashboard.
      </div>`;

  }

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

$("continueBtn")
  ?.addEventListener(
    "click",
    customerContinue
  );


$("submitOrder")
  ?.addEventListener(
    "click",
    createOrder
  );


$("priceForm")
  ?.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      savePrice();

    }
  );


$("seedDatabase")
  ?.addEventListener(
    "click",
    seedDatabase
  );


/* =========================================================
   INITIALIZE CURRENT PAGE
   ========================================================= */

loadPriceList();

renderCartPage();

loadPaymentMethods();

loadDashboard();

loadAdminPriceList();

loadOrders();
