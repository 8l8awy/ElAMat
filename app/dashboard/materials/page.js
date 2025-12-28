"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

import {
  FaDownload,
  FaEye,
  FaFilePdf,
  FaFileImage,
  FaUser,
  FaClock,
  FaArrowLeft,
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
        // ترتيب من الأحدث للأقدم
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
      await updateDoc(doc(db, "materials", material.id), { viewCount: increment(1) });
    } catch (err) { console.error(err); }
  };

  const handleDownload = async (materialId, fileUrl) => {
    try {
      await updateDoc(doc(db, "materials", materialId), { downloadCount: increment(1) });
      window.open(fileUrl, "_blank");
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loader">جاري تحميل الملخصات...</div>;

  return (
    <div className="materials-wrapper">
      <div className="page-header">
        <button className="back-btn" onClick={() => window.history.back()}><FaArrowLeft /></button>
        <h1>ملخصات {subject}</h1>
      </div>

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
                <span><FaClock /> {m.date ? formatDistanceToNow(new Date(m.date), { addSuffix: true, locale: ar }) : "غير معروف"}</span>
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
            <h2>{selectedMaterial.title}</h2>
            <p className="modal-meta">نشر بواسطة <b>{selectedMaterial.uploader}</b> منذ {formatDistanceToNow(new Date(selectedMaterial.date), { locale: ar })}</p>
            
            <div className="files-list">
              {selectedMaterial.files?.map((file, idx) => (
                <div key={idx} className="file-row">
                  <span className="file-name">صورة {idx + 1}</span>
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
    <Suspense fallback={<div>Loading...</div>}>
      <MaterialsContent />
    </Suspense>
  );
}
