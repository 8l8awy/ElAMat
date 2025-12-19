"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // للتوجيه
import { useAuth } from '@/context/AuthContext'; // السياق الخاص بنا
import { db } from '@/lib/firebase'; // قاعدة البيانات
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Eye, EyeOff, Mail, Lock, GraduationCap, ArrowRight, User, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  // === 1. تعريف الحالات (State) ===
  const [isLogin, setIsLogin] = useState(true); // للتبديل بين الدخول والتسجيل
  const [showPassword, setShowPassword] = useState(false);
  
  const [name, setName] = useState("");      
  const [email, setEmail] = useState("");    
  const [password, setPassword] = useState(""); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth(); 

  // === 2. دالة التوجيه (Logic) ===
  const forceRedirect = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    login(userData);
    
    setTimeout(() => {
        if (userData.isAdmin) {
            window.location.href = "/dashboard/admin"; 
        } else {
            window.location.href = "/dashboard"; 
        }
    }, 500);
  };

  // === 3. تسجيل الدخول (Logic) ===
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // أ) البحث في الأكواد (للأدمن)
      const codesRef = collection(db, "allowedCodes");
      const qCode = query(codesRef, where("code", "==", email.trim()));
      const codeSnap = await getDocs(qCode);

      if (!codeSnap.empty) {
        const data = codeSnap.docs[0].data();
        const userData = { name: data.name || "User", email: email, isAdmin: data.admin || false };
        forceRedirect(userData); 
        return;
      }

      // ب) البحث في المستخدمين (للطلاب)
      const usersRef = collection(db, "users");
      const qUser = query(usersRef, where("email", "==", email.toLowerCase().trim()));
      const userSnap = await getDocs(qUser);

      if (!userSnap.empty) {
        const data = userSnap.docs[0].data();
        if (data.password === password) {
          const userData = { ...data, isAdmin: data.isAdmin || false };
          forceRedirect(userData);
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
      setError("حدث خطأ: " + err.message);
      setLoading(false);
    }
  };

  // === 4. إنشاء حساب (Logic) ===
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name || !email || !password) {
        setError("الرجاء ملء جميع الحقول");
        setLoading(false);
        return;
    }

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email.toLowerCase().trim()));
        const snap = await getDocs(q);

        if (!snap.empty) {
            setError("البريد الإلكتروني مستخدم بالفعل");
            setLoading(false);
            return;
        }

        const newUser = {
            name: name,
            email: email.toLowerCase().trim(),
            password: password,
            isAdmin: false,
            createdAt: new Date().toISOString()
        };

        await addDoc(usersRef, newUser);
        forceRedirect(newUser); 

    } catch (err) {
        console.error(err);
        setError("فشل إنشاء الحساب: " + err.message);
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-950 text-white font-sans" dir="rtl">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/30 backdrop-blur-md border-b border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            El Agamy Materials
          </span>
        </div>
        <button className="text-blue-300 hover:text-blue-200 transition-colors text-sm font-medium">
          مساعدة
        </button>
      </header>

      <div className="flex min-h-screen pt-20">
        
        {/* Left Side - Info (يظهر في الشاشات الكبيرة فقط) */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 backdrop-blur-3xl"></div>
          
          <div className="relative z-10 max-w-lg text-center">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/50 animate-pulse">
              <GraduationCap className="w-20 h-20 text-white" />
            </div>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent leading-tight">
              طور مستواك الدراسي
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed font-light">
              احصل على الملخصات، شارك الملاحظات، وتعاون مع زملائك في منصة العجمي التعليمية.
              <br />
              <span className="text-blue-300 font-medium mt-2 block">المعرفة تنمو بالمشاركة.</span>
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md">
            
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                {isLogin ? "مرحباً بعودتك" : "انضم إلينا الآن"}
              </h2>
              <p className="text-gray-400">
                {isLogin ? "أدخل بياناتك للدخول إلى المنصة" : "أنشئ حسابك لبدء رحلة التعلم"}
              </p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-4 mb-8 bg-gray-900/50 p-1 rounded-full border border-gray-700/50">
              <button 
                onClick={() => { setIsLogin(true); setError(""); }}
                className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${isLogin ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30" : "text-gray-400 hover:text-white"}`}
              >
                تسجيل دخول
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(""); }}
                className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${!isLogin ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30" : "text-gray-400 hover:text-white"}`}
              >
                إنشاء حساب
              </button>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleRegister}>
                
                {/* Name Input (Only Register) */}
                {!isLogin && (
                    <div className="mb-5 animate-fadeIn">
                    <label className="block text-sm font-medium mb-2 text-gray-300">الاسم</label>
                    <div className="relative">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pr-12 pl-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder-gray-600"
                        placeholder="الاسم الكامل"
                        />
                    </div>
                    </div>
                )}

                {/* Email Input */}
                <div className="mb-5">
                <label className="block text-sm font-medium mb-2 text-gray-300">
                    {isLogin ? "البريد الإلكتروني أو الكود" : "البريد الإلكتروني"}
                </label>
                <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pr-12 pl-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder-gray-600"
                    placeholder="example@gmail.com"
                    />
                </div>
                </div>

                {/* Password Input */}
                <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">كلمة المرور</label>
                </div>
                <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-12 pl-12 py-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder-gray-600"
                    placeholder="••••••••"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:scale-100"
                >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
                    <>
                    {isLogin ? "دخول" : "إنشاء حساب"}
                    <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                    </>
                )}
                </button>
            </form>

            {/* Footer Links */}
            <div className="mt-12 text-center text-sm text-gray-500">
              © 2025 El Agamy Materials.{' '}
              <button className="text-blue-400 hover:text-blue-300 transition-colors underline">
                سياسة الخصوصية
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
