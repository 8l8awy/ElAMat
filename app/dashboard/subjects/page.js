"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import { 
  FaBook, 
  FaBalanceScale, 
  FaCalculator, 
  FaGavel, 
  FaChartBar, 
  FaExchangeAlt,
  FaArrowLeft
} from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(2); // يبدأ بالترم الثاني تلقائياً
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // دالة لاختيار الأيقونة الصحيحة بناءً على ما تم تخزينه في Firebase
  const renderIcon = (iconType) => {
    const iconStyle = { size: 28 };
    switch (iconType) {
      case "balance": return <FaBalanceScale {...iconStyle} />;
      case "calculator": return <FaCalculator {...iconStyle} />;
      case "gavel": return <FaGavel {...iconStyle} />;
      case "chart": return <FaChartBar {...iconStyle} />;
      default: return <FaBook {...iconStyle} />;
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        // جلب المواد بناءً على رقم الترم المختار
        const q = query(
          collection(db, "subjects"), 
          where("semester", "==", currentSemester),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubjects(data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [currentSemester]);

  return (
    <div className="min-h-screen bg-black p-6 text-white overflow-hidden relative" dir="rtl">
      
      {/* لمسات جمالية في الخلفية */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto pt-10 relative z-10">
        
        {/* الهيدر وزر التبديل */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">
              مواد <span className="text-purple-500">الترم {currentSemester === 1 ? "الأول" : "الثاني"}</span>
            </h1>
            <p className="text-gray-500 font-bold mt-2 mr-1 text-sm uppercase tracking-widest">
              إجمالي المواد المتاحة: {subjects.length}
            </p>
          </div>

          <button 
            onClick={() => setCurrentSemester(currentSemester === 1 ? 2 : 1)}
            className="flex items-center gap-4 bg-[#0a0a0a] border border-white/5 px-8 py-4 rounded-[2rem] font-black hover:bg-purple-600 transition-all group shadow-2xl active:scale-95"
          >
            <FaExchangeAlt className="text-purple-500 group-hover:text-white transition-colors" />
            <span>تبديل لـ {currentSemester === 1 ? "الترم الثاني" : "الترم الأول"}</span>
          </button>
        </div>

        {/* شبكة المواد */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <div className="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
             <p className="text-gray-500 font-black animate-pulse text-lg">جاري استدعاء الكروت...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((sub) => (
              <div 
                key={sub.id} 
                className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[3rem] hover:border-purple-500/30 transition-all group relative overflow-hidden shadow-2xl flex flex-col justify-between h-full"
              >
                {/* توهج خلف الأيقونة */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl group-hover:bg-purple-600/10 transition-all"></div>
                
                <div>
                  <div className="bg-purple-600/10 w-fit p-5 rounded-[1.5rem] mb-8 text-purple-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {renderIcon(sub.iconType)}
                  </div>

                  <h3 className="text-3xl font-black mb-10 leading-[1.2] group-hover:text-purple-400 transition-colors">
                    {sub.name}
                  </h3>
                </div>

                <button 
                  onClick={() => router.push(`/dashboard/subjects/${sub.id}`)}
                  className="w-full bg-white text-black py-5 rounded-[1.8rem] font-black hover:bg-purple-600 hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 group/btn active:scale-95"
                >
                  <span>دخول المادة</span>
                  <FaArrowLeft className="text-xs group-hover/btn:-translate-x-2 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* حالة عدم وجود مواد */}
        {!loading && subjects.length === 0 && (
          <div className="text-center py-32 bg-[#0a0a0a] rounded-[4rem] border border-dashed border-white/10">
            <FaBook className="mx-auto text-5xl text-gray-800 mb-6" />
            <h2 className="text-2xl font-black text-gray-600">عفواً  ، لا توجد مواد حالياً</h2>
            <p className="text-gray-700 mt-2 font-bold">تأكد من اختيار الترم الصحيح أو إضافة مواد جديدة.</p>
          </div>
        )}
      </div>
    </div>
  );
}
