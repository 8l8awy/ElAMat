"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext"; 
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { FaCheckCircle, FaHourglassHalf, FaEye, FaDownload, FaFileUpload } from "react-icons/fa";
import Link from "next/link"; // ✅ استيراد Link للتنقل

export default function MyUploadsPage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyUploads() {
      if (!user) return;

      try {
        // ✅ استخدام orderBy في الكويري مباشرة لترتيب أسرع (تتطلب Index في الفايربيس أحياناً)
        // إذا واجهت مشكلة في الـ Index، ابق على كود الترتيب اليدوي الذي كتبته أنت
        const q = query(
            collection(db, "materials"), 
            where("uploader", "==", user.name)
        );
        
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // ترتيب يدوي (الأحدث أولاً) - هذا ممتاز ولا يسبب مشاكل
        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        setUploads(data);
      } catch (err) {
        console.error("Error fetching uploads:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyUploads();
  }, [user]);

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">ملفاتي ومشاركاتي</h2>
          {/* زر رفع جديد يظهر دائماً في الأعلى */}
          <Link href="/dashboard/upload" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
             <FaFileUpload /> رفع ملف جديد
          </Link>
      </div>

      {uploads.length === 0 ? (
        <div className="text-center py-20 bg-[#151720] rounded-2xl border border-gray-800">
            <span className="text-6xl mb-4 block">📂</span>
            <p className="text-gray-400 text-lg mb-6">لم تقم برفع أي ملفات بعد.</p>
            
            {/* ✅ تفعيل الزر ليوجه لصفحة الرفع */}
            <Link href="/dashboard/upload" className="inline-block bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
                ارفع أول ملخص ليك 🚀
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {uploads.map(item => (
                <div key={item.id} className="bg-[#151720] border border-gray-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all relative overflow-hidden group">
                    
                    {/* شريط الحالة الملون على اليمين */}
                    <div className={`absolute top-0 right-0 bottom-0 w-1 ${item.status === 'approved' ? 'bg-[#00f260]' : 'bg-[#ffc107'}`}></div>

                    <div className="flex justify-between items-start mb-4 pr-3">
                        <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-sm border border-gray-700">
                            {item.type === 'summary' ? 'ملخص' : 'تكليف'}
                        </span>
                        
                        {/* حالة الملف */}
                        {item.status === 'approved' ? (
                            <span className="text-[#00f260] bg-[#00f260]/10 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-[#00f260]/20">
                                <FaCheckCircle /> تم النشر
                            </span>
                        ) : (
                            <span className="text-[#ffc107] bg-[#ffc107]/10 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-[#ffc107]/20">
                                <FaHourglassHalf /> قيد المراجعة
                            </span>
                        )}
                    </div>

                    <h3 className="text-white text-xl font-bold mb-2 pr-3 line-clamp-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm pr-3 mb-4">{item.subject}</p>

                    <div className="flex items-center gap-4 text-gray-500 text-xs border-t border-gray-800 pt-4 pr-3">
                        <span className="flex items-center gap-1"><FaEye /> {item.viewCount || 0}</span>
                        <span className="flex items-center gap-1"><FaDownload /> {item.downloadCount || 0}</span>
                        <span className="mr-auto">{new Date(item.date).toLocaleDateString("ar-EG")}</span>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
