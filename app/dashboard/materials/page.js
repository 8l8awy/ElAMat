"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaFilePdf, FaImage, FaExternalLinkAlt, FaSearch } from "react-icons/fa";
import { Loader2 } from "lucide-react";

// مكون المحتوى الداخلي
function MaterialsContent() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject");
  
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 

  useEffect(() => {
    async function fetchMaterials() {
      setLoading(true);
      try {
        const materialsRef = collection(db, "materials");
        let q;

        // جلب المواد (Approved) فقط
        if (subjectParam) {
          q = query(
            materialsRef, 
            where("subject", "==", subjectParam),
            where("status", "==", "approved") 
          );
        } else {
          q = query(materialsRef, where("status", "==", "approved"));
        }

        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // ترتيب: الأحدث أولاً
        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        setMaterials(data);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMaterials();
  }, [subjectParam]);

  // دالة الفتح المباشر
  const openFile = (item) => {
    let url = item.fileUrl;
    if (!url && item.files && item.files.length > 0) {
        url = item.files[0].url;
    }

    if (url) {
        window.open(url, '_blank');
    } else {
        alert("عذراً، لا يوجد رابط لهذا الملف.");
    }
  };

  const filteredMaterials = materials.filter(item => {
    if (filter === "summary") return item.type === "summary";
    if (filter === "assignment") return item.type === "assignment";
    return true;
  });

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#0b0c15] text-white">
        <Loader2 className="animate-spin w-12 h-12 text-blue-500" />
        <span className="mr-3">جاري التحميل...</span>
    </div>
  );

  return (
    // الخلفية السوداء محددة هنا بوضوح 👇
    <div className="min-h-screen w-full bg-[#0b0c15] text-white p-6 lg:p-10 font-sans" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
            {/* 👇 العنوان المميز للتأكد من التحديث */}
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
                {subjectParam ? `📚 ${subjectParam}` : "📚 كل المواد (تم التحديث ✅)"}
            </h1>
            <p className="text-gray-400 text-sm">تصفح وحمل الملخصات والتكليفات الدراسية</p>
        </div>

        {/* أزرار الفلتر */}
        <div className="bg-[#151720] p-1.5 rounded-xl border border-gray-800 flex gap-1 shadow-lg">
          {[{id: 'all', label: 'الكل'}, {id: 'summary', label: 'ملخصات'}, {id: 'assignment', label: 'تكليفات'}].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                filter === f.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* المحتوى */}
      {filteredMaterials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50 border border-dashed border-gray-800 rounded-3xl bg-[#151720]/50">
            <FaSearch className="text-6xl mb-4 text-gray-600" />
            <p className="text-xl font-medium text-gray-400">لا توجد ملفات متاحة حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMaterials.map((item) => (
                <div 
                    key={item.id} 
                    onClick={() => openFile(item)}
                    className="bg-[#151720] border border-gray-800 rounded-2xl p-5 hover:border-blue-500/50 hover:bg-[#1a1d29] hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden shadow-xl"
                >
                    <div className={`absolute top-0 right-0 bottom-0 w-1.5 ${item.type === 'summary' ? 'bg-[#00f260]' : 'bg-[#ffc107]'}`}></div>

                    <div className="flex justify-between items-start mb-4 pr-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-gray-900 rounded-xl group-hover:scale-110 transition-transform shadow-inner border border-gray-800">
                                {(item.fileType === 'pdf' || item.fileUrl?.endsWith('.pdf')) 
                                    ? <FaFilePdf className="text-red-500 w-7 h-7"/> 
                                    : <FaImage className="text-blue-400 w-7 h-7"/>
                                }
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-blue-400 transition-colors">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                                        {item.uploader || 'Admin'}
                                    </span>
                                    {item.type === 'summary' 
                                        ? <span className="text-[10px] text-[#00f260] bg-[#00f260]/10 px-2 py-0.5 rounded">ملخص</span>
                                        : <span className="text-[10px] text-[#ffc107] bg-[#ffc107]/10 px-2 py-0.5 rounded">تكليف</span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-800 pt-4 pr-4 mt-2">
                        <span className="font-mono">{new Date(item.date).toLocaleDateString('ar-EG')}</span>
                        <span className="flex items-center gap-1.5 text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all font-bold">
                            فتح الملف <FaExternalLinkAlt size={10} />
                        </span>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

// التغليف النهائي
export default function MaterialsPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-[#0b0c15] text-white">جاري إعداد الصفحة...</div>}>
      <MaterialsContent />
    </Suspense>
  );
}
