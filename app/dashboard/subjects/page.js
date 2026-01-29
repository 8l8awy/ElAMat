"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FaExchangeAlt, FaCalculator, FaBalanceScale, FaChartBar, 
  FaBook, FaGavel, FaSuitcase, FaLanguage, FaArrowLeft 
} from "react-icons/fa";

export default function GlobalSubjectsPage() {
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(2);
  const router = useRouter();

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
    year2: { sem1: [], sem2: [] }, 
    year3: { sem1: [], sem2: [] }, 
    year4: { sem1: [], sem2: [] }
  };

  const currentList = allSubjects[`year${year}`][`sem${semester}`] || [];
  const semesterText = semester === 1 ? "الأول" : "الثاني";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-950 to-black text-white relative font-sans overflow-x-hidden" dir="rtl">
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Logo */}
      <div className="absolute top-8 right-8 md:top-10 md:right-12 z-[60] flex items-center gap-3 select-none">
         <span className="text-3xl md:text-4xl font-black italic tracking-tighter bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
           gamy
         </span>
         <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center -rotate-12 border border-white/20 shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:rotate-0 transition-transform duration-500">
            <span className="text-white font-black text-xl md:text-2xl italic">A</span>
         </div>
         <span className="text-3xl md:text-4xl font-black italic tracking-tighter bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
           El
         </span>
      </div>

      {/* Control Panel */}
      <div className="fixed top-8 left-8 md:top-10 md:left-12 z-50 flex flex-col items-end gap-4">
        {/* Year Selector */}
        <div className="flex bg-black/60 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
          {[1, 2, 3, 4].map(y => (
            <button 
              key={y} 
              onClick={() => setYear(y)} 
              className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-sm md:text-lg transition-all duration-500 ${
                year === y 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 shadow-[0_0_30px_rgba(147,51,234,0.5)] scale-105' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              فرقة {y}
            </button>
          ))}
        </div>

        {/* Semester Toggle */}
        <button 
          onClick={() => setSemester(semester === 1 ? 2 : 1)} 
          className="bg-black/60 backdrop-blur-2xl px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-lg flex items-center gap-3 md:gap-4 border border-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-purple-700 hover:border-purple-400 transition-all duration-500 group shadow-lg hover:shadow-[0_0_30px_rgba(147,51,234,0.4)]"
        >
          <FaExchangeAlt className="group-hover:rotate-180 transition-transform duration-700" /> 
          <span>الترم {semesterText}</span>
        </button>
      </div>

      {/* Hero Title Section */}
      <div className="pt-32 md:pt-56 px-6 md:px-12 mb-8 md:mb-12 text-right">
          <h1 className="text-5xl md:text-8xl lg:text-[11rem] font-black italic tracking-tighter leading-none mb-4 uppercase">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
              مواد 
            </span>
            <span className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 bg-clip-text text-transparent drop-shadow-[0_10px_40px_rgba(147,51,234,0.5)]">
              {" "}الفرقة {year}
            </span>
          </h1>
          <div className="h-1 w-32 md:w-48 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full mb-4 shadow-[0_0_20px_rgba(147,51,234,0.6)]"></div>
          <p className="text-gray-500 font-bold text-lg md:text-2xl tracking-[0.3em] md:tracking-[0.5em] uppercase opacity-40">
            {semesterText} semester • {currentList.length} مادة
          </p>
      </div>

      {/* Subject Cards Grid */}
      {currentList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full min-h-[500px] md:min-h-[650px] gap-px bg-white/5 border-y border-white/5">
          {currentList.map((sub, i) => (
            <div 
              key={i} 
              onClick={() => router.push(`/dashboard/materials?subject=${encodeURIComponent(sub.name)}`)}
              className="group relative h-full min-h-[400px] md:min-h-[650px] bg-gradient-to-br from-black via-gray-950 to-black hover:from-gray-950 hover:via-black hover:to-gray-900 transition-all duration-700 cursor-pointer flex flex-col items-center justify-center p-8 md:p-14 text-center overflow-hidden border-r border-white/[0.02] last:border-r-0"
              style={{
                animation: `fadeInUp 0.6s ease-out ${i * 0.1}s both`
              }}
            >
              {/* Top Accent Line */}
              <div 
                className="absolute top-0 left-0 w-full h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left shadow-[0_0_20px_currentColor]" 
                style={{ backgroundColor: sub.color }}
              ></div>
              
              {/* Icon */}
              <div 
                className="mb-10 md:mb-16 transform group-hover:scale-125 group-hover:-rotate-6 transition-all duration-700 filter drop-shadow-[0_0_30px_rgba(0,0,0,0.9)] relative z-10" 
                style={{ color: sub.color }}
              >
                {sub.icon}
                {/* Icon glow effect */}
                <div 
                  className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700" 
                  style={{ backgroundColor: sub.color }}
                ></div>
              </div>
              
              {/* Subject Name */}
              <h3 className="text-3xl md:text-5xl font-black leading-tight mb-6 md:mb-10 group-hover:tracking-tighter transition-all duration-500 relative z-10 group-hover:text-white">
                {sub.name}
              </h3>
              
              {/* Call to Action */}
              <div 
                className="flex items-center gap-3 md:gap-4 font-black text-xs tracking-[0.3em] md:tracking-[0.5em] uppercase opacity-0 group-hover:opacity-100 translate-y-8 group-hover:translate-y-0 transition-all duration-700 relative z-10" 
                style={{ color: sub.color }}
              >
                <FaArrowLeft className="animate-pulse" />
                <span>استكشف المحتوى</span>
              </div>

              {/* Radial Glow Background */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-1000 pointer-events-none blur-3xl" 
                style={{ 
                  background: `radial-gradient(circle at center, ${sub.color}, transparent 70%)` 
                }}
              ></div>

              {/* Corner Accent */}
              <div 
                className="absolute bottom-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-2xl" 
                style={{ backgroundColor: sub.color }}
              ></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-3xl flex items-center justify-center mb-8 border border-purple-500/20">
            <FaBook size={40} className="text-purple-500/50" />
          </div>
          <h2 className="text-4xl font-black text-gray-600 mb-4">لا توجد مواد متاحة</h2>
          <p className="text-gray-500 text-lg">سيتم إضافة المواد قريباً</p>
        </div>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
