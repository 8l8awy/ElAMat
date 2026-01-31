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

  const verifyCode = async (codeToVerify, isAutoCheck = false) => {
    try {
      const q = query(collection(db, "allowedCodes"), where("code", "==", codeToVerify.trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && querySnapshot.docs[0].data().admin === true) {
        const userData = querySnapshot.docs[0].data();
        setIsAuthenticated(true);
        setShowFake404(false);
        localStorage.setItem("adminCode", codeToVerify);
        localStorage.setItem("adminRole", userData.role || "admin"); 
        setAdminRole(userData.role || "admin");
      } else { handleLoginFail(); }
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  useEffect(() => {
    const checkAccess = async () => {
      const savedCode = localStorage.getItem("adminCode");
      const isSecretMode = searchParams.get("mode") === "login";
      if (savedCode) { await verifyCode(savedCode, true); }
      else if (isSecretMode) { setIsLoading(false); setShowFake404(false); }
      else { setIsLoading(false); setShowFake404(true); }
    };
    checkAccess();
  }, []);

  const handleLoginFail = () => {
    localStorage.removeItem("adminCode");
    localStorage.removeItem("adminRole");
    setIsAuthenticated(false);
    setShowFake404(true);
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

  const handleAction = async (id, newStatus, finalType) => {
    if (newStatus === "rejected" && adminRole !== "admin") return alert("صلاحية الحذف للمدير فقط ⛔");
    try {
      if (newStatus === "approved") {
        await updateDoc(doc(db, "materials", id), { status: "approved", type: finalType });
        setMessage("تم القبول ✅");
      } else {
        await deleteDoc(doc(db, "materials", id));
        setMessage("تم الحذف ❌");
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert("خطأ"); }
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
      setUploading(false); setTitle(""); setDesc(""); setFiles([]); setMessage("تم النشر ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert(error.message); setUploading(false); }
  };

  const handleDelete = async (id, title) => {
    if (adminRole !== "admin") return alert("صلاحية الحذف للمدير فقط ⛔");
    if (confirm(`حذف "${title}" نهائياً؟`)) await deleteDoc(doc(db, "materials", id));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><FaSpinner className="animate-spin text-4xl text-purple-600" /></div>;
  if (showFake404) return <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans"><h1 className="text-4xl font-bold border-r pr-4 mr-4">404</h1><div>This page could not be found.</div></div>;

  return (
    /* p-0 تجعل الشاشة بدون حواف في الموبايل */
    <div className="min-h-screen w-full text-white p-0 md:p-10 font-sans relative" dir="rtl">
      <div className="fixed inset-0 -z-10 bg-[#050505]"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto pt-6 px-4 md:px-0">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black italic uppercase">Admin Central</h1>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${adminRole === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
               {adminRole}
            </span>
          </div>
        </div>

        {message && <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
          
          <div className="lg:col-span-1">
            <div className="bg-[#111] rounded-3xl p-6 border border-white/5 shadow-2xl">
              <h2 className="text-lg font-bold mb-6 text-purple-400 flex items-center gap-2"><FaCloudUploadAlt/> نشر جديد</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <input type="text" className="w-full bg-black/40 rounded-xl p-4 outline-none border border-white/5 text-sm font-bold" value={title} onChange={(e)=>setTitle(e.target.value)} required placeholder="عنوان " />
                <button type="submit" disabled={uploading} className="w-full bg-purple-600 py-4 rounded-xl font-black text-xs uppercase">
                  {uploading ? "جاري الرفع..." : "نشر الآن"}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {pendingList.length > 0 && (
              <div className="bg-yellow-500/5 rounded-3xl p-6 border border-yellow-500/20 shadow-xl">
                <h2 className="text-lg font-bold mb-6 text-yellow-500 flex items-center gap-2"><FaSpinner className="animate-spin"/> طلبات المراجعة</h2>
                <div className="space-y-4">
                  {pendingList.map((item) => (
                    <div key={item.id} className="bg-black/60 rounded-2xl p-5 border border-white/5">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-sm truncate">{item.title}</h4>
                          <p className="text-[10px] text-gray-500 uppercase mt-1">{item.studentName} | {item.subject}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                           <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 gap-1">
                              <button onClick={() => setPendingList(pendingList.map(p => p.id === item.id ? {...p, selectedType: "summary"} : p))} className={`px-2 py-1 rounded-md text-[8px] font-black ${item.selectedType === 'summary' ? 'bg-purple-600' : 'text-gray-500'}`}>ملخص</button>
                              <button onClick={() => setPendingList(pendingList.map(p => p.id === item.id ? {...p, selectedType: "assignment"} : p))} className={`px-2 py-1 rounded-md text-[8px] font-black ${item.selectedType === 'assignment' ? 'bg-blue-600' : 'text-gray-500'}`}>تكليف</button>
                           </div>
                           <div className="flex gap-2 justify-end">
                              <button onClick={() => handleAction(item.id, "approved", item.selectedType)} className="bg-green-600 text-white p-2.5 rounded-lg"><FaCheck size={12}/></button>
                              {/* زر الرفض يختفي للمود */}
                              {adminRole === "admin" && (
                                <button onClick={() => handleAction(item.id, "rejected")} className="bg-red-600 text-white p-2.5 rounded-lg"><FaTimes size={12}/></button>
                              )}
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#111] rounded-3xl p-6 border border-white/5">
              <h2 className="text-lg font-bold mb-6 text-blue-500 flex items-center gap-2"><FaLayerGroup/> الأرشيف المعتمد</h2>
              <div className="space-y-3">
                {materialsList.map((item) => (
                  <div key={item.id} className="bg-black/30 rounded-2xl p-4 flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                          {item.files?.[0]?.type?.includes('pdf') ? <FaFilePdf className="text-red-500"/> : <FaFileImage className="text-blue-400"/>}
                       </div>
                       <h4 className="font-bold text-white text-xs truncate max-w-[150px]">{item.title}</h4>
                    </div>
                    
                    {/* زر الحذف يظهر للأدمن فقط */}
                    {adminRole === "admin" && (
                      <button onClick={() => handleDelete(item.id, item.title)} className="bg-red-500/10 text-red-500 p-2.5 rounded-lg hover:bg-red-500 hover:text-white transition-all"><FaTrash size={12}/></button>
                    )}
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
