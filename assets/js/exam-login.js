import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDfsck2-qqK0QJNzUlUqGR3cUQlFgGQnxs",
  authDomain: "life-point-student-database.firebaseapp.com",
  databaseURL: "https://life-point-student-database-default-rtdb.firebaseio.com",
  projectId: "life-point-student-database",
  storageBucket: "life-point-student-database.firebasestorage.app",
  messagingSenderId: "1057001618683",
  appId: "1:1057001618683:web:4afc757f33b37ba2af045e"
};

// Initialize Firebase
const app = !getApps().length
  ? initializeApp(firebaseConfig, "cbtStudentApp")
  : getApp("cbtStudentApp");

const db = getDatabase(app);

// Elements
const loginForm = document.getElementById("loginForm");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const studentClassInput = document.getElementById("studentClass");
const msg = document.getElementById("msg");

// LOGIN
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
    const snap = await get(ref(db, "Students"));
    if (!snap.exists()) {
      msg.textContent = "No students found!";
      return;
    }

    const students = snap.val();
    let found = false;

    for (let key in students) {
      const student = students[key];
      if (
        student.name.toLowerCase() === fullName.toLowerCase() &&
        student.studentClass.toLowerCase() === studentClass.toLowerCase()
      ) {
        found = true;

        sessionStorage.setItem("studentId", key);
        sessionStorage.setItem("studentName", student.name);
        sessionStorage.setItem("studentClass", student.studentClass);

        break;
      }
    }

    if (found) {
      msg.textContent = "Access granted! Redirecting...";
      setTimeout(() => {
        window.location.href = "exam-page.html";
      }, 1000);
    } else {
      msg.textContent = "Student not found!";
    }
  } catch (err) {
    console.error(err);
    msg.textContent = "Login error. Try again.";
  }
});
