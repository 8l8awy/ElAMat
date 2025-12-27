"use client";
import Link from "next/link";
import { FaCalculator, FaLanguage, FaChartLine, FaBriefcase, FaBalanceScale, FaBook } from "react-icons/fa";

export default function SubjectsPage() {
  
  const subjects = [
    {
      id: "economics",
      name: "مبادئ الاقتصاد",
      icon: <FaChartLine className="text-5xl text-blue-400" />, 
      summaries: 9,
      assignments: 2,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "english",
      name: "لغة اجنبية (1)",
      icon: <FaLanguage className="text-5xl text-purple-400" />,
      summaries: 0,
      assignments: 6,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "accounting",
      name: "مبادئ المحاسبة المالية",
      icon: <FaCalculator className="text-5xl text-green-400" />,
      summaries: 2,
      assignments: 0,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "management",
      name: "مبادئ ادارة الاعمال",
      icon: <FaBriefcase className="text-5xl text-orange-400" />,
      summaries: 1,
      assignments: 0,
      color: "from-orange-500 to-yellow-500"
    },
    {
      id: "law",
      name: "مبادئ القانون",
      icon: <FaBalanceScale className="text-5xl text-red-400" />,
      summaries: 4,
      assignments: 0,
      color: "from-red-500 to-rose-500"
    }
  ];

  return (
    // 1. إزالة bg-[#0b0c15] وإزالة الحواف الكبيرة (p-10) لتصبح الشاشة كاملة
    <div className="min-h-screen w-full text-white p-4 font-sans" dir="rtl">
      
      {/* العنوان */}
      <div className="mb-8 text-center pt-4">
        <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
           المواد الدراسية
        </h1>
        <p className="text-gray-400">اختر المادة للبدء</p>
      </div>

      {/* شبكة البطاقات:
         - تم استخدام w-full لتأخذ العرض بالكامل
         - البطاقات الآن شفافة (backdrop-blur) لتبدو عصرية وتلغي الخلفية الصلبة
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {subjects.map((sub, index) => (
          <Link href={`/dashboard/subjects/${sub.id}`} key={index} className="w-full">
            <div className={`group relative h-full bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-white/10 hover:border-white/20 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden cursor-pointer`}>
              
              {/* تأثير الإضاءة عند التحويم */}
              <div className={`absolute inset-0 bg-gradient-to-br ${sub.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
                
                {/* الأيقونة في المنتصف تماماً وبحجم أكبر قليلاً */}
                <div className="w-24 h-24 rounded-full bg-black/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/5 shadow-lg">
                   {sub.icon}
                </div>

                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">
                    {sub.name}
                    </h2>
                </div>

                {/* الإحصائيات بتصميم بسيط وشفاف */}
                <div className="flex items-center justify-center gap-3 w-full">
                   <div className="bg-black/20 px-4 py-2 rounded-xl text-sm text-gray-300 flex items-center gap-2 border border-white/5">
                      <FaBook className="text-blue-400" /> 
                      <span>{sub.summaries} ملخص</span>
                   </div>
                   <div className="bg-black/20 px-4 py-2 rounded-xl text-sm text-gray-300 flex items-center gap-2 border border-white/5">
                      <span className="text-yellow-400">📝</span>
                      <span>{sub.assignments} تكليف</span>
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
