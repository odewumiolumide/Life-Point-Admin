// ================= IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyCiy2VaTfnuO7eEPL0_kD_WIHcDMB2T6Xs",
  authDomain: "damotak-international-da-230d5.firebaseapp.com",
  databaseURL: "https://damotak-international-da-230d5-default-rtdb.firebaseio.com",
  projectId: "damotak-international-da-230d5",
  storageBucket: "damotak-international-da-230d5.firebasestorage.app",
  messagingSenderId: "947496867501",
  appId: "1:947496867501:web:58ec74b6fa92d61ea2d824"
};

// ================= INITIALIZE FIREBASE =================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ================= PROTECTED PAGES =================
const PROTECTED_PAGES = [
  "admin-dashboard.html",
  "broadsheet.html",
  "result-add.html",
  "result-preview.html",
  "result-edit.html",
  "result-list.html",
  "staff-role.html",
  "student-add.html",
  "student-list.html",
  "view-profile.html",
  "exam-login.html",
  "exam-content.html",
  "create-exam.html",
  "exam-page.html",
  "tab;e-exam.html"

];

// ================= CURRENT PAGE =================
const currentPage = window.location.pathname.split("/").pop().toLowerCase();

// ================= CHECK AUTH =================
if (PROTECTED_PAGES.includes(currentPage)) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Not logged in → redirect immediately
      alert("You must login correctly to access this page!");
      window.location.replace("index.html");
    } else {
      // Mark user as logged in (session flag)
      sessionStorage.setItem("adminLoggedIn", "true");
    }
  });
}

// ================= AUTO-LOGOUT ON INACTIVITY =================
const AUTO_LOGOUT_TIME = 10 * 60 * 1000; // 10 minutes
let inactivityTimer;

const autoLogout = async (reason = "inactivity") => {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout failed:", err);
  }

  sessionStorage.removeItem("adminLoggedIn");

  if (reason === "inactivity") alert("You have been logged out due to inactivity.");

  window.location.replace("index.html");
};

// Reset inactivity timer
const resetTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => autoLogout("inactivity"), AUTO_LOGOUT_TIME);
};

// Listen to user activity
["click", "mousemove", "keydown", "scroll"].forEach(evt => 
  document.addEventListener(evt, resetTimer)
);
window.addEventListener("load", resetTimer);

// ================= LOGOUT BUTTON =================
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await autoLogout("manual");
      alert("You have successfully logged out.");
    });
  }
});
