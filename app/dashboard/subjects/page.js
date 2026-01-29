"use client";
import { useState } from "react";
import { 
  FaBook, FaBalanceScale, FaCalculator, FaGavel, 
  FaChartBar, FaExchangeAlt, FaArrowLeft, FaLanguage, FaSuitcase
} from "react-icons/fa";

export default function SubjectsPage() {
  const [currentSemester, setCurrentSemester] = useState(2);

  // مواد الترم الأول (حط لينكاتك مكان الـ #)
  const semester1Subjects = [
    { id: "s1_1", name: "مبادئ المحاسبة المالية", icon: <FaCalculator size={45} />, color: "#22c55e", link: "https://google.com" }, 
    { id: "s1_2", name: "لغة أجنبية (1)", icon: <FaLanguage size={45} />, color: "#a855f7", link: "#" }, 
    { id: "s1_3", name: "مبادئ الاقتصاد", icon: <FaChartBar size={45} />, color: "#3b82f6", link: "#" }, 
    { id: "s1_4", name: "مبادئ ادارة الاعمال", icon: <FaSuitcase size={45} />, color: "#f97316", link: "#" }, 
    { id: "s1_5", name: "مبادئ القانون", icon: <FaBalanceScale size={45} />, color: "#ef4444", link: "#" }, 
  ];

  // مواد الترم الثاني (حط لينكاتك مكان الـ #)
  const semester2Subjects = [
    { id: "s2_1", name: "محاسبة الشركات", icon: <FaCalculator size={45} />, color: "#22c55e", link: "https://your-pdf-link.com" },
    { id: "s2_2", name: "قانون تجاري", icon: <FaGavel size={45} />, color: "#ef4444", link: "#" },
    { id: "s2_3", name: "اقتصاد كلي", icon: <FaChartBar size={45} />, color: "#3b82f6", link: "#" },
    { id: "s2_4", name: "اللغة الإنجليزية", icon: <FaBook size={45} />, color: "#a855f7", link: "#" },
  ];

  const subjects = currentSemester === 1 ? semester1Subjects : semester2Subjects;

  return (
    <div className="min-h-screen w-full bg-black text-white relative font-sans overflow-x-hidden" dir="rtl">
      
      {/* خلفية بتوهج كامل بدون حواف */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[100%] h-[100%] bg-blue-900/5 rounded-full blur-[150px] pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full pt-28 pb-10">
        
        {/* هيدر ممتد */}
        <div className="w-full px-8 md:px-16 flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase">
              المواد <span className="text-purple-600">الدراسية</span>
            </h1>
            <p className="text-gray-500 font-bold text-xl tracking-[0.2em] uppercase opacity-70">الترم {currentSemester === 2 ? "الثاني" : "الأول"} - ٢٠٢٦</p>
          </div>
          
          <button 
            onClick={() => setCurrentSemester(currentSemester === 1 ? 2 : 1)}
            className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 px-10 py-5 rounded-full font-black hover:bg-purple-600 transition-all text-xl shadow-2xl flex items-center gap-4 active:scale-95"
          >
            <FaExchangeAlt className="group-hover:rotate-180 transition-transform duration-500 text-purple-500 group-hover:text-white" />
            <span>تبديل الأترام</span>
          </button>
        </div>

        {/* شبكة الكروت: ملء الشاشة بالكامل (Edge-to-Edge) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 w-full gap-px bg-white/5 border-y border-white/5">
          {subjects.map((sub) => (
            <div 
              key={sub.id} 
              // 👇 السطر ده هو اللي بيفتح اللينك
              onClick={() => { if(sub.link !== "#") window.open(sub.link, "_blank") }}
              className="group relative h-[500px] bg-[#050505] hover:bg-white/[0.03] transition-all duration-700 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden p-10"
            >
              <div 
                className="absolute top-0 left-0 w-full h-[4px] transition-transform duration-500 scale-x-0 group-hover:scale-x-100"
                style={{ backgroundColor: sub.color }}
              ></div>
              
              <div 
                className="mb-12 transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700"
                style={{ color: sub.color }}
              >
                {sub.icon}
              </div>
              
              <h3 className="text-4xl font-black leading-tight group-hover:tracking-tighter transition-all duration-500 mb-8 px-4">
                {sub.name}
              </h3>
              
              <div 
                className="flex items-center gap-3 font-black text-xs tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-700"
                style={{ color: sub.color }}
              >
                <span>استعراض المحتوى</span>
                <FaArrowLeft size={12} />
              </div>

              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${sub.color}, transparent 70%)` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
