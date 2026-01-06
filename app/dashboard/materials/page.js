"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../../lib/firebase";
import { doc, updateDoc, increment, collection, query, where, getDocs } from "firebase/firestore";
// ملاحظة: سنستخدم jsPDF للتحويل، تأكد من تثبيتها لاحقاً أو سنعتمد على طباعة المتصفح للسهولة حالياً
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

  // دالة تحويل الصور لـ PDF (تستخدم طباعة المتصفح لتحويل الصور لملف واحد فوري)
  const downloadAsPDF = (material) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>${material.title}</title><style>img{width:100%;margin-bottom:20px;display:block;page-break-after:always;}</style></head><body>`);
    material.files.forEach(file => {
      printWindow.document.write(`<img src="${file.url}" />`);
    });
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = async (id, url) => {
    try {
      window.open(url, "_blank");
      await updateDoc(doc(db, "materials", id), { downloadCount: increment(1) });
    } catch (err) { console.error(err); }
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
              {/* زر تحويل الـ PDF الجديد */}
              <button className="pdf-export-btn" onClick={() => downloadAsPDF(selectedMaterial)}>
                 <FaFileExport /> تحميل كـ PDF مجمع
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
    <Suspense fallback={<div>Loading...</div>}><MaterialsContent /></Suspense>
  );
}
