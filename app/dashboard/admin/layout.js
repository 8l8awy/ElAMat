"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaSpinner } from "react-icons/fa";

export default function AdminLayout({ children }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔍 دالة التحقق من الكود في الفايربيس
  const verifyCode = async (codeToCheck) => {
    try {
      // البحث في كوليكشن allowedCodes كما في صورتك
      const q = query(collection(db, "allowedCodes"), where("code", "==", codeToCheck));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("Verification Error:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkAccess = async () => {
      // 1. هل يوجد كود في الرابط؟ (لأول مرة للدخول)
      // مثال: ?auth=123456
      const urlCode = searchParams.get("auth");
      
      // 2. هل يوجد كود محفوظ سابقاً في المتصفح؟
      const storedCode = localStorage.getItem("adminCode");

      let codeToVerify = urlCode || storedCode;

      if (codeToVerify) {
        const isValid = await verifyCode(codeToVerify);

        if (isValid) {
          // ✅ الكود صحيح
          setIsAuthorized(true);
          
          if (urlCode) {
            // إذا كان الكود قادماً من الرابط، نحفظه للمستقبل
            localStorage.setItem("adminCode", urlCode);
            // ونقوم بتنظيف الرابط (إزالة الكود منه لعدم مشاركته بالخطأ)
            router.replace("/dashboard/admin/exams");
          }
        } else {
          // ❌ الكود خاطئ
          localStorage.removeItem("adminCode"); // تنظيف أي كود قديم فاسد
          setIsAuthorized(false);
        }
      } else {
        // لا يوجد كود في الرابط ولا في الذاكرة
        setIsAuthorized(false);
      }
      
      setLoading(false);
    };

    checkAccess();
  }, [searchParams, router]);

  // 1. حالة التحميل (شاشة سوداء لحظية)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c15] flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  // 2. حالة الرفض: عرض صفحة 404 مزيفة (Fake 404)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center font-sans">
        {/* تصميم يطابق صفحة الخطأ الافتراضية في Next.js لإقناع المتطفل */}
        <div className="flex items-center">
            <h1 className="text-5xl font-medium border-r border-gray-300 pr-6 mr-6 py-2">404</h1>
            <div className="text-sm">This page could not be found.</div>
        </div>
      </div>
    );
  }

  // 3. حالة القبول: عرض لوحة التحكم
  return (
    <div className="animate-fadeIn">
      {/* زر خروج سري صغير جداً في الأسفل */}
      <button 
        onClick={() => {
            localStorage.removeItem("adminCode");
            window.location.reload();
        }}
        className="fixed bottom-2 left-2 z-50 opacity-20 hover:opacity-100 text-[10px] text-red-500 hover:text-red-600 transition-all"
      >
        [Admin Logout]
      </button>
      
      {children}
    </div>
  );
}
