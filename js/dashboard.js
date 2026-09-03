import {
  auth,
  db,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc
} from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
  const loadingState = document.getElementById("loading-state");
  const dashboardContent = document.getElementById("dashboard-content");
  const signoutBtn = document.getElementById("signout-btn");
  const dashboardBanner = document.getElementById("dashboard-banner");
  const bannerMessage = document.getElementById("banner-message");

  const userFullname = document.getElementById("user-fullname");
  const userEmail = document.getElementById("user-email");
  const userRole = document.getElementById("user-role");
  const userUid = document.getElementById("user-uid");

  function showError(msg) {
    bannerMessage.textContent = msg;
    dashboardBanner.className = "banner banner-error show";
  }

  // Route Protection & State Listener
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Unauthenticated client -> redirect to login/index.html
      window.location.href = "index.html";
      return;
    }

    try {
      // Fetch user profile from Firestore users collection
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        userFullname.textContent = userData.fullName || user.displayName || "Client User";
        userEmail.textContent = userData.email || user.email || "-";
        userRole.textContent = userData.role || "client";
        userUid.textContent = userData.uid || user.uid;
      } else {
        // Fallback to Auth payload if Firestore doc doesn't exist yet
        userFullname.textContent = user.displayName || "Client User";
        userEmail.textContent = user.email || "-";
        userRole.textContent = "client";
        userUid.textContent = user.uid;
      }

      // Hide loader and show content
      loadingState.classList.add("hidden");
      dashboardContent.classList.remove("hidden");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      showError("Failed to load user profile details. " + error.message);

      // Fallback display
      userFullname.textContent = user.displayName || "Client User";
      userEmail.textContent = user.email || "-";
      userRole.textContent = "client";
      userUid.textContent = user.uid;

      loadingState.classList.add("hidden");
      dashboardContent.classList.remove("hidden");
    }
  });

  // Sign Out Handler
  signoutBtn.addEventListener("click", async () => {
    try {
      signoutBtn.disabled = true;
      signoutBtn.textContent = "Signing Out...";
      await signOut(auth);
      window.location.href = "index.html";
    } catch (error) {
      console.error("Sign out error:", error);
      showError("Failed to sign out. Please try again.");
      signoutBtn.disabled = false;
      signoutBtn.textContent = "Sign Out";
    }
  });
});
