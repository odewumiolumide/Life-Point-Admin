// result-save.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, update, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔥 Firebase Config for Result Database
const firebaseConfig = {
 apiKey: "AIzaSyA8KCmHnEYbXhfdx6pL9T9dAXl62zxb6kA",
  authDomain: "life-point-result-database.firebaseapp.com",
  projectId: "life-point-result-database",
  storageBucket: "life-point-result-database.firebasestorage.app",
  messagingSenderId: "165300965879",
  appId: "1:165300965879:web:5e9c519c1aadaa112adef2"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/**
 * ✅ Save or update student result (edit-friendly)
 * - Allows save, edit, and re-save
 * - Overwrites existing subject data cleanly
 * - No readonly locking needed
 */
export async function saveResult(studentID, term, resultData) {
  if (!studentID || !term || !resultData) {
    console.error("❌ Missing required parameters for saveResult");
    return { success: false, message: "Missing required data" };
  }

  try {
    const { subjects, ...generalInfo } = resultData;

    // 🔹 Save / update general info (overwrites safely)
    const termRef = ref(db, `Results/${studentID}/${term}`);
    await update(termRef, generalInfo);

    // 🔹 Save / overwrite subjects
    if (Array.isArray(subjects)) {
      for (const sub of subjects) {
        if (!sub.subject) continue;

        const subName = sub.subject.trim();
        const subRef = ref(db, `Results/${studentID}/${term}/Subjects/${subName}`);

        // 🔥 This overwrites old data when editing
        await set(subRef, sub);
      }
    }

    console.log(`✅ Result saved / updated for ${studentID} (${term})`);
    return { success: true, message: "✅ Result saved successfully!" };

  } catch (error) {
    console.error("🔥 Firebase Save Error:", error);
    return { success: false, message: error.message || "Error saving result" };
  }
}

/**
 * ✅ Save Yearly Summary
 * - Overwrites existing yearly summary if edited
 */
export async function saveYearlySummary(studentID, summaryData) {
  if (!studentID || !summaryData) {
    console.error("❌ Missing required parameters for saveYearlySummary");
    return { success: false, message: "Missing required data" };
  }

  try {
    // Save yearly summary data
    await set(ref(db, `Results/${studentID}/Yearly Summary`), summaryData);
    console.log(`✅ Yearly summary saved successfully for ${studentID}`);
    return { success: true, message: "✅ Yearly summary saved successfully!" };
  } catch (error) {
    console.error("🔥 Firebase Save Error:", error);
    return { success: false, message: "Error saving yearly summary" };
  }
}
