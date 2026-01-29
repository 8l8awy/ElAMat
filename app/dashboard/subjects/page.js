"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import { FaBook, FaBalanceScale, FaCalculator, FaGavel, FaChartBar, FaExchangeAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(2);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const renderIcon = (iconType) => {
    const s = 35;
    switch (iconType) {
      case "balance": return <FaBalanceScale size={s} />;
      case "calculator": return <FaCalculator size={s} />;
      case "gavel": return <FaGavel size={s} />;
      case "chart": return <FaChartBar size={s} />;
      default: return <FaBook size={s} />;
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "subjects"), where("semester", "==", currentSemester), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchSubjects();
  }, [currentSemester]);

  return (
    // min-h-screen و w-full تضمن أن الصفحة مالية الشاشة تماماً
    <div className="min-h-screen w-full bg-transparent text-white relative font-sans">
      
      {/* 🌌 الإضاءة الخلفية (Glow) ممتدة لنهاية الشاشة */}
      <div className="fixed inset-0 -z-10 bg-[#020202]">
        <div className="absolute top-0 left-[-5%] w-[70%] h-[70%] bg-purple-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-[-5%] w-[60%] h-[60%] bg-blue-900/5 rounded-full blur-[150px]"></div>
      </div>

      {/* محتوى الصفحة بدون container ضيق */}
      <div className="w-full px-4 md:px-10 pt-32 pb-10">
        
        {/* Header واسع جداً */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between mb-24">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic">
            <span className="text-purple-500">مـ</span>واد الترم {currentSemester === 2 ? "2" : "1"}
          </h1>
          
          <button 
            onClick={() => setCurrentSemester(currentSemester === 1 ? 2 : 1)}
            className="mt-6 md:mt-0 bg-white/5 backdrop-blur-xl border border-white/10 px-10 py-5 rounded-full font-black hover:bg-purple-600 transition-all text-xl shadow-2xl"
          >
            تبديل الأترام
          </button>
        </div>

        {/* Grid ممتد بعرض الشاشة بالكامل */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 w-full">
          {subjects.map((sub) => (
            <div 
              key={sub.id} 
              onClick={() => router.push(`/dashboard/subjects/${sub.id}`)}
              className="group relative h-[450px] bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-purple-500/30 transition-all duration-700 rounded-none cursor-pointer flex flex-col items-center justify-center text-center overflow-hidden"
            >
              {/* تأثير خط إضاءة عند الهوفر */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="text-purple-500 mb-8 transform group-hover:scale-125 transition-transform duration-500">
                {renderIcon(sub.iconType)}
              </div>
              
              <h3 className="text-3xl font-black px-6 group-hover:tracking-widest transition-all duration-500">
                {sub.name}
              </h3>
              
              <div className="mt-10 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400 font-black text-sm tracking-[0.5em] uppercase">
                Open Material
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
