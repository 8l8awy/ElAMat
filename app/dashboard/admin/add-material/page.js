"use client";
import { useState } from "react";
import { db } from "../../../../lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../../../context/AuthContext";
import { FaPlus, FaBook } from "react-icons/fa";

export default function AddMaterialPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // بنصنع المادة بالاسم بس والترم التاني
      await addDoc(collection(db, "materials"), {
        name: name,
        semester: 2,
        status: "approved",
        createdAt: serverTimestamp(),
      });
      setMessage("✅ تم إنشاء كارت المادة بنجاح!");
      setName("");
    } catch (err) {
      setMessage("❌ حدث خطأ، حاول مرة أخرى.");
    }
    setLoading(false);
  };

  if (!user?.isAdmin) return <div className="text-white p-20 text-center">غير مسموح لك بالدخول</div>;

  return (
    <div className="min-h-screen bg-black p-6 text-white font-sans" dir="rtl">
      <div className="max-w-md mx-auto pt-20">
        <h1 className="text-3xl font-black mb-8 text-center text-purple-500">إضافة مادة جديدة</h1>
        
        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
          <div>
            <label className="block text-gray-500 text-sm mb-3 mr-2 font-bold">اسم المادة</label>
            <input 
               required 
               placeholder="اكتب اسم المادة هنا..." 
               className="w-full bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-purple-600 transition-all text-lg"
               value={name} 
               onChange={e => setName(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-5 bg-purple-600 rounded-2xl font-black text-xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? "جاري الإنشاء..." : <><FaPlus /> إنشاء الكارت</>}
          </button>

          {message && <p className="text-center font-bold animate-pulse">{message}</p>}
        </form>
      </div>
    </div>
  );
}
