"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // ✅ ربطنا الكود بنظام الدخول الجديد
import { db } from "@/lib/firebase"; 
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot } from "firebase/firestore";
import { FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaLock, FaCheck, FaTimes, FaCloudUploadAlt } from "react-icons/fa";

export default function AdminPage() {
  const { user } = useAuth(); // استدعاء المستخدم المسجل
  const router = useRouter();
  const searchParams = useSearchParams();

  // ☁️ بيانات Cloudinary
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  // حالات النظام
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFake404, setShowFake404] = useState(true);
  const [inputCode, setInputCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  // متغيرات لوحة التحكم
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
  
  // القوائم
  const [materialsList, setMaterialsList] = useState([]);
  const [pendingList, setPendingList] = useState([]);     
  
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const subjects = ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"];

  // ✅ 1. الفحص الذكي (تم التعديل ليفهم تسجيل الدخول الجديد)
  useEffect(() => {
    const checkAccess = async () => {
      // أولوية 1: هل المستخدم مسجل دخول من الصفحة الرئيسية؟
      if (user) {
        await verifyCode(user.email, true);
        return;
      }

      // أولوية 2: هل هناك كود محفوظ في المتصفح (للطريقة القديمة)؟
      const savedCode = localStorage.getItem("adminCode");
      const isSecretMode = searchParams.get("mode") === "login";

      if (savedCode) {
        await verifyCode(savedCode, true);
      } else if (isSecretMode) {
        setIsLoading(false);
        setShowFake404(false);
      } else {
        setIsLoading(false);
        setShowFake404(true);
      }
    };

    checkAccess();
  }, [user]); // يعيد الفحص بمجرد تحميل بيانات المستخدم

  // دالة التحقق من الكود (معدلة لتقبل الأكواد والإيميلات)
  const verifyCode = async (identifier, isAutoCheck = false) => {
    if (!isAutoCheck) setCheckingCode(true);

    try {
      let isAdminFound = false;

      // 1. البحث في الأكواد المسموحة
      const codesRef = collection(db, "allowedCodes");
      const qCode = query(codesRef, where("code", "==", identifier.trim()));
      const codeSnap = await getDocs(qCode);

      if (!codeSnap.empty && codeSnap.docs[0].data().admin === true) {
        isAdminFound = true;
      }

      // 2. البحث في جدول المستخدمين (users) إذا لم نجده في الأكواد
      if (!isAdminFound) {
        const usersRef = collection(db, "users");
        const qUser = query(usersRef, where("email", "==", identifier.trim()));
        const userSnap = await getDocs(qUser);
        
        if (!userSnap.empty && userSnap.docs[0].data().isAdmin === true) {
            isAdminFound = true;
        }
      }

      if (isAdminFound) {
        setIsAuthenticated(true);
        setShowFake404(false);
        localStorage.setItem("adminCode", identifier); // نحفظه للمستقبل
      } else {
        if (!isAutoCheck) alert("⛔ ليس لديك صلاحية أدمن");
        if (isAutoCheck) handleLoginFail();
      }

    } catch (error) {
      console.error(error);
      if (!isAutoCheck) alert("خطأ في الاتصال");
    }
    
    setIsLoading(false);
    if (!isAutoCheck) setCheckingCode(false);
  };

  const handleLoginFail = () => {
    localStorage.removeItem("adminCode");
    setIsAuthenticated(false);
    setShowFake404(true);
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    await verifyCode(inputCode);
  };

  // ✅ جلب البيانات وفصلها (مقبولة vs معلقة)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // فصل البيانات حسب الحالة (إذا لم توجد حالة نعتبرها approved للأقدمية)
      const approved = allData.filter(item => !item.status || item.status === "approved");
      const pending = allData.filter(item => item.status === "pending");
      
      setMaterialsList(approved);
      setPendingList(pending);
    });
    
    return () => unsubscribe();
  }, [isAuthenticated]);

  // ✅ العمليات (حذف / قبول / رفع)
  const handleDelete = async (id, title) => { 
      if (confirm(`حذف "${title}" نهائياً؟`)) await deleteDoc(doc(db, "materials", id)); 
  };
  
  const handleApprove = async (id, title) => {
    if (confirm(`هل تريد قبول ونشر "${title}"؟`)) {
      await updateDoc(doc(db, "materials", id), {
        status: "approved"
      });
      setMessage(`✅ تم نشر "${title}" بنجاح`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleFileChange = (e) => { if (e.target.files) setFiles(Array.from(e.target.files)); };
  
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title) return alert("البيانات ناقصة");
    
    setUploading(true); 
    setMessage("⏳ جاري الرفع...");
    
    const uploadedFilesData = [];
    try {
      for (let file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: formData });
        const data = await res.json();
        if(data.secure_url) {
            uploadedFilesData.push({ 
                name: file.name, 
                url: data.secure_url, 
                type: file.type,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB"
            });
        }
      }
      
      await addDoc(collection(db, "materials"), {
        title, 
        description: desc, // تأكدنا من توحيد الأسماء (description بدل desc في بعض الأكواد)
        subject, 
        type, 
        files: uploadedFilesData,
        uploader: user?.email || "Admin",
        createdAt: serverTimestamp(),
        status: "approved", // الأدمن يرفع مباشرة
        viewCount: 0, 
        downloadCount: 0
      });

      setUploading(false); 
      setTitle(""); setDesc(""); setFiles([]); 
      setMessage("🎉 تم الرفع بنجاح!");
      setTimeout(() => setMessage(""), 3000);

    } catch (error) { 
        console.error(error);
        setUploading(false); 
        alert("خطأ في الرفع"); 
    }
  };

  // === الواجهات ===
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><FaSpinner className="animate-spin text-4xl text-gray-800" /></div>;
  }

  // واجهة 404 الوهمية (للحماية)
  if (showFake404) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans text-center">
        <h1 className="text-4xl font-semibold mb-2">404</h1>
        <h2 className="text-sm font-normal text-gray-500">This page could not be found.</h2>
      </div>
    );
  }

  // واجهة الدخول اليدوي (إذا فشل التعرف التلقائي)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-sans p-4">
        <div className="bg-white/5 p-10 rounded-3xl border border-gray-800 shadow-2xl w-full max-w-md text-center backdrop-blur-sm">
          <h1 className="text-2xl font-bold mb-2">لوحة الأدمن</h1>
          <p className="text-gray-400 mb-8 text-sm">أدخل كود المرور للمتابعة</p>
          <form onSubmit={handleManualLogin}>
            <div className="relative mb-6">
                <FaLock className="absolute left-4 top-4 text-gray-500" />
                <input type="password" placeholder="كود الحماية" value={inputCode} onChange={(e) => setInputCode(e.target.value)}
                    className="w-full p-3.5 pl-12 rounded-xl border border-gray-700 bg-[#111] text-white focus:border-blue-500 outline-none transition" />
            </div>
            <button type="submit" disabled={checkingCode} className="w-full bg-white text-black py-3.5 rounded-xl font-bold hover:bg-gray-200 transition disabled:opacity-70">
              {checkingCode ? "جاري التحقق..." : "دخول"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ✅ واجهة لوحة التحكم (التصميم الذي تحبه)
  return (
    <div className="min-h-screen bg-[#0b0c15] text-white p-4 md:p-8 font-sans" dir="rtl">
      
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center mb-8 bg-[#151720] p-4 rounded-2xl border border-gray-800">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">لوحة التحكم 🚀</h1>
        <button onClick={() => window.location.href = '/'} className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500/20 transition">خروج</button>
      </div>

      {message && <div className="bg-green-500/20 text-green-400 p-4 rounded-xl text-center mb-6 border border-green-500/30 flex justify-center items-center gap-2"><FaCheckCircle /> {message}</div>}

      {/* فورم الرفع */}
      <form onSubmit={handleUpload} className="bg-[#151720] p-6 rounded-3xl border border-gray-800 mb-8 shadow-lg">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaCloudUploadAlt className="text-blue-500" /> رفع محتوى جديد</h3>
        
        <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">العنوان</label>
            <input type="text" className="w-full bg-[#0b0c15] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" value={title} onChange={(e)=>setTitle(e.target.value)} required />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block text-sm text-gray-400 mb-1">المادة</label>
                <select className="w-full bg-[#0b0c15] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" value={subject} onChange={(e)=>setSubject(e.target.value)}>{subjects.map((s,i)=><option key={i} value={s}>{s}</option>)}</select>
            </div>
            <div>
                <label className="block text-sm text-gray-400 mb-1">النوع</label>
                <select className="w-full bg-[#0b0c15] border border-gray-700 rounded-xl p-3 text-white focus:border-blue-500 outline-none" value={type} onChange={(e)=>setType(e.target.value)}><option value="summary">ملخص</option><option value="assignment">تكليف</option></select>
            </div>
        </div>
        
        <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">الملفات</label>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer relative bg-[#0b0c15]/50">
                <input type="file" onChange={handleFileChange} accept=".pdf,image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {files.length > 0 ? <p className="text-green-400 font-bold">{files.length} ملفات جاهزة للرفع</p> : <p className="text-gray-500">اضغط لاختيار الملفات أو اسحبها هنا</p>}
            </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={uploading}>
            {uploading ? "جاري الرفع..." : "نشر المادة"}
        </button>
      </form>

      {/* ✅ قسم طلبات الطلاب المعلقة */}
      {pendingList.length > 0 && (
        <div className="mb-8 border border-yellow-600/30 rounded-3xl p-6 bg-yellow-500/5">
          <h2 className="text-yellow-500 text-lg font-bold mb-4 flex items-center gap-2">⚠️ طلبات قيد الانتظار ({pendingList.length})</h2>
          <div className="space-y-3">
            {pendingList.map((item) => (
                <div key={item.id} className="bg-[#151720] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-1">
                        <h4 className="font-bold text-white flex items-center gap-2">
                            <FaFilePdf className="text-gray-400" /> {item.title} 
                            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">طالب</span>
                        </h4>
                        <div className="flex gap-2 text-xs mt-1 text-gray-500">
                            <span>📌 {item.subject}</span>
                            <span>👤 {item.uploader}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleApprove(item.id, item.title)} className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-1 transition text-sm">قبول <FaCheck /></button>
                        <button onClick={() => handleDelete(item.id, item.title)} className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg font-bold flex items-center gap-1 hover:bg-red-500 hover:text-white transition text-sm">رفض <FaTimes /></button>
                    </div>
                </div>
            ))}
          </div>
        </div>
      )}

      {/* قسم الملفات المنشورة */}
      <div>
        <h2 className="text-white text-xl font-bold mb-4 border-r-4 border-green-500 pr-3">الملفات المنشورة ({materialsList.length})</h2>
        <div className="space-y-3">
            {materialsList.map((item) => (
                <div key={item.id} className="bg-[#151720] border border-gray-800 rounded-xl p-4 flex justify-between items-center group hover:border-blue-500/30 transition">
                    <div>
                        <h4 className="font-bold text-white flex items-center gap-2 text-lg">
                            <FaFilePdf className={item.type === 'summary' ? 'text-green-500' : 'text-orange-500'} /> 
                            {item.title}
                        </h4>
                        <div className="flex gap-2 text-xs mt-1">
                            <span className="text-gray-400 bg-white/5 px-2 py-0.5 rounded">📌 {item.subject}</span>
                            <span className={item.type === 'summary' ? 'text-green-400 bg-green-500/10 px-2 py-0.5 rounded' : 'text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded'}>{item.type === 'assignment' ? 'تكليف' : 'ملخص'}</span>
                        </div>
                    </div>
                    <button onClick={() => handleDelete(item.id, item.title)} className="text-gray-600 hover:text-red-500 p-2 rounded-lg transition group-hover:bg-red-500/10"><FaTrash /></button>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}
