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
  FaShare
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

  const handleDownloadClick = async (materialId, fileUrl) => {
    try {
      const ref = doc(db, "materials", materialId);
      await updateDoc(ref, { downloadCount: increment(1) });
      
      // فتح الرابط في نافذة جديدة لبدء التحميل
      window.open(fileUrl, "_blank");
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

  if (loading) return <div className="loading-spinner">جاري التحميل...</div>;

  return (
    <div className="materials-page-container">
      <div className="materials-header-redesigned">
        <div className="header-icon-box"><FaBookOpen /></div>
        <h1>{subject}</h1>
        <p className="header-subtitle">اضغط على الملخص لعرض ملفاته</p>
      </div>

      <div className="materials-grid-container">
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
      </div>

      {selectedMaterial && (
        <div className="modal-backdrop active" onClick={() => setSelectedMaterial(null)}>
          <div className="modal-content-redesigned" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn-top" onClick={() => setSelectedMaterial(null)}><FaTimes /></button>
            <h2 className="modal-title-main">{selectedMaterial.title}</h2>
            
            <div className="modal-stats-box">
                <div className="stat-item-inner"><FaEye color="#00f260"/> {selectedMaterial.viewCount || 0}</div>
                <div className="stat-divider"></div>
                <div className="stat-item-inner"><FaDownload color="#3b82f6"/> {selectedMaterial.downloadCount || 0}</div>
            </div>

            <button className="btn-share-gradient" onClick={() => handleShare(selectedMaterial)}>
                <FaShare /> مشاركة هذا المحتوى
            </button>

            <div className="files-scroll-area">
              <h4 className="section-label">الملفات ({selectedMaterial.files?.length || 0}):</h4>
              {selectedMaterial.files?.map((file, index) => (
                <div key={index} className="file-item-card">
                  <div className="file-info-side">
                    <FaImage className="image-icon-small" />
                    <span>ملف رقم {index + 1}</span>
                  </div>
                  <div className="file-actions-side">
                    <button className="btn-action-small view" onClick={() => window.open(file.url, "_blank")}>
                      <FaEye /> معاينة
                    </button>
                    <button className="btn-action-small download" onClick={() => handleDownloadClick(selectedMaterial.id, file.url)}>
                      <FaDownload /> تحميل
                    </button>
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
    <Suspense fallback={<div className="loading-spinner">جاري التحميل...</div>}>
      <MaterialsContent />
    </Suspense>
  );
}
