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
        // 1. جلب عدد الطلاب
        const usersSnap = await getDocs(collection(db, "users"));
        const codesSnap = await getDocs(collection(db, "allowedCodes"));
        const usersCount = usersSnap.size + codesSnap.size;

        // 2. جلب إحصائيات المواد (الترم الثاني فقط كمثال للترم الحالي)
        const materialsQuery = query(
            collection(db, "materials"), 
            where("status", "==", "approved"),
            where("semester", "==", 2) // عرض إحصائيات الترم الحالي فقط
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto" dir="rtl">
        {/* الترحيب */}
        <div className="mb-10">
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                لوحة <span className="text-purple-500">المعلومات</span>
            </h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">أهلاً بك مجدداً، {user?.name || "طالبنا العزيز"}</p>
        </div>
        
        {/* شبكة الإحصائيات - التصميم الجديد */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all"></div>
            <h3 className="text-3xl font-black text-white mb-1">{stats.users}</h3>
            <p className="text-gray-500 text-sm flex items-center gap-2">
                <FaUsers className="text-purple-500" /> الطلاب
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <h3 className="text-3xl font-black text-white mb-1">{stats.summaries}</h3>
            <p className="text-gray-500 text-sm flex items-center gap-2">
                <FaFileAlt className="text-purple-500" /> ملخصات
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <h3 className="text-3xl font-black text-white mb-1">{stats.assignments}</h3>
            <p className="text-gray-500 text-sm flex items-center gap-2">
                <FaClipboardList className="text-purple-500" /> تكاليف
            </p>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <h3 className="text-3xl font-black text-white mb-1">{stats.total}</h3>
            <p className="text-gray-500 text-sm flex items-center gap-2">
                <FaLayerGroup className="text-purple-500" /> الإجمالي
            </p>
          </div>
        </div>

        {/* قسم الإعلانات - التصميم الزجاجي */}
        <div className="mt-12"> 
          <div className="flex items-center gap-3 mb-6">
            <FaBullhorn className="text-purple-500 text-2xl" />
            <h3 className="text-2xl font-black text-white">آخر الإعلانات</h3>
          </div>
          
          <div className="grid gap-4">
            {announcements.length === 0 ? (
              <div className="bg-[#0a0a0a] border border-dashed border-white/10 p-10 rounded-[2rem] text-center text-gray-500">
                لا توجد إعلانات حالياً
              </div>
            ) : (
              announcements.map(ann => (
                <div key={ann.id} className="bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] hover:bg-white/10 transition-all group">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{ann.title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">{ann.content}</p>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 bg-black/50 px-3 py-1 rounded-full border border-white/5 self-start md:self-center">
                      {new Date(ann.date).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
    </div>
  );
}
