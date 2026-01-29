"use client";
import { useState } from "react";
import { db } from "../../../../lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddMaterialPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // ✅ التعديل هنا: بنبعت لـ subjects مش materials
      const docRef = await addDoc(collection(db, "subjects"), {
        name: name,
        semester: 2,
        createdAt: serverTimestamp(),
      });
      
      alert("✅ تمت الإضافة بنجاح في قسم المواد الجديد!");
      setName("");
    } catch (error) {
      console.error("❌ فشل الإرسال:", error);
      alert("حدث خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6" dir="rtl">
      <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-black text-white mb-6">إنشاء كارت <span className="text-purple-500">مادة جديدة</span></h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-gray-500 text-xs font-bold mr-2 uppercase tracking-widest">اسم المادة</label>
            <input 
              required
              type="text"
              placeholder="مثال: اقتصاد، محاسبة..."
              className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-purple-600 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-black text-white transition-all shadow-lg shadow-purple-600/20 active:scale-95 disabled:bg-gray-800"
          >
            {loading ? "جاري الإنشاء..." : "صنع الكارت الآن"}
          </button>
        </form>
      </div>
    </div>
  );
}
