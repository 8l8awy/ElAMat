"use client";
import { useState } from "react";
import { 
  FaBook, FaBalanceScale, FaCalculator, FaGavel, 
  FaChartBar, FaExchangeAlt, FaArrowRight 
} from "react-icons/fa";

export default function SubjectsPage() {
  const [currentSemester, setCurrentSemester] = useState(2);

  // 1. مواد الترم الأول (الأسماء الأصلية من صورتك)
  const semester1Subjects = [
    { id: "s1_1", name: "مبادئ القانون", icon: <FaGavel size={40} />, link: "#" },
    { id: "s1_2", name: "مبادئ المحاسبة", icon: <FaCalculator size={40} />, link: "#" },
    { id: "s1_3", name: "مبادئ اقتصاد", icon: <FaBalanceScale size={40} />, link: "#" },
    { id: "s1_4", name: "إدارة الأعمال", icon: <FaChartBar size={40} />, link: "#" },
    { id: "s1_5", name: "رياضة بحتة", icon: <FaCalculator size={40} />, link: "#" },
  ];

  // 2. مواد الترم الثاني (ضيف الأسماء اللي تحبها هنا)
  const semester2Subjects = [
    { id: "s2_1", name: "محاسبة الشركات", icon: <FaCalculator size={40} />, link: "#" },
    { id: "s2_2", name: "القانون التجاري", icon: <FaGavel size={40} />, link: "#" },
    { id: "s2_3", name: "اقتصاد كلي", icon: <FaBalanceScale size={40} />, link: "#" },
    { id: "s2_4", name: "التنظيم والإدارة", icon: <FaChartBar size={40} />, link: "#" },
    { id: "s2_5", name: "اللغة الإنجليزية", icon: <FaBook size={40} />, link: "#" },
  ];

  const subjects = currentSemester === 1 ? semester1Subjects : semester2Subjects;

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white relative font-sans overflow-x-hidden">
      
      {/* إضاءة خلفية سينمائية تملأ الشاشة */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-[-10%] w-[80%] h-[80%] bg-purple-900/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-0 right-[-10%] w-[70%] h-[70%] bg-blue-900/5 rounded-full blur-[140px]"></div>
      </div>

      <div className="w-full px-6 md:px-16 pt-32 pb-20">
        
        {/* هيدر عملاق واحترافي */}
        <div className="w-full flex flex-col lg:flex-row items-start lg:items-center justify-between mb-24 gap-10 text-right">
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic uppercase">
              المواد <span className="text-purple-600 block md:inline">الدراسية</span>
            </h1>
            <p className="text-gray-500 font-bold text-xl tracking-[0.3em]">
              الترم {currentSemester === 2 ? "الثاني" : "الأول"} - 2026
            </p>
          </div>
          
          <button 
            onClick={() => setCurrentSemester(currentSemester === 1 ? 2 : 1)}
            className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 px-12 py-6 rounded-full font-black hover:bg-purple-600 transition-all text-xl shadow-[0_0_40px_rgba(147,51,234,0.1)] flex items-center gap-4"
          >
            <FaExchangeAlt className="group-hover:rotate-180 transition-transform duration-500 text-purple-500 group-hover:text-white" />
            <span>عرض مواد الترم {currentSemester === 2 ? "الأول" : "الثاني"}</span>
          </button>
        </div>

        {/* شبكة الكروت - بدون حواف Edge to Edge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-0 border-[0.5px] border-white/10">
          {subjects.map((sub) => (
            <div 
              key={sub.id} 
              onClick={() => window.open(sub.link, "_blank")}
              className="group relative h-[500px] bg-[#050505] hover:bg-purple-900/20 border-[0.5px] border-white/10 transition-all duration-700 cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden p-10"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              
              <div className="text-purple-500 mb-10 transform group-hover:scale-125 group-hover:-rotate-6 transition-all duration-500">
                {sub.icon}
              </div>
              
              <h3 className="text-4xl font-black leading-tight group-hover:tracking-tighter transition-all duration-500 mb-6 px-4">
                {sub.name}
              </h3>
              
              <div className="flex items-center gap-3 text-purple-400 font-black text-xs tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <span>فتح المادة</span>
                <FaArrowRight size={10} className="rotate-180" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
