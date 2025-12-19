"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  onSnapshot, 
  orderBy 
} from "firebase/firestore";
// تأكدي من تثبيت المكتبات: npm install lucide-react react-icons
import { FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaSignOutAlt, FaPlus, FaLayerGroup } from "react-icons/fa";

// إعدادات Cloudinary
const CLOUD_NAME = "dhj0extnk";
const UPLOAD_PRESET = "ml_default";

export default function AdminPage() {
  const { user } = useAuth();
  
  // === حالات النظام ===
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // === متغيرات الفورم ===
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("عام");
  const [type, setType] = useState("summary");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // === قائمة المواد (من التصميم القديم) ===
  const [materialsList, setMaterialsList] = useState([]);

  // 1️⃣ التحقق من الصلاحية (الكود الجديد)
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

        // البحث في المستخدمين
        if (!adminFound) {
           const usersRef = collection(db, "users");
           const qUser = query(usersRef, where("email", "==", user.email));
           const userSnap = await getDocs(qUser);
           if (!userSnap.empty && userSnap.docs[0].data().isAdmin === true) adminFound = true;
        }

        if (adminFound) setIsAdmin(true);
      } catch (err) {
        console.error("Auth Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    checkPermission();
  }, [user]);

  // 2️⃣ جلب المواد (Live Data) - ميزة التصميم القديم
  useEffect(() => {
    if (!isAdmin) return;
    
    const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterialsList(data);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // 3️⃣ رفع الملفات
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
                newFiles.push({ name: file.name, url: data.secure_url, type: file.type, size: (file.size / 1024 / 1024).toFixed(2) + " MB" });
            }
        } catch (err) {
            console.error("Upload Error:", err);
        }
    }
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(false);
  };

  // 4️⃣ نشر المادة
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !subject) return alert("يرجى ملء البيانات الأساسية");

    if (confirm("هل أنت متأكد من النشر؟")) {
        try {
            await addDoc(collection(db, "materials"), {
                title, description: desc, subject, type, files: uploadedFiles,
                uploader: user.email, createdAt: serverTimestamp(), isHidden: false
            });
            alert("تم النشر بنجاح! 🎉");
            setTitle(""); setDesc(""); setUploadedFiles([]);
        } catch (err) {
            alert("حدث خطأ أثناء النشر");
        }
    }
  };

  // 5️⃣ حذف مادة (ميزة التصميم القديم)
  const handleDelete = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذه المادة نهائياً؟")) {
      try {
        await deleteDoc(doc(db, "materials", id));
      } catch (err) {
        alert("فشل الحذف");
      }
    }
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center bg-black text-white"><h1>404 - غير مصرح لك</h1></div>;

  return (
    <div className="min-h-screen bg-[#0b0c15] text-white font-sans p-4 md:p-8" dir="rtl">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-[#151720] p-4 rounded-2xl border border-gray-800">
        <div>
            <h1 className="text-2xl font-bold text-blue-500">لوحة التحكم</h1>
            <p className="text-gray-400 text-sm">أهلاً بك، {user.email}</p>
        </div>
        <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition text-sm font-bold">
            <FaSignOutAlt /> خروج
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === القسم الأيمن: نموذج الإضافة === */}
        <div className="lg:col-span-1">
            <div className="bg-[#151720] p-6 rounded-3xl border border-gray-800 shadow-xl sticky top-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><FaPlus className="text-blue-500" /> إضافة محتوى</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#0b0c15] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" placeholder="عنوان المحتوى..." />
                    <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full bg-[#0b0c15] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none h-20 resize-none" placeholder="وصف قصير..." />
                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-[#0b0c15] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none">
                        <option value="عام">عام</option>
                        <option value="اقتصاد">مبادئ اقتصاد</option>
                        <option value="محاسبة">محاسبة مالية</option>
                        <option value="إدارة">إدارة أعمال</option>
                        <option value="لغة إنجليزية">لغة إنجليزية</option>
                    </select>
                    <div className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center hover:border-blue-500 transition relative">
                        <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
                        {isUploading ? <FaSpinner className="animate-spin text-2xl text-blue-500 mx-auto" /> : <FaCloudUploadAlt className="text-3xl text-gray-500 mx-auto" />}
                        <p className="text-xs text-gray-400 mt-2">{isUploading ? "جاري الرفع..." : "اختر الملفات"}</p>
                    </div>
                    
                    {/* عرض الملفات المرفوعة مؤقتاً */}
                    {uploadedFiles.length > 0 && (
                        <div className="space-y-1">
                            {uploadedFiles.map((f, i) => (
                                <div key={i} className="flex justify-between bg-[#0b0c15] p-2 rounded text-xs border border-gray-800">
                                    <span className="truncate max-w-[150px]">{f.name}</span>
                                    <button type="button" onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500"><FaTrash /></button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button type="submit" disabled={isUploading || uploadedFiles.length === 0} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                        {isUploading ? "انتظر..." : <> <FaCheckCircle /> نشر </>}
                    </button>
                </form>
            </div>
        </div>

        {/* === القسم الأيسر: قائمة المواد (التصميم القديم) === */}
        <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><FaLayerGroup className="text-green-500" /> المواد المنشورة ({materialsList.length})</h2>
            
            {materialsList.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-[#151720] rounded-3xl border border-gray-800">لا توجد مواد منشورة حتى الآن</div>
            ) : (
                <div className="space-y-3">
                    {materialsList.map((item) => (
                        <div key={item.id} className="bg-[#151720] p-4 rounded-2xl border border-gray-800 flex justify-between items-start hover:border-blue-500/30 transition group">
                            <div>
                                <h3 className="font-bold text-white text-lg">{item.title}</h3>
                                <p className="text-sm text-gray-400">{item.subject} • {item.type}</p>
                                <div className="flex gap-2 mt-2">
                                    {item.files?.map((f, i) => (
                                        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 hover:bg-blue-500 hover:text-white transition">
                                            ملف {i + 1}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(item.id)} className="text-gray-600 hover:text-red-500 p-2 transition bg-black/20 rounded-lg group-hover:bg-red-500/10">
                                <FaTrash size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
