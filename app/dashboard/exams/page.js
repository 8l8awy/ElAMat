"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { FaCheckCircle, FaTimesCircle, FaClipboardList, FaArrowLeft, FaRedo, FaSpinner, FaClock, FaTrophy, FaChartLine, FaFire, FaStar, FaBook, FaGraduationCap } from "react-icons/fa";

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAll = () => {
    setSelectedExam(null);
    setUserAnswers({});
    setShowResult(false);
    setIsExamStarted(false);
    setTimeElapsed(0);
  };

  const percentage = selectedExam ? (score / selectedExam.questions.length) * 100 : 0;
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = selectedExam?.questions.length || 0;

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-transparent border-t-blue-500 border-r-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <FaGraduationCap className="text-3xl text-blue-400 animate-bounce"/>
          </div>
        </div>
        <p className="mt-8 text-xl text-gray-300 font-semibold animate-pulse">جاري تحميل الامتحانات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white relative overflow-hidden" dir="rtl">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-10">
        {!selectedExam ? (
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="text-center mb-16 animate-fadeIn">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative w-28 h-28 bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-300">
                  <FaGraduationCap className="text-5xl text-white"/>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent animate-gradient">
                منصة الامتحانات الذكية
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                اختبر نفسك، تحدّى قدراتك، وحقق النجاح مع أفضل تجربة تعليمية تفاعلية
              </p>
              
              {/* Stats bar */}
              <div className="flex flex-wrap justify-center gap-6 mt-10">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl px-8 py-4 flex items-center gap-3 hover:border-blue-500/50 transition-all hover:scale-105">
                  <FaBook className="text-3xl text-blue-400"/>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">{exams.length}</p>
                    <p className="text-sm text-gray-400">امتحان متاح</p>
                  </div>
                </div>
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl px-8 py-4 flex items-center gap-3 hover:border-cyan-500/50 transition-all hover:scale-105">
                  <FaFire className="text-3xl text-orange-400"/>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">∞</p>
                    <p className="text-sm text-gray-400">محاولات لا نهائية</p>
                  </div>
                </div>
              </div>
            </div>

            {exams.length === 0 ? (
              <div className="max-w-2xl mx-auto">
                <div className="relative bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-800 rounded-3xl p-20 text-center overflow-hidden group hover:border-slate-700 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <FaClipboardList className="text-6xl text-slate-600"/>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-300 mb-4">لا توجد امتحانات متاحة حالياً</h3>
                    <p className="text-gray-500 text-lg">سيتم إضافة امتحانات جديدة ومثيرة قريباً!</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">اختر امتحانك</h2>
                  <p className="text-gray-400">انقر على أي امتحان للبدء فوراً</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exams.map((exam, idx) => (
                    <div 
                      key={exam.id} 
                      onClick={() => startExam(exam)} 
                      className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 hover:border-transparent rounded-3xl p-8 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl overflow-hidden animate-fadeIn"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* Animated gradient border on hover */}
                      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 p-[2px]">
                        <div className="w-full h-full bg-slate-900 rounded-3xl"></div>
                      </div>
                      
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-3xl transition-all duration-500"></div>
                      
                      {/* Side accent */}
                      <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-blue-500 via-cyan-500 to-purple-500 rounded-r-3xl"></div>
                      
                      <div className="relative z-10">
                        {/* Icon with animation */}
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                          <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <FaClipboardList className="text-3xl text-blue-400"/>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-2xl font-black mb-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all">
                              {exam.subject}
                            </h3>
                            <p className="text-gray-400 text-sm line-clamp-2 h-10 group-hover:text-gray-300 transition-colors">
                              {exam.title}
                            </p>
                          </div>
                          
                          {/* Info badges */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 bg-slate-800/80 group-hover:bg-slate-800 px-4 py-2 rounded-xl text-sm text-gray-300 border border-slate-700 group-hover:border-blue-500/50 transition-all">
                              <FaClipboardList className="text-blue-400"/>
                              <span className="font-bold">{exam.questions?.length || 0}</span>
                              <span>سؤال</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-4 py-2 rounded-xl text-sm border border-blue-500/30">
                              <FaStar className="text-yellow-400"/>
                              <span className="font-semibold text-blue-400">جديد</span>
                            </div>
                          </div>
                        </div>

                        {/* Hover arrow indicator */}
                        <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">←</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Sticky Enhanced Exam Header */}
            <div className="sticky top-4 z-50 mb-8 animate-fadeIn">
              <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <FaBook className="text-white"/>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-white">
                        {selectedExam.subject}
                      </h2>
                    </div>
                    <p className="text-gray-400 mr-13">{selectedExam.title}</p>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    {isExamStarted && !showResult && (
                      <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-xl">
                        <FaClock className="text-blue-400 animate-pulse"/>
                        <span className="font-mono text-xl font-bold text-blue-400">{formatTime(timeElapsed)}</span>
                      </div>
                    )}
                    
                    <button 
                      onClick={resetAll} 
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white px-5 py-3 rounded-xl transition-all hover:scale-105 font-semibold border border-slate-700 hover:border-slate-600"
                    >
                      <FaArrowLeft />
                      <span className="hidden md:inline">خروج</span>
                    </button>
                  </div>
                </div>

                {/* Enhanced Progress Bar */}
                {!showResult && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <FaChartLine className="text-cyan-400"/>
                        <span className="text-sm font-semibold text-gray-300">التقدم</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg">
                        <span className="text-2xl font-black text-white">{answeredCount}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-lg font-semibold text-gray-400">{totalQuestions}</span>
                      </div>
                    </div>
                    <div className="relative w-full bg-slate-800/50 rounded-full h-4 overflow-hidden border border-slate-700">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 transition-all duration-500 rounded-full relative overflow-hidden"
                        style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                      </div>
                      {answeredCount === totalQuestions && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaCheckCircle className="text-white text-xl animate-bounce"/>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Results Card */}
            {showResult && (
              <div className="mb-10 animate-scaleIn">
                <div className={`relative rounded-3xl p-10 text-center overflow-hidden border-2 ${
                  percentage >= 90 ? 'bg-gradient-to-br from-emerald-900/40 via-green-900/40 to-emerald-900/40 border-emerald-500' :
                  percentage >= 75 ? 'bg-gradient-to-br from-blue-900/40 via-cyan-900/40 to-blue-900/40 border-blue-500' :
                  percentage >= 50 ? 'bg-gradient-to-br from-yellow-900/40 via-orange-900/40 to-yellow-900/40 border-yellow-500' :
                  'bg-gradient-to-br from-red-900/40 via-pink-900/40 to-red-900/40 border-red-500'
                }`}>
                  {/* Confetti effect for high scores */}
                  {percentage >= 75 && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-confetti"
                          style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${2 + Math.random() * 2}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  )}

                  {/* Trophy with glow */}
                  <div className="relative inline-block mb-6">
                    <div className={`absolute inset-0 rounded-full blur-2xl ${
                      percentage >= 75 ? 'bg-yellow-400/50 animate-pulse' : 'bg-slate-600/30'
                    }`}></div>
                    <div className={`relative w-28 h-28 rounded-full flex items-center justify-center ${
                      percentage >= 90 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                      percentage >= 75 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                      percentage >= 50 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
                      'bg-gradient-to-br from-slate-600 to-slate-700'
                    } shadow-2xl`}>
                      <FaTrophy className="text-5xl text-white"/>
                    </div>
                  </div>

                  {/* Result text */}
                  <h3 className="text-4xl md:text-5xl font-black mb-6 text-white">
                    {percentage >= 90 ? "🎉 أداء استثنائي!" : 
                     percentage >= 75 ? "⭐ ممتاز جداً!" : 
                     percentage >= 50 ? "👍 جيد جداً!" : 
                     "💪 واصل التدريب!"}
                  </h3>
                  
                  {/* Score display */}
                  <div className="flex items-center justify-center gap-8 mb-8">
                    <div className="text-center">
                      <p className="text-8xl md:text-9xl font-black text-white mb-2 animate-countUp">{score}</p>
                      <p className="text-gray-300 text-lg">من {selectedExam.questions.length}</p>
                    </div>
                  </div>

                  {/* Percentage badge */}
                  <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border-2 border-white/20 px-8 py-4 rounded-2xl mb-8">
                    <FaChartLine className="text-3xl"/>
                    <span className="text-5xl font-black">{percentage.toFixed(0)}%</span>
                  </div>

                  {/* Time badge */}
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <FaClock className="text-xl text-gray-300"/>
                    <span className="text-gray-300">الوقت المستغرق: </span>
                    <span className="font-mono text-xl font-bold text-white">{formatTime(timeElapsed)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => startExam(selectedExam)} 
                      className="bg-white hover:bg-gray-100 text-slate-900 px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl text-lg"
                    >
                      <FaRedo />
                      <span>إعادة المحاولة</span>
                    </button>
                    <button 
                      onClick={resetAll} 
                      className="bg-slate-800/80 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all flex items-center justify-center gap-3 border-2 border-slate-700 text-lg"
                    >
                      <FaArrowLeft />
                      <span>العودة للقائمة</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Questions */}
            <div className="space-y-6">
              {selectedExam.questions.map((q, qIndex) => {
                const isCorrectAnswer = userAnswers[qIndex] === q.correct;
                const isAnswered = userAnswers.hasOwnProperty(qIndex);
                
                return (
                  <div 
                    key={qIndex} 
                    className={`relative bg-slate-900/50 backdrop-blur-xl border rounded-3xl p-8 transition-all duration-500 animate-fadeIn ${
                      showResult && isCorrectAnswer ? 'border-green-500/50 shadow-lg shadow-green-500/20' :
                      showResult && !isCorrectAnswer && isAnswered ? 'border-red-500/50 shadow-lg shadow-red-500/20' :
                      isAnswered ? 'border-blue-500/50 shadow-lg shadow-blue-500/20' :
                      'border-slate-800 hover:border-slate-700'
                    }`}
                    style={{ animationDelay: `${qIndex * 100}ms` }}
                  >
                    {/* Question number badge with gradient */}
                    <div className="flex items-start gap-5 mb-6">
                      <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-50"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center font-black text-xl shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all">
                          {qIndex + 1}
                        </div>
                      </div>
                      
                      {/* Question text */}
                      <h3 className="flex-1 text-xl md:text-2xl font-bold text-white leading-relaxed pt-3">
                        {q.question}
                      </h3>
                      
                      {/* Result badge */}
                      {showResult && isAnswered && (
                        <div className="flex-shrink-0">
                          {isCorrectAnswer ? (
                            <div className="w-12 h-12 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center animate-bounce">
                              <FaCheckCircle className="text-green-400 text-2xl"/>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-red-500/20 border-2 border-red-500 rounded-full flex items-center justify-center animate-shake">
                              <FaTimesCircle className="text-red-400 text-2xl"/>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Options with enhanced styling */}
                    <div className="space-y-4 mr-20">
                      {q.options.map((option, optIndex) => {
                        let optionClass = "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/80 hover:scale-[1.02]";
                        let iconElement = null;
                        
                        if (showResult) {
                          if (optIndex === q.correct) {
                            optionClass = "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500 shadow-xl shadow-green-500/30 scale-[1.02]";
                            iconElement = (
                              <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-green-400 text-xl"/>
                                <span className="text-xs font-bold text-green-400 bg-green-500/20 px-2 py-1 rounded-lg">صحيح</span>
                              </div>
                            );
                          } else if (userAnswers[qIndex] === optIndex) {
                            optionClass = "bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500 shadow-xl shadow-red-500/30";
                            iconElement = (
                              <div className="flex items-center gap-2">
                                <FaTimesCircle className="text-red-400 text-xl"/>
                                <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded-lg">خاطئ</span>
                              </div>
                            );
                          } else {
                            optionClass = "bg-slate-800/30 border-slate-800 opacity-40";
                          }
                        } else if (userAnswers[qIndex] === optIndex) {
                          optionClass = "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500 shadow-xl shadow-blue-500/30 scale-[1.02]";
                          iconElement = <div className="w-4 h-4 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>;
                        }
                        
                        return (
                          <div 
                            key={optIndex} 
                            onClick={() => handleSelect(qIndex, optIndex)} 
                            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between group overflow-hidden ${optionClass}`}
                          >
                            <span className="font-semibold text-lg relative z-10">{option}</span>
                            {iconElement && <div className="mr-3 relative z-10">{iconElement}</div>}
                            
                            {/* Hover effect */}
                            {!showResult && (
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Enhanced Submit button */}
            {!showResult && (
              <div className="mt-12 animate-fadeIn">
                <button 
                  onClick={submitExam} 
                  disabled={answeredCount === 0}
                  className={`w-full relative overflow-hidden font-black py-6 rounded-2xl text-xl transition-all duration-300 ${
                    answeredCount === 0 
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-[1.02]'
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {answeredCount === totalQuestions ? (
                      <>
                        <FaCheckCircle className="text-2xl"/>
                        <span>تسليم الإجابات ({answeredCount}/{totalQuestions})</span>
                      </>
                    ) : (
                      <>
                        <FaClipboardList className="text-2xl"/>
                        <span>تسليم ({answeredCount}/{totalQuestions})</span>
                      </>
                    )}
                  </span>
                  {answeredCount > 0 && (
                    <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                  )}
                </button>
                
                {answeredCount < totalQuestions && (
                  <p className="text-center text-gray-400 mt-4 text-sm">
                    💡 لا تنسى الإجابة على جميع الأسئلة قبل التسليم
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-confetti {
          animation: confetti linear infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        @keyframes countUp {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-countUp {
          animation: countUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
