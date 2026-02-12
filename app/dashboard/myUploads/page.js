"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext"; 
import { db } from "../../../lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { FaCloudUploadAlt, FaCheckCircle, FaHourglassHalf, FaEye, FaDownload, FaFilePdf, FaFileImage } from "react-icons/fa";
import Link from "next/link";

export default function MyUploadsPage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.name) {
      setLoading(false);
      return;
    }

    // 1. التعديل الجوهري: البحث بحقل studentName ليتطابق مع صفحة الرفع
    const q = query(
      collection(db, "materials"), 
      where("studentName", "==", user.name),
      orderBy("createdAt", "desc") // تأكد من عمل Index في Firebase لهذه الكويري
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
      }));
      setUploads(data);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching uploads:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

 if (isLoading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      {/* دائرة تحميل بتلف بشكل انسيابي */}
      <div className="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
      
      {/* نص التحميل مع أنيميشن خفيف */}
      <p className="text-purple-500 font-black italic animate-pulse tracking-widest text-sm uppercase">
        Loading Data...
      </p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 relative z-10" dir="rtl">
      {/* العنوان */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">ملخصاتي</h2>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">تتبع حالة ملفاتك التي قمت بمشاركتها</p>
        </div>
        <Link href="/dashboard/share" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95">
          <FaCloudUploadAlt size={20}/> ارفع ملخص جديد
        </Link>
      </div>

      {uploads.length === 0 ? (
        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-20 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCloudUploadAlt className="text-gray-600 text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-400">لا يوجد ملفات مرفوعة بعد</h3>
            <p className="text-gray-600 mt-2 text-sm">ابدأ بمشاركة علمك مع زملائك الآن!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {uploads.map(item => (
                <div key={item.id} className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                    
                    {/* الحالة بصرياً */}
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-2xl bg-white/5 text-2xl ${item.files?.[0]?.type?.includes('pdf') ? 'text-red-500' : 'text-blue-400'}`}>
                           {item.files?.[0]?.type?.includes('pdf') ? <FaFilePdf /> : <FaFileImage />}
                        </div>
                        
                        {item.status === 'approved' ? (
                            <span className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 border border-green-500/20 uppercase tracking-tighter">
                                <FaCheckCircle /> مقبول ومنشور
                            </span>
                        ) : item.status === 'rejected' ? (
                          <span className="bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 border border-red-500/20 uppercase tracking-tighter">
                                <FaHourglassHalf /> مرفوض
                            </span>
                        ) : (
                            <span className="bg-yellow-500/10 text-yellow-500 px-4 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 border border-yellow-500/20 uppercase tracking-tighter">
                                <FaHourglassHalf className="animate-pulse" /> قيد المراجعة
                            </span>
                        )}
                    </div>

                    <h3 className="text-white text-xl font-black mb-1 truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-purple-500 mb-4">
                      <span>{item.subject}</span>
                      <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                      <span className="text-gray-500">{item.type === 'summary' ? 'ملخص' : 'تكليف'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1.5"><FaEye className="opacity-50"/> {item.viewCount || 0}</span>
                          <span className="flex items-center gap-1.5"><FaDownload className="opacity-50"/> {item.downloadCount || 0}</span>
                        </div>
                        <span>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString("ar-EG") : "قيد الرفع..."}</span>
                    </div>

                    {/* وهج خلفي خفيف يظهر عند الحوّم */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl group-hover:bg-purple-600/10 transition-all"></div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
