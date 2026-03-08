import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Import your config
//import { timetableFirebaseConfig} from "./util/time-table-config.js"; // adjust path if needed

const timetableFirebaseConfig = {
  apiKey: "MY-API-KEY",
  authDomain: "exam-time-table-c0e13.firebaseapp.com",
  databaseURL: "https://exam-time-table-c0e13-default-rtdb.firebaseio.com",
  projectId: "exam-time-table-c0e13",
  storageBucket: "exam-time-table-c0e13.firebasestorage.app",
  messagingSenderId: "406650814548",
  appId: "1:406650814548:web:bae82edff5c7e147872dc1"
};

// ================= INITIALIZE =================
const app = initializeApp(timetableFirebaseConfig);
const db = getDatabase(app);


/* ================= UTILITIES ================= */
function showNotification(message) {
  const modalMsg = document.getElementById("notificationMessage");
  if (modalMsg) {
    modalMsg.textContent = message;
    new bootstrap.Modal(document.getElementById("notificationModal")).show();
  }
}
function formatDate(date) {
  return date.toISOString().split("T")[0];
}
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}


/* ============Data Format ====== */
function formatDateDMY(dateString) {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/* ================= DEFAULT SUBJECTS ================= */
const defaultSubjects = {
 creche: [
  "Numeracy","Songs And Rhythms","Literacy","Poem",
  "Pre-Science","Handwriting","Health Habits","Social Habits"
],

kg1: [
  "Numeracy","Songs And Rhythms","Literacy","Poem",
  "Pre-Science","Handwriting","Health Habits","Social Habits"
],

kg2: [
  "Numeracy","Creativity","Literacy","Physical And Health Education",
  "Basic Science & Tech","Colouring/Drawing","Literacy (Language Domain)","Religion Studies",
  "Verbal Reasoning","Handwriting","Quantitative Reasoning","Poem",
  "Civic Education","Songs And Rhythms","Personal Development","Health Habits",
  "Pre-Science","Social Habits"
],

nursery1: [
  "Numeracy","Cultural And Creative Art","Literacy (Letter Work)","Physical And Health Education",
  "Basic Science & Tech","Creativity","Literacy (Language Domain)","Religion Studies",
  "Verbal Reasoning","Handwriting","Quantitative Reasoning","Poem",
  "Civic Education","Songs And Rhythm","Personal Development","Health Habits",
  "Dictation","Social Habits"
],

nursery2: [
  "Mathematics","Music","English Language","Physical And Health Education",
  "Basic Science","Cultural And Creative Art","Basic Tech","Home-Economics",
  "Computer Science","Yoruba","Agricultural Science","French",
  "Phonics","Religion Studies","Civic Education","Nigerian History",
  "Social And Citizenship Studies","Security Education","Dictation","Handwriting",
  "Verbal Reasoning","Quantitative Reasoning"
],

basic1: [
  "Mathematics","Music","English Language","Physical And Health Education",
  "Basic Science","Cultural And Creative Art","Basic Tech","Home-Economics",
  "Computer Science","Yoruba","Agricultural Science","French",
  "Phonics","Religion Studies","Civic Education","Nigerian History",
  "Social And Citizenship Studies","Security","Dictation","Handwriting",
  "Verbal Reasoning","Quantitative Reasoning"
],

basic2: [
  "Mathematics","Music","English Language","Physical And Health Education",
  "Basic Science","Cultural And Creative Art","Basic Tech","Home-Economics",
  "Computer Science","Yoruba","Agricultural Science","French",
  "Phonics","Religion Studies","Civic Education","Nigerian History",
  "Social And Citizenship Studies","Security","Dictation","Handwriting",
  "Verbal Reasoning","Quantitative Reasoning"
],

basic3: [
  "Mathematics","Music","English Language","Physical And Health Education",
  "Basic Science","Cultural And Creative Art","Basic Tech","Home-Economics",
  "Computer Science","Yoruba","Agricultural Science","French",
  "Phonics","Religion Studies","Civic Education","Nigerian History",
  "Social And Citizenship Studies","Security","Dictation","Handwriting",
  "Verbal Reasoning","Quantitative Reasoning"
],

basic4: [
  "Mathematics","Music","English Language","Physical And Health Education",
  "Basic Science","Cultural And Creative Art","Basic Tech","Home-Economics",
  "Computer Science","Yoruba","Agricultural Science","French",
  "Phonics","Religion Studies","Civic Education","Nigerian History",
  "Social And Citizenship Studies","Security","Dictation","Handwriting",
  "Verbal Reasoning","Quantitative Reasoning"
],

basic5: [
  "Mathematics","Music","English Language","Physical And Health Education",
  "Basic Science","Cultural And Creative Art","Basic Tech","Home-Economics",
  "Computer Science","Yoruba","Agricultural Science","French",
  "Phonics","Religion Studies","Civic Education","Nigerian History",
  "Social And Citizenship Studies","Security","Dictation","Handwriting",
  "Verbal Reasoning","Quantitative Reasoning"
],

jss1: [
  "Mathematics","Cultural and creative Art (CCA)","English Language","Physical And Health Education",
  "Intermediate Science","Christian Religion Studies (CRS)","Computer Science","Business studies (BS)",
  "Agricultural Science","Entrepreneurship","Civic Education","Digital Technology",
  "Nigeria History","Security","Social and citizenship studies","Dictation","Phonic"
],

jss2: [
  "Mathematics","Cultural and creative Art (CCA)","English Language","Physical And Health Education",
  "Intermediate Science","Christian Religion Studies (CRS)","Computer Science","Business studies (BS)",
  "Agricultural Science","Entrepreneurship","Civic Education","Digital Technology",
  "Nigeria History","Security","Social and citizenship studies","Dictation","Phonic"
],

jss3: [
  "Mathematics","Cultural and creative Art (CCA)","English Language","Physical And Health Education",
  "Intermediate Science","Christian Religion Studies (CRS)","Computer Science","Business studies (BS)",
  "Agricultural Science","Entrepreneurship","Civic Education","Digital Technology",
  "Nigeria History","Security","Social and citizenship studies","Dictation","Phonic"
],

sss1: [
  "General Mathematics","Visual Arts","English Language","Christian Religious studies",
  "Physics","Commerce","Chemistry","Marketing",
  "Biology","Literature-in-English","Government","Digital Technology",
  "Economics","Entrepreneurship","Accounting"
],

sss2: [
  "General Mathematics","Visual Arts","English Language","Christian Religious studies",
  "Physics","Commerce","Chemistry","Marketing",
  "Biology","Literature-in-English","Government","Digital Technology",
  "Economics","Entrepreneurship","Accounting"
],

sss3: [
  "General Mathematics","Visual Arts","English Language","Christian Religious studies",
  "Physics","Commerce","Chemistry","Marketing",
  "Biology","Literature-in-English","Government","Digital Technology",
  "Economics","Entrepreneurship","Accounting"
]
};

/* ================= SMART SCHEDULING FUNCTION (UPDATED & BALANCED) ================= */
function generateSmartSchedule(
  startDate,
  endDate,
  holidays,
  maxPerDay,
  startTimeStr,
  endTimeStr,
  examDuration,
  breakDuration
) {

  const allClasses = Object.keys(defaultSubjects);
  const schedule = {};
  const holidaySet = new Set(holidays);

  // Convert time to minutes
  const [startHour, startMin] = startTimeStr.split(":").map(Number);
  const [endHour, endMin] = endTimeStr.split(":").map(Number);

  const startMinutesOfDay = (startHour * 60) + startMin;
  const endMinutesOfDay = (endHour * 60) + endMin;
  const totalAvailableMinutes = endMinutesOfDay - startMinutesOfDay;

  // Generate valid exam dates
  const availableDates = [];
  let curDate = new Date(startDate);
  const finalEnd = new Date(endDate);

  while (curDate <= finalEnd) {
    if (!isWeekend(curDate) && !holidaySet.has(formatDate(curDate))) {
      availableDates.push(new Date(curDate));
    }
    curDate.setDate(curDate.getDate() + 1);
  }

  if (availableDates.length === 0) return {};

  allClasses.forEach(cls => {

    const subjects = defaultSubjects[cls];
    const classSchedule = [];

    let dayIndex = 0;
    let subjectIndex = 0;

    while (subjectIndex < subjects.length && dayIndex < availableDates.length) {

      let currentMinutes = startMinutesOfDay;
      let papersToday = 0;

      while (papersToday < maxPerDay && subjectIndex < subjects.length) {

        // Calculate time needed if we add this paper
        const timeNeeded =
          (papersToday * examDuration) +
          (papersToday > 0 ? papersToday * breakDuration : 0) +
          examDuration;

        if (timeNeeded > totalAvailableMinutes) {
          break; // no more papers fit today
        }

        // Add break before paper except first
        if (papersToday > 0) {
          currentMinutes += breakDuration;
        }

        const startH = Math.floor(currentMinutes / 60);
        const startM = currentMinutes % 60;

        const endMinutes = currentMinutes + examDuration;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;

        classSchedule.push({
          subject: subjects[subjectIndex],
          date: formatDate(availableDates[dayIndex]),
          startTime: `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`,
          endTime: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`,
          duration: examDuration
        });

        currentMinutes = endMinutes;
        papersToday++;
        subjectIndex++;
      }

      dayIndex++;
    }

    schedule[cls] = classSchedule;
  });

  return schedule;
}


document.addEventListener("DOMContentLoaded", () => {

  // Disable past dates in calendar
  const startDateInput = document.querySelector('input[name="startDate"]');
  const endDateInput = document.querySelector('input[name="endDate"]');

  const today = new Date().toISOString().split("T")[0];

  if (startDateInput) startDateInput.setAttribute("min", today);
  if (endDateInput) endDateInput.setAttribute("min", today);

  // Always render list (for list page)
  renderTimetables();

  // Only attach form submit if form exists
  const timetableForm = document.getElementById("timetableForm");

  if (timetableForm) {
    timetableForm.addEventListener("submit", async e => {
      e.preventDefault();

      try {
        const formData = new FormData(timetableForm);
        const name = formData.get("name");
        const session = formData.get("session");
        const term = formData.get("term");
        const duration = parseInt(formData.get("duration"));
        const maxPapers = parseInt(formData.get("maxPapers"));
        const startDate = formData.get("startDate");
        const endDate = formData.get("endDate");
        const startTime = formData.get("startTime");
        const endTime = formData.get("endTime");
        const breakDuration = parseInt(formData.get("breakDuration") || 30);
        const holidays = formData.get("holidays")
  .split(",")
  .map(d => {
    const parts = d.split("-"); // assume DD-MM-YYYY from input
    return `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
  })
  .filter(d => d);

const holidaySet = new Set(holidays);

        // ---- DATE VALIDATION (PREVENT PAST) ----
        const todayDate = new Date();
        todayDate.setHours(0,0,0,0);

        const selectedStart = new Date(startDate);
        const selectedEnd = new Date(endDate);

        if (selectedStart < todayDate) {
          showNotification("Start date cannot be in the past.");
          return;
        }

        if (selectedEnd < todayDate) {
          showNotification("End date cannot be in the past.");
          return;
        }

        if (selectedEnd < selectedStart) {
          showNotification("End date cannot be before start date.");
          return;
        }
        // ----------------------------------------

        const timetableId = "TT-" + Date.now();

        const schedule = generateSmartSchedule(
          startDate,
          endDate,
          holidays,
          maxPapers,
          startTime,
          endTime,
          duration,
          breakDuration
        );

        const data = {
  timetableId,
  name,
  session,
  term,
  duration,        // exam duration
  breakDuration,   // break interval
  maxPapers,
  startDate,
  endDate,
  holidays,
  status: "Active",
  createdAt: new Date().toISOString(),
  schedule
};

        await set(ref(db, "Timetables/" + timetableId), data);

        showNotification("Timetable generated successfully!");
        timetableForm.reset();
        renderTimetables();

      } catch (err) {
        showNotification("Error: " + err.message);
      }
    });
  }

});

/* ================= RENDER TIMETABLE LIST ================= */
async function renderTimetables() {
  const list = document.getElementById("timetableList");
  if (!list) return;
  const snapshot = await get(ref(db,"Timetables"));
  list.innerHTML = "";
  if(!snapshot.exists()) return;
  let serial=1;
  Object.values(snapshot.val()).forEach(tt=>{
    const row=document.createElement("tr");
    row.innerHTML=`
      <td>${serial++}</td>
      <td>${tt.timetableId}</td>
      <td>${new Date(tt.createdAt).toLocaleDateString()}</td>
      <td>${tt.session}</td>
      <td>${tt.term}</td>
      <td>${tt.duration}</td>
      <td class="text-center"><span class="badge bg-success">${tt.status}</span></td>
      <td class="text-center">
        <button class="btn btn-info btn-sm view">View</button>
        <button class="btn btn-success btn-sm edit">Edit</button>
        <button class="btn btn-danger btn-sm delete">Delete</button>
        <button class="btn btn-primary btn-sm download">Download</button>
      </td>
    `;
    row.querySelector(".view").addEventListener("click",()=>viewTimetableModal(tt));
    row.querySelector(".edit").addEventListener("click",()=>{
  editTimetable(tt);
});
    row.querySelector(".delete").addEventListener("click",()=>deleteTimetableModal(tt.timetableId));
    row.querySelector(".download").addEventListener("click",()=>downloadPDF(tt));
    list.appendChild(row);
  });
}

/* ================= VIEW MODAL ================= */
function viewTimetableModal(tt) {
  const modal = new bootstrap.Modal(document.getElementById("timetableModal"));
  document.getElementById("timetableModalTitle").textContent = `View Timetable: ${tt.timetableId}`;
  const body = document.getElementById("timetableModalBody");
  body.innerHTML = "";
  Object.keys(tt.schedule).forEach(cls=>{
    const table = document.createElement("table");
    table.className="table table-bordered mb-3";
    let html=`<thead><tr><th>Date</th><th>Subject</th><th>Start</th><th>End</th><th>Break Interval</th><th>Exam Duration</th></tr></thead><tbody>`;
    tt.schedule[cls].forEach((ex, index)=>{
  html+=`<tr>
   <td>${formatDateDMY(ex.date)}</td>
    <td>${ex.subject}</td>
    <td>${ex.startTime}</td>
    <td>${ex.endTime}</td>
    <td>${index === 0 ? 0 : (tt.breakDuration || 0)}</td>
    <td>${tt.duration}</td>
  </tr>`;
});
    html+="</tbody>";
    table.innerHTML=html;
    body.appendChild(document.createElement("h6")).textContent=cls.toUpperCase();
    body.appendChild(table);
  });
  modal.show();
}

/* ============EDIT MODAL ========== */
function editTimetable(tt){
  const modal = new bootstrap.Modal(document.getElementById("timetableModal"));
  document.getElementById("timetableModalTitle").textContent = `Edit Timetable: ${tt.timetableId}`;

  const body = document.getElementById("timetableModalBody");

  body.innerHTML = `
    <div class="text-center">
      <p>You are about to regenerate this timetable.</p>
      <button class="btn btn-warning" id="regenerateBtn">Regenerate</button>
    </div>
  `;

  modal.show();

  document.getElementById("regenerateBtn").addEventListener("click", async ()=>{
    await remove(ref(db,"Timetables/"+tt.timetableId));
    showNotification("Timetable removed. Please create a new one.");
    modal.hide();
    renderTimetables();
  });
}

/* ================= DELETE MODAL ================= */
async function deleteTimetableModal(id){
  const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
  deleteModal.show();
  const confirmBtn = document.getElementById("confirmDelete");
  const newBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newBtn,confirmBtn);
  newBtn.addEventListener("click",async()=>{
    await remove(ref(db,"Timetables/"+id));
    deleteModal.hide();
    showNotification("✅ Timetable deleted!");
    renderTimetables();
  });
}

const CLASS_ORDER = [
  "Creche","KG1","KG2",
  "Nursery 1","Nursery 2",
  "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5",
  "JSS 1","JSS 2","JSS 3",
  "SSS 1","SSS 2","SSS 3"
];

/* ================= DOWNLOAD PDF ================= */

async function downloadPDF(tt) {

  if (!tt || !tt.schedule)
    return showNotification("No schedule to download.");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;

  const logoUrl = "assets/images/auth/First Point Logo.webp";

  let logoBase64 = null;
  try {
    logoBase64 = await loadImageBase64(logoUrl);
  } catch (e) {}

  function addWatermark() {
    if (!logoBase64) return;
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    doc.addImage(logoBase64, "PNG", 40, 80, 130, 130);
    doc.setGState(new doc.GState({ opacity: 1 }));
  }

  addWatermark();

  /* ================= HEADER ================= */

  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", 10, 8, 25, 25);
  }

  doc.setTextColor(0, 51, 153);
  doc.setFontSize(18);
  doc.text("Life Point Academy", pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("ODO-EJA, MALLAM-TOPE, OSOGBO, OSUN STATE", pageWidth / 2, 21, { align: "center" });
  doc.text("Tel: 08036972619, 07032733082 | Email: Tpoint619@gmail.com", pageWidth / 2, 26, { align: "center" });

  doc.setDrawColor(0, 51, 153);
  doc.line(10, 30, pageWidth - 10, 30);

  y = 40;

  /* ================= TITLE ================= */

  doc.setFontSize(14);
  doc.text(`Exam Timetable: ${tt.name || (tt.session + " " + tt.term + " Examinations")}`,
    pageWidth / 2, y, { align: "center" });

  y += 12;

  const sortedClasses = Object.keys(tt.schedule || {});

  function formatDateDMY(dateStr) {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  sortedClasses.forEach(cls => {

    const exams = tt.schedule[cls];
    if (!exams || exams.length === 0) return;

    if (y > 260) {
      doc.addPage();
      addWatermark();
      y = 20;
    }

    /* ===== CLASS TITLE ===== */
    doc.setFillColor(0, 51, 153);
    doc.setTextColor(255, 255, 255);
    doc.rect(10, y - 6, pageWidth - 20, 10, "F");
    doc.setFontSize(12);
    doc.text(`Class: ${cls}`, 15, y);
    y += 10;

    /* ===== TABLE HEADER ===== */
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFillColor(230, 240, 255);
    doc.rect(10, y - 6, pageWidth - 20, 8, "F");

    doc.text("Date", 12, y);
    doc.text("Subject", 40, y);
    doc.text("Start", 120, y);
    doc.text("End", 145, y);
    doc.text("Break", 165, y);
    doc.text("Duration", 185, y);
    y += 8;

    /* ===== TABLE BODY ===== */
    exams.forEach((ex, index) => {

      if (y > 280) {
        doc.addPage();
        addWatermark();
        y = 20;
      }

      const subjectText = ex.subject.length > 28 ? ex.subject.substring(0, 28) : ex.subject;
      const breakInterval = index === 0 ? "0" : String(tt.breakDuration || 0);

      doc.text(formatDateDMY(ex.date), 12, y);               // formatted date
      doc.text(subjectText, 40, y);
      doc.text(ex.startTime, 120, y);
      doc.text(ex.endTime, 145, y);
      doc.text(breakInterval, 165, y);                      // Break Interval
      doc.text(String(ex.duration), 185, y);                // Exam Duration

      y += 7;
    });

    y += 8;
  });

  /* ================= SIGNATURE SECTION ================= */

  if (y > 240) {
    doc.addPage();
    addWatermark();
    y = 40;
  }

  y += 10;

  doc.line(20, y, 80, y);
  doc.line(pageWidth - 80, y, pageWidth - 20, y);

  y += 6;

  doc.setFontSize(10);
  doc.text("Exam Officer Signature", 20, y);
  doc.text("Principal Signature", pageWidth - 80, y);

  /* ================= PAGE NUMBERS ================= */

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(`Page ${i} of ${totalPages}`,
      pageWidth - 20,
      pageHeight - 10,
      { align: "right" });
  }

  doc.save(`${tt.name || tt.timetableId}.pdf`);
}

// Utility to load image as Base64
function loadImageBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(this, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}