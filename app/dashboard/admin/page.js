"use client";
import { useState } from "react";
import { db, storage } from "../../../lib/firebase"; // تأكد من المسار
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FaCloudUploadAlt, FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function AdminPage() {
  // المتغيرات لتخزين البيانات
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("مبادئ اقتصاد"); // القيمة الافتراضية
  const [type, setType] = useState("summary");
  const [file, setFile] = useState(null);
  
  // متغيرات حالة التحميل
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  // قائمة المواد (يمكنك زيادتها)
  const subjects = [
    "مبادئ اقتصاد",
    "اقتصاد كلي",
    "اقتصاد جزئي",
    "مالية عامة",
    "محاسبة",
    "إدارة أعمال"
  ];

  // دالة اختيار الملف
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // دالة الرفع الرئيسية
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      alert("الرجاء اختيار ملف وكتابة العنوان!");
      return;
    }

    setUploading(true);
    setMessage("");

    // 1. تجهيز مكان الملف في Storage
    const storageRef = ref(storage, `materials/${file.name}-${Date.now()}`);
    
    // 2. بدء الرفع مع مراقبة التقدم (Upload Task)
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // حساب النسبة المئوية
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(prog);
      },
      (error) => {
        console.error(error);
        setUploading(false);
        alert("حدث خطأ أثناء الرفع!");
      },
      async () => {
        // 3. عند اكتمال الرفع بنجاح
        const url = await getDownloadURL(uploadTask.snapshot.ref);

        // 4. حفظ البيانات في Firestore
        await addDoc(collection(db, "materials"), {
          title,
          desc,
          subject,
          type,
          files: [{ name: file.name, url: url, type: file.type }], // تخزين كقائمة لسهولة التطوير مستقبلاً
          date: new Date().toISOString(),
          status: "approved", // يظهر فوراً
          viewCount: 0,
          downloadCount: 0,
          createdAt: serverTimestamp(),
        });

        // 5. إعادة تعيين النموذج
        setUploading(false);
        setProgress(0);
        setTitle("");
        setDesc("");
        setFile(null);
        setMessage("تم رفع المادة بنجاح! 🎉");
        
        // إخفاء رسالة النجاح بعد 3 ثواني
        setTimeout(() => setMessage(""), 3000);
      }
    );
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
        {/* 1. عنوان المادة */}
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

        {/* 2. اختيار المادة والنوع (بجانب بعض) */}
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
                <option value="exam">امتحان سابق 📄</option>
            </select>
            </div>
        </div>

        {/* 3. الوصف */}
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

        {/* 4. منطقة رفع الملفات (Drag & Drop) */}
        <div className="form-group">
            <label>ملف المادة (PDF أو صور)</label>
            <div className="upload-area">
                <input type="file" onChange={handleFileChange} accept=".pdf,image/*" />
                
                {file ? (
                    <div style={{color: '#00f260'}}>
                        <FaCheckCircle size={40} style={{marginBottom: '10px'}} />
                        <p>تم اختيار: <strong>{file.name}</strong></p>
                    </div>
                ) : (
                    <div style={{color: '#888'}}>
                        <FaCloudUploadAlt size={50} style={{marginBottom: '10px'}} />
                        <p>اضغط هنا لاختيار ملف</p>
                        <span style={{fontSize: '0.8rem'}}>أو اسحب الملف وأفلته هنا</span>
                    </div>
                )}
            </div>
        </div>

        {/* 5. شريط التحميل */}
        {uploading && (
            <div style={{marginBottom: '20px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: '0.9rem', marginBottom: '5px'}}>
                    <span>جاري الرفع...</span>
                    <span>{progress}%</span>
                </div>
                <div className="progress-container">
                    <div className="progress-bar" style={{width: `${progress}%`}}></div>
                </div>
            </div>
        )}

        {/* زر الإرسال */}
        <button type="submit" className="submit-btn" disabled={uploading}>
          {uploading ? (
             <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                <FaSpinner className="fa-spin" /> جاري الرفع...
             </span>
          ) : "رفع المادة 🚀"}
        </button>

      </form>
    </div>
  );
}
