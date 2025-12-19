"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext"; // تأكدي من المسار
import { db } from "@/lib/firebase"; 
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
// تأكدي من تثبيت المكتبة: npm install lucide-react
import { Mail, Lock, User, ArrowLeft, BookOpen, GraduationCap, Lightbulb, Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth(); 
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");      
  const [email, setEmail] = useState("");    
  const [password, setPassword] = useState(""); 

  // دالة التوجيه
  const forceRedirect = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    login(userData);
    
    setTimeout(() => {
        window.location.href = userData.isAdmin ? "/dashboard/admin" : "/dashboard"; 
    }, 500);
  };

  // تسجيل الدخول
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. بحث في الأكواد
      const codesRef = collection(db, "allowedCodes");
      const qCode = query(codesRef, where("code", "==", email.trim()));
      const codeSnap = await getDocs(qCode);

      if (!codeSnap.empty) {
        const data = codeSnap.docs[0].data();
        forceRedirect({ name: data.name || "User", email: email, isAdmin: data.admin || false });
        return;
      }

      // 2. بحث في المستخدمين
      const usersRef = collection(db, "users");
      const qUser = query(usersRef, where("email", "==", email.toLowerCase().trim()));
      const userSnap = await getDocs(qUser);

      if (!userSnap.empty) {
        const data = userSnap.docs[0].data();
        if (data.password === password) {
          forceRedirect({ ...data, isAdmin: data.isAdmin || false });
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

  // إنشاء حساب
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
    // استخدمنا Grid لضمان تقسيم الشاشة بشكل صحيح
    <div className="grid min-h-screen w-full lg:grid-cols-2 bg-[#0b0c15] overflow-hidden font-sans" dir="rtl">
      
      {/* ================= القسم الأيمن: الفورم ================= */}
      <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-20 relative z-20">
        
        {/* الشعار */}
        <div className="absolute top-6 right-6 lg:top-10 lg:right-10 flex items-center gap-2 font-semibold text-gray-300">
           <div className="bg-blue-600 rounded-lg p-1.5"><BookOpen size={18} className="text-white" /></div>
           <span className="text-lg tracking-wide hidden sm:inline">El Agamy Materials</span>
        </div>
        
        {/* صندوق الفورم بحجم محدد لمنع التمدد */}
        <div className="w-full max-w-md mx-auto space-y-8">
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-white tracking-tight">مرحباً بك 👋</h1>
            <p className="text-gray-500">منصة المواد الدراسية المتكاملة</p>
          </div>

          {/* أزرار التبديل */}
          <div className="bg-[#151720] p-1.5 rounded-xl flex border border-gray-800">
            <button type="button" onClick={() => { setIsLogin(true); setError(""); }} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${isLogin ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}>تسجيل الدخول</button>
            <button type="button" onClick={() => { setIsLogin(false); setError(""); }} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${!isLogin ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}>إنشاء حساب</button>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-medium text-gray-400 mr-1">الاسم بالكامل</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500"><ShieldCheck size={18} /></div>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#151720] border border-gray-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-600/50 block pr-12 p-3.5 outline-none transition-all placeholder-gray-600" placeholder="الاسم ثلاثي" />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 mr-1">البريد الإلكتروني أو الكود</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500"><Mail size={18} /></div>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#151720] border border-gray-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-600/50 block pr-12 p-3.5 outline-none transition-all placeholder-gray-600" placeholder="البريد أو الكود" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 mr-1">كلمة المرور</label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500"><Lock size={18} /></div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#151720] border border-gray-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-600/50 block pr-12 pl-4 p-3.5 outline-none transition-all placeholder-gray-600" placeholder="••••••••" />
              </div>
            </div>

            {error && <div className="text-red-400 text-xs text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

            <button type="submit" disabled={loading} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2">
               {loading ? <Loader2 className="animate-spin" size={20} /> : ( <><span>{isLogin ? "دخول" : "تسجيل"}</span><ArrowLeft size={18} /></> )}
            </button>
          </form>

          <div className="pt-6 border-t border-gray-800 text-center">
             <p className="text-gray-500 text-xs">تم التطوير بواسطة <span className="text-blue-400 font-bold hover:underline cursor-pointer">محمد علي</span></p>
          </div>
        </div>
      </div>

      {/* ================= القسم الأيسر: الصورة (يظهر فقط في الشاشات الكبيرة) ================= */}
      <div className="hidden lg:flex relative flex-col justify-center items-center p-12 overflow-hidden bg-gradient-to-br from-blue-900 via-[#0f172a] to-[#0b0c15]">
        {/* تأثيرات الخلفية */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        {/* المحتوى */}
        <div className="relative z-10 text-center space-y-6 max-w-lg">
            <div className="relative inline-block">
                <GraduationCap className="w-64 h-64 text-blue-100 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]" strokeWidth={0.8} />
                <Lightbulb className="w-20 h-20 text-yellow-400 absolute -top-4 -right-4 animate-bounce drop-shadow-lg" fill="currentColor" />
            </div>
            
            <div className="space-y-2">
                <h2 className="text-4xl font-bold text-white tracking-wide leading-tight">مستقبلك يبدأ <br/><span className="text-blue-500">من هنا</span></h2>
                <p className="text-blue-200/60 text-lg font-light leading-relaxed">أفضل منصة للملخصات والمواد الدراسية<br/>كل ما تحتاجه في مكان واحد</p>
            </div>
        </div>
      </div>

    </div>
  );
}
