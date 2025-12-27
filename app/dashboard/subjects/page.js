"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { FaChartLine, FaLanguage, FaCalculator, FaScaleBalanced, FaBriefcase, FaBookOpen } from "react-icons/fa6";

export default function SubjectsPage() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // قائمة المواد الثابتة (نفس الموجودة في مشروعك القديم)
  const subjects = [
    "مبادئ الاقتصاد",
    "لغة اجنبية (1)",
    "مبادئ المحاسبة المالية",
    "مبادئ القانون",
    "مبادئ ادارة الاعمال"
  ];

  // دالة لتحديد الأيقونة المناسبة لكل مادة
  const getSubjectIcon = (subject) => {
    const icons = {
        "مبادئ الاقتصاد": <FaChartLine />,         
        "لغة اجنبية (1)": <FaLanguage />,           
        "مبادئ المحاسبة المالية": <FaCalculator />,   
        "مبادئ القانون": <FaScaleBalanced />,      
        "مبادئ ادارة الاعمال": <FaBriefcase />    
    };
    return icons[subject] || <FaBookOpen />;
  };

  const normalizeType = (type) => {
    if (!type) return "";
    type = type.toString().trim();
    if (["summary", "ملخص", "ملخصات", "تلخيص"].includes(type)) return "summary";
    if (["assignment", "تكليف", "تكاليف", "واجب"].includes(type)) return "assignment";
    return type;
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        // جلب كل المواد المعتمدة لحساب الإحصائيات
        const q = query(collection(db, "materials"), where("status", "==", "approved"));
        const snapshot = await getDocs(q);
        
        const newStats = {};
        
        // تهيئة العدادات
        subjects.forEach(sub => newStats[sub] = { summary: 0, assignment: 0 });

        snapshot.forEach(doc => {
          const data = doc.data();
          const sub = data.subject;
          const type = normalizeType(data.type);
          
          if (newStats[sub]) {
            if (type === "summary") newStats[sub].summary++;
            if (type === "assignment") newStats[sub].assignment++;
          }
        });

        setStats(newStats);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) return <div style={{textAlign: 'center', padding: '50px', color: '#fff'}}>جاري تحميل المواد...</div>;

  return (
    <div>
      <h2 className="page-title" style={{ color: 'white', fontSize: '2.5em', margin: '30px 0', fontWeight: '900' }}>المواد الدراسية</h2>
      
      <div className="subjects-grid">
        {subjects.map((subject) => (
          /* عند الضغط على المادة، سننتقل لصفحة تعرض محتواها.
             سنستخدم query params لتمرير اسم المادة.
          */
          <Link 
            href={`/dashboard/materials?subject=${encodeURIComponent(subject)}`} 
            key={subject} 
            className="subject-card"
            style={{textDecoration: 'none', display: 'block'}} // إصلاحات للرابط
          >
            <div className="subject-icon" style={{fontSize: '3.5em', marginBottom: '20px', color: '#fff'}}>
                {getSubjectIcon(subject)}
            </div>
            
            <h3>{subject}</h3>
            
            <div className="subject-stats">
              <span className="stat-badge summary">
                {stats[subject]?.summary || 0} ملخص
              </span>
              <span className="stat-badge assignment">
                {stats[subject]?.assignment || 0} تكليف
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
