"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { collection, getDocs, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { FaSpinner, FaShieldAlt } from "react-icons/fa";

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFake404, setShowFake404] = useState(true);

  // دالة التحقق اللي بتعرف تقرأ 98610 من أي مكان
  const verifyCode = async (codeToVerify) => {
    if (!codeToVerify) return;
    try {
      // بنشيل المسافات وبنتأكد إن الكود نصي
      const cleanCode = String(codeToVerify).trim();
      const q = query(collection(db, "allowedCodes"), where("code", "==", cleanCode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty && querySnapshot.docs[0].data().admin === true) {
        setIsAuthenticated(true);
        setShowFake404(false);
        // بنخزن الكود بالاسم "الصح" عشان ميتعبناش تاني
        localStorage.setItem("adminCode", cleanCode);
      } else {
        setShowFake404(true);
      }
    } catch (error) {
      console.error("Verification Error:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const checkAccess = async () => {
      // ✅ الحل هنا: بنبص على adminCode أو userEmail
      const savedCode = localStorage.getItem("adminCode") || localStorage.getItem("userEmail");
      const isSecretMode = searchParams.get("mode") === "login";
      
      if (savedCode) {
        await verifyCode(savedCode);
      } else if (isSecretMode) {
        setIsLoading(false);
        setShowFake404(false);
      } else {
        setIsLoading(false);
        setShowFake404(true);
      }
    };
    checkAccess();
  }, [searchParams]);

  // شاشة التحميل (عشان متبقاش بيضا)
  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <FaSpinner className="animate-spin text-purple-600 text-4xl" />
    </div>
  );

  // لو مش مشرف يظهر له 404
  if (showFake404) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans">
      <h1 className="text-4xl font-bold border-r pr-4 mr-4">404</h1>
      <div>This page could not be found.</div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white p-10" dir="rtl">
       <h1 className="text-3xl font-black mb-6 border-b border-white/10 pb-4 italic">لوحة التحكم شغالة ✅</h1>
       {/* باقي كود الأرشيف والرفع هنا */}
    </div>
  );
}
  const btnClass = "nav-btn w-fit mx-auto p-3 flex justify-center items-center rounded-xl transition-all hover:scale-110 shadow-lg border border-white/5";

  return (
    <nav className="navbar">
      {/* 1. تم تحديث الهيدر هنا ليعرض اللوجو الجديد فقط */}
{/* 1. تم تكبير اللوجو وضبط المسافات */}
   {/* اللوجو الجديد بحجم أكبر وبدون أخطاء برمجية */}
     {/* هيدر الناف بار - الحجم الصغير والملموم */}
     {/* هيدر الناف بار - الحجم الصغير والملموم */}
      <div className="flex items-center justify-center py-1 mb-0 select-none cursor-pointer group" onClick={() => router.push('/dashboard')}>
        <img 
          src="/logo.png" 
          alt="EAM Logo" 
          className="h-8 md:h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-300 group-hover:scale-110"
          onError={(e) => { e.target.src = "/a.png" }} 
        />
      </div>
      <button className="burger-btn" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`nav-buttons ${isMenuOpen ? 'active' : ''}`}>
        
        <span id="userName" style={{color:'white', fontWeight:'bold', display:'block', textAlign:'center', marginBottom:'15px', fontSize: '0.9rem'}}>
            {user?.name}
        </span>
        
        <Link href="/dashboard" className={`${btnClass} hover:bg-blue-600`} title="الرئيسية" onClick={closeMenu}>
            <FaHome size={20} />
        </Link>

        <Link href="/dashboard/subjects" className={`${btnClass} hover:bg-gray-600`} title="المواد" onClick={closeMenu}>
            <FaBook size={20} />
        </Link>
        
        <Link href="/dashboard/exams" className={`${btnClass} hover:bg-purple-600`} title="الامتحانات" onClick={closeMenu}>
            <FaClipboardList size={20} />
        </Link>

        <Link href="/dashboard/announcements" className={`${btnClass} hover:bg-yellow-600`} title="الإعلانات" onClick={closeMenu}>
            <FaBell size={20} />
        </Link>
        
        <Link href="/dashboard/share" className={`${btnClass} hover:bg-green-600`} title="رفع ملخص / تكليف" onClick={closeMenu}>
             <FaCloudUploadAlt size={20} />
        </Link>

        {isAdmin && (
          <Link href="/dashboard/admin" className={`${btnClass} hover:bg-orange-600`} title="لوحة التحكم الرئيسية" onClick={closeMenu}>
               <FaCogs size={20} />
          </Link>
        )}

        <div className="w-fit mx-auto"> 
            <AdminLink onClick={closeMenu} />
        </div>

        <Link href="/dashboard/myUploads" className={`${btnClass} hover:bg-cyan-600`} title="ملخصاتي" onClick={closeMenu}>
             <FaUserClock size={20} />
        </Link>

        <button onClick={handleLogout} className={`${btnClass} logout bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white`} title="تسجيل خروج" style={{marginTop:'10px'}}>
            <FaSignOutAlt size={20} />
        </button>
      </div>
    </nav>
  );
}
