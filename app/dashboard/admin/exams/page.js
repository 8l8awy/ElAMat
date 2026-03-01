"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaPlus, FaSave, FaTrash, FaCheckCircle, FaMagic, FaLayerGroup, FaPen } from "react-icons/fa";

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
    options: ["", "", "", ""], // الافتراضي 4 خيارات
    correct: 0 
  });

  // دالة لتغيير عدد الخيارات
  const changeOptionCount = (count) => {
    let newOptions = [...currentQ.options];
    if (count > newOptions.length) {
      while (newOptions.length < count) newOptions.push("");
    } else {
      newOptions = newOptions.slice(0, count);
    }
    
    let newCorrect = currentQ.correct;
    if (newCorrect >= count) newCorrect = 0;

    setCurrentQ({ ...currentQ, options: newOptions, correct: newCorrect });
  };

  // زر سحري لأسئلة الصح والخطأ
  const setTrueFalse = () => {
    setCurrentQ({
      ...currentQ,
      options: ["صح", "خطأ"],
      correct: 0
    });
  };

  const addQuestion = () => {
    if (!currentQ.question || currentQ.options.some(opt => opt === "")) {
      alert("الرجاء تعبئة نص السؤال وجميع الاختيارات.");
      return;
    }
    setQuestions([...questions, { ...currentQ, id: Date.now() }]);
    setCurrentQ({ question: "", options: ["", "", "", ""], correct: 0 });
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

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
    // 1. حاوية رئيسية شفافة وتملأ الشاشة
    <div className="min-h-screen w-full text-white p-4 font-sans relative overflow-hidden" dir="rtl">

      {/* خلفية تفاعلية خفيفة للمطابقة مع باقي الصفحات */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto">
        
        {/* العنوان */}
        <div className="mb-8 pt-2">
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-3">
               <FaPen className="text-blue-400 text-2xl" />
               لوحة صنع الامتحانات
            </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            
            {/* العمود الأيمن: إدخال البيانات */}
            <div className="space-y-6">
            
            {/* بطاقة بيانات الامتحان */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4 text-blue-300 font-bold border-b border-white/5 pb-2">
                    <FaLayerGroup /> 1. تفاصيل الامتحان
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-medium">عنوان الامتحان</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            placeholder="مثال: امتحان منتصف الفصل - اقتصاد" 
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all" 
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2 text-sm font-medium">المادة الدراسية</label>
                        <select 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)} 
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        >
                            <option className="bg-slate-800">مبادئ الاقتصاد</option>
                            <option className="bg-slate-800">مبادئ المحاسبة المالية</option>
                            <option className="bg-slate-800">لغة اجنبية (1)</option>
                            <option className="bg-slate-800">مبادئ ادارة الاعمال</option>
                            <option className="bg-slate-800">مبادئ القانون</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* بطاقة إضافة الأسئلة */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50"></div>
                
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-purple-300 font-bold">
                        <FaPen /> 2. كتابة السؤال
                    </div>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/20 font-mono">
                        سؤال #{questions.length + 1}
                    </span>
                </div>
                
                <div className="space-y-5">
                    <textarea 
                        value={currentQ.question} 
                        onChange={(e) => setCurrentQ({...currentQ, question: e.target.value})}
                        placeholder="اكتب نص السؤال هنا بوضوح..." 
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 outline-none focus:border-purple-500 min-h-[100px] resize-none"
                    />

                    {/* شريط التحكم في عدد الإجابات */}
                    <div className="flex flex-wrap items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                        <span className="text-xs text-gray-400 ml-2 px-2">عدد الخيارات:</span>
                        {[2, 3, 4, 5].map(num => (
                            <button 
                                key={num}
                                onClick={() => changeOptionCount(num)}
                                className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentQ.options.length === num ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                {num}
                            </button>
                        ))}
                        
                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                        
                        <button 
                            onClick={setTrueFalse}
                            className="flex items-center gap-1 text-xs bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500 hover:to-purple-500 text-pink-300 hover:text-white px-3 py-1.5 rounded-lg border border-pink-500/30 transition-all ml-auto"
                        >
                            <FaMagic /> صح/خطأ
                        </button>
                    </div>

                    {/* حقول الإجابات */}
                    <div className="space-y-3">
                        <p className="text-xs text-gray-400 flex items-center gap-1"><FaCheckCircle className="text-green-500"/> اختر الإجابة الصحيحة:</p>
                        {currentQ.options.map((opt, idx) => (
                            <div key={idx} className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${currentQ.correct === idx ? 'bg-green-500/10 border-green-500/50' : 'border-transparent hover:bg-white/5'}`}>
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
                                    className={`flex-1 bg-transparent border-b border-white/10 py-2 px-2 outline-none transition-all ${currentQ.correct === idx ? 'text-green-400 border-green-500/50 font-bold' : 'text-gray-300 focus:border-blue-500'}`}
                                />
                            </div>
                        ))}
                    </div>

                    <button onClick={addQuestion} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95">
                        <FaPlus /> إضافة السؤال للقائمة
                    </button>
                </div>
            </div>
            </div>

            {/* العمود الأيسر: المعاينة */}
            <div className="h-fit sticky top-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col h-[calc(100vh-32px)]">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                        <h3 className="text-xl font-bold text-gray-200">المعاينة ({questions.length})</h3>
                        <button onClick={saveExam} disabled={loading || questions.length === 0} className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105">
                            <FaSave /> {loading ? "جاري..." : "نشر الامتحان"}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        {questions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 border-2 border-dashed border-white/10 rounded-2xl bg-black/10">
                                <FaLayerGroup className="text-4xl mb-3 opacity-20"/>
                                <p>لم يتم إضافة أسئلة بعد</p>
                            </div>
                        ) : (
                            questions.map((q, i) => (
                                <div key={q.id} className="bg-black/20 p-5 rounded-2xl border border-white/5 relative group hover:border-blue-500/30 transition-all">
                                    <button onClick={() => removeQuestion(q.id)} className="absolute top-4 left-4 text-red-400 hover:bg-red-500/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><FaTrash/></button>
                                    <h4 className="font-bold mb-3 text-blue-200 text-lg leading-relaxed pl-8">س{i+1}: {q.question}</h4>
                                    <ul className="space-y-2">
                                        {q.options.map((opt, optIdx) => (
                                            <li key={optIdx} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${optIdx === q.correct ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'text-gray-400'}`}>
                                                {optIdx === q.correct ? <FaCheckCircle size={14}/> : <span className="w-3.5 h-3.5 rounded-full border border-gray-600"></span>} 
                                                {opt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
