"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { FaFilePdf, FaImage, FaExternalLinkAlt, FaDownload, FaSearch } from "react-icons/fa";
import { Loader2 } from "lucide-react";

function MaterialsContent() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject"); // جلب اسم المادة من الرابط
  
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // للفلترة (ملخص/تكليف)

  useEffect(() => {
    async function fetchMaterials() {
      setLoading(true);
      try {
        const materialsRef = collection(db, "materials");
        let q;

        // إذا كان هناك مادة محددة في الرابط، نجلب موادها فقط
        if (subjectParam) {
          q = query(
            materialsRef, 
            where("subject", "==", subjectParam),
            where("status", "==", "approved") // تأكد من جلب المواد المقبولة فقط
          );
        } else {
          // جلب كل المواد المقبولة
          q = query(materialsRef, where("status", "==", "approved"));
        }

        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // ترتيب يدوي بالأحدث (لضمان الترتيب الصحيح)
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

  // دالة فتح الملف في نافذة جديدة (نفس منطق الأدمن)
  const openFile = (item) => {
    let url = item.fileUrl;
    if (!url && item.files && item.files.length > 0) {
        url = item.files[0].url;
    }

    if (url) {
        window.open(url, '_blank');
    } else {
        alert("لا يوجد ملف للعرض");
    }
  };

  const filteredMaterials = materials.filter(item => {
    if (filter === "summary") return item.type === "summary";
    if (filter === "assignment") return item.type === "assignment";
    return true;
  });

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center text-white">
        <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen text-white" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                {subjectParam ? `📚 ${subjectParam}` : "📚 كل المواد"}
            </h1>
            <p className="text-gray-400 text-sm mt-2">تصفح الملخصات والتكليفات المتاحة</p>
        </div>

        {/* Filters */}
        <div className="bg-[#151720] p-1 rounded-xl border border-gray-800 flex gap-1">
          {[{id: 'all', label: 'الكل'}, {id: 'summary', label: 'ملخصات'}, {id: 'assignment', label: 'تكليفات'}].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === f.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-20 opacity-60">
            <FaSearch className="mx-auto text-6xl mb-4 text-gray-600" />
            <p>لا توجد مواد متاحة حالياً في هذا القسم.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((item) => (
                <div 
                    key={item.id} 
                    onClick={() => openFile(item)} // 👈 الضغط يفتح الملف مباشرة
                    className="bg-[#151720] border border-gray-800 rounded-2xl p-5 hover:border-blue-500/50 hover:bg-[#1a1d29] transition-all cursor-pointer group relative overflow-hidden"
                >
                    <div className={`absolute top-0 right-0 bottom-0 w-1 ${item.type === 'summary' ? 'bg-[#00f260]' : 'bg-[#ffc107]'}`}></div>

                    <div className="flex justify-between items-start mb-4 pr-3">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gray-900 rounded-xl group-hover:scale-110 transition-transform">
                                {(item.fileType === 'pdf' || item.fileUrl?.endsWith('.pdf')) 
                                    ? <FaFilePdf className="text-red-500 w-6 h-6"/> 
                                    : <FaImage className="text-blue-400 w-6 h-6"/>
                                }
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-blue-400 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-500">{item.uploader || 'مجهول'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-400 border-t border-gray-800 pt-4 pr-3">
                        <span className="bg-gray-800 px-2 py-1 rounded">{new Date(item.date).toLocaleDateString('ar-EG')}</span>
                        <span className="flex items-center gap-1 text-blue-400 font-bold">
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

// ✅ تغليف المكون بـ Suspense لحل مشاكل الـ Build مع useSearchParams
export default function MaterialsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center text-white">جاري التحميل...</div>}>
      <MaterialsContent />
    </Suspense>
  );
}
