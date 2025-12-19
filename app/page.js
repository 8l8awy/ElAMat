"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { Mail, Lock, User, ArrowLeft, BookOpen, GraduationCap, Lightbulb, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  // دالة مساعدة للتوجيه حسب الصلاحية
  const handleRedirect = (userData) => {
    login(userData);
    // حفظ البيانات في LocalStorage لضمان استمرار الجلسة
    localStorage.setItem("user", JSON.stringify(userData));

    if (userData.isAdmin) {
        router.push("/dashboard/admin");
    } else {
        router.push("/dashboard");
    }
  };

  // --- دالة تسجيل الدخول ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. التحقق أولاً من الأكواد المسموحة (allowedCodes)
      const codesRef = collection(db, "allowedCodes");
      const qCode = query(codesRef, where("code", "==", loginEmail.trim()));
      const codeSnap = await getDocs(qCode);

      if (!codeSnap.empty) {
        const data = codeSnap.docs[0].data();
        const userData = { 
            name: data.name || "Admin", 
            email: loginEmail, 
            isAdmin: data.admin || false 
        };
        handleRedirect(userData);
        return;
      }

      // 2. إذا لم يكن كود، تحقق من المستخدمين المسجلين (users)
      const usersRef = collection(db, "users");
      const qUser = query(usersRef, where("email", "==", loginEmail.toLowerCase().trim()));
      const userSnap = await getDocs(qUser);

      if (!userSnap.empty) {
        const data = userSnap.docs[0].data();
        if (data.password === loginPassword) {
          const userData = { 
              ...data, 
              isAdmin: data.isAdmin || false 
          };
          handleRedirect(userData);
        } else {
          setError("كلمة المرور غير صحيحة");
          setLoading(false);
        }
      } else {
        setError("الكود أو البريد الإلكتروني غير موجود");
        setLoading(false);
      }

    } catch (err) {
      console.error(err);
      setError("حدث خطأ في الاتصال: " + err.message);
      setLoading(false);
    }
  };

  // --- دالة إنشاء حساب جديد ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!regName || !regEmail || !regPassword) {
        setError("الرجاء ملء جميع الحقول");
        setLoading(false);
        return;
    }

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", regEmail.toLowerCase().trim()));
        const snap = await getDocs(q);

        if (!snap.empty) {
            setError("البريد الإلكتروني مستخدم بالفعل");
            setLoading(false);
            return;
        }

        const newUser = {
            name: regName,
            email: regEmail.toLowerCase().trim(),
            password: regPassword,
            isAdmin: false,
            createdAt: new Date().toISOString()
        };

        await addDoc(usersRef, newUser);
        handleRedirect(newUser);

    } catch (err) {
        console.error(err);
        setError("فشل إنشاء الحساب");
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#0b0c15] overflow-hidden font-sans" dir="rtl">
      
      {/* ================= القسم الأيمن: الفورم (الأسود) ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 bg-[#0b0c15] relative z-20">
        
        {/* الشعار */}
        <div className="absolute top-8 right-8 flex items-center gap-2 font-semibold text-gray-300">
           <div className="bg-blue-600 rounded-lg p-1.5"><BookOpen size={18} className="text-white" /></div>
           <span className="text-lg tracking-wide">El Agamy Materials</span>
        </div>
        
        <div className="w-full max-w-[420px]">
          
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-4xl font-bold text-white">منصة المواد الدراسية</h1>
            <p className="text-gray-500">قم بتسجيل الدخول للمتابعة</p>
          </div>

          {/* أزرار التبديل */}
          <div className="bg-[#151720] p-1.5 rounded-xl flex gap-3 border border-gray-800 mb-8">
            <button type="button" onClick={() => { setIsLogin(true); setError(""); }} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${isLogin ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>تسجيل الدخول</button>
            <button type="button" onClick={() => { setIsLogin(false); setError(""); }} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${!isLogin ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>إنشاء حساب</button>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-medium text-gray-400 mr-1">الاسم بالكامل</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors"><User size={18} /></div>
                  <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full bg-[#151720] border border-gray-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-600/30 block pr-12 p-3.5 outline-none transition-all placeholder-gray-600" placeholder="الاسم" />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 mr-1">البريد الإلكتروني أو الكود</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors"><Mail size={18} /></div>
                <input 
                    type="text" 
                    value={isLogin ? loginEmail : regEmail} 
                    onChange={(e) => isLogin ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)} 
                    className="w-full bg-[#151720] border border-gray-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-600/30 block pr-12 p-3.5 outline-none transition-all placeholder-gray-600" 
                    placeholder="البريد أو الكود" 
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 mr-1">كلمة المرور</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors"><Lock size={18} /></div>
                <input 
                    type="password" 
                    value={isLogin ? loginPassword : regPassword} 
                    onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setRegPassword(e.target.value)} 
                    className="w-full bg-[#151720] border border-gray-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-600/30 block pr-12 pl-4 p-3.5 outline-none transition-all placeholder-gray-600" 
                    placeholder="كلمة المرور" 
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-xs text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</div>}

            <button type="submit" disabled={loading} className="w-full mt-2 relative group overflow-hidden bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2">
               {loading ? <Loader2 className="animate-spin" size={20} /> : ( <><span>{isLogin ? "دخول" : "تسجيل"}</span><ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /></> )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-800 text-center">
             <p className="text-gray-500 text-xs">تحت إشراف <span className="text-blue-400 font-bold">محمد علي</span></p>
          </div>
        </div>
      </div>

      {/* ================= القسم الأيسر: الصورة والأيقونة (الأزرق) ================= */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center items-center p-12 overflow-hidden bg-gradient-to-bl from-blue-900 via-blue-950 to-[#0b0c15]">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col items-center animate-pulse-slow">
            <div className="relative">
                <GraduationCap className="w-64 h-64 text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]" strokeWidth={1} />
                <Lightbulb className="w-24 h-24 text-yellow-300 absolute -top-8 -right-4 drop-shadow-[0_0_20px_rgba(253,224,71,0.8)] animate-bounce" fill="currentColor" />
            </div>
            <h2 className="mt-8 text-4xl font-bold text-white tracking-wide text-center leading-relaxed">مستقبلك يبدأ من هنا</h2>
            <p className="text-blue-200/80 mt-2 text-lg font-light">أفضل منصة للملخصات والمواد الدراسية</p>
        </div>
      </div>
    </div>
  );
}
