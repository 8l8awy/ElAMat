"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { db } from "../lib/firebase"; // 👈 تم التصحيح (نقطتين فقط)
import { collection, getDocs, query, where } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. البحث عن الكود في قاعدة البيانات
      const q = query(collection(db, "allowedCodes"), where("code", "==", inputCode.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        
        // 2. هل هو أدمن؟
        if (userData.admin === true) {
          // ✅ نعم! احفظ الكود في الجهاز
          localStorage.setItem("adminCode", inputCode.trim());
          
          // 🚀 حولني لصفحة الأدمن
          router.push("/dashboard/admin");
        } else {
          // طالب عادي
          alert("أهلاً بك يا طالب! (سيتم توجيهك لصفحة المواد قريباً)");
          // router.push("/materials"); 
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
    <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'black', color: 'white', fontFamily: 'sans-serif'}}>
      <div style={{textAlign: 'center', width: '100%', maxWidth: '400px', padding: '20px'}}>
        <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px'}}>El Agamy<br/>Materials</h1>
        
        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '40px'}}>
          <input 
            type="text" 
            placeholder="الكود أو البريد الإلكتروني" 
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            style={{padding: '15px', borderRadius: '10px', border: '1px solid #333', background: '#111', color: 'white', outline: 'none', textAlign: 'right'}}
          />
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            disabled 
            style={{padding: '15px', borderRadius: '10px', border: '1px solid #333', background: '#111', color: '#555', outline: 'none', textAlign: 'right', cursor: 'not-allowed'}}
          />
          
          <button type="submit" disabled={loading} style={{padding: '15px', borderRadius: '10px', border: 'none', background: 'white', color: 'black', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'}}>
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
