import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBVomKLva7Qw4da7ksHlGQ4AqElxujjC5g",
  authDomain: "damotak-classes-database.firebaseapp.com",
  databaseURL: "https://damotak-classes-database-default-rtdb.firebaseio.com",
  projectId: "damotak-classes-database",
  storageBucket: "damotak-classes-database.firebasestorage.app",
  messagingSenderId: "642680259009",
  appId: "1:642680259009:web:6070722888eac763cfef40"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig, "cbtStudentApp") : getApp("cbtStudentApp");
const db = getDatabase(app);

// Elements
const loginForm = document.getElementById("loginForm");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const studentClassInput = document.getElementById("studentClass");
const msg = document.getElementById("msg");

// ======================= LOGIN LOGIC ======================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const fullName = `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`;
  const studentClass = studentClassInput.value.trim();

  if (!fullName || !studentClass) {
    msg.textContent = "Please enter name and class!";
    return;
  }

  try {
    const studentsSnap = await get(ref(db, "Students"));
    if (!studentsSnap.exists()) {
      msg.textContent = "No students found in the system!";
      return;
    }

    const students = studentsSnap.val();
    let found = false;

    // Loop through all students to find a match
    for (let key in students) {
      const student = students[key];
      if (student.name.toLowerCase() === fullName.toLowerCase() &&
          student.studentClass.toLowerCase() === studentClass.toLowerCase()) {
        found = true;
       sessionStorage.setItem("studentKey", key);
       sessionStorage.setItem("studentClass", student.studentClass);

        break;
      }
    }

    if (found) {
      msg.textContent = "Access granted! Redirecting...";
      setTimeout(() => {
        window.location.href = "exam-page.html"; // Your exam page
      }, 1000);
    } else {
      msg.textContent = "Student not found! Access denied.";
    }

  } catch (error) {
    console.error("Login Error:", error);
    msg.textContent = "Something went wrong. Try again later.";
  }
});
