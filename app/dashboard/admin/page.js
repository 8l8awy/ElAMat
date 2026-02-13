"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db, auth, googleProvider } from "@/lib/firebase"; 
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth"; // أضفنا onAuthStateChanged
import { 
  collection, deleteDoc, doc, getDocs, query, 
  where, serverTimestamp, orderBy, onSnapshot, 
  addDoc, updateDoc, getDoc 
} from "firebase/firestore";
import { 
  FaSpinner, FaTrash, FaFilePdf, FaFileImage, 
  FaCloudUploadAlt, FaLayerGroup, FaCheck, FaTimes, FaShieldAlt, FaInfoCircle, FaSearch, FaGoogle, FaArrowLeft
} from "react-icons/fa";

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    year4: { 1: ["إدارة المخاطر", "مراجعة الحسابات", "محاسبة المنشآت المتخصصة"], 2: ["إدارة المحافظ المالية والمشتقات", "إدارة الموارد البشرية", "الأعمال الإلكترونية", "إحصاء تطبيقي", "قواعد بيانات", "مشروع التخرج"] }
  };

  const currentSubjects = subjectsBank[`year${year}`][semester] || [];

  useEffect(() => {
    if (!currentSubjects.includes(subject)) {
      setSubject(currentSubjects[0] || "");
    }
  }, [year, semester, currentSubjects]);

  // ✅ دالة التحقق الحقيقية من قاعدة البيانات
  const checkPermissions = async (userEmail) => {
    if (!userEmail) return false;
    try {
      const q = query(collection(db, "users"), where("email", "==", userEmail.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        if (data.role === "admin" || data.role === "moderator") {
          setAdminRole(data.role);
          return true;
        }
      }
      // فحص الأكواد القديمة
      const qCode = query(collection(db, "allowedCodes"), where("code", "==", userEmail));
      const snapCode = await getDocs(qCode);
      if (!snapCode.empty && snapCode.docs[0].data().admin === true) {
        setAdminRole(snapCode.docs[0].data().role || "admin");
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      const savedCode = localStorage.getItem("adminCode");
      
      if (user) {
        const hasAccess = await checkPermissions(user.email);
        if (hasAccess) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else if (savedCode) {
        const hasAccess = await checkPermissions(savedCode);
        if (hasAccess) setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const hasAccess = await checkPermissions(result.user.email);
      if (hasAccess) {
        setIsAuthenticated(true);
        localStorage.setItem("adminCode", result.user.email);
      } else {
        alert("ليس لديك صلاحيات إدارة ⛔");
        await signOut(auth);
      }
    } catch (error) { alert("خطأ في تسجيل الدخول"); }
  };

  const handleManualLogin = async (code) => {
    const hasAccess = await checkPermissions(code);
    if (hasAccess) {
      setIsAuthenticated(true);
      localStorage.setItem("adminCode", code);
    } else {
      alert("كود غير صحيح أو ليس لديك صلاحية 🚫");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaterialsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(i => i.status === "approved"));
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
        files: uploadedFilesData, status: "approved", uploader: auth.currentUser?.displayName || "Admin", createdAt: serverTimestamp(),
      });
      setUploading(false); setTitle(""); setDesc(""); setFiles([]); setMessage("تم النشر بنجاح ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert(error.message); setUploading(false); }
  };

  const filteredMaterials = materialsList.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-purple-600/20 border-t-purple-600 rounded-full animate-spin"></div>
      <p className="text-purple-600 text-[10px] font-black uppercase tracking-widest animate-pulse">Securing Access</p>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-white" dir="rtl">
        <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/5 w-full max-w-md text-center shadow-2xl relative">
          <FaShieldAlt className="text-purple-500 text-5xl mx-auto mb-6" />
          <h2 className="text-xl font-bold mb-8 italic uppercase">Identity Check</h2>
          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white text-black p-4 rounded-2xl font-black hover:bg-gray-100 transition-all mb-6">
            <FaGoogle /> دخول المشرفين
          </button>
          <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div><span className="relative bg-[#111] px-4 text-[10px] text-gray-600 font-bold uppercase">Or Admin Code</span></div>
          <input type="password" placeholder="أدخل الكود" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-center text-white outline-none focus:border-purple-500 transition-all" onKeyDown={(e) => e.key === 'Enter' && handleManualLogin(e.target.value)} />
          <button onClick={() => router.push("/")} className="mt-8 text-gray-600 hover:text-white text-xs flex items-center justify-center gap-2 mx-auto"><FaArrowLeft size={10} /> العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white p-4 md:p-8 font-sans " dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Admin Central</h1>
          <div className="flex items-center gap-4">
            {adminRole === 'admin' && <button onClick={() => router.push("/dashboard/users")} className="text-[10px] font-bold bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:bg-white/10 transition-all">إدارة المستخدمين 👥</button>}
            <span className={`px-4 py-1 rounded-full text-[10px] font-bold border ${adminRole === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{adminRole === 'admin' ? "مدير نظام" : "مُراجع"}</span>
            <button onClick={() => {signOut(auth); localStorage.clear(); window.location.reload();}} className="p-2 text-gray-600 hover:text-white transition-all"><FaTimes/></button>
          </div>
        </div>

        {message && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          <div className="lg:col-span-1">
            <div className="bg-[#111] p-6 md:p-8 rounded-[2rem] border border-white/5 sticky top-4">
              <h2 className="text-xl font-bold mb-6 text-purple-400 flex items-center gap-2"><FaCloudUploadAlt/> نشر مادة</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <select value={year} onChange={(e)=>setYear(Number(e.target.value))} className="bg-black border border-white/10 p-4 rounded-2xl outline-none text-xs">{[1,2,3,4].map(y => <option key={y} value={y}>فرقة {y}</option>)}</select>
                  <select value={semester} onChange={(e)=>setSemester(Number(e.target.value))} className="bg-black border border-white/10 p-4 rounded-2xl outline-none text-xs text-blue-400"><option value={1}>ترم أول</option><option value={2}>ترم ثانٍ</option></select>
                </div>
                <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none text-sm font-bold">{currentSubjects.map((s, i) => <option key={i} value={s}>{s}</option>)}</select>
                <input type="text" className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="عنوان المخلص" required />
                <textarea className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500 text-sm h-20 resize-none" value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="وصف المخلص..."></textarea>
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl">
                  <button type="button" onClick={() => setType("summary")} className={`py-2 rounded-lg font-black text-[10px] transition-all ${type === "summary" ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500'}`}>ملخص</button>
                  <button type="button" onClick={() => setType("assignment")} className={`py-2 rounded-lg font-black text-[10px] transition-all ${type === "assignment" ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500'}`}>تكليف</button>
                </div>
                <div className="relative border-2 border-dashed border-white/10 p-6 rounded-2xl text-center hover:border-purple-500/30">
                  <input type="file" multiple onChange={(e)=>setFiles(Array.from(e.target.files))} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <p className="text-[10px] font-bold text-gray-500">{files.length > 0 ? `Selected: ${files.length}` : "اضغط لرفع الملفات"}</p>
                </div>
                <button type="submit" disabled={uploading} className="w-full bg-purple-600 p-4 rounded-2xl font-black hover:bg-purple-500 transition-all uppercase italic">{uploading ? "جاري النشر..." : "نشر الآن"}</button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#111] p-6 md:p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3 text-blue-500 italic"><FaLayerGroup/> الأرشيف العام ({materialsList.length})</h2>
                <div className="relative w-full md:w-64">
                  <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                  <input type="text" placeholder="بحث سريع..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full bg-black/50 border border-white/5 p-2 pr-10 rounded-xl outline-none text-xs focus:border-blue-500/50" />
                </div>
              </div>
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar text-right">
                {filteredMaterials.map(item => (
                  <div key={item.id} className="bg-black/30 p-4 rounded-2xl flex justify-between items-center border border-white/5 hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                        {item.files?.[0]?.type?.includes('pdf') ? <FaFilePdf className="text-red-500"/> : <FaFileImage className="text-blue-400"/>}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${item.type === 'summary' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/10' : 'bg-orange-500/10 text-orange-400 border border-orange-500/10'}`}>{item.type === 'summary' ? 'ملخص' : 'تكليف'}</span>
                          <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                        </div>
                        <p className="text-[10px] text-gray-600 font-bold uppercase truncate">{item.subject} | فرقة {item.year}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => window.open(item.files?.[0]?.url, '_blank')} className="p-3 rounded-xl bg-white/5 text-gray-500 hover:text-white transition-all"><FaLayerGroup size={14}/></button>
                      {adminRole === "admin" && <button onClick={() => { if(confirm("حذف الملف نهائياً؟")) deleteDoc(doc(db, "materials", item.id)) }} className="text-red-500/30 hover:text-red-500 p-3 rounded-xl transition-all"><FaTrash size={14}/></button>}
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
  return ( <Suspense fallback={<div className="min-h-screen " />}> <AdminContent /> </Suspense> );
}
