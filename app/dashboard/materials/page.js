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
  FaFileAlt,
  FaExternalLinkAlt
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

      {selectedMaterial && (
        <div className="modal-backdrop active" onClick={() => setSelectedMaterial(null)}>
          <div className="modal-content-redesigned animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn-redesigned" onClick={() => setSelectedMaterial(null)}><FaTimes /></button>
            <h2 className="modal-title">{selectedMaterial.title}</h2>

            {/* صندوق الإحصائيات (المشاهدة والتحميل) */}
            <div className="modal-stats-container">
              <div className="modal-stat-item">
                <FaEye color="#00ff88" size={20} />
                <span style={{ color: '#fff', marginTop: '5px' }}>{selectedMaterial.viewCount || 0}</span>
              </div>
              <div className="modal-divider"></div>
              <div className="modal-stat-item">
                <FaDownload color="#3b82f6" size={20} />
                <span style={{ color: '#fff', marginTop: '5px' }}>{selectedMaterial.downloadCount || 0}</span>
              </div>
            </div>

            <button className="btn-share-redesigned gradient-btn" onClick={() => handleShare(selectedMaterial)}>
              <FaShare /> مشاركة
            </button>

            <div className="modal-files-section">
              <h4 className="files-title">الملفات:</h4>
              <div className="files-list-scroll">
                {selectedMaterial.files?.map((file, index) => (
                  <div key={index} className="file-item-redesigned">
                    <div className="file-info">
                      <span className="file-name">{file.name}</span>
                      {isPdfFile(file) ? <FaFilePdf color="#ef4444" /> : <FaFileImage color="#3b82f6" />}
                    </div>
                    <div className="file-actions">
                      <button onClick={() => setPreviewFile({ ...file, type: isPdfFile(file) ? 'pdf' : 'image' })} className="btn-action btn-preview-new">
                        <FaEye /> معاينة
                      </button>
                      <a href={file.url} onClick={() => handleDownloadStats(selectedMaterial.id)} className="btn-action btn-download-new" target="_blank" rel="noopener noreferrer">
                        <FaDownload /> تحميل
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال المعاينة (Preview) المصلح برمجياً */}
      {previewFile && (
        <div className="modal-backdrop active preview-mode" onClick={() => setPreviewFile(null)}>
          <div className="preview-content-container" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <div className="preview-title">
                <FaExternalLinkAlt />
                <span>{previewFile.name}</span>
              </div>
              <button className="btn-icon close-preview" onClick={() => setPreviewFile(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="preview-body">
              {previewFile.type === 'pdf' ? (
                <iframe src={previewFile.url} className="pdf-viewer" title="PDF Preview"></iframe>
              ) : (
                <div className="image-preview-scroll">
                  <img src={previewFile.url} alt="Preview" />
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
