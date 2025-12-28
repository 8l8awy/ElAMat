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
  FaExternalLinkAlt,
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
            alert("تم نسخ رابط الصفحة!");
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

  if (loading) return <div className="loading-spinner">جاري تحميل المواد...</div>;

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
            ))
        )}
      </div>

      {selectedMaterial && !previewFile && (
        <div className="modal-backdrop active" onClick={() => setSelectedMaterial(null)}>
          <div className="modal-content-redesigned animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn-redesigned" onClick={() => setSelectedMaterial(null)}><FaTimes /></button>
            <h2 className="modal-title">{selectedMaterial.title}</h2>
            <p style={{textAlign:'center', color:'#94a3b8'}}>بواسطة: {selectedMaterial.uploader}</p>
            <p className="modal-description">{selectedMaterial.desc}</p>
            <button className="btn-share-redesigned" onClick={() => handleShare(selectedMaterial)}><FaShare /> مشاركة</button>
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
                            <a href={file.url} target="_blank" rel="noreferrer" className="btn-action"><FaExternalLinkAlt /></a>
                            <button onClick={() => handlePreviewFile(file)} className="btn-action"><FaEye /> معاينة</button>
                            <a href={getDownloadUrl(file.url)} onClick={() => handleDownloadStats(selectedMaterial.id)} className="btn-action" target="_blank" rel="noopener noreferrer"><FaDownload /> تحميل</a>
                        </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewFile && (
        <div className="modal-backdrop active preview-mode" onClick={() => setPreviewFile(null)}>
           <div className="preview-content-container" onClick={(e) => e.stopPropagation()}>
                {/* تم لف العناصر بداخل Fragment واحد هنا لإصلاح الخطأ */}
                <>
                  <div className="preview-header">
                      <h3 className="preview-title">{previewFile.name}</h3>
                      <div className="preview-actions">
                          <button className="btn-icon" onClick={() => setPreviewFile(null)}><FaTimes /></button>
                      </div>
                  </div>
                  <div className="preview-body">
                      {previewFile.type === 'pdf' ? (
                          <object data={previewFile.url} type="application/pdf" width="100%" height="100%">
                              <iframe src={previewFile.url} width="100%" height="100%"></iframe>
                          </object>
                      ) : (
                          <div className="image-preview-scroll"><img src={previewFile.url} alt="Preview" /></div>
                      )}
                  </div>
                </>
           </div>
        </div>
      )}
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <MaterialsContent />
    </Suspense>
  );
}
