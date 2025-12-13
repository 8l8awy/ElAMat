"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [view, setView] = useState("home"); // home, subjects, materials, myUploads
  const [materials, setMaterials] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(null);

  // جلب البيانات (Effect بدلاً من loadDashboard)
  useEffect(() => {
    if (view === "home") {
        // fetch stats...
    }
  }, [view]);

  if (loading) return <div>جاري التحميل...</div>;
  if (!user) return <div>يجب تسجيل الدخول</div>;

  return (
    <div className="container">
      <Navbar setView={setView} user={user} />
      
      {view === "home" && (
        <div id="homePage">
           <h2 className="page-title">لوحة المعلومات</h2>
           {/* مكون StatsGrid */}
           <div className="stats-grid">...</div>
        </div>
      )}

      {view === "subjects" && (
        <div className="subjects-grid">
            {/* Loop through subjects */}
            {["مبادئ الاقتصاد", "..."].map(sub => (
                <div key={sub} onClick={() => { setCurrentSubject(sub); setView("materials"); }} className="subject-card">
                    <h3>{sub}</h3>
                </div>
            ))}
        </div>
      )}

      {view === "materials" && (
          // عرض المواد للمادة المختارة
          <MaterialsList subject={currentSubject} />
      )}

    </div>
  );
}
