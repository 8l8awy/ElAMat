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
  FaFileAlt
} from "react-icons/fa";

import "./materials-design.css";

function MaterialsContent() {
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      const ref = doc(db, "materials", material.id);
      await updateDoc(ref, { viewCount: increment(1) });
      
      // فتح أول ملف متاح في المادة في صفحة خارجية مباشرة
      if (material.files && material.files.length > 0) {
        window.open(material.files[0].url, "_blank");
      }
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loading-spinner">جاري تحميل المواد...</div>;

  return (
    <div className="materials-page-container">
      <div className="materials-header-redesigned">
        <div className="header-icon-box"><FaBookOpen /></div>
        <h1>{subject}</h1>
        <p className="header-subtitle">اضغط على المادة لفتحها في صفحة جديدة</p>
      </div>

      <div className="materials-grid-wrapper">
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
