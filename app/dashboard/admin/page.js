"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { collection, deleteDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot, addDoc, updateDoc } from "firebase/firestore";
import { 
  FaSpinner, FaTrash, FaFilePdf, FaFileImage, 
  FaCloudUploadAlt, FaLayerGroup, FaCheck, FaTimes, FaShieldAlt 
} from "react-icons/fa";

export default function AdminPage() {
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

  // دالة التحقق المعدلة لتقرأ الكود وتحدد الصلاحية
  const verifyCode = async (codeToVerify) => {
    if (!codeToVerify) return handleLoginFail();
    try {
      const q = query(collection(db, "allowedCodes"), where("code", "==", codeToVerify.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty && querySnapshot.docs[0].data().admin === true) {
        const userData = querySnapshot.docs[0].data();
        setIsAuthenticated(true);
        setShowFake404(false);
        const role = userData.role || "moderator";
        setAdminRole(role);
        // حفظ الكود في المكانين لضمان عمل الناف بار
        localStorage.setItem("adminCode", codeToVerify.trim());
        localStorage.setItem("adminRole", role);
      } else { 
        handleLoginFail(); 
      }
    } catch (error) { 
      console.error(error); 
      handleLoginFail();
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ تم إصلاح تداخل الأقواس هنا (المشكلة اللي كانت بتوقف الـ Build)
  useEffect(() => {
    const checkAccess = async () => {
      const savedCode = localStorage.getItem("adminCode") || localStorage.getItem("userEmail");
      const isSecretMode = searchParams.get("mode") === "login";
      
      if (savedCode) {
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

  const handleLoginFail = () => {
    localStorage.removeItem("adminCode");
    localStorage.removeItem("adminRole");
    setIsAuthenticated(false);
    setShowFake404(true);
    setIsLoading(false);
  };

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

  const handleDelete = async (id, title) => {
    if (adminRole !== "admin") return alert("صلاحية الحذف النهائي للمدير فقط ⛔");
    const password = prompt(`أدخل باسورد التأكيد لحذف "${title}":`);
    if (password === "98612") {
      try {
        await deleteDoc(doc(db, "materials", id));
        setMessage("تم الحذف بنجاح ✅");
        setTimeout(() => setMessage(""), 3000);
      } catch (error) { alert("حدث خطأ أثناء الحذف"); }
    } else if (password !== null) {
      alert("الباسورد خطأ! لا يمكن الحذف ❌");
    }
  };

  const handleAction = async (id, newStatus, finalType) => {
    if (newStatus === "rejected") {
      if (adminRole !== "admin") return alert("رفض الطلبات للمدير فقط ⛔");
      const password = prompt("أدخل باسورد التأكيد لرفض وحذف هذا الطلب:");
      if (password !== "98612") return alert("عملية ملغاة ❌");
    }
    try {
      if (newStatus === "approved") {
        await updateDoc(doc(db, "materials", id), { status: "approved", type: finalType });
        setMessage("تم القبول والنشر ✅");
      } else {
        await deleteDoc(doc(db, "materials", id));
        setMessage("تم حذف الطلب ❌");
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert("خطأ في الصلاحيات"); }
  };

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

  // شاشة إدخال الكود (تظهر فقط عند ?mode=login وبدون كود مخزن)
  if (!isLoading && !isAuthenticated && !showFake404) {
    return (
      <div className="min-h-screen  flex items-center justify-center p-6 text-white" dir="rtl">
        <div className=" p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md text-center shadow-2xl">
          <FaShieldAlt className="text-purple-500 text-5xl mx-auto mb-6" />
          <h2 className="text-xl font-black mb-6 uppercase tracking-tighter italic">Admin Access</h2>
          <input 
            type="password" placeholder="أدخل كود المشرف " 
            className="w-full bg-black border border-white/20 p-4 rounded-2xl text-white text-center font-bold tracking-widest outline-none focus:border-purple-500 transition-all"
            onKeyDown={(e) => e.key === 'Enter' && verifyCode(e.target.value)}
          />
          <p className="text-gray-600 text-[10px] mt-4 uppercase">System Verification Required</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-purple-600" /></div>;
  if (showFake404) return <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans"><h1 className="text-4xl font-bold border-r pr-4 mr-4">404</h1><div>This page could not be found.</div></div>;

  return (
    <div className="min-h-screen w-full text-white p-0 md:p-8 font-sans relative overflow-x-hidden bg-[#050505]" dir="rtl">
      {/* ... باقي كود الواجهة (UI) اللي كان عندك شغال تمام ... */}
      <div className="relative z-10 w-full max-w-7xl mx-auto pt-6 px-3 md:px-0">
         <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6 px-2">
           <div className="flex items-center gap-4">
             <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">Admin Central</h1>
             <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${adminRole === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                <FaShieldAlt className="inline ml-1"/> {adminRole === 'admin' ? "مدير نظام" : "مُراجع"}
             </span>
           </div>
         </div>

         {message && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-green-500/20 text-green-400 px-8 py-4 rounded-2xl font-bold border border-green-500/20 backdrop-blur-md">{message}</div>}

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 pb-20">
            {/* ... كود الـ Form والأرشيف كما هو في ملفك الأصلي ... */}
            {/* ملاحظة: قمت بدمج منطق الرفع والأرشيف الذي أرسلته سابقاً هنا */}
            <div className="lg:col-span-1">
               {/* كود الفورم (الرفع) */}
               <div className="bg-[#111] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-white/5 sticky top-4 shadow-2xl">
                 <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-purple-400 italic tracking-tighter"><FaCloudUploadAlt/> نشر سريع</h2>
                 <form onSubmit={handleUpload} className="space-y-6">
                    {/* ... محتوى الفورم كما هو في كودك ... */}
                    <div className="grid grid-cols-2 gap-2">
                       <select value={year} onChange={(e)=>setYear(e.target.value)} className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs font-bold outline-none">
                         {[1,2,3,4].map(y => <option key={y} value={y} className="bg-black text-white text-right">فرقة {y}</option>)}
                       </select>
                       <select value={semester} onChange={(e)=>setSemester(e.target.value)} className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs font-bold outline-none italic text-blue-400">
                         <option value={1} className="bg-black text-white text-right">ترم أول</option>
                         <option value={2} className="bg-black text-white text-right">ترم ثانٍ</option>
                       </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
                       <button type="button" onClick={() => setType("summary")} className={`py-2 rounded-lg font-black text-[10px] transition-all ${type === "summary" ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>ملخص</button>
                       <button type="button" onClick={() => setType("assignment")} className={`py-2 rounded-lg font-black text-[10px] transition-all ${type === "assignment" ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>تكليف</button>
                    </div>
                    <input type="text" className="w-full bg-black/40 rounded-2xl p-4 border border-white/5 text-sm font-bold outline-none" value={title} onChange={(e)=>setTitle(e.target.value)} required placeholder="عنوان المخلص" />
                    <select className="w-full bg-black/40 rounded-2xl p-4 border border-white/5 text-sm font-bold outline-none" value={subject} onChange={(e)=>setSubject(e.target.value)}>
                       {currentSubjects.map((s, i) => <option key={i} className="bg-gray-900" value={s}>{s}</option>)}
                    </select>
                    <div className="relative border-2 border-dashed border-white/10 rounded-[2rem] p-6 text-center">
                       <input type="file" onChange={(e) => setFiles(Array.from(e.target.files))} multiple className="absolute inset-0 opacity-0 cursor-pointer" />
                       <FaCloudUploadAlt size={24} className={`mx-auto mb-2 ${files.length > 0 ? 'text-green-500' : 'opacity-20'}`}/>
                       <p className="text-[10px] font-bold text-gray-500">{files.length > 0 ? `تم اختيار ${files.length} ملفات` : "اسحب الملفات هنا"}</p>
                    </div>
                    <button type="submit" disabled={uploading} className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-black shadow-xl text-xs uppercase italic tracking-widest transition-all">
                       {uploading ? "جاري الرفع..." : "نشر الآن"}
                    </button>
                 </form>
               </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
               {/* كود طلبات المراجعة */}
               {pendingList.length > 0 && (
                 <div className="bg-yellow-500/5 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-yellow-500/20 shadow-xl">
                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-yellow-500 italic"><FaSpinner className="animate-spin"/> طلبات المراجعة ({pendingList.length})</h2>
                    <div className="space-y-6">
                       {pendingList.map((item) => (
                          <div key={item.id} className="bg-black/60 rounded-[2rem] p-6 border border-white/5">
                             <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                   <h4 className="font-black text-white text-md mb-1">{item.title}</h4>
                                   <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">بواسطة: {item.studentName} | {item.subject}</p>
                                </div>
                                <div className="flex gap-2">
                                   <button onClick={() => handleAction(item.id, "approved", item.selectedType)} className="bg-green-600 text-white p-3 rounded-xl hover:scale-110 transition-all"><FaCheck/></button>
                                   {adminRole === "admin" && (
                                     <button onClick={() => handleAction(item.id, "rejected")} className="bg-red-600 text-white p-3 rounded-xl hover:scale-110 transition-all"><FaTimes/></button>
                                   )}
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* كود الأرشيف العام */}
               <div className="bg-[#111] rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-white/5 shadow-2xl">
                  <h2 className="text-xl font-bold mb-8 flex items-center gap-3 border-b border-white/5 pb-6 italic uppercase tracking-tighter"><FaLayerGroup className="text-blue-500"/> الأرشيف العام ({materialsList.length})</h2>
                  <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
                     {materialsList.map((item) => (
                        <div key={item.id} className="bg-black/30 rounded-[1.5rem] p-4 flex items-center justify-between border border-white/5 hover:border-purple-500/30 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                                 {item.files?.[0]?.type?.includes('pdf') ? <FaFilePdf className="text-red-500"/> : <FaFileImage className="text-blue-400"/>}
                              </div>
                              <div>
                                 <h4 className="font-black text-sm text-white italic">{item.title}</h4>
                                 <p className="text-[10px] text-gray-600 font-bold uppercase">{item.subject} | فرقة {item.year}</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={() => window.open(item.files?.[0]?.url, '_blank')} className="p-2.5 rounded-xl bg-white/5 text-gray-500 hover:text-white transition-all"><FaLayerGroup size={14}/></button>
                              {adminRole === "admin" && (
                                <button onClick={() => handleDelete(item.id, item.title)} className="bg-red-500/5 text-red-500 p-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all"><FaTrash size={14}/></button>
                              )}
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
