"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { db } from "../lib/firebase"; // ✅ المسار الصحيح (نقطتين فقط)
import { collection, getDocs, query, where } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [inputCode, setInputCode] = useState("");
  const [password, setPassword] = useState(""); // خانة كلمة المرور (شكلية أو للتطوير المستقبلي)
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // البحث عن الكود في قاعدة البيانات
      const q = query(collection(db, "allowedCodes"), where("code", "==", inputCode.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        
        // التحقق: هل هو أدمن؟
        if (userData.admin === true) {
          // ✅ أدمن: احفظ الكود وافتح لوحة التحكم
          localStorage.setItem("adminCode", inputCode.trim());
          router.push("/dashboard/admin");
        } else {
          // 👤 طالب عادي: رسالة ترحيب فقط
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

  return (
    <div style={{
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: 'black', 
      color: 'white', 
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        textAlign: 'center', 
        width: '100%', 
        maxWidth: '400px', 
        padding: '40px',
        backgroundColor: '#0a0a0a', // لون خلفية الكارت أفتح قليلاً من الأسود
        borderRadius: '20px',
        border: '1px solid #333'
      }}>
        <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px'}}>El Agamy<br/>Materials</h1>
        
        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px'}}>
          <input 
            type="text" 
            placeholder="الكود الخاص بك" 
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            style={{
              padding: '15px', 
              borderRadius: '10px', 
              border: '1px solid #333', 
              background: '#111', 
              color: 'white', 
              outline: 'none', 
              textAlign: 'right'
            }}
          />
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: '15px', 
              borderRadius: '10px', 
              border: '1px solid #333', 
              background: '#111', 
              color: 'white', 
              outline: 'none', 
              textAlign: 'right'
            }}
          />
          
          <button type="submit" disabled={loading} style={{
            padding: '15px', 
            borderRadius: '10px', 
            border: 'none', 
            background: 'white', 
            color: 'black', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            marginTop: '10px',
            fontSize: '1rem'
          }}>
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
