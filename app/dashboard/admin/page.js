"use client";
import { useState } from "react";
import { db } from "../../../lib/firebase"; // نحتاج فقط قاعدة البيانات
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaFile } from "react-icons/fa";

export default function AdminPage() {
  // 🔴 بيانات Cloudinary (ضع بياناتك هنا)
  const CLOUD_NAME = "dhj0extnk"; // مثال: "dxyz123"
  const UPLOAD_PRESET = "ml_default"; // مثال: "ml_default"

  // المتغيرات
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
  
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const subjects = [
    "مبادئ الاقتصاد",
    "لغة اجنبية (1)",
    "مبادئ المحاسبة المالية",
    "مبادئ القانون",
    "مبادئ ادارة الاعمال"
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  // دالة الرفع إلى Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    // نستخدم resource_type: auto ليقبل الصور والملفات PDF
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "فشل الرفع");
    return data.secure_url; // الرابط الجاهز
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
      // رفع الملفات واحد تلو الآخر إلى Cloudinary
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setMessage(`جاري رفع الملف ${i + 1} من ${files.length}: ${file.name}...`);
        
        const url = await uploadToCloudinary(file);
        
        uploadedFilesData.push({ 
            name: file.name, 
            url: url, 
            type: file.type 
        });
      }

      setMessage("جاري حفظ البيانات...");

      // حفظ الروابط في Firebase Database
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

      // إعادة التعيين
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
        لوحة التحكم (Cloudinary) ☁️
      </h1>

      {message && (
        <div style={{background: 'rgba(0, 242, 96, 0.2)', color: '#00f260', padding: '15px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px', border: '1px solid #00f260'}}>
          <FaCheckCircle /> {message}
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div className="form-group">
          <label>عنوان المادة</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="مثال: ملخص الفصل الأول" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
            <div className="form-group">
            <label>المادة الدراسية</label>
            <select className="form-select" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {subjects.map((sub, index) => (
                <option key={index} value={sub}>{sub}</option>
                ))}
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
          <label>وصف بسيط (اختياري)</label>
          <textarea 
            className="form-textarea" 
            rows="3" 
            placeholder="اكتب تفاصيل إضافية هنا..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group">
            <label>الملفات (يمكنك اختيار أكثر من صورة)</label>
            <div className="upload-area">
                <input type="file" onChange={handleFileChange} accept=".pdf,image/*" multiple />
                
                {files.length > 0 ? (
                    <div style={{color: '#00f260'}}>
                        <FaCheckCircle size={40} style={{marginBottom: '10px'}} />
                        <p>تم اختيار <strong>{files.length}</strong> ملفات</p>
                        <ul style={{listStyle:'none', padding:0, fontSize:'0.8em', color:'#ccc'}}>
                           {files.map((f, i) => <li key={i}>📄 {f.name}</li>)}
                        </ul>
                    </div>
                ) : (
                    <div style={{color: '#888'}}>
                        <FaCloudUploadAlt size={50} style={{marginBottom: '10px'}} />
                        <p>اضغط هنا لاختيار ملفات</p>
                    </div>
                )}
            </div>
        </div>

        <button type="submit" className="submit-btn" disabled={uploading}>
          {uploading ? (
             <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                <FaSpinner className="fa-spin" /> {message || "جاري الرفع..."}
             </span>
          ) : "رفع المواد "}
        </button>

      </form>
    </div>
  );
}
