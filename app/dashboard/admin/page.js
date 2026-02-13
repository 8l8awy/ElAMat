"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { 
  collection, deleteDoc, doc, getDocs, query, 
  where, serverTimestamp, orderBy, onSnapshot, 
  addDoc, updateDoc 
} from "firebase/firestore";
import { 
  FaSpinner, FaTrash, FaFilePdf, FaFileImage, 
  FaCloudUploadAlt, FaLayerGroup, FaShieldAlt
} from "react-icons/fa";

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
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const subjectsBank = {
    year1: { 1: ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"], 2: ["السلوك التنظيمي", "طرق ومهارات الاتصال", "حقوق الإنسان", "رياضيات الأعمال", "التفكير الابتكاري", "مبادئ علم الاجتماع"] },
    year2: { 1: ["محاسبة التكاليف", "إدارة التسويق", "إدارة المشتريات", "التنمية المستدامة"], 2: ["مبادئ المحاسبة الإدارية", "إدارة الإنتاج والعمليات", "تحليلات الأعمال", "مبادئ الإدارة المالية", "نظم المعلومات الإدارية", "لغة أجنبية (2)"] },
    year3: { 1: ["إدارة الجودة", "المالية العامة", "منهج البحث العلمي"], 2: ["محاسبة إدارية متقدمة", "جداول العمل الإلكترونية", "نظم المعلومات المحاسبية", "الإدارة الاستراتيجية", "اقتصاديات النقود والبنوك", "ريادة الأعمال والمشروعات الصغيرة", "إدارة مالية متقدمة (بنوك)", "المحاسبة المتوسطة 2 (بنوك)"] },
    year4: { 1: ["إدارة المخاطر", "مراجعة الحسابات", "محاسبة المنشآت المتخصصة"], 2: ["إدارة المحافظ المالية والمشتقات", "إدارة الموارد البشرية", "الأعمال الإلكترونية", "الإحصاء التطبيقي", "قواعد البيانات", "مشروع التخرج"] }
  };

  const currentSubjects = subjectsBank[`year${year}`][semester] || [];

  useEffect(() => {
    if (!currentSubjects.includes(subject)) {
      setSubject(currentSubjects[0] || "");
    }
  }, [year, semester, currentSubjects]);

  const verifyAndLogin = async (input) => {
    if (!input) return;
    setIsLoading(true);
    try {
      const cleanInput = input.trim().toLowerCase();
      
      // 1. فحص جدول المرقّين (users)
      const uQ = query(collection(db, "users"), where("email", "==", cleanInput));
      const uSnap = await getDocs(uQ);
      if (!uSnap.empty) {
        const data = uSnap.docs[0].data();
        if (data.role === "admin" || data.role === "moderator") {
          setIsAuthenticated(true);
          setAdminRole(data.role);
          setShowFake404(false);
          localStorage.setItem("adminCode", input);
          return;
        }
      }

      // 2. فحص جدول الأكواد (allowedCodes)
      const cQ = query(collection(db, "allowedCodes"), where("code", "==", input.trim()));
      const cSnap = await getDocs(cQ);
      if (!cSnap.empty && cSnap.docs[0].data().admin === true) {
        setIsAuthenticated(true);
        setAdminRole(cSnap.docs[0].data().role || "admin");
        setShowFake404(false);
        localStorage.setItem("adminCode", input);
      } else {
        setShowFake404(true);
      }
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    const check = async () => {
      const authParam = searchParams.get("auth");
      const saved = localStorage.getItem("adminCode");
      if (authParam) await verifyAndLogin(authParam);
      else if (saved) await verifyAndLogin(saved);
      else setIsLoading(false);
    };
    check();
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setMaterialsList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(i => i.status === "approved"));
    });
    return () => unsub();
  }, [isAuthenticated]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title) return alert("ناقص بيانات");
    setUploading(true);
    try {
      const uploaded = [];
      for (let f of files) {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: fd });
        const d = await res.json();
        uploaded.push({ name: f.name, url: d.secure_url, type: f.type });
      }
      await addDoc(collection(db, "materials"), {
        title, desc, subject, type, year: Number(year), semester: Number(semester),
        files: uploaded, status: "approved", createdAt: serverTimestamp(),
      });
      setUploading(false); setTitle(""); setFiles([]); setMessage("تم النشر ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { alert(err.message); setUploading(false); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-purple-600 animate-pulse">جاري التحقق...</div>;

  if (showFake404) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans">
      <h1 className="text-4xl font-bold border-r pr-4 mr-4">404</h1>
      <div>This page could not be found.</div>
    </div>
  );

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-white bg-black">
      <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md text-center">
        <FaShieldAlt className="text-purple-500 text-5xl mx-auto mb-6" />
        <input type="password" placeholder="كود الإدارة" className="w-full bg-black border border-white/20 p-4 rounded-2xl text-center outline-none focus:border-purple-500" onKeyDown={(e) => e.key === 'Enter' && verifyAndLogin(e.target.value)} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full text-white p-4 md:p-8 bg-black" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-black mb-10 border-b border-white/5 pb-6 italic uppercase">Admin Central</h1>
        
        {message && <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl z-50">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5">
              <h2 className="text-lg font-bold mb-6 text-purple-400">نشر مادة</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <select value={year} onChange={(e)=>setYear(Number(e.target.value))} className="bg-black border border-white/10 p-4 rounded-xl text-xs">{[1,2,3,4].map(y => <option key={y} value={y}>فرقة {y}</option>)}</select>
                  <select value={semester} onChange={(e)=>setSemester(Number(e.target.value))} className="bg-black border border-white/10 p-4 rounded-xl text-xs text-blue-400"><option value={1}>ترم 1</option><option value={2}>ترم 2</option></select>
                </div>
                <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm">{currentSubjects.map((s,i) => <option key={i} value={s}>{s}</option>)}</select>
                <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="العنوان" className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none" required />
                <textarea value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="الوصف" className="w-full bg-black border border-white/10 p-4 rounded-xl text-sm h-24 resize-none"></textarea>
                <div className="relative border-2 border-dashed border-white/10 p-6 rounded-xl text-center">
                  <input type="file" multiple onChange={(e)=>setFiles(Array.from(e.target.files))} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <p className="text-xs text-gray-500">{files.length > 0 ? `جاهز: ${files.length}` : "ارفع الملفات"}</p>
                </div>
                <button type="submit" disabled={uploading} className="w-full bg-purple-600 p-4 rounded-xl font-bold">{uploading ? "جاري..." : "نشر الآن"}</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-[#111] p-6 rounded-[2rem] border border-white/5">
              <h2 className="text-lg font-bold mb-6 text-blue-500">الأرشيف</h2>
              <div className="space-y-3">
                {materialsList.map(m => (
                  <div key={m.id} className="bg-black/40 p-4 rounded-xl flex justify-between items-center border border-white/5">
                    <div className="text-right">
                      <h4 className="text-sm font-bold">{m.title}</h4>
                      <p className="text-[10px] text-gray-600">{m.subject} - فرقة {m.year}</p>
                    </div>
                    <button onClick={() => deleteDoc(doc(db, "materials", m.id))} className="text-red-900 hover:text-red-500"><FaTrash/></button>
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

export default function AdminPage() { return ( <Suspense> <AdminContent /> </Suspense> ); }
