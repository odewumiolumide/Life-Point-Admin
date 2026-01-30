import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
  import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

  // ✅ Firebase Configurations
  const databases = {
    
    students: {
      config: {
        apiKey: "AIzaSyDfsck2-qqK0QJNzUlUqGR3cUQlFgGQnxs",
  authDomain: "life-point-student-database.firebaseapp.com",
  projectId: "life-point-student-database",
  storageBucket: "life-point-student-database.firebasestorage.app",
  messagingSenderId: "1057001618683",
  appId: "1:1057001618683:web:4afc757f33b37ba2af045e"
      },
      node: "Students"
    },
    staff: {
      config: {
          apiKey: "AIzaSyD7pin-JUBBqUI-KiNtTCyGTSFOHL6rE1U",
  authDomain: "life-point-staff-database.firebaseapp.com",
  projectId: "life-point-staff-database",
  storageBucket: "life-point-staff-database.firebasestorage.app",
  messagingSenderId: "1056473087719",
  appId: "1:1056473087719:web:56ff79cdd0c9c46d6bec42"
      },
      node: "Staffs"
    }
  };

  // ✅ Initialize Firebase Apps
  
  const studentApp = initializeApp(databases.students.config, "studentApp");
  const staffApp = initializeApp(databases.staff.config, "staffApp");

 
  const studentDB = getDatabase(studentApp);
  const staffDB = getDatabase(staffApp);

  // ✅ Get DOM Elements
 
  const studentCount = document.getElementById("studentCount");
  const staffCount = document.getElementById("staffCount");
  const resultCount = document.getElementById("resultCount");

 

  onValue(ref(studentDB, "Students"), (snapshot) => {
    if (snapshot.exists()) {
      const students = Object.values(snapshot.val());
      const active = students.filter(s => s.status === "Active" || s.active === true).length;
      studentCount.textContent = active;
      resultCount.textContent = active; // ✅ Results = number of active students
    } else {
      studentCount.textContent = 0;
      resultCount.textContent = 0;
    }
  });

  onValue(ref(staffDB, "Staffs"), (snapshot) => {
    if (snapshot.exists()) {
      const staff = Object.values(snapshot.val());
      const active = staff.filter(s => s.status === "Active" || s.active === true).length;
      staffCount.textContent = active;
    } else {
      staffCount.textContent = 0;
    }
  });