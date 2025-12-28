"use client";
import { useState, useEffect } from "react";
import { db } from "../../../lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  query, 
  orderBy 
} from "firebase/firestore";
import { 
  FaTrash, 
  FaSearch, 
  FaFileAlt, 
  FaUser, 
  FaBook, 
  FaEdit, 
  FaCheck, 
  FaTimes 
} from "react-icons/fa";

export default function AdminDashboard() {
  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", subject: "" });

  // 1. جلب كافة المنشورات (بدون حد 8 منشورات)
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "materials"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMaterials(data);
      } catch (err) {
        console.error("Error:", err);
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
        alert("فشل الحذف");
      }
    }
  };

  // 3. دوال التعديل
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ title: item.title, subject: item.subject });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id) => {
    try {
      const docRef = doc(db, "materials", id);
      await updateDoc(docRef, {
        title: editForm.title,
        subject: editForm.subject
      });
      setMaterials(materials.map(m => m.id === id ? { ...m, ...editForm } : m));
      setEditingId(null);
      alert("تم التحديث بنجاح!");
    } catch (err) {
      alert("حدث خطأ أثناء التحديث");
    }
  };

  // 4. تصفية البحث
  const filteredMaterials = materials.filter(m => 
    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{textAlign:'center', padding:'50px', color:'#fff'}}>جاري تحميل كافة البيانات...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', direction: 'rtl', color: '#fff', fontFamily: 'Cairo, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>لوحة الإدارة الكاملة</h1>
          <p style={{ color: '#888' }}>إجمالي المنشورات المكتشفة: {materials.length}</p>
        </div>
        
        <div style={{ position: 'relative', width: '350px' }}>
          <input 
            type="text" 
            placeholder="ابحث بالعنوان أو المادة..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px',
              border: '1px solid #333', background: '#111', color: '#fff', fontSize: '1rem'
            }}
          />
          <FaSearch style={{ position: 'absolute', top: '15px', right: '15px', color: '#00f260' }} />
        </div>
      </header>

      <div style={{ display: 'grid', gap: '20px' }}>
        {filteredMaterials.map((m) => (
          <div key={m.id} style={{
            background: '#18181b', padding: '25px', borderRadius: '16px',
            border: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            transition: '0.3s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
              <div style={{ background: 'rgba(0, 242, 96, 0.1)', padding: '18px', borderRadius: '14px', color: '#00f260' }}>
                <FaFileAlt size={28} />
              </div>
              
              {editingId === m.id ? (
                /* واجهة التعديل */
                <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                  <input 
                    value={editForm.title} 
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    style={{ background: '#000', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '5px', flex: 1 }}
                  />
                  <input 
                    value={editForm.subject} 
                    onChange={(e) => setEditForm({...editForm, subject: e.target.value})}
                    style={{ background: '#000', border: '1px solid #444', color: '#fff', padding: '8px', borderRadius: '5px', flex: 1 }}
                  />
                </div>
              ) : (
                /* عرض المعلومات */
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{m.title}</h3>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: '#a1a1aa' }}>
                    <span><FaBook color="#00f260" /> {m.subject}</span>
                    <span><FaUser color="#00f260" /> {m.uploader || "مجهول"}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {editingId === m.id ? (
                <>
                  <button onClick={() => handleUpdate(m.id)} style={{ background: '#00f260', color: '#000', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}>
                    <FaCheck /> حفظ
                  </button>
                  <button onClick={cancelEdit} style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}>
                    <FaTimes /> إلغاء
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(m)} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer' }}>
                    <FaEdit /> تعديل
                  </button>
                  <button onClick={() => handleDelete(m.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer' }}>
                    <FaTrash /> حذف
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
