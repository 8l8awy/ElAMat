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
    <div className="min-h-screen w-full text-white p-4 font-sans relative overflow-hidden bg-[#0a0a0a]" dir="rtl">
      
      {/* إعادة الخلفية القديمة الفخمة */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>

      {/* تصحيح كود الـ Confetti لتجنب خطأ الـ Build */}
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
            <div className="text-center mb-10 pt-6">
              <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
                  منصة الامتحانات
              </h1>
              <p className="text-gray-400 text-lg">
                  أهلاً بك يا <span className="text-blue-400 font-bold">{user?.name}</span>، اختر مادتك وابدأ التحدي!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam, idx) => {
                const isAvailable = exam.active !== false; 
                return (
                  <div 
                    key={exam.id} 
                    onClick={() => isAvailable && startExam(exam)} 
                    className={`group relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 transition-all duration-500 ${
                      isAvailable ? "hover:bg-white/10 hover:-translate-y-2 cursor-pointer shadow-2xl hover:shadow-blue-500/10" : "opacity-60 cursor-not-allowed grayscale"
                    }`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-16 h-16 bg-black/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          {isAvailable ? <FaClipboardList className="text-3xl text-blue-400"/> : <FaLock className="text-3xl text-red-400"/>}
                        </div>
                        <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider ${isAvailable ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {isAvailable ? "متاح للتقديم" : "مغلق حالياً"}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{exam.subject}</h3>
                      <p className="text-gray-400 text-sm mb-8 leading-relaxed line-clamp-2">{exam.title}</p>
                      
                      <div className="mt-auto flex items-center gap-3">
                          <div className="flex-1 bg-white/5 py-3 rounded-2xl text-xs font-bold text-gray-300 flex items-center justify-center gap-2">
                              <FaClipboardList /> <span>{exam.questions?.length || 0} سؤال</span>
                          </div>
                          <div className="flex-1 bg-white/5 py-3 rounded-2xl text-xs font-bold text-gray-300 flex items-center justify-center gap-2">
                              <FaClock /> <span>{exam.questions?.length * 2} دقيقة</span>
                          </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full animate-fadeIn">
            {/* Header Sticky */}
            <div className="sticky top-4 z-40 bg-white/10 backdrop-blur-2xl border border-white/10 p-5 mb-10 flex items-center justify-between rounded-[2rem] shadow-2xl">
               <button onClick={resetAll} className="bg-white/10 hover:bg-red-500/20 p-4 rounded-2xl transition-all text-white"><FaArrowLeft /></button>
               <div className="text-center">
                  <h2 className="text-xl font-bold text-white mb-1">{selectedExam.subject}</h2>
                  {!showResult && <div className="text-blue-400 font-mono text-lg font-black tracking-widest">{formatTime(timeElapsed)}</div>}
               </div>
               <div className="hidden md:block w-40 h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700" style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}></div>
               </div>
            </div>

            {/* النتيجة وتصحيح الإجابات */}
            {showResult && (
              <div className="mb-12 text-center animate-scaleIn bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
                    <div className={`w-28 h-28 mx-auto bg-gradient-to-br ${finalPercentage >= 75 ? 'from-yellow-400 to-orange-500 shadow-yellow-500/20' : 'from-gray-600 to-gray-700 shadow-gray-500/20'} rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce`}>
                       {finalPercentage >= 75 ? <FaTrophy className="text-5xl text-white"/> : <FaMedal className="text-5xl text-gray-300"/>}
                    </div>
                    <h2 className="text-6xl font-black text-white mb-6 tracking-tighter">{finalPercentage.toFixed(0)}%</h2>
                    <div className="flex justify-center gap-6">
                        <div className="bg-green-500/10 border border-green-500/20 px-8 py-4 rounded-[1.5rem] text-green-400 font-black text-xl">صح: {score}</div>
                        <div className="bg-red-500/10 border border-red-500/20 px-8 py-4 rounded-[1.5rem] text-red-400 font-black text-xl">خطأ: {totalQuestions - score}</div>
                    </div>
                    <button onClick={() => startExam(selectedExam)} className="mt-10 bg-blue-600 hover:bg-blue-500 px-12 py-4 rounded-[1.5rem] font-black text-lg transition-all shadow-xl hover:shadow-blue-600/30 flex items-center gap-3 mx-auto">
                        <FaRedo /> حاول مرة أخرى
                    </button>
              </div>
            )}

            {/* قائمة الأسئلة */}
            <div className="space-y-8 pb-32">
              {selectedExam.questions.map((q, qIndex) => (
                <div key={qIndex} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 transition-all duration-500">
                  <div className="flex gap-6 mb-8">
                       <span className="flex-shrink-0 w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center font-black text-blue-400 text-xl border border-blue-500/20">{qIndex + 1}</span>
                       <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight pt-2">{q.question}</h3>
                  </div>
                  <div className="space-y-4 md:mr-20">
                     {q.options.map((option, optIndex) => {
                        let btnClass = "bg-white/5 hover:bg-white/10 border-white/5";
                        let icon = null;

                        if (showResult) {
                          if (optIndex === q.correct) {
                            btnClass = "bg-green-500/20 text-green-200 border-green-500/40 scale-[1.02] shadow-lg shadow-green-500/10";
                            icon = <FaCheckCircle className="text-green-400 text-2xl" />;
                          } else if (userAnswers[qIndex] === optIndex) {
                            btnClass = "bg-red-500/20 text-red-200 border-red-500/40";
                            icon = <FaTimesCircle className="text-red-400 text-2xl" />;
                          } else {
                            btnClass = "opacity-30 grayscale pointer-events-none";
                          }
                        } else if (userAnswers[qIndex] === optIndex) {
                          btnClass = "bg-blue-600/30 border-blue-400/50 text-blue-100 scale-[1.02] shadow-xl shadow-blue-500/10";
                        }

                        return (
                          <div 
                            key={optIndex} 
                            onClick={() => handleSelect(qIndex, optIndex)}
                            className={`flex items-center justify-between p-6 rounded-[1.5rem] cursor-pointer transition-all duration-300 border-2 font-bold text-lg ${btnClass}`}
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
              <div className="fixed bottom-10 left-4 right-4 max-w-4xl mx-auto z-50">
                <button 
                  onClick={submitExam} 
                  disabled={answeredCount === 0}
                  className={`w-full py-6 rounded-[2rem] font-black text-2xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
                    answeredCount === totalQuestions 
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white" 
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  }`}
                >
                  <FaCheckCircle className={answeredCount === totalQuestions ? "animate-bounce" : ""} />
                  <span>تأكيد وتسليم الامتحان ({answeredCount}/{totalQuestions})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes confetti { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        .animate-confetti { animation: confetti 4s linear infinite; }
        .animate-fadeIn { animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-scaleIn { animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
