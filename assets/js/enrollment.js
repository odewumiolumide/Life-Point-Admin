// enrollment.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

/* ===============================
   INPUT VALIDATION
=================================*/

// Block numbers in student name
const studentNameInput = document.getElementById("studentName");
studentNameInput?.addEventListener("input", function () {
  this.value = this.value.replace(/[0-9]/g, "");
});

// Block text in phone
const parentNumberInput = document.getElementById("parentNumber");
parentNumberInput?.addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});

/* ===============================
   FIREBASE CONFIG
=================================*/

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "de-flints.firebaseapp.com",
  projectId: "de-flints",
  storageBucket: "de-flints.firebasestorage.app",
  messagingSenderId: "377958558917",
  appId: "1:377958558917:web:8ffc0e1b690628fb33d4ac"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ===============================
   GENERATE ADMISSION NUMBER (Class-Specific)
=================================*/

async function generateAdmissionNumber(year, studentClass) {

  // Clean class name to avoid space mismatch
  studentClass = studentClass.trim();

  // Get all enrollments for that year
  const snapshot = await get(ref(db, `Enrollments/${year}`));
  const students = snapshot.exists() ? snapshot.val() : {};

  let count = 0;

  // IMPORTANT: Only ONE loop (your structure is year -> students)
  Object.values(students).forEach(student => {
    if (student.classAssigned === studentClass) {
      count++;
    }
  });

  const nextNumber = count + 1;

  // Class code mapping
  const classCodes = {
    "Creche": "CRE",
    "KG1": "KG1",
    "KG2": "KG2",
    "Nursery 1": "NUR1",
    "Nursery 2": "NUR2",
    "Grade 1": "PRI1",
    "Grade 2": "PRI2",
    "Grade 3": "PRI3",
    "Grade 4": "PRI4",
    "Grade 5": "PRI5",
    "JSS 1": "JSS1",
    "JSS 2": "JSS2",
    "JSS 3": "JSS3",
    "SSS 1": "SSS1",
    "SSS 2": "SSS2",
    "SSS 3": "SSS3"
  };

  const code = classCodes[studentClass];

  if (!code) {
    throw new Error(`Class "${studentClass}" is not mapped.`);
  }

  return `ADN-${code}-${String(nextNumber).padStart(3, "0")}`;
}

/* ===============================
   NOTIFICATION
=================================*/

function showNotification(message, success = true) {
  const msgDiv = document.getElementById("notificationMessage");
  if (!msgDiv) return;

  msgDiv.textContent = message;
  msgDiv.style.color = success ? "green" : "red";

  new bootstrap.Modal(document.getElementById("notificationModal")).show();
}

/* ===============================
   HANDLE ENROLLMENT FORM
=================================*/

const studentForm = document.getElementById("studentForm");

studentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = studentForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Enrolling Student...";

  try {
    const year = new Date().getFullYear();

    const fullName = document.getElementById("studentName").value.trim();
    const gender = document.getElementById("studentGender").value.trim();
    const birth = document.getElementById("studentBirth").value.trim();
    const state = document.getElementById("studentState").value.trim();
    const nationality = document.getElementById("studentNationality").value.trim();
    const studentClass = document.getElementById("studentClass").value.trim();
    const academicSession = document.getElementById("studentAcademic").value.trim();
    const term = document.getElementById("studentTerm").value.trim();
    const previousSchool = document.getElementById("studentPrevious").value.trim();
    const parentName = document.getElementById("parentName").value.trim();
    const parentPhone = document.getElementById("parentNumber").value.trim();
    const parentEmail = document.getElementById("parentEmail").value.trim();
    const parentAddress = document.getElementById("parentAddress").value.trim();
    const enrollmentStatus = document.getElementById("studentStatus").value.trim();

    if (!fullName || !gender || !birth || !state || !nationality || !studentClass || !term || !parentName || !enrollmentStatus) {
      showNotification("Please fill all required fields.", false);
      return;
    }

   const admissionNumber = await generateAdmissionNumber(year, studentClass);

    const enrollmentData = {
      year,
      admissionNumber,
      fullName,
      gender,
      dateOfBirth: birth,
      stateOfOrigin: state,
      nationality,
      classAssigned: studentClass,
      academicSession,
      term,
      previousSchool,
      guardian: {
        name: parentName,
        phone: parentPhone,
        email: parentEmail,
        address: parentAddress
      },
      enrollmentStatus,
      enrollmentDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await set(ref(db, `Enrollments/${year}/${admissionNumber}`), enrollmentData);

    showNotification(`Student "${fullName}" enrolled successfully.`);
    studentForm.reset();
    renderEnrollments();

  } catch (error) {
    showNotification(error.message, false);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save";
  }
});

/* ===============================
   FETCH ENROLLMENTS
=================================*/

async function fetchEnrollments() {
  const snapshot = await get(ref(db, "Enrollments"));
  return snapshot.exists() ? snapshot.val() : {};
}

/* ===============================
   RENDER ENROLLMENTS
=================================*/

const enrollmentTableBody = document.getElementById("enrollmentTableBody");

async function renderEnrollments() {
  if (!enrollmentTableBody) return;

  const selectedClass = document.getElementById("classFilter")?.value || "All";
  const selectedStatus = document.getElementById("statusFilter")?.value || "All";
  const selectedSession = document.getElementById("modalStudentSession")?.value || "All"; // FIXED: declared here
  const searchQuery = document.getElementById("searchInput")?.value?.toLowerCase() || "";

  const allYears = await fetchEnrollments();
  enrollmentTableBody.innerHTML = "";
  let serial = 1;

  Object.values(allYears).forEach(yearData => {
    Object.values(yearData).forEach(student => {

      // CLASS FILTER
      if (selectedClass !== "All" && student.classAssigned !== selectedClass) return;

      // STATUS FILTER
      if (selectedStatus !== "All" && student.enrollmentStatus !== selectedStatus) return;

      // SESSION FILTER
      if (selectedSession !== "All" && student.academicSession !== selectedSession) return;

      // SEARCH FILTER
      if (searchQuery &&
          !student.fullName.toLowerCase().includes(searchQuery) &&
          !student.admissionNumber.toLowerCase().includes(searchQuery)) return;

     const badgeClass =
  student.enrollmentStatus === "Active" ? "bg-success" :
  student.enrollmentStatus === "Pending" ? "bg-warning" :
  student.enrollmentStatus === "Suspended" ? "bg-danger" :
  student.enrollmentStatus === "Withdrawn" ? "bg-dark" :
  student.enrollmentStatus === "Graduate" ? "bg-primary" :
  "bg-secondary";
        

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${serial++}</td>
        <td>${new Date(student.enrollmentDate).toLocaleDateString()}</td>
        <td>${student.fullName}</td>
        <td>${student.admissionNumber}</td>
        <td>${student.classAssigned}</td>
        <td>${student.term}</td>
        <td>${student.gender}</td>
        <td class="text-center">
          <span class="badge ${badgeClass}">${student.enrollmentStatus}</span>
        </td>
        <td class="text-center">
          <button class="btn btn-info btn-sm view-btn">View</button>
          <button class="btn btn-success btn-sm edit-btn">Edit</button>
          <button class="btn btn-danger btn-sm delete-btn">Delete</button>
        </td>
      `;

      tr.querySelector(".view-btn").addEventListener("click", () => openEnrollmentModal(student, false));
      tr.querySelector(".edit-btn").addEventListener("click", () => openEnrollmentModal(student, true));
      tr.querySelector(".delete-btn").addEventListener("click", () => deleteEnrollment(student.year, student.admissionNumber));

      enrollmentTableBody.appendChild(tr);
    });
  });
}

/* ===============================
   DELETE
=================================*/

async function deleteEnrollment(year, admissionNumber) {
  if (!confirm("Are you sure you want to delete this enrollment?")) return;

  await remove(ref(db, `Enrollments/${year}/${admissionNumber}`));
  showNotification("Enrollment deleted successfully.");
  renderEnrollments();
}

/* ===============================
   VIEW / EDIT MODAL
=================================*/

function openEnrollmentModal(student, editable = false) {
  const modal = document.getElementById("enrollmentModal");

  document.getElementById("enrollmentModalTitle").textContent =
    editable ? "Edit Enrollment" : "View Enrollment";

  document.getElementById("modalAdmissionNumber").value = student.admissionNumber;
  document.getElementById("modalStudentName").value = student.fullName;
  document.getElementById("modalStudentClass").value = student.classAssigned;
  document.getElementById("modalStudentGender").value = student.gender;
  document.getElementById("modalStudentTerm").value = student.term;
  document.getElementById("modalStudentStatus").value = student.enrollmentStatus;

  document.getElementById("modalStudentName").disabled = !editable;
  document.getElementById("modalStudentClass").disabled = !editable;
  document.getElementById("modalStudentGender").disabled = !editable;
  document.getElementById("modalStudentTerm").disabled = !editable;
  document.getElementById("modalStudentStatus").disabled = !editable;

  modal.dataset.year = student.year;

  new bootstrap.Modal(modal).show();
}

/* ===============================
   HANDLE EDIT SUBMIT
=================================*/

const editForm = document.getElementById("editEnrollmentForm");

editForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const admissionNumber = document.getElementById("modalAdmissionNumber").value;
  const year = document.getElementById("enrollmentModal").dataset.year;

  // 1️⃣ Get existing data first
  const snapshot = await get(ref(db, `Enrollments/${year}/${admissionNumber}`));
  if (!snapshot.exists()) {
    showNotification("Student data not found.", false);
    return;
  }
  const existingData = snapshot.val();

  // 2️⃣ Build updated data without overwriting empty fields
  const updatedData = {
    year,
    admissionNumber,
    fullName: document.getElementById("modalStudentName").value || existingData.fullName,
    classAssigned: document.getElementById("modalStudentClass").value || existingData.classAssigned,
    gender: document.getElementById("modalStudentGender").value || existingData.gender,
    term: document.getElementById("modalStudentTerm").value || existingData.term,
    academicSession: document.getElementById("modalStudentSession")?.value || existingData.academicSession,
    enrollmentStatus: document.getElementById("modalStudentStatus").value || existingData.enrollmentStatus,
    dateOfBirth: document.getElementById("modalStudentBirth")?.value || existingData.dateOfBirth,
    stateOfOrigin: document.getElementById("modalStudentState")?.value || existingData.stateOfOrigin,
    nationality: document.getElementById("modalStudentNationality")?.value || existingData.nationality,
    previousSchool: document.getElementById("modalStudentPrevious")?.value || existingData.previousSchool,
    guardian: {
      name: document.getElementById("modalParentName")?.value || existingData.guardian?.name,
      phone: document.getElementById("modalParentPhone")?.value || existingData.guardian?.phone,
      email: document.getElementById("modalParentEmail")?.value || existingData.guardian?.email,
      address: document.getElementById("modalParentAddress")?.value || existingData.guardian?.address
    },
    enrollmentDate: document.getElementById("modalEnrollmentDate")?.value || existingData.enrollmentDate,
    createdAt: document.getElementById("modalCreatedAt")?.value || existingData.createdAt
  };

  // 3️⃣ Save to Firebase
  await set(ref(db, `Enrollments/${year}/${admissionNumber}`), updatedData);

  showNotification("Enrollment updated successfully.");
  renderEnrollments();
  bootstrap.Modal.getInstance(document.getElementById("enrollmentModal")).hide();
});

/* ===============================
   FILTER EVENTS
=================================*/

document.getElementById("classFilter")?.addEventListener("change", renderEnrollments);
document.getElementById("statusFilter")?.addEventListener("change", renderEnrollments);
document.getElementById("searchInput")?.addEventListener("input", renderEnrollments);
document.getElementById("modalStudentSession")?.addEventListener("input", renderEnrollments);

/* ===============================
   DOWNLOAD FILTERED ENROLLMENTS
=================================*/

document.getElementById("downloadBtn")?.addEventListener("click", async () => {
  const selectedClass = document.getElementById("classFilter").value;
  const selectedStatus = document.getElementById("statusFilter").value;

  const snapshot = await get(ref(db, "Enrollments"));
  if (!snapshot.exists()) {
    alert("No enrollment data found.");
    return;
  }

  const allYears = snapshot.val();
  let exportData = [];

  Object.keys(allYears).forEach(year => {
    Object.values(allYears[year]).forEach(student => {

      // Apply filters
      if (selectedClass !== "All" && student.classAssigned !== selectedClass) return;
      if (selectedStatus !== "All" && student.enrollmentStatus !== selectedStatus) return;

      exportData.push({
        "Admission Number": student.admissionNumber,
        "Full Name": student.fullName,
        "Class": student.classAssigned,
        "Term": student.term,
        "Gender": student.gender,
        "Status": student.enrollmentStatus,
        "Academic Session": student.academicSession,
        "Date of Birth": student.dateOfBirth,
        "State of Origin": student.stateOfOrigin,
        "Nationality": student.nationality,
        "Previous School": student.previousSchool,
        "Guardian Name": student.guardian?.name,
        "Guardian Phone": student.guardian?.phone,
        "Guardian Email": student.guardian?.email,
        "Guardian Address": student.guardian?.address,
        "Enrollment Date": student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : "-"
      });
    });
  });

  if (exportData.length === 0) {
    alert("No students match the selected filters.");
    return;
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Enrollment List");

  XLSX.writeFile(workbook, `Enrollment_${selectedClass}_${selectedStatus}.xlsx`);
});

/* ===============================
   INITIAL LOAD
=================================*/

renderEnrollments();

