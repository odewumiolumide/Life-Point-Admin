import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyBkSadtJeOGUsBw_kbH5YXCeHrdcFTw_MU",
  authDomain: "cbt-exam-database.firebaseapp.com",
  databaseURL: "https://cbt-exam-database-default-rtdb.firebaseio.com",
  projectId: "cbt-exam-database",
  storageBucket: "cbt-exam-database.firebasestorage.app",
  messagingSenderId: "678605406017",
  appId: "1:678605406017:web:cf5b9583795a99b0aeebc0"
};

const app = !getApps().length
  ? initializeApp(firebaseConfig, "cbtStudentApp")
  : getApp("cbtStudentApp");

const db = getDatabase(app);

/* ================= SESSION CHECK ================= */
const studentClass = sessionStorage.getItem("studentClass");

if (!studentClass) {
  alert("Session expired. Please login again.");
  window.location.href = "exam-login.html";
}

/* ================= ELEMENTS ================= */
const examTableBody = document.getElementById("examTableBody");
const startExamBtn = document.getElementById("startExamBtn");

/* ================= FETCH EXAMS ================= */
async function fetchExams() {
  const snapshot = await get(ref(db, "Exam"));
  return snapshot.exists() ? snapshot.val() : {};
}

/* ================= RENDER EXAMS ================= */
async function renderExams() {
  const exams = await fetchExams();
  examTableBody.innerHTML = "";

  let i = 1;
  let hasExam = false;

  Object.entries(exams).forEach(([key, exam]) => {
    const meta = exam.meta || {};

    // 🔒 CLASS FILTER (MAIN SECURITY)
    if (!meta.class || meta.class !== studentClass) return;

    // 🔒 ONLY PUBLISHED EXAMS
    if (meta.status !== "Published") return;

    hasExam = true;

    examTableBody.innerHTML += `
      <tr>
        <td class="text-center">
          <input type="radio" name="selectedExam" value="${key}">
        </td>
        <td>${i}</td>
        <td>${meta.title || "Untitled"}</td>
        <td>${meta.class}</td>
        <td>${meta.duration || "N/A"} mins</td>
        <td>${meta.startTime || "N/A"}</td>
        <td>${meta.endTime || "N/A"}</td>
      </tr>
    `;
    i++;
  });

  if (!hasExam) {
    examTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger">
          No exams available for your class
        </td>
      </tr>
    `;
    return;
  }

  document.querySelectorAll('input[name="selectedExam"]').forEach(radio => {
    radio.addEventListener("change", () => {
      startExamBtn.disabled = false;
      sessionStorage.setItem("examId", radio.value);
      sessionStorage.setItem("examClass", studentClass);
    });
  });
}

/* ================= START EXAM ================= */
startExamBtn.addEventListener("click", () => {
  const selected = document.querySelector('input[name="selectedExam"]:checked');
  if (!selected) return alert("Please select an exam.");
  window.location.href = "exam-content.html";
});

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", renderExams);

