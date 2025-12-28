"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // لاستقبال اسم المادة من الرابط
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { FaFilePdf, FaFileImage, FaDownload, FaEye, FaUser, FaSearch } from "react-icons/fa";

export default function MaterialsPage() {
  const searchParams = useSearchParams();
  const subjectQuery = searchParams.get("subject"); // جلب المادة المختارة

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchMaterials() {
      try {
        let q;
        // إذا تم اختيار مادة محددة، نجلب موادها فقط
        if (subjectQuery) {
          q = query(
            collection(db, "materials"),
            where("status", "==", "approved"),
            where("subject", "==", subjectQuery),
            orderBy("createdAt", "desc")
          );
        } else {
          // وإلا نجلب كل المواد
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

  // تصفية البحث
  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openFile = (url) => {
    if(url) window.open(url, "_blank");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="animate-pulse">جاري تحميل المحتوى...</div>
    </div>
  );

  return (
    <div className="min-h-screen w-full text-white p-4 font-sans relative overflow-hidden" dir="rtl">
      
      {/* خلفية */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto pt-6">
        
        {/* العنوان والبحث */}
        <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
               {subjectQuery || "المكتبة الشاملة"}
            </h1>
            
            <div className="relative max-w-md mx-auto">
                <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"/>
                <input 
                  type="text" 
                  placeholder="ابحث عن ملخص..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 pr-12 pl-4 text-white focus:border-blue-500 outline-none transition-all placeholder-gray-500 backdrop-blur-md"
                />
            </div>
        </div>

        {/* شبكة البطاقات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-500 bg-white/5 rounded-3xl border border-white/5">
                    لا توجد ملفات متاحة حالياً.
                </div>
            ) : (
                filteredMaterials.map((item) => (
                    <div key={item.id} className="group bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-white/10 hover:border-white/20 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col">
                        
                        {/* الجزء العلوي: الأيقونة والعنوان */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl ${item.type === 'summary' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                {item.files && item.files[0]?.type?.includes('pdf') ? <FaFilePdf /> : <FaFileImage />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-white leading-tight mb-1 line-clamp-2">{item.title}</h3>
                                <span className="text-xs text-gray-400 bg-black/20 px-2 py-1 rounded-md">{item.subject}</span>
                            </div>
                        </div>

                        {/* الجزء السفلي: الناشر والأزرار */}
                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                            
                            {/* 👇👇 هنا يظهر اسم الناشر 👇👇 */}
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px]">
                                    <FaUser />
                                </div>
                                <span className="max-w-[80px] truncate">
                                    {item.studentName || item.uploader || "Admin"}
                                </span>
                            </div>

                            {/* أزرار التحميل والمعاينة */}
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => openFile(item.files[0]?.url)}
                                    className="bg-white/10 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                                    title="معاينة"
                                >
                                    <FaEye />
                                </button>
                                {/* زر التحميل المباشر يمكن إضافته هنا إذا أردت */}
                            </div>
                        </div>

                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
}
