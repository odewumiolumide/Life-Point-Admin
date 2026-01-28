import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// -------------------- Firebase Config --------------------
const firebaseConfig = {
  apiKey: "AIzaSyBkSadtJeOGUsBw_kbH5YXCeHrdcFTw_MU",
  authDomain: "cbt-exam-database.firebaseapp.com",
  databaseURL: "https://cbt-exam-database-default-rtdb.firebaseio.com",
  projectId: "cbt-exam-database",
  storageBucket: "cbt-exam-database.firebasestorage.app",
  messagingSenderId: "678605406017",
  appId: "1:678605406017:web:cf5b9583795a99b0aeebc0"
};

const app = !getApps().length ? initializeApp(firebaseConfig, "cbtStudentApp") : getApp("cbtStudentApp");
const db = getDatabase(app);

// -------------------- Student & Exam --------------------
const studentId = sessionStorage.getItem("studentId") || "testStudent"; // default for testing
const examId = sessionStorage.getItem("examId");

const examContainer = document.getElementById("examQuestions");
const submitBtn = document.getElementById("submitExamBtn");
const timerDiv = document.getElementById("timer");
const questionNavDiv = document.getElementById("questionNav");
const progressDiv = document.getElementById("progressIndicator");

// -------------------- MAIN ENTRY --------------------
if (!studentId || !examId) {
  examContainer.innerHTML = `<p class="alert-msg">No exam selected. Please go back and select an exam.</p>`;
  submitBtn.disabled = true;
  timerDiv.textContent = "";
} else {
  checkExamCooldown().then(canProceed => {
    if (canProceed) loadExam();
  });
}

// -------------------- CHECK COOLDOWN --------------------
async function checkExamCooldown() {
  const accessRef = ref(db, `ExamAccess/${examId}/${studentId}`);
  const snap = await get(accessRef);

  if (!snap.exists()) return true; // no restriction

  const data = snap.val();
  const now = Date.now();

  // If exam was submitted → 5 minutes cooldown
  if (data.lastSubmitAt) {
    const diffMin = (now - data.lastSubmitAt) / 60000;
    if (diffMin < 5) {
      const remain = Math.ceil(5 - diffMin);
      alert(`You have already submitted this exam. You can retake it in ${remain} minutes.`);
      window.location.href = "exam-page.html";
      return false;
    }
  }

  // If student logged out → 1 minute cooldown
  if (data.lastLogoutAt) {
    const diffMin = (now - data.lastLogoutAt) / 60000;
    if (diffMin < 1) {
      const remain = Math.ceil(1 - diffMin);
      alert(`Please wait ${remain} minutes before re-entering the exam.`);
      window.location.href = "exam-page.html";
      return false;
    }
  }

  return true;
}

// -------------------- LOAD EXAM --------------------
async function loadExam() {
  try {
    const snapQuestions = await get(ref(db, `Exam/${examId}/questions`));
    if (!snapQuestions.exists()) { 
      examContainer.innerHTML = `<p class="alert-msg">No questions available.</p>`; 
      submitBtn.disabled = true; 
      return; 
    }
    const questions = snapQuestions.val();

    const snapMeta = await get(ref(db, `Exam/${examId}/meta`));
    const durationMin = snapMeta.exists() && snapMeta.val().duration ? parseInt(snapMeta.val().duration) : 30;
    startTimer(durationMin * 60);

    // Question Navigation
    questionNavDiv.innerHTML = "";
    Object.entries(questions).forEach(([qKey, qObj], idx) => {
      const navBtn = document.createElement("button");
      navBtn.textContent = idx + 1;
      navBtn.id = `nav_${qKey}`;
      navBtn.addEventListener("click", () => document.getElementById(`qcard_${qKey}`).scrollIntoView({ behavior:'smooth', block:'center' }));
      questionNavDiv.appendChild(navBtn);
    });

    // Render Questions
    Object.entries(questions).forEach(([qKey, qObj], idx) => {
      const card = document.createElement("div"); 
      card.className = "question-card"; 
      card.id = `qcard_${qKey}`;
      const optionsHtml = qObj.options.map((opt, i) => `
        <div class="form-check">
          <input class="form-check-input" type="radio" name="q_${qKey}" id="${qKey}_${i}" value="${opt}">
          <label class="form-check-label" for="${qKey}_${i}">${opt}</label>
        </div>`).join("");
      card.innerHTML = `<p><strong>Q${idx+1}:</strong> ${qObj.question}</p>${optionsHtml}<button class="btn btn-sm btn-warning mark-review-btn">Mark for Review</button>`;
      examContainer.appendChild(card);

      card.querySelectorAll("input[type='radio']").forEach(input => {
        input.addEventListener("change", () => { 
          document.getElementById(`nav_${qKey}`).classList.add("answered"); 
          updateProgress(); 
        });
      });

      card.querySelector(".mark-review-btn").addEventListener("click", () => document.getElementById(`nav_${qKey}`).classList.toggle("marked"));
    });

    updateProgress();

  } catch (error) {
    console.error(error);
    examContainer.innerHTML = `<p class="alert-msg">Failed to load exam. Try again later.</p>`;
    submitBtn.disabled = true;
  }
}

// -------------------- TIMER --------------------
function startTimer(seconds) {
  let remaining = seconds;
  const interval = setInterval(() => {
    const mins = Math.floor(remaining/60); 
    const secs = remaining%60;
    timerDiv.textContent = `Time Left: ${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    remaining--; 
    if (remaining < 0) { 
      clearInterval(interval); 
      timerDiv.textContent = "Time's up!"; 
      autoSubmitExam(); 
    }
  }, 1000);
}

// -------------------- PROGRESS --------------------
function updateProgress() {
  const total = document.querySelectorAll(".question-card").length;
  const answered = document.querySelectorAll(".question-nav button.answered").length;
  progressDiv.textContent = `Answered ${answered} of ${total} questions`;
}

// -------------------- SUBMIT --------------------
submitBtn.addEventListener("click", () => new bootstrap.Modal(document.getElementById('confirmModal')).show());
document.getElementById("confirmSubmitBtn").addEventListener("click", autoSubmitExam);

async function autoSubmitExam() {
  submitBtn.disabled = true;

  const answers = {};
  document.querySelectorAll(".question-card").forEach(card => {
    const qKey = card.querySelector("input[type='radio']").name.replace("q_", "");
    const selected = card.querySelector("input[type='radio']:checked");
    answers[qKey] = selected ? selected.value : null;
  });

  try {
    // save answers
    await update(ref(db, `ExamResults/${examId}/${studentId}`), { answers, submittedAt: Date.now() });

    // save cooldown (5 min)
    await update(ref(db, `ExamAccess/${examId}/${studentId}`), {
      lastSubmitAt: Date.now(),
      lastLogoutAt: null
    });

    alert("Exam submitted successfully!");
    window.location.href = "exam-page.html";

  } catch (error) { 
    console.error(error); 
    alert("Failed to submit exam. Try again later."); 
    submitBtn.disabled = false;
  }
}

// -------------------- LOGOUT --------------------
document.getElementById("logoutBtn").addEventListener("click", async () => {
  const confirmLogout = confirm("Are you sure you want to logout? Your exam will end.");
  if (!confirmLogout) return;

  try {
    await update(ref(db, `ExamAccess/${examId}/${studentId}`), {
      lastLogoutAt: Date.now()
    });
  } catch (err) {
    console.error("Failed to record logout time", err);
  }

  sessionStorage.clear();
  localStorage.clear();
  window.location.href = "exam-login.html";
});

// -------------------- DISABLE BACK BUTTON --------------------
history.pushState(null, null, location.href);
window.onpopstate = function () {
  alert("Back navigation is disabled during the exam.");
  history.pushState(null, null, location.href);
};
