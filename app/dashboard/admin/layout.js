"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase"; // استيراد قاعدة البيانات
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaLock, FaUserShield, FaSpinner } from "react-icons/fa";

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [checking, setChecking] = useState(true); // حالة التحميل

  // 🔍 دالة مساعدة للتحقق من الكود في الفايربيس
  const verifyCodeWithFirebase = async (codeToCheck) => {
    try {
      const q = query(
        collection(db, "allowedCodes"),
        where("code", "==", codeToCheck) // البحث عن مستند يحتوي على هذا الكود
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty; // إذا وجدنا نتيجة، فالكود صحيح
    } catch (error) {
      console.error("Error verifying code:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      // 1. جلب الكود المخزن في Local Storage
      const storedCode = localStorage.getItem("adminCode");
      
      if (storedCode) {
        // 2. التحقق: هل الكود المخزن موجود فعلاً في قاعدة بيانات فايربيس؟
        const isValid = await verifyCodeWithFirebase(storedCode);
        
        if (isValid) {
          setIsAuthenticated(true);
        } else {
          // إذا كان الكود قديماً أو تم حذفه من القاعدة، نخرجه
          localStorage.removeItem("adminCode");
          setIsAuthenticated(false);
        }
      }
      setChecking(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setChecking(true); // إظهار التحميل أثناء الفحص
    const code = passInput.trim();

    // التحقق المباشر من الفايربيس عند الضغط على زر الدخول
    const isValid = await verifyCodeWithFirebase(code);

    if (isValid) {
      setIsAuthenticated(true);
      localStorage.setItem("adminCode", code); // ✅ حفظ الكود الصحيح
    } else {
      alert("⛔ كود غير صحيح أو غير مصرح به!");
      setPassInput("");
    }
    setChecking(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminCode");
    setIsAuthenticated(false);
  };

  // شاشة التحميل (تظهر للحظات أثناء التأكد من الفايربيس)
  if (checking) {
    return (
      <div className="min-h-screen bg-[#0b0c15] flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  // 🔒 شاشة القفل
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b0c15] flex flex-col items-center justify-center p-4 text-white font-sans" dir="rtl">
        <div className="bg-[#151720] p-8 rounded-2xl border border-red-500/30 text-center w-full max-w-md shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
             <FaUserShield className="text-5xl text-red-500" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2">منطقة محظورة</h2>
          <p className="text-gray-400 mb-8 text-sm">أدخل كود الأدمن للمتابعة (سيتم التحقق من السيرفر).</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
                <FaLock className="absolute right-4 top-4 text-gray-500"/>
                <input 
                  type="password" 
                  placeholder="أدخل الكود..." 
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pr-12 pl-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                />
            </div>
            <button type="submit" disabled={checking} className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-3.5 rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50">
              {checking ? "جاري التحقق..." : "تحقق ودخول"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ✅ عرض الصفحة
  return (
    <div className="relative">
      <button 
        onClick={handleLogout}
        className="fixed top-4 left-4 z-50 bg-red-600/80 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all"
      >
        خروج
      </button>
      {children}
    </div>
  );
}
