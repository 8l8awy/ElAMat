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
  const [currentSemester, setCurrentSemester] = useState(2); // يبدأ بالترم الثاني تلقائياً
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // مواد الترم الأول
  const semester1Subjects = [
    "مبادئ الاقتصاد",
    "لغة اجنبية (1)",
    "مبادئ المحاسبة المالية",
    "مبادئ القانون",
    "مبادئ ادارة الاعمال"
  ];

  // مواد الترم الثاني (ضيف أو عدل الأسامي هنا براحتك)
  const semester2Subjects = [
    "محاسبة الشركات",
    "القانون التجاري",
    "اقتصاد كلي",
    "لغة إنجليزية تخصصية",
    "إدارة التنظيم"
  ];

  const subjects = currentSemester === 1 ? semester1Subjects : semester2Subjects;

  const subjectColors = {
    // ألوان الترم الأول
    "مبادئ الاقتصاد": "from-blue-500 to-cyan-500",
    "لغة اجنبية (1)": "from-purple-500 to-pink-500",
    "مبادئ المحاسبة المالية": "from-green-500 to-emerald-500",
    "مبادئ القانون": "from-red-500 to-rose-500",
    "مبادئ ادارة الاعمال": "from-orange-500 to-yellow-500",
    // ألوان الترم الثاني
    "محاسبة الشركات": "from-emerald-500 to-teal-500",
    "القانون التجاري": "from-rose-600 to-red-400",
    "اقتصاد كلي": "from-blue-600 to-indigo-400",
    "لغة إنجليزية تخصصية": "from-purple-600 to-violet-400",
    "إدارة التنظيم": "from-amber-500 to-orange-400"
  };

  const getSubjectIcon = (subject) => {
    const icons = {
        "مبادئ الاقتصاد": <FaChartLine className="text-5xl text-blue-400" />,
        "لغة اجنبية (1)": <FaLanguage className="text-5xl text-purple-400" />,
        "مبادئ المحاسبة المالية": <FaCalculator className="text-5xl text-green-400" />,
        "مبادئ القانون": <FaScaleBalanced className="text-5xl text-red-400" />,
        "مبادئ ادارة الاعمال": <FaBriefcase className="text-5xl text-orange-400" />,
        // أيقونات الترم الثاني
        "محاسبة الشركات": <FaCalculator className="text-5xl text-emerald-400" />,
        "القانون التجاري": <FaGavel className="text-5xl text-rose-400" />,
        "اقتصاد كلي": <FaChartLine className="text-5xl text-blue-400" />,
        "لغة إنجليزية تخصصية": <FaGlobe className="text-5xl text-purple-400" />,
        "إدارة التنظيم": <FaBriefcase className="text-5xl text-amber-400" />
    };
    return icons[subject] || <FaBookOpen className="text-5xl text-gray-400" />;
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
      setLoading(true);
      try {
        const q = query(collection(db, "materials"), where("status", "==", "approved"));
        const snapshot = await getDocs(q);
        
        const newStats = {};
        // تهيئة الإحصائيات لكل المواد (الأول والثاني) لضمان عدم وجود أخطاء
        [...semester1Subjects, ...semester2Subjects].forEach(sub => {
          newStats[sub] = { summary: 0, assignment: 0 };
        });

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
  }, [currentSemester]); // التحديث عند تغيير الترم

  return (
    <div className="min-h-screen w-full text-white p-4 font-sans relative" dir="rtl">
      
      {/* زر السويتش العائم */}
      <div className="flex justify-center mb-10 pt-6">
        <button 
          onClick={() => setCurrentSemester(currentSemester === 1 ? 2 : 1)}
          className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl hover:bg-purple-600 transition-all duration-500 group shadow-xl"
        >
          <FaArrowsRotate className={`text-purple-400 group-hover:text-white transition-transform duration-700 ${currentSemester === 2 ? 'rotate-180' : ''}`} />
          <span className="font-black text-lg">عرض مواد الترم {currentSemester === 1 ? 'الثاني' : 'الأول'}</span>
        </button>
      </div>

      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-purple-300 to-gray-500 bg-clip-text text-transparent mb-4">
           مواد الترم {currentSemester === 1 ? 'الأول' : 'الثاني'}
        </h1>
        <div className="h-1 w-32 bg-purple-600 mx-auto rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1400px] mx-auto">
        {subjects.map((subject) => (
          <Link 
            href={`/dashboard/materials?subject=${encodeURIComponent(subject)}`} 
            key={subject} 
            className="w-full"
          >
            <div className="group relative h-full bg-[#0a0a0a]/60 hover:bg-white/5 backdrop-blur-xl border border-white/5 hover:border-purple-500/40 rounded-[2.5rem] p-10 transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer shadow-2xl">
              
              <div className={`absolute inset-0 bg-gradient-to-br ${subjectColors[subject] || "from-gray-500 to-gray-700"} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8">
                
                <div className="w-28 h-28 rounded-3xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/10 shadow-2xl">
                   {getSubjectIcon(subject)}
                </div>
                
                <h3 className="text-3xl font-black text-white group-hover:text-purple-300 transition-colors leading-tight">
                  {subject}
                </h3>
                
                <div className="flex items-center justify-center gap-4 w-full">
                  <div className="bg-white/5 px-5 py-3 rounded-2xl text-sm font-bold text-gray-300 flex items-center gap-2 border border-white/5 group-hover:border-purple-500/30 transition-all">
                    <span className="text-blue-400">📚</span>
                    <span>{stats[subject]?.summary || 0} ملخص</span>
                  </div>
                  <div className="bg-white/5 px-5 py-3 rounded-2xl text-sm font-bold text-gray-300 flex items-center gap-2 border border-white/5 group-hover:border-purple-500/30 transition-all">
                    <span className="text-yellow-400">📝</span>
                    <span>{stats[subject]?.assignment || 0} تكليف</span>
                  </div>
                </div>

              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
