"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FaShieldAlt, FaHome, FaBook, FaClipboardList, 
  FaBell, FaCloudUploadAlt, FaUserClock, FaSignOutAlt, 
  FaBars, FaTimes 
} from "react-icons/fa";

export default function Navbar() {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAccess = () => {
      // قراءة الكود 98610 من الـ userEmail
      const adminCode = localStorage.getItem("adminCode");
      const userEmail = localStorage.getItem("userEmail"); 
      const savedRole = localStorage.getItem("adminRole");
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch (e) { console.error("User data error"); }
      }

      // شرط ظهور الزرار للمشرفين
      if (
        adminCode === "98610" || userEmail === "98610" || 
        adminCode === "98600" || userEmail === "98600" ||
        savedRole === "admin" || savedRole === "moderator"
      ) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    };

    const interval = setInterval(checkAccess, 1000);
    checkAccess();
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const btnClass = "nav-btn w-fit mx-auto p-3 flex justify-center items-center rounded-xl transition-all hover:scale-110 shadow-lg border border-white/5 bg-white/5";
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

       {/* زرار الأدمن البرتقالي - تم تعديل الرابط ليطابق مسار ملفاتك */}
          {hasAccess && (
            <Link 
              href="/dashboard/admin?mode=login" 
              className="p-3 bg-orange-600/20 border border-orange-500/50 text-orange-500 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-lg shadow-orange-500/10 scale-110"
              title="لوحة التحكم"
            >
              <FaShieldAlt size={22} />
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
