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

  const verifyCode = async (codeToCheck) => {
    try {
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
      const urlCode = searchParams.get("auth");
      const storedCode = localStorage.getItem("adminCode");
      let codeToVerify = urlCode || storedCode;

      if (codeToVerify) {
        const isValid = await verifyCode(codeToVerify);

        if (isValid) {
          setIsAuthorized(true);
          if (urlCode) {
            localStorage.setItem("adminCode", urlCode);
            router.replace("/dashboard/admin/exams");
          }
        } else {
          localStorage.removeItem("adminCode");
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }
      
      setLoading(false);
    };

    checkAccess();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c15] flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center font-sans">
        <div className="flex items-center">
            <h1 className="text-5xl font-medium border-r border-gray-300 pr-6 mr-6 py-2">404</h1>
            <div className="text-sm">This page could not be found.</div>
        </div>
      </div>
    );
  }

  // تم إزالة زر الخروج، الآن يتم عرض المحتوى فقط
  return (
    <div className="animate-fadeIn">
      {children}
    </div>
  );
}
