"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { FaCheck, FaTrash, FaEye, FaFilePdf, FaImage, FaTimes, FaDownload, FaFilter } from "react-icons/fa";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null); 
  const [filter, setFilter] = useState("all"); 

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

  // دوال التحكم (قبول / حذف)
  const handleApprove = async (id) => {
    if (!confirm("نشر هذا الملف للطلاب؟")) return;
    try {
      await updateDoc(doc(db, "materials", id), { status: "approved" });
      setMaterials(prev => prev.map(item => item.id === id ? { ...item, status: "approved" } : item));
    } catch (error) { alert("حدث خطأ"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف نهائي؟ لن يمكن التراجع.")) return;
    try {
      await deleteDoc(doc(db, "materials", id));
      setMaterials(prev => prev.filter(item => item.id !== id));
    } catch (error) { alert("حدث خطأ"); }
  };

  // الفلترة
  const filteredMaterials = materials.filter(item => {
    if (filter === "pending") return item.status !== "approved";
    if (filter === "approved") return item.status === "approved";
    return true;
  });

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-gray-950 text-blue-500"><Loader2 className="animate-spin w-12 h-12 mb-4" /><p>جاري تحميل لوحة التحكم...</p></div>;

  return (
    <div className="min-h-screen bg-[#0b0c15] text-white p-6 lg:p-10 font-sans" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent flex items-center gap-3">
               <span className="bg-blue-600/20 p-2 rounded-lg text-blue-400">🛡️</span> لوحة تحكم الأدمن
            </h1>
            <p className="text-gray-400 mt-2 text-sm">إدارة الملفات والمراجعات والتحكم بالمحتوى</p>
        </div>

        <div className="bg-gray-900 p-1.5 rounded-xl border border-gray-800 flex gap-1">
          {['all', 'pending', 'approved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                filter === f 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {f === 'all' ? 'الكل' : f === 'pending' ? 'قيد المراجعة' : 'المنشورة'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => (
          <div key={item.id} className="bg-[#151720] border border-gray-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all group relative overflow-hidden">
            
            <div className={`absolute top-0 right-0 bottom-0 w-1 ${item.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>

            <div className="flex justify-between items-start mb-4 pr-3">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${item.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {(item.fileType === 'pdf' || item.fileUrl?.endsWith('.pdf')) ? <FaFilePdf size={24} /> : <FaImage size={24} />}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{item.subject} • {new Date(item.createdAt).toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mb-6 pr-3">
                <span className="bg-gray-800 text-gray-400 text-xs px-2.5 py-1 rounded-md border border-gray-700">
                    بواسطة: {item.uploader}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-md border ${item.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
                    {item.status === 'approved' ? 'منشور' : 'بانتظار الموافقة'}
                </span>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                <button 
                    onClick={() => setSelectedFile(item)} 
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                    <FaEye /> معاينة
                </button>

                {item.status !== "approved" && (
                    <button 
                        onClick={() => handleApprove(item.id)} 
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-900/20"
                    >
                        <FaCheck /> قبول
                    </button>
                )}

                <button 
                    onClick={() => handleDelete(item.id)} 
                    className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"
                    title="حذف"
                >
                    <FaTrash size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
          <div className="text-center py-20 opacity-50">
              <FaFilter className="mx-auto text-6xl mb-4 text-gray-600" />
              <p>لا توجد ملفات بهذا التصنيف حالياً</p>
          </div>
      )}

      {/* ==================== Modal (نافذة المعاينة المحدثة) ==================== */}
      {selectedFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#151720] w-full max-w-5xl h-[85vh] rounded-2xl border border-gray-700 flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
              <div>
                  <h3 className="font-bold text-lg text-white">{selectedFile.title}</h3>
                  <p className="text-xs text-gray-400">نوع الملف: {selectedFile.fileType === 'pdf' ? 'PDF Document' : 'Image'}</p>
              </div>
              <button onClick={() => setSelectedFile(null)} className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-red-500 hover:text-white rounded-full transition-colors">
                  <FaTimes />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 bg-gray-950 relative flex items-center justify-center p-4 overflow-hidden">
              
              {/* التغيير هنا: عرض الزر فقط للـ PDF */}
              {(selectedFile.fileType === 'pdf' || selectedFile.fileUrl?.endsWith('.pdf')) ? (
                <div className="flex flex-col items-center justify-center gap-6">
                    <FaFilePdf className="text-gray-700 w-32 h-32 animate-pulse" />
                    
                    {/* 👇👇 الزر الخاص بك هنا 👇👇 */}
                    <button 
                        onClick={() => window.open(selectedFile.fileUrl, '_blank')}
                        style={{
                            background: '#00f260',
                            color: '#000',
                            padding: '12px 30px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            border: 'none',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: '0 0 20px rgba(0, 242, 96, 0.3)'
                        }}
                    >
                        📖 فتح PDF في نافذة جديدة
                    </button>
                    
                    <p className="text-gray-500 text-sm mt-2">سيتم فتح الملف في تبويب جديد للقراءة</p>
                </div>
              ) : (
                /* إذا كان صورة تظهر كما هي */
                <img src={selectedFile.fileUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              )}
              
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center">
               <div className="flex gap-3">
                   {/* زر تحميل إضافي */}
                   <a 
                     href={selectedFile.fileUrl} 
                     target="_blank" 
                     download 
                     className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                   >
                     <FaDownload /> تحميل
                   </a>
               </div>
               <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white text-sm">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
