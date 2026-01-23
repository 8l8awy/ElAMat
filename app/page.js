"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { FaEnvelope, FaLock, FaUser, FaSignInAlt, FaUserPlus } from "react-icons/fa";

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
  
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const codesRef = collection(db, "allowedCodes");
      const qCode = query(codesRef, where("code", "==", loginEmail));
      const codeSnap = await getDocs(qCode);

      if (!codeSnap.empty) {
        const data = codeSnap.docs[0].data();
        login({ 
            name: data.name || "User", 
            email: loginEmail, 
            isAdmin: data.admin || false 
        });
        router.push("/dashboard");
        return;
      }

      const usersRef = collection(db, "users");
      const qUser = query(usersRef, where("email", "==", loginEmail));
      const userSnap = await getDocs(qUser);

      if (!userSnap.empty) {
        const data = userSnap.docs[0].data();
        if (data.password === loginPassword) {
          login({ ...data, isAdmin: data.isAdmin || false });
          router.push("/dashboard");
        } else {
          setError("كلمة المرور غير صحيحة");
        }
      } else {
        setError("الكود أو البريد الإلكتروني غير موجود");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

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
        const q = query(usersRef, where("email", "==", regEmail));
        const snap = await getDocs(q);

        if (!snap.empty) {
            setError("البريد الإلكتروني مستخدم بالفعل");
            setLoading(false);
            return;
        }

        const newUser = {
            name: regName,
            email: regEmail,
            password: regPassword,
            isAdmin: false,
            createdAt: new Date().toISOString()
        };

        await addDoc(usersRef, newUser);
        login(newUser);
        router.push("/dashboard");
    } catch (err) {
        setError("فشل إنشاء الحساب");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" dir="rtl">
      {/* الفورم الشفاف المنسجم مع الخلفية البنفسجية */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10 animate-fadeIn">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent mb-2">
            El Agamy Materials
          </h1>
          <p className="text-gray-400 text-sm">منصة المواد الدراسية</p>
        </div>

        {/* أزرار التبديل */}
        <div className="flex bg-black/40 p-1 rounded-2xl mb-8 border border-white/5">
          <button 
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${isLogin ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" : "text-gray-400 hover:text-white"}`}
            onClick={() => {setIsLogin(true); setError("");}}
          >
            تسجيل الدخول
          </button>
          <button 
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${!isLogin ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20" : "text-gray-400 hover:text-white"}`}
            onClick={() => {setIsLogin(false); setError("");}}
          >
            إنشاء حساب
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <FaUser className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 focus:border-purple-500 focus:outline-none text-white transition-all"
                placeholder="الاسم بالكامل"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="relative">
            <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 focus:border-purple-500 focus:outline-none text-white transition-all"
              placeholder={isLogin ? "الكود أو البريد الإلكتروني" : "البريد الإلكتروني"}
              value={isLogin ? loginEmail : regEmail}
              onChange={(e) => isLogin ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="password"
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 focus:border-purple-500 focus:outline-none text-white transition-all"
              placeholder="كلمة المرور"
              value={isLogin ? loginPassword : regPassword}
              onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setRegPassword(e.target.value)}
              required={!isLogin}
            />
          </div>

          {error && <p className="text-red-400 text-xs font-bold text-center animate-pulse">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{isLogin ? "دخول" : "ابدأ الآن"}</span>
                <FaSignInAlt />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-500 text-xs">تحت إشراف <strong className="text-purple-400">محمد علي</strong></p>
        </div>
      </div>
    </div>
  );
}
