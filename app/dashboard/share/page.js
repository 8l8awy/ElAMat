"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext"; // تأكد من المسار
import { uploadToCloudinary } from "@/lib/cloudinary"; // تأكد من المسار
import { db } from "@/lib/firebase"; // تأكد من المسار
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaCloudUploadAlt, FaSpinner, FaFile, FaLayerGroup, FaPen } from "react-icons/fa";

export default function ShareMaterialPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([...e.target.files]);
    }
  };

  const handleUpload = async () => {
    if (!title || files.length === 0) return alert("الرجاء إدخال العنوان واختيار ملفات");
    
    setLoading(true);
    try {
      const uploadedFiles = await Promise.all(
        files.map(file => uploadToCloudinary(file))
      );

      await addDoc(collection(db, "materials"), {
        subject,
        type,
        title,
        desc,
        files: uploadedFiles,
        uploader: user.name, // للاحتياط
        studentName: user?.name || "طالب مجهول", // 👈 هذا هو السطر الذي يظهر الاسم في الأدمن
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
        status: "pending"
      });

      alert("تم إرسال الملخص للمراجعة بنجاح! ");
      setTitle("");
      setDesc("");
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الرفع");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. حاوية الشاشة الكاملة والخلفية
    <div className="min-h-screen w-full text-white p-4 font-sans relative overflow-hidden" dir="rtl">
      
      {/* خلفية تفاعلية */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto pt-8">
        
        {/* العنوان */}
        <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-3">
               مشاركة المحتوى
            </h1>
            <p className="text-gray-400 text-lg">
               ساعد زملائك وشارك ملخصاتك وتكاليفك هنا 
            </p>
        </div>

        {/* بطاقة الرفع الزجاجية */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
            
            <div className="space-y-6">
                
                {/* اختيار المادة والنوع */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-bold">المادة الدراسية</label>
                        <div className="relative">
                            <select 
                                value={subject} 
                                onChange={(e) => setSubject(e.target.value)} 
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white appearance-none outline-none focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option className="bg-slate-800">مبادئ الاقتصاد</option>
                                <option className="bg-slate-800">لغة اجنبية (1)</option>
                                <option className="bg-slate-800">مبادئ المحاسبة المالية</option>
                                <option className="bg-slate-800">مبادئ القانون</option>
                                <option className="bg-slate-800">مبادئ ادارة الاعمال</option>
                            </select>
                            <FaLayerGroup className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-bold">نوع الملف</label>
                        <div className="relative">
                            <select 
                                value={type} 
                                onChange={(e) => setType(e.target.value)} 
                                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white appearance-none outline-none focus:border-blue-500 transition-all cursor-pointer"
                            >
                                <option className="bg-slate-800" value="summary">ملخص / مراجعة</option>
                                <option className="bg-slate-800" value="assignment">تكليف / واجب</option>
                            </select>
                            <FaLayerGroup className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                        </div>
                    </div>
                </div>

                {/* العنوان والوصف */}
                <div>
                    <label className="block text-gray-400 mb-2 text-sm font-bold">عنوان الملف</label>
                    <input 
                        type="text" 
                        placeholder="مثال: ملخص الفصل الأول اقتصاد" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-gray-400 mb-2 text-sm font-bold">وصف إضافي (اختياري)</label>
                    <textarea 
                        placeholder="اكتب وصفاً بسيطاً للمحتوى..." 
                        rows="3" 
                        value={desc} 
                        onChange={(e) => setDesc(e.target.value)} 
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all resize-none"
                    />
                </div>

                {/* منطقة رفع الملفات */}
                <div className="pt-4">
                    <input 
                        type="file" 
                        id="fileInput" 
                        multiple 
                        onChange={handleFileSelect} 
                        className="hidden" 
                    />
                    <label 
                        htmlFor="fileInput" 
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${files.length > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 hover:border-blue-400 hover:bg-white/5'}`}
                    >
                        <FaCloudUploadAlt className={`text-4xl mb-2 ${files.length > 0 ? 'text-green-400' : 'text-gray-400'}`} />
                        <span className="text-sm text-gray-300 font-bold">
                            {files.length > 0 ? `تم اختيار ${files.length} ملفات` : "اضغط هنا لاختيار الملفات أو الصور"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">يدعم PDF, JPG, PNG</span>
                    </label>
                </div>

                {/* قائمة الملفات المختارة */}
                {files.length > 0 && (
                    <div className="bg-black/30 p-4 rounded-xl space-y-2 border border-white/5 max-h-40 overflow-y-auto custom-scrollbar">
                        {files.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 p-2 rounded-lg">
                                <FaFile className="text-blue-400" /> 
                                <span className="truncate">{f.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* زر الإرسال */}
                <button 
                    onClick={handleUpload} 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin" /> جاري الرفع...
                        </>
                    ) : (
                        <>
                            <FaCloudUploadAlt /> إرسال للمراجعة
                        </>
                    )}
                </button>

            </div>
        </div>
      </div>
    </div>
  );
}
