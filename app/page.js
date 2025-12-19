"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// استيراد أدوات Firebase الحقيقية
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
// مكتبة الأيقونات
import { Eye, EyeOff, Mail, Lock, GraduationCap, ArrowRight, User, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  // === 1. تعريف الحالات (State) ===
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [name, setName] = useState("");      
  const [email, setEmail] = useState("");    
  const [password, setPassword] = useState(""); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth(); // استخدام الكونتكست لتحديث حالة التطبيق
  const router = useRouter();  // للتوجيه بين الصفحات

  // === 2. دالة التوجيه والحفظ (Logic) ===
  const forceRedirect = (userData) => {
    // حفظ البيانات في LocalStorage لضمان بقاء الدخول عند تحديث الصفحة
    localStorage.setItem("user", JSON.stringify(userData));
    // تحديث حالة التطبيق
    login(userData);
    
    // التوجيه بناءً على الصلاحية
    setTimeout(() => {
        if (userData.isAdmin) {
            router.push("/dashboard/admin"); 
        } else {
            router.push("/dashboard"); 
        }
    }, 500);
  };

  // === 3. دالة تسجيل الدخول الحقيقية ===
  const handleLogin = async (e) => {
    // (إذا تم استدعاؤها من الزر مباشرة بدون event، نتخطى preventDefault)
    if (e && e.preventDefault) e.preventDefault();
    
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
      setError("حدث خطأ في الاتصال: " + err.message);
      setLoading(false);
    }
  };

  // === 4. دالة إنشاء الحساب الحقيقية ===
  const handleRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");

    if (!name || !email || !password) {
        setError("الرجاء ملء جميع الحقول");
        return;
    }

    setLoading(true);

    try {
      const usersRef = collection(db, "users");
      // التأكد من عدم تكرار الإيميل
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

      // إضافة المستخدم لقاعدة البيانات
      await addDoc(usersRef, newUser);
      forceRedirect(newUser);

    } catch (err) {
        console.error(err);
        setError("فشل إنشاء الحساب: " + err.message);
        setLoading(false);
    }
  };

  // === 5. معالجة مفتاح Enter ===
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      if (isLogin) {
        handleLogin(e);
      } else {
        handleRegister(e);
      }
    }
  };

  // === 6. واجهة المستخدم (UI) ===
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
        
        {/* Left Side - Info */}
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
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${isLogin ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30" : "text-gray-400 hover:text-white"}`}
              >
                تسجيل دخول
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(""); }}
                disabled={loading}
                className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all duration-300 ${!isLogin ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30" : "text-gray-400 hover:text-white"}`}
              >
                إنشاء حساب
              </button>
            </div>

            <div>
                {/* Name Input (Only Register) */}
                {!isLogin && (
                    <div className="mb-5 animate-fadeIn">
                      <label className="block text-sm font-medium mb-2 text-gray-300">الاسم الكامل</label>
                      <div className="relative">
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="w-full pr-12 pl-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder-gray-600"
                            placeholder="أدخل اسمك الكامل"
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
                        onKeyDown={handleKeyPress}
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
                        onKeyDown={handleKeyPress}
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
                    onClick={isLogin ? handleLogin : handleRegister}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-6 h-6" />
                  ) : (
                    <>
                      {isLogin ? "دخول" : "إنشاء حساب"}
                      <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform rotate-180" />
                    </>
                  )}
                </button>
            </div>

            {/* Social Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-br from-black via-gray-900 to-blue-950 text-gray-400">
                    أو استمر بـ
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => alert("قريباً")}
                  className="py-3 px-4 bg-gray-900/50 border border-gray-700 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <div className="w-5 h-5 bg-white rounded"></div>
                  Google
                </button>
                <button 
                  type="button"
                  onClick={() => alert("قريباً")}
                  className="py-3 px-4 bg-gray-900/50 border border-gray-700 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                >
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded"></div>
                  Microsoft
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-sm text-gray-500">
              © 2025 El Agamy Materials.{' '}
              <button 
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                سياسة الخصوصية
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
