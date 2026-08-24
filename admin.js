import {
  db
} from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================
   ELEMENTS
========================================= */

const priceForm =
  document.getElementById(
    "priceForm"
  );


const adminPrices =
  document.getElementById(
    "adminPrices"
  );


const adminOrders =
  document.getElementById(
    "adminOrders"
  );


const adminPayments =
  document.getElementById(
    "adminPayments"
  );


const adminClients =
  document.getElementById(
    "adminClients"
  );


/* =========================================
   PRICE LIST
========================================= */

async function loadPrices() {

  if (!adminPrices) return;


  adminPrices.innerHTML =
    "Loading PriceList...";


  try {

    const snapshot =
      await getDocs(

        collection(
          db,
          "pricelist"
        )

      );


    if (snapshot.empty) {

      adminPrices.innerHTML =
        "<p>No services found.</p>";

      return;

    }


    adminPrices.innerHTML =

      snapshot.docs.map(
        document => {

          const p =
            document.data();


          return `

            <div class="item">

              <h3>
                ${safe(p.service)}
              </h3>

              <p>
                ${safe(p.package)}
              </p>

              <p>
                ${safe(p.ownership)}
              </p>

              <strong>
                K${Number(
                  p.price || 0
                ).toFixed(2)}
              </strong>

              <p>
                Status:
                ${safe(p.status)}
              </p>


              <button
                onclick="editPrice('${document.id}')"
              >
                Edit
              </button>


              <button
                onclick="removePrice('${document.id}')"
              >
                Delete
              </button>

            </div>

          `;

        }
      ).join("");


  } catch (error) {

    console.error(error);

    adminPrices.innerHTML =
      `<p>${safe(error.message)}</p>`;

  }

}


/* =========================================
   SAVE PRICE
========================================= */

priceForm?.addEventListener(
  "submit",
  async event => {

    event.preventDefault();


    const id =
      document.getElementById(
        "priceId"
      )?.value;


    const data = {

      service:
        document.getElementById(
          "service"
        ).value.trim(),

      package:
        document.getElementById(
          "packageName"
        ).value.trim(),

      ownership:
        document.getElementById(
          "ownership"
        ).value,

      price:
        Number(
          document.getElementById(
            "price"
          ).value
        ),

      durationDays:
        Number(
          document.getElementById(
            "durationDays"
          ).value || 30
        ),

      description:
        document.getElementById(
          "description"
        ).value.trim(),

      status:
        document.getElementById(
          "priceStatus"
        ).value,

      updatedAt:
        serverTimestamp()

    };


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

      } else {

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


      priceForm.reset();


      document.getElementById(
        "priceId"
      ).value = "";


      await loadPrices();


      alert(
        "PriceList saved."
      );


    } catch (error) {

      alert(
        "Save failed: " +
        error.message
      );

    }

  }
);


/* =========================================
   EDIT PRICE
========================================= */

window.editPrice =
  async function(id) {

    const snapshot =
      await getDoc(

        doc(
          db,
          "pricelist",
          id
        )

      );


    if (!snapshot.exists()) {

      alert(
        "Service not found."
      );

      return;

    }


    const p =
      snapshot.data();


    document.getElementById(
      "priceId"
    ).value = id;


    document.getElementById(
      "service"
    ).value =
      p.service || "";


    document.getElementById(
      "packageName"
    ).value =
      p.package || "";


    document.getElementById(
      "ownership"
    ).value =
      p.ownership || "shared";


    document.getElementById(
      "price"
    ).value =
      p.price || "";


    document.getElementById(
      "durationDays"
    ).value =
      p.durationDays || 30;


    document.getElementById(
      "description"
    ).value =
      p.description || "";


    document.getElementById(
      "priceStatus"
    ).value =
      p.status || "active";

  };


/* =========================================
   DELETE PRICE
========================================= */

window.removePrice =
  async function(id) {

    if (
      !confirm(
        "Delete this service?"
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


      loadPrices();


    } catch (error) {

      alert(
        error.message
      );

    }

  };


/* =========================================
   ORDERS
========================================= */

async function loadOrders() {

  if (!adminOrders) return;


  try {

    const snapshot =
      await getDocs(

        collection(
          db,
          "orders"
        )

      );


    if (snapshot.empty) {

      adminOrders.innerHTML =
        "<p>No orders yet.</p>";

      return;

    }


    adminOrders.innerHTML =

      snapshot.docs.map(
        document => {

          const order =
            document.data();


          const items =
            order.items || [];


          return `

            <div class="item">

              <h3>
                ${safe(
                  order.orderId ||
                  document.id
                )}
              </h3>

              <p>
                Customer:
                ${safe(
                  order.customer?.name
                )}
              </p>

              <p>
                Phone:
                ${safe(
                  order.customer?.phone
                )}
              </p>

              <p>
                Services:
                ${items.map(
                  x =>
                    safe(
                      x.service
                    )
                ).join(", ")}
              </p>

              <strong>
                Total:
                K${Number(
                  order.total || 0
                ).toFixed(2)}
              </strong>

              <p>
                Payment:
                ${safe(
                  order.paymentStatus
                )}
              </p>

            </div>

          `;

        }
      ).join("");


  } catch (error) {

    adminOrders.innerHTML =
      `<p>${safe(error.message)}</p>`;

  }

}


/* =========================================
   PAYMENTS
========================================= */

async function loadPayments() {

  if (!adminPayments) return;


  try {

    const snapshot =
      await getDocs(

        collection(
          db,
          "payments"
        )

      );


    if (snapshot.empty) {

      adminPayments.innerHTML =
        "<p>No payments yet.</p>";

      return;

    }


    adminPayments.innerHTML =

      snapshot.docs.map(
        document => {

          const p =
            document.data();


          return `

            <div class="item">

              <h3>
                ${safe(
                  p.method
                )}
              </h3>

              <p>
                Order:
                ${safe(
                  p.orderId
                )}
              </p>

              <p>
                Reference:
                <strong>
                  ${safe(
                    p.reference
                  )}
                </strong>
              </p>

              <p>
                Amount:
                K${Number(
                  p.amount || 0
                ).toFixed(2)}
              </p>

              <p>
                Status:
                ${safe(
                  p.status
                )}
              </p>

              <button
                onclick="
                  approvePayment(
                    '${document.id}'
                  )
                "
              >
                Approve
              </button>

              <button
                onclick="
                  rejectPayment(
                    '${document.id}'
                  )
                "
              >
                Reject
              </button>

            </div>

          `;

        }
      ).join("");


  } catch (error) {

    adminPayments.innerHTML =
      `<p>${safe(error.message)}</p>`;

  }

}


/* =========================================
   PAYMENT APPROVAL
========================================= */

window.approvePayment =
  async function(id) {

    await updateDoc(

      doc(
        db,
        "payments",
        id
      ),

      {

        status:
          "approved",

        verifiedAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()

      }

    );


    loadPayments();

  };


window.rejectPayment =
  async function(id) {

    await updateDoc(

      doc(
        db,
        "payments",
        id
      ),

      {

        status:
          "rejected",

        updatedAt:
          serverTimestamp()

      }

    );


    loadPayments();

  };


/* =========================================
   CLIENTS
========================================= */

async function loadClients() {

  if (!adminClients) return;


  const snapshot =
    await getDocs(

      collection(
        db,
        "clients"
      )

    );


  if (snapshot.empty) {

    adminClients.innerHTML =
      "<p>No customers yet.</p>";

    return;

  }


  adminClients.innerHTML =

    snapshot.docs.map(
      document => {

        const client =
          document.data();


        return `

          <div class="item">

            <h3>
              ${safe(client.name)}
            </h3>

            <p>
              ${safe(client.phone)}
            </p>

            <p>
              ${safe(client.email)}
            </p>

          </div>

        `;

      }
    ).join("");

}


/* =========================================
   HTML SAFETY
========================================= */

function safe(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    c => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[c])
  );

}


/* =========================================
   START
========================================= */

loadPrices();

loadOrders();

loadPayments();

loadClients();
