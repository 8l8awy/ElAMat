"use client";



import { useState } from "react";

import { useAuth } from "@/context/AuthContext";

import { db } from "@/lib/firebase"; 

import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

import { Mail, Lock, ArrowLeft, BookOpen, ShieldCheck, GraduationCap, Lightbulb } from "lucide-react"; // استبدلنا ArrowRight بـ ArrowLeft



export default function LoginPage() {

  const { login } = useAuth(); 

  

  const [isLogin, setIsLogin] = useState(true);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");



  const [name, setName] = useState("");      

  const [email, setEmail] = useState("");    

  const [password, setPassword] = useState(""); 



  const forceRedirect = (userData) => {

    localStorage.setItem("user", JSON.stringify(userData));

    login(userData);

    console.log("🚀 إجبار المتصفح على الانتقال...");

    setTimeout(() => {

        if (userData.isAdmin) {

            window.location.href = "/dashboard/admin"; 

        } else {

            window.location.href = "/dashboard"; 

        }

    }, 500);

  };



  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    setLoading(true);



    try {

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

    // تم تغيير dir إلى rtl لدعم العربية

    <div className="min-h-screen w-full bg-[#0b0c15] flex items-center justify-center relative overflow-hidden text-white font-sans" dir="rtl">

      

      {/* خلفية جمالية */}

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>



      {/* الشعار في الزاوية العلوية اليمنى */}

      <div className="absolute top-8 right-8 flex items-center gap-2 font-semibold text-gray-300">

          <div className="bg-blue-600 rounded-lg p-1.5"><BookOpen size={16} className="text-white" /></div>

          <span>El Agamy Materials </span>

      </div>



      {/* ================= بطاقة التسجيل ================= */}

      <div className="w-full max-w-[450px] bg-[#12141c] border border-gray-800/50 p-8 rounded-3xl shadow-2xl relative z-10 mx-4 backdrop-blur-sm">

        

        {/* الشعار والأيقونة */}

        <div className="flex flex-col items-center mb-8">

            <div className="flex items-center gap-2 font-semibold text-gray-300 mb-6 bg-gray-900/50 px-4 py-1.5 rounded-full border border-gray-800">

               <BookOpen size={16} className="text-blue-500" />

               <span className="text-sm">El Agamy Materials</span>

            </div>



            <div className="relative mb-2">

                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>

                <div className="relative">

                    <GraduationCap className="w-16 h-16 text-white drop-shadow-md" strokeWidth={1.5} />

                    <Lightbulb className="w-6 h-6 text-yellow-400 absolute -top-2 -right-1 animate-bounce" fill="currentColor" />

                </div>

            </div>

            

            <h2 className="text-2xl font-bold text-white mt-4">

              {isLogin ? "مرحباً بك مجدداً" : "ابدأ رحلة التعلم"}

            </h2>

            <p className="text-gray-500 text-sm mt-1">

              {isLogin ? "سجل الدخول للوصول إلى الملخصات " : "أنشئ حسابك الجديد الآن"}

            </p>

        </div>



        {/* أزرار التبديل */}

        <div className="bg-[#0b0c15] p-1.5 rounded-xl flex gap-3 relative border border-gray-800 mb-6">

          <button type="button" onClick={() => { setIsLogin(true); setError(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${isLogin ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 bg-[#151720] hover:bg-[#1a1d26] hover:text-white"}`}>تسجيل دخول</button>

          <button type="button" onClick={() => { setIsLogin(false); setError(""); }} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${!isLogin ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 bg-[#151720] hover:bg-[#1a1d26] hover:text-white"}`}>إنشاء حساب</button>

        </div>



        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">

          {!isLogin && (

            <div className="space-y-1.5 animate-fadeIn">

              <label className="text-xs font-medium text-gray-400 mr-1">الاسم</label>

              <div className="relative group">

                {/* تعديل مكان الأيقونة لليمين */}

                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><ShieldCheck className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" /></div>

                {/* تعديل الـ padding للنص */}

                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0b0c15] border border-gray-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block pr-12 p-3.5 outline-none transition-all placeholder-gray-600" placeholder="الاسم" />

              </div>

            </div>

          )}

          

          <div className="space-y-1.5">

            <label className="text-xs font-medium text-gray-400 mr-1">البريد الإلكتروني أو الكود</label>

            <div className="relative group">

              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" /></div>

              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0b0c15] border border-gray-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block pr-12 p-3.5 outline-none transition-all placeholder-gray-600" placeholder="البريد أو الكود" />

            </div>

          </div>

          

          <div className="space-y-1.5">

            <label className="text-xs font-medium text-gray-400 mr-1">كلمة المرور</label>

            <div className="relative group">

              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" /></div>

              <input 

                type="text" 

                value={password} 

                onChange={(e) => setPassword(e.target.value)} 

                className="w-full bg-[#0b0c15] border border-gray-800 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block pr-12 pl-4 p-3.5 outline-none transition-all placeholder-gray-600" 

                placeholder="أدخل كلمة المرور" 

              />

            </div>

          </div>



          {error && <div className="text-red-500 text-xs text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</div>}



          <button type="submit" disabled={loading} className="w-full mt-2 relative group overflow-hidden bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:-translate-y-0.5 disabled:opacity-50">

            <div className="flex items-center justify-center gap-2">

               <span>{loading ? "جاري المعالجة..." : (isLogin ? "دخول" : "إنشاء الحساب")}</span>

               {/* استخدام سهم لليسار ليتناسب مع العربية */}

               {!loading && <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />}

            </div>

          </button>

        </form>


        <div className="mt-8 text-center text-[10px] text-gray-600">

           © 2025 محمد علي . <span className="underline cursor-pointer hover:text-gray-400">سياسة الخصوصية</span>

        </div>



      </div>

    </div>

  );

}
