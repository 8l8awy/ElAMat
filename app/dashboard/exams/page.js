"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext"; 
import { 
  FaCheckCircle, FaTimesCircle, FaClipboardList, FaArrowLeft, FaRedo, 
  FaClock, FaTrophy, FaMedal, FaGraduationCap, FaLock
} from "react-icons/fa";

export default function ExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedExam, setSelectedExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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

  useEffect(() => {
    let timer;
    if (isExamStarted && !showResult) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExamStarted, showResult]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startExam = (exam) => {
    // التأكد من أن الامتحان متاح قبل البدء
    if (exam.active === false) {
      alert("عذراً، هذا الامتحان مغلق حالياً.");
      return;
    }
    setSelectedExam(exam);
    setUserAnswers({});
    setShowResult(false);
    setScore(0);
    setTimeElapsed(0);
    setIsExamStarted(true);
    setShowConfetti(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelect = (qIndex, optionIndex) => {
    if (showResult) return;
    setUserAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const submitExam = async () => {
    const unanswered = selectedExam.questions.length - Object.keys(userAnswers).length;
    if (unanswered > 0) {
      if(!confirm(`لديك ${unanswered} سؤال لم تجب عليه! هل تريد التسليم؟`)) return;
    }
    
    let calculatedScore = 0;
    selectedExam.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) calculatedScore++;
    });
    
    setScore(calculatedScore);
    setShowResult(true);
    setIsExamStarted(false);
    
    const percentage = (calculatedScore / selectedExam.questions.length) * 100;

    if (user) {
        await addDoc(collection(db, "results"), {
          studentName: user.name || "طالب مجهول",
          studentEmail: user.email,
          examTitle: selectedExam.title,
          score: calculatedScore,
          totalQuestions: selectedExam.questions.length,
          percentage: percentage,
          timeTaken: timeElapsed,
          createdAt: serverTimestamp(),
        });
    }

    if (percentage >= 75) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAll = () => {
    setSelectedExam(null);
    setUserAnswers({});
    setShowResult(false);
    setIsExamStarted(false);
    setTimeElapsed(0);
    setShowConfetti(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-[#0a0a0a]">
        <FaGraduationCap className="text-6xl text-blue-400 animate-bounce mb-4"/>
        <p className="animate-pulse">جاري تجهيز المنصة...</p>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = selectedExam?.questions.length || 0;
  const percentageValue = selectedExam ? (score / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen w-full text-white p-4 font-sans relative overflow-hidden bg-[#0a0a0a]" dir="rtl">
      
      {/* الخلفية */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="absolute w-3 h-3 rounded-full animate-confetti" style={{ left: `${Math.random() * 100}%`, backgroundColor: ['#3b82f6', '#06b6d4', '#a855f7', '#eab308'][Math.floor(Math.random() * 4)], animationDelay: `${Math.random() * 3}s`, animationDuration: `${3 + Math.random() * 2}s` }}></div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto">
        {!selectedExam ? (
          <div className="w-full animate-fadeIn">
            <div className="text-center mb-8 pt-4">
              <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  منصة الامتحانات
              </h1>
              <p className="text-gray-400">
                  أهلاً يا <span className="text-blue-400 font-bold">{user?.name}</span>، اختر امتحانك وابدأ!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam, idx) => {
                const isAvailable = exam.active !== false; // التحقق من حالة القفل
                return (
                  <div 
                    key={exam.id} 
                    onClick={() => isAvailable && startExam(exam)} 
                    className={`group relative bg-white/5 backdrop-blur-lg rounded-3xl p-6 transition-all duration-300 ${
                      isAvailable ? "hover:bg-white/10 hover:-translate-y-1 cursor-pointer" : "opacity-60 cursor-not-allowed grayscale"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-black/20 rounded-2xl flex items-center justify-center">
                        {isAvailable ? <FaClipboardList className="text-3xl text-blue-400"/> : <FaLock className="text-3xl text-red-400"/>}
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${isAvailable ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {isAvailable ? "متاح" : "مغلق"}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{exam.subject}</h3>
                    <p className="text-gray-400 text-sm mb-6">{exam.title}</p>
                    {!isAvailable && <p className="text-red-400 text-[10px] font-bold animate-pulse">انتهى وقت التقديم.</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full animate-fadeIn">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl p-4 mb-8 flex items-center justify-between rounded-2xl">
               <button onClick={resetAll} className="bg-white/10 p-3 rounded-xl"><FaArrowLeft /></button>
               <div className="text-center">
                  <h2 className="text-lg font-bold line-clamp-1">{selectedExam.subject}</h2>
                  {!showResult && <div className="text-blue-400 font-mono text-sm font-bold">{formatTime(timeElapsed)}</div>}
               </div>
               <div className="w-20 md:w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}></div>
               </div>
            </div>

            {/* نظام عرض النتيجة وتصحيح الإجابات */}
            {showResult && (
              <div className="mb-12 text-center animate-scaleIn bg-white/5 p-8 rounded-3xl">
                    <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${percentageValue >= 75 ? 'from-yellow-400 to-orange-500' : 'from-gray-600 to-gray-700'} rounded-full flex items-center justify-center mb-6`}>
                       {percentageValue >= 75 ? <FaTrophy className="text-4xl text-white"/> : <FaMedal className="text-4xl text-gray-300"/>}
                    </div>
                    <h2 className="text-4xl font-black mb-4">{percentageValue.toFixed(0)}%</h2>
                    <div className="flex justify-center gap-4">
                        <div className="bg-green-500/20 px-6 py-3 rounded-xl text-green-400 font-bold">صح: {score}</div>
                        <div className="bg-red-500/20 px-6 py-3 rounded-xl text-red-400 font-bold">خطأ: {totalQuestions - score}</div>
                    </div>
                    <button onClick={() => startExam(selectedExam)} className="mt-8 bg-blue-600 px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"><FaRedo /> إعادة</button>
              </div>
            )}

            {/* قائمة الأسئلة */}
            <div className="space-y-6 pb-20">
              {selectedExam.questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8">
                  <h3 className="text-xl font-bold mb-6">{qIndex + 1}. {q.question}</h3>
                  <div className="space-y-4">
                     {q.options.map((option, optIndex) => {
                        let btnClass = "bg-black/20 hover:bg-white/10";
                        let icon = null;

                        // منطق الألوان بعد التسليم
                        if (showResult) {
                          if (optIndex === q.correct) {
                            btnClass = "bg-green-500/20 text-green-300 border border-green-500/30";
                            icon = <FaCheckCircle className="text-green-400" />;
                          } else if (userAnswers[qIndex] === optIndex) {
                            btnClass = "bg-red-500/20 text-red-300 border border-red-500/30";
                            icon = <FaTimesCircle className="text-red-400" />;
                          } else {
                            btnClass = "opacity-30";
                          }
                        } else if (userAnswers[qIndex] === optIndex) {
                          btnClass = "bg-blue-500/20 border border-blue-500/40";
                        }

                        return (
                          <div 
                            key={optIndex} 
                            onClick={() => handleSelect(qIndex, optIndex)}
                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${btnClass}`}
                          >
                            <span>{option}</span>
                            {icon}
                          </div>
                        );
                     })}
                  </div>
                </div>
              ))}
            </div>

            {!showResult && (
              <button onClick={submitExam} className="fixed bottom-8 left-4 right-4 md:relative md:bottom-0 w-full py-5 rounded-2xl font-bold text-xl bg-blue-600 shadow-2xl">
                تسليم الإجابات ({answeredCount}/{totalQuestions})
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes confetti { 0% { transform: translateY(-10vh) rotate(0deg); } 100% { transform: translateY(100vh) rotate(720deg); } }
        .animate-confetti { animation: confetti 4s linear infinite; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
