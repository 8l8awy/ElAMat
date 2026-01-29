"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FaExchangeAlt, FaCalculator, FaBalanceScale, FaChartBar, 
  FaBook, FaGavel, FaSuitcase, FaLanguage 
} from "react-icons/fa";

export default function GlobalSubjectsPage() {
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(2);
  const router = useRouter();

  // الأسماء والألوان الأصلية
  const allSubjects = {
    year1: {
      sem1: [
        { name: "مبادئ المحاسبة المالية", color: "#22c55e", icon: <FaCalculator size={55}/> },
        { name: "لغة اجنبية (1)", color: "#a855f7", icon: <FaLanguage size={55}/> },
        { name: "مبادئ الاقتصاد", color: "#3b82f6", icon: <FaChartBar size={55}/> },
        { name: "مبادئ ادارة الاعمال", color: "#f97316", icon: <FaSuitcase size={55}/> },
        { name: "مبادئ القانون", color: "#ef4444", icon: <FaBalanceScale size={55}/> },
      ],
      sem2: [
        { name: "محاسبة الشركات", color: "#22c55e", icon: <FaCalculator size={55}/> },
        { name: "القانون التجاري", color: "#ef4444", icon: <FaGavel size={55}/> },
        { name: "اقتصاد كلي", color: "#3b82f6", icon: <FaChartBar size={55}/> },
        { name: "لغة إنجليزية تخصصية", color: "#a855f7", icon: <FaBook size={55}/> },
        { name: "إدارة التنظيم", color: "#f97316", icon: <FaSuitcase size={55}/> },
      ]
    },
    year2: { sem1: [], sem2: [] }, year3: { sem1: [], sem2: [] }, year4: { sem1: [], sem2: [] }
  };

  const currentList = allSubjects[`year${year}`][`sem${semester}`] || [];

  return (
    <div className="min-h-screen w-full bg-black text-white relative font-sans overflow-x-hidden" dir="rtl">
      
      {/* 💎 1. اللوجو (ضبط المكان والشكل) */}
      <div className="absolute top-10 right-12 z-[60] flex items-center gap-3 select-none">
         <span className="text-4xl font-black italic tracking-tighter">gamy</span>
         <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center -rotate-12 border border-white/20 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
            <span className="text-white font-black text-2xl italic">A</span>
         </div>
         <span className="text-4xl font-black italic tracking-tighter">El</span>
      </div>

      {/* 🎮 2. أزرار التحكم (تبديل السنين والترم) */}
      <div className="fixed top-10 left-12 z-50 flex flex-col items-end gap-5">
        <div className="flex bg-[#111]/80 backdrop-blur-xl p-2 rounded-[1.5rem] border border-white/5 shadow-2xl">
          {[1, 2, 3, 4].map(y => (
            <button key={y} onClick={() => setYear(y)} 
              className={`px-7 py-3 rounded-2xl font-black text-lg transition-all duration-500 ${year === y ? 'bg-purple-600 shadow-[0_0_30px_rgba(147,51,234,0.4)] scale-110' : 'text-gray-600 hover:text-white'}`}>
              فرقة {y}
            </button>
          ))}
        </div>
        <button onClick={() => setSemester(semester === 1 ? 2 : 1)} 
          className="bg-[#111]/80 backdrop-blur-xl px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-4 border border-white/5 hover:bg-purple-600 hover:border-purple-400 transition-all group">
          <FaExchangeAlt className="group-hover:rotate-180 transition-transform duration-500" /> 
          <span>ترم {semester === 1 ? "أول" : "ثاني"}</span>
        </button>
      </div>

      {/* 🏷️ 3. العنوان العملاق */}
      <div className="pt-56 px-12 mb-12 text-right">
          <h1 className="text-8xl md:text-[11rem] font-black italic tracking-tighter leading-none mb-4 uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            مواد <span className="text-purple-600">الفرقة {year}</span>
          </h1>
          <div className="h-1 w-48 bg-purple-600 rounded-full mb-4"></div>
          <p className="text-gray-500 font-bold text-2xl tracking-[0.5em] uppercase opacity-40">Materials Portal</p>
      </div>

      {/* 🎴 4. شبكة الكروت: Edge-to-Edge (بدون فواصل) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full h-[650px] gap-px bg-white/5 border-y border-white/5">
        {currentList.map((sub, i) => (
          <div 
            key={i} 
            // 👇 الرابط الحقيقي لفتح المواد
            onClick={() => router.push(`/dashboard/materials?subject=${encodeURIComponent(sub.name)}`)}
            className="group relative h-full bg-[#050505] hover:bg-white/[0.03] transition-all duration-700 cursor-pointer flex flex-col items-center justify-center p-14 text-center overflow-hidden"
          >
            {/* خط الإضاءة العلوي */}
            <div className="absolute top-0 left-0 w-full h-[5px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ backgroundColor: sub.color }}></div>
            
            {/* الأيقونة الحرة (بطل التصميم) */}
            <div className="mb-16 transform group-hover:scale-150 group-hover:-rotate-12 transition-all duration-700 filter drop-shadow-[0_0_25px_rgba(0,0,0,0.9)]" style={{ color: sub.color }}>
              {sub.icon}
            </div>
            
            <h3 className="text-5xl font-black leading-tight mb-10 group-hover:tracking-tighter transition-all duration-500">
              {sub.name}
            </h3>
            
            <div className="flex items-center gap-4 font-black text-xs tracking-[0.5em] uppercase opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0 transition-all duration-700" style={{ color: sub.color }}>
              <span>Open Library</span>
            </div>

            {/* تأثير الوهج الخلفي (Glow) */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${sub.color}, transparent 80%)` }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
