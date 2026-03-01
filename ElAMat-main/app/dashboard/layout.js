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
