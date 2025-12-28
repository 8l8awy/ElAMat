"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { collection, deleteDoc, updateDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaFileImage, FaLock, FaCheck, FaTimes, FaUser, FaCloudUploadAlt, FaLayerGroup } from "react-icons/fa";

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFake404, setShowFake404] = useState(true);
  const [inputCode, setInputCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
   
  const [materialsList, setMaterialsList] = useState([]); 
  const [pendingList, setPendingList] = useState([]);     
   
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const subjects = ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"];

  useEffect(() => {
    const checkAccess = async () => {
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
  }, []);

  const verifyCode = async (codeToVerify, isAutoCheck = false) => {
    if (!isAutoCheck) setCheckingCode(true);
    try {
      const codesRef = collection(db, "allowedCodes");
      const q = query(codesRef, where("code", "==", codeToVerify.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.admin === true) {
          setIsAuthenticated(true);
          setShowFake404(false);
          localStorage.setItem("adminCode", codeToVerify); 
        } else {
          if (!isAutoCheck) alert("⛔ هذا الكود ليس لمشرف (Admin)");
          if (isAutoCheck) handleLoginFail();
        }
      } else {
        if (!isAutoCheck) alert("⛔ الكود غير صحيح");
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

  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaterialsList(allData.filter(item => item.status === "approved"));
      setPendingList(allData.filter(item => item.status === "pending"));
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  const openFile = (item) => {
    let url = item.fileUrl; 
    if (!url && item.files && item.files.length > 0) {
        url = item.files[0].url; 
    }
    if (url) window.open(url, '_blank');
    else alert("لا يوجد ملف للعرض");
  };

  const handleDelete = async (id, title) => { if (confirm(`حذف "${title}" نهائياً؟`)) await deleteDoc(doc(db, "materials", id)); };
   
  const handleApprove = async (id, title) => {
    if (confirm(`هل تريد قبول ونشر "${title}"؟`)) {
      await updateDoc(doc(db, "materials", id), { status: "approved" });
      setMessage(`تم نشر "${title}" بنجاح`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleFileChange = (e) => { if (e.target.files) setFiles(Array.from(e.target.files)); };
   
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
    const data = await res.json();
    return data.secure_url;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title) return alert("البيانات ناقصة");
    setUploading(true); setMessage("جاري الرفع...");
    const uploadedFilesData = [];
    try {
      for (let file of files) {
        const url = await uploadToCloudinary(file);
        uploadedFilesData.push({ name: file.name, url: url, type: file.type });
      }
      await addDoc(collection(db, "materials"), {
        title, desc, subject, type, files: uploadedFilesData,
        date: new Date().toISOString(), 
        status: "approved", 
        uploader: "Admin",
        studentName: "Admin",
        viewCount: 0, downloadCount: 0, createdAt: serverTimestamp(),
      });
      setUploading(false); setTitle(""); setDesc(""); setFiles([]); setMessage("تم الرفع بنجاح! ");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { 
        console.error(error);
        setUploading(false); 
        alert("خطأ في الرفع: " + error.message); 
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;

  if (showFake404) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black font-sans">
      <h1 className="text-4xl font-bold border-r border-gray-300 pr-4 mr-4">404</h1>
      <div className="text-sm">This page could not be found.</div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white font-sans p-4">
      <div className="bg-white/5 backdrop-blur-xl p-10 rounded-3xl w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 text-center">Admin Access</h1>
        <form onSubmit={handleManualLogin} className="space-y-4">
          <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="password" placeholder="Security Code" value={inputCode} onChange={(e) => setInputCode(e.target.value)}
                  className="w-full bg-black/20 rounded-xl p-4 pl-12 text-white outline-none focus:bg-black/40 transition-all" />
          </div>
          <button type="submit" disabled={checkingCode} className="w-full bg-white text-black p-4 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-70">
            {checkingCode ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full text-white p-4 font-sans relative overflow-hidden" dir="rtl">
      
      {/* خلفية */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">لوحة التحكم 🚀</h1>
            <span className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl text-sm font-bold">Admin</span>
        </div>

        {message && <div className="bg-green-500/10 text-green-400 p-4 rounded-xl text-center mb-6 flex items-center justify-center gap-2 font-bold animate-fadeIn"><FaCheckCircle /> {message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. قسم الرفع */}
            <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-xl sticky top-4">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-200"><FaCloudUploadAlt className="text-blue-400"/> رفع ملف جديد</h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">العنوان</label>
                            <input type="text" className="w-full bg-black/20 rounded-xl p-3 text-white focus:bg-black/40 outline-none transition-colors" value={title} onChange={(e)=>setTitle(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">المادة</label>
                                <select className="w-full bg-black/20 rounded-xl p-3 text-white focus:bg-black/40 outline-none appearance-none cursor-pointer" value={subject} onChange={(e)=>setSubject(e.target.value)}>{subjects.map((s,i)=><option key={i} className="bg-gray-900" value={s}>{s}</option>)}</select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">النوع</label>
                                <select className="w-full bg-black/20 rounded-xl p-3 text-white focus:bg-black/40 outline-none appearance-none cursor-pointer" value={type} onChange={(e)=>setType(e.target.value)}><option className="bg-gray-900" value="summary">ملخص</option><option className="bg-gray-900" value="assignment">تكليف</option></select>
                            </div>
                        </div>

                        <div className="bg-black/10 rounded-xl p-6 text-center hover:bg-black/30 transition-all cursor-pointer relative border-2 border-dashed border-white/5 hover:border-blue-500/30">
                            <input type="file" onChange={handleFileChange} accept="image/*, application/pdf" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="pointer-events-none">
                                {files.length > 0 ? (
                                    <div className="text-green-400 text-sm font-bold flex flex-col items-center gap-1">
                                        <FaCheckCircle className="text-xl"/> تم {files.length}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-sm flex flex-col items-center gap-2">
                                        <FaCloudUploadAlt className="text-2xl opacity-50"/> <span>اضغط للاختيار</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button type="submit" disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg">
                            {uploading ? "جاري..." : "نشر الآن"}
                        </button>
                    </form>
                </div>
            </div>

            {/* 2. قسم القوائم */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* ⚠️ طلبات الانتظار */}
                {pendingList.length > 0 && (
                    <div className="bg-yellow-500/5 backdrop-blur-xl rounded-3xl p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                            ⚠️ الانتظار ({pendingList.length})
                        </h2>
                        <div className="space-y-3">
                            {pendingList.map((item) => (
                                <div key={item.id} className="bg-black/20 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-black/30 transition-all">
                                    <div className="flex items-center gap-4 w-full cursor-pointer overflow-hidden" onClick={() => openFile(item)}>
                                        <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-xl bg-yellow-500/10 text-yellow-500">
                                            {item.files && item.files[0]?.type?.includes('pdf') ? <FaFilePdf /> : <FaFileImage />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-bold text-white text-base truncate">{item.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                <span className="bg-white/5 px-2 py-1 rounded text-yellow-200 flex items-center gap-1">
                                                    <FaUser size={10}/> {item.studentName || "طالب"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
                                        <button onClick={() => handleApprove(item.id, item.title)} className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1">قبول <FaCheck size={12}/></button>
                                        <button onClick={() => handleDelete(item.id, item.title)} className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1">رفض <FaTimes size={12}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ✅ الملفات المنشورة */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl md:rounded-3xl p-3 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-gray-200 border-b border-white/5 pb-4">
                        <FaLayerGroup className="text-green-400"/> المنشورة ({materialsList.length})
                    </h2>
                    
                    <div className="space-y-2 md:space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {materialsList.map((item) => (
                            // 👇 الكارت الجديد: يعالج مشكلة الحواف والاختفاء
                            <div key={item.id} className="bg-black/20 rounded-xl p-3 flex items-center justify-between gap-3 group hover:bg-black/30 transition-all">
                                
                                {/* 1. الأيقونة والبيانات */}
                                <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => openFile(item)}>
                                    
                                    {/* الأيقونة (ثابتة) */}
                                    <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl flex items-center justify-center text-lg ${item.type === 'summary' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                        {item.files && item.files[0]?.type?.includes('pdf') ? <FaFilePdf /> : <FaFileImage />}
                                    </div>
                                    
                                    {/* النصوص (تتقلص بذكاء) */}
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-white text-sm md:text-base truncate group-hover:text-blue-300 transition-colors">
                                            {item.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 mt-0.5">
                                            <span className="truncate max-w-[80px] md:max-w-none">{item.subject}</span>
                                            <span className="hidden md:inline">•</span>
                                            <span className="flex items-center gap-1 text-blue-300 shrink-0">
                                                 <FaUser size={8}/> {item.studentName || item.uploader || "Admin"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. زر الحذف (ثابت وواضح) */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.title); }}
                                    className="w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all ml-1"
                                    title="حذف"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}
