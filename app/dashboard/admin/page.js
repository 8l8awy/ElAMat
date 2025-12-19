"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; // تأكدي من مسار الـ Context
import { db } from "@/lib/firebase"; 
import { collection, query, where, getDocs } from "firebase/firestore";

export default function AdminPage() {
  const { user } = useAuth(); // بيانات المستخدم من عملية تسجيل الدخول
  const [status, setStatus] = useState("جاري التحميل...");
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    async function checkAdmin() {
      // 1. فحص هل هناك مستخدم أصلاً؟
      if (!user) {
        setStatus("❌ لا يوجد مستخدم مسجل دخول (User is null)");
        return;
      }

      setDebugInfo(prev => ({ ...prev, userEmail: user.email }));

      try {
        // 2. فحص الاتصال بقاعدة البيانات
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            setStatus("⚠️ المستخدم غير موجود في قاعدة بيانات Firestore");
            return;
        }

        const userData = querySnapshot.docs[0].data();
        setDebugInfo(prev => ({ ...prev, firestoreData: userData }));

        // 3. فحص صلاحية الأدمن
        if (userData.isAdmin === true) {
            setStatus("✅ نجاح! أنت أدمن (المفروض الصفحة تفتح)");
        } else {
            setStatus("⛔ توقف! الحقل isAdmin ليس true في قاعدة البيانات");
        }

      } catch (err) {
        console.error(err);
        setStatus(`💥 حدث خطأ تقني: ${err.message}`);
      }
    }

    checkAdmin();
  }, [user]);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans text-left" dir="ltr">
      <h1 className="text-2xl font-bold text-blue-500 mb-6">تقرير فحص المشكلة</h1>
      
      <div className="space-y-4">
        <div className="p-4 rounded border border-gray-700 bg-gray-900">
            <h2 className="text-gray-400 text-sm mb-1">الحالة النهائية:</h2>
            <p className="text-xl font-bold text-yellow-400">{status}</p>
        </div>

        <div className="p-4 rounded border border-gray-700 bg-gray-900">
            <h2 className="text-gray-400 text-sm mb-1">البريد الإلكتروني الحالي:</h2>
            <p className="text-green-400">{debugInfo.userEmail || "غير معروف"}</p>
        </div>

        <div className="p-4 rounded border border-gray-700 bg-gray-900">
            <h2 className="text-gray-400 text-sm mb-1">بياناتك في قاعدة البيانات (Firestore):</h2>
            <pre className="text-xs text-blue-300 overflow-auto">
                {JSON.stringify(debugInfo.firestoreData, null, 2)}
            </pre>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800">
            <p className="text-gray-500 text-sm">إذا ظهرت لك رسالة خطأ تبدأ بـ "Missing or insufficient permissions"، فهذا يعني أن إعدادات الأمان في Firebase تمنع القراءة.</p>
        </div>
      </div>
    </div>
  );
}
