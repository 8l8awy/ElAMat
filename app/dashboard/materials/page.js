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

  // دالة يدوية لعرض الوقت لتجنب أخطاء المكتبات الخارجية أثناء الـ Build
  const timeAgo = (date) => {
    if (!date) return "غير معروف";
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = Math.floor(seconds / 86400);
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
    const filtered = materials.filter(m => 
      m.title.toLowerCase().includes(value) || 
      m.uploader?.toLowerCase().includes(value)
    );
    setFilteredMaterials(filtered);
  };

  const handleOpenMaterial = async (material) => {
    setSelectedMaterial(material);
    try {
      await updateDoc(doc(db, "materials", material.id), { viewCount: increment(1) });
    } catch (err) { console.error(err); }
  };

  const handleDownload = async (id, url) => {
    try {
      window.open(url, "_blank");
      await updateDoc(doc(db, "materials", id), { downloadCount: increment(1) });
    } catch (err) { console.error(err); }
  };

  // دالة تحويل الصور لـ PDF مع ضمان تحميل الصور قبل الطباعة
  const downloadAsPDF = (material) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${material.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700&display=swap');
            body { margin: 0; padding: 20px; text-align: center; font-family: 'Cairo', sans-serif; }
            img { max-width: 100%; height: auto; display: block; margin: 0 auto 30px auto; page-break-after: always; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .loading-msg { padding: 50px; font-size: 24px; color: #333; }
            @media print { .loading-msg { display: none; } }
          </style>
        </head>
        <body>
          <div id="loader" class="loading-msg">جاري تحميل الصور وتجهيز ملف PDF...</div>
          <div id="content"></div>
          <script>
            const images = ${JSON.stringify(material.files.map(f => f.url))};
            const contentDiv = document.getElementById('content');
            let loadedCount = 0;

            images.forEach(url => {
              const img = new Image();
              img.src = url;
              img.onload = () => {
                loadedCount++;
                contentDiv.appendChild(img);
                if (loadedCount === images.length) {
                  document.getElementById('loader').style.display = 'none';
                  setTimeout(() => { window.print(); }, 1500); 
                }
              };
              img.onerror = () => {
                loadedCount++;
                if (loadedCount === images.length) { window.print(); }
              };
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return <div className="loader">جاري تحميل المحتوى...</div>;

  return (
    <div className="materials-wrapper">
      <div className="page-header">
        <h1>ملخصات {subject}</h1>
        <div className="search-bar-wrapper">
          <input 
            type="text" 
            placeholder="ابحث عن ملخص أو اسم ناشر..." 
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <FaSearch className="search-icon" />
        </div>
      </div>

      <div className="materials-grid-container">
        <div className="materials-grid">
          {filteredMaterials.map((m) => (
            <div key={m.id} className="old-style-card" onClick={() => handleOpenMaterial(m)}>
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
                <span className="stat-pill"><FaDownload /> {m.downloadCount || 0}</span>
                <span className="stat-pill"><FaEye /> {m.viewCount || 0}</span>
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
              <button className="pdf-export-btn" onClick={() => downloadAsPDF(selectedMaterial)}>
                 <FaFileExport /> تحميل كـ PDF
              </button>
            </div>

            <div className="modal-files-list">
              {selectedMaterial.files?.map((file, idx) => (
                <div key={idx} className="file-row-item">
                  <span className="file-label">ملف {idx + 1}</span>
                  <div className="file-btn-group">
                    <button className="btn-p" onClick={() => window.open(file.url, "_blank")}>معاينة</button>
                    <button className="btn-d" onClick={() => handleDownload(selectedMaterial.id, file.url)}>تحميل</button>
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
