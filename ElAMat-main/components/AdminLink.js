"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaUserShield } from "react-icons/fa";

export default function AdminLink() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // التحقق: هل يوجد كود أدمن محفوظ في المتصفح؟
    if (localStorage.getItem("adminCode")) {
      setIsAdmin(true);
    }
  }, []);

  // إذا لم يكن أدمن، لا تعرض شيئاً (اختفاء تام)
  if (!isAdmin) return null;

  // إذا كان أدمن، اعرض الزر
  return (
    <Link 
      href="/dashboard/admin/exams"
      className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-lg border border-red-500/30"
      title="لوحة تحكم الامتحانات (للأدمن فقط)"
    >
      <FaUserShield size={20} />
    </Link>
  );
}
