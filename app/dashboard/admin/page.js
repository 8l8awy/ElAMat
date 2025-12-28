"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { FaTrash, FaSearch, FaFileAlt, FaUser, FaBook } from "react-icons/fa";

export default function AdminDashboard() {
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // ميزة إضافية للبحث
  const [loading, setLoading] = useState(true);

  // 1. جلب كافة المنشورات بدون حد أقصى (No Limit)
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // جلب الكل مرتباً من الأحدث للأقدم
        const q = query(collection(db, "materials"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMaterials(data);
      } catch (err) {
        console.error("Error fetching materials:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // 2. دالة الحذف
  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المنشور نهائياً؟")) {
      try {
        await deleteDoc(doc(db, "materials", id));
        setMaterials(materials.filter(item => item.id !== id));
      } catch (err) {
        alert("فشل الحذف، حاول مرة أخرى.");
      }
    }
  };

  // 3. تصفية المنشورات بناءً على البحث
  const filteredMaterials = materials.filter(m => 
    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{textAlign:'center', padding:'50px', color:'#fff'}}>جاري جلب كافة المنشورات...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', direction: 'rtl', color: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem' }}>لوحة التحكم - كافة المنشورات ({materials.length})</h1>
        
        {/* شريط البحث المضاف لتسهيل الإدارة */}
        <div style={{ position: 'relative', width: '300px' }}>
          <input 
            type="text" 
            placeholder="ابحث عن مادة أو عنوان..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 40px 10px 10px', borderRadius: '8px',
              border: '1px solid #333', background: '#111', color: '#fff'
            }}
          />
          <FaSearch style={{ position: 'absolute', top: '12px', right: '12px', color: '#666' }} />
        </div>
      </header>

      <div style={{ display: 'grid', gap: '15px' }}>
        {filteredMaterials.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>لا توجد نتائج تطابق بحثك.</p>
        ) : (
          filteredMaterials.map((m) => (
            <div key={m.id} style={{
              background: '#18181b', padding: '20px', borderRadius: '12px',
              border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ background: '#27272a', padding: '15px', borderRadius: '10px', color: '#00f260' }}>
                  <FaFileAlt size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>{m.title}</h3>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#a1a1aa' }}>
                    <span><FaBook /> {m.subject}</span>
                    <span><FaUser /> {m.uploader || "مجهول"}</span>
                    <span>📅 {new Date(m.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleDelete(m.id)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                  border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer'
                }}
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
