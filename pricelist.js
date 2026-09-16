/*
============================================================
LET'S TRADE ZM
PRICELIST
============================================================
*/

const STATIC_SERVICES = [
  { id:"netflix-premium-shared", name:"Netflix Premium — Shared Profile", price:65, source:"static", active:true },
  { id:"netflix-premium-private", name:"Netflix Premium — Private Profile", price:100, source:"static", active:true },
  { id:"prime-video", name:"Prime Video", price:80, source:"static", active:true },
  { id:"spotify-shared", name:"Spotify — Shared Slot", price:60, source:"static", active:true },
  { id:"apple-music-shared", name:"Apple Music — Shared Slot", price:80, source:"static", active:true },
  { id:"icloud-50gb", name:"iCloud 50GB", price:50, source:"static", active:true },
  { id:"icloud-200gb", name:"iCloud 200GB", price:80, source:"static", active:true },
  { id:"gemini-ai-plus", name:"Gemini AI Plus", price:50, source:"static", active:true },
  { id:"music-distribution", name:"Music Distribution", price:100, source:"static", active:true },
  { id:"cover-art-logo", name:"Cover Art / Logo Design", price:50, source:"static", active:true }
];

/* Database services will be added here later. */
let DATABASE_SERVICES = [];

function getPriceList() {
  return [...STATIC_SERVICES, ...DATABASE_SERVICES];
}

function getActiveServices() {
  return getPriceList().filter(function(service) {
    return service.active === true;
  });
}

function renderPriceList() {
  const list = document.getElementById("services");

  if (!list) {
    console.error("Let's Trade ZM: #services element not found.");
    return;
  }

  const services = getActiveServices();

  if (!services.length) {
    list.innerHTML = "<p>No services are currently available.</p>";
    return;
  }

  list.innerHTML = services.map(function(service) {
    return `
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
    `;
  }).join("");

  if (typeof calc === "function") {
    calc();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderPriceList);
} else {
  renderPriceList();
}
