"use client";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../../components/Navbar"; // تأكد من المسار الصحيح للنافبار

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 1. إذا انتهى التحميل ولم نجد مستخدماً مسجلاً
    if (!loading && !user) {
      // 2. حوله فوراً للصفحة الرئيسية لتسجيل الدخول
      router.replace("/");
    }
  }, [user, loading, router]);

  // 3. أثناء التحميل (التأكد من الفايربيس)، اعرض شاشة تحميل بدلاً من المحتوى
  if (loading) {
    return (
      <div style={{
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: '#000', 
        color: '#00f260'
      }}>
        <h2>جاري التحقق من الهوية...</h2>
      </div>
    );
  }

  // 4. إذا لم يكن هناك مستخدم (حتى لا يظهر المحتوى للحظة قبل التحويل)
  if (!user) {
    return null;
  }

  // 5. إذا كان المستخدم مسجلاً، اعرض النافبار والمحتوى
  return (
    <>
      <Navbar />
      <div className="dashboard-content">
        {children}
      </div>
    </>
  );
}