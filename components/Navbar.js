"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaShieldAlt } from "react-icons/fa";

export default function Navbar() {
  const [hasAccess, setHasAccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // لو عندك منيو للموبايل

  useEffect(() => {
    const checkAccess = () => {
      // قراءة كل الاحتمالات لضمان ظهور الزرار لكود 98610
      const adminCode = localStorage.getItem("adminCode");
      const userEmail = localStorage.getItem("userEmail");
      const savedRole = localStorage.getItem("adminRole");

      if (
        adminCode === "98610" || 
        userEmail === "98610" || 
        savedRole === "moderator" || 
        savedRole === "admin"
      ) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    };

    // فحص دوري كل ثانية
    const interval = setInterval(checkAccess, 1000);
    checkAccess(); // فحص فوري عند التحميل

    return () => clearInterval(interval);
  }, []); // القوس ده والقفلة دي هي اللي كانت عاملة المشكلة في الـ Build

  const btnClass = "nav-btn w-fit mx-auto p-3 flex justify-center items-center rounded-xl transition-all hover:scale-110 shadow-lg border border-white/5";

  return (
    <nav className="p-4 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <Link href="/" className="font-black italic text-xl">ElAMat</Link>
      
      <div className="flex items-center gap-4">
        {/* زرار الأدمن البرتقالي السحري */}
        {hasAccess && (
          <Link 
            href="/dashboard/admin?mode=login" 
            className="p-3 bg-orange-600/20 border border-orange-500/50 text-orange-500 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-lg shadow-orange-500/10"
          >
            <FaShieldAlt size={20} />
          </Link>
        )}
        
        {/* باقي أزرار الناف بار بتاعتك */}
      </div>
    </nav>
  );
}
