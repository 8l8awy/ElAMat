"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";

import {
  FaDownload,
  FaEye,
  FaFilePdf,
  FaImage,
  FaUser,
  FaClock,
  FaTimes,
  FaShareAlt,
  FaSearch,
  FaFileExport
} from "react-icons/fa";

import "./materials-design.css";

function MaterialsContent() {
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");

  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const timeAgo = (date) => {
    if (!date) return "غير معروف";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `منذ ${interval} يوم`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `منذ ${interval} ساعة`;
    return "الآن";
  };

  useEffect(() => {
    async function fetchData() {
      if (!subject) return;
      setLoading(true);
      try {
        const q = query(collection(db, "materials"), where("subject", "==", subject), where("status", "==", "approved"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMaterials(data);
        setFilteredMaterials(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    fetchData();
  }, [subject]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredMaterials(materials.filter(m => m.title.toLowerCase().includes(value) || m.uploader?.toLowerCase().includes(value)));
  };

  const handleDownload = async (id, url, fileName) => {
    if (!url) return;
    try {
      await updateDoc(doc(db, "materials", id), { downloadCount: increment(1) });
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.body.appendChild(document.createElement('a'));
      link.href = blobUrl;
      link.download = fileName;
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) { window.open(url, "_blank"); }
  };

  const downloadAsPDF = (material) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${material.title}</title>
          <style>
            body { margin: 0; padding: 20px; text-align: center; font-family: sans-serif; }
            img { max-width: 100%; display: block; margin: 0 auto 30px; page-break-after: always; }
            .loader { padding: 50px; font-size: 20px; }
            @media print { .loader { display: none; } }
          </style>
        </head>
        <body>
          <div id="L">جاري تجهيز الصور...</div>
          <div id="C"></div>
          <script>
            const imgs = ${JSON.stringify(material.files.map(f => f.url))};
            let count = 0;
            imgs.forEach(u => {
              const i = new Image(); i.src = u;
              i.onload = () => {
                count++; document.getElementById('C').appendChild(i);
                if(count === imgs.length) { document.getElementById('L').style.display='none'; setTimeout(()=>window.print(), 1000); }
              };
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return <div className="loader">جاري التحميل...</div>;

  return (
    <div className="materials-wrapper">
      <div className="page-header">
        <h1>ملخصات {subject}</h1>
        <div className="search-bar-wrapper">
          <input type="text" placeholder="ابحث عن ملخص..." value={searchTerm} onChange={handleSearch} className="search-input" />
          <FaSearch className="search-icon" />
        </div>
      </div>

      <div className="materials-grid-container">
        <div className="materials-grid">
          {filteredMaterials.map((m) => (
            <div key={m.id} className="old-style-card" onClick={() => { setSelectedMaterial(m); updateDoc(doc(db, "materials", m.id), { viewCount: increment(1) }); }}>
              <div className={`card-banner ${m.type === 'assignment' ? 'red-bg' : 'blue-bg'}`}>
                 {m.type === 'assignment' ? <FaFilePdf /> : <FaImage />}
              </div>
              <div className="card-body">
                <h3>{m.title}</h3>
                <div className="meta-row">
                  <span><FaUser /> {m.uploader || "مجهول"}</span>
                  <span><FaClock /> {timeAgo(m.date)}</span>
                </div>
              </div>
              <div className="card-stats-footer">
                <span><FaDownload /> {m.downloadCount || 0}</span>
                <span><FaEye /> {m.viewCount || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMaterial && (
        <div className="modal-overlay" onClick={() => setSelectedMaterial(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-x" onClick={() => setSelectedMaterial(null)}><FaTimes /></button>
            <h2 className="modal-title">{selectedMaterial.title}</h2>
            
            <div className="modal-top-actions">
              <button className="share-btn-grad" onClick={() => navigator.share({title: selectedMaterial.title, url: window.location.href})}>
                 <FaShareAlt /> مشاركة
              </button>

              {/* المنطق الذكي لإخفاء الزر إذا كان هناك ملف PDF أصلي */}
              {!selectedMaterial.files?.some(f => f.url.toLowerCase().includes('.pdf')) && (
                <button className="pdf-export-btn" onClick={() => downloadAsPDF(selectedMaterial)}>
                   <FaFileExport /> تحميل كـ PDF مجمع
                </button>
              )}
            </div>

            <div className="modal-files-list">
              {selectedMaterial.files?.map((file, idx) => {
                const isPDF = file.url.toLowerCase().includes('.pdf');
                return (
                  <div key={idx} className="file-row-item">
                    <span className="file-label">
                      {isPDF ? <FaFilePdf color="#ff453a" /> : <FaImage color="#0a84ff" />}
                      {" "} ملف {idx + 1}
                    </span>
                    <div className="file-btn-group">
                      <button className="btn-p" onClick={() => window.open(file.url, "_blank")}>معاينة</button>
                      <button className="btn-d" onClick={() => handleDownload(selectedMaterial.id, file.url, `file_${idx+1}.${isPDF?'pdf':'jpg'}`)}>تحميل</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <Suspense fallback={<div className="loader">جاري التحميل...</div>}><MaterialsContent /></Suspense>
  );
}
