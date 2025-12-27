"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { FaCheckCircle, FaTimesCircle, FaClipboardList, FaArrowLeft, FaRedo, FaSpinner, FaClock, FaTrophy, FaChartLine, FaFire, FaStar, FaBook, FaGraduationCap, FaBolt, FaMedal, FaAward } from "react-icons/fa";

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
        <div className="relative">
          <div className="w-28 h-28 border-[6px] border-transparent border-t-blue-500 border-r-cyan-500 border-b-purple-500 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <FaGraduationCap className="text-4xl text-blue-400 animate-bounce"/>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-2xl text-white font-bold animate-pulse">جاري تحميل الامتحانات</p>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden" dir="rtl">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-cyan-600/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10 animate-grid"></div>
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#3b82f6', '#06b6d4', '#a855f7', '#eab308', '#f59e0b'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      )}

      <div className="relative z-10 p-4 md:p-8 lg:p-10">
        {!selectedExam ? (
          <div className="max-w-7xl mx-auto">
            {/* Ultra Enhanced Header */}
            <div className="text-center mb-20 animate-fadeIn">
              <div className="relative inline-block mb-10">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 rounded-[2rem] blur-3xl opacity-60 animate-pulse"></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 rounded-[2rem] flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-12 transition-all duration-500">
                  <FaGraduationCap className="text-6xl text-white"/>
                </div>
                {/* Orbiting icons */}
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <FaStar className="text-xl text-yellow-900"/>
                </div>
                <div className="absolute -bottom-2 -left-2 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center animate-bounce" style={{animationDelay: '0.3s'}}>
                  <FaFire className="text-xl text-green-900"/>
                </div>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent animate-gradient leading-tight">
                منصة الامتحانات الذكية
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                🚀 اختبر نفسك، تحدّى قدراتك، وحقق النجاح مع أفضل تجربة تعليمية تفاعلية
              </p>
              
              {/* Enhanced stats bar */}
              <div className="flex flex-wrap justify-center gap-6 mt-12">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-slate-900/80 backdrop-blur-2xl border-2 border-blue-500/50 rounded-2xl px-8 py-5 flex items-center gap-4 hover:scale-110 transition-all duration-300">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <FaBook className="text-2xl text-white"/>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-white">{exams.length}</p>
                      <p className="text-sm text-gray-300 font-semibold">امتحان متاح</p>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-slate-900/80 backdrop-blur-2xl border-2 border-orange-500/50 rounded-2xl px-8 py-5 flex items-center gap-4 hover:scale-110 transition-all duration-300">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <FaFire className="text-2xl text-white animate-pulse"/>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-white">∞</p>
                      <p className="text-sm text-gray-300 font-semibold">محاولات مجانية</p>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-slate-900/80 backdrop-blur-2xl border-2 border-purple-500/50 rounded-2xl px-8 py-5 flex items-center gap-4 hover:scale-110 transition-all duration-300">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FaBolt className="text-2xl text-white"/>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-white">100%</p>
                      <p className="text-sm text-gray-300 font-semibold">تفاعلي</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {exams.length === 0 ? (
              <div className="max-w-2xl mx-auto">
                <div className="relative bg-slate-900/50 backdrop-blur-2xl border-2 border-dashed border-slate-700 rounded-[2rem] p-20 text-center overflow-hidden group hover:border-slate-600 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <div className="w-40 h-40 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                      <FaClipboardList className="text-7xl text-slate-600"/>
                    </div>
                    <h3 className="text-4xl font-black text-gray-200 mb-5">لا توجد امتحانات متاحة</h3>
                    <p className="text-gray-400 text-xl">سيتم إضافة امتحانات جديدة ومثيرة قريباً! 🎯</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-black text-white mb-3 flex items-center justify-center gap-3">
                    <FaClipboardList className="text-blue-400"/>
                    اختر امتحانك
                  </h2>
                  <p className="text-gray-300 text-lg">انقر على أي امتحان للبدء فوراً 🚀</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {exams.map((exam, idx) => (
                    <div 
                      key={exam.id} 
                      onClick={() => startExam(exam)} 
                      className="group relative cursor-pointer animate-fadeIn"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* Glow effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"></div>
                      
                      {/* Card */}
                      <div className="relative bg-slate-900/80 backdrop-blur-2xl border-2 border-slate-800 group-hover:border-transparent rounded-[2rem] p-8 overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                        {/* Animated gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 via-cyan-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:via-cyan-600/10 group-hover:to-purple-600/10 transition-all duration-500"></div>
                        
                        {/* Side accent with animation */}
                        <div className="absolute top-0 right-0 w-3 h-full bg-gradient-to-b from-blue-500 via-cyan-500 to-purple-500 rounded-r-[2rem] group-hover:w-full group-hover:opacity-10 transition-all duration-500"></div>
                        
                        <div className="relative z-10">
                          {/* Icon with enhanced animation */}
                          <div className="relative mb-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 rounded-2xl flex items-center justify-center group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                              <FaClipboardList className="text-4xl text-blue-400"/>
                            </div>
                            {/* Badge */}
                            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-3 py-1 flex items-center gap-1 shadow-lg animate-bounce">
                              <FaStar className="text-white text-xs"/>
                              <span className="text-white text-xs font-black">جديد</span>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="space-y-5">
                            <div>
                              <h3 className="text-3xl font-black mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all">
                                {exam.subject}
                              </h3>
                              <p className="text-gray-400 text-base line-clamp-2 h-12 group-hover:text-gray-300 transition-colors leading-relaxed">
                                {exam.title}
                              </p>
                            </div>
                            
                            {/* Info badges */}
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-2 bg-slate-800/80 group-hover:bg-blue-500/20 px-5 py-3 rounded-xl text-sm font-bold text-gray-300 group-hover:text-blue-300 border border-slate-700 group-hover:border-blue-500/50 transition-all">
                                <FaClipboardList className="text-blue-400 text-lg"/>
                                <span>{exam.questions?.length || 0}</span>
                                <span>سؤال</span>
                              </div>
                            </div>
                          </div>

                          {/* Hover arrow with pulse */}
                          <div className="absolute bottom-8 left-8 opacity-0 group-hover:opacity-100 transform translate-x-6 group-hover:translate-x-0 transition-all duration-500">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                              <span className="text-white font-black text-xl">←</span>
                            </div>
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
            {/* Floating Sticky Header */}
            <div className="sticky top-4 z-50 mb-10 animate-fadeIn">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50 rounded-3xl blur-2xl"></div>
                <div className="relative bg-slate-900/90 backdrop-blur-2xl border-2 border-slate-800 rounded-3xl p-6 shadow-2xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex-1 flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <FaBook className="text-white text-2xl"/>
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
                          {selectedExam.subject}
                        </h2>
                        <p className="text-gray-400 text-sm">{selectedExam.title}</p>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 flex-wrap">
                      {isExamStarted && !showResult && (
                        <div className="flex items-center gap-3 bg-blue-500/20 border-2 border-blue-500/50 px-5 py-3 rounded-xl backdrop-blur-xl">
                          <FaClock className="text-blue-400 text-xl animate-pulse"/>
                          <span className="font-mono text-2xl font-black text-blue-300">{formatTime(timeElapsed)}</span>
                        </div>
                      )}
                      
                      <button 
                        onClick={resetAll} 
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white px-6 py-3 rounded-xl transition-all hover:scale-110 font-bold border-2 border-slate-700 hover:border-slate-600 shadow-lg"
                      >
                        <FaArrowLeft className="text-lg"/>
                        <span>خروج</span>
                      </button>
                    </div>
                  </div>

                  {/* Ultra Enhanced Progress Bar */}
                  {!showResult && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <FaChartLine className="text-white"/>
                          </div>
                          <span className="text-lg font-bold text-gray-200">مستوى التقدم</span>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-800/80 px-5 py-2 rounded-xl border border-slate-700">
                          <span className="text-3xl font-black text-white">{answeredCount}</span>
                          <span className="text-xl text-gray-500">/</span>
                          <span className="text-xl font-bold text-gray-400">{totalQuestions}</span>
                        </div>
                      </div>
                      <div className="relative w-full bg-slate-800/70 rounded-full h-5 overflow-hidden border-2 border-slate-700">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 transition-all duration-700 rounded-full relative overflow-hidden"
                          style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                        >
                          <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide"></div>
                        </div>
                        {answeredCount === totalQuestions && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FaCheckCircle className="text-white text-2xl animate-bounce drop-shadow-lg"/>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ultra Enhanced Results Card */}
            {showResult && (
              <div className="mb-12 animate-scaleIn">
                <div className={`relative rounded-[2rem] p-12 text-center overflow-hidden border-4 ${
                  percentage >= 90 ? 'bg-gradient-to-br from-emerald-900/60 via-green-900/60 to-emerald-900/60 border-emerald-400' :
                  percentage >= 75 ? 'bg-gradient-to-br from-blue-900/60 via-cyan-900/60 to-blue-900/60 border-blue-400' :
                  percentage >= 50 ? 'bg-gradient-to-br from-yellow-900/60 via-orange-900/60 to-yellow-900/60 border-yellow-400' :
                  'bg-gradient-to-br from-red-900/60 via-pink-900/60 to-red-900/60 border-red-400'
                } shadow-2xl`}>
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,currentColor_25%,currentColor_50%,transparent_50%,transparent_75%,currentColor_75%,currentColor)] bg-[length:20px_20px] animate-slide"></div>
                  </div>

                  {/* Trophy with mega glow */}
                  <div className="relative inline-block mb-10">
                    <div className={`absolute inset-0 rounded-full blur-3xl animate-pulse ${
                      percentage >= 75 ? 'bg-yellow-400/60' : 'bg-slate-600/40'
                    }`}></div>
                    <div className={`relative w-36 h-36 rounded-full flex items-center justify-center shadow-2xl ${
                      percentage >= 90 ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500' :
                      percentage >= 75 ? 'bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500' :
                      percentage >= 50 ? 'bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-slate-600 to-slate-700'
                    } transform hover:scale-110 hover:rotate-12 transition-all duration-500`}>
                      <FaTrophy className="text-6xl text-white drop-shadow-lg"/>
                    </div>
                    {/* Orbiting medals */}
                    {percentage >= 90 && (
                      <>
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                          <FaMedal className="text-2xl text-yellow-900"/>
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg" style={{animationDelay: '0.3s'}}>
                          <FaAward className="text-2xl text-yellow-900"/>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Result text with animation */}
                  <h3 className="text-5xl md:text-6xl font-black mb-8 text-white drop-shadow-lg animate-bounce">
                    {percentage >= 90 ? "🏆 أداء أسطوري!" : 
                     percentage >= 75 ? "⭐ ممتاز جداً!" : 
                     percentage >= 50 ? "👍 جيد جداً!" : 
                     "💪 واصل التدريب!"}
                  </h3>
                  
                  {/* Score display */}
                  <div className="flex items-center justify-center gap-10 mb-10">
                    <div className="text-center">
                      <p className="text-[120px] md:text-[140px] font-black text-white mb-2 animate-countUp drop-shadow-2xl leading-none">{score}</p>
                      <p className="text-gray-300 text-2xl font-bold">من {selectedExam.questions.length}</p>
                    </div>
                  </div>

                  {/* Percentage badge with glow */}
                  <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"></div>
                    <div className="relative inline-flex items-center gap-4 bg-white/20 backdrop-blur-2xl border-4 border-white/40 px-10 py-5 rounded-2xl shadow-2xl">
                      <FaChartLine className="text-4xl"/>
                      <span className="text-6xl font-black">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Time and stats */}
                  <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border-2 border-white/30 px-6 py-3 rounded-xl">
                      <FaClock className="text-2xl"/>
                      <span className="text-gray-200 font-semibold">الوقت:</span>
                      <span className="font-mono text-2xl font-black">{formatTime(timeElapsed)}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border-2 border-white/30 px-6 py-3 rounded-xl">
                      <FaCheckCircle className="text-2xl text-green-400"/>
                      <span className="text-gray-200 font-semibold">صحيح:</span>
                      <span className="text-2xl font-black">{score}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border-2 border-white/30 px-6 py-3 rounded-xl">
                      <FaTimesCircle className="text-2xl text-red-400"/>
                      <span className="text-gray-200 font-semibold">خاطئ:</span>
                      <span className="text-2xl font-black">{totalQuestions - score}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-5 justify-center">
                    <button 
                      onClick={() => startExam(selectedExam)} 
                      className="group relative bg-white hover:bg-gray-100 text-slate-900 px-10 py-5 rounded-2xl font-black hover:scale-110 transition-all flex items-center justify-center gap-3 shadow-2xl text-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <FaRedo className="relative z-10"/>
                      <span className="relative z-10">إعادة المحاولة</span>
                    </button>
                    <button 
                      onClick={resetAll} 
                      className="bg-slate-800/90 hover:bg-slate-700 text-white px-10 py-5 rounded-2xl font-black hover:scale-110 transition-all flex items-center justify-center gap-3 border-4 border-slate-700 hover:border-slate-600 shadow-2xl text-xl"
                    >
                      <FaArrowLeft />
                      <span>العودة للقائمة</span>
                    </button>
                  </div>

                  {/* Achievement message */}
                  {percentage >= 90 && (
                    <div className="mt-8 bg-yellow-400/20 border-2 border-yellow-400/50 rounded-2xl px-6 py-4 backdrop-blur-xl">
                      <p className="text-yellow-300 font-bold text-xl">🎊 إنجاز رائع! لقد حصلت على درجة متميزة!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ultra Enhanced Questions */}
            <div className="space-y-8">
              {selectedExam.questions.map((q, qIndex) => {
                const isCorrectAnswer = userAnswers[qIndex] === q.correct;
                const isAnswered = userAnswers.hasOwnProperty(qIndex);
                
                return (
                  <div 
                    key={qIndex} 
                    className={`relative rounded-[2rem] p-10 transition-all duration-500 animate-fadeIn ${
                      showResult && isCorrectAnswer ? 'bg-green-900/30 border-4 border-green-500/70 shadow-2xl shadow-green-500/30' :
                      showResult && !isCorrectAnswer && isAnswered ? 'bg-red-900/30 border-4 border-red-500/70 shadow-2xl shadow-red-500/30' :
                      isAnswered ? 'bg-blue-900/30 border-4 border-blue-500/70 shadow-2xl shadow-blue-500/30' :
                      'bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 hover:border-slate-700'
                    }`}
                    style={{ animationDelay: `${qIndex * 100}ms` }}
                  >
                    {/* Animated corner accents */}
                    <div className={`absolute top-0 right-0 w-20 h-20 ${
                      showResult && isCorrectAnswer ? 'bg-gradient-to-br from-green-500/30' :
                      showResult && !isCorrectAnswer && isAnswered ? 'bg-gradient-to-br from-red-500/30' :
                      isAnswered ? 'bg-gradient-to-br from-blue-500/30' : 'bg-gradient-to-br from-slate-700/30'
                    } rounded-tr-[2rem] rounded-bl-full`}></div>

                    <div className="flex items-start gap-6 mb-8">
                      {/* Enhanced question number badge */}
                      <div className="flex-shrink-0 relative">
                        <div className={`absolute inset-0 rounded-2xl blur-xl ${
                          showResult && isCorrectAnswer ? 'bg-green-500/60' :
                          showResult && !isCorrectAnswer && isAnswered ? 'bg-red-500/60' :
                          isAnswered ? 'bg-blue-500/60' : 'bg-cyan-500/60'
                        } animate-pulse`}></div>
                        <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl transform hover:scale-125 hover:rotate-12 transition-all duration-500 ${
                          showResult && isCorrectAnswer ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                          showResult && !isCorrectAnswer && isAnswered ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                          isAnswered ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                          'bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500'
                        }`}>
                          {qIndex + 1}
                        </div>
                      </div>
                      
                      {/* Question text */}
                      <h3 className="flex-1 text-2xl md:text-3xl font-bold text-white leading-relaxed pt-3">
                        {q.question}
                      </h3>
                      
                      {/* Result badge */}
                      {showResult && isAnswered && (
                        <div className="flex-shrink-0">
                          {isCorrectAnswer ? (
                            <div className="relative">
                              <div className="absolute inset-0 bg-green-500 rounded-full blur-xl animate-pulse"></div>
                              <div className="relative w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 border-4 border-green-300 rounded-full flex items-center justify-center animate-bounce shadow-2xl">
                                <FaCheckCircle className="text-white text-3xl"/>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <div className="absolute inset-0 bg-red-500 rounded-full blur-xl animate-pulse"></div>
                              <div className="relative w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 border-4 border-red-300 rounded-full flex items-center justify-center animate-shake shadow-2xl">
                                <FaTimesCircle className="text-white text-3xl"/>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Ultra Enhanced Options */}
                    <div className="space-y-4 mr-24">
                      {q.options.map((option, optIndex) => {
                        let optionClass = "bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800/90 hover:scale-105";
                        let iconElement = null;
                        let labelElement = null;
                        
                        if (showResult) {
                          if (optIndex === q.correct) {
                            optionClass = "bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-green-400 shadow-2xl shadow-green-500/40 scale-105 border-4";
                            iconElement = (
                              <div className="flex items-center gap-3">
                                <FaCheckCircle className="text-green-300 text-2xl animate-bounce"/>
                                <span className="text-sm font-black text-green-200 bg-green-500/40 px-4 py-2 rounded-xl border-2 border-green-400">✓ الإجابة الصحيحة</span>
                              </div>
                            );
                          } else if (userAnswers[qIndex] === optIndex) {
                            optionClass = "bg-gradient-to-r from-red-500/30 to-pink-500/30 border-red-400 shadow-2xl shadow-red-500/40 border-4";
                            iconElement = (
                              <div className="flex items-center gap-3">
                                <FaTimesCircle className="text-red-300 text-2xl"/>
                                <span className="text-sm font-black text-red-200 bg-red-500/40 px-4 py-2 rounded-xl border-2 border-red-400">✗ إجابة خاطئة</span>
                              </div>
                            );
                          } else {
                            optionClass = "bg-slate-800/40 border-slate-800 opacity-50";
                          }
                        } else if (userAnswers[qIndex] === optIndex) {
                          optionClass = "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400 shadow-2xl shadow-blue-500/40 scale-105 border-4";
                          iconElement = (
                            <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full shadow-lg shadow-blue-400/60 animate-pulse"></div>
                          );
                        }
                        
                        return (
                          <div 
                            key={optIndex} 
                            onClick={() => handleSelect(qIndex, optIndex)} 
                            className={`relative p-7 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between group overflow-hidden ${optionClass}`}
                          >
                            {/* Option letter badge */}
                            <div className="absolute top-3 right-3 w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center font-bold text-sm text-gray-400">
                              {String.fromCharCode(65 + optIndex)}
                            </div>
                            
                            <span className="font-bold text-xl relative z-10 pr-10">{option}</span>
                            {iconElement && <div className="mr-4 relative z-10">{iconElement}</div>}
                            
                            {/* Hover effect shimmer */}
                            {!showResult && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ultra Enhanced Submit button */}
            {!showResult && (
              <div className="mt-14 animate-fadeIn">
                <div className="relative">
                  <div className={`absolute inset-0 rounded-2xl blur-2xl ${
                    answeredCount === totalQuestions ? 'bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse' : 'bg-slate-800'
                  }`}></div>
                  <button 
                    onClick={submitExam} 
                    disabled={answeredCount === 0}
                    className={`relative w-full font-black py-8 rounded-2xl text-2xl transition-all duration-500 overflow-hidden ${
                      answeredCount === 0 
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border-2 border-slate-700'
                        : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white hover:shadow-2xl hover:scale-105 border-4 border-blue-400'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-4">
                      {answeredCount === totalQuestions ? (
                        <>
                          <FaCheckCircle className="text-3xl animate-bounce"/>
                          <span>تسليم الامتحان ({answeredCount}/{totalQuestions})</span>
                          <FaTrophy className="text-3xl animate-bounce"/>
                        </>
                      ) : (
                        <>
                          <FaClipboardList className="text-3xl"/>
                          <span>تسليم ({answeredCount}/{totalQuestions})</span>
                        </>
                      )}
                    </span>
                    {answeredCount > 0 && (
                      <>
                        <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide"></div>
                      </>
                    )}
                  </button>
                </div>
                
                {answeredCount < totalQuestions && answeredCount > 0 && (
                  <div className="mt-6 text-center bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl px-6 py-4 backdrop-blur-xl">
                    <p className="text-yellow-300 font-bold text-lg flex items-center justify-center gap-2">
                      <span>⚠️</span>
                      <span>لا تنسى الإجابة على جميع الأسئلة قبل التسليم</span>
                      <span>({totalQuestions - answeredCount} سؤال متبقي)</span>
                    </p>
                  </div>
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
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.85);
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

        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0) rotate(0deg);
          }
          25% {
            transform: translateX(-12px) rotate(-5deg);
          }
          75% {
            transform: translateX(12px) rotate(5deg);
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg) scale(0.5);
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

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(15px);
          }
        }

        @keyframes grid {
          0% {
            transform: translateX(0) translateY(0);
          }
          100% {
            transform: translateX(4rem) translateY(4rem);
          }
        }

        @keyframes countUp {
          from {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          to {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.7s ease-out forwards;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-slide {
          animation: slide 3s infinite;
        }

        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }

        .animate-confetti {
          animation: confetti linear forwards;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-grid {
          animation: grid 20s linear infinite;
        }

        .animate-countUp {
          animation: countUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
