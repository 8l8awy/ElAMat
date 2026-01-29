"use client";
import { useState } from "react";
// ... باقي الاستيرادات (firebase, icons, etc.)

export default function AdminUploadPage() {
  const [semester, setSemester] = useState(2); // الترم الحالي (افتراضي 2)
  const [selectedSubject, setSelectedSubject] = useState("");

  // قوائم المواد الموحدة (لازم تكون نفس اللي في صفحة العرض بالظبط)
  const subjectsList = {
    1: ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"],
    2: ["محاسبة الشركات", "القانون التجاري", "اقتصاد كلي", "لغة إنجليزية تخصصية", "إدارة التنظيم"]
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* الجزء الخاص بالرفع (يمين الصورة) */}
      <div className="bg-[#1a1a1a] p-8 rounded-[2rem] border border-white/5">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
          <span>🚀</span> رفع ملف جديد
        </h2>

        {/* إضافة زر لتبديل الترم قبل اختيار المادة */}
        <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setSemester(1)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${semester === 1 ? 'bg-purple-600 text-white' : 'text-gray-500'}`}
          >ترم 1</button>
          <button 
            onClick={() => setSemester(2)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${semester === 2 ? 'bg-purple-600 text-white' : 'text-gray-500'}`}
          >ترم 2</button>
        </div>

        <div className="space-y-4">
          <label className="block text-gray-500 font-bold mr-2">المادة</label>
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-purple-600"
          >
            <option value="">اختر المادة...</option>
            {subjectsList[semester].map((sub, index) => (
              <option key={index} value={sub}>{sub}</option>
            ))}
          </select>

          {/* ... باقي حقول الرفع (العنوان، النوع، اختيار الملف) */}
          <button className="w-full bg-blue-600 py-4 rounded-xl font-black mt-6 hover:bg-blue-500 transition-all">
            نشر الآن
          </button>
        </div>
      </div>
    </div>
  );
}
