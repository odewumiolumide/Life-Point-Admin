// =============================
// broadsheet.js - CA1, CA2, Exam with total, grade & position (case-insensitive + default subjects)
// =============================
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// -----------------------------
// Firebase Configs
// -----------------------------
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

// -----------------------------
// Initialize Firebase Apps
// -----------------------------
let studentApp, resultApp;
if (!getApps().some(a => a.name === "studentDB")) studentApp = initializeApp(studentFirebaseConfig, "studentDB");
else studentApp = getApps().find(a => a.name === "studentDB");

if (!getApps().some(a => a.name === "resultDB")) resultApp = initializeApp(resultFirebaseConfig, "resultDB");
else resultApp = getApps().find(a => a.name === "resultDB");

const studentDb = getDatabase(studentApp);
const resultDb = getDatabase(resultApp);

// -----------------------------
// DOM Elements
// -----------------------------
const broadsheetHead = document.getElementById("broadsheetHead");
const broadsheetBody = document.getElementById("broadsheetBody");
const classFilter = document.getElementById("classFilter");
const termFilter = document.getElementById("termFilter");
const searchInput = document.getElementById("searchInput");

// -----------------------------
// Default Subjects per Class
// -----------------------------
const defaultSubjects = {
  preNusery: ["Literacy",
    "Numeracy",
    "Basic Science",
    "Health Habits",
    "Social Habits",
    "Pre-Science",
    "Handwriting",
    "Poem",
    "Bible Knowledge",
    "Songs And Rhythms",
    "Arts & Crafts",
    "Colouring/Drawing"],

  prebasic1: [ "Literacy",
    "Numeracy",
    "Basic Science",
    "Health Habits",
    "Social Habits",
    "Pre-Science",
    "Handwriting",
    "Poem",
    "Bible Knowledge",
    "Songs And Rhythms",
    "Arts & Crafts",
    "Colouring/Drawing"],

  prebasic2: [ "Literacy",
    "Numeracy",
    "Basic Science",
    "Health Habits",
    "Social Habits",
    "Pre-Science",
    "Handwriting",
    "Poem",
    "Bible Knowledge",
    "Songs And Rhythms",
    "Arts & Crafts",
    "Colouring/Drawing"],

  prebasic3: [ "Literacy",
    "Numeracy",
    "Basic Science",
    "Health Habits",
    "Social Habits",
    "Pre-Science",
    "Handwriting",
    "Poem",
    "Bible Knowledge",
    "Songs And Rhythms",
    "Arts & Crafts",
    "Colouring/Drawing"],

  basic1: ["Mathematics",
    "English Studies",
    "Quantitative Reasoning",
    "Verbal Reasoning",
    "Civic Education",
    "Christian Religious Studies",
    "Physical And Health Education",
    "Basic Science And Technology",
    "Social And Citizenship Studies",
    "Cultural And Creative Arts",
    "Drawing",
    "Agricultural Science",
    "Nigerian History",
    "Basic Digital Literacy",
    "Home Economics",
    "Yoruba",
    "Security Education",
    "Handwriting",
    "Dictation",
    "English Literature"
  ],

  basic2: ["Mathematics",
    "English Studies",
    "Quantitative Reasoning",
    "Verbal Reasoning",
    "Civic Education",
    "Christian Religious Studies",
    "Physical And Health Education",
    "Basic Science And Technology",
    "Social And Citizenship Studies",
    "Cultural And Creative Arts",
    "Drawing",
    "Agricultural Science",
    "Nigerian History",
    "Basic Digital Literacy",
    "Home Economics",
    "Yoruba",
    "Security Education",
    "Handwriting",
    "Dictation",
    "English Literature"
  ],

  basic3: ["Mathematics",
    "English Studies",
    "Quantitative Reasoning",
    "Verbal Reasoning",
    "Civic Education",
    "Christian Religious Studies",
    "Physical And Health Education",
    "Basic Science And Technology",
    "Social And Citizenship Studies",
    "Cultural And Creative Arts",
    "Drawing",
    "Agricultural Science",
    "Nigerian History",
    "Basic Digital Literacy",
    "Home Economics",
    "Yoruba",
    "Security Education",
    "Handwriting",
    "Dictation",
    "English Literature"
  ],

  basic4: ["Mathematics",
    "English Studies",
    "Quantitative Reasoning",
    "Verbal Reasoning",
    "Civic Education",
    "Christian Religious Studies",
    "Physical And Health Education",
    "Basic Science And Technology",
    "Social And Citizenship Studies",
    "Cultural And Creative Arts",
    "Drawing",
    "Agricultural Science",
    "Nigerian History",
    "Basic Digital Literacy",
    "Home Economics",
    "Yoruba",
    "Security Education",
    "Handwriting",
    "Dictation",
    "English Literature"],

  basic5: ["Mathematics",
    "English Studies",
    "Quantitative Reasoning",
    "Verbal Reasoning",
    "Civic Education",
    "Christian Religious Studies",
    "Physical And Health Education",
    "Basic Science And Technology",
    "Social And Citizenship Studies",
    "Cultural And Creative Arts",
    "Drawing",
    "Agricultural Science",
    "Nigerian History",
    "Basic Digital Literacy",
    "Home Economics",
    "Yoruba",
    "Security Education",
    "Handwriting",
    "Dictation",
    "English Literature"
  ],

  jss1: ["Mathematics",
    "English",
    "Pre-Vocational Studies (PVS)",
    "Business Studies (BS)",
    "National Value Education (NVE)",
    "Basic Science And Technology (BST)",
    "Christian Religious Studies (CRS)",
    "Cultural And Creative Art (CCA)",
    "Nigerian History",
    "Diction",
    "Information And Communication Technology (ICT)",
    "Dictation",
    "Yoruba"],

  jss2: ["Mathematics",
    "English",
    "Pre-Vocational Studies (PVS)",
    "Business Studies (BS)",
    "National Value Education (NVE)",
    "Basic Science And Technology (BST)",
    "Christian Religious Studies (CRS)",
    "Cultural And Creative Art (CCA)",
    "Nigerian History",
    "Diction",
    "Information And Communication Technology (ICT)",
    "Dictation",
    "Yoruba"],

  jss3: ["Mathematics",
    "English",
    "Pre-Vocational Studies (PVS)",
    "Business Studies (BS)",
    "National Value Education (NVE)",
    "Basic Science And Technology (BST)",
    "Christian Religious Studies (CRS)",
    "Cultural And Creative Art (CCA)",
    "Nigerian History",
    "Diction",
    "Information And Communication Technology (ICT)",
    "Dictation",
    "Yoruba"],

  sss1: ["General Mathematics",
    "English Language",
    "Citizenship And Heritage Studies",
    "Digital Technology"],

  sss2: ["General Mathematics",
    "English Language",
    "Citizenship And Heritage Studies",
    "Digital Technology"],

  sss3: ["General Mathematics",
    "English Language",
    "Citizenship And Heritage Studies",
    "Digital Technology"]
};

// -----------------------------
// Normalize Class Name
// -----------------------------
function normalizeClass(cls) {
  return cls ? cls.trim().toLowerCase().replace(/[\s-]/g, "") : "";
}

// -----------------------------
// Fetch Students
// -----------------------------
async function fetchStudents() {
  const snapshot = await get(ref(studentDb, "Students"));
  return snapshot.exists() ? snapshot.val() : {};
}

// -----------------------------
// Fetch Results
// -----------------------------
async function fetchResults(studentID, term) {
  const snapshot = await get(ref(resultDb, `Results/${studentID}/${term}`));
  return snapshot.exists() ? snapshot.val() : {};
}

// -----------------------------
// Render Broadsheet with Positions
// -----------------------------
async function renderBroadsheet() {
  const allStudents = await fetchStudents();

  const classVal = localStorage.getItem("selectedClass") || classFilter.value;
  const termVal = localStorage.getItem("selectedTerm") || termFilter.value;
  const searchTerm = (localStorage.getItem("searchTerm") || searchInput.value).toLowerCase();

  const filteredStudents = Object.values(allStudents).filter(student => {
    const matchClass = !classVal || classVal === "Classes" ? true : student.studentClass === classVal;
    const matchSearch = !searchTerm ? true : student.name.toLowerCase().includes(searchTerm);
    return matchClass && matchSearch;
  });

  if (!filteredStudents.length) {
    broadsheetHead.innerHTML = "";
    broadsheetBody.innerHTML = `<tr><td colspan="50" class="text-center text-danger">No students found.</td></tr>`;
    return;
  }

  // -----------------------------
  // Determine subjects using defaultSubjects for selected class
  // -----------------------------
  const normClass = normalizeClass(classVal);
  const classMap = {
    "prenusery":"preNusery","nusery1":"prebasic1","nursery1":"prebasic1",
    "nusery2":"prebasic2","nursery2":"prebasic2","prepgrade":"prebasic3",
    "grade1":"basic1","grade2":"basic2","grade3":"basic3","grade4":"basic4","grade5":"basic5",
    "jss1":"jss1","jss2":"jss2","jss3":"jss3","sss1":"sss1","sss2":"sss2","sss3":"sss3"
  };
  let subjects = [];
  const matchKey = classMap[normClass];
  if (matchKey && defaultSubjects[matchKey]) {
    subjects = [...defaultSubjects[matchKey]];
    const math = subjects.filter(s=>s.toLowerCase().includes("math"));
    const eng = subjects.filter(s=>s.toLowerCase().startsWith("english"));
    const remaining = subjects.filter(s=>!math.includes(s)&&!eng.includes(s)).sort((a,b)=>a.localeCompare(b));
    subjects = [...math,...eng,...remaining];
  }

  // -----------------------------
  // Table Header
  // -----------------------------
  let headerHTML = "<tr><th>S.L</th><th>Student ID</th><th>Name</th>";
  subjects.forEach(sub => {
    headerHTML += `<th>${sub} CA1</th><th>${sub} CA2</th><th>${sub} Exam</th><th>${sub} Total</th>`;
  });
  headerHTML += "<th>Grand Total</th><th>Average</th><th>Grade</th><th>Position</th></tr>";
  broadsheetHead.innerHTML = headerHTML;

  // -----------------------------
  // Compute Grand Totals for all students
  // -----------------------------
  const studentTotals = await Promise.all(filteredStudents.map(async student => {
    const resultData = await fetchResults(student.studentID, termVal || student.term);
    const subjectsData = resultData.Subjects || {};
    let grandTotal = 0;
    let countSubjects = 0;

    Object.keys(subjectsData).forEach(subName => {
      const ca1 = parseFloat(subjectsData[subName].ca1) || 0;
      const ca2 = parseFloat(subjectsData[subName].ca2) || 0;
      const exam = parseFloat(subjectsData[subName].exam) || 0;
      const total = ca1 + ca2 + exam;
      grandTotal += total;
      countSubjects++;
    });

    return { student, resultData, grandTotal };
  }));

  // Sort descending by Grand Total
  studentTotals.sort((a, b) => b.grandTotal - a.grandTotal);

  // Assign positions (handle ties)
  let lastTotal = null, lastPosition = 0;
  studentTotals.forEach((entry, index) => {
    if(entry.grandTotal === lastTotal){
      entry.position = lastPosition;
    } else {
      entry.position = index + 1;
      lastPosition = index + 1;
      lastTotal = entry.grandTotal;
    }
  });

  // -----------------------------
  // Build rows
  // -----------------------------
  let count = 1;
  for (let entry of studentTotals) {
    const student = entry.student;
    const resultData = entry.resultData;
    const grandTotal = entry.grandTotal;
    const position = entry.position;

    const subjectsData = resultData.Subjects || {};
    const subMap = {};

    Object.keys(subjectsData).forEach(subName => {
      const ca1 = subjectsData[subName].ca1 !== undefined ? parseFloat(subjectsData[subName].ca1) : 0;
      const ca2 = subjectsData[subName].ca2 !== undefined ? parseFloat(subjectsData[subName].ca2) : 0;
      const exam = subjectsData[subName].exam !== undefined ? parseFloat(subjectsData[subName].exam) : 0;
      const total = ca1 + ca2 + exam;
      subMap[subName.toLowerCase()] = { ca1, ca2, exam, total, originalName: subName };
    });

    let countSubjects = Object.keys(subjectsData).length;
    let avgScore = countSubjects ? (grandTotal / countSubjects).toFixed(2) : 0;

    let grade = "E";
    if (avgScore >= 75) grade = "A";
    else if (avgScore >= 60) grade = "B";
    else if (avgScore >= 50) grade = "C";
    else if (avgScore >= 40) grade = "D";

    let rowHTML = `<tr><td>${count++}</td><td>${student.studentID}</td><td>${student.name}</td>`;
    subjects.forEach(sub=>{
      const data = subMap[sub.toLowerCase()] || { ca1: "-", ca2: "-", exam: "-", total: "-" };
      rowHTML += `<td>${data.ca1}</td><td>${data.ca2}</td><td>${data.exam}</td><td>${data.total}</td>`;
    });
    rowHTML += `<td>${grandTotal}</td><td>${avgScore}</td><td>${grade}</td><td>${position}</td></tr>`;
    broadsheetBody.innerHTML += rowHTML;
  }
}

// -----------------------------
// Event Listeners
// -----------------------------
classFilter.addEventListener("change", ()=>{
  localStorage.setItem("selectedClass", classFilter.value);
  renderBroadsheet();
});
termFilter.addEventListener("change", ()=>{
  localStorage.setItem("selectedTerm", termFilter.value);
  renderBroadsheet();
});
searchInput.addEventListener("input", ()=>{
  localStorage.setItem("searchTerm", searchInput.value.toLowerCase());
  renderBroadsheet();
});

// -----------------------------
// Initial Render
// -----------------------------
window.addEventListener("DOMContentLoaded", ()=>{
  const savedClass = localStorage.getItem("selectedClass");
  const savedTerm = localStorage.getItem("selectedTerm");
  const savedSearch = localStorage.getItem("searchTerm");

  if(savedClass) classFilter.value=savedClass;
  if(savedTerm) termFilter.value=savedTerm;
  if(savedSearch) searchInput.value=savedSearch;

  renderBroadsheet();
});
