"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../../lib/firebase"; 
// ✅ تمت إضافة orderBy هنا
import { collection, query, where, getDocs, doc, updateDoc, increment, orderBy } from "firebase/firestore";

import { 
  FaDownload, 
  FaEye, 
  FaFolderOpen, 
  FaFilePdf, 
  FaFileImage,
  FaShare,     
  FaTimes,
  FaExternalLinkAlt      
} from "react-icons/fa"; 

function MaterialsContent() {
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const isPdfFile = (file) => {
    const name = file.name?.toLowerCase() || "";
    const url = file.url?.toLowerCase() || "";
    const type = file.type?.toLowerCase() || "";

    if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp") ||
        url.includes(".png") || url.includes(".jpg") || url.includes(".jpeg")) {
        return false;
    }
    return type.includes("pdf") || url.includes(".pdf") || name.includes(".pdf");
  };

  const getDownloadUrl = (url) => {
    if (!url) return "#";
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/fl_attachment/");
    }
    return url;
  };

  const normalizeType = (type) => {
    if (!type) return "";
    type = type.toString().trim();
    if (["summary", "ملخص", "ملخصات", "تلخيص"].includes(type)) return "summary";
    if (["assignment", "تكليف", "تكاليف", "واجب"].includes(type)) return "assignment";
    return type;
  };

  useEffect(() => {
    async function fetchData() {
      if (!subject) return;
      setLoading(true);
      try {
        // ✅ التعديل هنا: استخدام الفهرس الجديد للترتيب حسب تاريخ الإنشاء
        const q = query(
            collection(db, "materials"), 
            where("subject", "==", subject),
            where("status", "==", "approved"),
            orderBy("createdAt", "desc") // ترتيب من الأحدث للأقدم
        );
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: normalizeType(doc.data().type)
        }));
        
        // ❌ لم نعد بحاجة للترتيب اليدوي هنا لأن الفايربيس قام به
        // data.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setMaterials(data);
      } catch (err) {
        console.error("Error fetching materials:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [subject]);

  const handleOpenMaterial = async (material) => {
    setSelectedMaterial(material);
    try {
      const ref = doc(db, "materials", material.id);
      await updateDoc(ref, { viewCount: increment(1) });
      // تحديث الواجهة محلياً لتبدو أسرع
      setMaterials(prev => prev.map(m => m.id === material.id ? {...m, viewCount: (m.viewCount || 0) + 1} : m));
    } catch (err) { console.error(err); }
  };

  const handleDownloadStats = async (id) => {
    try {
        const ref = doc(db, "materials", id);
        await updateDoc(ref, { downloadCount: increment(1) });
        // تحديث الواجهة محلياً
        if(selectedMaterial && selectedMaterial.id === id) {
            setSelectedMaterial(prev => ({...prev, downloadCount: (prev.downloadCount || 0) + 1}));
        }
    } catch (err) { console.error(err); }
  };

  const handleShare = async (material) => {
    const shareData = {
        title: material.title,
        text: `شاهد ملخص "${material.title}" لمادة ${material.subject} على منصة El Agamy Materials`,
        url: window.location.href
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert("تم نسخ رابط الصفحة! يمكنك مشاركته الآن.");
        }
    } catch (err) { console.log("Share skipped"); }
  };

  const handlePreviewFile = (file) => {
    const isPdf = isPdfFile(file);
    setPreviewFile({
        url: file.url,
        type: isPdf ? 'pdf' : 'image',
        name: file.name
    });
  };

  if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>جاري تحميل المواد...</div>;

  return (
    <div>
      <div className="materials-header">
          <h2 style={{color: '#1e293b', fontSize: '2em', fontWeight: '900'}}>{subject}</h2>
      </div>

      <div id="materialsList">
        {materials.length === 0 ? (
            <div className="empty-state">
                <span className="empty-state-icon">📚</span>
                <p>لا توجد مواد لهذا القسم حالياً.</p>
            </div>
        ) : (
            materials.map(m => (
                <div key={m.id} className="material-card" onClick={() => handleOpenMaterial(m)} style={{cursor: 'pointer'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <span className={`material-type-badge ${m.type === 'assignment' ? 'badge-assignment' : 'badge-summary'}`} style={{position:'static'}}>
                            {m.type === 'assignment' ? 'تكليف' : 'ملخص'}
                        </span>
                        
                        <div style={{display:'flex', gap:'8px', fontSize:'0.8em', color:'#aaa', alignItems:'center'}}>
                            <span><FaEye /> {m.viewCount || 0}</span>
                            <span><FaDownload /> {m.downloadCount || 0}</span>
                        </div>
                    </div>

                    <h3 style={{color:'#1e293b', margin:'10px 0'}}>{m.title}</h3>
                    <p style={{color:'#475569'}}>{m.desc || "..."}</p>
                    
                    <div className="card-actions" style={{marginTop:'15px', paddingTop:'10px', borderTop:'1px solid #ddd'}}>
                        <button className="download-file-btn" style={{width:'100%', background:'transparent', color:'#333', border:'1px solid #333'}}>
                             عرض التفاصيل <FaFolderOpen />
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>

      {selectedMaterial && !previewFile && (
        <div className="modal active" onClick={() => setSelectedMaterial(null)} style={{display:'flex'}}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setSelectedMaterial(null)}>&times;</span>
            
            <h2 style={{textAlign:'center', marginBottom:'10px'}}>{selectedMaterial.title}</h2>
            
            <div style={{display:'flex', justifyContent:'center', gap:'20px', marginBottom:'20px', background:'#1a1a1a', padding:'10px', borderRadius:'10px', border: '1px solid #333'}}>
                <div style={{textAlign:'center', color:'#00f260'}}>
                    <FaEye size={20} /> <span style={{fontSize:'0.8em', color:'#ccc'}}> {selectedMaterial.viewCount || 0}</span>
                </div>
                <div style={{width:'1px', background:'#333'}}></div>
                <div style={{textAlign:'center', color:'#3b82f6'}}>
                    <FaDownload size={20} /> <span style={{fontSize:'0.8em', color:'#ccc'}}> {selectedMaterial.downloadCount || 0}</span>
                </div>
            </div>

            <p style={{textAlign:'center', color:'#888', marginBottom:'20px'}}>{selectedMaterial.desc}</p>
            
            <button onClick={() => handleShare(selectedMaterial)} style={{width: '100%', background: 'var(--gradient-3)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                <FaShare /> مشاركة
            </button>

            <div className="modal-files-scroll">
              <h4 style={{color:'white', marginBottom:'10px', borderBottom:'1px solid #333', paddingBottom:'5px'}}>الملفات:</h4>
              {selectedMaterial.files && selectedMaterial.files.length > 0 ? (
                selectedMaterial.files.map((file, index) => (
                  <div key={index} className="modal-file-item" style={{background:'#222', padding:'15px', borderRadius:'10px', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={{color:'white', display:'flex', alignItems:'center', gap:'10px'}}>
                        {isPdfFile(file) ? <FaFilePdf color="#ef4444"/> : <FaFileImage color="#3b82f6"/>} 
                        {file.name}
                    </span>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button 
                            onClick={() => handlePreviewFile(file)}
                            className="btn-preview"
                        >
                           <FaEye /> معاينة
                        </button>
                        
                        <a 
                            href={getDownloadUrl(file.url)} 
                            onClick={() => handleDownloadStats(selectedMaterial.id)}
                            className="view-file-btn" 
                            style={{background:'#00f260', color:'#000', padding:'8px 15px', borderRadius:'8px', textDecoration:'none', fontSize:'0.9em', display:'flex', alignItems:'center', gap:'5px', fontWeight:'600'}}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                           <FaDownload /> تحميل
                        </a>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{textAlign:'center', color:'#888'}}>لا توجد ملفات مرفقة.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {previewFile && (
        <div className="modal active" onClick={() => setPreviewFile(null)} style={{display:'flex', zIndex: 3000}}>
            
           <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '900px', width: '95%', height: '90vh', display:'flex', flexDirection:'column', padding: '0', overflow: 'hidden', background: '#000'}}>
               
                <div style={{padding:'15px', background:'#1a1a1a', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #333'}}>
                    <h3 style={{color:'white', margin:0, fontSize:'1em', display:'flex', alignItems:'center', gap:'10px'}}>
                        {previewFile.type === 'pdf' ? <FaFilePdf color="#ef4444"/> : <FaFileImage color="#3b82f6"/>}
                        {previewFile.name || "معاينة الملف"}
                    </h3>
                    <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                        <a href={previewFile.url} target="_blank" rel="noreferrer" title="فتح في نافذة جديدة" style={{color:'white', fontSize:'1.2em'}}>
                            <FaExternalLinkAlt />
                        </a>
                        <button className="close-btn" onClick={() => setPreviewFile(null)} style={{background:'transparent', border:'none', color:'white', fontSize:'1.5em', cursor:'pointer'}}>
                            <FaTimes />
                        </button>
                    </div>
                </div>

                <div style={{flex:1, position:'relative', background:'#000', overflow: 'hidden', display:'flex', justifyContent:'center', alignItems:'center'}}>
                    {previewFile.type === 'pdf' ? (
                        <object 
                            data={previewFile.url} 
                            type="application/pdf" 
                            width="100%" 
                            height="100%"
                            style={{border:'none', background:'white'}}
                        >
                            <iframe 
                                src={previewFile.url}
                                width="100%" 
                                height="100%" 
                                style={{border:'none', background:'white'}}
                                title="PDF Preview"
                            >
                                <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%', flexDirection:'column', color:'white'}}>
                                    <p>متصفحك لا يدعم عرض PDF مباشرة.</p>
                                    <a href={previewFile.url} target="_blank" rel="noreferrer" className="view-file-btn" style={{marginTop:'10px', background:'#00f260', color:'black', padding:'10px 20px', borderRadius:'5px', textDecoration:'none'}}>
                                         اضغط هنا لتحميل الملف
                                    </a>
                                </div>
                            </iframe>
                        </object>
                    ) : (
                        <div className="modal-image-scroll" style={{width:'100%', height:'100%', overflow:'auto', display:'flex', justifyContent:'center', alignItems:'center'}}>
                           <img src={previewFile.url} alt="Preview" style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain'}} />
                        </div>
                    )}
                </div>
           </div>
        </div>
      )}

    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div style={{color:'white'}}>جاري التحميل...</div>}>
      <MaterialsContent />
    </Suspense>
  );
}
