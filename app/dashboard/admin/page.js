"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { FaCheck, FaTrash, FaEye, FaFilePdf, FaImage, FaTimes, FaDownload, FaExclamationTriangle, FaUser, FaThumbtack } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export default function AdminDashboard() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null); 
  const [filter, setFilter] = useState("all"); 
  const [downloading, setDownloading] = useState(false);

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

  // دوال التحكم
  const handleApprove = async (id, e) => {
    if(e) e.stopPropagation(); 
    if (!confirm("هل أنت متأكد من قبول هذا الملف ونشره؟")) return;
    try {
      await updateDoc(doc(db, "materials", id), { status: "approved" });
      setMaterials(prev => prev.map(item => item.id === id ? { ...item, status: "approved" } : item));
      if(selectedFile?.id === id) setSelectedFile(null); // إغلاق النافذة
    } catch (error) { alert("حدث خطأ"); }
  };

  const handleDelete = async (id, e) => {
    if(e) e.stopPropagation();
    if (!confirm("حذف نهائي؟ لا يمكن التراجع.")) return;
    try {
      await deleteDoc(doc(db, "materials", id));
      setMaterials(prev => prev.filter(item => item.id !== id));
      if(selectedFile?.id === id) setSelectedFile(null);
    } catch (error) { alert("حدث خطأ"); }
  };

  const handleDownload = async (fileUrl, title, fileType) => {
    setDownloading(true);
    try {
        if (fileType === 'pdf' || fileUrl.endsWith('.pdf')) {
            saveAs(fileUrl, `${title}.pdf`);
        } else {
            saveAs(fileUrl, `${title}.jpg`); // تحميل الصورة مباشرة
        }
    } catch (error) {
        alert("فشل التحميل.");
    } finally {
        setDownloading(false);
    }
  };

  // تصفية الطلبات المعلقة
  const pendingMaterials = materials.filter(item => item.status !== "approved");
  
  const filteredMaterials = materials.filter(item => {
    if (filter === "pending") return item.status !== "approved";
    if (filter === "approved") return item.status === "approved";
    return true;
  });

  if (loading) return <div className="h-screen flex flex-col items-center justify-center bg-[#0b0c15] text-blue-500"><Loader2 className="animate-spin w-12 h-12 mb-4" /><p>جاري تحميل لوحة التحكم...</p></div>;

  return (
    <div className="min-h-screen bg-[#0b0c15] text-white p-6 lg:p-10 font-sans" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
           <span className="text-blue-500">🛡️</span> لوحة تحكم الأدمن
        </h1>
        <div className="bg-gray-900 p-1 rounded-xl border border-gray-800 flex gap-1">
          {['all', 'pending', 'approved'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {f === 'all' ? 'الكل' : f === 'pending' ? 'قيد المراجعة' : 'المنشورة'}
            </button>
          ))}
        </div>
      </div>

      {/* ==================== قسم الطلبات قيد الانتظار (التصميم الجديد) ==================== */}
      {pendingMaterials.length > 0 && (
        <div className="mb-10 animate-fadeIn">
            <div className="border border-yellow-600/30 bg-yellow-500/5 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                    <FaExclamationTriangle /> طلبات قيد الانتظار ({pendingMaterials.length})
                </h2>
                
                <div className="space-y-3">
                    {pendingMaterials.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedFile(item)} // 👈 هذا يفتح المعاينة عند الضغط
                            className="bg-[#1a1d2d] hover:bg-[#23263a] border border-gray-700 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 cursor-pointer transition-all group"
                        >
                            {/* معلومات الملف (يمين) */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="p-3 bg-gray-800 rounded-lg">
                                    {(item.fileType === 'pdf' || item.fileUrl?.endsWith('.pdf')) ? <FaFilePdf className="text-red-500 w-6 h-6"/> : <FaImage className="text-blue-400 w-6 h-6"/>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                                        <span className="flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded"><FaUser size={10}/> {item.uploader}</span>
                                        <span className="flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded text-pink-400"><FaThumbtack size={10}/> {item.subject}</span>
                                    </div>
                                </div>
                            </div>

                            {/* أزرار الإجراءات (يسار) */}
                            <div className="flex gap-2 w-full md:w-auto pl-2">
                                <button 
                                    onClick={(e) => handleApprove(item.id, e)}
                                    className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm shadow-lg shadow-green-900/20"
                                >
                                    <FaCheck /> قبول
                                </button>
                                <button 
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm border border-red-500/20"
                                >
                                    <FaTimes /> رفض
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* ==================== شبكة باقي الملفات ==================== */}
      <h3 className="text-lg font-bold text-gray-400 mb-4 border-b border-gray-800 pb-2">سجل الملفات</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => (
          <div key={item.id} className="bg-[#151720] border border-gray-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all relative overflow-hidden">
            <div className={`absolute top-0 right-0 bottom-0 w-1 ${item.status === 'approved' ? 'bg-green-500' : 'bg-gray-700'}`}></div>

            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gray-900 rounded-xl">
                    {(item.fileType === 'pdf' || item.fileUrl?.endsWith('.pdf')) ? <FaFilePdf className="text-red-500 w-6 h-6"/> : <FaImage className="text-blue-400 w-6 h-6"/>}
                </div>
                <div>
                    <h3 className="font-bold text-white line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-500">{item.subject}</p>
                </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-800">
                <button onClick={() => setSelectedFile(item)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                    <FaEye /> معاينة
                </button>
                {item.status !== "approved" && (
                     <button onClick={(e) => handleApprove(item.id, e)} className="flex-1 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                        <FaCheck /> قبول
                    </button>
                )}
                <button onClick={(e) => handleDelete(item.id, e)} className="w-9 h-9 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
                    <FaTrash size={14} />
                </button>
            </div>
          </div>
        ))}
      </div>

      {/* ==================== نافذة المعاينة (MODAL) ==================== */}
      {selectedFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#151720] w-full max-w-5xl h-[90vh] rounded-2xl border border-gray-700 flex flex-col shadow-2xl overflow-hidden relative">
            
            {/* زر الإغلاق العائم */}
            <button onClick={() => setSelectedFile(null)} className="absolute top-4 left-4 z-50 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors">
                <FaTimes size={20} />
            </button>

            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900 text-center">
                <h3 className="font-bold text-lg text-white">{selectedFile.title}</h3>
                <p className="text-sm text-gray-400">{selectedFile.subject} • {selectedFile.uploader}</p>
            </div>

            {/* Body: المعاينة */}
            <div className="flex-1 bg-gray-950 flex items-center justify-center p-4 overflow-hidden relative">
              {(selectedFile.fileType === 'pdf' || selectedFile.fileUrl?.endsWith('.pdf')) ? (
                <div className="text-center">
                    <FaFilePdf className="text-gray-700 w-24 h-24 mx-auto mb-4 animate-pulse" />
                    <button 
                        onClick={() => window.open(selectedFile.fileUrl, '_blank')}
                        className="bg-[#00f260] text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,242,96,0.3)]"
                    >
                        📖 فتح PDF في صفحة جديدة
                    </button>
                </div>
              ) : (
                <img src={selectedFile.fileUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              )}
            </div>

            {/* Footer: الإجراءات */}
            <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center">
               <div className="flex gap-3">
                   {selectedFile.status !== "approved" && (
                       <button 
                         onClick={() => handleApprove(selectedFile.id)}
                         className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-900/20"
                       >
                         <FaCheck /> قبول ونشر
                       </button>
                   )}
                   <button 
                     onClick={() => handleDownload(selectedFile.fileUrl, selectedFile.title, selectedFile.fileType)}
                     disabled={downloading}
                     className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
                   >
                     {downloading ? <Loader2 className="animate-spin" size={18}/> : <FaDownload size={18}/>} تحميل
                   </button>
               </div>
               
               <button onClick={() => handleDelete(selectedFile.id)} className="text-red-500 hover:bg-red-500/10 px-5 py-2.5 rounded-xl font-bold transition-colors">
                   حذف الملف
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
