"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../lib/firebase";
import { collection, addDoc, deleteDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
import { FaTrash, FaBullhorn } from "react-icons/fa";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // استماع فوري للتغييرات في قاعدة البيانات (Real-time)
  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("date", "desc"));
    
    // onSnapshot تقوم بتحديث البيانات تلقائياً عند أي تغيير
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(data);
    });

    // تنظيف الاستماع عند الخروج من الصفحة
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) return alert("الرجاء ملء جميع الحقول");
    
    setLoading(true);
    try {
      await addDoc(collection(db, "announcements"), {
        title,
        content,
        date: new Date().toISOString()
      });
      // تفريغ الحقول بعد النشر
      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء النشر");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
    } catch (err) {
      console.error(err);
      alert("فشل الحذف");
    }
  };

  return (
    <div>
       <h2 className="page-title" style={{color:'white', fontSize:'2.5em', margin:'30px 0', fontWeight:'900'}}>
         الإعلانات المهمة <FaBullhorn style={{fontSize:'0.8em', color:'#f59e0b'}} />
       </h2>

       {/* يظهر صندوق الإضافة فقط للأدمن */}
       {user?.isAdmin && (
         <div className="admin-panel" style={{marginBottom:'30px', border:'1px solid #f59e0b'}}>
           <h3 style={{color:'white', marginBottom:'15px'}}>+ إضافة إعلان جديد</h3>
           
           <input
             type="text"
             placeholder="عنوان الإعلان"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             style={{marginBottom:'10px'}}
           />
           
           <textarea
             placeholder="اكتب تفاصيل الإعلان هنا..."
             rows="3"
             value={content}
             onChange={(e) => setContent(e.target.value)}
             style={{marginBottom:'10px'}}
           ></textarea>
           
           <button onClick={handleAdd} disabled={loading} className="btn" style={{background:'white', color:'black'}}>
             {loading ? "جاري النشر..." : "نشر الإعلان"}
           </button>
         </div>
       )}

       {/* قائمة الإعلانات */}
       <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
         {announcements.length === 0 ? (
           <div className="empty-state">
             <span className="empty-state-icon">📭</span>
             <p>لا توجد إعلانات حالياً</p>
           </div>
         ) : (
           announcements.map(ann => (
             <div key={ann.id} className="announcement-card" style={{position:'relative', borderLeft: '4px solid #f59e0b'}}>
               
               {/* زر الحذف يظهر للأدمن فقط */}
               {user?.isAdmin && (
                 <button
                   onClick={() => handleDelete(ann.id)}
                   style={{
                     position:'absolute',
                     top:'15px',
                     left:'15px',
                     background:'#dc2626',
                     color:'white',
                     border:'none',
                     borderRadius:'50%',
                     width:'30px',
                     height:'30px',
                     cursor:'pointer',
                     display:'flex',
                     alignItems:'center',
                     justifyContent:'center',
                     zIndex: 10
                   }}
                   title="حذف الإعلان"
                 >
                   <FaTrash size={14} />
                 </button>
               )}

               <h3 style={{color:'white', marginTop:'0', fontSize:'1.5em'}}>{ann.title}</h3>
               <p style={{color:'#ccc', lineHeight:'1.7', fontSize:'1.1em'}}>{ann.content}</p>
               
               <div style={{
                   marginTop:'15px', 
                   paddingTop:'10px', 
                   borderTop:'1px solid #333',
                   color:'#666', 
                   fontSize:'0.85em', 
                   display:'flex',
                   justifyContent: 'flex-end'
               }}>
                 {new Date(ann.date).toLocaleDateString("ar-EG", { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                 })}
               </div>
             </div>
           ))
         )}
       </div>
    </div>
  );
}