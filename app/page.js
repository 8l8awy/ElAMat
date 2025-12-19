"use client";

// ✅ كل الـ imports هنا فقط
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Eye, EyeOff, Mail, Lock, GraduationCap, ArrowRight, User, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); 

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");      
  const [email, setEmail] = useState("");    
  const [password, setPassword] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const forceRedirect = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    if (login) login(userData);
    setTimeout(() => {
      if (userData.isAdmin) {
        window.location.href = "/dashboard/admin"; 
      } else {
        window.location.href = "/dashboard"; 
      }
    }, 500);
  };

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ لا يوجد import هنا!
      const codesRef = collection(db, "allowedCodes");
      const qCode = query(codesRef, where("code", "==", email.trim()));
      const codeSnap = await getDocs(qCode);

      if (!codeSnap.empty) {
        const data = codeSnap.docs[0].data();
        const userData = { name: data.name || "User", email: email, isAdmin: data.admin || false };
        forceRedirect(userData);
        return;
      }

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

  // ... باقي الكود
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      isLogin ? handleLogin(e) : handleRegister(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white font-sans relative overflow-hidden" dir="rtl">
      
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-5 bg-gradient-to-r from-black/40 via-blue-950/40 to-black/40 backdrop-blur-xl border-b border-blue-500/20 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/30 animate-pulse">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              El Agamy Materials
            </span>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen pt-20">
        
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5"></div>
          <div className="relative z-10 max-w-lg text-center">
            <div className="w-40 h-40 mx-auto mb-10 bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/50" style={{animation: 'float 3s ease-in-out infinite'}}>
              <GraduationCap className="w-24 h-24 text-white" />
            </div>
            <h1 className="text-6xl font-black mb-8 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent leading-tight">
              رحلة التفوق تبدأ هنا
            </h1>
            <p className="text-2xl text-gray-300 leading-relaxed font-light">
              انضم لآلاف الطلاب المتميزين
              <br />
              <span className="text-cyan-400 font-bold mt-3 block text-3xl">احصل على أعلى الدرجات 📚</span>
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 relative z-10">
          <div className="w-full max-w-md">
            
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                {isLogin ? "أهلاً بك مجدداً" : "ابدأ رحلتك"}
              </h2>
              <p className="text-gray-400 text-lg">
                {isLogin ? "سجل دخولك لمتابعة تفوقك" : "سجل حساب جديد الآن"}
              </p>
            </div>

            <div className="flex gap-3 mb-10 bg-slate-900/50 p-2 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
              <button 
                onClick={() => { setIsLogin(true); setError(""); }} 
                disabled={loading} 
                className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${isLogin ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105" : "text-gray-400 hover:text-white hover:bg-slate-800/50"}`}
              >
                تسجيل دخول
              </button>
              <button 
                onClick={() => { setIsLogin(false); setError(""); }} 
                disabled={loading} 
                className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 ${!isLogin ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105" : "text-gray-400 hover:text-white hover:bg-slate-800/50"}`}
              >
                إنشاء حساب
              </button>
            </div>

            <div className="space-y-6">
                
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold mb-3 text-gray-300">الاسم الكامل</label>
                  <div className="relative group">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      onKeyDown={handleKeyPress} 
                      className="w-full pr-12 pl-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all text-white placeholder-gray-500 hover:bg-slate-900/70" 
                      placeholder="محمد أحمد" 
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-300">
                  {isLogin ? "البريد أو الكود" : "البريد الإلكتروني"}
                </label>
                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  <input 
                    type="text" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    onKeyDown={handleKeyPress} 
                    className="w-full pr-12 pl-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all text-white placeholder-gray-500 hover:bg-slate-900/70" 
                    placeholder="example@gmail.com" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-gray-300">كلمة المرور</label>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    onKeyDown={handleKeyPress} 
                    className="w-full pr-12 pl-12 py-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 transition-all text-white placeholder-gray-500 hover:bg-slate-900/70" 
                    placeholder="••••••••" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              <button 
                onClick={isLogin ? handleLogin : handleRegister} 
                disabled={loading} 
                className="w-full py-5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-xl font-black text-lg text-white shadow-2xl shadow-blue-500/50 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 group"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-7 h-7" />
                ) : (
                  <>
                    {isLogin ? "دخول الآن" : "إنشاء الحساب"}
                    <ArrowRight className="w-6 h-6 rotate-180 group-hover:-translate-x-2 transition-transform" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-12 text-center text-sm text-gray-500">
              © 2025 El Agamy Materials - كل الحقوق محفوظة
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
