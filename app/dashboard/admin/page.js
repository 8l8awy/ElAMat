"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaLock, FaSignOutAlt } from "react-icons/fa";

export default function AdminPage() {
  const { user } = useAuth();
  
  // حالات النظام
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // حالة للتأكد من الصلاحية
  
  // هنا نضع باقي متغيرات لوحة التحكم الخاصة بك (مثل title, desc, files...)
  // سأضع لك الهيكل الأساسي لتعمل الصفحة، ويمكنك إضافة باقي وظائف الرفع لاحقاً

  useEffect(() => {
    async function checkPermission() {
      if (!user) return;

      try {
        let adminFound = false;

        // 1. البحث في جدول الأكواد (allowedCodes)
        const codesRef = collection(db, "allowedCodes");
        const qCode = query(codesRef, where("code", "==", user.email)); // user.email هنا يحمل الكود
        const codeSnap = await getDocs(qCode);

        if (!codeSnap.empty) {
           const data = codeSnap.docs[0].data();
           if (data.admin === true) adminFound = true;
        }

        // 2. البحث في جدول المستخدمين (users) إذا لم نجد صلاحية بعد
        if (!adminFound) {
           const usersRef = collection(db, "users");
           const qUser = query(usersRef, where("email", "==", user.email));
           const userSnap = await getDocs(qUser);

           if (!userSnap.empty) {
              const data = userSnap.docs[0].data();
              if (data.isAdmin === true) adminFound = true;
           }
        }

        if (adminFound) {
            setIsAdmin(true);
            setIsLoading(false); // إلغاء التحميل وإظهار الصفحة
        } else {
            // إذا لم يكن أدمن، نوجهه أو نظهر خطأ (يمكنك تفعيل الـ 404 هنا)
            setIsLoading(false); 
        }

      } catch (err) {
        console.error("Error checking admin:", err);
        setIsLoading(false);
      }
    }

    checkPermission();
  }, [user]);

  // واجهة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
        <p>جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  // واجهة الخطأ (404) إذا لم يكن أدمن
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
        <h1 className="text-6xl font-bold mb-2">404</h1>
        <p className="text-xl text-gray-500">This page could not be found.</p>
      </div>
    );
  }

  // ✅ واجهة الأدمن الحقيقية (تظهر فقط للأدمن)
  return (
    <div className="min-h-screen bg-[#0b0c15] text-white p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
           <div>
             <h1 className="text-3xl font-bold text-blue-500">لوحة التحكم</h1>
             <p className="text-gray-400 mt-1">أهلاً بك، {user.email}</p>
           </div>
           <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500/20 transition">
             <FaSignOutAlt /> خروج
           </button>
        </header>

        <div className="bg-[#151720] p-8 rounded-2xl border border-gray-800 text-center">
            <h2 className="text-xl font-semibold mb-4">✨ أنت الآن في لوحة الأدمن</h2>
            <p className="text-gray-400">تم التحقق من الكود <strong>{user.email}</strong> بنجاح!</p>
            <p className="text-sm text-gray-500 mt-2">يمكنك الآن إعادة لصق كود رفع الملفات هنا.</p>
        </div>
      </div>
    </div>
  );
}
