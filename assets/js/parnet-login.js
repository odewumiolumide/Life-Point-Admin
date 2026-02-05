import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

/* =========================
   STUDENT DATABASE
========================= */
const studentApp = initializeApp({
  apiKey: "AIzaSyDfsck2-qqK0QJNzUlUqGR3cUQlFgGQnxs",
  databaseURL: "https://life-point-student-database-default-rtdb.firebaseio.com"
}, "students");

/* =========================
   RESULT DATABASE
========================= */
const resultApp = initializeApp({
  apiKey: "AIzaSyA8KCmHnEYbXhfdx6pL9T9dAXl62zxb6kA",
  databaseURL: "https://life-point-result-database-default-rtdb.firebaseio.com"
}, "results");

const studentDb = getDatabase(studentApp);
const resultDb  = getDatabase(resultApp);

window.loginParent = async function () {
  const btn = document.getElementById("btn");
  btn.disabled = true;
  btn.textContent = "Checking...";

  const studentID = document.getElementById("studentID").value.trim();
  const studentClass = document.getElementById("studentClass").value.trim();
  const term = document.getElementById("term").value;
  const pin = document.getElementById("pin").value.trim();

  if (!studentID || !studentClass || !term || !pin) {
    alert("Please fill all fields");
    resetBtn();
    return;
  }

  try {
    // 1️⃣ Student check
    const stuSnap = await get(ref(studentDb, `Students/${studentID}`));
    if (!stuSnap.exists()) throw new Error("Invalid Student ID");

    const student = { studentID, ...stuSnap.val() };

    if (student.studentClass !== studentClass)
      throw new Error("Student class does not match");

    // 2️⃣ PIN check (class + term)
    const pinRef = ref(resultDb, `ClassPins/${term}/${studentClass}`);
    const pinSnap = await get(pinRef);

    if (!pinSnap.exists())
      throw new Error("PIN not set for this class and term");

    if (pinSnap.val().pin !== pin)
      throw new Error("Incorrect PIN");

    // 3️⃣ Result check
    const resultRef = ref(resultDb, `Results/${studentID}/${term}`);
    const resultSnap = await get(resultRef);

    if (!resultSnap.exists())
      throw new Error("Result not yet available");

    // 4️⃣ Save session
    sessionStorage.setItem("studentData", JSON.stringify(student));
    sessionStorage.setItem("resultData", JSON.stringify(resultSnap.val()));
    sessionStorage.setItem("selectedTerm", term);

    window.location.href = "parent-result.html";

  } catch (err) {
    alert(err.message);
    resetBtn();
  }
};

function resetBtn(){
  const btn = document.getElementById("btn");
  btn.disabled = false;
  btn.textContent = "View Result";
}