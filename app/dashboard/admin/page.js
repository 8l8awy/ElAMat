"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
// تأكدي أن مكتبة react-icons مثبتة (وهي موجودة لديك حسب الصور)
import { FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaSignOutAlt, FaPlus } from "react-icons/fa";

// إعدادات Cloudinary الخاصة بك (من الصورة القديمة)
const CLOUD_NAME = "dhj0extnk";
const UPLOAD_PRESET = "ml_default";

export default function AdminPage() {
  const { user } = useAuth();
  
  // === حالات النظام ===
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // === متغيرات الفورم (لإضافة مادة جديدة) ===
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("عام");
  const [type, setType] = useState("summary"); // summary, exam, book
  const [uploadedFiles, setUploadedFiles] = useState([]); // قائمة الملفات المرفوعة

  // === 1. التحقق من الصلاحية (الكود الجديد الذكي) ===
  useEffect(() => {
    async function checkPermission() {
      if (!user) return;

      try {
        let adminFound = false;

        // البحث في الأكواد
        const codesRef = collection(db, "allowedCodes");
        const qCode = query(codesRef, where("code", "==", user.email));
        const codeSnap = await getDocs(qCode);
        if (!codeSnap.empty && codeSnap.docs[0].data().admin === true) adminFound = true;

        // البحث في المستخدمين (احتياطي)
        if (!adminFound) {
           const usersRef = collection(db, "users");
           const qUser = query(usersRef, where("email", "==", user.email));
           const userSnap = await getDocs(qUser);
           if (!userSnap.empty && userSnap.docs[0].data().isAdmin === true) adminFound = true;
        }

        if (adminFound) {
            setIsAdmin(true);
        }
      } catch (err) {
        console.error("Error checking admin:", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkPermission();
  }, [user]);

  // === 2. دالة رفع الملفات إلى Cloudinary ===
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const newFiles = [];

    for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            
            if (data.secure_url) {
                newFiles.push({
                    name: file.name,
                    url: data.secure_url,
                    type: file.type,
                    size: (file.size / 1024 / 1024).toFixed(2) + " MB"
                });
            }
        } catch (err) {
            console.error("Upload failed for file:", file.name, err);
            alert(`فشل رفع الملف: ${file.name}`);
        }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(false);
  };

  // === 3. حذف ملف من القائمة قبل الإرسال ===
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // === 4. إرسال البيانات إلى Firebase ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject) {
        alert("الرجاء كتابة اسم المادة والموضوع");
        return;
    }

    if (confirm("هل أنت متأكد من نشر هذه المواد؟")) {
        try {
            await addDoc(collection(db, "materials"), {
                title,
                description: desc,
                subject,
                type,
                files: uploadedFiles,
                uploader: user.email,
                createdAt: serverTimestamp(),
                isHidden: false
            });

            alert("تم النشر بنجاح! 🎉");
            // تصفير الفورم
            setTitle("");
            setDesc("");
            setUploadedFiles([]);
        } catch (err) {
            console.error(err);
            alert("حدث خطأ أثناء الحفظ في قاعدة البيانات");
        }
    }
  };

  // === الواجهات (Loading / 404 / Admin) ===
  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
  
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center bg-black text-white"><h1>404 - Access Denied</h1></div>;

  return (
    <div className="min-h-screen bg-[#0b0c15] text-white font-sans p-4 md:p-8" dir="rtl">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-[#151720] p-4 rounded-2xl border border-gray-800">
        <div>
            <h1 className="text-2xl font-bold text-blue-500">لوحة التحكم</h1>
            <p className="text-gray-400 text-sm">أهلاً، {user.email}</p>
        </div>
        <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition text-sm font-bold">
            <FaSignOutAlt /> خروج
        </button>
      </header>

      <div className="max-w-3xl mx-auto">
        
        {/* Form Card */}
        <div className="bg-[#151720] p-6 rounded-3xl border border-gray-800 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FaPlus className="text-blue-500" /> إضافة محتوى جديد
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* اسم المحتوى */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">عنوان المحتوى</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="w-full bg-[#0b0c15] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition"
                        placeholder="مثال: ملخص الفصل الأول - اقتصاد" 
                    />
                </div>

                {/* الوصف */}
                <div>
                    <label className="block text-sm text-gray-400 mb-1">الوصف (اختياري)</label>
                    <textarea 
                        value={desc} 
                        onChange={(e) => setDesc(e.target.value)} 
                        className="w-full bg-[#0b0c15] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition h-24 resize-none"
                        placeholder="أضف تفاصيل بسيطة عن الملف..." 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* المادة */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">المادة</label>
                        <select 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)} 
                            className="w-full bg-[#0b0c15] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition"
                        >
                            <option value="عام">عام</option>
                            <option value="اقتصاد">مبادئ اقتصاد</option>
                            <option value="محاسبة">محاسبة مالية</option>
                            <option value="إدارة">إدارة أعمال</option>
                            <option value="لغة إنجليزية">لغة إنجليزية</option>
                            <option value="أخرى">أخرى</option>
                        </select>
                    </div>

                    {/* النوع */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">النوع</label>
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value)} 
                            className="w-full bg-[#0b0c15] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition"
                        >
                            <option value="summary">ملخص (PDF)</option>
                            <option value="exam">امتحان / كويز</option>
                            <option value="book">كتاب</option>
                            <option value="note">ملاحظات</option>
                        </select>
                    </div>
                </div>

                {/* منطقة رفع الملفات */}
                <div className="border-2 border-dashed border-gray-700 rounded-2xl p-6 text-center hover:border-blue-500/50 transition bg-[#0b0c15]/50 relative">
                    <input 
                        type="file" 
                        multiple 
                        onChange={handleFileUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                    />
                    <div className="flex flex-col items-center gap-2">
                        {isUploading ? (
                            <FaSpinner className="animate-spin text-3xl text-blue-500" />
                        ) : (
                            <FaCloudUploadAlt className="text-4xl text-gray-500" />
                        )}
                        <p className="text-gray-400 text-sm">
                            {isUploading ? "جاري الرفع..." : "اضغط هنا لاختيار الملفات أو اسحبها"}
                        </p>
                    </div>
                </div>

                {/* قائمة الملفات المرفوعة */}
                {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500">الملفات الجاهزة للنشر:</p>
                        {uploadedFiles.map((file, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-[#0b0c15] p-3 rounded-lg border border-gray-800">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <FaFilePdf className="text-red-500 flex-shrink-0" />
                                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-xs text-gray-600">({file.size})</span>
                                </div>
                                <button type="button" onClick={() => removeFile(idx)} className="text-gray-500 hover:text-red-500">
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* زر النشر */}
                <button 
                    type="submit" 
                    disabled={isUploading || uploadedFiles.length === 0} 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {isUploading ? "انتظر انتهاء الرفع..." : <> <FaCheckCircle /> نشر المادة </>}
                </button>

            </form>
        </div>
      </div>
    </div>
  );
}
