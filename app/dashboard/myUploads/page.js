"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { CldUploadButton } from 'next-cloudinary'; // مكتبة كلاودينري
import { FaCloudUploadAlt, FaFilePdf, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [pdfUrl, setPdfUrl] = useState(""); 
  const [loading, setLoading] = useState(false);

  // دالة تعمل تلقائياً بعد نجاح الرفع على Cloudinary
  const handleUploadSuccess = (result) => {
    // result.info.secure_url هو رابط الملف المباشر
    setPdfUrl(result.info.secure_url);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!pdfUrl || !title || !subject) return;

    setLoading(true);

    try {
      // حفظ بيانات الملف في قاعدة البيانات
      await addDoc(collection(db, "materials"), {
        title: title,
        subject: subject,
        fileUrl: pdfUrl,
        uploader: user.name, // لحفظ اسم الطالب الرافع
        uploaderId: user.uid || "unknown",
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        type: "summary", // أو يمكنك عمل قائمة منسدلة لاختيار النوع
        status: "pending", // الحالة الافتراضية "قيد المراجعة"
        viewCount: 0,
        downloadCount: 0
      });

      // توجيه الطالب لصفحة "ملخصاتي" بعد النجاح
      router.push('/dashboard/my-uploads');

    } catch (error) {
      console.error("Error saving document:", error);
      alert("حدث خطأ أثناء حفظ البيانات");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8 flex items-center justify-center animate-fadeIn" dir="rtl">
      <div className="max-w-lg w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
        
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <FaArrowRight />
            </button>
            <h1 className="text-2xl font-bold">رفع ملخص جديد</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* اسم الملخص */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">عنوان الملخص</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="مثال: ملخص المحاسبة - الفصل الأول"
              required
            />
          </div>

          {/* اسم المادة */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">اسم المادة</label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="مثال: مبادئ اقتصاد"
              required
            />
          </div>

          {/* منطقة رفع الملف (Cloudinary) */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-400">ملف الـ PDF</label>
            
            {!pdfUrl ? (
                // زر الرفع من كلاودينري
                <div className="border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl transition-colors bg-gray-800/50">
                    <CldUploadButton 
                        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} // تأكد من وضع هذا في ملف .env
                        onSuccess={handleUploadSuccess}
                        options={{ sources: ['local'], resourceType: 'raw' }} // 'raw' مهم لملفات PDF
                        className="w-full h-32 flex flex-col items-center justify-center gap-3 cursor-pointer"
                    >
                        <FaCloudUploadAlt className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-400">اضغط هنا لاختيار ملف PDF</span>
                    </CldUploadButton>
                </div>
            ) : (
                // شكل الملف بعد الرفع
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <FaFilePdf className="text-red-500 w-6 h-6" />
                        <span className="text-green-400 text-sm font-medium">تم رفع الملف بنجاح</span>
                    </div>
                    <button type="button" onClick={() => setPdfUrl("")} className="text-xs text-gray-400 hover:text-white underline">
                        تغيير
                    </button>
                </div>
            )}
          </div>

          {/* زر الحفظ */}
          <button 
            type="submit" 
            disabled={loading || !pdfUrl}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "نشر الملخص"}
          </button>

        </form>
      </div>
    </div>
  );
}
