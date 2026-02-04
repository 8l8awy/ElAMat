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

  const allSubjects = {
   year1: {
      1: ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"],
      2: ["السلوك التنظيمي", "طرق ومهارات الاتصال", "حقوق الإنسان", "رياضيات الأعمال", "التفكير الابتكاري", "مبادئ علم الاجتماع"]
    },
    year2: { 
      1: ["محاسبة التكاليف", "إدارة التسويق", "إدارة المشتريات", "التنمية المستدامة"], 
      2: ["مبادئ المحاسبة الإدارية", "إدارة الإنتاج والعمليات", "تحليلات الأعمال", "مبادئ الإدارة المالية", "نظم المعلومات الإدارية", "لغة أجنبية (2)"] 
    },
    year3: { 
      1: ["إدارة الجودة", "المالية العامة", "منهج البحث العلمي"], 
      2: [
        "محاسبة إدارية متقدمة", "جداول العمل الإلكترونية", "نظم المعلومات المحاسبية", "الإدارة الاستراتيجية", "اقتصاديات النقود والبنوك", "ريادة الأعمال والمشروعات الصغيرة",
        "إدارة مالية متقدمة (بنوك)", "المحاسبة المتوسطة 2 (بنوك)"
      ] 
    },
    year4: { 
      1: ["إدارة المخاطر", "مراجعة الحسابات", "محاسبة المنشآت المتخصصة"], 
      2: ["إدارة المحافظ المالية والمشتقات", "إدارة الموارد البشرية", "الأعمال الإلكترونية", "الإحصاء التطبيقي", "قواعد البيانات", "مشروع التخرج"] 
    };

  const subjects = allSubjects[`year${year}`][`sem${semester}`] || [];

  const subjectColors = {
    "مبادئ الاقتصاد": "text-blue-400", "لغة اجنبية (1)": "text-purple-400",
    "مبادئ المحاسبة المالية": "text-green-400", "مبادئ القانون": "text-red-400",
    "مبادئ ادارة الاعمال": "text-orange-400", "محاسبة الشركات": "text-green-400",
    "القانون التجاري": "text-red-400", "اقتصاد كلي": "text-blue-400",
    "لغة إنجليزية تخصصية": "text-purple-400", "إدارة التنظيم": "text-orange-400",
    "مادة تجريبية سنة تانية": "text-purple-400"
  };

  const getSubjectIcon = (subject) => {
    const icons = {
      "مبادئ الاقتصاد": <FaChartLine />, "لغة اجنبية (1)": <FaLanguage />,
      "مبادئ المحاسبة المالية": <FaCalculator />, "مبادئ القانون": <FaScaleBalanced />,
      "مبادئ ادارة الاعمال": <FaBriefcase />, "محاسبة الشركات": <FaCalculator />,
      "القانون التجاري": <FaGavel />, "اقتصاد كلي": <FaChartLine />,
      "لغة إنجليزية تخصصية": <FaGlobe />, "إدارة التنظيم": <FaBriefcase />
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
          const itemYear = Number(data.year);
          const itemSem = Number(data.semester);
          const currentYear = Number(year);
          const currentSem = Number(semester);

          if (itemYear === currentYear && itemSem === currentSem) {
            const sub = String(data.subject).trim();
            const type = String(data.type).toLowerCase().trim(); 

            if (!newStats[sub]) newStats[sub] = { summary: 0, assignment: 0 };
            
            if (type.includes("summary") || type.includes("ملخص")) newStats[sub].summary++;
            if (type.includes("assignment") || type.includes("تكليف")) newStats[sub].assignment++;
          }
        });

        setStats(newStats);
      } catch (err) { console.error("Firebase Sync Error:", err); }
      setLoading(false);
    }
    fetchStats();
  }, [year, semester]);

  return (
    // 👇 شلنا الـ p-6 وخليناها متغيرة (px-2 للموبايل و px-10 للكمبيوتر)
    <div className="min-h-screen w-full  text-white px-2 md:px-10 py-6 font-sans overflow-x-hidden" dir="rtl">
      
      {/* هيدر التحكم */}
      <div className="w-full max-w-7xl mx-auto mb-10 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/5 pb-6">
           {/* أزرار الفرق ملمومة أكتر */}
           <div className="flex gap-1.5 bg-white/5 p-1 rounded-2xl w-fit">
              {[1, 2, 3, 4].map(y => (
                <button key={y} onClick={() => setYear(Number(y))} 
                  className={`px-4 md:px-6 py-2 rounded-xl font-black text-sm md:text-base transition-all ${year === y ? 'bg-purple-600 shadow-lg scale-105' : 'text-gray-500'}`}>
                  {y}
                </button>
              ))}
           </div>
           
           <button onClick={() => setSemester(semester === 1 ? 2 : 1)} 
             className="w-fit group bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 active:scale-95 transition-all">
             <FaArrowsRotate className="text-purple-500 group-hover:rotate-[180deg] transition-transform duration-500" /> 
             <span>ترم {semester === 1 ? "أول" : "ثاني"}</span>
           </button>
        </div>

        <div className="text-center pt-2">
          <h1 className="text-3xl md:text-5xl font-black italic">المواد الدراسية</h1>
        </div>
      </div>

      {/* شبكة الكروت: gap-3 للموبايل يخلي المسافات ملمومة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8 w-full max-w-7xl mx-auto pb-20">
        {subjects.map((sub) => (
          <Link href={`/dashboard/materials?subject=${encodeURIComponent(sub)}`} key={sub}>
            <div className="group relative bg-[#121212] border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 hover:bg-[#181818] transition-all duration-500 hover:-translate-y-2 cursor-pointer shadow-2xl overflow-hidden">
              <div className="flex flex-col items-center text-center space-y-4 md:space-y-8 relative z-10">
                <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full bg-black/50 flex items-center justify-center text-3xl md:text-5xl shadow-2xl border border-white/5 ${subjectColors[sub] || 'text-white'}`}>
                  {getSubjectIcon(sub)}
                </div>

                <h3 className="text-xl md:text-3xl font-black tracking-tight group-hover:text-purple-400 transition-colors">
                  {sub}
                </h3>

                <div className="flex items-center gap-2 md:gap-4">
                   <div className="bg-black/40 px-3 md:px-5 py-2 rounded-xl md:rounded-2xl text-[11px] md:text-[13px] font-black text-gray-400 border border-white/5">
                      📚 {stats[sub]?.summary || 0}
                   </div>
                   <div className="bg-black/40 px-3 md:px-5 py-2 rounded-xl md:rounded-2xl text-[11px] md:text-[13px] font-black text-gray-400 border border-white/5">
                      📝 {stats[sub]?.assignment || 0}
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
