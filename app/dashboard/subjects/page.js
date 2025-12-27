"use client";
import Link from "next/link";
import { FaCalculator, FaLanguage, FaChartLine, FaBriefcase, FaBalanceScale, FaBook, FaArrowLeft } from "react-icons/fa";

export default function SubjectsPage() {
  
  // قائمة المواد (مطابقة للصورة التي أرسلتها)
  const subjects = [
    {
      id: "economics",
      name: "مبادئ الاقتصاد",
      icon: <FaChartLine className="text-4xl text-blue-400" />, // أيقونة الاقتصاد
      summaries: 9,
      assignments: 2,
      color: "border-blue-500"
    },
    {
      id: "english",
      name: "لغة اجنبية (1)",
      icon: <FaLanguage className="text-4xl text-purple-400" />, // أيقونة اللغة
      summaries: 0,
      assignments: 6,
      color: "border-purple-500"
    },
    {
      id: "accounting",
      name: "مبادئ المحاسبة المالية",
      icon: <FaCalculator className="text-4xl text-green-400" />, // أيقونة المحاسبة
      summaries: 2,
      assignments: 0,
      color: "border-green-500"
    },
    {
      id: "management",
      name: "مبادئ ادارة الاعمال",
      icon: <FaBriefcase className="text-4xl text-orange-400" />, // أيقونة الإدارة
      summaries: 1,
      assignments: 0,
      color: "border-orange-500"
    },
    {
      id: "law",
      name: "مبادئ القانون",
      icon: <FaBalanceScale className="text-4xl text-red-400" />, // أيقونة القانون
      summaries: 4,
      assignments: 0,
      color: "border-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0c15] text-white p-6 md:p-10 font-sans" dir="rtl">
      
      {/* العنوان */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-white to-gray-400 bg-clip-text text-transparent">
           المواد الدراسية
        </h1>
      </div>

      {/* شبكة البطاقات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub, index) => (
          <Link href={`/dashboard/subjects/${sub.id}`} key={index}>
            <div className={`group relative bg-[#151720] border border-gray-800 hover:border-gray-600 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden cursor-pointer`}>
              
              {/* الشريط الملون العلوي (تأثير متوهج) */}
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${sub.color.split('-')[1]}-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity`}></div>
              
              {/* ✨ التعديل هنا: flex-col + items-center لتوسيط كل شيء */}
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                
                {/* الأيقونة في دائرة خلفية خفيفة */}
                <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 border border-gray-700/50 group-hover:border-gray-600">
                   {sub.icon}
                </div>

                {/* اسم المادة */}
                <h2 className="text-xl font-bold text-gray-100 group-hover:text-white transition-colors">
                  {sub.name}
                </h2>

                {/* الإحصائيات (ملخصات وتكاليف) */}
                <div className="flex items-center gap-3 mt-2 w-full justify-center">
                   <div className="bg-gray-900/80 px-4 py-2 rounded-lg border border-gray-800 text-xs text-gray-400 flex items-center gap-2">
                      <FaBook /> 
                      <span>{sub.summaries} ملخص</span>
                   </div>
                   <div className="bg-gray-900/80 px-4 py-2 rounded-lg border border-gray-800 text-xs text-gray-400 flex items-center gap-2">
                      <span>📝</span>
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
