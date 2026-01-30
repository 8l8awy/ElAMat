"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { collection, deleteDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { 
  FaSpinner, FaTrash, FaFilePdf, FaFileImage, 
  FaCloudUploadAlt, FaLayerGroup, FaExchangeAlt, 
  FaGraduationCap, FaClipboardList, FaBook, FaFileSignature 
} from "react-icons/fa";

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFake404, setShowFake404] = useState(true);
  
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(2);
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("summary"); // 👈 الحالة الجديدة لنوع المحتوى
  const [files, setFiles] = useState([]); 
   
  const [materialsList, setMaterialsList] = useState([]); 
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

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

  const currentSubjects = subjectsBank[`year${year}`][semester] || [];

  useEffect(() => {
    setSubject(currentSubjects[0] || "");
  }, [year, semester]);

  // --- دوال الأمان والتحقق ---
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
    try {
      const q = query(collection(db, "allowedCodes"), where("code", "==", codeToVerify.trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && querySnapshot.docs[0].data().admin === true) {
        setIsAuthenticated(true); setShowFake404(false);
        localStorage.setItem("adminCode", codeToVerify); 
      } else { handleLoginFail(); }
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  const handleLoginFail = () => { localStorage.removeItem("adminCode"); setIsAuthenticated(false); setShowFake404(true); };

  // --- جلب البيانات مع الترتيب الزمني ---
  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaterialsList(allData.filter(item => item.status === "approved"));
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
    if (!files.length || !title || !subject) return alert("البيانات ناقصة يا هندسة!");
    setUploading(true); setMessage("جاري الرفع السحابي...");
    try {
      const uploadedFilesData = [];
      for (let file of files) {
        const url = await uploadToCloudinary(file);
        uploadedFilesData.push({ name: file.name, url: url, type: file.type });
      }
      await addDoc(collection(db, "materials"), {
        title, subject, type, 
        year: Number(year),
        semester: Number(semester),
        files: uploadedFilesData,
        status: "approved", 
        uploader: "Admin",
        createdAt: serverTimestamp(),
      });
      setUploading(false); setTitle(""); setFiles([]); 
      setMessage(`تم نشر ${type === 'summary' ? 'ملخص' : 'تكليف'} بنجاح ✅`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert(error.message); setUploading(false); }
  };

  const handleDelete = async (id, title) => { if (confirm(`حذف "${title}" نهائياً؟`)) await deleteDoc(doc(db, "materials", id)); };
  const openFile = (item) => { const url = item.files?.[0]?.url; if (url) window.open(url, '_blank'); };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><FaSpinner className="animate-spin text-4xl text-purple-600" /></div>;
  if (showFake404) return <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans"><h1 className="text-4xl font-bold border-r pr-4 mr-4">404</h1><div>This page could not be found.</div></div>;

  return (
    <div className="min-h-screen w-full text-white p-4 font-sans relative" dir="rtl">
      <div className="fixed inset-0 -z-10 bg-[#050505]"><div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Admin Central 🚀</h1>
          <span className="bg-purple-500/10 text-purple-400 px-4 py-2 rounded-xl text-[10px] font-black border border-purple-500/20 uppercase">V2.0 Dashboard</span>
        </div>

        {message && <div className="bg-green-500/10 text-green-400 p-4 rounded-2xl text-center mb-6 font-bold border border-green-500/20 animate-bounce">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          
          {/* لوحة التحكم والرفع */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/5 sticky top-4">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-purple-400"><FaCloudUploadAlt/> نشر محتوى جديد</h2>
              
              <form onSubmit={handleUpload} className="space-y-6">
                
                {/* اختيار الفرقة */}
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 mr-2 flex items-center gap-2 font-black uppercase"><FaGraduationCap/> الفرقة الدراسية</label>
                  <div className="flex bg-black/40 p-1.5 rounded-2xl gap-1 border border-white/5 w-full">
                    {[1, 2, 3, 4].map(y => (
                      <button key={y} type="button" onClick={() => setYear(y)} className={`flex-1 py-2 rounded-xl font-black text-xs transition-all ${year === y ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}>
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                {/* اختيار الترم */}
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 mr-2 flex items-center gap-2 font-black uppercase"><FaExchangeAlt/> الترم الحالي</label>
                  <div className="flex bg-black/40 p-1.5 rounded-2xl gap-1 border border-white/5 w-full">
                    {[1, 2].map(s => (
                      <button key={s} type="button" onClick={() => setSemester(s)} className={`flex-1 py-2 rounded-xl font-black text-xs transition-all ${semester === s ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}>
                        ترم {s === 1 ? 'أول' : 'ثاني'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* اختيار نوع المحتوى 👈 (الجديد) */}
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-500 mr-2 flex items-center gap-2 font-black uppercase"><FaClipboardList/> تصنيف الملف</label>
                  <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                    <button type="button" onClick={() => setType("summary")} className={`py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${type === "summary" ? 'bg-purple-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
                      <FaBook size={14}/> ملخص
                    </button>
                    <button type="button" onClick={() => setType("assignment")} className={`py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${type === "assignment" ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
                      <FaFileSignature size={14}/> تكليف
                    </button>
                  </div>
                </div>

                <div className="h-px bg-white/5 my-4"></div>

                <div>
                  <label className="text-[10px] text-gray-500 block mb-2 mr-2 font-black uppercase">عنوان المنشور</label>
                  <input type="text" className="w-full bg-black/40 rounded-2xl p-4 outline-none border border-white/5 focus:border-purple-500/50 transition-all text-sm font-bold" value={title} onChange={(e)=>setTitle(e.target.value)} required placeholder="مثال: ملخص مادة الاقتصاد - م1" />
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 block mb-2 mr-2 font-black uppercase">المادة الدراسية</label>
                  <select className="w-full bg-black/40 rounded-2xl p-4 outline-none appearance-none cursor-pointer border border-white/5 text-sm font-bold" value={subject} onChange={(e)=>setSubject(e.target.value)}>
                    {currentSubjects.map((s, i) => <option key={i} className="bg-gray-900" value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="relative group">
                  <input type="file" onChange={(e) => setFiles(Array.from(e.target.files))} multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-[2rem] p-8 text-center transition-all ${files.length > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 group-hover:border-purple-500/30'}`}>
                    {files.length > 0 ? <p className="text-green-400 font-black text-xs italic">تم اختيار {files.length} ملفات</p> : <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest"><FaCloudUploadAlt size={24} className="mx-auto mb-2 opacity-20"/>ارفع الـ PDF أو الصور</div>}
                  </div>
                </div>

                <button type="submit" disabled={uploading} className="w-full bg-purple-600 hover:bg-purple-500 py-5 rounded-[1.5rem] font-black shadow-xl transition-all active:scale-95 disabled:opacity-50 text-sm italic uppercase tracking-wider">
                  {uploading ? "جاري المعالجة..." : "نشر المحتوى الآن"}
                </button>
              </form>
            </div>
          </div>

          {/* سجل المنشورات */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111] backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3 border-b border-white/5 pb-6 tracking-tighter italic uppercase"><FaLayerGroup className="text-blue-500"/> التاريخ الدراسي ({materialsList.length})</h2>
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {materialsList.map((item) => (
                  <div key={item.id} className="bg-black/30 rounded-3xl p-5 flex items-center justify-between group border border-white/5 hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center gap-5 flex-1 cursor-pointer" onClick={() => openFile(item)}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-white/5 shadow-inner`}>
                        {item.files?.[0]?.type?.includes('pdf') ? <FaFilePdf className="text-red-500"/> : <FaFileImage className="text-blue-400"/>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter ${item.type === 'summary' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {item.type === 'summary' ? 'ملخص' : 'تكليف'}
                          </span>
                          <h4 className="font-black text-sm text-white truncate italic">{item.title}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                           <span className="text-gray-400">فرقة {item.year}</span>
                           <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                           <span className="text-gray-400">ترم {item.semester}</span>
                           <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                           <span className="text-purple-500/70 truncate">{item.subject}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(item.id, item.title)} className="w-12 h-12 rounded-2xl bg-red-500/5 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-500 shadow-lg"><FaTrash size={16}/></button>
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
