"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { FaCheck, FaTrash, FaEye, FaFilePdf, FaImage, FaTimes, FaDownload, FaSearch } from "react-icons/fa";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null); // للمودال
  const [filter, setFilter] = useState("all"); // all, pending, approved

  // جلب البيانات
  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaterials(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // دالة قبول الملف
  const handleApprove = async (id) => {
    if (!confirm("هل أنت متأكد من قبول ونشر هذا الملف؟")) return;
    try {
      await updateDoc(doc(db, "materials", id), { status: "approved" });
      setMaterials(prev => prev.map(item => item.id === id ? { ...item, status: "approved" } : item));
      alert("تم النشر بنجاح ✅");
    } catch (error) {
      alert("حدث خطأ");
    }
  };

  // دالة حذف الملف
  const handleDelete = async (id) => {
    if (!confirm("تحذير: سيتم حذف الملف نهائياً!")) return;
    try {
      await deleteDoc(doc(db, "materials", id));
      setMaterials(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      alert("حدث خطأ");
    }
  };

  // تصفية النتائج
  const filteredMaterials = materials.filter(item => {
    if (filter === "pending") return item.status !== "approved";
    if (filter === "approved") return item.status === "approved";
    return true;
  });

  if (loading) return <div className="h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin w-10 h-10" /></div>;

  return (
    <div className="p-6 bg-gray-950 min-h-screen text-white" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">لوحة تحكم الأدمن 🛡️</h1>
        <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
          <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-md ${filter === "all" ? "bg-blue-600" : "hover:bg-gray-800"}`}>الكل</button>
          <button onClick={() => setFilter("pending")} className={`px-4 py-2 rounded-md ${filter === "pending" ? "bg-yellow-600" : "hover:bg-gray-800"}`}>قيد المراجعة</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => (
          <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-500/50 transition-all relative group">
            
            {/* حالة الملف */}
            <div className={`absolute top-4 left-4 text-xs font-bold px-2 py-1 rounded ${item.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {item.status === 'approved' ? 'منشور' : 'قيد المراجعة'}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-800 rounded-full">
                 {/* كشف نوع الملف للعرض */}
                {(item.fileType === 'pdf' || item.fileUrl?.endsWith('.pdf')) ? <FaFilePdf className="text-red-500 w-6 h-6" /> : <FaImage className="text-blue-400 w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-lg line-clamp-1">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.uploader} • {item.subject}</p>
              </div>
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800">
              <button onClick={() => setSelectedFile(item)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <FaEye /> معاينة
              </button>
              
              {item.status !== "approved" && (
                <button onClick={() => handleApprove(item.id)} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <FaCheck /> قبول
                </button>
              )}
              
              <button onClick={() => handleDelete(item.id)} className="px-3 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-colors">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== نافذة المعاينة (MODAL) ==================== */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gray-900 w-full max-w-4xl rounded-2xl border border-gray-700 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* رأس النافذة */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
              <h3 className="font-bold text-lg">{selectedFile.title}</h3>
              <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-gray-800 rounded-full"><FaTimes /></button>
            </div>

            {/* جسم النافذة (مكان عرض الملف) */}
            <div className="flex-1 overflow-auto bg-gray-800 p-4 flex items-center justify-center">
              
              {/* 1. إذا كان PDF */}
              {(selectedFile.fileType === 'pdf' || selectedFile.fileUrl?.endsWith('.pdf')) ? (
                <iframe 
                  src={selectedFile.fileUrl} 
                  className="w-full h-[600px] rounded-lg border border-gray-700 bg-white"
                  title="PDF Viewer"
                />
              ) : (
                /* 2. إذا كان صورة */
                <img src={selectedFile.fileUrl} alt="preview" className="max-w-full max-h-[600px] object-contain rounded-lg" />
              )}
              
            </div>

            {/* ذيل النافذة */}
            <div className="p-4 border-t border-gray-800 bg-gray-950 flex justify-between">
               <a href={selectedFile.fileUrl} target="_blank" download className="bg-blue-600 px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-500 text-white">
                 <FaDownload /> تحميل الملف الأصلي
               </a>
               <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
