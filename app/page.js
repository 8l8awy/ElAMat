"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { db } from "../lib/firebase"; // ✅ مسار صحيح
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";

export default function AuthPage() {
  const router = useRouter();
  
  // حالة التبديل بين الدخول وإنشاء الحساب
  const [isRegister, setIsRegister] = useState(false); 

  // الخانات
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);

  // 🟢 دالة تسجيل الدخول
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const q = query(collection(db, "allowedCodes"), where("code", "==", inputCode.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.admin === true) {
          localStorage.setItem("adminCode", inputCode.trim());
          router.push("/dashboard/admin");
        } else {
          alert(`مرحباً بك يا ${userData.name || "طالب"}!`);
        }
      } else {
        alert("⛔ الكود غير صحيح!");
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ في الاتصال");
    }
    setLoading(false);
  };

  // 🔵 دالة إنشاء حساب جديد
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. توليد كود عشوائي من 5 أرقام
      const newCode = Math.floor(10000 + Math.random() * 90000).toString();

      // 2. حفظ البيانات في فايربيز
      await addDoc(collection(db, "allowedCodes"), {
        name: name,
        email: email,
        password: password,
        code: newCode,
        admin: false, // طبعاً ليس أدمن
        createdAt: new Date().toISOString()
      });

      // 3. إظهار الكود للطالب
      alert(`🎉 تم إنشاء حسابك بنجاح!\n\n🔑 الكود الخاص بك هو: ${newCode}\n\nاحفظه جيداً للدخول به!`);
      
      // 4. التحويل لشاشة الدخول وتعبئة الكود تلقائياً
      setIsRegister(false);
      setInputCode(newCode);

    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إنشاء الحساب");
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', color: 'white', fontFamily: 'sans-serif', padding: '20px'}}>
      <div style={{textAlign: 'center', width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#0a0a0a', borderRadius: '20px', border: '1px solid #333'}}>
        
        <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '30px'}}>
          {isRegister ? "إنشاء حساب جديد" : "El Agamy Materials"}
        </h1>
        
        {/* نموذج التبديل */}
        <form onSubmit={isRegister ? handleRegister : handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          
          {/* حقول التسجيل فقط */}
          {isRegister && (
            <>
              <input type="text" placeholder="الاسم ثلاثي" required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
              <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </>
          )}

          {/* حقل الكود (يظهر فقط عند الدخول) */}
          {!isRegister && (
            <input type="text" placeholder="الكود الخاص بك" required value={inputCode} onChange={(e) => setInputCode(e.target.value)} style={inputStyle} />
          )}

          {/* كلمة المرور (مشتركة) */}
          <input type="password" placeholder="كلمة المرور" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          
          {/* زر الإرسال */}
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "جاري التحميل..." : (isRegister ? "إنشاء حساب" : "دخول")}
          </button>
        </form>

        {/* زر التبديل بين الصفحتين */}
        <p style={{marginTop: '20px', color: '#888', fontSize: '0.9rem'}}>
          {isRegister ? "لديك حساب بالفعل؟" : "ليس لديك كود؟"}
          <span 
            onClick={() => setIsRegister(!isRegister)} 
            style={{color: 'white', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline'}}
          >
            {isRegister ? "تسجيل الدخول" : "إنشاء حساب"}
          </span>
        </p>

      </div>
    </div>
  );
}

// ستايلات بسيطة لتنظيف الكود
const inputStyle = {
  padding: '15px', 
  borderRadius: '10px', 
  border: '1px solid #333', 
  background: '#111', 
  color: 'white', 
  outline: 'none', 
  textAlign: 'right'
};

const buttonStyle = {
  padding: '15px', 
  borderRadius: '10px', 
  border: 'none', 
  background: 'white', 
  color: 'black', 
  fontWeight: 'bold', 
  cursor: 'pointer', 
  fontSize: '1rem',
  marginTop: '10px'
};
