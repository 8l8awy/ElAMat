"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
// استخدام مكتبة الأيقونات التي قمنا بتثبيتها
import { FaUsers, FaFileAlt, FaClipboardList, FaLayerGroup } from "react-icons/fa"; 

export default function Dashboard() {
  const { user } = useAuth();
  // حالة لحفظ الإحصائيات
  const [stats, setStats] = useState({ users: 0, summaries: 0, assignments: 0, total: 0 });
  // حالة لحفظ الإعلانات
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // دالة مساعدة لتوحيد أنواع الملفات (نفس المنطق من الكود القديم)
  const normalizeType = (type) => {
    if (!type) return "";
    type = type.toString().trim();
    const summaryList = ["summary", "ملخص", "ملخصات", "تلخيص"];
    const assignmentList = ["assignment", "تكليف", "تكاليف", "واجب"];
    if (summaryList.includes(type)) return "summary";
    if (assignmentList.includes(type)) return "assignment";
    return type;
  };

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        // 1. جلب عدد الطلاب (المسجلين + الأكواد المسموحة)
        const usersSnap = await getDocs(collection(db, "users"));
        const codesSnap = await getDocs(collection(db, "allowedCodes"));
        const usersCount = usersSnap.size + codesSnap.size;

        // 2. جلب إحصائيات المواد (الملخصات والتكاليف)
        const materialsQuery = query(collection(db, "materials"), where("status", "==", "approved"));
        const materialsSnap = await getDocs(materialsQuery);
        
        let summariesCount = 0;
        let assignmentsCount = 0;

        materialsSnap.forEach((doc) => {
           const type = normalizeType(doc.data().type);
           if (type === "summary") summariesCount++;
           if (type === "assignment") assignmentsCount++;
        });

        setStats({
          users: usersCount,
          summaries: summariesCount,
          assignments: assignmentsCount,
          total: materialsSnap.size
        });

        // 3. جلب آخر 3 إعلانات
        const annQuery = query(collection(db, "announcements"), orderBy("date", "desc"), limit(3));
        const annSnap = await getDocs(annQuery);
        const annList = annSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAnnouncements(annList);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) return <div style={{textAlign: 'center', padding: '50px', color: '#fff'}}>جاري تحميل البيانات...</div>;

  return (
    <div id="homePage">
        <h2 className="page-title" style={{ color: 'white', fontSize: '2.5em', margin: '30px 0', fontWeight: '900' }}>لوحة المعلومات</h2>
        
        {/* شبكة الإحصائيات */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.users}</h3>
            <p><FaUsers style={{marginLeft:'8px', display:'inline'}}/> الطلاب</p>
          </div>
          <div className="stat-card">
            <h3>{stats.summaries}</h3>
            <p><FaFileAlt style={{marginLeft:'8px', display:'inline'}}/> ملخصات</p>
          </div>
          <div className="stat-card">
            <h3>{stats.assignments}</h3>
            <p><FaClipboardList style={{marginLeft:'8px', display:'inline'}}/> تكاليف</p>
          </div>
          <div className="stat-card">
            <h3>{stats.total}</h3>
            <p><FaLayerGroup style={{marginLeft:'8px', display:'inline'}}/> الإجمالي</p>
          </div>
        </div>

        {/* قسم الإعلانات الأخيرة */}
        <div className="admin-panel" style={{marginTop: '40px'}}> 
          <h3 style={{color: '#fff', fontSize: '2em', marginBottom: '20px', fontWeight: '800'}}>الإعلانات الأخيرة</h3>
          
          <div id="recentAnnouncements">
            {announcements.length === 0 ? (
              <p style={{color:'#94a3b8', textAlign:'center'}}>لا توجد إعلانات</p>
            ) : (
              announcements.map(ann => (
                <div key={ann.id} style={{
                    background:'#1a1a1a', // لون خلفية داكن يناسب التصميم
                    padding:'20px', 
                    borderRadius:'15px', 
                    marginBottom:'15px', 
                    border: '1px solid #333'
                }}>
                  <h4 style={{fontSize:'1.2em', marginBottom:'8px', color:'#fff', fontWeight:'700'}}>{ann.title}</h4>
                  <p style={{fontSize:'1em', marginBottom:'10px', color:'#ccc', lineHeight: '1.6'}}>{ann.content}</p>
                  <span style={{display:'block', fontSize:'0.9em', color:'#666', textAlign:'left', direction: 'ltr'}}>
                    {new Date(ann.date).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
  );
}

