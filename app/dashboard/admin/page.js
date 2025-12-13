"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../lib/firebase"; 
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot } from "firebase/firestore";
import { FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaSignOutAlt } from "react-icons/fa";

export default function AdminPage() {
  const router = useRouter();
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // بيانات اللوحة
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
  const [materialsList, setMaterialsList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const subjects = ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"];

  useEffect(() => {
    // 1. البحث عن الكود المحفوظ
    const savedCode = localStorage.getItem("adminCode");

    if (savedCode) {
      verifyCode(savedCode);
    } else {
      // لا يوجد كود؟ اعتبره غريباً واعرض 404
      setIsLoading(false);
    }
  }, []);

  const verifyCode = async (codeToVerify) => {
    try {
      const q = query(collection(db, "allowedCodes"), where("code", "==", codeToVerify.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty && querySnapshot.docs[0].data().admin === true) {
        setIsAuthenticated(true); // ✅ أدمن حقيقي
      } else {
        localStorage.removeItem("adminCode"); // كود مزيف أو قديم
      }
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminCode");
    setIsAuthenticated(false);
    router.push("/"); // طرد للرئيسية
  };

  // ... (نفس دوال الرفع والحذف السابقة) ...
  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "materials"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMaterialsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingList(false);
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleDelete = async (id, title) => { if (confirm(`حذف "${title}"؟`)) await deleteDoc(doc(db, "materials", id)); };
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
        const uploadedFilesData = [];
        for (let file of files) {
            const url = await uploadToCloudinary(file);
            uploadedFilesData.push({ name: file.name, url: url, type: file.type });
        }
        await addDoc(collection(db, "materials"), { title, desc, subject, type, files: uploadedFilesData, date: new Date().toISOString(), status: "approved", viewCount: 0, downloadCount: 0, createdAt: serverTimestamp() });
        setUploading(false); setTitle(""); setDesc(""); setFiles([]); setMessage("تم بنجاح! 🎉"); setTimeout(() => setMessage(""), 3000);
    } catch (error) { setUploading(false); alert("خطأ"); }
  };

  if (isLoading) return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff'}}><FaSpinner className="fa-spin" size={40} color="#333" /></div>;

  // 👻 صفحة 404 (تظهر للجميع إلا الأدمن)
  if (!isAuthenticated) {
    return (
      <div style={{height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#000', background: '#fff', fontFamily: 'sans-serif'}}>
        <h1 style={{fontSize: '2rem', fontWeight: '600', margin: '0 0 10px 0'}}>404</h1>
        <h2 style={{fontSize: '14px', fontWeight: 'normal', margin: 0}}>This page could not be found.</h2>
      </div>
    );
  }

  // ✅ لوحة التحكم (للأدمن فقط)
  return (
    <div className="admin-container">
       <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <h1 style={{color: 'white', fontSize: '2rem'}}>لوحة التحكم </h1>
        <button onClick={handleLogout} style={{background: '#333', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center'}}>خروج <FaSignOutAlt /></button>
      </div>
      {/* باقي واجهة الرفع والقائمة كما هي تماماً */}
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
      <div><h2 style={{color: 'white', borderRight: '4px solid #00f260', paddingRight: '10px'}}>الملفات ({materialsList.length})</h2><div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px'}}>{materialsList.map((item) => (<div key={item.id} style={{background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}><h4 style={{color: 'white', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px'}}><FaFilePdf style={{color: item.type === 'summary' ? '#00f260' : '#ff9f43'}} /> {item.title}</h4><div style={{display: 'flex', gap: '10px', fontSize: '0.85rem'}}><span style={{color: '#ccc', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px'}}>📌 {item.subject}</span></div></div><button onClick={() => handleDelete(item.id, item.title)} style={{background: 'transparent', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.3)', width: '35px', height: '35px', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><FaTrash size={14} /></button></div>))}</div></div>
    </div>
  );
}
