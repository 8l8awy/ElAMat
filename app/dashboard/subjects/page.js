"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
// استيراد الأيقونات الأساسية فقط لضمان الاستقرار
import { 
  FaChartLine, FaCalculator, FaBalanceScale, FaUsers, 
  FaBookOpen, FaSyncAlt, FaGlobe, FaLightbulb, 
  FaCog, FaMicrochip, FaDatabase, FaBriefcase, FaShieldAlt, FaFileContract
} from "react-icons/fa";

export default function SubjectsPage() {
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(2);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // خريطة أيقونات دقيقة جداً ومطابقة لأسماء المواد في الـ Bank
  const subjectIcons = {
    // الفرقة الأولى
    "مبادئ الاقتصاد": <FaChartLine className="text-blue-400" />,
    "لغة اجنبية (1)": <FaGlobe className="text-purple-400" />,
    "مبادئ المحاسبة المالية": <FaCalculator className="text-green-400" />,
    "مبادئ القانون": <FaBalanceScale className="text-red-400" />,
    "مبادئ ادارة الاعمال": <FaBriefcase className="text-orange-400" />,
    "السلوك التنظيمي": <FaUsers className="text-purple-400" />,
    "طرق ومهارات الاتصال": <FaUsers className="text-blue-400" />,
    "حقوق الإنسان": <FaBalanceScale className="text-yellow-500" />,
    "رياضيات الأعمال": <FaCalculator className="text-green-500" />,
    "التفكير الابتكاري": <FaLightbulb className="text-yellow-400" />,
    "مبادئ علم الاجتماع": <FaGlobe className="text-cyan-400" />,

    // الفرقة الثانية
    "محاسبة التكاليف": <FaCalculator className="text-emerald-400" />,
    "إدارة التسويق": <FaChartLine className="text-pink-400" />,
    "إدارة المشتريات": <FaBriefcase className="text-orange-300" />,
    "التنمية المستدامة": <FaGlobe className="text-green-300" />,
    "مبادئ المحاسبة الإدارية": <FaCalculator className="text-emerald-400" />,
    "إدارة الإنتاج والعمليات": <FaCog className="text-gray-400" />,
    "تحليلات الأعمال": <FaChartLine className="text-orange-400" />,
    "مبادئ الإدارة المالية": <FaChartLine className="text-green-500" />,
    "نظم المعلومات الإدارية": <FaMicrochip className="text-blue-500" />,
    "لغة أجنبية (2)": <FaGlobe className="text-purple-300" />,

    // الفرقة الثالثة
    "إدارة الجودة": <FaShieldAlt className="text-teal-400" />,
    "المالية العامة": <FaCalculator className="text-yellow-600" />,
    "منهج البحث العلمي": <FaBookOpen className="text-blue-300" />,
    "محاسبة إدارية متقدمة": <FaCalculator className="text-green-600" />,
    "جداول العمل الإلكترونية": <FaDatabase className="text-green-400" />,
    "نظم المعلومات المحاسبية": <FaMicrochip className="text-cyan-500" />,
    "الإدارة الاستراتيجية": <FaBriefcase className="text-purple-500" />,
    "اقتصاديات النقود والبنوك": <FaCalculator className="text-green-400" />,
    "ريادة الأعمال والمشروعات الصغيرة": <FaLightbulb className="text-orange-400" />,

    // الفرقة الرابعة
    "إدارة المخاطر": <FaShieldAlt className="text-red-500" />,
    "مراجعة الحسابات": <FaFileContract className="text-blue-400" />,
    "محاسبة المنشآت المتخصصة": <FaCalculator className="text-emerald-500" />,
    "إدارة المحافظ المالية والمشتقات": <FaChartLine className="text-green-400" />,
    "إدارة الموارد البشرية": <FaUsers className="text-purple-400" />,
    "الأعمال الإلكترونية": <FaGlobe className="text-sky-400" />,
    "الإحصاء التطبيقي": <FaChartLine className="text-red-400" />,
    "قواعد البيانات": <FaDatabase className="text-indigo-400" />,
    "مشروع التخرج": <FaBriefcase className="text-amber-500" />,
    
    "default": <FaBookOpen className="text-gray-500" />
  };

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
      2: ["محاسبة إدارية متقدمة", "جداول العمل الإلكترونية", "نظم المعلومات المحاسبية", "الإدارة الاستراتيجية", "اقتصاديات النقود والبنوك", "ريادة الأعمال والمشروعات الصغيرة", "إدارة مالية متقدمة (بنوك)", "المحاسبة المتوسطة 2 (بنوك)"]
    },
    year4: {
      1: ["إدارة المخاطر", "مراجعة الحسابات", "محاسبة المنشآت المتخصصة"],
      2: ["إدارة المحافظ المالية والمشتقات", "إدارة الموارد البشرية", "الأعمال الإلكترونية", "الإحصاء التطبيقي", "قواعد البيانات", "مشروع التخرج"]
    }
  };

  const subjects = allSubjects[`year${year}`][semester] || [];

  // دالة الحماية لضمان عدم وقوع الصفحة
  const getSafeIcon = (name) => {
    if (!name) return subjectIcons["default"];
    const cleanName = name.trim();
    return subjectIcons[cleanName] || subjectIcons["default"];
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
          if (Number(data.year) === year && Number(data.semester) === semester) {
            const sub = String(data.subject).trim();
            const type = String(data.type).toLowerCase();
            if (!newStats[sub]) newStats[sub] = { summary: 0, assignment: 0 };
            if (type.includes("summary") || type.includes("ملخص")) newStats[sub].summary++;
            if (type.includes("assignment") || type.includes("تكليف")) newStats[sub].assignment++;
          }
        });
        setStats(newStats);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    fetchStats();
  }, [year, semester]);

  return (
    <div className="min-h-screen w-full text-white px-2 md:px-10 py-6 font-sans overflow-x-hidden" dir="rtl">
      <div className="w-full max-w-7xl mx-auto mb-10 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/5 pb-6">
           <div className="flex gap-1.5 bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
              {[1, 2, 3, 4].map(y => (
                <button key={y} onClick={() => setYear(y)} 
                  className={`px-5 md:px-7 py-2 rounded-xl font-black text-sm md:text-base transition-all ${year === y ? 'bg-purple-600 shadow-xl' : 'text-gray-500 hover:text-gray-300'}`}>
                  {y}
                </button>
              ))}
           </div>
           
           <button onClick={() => setSemester(semester === 1 ? 2 : 1)} 
             className="w-fit group bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 active:scale-95 transition-all">
             <FaSyncAlt className="text-purple-500 group-hover:rotate-180 transition-transform duration-500" /> 
             <span>ترم {semester === 1 ? "أول" : "ثاني"}</span>
           </button>
        </div>

        <div className="text-center pt-2">
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">المواد الدراسية</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 w-full max-w-7xl mx-auto pb-20">
        {subjects.map((sub) => (
          <Link href={`/dashboard/materials?subject=${encodeURIComponent(sub)}`} key={sub}>
            <div className="group bg-[#111] border border-white/5 rounded-[2rem] p-6 md:p-10 hover:bg-[#151515] transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/5 flex items-center justify-center text-3xl md:text-4xl shadow-inner border border-white/5 transition-transform group-hover:scale-110 duration-500">
                  {getSafeIcon(sub)}
                </div>
                <h3 className="text-lg md:text-xl font-black tracking-tight group-hover:text-purple-400 transition-colors h-14 flex items-center">
                  {sub}
                </h3>
                <div className="flex items-center gap-2">
                   <div className="bg-black/40 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-400 border border-white/5 flex items-center gap-2">
                     <span className="text-purple-500">📚</span> {stats[sub]?.summary || 0}
                   </div>
                   <div className="bg-black/40 px-4 py-2 rounded-xl text-[10px] font-bold text-gray-400 border border-white/5 flex items-center gap-2">
                     <span className="text-orange-500">📝</span> {stats[sub]?.assignment || 0}
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
