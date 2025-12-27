"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaPlus, FaSave, FaTrash, FaCheckCircle } from "react-icons/fa";

export default function CreateExamPage() {
  const [loading, setLoading] = useState(false);
  
  // بيانات الامتحان الأساسية
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("مبادئ الاقتصاد");

  // قائمة الأسئلة (سنخزن فيها الأسئلة التي تضيفها)
  const [questions, setQuestions] = useState([]);

  // حالة السؤال الحالي الذي تكتبه الآن
  const [currentQ, setCurrentQ] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: 0 // 0 يعني الخيار الأول هو الصحيح
  });

  // دالة إضافة السؤال للقائمة المؤقتة
  const addQuestion = () => {
    if (!currentQ.question || currentQ.options.some(opt => opt === "")) {
      alert("الرجاء تعبئة نص السؤال وجميع الاختيارات الأربعة.");
      return;
    }
    setQuestions([...questions, { ...currentQ, id: Date.now() }]);
    // تصفير الخانات لكتابة سؤال جديد
    setCurrentQ({ question: "", options: ["", "", "", ""], correct: 0 });
  };

  // دالة حذف سؤال من القائمة
  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // دالة حفظ الامتحان بالكامل في الفايربيس
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
      alert("تم حفظ الامتحان بنجاح! سيظهر الآن للطلاب.");
      // تصفير النموذج
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
      <h1 className="text-3xl font-bold mb-8 text-blue-500">🛠️ إنشاء امتحان جديد</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* القسم الأيمن: إدخال البيانات */}
        <div className="space-y-6">
          
          {/* 1. تفاصيل الامتحان */}
          <div className="bg-[#151720] p-6 rounded-xl border border-gray-800">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">1. تفاصيل الامتحان</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-gray-400 mb-1">عنوان الامتحان</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: امتحان منتصف الفصل" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:border-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">المادة</label>
                    <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 outline-none">
                        <option>مبادئ الاقتصاد</option>
                        <option>مبادئ المحاسبة</option>
                        <option>لغة إنجليزية</option>
                        <option>إدارة أعمال</option>
                        <option>قانون</option>
                    </select>
                </div>
            </div>
          </div>

          {/* 2. إضافة سؤال جديد */}
          <div className="bg-[#151720] p-6 rounded-xl border border-blue-500/30">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 flex justify-between">
                2. إضافة سؤال
                <span className="text-sm bg-blue-600 px-2 py-1 rounded text-white">رقم {questions.length + 1}</span>
            </h3>
            
            <div className="space-y-4">
                <input 
                    type="text" 
                    value={currentQ.question} 
                    onChange={(e) => setCurrentQ({...currentQ, question: e.target.value})}
                    placeholder="نص السؤال هنا..." 
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 outline-none"
                />

                <div className="space-y-2">
                    <p className="text-sm text-gray-400">الاختيارات (اضغط على الدائرة لتحديد الإجابة الصحيحة):</p>
                    {currentQ.options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
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
                                placeholder={`الخيار ${idx + 1}`}
                                className={`flex-1 bg-gray-900 border rounded-lg p-2 outline-none ${currentQ.correct === idx ? 'border-green-500 text-green-400' : 'border-gray-700'}`}
                            />
                        </div>
                    ))}
                </div>

                <button onClick={addQuestion} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 mt-4">
                    <FaPlus /> إضافة السؤال للامتحان
                </button>
            </div>
          </div>
        </div>

        {/* القسم الأيسر: معاينة الأسئلة المضافة */}
        <div className="bg-[#1a1d2d] p-6 rounded-xl border border-gray-800 h-fit">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">معاينة الامتحان ({questions.length} أسئلة)</h3>
                <button onClick={saveExam} disabled={loading || questions.length === 0} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                    <FaSave /> {loading ? "جاري الحفظ..." : "حفظ ونشر الامتحان"}
                </button>
            </div>

            {questions.length === 0 ? (
                <div className="text-center text-gray-500 py-10 border-2 border-dashed border-gray-700 rounded-xl">
                    لا توجد أسئلة مضافة بعد.
                </div>
            ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {questions.map((q, i) => (
                        <div key={q.id} className="bg-[#151720] p-4 rounded-lg border border-gray-700 relative group">
                            <button onClick={() => removeQuestion(q.id)} className="absolute top-2 left-2 text-red-500 hover:bg-red-500/10 p-2 rounded opacity-0 group-hover:opacity-100 transition-all"><FaTrash/></button>
                            <h4 className="font-bold mb-2 text-blue-200">س{i+1}: {q.question}</h4>
                            <ul className="text-sm space-y-1 text-gray-400">
                                {q.options.map((opt, optIdx) => (
                                    <li key={optIdx} className={`flex items-center gap-2 ${optIdx === q.correct ? 'text-green-400 font-bold' : ''}`}>
                                        {optIdx === q.correct && <FaCheckCircle size={12}/>} {opt}
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
