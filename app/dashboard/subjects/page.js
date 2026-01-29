"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { 
  FaChartLine, FaLanguage, FaCalculator, FaScaleBalanced, 
  FaBriefcase, FaBookOpen, FaArrowsRotate, FaGavel, FaGlobe, FaArrowRight 
} from "react-icons/fa6";

export default function SubjectsPage() {
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(2);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // هيكل المواد لكل السنين
  const allSubjects = {
    year1: {
      sem1: ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"],
      sem2: ["محاسبة الشركات", "القانون التجاري", "اقتصاد كلي", "لغة إنجليزية تخصصية", "إدارة التنظيم"]
    },
    year2: { sem1: ["مادة تجريبية"], sem2: [] },
    year3: { sem1: [], sem2: [] },
    year4: { sem1: [], sem2: [] }
  };

  const subjects = allSubjects[`year${year}`][`sem${semester}`] || [];

  // الألوان الأصلية لكل مادة كما في الصورة
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

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const q = query(collection(db, "materials"), where("status", "==", "approved"));
        const snapshot = await getDocs(q);
        const newStats = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          const sub = data.subject;
          const type = data.type; // ملخص أو تكليف
          if (!newStats[sub]) newStats[sub] = { summary: 0, assignment: 0 };
          if (["summary", "ملخص"].includes(type)) newStats[sub].summary++;
          if (["assignment", "تكليف"].includes(type)) newStats[sub].assignment++;
        });
        setStats(newStats);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    fetchStats();
  }, [year, semester]);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white p-6 font-sans overflow-x-hidden" dir="rtl">
      
      {/* هيدر التحكم العلوي */}
      <div className="max-w-7xl mx-auto mb-12 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/5 pb-6">
           <div className="flex gap-2 bg-white/5 p-1 rounded-2xl">
              {[1, 2, 3, 4].map(y => (
                <button key={y} onClick={() => setYear(y)} 
                  className={`px-6 py-2 rounded-xl font-black transition-all ${year === y ? 'bg-purple-600 shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                  فرقة {y}
                </button>
              ))}
           </div>
           <button onClick={() => setSemester(semester === 1 ? 2 : 1)} 
             className="bg-white/5 border border-white/10 px-8 py-2 rounded-xl font-black flex items-center gap-2 hover:bg-white/10 transition-all">
             <FaArrowsRotate className="text-purple-500" /> ترم {semester === 1 ? "أول" : "ثاني"}
           </button>
        </div>

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-2 italic">المواد الدراسية</h1>
          <p className="text-gray-500 font-bold tracking-widest uppercase">اختر المادة لعرض المحتوى</p>
        </div>
      </div>

      {/* شبكة الكروت: التصميم المطلوب */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {subjects.map((sub) => (
          <Link href={`/dashboard/materials?subject=${encodeURIComponent(sub)}`} key={sub}>
            <div className="group relative bg-[#151515] border border-white/5 rounded-[2.5rem] p-10 hover:bg-[#1a1a1a] transition-all duration-300 hover:-translate-y-2 cursor-pointer shadow-2xl overflow-hidden">
              
              <div className="flex flex-col items-center text-center space-y-6">
                {/* الأيقونة في دائرة كما في الصورة */}
                <div className={`w-20 h-20 rounded-full bg-black/40 flex items-center justify-center text-4xl shadow-inner border border-white/5 ${subjectColors[sub]}`}>
                  {getSubjectIcon(sub)}
                </div>

                <h3 className="text-2xl font-black group-hover:text-purple-400 transition-colors">
                  {sub}
                </h3>

                {/* عدادات الملخصات والتكاليف */}
                <div className="flex items-center gap-3">
                   <div className="bg-black/30 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 flex items-center gap-2 border border-white/5">
                      <span>📚 {stats[sub]?.summary || 0} ملخص</span>
                   </div>
                   <div className="bg-black/30 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 flex items-center gap-2 border border-white/5">
                      <span>📝 {stats[sub]?.assignment || 0} تكليف</span>
                   </div>
                </div>
              </div>

              {/* تأثير خلفي خفيف بلون المادة */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-600/5 rounded-full blur-[60px] group-hover:bg-purple-600/10 transition-all"></div>
            </div>
          </Link>
        ))}
      </div>

      {subjects.length === 0 && !loading && (
        <div className="text-center py-40 opacity-20">
          <FaBookOpen size={80} className="mx-auto mb-4" />
          <h2 className="text-2xl font-black italic uppercase">قريباً.. مواد هذه الفرقة</h2>
        </div>
      )}
    </div>
  );
}
