"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
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
        login({ name: data.name || "User", email: loginEmail, isAdmin: data.admin || false });
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
        } else { setError("كلمة المرور غير صحيحة"); }
      } else { setError("الكود أو البريد الإلكتروني غير موجود"); }
    } catch (err) { setError("حدث خطأ في الاتصال"); }
    finally { setLoading(false); }
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
      const newUser = { name: regName, email: regEmail, password: regPassword, isAdmin: false, createdAt: new Date().toISOString() };
      await addDoc(usersRef, newUser);
      login(newUser);
      router.push("/dashboard");
    } catch (err) { setError("فشل إنشاء الحساب"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black relative overflow-hidden" dir="rtl">
      
      {/* التوهج البنفسجي في الخلفية (Glow Background) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-purple-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple-600/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white mb-2">El Agamy Materials</h2>
          <p className="text-gray-500 text-sm font-bold">منصة المواد الدراسية</p>
        </div>

        {/* أزرار التبديل - التصميم القديم المُحسن */}
        <div className="flex bg-black rounded-xl p-1 mb-6 border border-white/5">
          <button 
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${isLogin ? "bg-purple-600 text-white" : "text-gray-500"}`}
            onClick={() => {setIsLogin(true); setError("");}}
          >
            تسجيل الدخول
          </button>
          <button 
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${!isLogin ? "bg-purple-600 text-white" : "text-gray-500"}`}
            onClick={() => {setIsLogin(false); setError("");}}
          >
            إنشاء حساب
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <input 
              type="text" value={regName} onChange={(e) => setRegName(e.target.value)}
              placeholder="الاسم" className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:border-purple-600 outline-none transition-all"
              required 
            />
          )}
          <input 
            type="text" value={isLogin ? loginEmail : regEmail} 
            onChange={(e) => isLogin ? setLoginEmail(e.target.value) : setRegEmail(e.target.value)}
            placeholder={isLogin ? "البريد الإلكتروني أو الكود" : "البريد الإلكتروني"}
            className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:border-purple-600 outline-none transition-all"
            required 
          />
          <input 
            type="password" value={isLogin ? loginPassword : regPassword}
            onChange={(e) => isLogin ? setLoginPassword(e.target.value) : setRegPassword(e.target.value)}
            placeholder="كلمة المرور" className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:border-purple-600 outline-none transition-all"
            required 
          />

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

          <button type="submit" disabled={loading} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>جاري المعالجة...</span>
              </div>
            ) : isLogin ? "دخول" : "إنشاء حساب"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-600 text-[10px] uppercase tracking-widest">إشراف: محمد علي</p>
        </div>
      </div>
    </div>
  );
}
