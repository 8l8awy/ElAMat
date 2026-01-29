"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { 
  FaChartLine, FaLanguage, FaCalculator, FaScaleBalanced, 
  FaBriefcase, FaBookOpen, FaArrowsRotate, FaGavel, FaGlobe 
} from "react-icons/fa6";

export default function SubjectsPage() {
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(2);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // هيكل المواد لكل السنين (تأكد من مطابقة الأسماء لما ترفعه في الـ Admin)
  const allSubjects = {
    year1: {
      sem1: ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"],
      sem2: ["محاسبة الشركات", "القانون التجاري", "اقتصاد كلي", "لغة إنجليزية تخصصية", "إدارة التنظيم"]
    },
    year2: { 
      sem1: ["مادة تجريبية"], 
      sem2: [] 
    },
    year3: { sem1: [], sem2: [] },
    year4: { sem1: [], sem2: [] }
  };

  const subjects = allSubjects[`year${year}`][`sem${semester}`] || [];

  // الألوان الأصلية
  const subjectColors = {
    "مبادئ الاقتصاد": "text-blue-400",
    "لغة اجنبية (1)": "text-purple-400",
    "مبادئ المحاسبة المالية": "text-green-400",
    "مبادئ القانون": "text-red-400",
    "مبادئ ادارة الاعمال": "text-orange-400",
    "محاسبة الشركات": "text-green-400",
    "القانون التجاري": "text-red-400",
    "اقتصاد كلي": "text-blue-400",
    "لغة إنجليزية تخصصية": "text-purple-400",
    "إدارة التنظيم": "text-orange-400"
  };

  const getSubjectIcon = (subject) => {
    const icons = {
      "مبادئ الاقتصاد": <FaChartLine />,
      "لغة اجنبية (1)": <FaLanguage />,
      "مبادئ المحاسبة المالية": <FaCalculator />,
      "مبادئ القانون": <FaScaleBalanced />,
      "مبادئ ادارة الاعمال": <FaBriefcase />,
      "محاسبة الشركات": <FaCalculator />,
      "القانون التجاري": <FaGavel />,
      "اقتصاد كلي": <FaChartLine />,
      "لغة إنجليزية تخصصية": <FaGlobe />,
      "إدارة التنظيم": <FaBriefcase />
    };
    return icons[subject] || <FaBookOpen />;
  };

  // 🛡️ دالة جلب البيانات والعدادات (معدلة لحل مشكلة الاختفاء)
  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // جلب كل المواد المعتمدة
        const q = query(collection(db, "materials"), where("status", "==", "approved"));
        const snapshot = await getDocs(q);
        const newStats = {};

        snapshot.forEach(doc => {
          const data = doc.data();
          
          // الفلترة بالفرقة والترم المختارين
          if (data.year === year && data.semester === semester) {
            const sub = data.subject;
            const type = data.type; 

            if (!newStats[sub]) newStats[sub] = { summary: 0, assignment: 0 };
            
            // قراءة الأنواع (سواء بالعربي أو الإنجليزي)
            if (["summary", "ملخص"].includes(type)) newStats[sub].summary++;
            if (["assignment", "تكليف"].includes(type)) newStats[sub].assignment++;
          }
        });

        setStats(newStats);
      } catch (err) { 
        console.error("Firebase Connection Error:", err); 
      }
      setLoading(false);
    }
    fetchStats();
  }, [year, semester]);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white p-6 font-sans overflow-x-hidden" dir="rtl">
      
      {/* هيدر التحكم العلوي */}
      <div className="max-w-7xl mx-auto mb-12 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/5 pb-6">
           <div className="flex gap-2 bg-white/5 p-1 rounded-2xl w-fit">
              {[1, 2, 3, 4].map(y => (
                <button key={y} onClick={() => setYear(y)} 
                  className={`px-6 py-2 rounded-xl font-black transition-all ${year === y ? 'bg-purple-600 shadow-lg scale-105' : 'text-gray-500 hover:text-white'}`}>
                  فرقة {y}
                </button>
              ))}
           </div>
           
           <button onClick={() => setSemester(semester === 1 ? 2 : 1)} 
             className="w-fit group bg-white/5 border border-white/10 px-8 py-2.5 rounded-xl font-black flex items-center gap-3 hover:bg-white/10 transition-all active:scale-95 shadow-xl">
             <FaArrowsRotate className={`text-purple-500 transition-transform duration-700 group-hover:rotate-[360deg]`} /> 
             <span>ترم {semester === 1 ? "أول" : "ثاني"}</span>
           </button>
        </div>

        <div className="text-center pt-4">
          <h1 className="text-4xl md:text-6xl font-black mb-2 italic tracking-tighter">المواد الدراسية</h1>
          <p className="text-gray-500 font-bold tracking-[0.3em] uppercase text-xs">Academic Materials Portal</p>
        </div>
      </div>

      {/* شبكة الكروت المحدثة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {subjects.map((sub) => (
          <Link href={`/dashboard/materials?subject=${encodeURIComponent(sub)}`} key={sub}>
            <div className="group relative bg-[#121212] border border-white/5 rounded-[2.5rem] p-12 hover:bg-[#181818] transition-all duration-500 hover:-translate-y-3 cursor-pointer shadow-2xl overflow-hidden">
              
              <div className="flex flex-col items-center text-center space-y-8 relative z-10">
                {/* الأيقونة الدائرية */}
                <div className={`w-24 h-24 rounded-full bg-black/50 flex items-center justify-center text-5xl shadow-2xl border border-white/5 transition-transform duration-500 group-hover:scale-110 ${subjectColors[sub] || 'text-white'}`}>
                  {getSubjectIcon(sub)}
                </div>

                <h3 className="text-3xl font-black tracking-tight group-hover:text-purple-400 transition-colors duration-500">
                  {sub}
                </h3>

                {/* العدادات الذكية */}
                <div className="flex items-center gap-4">
                   <div className="bg-black/40 px-5 py-2.5 rounded-2xl text-[13px] font-black text-gray-400 flex items-center gap-2 border border-white/5 shadow-inner">
                      <span className="text-green-500">📚</span> {stats[sub]?.summary || 0} ملخص
                   </div>
                   <div className="bg-black/40 px-5 py-2.5 rounded-2xl text-[13px] font-black text-gray-400 flex items-center gap-2 border border-white/5 shadow-inner">
                      <span className="text-orange-500">📝</span> {stats[sub]?.assignment || 0} تكليف
                   </div>
                </div>
              </div>

              {/* تأثير التوهج الملون خلف الكارت */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at center, purple, transparent 70%)` }}></div>
            </div>
          </Link>
        ))}
      </div>

      {/* لو مفيش مواد */}
      {subjects.length === 0 && !loading && (
        <div className="text-center py-48 opacity-20 flex flex-col items-center">
          <FaBookOpen size={100} className="mb-6 animate-pulse" />
          <h2 className="text-3xl font-black italic uppercase tracking-widest text-gray-400">قريباً.. جاري تحضير مواد الفرقة {year}</h2>
        </div>
      )}
    </div>
  );
}
