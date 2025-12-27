"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { FaCheckCircle, FaTimesCircle, FaClipboardList, FaArrowLeft, FaRedo, FaSpinner } from "react-icons/fa";

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedExam, setSelectedExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  // جلب الامتحانات من الفايربيس
  useEffect(() => {
    async function fetchExams() {
      try {
        const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExams(data);
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchExams();
  }, []);

  const startExam = (exam) => {
    setSelectedExam(exam);
    setUserAnswers({});
    setShowResult(false);
    setScore(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelect = (qIndex, optionIndex) => {
    if (showResult) return;
    setUserAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const submitExam = () => {
    if (Object.keys(userAnswers).length < selectedExam.questions.length) {
      if(!confirm("لم تجب على كل الأسئلة! هل أنت متأكد؟")) return;
    }
    let calculatedScore = 0;
    selectedExam.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) calculatedScore++;
    });
    setScore(calculatedScore);
    setShowResult(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAll = () => {
    setSelectedExam(null);
    setUserAnswers({});
    setShowResult(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-white"><FaSpinner className="animate-spin text-4xl"/></div>;

  return (
    <div className="min-h-screen w-full bg-[#0b0c15] text-white p-6 md:p-10 font-sans" dir="rtl">
      
      {!selectedExam ? (
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
              📝 الامتحانات المتاحة
            </h1>
            <p className="text-gray-400">اختر امتحاناً وابدأ التدريب فوراً</p>
          </div>

          {exams.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
                <p className="text-xl text-gray-500">لا توجد امتحانات متاحة حالياً.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => (
                <div key={exam.id} onClick={() => startExam(exam)} className="bg-[#151720] border border-gray-800 p-6 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-[#1a1d2e] transition-all group relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-600"></div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{exam.subject}</h3>
                    <p className="text-gray-400 text-sm mb-4 h-10 line-clamp-2">{exam.title}</p>
                    <div className="flex items-center gap-2 text-xs bg-gray-900 w-fit px-3 py-1.5 rounded-lg text-gray-300 border border-gray-800">
                    <FaClipboardList /> {exam.questions?.length || 0} سؤال
                    </div>
                </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto animate-fadeIn">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedExam.subject}</h2>
                <p className="text-sm text-gray-400">{selectedExam.title}</p>
            </div>
            <button onClick={resetAll} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded-lg">
                <FaArrowLeft /> خروج
            </button>
          </div>

          {showResult && (
            <div className={`mb-8 p-6 rounded-2xl text-center border ${score >= (selectedExam.questions.length / 2) ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                <h3 className="text-2xl font-bold mb-2">
                    {score >= (selectedExam.questions.length / 2) ? "🎉 نتيجة ممتازة!" : "حظ أوفر المرة القادمة!"}
                </h3>
                <p className="text-lg">
                    النتيجة: <span className="font-bold text-3xl mx-2">{score}</span> / {selectedExam.questions.length}
                </p>
                <button onClick={() => startExam(selectedExam)} className="mt-4 bg-white text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                    <FaRedo /> إعادة المحاولة
                </button>
            </div>
          )}

          <div className="space-y-6">
            {selectedExam.questions.map((q, qIndex) => {
              const isCorrectAnswer = userAnswers[qIndex] === q.correct;
              return (
                <div key={qIndex} className="bg-[#151720] border border-gray-800 rounded-2xl p-6 relative">
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="text-lg font-bold text-white leading-relaxed w-[90%]">
                       <span className="text-blue-500 ml-2">#{qIndex + 1}</span> 
                       {q.question}
                     </h3>
                     {showResult && (
                        isCorrectAnswer ? <FaCheckCircle className="text-green-500 text-2xl"/> : <FaTimesCircle className="text-red-500 text-2xl"/>
                     )}
                  </div>
                  <div className="space-y-3">
                    {q.options.map((option, optIndex) => {
                        let optionClass = "border-gray-700 bg-[#1a1d2e] hover:border-gray-500";
                        if (showResult) {
                            if (optIndex === q.correct) optionClass = "border-green-500 bg-green-500/20 text-green-400";
                            else if (userAnswers[qIndex] === optIndex) optionClass = "border-red-500 bg-red-500/20 text-red-400";
                            else optionClass = "border-gray-800 opacity-50";
                        } else if (userAnswers[qIndex] === optIndex) {
                            optionClass = "border-blue-500 bg-blue-500/20 text-blue-400";
                        }
                        return (
                            <div key={optIndex} onClick={() => handleSelect(qIndex, optIndex)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${optionClass}`}>
                                <span>{option}</span>
                                {showResult && optIndex === q.correct && <FaCheckCircle size={14}/>}
                            </div>
                        );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {!showResult && (
             <button onClick={submitExam} className="w-full mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02]">
                تسليم الإجابات
             </button>
          )}
        </div>
      )}
    </div>
  );
}
