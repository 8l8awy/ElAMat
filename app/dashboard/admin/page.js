"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { collection, deleteDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot, addDoc, updateDoc } from "firebase/firestore";
import { 
  FaSpinner, FaTrash, FaFilePdf, FaFileImage, 
  FaCloudUploadAlt, FaLayerGroup, FaCheck, FaTimes, FaShieldAlt 
} from "react-icons/fa";

// مكون فرعي للتعامل مع SearchParams
function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFake404, setShowFake404] = useState(true);
  const [adminRole, setAdminRole] = useState("moderator");

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState(""); 
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(2);
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
  const [materialsList, setMaterialsList] = useState([]); 
  const [pendingList, setPendingList] = useState([]); 
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const subjectsBank = {
    year1: {
      1: ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"],
      2: ["محاسبة الشركات", "القانون التجاري", "اقتصاد كلي", "لغة إنجليزية تخصصية", "إدارة التنظيم"]
    },
    year2: { 1: ["مادة تجريبية سنة تانية"], 2: [] },
    year3: { 1: [], 2: [] },
    year4: { 1: [], 2: [] }
  };

  const currentSubjects = subjectsBank[`year${year}`][semester] || [];

  useEffect(() => {
    setSubject(currentSubjects[0] || "");
  }, [year, semester]);

  // ✅ تم إصلاح الدالة بإضافة async هنا لحل مشكلة الـ Build
  const verifyCode = async (codeToVerify) => {
    if (!codeToVerify) {
      setIsLoading(false);
      return;
    }
    const cleanCode = String(codeToVerify).trim();
    
    // مفتاح الطوارئ المباشر (98610) أو الدخول عبر الرابط auth=98610
    if (cleanCode === "98610") {
      setIsAuthenticated(true);
      setShowFake404(false);
      setAdminRole("admin");
      localStorage.setItem("adminCode", "98610");
      setIsLoading(false);
      return;
    }

    try {
      const q = query(collection(db, "allowedCodes"), where("code", "==", cleanCode));
      const querySnapshot = await getDocs(q); // الـ await دي كانت مسببة الخطأ
      
      if (!querySnapshot.empty && querySnapshot.docs[0].data().admin === true) {
        const userData = querySnapshot.docs[0].data();
        setIsAuthenticated(true);
        setShowFake404(false);
        setAdminRole(userData.role || "moderator");
        localStorage.setItem("adminCode", cleanCode);
      } else { 
        setShowFake404(true);
      }
    } catch (error) { 
      console.error("Auth Error:", error);
      setShowFake404(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      // دعم الدخول عبر الرابط المباشر ?auth=98610
      const urlAuth = searchParams.get("auth");
      const savedCode = localStorage.getItem("adminCode") || localStorage.getItem("userEmail");
      const isSecretMode = searchParams.get("mode") === "login" || urlAuth === "98610";
      
      if (urlAuth === "98610") {
        await verifyCode("98610");
      } else if (savedCode) {
        await verifyCode(savedCode);
      } else if (isSecretMode) {
        setIsLoading(false);
        setShowFake404(false);
      } else {
        setIsLoading(false);
        setShowFake404(true);
      }
    };
    checkAccess();
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaterialsList(allData.filter(item => item.status === "approved"));
      setPendingList(allData.filter(item => item.status === "pending").map(item => ({...item, selectedType: item.type || "summary"})));
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title) return alert("البيانات ناقصة");
    setUploading(true);
    try {
      const uploadedFilesData = [];
      for (let file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
        const data = await res.json();
        uploadedFilesData.push({ name: file.name, url: data.secure_url, type: file.type });
      }
      await addDoc(collection(db, "materials"), {
        title, desc, subject, type, year: Number(year), semester: Number(semester),
        files: uploadedFilesData, status: "approved", uploader: "Admin", createdAt: serverTimestamp(),
      });
      setUploading(false); setTitle(""); setDesc(""); setFiles([]); setMessage("تم النشر بنجاح ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert(error.message); setUploading(false); }
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-purple-500 font-bold animate-pulse">SYSTEM LOADING...</div>;

  if (showFake404) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans">
      <h1 className="text-4xl font-bold border-r pr-4 mr-4">404</h1>
      <div>This page could not be found.</div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-6 text-white" dir="rtl">
        <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md text-center shadow-2xl">
          <FaShieldAlt className="text-purple-500 text-5xl mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-6 italic">Admin Identity Check</h2>
          <input 
            type="password" placeholder="أدخل كود الإدارة" 
            className="w-full bg-black border border-white/20 p-4 rounded-2xl text-white text-center font-bold tracking-widest outline-none focus:border-purple-500"
            onKeyDown={(e) => e.key === 'Enter' && verifyCode(e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white p-4 md:p-8 font-sans bg-[#050505]" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black italic border-b border-white/5 pb-6 mb-10 tracking-tighter uppercase">Admin Central</h1>
        
        {message && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-green-500/20 text-green-400 px-8 py-4 rounded-2xl border border-green-500/20 backdrop-blur-md">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          {/* عمود الرفع */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 sticky top-4 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-purple-400"><FaCloudUploadAlt/> نشر مادة</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <input type="text" className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="عنوان المخلص" required />
                <div className="grid grid-cols-2 gap-2">
                   <select value={year} onChange={(e)=>setYear(e.target.value)} className="bg-black border border-white/10 p-4 rounded-2xl outline-none">
                     {[1,2,3,4].map(y => <option key={y} value={y}>فرقة {y}</option>)}
                   </select>
                   <select value={semester} onChange={(e)=>setSemester(e.target.value)} className="bg-black border border-white/10 p-4 rounded-2xl outline-none italic text-blue-400">
                     <option value={1}>ترم أول</option>
                     <option value={2}>ترم ثانٍ</option>
                   </select>
                </div>
                <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none font-sans">
                  {currentSubjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                <div className="border-2 border-dashed border-white/10 p-6 rounded-2xl text-center">
                  <input type="file" multiple onChange={(e)=>setFiles(Array.from(e.target.files))} className="hidden" id="fileInput" />
                  <label htmlFor="fileInput" className="cursor-pointer text-gray-500 text-xs font-bold uppercase">
                    {files.length > 0 ? `Selected: ${files.length} Files` : "Choose Files"}
                  </label>
                </div>
                <button type="submit" disabled={uploading} className="w-full bg-purple-600 p-4 rounded-2xl font-black hover:bg-purple-500 transition-all uppercase italic">
                  {uploading ? "Publishing..." : "Publish Now"}
                </button>
              </form>
            </div>
          </div>

          {/* عمود الأرشيف */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-blue-400 italic tracking-tighter uppercase"><FaLayerGroup/> Materials Archive ({materialsList.length})</h2>
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {materialsList.map(item => (
                  <div key={item.id} className="bg-black/30 p-4 rounded-2xl flex justify-between items-center border border-white/5 hover:border-purple-500/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                         {item.files?.[0]?.type?.includes('pdf') ? <FaFilePdf className="text-red-500"/> : <FaFileImage className="text-blue-400"/>}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white italic">{item.title}</h4>
                        <p className="text-[10px] text-gray-600 font-bold uppercase">{item.subject} | فرقة {item.year}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteDoc(doc(db, "materials", item.id))} className="text-red-500/30 hover:text-red-500 p-3 rounded-xl transition-all"><FaTrash size={14}/></button>
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

// المكون الرئيسي مع Suspense لحل مشاكل الـ Build في Next.js 16
export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AdminContent />
    </Suspense>
  );
}
