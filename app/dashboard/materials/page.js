"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";

import {
  FaDownload, FaEye, FaFilePdf, FaImage, FaUser, FaClock, FaTimes, FaShareAlt, FaSearch, FaFileExport
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
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleOpenMaterial = async (material) => {
    setSelectedMaterial(material);
    try {
      await updateDoc(doc(db, "materials", material.id), { viewCount: increment(1) });
    } catch (err) { console.error(err); }
  };

  const handleDownload = async (id, url, fileName) => {
    if (!url) return;
    try {
      await updateDoc(doc(db, "materials", id), { downloadCount: increment(1) });
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) { window.open(url, "_blank"); }
  };

  // دالة PDF المتطورة لحل مشكلة الصور المقطوعة والصفحات البيضاء
  const downloadAsPDF = async (material) => {
    setIsGenerating(true);
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${material.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700&display=swap');
            @page { size: auto; margin: 0; }
            body { margin: 0; padding: 0; background: #fff; font-family: 'Cairo', sans-serif; }
            .pdf-page { width: 100%; page-break-after: always; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; }
            img { width: 100%; height: auto; display: block; object-fit: contain; }
            .loading-screen { position: fixed; inset: 0; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 20000; }
            .progress-container { width: 300px; height: 10px; background: #f0f0f0; border-radius: 5px; margin-top: 20px; overflow: hidden; }
            .progress-bar { height: 100%; background: #0a84ff; width: 0%; transition: 0.1s linear; }
            @media print { .loading-screen { display: none; } }
          </style>
        </head>
        <body>
          <div id="loader" class="loading-screen">
            <h2 dir="rtl">جاري تحويل ${material.files.length} صفحة لـ PDF...</h2>
            <div class="progress-container"><div id="progress" class="progress-bar"></div></div>
            <p id="counter" dir="rtl" style="margin-top:10px;">بدء التحميل...</p>
          </div>
          <div id="content"></div>
          <script>
            const urls = ${JSON.stringify(material.files.map(f => f.url))};
            const content = document.getElementById('content');
            const progress = document.getElementById('progress');
            const counter = document.getElementById('counter');
            let total = urls.length;
            let current = 0;

            async function process() {
              for (let url of urls) {
                try {
                  const resp = await fetch(url);
                  const blob = await resp.blob();
                  const base64 = await new Promise((res) => {
                    const reader = new FileReader();
                    reader.onloadend = () => res(reader.result);
                    reader.readAsDataURL(blob);
                  });

                  const page = document.createElement('div');
                  page.className = 'pdf-page';
                  const img = document.createElement('img');
                  img.src = base64;
                  page.appendChild(img);
                  content.appendChild(page);

                  current++;
                  progress.style.width = (current / total * 100) + '%';
                  counter.innerText = 'تمت معالجة ' + current + ' من ' + total;
                } catch (e) { current++; }
              }
              document.getElementById('loader').style.display = 'none';
              // انتظار ثانية للتأكد من استقرار الصور في الذاكرة قبل الطباعة
              setTimeout(() => { window.print(); }, 1200);
            }
            process();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setIsGenerating(false);
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
              {!selectedMaterial.files?.some(f => f.url.toLowerCase().includes('.pdf')) && (
                <button className="pdf-export-btn" onClick={() => downloadAsPDF(selectedMaterial)} disabled={isGenerating}>
                   {isGenerating ? 'جاري التحضير...' : 'تحميل كـ PDF'}
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
                      <button className="btn-d" onClick={() => handleDownload(selectedMaterial.id, file.url, `file_${idx + 1}.${isPDF ? 'pdf' : 'jpg'}`)}>تحميل</button>
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
