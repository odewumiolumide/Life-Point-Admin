import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Firebase Config
const config = {
  apiKey: "AIzaSyBkSadtJeOGUsBw_kbH5YXCeHrdcFTw_MU",
  authDomain: "cbt-exam-database.firebaseapp.com",
  databaseURL: "https://cbt-exam-database-default-rtdb.firebaseio.com",
  projectId: "cbt-exam-database",
  storageBucket: "cbt-exam-database.firebasestorage.app",
  messagingSenderId: "678605406017",
  appId: "1:678605406017:web:cf5b9583795a99b0aeebc0"
};

const app = !getApps().length
  ? initializeApp(config, "cbtExamApp")
  : getApp("cbtExamApp");

const db = getDatabase(app);
const tbody = document.getElementById("examResultsBody");

async function loadExamResults() {
  const resSnap = await get(ref(db, "ExamResults"));
  const examSnap = await get(ref(db, "Exam"));

  if (!resSnap.exists() || !examSnap.exists()) {
    tbody.innerHTML = "<tr><td colspan='8'>No results</td></tr>";
    return;
  }

  const results = resSnap.val();
  const exams = examSnap.val();
  let sn = 1;
  let rows = "";

  for (const examId in results) {
    const questions = exams[examId]?.questions || {};

    for (const studentId in results[examId]) {
      const r = results[examId][studentId];
      let correct = 0, wrong = 0;

      for (const qId in questions) {
        if (!r.answers[qId]) continue;
        const letter = questions[qId].correctAnswer;
        const text = questions[qId].options[
          ["A","B","C","D"].indexOf(letter)
        ];
        if (r.answers[qId] === text) correct++;
        else wrong++;
      }

      rows += `
        <tr>
          <td>${sn++}</td>
          <td>${examId}</td>
          <td>${r.studentName || "Unknown"}</td>
          <td>${Object.keys(questions).length}</td>
          <td>${correct}</td>
          <td>${wrong}</td>
          <td>${correct}</td>
          <td>
            <button class="btn btn-sm btn-primary"
              onclick='viewResult(${JSON.stringify(r.answers)}, ${JSON.stringify(questions)})'>
              View
            </button>
          </td>
        </tr>
      `;
    }
  }

  tbody.innerHTML = rows;
}

window.viewResult = (answers, questions) => {
  let html = "";
  for (const qId in questions) {
    const letter = questions[qId].correctAnswer;
    const correct = questions[qId].options[
      ["A","B","C","D"].indexOf(letter)
    ];
    html += `<p><b>${qId}</b><br>
      Your: ${answers[qId] || "None"}<br>
      Correct: ${correct}</p>`;
  }
  alert(html.replace(/<[^>]+>/g, "\n"));
};

document.addEventListener("DOMContentLoaded", loadExamResults);
