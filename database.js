import {
  db
} from "./firebase.js";

import {
  collection,
  query,
  where,
  getDocs
} from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const dashboard =
  document.getElementById(
    "dashboard"
  );


const clientId =
  sessionStorage.getItem(
    "clientId"
  );


async function loadDashboard() {

  if (!dashboard) return;


  if (!clientId) {

    location.href =
      "index.html";

    return;

  }


  dashboard.innerHTML =
    "<p>Loading your subscriptions...</p>";


  try {

    const q =
      query(

        collection(
          db,
          "subscriptions"
        ),

        where(
          "clientId",
          "==",
          clientId
        )

      );


    const snapshot =
      await getDocs(q);


    if (snapshot.empty) {

      dashboard.innerHTML = `

        <div class="notice">

          <h3>
            No subscriptions yet
          </h3>

          <p>
            Your approved subscriptions
            will appear here.
          </p>

          <a href="pricelist.html">
            Browse PriceList
          </a>

        </div>

      `;

      return;

    }


    dashboard.innerHTML =

      snapshot.docs.map(
        document => {

          const item =
            document.data();


          return `

            <div class="item">

              <h2>
                ${safe(item.service)}
              </h2>

              <p>
                Package:
                ${safe(item.package)}
              </p>

              <p>
                Status:
                <strong>
                  ${safe(item.status)}
                </strong>
              </p>

              <p>
                Start:
                ${safe(item.startDate)}
              </p>

              <p>
                Expiry:
                ${safe(item.expiryDate)}
              </p>

            </div>

          `;

        }
      ).join("");


  } catch (error) {

    console.error(error);

    dashboard.innerHTML = `

      <div class="notice">

        Unable to load dashboard.

      </div>

    `;

  }

}


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


loadDashboard();
