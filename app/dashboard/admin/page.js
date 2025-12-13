"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../lib/firebase"; 
// لاحظ أننا أزلنا استدعاءات Google Auth لأننا لن نحتاجها
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot } from "firebase/firestore";
import { FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaLock, FaKey, FaSignOutAlt } from "react-icons/fa";

export default function AdminPage() {
  const router = useRouter();

  // بيانات الكلاود
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  // متغيرات الحالة
  const [isAuthenticated, setIsAuthenticated] = useState(false); // هل هو مسجل الدخول؟
  const [inputCode, setInputCode] = useState(""); // الكود الذي يكتبه المستخدم
  const [checkingCode, setCheckingCode] = useState(false); // حالة التحقق

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

  // ✅ دالة التحقق من الكود (بديلة لجوجل)
  const handleCodeLogin = async (e) => {
    e.preventDefault();
    setCheckingCode(true);

    try {
      // 1. البحث في قاعدة البيانات عن الكود المدخل
      const codesRef = collection(db, "allowedCodes");
      // نبحث عن المستند الذي فيه الحقل code يساوي ما كتبه المستخدم
      const q = query(codesRef, where("code", "==", inputCode.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 2. وجدنا الكود.. هل صاحبه أدمن؟
        const userData = querySnapshot.docs[0].data();
        
        if (userData.admin === true) {
          setIsAuthenticated(true); // ✅ كود صحيح وصلاحية أدمن
          // (اختياري) حفظ الدخول في المتصفح حتى لا يخرج عند التحديث
          localStorage.setItem("adminCode", inputCode);
        } else {
          alert("⛔ هذا الكود صحيح ولكنه لا يملك صلاحية أدمن (admin: false).");
          setIsAuthenticated(false);
        }
      } else {
        alert("⛔ الكود خاطئ! تأكد من كتابته بشكل صحيح.");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("خطأ في التحقق:", error);
      alert("حدث خطأ أثناء الاتصال بقاعدة البيانات");
    }
    setCheckingCode(false);
  };

  // (اختياري) التحقق التلقائي إذا كان قد دخل سابقاً وحفظنا الكود
  useEffect(() => {
    const savedCode = localStorage.getItem("adminCode");
    if (savedCode) {
      setInputCode(savedCode);
      // يمكننا تفعيل الدخول مباشرة أو تركه يضغط الزر، هنا سنتركه يضغط للسرعة
    }
  }, []);

  // دالة الخروج
  const handleLogout = () => {
    localStorage.removeItem("adminCode");
    setIsAuthenticated(false);
    setInputCode("");
  };

  // جلب البيانات (فقط للمسجلين)
  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "materials"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaterialsList(data);
      setLoadingList(false);
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  // دوال الرفع والحذف (كما هي)
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
    const uploadedFilesData = [];
    try {
      for (let file of files) {
        const url = await uploadToCloudinary(file);
        uploadedFilesData.push({ name: file.name, url: url, type: file.type });
      }
      await addDoc(collection(db, "materials"), {
        title, desc, subject, type, files: uploadedFilesData,
        date: new Date().toISOString(), status: "approved", viewCount: 0, downloadCount: 0, createdAt: serverTimestamp(),
      });
      setUploading(false); setTitle(""); setDesc(""); setFiles([]); setMessage("تم بنجاح! ");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { setUploading(false); alert("خطأ في الرفع"); }
  };

  // 🔒 شاشة القفل (تطلب الكود)
  if (!isAuthenticated) {
    return (
      <div style={{height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{
            background: '#1a1a1a', 
            padding: '40px', 
            borderRadius: '20px', 
            textAlign: 'center', 
            border: '1px solid #333', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            maxWidth: '400px',
            width: '90%'
        }}>
          <FaLock size={50} style={{marginBottom: '20px', color: '#00f260'}} />
          <h2 style={{color: 'white', marginBottom: '10px'}}>منطقة الإدارة 🔐</h2>
          <p style={{color: '#888', marginBottom: '30px', fontSize: '0.9rem'}}>أدخل الكود الخاص بك للدخول.</p>
          
          <form onSubmit={handleCodeLogin}>
            <div style={{position: 'relative', marginBottom: '20px'}}>
                <FaKey style={{position: 'absolute', top: '12px', right: '15px', color: '#666'}} />
                <input 
                    type="password" // جعلناه مخفياً كالرقم السري
                    placeholder="كود الدخول (Code)" 
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 40px 12px 15px',
                        borderRadius: '10px',
                        border: '1px solid #444',
                        background: '#222',
                        color: 'white',
                        textAlign: 'left',
                        fontSize: '1rem'
                    }}
                />
            </div>
            
            <button type="submit" disabled={checkingCode} style={{
              background: '#00f260', color: '#000', border: 'none', padding: '12px 25px', borderRadius: '30px',
              fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%', transition: 'transform 0.2s',
              opacity: checkingCode ? 0.7 : 1
            }}>
              {checkingCode ? "جاري التحقق..." : "دخول 🚀"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ✅ لوحة التحكم (للمسجلين فقط)
  return (
    <div className="admin-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <h1 style={{color: 'white', fontSize: '2rem'}}>لوحة التحكم </h1>
        <button onClick={handleLogout} style={{background: '#333', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center'}}>
           خروج <FaSignOutAlt />
        </button>
      </div>

      {message && <div style={{background: 'rgba(0, 242, 96, 0.2)', color: '#00f260', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px', border: '1px solid #00f260'}}><FaCheckCircle /> {message}</div>}

      <form onSubmit={handleUpload} style={{borderBottom: '1px solid #333', paddingBottom: '30px', marginBottom: '30px'}}>
        <div className="form-group"><label>العنوان</label><input type="text" className="form-input" value={title} onChange={(e)=>setTitle(e.target.value)} required /></div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
            <div className="form-group"><label>المادة</label><select className="form-select" value={subject} onChange={(e)=>setSubject(e.target.value)}>{subjects.map((s,i)=><option key={i} value={s}>{s}</option>)}</select></div>
            <div className="form-group"><label>النوع</label><select className="form-select" value={type} onChange={(e)=>setType(e.target.value)}><option value="summary">ملخص</option><option value="assignment">تكليف</option></select></div>
        </div>
        <div className="form-group"><label>الملفات</label><div className="upload-area" style={{padding: '20px'}}><input type="file" onChange={handleFileChange} accept=".pdf,image/*" multiple />{files.length > 0 ? <p style={{color: '#00f260'}}>{files.length} ملفات</p> : <p style={{color: '#888'}}>اختر ملفات</p>}</div></div>
        <button type="submit" className="submit-btn" disabled={uploading}>{uploading ? "جاري الرفع..." : "رفع 🚀"}</button>
      </form>

      <div>
        <h2 style={{color: 'white', borderRight: '4px solid #00f260', paddingRight: '10px'}}>الملفات ({materialsList.length})</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px'}}>
            {materialsList.map((item) => (
                <div key={item.id} style={{background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <h4 style={{color: 'white', margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <FaFilePdf style={{color: item.type === 'summary' ? '#00f260' : '#ff9f43'}} /> 
                            {item.title}
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
