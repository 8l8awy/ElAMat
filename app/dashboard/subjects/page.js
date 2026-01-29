"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import { 
  FaBook, FaBalanceScale, FaCalculator, FaGavel, 
  FaChartBar, FaExchangeAlt, FaChevronLeft 
} from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(2);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const renderIcon = (iconType) => {
    switch (iconType) {
      case "balance": return <FaBalanceScale size={32} />;
      case "calculator": return <FaCalculator size={32} />;
      case "gavel": return <FaGavel size={32} />;
      case "chart": return <FaChartBar size={32} />;
      default: return <FaBook size={32} />;
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "subjects"), 
          where("semester", "==", currentSemester),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubjects(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchSubjects();
  }, [currentSemester]);

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden font-sans">
      
      {/* 🌌 خلفية سينمائية - Glow Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full px-6 md:px-12 pt-24 pb-20">
        
        {/* Header Section - تصميم واسع */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20 max-w-[1600px] mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <span className="h-[2px] w-12 bg-purple-500 rounded-full"></span>
               <span className="text-purple-500 font-black tracking-[0.3em] text-sm uppercase">منصة العجمي</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              المواد <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">الدراسية</span>
            </h1>
          </div>

          <button 
            onClick={() => setCurrentSemester(currentSemester === 1 ? 2 : 1)}
            className="group relative flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 px-8 py-5 rounded-2xl font-black overflow-hidden transition-all hover:border-purple-500/50"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <FaExchangeAlt className="text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-lg">الترم {currentSemester === 1 ? "الثاني" : "الأول"}</span>
          </button>
        </div>

        {/* Grid - توزيع مفتوح مريح للشاشة */}
        {loading ? (
          <div className="flex justify-center py-40">
             <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 max-w-[1800px] mx-auto">
            {subjects.map((sub) => (
              <div 
                key={sub.id} 
                className="group relative bg-white/[0.02] backdrop-blur-sm border border-white/5 p-10 rounded-[2.5rem] hover:bg-white/[0.04] hover:border-purple-500/20 transition-all duration-500 flex flex-col justify-between min-h-[380px]"
              >
                {/* دبل جلو عند الهوفر */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="relative z-10">
                  <div className="text-purple-500 mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 inline-block">
                    {renderIcon(sub.iconType)}
                  </div>
                  <h3 className="text-3xl font-black leading-tight mb-4 text-gray-100 group-hover:text-white">
                    {sub.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    متاحة الآن
                  </div>
                </div>

                <button 
                  onClick={() => router.push(`/dashboard/subjects/${sub.id}`)}
                  className="relative z-10 mt-12 w-full flex items-center justify-between bg-white text-black py-5 px-8 rounded-2xl font-black hover:bg-purple-600 hover:text-white transition-all duration-300 group/btn"
                >
                  <span>استعراض المحتوى</span>
                  <FaChevronLeft className="group-hover/btn:-translate-x-2 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && subjects.length === 0 && (
          <div className="text-center py-40 opacity-30">
            <FaBook size={80} className="mx-auto mb-6" />
            <h2 className="text-3xl font-black">لا توجد كروت حالياً</h2>
          </div>
        )}
      </div>
    </div>
  );
}
