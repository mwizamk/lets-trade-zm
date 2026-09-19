# Let's Trade ZM — Web Application

A lightweight web portal for **Let's Trade ZM**, a Zambian online digital subscription management service. This platform allows customers to view service pricing, request subscription packages, and manage active digital services through an authenticated customer dashboard.

---

## 🚀 Features

* **Dynamic Service Catalog**: Displays active digital subscriptions and pricing dynamically managed via a centralized configuration (`pricelist.js`).
* **Customer Authentication**: Secure user registration and sign-in powered by Firebase Authentication.
* **Firestore Order Submissions**: Direct order submission pipeline storing active requests in Firebase Firestore with realtime tracking.
* **Customer Dashboard**: Authenticated user space displaying active, pending, and expired subscription packages linked directly to customer accounts.
* **Responsive Mobile-First UI**: Minimalist, clean CSS architecture optimized for low-bandwidth mobile and desktop web browsers.

---

## 📁 Project Structure

```text
├── index.html          # Public landing page with price list & FAQ
├── login.html          # Authentication page (Sign in / Sign up)
├── signup.html         # Interactive service order form
├── dashboard.html      # Authenticated customer dashboard
├── app.js              # Auth observer & profile Firestore management
├── firebase.js         # Firebase app configuration & service exports
└── pricelist.js        # Single source of truth for services & pricing
