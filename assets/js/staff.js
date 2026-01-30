 import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { 
    getDatabase, ref, set, onValue, remove 
  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

  // ✅ Firebase Configuration
  // Your web app's Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyD7pin-JUBBqUI-KiNtTCyGTSFOHL6rE1U",
  authDomain: "life-point-staff-database.firebaseapp.com",
  projectId: "life-point-staff-database",
  storageBucket: "life-point-staff-database.firebasestorage.app",
  messagingSenderId: "1056473087719",
  appId: "1:1056473087719:web:56ff79cdd0c9c46d6bec42"
};

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  const form = document.querySelector("#exampleModal form");
  const tableBody = document.querySelector("#staffTableBody");
  
  
  // ===============================
// 🔒 BLOCK NUMBERS IN STAFF NAME
// ===============================
const staffNameInput = document.getElementById("staffname");
if (staffNameInput) {
  staffNameInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });
}

// ===============================
// 📅 BLOCK FUTURE DATE (DATE ADDED)
// ===============================
const dateAddedInput = document.getElementById("dateadded");
if (dateAddedInput) {
  const today = new Date().toISOString().split("T")[0];
  dateAddedInput.setAttribute("max", today);
}

// ===============================
// 🔒 STAFF ROLE - TEXT ONLY
// ===============================
const staffRoleInput = document.getElementById("staffrole");
if (staffRoleInput) {
  staffRoleInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });
}

// ===============================
// 📧 EMAIL FORMAT VALIDATION
// ===============================
const emailInput = document.getElementById("emailaddress");
if (emailInput) {
  emailInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-z0-9@._-]/g, "");
  });
}

// ===============================
// 🔒 CLASS TAKEN - TEXT + MAX 2 NUMBERS
// ===============================
const classTakenInput = document.getElementById("classtaken");

if (classTakenInput) {
  classTakenInput.addEventListener("input", function () {
    // Remove invalid characters (only letters, numbers, space)
    this.value = this.value.replace(/[^A-Za-z0-9\s]/g, "");

    // Limit numbers to max 2 digits total
    const numbers = this.value.match(/\d/g);
    if (numbers && numbers.length > 2) {
      let count = 0;
      this.value = this.value.replace(/\d/g, (digit) => {
        count++;
        return count <= 2 ? digit : "";
      });
    }
  });
}


  // 🧾 Add New Staff
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.querySelector('input[placeholder="Enter Staff Name"]').value.trim();
    const dateAdded = form.querySelector('input[type="date"]').value;
    const role = form.querySelector('input[placeholder="English Teacher"]').value.trim();
    const email = form.querySelector('input[placeholder="Staff-email@gmail.com"]').value.trim();
    const classTaken = form.querySelector('input[placeholder="Enter Class Taken"]').value.trim();
    const status = form.querySelector('input[name="status"]:checked') 
                  ? form.querySelector('input[name="status"]:checked').value
                  : 'Active';

    if (!name || !dateAdded || !role || !email || !classTaken) {
      showNotification("⚠️ Please fill in all fields before saving.");
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const staffId = `${name.replace(/\s+/g, '').toLowerCase()}-${randomNum}`;

    const staffData = {
      staffId,
      name,
      dateAdded,
      role,
      email,
      classTaken,
      status,
      createdAt: new Date().toISOString()
    };

    try {
      await set(ref(db, "Staffs/" + staffId), staffData);
      showNotification("✅ Staff added successfully!");
      form.reset();
      const modal = bootstrap.Modal.getInstance(document.getElementById("exampleModal"));
      modal.hide();
    } catch (error) {
      showNotification("❌ Error saving staff: " + error.message);
    }
  });

  // 📡 Display Staff List
  function loadStaffs() {
    const staffsRef = ref(db, "Staffs");
    onValue(staffsRef, (snapshot) => {
      tableBody.innerHTML = "";
      if (!snapshot.exists()) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No staff found</td></tr>`;
        return;
      }

      let count = 1;
      snapshot.forEach((child) => {
        const data = child.val();
        const row = `
          <tr data-id="${data.staffId}">
            <td>${count++}</td>
            <td>${data.name}</td>
            <td>${data.role}</td>
            <td>${data.classTaken}</td>
            <td class="text-center">
              <span class="badge bg-${data.status === 'Active' ? 'success' : 'danger'}">${data.status}</span>
            </td>
            <td class="text-center">
              <button class="btn btn-sm btn-danger deleteBtn">Delete</button>
            </td>
          </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row);
      });

      attachDeleteHandlers();
    });
  }

  // 🗑️ Delete Functionality (with Modal)
  let currentDeleteId = null;

  function attachDeleteHandlers() {
    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const row = btn.closest("tr");
        currentDeleteId = row.getAttribute("data-id");
        const modal = new bootstrap.Modal(document.getElementById("deleteModal"));
        modal.show();
      });
    });
  }

  document.getElementById("confirmDelete").addEventListener("click", async () => {
    if (!currentDeleteId) return;

    try {
      await remove(ref(db, "Staffs/" + currentDeleteId));
      showNotification("🗑️ Staff deleted successfully!");
      const modal = bootstrap.Modal.getInstance(document.getElementById("deleteModal"));
      modal.hide();
      currentDeleteId = null;
    } catch (error) {
      showNotification("❌ Error deleting staff: " + error.message);
    }
  });

  // 🔔 Notification Modal
  function showNotification(message) {
    document.getElementById("notificationMessage").textContent = message;
    const modal = new bootstrap.Modal(document.getElementById("notificationModal"));
    modal.show();
    setTimeout(() => modal.hide(), 3000);
  }

  // 🚀 Load data when page loads
  loadStaffs();