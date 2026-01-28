import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase Config
const examFirebaseConfig = {
  apiKey: "AIzaSyBkSadtJeOGUsBw_kbH5YXCeHrdcFTw_MU",
  authDomain: "cbt-exam-database.firebaseapp.com",
  databaseURL: "https://cbt-exam-database-default-rtdb.firebaseio.com",
  projectId: "cbt-exam-database",
  storageBucket: "cbt-exam-database.firebasestorage.app",
  messagingSenderId: "678605406017",
  appId: "1:678605406017:web:cf5b9583795a99b0aeebc0"
};

// Initialize Firebase
let examApp;
try { 
  examApp = getApp("cbtExamApp"); 
} catch { 
  examApp = initializeApp(examFirebaseConfig, "cbtExamApp"); 
}
const examDb = getDatabase(examApp);

// Table body element
const tableBody = document.getElementById("examResultsBody");

// Load exam results
async function loadExamResults() {
  tableBody.innerHTML = `<tr><td colspan="8" class="text-center">Loading exam results...</td></tr>`;

  try {
    const resultsSnap = await get(ref(examDb, "ExamResults"));
    const results = resultsSnap.exists() ? resultsSnap.val() : {};

    let rows = "";
    let count = 1;

    for (const examId in results) {
      const examResults = results[examId];

      for (const studentId in examResults) {
        const studentResult = examResults[studentId];

        // Student Name
        const sessionName = sessionStorage.getItem("studentName");
        const studentName = studentResult.studentName || sessionName || "Unknown";

        const subject = studentResult.subject || examId;

        // Answers
        const answers = studentResult.answers || {};
        const correctAnswers = studentResult.correctAnswers || {};
        const totalQuestions = Object.keys(answers).length;

        let correctCount = 0;
        let wrongCount = 0;
        let wrongDetails = []; // To show in view popup

        for (const qId in answers) {
          if (correctAnswers[qId] !== undefined && answers[qId] === correctAnswers[qId]) {
            correctCount++;
          } else {
            wrongCount++;
            wrongDetails.push({
              question: qId,
              studentAnswer: answers[qId] || "No Answer",
              correctAnswer: correctAnswers[qId] || "N/A"
            });
          }
        }

        const totalMarks = correctCount; // Change if marks per question differ

        rows += `
          <tr>
            <td>${count}</td>
            <td>${subject}</td>
            <td>${studentName}</td>
            <td>${totalQuestions}</td>
            <td>${correctCount}</td>
            <td>${wrongCount}</td>
            <td>${totalMarks}</td>
            <td>
              <button class="btn btn-primary btn-sm" onclick='viewResult(${JSON.stringify(wrongDetails)}, "${studentName}", "${subject}")'>
                View
              </button>
            </td>
          </tr>
        `;
        count++;
      }
    }

    tableBody.innerHTML = rows || `<tr><td colspan="8" class="text-center text-danger">No exam results found.</td></tr>`;
  } catch (error) {
    console.error(error);
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Failed to load exam results.</td></tr>`;
  }
}

// View result popup
window.viewResult = (wrongDetails, studentName, subject) => {
  let popupHtml = `
    <div id="resultPopup" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;">
      <div style="background:#fff;padding:20px;border-radius:8px;width:500px;max-height:80%;overflow-y:auto;">
        <h5>Wrong Answers - ${studentName} (${subject})</h5>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Question ID</th>
              <th>Your Answer</th>
              <th>Correct Answer</th>
            </tr>
          </thead>
          <tbody>
            ${wrongDetails.map(w => `
              <tr>
                <td>${w.question}</td>
                <td>${w.studentAnswer}</td>
                <td>${w.correctAnswer}</td>
              </tr>`).join("")}
          </tbody>
        </table>
        <div style="text-align:right;">
          <button id="closePopup" class="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", popupHtml);
  document.getElementById("closePopup").addEventListener("click", () => {
    document.getElementById("resultPopup").remove();
  });
};

document.addEventListener("DOMContentLoaded", loadExamResults);
