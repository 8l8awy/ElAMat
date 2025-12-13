"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { db } from "../lib/firebase"; 
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { FaUserGraduate, FaUserShield, FaArrowLeft } from "react-icons/fa"; // تأكد من تثبيت react-icons

export default function AuthPage() {
  const router = useRouter();
  
  // view: تتحكم في الشاشة المعروضة
  // 'student-login' (دخول طالب) | 'student-signup' (تسجيل طالب) | 'admin-login' (دخول مشرف بالكود)
  const [view, setView] = useState("student-login");

  // بيانات النماذج
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  
  const [loading, setLoading] = useState(false);

  // 1️⃣ دالة تسجيل دخول الطلاب (ايميل وباسورد)
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // البحث في كوليكشن الطلاب
      const q = query(collection(db, "students"), where("email", "==", email.toLowerCase().trim()), where("password", "==", password));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const student = snapshot.docs[0].data();
        localStorage.setItem("studentName", student.name);
        alert(`مرحباً بك يا ${student.name} 👋`);
        // router.push("/dashboard/materials"); // وجهه لصفحة المواد لاحقاً
      } else {
        alert("❌ البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ في الاتصال");
    }
    setLoading(false);
  };

  // 2️⃣ دالة إنشاء حساب طالب جديد
  const handleStudentSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // التأكد ألا يكون الايميل مستخدم من قبل
      const checkQ = query(collection(db, "students"), where("email", "==", email.toLowerCase().trim()));
      const checkSnapshot = await getDocs(checkQ);

      if (!checkSnapshot.empty) {
        alert("⚠️ هذا البريد الإلكتروني مسجل بالفعل!");
        setLoading(false);
        return;
      }

      // حفظ الطالب الجديد
      await addDoc(collection(db, "students"), {
        name: name,
        email: email.toLowerCase().trim(),
        password: password, // في تطبيق حقيقي يفضل تشفيرها
        role: "student",
        createdAt: new Date().toISOString()
      });

      alert("🎉 تم إنشاء الحساب بنجاح! قم بتسجيل الدخول الآن.");
      setView("student-login"); // العودة لشاشة الدخول

    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء التسجيل");
    }
    setLoading(false);
  };

  // 3️⃣ دالة دخول المشرفين (بالكود فقط)
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const q = query(collection(db, "allowedCodes"), where("code", "==", adminCode.trim()));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const adminData = snapshot.docs[0].data();
        if (adminData.admin === true) {
          localStorage.setItem("adminCode", adminCode.trim());
          router.push("/dashboard/admin");
        } else {
          alert("⛔ هذا الكود ليس لمشرف!");
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

  return (
    <div style={{minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', color: 'white', fontFamily: 'sans-serif', padding: '20px'}}>
      <div style={{textAlign: 'center', width: '100%', maxWidth: '400px', padding: '30px', backgroundColor: '#111', borderRadius: '20px', border: '1px solid #333', position: 'relative'}}>
        
        {/* زر العودة (يظهر فقط إذا لم نكن في الصفحة الرئيسية) */}
        {view !== "student-login" && (
          <button onClick={() => setView("student-login")} style={{position: 'absolute', top: '20px', left: '20px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer'}}>
            <FaArrowLeft size={20} />
          </button>
        )}

        {/* --- العناوين --- */}
        <h1 style={{fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '10px', color: view === 'admin-login' ? '#ff4d4d' : 'white'}}>
          {view === 'admin-login' ? 'Admin Access' : 'El Agamy Materials'}
        </h1>
        <p style={{color: '#888', marginBottom: '30px', fontSize: '0.9rem'}}>
          {view === 'student-login' && "تسجيل دخول الطلاب"}
          {view === 'student-signup' && "إنشاء حساب طالب جديد"}
          {view === 'admin-login' && "الدخول بالكود (للمشرفين فقط)"}
        </p>

        {/* --- نموذج دخول الطلاب --- */}
        {view === "student-login" && (
          <form onSubmit={handleStudentLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <input type="email" placeholder="البريد الإلكتروني" required value={email} onChange={(e)=>setEmail(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="كلمة المرور" required value={password} onChange={(e)=>setPassword(e.target.value)} style={inputStyle} />
            <button type="submit" disabled={loading} style={buttonStyle}>{loading ? "جاري الدخول..." : "دخول"}</button>
            
            <div style={{marginTop: '20px', fontSize: '0.9rem', color: '#ccc'}}>
              ليس لديك حساب؟ <span onClick={()=>setView('student-signup')} style={{color: '#4dabf7', cursor: 'pointer', fontWeight: 'bold'}}>أنشئ حساباً</span>
            </div>
            <div style={{marginTop: '10px', fontSize: '0.8rem', color: '#666'}}>
              هل أنت مشرف؟ <span onClick={()=>setView('admin-login')} style={{color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold'}}>الدخول بالكود</span>
            </div>
          </form>
        )}

        {/* --- نموذج تسجيل الطلاب --- */}
        {view === "student-signup" && (
          <form onSubmit={handleStudentSignup} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <input type="text" placeholder="الاسم بالكامل" required value={name} onChange={(e)=>setName(e.target.value)} style={inputStyle} />
            <input type="email" placeholder="البريد الإلكتروني" required value={email} onChange={(e)=>setEmail(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="كلمة المرور" required value={password} onChange={(e)=>setPassword(e.target.value)} style={inputStyle} />
            <button type="submit" disabled={loading} style={buttonStyle}>{loading ? "جاري التسجيل..." : "إنشاء الحساب"}</button>
          </form>
        )}

        {/* --- نموذج دخول المشرفين --- */}
        {view === "admin-login" && (
          <form onSubmit={handleAdminLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div style={{background: 'rgba(255, 77, 77, 0.1)', padding: '10px', borderRadius: '10px', color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '10px'}}>
              هذه المنطقة مخصصة للمشرفين فقط
            </div>
            <input type="password" placeholder="كود المشرف" required value={adminCode} onChange={(e)=>setAdminCode(e.target.value)} style={{...inputStyle, textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem'}} />
            <button type="submit" disabled={loading} style={{...buttonStyle, background: '#ff4d4d', color: 'white'}}>{loading ? "جاري التحقق..." : "دخول المشرف"}</button>
          </form>
        )}

      </div>
    </div>
  );
}

// تنسيقات ثابتة
const inputStyle = {
  padding: '15px', borderRadius: '10px', border: '1px solid #333', background: '#000', color: 'white', outline: 'none', textAlign: 'right'
};
const buttonStyle = {
  padding: '15px', borderRadius: '10px', border: 'none', background: 'white', color: 'black', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'
};
