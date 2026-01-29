"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { collection, deleteDoc, updateDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaFileImage, FaLock, FaCheck, FaTimes, FaUser, FaCloudUploadAlt, FaLayerGroup, FaExchangeAlt, FaGraduationCap } from "react-icons/fa";

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
  
  // --- حالات النظام الجديد (سنة وترم) ---
  const [year, setYear] = useState(1); // الفرقة الدراسية
  const [semester, setSemester] = useState(2); // الترم
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
   
  const [materialsList, setMaterialsList] = useState([]); 
  const [pendingList, setPendingList] = useState([]);      
   
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // بنك المواد المنظم لكل السنين (نفس اللي في صفحة العرض)
  const subjectsBank = {
    year1: {
      1: ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"],
      2: ["محاسبة الشركات", "القانون التجاري", "اقتصاد كلي", "لغة إنجليزية تخصصية", "إدارة التنظيم"]
    },
    year2: {
      1: ["مادة تجريبية سنة تانية"],
      2: []
    },
    year3: { 1: [], 2: [] },
    year4: { 1: [], 2: [] }
  };

  // تحديث القائمة بناءً على السنة والترم
  const currentSubjects = subjectsBank[`year${year}`][semester] || [];

  useEffect(() => {
    setSubject(currentSubjects[0] || "");
  }, [year, semester]);

  // --- دوال الأمان (كودك الأصلي) ---
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
      } else { if (!isAutoCheck) alert("⛔ كود غير مشرف"); handleLoginFail(); }
    } catch (error) { console.error(error); }
    setIsLoading(false); if (!isAutoCheck) setCheckingCode(false);
  };

  const handleLoginFail = () => { localStorage.removeItem("adminCode"); setIsAuthenticated(false); setShowFake404(true); };

  // --- جلب البيانات ---
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

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
    return (await res.json()).secure_url;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title || !subject) return alert("البيانات ناقصة");
    setUploading(true); setMessage("جاري الرفع...");
    try {
      const uploadedFilesData = [];
      for (let file of files) {
        const url = await uploadToCloudinary(file);
        uploadedFilesData.push({ name: file.name, url: url, type: file.type });
      }
      await addDoc(collection(db, "materials"), {
        title, desc, subject, type,
        year: year, // 👈 حفظ السنة
        semester: semester, // 👈 حفظ الترم
        files: uploadedFilesData,
        status: "approved", 
        uploader: "Admin",
        createdAt: serverTimestamp(),
      });
      setUploading(false); setTitle(""); setFiles([]); setMessage(`تم النشر لفرقة ${year} ترم ${semester} ✅`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert(error.message); setUploading(false); }
  };

  const handleDelete = async (id, title) => { if (confirm(`حذف "${title}"؟`)) await deleteDoc(doc(db, "materials", id)); };
  const openFile = (item) => { const url = item.fileUrl || item.files?.[0]?.url; if (url) window.open(url, '_blank'); };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><FaSpinner className="animate-spin text-4xl text-blue-500" /></div>;
  if (showFake404) return <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans"><h1 className="text-4xl font-bold border-r pr-4 mr-4">404</h1><div>This page could not be found.</div></div>;

  return (
    <div className="min-h-screen w-full text-white p-4 font-sans relative" dir="rtl">
      <div className="fixed inset-0 -z-10 bg-[#050505]"><div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <h1 className="text-3xl font-black italic uppercase">Admin Central 🚀</h1>
          <div className="flex gap-2">
            <span className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-xl text-xs font-bold border border-purple-500/20">نظام الـ 4 سنوات</span>
          </div>
        </div>

        {message && <div className="bg-green-500/10 text-green-400 p-4 rounded-2xl text-center mb-6 font-bold border border-green-500/20">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. لوحة الرفع الذكية */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/5 sticky top-4">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-purple-400"><FaCloudUploadAlt/> نشر محتوى جديد</h2>
              
              <form onSubmit={handleUpload} className="space-y-6">
                
                {/* اختيار السنة (الفرقة) */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 mr-2 flex items-center gap-2"><FaGraduationCap/> اختر الفرقة الدراسية</label>
                  <div className="flex bg-black/40 p-1 rounded-2xl gap-1 border border-white/5 w-fit">
                    {[1, 2, 3, 4].map(y => (
                      <button key={y} type="button" onClick={() => setYear(y)} className={`px-4 py-2 rounded-xl font-black text-sm transition-all ${year === y ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}>
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                {/* اختيار الترم */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 mr-2 flex items-center gap-2"><FaExchangeAlt/> اختر الترم</label>
                  <div className="flex bg-black/40 p-1 rounded-2xl gap-1 border border-white/5 w-fit">
                    {[1, 2].map(s => (
                      <button key={s} type="button" onClick={() => setSemester(s)} className={`px-6 py-2 rounded-xl font-black text-sm transition-all ${semester === s ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}>
                        الترم {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-white/5 my-4"></div>

                <div>
                  <label className="text-xs text-gray-500 block mb-2 mr-2 text-right">عنوان المنشور</label>
                  <input type="text" className="w-full bg-black/40 rounded-2xl p-4 outline-none border border-white/5 focus:border-purple-500/50 transition-all" value={title} onChange={(e)=>setTitle(e.target.value)} required placeholder="مثال: ملخص المحاضرة الأولى" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-2 mr-2">المادة (تتغير حسب اختيارك فوق)</label>
                    <select className="w-full bg-black/40 rounded-2xl p-4 outline-none appearance-none cursor-pointer border border-white/5" value={subject} onChange={(e)=>setSubject(e.target.value)}>
                      {currentSubjects.length > 0 ? currentSubjects.map((s, i) => <option key={i} className="bg-gray-900" value={s}>{s}</option>) : <option>لا يوجد مواد مضافة</option>}
                    </select>
                  </div>
                </div>

                <div className="relative group">
                  <input type="file" onChange={(e) => setFiles(Array.from(e.target.files))} multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${files.length > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 group-hover:border-purple-500/30'}`}>
                    {files.length > 0 ? <p className="text-green-400 font-bold text-sm">تم تجهيز {files.length} ملفات</p> : <div className="text-gray-500 text-xs"><FaCloudUploadAlt size={24} className="mx-auto mb-2 opacity-20"/>اضغط لرفع الملفات</div>}
                  </div>
                </div>

                <button type="submit" disabled={uploading} className="w-full bg-purple-600 hover:bg-purple-500 py-5 rounded-2xl font-black shadow-xl transition-all active:scale-95 disabled:opacity-50">
                  {uploading ? "جاري النشر..." : "نشر المحتوى الآن"}
                </button>
              </form>
            </div>
          </div>

          {/* 2. قسم استعراض المنشورات */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111] backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3 border-b border-white/5 pb-6"><FaLayerGroup className="text-blue-500"/> سجل المنشورات ({materialsList.length})</h2>
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {materialsList.map((item) => (
                  <div key={item.id} className="bg-black/30 rounded-2xl p-4 flex items-center justify-between group border border-white/5 hover:bg-black/50 transition-all">
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => openFile(item)}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-white/5 text-gray-400`}>
                        {item.files?.[0]?.type?.includes('pdf') ? <FaFilePdf className="text-red-400"/> : <FaFileImage className="text-blue-400"/>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-white truncate">{item.title}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1">
                           <span className="bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-lg font-black">فرقة {item.year || 1}</span>
                           <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-lg font-black">ترم {item.semester || 1}</span>
                           <span className="truncate">{item.subject}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(item.id, item.title)} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><FaTrash size={14}/></button>
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
