// ----------------- IMPORTS -----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// ----------------- FIREBASE CONFIG -----------------
const firebaseConfig = {
  apiKey: "AIzaSyCiy2VaTfnuO7eEPL0_kD_WIHcDMB2T6Xs",
  authDomain: "damotak-international-da-230d5.firebaseapp.com",
  databaseURL: "https://damotak-international-da-230d5-default-rtdb.firebaseio.com",
  projectId: "damotak-international-da-230d5",
  storageBucket: "damotak-international-da-230d5.firebasestorage.app",
  messagingSenderId: "947496867501",
  appId: "1:947496867501:web:58ec74b6fa92d61ea2d824"
};

// ----------------- INITIALIZE -----------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ----------------- ELEMENTS -----------------
const loginForm = document.getElementById("loginForm");
const modal = document.getElementById("errorModal");
const closeModal = document.getElementById("closeModal");
const modalMessage = document.getElementById("modalMessage");
const loginBtn = document.getElementById("loginBtn");

let failedAttempts = 0;
const MAX_ATTEMPTS = 10;

// Success message element
const successBox = document.createElement("p");
successBox.style.color = "green";
successBox.style.textAlign = "center";
successBox.style.fontWeight = "600";
successBox.style.marginTop = "15px";
successBox.style.display = "none";
successBox.textContent = "Login successful!";
document.querySelector(".login-section").appendChild(successBox);

// ----------------- LOGIN -----------------
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Reset failed attempts
      failedAttempts = 0;

      // Show success message
      successBox.style.display = "block";

      sessionStorage.setItem("adminLoggedIn", "true");

      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 1200);
    } catch (error) {
      failedAttempts++;
      loginBtn.disabled = false;
      loginBtn.textContent = "Sign In";

      // Show modal with error message
      modalMessage.textContent = `${error.message} (${failedAttempts}/${MAX_ATTEMPTS})`;
      modal.style.display = "flex";

      // Lock user after 10 failed attempts
      if (failedAttempts >= MAX_ATTEMPTS) {
        alert("Too many failed login attempts! You are temporarily locked out.");
        loginBtn.disabled = true;
        setTimeout(() => { loginBtn.disabled = false; failedAttempts = 0; }, 5 * 60 * 1000); // 5 min lockout
      }
    }
  });
}

// ----------------- CLOSE MODAL -----------------
if (closeModal) closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

// ----------------- REDIRECT LOGGED USERS -----------------
onAuthStateChanged(auth, (user) => {
  const page = window.location.pathname.split("/").pop().toLowerCase();
  if (user && page === "index.html") {
    window.location.href = "admin-dashboard.html";
  }
});

// ----------------- AUTO LOGOUT -----------------
const AUTO_LOGOUT_TIME = 10 * 60 * 1000; // 10 min
let inactivityTimer;

const currentPage = window.location.pathname.split("/").pop().toLowerCase();
if (currentPage !== "index.html" && currentPage !== "") {
  const resetTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(autoLogout, AUTO_LOGOUT_TIME);
  };

  const autoLogout = () => {
    sessionStorage.removeItem("adminLoggedIn");
    signOut(auth).then(() => {
      alert("You have been logged out due to inactivity.");
      window.location.href = "index.html";
    }).catch(() => { window.location.href = "index.html"; });
  };

  ["click", "mousemove", "keydown", "scroll"].forEach(evt => document.addEventListener(evt, resetTimer));
  window.addEventListener("load", resetTimer);
}
