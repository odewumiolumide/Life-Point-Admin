// result-add.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { saveResult } from "./result-save.js";

// ---------------------------
// Firebase Configs
// ---------------------------
const studentFirebaseConfig = {
 apiKey: "AIzaSyDfsck2-qqK0QJNzUlUqGR3cUQlFgGQnxs",
  authDomain: "life-point-student-database.firebaseapp.com",
  projectId: "life-point-student-database",
  storageBucket: "life-point-student-database.firebasestorage.app",
  messagingSenderId: "1057001618683",
  appId: "1:1057001618683:web:4afc757f33b37ba2af045e"
};


const resultFirebaseConfig = {
  apiKey: "AIzaSyA8KCmHnEYbXhfdx6pL9T9dAXl62zxb6kA",
  authDomain: "life-point-result-database.firebaseapp.com",
  projectId: "life-point-result-database",
  storageBucket: "life-point-result-database.firebasestorage.app",
  messagingSenderId: "165300965879",
  appId: "1:165300965879:web:5e9c519c1aadaa112adef2"
};

// ---------------------------
// Initialize Firebase Apps
// ---------------------------
const studentApp = initializeApp(studentFirebaseConfig, "studentDB");
const studentDb = getDatabase(studentApp);

const resultApp = initializeApp(resultFirebaseConfig, "resultDB");
const resultDb = getDatabase(resultApp);

// ---------------------------
// Page Setup
// ---------------------------
const urlParams = new URLSearchParams(window.location.search);
const studentID = urlParams.get("id");
document.getElementById("dateIssued").textContent = new Date().toLocaleDateString();

const tbody = document.getElementById("resultTableBody");


// ---------------------------
// Notification Helper
// ---------------------------
function showNotification(message, success) {
  const msgDiv = document.getElementById("notificationMessage");
  if (!msgDiv) return alert(message);

  msgDiv.textContent = message;
  msgDiv.style.color = success ? "green" : "red";

  const modalEl = document.getElementById("notificationModal");
  let modal = bootstrap.Modal.getInstance(modalEl);

  if (!modal) modal = new bootstrap.Modal(modalEl);
  modal.show();

  modalEl.addEventListener('hidden.bs.modal', () => {
    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
  }, { once: true });
}

// ---------------------------
// Term Change Logic
// ---------------------------
document.getElementById("studentTerm").addEventListener("change", async (e) => {
  const term = e.target.value;

  const attendanceDetailsContainer = document.querySelectorAll('.p-3.mt-4.border-top')[0];
  const remarksContainer = document.querySelectorAll('.p-3.mt-4.border-top')[1];

  if (term === "Yearly Summary") {
    yearlySummaryContainer.style.display = "block";
    document.getElementById("resultTable").parentElement.style.display = "none";
    await loadYearlySummary();
    document.getElementById("printButton").style.display = "block";
    document.getElementById("addRow").style.display = "none";
    attendanceDetailsContainer.style.display = "none";
    remarksContainer.style.display = "none";
  } else {
    yearlySummaryContainer.style.display = "none";
    document.getElementById("printButton").style.display = "none";
    document.getElementById("addRow").style.display = "block";
    document.getElementById("resultTable").parentElement.style.display = "block";
    await loadPreviousResults(term);
    attendanceDetailsContainer.style.display = "block";
    remarksContainer.style.display = "block";
  }
});

// ======================================================
// Load Student Info + Auto Load Subjects for Class
// ======================================================

let isSS3 = false;

// ---------------------------
// Load Student Info
// ---------------------------
async function loadStudent() {
  try {
    const snap = await get(ref(studentDb, `Students/${studentID}`));

    if (!snap.exists()) {
      showNotification("❌ Student not found!", false);
      return;
    }

    const data = snap.val();

    // Load Student Bio
    document.getElementById("studentName").textContent = data.name || "N/A";
    document.getElementById("studentClass").textContent = data.studentClass || "N/A";
    document.getElementById("studentGender").textContent = data.gender || "N/A";

    // Detect SS3 (SS3 / SS 3 / SSS3 / SSS 3)
    const normalized = data.studentClass.replace(/\s+/g, "").toUpperCase();
    isSS3 = (normalized === "SS3" || normalized === "SSS3");

    console.log("SS3 Detected:", isSS3);

    // Load subjects
    loadDefaultSubjectsForClass(data.studentClass);

  } catch (err) {
    showNotification("⚠️ Error loading student info: " + err.message, false);
  }
}

// ======================================================
// AUTO LOAD SUBJECTS BASED ON CLASS + ORDERING LOGIC
// ======================================================

function loadDefaultSubjectsForClass(studentClass) {
  if (!studentClass) return;

  const cls = studentClass.trim().toLowerCase();
  const norm = cls.replace(/[\s-]/g, ""); // remove spaces & hyphens

  tbody.innerHTML = ""; // Clear table

  // Map normalized input → defaultSubjects key
  const classMap = {
   "creche": "creche", // fix for "Pre Nusery"
    "kg1": "kg1",
    "kg2": "kg2",
    "nursery1": "nursery1",
    "nursery1": "nursery1",
    "nursery2": "nursery2",
    "nursery2": "nursery2",
    "grade1": "basic1",
    "grade2": "basic2",
    "grade3": "basic3",
    "grade4": "basic4",
    "grade5": "basic5",
    "jss1": "jss1",
    "jss2": "jss2",
    "jss3": "jss3",
    "sss1": "sss1",
    "sss2": "sss2",
    "sss3": "sss3"
  };

  const matchKey = classMap[norm];

  if (!matchKey || !defaultSubjects[matchKey]) {
    console.log("No default subjects for this class:", studentClass);
    return;
  }

  let subjects = [...defaultSubjects[matchKey]];

  const math = subjects.filter(s => s.toLowerCase().includes("math"));
  const eng = subjects.filter(s => s.toLowerCase().startsWith("english"));
  const remaining = subjects.filter(s => !math.includes(s) && !eng.includes(s));

  remaining.sort((a, b) => a.localeCompare(b));

  const orderedSubjects = [...math, ...eng, ...remaining];

  orderedSubjects.forEach(sub => addSubjectRow(sub));

  console.log("Subjects Loaded:", orderedSubjects);
}

// ======================================================
// DEFAULT SUBJECT LISTS FOR EACH CLASS
// ======================================================

const defaultSubjects = {

  creche: [
    "Literacy",
    "Numeracy",
    "Health Habits",
    "Social Habits",
    "Pre-Science",
    "Handwriting",
    "Poem",
    "Songs And Rhythms",
    "Colouring/Drawing"
    
  ],

   kg1: [
    "Literacy",
    "Numeracy",
    "Health Habits",
    "Social Habits",
    "Pre-Science",
    "Handwriting",
    "Poem",
    "Songs And Rhythms",
    "Colouring/Drawing"
    
  ],

   kg2: [
    "Literacy",
    "Literacy (Language Domain)",
    "Numeracy",
    "Civic Education",
    "Health Habits",
    "Social Habits",
    "Pre-Science",
    "Handwriting",
    "Poem",
    "Songs And Rhythms",
    "Creativity",
    "Personal Development",
    "Physical And Health Education",
    "Basic Science & Tech",
    "Religion Studies",
    "Verbal Reasoning",
    "Quantitative Reasoning",
    "Colouring/Drawing"
    
  ],

  nursery1: [
    "Literacy (Letter Work)",
    "Literacy (Language Domain)",
    "Numeracy",
    "Health Habits",
    "Social Habits",
    "Physical And Health Education",
    "Basic Science & Tech",
    "Civic Education",
    "Cultural And Creative Art",
    "Personal Development",
    "Songs And Rhythm",
    "Handwriting",
    "Dictation",
    "Creativity",
    "Poem",
    "Verbal Reasoning",
    "Quantitative Reasoning"
    
  ],

  nursery2: [
    "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Tech",
    "Phonics",
    "Yoruba",
    "Physical And Health Education",
    "Religion Studies",
    "Nigerian History",
    "Handwriting",
    "Security Education",
    "Music",
    "French",
    "Social And Citizenship Studies",
    "Cultural And Creative Art",
    "Computer Science",
    "Home-Economics",
    "Agricultural Science",
    "Civic Education",
    "Verbal Reasoning",
    "Quantitative Reasoning",
    "Dictation"
  ],

  basic1: [
    "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Tech",
    "Phonics",
    "Yoruba",
    "Physical And Health Education",
    "Religion Studies",
    "Nigerian History",
    "Handwriting",
    "Security",
    "Music",
    "French",
    "Social And Citizenship Studies",
    "Cultural And Creative Art",
    "Computer Science",
    "Home-Economics",
    "Agricultural Science",
    "Civic Education",
    "Verbal Reasoning",
    "Quantitative Reasoning",
    "Dictation"
    
  ],

  basic2: [
   "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Tech",
    "Phonics",
    "Yoruba",
    "Physical And Health Education",
    "Religion Studies",
    "Nigerian History",
    "Social And Citizenship Studies",
    "Cultural And Creative Art",
    "Computer Science",
    "Home-Economics",
    "Agricultural Science",
    "Civic Education",
    "Verbal Reasoning",
    "Quantitative Reasoning",
    "Dictation"
  ],

  basic3: [
    "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Tech",
    "Phonics",
    "Yoruba",
    "Physical And Health Education",
    "Religion Studies",
    "Nigerian History",
    "Social And Citizenship Studies",
    "Cultural And Creative Art",
    "Computer Science",
    "Home-Economics",
    "Agricultural Science",
    "Civic Education",
    "Verbal Reasoning",
    "Quantitative Reasoning",
    "Dictation"
  ],

  basic4: [
   "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Tech",
    "Phonics",
    "Yoruba",
    "Physical And Health Education",
    "Religion Studies",
    "Nigerian History",
    "Social And Citizenship Studies",
    "Cultural And Creative Art",
    "Computer Science",
    "Home-Economics",
    "Agricultural Science",
    "Civic Education",
    "Verbal Reasoning",
    "Quantitative Reasoning",
    "Dictation"
  ],

  basic5: [
  "English Language",
    "Mathematics",
    "Basic Science",
    "Basic Tech",
    "Phonics",
    "Yoruba",
    "Physical And Health Education",
    "Religion Studies",
    "Nigerian History",
    "Social And Citizenship Studies",
    "Cultural And Creative Art",
    "Computer Science",
    "Home-Economics",
    "Agricultural Science",
    "Civic Education",
    "Verbal Reasoning",
    "Quantitative Reasoning",
    "Dictation"
  ],

  jss1: [
    "English Language", "Mathematics",
    "Physical And Health Education",
    "Business studies (BS)", "Social and citizenship studies", "Entrepreneurship",
    "Digital Technology", "Christian Religion Studies (CRS)",
    "Cultural and creative Art (CCA)", "Nigeria History","Dictation", "Intermediate Science", "Computer Science", "Phonic", "Civic Education",
     "Agricultural Science", "Security"
  ],

  jss2: [
    "English Language", "Mathematics",
    "Physical And Health Education",
    "Business studies (BS)", "Social and citizenship studies", "Entrepreneurship",
    "Digital Technology", "Christian Religion Studies (CRS)",
    "Cultural and creative Art (CCA)", "Nigeria History","Dictation", "Intermediate Science", "Computer Science", "Phonic", "Civic Education",
     "Agricultural Science", "Security"
  ],

  jss3: [
   "English Language", "Mathematics",
    "Physical And Health Education",
    "Business studies (BS)", "Social and citizenship studies", "Entrepreneurship",
    "Digital Technology", "Christian Religion Studies (CRS)",
    "Cultural and creative Art (CCA)", "Nigeria History","Dictation", "Intermediate Science", "Computer Science", "Phonic", "Civic Education",
     "Agricultural Science", "Security"
  ],

  sss1: [
    "General Mathematics", "English Language", "Entrepreneurship", "Digital Technology"
  ],

  sss2: [
    "General Mathematics", "English Language", "Entrepreneurship", "Digital Technology"
  ],

  sss3: [
  "General Mathematics", "English Language", "Entrepreneurship", "Digital Technology"
  ]
};

// ======================================================
// START
// ======================================================

loadStudent();


// ======================================================
// ALL SUBJECTS COMBINED (for new subject dropdowns)
// ======================================================
const subjects = [
  "Solar", "Fashion", "Livestock", "Beauty", "Horticulture", "Computer Hardware",
  "Biology", "Chemistry", "Physics", "Agricultural Science", "Further Mathematics", "Geography",
  "Literature in English", "Yoruba", "Government", "Christian Religious Studies",
  "Finance & Accounting", "Marketing", "Commerce", "Economics"
];

// ======================================================
// SUBJECT GROUP FILTERS (ADDED)
// ======================================================
const subjectGroups = {

  "Trade Subjects": [
    "Solar",
    "Fashion",
    "Livestock",
    "Beauty",
    "Computer Hardware",
    "Horticulture"
  ],
  "Science": [
    "Biology",
    "Chemistry",
    "Physics",
    "Geography",
    "Foods & Nutrition",
    "Agricultural Science",
    "Further Mathematics",
    "Technical Drawing"

  ],
  "Humanities": [
    "Government",
    "Visual Arts",
    "Catering Craft",
    "Nigerian History",
    "Literature-in-English",
    "Christian Religious studies"
    
  ],
  "Business": [
    "Accounting",
    "Commerce",
    "Economics",
    "Marketing"
    
  ],
  //"Other Subjects": subjects
};

// ======================================================
// ADD SUBJECT ROW FUNCTION
// ======================================================
function addSubjectRow(subject = "", ca1 = "", ca2 = "", exam = "", total = "0", grade = "-", remark = "-", readOnly = false, isNew = true, studentClass = "") {
  const row = document.createElement("tr");
  const showCA = !isSS3 || currentTerm === "First Term";

  const useDropdown = isNew && ["sss 1", "sss 2", "sss 3"].includes(studentClass.toLowerCase());

  const subjectHTML = useDropdown
    ? `<select class="form-control subject-input" : ""}>
        <option value="">Select Subject</option>
        ${Object.entries(subjectGroups).map(([group, subs]) => `
          <optgroup label="${group}">
            ${subs.map(sub => `
              <option value="${sub}" ${sub === subject ? "selected" : ""}>${sub}</option>
            `).join("")}
          </optgroup>
        `).join("")}
       </select>`
    : `<input type="text" class="form-control subject-input" value="${subject}"  ${readOnly ? "readonly" : ""}>`;

  if (!showCA) {
    // For SS3 Second/Third Term → Exam only
    row.innerHTML = `
      <td class="sl">${tbody.children.length + 1}</td>
      <td>${subjectHTML}</td>
      <td colspan="3" class="text-center text-danger fw-bold">NO C.A IN SS3</td>
      <td><input type="number" class="form-control mark-exam" value="100" readonly></td>
      <td><input type="number" class="form-control exam-input" value="${exam}" min="0" max="100" ${readOnly ? "readonly" : ""}></td>
      <td class="total-score">${total}</td>
      <td class="grade">${grade}</td>
      <td class="remark">${remark}</td>
      <td class="text-center">${readOnly ? "" : '<button class="btn btn-danger btn-sm remove-row">✕</button>'}</td>
    `;
  } else {
    // Normal classes or SS3 First Term → show CA
    row.innerHTML = `
      <td class="sl">${tbody.children.length + 1}</td>
      <td>${subjectHTML}</td>
      <td><input type="number" class="form-control mark-ca" value="40" readonly></td>
      <td><input type="number" class="form-control ca-input" value="${ca1}" min="0" max="20" : ""}></td>
      <td><input type="number" class="form-control ca-input" value="${ca2}" min="0" max="20" : ""}></td>
      <td><input type="number" class="form-control mark-exam" value="60" readonly></td>
      <td><input type="number" class="form-control exam-input" value="${exam}" min="0" max="60" : ""}></td>
      <td class="total-score">${total}</td>
      <td class="grade">${grade}</td>
      <td class="remark">${remark}</td>
      <td class="text-center">${readOnly ? "" : '<button class="btn btn-danger btn-sm remove-row">✕</button>'}</td>
    `;
  }

  tbody.appendChild(row);
  refreshRowNumbers();
}

// ======================================================
// REFRESH ROW NUMBERS
// ======================================================
function refreshRowNumbers() {
  Array.from(tbody.children).forEach((tr, i) =>
    tr.querySelector(".sl").textContent = i + 1
  );
}

// ======================================================
// ADD / REMOVE ROWS HANDLERS
// ======================================================
document.getElementById("addRow").addEventListener("click", () => {
  const studentClass = document.getElementById("studentClass").textContent || "";
  addSubjectRow("", "", "", "", "0", "-", "-", false, true, studentClass);
});

tbody.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-row")) {
    e.target.closest("tr").remove();
    refreshRowNumbers();
  }
});

// ---------------------------
// Auto Calculate with CA Average
// ---------------------------
tbody.addEventListener("input", (e) => {
  const tr = e.target.closest("tr");
  if (!tr) return;

  // SS3 — exam only
  if (isSS3) {
    const exam = parseInt(tr.querySelector(".exam-input").value) || 0;
    tr.querySelector(".total-score").textContent = exam;
    updateGrade(tr, exam);
    return;
  }

  // Normal classes
  const caInputs = tr.querySelectorAll(".ca-input");
  const examInput = tr.querySelector(".exam-input");

  let ca1 = parseInt(caInputs[0].value) || 0;
  let ca2 = parseInt(caInputs[1].value) || 0;

  if (ca1 > 20) { alert("CA1 cannot exceed 20"); ca1 = caInputs[0].value = 0; }
  if (ca2 > 20) { alert("CA2 cannot exceed 20"); ca2 = caInputs[1].value = 0; }

  // *** NEW CA LOGIC ***
  const caFinal = (ca1 + ca2);  // average of CA1 and CA2

  const exam = parseInt(examInput.value) || 0;

  const total = caFinal + exam;

  tr.querySelector(".total-score").textContent = total.toFixed(1);
  updateGrade(tr, total);
});

// ---------------------------
// Exam validation
// ---------------------------
tbody.addEventListener("input", (e) => {
  const tr = e.target.closest("tr");
  if (!tr) return;

  if (e.target.classList.contains("exam-input")) {
    if (parseInt(e.target.value) > 60) {
      alert("Exam cannot exceed 60");
      e.target.value = 0;
    }
  }
});


// ---------------------------
// Grade Logic (CA 40 + Exam 60 = 100)
// ---------------------------
function updateGrade(tr, total) {
  let grade = "-", remark = "-";

  if (total >= 80) {
    grade = "A";
    remark = "Excellent";
  } 
  else if (total >= 60) {
    grade = "B";
    remark = "Very Good";
  } 
  else if (total >= 50) {
    grade = "C";
    remark = "Good";
  } 
  else if (total >= 40) {
    grade = "D";
    remark = "Average";
  } 
  else {
    grade = "E";
    remark = "Needs Improvement";
  }

  tr.querySelector(".grade").textContent = grade;
  tr.querySelector(".remark").textContent = remark;
}

// ---------------------------
// Prevent Save if Invalid
// ---------------------------
document.getElementById("saveResult").addEventListener("click", () => {
  let invalidGrade = false;

  tbody.querySelectorAll(".grade").forEach(cell => {
    const v = cell.textContent;
    if (!["A1","B2","B3","C4","C5","C6","D7","E8","F9"].includes(v))
      invalidGrade = true;
  });

  if (invalidGrade) {
    return alert("❌ Cannot save. Some grade inputs are invalid!");
  }

  // SAVE LOGIC HERE...
});

// ---------------------------
// Attendance Input Validation
// ---------------------------
const attendanceInputs = ["daysOpened", "daysPresent", "daysAbsent", "studentHeight", "studentWeight"];
attendanceInputs.forEach(id => {
  const input = document.getElementById(id);

  input.addEventListener("input", (e) => {
    let val = e.target.value.replace(/\D/g, ""); // remove non-digit chars
    if (val.length > 3) val = val.slice(0, 3);   // max 3 digits
    e.target.value = val;
  });

  input.addEventListener("blur", (e) => {
    if (e.target.value !== "") e.target.value = parseInt(e.target.value, 10);
  });
});

const daysOpenedInput = document.getElementById("daysOpened");
const daysPresentInput = document.getElementById("daysPresent");
const daysAbsentInput = document.getElementById("daysAbsent");
const messageDiv = document.getElementById("attendanceMessage");

// Limit input to max 3 digits
function limitInputLength(e) {
  if (e.target.value.length > 3) {
    e.target.value = e.target.value.slice(0, 3);
  }
}

// Validate attendance only if both fields have values
function validateAttendance() {
  const opened = parseInt(daysOpenedInput.value) || 0;
  const present = parseInt(daysPresentInput.value) || 0;
  const absent = parseInt(daysAbsentInput.value) || 0;

  if (daysPresentInput.value === "" || daysAbsentInput.value === "") {
    messageDiv.textContent = "";
    return;
  }

  if (present + absent === opened) {
    messageDiv.textContent = "Attendance is correct ✅";
    messageDiv.style.color = "green";
  } else {
    messageDiv.textContent = "Incorrect input! Days Present + Days Absent must equal Days Opened ❌";
    messageDiv.style.color = "red";
  }
}

// Event listeners
[daysPresentInput, daysAbsentInput].forEach(input => {
  input.addEventListener("input", () => {
    limitInputLength({ target: input });  // enforce 3-digit max
    validateAttendance();                 // auto-validate on typing
  });
});

// ===============================
// 🔒 NEXT TERM DATE - NO PAST DATE
// ===============================
const nextTermDateInput = document.getElementById("nextTermDate");

if (nextTermDateInput) {
  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  nextTermDateInput.setAttribute("min", today);

  nextTermDateInput.addEventListener("change", function () {
    if (this.value < today) {
      this.value = "";
      alert("⚠️ Past dates are not allowed for next term.");
    }
  });
}



// ---------------------------
// Affective & Psychomotor Domain Validation
// ---------------------------
const remarkFields = [
  "Neatness", "Politeness", "Punctuality", "Cooperation",
  "Emotional", "Leadership", "Health", "Attitude", "Attentiveness", "Preservance", "Handwriting",
  "Verbal", "Games", "Health", "Handlings", "Drawing", "Musical"
];

remarkFields.forEach(id => {
  const textarea = document.getElementById(id);
  textarea.addEventListener("input", (e) => {
    let val = e.target.value.toUpperCase();
    if (val.length > 1 || !["A", "B", "C", "D", "E"].includes(val)) {
      alert(`❌ Invalid input for ${id}! Only a single character A, B, C, D, or E is allowed.`);
      e.target.value = "";
    } else {
      e.target.value = val;
    }
  });
});

// ----------------------------------------------
// Auto Move to Next Affective Field When Enter is Pressed
// ----------------------------------------------
remarkFields.forEach((id, index) => {
  const field = document.getElementById(id);

  field.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault(); // prevent newline

      const nextFieldID = remarkFields[index + 1];
      if (nextFieldID) {
        document.getElementById(nextFieldID).focus();
      }
    }
  });
});

// Auto Teacher Remarks //
document.getElementById("remarkSelect").addEventListener("change", function () {
    const selectedRemark = this.value;
    const remarkBox = document.getElementById("classTeacherRemark");

    // Auto-fill the textarea
    remarkBox.value = selectedRemark;
});


// ---------------------------
// Load Previous Results
// ---------------------------
async function loadPreviousResults() {
  const term = document.getElementById("studentTerm")?.value?.trim();
  if (!term || !studentID) return;

  try {
    const snapshot = await get(ref(resultDb, `Results/${studentID}/${term}`));

    if (snapshot.exists()) {
      // Only clear table when actual saved results exist
      tbody.innerHTML = "";

      const data = snapshot.val();
      const subjects = data.Subjects || {};

      Object.keys(subjects).forEach(sub => {
        const s = subjects[sub];
        addSubjectRow(
          s.subject || sub,
          s.ca1 || 0,
          s.ca2 || 0,
          s.exam || 0,
          s.total || 0,
          s.grade || "-",
          s.remark || "-",
          true
        );
      });

       document.getElementById("classTeacherRemark").value = data.classTeacherRemark || "";
      document.getElementById("headTeacherRemark").value = data.headTeacherRemark || "";
      document.getElementById("Neatness").value = data.Neatness || "";
      document.getElementById("Politeness").value = data.Politeness || "";
      document.getElementById("Punctuality").value = data.Punctuality || "";
      document.getElementById("Cooperation").value = data.Cooperation || "";
      document.getElementById("Emotional").value = data.Emotional || "";
      document.getElementById("Leadership").value = data.Leadership || "";
      document.getElementById("Health").value = data.Health || "";
      document.getElementById("Attitude").value = data.Attitude || "";
      document.getElementById("Attentiveness").value = data.Attentiveness || "";
      document.getElementById("Preservance").value = data.Preservance || "";
      document.getElementById("Handwriting").value = data.Handwriting || "";
      document.getElementById("Verbal").value = data.Verbal || "";
      document.getElementById("Games").value = data.Games || "";
      document.getElementById("Sport").value = data.Sport || "";
      document.getElementById("Handlings").value = data.Handlings || "";
      document.getElementById("Drawing").value = data.Drawing || "";
      document.getElementById("Musical").value = data.Musical || "";


      document.getElementById("daysOpened").value = data.daysOpened || "";
      document.getElementById("daysPresent").value = data.daysPresent || "";
      document.getElementById("daysAbsent").value = data.daysAbsent || "";
      document.getElementById("studentHeight").value = data.studentHeight || "";
      document.getElementById("studentWeight").value = data.studentWeight || "";
      document.getElementById("nextTermDate").value = data.nextTermDate || "";

      showNotification("✅ Loaded previous results!", true);

    } else {
      // DO NOT CLEAR THE TABLE HERE
      // DO NOT REMOVE DEFAULT SUBJECTS

      showNotification("ℹ️ No previous result found.", false);
    }
  } catch (err) {
    console.error(err);
    showNotification("⚠️ Failed to load results: " + err.message, false);
  }
}

document.getElementById("studentTerm").addEventListener("change", loadPreviousResults);
window.addEventListener("load", () => setTimeout(loadPreviousResults, 200));


// ---------------------------
// Save Result (Professional & Edit-Friendly, Flat resultData)
// ---------------------------
document.getElementById("saveResult").addEventListener("click", async () => {
  try {
    const term = document.getElementById("studentTerm").value.trim();
    const classTeacherRemark = document.getElementById("classTeacherRemark").value.trim();
    const headTeacherRemark = document.getElementById("headTeacherRemark").value.trim();

    // Behaviour and other assessment fields
    const Neatness = document.getElementById("Neatness").value.trim();
    const Politeness = document.getElementById("Politeness").value.trim();
    const Punctuality = document.getElementById("Punctuality").value.trim();
    const Cooperation = document.getElementById("Cooperation").value.trim();
    const Health = document.getElementById("Health").value.trim();
    const Leadership = document.getElementById("Leadership").value.trim();
    const Attitude = document.getElementById("Attitude").value.trim();
    const Attentiveness = document.getElementById("Attentiveness").value.trim();
    const Preservance = document.getElementById("Preservance").value.trim();
    const Handwriting = document.getElementById("Handwriting").value.trim();
    const Verbal = document.getElementById("Verbal").value.trim();
    const Games = document.getElementById("Games").value.trim();
    const Sport = document.getElementById("Sport").value.trim();
    const Handlings = document.getElementById("Handlings").value.trim();
    const Drawing = document.getElementById("Drawing").value.trim();
    const Musical = document.getElementById("Musical") ? document.getElementById("Musical").value.trim() : "";

    // Attendance & physical
    const daysOpened = document.getElementById("daysOpened").value.trim();
    const daysPresent = document.getElementById("daysPresent").value.trim();
    const daysAbsent = document.getElementById("daysAbsent").value.trim();
    const studentHeight = document.getElementById("studentHeight").value.trim();
    const studentWeight = document.getElementById("studentWeight").value.trim();
    const nextTermDate = document.getElementById("nextTermDate").value.trim();

    // ---------------------------
    // Collect subjects dynamically
    // ---------------------------
    const subjects = [];
    tbody.querySelectorAll("tr").forEach(tr => {
      const subjectInput = tr.querySelector(".subject-input");
      if (!subjectInput) return;

      const subject = subjectInput.value.trim();
      if (!subject) return; // skip empty subjects

      const examInput = tr.querySelector(".exam-input");
      const caInputs = tr.querySelectorAll(".ca-input");

      const ca1 = caInputs.length > 0 ? parseInt(caInputs[0].value) || 0 : 0;
      const ca2 = caInputs.length > 1 ? parseInt(caInputs[1].value) || 0 : 0;
      const exam = examInput ? parseInt(examInput.value) || 0 : 0;

      const total = ca1 + ca2 + exam;
      const grade = tr.querySelector(".grade")?.textContent || "-";
      const remark = tr.querySelector(".remark")?.textContent || "-";

      subjects.push({ subject, ca1, ca2, exam, total, grade, remark });
    });

    // ---------------------------
    // Prepare result object (flat structure)
    // ---------------------------
    const resultData = {
      studentID,
      term,
      classTeacherRemark,
      headTeacherRemark,
      Neatness,
      Politeness,
      Punctuality,
      Cooperation,
      Health,
      Leadership,
      Attitude,
      Attentiveness,
      Preservance,
      Handwriting,
      Verbal,
      Games,
      Sport,
      Handlings,
      Drawing,
      Musical,
      daysOpened,
      daysPresent,
      daysAbsent,
      studentHeight,
      studentWeight,
      nextTermDate,
      dateIssued: new Date().toLocaleDateString(),
      subjects
    };

    // ---------------------------
    // Save / update result
    // ---------------------------
    const res = await saveResult(studentID, term, resultData);

    showNotification(res.message, res.success);

    if (res.success) {
      setTimeout(loadPreviousResults, 400);
    }

  } catch (err) {
    console.error("🔥 Failed to save result:", err);
    showNotification("⚠️ Failed to save result: " + err.message, false);
  }
});

// ---------------------------
// All Result To Print Result Function (Auto Print After 2s + Dynamic File Name)
// ---------------------------
document.getElementById("PrintResult").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("printConfirmModal"));
  modal.show();

  document.getElementById("confirmPrintBtn").onclick = () => {
    modal.hide();

    // Hide "Add New Subject" button temporarily
    const addSubjectBtn = document.getElementById("addRow");
    if (addSubjectBtn) addSubjectBtn.style.display = "none";

    // Clone and clean result table
    const resultTable = document.getElementById("resultTable").cloneNode(true);

    // Remove "Action" column
    const headerRow = resultTable.querySelector("thead tr");
    if (headerRow && headerRow.lastElementChild.textContent.trim().toLowerCase() === "action") {
      headerRow.removeChild(headerRow.lastElementChild);
    }

    // Remove "Action" cells in body
    resultTable.querySelectorAll("tbody tr").forEach(row => {
      if (row.lastElementChild) row.removeChild(row.lastElementChild);
    });

    // Convert inputs to plain text
    resultTable.querySelectorAll("input, select").forEach(el => {
      const td = el.parentElement;
      td.textContent = el.value || "-";
    });

    // Get student info
    const studentName = document.getElementById("studentName").textContent.trim();
    const studentGender = document.getElementById("studentGender").textContent.trim();
    const studentClass = document.getElementById("studentClass").textContent.trim();
    const term = document.getElementById("studentTerm").value || document.getElementById("studentTerm").textContent.trim();
    const dateIssued = document.getElementById("dateIssued").textContent.trim();
    const sessionYear = document.getElementById("sessionYear")?.textContent.trim() || "2025/2026";
    const classRemark = document.getElementById("classTeacherRemark").value || "-";
    const headRemark = document.getElementById("headTeacherRemark").value || "-";

    const Neatness = document.getElementById("Neatness")?.value || "-";
    const Politeness = document.getElementById("Politeness")?.value || "-";
    const Punctuality = document.getElementById("Punctuality")?.value || "-";
    const Cooperation = document.getElementById("Cooperation")?.value || "-";
    const Leadership = document.getElementById("Leadership")?.value || "-";
    const Emotional = document.getElementById("Emotional")?.value || "-";
    const Health = document.getElementById("Health")?.value || "-";
    const Attitude = document.getElementById("Attitude")?.value || "-";
    const Attentiveness = document.getElementById("Attentiveness")?.value || "-";
    const Preservance = document.getElementById("Preservance")?.value || "-";
    const Handwriting = document.getElementById("Handwriting")?.value || "-";
    const Verbal = document.getElementById("Verbal")?.value || "-";
    const Games = document.getElementById("Games")?.value || "-";
    const Sport = document.getElementById("Sport")?.value || "-";
     const Handlings = document.getElementById("Handlings")?.value || "-";
      const Drawing = document.getElementById("Drawing")?.value || "-";
       const Musical = document.getElementById("Musical")?.value || "-";

    const daysOpened = document.getElementById("daysOpened")?.value || "-";
    const daysPresent = document.getElementById("daysPresent")?.value || "-";
    const daysAbsent = document.getElementById("daysAbsent")?.value || "-";
    const studentHeight = document.getElementById("studentHeight")?.value || "-";
    const studentWeight = document.getElementById("studentWeight")?.value || "-";
    const nextTermDate = document.getElementById("nextTermDate")?.value || "-";

    // Calculate total and average
const totals = Array.from(resultTable.querySelectorAll(".total-score")).map(td => parseInt(td.textContent) || 0);
const totalScore = totals.reduce((a, b) => a + b, 0);
const avgScore = totals.length ? (totalScore / totals.length).toFixed(2) : "0.00";


// -----------------------------
// -----------------------------
// Set Head Teacher Remark dynamically
// -----------------------------
let headRemarkAuto = "-";

if (avgScore >= 80)
  headRemarkAuto = "Excellent performance. You have shown strong understanding and commitment. Keep up the good work.";
else if (avgScore >= 60)
  headRemarkAuto = "Very good result. Your effort is commendable. Continue working hard to achieve more.";
else if (avgScore >= 50)
  headRemarkAuto = "Good performance. With steady effort and focus, better results can be achieved.";
else if (avgScore >= 40)
  headRemarkAuto = "Fair performance. More attention and consistent study are needed for improvement.";
else
  headRemarkAuto = "Unsatisfactory performance. Greater effort, regular practice, and guidance are required to improve next term.";



// Update the readonly textarea in your HTML
document.getElementById("headTeacherRemark").value = headRemarkAuto;

// In the print template, just use headRemarkAuto



    // Build print window
    const printWindow = window.open("", "_blank", "width=900,height=1000");
    printWindow.document.open();
    printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Student Result | First Point Academy</title>

<style>
:root {
  --primary: #b11226;
  --secondary: #222;
  --border-soft: #ddd;
  --light-bg: #fafafa;
}

/* ===============================
   GLOBAL
================================ */
body {
  font-family: "Segoe UI", Calibri, sans-serif;
  margin: 20px;
  color: var(--secondary);
  line-height: 1.5;
  background: #fff;
  position: relative;
}

/* Watermark */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  background: url("assets/images/auth/First Point Logo.webp") no-repeat center;
  background-size: 30%;
  opacity: 0.03;
  z-index: -1;
}

/* ===============================
   HEADER
================================ */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 4px solid var(--primary);
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.header-left img {
  width: 120px;
  border: 3px solid var(--primary);
  border-radius: 10px;
  padding: 5px;
}

.header-right {
  text-align: right;
}

.header-right h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 900;
  color: var(--primary);
  text-transform: uppercase;
}

.header-right p {
  margin: 2px 0;
  font-size: 12px;
}

/* Academic session strip */
.session-bar {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  padding: 5px;
  background: #f7f7f7;
  border: 1px solid var(--border-soft);
}

/* ===============================
   INFO BOXES
================================ */
.info-boxes {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.section {
  flex: 1;
  min-width: 260px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
}

.section-title {
  background: var(--primary);
  color: #fff;
  padding: 6px 10px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.section-content {
  padding: 10px 12px;
  font-size: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.info-grid div strong {
  color: var(--primary);
}

/* ===============================
   TABLES
================================ */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
  font-size: 12px;
}

th {
  background: var(--primary);
  color: #fff;
  font-size: 12px;
  padding: 6px;
  border: 1px solid #fff;
}

td {
  padding: 6px;
  text-align: center;
  border: 1px solid var(--border-soft);
}

tr:nth-child(even) td {
  background: #fafafa;
}

.grade-tick {
  color: var(--primary);
  font-size: 14px;
}

/* ===============================
   GRADING / PSYCHOMOTOR BOXES
================================ */
.side-boxes {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.side-boxes .section {
  flex: 1;
  min-width: 260px;
}

/* ===============================
   SIGNATURES
================================ */
.signatures {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.sign {
  width: 45%;
  text-align: center;
}

.signature-img {
  width: 80px;
  margin-bottom: 5px;
}

.signature-title {
  border-top: 2px solid var(--primary);
  padding-top: 5px;
  font-size: 12px;
  font-weight: 700;
}

/* ===============================
   PRINT
================================ */
@media print {
  body {
    -webkit-print-color-adjust: exact;
  }

  .school-logo {
    width: 150px;
  }

  .header-right h2 {
    font-size: 28px;
  }

  @page {
    size: A4;
    margin: 0.7cm;
  }
}

/* Uppercase Subjects */
#resultTable td:nth-child(2),
#resultTable th:nth-child(2) {
  text-transform: uppercase;
}
</style>
</head>

<body>

<!-- ================= HEADER ================= -->
<div class="header">
  <div class="header-left">
    <img src="assets/images/auth/First Point Logo.webp" alt="School Logo">
  </div>

  <div class="header-right">
    <h2>LIFE POINT ACADEMY | TERM RESULT</h2>
    <p>ODO-EJA, MALLAM-TOPE, OSOGBO, OSUN STATE</p>
    <p>Email: Tpoint619@gmail.com</p>
    <p>Tel: 08036972619, 07032733082</p>
  </div>
</div>

<div class="session-bar">
  Academic Session: <strong>${sessionYear}</strong>
</div>

<!-- ================= INFO BOXES SIDE BY SIDE ================= -->
<div class="info-boxes">
  <div class="section">
    <div class="section-title">Student Information</div>
    <div class="section-content info-grid">
      <div><strong>Name:</strong> ${studentName}</div>
      <div><strong>Gender:</strong> ${studentGender}</div>
      <div><strong>Class:</strong> ${studentClass}</div>
      <div><strong>Term:</strong> ${term}</div>
      <div><strong>Student ID:</strong> ${studentID}</div>
      <div><strong>Date Issued:</strong> ${dateIssued}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Attendance & Physical Record</div>
    <div class="section-content info-grid">
      <div><strong>Days Opened:</strong> ${daysOpened}</div>
      <div><strong>Days Present:</strong> ${daysPresent}</div>
      <div><strong>Days Absent:</strong> ${daysAbsent}</div>
      <div><strong>Height:</strong> ${studentHeight} cm</div>
      <div><strong>Weight:</strong> ${studentWeight} kg</div>
      <div><strong>Next Term Begins:</strong> ${nextTermDate}</div>
    </div>
  </div>
</div>

<!-- ================= RESULTS ================= -->
<div class="section">
  <div class="section-title">Subjects and Scores</div>
  <div class="section-content">
    ${resultTable.outerHTML}
  </div>
</div>

<!-- ================= TOTAL AVERAGE & REMARKS ================= -->
<div class="side-boxes">

  <!-- LEFT: TOTAL AVERAGE SCORE -->
  <div class="section">
    <div class="section-title">Total Average Score</div>
    <div class="section-content">
      <ul style="list-style: none; padding: 0; margin: 0; font-size: 12px;">
        <li><strong>Total Marks:</strong> ${totalScore}</li>
        <br>
        <li><strong>Average Percentage:</strong> ${avgScore}%</li>
      </ul>
    </div>
  </div>

  <!-- RIGHT: REMARKS -->
  <div class="section">
    <div class="section-title">Remarks</div>
    <div class="section-content">
      <ul style="list-style: none; padding: 0; margin: 0; font-size: 12px;">
        <li>
          <strong>Class Teacher:</strong>
          ${classRemark}
        </li>
        <br>
        <li>
          <strong>Headmaster:</strong>
          ${headRemarkAuto}
        </li>
      </ul>
    </div>
  </div>

</div>


<!-- ================= GRADING SYSTEM AND PSYCHOMOTOR SIDE BY SIDE ================= -->
<div class="side-boxes">
  <div class="section">
    <div class="section-title">System Grading</div>
    <div class="section-content">
      <table>
        <thead>
          <tr>
            <th>Grade</th>
            <th>Score Range</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>A</td><td>80-100</td><td>Excellent</td></tr>
          <tr><td>B</td><td>60-79</td><td>Very Good</td></tr>
          <tr><td>C</td><td>50-59</td><td>Good</td></tr>
          <tr><td>D</td><td>40-49</td><td>Average</td></tr>
          <tr><td>E</td><td>0-39</td><td>Needs Improvement</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Affective & Psychomotor Domain (A - E)</div>
    <div class="section-content">
      <table>
        <thead>
          <tr>
            <th>Area</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Neatness</td>
            <td class="grade-tick">${Neatness=='A'?'✔️':''}</td>
            <td class="grade-tick">${Neatness=='B'?'✔️':''}</td>
            <td class="grade-tick">${Neatness=='C'?'✔️':''}</td>
            <td class="grade-tick">${Neatness=='D'?'✔️':''}</td>
            <td class="grade-tick">${Neatness=='E'?'✔️':''}</td>
          </tr>
          <tr>
            <td>Politeness</td>
            <td class="grade-tick">${Politeness=='A'?'✔️':''}</td>
            <td class="grade-tick">${Politeness=='B'?'✔️':''}</td>
            <td class="grade-tick">${Politeness=='C'?'✔️':''}</td>
            <td class="grade-tick">${Politeness=='D'?'✔️':''}</td>
            <td class="grade-tick">${Politeness=='E'?'✔️':''}</td>
          </tr>
          <tr>
            <td>Punctuality</td>
            <td class="grade-tick">${Punctuality=='A'?'✔️':''}</td>
            <td class="grade-tick">${Punctuality=='B'?'✔️':''}</td>
            <td class="grade-tick">${Punctuality=='C'?'✔️':''}</td>
            <td class="grade-tick">${Punctuality=='D'?'✔️':''}</td>
            <td class="grade-tick">${Punctuality=='E'?'✔️':''}</td>
          </tr>
          <tr>
            <td>Responsibility</td>
            <td class="grade-tick">${Cooperation=='A'?'✔️':''}</td>
            <td class="grade-tick">${Cooperation=='B'?'✔️':''}</td>
            <td class="grade-tick">${Cooperation=='C'?'✔️':''}</td>
            <td class="grade-tick">${Cooperation=='D'?'✔️':''}</td>
            <td class="grade-tick">${Cooperation=='E'?'✔️':''}</td>
          </tr>
          <tr>
            <td>Teamwork</td>
            <td class="grade-tick">${Emotional=='A'?'✔️':''}</td>
            <td class="grade-tick">${Emotional=='B'?'✔️':''}</td>
            <td class="grade-tick">${Emotional=='C'?'✔️':''}</td>
            <td class="grade-tick">${Emotional=='D'?'✔️':''}</td>
            <td class="grade-tick">${Emotional=='E'?'✔️':''}</td>
          </tr>
          <tr>
            <td>Leadership</td>
            <td class="grade-tick">${Leadership=='A'?'✔️':''}</td>
            <td class="grade-tick">${Leadership=='B'?'✔️':''}</td>
            <td class="grade-tick">${Leadership=='C'?'✔️':''}</td>
            <td class="grade-tick">${Leadership=='D'?'✔️':''}</td>
            <td class="grade-tick">${Leadership=='E'?'✔️':''}</td>
          </tr>
          <tr>
            <td>Health</td>
            <td class="grade-tick">${Health=='A'?'✔️':''}</td>
            <td class="grade-tick">${Health=='B'?'✔️':''}</td>
            <td class="grade-tick">${Health=='C'?'✔️':''}</td>
            <td class="grade-tick">${Health=='D'?'✔️':''}</td>
            <td class="grade-tick">${Health=='E'?'✔️':''}</td>
          </tr>
           <tr>
            <td>Attitude</td>
            <td class="grade-tick">${Attitude=='A'?'✔️':''}</td>
            <td class="grade-tick">${Attitude=='B'?'✔️':''}</td>
            <td class="grade-tick">${Attitude=='C'?'✔️':''}</td>
            <td class="grade-tick">${Attitude=='D'?'✔️':''}</td>
            <td class="grade-tick">${Attitude=='E'?'✔️':''}</td>
          </tr>
           <tr>
            <td>Attentiveness</td>
            <td class="grade-tick">${Attentiveness=='A'?'✔️':''}</td>
            <td class="grade-tick">${Attentiveness=='B'?'✔️':''}</td>
            <td class="grade-tick">${Attentiveness=='C'?'✔️':''}</td>
            <td class="grade-tick">${Attentiveness=='D'?'✔️':''}</td>
            <td class="grade-tick">${Attentiveness=='E'?'✔️':''}</td>
          </tr>
           <tr>
            <td>Preservance</td>
            <td class="grade-tick">${Preservance=='A'?'✔️':''}</td>
            <td class="grade-tick">${Preservance=='B'?'✔️':''}</td>
            <td class="grade-tick">${Preservance=='C'?'✔️':''}</td>
            <td class="grade-tick">${Preservance=='D'?'✔️':''}</td>
            <td class="grade-tick">${Preservance=='E'?'✔️':''}</td>
          </tr>
           <tr>
            <td>Handwriting</td>
            <td class="grade-tick">${Handwriting=='A'?'✔️':''}</td>
            <td class="grade-tick">${Handwriting=='B'?'✔️':''}</td>
            <td class="grade-tick">${Handwriting=='C'?'✔️':''}</td>
            <td class="grade-tick">${Handwriting=='D'?'✔️':''}</td>
            <td class="grade-tick">${Handwriting=='E'?'✔️':''}</td>
          </tr>
           <tr>
            <td>Verbal Fluency</td>
            <td class="grade-tick">${Verbal=='A'?'✔️':''}</td>
            <td class="grade-tick">${Verbal=='B'?'✔️':''}</td>
            <td class="grade-tick">${Verbal=='C'?'✔️':''}</td>
            <td class="grade-tick">${Verbal=='D'?'✔️':''}</td>
            <td class="grade-tick">${Verbal=='E'?'✔️':''}</td>
          </tr>
           <tr>
            <td>Games</td>
            <td class="grade-tick">${Games=='A'?'✔️':''}</td>
            <td class="grade-tick">${Games=='B'?'✔️':''}</td>
            <td class="grade-tick">${Games=='C'?'✔️':''}</td>
            <td class="grade-tick">${Games=='D'?'✔️':''}</td>
            <td class="grade-tick">${Games=='E'?'✔️':''}</td>
          </tr>
           <tr>
            <td>Sport</td>
            <td class="grade-tick">${Sport=='A'?'✔️':''}</td>
            <td class="grade-tick">${Sport=='B'?'✔️':''}</td>
            <td class="grade-tick">${Sport=='C'?'✔️':''}</td>
            <td class="grade-tick">${Sport=='D'?'✔️':''}</td>
            <td class="grade-tick">${Sport=='E'?'✔️':''}</td>
          </tr>
           <tr>
            <td>Handlings</td>
            <td class="grade-tick">${Handlings=='A'?'✔️':''}</td>
            <td class="grade-tick">${Handlings=='B'?'✔️':''}</td>
            <td class="grade-tick">${Handlings=='C'?'✔️':''}</td>
            <td class="grade-tick">${Handlings=='D'?'✔️':''}</td>
            <td class="grade-tick">${Handlings=='E'?'✔️':''}</td>
          </tr>
           <tr>
            <td>Drawing</td>
            <td class="grade-tick">${Drawing=='A'?'✔️':''}</td>
            <td class="grade-tick">${Drawing=='B'?'✔️':''}</td>
            <td class="grade-tick">${Drawing=='C'?'✔️':''}</td>
            <td class="grade-tick">${Drawing=='D'?'✔️':''}</td>
            <td class="grade-tick">${Drawing=='E'?'✔️':''}</td>
          </tr>
          <tr>
            <td>Musical</td>
            <td class="grade-tick">${Musical=='A'?'✔️':''}</td>
            <td class="grade-tick">${Musical=='B'?'✔️':''}</td>
            <td class="grade-tick">${Musical=='C'?'✔️':''}</td>
            <td class="grade-tick">${Musical=='D'?'✔️':''}</td>
            <td class="grade-tick">${Musical=='E'?'✔️':''}</td>
          </tr>
          
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- ================= SIGNATURES ================= -->
<div class="signatures">
  <div class="sign">
    <img id="classTeacherSignatureImg" class="signature-img">
    <div class="signature-title">School Stamp </div>
  </div>

  <div class="sign">
    <img id="proprietorSignatureImg" class="signature-img">
    <div class="signature-title">Proprietor’s Signature</div>
  </div>
</div>

</body>
</html>

    `);
    printWindow.document.close();

    // Print logic
    printWindow.onload = () => {
      const fileTitle = `${studentName.replace(/\s+/g, "_")}_${studentID}_Result`;
      printWindow.document.title = fileTitle;

      printWindow.document.getElementById("classTeacherSignatureImg").src =
    "assets/images/auth/test 2.png";

    printWindow.document.getElementById("proprietorSignatureImg").src =
    "assets/images/auth/test 1.png";

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 2000);

      printWindow.onafterprint = printWindow.onbeforeunload = () => {
        printWindow.close();
        location.href = "result-list.html";
      };
    };

    setTimeout(() => {
      if (addSubjectBtn) addSubjectBtn.style.display = "inline-block";
    }, 3000);
  };
});





// ---------------------------
// Global Variables
// ---------------------------
let studentName = "";
let studentGender = "";
let studentClass = "";
let sessionYear = "";
let term = "Yearly Summary";
let avgScore = 0;
let totalScoreValue = 0;
let promotionStatus = "";

// ---------------------------
// Print Result Function
// ---------------------------
document.getElementById("printButton").addEventListener("click", () => {
    studentName = document.getElementById("studentName")?.value || document.getElementById("studentName")?.textContent || "-";
    studentGender = document.getElementById("studentGender")?.value || document.getElementById("studentGender")?.textContent || "-";
    studentClass = document.getElementById("studentClass")?.value || document.getElementById("studentClass")?.textContent || "-";
    sessionYear = document.getElementById("sessionYear")?.value || document.getElementById("sessionYear")?.textContent || "-";
    promotionStatus = document.getElementById("promotionStatus")?.value || "-";
    
    const resultTable = document.getElementById("yearlySummaryTable").cloneNode(true);

    const printWindow = window.open("", "_blank", "width=900,height=1000");
    printWindow.document.open();
    printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Life Point Academy | Student Result</title>

<style>
:root {
  --primary: #b11226;
  --secondary: #222;
  --border-soft: #ddd;
  --light-bg: #fafafa;
}

/* ================= GLOBAL ================= */
body {
  font-family: "Segoe UI", Calibri, sans-serif;
  margin: 18px;
  color: var(--secondary);
  background: #fff;
  line-height: 1.4;
}

/* Watermark */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  background: url("assets/images/auth/First Point Logo.webp") no-repeat center;
  background-size: 28%;
  opacity: 0.04;
  z-index: -1;
}

/* ================= HEADER ================= */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 3px solid var(--primary);
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.header-left img {
  width: 110px;
  border: 2px solid var(--primary);
  border-radius: 6px;
  padding: 4px;
}

.header-right {
  text-align: right;
}

.header-right h2 {
  margin: 0;
  font-size: 24px;
  color: var(--primary);
  font-weight: 800;
}

.header-right p {
  margin: 2px 0;
  font-size: 12px;
}

/* ================= SESSION BAR ================= */
.session-bar {
  margin: 8px 0 15px;
  padding: 6px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  background: var(--light-bg);
  border: 1px solid var(--border-soft);
}

/* ================= INFO / SUMMARY BOXES ================= */
.info-boxes {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.section {
  flex: 1;
  min-width: 260px;
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  background: #fff;
}

.section-title {
  background: var(--primary);
  color: #fff;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.section-content {
  padding: 8px 10px;
  font-size: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.info-grid strong {
  color: var(--secondary);
}

/* ================= TABLE ================= */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-bottom: 15px;
}

th {
  background: var(--primary);
  color: #fff;
  padding: 6px;
  border: 1px solid var(--border-soft);
}

td {
  padding: 6px;
  border: 1px solid var(--border-soft);
  text-align: center;
}

tr:nth-child(even) td {
  background: var(--light-bg);
}

/* ================= SIGNATURES ================= */
.signatures {
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
}

.sign {
  width: 45%;
  text-align: center;
}

.signature-img {
  width: 75px;
  margin-bottom: 6px;
}

.signature-title {
  border-top: 2px solid var(--primary);
  padding-top: 5px;
  font-size: 12px;
  font-weight: 700;
}

/* ================= PRINT ================= */
@media print {
  body {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  @page {
    size: A4;
    margin: 0.7cm;
  }
}
</style>

</head>

<body>

<!-- ================= HEADER ================= -->
<div class="header">
  <div class="header-left">
    <img src="assets/images/auth/First Point Logo.webp" alt="School Logo">
  </div>

 <div class="header-right">
    <h2>LIFE POINT ACADEMY | PROMOTION RESULT</h2>
    <p>ODO-EJA, MALLAM-TOPE, OSOGBO, OSUN STATE</p>
    <p>Email: Tpoint619@gmail.com</p>
    <p>Tel: 08036972619, 07032733082</p>
  </div>
</div>

<div class="session-bar">
  Academic Session: <strong>${sessionYear}</strong>
</div>

<!-- ================= STUDENT INFO ================= -->
<div class="info-boxes">
  <div class="section">
    <div class="section-title">Student Information</div>
    <div class="section-content info-grid">
      <div><strong>Name:</strong> ${studentName}</div>
      <div><strong>Gender:</strong> ${studentGender}</div>
      <div><strong>Class:</strong> ${studentClass}</div>
      <div><strong>Term:</strong> ${term}</div>
      <div><strong>Student ID:</strong> ${studentID}</div>
      <div><strong>Date Issued:</strong> ${new Date().toLocaleDateString()}</div>
    </div>
  </div>
</div>

<!-- ================= RESULTS ================= -->
<div class="section">
  <div class="section-title">Subjects and Scores</div>
  <div class="section-content">
    ${resultTable.outerHTML}
  </div>
</div>

<br>
<!-- ================= SUMMARY ================= -->
<div class="info-boxes">
  <div class="section">
    <div class="section-title">Summary</div>
    <div class="section-content info-grid">
      <div><strong>Total Marks:</strong> ${totalScoreValue}</div>
      <div><strong>Average Score:</strong> ${avgScore}%</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Promotion Status</div>
    <div class="section-content">
      <strong>${promotionStatus}</strong>
    </div>
  </div>
</div>

<!-- ================= SIGNATURES ================= -->
<div class="signatures">
  <div class="sign">
    <img id="classTeacherSignatureImg" class="signature-img">
    <div class="signature-title">School Stamp </div>
  </div>

  <div class="sign">
    <img id="proprietorSignatureImg" class="signature-img">
    <div class="signature-title">Proprietor’s Signature</div>
  </div>
</div>

</body>
</html>

    `);
    printWindow.document.close();

    printWindow.onload = () => {
        const fileTitle = `${studentName.replace(/\s+/g, "_")}_${studentID}_Result`;
        printWindow.document.title = fileTitle;

       printWindow.document.getElementById("classTeacherSignatureImg").src =
    "assets/images/auth/test 2.png";

    printWindow.document.getElementById("proprietorSignatureImg").src =
    "assets/images/auth/test 1.png";

        setTimeout(() => { printWindow.focus(); printWindow.print(); }, 1000);
        printWindow.onafterprint = printWindow.onbeforeunload = () => {
            printWindow.close();
            location.href = "result-add.html";
        };
    };
});



// ---------------------------
// Load Yearly Summary
// ---------------------------
async function loadYearlySummary() {
    yearlySummaryBody.innerHTML = "";
    const terms = ["First Term", "Second Term", "Third Term"];
    const termResults = {};
    let totalScore = 0;
    let subjectCount = 0;

    for (let t of terms) {
        const snapshot = await get(ref(resultDb, `Results/${studentID}/${studentClass}/${t}`));
        termResults[t] = snapshot.exists() ? snapshot.val().Subjects : {};
    }

    const subjectSet = new Set();
    terms.forEach(term => Object.keys(termResults[term] || {}).forEach(sub => subjectSet.add(sub.trim())));
    const allSubjects = Array.from(subjectSet);

    allSubjects.forEach((subjectKey, index) => {
        const firstTermSub = Object.keys(termResults["First Term"] || {}).find(s => s.trim() === subjectKey) || "";
        const secondTermSub = Object.keys(termResults["Second Term"] || {}).find(s => s.trim() === subjectKey) || "";
        const thirdTermSub = Object.keys(termResults["Third Term"] || {}).find(s => s.trim() === subjectKey) || "";

        const firstTerm = termResults["First Term"][firstTermSub]?.total || 0;
        const secondTerm = termResults["Second Term"][secondTermSub]?.total || 0;
        const thirdTerm = termResults["Third Term"][thirdTermSub]?.total || 0;

        const avgTotal = ((firstTerm + secondTerm + thirdTerm) / 3).toFixed(2);

        totalScore += parseFloat(avgTotal);
        subjectCount++;

        let grade, remark;
        if (avgTotal >= 80) { grade = "A"; remark = "Excellent"; }
        else if (avgTotal >= 60) { grade = "B"; remark = "Very Good"; }
        else if (avgTotal >= 50) { grade = "C"; remark = "Good"; }
        else if (avgTotal >= 40) { grade = "D"; remark = "Averge"; }
        else { grade = "E"; remark = "Below"; }

        const row = document.createElement("tr");
        row.innerHTML = `<td>${index+1}</td><td>${subjectKey}</td><td>${firstTerm}</td><td>${secondTerm}</td><td>${thirdTerm}</td><td>${avgTotal}</td><td>${grade}</td><td>${remark}</td>`;
        yearlySummaryBody.appendChild(row);
    });

    if (allSubjects.length === 0) {
        yearlySummaryBody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#d9534f;font-weight:bold;">ℹ️ No previous result found.</td></tr>`;
        return;
    }

    const overallAverage = (totalScore / subjectCount).toFixed(2);
    if (overallAverage >= 80) promotionStatus = "Promoted to the Next Class with Distinction";
    else if (overallAverage >= 50) promotionStatus = "Promoted to the Next Class";
    else if (overallAverage >= 40) promotionStatus = "Promotion on Trial";
    else promotionStatus = "Need Academic Support";

    totalScoreValue = totalScore;
    avgScore = overallAverage;
    document.getElementById("promotionStatus").value = promotionStatus;
}

// ---------------------------
// Save Yearly Summary
// ---------------------------
async function saveYearlySummary(studentID, currentClass) {
    const summaryData = {
        totalScore: totalScoreValue,
        averageScore: avgScore,
        promotionStatus: promotionStatus,
        savedAt: new Date().toISOString()
    };
    await set(ref(resultDb, `Results/${studentID}/${currentClass}/Yearly Summary`), summaryData);
    console.log("Yearly Summary saved successfully");
}

// ---------------------------
// Move to Next Class Button
// ---------------------------
document.getElementById("MoveNextSession").addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("moveNextClassModal"));
    modal.show();
});

// ---------------------------
// Confirm Move to Next Class
// ---------------------------
document.getElementById("confirmMoveNextBtn").addEventListener("click", async () => {
    const terms = ["First Term", "Second Term", "Third Term"];
    let allResultsComplete = true;
    const currentClass = document.getElementById("studentClass").textContent;

    for (let term of terms) {
        const snapshot = await get(ref(resultDb, `Results/${studentID}/${currentClass}/${term}`));
        if (!snapshot.exists()) { allResultsComplete = false; break; }
    }

    if (!allResultsComplete) {
        showNotification("⚠️ Complete ALL terms before moving to the next class.", false);
        return;
    }

    const nextClass = getNextClass(currentClass);
    await saveYearlySummary(studentID, currentClass);
    await createNewSession(studentID, nextClass);
    await set(ref(resultDb, `Results/${studentID}/currentClass`), nextClass);
    document.getElementById("studentClass").textContent = nextClass;

    yearlySummaryBody.innerHTML = "";
    totalScoreValue = 0; avgScore = 0; promotionStatus = "";
    const termTables = document.querySelectorAll(".term-table-body");
    termTables.forEach(tb => resetTermTable(tb));
    clearInputs();
    document.getElementById("termSelect").value = "First Term";
    document.getElementById("FirstTermTab").click();
    showNotification("✅ Student moved to the next class successfully! First term is ready for new input.", true);
});

// ---------------------------
// Create Next Class Structure
// ---------------------------
async function createNewSession(studentID, nextClass) {
    const basePath = `Results/${studentID}/${nextClass}`;
    const terms = ["First Term", "Second Term", "Third Term"];
    for (let term of terms) {
        await set(ref(resultDb, `${basePath}/${term}/Subjects`), {});
        await set(ref(resultDb, `${basePath}/${term}/Affective`), {});
        await set(ref(resultDb, `${basePath}/${term}/Remarks`), "");
    }
    await set(ref(resultDb, `${basePath}/Yearly Summary`), {});
}

// ---------------------------
// Load Current Class
// ---------------------------
async function loadCurrentClass(studentID) {
    try {
        const studentSnap = await get(ref(studentDb, `Students/${studentID}`));
        let currentClass = "Unknown";

        if (studentSnap.exists()) {
            const studentData = studentSnap.val();
            currentClass = studentData.studentClass || studentData.className || "Unknown";
            await set(ref(resultDb, `Results/${studentID}/currentClass`), currentClass);
            document.getElementById("studentName").textContent = studentData.name || "Unknown";
            document.getElementById("studentGender").textContent = studentData.gender || "Unknown";
            document.getElementById("studentClass").textContent = currentClass;
        }

        const yearlySnap = await get(ref(resultDb, `Results/${studentID}/${currentClass}/Yearly Summary`));
        if (yearlySnap.exists()) {
            const d = yearlySnap.val();
            totalScoreValue = d.totalScore || 0;
            avgScore = d.averageScore || 0;
            promotionStatus = d.promotionStatus || "";
            document.getElementById("promotionStatus").value = promotionStatus;
        } else yearlySummaryBody.innerHTML = "";
    } catch (err) {
        console.error("Failed to load student class info:", err);
        document.getElementById("studentName").textContent = "Unknown";
        document.getElementById("studentGender").textContent = "Unknown";
        document.getElementById("studentClass").textContent = "Unknown";
    }
}
loadCurrentClass(studentID);

// ---------------------------
// Clear Inputs
// ---------------------------
function clearInputs() {
    const inputs = document.querySelectorAll("input[type='text'], input[type='number'], select");
    inputs.forEach(input => input.value = "");
}

// ---------------------------
// Get Next Class
// ---------------------------
function getNextClass(currentClass) {
    const classes = ["creche", "kg1", "kg2","nursery 1","nursery 2","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","JSS 1","JSS 2","JSS 3","SSS 1","SSS 2","SSS 3"];
    const index = classes.indexOf(currentClass);
    if (index >= 0 && index < classes.length - 1) return classes[index+1];
    if (index === classes.length - 1) return "Graduate";
    return currentClass;
}

const now = new Date();
const day = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0'); // Months start at 0
const year = now.getFullYear();

const formattedDate = `${day}/${month}/${year}`;
document.getElementById("dateIssued").textContent = formattedDate;


// ---------------------------
// Navigation Buttons
// ---------------------------
document.getElementById("backBtn").addEventListener("click", () => window.location.href = "result-list.html");

window.addEventListener("DOMContentLoaded", () => loadCurrentClass(studentID));