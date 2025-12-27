"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { FaFilePdf, FaImage, FaExternalLinkAlt, FaSearch, FaEye, FaDownload, FaFilter } from "react-icons/fa";
import { Loader2 } from "lucide-react";

function MaterialsContent() {
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const normalizeType = (type) => {
    if (!type) return "summary";
    const t = type.toString().trim().toLowerCase();
    if (["assignment", "تكليف", "تكاليف", "واجب"].some(x => t.includes(x))) return "assignment";
    return "summary";
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const materialsRef = collection(db, "materials");
        let q;
        if (subject) {
          q = query(materialsRef, where("subject", "==", subject), where("status", "==", "approved"));
        } else {
          q = query(materialsRef, where("status", "==", "approved"));
        }
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
            id: doc.id, ...doc.data(), type: normalizeType(doc.data().type)
        }));
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMaterials(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchData();
  }, [subject]);

  const openFile = async (item) => {
    let url = item.fileUrl || (item.files && item.files[0]?.url);
    if (url) {
        window.open(url, '_blank');
        try {
            await updateDoc(doc(db, "materials", item.id), { viewCount: increment(1), downloadCount: increment(1) });
        } catch (err) { console.error(err); }
    } else { alert("لا يوجد رابط صالح."); }
  };

  const filteredMaterials = materials.filter(item => filter === "all" ? true : item.type === filter);

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#0b0c15] text-white"><Loader2 className="animate-spin w-10 h-10 text-blue-500" /></div>;

  return (
    <div className="min-h-screen w-full bg-[#0b0c15] text-white p-4 md:p-8 font-sans" dir="rtl">
      
      {/* 1. الهيدر وأزرار الفلتر */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800 pb-6">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-blue-500">📂</span> 
                {subject ? subject : "المكتبة الشاملة"}
            </h1>
            <p className="text-gray-400 text-sm">عدد الملفات المتاحة: {filteredMaterials.length}</p>
        </div>

        {/* تصميم جديد لأزرار الفلتر (صغير ومتناسق) */}
        <div className="bg-[#1a1d2d] p-1 rounded-lg flex items-center gap-1 border border-gray-700">
          {[
            {id: 'all', label: 'الكل', icon: <FaFilter size={12}/>}, 
            {id: 'summary', label: 'ملخصات', icon: <FaFilePdf size={12}/>}, 
            {id: 'assignment', label: 'تكليفات', icon: <FaImage size={12}/>}
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === f.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. شبكة عرض المواد (Grid Layout Fix) */}
      {filteredMaterials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <FaSearch className="text-5xl mb-4 opacity-50" />
            <p>لا توجد ملفات مطابقة للبحث.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMaterials.map((item) => (
                <div 
                    key={item.id} 
                    onClick={() => openFile(item)}
                    className="group relative bg-[#151720] border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-blue-500/40 hover:bg-[#1b1e2b] transition-all duration-300 hover:-translate-y-1 shadow-lg overflow-hidden"
                >
                    {/* شريط ملون جانبي */}
                    <div className={`absolute top-0 right-0 h-full w-1 ${item.type === 'summary' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>

                    <div className="flex items-start gap-4 mb-4 pr-3">
                        {/* أيقونة الملف */}
                        <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center border border-gray-700 group-hover:scale-105 transition-transform">
                            {(item.fileType === 'pdf' || item.fileUrl?.endsWith('.pdf')) 
                                ? <FaFilePdf className="text-red-500 text-xl"/> 
                                : <FaImage className="text-blue-400 text-xl"/>
                            }
                        </div>
                        
                        {/* العنوان والتفاصيل */}
                        <div className="flex-1">
                            <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
                                    {item.uploader || 'Admin'}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded border ${
                                    item.type === 'summary' 
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                }`}>
                                    {item.type === 'summary' ? 'ملخص' : 'تكليف'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* الفوتر: التاريخ وزر الفتح */}
                    <div className="flex justify-between items-center border-t border-gray-800 pt-4 mt-2 pr-3">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><FaEye/> {item.viewCount||0}</span>
                            <span className="flex items-center gap-1"><FaDownload/> {item.downloadCount||0}</span>
                        </div>
                        
                        <button className="flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:text-white bg-blue-500/10 group-hover:bg-blue-600 px-3 py-1.5 rounded-full transition-all">
                            فتح الملف <FaExternalLinkAlt size={10} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-[#0b0c15] text-white">جاري التحميل...</div>}>
      <MaterialsContent />
    </Suspense>
  );
}
