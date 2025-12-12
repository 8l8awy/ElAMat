"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { uploadToCloudinary } from "../../../lib/cloudinary";
import { db } from "../../../lib/firebase";
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { 
  FaCloudUploadAlt, FaSpinner, FaCheck, FaTimes, 
  FaUserClock, FaEye, FaFile, FaFileImage, FaFilePdf 
} from "react-icons/fa";

export default function AdminPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  
  // Form State
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState([]);

  // جلب الطلبات المعلقة
  const fetchPending = async () => {
    try {
        const q = query(collection(db, "materials"), where("status", "==", "pending"));
        const snap = await getDocs(q);
        setPendingRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (user?.isAdmin) fetchPending();
  }, [user]);

  const handlePreview = (fileUrl) => {
    if (!fileUrl) return;
    const isPdf = fileUrl.toLowerCase().includes(".pdf");
    setPreviewData({
        url: fileUrl,
        type: isPdf ? 'pdf' : 'image'
    });
  };

  if (!user?.isAdmin) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>للمشرفين فقط</div>;

  const handleApprove = async (id) => {
    if(!confirm("نشر هذا الملف؟")) return;
    await updateDoc(doc(db, "materials", id), { status: "approved" });
    alert("تم النشر ✅");
    fetchPending();
  };

  const handleReject = async (id) => {
    if(!confirm("حذف هذا الطلب نهائياً؟")) return;
    await deleteDoc(doc(db, "materials", id));
    alert("تم الحذف 🗑️");
    fetchPending();
  };

  const handleAdminUpload = async () => {
    if (!title || files.length === 0) return alert("البيانات ناقصة");
    setLoading(true);
    try {
      const uploadedFiles = await Promise.all(files.map(f => uploadToCloudinary(f)));
      await addDoc(collection(db, "materials"), {
        subject, type, title, desc, files: uploadedFiles,
        uploader: user.name || "Admin",
        date: new Date().toISOString(),
        status: "approved" 
      });
      alert("تم النشر ✅");
      setTitle(""); setFiles([]);
    } catch (err) { alert("خطأ"); } 
    finally { setLoading(false); }
  };

  const handleFileSelect = (e) => {
     if (e.target.files && e.target.files.length > 0) {
        setFiles([...e.target.files]);
     }
  };

  return (
    <div className="admin-container">
      {/* --- قسم 1: الطلبات المعلقة (تم التحديث لعرض كل الصور) --- */}
      <div className="admin-panel" style={{marginBottom:'40px', border:'1px solid #ffc107'}}>
        <h3 style={{color:'#ffc107', marginBottom:'20px'}}><FaUserClock /> طلبات الطلاب المعلقة ({pendingRequests.length})</h3>
        
        {pendingRequests.length === 0 ? <p style={{color:'#888'}}>لا توجد طلبات جديدة</p> : (
            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                {pendingRequests.map(req => (
                    <div key={req.id} style={{background:'#222', padding:'20px', borderRadius:'10px', display:'flex', flexDirection:'column', gap:'15px'}}>
                        
                        {/* رأس الطلب */}
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'10px'}}>
                            <div>
                                <h4 style={{color:'white', margin:'0', fontSize:'1.2em'}}>{req.title}</h4>
                                <span style={{color:'#aaa', fontSize:'0.9em'}}>{req.subject} • {req.uploader} • {req.type === 'summary' ? 'ملخص' : 'تكليف'}</span>
                                <p style={{color:'#666', fontSize:'0.9em', marginTop:'5px'}}>{req.desc}</p>
                            </div>
                            
                            <div style={{display:'flex', gap:'10px'}}>
                                <button onClick={() => handleApprove(req.id)} style={{background:'#00f260', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}><FaCheck /> موافقة</button>
                                <button onClick={() => handleReject(req.id)} style={{background:'#ef4444', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', color:'white', fontWeight:'bold'}}><FaTimes /> رفض</button>
                            </div>
                        </div>

                        {/* ✅ قائمة الملفات المرفقة (يظهر زر معاينة لكل ملف) */}
                        <div style={{background:'#1a1a1a', padding:'10px', borderRadius:'8px'}}>
                            <p style={{color:'#888', fontSize:'0.8em', marginBottom:'8px'}}>الملفات المرفقة ({req.files?.length || 0}):</p>
                            <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
                                {req.files?.map((file, i) => (
                                    <div key={i} style={{background:'#333', padding:'6px 12px', borderRadius:'6px', display:'flex', alignItems:'center', gap:'8px', border:'1px solid #444'}}>
                                        <span style={{color:'#ddd', fontSize:'0.85em', display:'flex', alignItems:'center', gap:'5px'}}>
                                            {file.type?.includes('image') ? <FaFileImage color="#3b82f6"/> : <FaFilePdf color="#ef4444"/>}
                                            {file.name.substring(0, 15)}{file.name.length > 15 ? '...' : ''}
                                        </span>
                                        <button 
                                            onClick={() => handlePreview(file.url)}
                                            style={{cursor:'pointer', background:'rgba(255,255,255,0.1)', border:'none', color:'#fff', padding:'4px 8px', borderRadius:'4px', fontSize:'0.8em'}}
                                            title="معاينة هذا الملف"
                                        >
                                            <FaEye />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        )}
      </div>

      {/* قسم 2: الرفع المباشر */}
      <div className="admin-panel">
        <h3 style={{color:'white', marginBottom:'20px'}}>رفع مادة جديدة (نشر مباشر)</h3>
        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{padding:'10px', borderRadius:'8px'}}>
                <option>مبادئ الاقتصاد</option>
                <option>لغة اجنبية (1)</option>
                <option>مبادئ المحاسبة المالية</option>
                <option>مبادئ القانون</option>
                <option>مبادئ ادارة الاعمال</option>
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{padding:'10px', borderRadius:'8px'}}><option value="summary">ملخص</option><option value="assignment">تكليف</option></select>
            
            <input type="text" placeholder="العنوان" value={title} onChange={(e) => setTitle(e.target.value)} style={{padding:'10px', borderRadius:'8px'}} />
            
            <div className="file-upload-wrapper">
                <input 
                    type="file" 
                    id="adminFileInput" 
                    multiple 
                    onChange={handleFileSelect} 
                    className="file-upload-input" 
                />
                <label htmlFor="adminFileInput" className="file-upload-label">
                    <FaCloudUploadAlt size={24} />
                    {files.length > 0 
                        ? `تم اختيار ${files.length} ملفات` 
                        : "اضغط هنا لاختيار الملفات"}
                </label>
            </div>

            {files.length > 0 && (
                <div style={{background:'#111', padding:'10px', borderRadius:'8px'}}>
                    {files.map((f, i) => (
                        <div key={i} style={{color:'#ccc', fontSize:'0.9em', display:'flex', alignItems:'center', gap:'5px', marginBottom:'5px'}}>
                            <FaFile /> {f.name}
                        </div>
                    ))}
                </div>
            )}

            <button onClick={handleAdminUpload} disabled={loading} className="btn" style={{background:'var(--gradient-1)'}}>
                {loading ? "جاري الرفع..." : "نشر"}
            </button>
        </div>
      </div>

      {/* نافذة المعاينة */}
      {previewData && (
        <div className="modal active" onClick={() => setPreviewData(null)} style={{display:'flex'}}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{width:'90%', height:'90vh', maxWidth:'1000px', display:'flex', flexDirection:'column', position:'relative'}}>
                <span className="close" onClick={() => setPreviewData(null)}>&times;</span>
                <h3 style={{textAlign:'center', marginBottom:'15px'}}>معاينة الملف</h3>
                
                <div style={{flex:1, background:'#000', borderRadius:'10px', overflow:'hidden', position:'relative'}}>
                    {previewData.type === 'pdf' ? (
                        <>
                            <iframe 
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewData.url)}&embedded=true`}
                                width="100%" 
                                height="100%" 
                                style={{border:'none'}}
                                title="PDF Preview"
                            ></iframe>
                            <a href={previewData.url} target="_blank" rel="noreferrer" style={{position:'absolute', bottom:'20px', left:'50%', transform:'translateX(-50%)', background:'white', padding:'8px 20px', borderRadius:'20px', textDecoration:'none', color:'black', fontSize:'0.9em', fontWeight:'bold', boxShadow:'0 5px 15px rgba(0,0,0,0.5)'}}>
                                🔗 فتح في نافذة خارجية
                            </a>
                        </>
                    ) : (
                        <img src={previewData.url} alt="Preview" style={{width:'100%', height:'100%', objectFit:'contain'}} />
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}