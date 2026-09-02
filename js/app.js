const services = [
  { id: "netflix", name: "Netflix", category: "streaming", description: "Entertainment", price: 65, initial: "N" },
  { id: "prime", name: "Prime Video", category: "streaming", description: "Entertainment", price: 80, initial: "P" },
  { id: "spotify", name: "Spotify", category: "music", description: "Music", price: 65, initial: "S" },
  { id: "showmax", name: "Showmax", category: "streaming", description: "Entertainment", price: 75, initial: "S" }
];

const selected = new Set();
let activeCategory = "all";

const grid = document.getElementById("serviceGrid");
const emptyState = document.getElementById("emptyState");
const selectionBar = document.getElementById("selectionBar");
const selectionCount = document.getElementById("selectionCount");
const barItems = document.getElementById("barItems");
const barDetails = document.getElementById("barDetails");
const barTotal = document.getElementById("barTotal");
const continueButton = document.getElementById("continueButton");

function money(value) {
  return `K${value.toLocaleString()}`;
}

function visibleServices() {
  return activeCategory === "all"
    ? services
    : services.filter(service => service.category === activeCategory);
}

function renderServices() {
  const items = visibleServices();
  grid.innerHTML = "";

  emptyState.hidden = items.length !== 0;

  items.forEach(service => {
    const isSelected = selected.has(service.id);
    const card = document.createElement("article");
    card.className = `service-card${isSelected ? " selected" : ""}`;
    card.tabIndex = 0;
    card.setAttribute("role", "checkbox");
    card.setAttribute("aria-checked", isSelected);

    card.innerHTML = `
      <span class="service-select" aria-hidden="true">${isSelected ? "✓" : ""}</span>
      <div class="card-icon">${service.initial}</div>
      <h3>${service.name}</h3>
      <p>${service.description}</p>
      <div class="price">${money(service.price)} <small>/ month</small></div>
    `;

    const toggle = () => {
      if (selected.has(service.id)) selected.delete(service.id);
      else selected.add(service.id);
      renderServices();
      updateSelection();
    };

    card.addEventListener("click", toggle);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });

    grid.appendChild(card);
  });
}

function updateSelection() {
  const chosen = services.filter(service => selected.has(service.id));
  const count = chosen.length;
  const total = chosen.reduce((sum, service) => sum + service.price, 0);

  selectionCount.textContent = `${count} selected`;
  barItems.textContent = `${count} service${count === 1 ? "" : "s"} selected`;
  barDetails.textContent = count
    ? chosen.map(service => service.name).join(" • ")
    : "Choose a service to begin";
  barTotal.textContent = money(total);
  continueButton.disabled = count === 0;

  selectionBar.classList.toggle("visible", count > 0);
}

document.querySelectorAll(".category-tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category-tab").forEach(tab => tab.classList.remove("active"));
    button.classList.add("active");
    activeCategory = button.dataset.category;
    renderServices();
  });
});

continueButton.addEventListener("click", () => {
  if (!selected.size) return;
  alert("Design prototype: the next phase will connect this selection to signup and payment.");
});

const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

menuToggle.addEventListener("click", () => {
  const open = siteNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
});

siteNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

renderServices();
updateSelection();
