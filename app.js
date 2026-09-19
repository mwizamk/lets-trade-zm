// app.js
import { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  doc,
  setDoc,
  getDoc 
} from "./firebase.js";

// DOM Elements
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const userEmailSpan = document.getElementById("user-email");
const userUidSpan = document.getElementById("user-uid");
const displayNameInput = document.getElementById("user-display-name");

const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const saveProfileBtn = document.getElementById("save-profile-btn");

let currentUser = null;

// 1. Sign Up User & Create Firestore Document
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a initial user document in Firestore using their auth UID
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      createdAt: new Date().toISOString()
    });

    alert("Account created successfully!");
  } catch (error) {
    alert("Error signing up: " + error.message);
  }
});

// 2. Log In User
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in successfully!");
  } catch (error) {
    alert("Error logging in: " + error.message);
  }
});

// 3. Save / Update User Profile in Firestore
saveProfileBtn.addEventListener("click", async () => {
  if (!currentUser) return;

  const name = displayNameInput.value;

  try {
    // Update or merge the existing user document in the "users" collection
    await setDoc(doc(db, "users", currentUser.uid), {
      displayName: name,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    alert("Profile saved to Firestore!");
  } catch (error) {
    alert("Error updating profile: " + error.message);
  }
});

// 4. Log Out
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  alert("Logged out!");
});

// 5. Auth State Observer (Handles UI updates on login/logout)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    userEmailSpan.textContent = user.email;
    userUidSpan.textContent = user.uid;

    authSection.style.display = "none";
    dashboardSection.style.display = "block";

    // Load existing profile details from Firestore if present
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists() && userDocSnap.data().displayName) {
      displayNameInput.value = userDocSnap.data().displayName;
    }
  } else {
    currentUser = null;
    authSection.style.display = "block";
    dashboardSection.style.display = "none";
  }
});
