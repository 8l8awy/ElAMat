"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext"; // تأكد من المسار
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaCloudUploadAlt, FaCheckCircle, FaHourglassHalf, FaEye, FaDownload } from "react-icons/fa";

export default function MyUploadsPage() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyUploads() {
      if (!user) return;

      try {
        // البحث عن المواد التي يكون فيها "uploader" مطابق لاسم المستخدم الحالي
        const q = query(collection(db, "materials"), where("uploader", "==", user.name));
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // ترتيب الأحدث أولاً (يمكنك عمل هذا في الكويري أيضاً إذا أضفت index)
        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        setUploads(data);
      } catch (err) {
        console.error("Error fetching uploads:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyUploads();
  }, [user]);

  if (loading) return <div style={{textAlign:'center', marginTop:'50px', color:'white'}}>جاري تحميل ملفاتك...</div>;

  return (
    <div>
      <h2 className="page-title" style={{color:'white', fontSize:'2em', fontWeight:'900', marginBottom:'30px'}}>ملخصاتي ومشاركاتي</h2>

      {uploads.length === 0 ? (
        <div className="empty-state">
            <span className="empty-state-icon">📂</span>
            <p>لم تقم برفع أي ملفات بعد.</p>
            {/* سنقوم لاحقاً بتفعيل زر الرفع للطلاب */}
            <button className="btn" style={{width:'auto', marginTop:'15px', background: 'var(--gradient-1)'}}>
                ارفع أول ملخص ليك
            </button>
        </div>
      ) : (
        <div style={{display:'grid', gap:'20px'}}>
            {uploads.map(item => (
                <div key={item.id} className="material-card" style={{
                    borderLeft: `5px solid ${item.status === 'approved' ? '#00f260' : '#ffc107'}`,
                    cursor: 'default'
                }}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                        <span className="material-type-badge" style={{position:'static', background:'#333'}}>
                            {item.type === 'summary' ? 'ملخص' : 'تكليف'}
                        </span>
                        
                        {/* حالة الملف */}
                        {item.status === 'approved' ? (
                            <span style={{color:'#00f260', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.9em', background:'rgba(0,242,96,0.1)', padding:'5px 10px', borderRadius:'15px'}}>
                                <FaCheckCircle /> تم النشر
                            </span>
                        ) : (
                            <span style={{color:'#ffc107', display:'flex', alignItems:'center', gap:'5px', fontSize:'0.9em', background:'rgba(255,193,7,0.1)', padding:'5px 10px', borderRadius:'15px'}}>
                                <FaHourglassHalf /> قيد المراجعة
                            </span>
                        )}
                    </div>

                    <h3 style={{color:'white', fontSize:'1.3em', marginBottom:'5px'}}>{item.title}</h3>
                    <p style={{color:'#888', fontSize:'0.9em'}}>{item.subject}</p>

                    <div style={{marginTop:'15px', paddingTop:'15px', borderTop:'1px solid #333', display:'flex', gap:'20px', color:'#aaa', fontSize:'0.9em'}}>
                        <span style={{display:'flex', alignItems:'center', gap:'5px'}}><FaEye /> {item.viewCount || 0} مشاهدة</span>
                        <span style={{display:'flex', alignItems:'center', gap:'5px'}}><FaDownload /> {item.downloadCount || 0} تحميل</span>
                        <span style={{marginLeft:'auto'}}>{new Date(item.date).toLocaleDateString("ar-EG")}</span>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
