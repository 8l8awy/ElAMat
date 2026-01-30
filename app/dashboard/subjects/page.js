"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { FaBook, FaLayerGroup, FaChevronLeft, FaInfoCircle } from "react-icons/fa";
import Link from "next/link";

export default function SubjectsPage() {
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(2);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const subjectsBank = {
    year1: {
      1: ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"],
      2: ["محاسبة الشركات", "القانون التجاري", "اقتصاد كلي", "لغة إنجليزية تخصصية", "إدارة التنظيم"]
    },
    year2: { 1: ["مادة تجريبية سنة تانية"], 2: [] },
    year3: { 1: [], 2: [] },
    year4: { 1: [], 2: [] }
  };

  const currentSubjects = subjectsBank[`year${year}`][semester] || [];

  useEffect(() => {
    const q = query(collection(db, "materials"), where("status", "==", "approved"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // --- معالجة البيانات القديمة 👈 ---
        // لو الملف قديم ومافيهوش سنة أو ترم، بنثبتهم على (1 و 2) عشان يظهروا
        const itemYear = data.year || 1; 
        const itemSemester = data.semester || 2;
        const itemName = data.subject?.trim();

        const subjectKey = `${itemName}_${itemSemester}_${itemYear}`;
        
        if (!counts[subjectKey]) {
          counts[subjectKey] = { summaries: 0, assignments: 0 };
        }
        
        if (data.type === 'summary') {
          counts[subjectKey].summaries += 1;
        } else if (data.type === 'assignment') {
          counts[subjectKey].assignments += 1;
        }
      });
      
      setStats(counts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen text-white p-4 md:p-10 relative z-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* الهيدر */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white">المواد الدراسية</h1>
            <p className="text-purple-400 font-bold uppercase tracking-widest text-xs mt-2 flex items-center gap-2 opacity-80">
              <FaLayerGroup/> نظام العد الذكي للمحتوى القديم والجديد
            </p>
          </div>

          {/* أزرار التحكم */}
          <div className="flex flex-wrap gap-4 bg-white/[0.02] backdrop-blur-xl p-2 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex bg-black/40 p-1 rounded-xl gap-1">
              {[1, 2, 3, 4].map(y => (
                <button key={y} onClick={() => setYear(y)} className={`px-4 py-2 rounded-lg font-black text-xs transition-all ${year === y ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}>
                  فرقة {y}
                </button>
              ))}
            </div>
            <div className="flex bg-black/40 p-1 rounded-xl gap-1">
              {[1, 2].map(s => (
                <button key={s} onClick={() => setSemester(s)} className={`px-4 py-2 rounded-lg font-black text-xs transition-all ${semester === s ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}>
                  ترم {s === 1 ? 'أول' : 'ثاني'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* شبكة المواد */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentSubjects.map((subjectName) => {
            const subjectKey = `${subjectName.trim()}_${semester}_${year}`;
            const subjectStats = stats[subjectKey] || { summaries: 0, assignments: 0 };

            return (
              <Link 
                href={`/dashboard/subjects/details?name=${encodeURIComponent(subjectName)}&year=${year}&semester=${semester}`} 
                key={subjectName}
                className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] hover:border-purple-500/40 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600/20 transition-all shadow-inner">
                    <FaBook className="text-purple-500 text-xl" />
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-black text-white mb-6 leading-tight group-hover:text-purple-400 transition-colors">{subjectName}</h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-2xl p-4 text-center group-hover:bg-purple-500/10 transition-colors">
                      <span className="block text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1 opacity-70">ملخصات</span>
                      <span className="text-xl font-black text-white tracking-tighter">{subjectStats.summaries}</span>
                    </div>
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 text-center group-hover:bg-blue-500/10 transition-colors">
                      <span className="block text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 opacity-70">تكليفات</span>
                      <span className="text-xl font-black text-white tracking-tighter">{subjectStats.assignments}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] pt-4 border-t border-white/5 group-hover:text-white transition-colors">
                    <span>فتح المادة</span>
                    <FaChevronLeft className="group-hover:translate-x-[-5px] transition-transform text-purple-500" />
                  </div>
                </div>

                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl group-hover:bg-purple-600/15 transition-all"></div>
              </Link>
            );
          })}
        </div>

        {currentSubjects.length === 0 && (
          <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem] py-32 text-center">
            <FaInfoCircle className="mx-auto text-gray-700 text-3xl mb-4" />
            <p className="text-gray-600 font-black italic tracking-widest uppercase text-sm">لا توجد مواد مضافة في هذا القسم</p>
          </div>
        )}
      </div>
    </div>
  );
}
