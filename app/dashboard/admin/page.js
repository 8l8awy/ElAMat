"use client";
import { useState } from "react";
import { db, storage } from "../../../lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaFile } from "react-icons/fa";

export default function AdminPage() {
  // المتغيرات
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  
  // ✅ تغيير: أصبحنا نستخدم مصفوفة للملفات بدلاً من ملف واحد
  const [files, setFiles] = useState([]); 
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const subjects = [
    "مبادئ الاقتصاد",
    "لغة اجنبية (1)",
    "مبادئ المحاسبة المالية",
    "مبادئ القانون",
    "مبادئ ادارة الاعمال"
  ];

  // ✅ دالة اختيار الملفات المعدلة (تقبل أكثر من ملف)
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // تحويل FileList إلى مصفوفة عادية
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0 || !title) {
      alert("الرجاء اختيار ملف واحد على الأقل وكتابة العنوان!");
      return;
    }

    setUploading(true);
    setMessage("جاري بدء الرفع...");

    const uploadedFilesData = []; // هنا سنخزن روابط الملفات بعد رفعها

    try {
      // ✅ حلقة تكرارية لرفع الملفات واحداً تلو الآخر
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setMessage(`جاري رفع الملف ${i + 1} من ${files.length}: ${file.name}...`);
        
        // إنشاء مرجع للملف
        const storageRef = ref(storage, `materials/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        // ننتظر حتى ينتهي رفع هذا الملف للحصول على الرابط
        await new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    // تحديث الشريط (يمكن تحسينه ليعكس الإجمالي، لكن هنا يعرض تقدم الملف الحالي)
                    setProgress(prog); 
                },
                (error) => reject(error),
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    uploadedFilesData.push({ 
                        name: file.name, 
                        url: url, 
                        type: file.type 
                    });
                    resolve();
                }
            );
        });
      }

      setMessage("جاري حفظ البيانات...");

      // حفظ البيانات في Firestore مرة واحدة بعد رفع كل الملفات
      await addDoc(collection(db, "materials"), {
        title,
        desc,
        subject,
        type,
        files: uploadedFilesData, // ✅ تخزين كل الملفات
        date: new Date().toISOString(),
        status: "approved",
        viewCount: 0,
        downloadCount: 0,
        createdAt: serverTimestamp(),
      });

      // إعادة التعيين
      setUploading(false);
      setProgress(0);
      setTitle("");
      setDesc("");
      setFiles([]); // تفريغ الملفات
      setMessage("تم رفع جميع الملفات بنجاح! 🎉");
      
      setTimeout(() => setMessage(""), 3000);

    } catch (error) {
      console.error(error);
      setUploading(false);
      alert("حدث خطأ أثناء الرفع! تأكد من الاتصال بالإنترنت.");
    }
  };

  return (
    <div className="admin-container">
      <h1 style={{color: 'white', textAlign: 'center', marginBottom: '30px', fontSize: '2rem'}}>
        لوحة التحكم 🚀
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
                <option value="summary">ملخص 📝</option>
                <option value="assignment">تكليف / واجب 📋</option>
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
                {/* ✅ الخاصية multiple هي السر هنا */}
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
                        <span style={{fontSize: '0.8rem'}}>يمكنك سحب وإفلات صور متعددة أو ملف PDF</span>
                    </div>
                )}
            </div>
        </div>

        {uploading && (
            <div style={{marginBottom: '20px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: '0.9rem', marginBottom: '5px'}}>
                    <span>{message}</span>
                    <span>{progress}%</span>
                </div>
                <div className="progress-container">
                    <div className="progress-bar" style={{width: `${progress}%`}}></div>
                </div>
            </div>
        )}

        <button type="submit" className="submit-btn" disabled={uploading}>
          {uploading ? (
             <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                <FaSpinner className="fa-spin" /> جاري الرفع...
             </span>
          ) : "رفع المواد 🚀"}
        </button>

      </form>
    </div>
  );
}
