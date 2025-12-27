"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { FaCheckCircle, FaTimesCircle, FaClipboardList, FaArrowLeft, FaRedo, FaSpinner, FaClock, FaTrophy, FaChartLine } from "react-icons/fa";

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedExam, setSelectedExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

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

  const percentage = selectedExam ? (score / selectedExam.questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-blue-400 animate-pulse"/>
        </div>
        <p className="mt-6 text-gray-400 animate-pulse">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white relative overflow-hidden" dir="rtl">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6 md:p-10">
        {!selectedExam ? (
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-16 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-lg shadow-blue-500/50">
                <FaClipboardList className="text-3xl text-white"/>
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                مركز الامتحانات
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                اختبر معلوماتك وطوّر مهاراتك مع مجموعة متنوعة من الامتحانات التفاعلية
              </p>
            </div>

            {exams.length === 0 ? (
              <div className="max-w-2xl mx-auto">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-16 text-center">
                  <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaClipboardList className="text-5xl text-slate-600"/>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-300 mb-3">لا توجد امتحانات متاحة</h3>
                  <p className="text-gray-500">سيتم إضافة امتحانات جديدة قريباً</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam, idx) => (
                  <div 
                    key={exam.id} 
                    onClick={() => startExam(exam)} 
                    className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 animate-fadeIn overflow-hidden"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-3xl transition-all duration-300"></div>
                    
                    {/* Accent line */}
                    <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-blue-500 to-cyan-500 rounded-r-3xl"></div>
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <FaClipboardList className="text-2xl text-blue-400"/>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {exam.subject}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                        {exam.title}
                      </p>
                      
                      {/* Info badge */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl text-sm text-gray-300 border border-slate-700">
                          <FaClipboardList className="text-blue-400"/>
                          <span className="font-semibold">{exam.questions?.length || 0}</span>
                          <span>سؤال</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Exam Header */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 mb-8 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {selectedExam.subject}
                  </h2>
                  <p className="text-gray-400">{selectedExam.title}</p>
                </div>
                <button 
                  onClick={resetAll} 
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white px-6 py-3 rounded-2xl transition-all hover:scale-105 font-semibold"
                >
                  <FaArrowLeft />
                  <span>خروج</span>
                </button>
              </div>

              {/* Progress bar */}
              {!showResult && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">التقدم</span>
                    <span className="text-sm font-semibold text-blue-400">
                      {Object.keys(userAnswers).length} / {selectedExam.questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 rounded-full"
                      style={{ width: `${(Object.keys(userAnswers).length / selectedExam.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Results Card */}
            {showResult && (
              <div className="mb-8 animate-fadeIn">
                <div className={`relative bg-gradient-to-br rounded-3xl p-10 text-center overflow-hidden ${
                  percentage >= 80 ? 'from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/50' :
                  percentage >= 60 ? 'from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50' :
                  percentage >= 40 ? 'from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50' :
                  'from-red-500/20 to-pink-500/20 border-2 border-red-500/50'
                }`}>
                  {/* Trophy icon */}
                  <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                    percentage >= 60 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-slate-700'
                  }`}>
                    <FaTrophy className="text-4xl text-white"/>
                  </div>

                  <h3 className="text-3xl font-black mb-4 text-white">
                    {percentage >= 80 ? "🎉 ممتاز جداً!" : 
                     percentage >= 60 ? "👏 أحسنت!" : 
                     percentage >= 40 ? "💪 جيد!" : 
                     "📚 استمر بالتدريب!"}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-7xl font-black text-white mb-2">{score}</p>
                      <p className="text-gray-400">من {selectedExam.questions.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 mb-6">
                    <FaChartLine className="text-2xl text-blue-400"/>
                    <span className="text-4xl font-black text-white">{percentage.toFixed(0)}%</span>
                  </div>

                  <button 
                    onClick={() => startExam(selectedExam)} 
                    className="mt-4 bg-white hover:bg-gray-100 text-slate-900 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all flex items-center gap-3 mx-auto shadow-lg"
                  >
                    <FaRedo />
                    <span>إعادة المحاولة</span>
                  </button>
                </div>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
              {selectedExam.questions.map((q, qIndex) => {
                const isCorrectAnswer = userAnswers[qIndex] === q.correct;
                const isAnswered = userAnswers.hasOwnProperty(qIndex);
                
                return (
                  <div 
                    key={qIndex} 
                    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition-all animate-fadeIn"
                    style={{ animationDelay: `${qIndex * 50}ms` }}
                  >
                    <div className="flex items-start gap-4 mb-6">
                      {/* Question number badge */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/30">
                        {qIndex + 1}
                      </div>
                      
                      {/* Question text */}
                      <h3 className="flex-1 text-xl font-bold text-white leading-relaxed pt-2">
                        {q.question}
                      </h3>
                      
                      {/* Result icon */}
                      {showResult && (
                        <div className="flex-shrink-0">
                          {isCorrectAnswer ? (
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                              <FaCheckCircle className="text-green-400 text-xl"/>
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                              <FaTimesCircle className="text-red-400 text-xl"/>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mr-16">
                      {q.options.map((option, optIndex) => {
                        let optionClass = "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800";
                        let iconElement = null;
                        
                        if (showResult) {
                          if (optIndex === q.correct) {
                            optionClass = "bg-green-500/20 border-green-500 text-green-400 shadow-lg shadow-green-500/20";
                            iconElement = <FaCheckCircle className="text-green-400"/>;
                          } else if (userAnswers[qIndex] === optIndex) {
                            optionClass = "bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/20";
                            iconElement = <FaTimesCircle className="text-red-400"/>;
                          } else {
                            optionClass = "bg-slate-800/30 border-slate-800 opacity-50";
                          }
                        } else if (userAnswers[qIndex] === optIndex) {
                          optionClass = "bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20";
                          iconElement = <div className="w-3 h-3 bg-blue-400 rounded-full"></div>;
                        }
                        
                        return (
                          <div 
                            key={optIndex} 
                            onClick={() => handleSelect(qIndex, optIndex)} 
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group hover:scale-[1.02] ${optionClass}`}
                          >
                            <span className="font-medium text-lg">{option}</span>
                            {iconElement && <div className="mr-3">{iconElement}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit button */}
            {!showResult && (
              <button 
                onClick={submitExam} 
                className="w-full mt-10 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:via-cyan-400 hover:to-blue-500 text-white font-black py-6 rounded-2xl shadow-2xl shadow-blue-500/50 transform transition-all hover:scale-[1.02] text-xl animate-fadeIn"
                disabled={Object.keys(userAnswers).length === 0}
              >
                تسليم الإجابات
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
