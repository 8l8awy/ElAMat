"use client";
import { useState } from "react";
import { FaCheckCircle, FaTimesCircle, FaClipboardList, FaArrowLeft, FaRedo } from "react-icons/fa";

// 📝 هنا تضع الأسئلة الخاصة بك
// يمكنك تكرار هذا الهيكل لإضافة المزيد من الامتحانات والمواد
const STATIC_EXAMS = [
  {
    id: 1,
    subject: "مبادئ الاقتصاد",
    title: "امتحان تجريبي شامل (1)",
    questions: [
      {
        id: 1,
        question: "علم الاقتصاد يهتم بدراسة كيفية استخدام الموارد ..... لإشباع الحاجات .....",
        options: ["النادرة / المتعددة", "المتعددة / النادرة", "المتوفرة / المحدودة", "لا شيء مما سبق"],
        correct: 0 // (0 تعني الخيار الأول، 1 الثاني، وهكذا)
      },
      {
        id: 2,
        question: "أي مما يلي يعتبر من عناصر الإنتاج؟",
        options: ["العمل", "رأس المال", "الأرض", "كل ما سبق"],
        correct: 3
      },
      {
        id: 3,
        question: "عندما يزيد الطلب مع ثبات العرض، فإن السعر التوازني:",
        options: ["ينخفض", "يرتفع", "يبقى ثابتاً", "يصبح صفراً"],
        correct: 1
      }
    ]
  },
  {
    id: 2,
    subject: "مبادئ المحاسبة",
    title: "اختبار سريع - المدين والدائن",
    questions: [
      {
        id: 1,
        question: "الزيادة في الأصول تعتبر:",
        options: ["دائن", "مدين", "حقوق ملكية", "إيراد"],
        correct: 1
      },
      {
        id: 2,
        question: "رأس المال طبيعته:",
        options: ["مدين", "دائن", "مختلط", "لا شيء مما سبق"],
        correct: 1
      }
    ]
  }
];

export default function ExamsPage() {
  const [selectedExam, setSelectedExam] = useState(null); // الامتحان المختار
  const [userAnswers, setUserAnswers] = useState({}); // إجابات الطالب
  const [showResult, setShowResult] = useState(false); // هل انتهى الامتحان؟
  const [score, setScore] = useState(0); // الدرجة النهائية

  // دالة بدء الامتحان
  const startExam = (exam) => {
    setSelectedExam(exam);
    setUserAnswers({});
    setShowResult(false);
    setScore(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // دالة اختيار إجابة
  const handleSelect = (qId, optionIndex) => {
    if (showResult) return; // منع التغيير بعد التسليم
    setUserAnswers(prev => ({ ...prev, [qId]: optionIndex }));
  };

  // دالة تسليم الامتحان وحساب النتيجة
  const submitExam = () => {
    // التأكد من حل جميع الأسئلة (اختياري)
    if (Object.keys(userAnswers).length < selectedExam.questions.length) {
      if(!confirm("لم تجب على كل الأسئلة! هل أنت متأكد من التسليم؟")) return;
    }

    let calculatedScore = 0;
    selectedExam.questions.forEach(q => {
      if (userAnswers[q.id] === q.correct) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setShowResult(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // العودة للقائمة الرئيسية
  const resetAll = () => {
    setSelectedExam(null);
    setUserAnswers({});
    setShowResult(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0b0c15] text-white p-4 md:p-8 font-sans" dir="rtl">
      
      {/* 1. واجهة اختيار الامتحان */}
      {!selectedExam ? (
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
              📝 بنك الامتحانات التفاعلي
            </h1>
            <p className="text-gray-400">تدرب الآن واختبر مستواك قبل الامتحانات النهائية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STATIC_EXAMS.map((exam) => (
              <div 
                key={exam.id} 
                onClick={() => startExam(exam)}
                className="bg-[#151720] border border-gray-800 p-6 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-[#1a1d2e] transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-1 h-full bg-blue-600"></div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{exam.subject}</h3>
                <p className="text-gray-400 text-sm mb-4">{exam.title}</p>
                <div className="flex items-center gap-2 text-xs bg-gray-900 w-fit px-3 py-1 rounded-full text-gray-300">
                  <FaClipboardList /> {exam.questions.length} سؤال
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        
        /* 2. واجهة الامتحان */
        <div className="max-w-3xl mx-auto animate-fadeIn">
          {/* رأس الامتحان */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedExam.subject}</h2>
                <p className="text-sm text-gray-400">{selectedExam.title}</p>
            </div>
            <button onClick={resetAll} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-800 px-4 py-2 rounded-lg">
                <FaArrowLeft /> خروج
            </button>
          </div>

          {/* عرض النتيجة إذا انتهى الامتحان */}
          {showResult && (
            <div className={`mb-8 p-6 rounded-2xl text-center border ${score >= (selectedExam.questions.length / 2) ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                <h3 className="text-2xl font-bold mb-2">
                    {score >= (selectedExam.questions.length / 2) ? "🎉 نتيجة ممتازة!" : "حظ أوفر المرة القادمة!"}
                </h3>
                <p className="text-lg">
                    درجتك: <span className="font-bold text-3xl mx-2">{score}</span> من {selectedExam.questions.length}
                </p>
                <button onClick={() => startExam(selectedExam)} className="mt-4 bg-white text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
                    <FaRedo /> إعادة الامتحان
                </button>
            </div>
          )}

          {/* قائمة الأسئلة */}
          <div className="space-y-6">
            {selectedExam.questions.map((q, qIndex) => {
              // منطق الألوان في حالة النتيجة
              const isCorrectAnswer = userAnswers[q.id] === q.correct;
              const isUserSelected = userAnswers[q.id] !== undefined;

              return (
                <div key={q.id} className="bg-[#151720] border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
                  
                  {/* رقم السؤال */}
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="text-lg font-bold text-white leading-relaxed w-[90%]">
                       <span className="text-blue-500 ml-2">#{qIndex + 1}</span> 
                       {q.question}
                     </h3>
                     {showResult && (
                        isCorrectAnswer 
                        ? <FaCheckCircle className="text-green-500 text-2xl flex-shrink-0" />
                        : <FaTimesCircle className="text-red-500 text-2xl flex-shrink-0" />
                     )}
                  </div>

                  {/* الخيارات */}
                  <div className="space-y-3">
                    {q.options.map((option, optIndex) => {
                        // تحديد ستايل الخيار (هل هو صحيح أم خطأ أم مختار)
                        let optionClass = "border-gray-700 bg-[#1a1d2e] hover:border-gray-500";
                        
                        if (showResult) {
                            if (optIndex === q.correct) {
                                optionClass = "border-green-500 bg-green-500/20 text-green-400"; // الإجابة الصحيحة دائماً خضراء
                            } else if (userAnswers[q.id] === optIndex && optIndex !== q.correct) {
                                optionClass = "border-red-500 bg-red-500/20 text-red-400"; // إجابة الطالب الخاطئة حمراء
                            } else {
                                optionClass = "border-gray-800 opacity-50"; // باقي الخيارات باهتة
                            }
                        } else {
                            // أثناء الحل
                            if (userAnswers[q.id] === optIndex) {
                                optionClass = "border-blue-500 bg-blue-500/20 text-blue-400";
                            }
                        }

                        return (
                            <div 
                                key={optIndex}
                                onClick={() => handleSelect(q.id, optIndex)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${optionClass}`}
                            >
                                <span>{option}</span>
                                {showResult && optIndex === q.correct && <FaCheckCircle size={14}/>}
                            </div>
                        );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* زر التسليم */}
          {!showResult && (
             <button 
                onClick={submitExam}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:scale-[1.02]"
             >
                تسليم الإجابات وعرض النتيجة
             </button>
          )}
        </div>
      )}
    </div>
  );
}
