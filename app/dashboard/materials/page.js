"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { 
  FaCloudArrowDown, 
  FaEye, 
  FaFolderOpen, 
  FaFilePdf, 
  FaFileImage,
  FaShareNodes,     
} from "react-icons/fa6";

function MaterialsContent() {
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [previewFile, setPreviewFile] = useState(null); // للمعاينة الكبيرة

  const normalizeType = (type) => {
    if (!type) return "";
    type = type.toString().trim();
    if (["summary", "ملخص", "ملخصات", "تلخيص"].includes(type)) return "summary";
    if (["assignment", "تكليف", "تكاليف", "واجب"].includes(type)) return "assignment";
    return type;
  };

  const getDownloadUrl = (url) => {
    if (!url) return "#";
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/fl_attachment/");
    }
    return url;
  };

  useEffect(() => {
    async function fetchData() {
      if (!subject) return;
      setLoading(true);
      try {
        const q = query(
            collection(db, "materials"), 
            where("subject", "==", subject),
            where("status", "==", "approved")
        );
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: normalizeType(doc.data().type)
        }));
        
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMaterials(data);
      } catch (err) {
        console.error(err);
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
      material.viewCount = (material.viewCount || 0) + 1; 
    } catch (err) { console.error(err); }
  };

  const handleDownloadStats = async (id) => {
    try {
        const ref = doc(db, "materials", id);
        await updateDoc(ref, { downloadCount: increment(1) });
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

  const handlePreviewFile = (fileUrl) => {
    const isPdf = fileUrl.toLowerCase().includes(".pdf");
    setPreviewFile({
        url: fileUrl,
        type: isPdf ? 'pdf' : 'image'
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
                            <span><FaCloudArrowDown /> {m.downloadCount || 0}</span>
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

      {/* نافذة تفاصيل المادة */}
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
                    <FaCloudArrowDown size={20} /> <span style={{fontSize:'0.8em', color:'#ccc'}}> {selectedMaterial.downloadCount || 0}</span>
                </div>
            </div>

            <p style={{textAlign:'center', color:'#888', marginBottom:'20px'}}>{selectedMaterial.desc}</p>
            
            <button onClick={() => handleShare(selectedMaterial)} style={{width: '100%', background: 'var(--gradient-3)', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                <FaShareNodes /> مشاركة
            </button>

            <div className="modal-files-scroll">
              <h4 style={{color:'white', marginBottom:'10px', borderBottom:'1px solid #333', paddingBottom:'5px'}}>الملفات:</h4>
              {selectedMaterial.files && selectedMaterial.files.length > 0 ? (
                selectedMaterial.files.map((file, index) => (
                  <div key={index} className="modal-file-item" style={{background:'#222', padding:'15px', borderRadius:'10px', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={{color:'white', display:'flex', alignItems:'center', gap:'10px'}}>
                       {file.type?.includes('pdf') ? <FaFilePdf color="#ef4444"/> : <FaFileImage color="#3b82f6"/>} 
                       {file.name}
                    </span>
                    <div style={{display:'flex', gap:'10px'}}>
                        
                        {/* ✅ زر المعاينة الجديد بالكلاس الجديد btn-preview */}
                        <button 
                            onClick={() => handlePreviewFile(file.url)}
                            className="btn-preview"
                        >
                           <FaEye /> معاينة
                        </button>
                        
                        <a 
                            href={getDownloadUrl(file.url)} 
                            onClick={() => handleDownloadStats(selectedMaterial.id)}
                            className="view-file-btn" 
                            style={{background:'#00f260', color:'#000', padding:'8px 15px', borderRadius:'8px', textDecoration:'none', fontSize:'0.9em', display:'flex', alignItems:'center', gap:'5px', fontWeight:'600'}}
                        >
                           <FaCloudArrowDown /> تحميل
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

      {/* نافذة معاينة الملف الكبيرة */}
      {previewFile && (
        <div className="modal active" onClick={() => setPreviewFile(null)} style={{display:'flex', zIndex: 3000}}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{width:'95%', height:'95vh', maxWidth:'1000px', display:'flex', flexDirection:'column', position:'relative', padding:'0', background:'#000', border:'1px solid #444'}}>
                
                <div style={{padding:'15px', background:'#1a1a1a', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #333'}}>
                    <h3 style={{color:'white', margin:0, fontSize:'1em'}}>معاينة الملف</h3>
                    <button onClick={() => setPreviewFile(null)} style={{background:'transparent', border:'none', color:'white', fontSize:'1.5em', cursor:'pointer'}}>×</button>
                </div>

                <div style={{flex:1, position:'relative', background:'#000'}}>
                    {previewFile.type === 'pdf' ? (
                        <>
                           <iframe 
                                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile.url)}&embedded=true`}
                                width="100%" 
                                height="100%" 
                                style={{border:'none'}}
                                title="PDF Preview"
                            ></iframe>
                            <a href={previewFile.url} target="_blank" rel="noreferrer" style={{position:'absolute', bottom:'20px', left:'50%', transform:'translateX(-50%)', background:'white', padding:'8px 20px', borderRadius:'20px', textDecoration:'none', color:'black', fontSize:'0.9em', fontWeight:'bold', boxShadow:'0 5px 15px rgba(0,0,0,0.5)'}}>
                                🔗 فتح في نافذة خارجية
                            </a>
                        </>
                    ) : (
                        <img src={previewFile.url} alt="Preview" style={{width:'100%', height:'100%', objectFit:'contain'}} />
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