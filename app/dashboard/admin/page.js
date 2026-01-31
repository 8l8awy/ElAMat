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

  // دالة التحقق المعدلة لتقرأ كود 98610 برتبته من الفايربيز
  const verifyCode = async (codeToVerify) => {
    try {
      const q = query(collection(db, "allowedCodes"), where("code", "==", codeToVerify.trim()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty && querySnapshot.docs[0].data().admin === true) {
        const userData = querySnapshot.docs[0].data();
        setIsAuthenticated(true);
        setShowFake404(false);
        
        const finalRole = userData.role || "moderator";
        setAdminRole(finalRole);
        localStorage.setItem("adminCode", codeToVerify.trim());
        localStorage.setItem("adminRole", finalRole);
      } else { handleLoginFail(); }
    } catch (error) { handleLoginFail(); }
    setIsLoading(false);
  };

  useEffect(() => {
    const checkAccess = async () => {
      const savedCode = localStorage.getItem("adminCode");
      const isSecretMode = searchParams.get("mode") === "login";
      if (savedCode) { await verifyCode(savedCode); }
      else if (isSecretMode) { setIsLoading(false); setShowFake404(false); }
      else { setIsLoading(false); setShowFake404(true); }
    };
    checkAccess();
  }, [searchParams]);

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

  const handleDelete = async (id, title) => {
    if (adminRole !== "admin") return alert("للمدير فقط ⛔");
    const password = prompt(`تأكيد الحذف: أدخل الباسورد (98612) لحذف "${title}":`);
    if (password === "98612") {
      await deleteDoc(doc(db, "materials", id));
      setMessage("تم الحذف ✅");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleAction = async (id, newStatus, finalType) => {
    if (newStatus === "rejected") {
      if (adminRole !== "admin") return alert("الرفض للمدير فقط ⛔");
      const password = prompt("أدخل باسورد التأكيد (98612) للرفض:");
      if (password !== "98612") return;
    }
    try {
      if (newStatus === "approved") {
        await updateDoc(doc(db, "materials", id), { status: "approved", type: finalType });
        setMessage("تم النشر ✅");
      } else {
        await deleteDoc(doc(db, "materials", id));
        setMessage("تم الرفض والحذف ❌");
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { console.error(error); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title) return alert("أكمل البيانات");
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
    } catch (error) { setUploading(false); }
  };

  // شاشة الدخول السوداء (تظهر عند ?mode=login)
  if (!isLoading && !isAuthenticated && !showFake404) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="bg-[#111] p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md text-center shadow-2xl">
          <FaShieldAlt className="text-purple-500 text-5xl mx-auto mb-6" />
          <h2 className="text-xl font-black text-white mb-6 uppercase">Admin Access</h2>
          <input 
            type="password" placeholder="كود 98610" 
            className="w-full bg-black border border-white/20 p-4 rounded-2xl text-white text-center font-bold tracking-widest outline-none focus:border-purple-500"
            onKeyDown={(e) => e.key === 'Enter' && verifyCode(e.target.value)}
          />
          <p className="text-gray-600 text-[10px] mt-4 uppercase">Enter Your Moderator Code</p>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center font-black text-purple-600 italic">LOADING...</div>;
  if (showFake404) return <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans"><h1 className="text-4xl font-bold border-r pr-4 mr-4">404</h1><div>This page could not be found.</div></div>;

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white p-0 md:p-8 font-sans" dir="rtl">
       <div className="max-w-7xl mx-auto pt-6 px-4 md:px-0">
          <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Admin Central</h1>
            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${adminRole === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
               <FaShieldAlt className="inline ml-1"/> {adminRole}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ... هنا تحط باقي كود الـ Form والأرشيف اللي في الردود اللي فاتت ... */}
            <div className="lg:col-span-3 text-center opacity-20 font-black italic">
               لوحة التحكم جاهزة لاستقبال كود {adminRole} ✅
            </div>
          </div>
       </div>
    </div>
  );
}
