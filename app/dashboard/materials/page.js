"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import {
  FaDownload,
  FaEye,
  FaFilePdf,
  FaFileImage,
  FaShare,
  FaTimes,
  FaBookOpen,
  FaClipboardList,
  FaFileAlt
} from "react-icons/fa";

import "./materials-design.css";

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
    return name.endsWith(".pdf") || url.includes(".pdf");
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
          ...doc.data()
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
      text: `شاهد "${material.title}" لمادة ${material.subject}`,
      url: window.location.href
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert("تم نسخ رابط الصفحة!");
      }
    } catch (err) { console.log("Share skipped"); }
  };

  if (loading) return <div className="loading-spinner">جاري تحميل المواد...</div>;

  return (
    <div className="materials-page-container">
      <div className="materials-header-redesigned">
        <div className="header-icon-box"><FaBookOpen /></div>
        <h1>{subject}</h1>
        <p className="header-subtitle">تصفح المحتوى المتاح</p>
      </div>

      <div className="materials-grid">
        {materials.map(m => (
          <div key={m.id} className="material-card-redesigned" onClick={() => handleOpenMaterial(m)}>
            <div className={`card-big-icon ${m.type === 'assignment' ? 'icon-assignment' : 'icon-summary'}`}>
              {m.type === 'assignment' ? <FaClipboardList /> : <FaFileAlt />}
            </div>
            <h3 className="card-title">{m.title}</h3>
            <div className="card-uploader">بواسطة: <span>{m.uploader || "مجهول"}</span></div>
            <div className="card-bottom-pills">
              <div className="pill-stat"><FaEye /> {m.viewCount || 0}</div>
              <div className="pill-stat"><FaDownload /> {m.downloadCount || 0}</div>
            </div>
          </div>
        ))}
      </div>

      {/* مودال التفاصيل بالتنسيق الجديد */}
      {selectedMaterial && (
        <div className={`modal ${selectedMaterial ? 'active' : ''}`} onClick={() => setSelectedMaterial(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setSelectedMaterial(null)}>&times;</span>
            
            <h2>{selectedMaterial.title}</h2>
            
            <p>{selectedMaterial.desc || "لا يوجد وصف إضافي متاح لهذا الملف."}</p>

            <div className="modal-info">
              <div className="modal-info-item">
                <span>بواسطة: <strong>{selectedMaterial.uploader || "مجهول"}</strong></span>
              </div>
              <div className="modal-info-item" style={{ flexDirection: 'row', gap: '20px' }}>
                <span className="pill-stat"><FaEye /> {selectedMaterial.viewCount || 0}</span>
                <span className="pill-stat"><FaDownload /> {selectedMaterial.downloadCount || 0}</span>
              </div>
            </div>

            <button 
              className="view-file-btn" 
              style={{ width: '100%', marginBottom: '20px', background: 'var(--gradient-3)', color: '#fff' }} 
              onClick={() => handleShare(selectedMaterial)}
            >
              <FaShare /> مشاركة هذا المحتوى
            </button>

            <div className="modal-files-scroll">
              <h3 style={{ color: '#fff', marginBottom: '15px' }}>الملفات المرفقة:</h3>
              {selectedMaterial.files?.map((file, index) => (
                <div key={index} className="modal-file-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {isPdfFile(file) ? <FaFilePdf color="#ef4444" size={22} /> : <FaFileImage color="#3b82f6" size={22} />}
                    <span>{file.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="view-file-btn" onClick={() => setPreviewFile({ ...file, type: isPdfFile(file) ? 'pdf' : 'image' })}>
                      <FaEye /> معاينة
                    </button>
                    <a 
                      href={file.url} 
                      className="view-file-btn" 
                      style={{ background: '#fff', color: '#000' }} 
                      onClick={() => handleDownloadStats(selectedMaterial.id)} 
                      target="_blank" 
                      rel="noreferrer"
                    >
                      <FaDownload /> تحميل
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* مودال المعاينة (Preview) */}
      {previewFile && (
        <div className="modal active" style={{ zIndex: 3000 }} onClick={() => setPreviewFile(null)}>
          <div className="modal-content" style={{ maxWidth: '95vw', height: '90vh', padding: '60px 20px 20px' }} onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setPreviewFile(null)}>&times;</span>
            <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '12px' }}>
              {previewFile.type === 'pdf' ? (
                <iframe src={previewFile.url} width="100%" height="100%" style={{ border: 'none' }}></iframe>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', background: '#000' }}>
                  <img src={previewFile.url} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
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
    <Suspense fallback={<div className="loading-spinner">جاري التحميل...</div>}>
      <MaterialsContent />
    </Suspense>
  );
}
