/*
============================================================
LET'S TRADE ZM
PRICELIST
============================================================
*/

const STATIC_SERVICES = [
  {
    id: "netflix-premium-shared",
    name: "Netflix Premium — Shared Profile",
    price: 65,
    source: "static",
    active: true
  },
  {
    id: "netflix-premium-private",
    name: "Netflix Premium — Private Profile",
    price: 100,
    source: "static",
    active: true
  },
  {
    id: "prime-video",
    name: "Prime Video",
    price: 80,
    source: "static",
    active: true
  },
  {
    id: "spotify-shared",
    name: "Spotify — Shared Slot",
    price: 60,
    source: "static",
    active: true
  },
  {
    id: "apple-music-shared",
    name: "Apple Music — Shared Slot",
    price: 80,
    source: "static",
    active: true
  },
  {
    id: "icloud-50gb",
    name: "iCloud 50GB",
    price: 50,
    source: "static",
    active: true
  },
  {
    id: "icloud-200gb",
    name: "iCloud 200GB",
    price: 80,
    source: "static",
    active: true
  },
  {
    id: "gemini-ai-plus",
    name: "Gemini AI Plus",
    price: 50,
    source: "static",
    active: true
  },
  {
    id: "music-distribution",
    name: "Music Distribution",
    price: 100,
    source: "static",
    active: true
  },
  {
    id: "cover-art-logo",
    name: "Cover Art / Logo Design",
    price: 50,
    source: "static",
    active: true
  }
];

/*
Database services will be added here later.
Do not edit this section yet.
*/
let DATABASE_SERVICES = [];

function getPriceList() {
  return [
    ...STATIC_SERVICES,
    ...DATABASE_SERVICES
  ];
}

function getActiveServices() {
  return getPriceList().filter(
    service => service.active === true
  );
}

function renderPriceList() {
  const list = document.getElementById("services");
  if (!list) return;

  const services = getActiveServices();

  list.innerHTML = services.map(service => `
    <label class="service">
      <input
        type="checkbox"
        value="${service.price}"
        data-name="${service.name}"
        data-id="${service.id}"
        onchange="calc()"
      >
      ${service.name}
      <br>
      <span class="cost">K${service.price}</span>
    </label>
  `).join("");
}

document.addEventListener("DOMContentLoaded", renderPriceList);
