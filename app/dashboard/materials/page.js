"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";

import {
  FaDownload,
  FaEye,
  FaBookOpen,
  FaClipboardList,
  FaFileAlt,
  FaTimes,
  FaImage,
  FaShareAlt
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

  if (loading) return <div className="loading-state">جاري تحميل المحتوى...</div>;

  return (
    <div className="materials-container">
      <header className="page-header">
        <div className="subject-icon"><FaBookOpen /></div>
        <h1>{subject}</h1>
      </header>

      <div className="grid-wrapper">
        <div className="materials-grid">
          {materials.map(m => (
            <div key={m.id} className="modern-card" onClick={() => handleOpenMaterial(m)}>
              <div className={`type-icon ${m.type === 'assignment' ? 'red' : 'blue'}`}>
                {m.type === 'assignment' ? <FaClipboardList /> : <FaFileAlt />}
              </div>
              <h3>{m.title}</h3>
              <p className="uploader">بواسطة: <span>{m.uploader || "مجهول"}</span></p>
              <div className="card-stats">
                <span><FaEye /> {m.viewCount || 0}</span>
                <span><FaDownload /> {m.downloadCount || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMaterial && (
        <div className="modal-overlay" onClick={() => setSelectedMaterial(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="close-x" onClick={() => setSelectedMaterial(null)}><FaTimes /></button>
            <h2 className="modal-title">{selectedMaterial.title}</h2>
            
            <div className="modal-actions-bar">
                <button className="share-btn-purple" onClick={() => navigator.share({title: selectedMaterial.title, url: window.location.href})}>
                    <FaShareAlt /> مشاركة
                </button>
            </div>

            <div className="files-list">
              {selectedMaterial.files?.map((file, i) => (
                <div key={i} className="file-card">
                  <div className="file-name"><FaImage /> ملف {i + 1}</div>
                  <div className="file-btns">
                    <button className="btn-v" onClick={() => window.open(file.url, "_blank")}><FaEye /> معاينة</button>
                    <button className="btn-d" onClick={() => handleDownload(selectedMaterial.id, file.url)}><FaDownload /> تحميل</button>
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
    <Suspense fallback={<div className="loading-state">جاري التحميل...</div>}>
      <MaterialsContent />
    </Suspense>
  );
}
