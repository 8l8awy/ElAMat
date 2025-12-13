"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase"; 
import { collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaFileAlt } from "react-icons/fa";

export default function AdminPage() {
  // 🔴 بيانات Cloudinary (تأكد من كتابة بياناتك هنا)
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  // المتغيرات
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
  
  // متغيرات القائمة والحذف
  const [materialsList, setMaterialsList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const subjects = [
    "مبادئ الاقتصاد",
    "لغة اجنبية (1)",
    "مبادئ المحاسبة المالية",
    "مبادئ القانون",
    "مبادئ ادارة الاعمال"
  ];

  // 1. جلب المواد تلقائياً
  useEffect(() => {
    const q = query(collection(db, "materials"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterialsList(data);
      setLoadingList(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. دالة الحذف
  const handleDelete = async (id, title) => {
    if (confirm(`هل أنت متأكد من حذف "${title}"؟`)) {
      try {
        await deleteDoc(doc(db, "materials", id));
        // لا نحتاج لرسالة تنبيه هنا لأن القائمة ستتحدث تلقائياً
      } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء الحذف");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "فشل الرفع");
    return data.secure_url;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0 || !title) {
      alert("الرجاء اختيار ملف واحد على الأقل وكتابة العنوان!");
      return;
    }

    setUploading(true);
    setMessage("جاري بدء الرفع...");

    const uploadedFilesData = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setMessage(`جاري رفع الملف ${i + 1} من ${files.length}: ${file.name}...`);
        const url = await uploadToCloudinary(file);
        uploadedFilesData.push({ name: file.name, url: url, type: file.type });
      }

      setMessage("جاري حفظ البيانات...");

      await addDoc(collection(db, "materials"), {
        title,
        desc,
        subject,
        type,
        files: uploadedFilesData,
        date: new Date().toISOString(),
        status: "approved",
        viewCount: 0,
        downloadCount: 0,
        createdAt: serverTimestamp(),
      });

      setUploading(false);
      setTitle("");
      setDesc("");
      setFiles([]);
      setMessage("تم رفع جميع الملفات بنجاح! ");
      setTimeout(() => setMessage(""), 3000);

    } catch (error) {
      console.error(error);
      setUploading(false);
      alert(`حدث خطأ: ${error.message}`);
    }
  };

  return (
    <div className="admin-container">
      <h1 style={{color: 'white', textAlign: 'center', marginBottom: '30px', fontSize: '2rem'}}>
        لوحة التحكم 
      </h1>

      {message && (
        <div style={{background: 'rgba(0, 242, 96, 0.2)', color: '#00f260', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px', border: '1px solid #00f260'}}>
          <FaCheckCircle /> {message}
        </div>
      )}

      {/* === نموذج الرفع === */}
      <form onSubmit={handleUpload} style={{borderBottom: '1px solid #333', paddingBottom: '30px', marginBottom: '30px'}}>
        <div className="form-group">
          <label>عنوان المادة</label>
          <input type="text" className="form-input" placeholder="مثال: ملخص الفصل الأول" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
            <div className="form-group">
            <label>المادة الدراسية</label>
            <select className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {subjects.map((sub, index) => <option key={index} value={sub}>{sub}</option>)}
            </select>
            </div>
            <div className="form-group">
            <label>نوع الملف</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="summary">ملخص </option>
                <option value="assignment">تكليف </option>
            </select>
            </div>
        </div>

        <div className="form-group">
          <label>وصف بسيط</label>
          <textarea className="form-textarea" rows="2" placeholder="تفاصيل إضافية..." value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
        </div>

        <div className="form-group">
            <label>الملفات</label>
            <div className="upload-area" style={{padding: '20px'}}>
                <input type="file" onChange={handleFileChange} accept=".pdf,image/*" multiple />
                {files.length > 0 ? <p style={{color: '#00f260'}}>تم اختيار {files.length} ملفات</p> : <p style={{color: '#888'}}>اضغط لاختيار ملفات</p>}
            </div>
        </div>

        <button type="submit" className="submit-btn" disabled={uploading}>
          {uploading ? <span style={{display:'flex', justifyContent:'center', gap:'10px'}}><FaSpinner className="fa-spin" /> جاري الرفع...</span> : "رفع المواد 🚀"}
        </button>
      </form>

      {/* === ✅ قسم إدارة المواد (التصميم الجديد) === */}
      <div>
        <h2 style={{color: 'white', fontSize: '1.5rem', marginBottom: '20px', borderRight: '4px solid #00f260', paddingRight: '10px'}}>
           إدارة الملفات المرفوعة ({materialsList.length})
        </h2>

        {loadingList ? (
            <p style={{color: '#888', textAlign: 'center'}}>جاري تحميل القائمة...</p>
        ) : materialsList.length === 0 ? (
            <p style={{color: '#888', textAlign: 'center'}}>لا توجد مواد مرفوعة حتى الآن.</p>
        ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {materialsList.map((item) => (
                    <div key={item.id} style={{
                        background: 'rgba(255, 255, 255, 0.05)', // ✅ خلفية رمادية شفافة
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '15px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                    }}>
                        {/* بيانات الملف */}
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            <h4 style={{
                                color: 'white', 
                                margin: 0, 
                                fontSize: '1.1rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px'
                            }}>
                                <FaFilePdf style={{color: item.type === 'summary' ? '#00f260' : '#ff9f43'}} /> 
                                {item.title}
                            </h4>

                            <div style={{display: 'flex', gap: '10px', fontSize: '0.85rem'}}>
                                <span style={{color: '#ccc', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '6px'}}>
                                    📌 {item.subject}
                                </span>
                                <span style={{
                                    color: item.type === 'summary' ? '#00f260' : '#ff9f43', 
                                    background: item.type === 'summary' ? 'rgba(0, 242, 96, 0.1)' : 'rgba(255, 159, 67, 0.1)',
                                    padding: '2px 8px', 
                                    borderRadius: '6px',
                                }}>
                                    {item.type === 'assignment' ? 'تكليف / واجب' : 'ملخص'}
                                </span>
                            </div>
                        </div>

                        {/* زر الحذف */}
                        <button 
                            onClick={() => handleDelete(item.id, item.title)}
                            title="حذف الملف"
                            style={{
                                background: 'transparent', 
                                color: '#ff4d4d', 
                                border: '1px solid rgba(255, 77, 77, 0.3)', 
                                width: '35px',          
                                height: '35px',         
                                borderRadius: '8px',    
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => {e.currentTarget.style.background = '#ff4d4d'; e.currentTarget.style.color = 'white';}}
                            onMouseOut={(e) => {e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ff4d4d';}}
                        >
                            <FaTrash size={14} />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
}
