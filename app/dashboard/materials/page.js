"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; 
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { FaFilePdf, FaFileImage, FaEye, FaUser, FaSearch, FaLayerGroup } from "react-icons/fa";

export default function MaterialsPage() {
  const searchParams = useSearchParams();
  const subjectQuery = searchParams.get("subject"); // جلب اسم المادة من الرابط

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchMaterials() {
      try {
        let q;
        // إذا اختار الطالب مادة معينة من الصفحة الرئيسية، نجلب موادها فقط
        if (subjectQuery) {
          q = query(
            collection(db, "materials"),
            where("status", "==", "approved"),
            where("subject", "==", subjectQuery),
            orderBy("createdAt", "desc")
          );
        } else {
          // وإلا نجلب كل المواد الموجودة
          q = query(
            collection(db, "materials"),
            where("status", "==", "approved"),
            orderBy("createdAt", "desc")
          );
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMaterials(data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMaterials();
  }, [subjectQuery]);

  // تصفية المواد بناءً على البحث
  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openFile = (url) => {
    if(url) window.open(url, "_blank");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-white bg-[#0f1016]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p>جاري تحميل المحتوى...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full text-white p-4 font-sans relative overflow-hidden bg-[#0f1016]" dir="rtl">
      
      {/* خلفية تفاعلية */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto pt-6">
        
        {/* العنوان وشريط البحث */}
        <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
               {subjectQuery || "المكتبة الشاملة"}
            </h1>
            
            <div className="relative max-w-md mx-auto">
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input 
                  type="text" 
                  placeholder="ابحث عن اسم الملخص..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-white focus:border-blue-500 outline-none transition-all placeholder-gray-500 backdrop-blur-md shadow-lg focus:bg-white/10"
                />
            </div>
        </div>

        {/* شبكة البطاقات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
            {filteredMaterials.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-white/5">
                    <FaLayerGroup className="text-4xl mb-2 opacity-50"/>
                    <p>لا توجد ملفات متاحة حالياً.</p>
                </div>
            ) : (
                filteredMaterials.map((item) => (
                    <div key={item.id} className="group bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-white/10 hover:border-white/20 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col relative overflow-hidden">
                        
                        {/* إضاءة خلفية خفيفة عند التحويم */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        {/* الجزء العلوي: الأيقونة والعنوان */}
                        <div className="relative flex items-start gap-4 mb-4">
                            <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${item.type === 'summary' ? 'bg-green-500/10 text-green-400 border border-green-500/10' : 'bg-orange-500/10 text-orange-400 border border-orange-500/10'}`}>
                                {item.files && item.files[0]?.type?.includes('pdf') ? <FaFilePdf /> : <FaFileImage />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white leading-snug mb-1 line-clamp-2 group-hover:text-blue-200 transition-colors">{item.title}</h3>
                                <span className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded-lg border border-white/5">{item.subject}</span>
                            </div>
                        </div>

                        {/* الجزء السفلي: الناشر والأزرار */}
                        <div className="relative mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                            
                            {/* 👇 عرض اسم الناشر (الطالب أو الأدمن) */}
                            <div className="flex items-center gap-2 text-xs text-gray-400 bg-black/20 py-1.5 px-3 rounded-full border border-white/5">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[9px] shadow-sm">
                                    <FaUser />
                                </div>
                                <span className="max-w-[100px] truncate font-medium">
                                    {item.studentName || item.uploader || "Admin"}
                                </span>
                            </div>

                            {/* زر المعاينة */}
                            <button 
                                onClick={() => openFile(item.files[0]?.url)}
                                className="bg-white/10 hover:bg-blue-600 hover:text-white text-gray-300 p-2.5 rounded-xl transition-all shadow-sm hover:shadow-blue-500/30 flex items-center gap-2 text-sm font-bold"
                            >
                                <span className="hidden md:inline">عرض</span> <FaEye />
                            </button>
                        </div>

                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
}
