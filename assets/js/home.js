import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
  import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

  // ✅ Firebase Configurations
  const databases = {
    
    students: {
      config: {
         apiKey: "AIzaSyBVomKLva7Qw4da7ksHlGQ4AqElxujjC5g",
  authDomain: "damotak-classes-database.firebaseapp.com",
  projectId: "damotak-classes-database",
  storageBucket: "damotak-classes-database.firebasestorage.app",
  messagingSenderId: "642680259009",
  appId: "1:642680259009:web:6070722888eac763cfef40"
      },
      node: "Students"
    },
    staff: {
      config: {
          apiKey: "AIzaSyCiy2VaTfnuO7eEPL0_kD_WIHcDMB2T6Xs",
  authDomain: "damotak-international-da-230d5.firebaseapp.com",
  projectId: "damotak-international-da-230d5",
  storageBucket: "damotak-international-da-230d5.firebasestorage.app",
  messagingSenderId: "947496867501",
  appId: "1:947496867501:web:36076fcbcaf2c39ca2d824"
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