import {
  initializeApp
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


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


const app =
  initializeApp(firebaseConfig);


const db =
  getFirestore(app);


const orderId =
  new URLSearchParams(
    window.location.search
  ).get("order");


const orderSummary =
  document.getElementById(
    "orderSummary"
  );


const paymentForm =
  document.getElementById(
    "paymentForm"
  );


const message =
  document.getElementById(
    "message"
  );


let orderData = null;


/* ============================
   LOAD ORDER
============================ */

async function loadOrder() {

  if (!orderId) {

    showMessage(
      "No order was found."
    );

    return;

  }


  try {

    const orderRef =
      doc(
        db,
        "orders",
        orderId
      );


    const orderSnapshot =
      await getDoc(
        orderRef
      );


    if (!orderSnapshot.exists()) {

      showMessage(
        "Order could not be found."
      );

      return;

    }


    orderData =
      orderSnapshot.data();


    renderOrder();


  } catch (error) {

    console.error(error);

    showMessage(
      "Unable to load order."
    );

  }

}


/* ============================
   DISPLAY ORDER
============================ */

function renderOrder() {

  const items =
    Array.isArray(
      orderData.items
    )
      ? orderData.items
      : [];


  const itemsHTML =
    items.map(
      item => `

        <div class="item">

          <strong>
            ${escapeHTML(
              item.service
            )}
          </strong>

          <span>

            ${escapeHTML(
              item.package
            )}

            —

            K${Number(
              item.unitPrice || 0
            ).toFixed(2)}

          </span>

        </div>

      `
    ).join("");


  orderSummary.innerHTML = `

    <div class="card">

      <h2>
        Order ${escapeHTML(
          orderData.orderId ||
          orderId
        )}
      </h2>

      ${itemsHTML}

      <div class="total-card">

        <span>
          Total
        </span>

        <strong>
          K${Number(
            orderData.total || 0
          ).toFixed(2)}
        </strong>

      </div>

    </div>

  `;

}


/* ============================
   SUBMIT PAYMENT
============================ */

paymentForm?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    if (!orderData) {

      showMessage(
        "Order information is not available."
      );

      return;

    }


    const method =
      document.getElementById(
        "paymentMethod"
      ).value;


    const reference =
      document.getElementById(
        "reference"
      ).value.trim();


    const amount =
      Number(
        document.getElementById(
          "amount"
        ).value
      );


    if (
      !method ||
      !reference ||
      !amount
    ) {

      showMessage(
        "Complete all payment fields."
      );

      return;

    }


    const button =
      document.getElementById(
        "submitPayment"
      );


    button.disabled =
      true;


    button.textContent =
      "Submitting...";


    try {

      await addDoc(

        collection(
          db,
          "payments"
        ),

        {

          orderId,

          clientId:
            orderData.clientId ||
            null,

          method,

          reference,

          amount,

          expectedAmount:
            Number(
              orderData.total || 0
            ),

          status:
            "pending",

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()

        }

      );


      showMessage(
        "Payment submitted. Please wait for admin verification."
      );


      paymentForm.reset();


    } catch (error) {

      console.error(error);

      showMessage(
        "Payment could not be submitted: " +
        error.message
      );


    } finally {

      button.disabled =
        false;

      button.textContent =
        "Submit Payment";

    }

  }
);


/* ============================
   HELPERS
============================ */

function showMessage(text) {

  if (message) {

    message.textContent =
      text;

  }

}


function escapeHTML(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    character => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[character])
  );

}


loadOrder();
