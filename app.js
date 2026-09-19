import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut,
  doc,
  setDoc,
  getDoc 
} from "./firebase.js";

// DOM Elements
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const userEmailSpan = document.getElementById("user-email");
const userUidSpan = document.getElementById("user-uid");
const displayNameInput = document.getElementById("user-display-name");

const logoutBtn = document.getElementById("logout-btn");
const saveProfileBtn = document.getElementById("save-profile-btn");

let currentUser = null;

// Auth State Listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    if (userEmailSpan) userEmailSpan.textContent = user.email;
    if (userUidSpan) userUidSpan.textContent = user.uid;

    if (authSection) authSection.style.display = "none";
    if (dashboardSection) dashboardSection.style.display = "block";

    // Fetch user details from Firestore
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().displayName && displayNameInput) {
        displayNameInput.value = userDocSnap.data().displayName;
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  } else {
    currentUser = null;
    if (authSection) authSection.style.display = "block";
    if (dashboardSection) dashboardSection.style.display = "none";
  }
});

// Update User Profile
if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", async () => {
    if (!currentUser) return;

    try {
      await setDoc(doc(db, "users", currentUser.uid), {
        displayName: displayNameInput.value,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert("Profile updated successfully!");
    } catch (error) {
      alert("Error updating profile: " + error.message);
    }
  });
}

// Logout Action
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}
