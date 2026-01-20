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
    let calculatedScore = 0;
    selectedExam.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) calculatedScore++;
    });
    
    setScore(calculatedScore);
    setShowResult(true);
    setIsExamStarted(false);
    
    const percentage = (calculatedScore / selectedExam.questions.length) * 100;

    if (user) {
      try {
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
      } catch (e) { console.error(e); }
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
        <p className="animate-pulse font-bold">جاري تحميل منصة الامتحانات...</p>
      </div>
    );
  }

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = selectedExam?.questions.length || 0;
  const finalPercentage = selectedExam ? (score / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen w-full text-white p-2 md:p-4 font-sans relative overflow-hidden bg-[#0a0a0a]" dir="rtl">
      
      {/* الخلفية القديمة */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-3 h-3 rounded-full animate-confetti" 
              style={{ 
                left: `${Math.random() * 100}%`, 
                backgroundColor: ['#3b82f6', '#06b6d4', '#a855f7', '#eab308'][Math.floor(Math.random() * 4)], 
                animationDelay: `${Math.random() * 3}s`, 
                animationDuration: `${3 + Math.random() * 2}s` 
              }}
            ></div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto">
        {!selectedExam ? (
          <div className="w-full animate-fadeIn">
            <div className="text-center mb-6 pt-4">
              <h1 className="text-3xl md:text-6xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  منصة الامتحانات
              </h1>
              <p className="text-gray-400 text-sm md:text-lg">
                  أهلاً بك يا <span className="text-blue-400 font-bold">{user?.name}</span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {exams.map((exam, idx) => {
                const isAvailable = exam.active !== false; 
                return (
                  <div 
                    key={exam.id} 
                    onClick={() => isAvailable && startExam(exam)} 
                    // تم إزالة الحدود (border) هنا
                    className={`group relative h-full bg-white/5 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 transition-all duration-500 ${
                      isAvailable ? "hover:bg-white/10 hover:-translate-y-2 cursor-pointer" : "opacity-60 cursor-not-allowed grayscale"
                    }`}
                  >
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-black/20 rounded-xl flex items-center justify-center">
                          {isAvailable ? <FaClipboardList className="text-2xl md:text-3xl text-blue-400"/> : <FaLock className="text-2xl md:text-3xl text-red-400"/>}
                        </div>
                        <span className={`text-[10px] md:text-xs font-black px-3 py-1 rounded-full ${isAvailable ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {isAvailable ? "متاح" : "مغلق"}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-2xl font-bold text-white mb-2">{exam.subject}</h3>
                      <p className="text-gray-400 text-xs md:text-sm mb-6 line-clamp-2">{exam.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full animate-fadeIn">
            {/* Header Sticky - إزالة الحدود الخارجية */}
            <div className="sticky top-2 z-40 bg-white/5 backdrop-blur-2xl p-4 mb-6 flex items-center justify-between rounded-xl md:rounded-[2rem]">
               <button onClick={resetAll} className="bg-white/10 p-2 md:p-4 rounded-lg md:rounded-2xl transition-all text-white"><FaArrowLeft /></button>
               <div className="text-center">
                  <h2 className="text-sm md:text-xl font-bold text-white">{selectedExam.subject}</h2>
                  {!showResult && <div className="text-blue-400 font-mono text-xs md:text-lg font-black">{formatTime(timeElapsed)}</div>}
               </div>
               <div className="w-16 md:w-40 h-1.5 md:h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}></div>
               </div>
            </div>

            {showResult && (
              <div className="mb-8 text-center animate-scaleIn bg-white/5 p-6 md:p-10 rounded-2xl md:rounded-[3rem]">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4">{finalPercentage.toFixed(0)}%</h2>
                    <div className="flex justify-center gap-4">
                        <div className="bg-green-500/10 px-4 md:px-8 py-2 md:py-4 rounded-xl text-green-400 font-black text-sm md:text-xl">صح: {score}</div>
                        <div className="bg-red-500/10 px-4 md:px-8 py-2 md:py-4 rounded-xl text-red-400 font-black text-sm md:text-xl">خطأ: {totalQuestions - score}</div>
                    </div>
                    <button onClick={() => startExam(selectedExam)} className="mt-6 bg-blue-600 px-6 py-2 rounded-xl font-black flex items-center gap-2 mx-auto"><FaRedo /> إعادة</button>
              </div>
            )}

            {/* قائمة الأسئلة - تعديل هنا لإزالة الحواف */}
            <div className="space-y-4 md:space-y-8 pb-32 px-1 md:px-0">
              {selectedExam.questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-white/5 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] p-5 md:p-10">
                  <div className="flex gap-3 md:gap-6 mb-6">
                       <span className="flex-shrink-0 w-8 h-8 md:w-14 md:h-14 bg-blue-500/20 rounded-lg md:rounded-2xl flex items-center justify-center font-black text-blue-400 text-sm md:text-xl">{qIndex + 1}</span>
                       <h3 className="text-base md:text-3xl font-bold text-white leading-tight">{q.question}</h3>
                  </div>
                  <div className="space-y-3 md:mr-20">
                     {q.options.map((option, optIndex) => {
                        let btnClass = "bg-white/5"; // إزالة border-white/5 الافتراضي
                        let icon = null;

                        if (showResult) {
                          if (optIndex === q.correct) {
                            btnClass = "bg-green-500/20 text-green-200 shadow-lg shadow-green-500/10";
                            icon = <FaCheckCircle className="text-green-400 text-lg md:text-2xl" />;
                          } else if (userAnswers[qIndex] === optIndex) {
                            btnClass = "bg-red-500/20 text-red-200";
                            icon = <FaTimesCircle className="text-red-400 text-lg md:text-2xl" />;
                          } else {
                            btnClass = "opacity-30 grayscale pointer-events-none";
                          }
                        } else if (userAnswers[qIndex] === optIndex) {
                          btnClass = "bg-blue-600/30 text-blue-100 shadow-xl shadow-blue-500/10";
                        }

                        return (
                          <div 
                            key={optIndex} 
                            onClick={() => handleSelect(qIndex, optIndex)}
                            // تم إزالة border-2 هنا والاكتفاء بالخلفية
                            className={`flex items-center justify-between p-4 md:p-6 rounded-xl md:rounded-[1.5rem] cursor-pointer transition-all duration-300 font-bold text-sm md:text-lg ${btnClass}`}
                          >
                            <span className="flex-1">{option}</span>
                            {icon}
                          </div>
                        );
                     })}
                  </div>
                </div>
              ))}
            </div>

            {!showResult && (
              <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-50">
                <button 
                  onClick={submitExam} 
                  disabled={answeredCount === 0}
                  className="w-full py-4 md:py-6 rounded-xl md:rounded-[2rem] font-black text-lg md:text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl transition-all active:scale-95"
                >
                  تسليم ({answeredCount}/{totalQuestions})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes confetti { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        .animate-confetti { animation: confetti 4s linear infinite; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
