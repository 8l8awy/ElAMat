"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaCloudUploadAlt, FaCheckCircle, FaHourglassHalf, FaEye, FaDownload, FaFilePdf, FaImage, FaTimes } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function MyUploadsPage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null); // للمعاينة

  useEffect(() => {
    async function fetchMyUploads() {
      if (!user) return;
      try {
        const q = query(collection(db, "materials"), where("uploader", "==", user.name));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // ترتيب يدوي
        data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        setUploads(data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    }
    fetchMyUploads();
  }, [user]);

  if (loading) return <div className="flex justify-center mt-20 text-blue-500"><Loader2 className="animate-spin w-10 h-10" /></div>;

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      <div className="flex items-center justify-between border-b border-gray-800 pb-6">
        <div>
            <h2 className="text-3xl font-bold mb-2">ملفاتي المرفوعة</h2>
            <p className="text-gray-400">تابع حالة قبول ملخصاتك هنا</p>
        </div>
        <Link href="/dashboard/upload">
            <button className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
                <FaCloudUploadAlt size={20} /> رفع جديد
            </button>
        </Link>
      </div>

      {uploads.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed">
            <p className="text-gray-400 text-xl mb-6">لم تقم برفع أي ملفات بعد</p>
            <Link href="/dashboard/upload">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl">ارفع أول ملخص</button>
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {uploads.map(item => (
                <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative group hover:border-blue-500/30 transition-all">
                    {/* Badge الحالة */}
                    <div className={`absolute left-4 top-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${item.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {item.status === 'approved' ? <><FaCheckCircle /> تم النشر</> : <><FaHourglassHalf /> قيد المراجعة</>}
                    </div>

                    <div className="flex items-center gap-4 mt-8">
                        <div className="p-3 bg-gray-800 rounded-xl">
                            {(item.fileType === 'pdf' || item.fileUrl?.endsWith('.pdf')) ? <FaFilePdf className="text-red-500 w-8 h-8" /> : <FaImage className="text-blue-400 w-8 h-8" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold line-clamp-1">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.subject}</p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                         <button onClick={() => setSelectedFile(item)} className="flex-1 bg-gray-800 hover:bg-gray-700 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                            <FaEye /> معاينة
                         </button>
                         <a href={item.fileUrl} target="_blank" download className="bg-gray-800 hover:bg-gray-700 px-4 rounded-xl flex items-center text-gray-400 hover:text-white transition-colors">
                            <FaDownload />
                         </a>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* ==================== نفس نافذة المعاينة (MODAL) ==================== */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 w-full max-w-5xl h-[85vh] rounded-2xl border border-gray-700 flex flex-col shadow-2xl">
            <div className="p-4 flex justify-between items-center border-b border-gray-800">
                <h3 className="font-bold text-lg">{selectedFile.title}</h3>
                <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-colors"><FaTimes size={20} /></button>
            </div>
            <div className="flex-1 bg-gray-800 relative overflow-hidden flex items-center justify-center">
                 {/* عرض الـ PDF أو الصورة */}
                 {(selectedFile.fileType === 'pdf' || selectedFile.fileUrl?.endsWith('.pdf')) ? (
                    <iframe src={selectedFile.fileUrl} className="w-full h-full bg-white" title="Preview" />
                 ) : (
                    <img src={selectedFile.fileUrl} alt="preview" className="max-h-full max-w-full object-contain" />
                 )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
