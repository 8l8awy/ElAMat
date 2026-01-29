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

  // بنك المواد المنظم (تأكد من كتابة الأسماء كما هي في الداتا بيز)
  const allSubjects = {
    year1: {
      sem1: [
        { name: "مبادئ المحاسبة المالية", color: "#22c55e", icon: <FaCalculator size={45}/> },
        { name: "مبادئ القانون", color: "#ef4444", icon: <FaBalanceScale size={45}/> },
        { name: "مبادئ الاقتصاد", color: "#3b82f6", icon: <FaChartBar size={45}/> },
        { name: "مبادئ ادارة الاعمال", color: "#f97316", icon: <FaSuitcase size={45}/> },
        { name: "لغة اجنبية (1)", color: "#a855f7", icon: <FaLanguage size={45}/> },
      ],
      sem2: [
        { name: "محاسبة الشركات", color: "#22c55e", icon: <FaCalculator size={45}/> },
        { name: "القانون التجاري", color: "#ef4444", icon: <FaGavel size={45}/> },
        { name: "اقتصاد كلي", color: "#3b82f6", icon: <FaChartBar size={45}/> },
        { name: "لغة إنجليزية تخصصية", color: "#a855f7", icon: <FaBook size={45}/> },
        { name: "إدارة التنظيم", color: "#f97316", icon: <FaSuitcase size={45}/> },
      ]
    },
    year2: { sem1: [], sem2: [] },
    year3: { sem1: [], sem2: [] },
    year4: { sem1: [], sem2: [] }
  };

  const currentList = allSubjects[`year${year}`][`sem${semester}`] || [];

  return (
    <div className="min-h-screen w-full bg-[#020202] text-white relative font-sans overflow-x-hidden" dir="rtl">
      
      {/* 🌌 تأثير إضاءة خلفي عملاق */}
      <div className="fixed inset-0 -z-10 bg-black">
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-purple-900/10 blur-[150px] rounded-full"></div>
      </div>

      {/* هيدر التحكم العلوي */}
      <div className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-2xl border-b border-white/5 px-6 py-5 flex flex-wrap justify-between items-center gap-6">
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(y => (
            <button key={y} onClick={() => setYear(y)} 
              className={`px-6 py-3 rounded-2xl font-black text-lg transition-all duration-300 ${year === y ? 'bg-purple-600 shadow-[0_0_30px_rgba(147,51,234,0.3)]' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
              فرقة {y}
            </button>
          ))}
        </div>
        
        <button onClick={() => setSemester(semester === 1 ? 2 : 1)} 
          className="bg-white/10 px-8 py-3 rounded-2xl font-black flex items-center gap-3 hover:bg-purple-600 transition-all border border-white/10 shadow-xl">
          <FaExchangeAlt /> <span>ترم {semester === 1 ? "أول" : "ثاني"}</span>
        </button>
      </div>

      <div className="pt-40 w-full">
        <div className="px-10 mb-16 text-center md:text-right">
           <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter leading-none mb-4">
            مواد <span className="text-purple-600">الفرقة {year}</span>
          </h1>
          <p className="text-gray-500 font-bold text-xl uppercase tracking-widest">تصفح محتوى المواد والملخصات المتاحة</p>
        </div>

        {/* شبكة الكروت: ملء الشاشة بالكامل (Edge-to-Edge) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full gap-px bg-white/5 border-y border-white/5">
          {currentList.map((sub, i) => (
            <div 
              key={i} 
              // 👇 الربط بصفحة المواد الحقيقية لفتح الملخصات
              onClick={() => router.push(`/dashboard/materials?subject=${encodeURIComponent(sub.name)}`)}
              className="group relative h-[550px] bg-[#050505] hover:bg-white/[0.03] transition-all duration-700 cursor-pointer flex flex-col items-center justify-center p-12 text-center overflow-hidden"
            >
              {/* خط الإضاءة العلوي */}
              <div className="absolute top-0 left-0 w-full h-[4px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500" style={{ backgroundColor: sub.color }}></div>
              
              <div className="mb-14 transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700" style={{ color: sub.color }}>
                {sub.icon}
              </div>
              
              <h3 className="text-4xl font-black leading-tight mb-8 px-4 group-hover:tracking-tighter transition-all duration-500">
                {sub.name}
              </h3>
              
              <div className="flex items-center gap-3 font-black text-sm tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-700" style={{ color: sub.color }}>
                <span>دخول المادة</span>
              </div>

              {/* تأثير الوهج الخلفي */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${sub.color}, transparent 70%)` }}></div>
            </div>
          ))}
        </div>

        {currentList.length === 0 && (
          <div className="text-center py-40">
            <p className="text-gray-700 font-black text-3xl italic">قريباً.. مواد هذه الفرقة</p>
          </div>
        )}
      </div>
    </div>
  );
}
