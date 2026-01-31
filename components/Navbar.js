"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaShieldAlt, FaHome, FaUpload } from "react-icons/fa";

export default function Navbar() {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      // قراءة كل الاحتمالات لضمان ظهور الزرار لكود 98610
      const adminCode = localStorage.getItem("adminCode");
      const userEmail = localStorage.getItem("userEmail"); 
      const savedRole = localStorage.getItem("adminRole");

      if (adminCode === "98610" || userEmail === "98610" || savedRole === "moderator" || savedRole === "admin") {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    };

    const interval = setInterval(checkAccess, 1000);
    checkAccess(); 
    return () => clearInterval(interval);
  }, []); // تم إصلاح القوس هنا لحل مشكلة الـ Build

  const btnClass = "p-3 flex justify-center items-center rounded-xl transition-all hover:scale-110 shadow-lg border border-white/5 bg-white/5";

  return (
    <nav className="p-4 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <Link href="/" className="font-black italic text-xl uppercase tracking-tighter text-white">ElAMat</Link>
      
      <div className="flex items-center gap-3">
        <Link href="/" className={btnClass}><FaHome size={20}/></Link>
        <Link href="/dashboard/share" className={btnClass}><FaUpload size={20}/></Link>
        
        {/* زرار الأدمن البرتقالي - يوجه للمسار الصحيح */}
        {hasAccess && (
          <Link 
            href="/dashboard/admin?mode=login" 
            className="p-3 bg-orange-600/20 border border-orange-500/50 text-orange-500 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-lg shadow-orange-500/10"
          >
            <FaShieldAlt size={20} />
          </Link>
        )}
      </div>
    </nav>
  );
}
