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
    // منع البدء إذا كان الامتحان غير نشط في Firestore
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

  const saveResultToDb = async (finalScore, percentage) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "results"), {
        studentName: user.name || "طالب مجهول",
        studentEmail: user.email,
        examTitle: selectedExam.title,
        subject: selectedExam.subject,
        score: finalScore,
        totalQuestions: selectedExam.questions.length,
        percentage: percentage,
        timeTaken: timeElapsed,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving result:", error);
    }
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
    await saveResultToDb(calculatedScore, percentage);

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
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <FaGraduationCap className="text-6xl text-blue-400 animate-bounce mb-4"/>
        <p className="animate-pulse">جاري تجهيز الامتحانات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-white p-4 font-sans relative overflow-hidden" dir="rtl">
      
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        {!selectedExam ? (
          <div className="w-full animate-fadeIn">
            <div className="text-center mb-8 pt-4">
              <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  منصة الامتحانات
              </h1>
              <p className="text-gray-400">
                  أهلاً  <span className="text-blue-400 font-bold">{user?.name}</span>، اختر امتحانك وابدأ! 
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {exams.map((exam, idx) => {
                // التحقق من حالة القفل من Firebase
                const isAvailable = exam.active !== false;

                return (
                  <div 
                    key={exam.id} 
                    onClick={() => isAvailable && startExam(exam)} 
                    className={`group relative h-full bg-white/5 backdrop-blur-lg rounded-3xl p-6 transition-all duration-300 overflow-hidden ${
                      isAvailable 
                      ? "hover:bg-white/10 hover:-translate-y-1 cursor-pointer" 
                      : "opacity-60 cursor-not-allowed grayscale"
                    }`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 bg-black/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          {isAvailable ? <FaClipboardList className="text-3xl text-blue-400"/> : <FaLock className="text-3xl text-red-400"/>}
                        </div>
                        {/* تحديث حالة متاح/مغلق ديناميكياً */}
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${isAvailable ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {isAvailable ? "متاح" : "مغلق حالياً"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-200 transition-colors">{exam.subject}</h3>
                      <p className="text-gray-400 text-sm mb-6 line-clamp-2">{exam.title}</p>
                      <div className="mt-auto flex items-center gap-3 w-full">
                          <div className="flex-1 bg-black/20 px-3 py-2 rounded-xl text-xs text-gray-300 flex items-center justify-center gap-2">
                              <FaClipboardList /> <span>{exam.questions?.length || 0} سؤال</span>
                          </div>
                          <div className="flex-1 bg-black/20 px-3 py-2 rounded-xl text-xs text-gray-300 flex items-center justify-center gap-2">
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
            <div className="sticky top-0 z-40 bg-black/30 backdrop-blur-xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
               <div className="flex items-center gap-4 w-full md:w-auto">
                 <button onClick={resetAll} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all">
                    <FaArrowLeft />
                 </button>
                 <div>
                    <h2 className="text-lg font-bold text-white line-clamp-1">{selectedExam.subject}</h2>
                    {!showResult && (
                        <div className="flex items-center gap-2 text-blue-400 font-mono text-sm font-bold">
                            <FaClock className="animate-spin-slow"/>
                            <span>{formatTime(timeElapsed)}</span>
                        </div>
                    )}
                 </div>
               </div>
               {!showResult && (
                   <div className="w-full md:w-64">
                       <div className="flex justify-between text-xs text-gray-400 mb-1">
                           <span>التقدم</span>
                           <span>{Object.keys(userAnswers).length} / {selectedExam.questions.length}</span>
                       </div>
                       <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                             style={{ width: `${(Object.keys(userAnswers).length / selectedExam.questions.length) * 100}%` }}
                           ></div>
                       </div>
                   </div>
               )}
            </div>

            {showResult && (
              <div className="mb-12 text-center animate-scaleIn pt-4">
                    <div className={`w-32 h-32 mx-auto bg-gradient-to-br ${(score / selectedExam.questions.length) * 100 >= 75 ? 'from-yellow-400 to-orange-500' : 'from-gray-600 to-gray-700'} rounded-full flex items-center justify-center shadow-lg mb-6 animate-bounce`}>
                       {(score / selectedExam.questions.length) * 100 >= 75 ? <FaTrophy className="text-6xl text-white"/> : <FaMedal className="text-6xl text-gray-300"/>}
                    </div>
                    <h2 className="text-5xl font-black text-white mb-4">
                        {(score / selectedExam.questions.length) * 100 >= 90 ? "! جامد" : (score / selectedExam.questions.length) * 100 >= 75 ? "عاش! " : "حاول تاني "}
                    </h2>
                    <div className="flex justify-center gap-4 mt-8 flex-wrap">
                        <div className="bg-black/20 p-5 rounded-2xl min-w-[110px]">
                            <span className="block text-4xl font-bold text-white mb-1">{score}</span>
                            <span className="text-sm text-green-400 font-bold">صحيح</span>
                        </div>
                        <div className="bg-black/20 p-5 rounded-2xl min-w-[110px]">
                            <span className="block text-4xl font-bold text-white mb-1">{selectedExam.questions.length - score}</span>
                            <span className="text-sm text-red-400 font-bold">خطأ</span>
                        </div>
                    </div>
                    <div className="flex gap-4 justify-center mt-10">
                        <button onClick={() => startExam(selectedExam)} className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold transition-all flex items-center gap-3">
                            <FaRedo /> إعادة المحاولة
                        </button>
                    </div>
              </div>
            )}

            <div className="space-y-6 pb-10">
              {selectedExam.questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-black/20 backdrop-blur-md rounded-3xl p-6 md:p-8">
                  <div className="flex gap-5 mb-6">
                       <span className="flex-shrink-0 w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center font-bold text-blue-400 text-lg">{qIndex + 1}</span>
                       <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed">{q.question}</h3>
                  </div>
                  <div className="space-y-4 mr-0 md:mr-16">
                     {q.options.map((option, optIndex) => (
                        <div 
                          key={optIndex}
                          onClick={() => handleSelect(qIndex, optIndex)}
                          className={`relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${userAnswers[qIndex] === optIndex ? "bg-blue-500/20 text-blue-200" : "bg-black/20 hover:bg-white/10"}`}
                        >
                           <span className="font-medium text-lg pl-4">{option}</span>
                        </div>
                     ))}
                  </div>
                </div>
              ))}
            </div>

            {!showResult && (
              <div className="mt-8 pb-12">
                <button 
                  onClick={submitExam}
                  className="w-full py-5 rounded-2xl font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl"
                >
                  تسليم الإجابات
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
