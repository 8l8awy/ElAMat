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
  FaUser,
  FaClock,
  FaShareAlt,
  FaTimes
} from "react-icons/fa";

import "./materials-design.css";

function MaterialsContent() {
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // دالة بسيطة لعرض التاريخ بشكل "منذ..." بدون مكتبات خارجية
  const timeAgo = (date) => {
    if (!date) return "غير معروف";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `منذ ${interval} سنة`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `منذ ${interval} شهر`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `منذ ${interval} يوم`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `منذ ${interval} ساعة`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `منذ ${interval} دقيقة`;
    return "الآن";
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
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchData();
  }, [subject]);

  const handleOpenMaterial = async (material) => {
    setSelectedMaterial(material);
    try {
      await updateDoc(doc(db, "materials", material.id), { viewCount: increment(1) });
    } catch (err) { console.error(err); }
  };

  const handleDownload = async (materialId, url) => {
    try {
      await updateDoc(doc(db, "materials", materialId), { downloadCount: increment(1) });
      window.open(url, "_blank");
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loader">جاري تحميل المحتوى...</div>;

  return (
    <div className="materials-wrapper">
      <header className="page-header">
        <h1>ملخصات {subject}</h1>
      </header>

      <div className="materials-grid">
        {materials.map((m) => (
          <div key={m.id} className="old-style-card" onClick={() => handleOpenMaterial(m)}>
            <div className="card-icon-area">
               {m.type === 'assignment' ? <FaFilePdf className="pdf-icon"/> : <FaFileImage className="img-icon"/>}
            </div>
            <div className="card-info">
              <h3>{m.title}</h3>
              <div className="meta-info">
                <span><FaUser /> {m.uploader || "مجهول"}</span>
                <span><FaClock /> {timeAgo(m.date)}</span>
              </div>
            </div>
            <div className="card-footer">
              <span><FaEye /> {m.viewCount || 0}</span>
              <span><FaDownload /> {m.downloadCount || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedMaterial && (
        <div className="modal-overlay" onClick={() => setSelectedMaterial(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedMaterial(null)}><FaTimes /></button>
            <h2 style={{color: '#fff', marginBottom: '10px'}}>{selectedMaterial.title}</h2>
            <p style={{color: '#aaa', fontSize: '0.9rem', marginBottom: '20px'}}>
              نشر بواسطة {selectedMaterial.uploader} {timeAgo(selectedMaterial.date)}
            </p>
            
            <div className="files-list">
              {selectedMaterial.files?.map((file, idx) => (
                <div key={idx} className="file-row">
                  <span className="file-name">ملف {idx + 1}</span>
                  <div className="file-btns">
                    <button className="preview-btn" onClick={() => window.open(file.url, "_blank")}>معاينة</button>
                    <button className="download-btn" onClick={() => handleDownload(selectedMaterial.id, file.url)}>تحميل</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div className="loader">جاري التحميل...</div>}>
      <MaterialsContent />
    </Suspense>
  );
}
