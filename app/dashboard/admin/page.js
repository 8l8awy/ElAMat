"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../../../lib/firebase"; 
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, deleteDoc, updateDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot } from "firebase/firestore";
import { FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaLock, FaCheck, FaTimes, FaExternalLinkAlt } from "react-icons/fa";

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ☁️ بيانات Cloudinary
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  // حالات النظام
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFake404, setShowFake404] = useState(true);
  const [inputCode, setInputCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  // متغيرات لوحة التحكم
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
  
  // ✅ قوائم منفصلة للمنشورات والطلبات المعلقة
  const [materialsList, setMaterialsList] = useState([]); // الملفات المقبولة
  const [pendingList, setPendingList] = useState([]);     // طلبات الطلاب المعلقة
  
  const [loadingList, setLoadingList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const subjects = ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"];

  // ✅ 1. الفحص الذكي عند فتح الصفحة
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
        if (!isAutoCheck) alert("⛔ الكود غير صحيح");
        if (isAutoCheck) handleLoginFail();
      }
    } catch (error) {
      console.error(error);
      if (!isAutoCheck) alert("خطأ في الاتصال");
    }
    
    setIsLoading(false);
    if (!isAutoCheck) setCheckingCode(false);
  };

  const handleLoginFail = () => {
    localStorage.removeItem("adminCode");
    setIsAuthenticated(false);
    setShowFake404(true);
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    await verifyCode(inputCode);
  };

  // ✅ جلب البيانات وفصلها (مقبولة vs معلقة)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const q = query(collection(db, "materials"), orderBy("date", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const approved = allData.filter(item => item.status === "approved");
      const pending = allData.filter(item => item.status === "pending");
      
      setMaterialsList(approved);
      setPendingList(pending);
      setLoadingList(false);
    });
    
    return () => unsubscribe();
  }, [isAuthenticated]);

  // ✅ دالة جديدة لفتح الملف في صفحة جديدة
  const openFile = (item) => {
    // نحاول الحصول على الرابط سواء كان في مصفوفة files أو كـ fileUrl مباشر
    let url = item.fileUrl; // الصيغة القديمة أو المباشرة
    if (!url && item.files && item.files.length > 0) {
        url = item.files[0].url; // الصيغة الجديدة (مصفوفة)
    }

    if (url) {
        window.open(url, '_blank');
    } else {
        alert("لا يوجد ملف للعرض");
    }
  };

  // ✅ دوال التعامل مع الطلبات (حذف / قبول)
  const handleDelete = async (id, title) => { if (confirm(`حذف "${title}" نهائياً؟`)) await deleteDoc(doc(db, "materials", id)); };
  
  const handleApprove = async (id, title) => {
    if (confirm(`هل تريد قبول ونشر "${title}"؟`)) {
      await updateDoc(doc(db, "materials", id), {
        status: "approved"
      });
      setMessage(`تم نشر "${title}" بنجاح`);
      setTimeout(() => setMessage(""), 3000);
    }
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
    const uploadedFilesData = [];
    try {
      for (let file of files) {
        const url = await uploadToCloudinary(file);
        uploadedFilesData.push({ name: file.name, url: url, type: file.type });
      }
      await addDoc(collection(db, "materials"), {
        title, desc, subject, type, files: uploadedFilesData,
        date: new Date().toISOString(), 
        status: "approved", 
        viewCount: 0, downloadCount: 0, createdAt: serverTimestamp(),
      });
      setUploading(false); setTitle(""); setDesc(""); setFiles([]); setMessage("تم الرفع بنجاح! ");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { setUploading(false); alert("خطأ في الرفع"); }
  };

  if (isLoading) {
    return (
      <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff'}}>
        <FaSpinner className="fa-spin" size={40} color="#333" />
      </div>
    );
  }

  if (showFake404) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif'
      }}>
        <h1 style={{fontSize: '2rem', fontWeight: '600', margin: '0 0 10px 0'}}>404</h1>
        <h2 style={{fontSize: '14px', fontWeight: 'normal', margin: 0}}>This page could not be found.</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', color: 'white', fontFamily: 'sans-serif'
      }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '50px 40px', borderRadius: '20px', textAlign: 'center', border: '1px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px' }}>
          <h1 style={{fontSize: '1.8rem', marginBottom: '10px', fontWeight: 'bold'}}>Admin Access</h1>
          <p style={{color: '#888', marginBottom: '30px', fontSize: '0.9rem'}}>Please enter your code</p>
          <form onSubmit={handleManualLogin}>
            <div style={{marginBottom: '20px', position: 'relative'}}>
                <FaLock style={{position: 'absolute', left: '15px', top: '15px', color: '#666'}} />
                <input type="password" placeholder="Security Code" value={inputCode} onChange={(e) => setInputCode(e.target.value)}
                    style={{ width: '100%', padding: '15px 15px 15px 45px', borderRadius: '10px', border: '1px solid #444', background: '#111', color: 'white', fontSize: '1rem', outline: 'none' }} />
            </div>
            <button type="submit" disabled={checkingCode} style={{ background: 'white', color: 'black', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', width: '100%', cursor: 'pointer', opacity: checkingCode ? 0.7 : 1 }}>
              {checkingCode ? "Verifying..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <h1 style={{color: 'white', fontSize: '2rem'}}>لوحة التحكم 🚀</h1>
      </div>

      {message && <div style={{background: 'rgba(0, 242, 96, 0.2)', color: '#00f260', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px', border: '1px solid #00f260'}}><FaCheckCircle /> {message}</div>}

      <form onSubmit={handleUpload} style={{borderBottom: '1px solid #333', paddingBottom: '30px', marginBottom: '30px'}}>
        <div className="form-group"><label>العنوان</label><input type="text" className="form-input" value={title} onChange={(e)=>setTitle(e.target.value)} required /></div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
            <div className="form-group"><label>المادة</label><select className="form-select" value={subject} onChange={(e)=>setSubject(e.target.value)}>{subjects.map((s,i)=><option key={i} value={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>النوع</label><select className="form-select" value={type} onChange={(e)=>setType(e.target.value)}><option value="summary">ملخص</option><option value="assignment">تكليف</option></select></div>
        </div>
        <div className="form-group"><label>الملفات</label><div className="upload-area" style={{padding: '20px'}}><input type="file" onChange={handleFileChange} accept=".pdf,image/*" multiple />{files.length > 0 ? <p style={{color: '#00f260'}}>{files.length} ملفات</p> : <p style={{color: '#888'}}>اختر ملفات</p>}</div></div>
        <button type="submit" className="submit-btn" disabled={uploading}>{uploading ? "جاري الرفع..." : "رفع "}</button>
      </form>

      {/* ✅ قسم طلبات الطلاب الجديدة */}
      {pendingList.length > 0 && (
        <div style={{marginBottom: '40px', border: '1px solid #eab308', borderRadius: '15px', padding: '20px', background: 'rgba(234, 179, 8, 0.05)'}}>
          <h2 style={{color: '#eab308', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
              ⚠️ طلبات قيد الانتظار ({pendingList.length})
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px'}}>
            {pendingList.map((item) => (
                <div key={item.id} style={{background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div 
                        onClick={() => openFile(item)} 
                        style={{display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer'}}
                        title="اضغط لفتح الملف"
                    >
                        <h4 style={{color: 'white', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'underline', textDecorationColor: '#666'}}>
                            <FaFilePdf style={{color: '#ccc'}} /> {item.title} 
                            <span style={{fontSize: '0.8rem', background: '#333', padding: '2px 6px', borderRadius: '4px', textDecoration: 'none'}}>طالب</span>
                        </h4>
                        <div style={{display: 'flex', gap: '10px', fontSize: '0.85rem'}}>
                            <span style={{color: '#ccc'}}>📌 {item.subject}</span>
                        </div>
                    </div>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <button onClick={() => handleApprove(item.id, item.title)} style={{background: '#00f260', color: '#000', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold'}}>
                            قبول <FaCheck />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.title)} style={{background: 'rgba(255, 77, 77, 0.2)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.3)', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                            رفض <FaTimes />
                        </button>
                    </div>
                </div>
            ))}
          </div>
        </div>
      )}

      {/* قسم الملفات المنشورة */}
      <div>
        <h2 style={{color: 'white', borderRight: '4px solid #00f260', paddingRight: '10px'}}>الملفات المنشورة ({materialsList.length})</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px'}}>
            {materialsList.map((item) => (
                <div key={item.id} style={{background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div 
                        onClick={() => openFile(item)}
                        style={{display: 'flex', flexDirection: 'column', gap: '8px', cursor: 'pointer'}}
                        title="اضغط لفتح الملف"
                    >
                        <h4 style={{color: 'white', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'underline', textDecorationColor: '#666'}}>
                            <FaFilePdf style={{color: item.type === 'summary' ? '#00f260' : '#ff9f43'}} /> {item.title} <FaExternalLinkAlt size={12} color="#888"/>
                        </h4>
                        <div style={{display: 'flex', gap: '10px', fontSize: '0.85rem'}}>
                            <span style={{color: '#ccc', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px'}}>📌 {item.subject}</span>
                            <span style={{color: item.type === 'summary' ? '#00f260' : '#ff9f43', background: item.type === 'summary' ? 'rgba(0, 242, 96, 0.1)' : 'rgba(255, 159, 67, 0.1)', padding: '2px 8px', borderRadius: '6px'}}>{item.type === 'assignment' ? 'تكليف' : 'ملخص'}</span>
                        </div>
                    </div>
                    <button onClick={() => handleDelete(item.id, item.title)} style={{background: 'transparent', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.3)', width: '35px', height: '35px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><FaTrash size={14} /></button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
