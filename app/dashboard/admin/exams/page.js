"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaPlus, FaTrash, FaSave, FaClipboardList, FaBook, FaCheckCircle, FaTimes, FaEdit, FaRocket } from "react-icons/fa";

export default function CreateExamPage() {
  const [examData, setExamData] = useState({
    subject: "",
    title: "",
    questions: []
  });
  
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: 0
  });
  
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim()) {
      showNotification("يرجى كتابة نص السؤال!", "error");
      return;
    }
    
    if (currentQuestion.options.some(opt => !opt.trim())) {
      showNotification("يرجى ملء جميع الخيارات!", "error");
      return;
    }

    if (editingIndex !== null) {
      const updated = [...examData.questions];
      updated[editingIndex] = { ...currentQuestion };
      setExamData({ ...examData, questions: updated });
      showNotification("تم تحديث السؤال بنجاح! ✓", "success");
      setEditingIndex(null);
    } else {
      setExamData({
        ...examData,
        questions: [...examData.questions, { ...currentQuestion }]
      });
      showNotification("تم إضافة السؤال بنجاح! ✓", "success");
    }

    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correct: 0
    });
    setIsAddingQuestion(false);
  };

  const handleEditQuestion = (index) => {
    setCurrentQuestion({ ...examData.questions[index] });
    setEditingIndex(index);
    setIsAddingQuestion(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuestion = (index) => {
    if (confirm("هل أنت متأكد من حذف هذا السؤال؟")) {
      const updated = examData.questions.filter((_, i) => i !== index);
      setExamData({ ...examData, questions: updated });
      showNotification("تم حذف السؤال بنجاح!", "success");
    }
  };

  const handleSaveExam = async () => {
    if (!examData.subject.trim() || !examData.title.trim()) {
      showNotification("يرجى ملء اسم المادة ووصف الامتحان!", "error");
      return;
    }

    if (examData.questions.length === 0) {
      showNotification("يرجى إضافة سؤال واحد على الأقل!", "error");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "exams"), {
        ...examData,
        createdAt: serverTimestamp()
      });
      
      showNotification("🎉 تم حفظ الامتحان بنجاح!", "success");
      
      // Reset form
      setTimeout(() => {
        setExamData({ subject: "", title: "", questions: [] });
        setCurrentQuestion({ question: "", options: ["", "", "", ""], correct: 0 });
        setIsAddingQuestion(false);
      }, 1500);
    } catch (error) {
      console.error("Error saving exam:", error);
      showNotification("حدث خطأ أثناء الحفظ. حاول مرة أخرى!", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10"></div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className={`flex items-center gap-3 px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2 ${
            notification.type === "success" 
              ? "bg-green-500/20 border-green-500 text-green-300" 
              : "bg-red-500/20 border-red-500 text-red-300"
          }`}>
            {notification.type === "success" ? (
              <FaCheckCircle className="text-2xl"/>
            ) : (
              <FaTimes className="text-2xl"/>
            )}
            <span className="font-bold text-lg">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="relative z-10 p-4 md:p-8 lg:p-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-60 animate-pulse"></div>
            <div className="relative w-28 h-28 bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-12 transition-all duration-500">
              <FaClipboardList className="text-5xl text-white"/>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
            إنشاء امتحان جديد
          </h1>
          <p className="text-xl text-gray-300">
            أنشئ امتحانات تفاعلية احترافية في دقائق! 🚀
          </p>
        </div>

        {/* Exam Info Card */}
        <div className="relative mb-10 animate-fadeIn" style={{animationDelay: '0.1s'}}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-3xl blur-2xl"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-2xl border-2 border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <FaBook className="text-xl text-white"/>
              </div>
              <h2 className="text-3xl font-black text-white">معلومات الامتحان</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-gray-300 font-bold mb-3 text-lg">اسم المادة *</label>
                <input
                  type="text"
                  value={examData.subject}
                  onChange={(e) => setExamData({ ...examData, subject: e.target.value })}
                  placeholder="مثال: الرياضيات"
                  className="w-full bg-slate-800/60 border-2 border-slate-700 rounded-2xl px-6 py-4 text-white text-lg focus:border-blue-500 focus:outline-none transition-all placeholder-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 font-bold mb-3 text-lg">وصف الامتحان *</label>
                <input
                  type="text"
                  value={examData.title}
                  onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                  placeholder="مثال: امتحان الوحدة الأولى - الجبر"
                  className="w-full bg-slate-800/60 border-2 border-slate-700 rounded-2xl px-6 py-4 text-white text-lg focus:border-blue-500 focus:outline-none transition-all placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Add Question Button */}
        {!isAddingQuestion && (
          <div className="mb-10 animate-fadeIn" style={{animationDelay: '0.2s'}}>
            <button
              onClick={() => setIsAddingQuestion(true)}
              className="w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 hover:from-blue-500 hover:via-cyan-400 hover:to-purple-500 text-white font-black py-6 rounded-2xl shadow-2xl shadow-blue-500/50 transform transition-all hover:scale-105 text-xl flex items-center justify-center gap-3"
            >
              <FaPlus className="text-2xl"/>
              <span>إضافة سؤال جديد</span>
            </button>
          </div>
        )}

        {/* Question Form */}
        {isAddingQuestion && (
          <div className="relative mb-10 animate-scaleIn">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-3xl blur-2xl"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-2xl border-2 border-cyan-500/50 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <FaEdit className="text-xl text-white"/>
                  </div>
                  <h2 className="text-3xl font-black text-white">
                    {editingIndex !== null ? "تعديل السؤال" : "سؤال جديد"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setIsAddingQuestion(false);
                    setEditingIndex(null);
                    setCurrentQuestion({ question: "", options: ["", "", "", ""], correct: 0 });
                  }}
                  className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                >
                  <FaTimes className="text-red-400"/>
                </button>
              </div>

              <div className="space-y-6">
                {/* Question Text */}
                <div>
                  <label className="block text-gray-300 font-bold mb-3 text-lg">نص السؤال *</label>
                  <textarea
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                    placeholder="اكتب السؤال هنا..."
                    rows="3"
                    className="w-full bg-slate-800/60 border-2 border-slate-700 rounded-2xl px-6 py-4 text-white text-lg focus:border-cyan-500 focus:outline-none transition-all placeholder-gray-500 resize-none"
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="block text-gray-300 font-bold mb-4 text-lg">الخيارات *</label>
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border-2 transition-all ${
                          currentQuestion.correct === index
                            ? "bg-green-500/30 border-green-500 text-green-300"
                            : "bg-slate-800/60 border-slate-700 text-gray-400"
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion({ ...currentQuestion, options: newOptions });
                          }}
                          placeholder={`الخيار ${String.fromCharCode(65 + index)}`}
                          className="flex-1 bg-slate-800/60 border-2 border-slate-700 rounded-xl px-5 py-3 text-white focus:border-cyan-500 focus:outline-none transition-all placeholder-gray-500"
                        />
                        <button
                          onClick={() => setCurrentQuestion({ ...currentQuestion, correct: index })}
                          className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold transition-all border-2 ${
                            currentQuestion.correct === index
                              ? "bg-green-500/30 border-green-500 text-green-300"
                              : "bg-slate-800/60 border-slate-700 text-gray-400 hover:border-slate-600"
                          }`}
                        >
                          {currentQuestion.correct === index ? "✓ صحيح" : "اختر"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Question Button */}
                <button
                  onClick={handleAddQuestion}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-5 rounded-2xl shadow-xl transform transition-all hover:scale-105 text-xl flex items-center justify-center gap-3"
                >
                  {editingIndex !== null ? (
                    <>
                      <FaCheckCircle className="text-2xl"/>
                      <span>تحديث السؤال</span>
                    </>
                  ) : (
                    <>
                      <FaPlus className="text-2xl"/>
                      <span>إضافة السؤال</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        {examData.questions.length > 0 && (
          <div className="mb-10 animate-fadeIn" style={{animationDelay: '0.3s'}}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-3xl blur-2xl"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-2xl border-2 border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <FaClipboardList className="text-xl text-white"/>
                    </div>
                    <h2 className="text-3xl font-black text-white">الأسئلة المضافة</h2>
                  </div>
                  <div className="bg-purple-500/20 border-2 border-purple-500 px-5 py-2 rounded-xl">
                    <span className="text-2xl font-black text-purple-300">{examData.questions.length}</span>
                    <span className="text-gray-300 mr-2">سؤال</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {examData.questions.map((q, index) => (
                    <div
                      key={index}
                      className="group bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600 rounded-2xl p-6 transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center font-black text-xl">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <p className="text-white font-bold text-lg mb-4">{q.question}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {q.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${
                                  q.correct === optIdx
                                    ? "bg-green-500/20 border border-green-500/50 text-green-300"
                                    : "bg-slate-700/50 text-gray-400"
                                }`}
                              >
                                <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                                <span>{opt}</span>
                                {q.correct === optIdx && <FaCheckCircle className="mr-auto"/>}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex-shrink-0 flex gap-2">
                          <button
                            onClick={() => handleEditQuestion(index)}
                            className="w-10 h-10 bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          >
                            <FaEdit className="text-blue-400"/>
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(index)}
                            className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                          >
                            <FaTrash className="text-red-400"/>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Exam Button */}
        {examData.questions.length > 0 && (
          <div className="animate-fadeIn" style={{animationDelay: '0.4s'}}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-2xl animate-pulse"></div>
              <button
                onClick={handleSaveExam}
                disabled={saving}
                className="relative w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-slate-700 disabled:to-slate-800 text-white font-black py-8 rounded-2xl shadow-2xl transform transition-all hover:scale-105 disabled:scale-100 text-2xl flex items-center justify-center gap-4"
              >
                {saving ? (
                  <>
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <FaRocket className="text-3xl"/>
                    <span>حفظ الامتحان ونشره</span>
                    <FaSave className="text-3xl"/>
                  </>
                )}
              </button>
            </div>
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

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -100px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
