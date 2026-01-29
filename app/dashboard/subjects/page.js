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

  const allSubjects = {
    year1: {
      sem1: [
        { name: "مبادئ المحاسبة المالية", color: "#22c55e", icon: <FaCalculator size={50}/> },
        { name: "لغة اجنبية (1)", color: "#a855f7", icon: <FaLanguage size={50}/> },
        { name: "مبادئ الاقتصاد", color: "#3b82f6", icon: <FaChartBar size={50}/> },
        { name: "مبادئ ادارة الاعمال", color: "#f97316", icon: <FaSuitcase size={50}/> },
        { name: "مبادئ القانون", color: "#ef4444", icon: <FaBalanceScale size={50}/> },
      ],
      sem2: [
        { name: "محاسبة الشركات", color: "#22c55e", icon: <FaCalculator size={50}/> },
        { name: "القانون التجاري", color: "#ef4444", icon: <FaGavel size={50}/> },
        { name: "اقتصاد كلي", color: "#3b82f6", icon: <FaChartBar size={50}/> },
        { name: "لغة إنجليزية تخصصية", color: "#a855f7", icon: <FaBook size={50}/> },
        { name: "إدارة التنظيم", color: "#f97316", icon: <FaSuitcase size={50}/> },
      ]
    },
    year2: { sem1: [], sem2: [] }, year3: { sem1: [], sem2: [] }, year4: { sem1: [], sem2: [] }
  };

  const currentList = allSubjects[`year${year}`][`sem${semester}`] || [];

  return (
    <div className="min-h-screen w-full bg-black text-white relative font-sans overflow-x-hidden" dir="rtl">
      
      {/* 1. ضبط اللوجو (الجهة اليمنى العلوية) */}
      <div className="absolute top-8 right-10 z-[60]">
        <div className="flex items-center gap-2 group cursor-pointer">
           <span className="text-3xl font-black tracking-tighter">gamy</span>
           <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform">
              <span className="text-white font-black text-xl italic">A</span>
           </div>
           <span className="text-3xl font-black tracking-tighter">El</span>
        </div>
      </div>

      {/* 2. هيدر التحكم (الجهة اليسرى العلوية) */}
      <div className="fixed top-8 left-10 z-50 flex flex-col items-end gap-4">
        <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-2xl">
          {[1, 2, 3, 4].map(y => (
            <button key={y} onClick={() => setYear(y)} 
              className={`px-6 py-2.5 rounded-xl font-black transition-all ${year === y ? 'bg-purple-600 shadow-lg scale-105' : 'text-gray-500 hover:text-white'}`}>
              فرقة {y}
            </button>
          ))}
        </div>
        <button onClick={() => setSemester(semester === 1 ? 2 : 1)} 
          className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-xl font-black flex items-center gap-3 border border-white/10 hover:bg-purple-600 transition-all group shadow-xl">
          <FaExchangeAlt className="group-hover:rotate-180 transition-transform" /> 
          <span>الترم {semester === 1 ? "الأول" : "الثاني"}</span>
        </button>
      </div>

      {/* 3. عنوان الصفحة الكبير */}
      <div className="pt-48 px-10 text-center md:text-right mb-10">
          <h1 className="text-7xl md:text-[10rem] font-black italic tracking-tighter leading-[0.8] mb-6 drop-shadow-2xl">
            مواد <span className="text-purple-600">الفرقة {year}</span>
          </h1>
          <p className="text-gray-500 font-bold text-2xl uppercase tracking-widest opacity-60">تصفح محتوى المواد والملخصات المتاحة</p>
      </div>

      {/* 4. شبكة الكروت: ملء الشاشة (Edge-to-Edge) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full h-[600px] gap-px bg-white/5 border-y border-white/5">
        {currentList.map((sub, i) => (
          <div 
            key={i} 
            onClick={() => router.push(`/dashboard/materials?subject=${encodeURIComponent(sub.name)}`)}
            className="group relative h-full bg-[#050505] hover:bg-white/[0.03] transition-all duration-700 cursor-pointer flex flex-col items-center justify-center p-10 text-center overflow-hidden"
          >
            {/* خط الإضاءة العلوي */}
            <div className="absolute top-0 left-0 w-full h-[5px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ backgroundColor: sub.color }}></div>
            
            {/* الأيقونة الكبيرة */}
            <div className="mb-14 transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700 drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]" style={{ color: sub.color }}>
              {sub.icon}
            </div>
            
            <h3 className="text-4xl font-black leading-[1.1] mb-8 group-hover:tracking-tighter transition-all duration-500">
              {sub.name}
            </h3>
            
            <div className="flex items-center gap-3 font-black text-xs tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-700" style={{ color: sub.color }}>
              <span>دخول المادة</span>
            </div>

            {/* تأثير الوهج (Glow) */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${sub.color}, transparent 80%)` }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
