"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { FaCheckCircle, FaTimesCircle, FaClipboardList, FaArrowLeft, FaRedo, FaClock, FaTrophy, FaChartLine, FaFire, FaStar, FaBook, FaGraduationCap, FaBolt, FaMedal, FaAward } from "react-icons/fa";

export default function ExamsPage() {
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

  const submitExam = () => {
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
    if (percentage >= 75) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
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

  const percentage = selectedExam ? (score / selectedExam.questions.length) * 100 : 0;
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = selectedExam?.questions.length || 0;

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900">
        <FaGraduationCap className="text-6xl text-blue-400 animate-bounce mb-4"/>
        <p className="text-white text-xl animate-pulse">جاري تحميل الامتحانات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden font-sans" dir="rtl">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]"></div>
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

      <div className="relative z-10 p-4 md:p-8 lg:p-10">
        {!selectedExam ? (
          <div className="max-w-7xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-block p-4 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 mb-6 backdrop-blur-md">
                <FaGraduationCap className="text-5xl md:text-7xl text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"/>
              </div>
              
              <h1 className="text-4xl md:text-7xl font-black mb-4 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                  El Agamy Materials 
              </h1>
              <p className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  منصة الامتحانات الذكية، اختبر معلوماتك الآن! 🚀
              </p>
            </div>

            {/* Exams Grid */}
            {exams.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-700">
                <FaClipboardList className="text-6xl text-slate-600 mx-auto mb-4"/>
                <h3 className="text-2xl font-bold text-gray-400">لا توجد امتحانات متاحة حالياً</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam, idx) => (
                  <div 
                    key={exam.id} 
                    onClick={() => startExam(exam)} 
                    className="group relative cursor-pointer bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/20"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <FaClipboardList className="text-2xl text-white"/>
                      </div>
                      <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">جديد</span>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-1">{exam.subject}</h3>
                    <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">{exam.title}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 bg-black/20 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                         <FaClipboardList className="text-blue-400"/>
                         <span>{exam.questions?.length || 0} سؤال</span>
                      </div>
                      <div className="w-px h-4 bg-gray-700"></div>
                      <div className="flex items-center gap-2">
                         <FaClock className="text-purple-400"/>
                         <span>مفتوح</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            {/* Exam Header */}
            <div className="sticky top-2 z-40 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-4 w-full md:w-auto">
                 <button onClick={resetAll} className="bg-slate-800 p-3 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-colors">
                    <FaArrowLeft />
                 </button>
                 <div>
                    <h2 className="text-lg md:text-xl font-bold text-white">{selectedExam.subject}</h2>
                    {!showResult && (
                        <div className="flex items-center gap-2 text-blue-400 font-mono text-lg font-bold">
                            <FaClock />
                            <span>{formatTime(timeElapsed)}</span>
                        </div>
                    )}
                 </div>
               </div>

               {!showResult && (
                   <div className="w-full md:w-64">
                       <div className="flex justify-between text-xs text-gray-400 mb-1">
                           <span>التقدم</span>
                           <span>{answeredCount} / {totalQuestions}</span>
                       </div>
                       <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                             style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                           ></div>
                       </div>
                   </div>
               )}
            </div>

            {/* Results Section */}
            {showResult && (
              <div className="mb-10 text-center animate-scaleIn">
                 <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5"></div>
                    
                    <div className="relative inline-block mb-6">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-bounce">
                           <FaTrophy className="text-6xl text-white"/>
                        </div>
                        {percentage >= 90 && <FaStar className="absolute top-0 right-0 text-4xl text-yellow-300 animate-pulse"/>}
                    </div>

                    <h2 className="text-4xl md:text-5xl font-black text-white mb-2">
                        {percentage >= 90 ? "أسطوري! 🏆" : percentage >= 50 ? "عمل رائع! 💪" : "حاول مرة أخرى 😅"}
                    </h2>
                    <p className="text-gray-400 text-lg mb-8">لقد أجبت على {score} من أصل {totalQuestions} بشكل صحيح</p>

                    <div className="flex justify-center gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-2xl min-w-[100px]">
                            <span className="block text-3xl font-bold text-white">{score}</span>
                            <span className="text-sm text-green-400">صحيح</span>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-2xl min-w-[100px]">
                            <span className="block text-3xl font-bold text-white">{totalQuestions - score}</span>
                            <span className="text-sm text-red-400">خطأ</span>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-2xl min-w-[100px]">
                            <span className="block text-3xl font-bold text-blue-400">{percentage.toFixed(0)}%</span>
                            <span className="text-sm text-blue-300">النسبة</span>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center mt-8">
                        <button onClick={() => startExam(selectedExam)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-600/30 flex items-center gap-2">
                            <FaRedo /> إعادة الامتحان
                        </button>
                        <button onClick={resetAll} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-all">
                            خروج
                        </button>
                    </div>
                 </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {selectedExam.questions.map((q, qIndex) => {
                const isCorrect = userAnswers[qIndex] === q.correct;
                const isAnswered = userAnswers.hasOwnProperty(qIndex);
                
                // تحديد لون الحدود بناءً على الحالة
                let borderColor = "border-slate-800";
                if (showResult) {
                    if (isCorrect) borderColor = "border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.1)]";
                    else if (isAnswered) borderColor = "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]";
                } else if (isAnswered) {
                    borderColor = "border-blue-500/50";
                }

                return (
                  <div key={qIndex} className={`bg-slate-900/60 backdrop-blur-sm border-2 ${borderColor} rounded-3xl p-5 md:p-8 transition-all duration-300`}>
                    
                    {/* نص السؤال - تم تحسينه للموبايل */}
                    <div className="flex gap-4 mb-6">
                       <span className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-blue-400 border border-slate-700">
                         {qIndex + 1}
                       </span>
                       <h3 className="text-lg md:text-2xl font-bold text-white leading-relaxed pt-1">
                         {q.question}
                       </h3>
                    </div>

                    {/* الخيارات - تم تحسين الهوامش */}
                    <div className="space-y-3 mr-0 md:mr-16"> {/* 👈 التعديل السحري هنا */}
                       {q.options.map((option, optIndex) => {
                          let btnClass = "bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600";
                          let icon = <span className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-sm font-bold text-gray-400">{String.fromCharCode(65 + optIndex)}</span>;

                          if (showResult) {
                             if (optIndex === q.correct) {
                                btnClass = "bg-green-500/10 border-green-500/50 text-green-100";
                                icon = <FaCheckCircle className="text-green-400 text-xl"/>;
                             } else if (userAnswers[qIndex] === optIndex) {
                                btnClass = "bg-red-500/10 border-red-500/50 text-red-100";
                                icon = <FaTimesCircle className="text-red-400 text-xl"/>;
                             } else {
                                btnClass = "opacity-50 border-transparent";
                             }
                          } else if (userAnswers[qIndex] === optIndex) {
                             btnClass = "bg-blue-500/20 border-blue-500 text-blue-100 shadow-lg shadow-blue-900/20";
                             icon = <div className="w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>;
                          }

                          return (
                            <div 
                              key={optIndex}
                              onClick={() => handleSelect(qIndex, optIndex)}
                              className={`relative flex items-center justify-between p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] ${btnClass}`}
                            >
                               <span className="font-semibold text-base md:text-lg pl-8">{option}</span>
                               <div className="flex-shrink-0 ml-2">
                                  {icon}
                               </div>
                            </div>
                          );
                       })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button */}
            {!showResult && (
              <div className="mt-10 pb-10">
                <button 
                  onClick={submitExam}
                  disabled={answeredCount === 0}
                  className={`w-full py-5 rounded-2xl font-black text-xl shadow-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 ${
                    answeredCount === totalQuestions 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-900/30" 
                    : answeredCount > 0
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-900/30"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {answeredCount === totalQuestions ? <FaCheckCircle className="animate-bounce"/> : <FaClipboardList/>}
                  <span>
                     {answeredCount === totalQuestions ? "تأكيد وتسليم الامتحان" : `تسليم الإجابات (${answeredCount}/${totalQuestions})`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 4s linear infinite; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
