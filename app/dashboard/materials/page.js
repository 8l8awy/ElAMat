"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { FaBook } from "react-icons/fa";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // بنسحب من subjects اللي أنت لسه ضايف فيها المادة
        const q = query(collection(db, "subjects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubjects(data);
      } catch (err) {
        console.error("خطأ في جلب المواد:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (loading) return <div className="text-white text-center pt-20 font-black">جاري تحميل ...</div>;

  return (
    <div className="min-h-screen bg-black p-6 text-white" dir="rtl">
      <div className="max-w-6xl mx-auto pt-10">
        <h1 className="text-3xl font-black mb-10 text-center uppercase italic">
          مواد <span className="text-purple-500">الترم الثاني</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div key={sub.id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] hover:border-purple-500/40 transition-all group relative overflow-hidden shadow-2xl">
              <div className="absolute -right-5 -top-5 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl group-hover:bg-purple-600/15"></div>
              
              <div className="bg-purple-600/10 w-fit p-4 rounded-2xl mb-6 text-purple-500">
                <FaBook size={28} />
              </div>

              <h3 className="text-2xl font-black mb-6 group-hover:text-purple-400 transition-colors">
                {sub.name}
              </h3>

              <button 
                onClick={() => window.location.href = `/dashboard/subjects/${sub.id}`}
                className="w-full bg-white text-black py-4 rounded-2xl font-black hover:bg-purple-600 hover:text-white transition-all shadow-xl active:scale-95"
              >
                دخول المادة
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
