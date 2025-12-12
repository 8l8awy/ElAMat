"use client";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { uploadToCloudinary } from "../../../lib/cloudinary";
import { db } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { FaCloudUploadAlt, FaSpinner, FaFile } from "react-icons/fa";

export default function ShareMaterialPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([...e.target.files]);
    }
  };

  const handleUpload = async () => {
    if (!title || files.length === 0) return alert("الرجاء إدخال العنوان واختيار ملفات");
    
    setLoading(true);
    try {
      const uploadedFiles = await Promise.all(
        files.map(file => uploadToCloudinary(file))
      );

      await addDoc(collection(db, "materials"), {
        subject,
        type,
        title,
        desc,
        files: uploadedFiles,
        uploader: user.name,
        date: new Date().toISOString(),
        status: "pending"
      });

      alert("تم إرسال الملخص للمراجعة بنجاح! 🎉");
      setTitle("");
      setDesc("");
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الرفع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{maxWidth:'600px'}}>
      <h2 className="page-title" style={{color:'white'}}>مشاركة ملخص جديد</h2>
      <div className="admin-panel" style={{marginTop:'0'}}>
        <p style={{color:'#aaa', marginBottom:'20px'}}>ساهم بمساعدة زملائك.</p>
        
        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{padding:'12px', borderRadius:'10px'}}>
                <option>مبادئ الاقتصاد</option>
                <option>لغة اجنبية (1)</option>
                <option>مبادئ المحاسبة المالية</option>
                <option>مبادئ القانون</option>
                <option>مبادئ ادارة الاعمال</option>
            </select>

            <select value={type} onChange={(e) => setType(e.target.value)} style={{padding:'12px', borderRadius:'10px'}}>
                <option value="summary">ملخص</option>
                <option value="assignment">تكليف</option>
            </select>

            <input type="text" placeholder="عنوان الملف" value={title} onChange={(e) => setTitle(e.target.value)} style={{padding:'12px', borderRadius:'10px'}} />
            <textarea placeholder="وصف بسيط..." rows="3" value={desc} onChange={(e) => setDesc(e.target.value)} style={{padding:'12px', borderRadius:'10px'}} />

            {/* ✅ زر اختيار الملفات الجديد */}
            <div className="file-upload-wrapper">
                <input 
                    type="file" 
                    id="fileInput" 
                    multiple 
                    onChange={handleFileSelect} 
                    className="file-upload-input" 
                />
                <label htmlFor="fileInput" className="file-upload-label">
                    <FaCloudUploadAlt />
                    {files.length > 0 
                        ? `تم اختيار ${files.length} ملفات` 
                        : "اضغط لاختيار الملفات أو الصور"}
                </label>
            </div>
            
            {/* عرض أسماء الملفات المختارة */}
            {files.length > 0 && (
                <div style={{background:'#111', padding:'10px', borderRadius:'8px', marginBottom:'10px'}}>
                    {files.map((f, i) => (
                        <div key={i} style={{color:'#ccc', fontSize:'0.9em', display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px'}}>
                            <FaFile /> {f.name}
                        </div>
                    ))}
                </div>
            )}

            <button onClick={handleUpload} disabled={loading} className="btn" style={{background:'var(--gradient-1)'}}>
                {loading ? "جاري الرفع..." : <span><FaCloudUploadAlt /> إرسال للمراجعة</span>}
            </button>
        </div>
      </div>
    </div>
  );
}