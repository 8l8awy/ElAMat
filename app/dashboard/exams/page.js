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
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">جاري التحميل...</div>;

  return (
    <div className="min-h-screen w-full text-white p-4 font-sans" dir="rtl">
      {!selectedExam ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div key={exam.id} onClick={() => startExam(exam)} className={`p-6 rounded-3xl bg-white/5 cursor-pointer ${exam.active === false ? 'opacity-50' : ''}`}>
              <h3 className="text-xl font-bold">{exam.subject}</h3>
              <p className="text-gray-400">{exam.title}</p>
              <span className={`text-xs p-1 px-3 rounded-full ${exam.active !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {exam.active !== false ? "متاح" : "مغلق"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="sticky top-0 z-40 bg-black/50 backdrop-blur-md p-4 flex justify-between items-center mb-6 rounded-2xl">
            <button onClick={resetAll} className="bg-white/10 p-2 rounded-lg"><FaArrowLeft /></button>
            <h2 className="font-bold">{selectedExam.subject}</h2>
            <div className="font-mono">{formatTime(timeElapsed)}</div>
          </div>

          {/* عرض النتيجة النهائية */}
          {showResult && (
            <div className="bg-white/10 p-8 rounded-3xl text-center mb-8 animate-fadeIn">
              <h2 className="text-4xl font-black mb-4">نتيجتك: {((score / selectedExam.questions.length) * 100).toFixed(0)}%</h2>
              <div className="flex justify-center gap-4">
                <div className="bg-green-500/20 p-4 rounded-xl text-green-400 font-bold">صح: {score}</div>
                <div className="bg-red-500/20 p-4 rounded-xl text-red-400 font-bold">خطأ: {selectedExam.questions.length - score}</div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {selectedExam.questions.map((q, qIndex) => (
              <div key={qIndex} className={`p-6 rounded-3xl bg-white/5 transition-all ${showResult ? (userAnswers[qIndex] === q.correct ? 'ring-2 ring-green-500/50' : 'ring-2 ring-red-500/50') : ''}`}>
                <h3 className="text-xl font-bold mb-6">{qIndex + 1}. {q.question}</h3>
                <div className="space-y-3">
                  {q.options.map((option, optIndex) => {
                    // منطق الألوان الجديد للتصحيح
                    let btnStyle = "bg-white/5 hover:bg-white/10";
                    let icon = null;

                    if (showResult) {
                      if (optIndex === q.correct) {
                        // الإجابة الصحيحة دائماً خضراء
                        btnStyle = "bg-green-500/20 border border-green-500/50 text-green-200";
                        icon = <FaCheckCircle className="text-green-400" />;
                      } else if (userAnswers[qIndex] === optIndex) {
                        // إجابة الطالب إذا كانت خاطئة تظهر باللون الأحمر
                        btnStyle = "bg-red-500/20 border border-red-500/50 text-red-200";
                        icon = <FaTimesCircle className="text-red-400" />;
                      } else {
                        btnStyle = "opacity-40 grayscale";
                      }
                    } else if (userAnswers[qIndex] === optIndex) {
                      // لون الاختيار أثناء الامتحان
                      btnStyle = "bg-blue-500/30 border border-blue-500/50";
                    }

                    return (
                      <div key={optIndex} onClick={() => handleSelect(qIndex, optIndex)} className={`p-4 rounded-2xl cursor-pointer flex justify-between items-center transition-all ${btnStyle}`}>
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
            <button onClick={submitExam} className="w-full py-5 mt-8 bg-blue-600 rounded-2xl font-bold text-xl hover:bg-blue-500 transition-all">تسليم الامتحان</button>
          )}
        </div>
      )}
    </div>
  );
}
