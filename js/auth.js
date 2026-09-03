import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  doc,
  setDoc,
  serverTimestamp
} from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const feedbackBanner = document.getElementById("feedback-banner");
  const bannerMessage = document.getElementById("banner-message");

  // Toggle View
  tabLogin.addEventListener("click", () => switchTab("login"));
  tabSignup.addEventListener("click", () => switchTab("signup"));

  function switchTab(view) {
    hideBanner();
    if (view === "login") {
      tabLogin.classList.add("active");
      tabLogin.setAttribute("aria-selected", "true");
      tabSignup.classList.remove("active");
      tabSignup.setAttribute("aria-selected", "false");
      loginForm.classList.remove("hidden");
      signupForm.classList.add("hidden");
    } else {
      tabSignup.classList.add("active");
      tabSignup.setAttribute("aria-selected", "true");
      tabLogin.classList.remove("active");
      tabLogin.setAttribute("aria-selected", "false");
      signupForm.classList.remove("hidden");
      loginForm.classList.add("hidden");
    }
  }

  // Banner Helper
  function showError(msg) {
    bannerMessage.textContent = msg;
    feedbackBanner.className = "banner banner-error show";
  }

  function showSuccess(msg) {
    bannerMessage.textContent = msg;
    feedbackBanner.className = "banner banner-success show";
  }

  function hideBanner() {
    feedbackBanner.className = "banner";
    bannerMessage.textContent = "";
  }

  // Set Loading State
  function setLoading(button, isLoading, text) {
    if (isLoading) {
      button.disabled = true;
      button.innerHTML = `<span class="spinner"></span>${text}...`;
    } else {
      button.disabled = false;
      button.innerHTML = `<span class="btn-text">${text}</span>`;
    }
  }

  // Helper validation
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Login Handler
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideBanner();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const submitBtn = document.getElementById("login-submit-btn");

    if (!isValidEmail(email)) {
      showError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      showError("Please enter your password.");
      return;
    }

    setLoading(submitBtn, true, "Signing In");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      let userFriendlyMsg = "Failed to sign in. Please check your credentials.";

      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        userFriendlyMsg = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/too-many-requests") {
        userFriendlyMsg = "Access temporarily disabled due to many failed login attempts. Try again later.";
      } else if (error.message) {
        userFriendlyMsg = error.message;
      }

      showError(userFriendlyMsg);
      setLoading(submitBtn, false, "Sign In");
    }
  });

  // Sign Up Handler
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideBanner();

    const fullName = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;
    const submitBtn = document.getElementById("signup-submit-btn");

    // Client side validations
    if (!fullName) {
      showError("Please enter your full name.");
      return;
    }

    if (!isValidEmail(email)) {
      showError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(submitBtn, true, "Creating Account");

    try {
      // 1. Create Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create Firestore user document in "users" collection with uid key
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: email,
        role: "client",
        createdAt: serverTimestamp()
      });

      showSuccess("Account created successfully! Redirecting...");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);

    } catch (error) {
      console.error("Registration error:", error);
      let userFriendlyMsg = "Failed to create account. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        userFriendlyMsg = "This email address is already registered. Please sign in instead.";
      } else if (error.code === "auth/weak-password") {
        userFriendlyMsg = "Password is too weak. Please use a stronger password.";
      } else if (error.message) {
        userFriendlyMsg = error.message;
      }

      showError(userFriendlyMsg);
      setLoading(submitBtn, false, "Create Account");
    }
  });
});
