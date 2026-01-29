"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { FaUsers, FaFileAlt, FaClipboardList, FaLayerGroup, FaBullhorn } from "react-icons/fa"; 

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, summaries: 0, assignments: 0, total: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // دالة توحيد الأنواع لضمان دقة الإحصائيات
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
        // 1. جلب عدد الطلاب الكلي
        const usersSnap = await getDocs(collection(db, "users"));
        const codesSnap = await getDocs(collection(db, "allowedCodes"));
        const usersCount = usersSnap.size + codesSnap.size;

        // 2. جلب إحصائيات مواد الترم الثاني فقط (الخطوة الأولى)
        const materialsQuery = query(
            collection(db, "materials"), 
            where("status", "==", "approved"),
            where("semester", "==", 2) 
        );
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

        // 3. جلب آخر 3 إعلانات هامة
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto" dir="rtl">
        {/* قسم الترحيب المخصص */}
        <div className="mb-12">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                لوحة <span className="text-purple-500 text-purple-glow">المعلومات</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] bg-white/5 w-fit px-3 py-1 rounded-full border border-white/5">
                مرحباً بك، {user?.name || "محمد علي"}
            </p>
        </div>
        
        {/* شبكة الإحصائيات الفخمة */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "الطلاب", value: stats.users, icon: <FaUsers />, color: "purple" },
            { label: "ملخصات", value: stats.summaries, icon: <FaFileAlt />, color: "blue" },
            { label: "تكاليف", value: stats.assignments, icon: <FaClipboardList />, color: "purple" },
            { label: "الإجمالي", value: stats.total, icon: <FaLayerGroup />, color: "blue" }
          ].map((stat, index) => (
            <div key={index} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-purple-500/40 transition-all cursor-default">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl group-hover:bg-purple-600/15 transition-all"></div>
              <h3 className="text-3xl font-black text-white mb-1">{stat.value}</h3>
              <p className="text-gray-500 text-xs font-bold flex items-center gap-2">
                  <span className="text-purple-500">{stat.icon}</span> {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* قسم الإعلانات الأنيق */}
        <div className="mt-16"> 
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-600/10 rounded-2xl border border-purple-500/20">
                <FaBullhorn className="text-purple-400 text-xl" />
            </div>
            <h3 className="text-2xl font-black text-white">آخر الإعلانات</h3>
          </div>
          
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="bg-[#0a0a0a] border border-dashed border-white/10 p-12 rounded-[2.5rem] text-center">
                <p className="text-gray-600 font-bold">لا توجد إعلانات نشطة للترم الثاني</p>
              </div>
            ) : (
              announcements.map(ann => (
                <div key={ann.id} className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-7 rounded-[2.5rem] hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                  {/* خط بنفسجي جانبي خفيف */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-500"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div className="flex-1">
                        <h4 className="text-xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors">{ann.title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">{ann.content}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-[10px] font-black text-purple-400 bg-purple-500/10 px-4 py-1.5 rounded-full border border-purple-500/20">
                            {new Date(ann.date).toLocaleDateString("ar-EG")}
                        </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
    </div>
  );
}
