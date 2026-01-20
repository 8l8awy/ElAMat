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

  useEffect(() => {
    async function fetchExams() {
      try {
        const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExams(data);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    fetchExams();
  }, []);

  const startExam = (exam) => {
    if (exam.active === false) return alert("الامتحان مغلق");
    setSelectedExam(exam);
    setUserAnswers({});
    setShowResult(false);
    setScore(0);
    setIsExamStarted(true);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">جاري التحميل...</div>;

  return (
    <div className="min-h-screen w-full text-white p-4 bg-black" dir="rtl">
      {!selectedExam ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div key={exam.id} onClick={() => exam.active !== false && startExam(exam)} className={`p-6 rounded-3xl bg-white/5 cursor-pointer ${exam.active === false ? 'opacity-50' : ''}`}>
              <h3 className="text-xl font-bold">{exam.subject}</h3>
              <span className={`text-xs p-1 px-3 rounded-full ${exam.active !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {exam.active !== false ? "متاح" : "مغلق"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedExam(null)} className="mb-4 bg-white/10 p-2 rounded-lg"><FaArrowLeft /></button>
          
          {showResult && (
            <div className="bg-white/10 p-8 rounded-3xl text-center mb-8 border border-white/10">
              <h2 className="text-3xl font-bold mb-4">النتيجة: {((score / selectedExam.questions.length) * 100).toFixed(0)}%</h2>
              <div className="flex justify-center gap-4 text-lg">
                <span className="text-green-400 font-bold">صح: {score}</span>
                <span className="text-red-400 font-bold">خطأ: {selectedExam.questions.length - score}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {selectedExam.questions.map((q, qIndex) => (
              <div key={qIndex} className="p-6 rounded-3xl bg-white/5 border border-white/5">
                <h3 className="text-xl font-bold mb-4">{qIndex + 1}. {q.question}</h3>
                <div className="space-y-3">
                  {q.options.map((option, optIndex) => {
                    // المنطق الجديد للألوان بعد التسليم
                    let btnStyle = "bg-white/5 border-transparent";
                    let icon = null;

                    if (showResult) {
                      const isCorrect = optIndex === q.correct; // الإجابة الصحيحة في الداتا
                      const isUserChoice = userAnswers[qIndex] === optIndex; // اختيار الطالب

                      if (isCorrect) {
                        btnStyle = "bg-green-500/20 border-green-500/50 text-green-200";
                        icon = <FaCheckCircle className="text-green-400" />;
                      } else if (isUserChoice) {
                        btnStyle = "bg-red-500/20 border-red-500/50 text-red-200";
                        icon = <FaTimesCircle className="text-red-400" />;
                      } else {
                        btnStyle = "opacity-40"; // باقي الخيارات تكون باهتة
                      }
                    } else if (userAnswers[qIndex] === optIndex) {
                      btnStyle = "bg-blue-500/30 border-blue-500/50";
                    }

                    return (
                      <div key={optIndex} onClick={() => handleSelect(qIndex, optIndex)} className={`p-4 rounded-2xl flex justify-between items-center transition-all border ${btnStyle} ${!showResult ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'}`}>
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
