"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { collection, deleteDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot, addDoc, updateDoc } from "firebase/firestore";
import { 
  FaSpinner, FaTrash, FaFilePdf, FaFileImage, 
  FaCloudUploadAlt, FaLayerGroup, FaCheck, FaTimes, FaShieldAlt, FaEye 
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
  const [materialsList, setMaterialsList] = useState([]); 
  const [pendingList, setPendingList] = useState([]); 
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // --- التحقق من الأمان والرتبة ---
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
      } else {
        handleLoginFail();
      }
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  useEffect(() => {
    const checkAccess = async () => {
      const savedCode = localStorage.getItem("adminCode");
      const savedRole = localStorage.getItem("adminRole");
      const isSecretMode = searchParams.get("mode") === "login";
      if (savedCode) {
        setAdminRole(savedRole || "moderator");
        await verifyCode(savedCode, true);
      } else if (isSecretMode) { setIsLoading(false); setShowFake404(false); }
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

  // --- جلب البيانات بنظام القائمة ---
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

  const handleAction = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "materials", id), { status: newStatus });
      if (newStatus === "rejected") await deleteDoc(doc(db, "materials", id));
      setMessage(newStatus === "approved" ? "تم النشر ✅" : "تم الرفض ❌");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert("خطأ في العملية"); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title) return alert("اكتب العنوان");
    setUploading(true);
    try {
      await addDoc(collection(db, "materials"), {
        title, status: "approved", uploader: "Admin", createdAt: serverTimestamp(),
      });
      setUploading(false); setTitle(""); setMessage("تم النشر ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert(error.message); setUploading(false); }
  };

  const handleDelete = async (id, title) => {
    if (adminRole !== "admin") return alert("للمدير فقط ⛔");
    if (confirm(`حذف "${title}"؟`)) await deleteDoc(doc(db, "materials", id));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><FaSpinner className="animate-spin text-4xl text-purple-600" /></div>;
  if (showFake404) return <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans"><h1 className="text-4xl font-bold border-r pr-4 mr-4">404</h1><div>This page could not be found.</div></div>;

  return (
    <div className="min-h-screen w-full text-white p-4 font-sans relative" dir="rtl">
      {/* هيدر الصفحة */}
      <div className="max-w-7xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black italic uppercase">Admin Central</h1>
            <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-lg text-[10px] font-black border border-red-500/20 uppercase">
              <FaShieldAlt className="inline ml-1"/> {adminRole}
            </span>
          </div>
        </div>

        {message && <div className="bg-green-500/10 text-green-400 p-4 rounded-2xl text-center mb-6 font-bold border border-green-500/20">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* سجل المنشورات (الأرشيف القديم) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3"><FaLayerGroup className="text-blue-500"/> أرشيف المحتوى ({materialsList.length})</h2>
              
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {materialsList.map((item) => (
                  <div key={item.id} className="bg-black/30 rounded-3xl p-5 flex items-center justify-between border border-white/5 group transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                        {item.files?.[0]?.type?.includes('pdf') ? <FaFilePdf className="text-red-500"/> : <FaFileImage className="text-blue-400"/>}
                      </div>
                      <div>
                        <h4 className="font-black text-white text-sm">{item.title}</h4>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{item.subject} | فرقة {item.year}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button onClick={() => window.open(item.files?.[0]?.url, '_blank')} className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all"><FaEye size={14}/></button>
                      {adminRole === "admin" && (
                        <button onClick={() => handleDelete(item.id, item.title)} className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><FaTrash size={14}/></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* لوحة النشر السريع (يمين) */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] rounded-[2.5rem] p-8 border border-white/5 sticky top-4">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-purple-400"><FaCloudUploadAlt/> نشر سريع</h2>
              <form onSubmit={handleUpload} className="space-y-6">
                <input type="text" className="w-full bg-black/40 rounded-2xl p-4 outline-none border border-white/5 text-sm font-bold" value={title} onChange={(e)=>setTitle(e.target.value)} required placeholder="عنوان المنشور" />
                <button type="submit" disabled={uploading} className="w-full bg-purple-600 py-4 rounded-2xl font-black text-xs uppercase italic tracking-widest">
                  {uploading ? "جاري النشر..." : "نشر الآن"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
