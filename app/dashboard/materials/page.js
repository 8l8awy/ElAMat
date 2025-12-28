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

  return (
    <div className="materials-page-container">
      <div className="materials-header-redesigned">
          <div className="header-icon-box"><FaBookOpen /></div>
          <h1>{subject}</h1>
          <p className="header-subtitle">تصفح المحتوى المتاح</p>
      </div>

      <div className="materials-grid">
        {materials.length === 0 ? (
            <div className="empty-state-redesigned">
                <span className="empty-icon">📂</span>
                <h3>لا توجد مواد مضافة بعد</h3>
            </div>
        ) : (
            materials.map(m => (
                <div key={m.id} className="material-card-redesigned" onClick={() => handleOpenMaterial(m)}>
                    {/* استعادة الأيقونة الكبيرة الملونة */}
                    <div className={`card-big-icon ${m.type === 'assignment' ? 'icon-assignment' : 'icon-summary'}`}>
                        {m.type === 'assignment' ? <FaClipboardList /> : <FaFileAlt />}
                    </div>
                    <h3 className="card-title">{m.title}</h3>
                    <div className="card-uploader">بواسطة: <span>{m.uploader || "مجهول"}</span></div>
                    
                    {/* استعادة الأرقام والإحصائيات أسفل الكارت */}
                    <div className="card-bottom-pills">
                        <div className="pill-stat"><FaEye /> {m.viewCount || 0}</div>
                        <div className="pill-stat"><FaDownload /> {m.downloadCount || 0}</div>
                    </div>
                </div>
            ))
        )}
      </div>

      {selectedMaterial && (
        <div className="modal-backdrop active" onClick={() => setSelectedMaterial(null)}>
          <div className="modal-content-redesigned animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn-redesigned" onClick={() => setSelectedMaterial(null)}><FaTimes /></button>
            <h2 className="modal-title">{selectedMaterial.title}</h2>
            <p className="modal-description">{selectedMaterial.desc || "لا يوجد وصف إضافي."}</p>
            
            <div className="modal-files-section">
              <h4 className="files-title">الملفات:</h4>
              <div className="files-list-scroll">
                {selectedMaterial.files?.map((file, index) => (
                    <div key={index} className="file-item-redesigned">
                        <div className="file-info">
                            {isPdfFile(file) ? <FaFilePdf className="file-icon pdf"/> : <FaFileImage className="file-icon image"/>}
                            <span className="file-name">{file.name}</span>
                        </div>
                        <div className="file-actions">
                            <a href={file.url} target="_blank" rel="noreferrer" className="btn-action btn-preview-new">
                                <FaEye /> عرض
                            </a>
                            <a href={file.url} className="btn-action btn-download-new" target="_blank" rel="noopener noreferrer">
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
