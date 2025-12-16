"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

/*export default function LoginPage() {
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

  // إذا كان المستخدم مسجلاً بالفعل، حوله للوحة التحكم
  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  // --- دالة تسجيل الدخول ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. التحقق أولاً من الأكواد المسموحة (allowedCodes)
      // في كودك القديم، كان الكود يُستخدم كـ "email" في الفورم
      const codesRef = collection(db, "allowedCodes");
      const qCode = query(codesRef, where("code", "==", loginEmail));
      const codeSnap = await getDocs(qCode);

      if (!codeSnap.empty) {
        const data = codeSnap.docs[0].data();
        // تسجيل الدخول بنجاح كطالب أو أدمن
        login({ 
            name: data.name || "User", 
            email: loginEmail, 
            isAdmin: data.admin || false // هنا يتم تحديد الأدمن
        });
        router.push("/dashboard");
        return;
      }

      // 2. إذا لم يكن كود، تحقق من المستخدمين المسجلين (users)
      const usersRef = collection(db, "users");
      const qUser = query(usersRef, where("email", "==", loginEmail));
      const userSnap = await getDocs(qUser);

      if (!userSnap.empty) {
        const data = userSnap.docs[0].data();
        if (data.password === loginPassword) {
          login({ 
              ...data, 
              isAdmin: data.isAdmin || false 
          });
          router.push("/dashboard");
        } else {
          setError("كلمة المرور غير صحيحة");
        }
      } else {
        setError("الكود أو البريد الإلكتروني غير موجود");
      }

    } catch (err) {
      console.error(err);
      setError("حدث خطأ في الاتصال: " + err.message);
    } finally {
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
        
        // تسجيل الدخول مباشرة بعد الإنشاء
        login(newUser);
        router.push("/dashboard");

    } catch (err) {
        console.error(err);
        setError("فشل إنشاء الحساب");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>El Agamy Materials</h2>
        <p>منصة المواد الدراسية</p>

        <div className="tab-buttons">
          <button className={`tab-btn ${isLogin ? "active" : ""}`} onClick={() => {setIsLogin(true); setError("");}}>تسجيل الدخول</button>
          <button className={`tab-btn ${!isLogin ? "active" : ""}`} onClick={() => {setIsLogin(false); setError("");}}>إنشاء حساب</button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <input 
                type="text" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                placeholder=" البريد الإلكتروني" 
                required
            />
            <input 
                type="password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                placeholder="كلمة المرور " 
            />
            <button type="submit" disabled={loading} className="btn">
                {loading ? "جاري التحقق..." : "دخول"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="الاسم" required />
            <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="البريد الإلكتروني" required />
            <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="كلمة المرور" required />
            <button type="submit" disabled={loading} className="btn">
                {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
            </button>
          </form>
        )}
        
        {error && <p className="error-msg">{error}</p>}
        
        <div className="dev-footer">
            <p className="dev-text">تحت إشراف <strong>محمد علي</strong></p>
        </div>
      </div>
    </div>
  );
}
