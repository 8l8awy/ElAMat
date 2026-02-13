"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { db, auth, googleProvider } from "../lib/firebase"; // تأكد من استيراد auth و googleProvider
import { signInWithPopup } from "firebase/auth";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { FaGoogle, FaShieldAlt } from "react-icons/fa"; // أيقونات للشكل الجمالي

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

  // --- دالة تسجيل الدخول بجوجل (الميزة الجديدة) ---
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // حفظ بيانات المستخدم أو تحديثها في الفايربيز (اختياري)
      const newUser = {
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
        isAdmin: false, // يمكن تعديلها لاحقاً من الـ Firestore
        lastLogin: new Date().toISOString()
      };

      login(newUser);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("فشل تسجيل الدخول بواسطة جوجل");
    } finally {
      setLoading(false);
    }
  };

  // --- دالة تسجيل الدخول اليدوي (كودك القديم) ---
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

  return (
    <div className="login-container relative overflow-hidden bg-[#050505] min-h-screen flex items-center justify-center font-sans" dir="rtl">
      
      {/* التوهج الخلفي اللي في كودك */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-purple-600/10 rounded-full blur-[100px] md:blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-600/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="login-box bg-[#111]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md z-10 text-center">
        <div className="flex justify-center mb-4">
           <div className="w-16 h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center border border-purple-500/20">
              <FaShieldAlt className="text-purple-500 text-3xl" />
           </div>
        </div>
        
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">El Agamy Materials</h2>
        <p className="text-gray-500 text-sm mb-6">منصة المواد الدراسية الذكية</p>

        <div className="tab-buttons flex gap-2 bg-black/50 p-1 rounded-2xl mb-6">
          <button className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${isLogin ? "bg-purple-600 text-white" : "text-gray-500"}`} onClick={() => {setIsLogin(true); setError("");}}>تسجيل دخول</button>
          <button className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${!isLogin ? "bg-purple-600 text-white" : "text-gray-500"}`} onClick={() => {setIsLogin(false); setError("");}}>إنشاء حساب</button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="text" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="الكود أو البريد الإلكتروني" className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all text-white text-sm" required />
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="كلمة المرور" className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all text-white text-sm" />
            <button type="submit" disabled={loading} className="w-full bg-purple-600 p-4 rounded-2xl font-black hover:bg-purple-500 transition-all active:scale-95 shadow-lg shadow-purple-600/20">
                {loading ? "جاري التحقق..." : "دخول"}
            </button>
          </form>
        ) : (
          <form className="space-y-3">
             <input type="text" placeholder="الاسم" className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none text-white text-sm" />
             <input type="email" placeholder="البريد الإلكتروني" className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none text-white text-sm" />
             <input type="password" placeholder="كلمة المرور" className="w-full bg-black border border-white/10 p-4 rounded-2xl outline-none text-white text-sm" />
             <button type="button" className="w-full bg-purple-600 p-4 rounded-2xl font-black">إنشاء حساب</button>
          </form>
        )}

        {/* فاصل "أو" */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/5"></div>
          <span className="px-3 text-[10px] text-gray-600 uppercase font-bold">أو عن طريق</span>
          <div className="flex-1 border-t border-white/5"></div>
        </div>

        {/* زر جوجل الاحترافي */}
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black p-4 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95 mb-6"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5" alt="google" />
          <span className="text-sm">متابعة باستخدام جوجل</span>
        </button>

        {error && <p className="text-red-500 text-xs font-bold mb-4">{error}</p>}
        
        <div className="dev-footer pt-4 border-t border-white/5">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest leading-relaxed">تحت إشراف <strong>محمد علي</strong></p>
        </div>
      </div>
    </div>
  );
}
