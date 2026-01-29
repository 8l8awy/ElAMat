"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { collection, deleteDoc, updateDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaFileImage, FaLock, FaCheck, FaTimes, FaUser, FaCloudUploadAlt, FaLayerGroup, FaExchangeAlt } from "react-icons/fa";

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
  const [semester, setSemester] = useState(2); // إضافة حالة الترم (افتراضي 2)
  const [subject, setSubject] = useState("محاسبة الشركات"); // مادة افتراضية من ترم 2
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
   
  const [materialsList, setMaterialsList] = useState([]); 
  const [pendingList, setPendingList] = useState([]);      
   
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // قوائم المواد الموحدة
  const subjectsList = {
    1: ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"],
    2: ["محاسبة الشركات", "القانون التجاري", "اقتصاد كلي", "لغة إنجليزية تخصصية", "إدارة التنظيم"]
  };

  // تحديث المادة المختارة تلقائياً عند تغيير الترم
  useEffect(() => {
    setSubject(subjectsList[semester][0]);
  }, [semester]);

  // --- دوال التحقق والأمان (نفس كودك الأصلي) ---
  useEffect(() => {
    const checkAccess = async () => {
      const savedCode = localStorage.getItem("adminCode");
      const isSecretMode = searchParams.get("mode") === "login";
      if (savedCode) await verifyCode(savedCode, true);
      else if (isSecretMode) { setIsLoading(false); setShowFake404(false); }
      else { setIsLoading(false); setShowFake404(true); }
    };
    checkAccess();
  }, []);

  const verifyCode = async (codeToVerify, isAutoCheck = false) => {
    if (!isAutoCheck) setCheckingCode(true);
    try {
      const q = query(collection(db, "allowedCodes"), where("code", "==", codeToVerify.trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && querySnapshot.docs[0].data().admin === true) {
        setIsAuthenticated(true); setShowFake404(false);
        localStorage.setItem("adminCode", codeToVerify); 
      } else { if (!isAutoCheck) alert("⛔ كود غير صحيح أو ليس أدمن"); handleLoginFail(); }
    } catch (error) { console.error(error); }
    setIsLoading(false); if (!isAutoCheck) setCheckingCode(false);
  };

  const handleLoginFail = () => { localStorage.removeItem("adminCode"); setIsAuthenticated(false); setShowFake404(true); };

  // --- جلب البيانات (Materials) ---
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

  // --- دوال الرفع والحذف (معدلة لتشمل الترم) ---
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
    return (await res.json()).secure_url;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title) return alert("البيانات ناقصة");
    setUploading(true); setMessage("جاري الرفع...");
    try {
      const uploadedFilesData = [];
      for (let file of files) {
        const url = await uploadToCloudinary(file);
        uploadedFilesData.push({ name: file.name, url: url, type: file.type });
      }
      await addDoc(collection(db, "materials"), {
        title, desc, subject, type,
        semester: semester, // 👈 الربط بالترم المختار
        files: uploadedFilesData,
        date: new Date().toISOString(), 
        status: "approved", 
        uploader: "Admin",
        viewCount: 0, createdAt: serverTimestamp(),
      });
      setUploading(false); setTitle(""); setDesc(""); setFiles([]); setMessage("تم النشر للترم " + semester + " ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert(error.message); setUploading(false); }
  };

  const handleDelete = async (id, title) => { if (confirm(`حذف "${title}"؟`)) await deleteDoc(doc(db, "materials", id)); };
  const handleApprove = async (id, title) => { await updateDoc(doc(db, "materials", id), { status: "approved" }); };
  const openFile = (item) => { const url = item.fileUrl || item.files?.[0]?.url; if (url) window.open(url, '_blank'); };

  // --- الواجهة الرسومية ---
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-black text-blue-500"><FaSpinner className="animate-spin text-4xl" /></div>;
  if (showFake404) return <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans"><h1 className="text-4xl font-bold border-r pr-4 mr-4">404</h1><div>This page could not be found.</div></div>;
  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <form onSubmit={(e)=> {e.preventDefault(); verifyCode(inputCode)}} className="bg-white/5 p-10 rounded-3xl w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-white mb-6 font-sans">Admin Access</h1>
        <input type="password" placeholder="Security Code" value={inputCode} onChange={(e)=>setInputCode(e.target.value)} className="w-full bg-white/10 rounded-xl p-4 text-white outline-none focus:bg-white/20" />
        <button className="w-full bg-white text-black p-4 rounded-xl font-bold">{checkingCode ? "Verifying..." : "Login"}</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen w-full text-white p-4 font-sans relative overflow-hidden" dir="rtl">
      <div className="fixed inset-0 -z-10"><div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div></div>
      
      <div className="relative z-10 w-full max-w-6xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent italic uppercase">Admin Dashboard 🚀</h1>
          <span className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl text-sm font-bold">لوحة التحكم</span>
        </div>

        {message && <div className="bg-green-500/10 text-green-400 p-4 rounded-xl text-center mb-6 font-bold animate-pulse">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. قسم الرفع */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/5 sticky top-4">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3"><FaCloudUploadAlt className="text-blue-400"/> نشر مادة جديدة</h2>
              
              <form onSubmit={handleUpload} className="space-y-6">
                {/* مفتاح تبديل الترم الجديد */}
                <div className="flex bg-black/40 p-1.5 rounded-2xl gap-2 border border-white/5">
                   {[1, 2].map(s => (
                     <button key={s} type="button" onClick={() => setSemester(s)} className={`flex-1 py-3 rounded-xl font-black transition-all ${semester === s ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>
                        الترم {s}
                     </button>
                   ))}
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-2 mr-2">عنوان المنشور</label>
                  <input type="text" className="w-full bg-black/40 rounded-2xl p-4 outline-none focus:ring-2 ring-blue-500/20" value={title} onChange={(e)=>setTitle(e.target.value)} required placeholder="مثال: ملخص الفصل الثاني" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-2">المادة</label>
                    <select className="w-full bg-black/40 rounded-2xl p-4 outline-none appearance-none cursor-pointer" value={subject} onChange={(e)=>setSubject(e.target.value)}>
                      {subjectsList[semester].map((s, i) => <option key={i} className="bg-gray-900" value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-2">النوع</label>
                    <select className="w-full bg-black/40 rounded-2xl p-4 outline-none" value={type} onChange={(e)=>setType(e.target.value)}>
                      <option value="summary">ملخص</option>
                      <option value="assignment">تكليف</option>
                    </select>
                  </div>
                </div>

                <div className="relative group">
                  <input type="file" onChange={(e) => setFiles(Array.from(e.target.files))} multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${files.length > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 group-hover:border-blue-500/30'}`}>
                    {files.length > 0 ? <p className="text-green-400 font-bold">تم اختيار {files.length} ملفات</p> : <div className="text-gray-500"><FaCloudUploadAlt className="mx-auto text-3xl mb-2 opacity-20"/><span>اضغط لاختيار ملفات PDF/صور</span></div>}
                  </div>
                </div>

                <button type="submit" disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-[1.5rem] font-black shadow-xl transition-all active:scale-95 disabled:opacity-50">
                  {uploading ? "جاري الرفع الآن..." : "نشر للموقع"}
                </button>
              </form>
            </div>
          </div>

          {/* 2. قسم القوائم */}
          <div className="lg:col-span-2 space-y-6">
            {/* قسم المنشورة */}
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3 border-b border-white/5 pb-6"><FaLayerGroup className="text-green-500"/> المواد المنشورة ({materialsList.length})</h2>
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {materialsList.map((item) => (
                  <div key={item.id} className="bg-black/30 rounded-2xl p-4 flex items-center justify-between group hover:bg-black/50 transition-all border border-white/5">
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => openFile(item)}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${item.semester === 2 ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {item.files?.[0]?.type?.includes('pdf') ? <FaFilePdf /> : <FaFileImage />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors">{item.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                           <span className="bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-tighter">ترم {item.semester || 1}</span>
                           <span className="truncate">{item.subject}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(item.id, item.title)} className="w-11 h-11 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><FaTrash size={16}/></button>
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
