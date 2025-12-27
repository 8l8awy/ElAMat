"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaPlus, FaSave, FaTrash, FaCheckCircle } from "react-icons/fa";

export default function CreateExamPage() {
  const [loading, setLoading] = useState(false);
  
  // بيانات الامتحان
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("مبادئ الاقتصاد");

  // قائمة الأسئلة
  const [questions, setQuestions] = useState([]);

  // السؤال الحالي (قيد الكتابة)
  const [currentQ, setCurrentQ] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: 0 
  });

  // إضافة سؤال للقائمة المؤقتة
  const addQuestion = () => {
    if (!currentQ.question || currentQ.options.some(opt => opt === "")) {
      alert("الرجاء تعبئة نص السؤال وجميع الاختيارات الأربعة.");
      return;
    }
    setQuestions([...questions, { ...currentQ, id: Date.now() }]);
    // تصفير الخانات
    setCurrentQ({ question: "", options: ["", "", "", ""], correct: 0 });
  };

  // حذف سؤال
  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // حفظ الامتحان في الفايربيس
  const saveExam = async () => {
    if (!title || questions.length === 0) {
      alert("الرجاء كتابة عنوان للامتحان وإضافة سؤال واحد على الأقل.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "exams"), {
        title,
        subject,
        questions,
        createdAt: serverTimestamp(),
        active: true
      });
      alert("تم حفظ الامتحان ونشره للطلاب بنجاح! ✅");
      setTitle("");
      setQuestions([]);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الحفظ.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0c15] text-white p-6 md:p-10 font-sans" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-blue-500">🛠️ لوحة صنع الامتحانات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* القسم الأيمن: إدخال البيانات */}
        <div className="space-y-6">
          
          {/* تفاصيل الامتحان */}
          <div className="bg-[#151720] p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">1. بيانات الامتحان</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">العنوان</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: امتحان منتصف الفصل 2024" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:border-blue-500 outline-none transition-all" />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">المادة</label>
                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500">
                        <option>مبادئ الاقتصاد</option>
                        <option>مبادئ المحاسبة</option>
                        <option>لغة إنجليزية</option>
                        <option>إدارة أعمال</option>
                        <option>قانون</option>
                        <option>تكنولوجيا معلومات</option>
                    </select>
                </div>
            </div>
          </div>

          {/* إضافة الأسئلة */}
          <div className="bg-[#151720] p-6 rounded-xl border border-blue-500/30 shadow-lg">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                <h3 className="text-xl font-bold">2. كتابة الأسئلة</h3>
                <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white font-mono">سؤال #{questions.length + 1}</span>
            </div>
            
            <div className="space-y-4">
                <textarea 
                    value={currentQ.question} 
                    onChange={(e) => setCurrentQ({...currentQ, question: e.target.value})}
                    placeholder="اكتب نص السؤال هنا..." 
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 min-h-[80px]"
                />

                <div className="space-y-3">
                    <p className="text-xs text-gray-400">الاختيارات (اضغط الدائرة لتحديد الإجابة الصحيحة):</p>
                    {currentQ.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <input 
                                type="radio" 
                                name="correctOption" 
                                checked={currentQ.correct === idx}
                                onChange={() => setCurrentQ({...currentQ, correct: idx})}
                                className="w-5 h-5 accent-green-500 cursor-pointer"
                            />
                            <input 
                                type="text" 
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...currentQ.options];
                                    newOpts[idx] = e.target.value;
                                    setCurrentQ({...currentQ, options: newOpts});
                                }}
                                placeholder={`الخيار رقم ${idx + 1}`}
                                className={`flex-1 bg-gray-900 border rounded-lg p-2.5 outline-none transition-all ${currentQ.correct === idx ? 'border-green-500 text-green-400 bg-green-900/10' : 'border-gray-700 focus:border-blue-500'}`}
                            />
                        </div>
                    ))}
                </div>

                <button onClick={addQuestion} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mt-4 transition-transform active:scale-95">
                    <FaPlus /> إضافة السؤال
                </button>
            </div>
          </div>
        </div>

        {/* القسم الأيسر: المعاينة */}
        <div className="bg-[#1a1d2d] p-6 rounded-xl border border-gray-800 h-fit shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">المعاينة ({questions.length})</h3>
                <button onClick={saveExam} disabled={loading || questions.length === 0} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105">
                    <FaSave /> {loading ? "جاري الحفظ..." : "حفظ ونشر"}
                </button>
            </div>

            {questions.length === 0 ? (
                <div className="text-center text-gray-500 py-12 border-2 border-dashed border-gray-700 rounded-xl bg-[#151720]/50">
                    لم يتم إضافة أي أسئلة بعد.
                </div>
            ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {questions.map((q, i) => (
                        <div key={q.id} className="bg-[#151720] p-4 rounded-lg border border-gray-700 relative group hover:border-blue-500/50 transition-colors">
                            <button onClick={() => removeQuestion(q.id)} className="absolute top-3 left-3 text-red-500 hover:bg-red-500/10 p-2 rounded opacity-0 group-hover:opacity-100 transition-all"><FaTrash/></button>
                            <h4 className="font-bold mb-3 text-blue-200 text-lg">س{i+1}: {q.question}</h4>
                            <ul className="space-y-2">
                                {q.options.map((opt, optIdx) => (
                                    <li key={optIdx} className={`flex items-center gap-2 text-sm p-2 rounded ${optIdx === q.correct ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'text-gray-400 bg-gray-900/50'}`}>
                                        {optIdx === q.correct && <FaCheckCircle size={14}/>} {opt}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
