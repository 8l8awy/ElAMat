"use client";
import { useState } from "react";
import { 
  FaExchangeAlt, FaCalculator, FaBalanceScale, FaChartBar, 
  FaBook, FaGavel, FaSuitcase, FaLanguage, FaGlobe 
} from "react-icons/fa";

export default function GlobalSubjectsPage() {
  const [year, setYear] = useState(1); // الحالة الافتراضية: الفرقة الأولى
  const [semester, setSemester] = useState(2); // الحالة الافتراضية: الترم الثاني

  // بنك المواد المنظم لكل سنين الكلية
  const allSubjects = {
    year1: {
      sem1: [
        { name: "مبادئ المحاسبة المالية", color: "#22c55e", icon: <FaCalculator size={40}/>, link: "#" },
        { name: "مبادئ القانون", color: "#ef4444", icon: <FaBalanceScale size={40}/>, link: "#" },
        { name: "مبادئ الاقتصاد", color: "#3b82f6", icon: <FaChartBar size={40}/>, link: "#" },
        { name: "مبادئ إدارة الأعمال", color: "#f97316", icon: <FaSuitcase size={40}/>, link: "#" },
        { name: "لغة أجنبية (1)", color: "#a855f7", icon: <FaLanguage size={40}/>, link: "#" },
      ],
      sem2: [
        { name: "محاسبة الشركات", color: "#22c55e", icon: <FaCalculator size={40}/>, link: "#" },
        { name: "القانون التجاري", color: "#ef4444", icon: <FaGavel size={40}/>, link: "#" },
        { name: "الاقتصاد الكلي", color: "#3b82f6", icon: <FaChartBar size={40}/>, link: "#" },
        { name: "اللغة الإنجليزية", color: "#a855f7", icon: <FaBook size={40}/>, link: "#" },
        { name: "إدارة التنظيم", color: "#f97316", icon: <FaSuitcase size={40}/>, link: "#" },
      ]
    },
    year2: {
      sem1: [ { name: "مادة تجريبية 2/1", color: "#3b82f6", icon: <FaGlobe size={40}/>, link: "#" } ],
      sem2: [ { name: "مادة تجريبية 2/2", color: "#f97316", icon: <FaBook size={40}/>, link: "#" } ]
    },
    year3: {
      sem1: [], sem2: []
    },
    year4: {
      sem1: [], sem2: []
    }
  };

  const currentList = allSubjects[`year${year}`][`sem${semester}`] || [];

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white relative font-sans overflow-x-hidden" dir="rtl">
      
      {/* 🌌 خلفية بتوهج خفيف ممتد */}
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute top-0 left-0 w-full h-full bg-purple-900/5 blur-[120px] rounded-full opacity-50"></div>
      </div>

      {/* هيدر التحكم العلوي الثابت */}
      <div className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-4 md:px-10 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl">
          {[1, 2, 3, 4].map(y => (
            <button 
              key={y} 
              onClick={() => setYear(y)} 
              className={`px-5 py-2.5 rounded-xl font-black transition-all duration-300 ${year === y ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-gray-500 hover:text-white'}`}
            >
              فرقة {y}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setSemester(semester === 1 ? 2 : 1)} 
          className="bg-white/10 px-8 py-3 rounded-2xl font-black flex items-center gap-3 hover:bg-white/20 transition-all border border-white/10"
        >
          <FaExchangeAlt className="text-purple-500" />
          <span>الترم {semester === 1 ? "الأول" : "الثاني"}</span>
        </button>
      </div>

      <div className="pt-36 px-6 md:px-16 pb-20">
        <div className="mb-16">
           <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
            مواد <span className="text-purple-600">الفرقة {year}</span>
          </h1>
          <p className="text-gray-500 font-bold mt-4 mr-2 tracking-widest uppercase">تصفح محتوى المواد والملخصات المتاحة</p>
        </div>

        {/* شبكة الكروت: Edge-to-Edge بدون حواف */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-px bg-white/5 border border-white/5">
          {currentList.map((sub, i) => (
            <div 
              key={i} 
              onClick={() => sub.link !== "#" && window.open(sub.link, "_blank")}
              className="group relative h-[480px] bg-[#050505] hover:bg-white/[0.02] transition-all duration-700 cursor-pointer flex flex-col items-center justify-center p-12 text-center overflow-hidden"
            >
              {/* خط الإضاءة العلوي الملون */}
              <div 
                className="absolute top-0 left-0 w-full h-[3px] transition-transform duration-500 scale-x-0 group-hover:scale-x-100"
                style={{ backgroundColor: sub.color }}
              ></div>
              
              <div 
                className="mb-10 transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700" 
                style={{ color: sub.color }}
              >
                {sub.icon}
              </div>
              
              <h3 className="text-3xl font-black leading-tight mb-6 group-hover:tracking-tighter transition-all duration-500">
                {sub.name}
              </h3>
              
              <div 
                className="mt-6 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 font-black text-xs tracking-[0.3em] uppercase" 
                style={{ color: sub.color }}
              >
                فتح المحتوى
              </div>

              {/* وهج خلفي خفيف بلون المادة */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${sub.color}, transparent 70%)` }}
              ></div>
            </div>
          ))}
        </div>

        {/* حالة عدم وجود مواد مضافة */}
        {currentList.length === 0 && (
          <div className="text-center py-40 border border-dashed border-white/10 rounded-[3rem]">
            <p className="text-gray-600 font-black text-2xl uppercase tracking-widest">قريباً.. جاري رفع مواد هذه الفرقة</p>
          </div>
        )}
      </div>
    </div>
  );
}
