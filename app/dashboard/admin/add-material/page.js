"use client";
import { useState } from "react";
import { db } from "@/lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaBalanceScale, FaCalculator, FaGavel, FaChartBar, FaBook } from "react-icons/fa";

const iconOptions = [
  { id: "balance", icon: <FaBalanceScale />, name: "ميزان" },
  { id: "calculator", icon: <FaCalculator />, name: "آلة حاسبة" },
  { id: "gavel", icon: <FaGavel />, name: "مطرقة (قانون)" },
  { id: "chart", icon: <FaChartBar />, name: "رسم بياني" },
  { id: "book", icon: <FaBook />, name: "كتاب" },
];

export default function AddMaterialPage() {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("book");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "subjects"), {
        name: name,
        semester: 2, // الترم الثاني
        iconType: selectedIcon, // حفظ نوع الأيقونة
        createdAt: serverTimestamp(),
      });
      alert("✅ تم إنشاء كارت المادة بأيقونة " + selectedIcon);
      setName("");
    } catch (error) {
      alert("خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white" dir="rtl">
      <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-black mb-6">إضافة مادة <span className="text-purple-500">بأيقونة</span></h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            required placeholder="اسم المادة..."
            className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-purple-600"
            value={name} onChange={(e) => setName(e.target.value)}
          />

          <div>
            <label className="block text-gray-500 text-sm mb-3 font-bold">اختر أيقونة الكارت:</label>
            <div className="grid grid-cols-5 gap-2">
              {iconOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedIcon(opt.id)}
                  className={`p-3 rounded-xl border transition-all ${selectedIcon === opt.id ? "bg-purple-600 border-purple-600" : "bg-black border-white/10"}`}
                >
                  <div className="text-xl">{opt.icon}</div>
                </button>
              ))}
            </div>
          </div>

          <button disabled={loading} className="w-full bg-purple-600 py-4 rounded-xl font-black hover:bg-purple-500">
            {loading ? "جاري الإنشاء..." : "إنشاء الكارت الآن"}
          </button>
        </form>
      </div>
    </div>
  );
}
