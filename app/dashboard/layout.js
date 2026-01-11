"use client";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../../components/Navbar";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // إذا انتهى التحميل ولم نجد مستخدماً، ارجعه للصفحة الرئيسية
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  // أثناء التحميل، اعرض شاشة سوداء
  if (loading) {
    return (
      <div style={{height: '100vh', background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#00f260'}}>
        <h2>...</h2>
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم، لا تعرض شيئاً (حتى يتم التوجيه)
  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="dashboard-content">
        {children}
      </div>
    </>
  );
}
