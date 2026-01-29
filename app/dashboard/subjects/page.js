"use client";
import { useState } from "react";
import { FaGraduationCap, FaExchangeAlt, FaCalculator, FaBalanceScale, FaChartBar, FaBook } from "react-icons/fa";

export default function GlobalSubjectsPage() {
  const [year, setYear] = useState(1); // السنة (1, 2, 3, 4)
  const [semester, setSemester] = useState(2); // الترم (1, 2)

  // بنك المواد - هنا بنحفظ كل سنين الكلية بشكل منظم جداً
  const allSubjects = {
    year1: {
      sem1: [
        { name: "مبادئ المحاسبة", color: "#22c55e", icon: <FaCalculator size={40}/>, link: "#" },
        { name: "مبادئ القانون", color: "#ef4444", icon: <FaBalanceScale size={40}/>, link: "#" },
      ],
      sem2: [
        { name: "محاسبة الشركات", color: "#22c55e", icon: <FaCalculator size={40}/>, link: "#" },
        { name: "قانون تجاري", color: "#ef4444", icon: <FaGavel size={40}/>, link: "#" },
      ]
    },
    year2: {
      sem1: [ { name: "اقتصاد منزلي", color: "#3b82f6", icon: <FaChartBar size={40}/>, link: "#" } ],
      sem2: [ { name: "تسويق دولي", color: "#f97316", icon: <FaBook size={40}/>, link: "#" } ]
    },
    // وهكذا لباقي السنين...
  };

  const currentList = allSubjects[`year${year}`][`sem${semester}`] || [];

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white relative font-sans overflow-x-hidden">
      
      {/* هيدر التحكم الجديد - شيك جداً وغير مزعج */}
      <div className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(y => (
            <button key={y} onClick={() => setYear(y)} 
              className={`px-4 py-2 rounded-xl font-bold transition-all ${year === y ? 'bg-purple-600' : 'bg-white/5 text-gray-400'}`}>
              فرقة {y}
            </button>
          ))}
        </div>
        
        <button onClick={() => setSemester(semester === 1 ? 2 : 1)} 
          className="bg-white/10 px-6 py-2 rounded-xl font-black flex items-center gap-2 hover:bg-purple-600 transition-all">
          <FaExchangeAlt /> ترم {semester}
        </button>
      </div>

      <div className="pt-32 px-6 md:px-16 pb-20">
        <h1 className="text-5xl md:text-8xl font-black italic mb-16 tracking-tighter uppercase">
          مواد <span className="text-purple-600">الفرقة {year}</span>
        </h1>

        {/* الكروت كما هي بنفس التصميم الـ Edge-to-Edge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-px bg-white/5">
          {currentList.map((sub, i) => (
            <div key={i} onClick={() => window.open(sub.link, "_blank")}
              className="group relative h-[450px] bg-[#050505] hover:bg-white/[0.03] transition-all duration-700 cursor-pointer flex flex-col items-center justify-center p-10">
              
              <div className="absolute top-0 left-0 w-full h-[4px] transition-transform duration-500 scale-x-0 group-hover:scale-x-100"
                style={{ backgroundColor: sub.color }}></div>
              
              <div className="mb-8 transform group-hover:scale-125 transition-all duration-700" style={{ color: sub.color }}>
                {sub.icon}
              </div>
              
              <h3 className="text-3xl font-black leading-tight text-center">{sub.name}</h3>
              
              <div className="mt-8 opacity-0 group-hover:opacity-100 transition-all font-bold text-xs tracking-widest uppercase" style={{ color: sub.color }}>
                فتح المحتوى
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
