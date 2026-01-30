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

const tableBody = document.getElementById("examResultsBody");

async function loadExamResults() {
  tableBody.innerHTML = `<tr><td colspan="8" class="text-center">Loading exam results...</td></tr>`;

  try {
    // Fetch student results
    const resultsSnap = await get(ref(examDb, "ExamResults"));
    const results = resultsSnap.exists() ? resultsSnap.val() : {};

    // Fetch all exams (to get questions + correct answers)
    const examsSnap = await get(ref(examDb, "Exam"));
    const exams = examsSnap.exists() ? examsSnap.val() : {};

    // Fetch student access info for names
    const accessSnap = await get(ref(examDb, "ExamAccess/teststudent"));
    const studentAccess = accessSnap.exists() ? accessSnap.val() : {};

    let rows = "";
    let count = 1;

    for (const examId in results) {
      const examResults = results[examId];
      const examQuestions = exams[examId]?.questions || {};

      // Build correct answers map
      const correctAnswers = {};
      for (const qId in examQuestions) {
        correctAnswers[qId] = examQuestions[qId].correctAnswer || "N/A";
      }

      for (const studentId in examResults) {
        const studentResult = examResults[studentId];

        // Fetch student name from access folder if available
        const studentName = studentAccess[studentId]?.lasttimesubmit?.name || studentResult.studentName || "Unknown";

        const subject = studentResult.subject || examId;
        const answers = studentResult.answers || {};
        const totalQuestions = Object.keys(examQuestions).length;

        let correctCount = 0;
        let wrongCount = 0;

        // Compare student answers with correct answers
        for (const qId in correctAnswers) {
          if (answers[qId] === correctAnswers[qId]) correctCount++;
          else wrongCount++;
        }

        const totalMarks = correctCount;

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
              <button class="btn btn-primary btn-sm" 
                onclick='viewResult(${JSON.stringify(answers)}, ${JSON.stringify(correctAnswers)}, "${studentName}", "${subject}")'>
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

// View student answers popup
window.viewResult = (studentAnswers, correctAnswers, studentName, subject) => {
  const popupHtml = `
    <div id="resultPopup" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:9999;">
      <div style="background:#fff;padding:20px;border-radius:8px;width:600px;max-height:80%;overflow-y:auto;">
        <h5>Answers - ${studentName} (${subject})</h5>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Question ID</th>
              <th>Student Answer</th>
              <th>Correct Answer</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(correctAnswers).map(qId => {
              const studentAns = studentAnswers[qId] || "No Answer";
              const correctAns = correctAnswers[qId] || "N/A";
              return `<tr>
                        <td>${qId}</td>
                        <td>${studentAns}</td>
                        <td>${correctAns}</td>
                      </tr>`;
            }).join("")}
          </tbody>
        </table>
        <div style="text-align:right;">
          <button id="closePopup" class="btn btn-secondary">Close</button>
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
