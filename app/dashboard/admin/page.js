"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db, auth, googleProvider } from "@/lib/firebase"; 
import { signInWithPopup, signOut } from "firebase/auth";
import { 
  collection, deleteDoc, doc, getDocs, query, 
  where, serverTimestamp, orderBy, onSnapshot, 
  addDoc, updateDoc, getDoc 
} from "firebase/firestore";
import { 
  FaSpinner, FaTrash, FaFilePdf, FaFileImage, 
  FaCloudUploadAlt, FaLayerGroup, FaCheck, FaTimes, FaShieldAlt, FaInfoCircle, FaSearch, FaGoogle
} from "react-icons/fa";

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFake404, setShowFake404] = useState(false); 
  const [adminRole, setAdminRole] = useState("moderator");
  const [searchTerm, setSearchTerm] = useState(""); 

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState(""); 
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(2);
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
  const [materialsList, setMaterialsList] = useState([]); 
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const subjectsBank = {
    year1: { 1: ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"], 2: ["السلوك التنظيمي", "طرق ومهارات الاتصال", "حقوق الإنسان", "رياضيات الأعمال", "التفكير الابتكاري", "مبادئ علم الاجتماع"] },
    year2: { 1: ["محاسبة التكاليف", "إدارة التسويق", "إدارة المشتريات", "التنمية المستدامة"], 2: ["مبادئ المحاسبة الإدارية", "إدارة الإنتاج والعمليات", "تحليلات الأعمال", "مبادئ الإدارة المالية", "نظم المعلومات الإدارية", "لغة أجنبية (2)"] },
    year3: { 1: ["إدارة الجودة", "المالية العامة", "منهج البحث العلمي"], 2: ["محاسبة إدارية متقدمة", "جداول العمل الإلكترونية", "نظم المعلومات المحاسبية", "الإدارة الاستراتيجية", "اقتصاديات النقود والبنوك", "ريادة الأعمال والمشروعات الصغيرة", "إدارة مالية متقدمة (بنوك)", "المحاسبة المتوسطة 2 (بنوك)"] },
    year4: { 1: ["إدارة المخاطر", "مراجعة الحسابات", "محاسبة المنشآت المتخصصة"], 2: ["إدارة المحافظ المالية والمشتقات", "إدارة الموارد البشرية", "الأعمال الإلكترونية", "الإحصاء التطبيقي", "قواعد البيانات", "مشروع التخرج"] }
  };

  const currentSubjects = subjectsBank[`year${year}`][semester] || [];

  const verifyAndLogin = async (input) => {
    if (!input) return;
    setIsLoading(true);
    try {
      const cleanInput = input.trim().toLowerCase();
      
      // 1. فحص المشرفين (بالإيميل)
      const uQ = query(collection(db, "users"), where("email", "==", cleanInput));
      const uSnap = await getDocs(uQ);
      
      if (!uSnap.empty) {
        const userData = uSnap.docs[0].data();
        if (userData.role === "admin" || userData.role === "moderator") {
          setIsAuthenticated(true);
          setAdminRole(userData.role);
          setShowFake404(false);
          localStorage.setItem("adminCode", cleanInput); // تثبيت الكود
          setIsLoading(false);
          return;
        }
      }

      // 2. فحص الأكواد (مثل 98612)
      const cQ = query(collection(db, "allowedCodes"), where("code", "==", input.trim()));
      const cSnap = await getDocs(cQ);
      
      if (!cSnap.empty && cSnap.docs[0].data().admin === true) {
        const data = cSnap.docs[0].data();
        setIsAuthenticated(true);
        setAdminRole(data.role || "admin");
        setShowFake404(false);
        localStorage.setItem("adminCode", input.trim()); // تثبيت الكود
      } else {
        setShowFake404(true);
      }
    } catch (err) {
      console.error(err);
      setShowFake404(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ المحرك الأساسي: بيمنع الكود إنه يتشال عند الريلود
  useEffect(() => {
    const checkAccess = async () => {
      const urlAuth = searchParams.get("auth");
      const savedCode = localStorage.getItem("adminCode");

      if (urlAuth) {
        await verifyAndLogin(urlAuth);
      } else if (savedCode) {
        await verifyAndLogin(savedCode);
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

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
      <p className="text-purple-500 font-black italic animate-pulse tracking-widest text-sm uppercase">Checking Access...</p>
    </div>
  );

  // ✅ الفيك إيرور الأسود
  if (showFake404) return (
    <div style={{  color: '#fff', height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, zIndex: 99999, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ borderRight: '1px solid rgba(255,255,255,0.3)', paddingRight: '20px', marginRight: '20px', fontSize: '24px' }}>404</h1>
        <h2 style={{ fontSize: '14px', fontWeight: 'normal' }}>This page could not be found.</h2>
      </div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white bg-black" dir="rtl">
      <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md text-center shadow-2xl">
        <FaShieldAlt className="text-purple-500 text-5xl mx-auto mb-6" />
        <h2 className="text-xl font-bold mb-6 italic uppercase">Admin Central</h2>
        <button onClick={() => signInWithPopup(auth, googleProvider).then(r => verifyAndLogin(r.user.email))} className="w-full flex items-center justify-center gap-3 bg-white text-black p-4 rounded-2xl font-black hover:bg-gray-200 mb-4 text-sm"><FaGoogle /> دخول بجوجل</button>
        <input type="password" placeholder="كود الإدارة" className="w-full bg-black border border-white/20 p-4 rounded-2xl text-white text-center font-bold outline-none focus:border-purple-500" onKeyDown={(e) => e.key === 'Enter' && verifyAndLogin(e.target.value)} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full text-white p-4 md:p-8 font-sans bg-black" dir="rtl">
      <div className="max-w-7xl mx-auto pb-20 text-right">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">Admin Central</h1>
          <span className={`px-4 py-1 rounded-full text-[10px] font-bold border ${adminRole === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{adminRole === 'admin' ? "مدير نظام" : "مُراجع"}</span>
        </div>

        {message && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 sticky top-4">
              <h2 className="text-xl font-bold mb-6 text-purple-400 flex items-center gap-2"><FaCloudUploadAlt/> نشر مادة</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <select value={year} onChange={(e)=>setYear(Number(e.target.value))} className="bg-black border border-white/10 p-4 rounded-2xl outline-none text-xs text-white">
                    {[1,2,3,4].map(y => <option key={y} value={y}>فرقة {y}</option>)}
                  </select>
                  <select value={semester} onChange={(e)=>setSemester(Number(e.target.value))} className="bg-black border border-white/10 p-4 rounded-2xl outline-none text-xs text-blue-400">
                    <option value={1}>ترم أول</option><option value={2}>ترم ثانٍ</option>
                  </select>
                </div>
                <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none text-sm font-bold">
                  {currentSubjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                <input type="text" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-purple-500" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="العنوان" required />
                <textarea className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white text-sm h-20 resize-none outline-none" value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="وصف..."></textarea>
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl">
                    <button type="button" onClick={() => setType("summary")} className={`py-2 rounded-lg font-black text-[10px] ${type === "summary" ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>ملخص</button>
                    <button type="button" onClick={() => setType("assignment")} className={`py-2 rounded-lg font-black text-[10px] ${type === "assignment" ? 'bg-orange-600 text-white' : 'text-gray-500'}`}>تكليف</button>
                </div>
                <div className="relative border-2 border-dashed border-white/10 p-6 rounded-2xl text-center">
                  <input type="file" multiple onChange={(e)=>setFiles(Array.from(e.target.files))} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <p className="text-[10px] font-bold text-gray-500">{files.length > 0 ? `Selected: ${files.length}` : "اضغط لرفع الملفات"}</p>
                </div>
                <button type="submit" disabled={uploading} className="w-full bg-purple-600 p-4 rounded-2xl font-black">{uploading ? "جاري..." : "نشر الآن"}</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3 text-blue-500"><FaLayerGroup/> الأرشيف</h2>
                <input type="text" placeholder="بحث..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="bg-black border border-white/10 p-2 rounded-xl text-xs w-48" />
              </div>
              <div className="space-y-4 max-h-[700px] overflow-y-auto">
                {materialsList.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                  <div key={item.id} className="bg-black/30 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                    <div className="flex items-center gap-4 truncate">
                      <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                        {item.files?.[0]?.type?.includes('pdf') ? <FaFilePdf className="text-red-500"/> : <FaFileImage className="text-blue-400"/>}
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                        <p className="text-[10px] text-gray-600 font-bold uppercase truncate">{item.subject} | فرقة {item.year}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => window.open(item.files?.[0]?.url, '_blank')} className="p-3 rounded-xl bg-white/5 text-gray-500 hover:text-white transition-all"><FaLayerGroup size={14}/></button>
                      {adminRole === "admin" && ( <button onClick={() => { if(confirm("حذف؟")) deleteDoc(doc(doc(db, "materials", item.id))) }} className="text-red-500/30 hover:text-red-500 p-3 rounded-xl"><FaTrash size={14}/></button> )}
                    </div>
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

export default function AdminPage() {
  return ( <Suspense fallback={<div className="min-h-screen bg-black" />}> <AdminContent /> </Suspense> );
}
