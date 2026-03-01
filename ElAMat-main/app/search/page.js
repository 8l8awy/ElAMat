"use client";
import { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FaSearch, FaUser, FaBook, FaEye, FaDownload, FaFilePdf, FaImage } from "react-icons/fa";
import "../dashboard/materials/materials-design.css";

export default function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب كافة المواد المعتمدة عند فتح الصفحة
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const q = query(collection(db, "materials"), where("status", "==", "approved"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllMaterials(data);
        setResults(data);
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // 2. تصفية النتائج فورياً أثناء الكتابة
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = allMaterials.filter(m => 
      m.title.toLowerCase().includes(value) || 
      m.subject.toLowerCase().includes(value) ||
      m.uploader.toLowerCase().includes(value)
    );
    setResults(filtered);
  };

  return (
    <div className="materials-wrapper">
      <div className="page-header">
        <h1>البحث الذكي</h1>
        <div className="search-box-container">
          <input 
            type="text" 
            className="search-input-modern"
            placeholder="ابحث بالعنوان، المادة، أو اسم الناشر..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <FaSearch className="search-inner-icon" />
        </div>
      </div>

      <div className="materials-grid-container">
        {results.length > 0 ? (
          <div className="materials-grid">
            {results.map(m => (
              <div key={m.id} className="old-style-card" onClick={() => window.location.href=`/dashboard/materials?subject=${m.subject}`}>
                <div className={`card-banner ${m.type === 'assignment' ? 'red-bg' : 'blue-bg'}`}>
                   {m.type === 'assignment' ? <FaFilePdf /> : <FaImage />}
                </div>
                <div className="card-body">
                  <div className="subject-tag"><FaBook /> {m.subject}</div>
                  <h3>{m.title}</h3>
                  <div className="meta-row">
                    <span><FaUser /> {m.uploader}</span>
                  </div>
                </div>
                <div className="card-stats-footer">
                  <span><FaDownload /> {m.downloadCount || 0}</span>
                  <span><FaEye /> {m.viewCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">لا توجد نتائج تطابق بحثك...</div>
        )}
      </div>
    </div>
  );
}
