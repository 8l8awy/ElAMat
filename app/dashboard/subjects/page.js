"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; // تأكد من المسار الصحيح
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { FaChartLine, FaLanguage, FaCalculator, FaScaleBalanced, FaBriefcase, FaBookOpen } from "react-icons/fa6";

export default function SubjectsPage() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // قائمة المواد
  const subjects = [
    "مبادئ الاقتصاد",
    "لغة اجنبية (1)",
    "مبادئ المحاسبة المالية",
    "مبادئ القانون",
    "مبادئ ادارة الاعمال"
  ];

  // ألوان المواد لإعطاء جمالية للتصميم الجديد
  const subjectColors = {
    "مبادئ الاقتصاد": "from-blue-500 to-cyan-500",
    "لغة اجنبية (1)": "from-purple-500 to-pink-500",
    "مبادئ المحاسبة المالية": "from-green-500 to-emerald-500",
    "مبادئ القانون": "from-red-500 to-rose-500",
    "مبادئ ادارة الاعمال": "from-orange-500 to-yellow-500"
  };

  // دالة الأيقونات
  const getSubjectIcon = (subject) => {
    const icons = {
        "مبادئ الاقتصاد": <FaChartLine className="text-5xl text-blue-400" />,         
        "لغة اجنبية (1)": <FaLanguage className="text-5xl text-purple-400" />,            
        "مبادئ المحاسبة المالية": <FaCalculator className="text-5xl text-green-400" />,    
        "مبادئ القانون": <FaScaleBalanced className="text-5xl text-red-400" />,       
        "مبادئ ادارة الاعمال": <FaBriefcase className="text-5xl text-orange-400" />     
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
      try {
        const q = query(collection(db, "materials"), where("status", "==", "approved"));
        const snapshot = await getDocs(q);
        
        const newStats = {};
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="animate-pulse text-xl">جاري تحميل المواد...</div>
    </div>
  );

  return (
    // تم استخدام w-full و p-4 فقط لملء الشاشة وإزالة الخلفية الصلبة
    <div className="min-h-screen w-full text-white p-4 font-sans" dir="rtl">
      
      {/* العنوان */}
      <div className="mb-8 text-center pt-4">
        <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
           المواد الدراسية
        </h1>
        <p className="text-gray-400">اختر المادة لعرض المحتوى</p>
      </div>
      
      {/* الشبكة تملأ العرض */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {subjects.map((subject) => (
          <Link 
            href={`/dashboard/materials?subject=${encodeURIComponent(subject)}`} 
            key={subject} 
            className="w-full"
          >
            <div className={`group relative h-full bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-white/10 hover:border-white/20 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden cursor-pointer`}>
              
              {/* تأثير الإضاءة الملونة في الخلفية عند التحويم */}
              <div className={`absolute inset-0 bg-gradient-to-br ${subjectColors[subject] || "from-gray-500 to-gray-700"} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
                
                {/* الأيقونة في دائرة */}
                <div className="w-24 h-24 rounded-full bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/5 shadow-lg">
                   {getSubjectIcon(subject)}
                </div>
                
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
                  {subject}
                </h3>
                
                {/* الإحصائيات */}
                <div className="flex items-center justify-center gap-3 w-full">
                  <div className="bg-black/20 px-4 py-2 rounded-xl text-sm text-gray-300 flex items-center gap-2 border border-white/5">
                    <span className="text-blue-400">📚</span>
                    <span>{stats[subject]?.summary || 0} ملخص</span>
                  </div>
                  <div className="bg-black/20 px-4 py-2 rounded-xl text-sm text-gray-300 flex items-center gap-2 border border-white/5">
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
