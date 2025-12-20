"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot, updateDoc } from "firebase/firestore";
import { FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaLock, FaExclamationTriangle, FaTimes, FaCheck, FaDownload, FaImage, FaUser, FaThumbtack } from "react-icons/fa";
import { Loader2 } from "lucide-react";
export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ☁️ بيانات Cloudinary (تأكد من صحتها في ملف .env أيضاً)
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  // حالات النظام والأمان
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFake404, setShowFake404] = useState(true); 
  const [inputCode, setInputCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  // متغيرات لوحة التحكم
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
  const [materialsList, setMaterialsList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // للمعاينة
  const [downloading, setDownloading] = useState(false);
  const [filter, setFilter] = useState("all");

  const subjects = ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"];

  // ✅ 1. الفحص الذكي للأمان عند فتح الصفحة
  useEffect(() => {
    const checkAccess = async () => {
      const savedCode = localStorage.getItem("adminCode");
      const isSecretMode = searchParams.get("mode") === "login";

      if (savedCode) {
        await verifyCode(savedCode, true);
      } else if (isSecretMode) {
        setIsLoading(false);
        setShowFake404(false);
      } else {
        setIsLoading(false);
        setShowFake404(true);
      }
    };

    checkAccess();
  }, []);

  // دالة التحقق من الكود
  const verifyCode = async (codeToVerify, isAutoCheck = false) => {
    if (!isAutoCheck) setCheckingCode(true);

    try {
      const codesRef = collection(db, "allowedCodes");
      const q = query(codesRef, where("code", "==", codeToVerify.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.admin === true) {
          setIsAuthenticated(true);
          setShowFake404(false);
          localStorage.setItem("adminCode", codeToVerify); 
        } else {
          if (!isAutoCheck) alert("⛔ هذا الكود ليس لمشرف (Admin)");
          if (isAutoCheck) handleLoginFail(); 
        }
      } else {
        if (!isAutoCheck && !isSecretMode(codeToVerify)) alert("⛔ الكود غير صحيح");
        if (isAutoCheck) handleLoginFail();
      }
    } catch (error) {
      console.error(error);
      if (!isAutoCheck) alert("خطأ في الاتصال");
    }
    
    setIsLoading(false);
    if (!isAutoCheck) setCheckingCode(false);
  };
  
  // دالة مساعدة لتجاوز خطأ undefined في التنبيه
  const isSecretMode = (code) => code === ""; 

  const handleLoginFail = () => {
    localStorage.removeItem("adminCode");
    setIsAuthenticated(false);
    setShowFake404(true);
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    await verifyCode(inputCode);
  };

  // جلب البيانات (Realtime)
  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaterialsList(data);
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  // دوال التحكم (حذف، قبول، رفع)
  const handleDelete = async (id, e) => { 
      if(e) e.stopPropagation();
      if (confirm(`حذف نهائي؟`)) {
          await deleteDoc(doc(db, "materials", id)); 
          if(selectedFile?.id === id) setSelectedFile(null);
      }
  };

  const handleApprove = async (id, e) => {
    if(e) e.stopPropagation();
    if (!confirm("نشر هذا الملف للطلاب؟")) return;
    try {
      await updateDoc(doc(db, "materials", id), { status: "approved" });
      if(selectedFile?.id === id) setSelectedFile(null);
    } catch (error) { alert("حدث خطأ"); }
  };

  const handleFileChange = (e) => { if (e.target.files) setFiles(Array.from(e.target.files)); };
  
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
    const data = await res.json();
    return data.secure_url;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title) return alert("البيانات ناقصة");
    setUploading(true); setMessage("جاري الرفع...");
    
    try {
      const file = files[0];
      const url = await uploadToCloudinary(file);
      
      let fileType = 'other';
      if (file.type.includes('pdf')) fileType = 'pdf';
      else if (file.type.includes('image')) fileType = 'image';

      await addDoc(collection(db, "materials"), {
        title, subject, type, 
        fileUrl: url, 
        fileType: fileType,
        uploader: "Admin", 
        date: new Date().toISOString(), 
        status: "approved", 
        viewCount: 0, 
        downloadCount: 0, 
        createdAt: serverTimestamp(),
      });
      
      setUploading(false); setTitle(""); setFiles([]); setMessage("تم النشر بنجاح! ");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { 
        console.error(error);
        setUploading(false); 
        alert("خطأ في الرفع"); 
    }
  };

  const handleDownload = async (fileUrl, title, fileType) => {
    setDownloading(true);
    try {
        if (fileType === 'pdf' || fileUrl.endsWith('.pdf')) {
            saveAs(fileUrl, `${title}.pdf`);
        } else {
            saveAs(fileUrl, `${title}.jpg`);
        }
    } catch (error) {
        alert("فشل التحميل.");
    } finally {
        setDownloading(false);
    }
  };

  // تصفية المواد
  const pendingMaterials = materialsList.filter(item => item.status !== "approved");
  const filteredMaterials = materialsList.filter(item => {
    if (filter === "pending") return item.status !== "approved";
    if (filter === "approved") return item.status === "approved";
    return true;
  });

  // --- الشاشات (Views) ---

  // 1. شاشة التحميل
  if (isLoading) {
    return (
      <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff'}}>
        <FaSpinner className="fa-spin" size={40} color="#333" />
      </div>
    );
  }

  // 2. صفحة 404 الوهمية
  if (showFake404) {
    return (
      <div style={{height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#000', background: '#fff', fontFamily: 'sans-serif'}}>
        <h1 style={{fontSize: '2rem', fontWeight: '600', margin: '0 0 10px 0'}}>404</h1>
        <h2 style={{fontSize: '14px', fontWeight: 'normal', margin: 0}}>This page could not be found.</h2>
      </div>
    );
  }

  // 3. شاشة تسجيل الدخول
  if (!isAuthenticated) {
    return (
      <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', color: 'white', fontFamily: 'sans-serif'}}>
        <div style={{background: 'rgba(255, 255, 255, 0.05)', padding: '50px 40px', borderRadius: '20px', textAlign: 'center', border: '1px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px'}}>
          <h1 style={{fontSize: '1.8rem', marginBottom: '10px', fontWeight: 'bold'}}>Admin Access</h1>
          <form onSubmit={handleManualLogin}>
            <div style={{marginBottom: '20px', position: 'relative'}}>
                <FaLock style={{position: 'absolute', left: '15px', top: '15px', color: '#666'}} />
                <input type="password" placeholder="Security Code" value={inputCode} onChange={(e) => setInputCode(e.target.value)} style={{width: '100%', padding: '15px 15px 15px 45px', borderRadius: '10px', border: '1px solid #444', background: '#111', color: 'white', fontSize: '1rem', outline: 'none'}} />
            </div>
            <button type="submit" disabled={checkingCode} style={{background: 'white', color: 'black', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', width: '100%', cursor: 'pointer', opacity: checkingCode ? 0.7 : 1}}>
              {checkingCode ? "Verifying..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 4. لوحة التحكم (Authenticated)
  return (
    <div className="min-h-screen bg-[#0b0c15] text-white p-6 lg:p-10 font-sans" dir="rtl">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
           <span className="text-blue-500">🛡️</span> لوحة التحكم
        </h1>
        <div className="bg-gray-900 p-1 rounded-xl border border-gray-800 flex gap-1">
          {['all', 'pending', 'approved'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {f === 'all' ? 'الكل' : f === 'pending' ? 'المعلقة' : 'المنشورة'}
            </button>
          ))}
        </div>
      </div>

      {message && <div className="bg-green-500/10 border border-green-500 text-green-500 p-4 rounded-xl text-center mb-6 flex items-center justify-center gap-2"><FaCheckCircle /> {message}</div>}

      {/* Upload Form */}
      <div className="bg-[#151720] border border-gray-800 rounded-2xl p-6 mb-10">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">رفع مادة جديدة (Admin)</h2>
          <form onSubmit={handleUpload}>
            <div className="mb-4"><label className="block mb-2 text-gray-400">العنوان</label><input type="text" className="w-full bg-gray-900 p-3 rounded-lg text-white border border-gray-700 focus:border-blue-500 outline-none" value={title} onChange={(e)=>setTitle(e.target.value)} required /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block mb-2 text-gray-400">المادة</label><select className="w-full bg-gray-900 p-3 rounded-lg text-white border border-gray-700 outline-none" value={subject} onChange={(e)=>setSubject(e.target.value)}>{subjects.map((s,i)=><option key={i} value={s}>{s}</option>)}</select></div>
                <div><label className="block mb-2 text-gray-400">النوع</label><select className="w-full bg-gray-900 p-3 rounded-lg text-white border border-gray-700 outline-none" value={type} onChange={(e)=>setType(e.target.value)}><option value="summary">ملخص</option><option value="assignment">تكليف</option></select></div>
            </div>
            <div className="mb-6"><label className="block mb-2 text-gray-400">الملف</label><div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"><input type="file" onChange={handleFileChange} accept=".pdf,image/*" className="w-full" />{files.length > 0 && <p className="text-green-500 mt-2">{files[0].name}</p>}</div></div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold shadow-lg transition-all" disabled={uploading}>{uploading ? "جاري الرفع..." : "نشر المادة"}</button>
          </form>
      </div>

      {/* Pending Requests Section */}
      {pendingMaterials.length > 0 && (
        <div className="mb-10 animate-fadeIn">
            <div className="border border-yellow-600/30 bg-yellow-500/5 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
                    <FaExclamationTriangle /> طلبات قيد الانتظار ({pendingMaterials.length})
                </h2>
                <div className="space-y-3">
                    {pendingMaterials.map(item => (
                        <div key={item.id} onClick={() => setSelectedFile(item)} className="bg-[#1a1d2d] hover:bg-[#23263a] border border-gray-700 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 cursor-pointer transition-all">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="p-3 bg-gray-800 rounded-lg">{(item.fileType === 'pdf' || item.fileUrl?.endsWith('.pdf')) ? <FaFilePdf className="text-red-500 w-6 h-6"/> : <FaImage className="text-blue-400 w-6 h-6"/>}</div>
                                <div><h3 className="font-bold text-white text-lg">{item.title}</h3><div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1"><span className="flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded"><FaUser size={10}/> {item.uploader}</span><span className="flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded text-pink-400"><FaThumbtack size={10}/> {item.subject}</span></div></div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto pl-2">
                                <button onClick={(e) => handleApprove(item.id, e)} className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm shadow-lg"><FaCheck /> قبول</button>
                                <button onClick={(e) => handleDelete(item.id, e)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm border border-red-500/20"><FaTimes /> رفض</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* All Files Grid */}
      <h3 className="text-lg font-bold text-gray-400 mb-4 border-b border-gray-800 pb-2">سجل الملفات ({filteredMaterials.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => (
          <div key={item.id} className="bg-[#151720] border border-gray-800 rounded-2xl p-5 hover:border-blue-500/30 transition-all relative overflow-hidden">
            <div className={`absolute top-0 right-0 bottom-0 w-1 ${item.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gray-900 rounded-xl">{(item.fileType === 'pdf' || item.fileUrl?.endsWith('.pdf')) ? <FaFilePdf className="text-red-500 w-6 h-6"/> : <FaImage className="text-blue-400 w-6 h-6"/>}</div>
                <div><h3 className="font-bold text-white line-clamp-1">{item.title}</h3><p className="text-xs text-gray-500">{item.subject}</p></div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-800">
                <button onClick={() => setSelectedFile(item)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><FaEye /> معاينة</button>
                {item.status !== "approved" && (<button onClick={(e) => handleApprove(item.id, e)} className="flex-1 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"><FaCheck /> قبول</button>)}
                <button onClick={(e) => handleDelete(item.id, e)} className="w-9 h-9 flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><FaTrash size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#151720] w-full max-w-5xl h-[90vh] rounded-2xl border border-gray-700 flex flex-col shadow-2xl overflow-hidden relative">
            <button onClick={() => setSelectedFile(null)} className="absolute top-4 left-4 z-50 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur-sm transition-colors"><FaTimes size={20} /></button>
            <div className="p-4 border-b border-gray-800 bg-gray-900 text-center"><h3 className="font-bold text-lg text-white">{selectedFile.title}</h3><p className="text-sm text-gray-400">{selectedFile.subject} • {selectedFile.uploader}</p></div>
            <div className="flex-1 bg-gray-950 flex items-center justify-center p-4 overflow-hidden relative">
              {(selectedFile.fileType === 'pdf' || selectedFile.fileUrl?.endsWith('.pdf')) ? (
                <div className="text-center"><FaFilePdf className="text-gray-700 w-24 h-24 mx-auto mb-4 animate-pulse" /><button onClick={() => window.open(selectedFile.fileUrl, '_blank')} className="bg-[#00f260] text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(0,242,96,0.3)]">📖 فتح PDF في صفحة جديدة</button></div>
              ) : (
                <img src={selectedFile.fileUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
              )}
            </div>
            <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center">
               <div className="flex gap-3">
                   {selectedFile.status !== "approved" && (<button onClick={() => handleApprove(selectedFile.id)} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"><FaCheck /> قبول ونشر</button>)}
                   <button onClick={() => handleDownload(selectedFile.fileUrl, selectedFile.title, selectedFile.fileType)} disabled={downloading} className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">{downloading ? <Loader2 className="animate-spin" size={18}/> : <FaDownload size={18}/>} تحميل</button>
               </div>
               <button onClick={() => handleDelete(selectedFile.id)} className="text-red-500 hover:bg-red-500/10 px-5 py-2.5 rounded-xl font-bold transition-colors">حذف الملف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
