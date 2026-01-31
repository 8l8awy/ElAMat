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

  // تعريف دوال المنيو عشان الكود ميعلقش
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const checkAccess = () => {
      // قراءة الكود 98610 من الـ userEmail والـ adminCode
      const adminCode = localStorage.getItem("adminCode");
      const userEmail = localStorage.getItem("userEmail"); 
      const savedRole = localStorage.getItem("adminRole");
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try { setUser(JSON.parse(savedUser)); } catch (e) { console.error("User data error"); }
      }

      // شرط ظهور الزرار للمشرفين (98610)
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
    <nav className="navbar p-2 md:p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
      {/* اللوجو الجديد بحجم أكبر وضبط المسافات */}
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center py-1 mb-0 select-none cursor-pointer group" onClick={() => { router.push('/dashboard'); closeMenu(); }}>
          <img 
            src="/logo.png" 
            alt="EAM Logo" 
            className="h-10 md:h-14 w-auto object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-300 group-hover:scale-110"
            onError={(e) => { e.target.src = "/a.png" }} 
          />
        </div>

        {/* زرار البرجر للموبايل */}
        <button className="md:hidden text-white text-2xl" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* قائمة الأزرار */}
        <div className={`nav-buttons flex flex-col md:flex-row items-center gap-3 absolute md:static top-[70px] left-0 w-full md:w-auto bg-black md:bg-transparent p-6 md:p-0 transition-all duration-300 ${isMenuOpen ? 'flex opacity-100' : 'hidden md:flex'}`}>
          
          <span id="userName" className="text-white font-bold block text-center mb-2 md:mb-0 md:ml-4 text-[0.9rem] bg-white/5 px-4 py-2 rounded-full border border-white/10 uppercase italic">
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

          {/* زرار الأدمن البرتقالي - يفتح المسار الصحيح فوراً */}
          {hasAccess && (
            <Link 
              href="/dashboard/admin?mode=login" 
              className="p-3 bg-orange-600/20 border border-orange-500/50 text-orange-500 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-lg shadow-orange-500/10 scale-110"
              title="لوحة التحكم"
              onClick={closeMenu}
            >
              <FaShieldAlt size={22} />
            </Link>
          )}

          <Link href="/dashboard/myUploads" className={`${btnClass} hover:bg-cyan-600`} title="ملخصاتي" onClick={closeMenu}>
               <FaUserClock size={20} />
          </Link>

          <button onClick={handleLogout} className={`${btnClass} logout bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white`} title="تسجيل خروج">
              <FaSignOutAlt size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
