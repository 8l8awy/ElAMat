"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { db, auth, googleProvider } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { FaGoogle, FaShieldAlt, FaUserPlus, FaSignInAlt } from "react-icons/fa";

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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const router = useRouter();

  // التحويل التلقائي إذا كان مسجل دخول
  useEffect(() => {
    if (user) router.push("/dashboard/subjects");
  }, [user, router]);

  // --- 1. تسجيل الدخول بجوجل ---
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;

      // نتحقق إذا كان المستخدم مسجل عندنا أصلاً
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", gUser.email));
      const snap = await getDocs(q);

      let userData;
      if (snap.empty) {
        // إذا كان جديد، نسجله كطالب
        userData = {
          name: gUser.displayName,
          email: gUser.email,
          role: "student",
          isAdmin: false,
          createdAt: new Date().toISOString()
        };
        await addDoc(usersRef, userData);
      } else {
        userData = snap.docs[0].data();
      }

      login(userData);
      router.push("/dashboard/subjects");
    } catch (err) {
      setError("فشل تسجيل الدخول بجوجل");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. تسجيل الدخول اليدوي (إيميل/كود) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // التحقق من الأكواد (allowedCodes)
      const codesRef = collection(db, "allowedCodes");
      const qCode = query(codesRef, where("code", "==", loginEmail.trim()));
      const codeSnap = await getDocs(qCode);

      if (!codeSnap.empty) {
        const data = codeSnap.docs[0].data();
        login({ name: data.name || "User", email: loginEmail, role: data.admin ? "admin" : "student", isAdmin: data.admin || false });
        router.push("/dashboard/subjects");
        return;
      }

      // التحقق من الإيميل (users)
      const usersRef = collection(db, "users");
      const qUser = query(usersRef, where("email", "==", loginEmail.trim().toLowerCase()));
      const userSnap = await getDocs(qUser);

      if (!userSnap.empty) {
        const data = userSnap.docs[0].data();
        if (data.password === loginPassword) {
          login({ ...data });
          router.push("/dashboard/subjects");
        } else {
          setError("كلمة المرور غير صحيحة");
        }
      } else {
        setError("الحساب غير موجود");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. إنشاء حساب جديد ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError("يرجى ملء جميع الحقول");
      setLoading(false);
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", regEmail.trim().toLowerCase()));
      const snap = await getDocs(q);

      if (!snap.empty) {
        setError("البريد الإلكتروني مسجل بالفعل");
        setLoading(false);
        return;
      }

      const newUser = {
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        role: "student",
        isAdmin: false,
        createdAt: new Date().toISOString()
      };

      await addDoc(usersRef, newUser);
      login(newUser);
      setMessage("تم إنشاء الحساب بنجاح ✅");
      setTimeout(() => router.push("/dashboard/subjects"), 1000);
    } catch (err) {
      setError("فشل إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      
      {/* تأثيرات الإضاءة الخلفية */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-purple-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-[#111]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl z-10">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
            <FaShieldAlt className="text-purple-500 text-3xl" />
          </div>
          <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">El Agamy Materials</h1>
          <p className="text-gray-500 text-xs mt-1">بوابة الطلاب الذكية</p>
        </div>

        <div className="flex bg-black/50 p-1 rounded-2xl mb-6">
          <button onClick={() => {setIsLogin(true); setError("");}} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${isLogin ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>دخول</button>
          <button onClick={() => {setIsLogin(false); setError("");}} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${!isLogin ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>تسجيل</button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="الكود أو البريد الإلكتروني" value={loginEmail} onChange={(e)=>setLoginEmail(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500 text-white text-sm" required />
            <input type="password" placeholder="كلمة المرور" value={loginPassword} onChange={(e)=>setLoginPassword(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500 text-white text-sm" />
            <button type="submit" disabled={loading} className="w-full bg-purple-600 p-4 rounded-2xl font-black hover:bg-purple-500 transition-all active:scale-95 flex items-center justify-center gap-2">
              <FaSignInAlt /> {loading ? "جاري التحقق..." : "تسجيل الدخول"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <input type="text" placeholder="الاسم الكامل" value={regName} onChange={(e)=>setRegName(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500 text-white text-sm" required />
            <input type="email" placeholder="البريد الإلكتروني" value={regEmail} onChange={(e)=>setRegEmail(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500 text-white text-sm" required />
            <input type="password" placeholder="كلمة المرور" value={regPassword} onChange={(e)=>setRegPassword(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500 text-white text-sm" required />
            <button type="submit" disabled={loading} className="w-full bg-purple-600 p-4 rounded-2xl font-black hover:bg-purple-500 transition-all active:scale-95 flex items-center justify-center gap-2">
              <FaUserPlus /> {loading ? "جاري الإنشاء..." : "إنشاء حساب مجاني"}
            </button>
          </form>
        )}

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <span className="relative bg-[#111] px-4 text-[10px] text-gray-600 uppercase font-bold">أو أكمل بواسطة</span>
        </div>

        <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-white text-black p-4 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5" alt="google" />
          <span className="text-sm font-bold">حساب جوجل</span>
        </button>

        {error && <p className="text-red-500 text-[10px] font-bold mt-4 text-center animate-bounce">{error}</p>}
        {message && <p className="text-green-500 text-[10px] font-bold mt-4 text-center">{message}</p>}

        <p className="text-center text-[10px] text-gray-600 mt-8 leading-relaxed uppercase tracking-widest">
          تحت إشراف <span className="text-white font-bold">محمد علي دياب</span>
        </p>
      </div>
    </div>
  );
}
