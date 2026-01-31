"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; 
import { collection, deleteDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot, addDoc, updateDoc } from "firebase/firestore";
import { FaSpinner, FaTrash, FaFilePdf, FaFileImage, FaCloudUploadAlt, FaLayerGroup, FaCheck, FaTimes, FaShieldAlt, FaEye } from "react-icons/fa";

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFake404, setShowFake404] = useState(true);
  const [adminRole, setAdminRole] = useState("moderator");
  const [title, setTitle] = useState("");
  const [materialsList, setMaterialsList] = useState([]); 
  const [pendingList, setPendingList] = useState([]); 
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const verifyCode = async (codeToVerify) => {
    try {
      const q = query(collection(db, "allowedCodes"), where("code", "==", codeToVerify.trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && querySnapshot.docs[0].data().admin === true) {
        const userData = querySnapshot.docs[0].data();
        setIsAuthenticated(true);
        setShowFake404(false);
        localStorage.setItem("adminCode", codeToVerify);
        localStorage.setItem("adminRole", userData.role || "moderator");
        setAdminRole(userData.role || "moderator");
      } else { setIsAuthenticated(false); setShowFake404(true); }
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  useEffect(() => {
    const savedCode = localStorage.getItem("adminCode");
    const isSecretMode = new URLSearchParams(window.location.search).get("mode") === "login";
    if (savedCode) verifyCode(savedCode);
    else if (isSecretMode) { setIsLoading(false); setShowFake404(false); }
    else { setIsLoading(false); setShowFake404(true); }
  }, []);

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
    if (newStatus === "rejected" && adminRole !== "admin") return alert("الحذف للمدير فقط ⛔");
    try {
      if (newStatus === "approved") {
        await updateDoc(doc(db, "materials", id), { status: "approved" });
        setMessage("تم القبول ✅");
      } else {
        await deleteDoc(doc(db, "materials", id));
        setMessage("تم الحذف ❌");
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert("خطأ في الصلاحيات"); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-black font-black italic">LOADING...</div>;
  if (showFake404) return <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans text-xl">404 | Page Not Found</div>;

  return (
    <div className="min-h-screen w-full  text-white p-0 md:pl-20 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto pt-10 px-4">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black italic uppercase">Admin Control</h1>
            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-[10px] border border-blue-500/20 uppercase font-black">{adminRole}</span>
          </div>
        </div>

        {message && <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] bg-green-600 text-white px-8 py-3 rounded-full font-bold shadow-2xl">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111] rounded-[2rem] p-6 border border-white/5 shadow-2xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-blue-500"><FaLayerGroup/> السجل العام ({materialsList.length})</h2>
              <div className="space-y-3">
                {materialsList.map((item) => (
                  <div key={item.id} className="bg-black/40 rounded-2xl p-4 flex items-center justify-between border border-white/5 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                        {item.files?.[0]?.type?.includes('pdf') ? <FaFilePdf className="text-red-500"/> : <FaFileImage className="text-blue-400"/>}
                      </div>
                      <h4 className="font-bold text-white text-sm truncate max-w-[150px] italic">{item.title}</h4>
                    </div>
                    {adminRole === "admin" && (
                      <button onClick={() => handleAction(item.id, "rejected")} className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"><FaTrash size={14}/></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* لوحة النشر */}
          <div className="lg:col-span-1">
             <div className="bg-[#111] rounded-[2rem] p-8 border border-white/5 sticky top-10 shadow-2xl">
                <h2 className="text-xl font-bold mb-8 text-purple-400 italic tracking-tighter uppercase font-sans"><FaCloudUploadAlt className="inline ml-2"/> نشر سريع</h2>
                <input type="text" className="w-full bg-black/40 rounded-2xl p-4 outline-none border border-white/5 text-sm font-bold mb-4" placeholder="العنوان هنا..." value={title} onChange={(e)=>setTitle(e.target.value)} />
                <button className="w-full bg-purple-600 py-5 rounded-2xl font-black text-xs uppercase italic tracking-widest shadow-xl shadow-purple-500/10 active:scale-95 transition-all">ارفع الآن</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
