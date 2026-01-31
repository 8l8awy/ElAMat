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
      // قراءة البيانات من المتصفح
      const adminCode = localStorage.getItem("adminCode");
      const userEmail = localStorage.getItem("userEmail"); // عشان يقرأ كودك 98610
      const savedRole = localStorage.getItem("adminRole");
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Error parsing user data");
        }
      }

      // شرط ظهور زرار الأدمن للمشرفين
      if (
        adminCode === "98610" || 
        userEmail === "98610" || 
        adminCode === "98600" || 
        userEmail === "98600" ||
        savedRole === "admin" || 
        savedRole === "moderator"
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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const btnClass = "nav-btn w-fit mx-auto p-3 flex justify-center items-center rounded-xl transition-all hover:scale-110 shadow-lg border border-white/5 bg-white/5";

  return (
    <nav className="navbar p-4 bg-black/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        
        {/* اللوجو الكبير */}
        <div className="flex items-center cursor-pointer group" onClick={() => router.push('/dashboard')}>
          <img 
            src="/logo.png" 
            alt="EAM Logo" 
            className="h-10 md:h-14 w-auto object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-300 group-hover:scale-110"
            onError={(e) => { e.target.src = "/a.png" }} 
          />
        </div>

        {/* زرار المنيو للموبايل */}
        <button className="md:hidden text-white p-2" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* قائمة الأزرار */}
        <div className={`flex flex-col md:flex-row items-center gap-3 absolute md:static top-20 left-0 w-full md:w-auto bg-[#0a0a0a] md:bg-transparent p-6 md:p-0 border-b border-white/5 md:border-none transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible md:opacity-100 md:visible'}`}>
          
          {user?.name && (
            <span className="text-white font-bold text-[10px] mb-4 md:mb-0 md:ml-4 bg-white/5 px-4 py-2 rounded-full border border-white/10 uppercase italic">
              {user.name}
            </span>
          )}

          <Link href="/dashboard" className={`${btnClass} hover:bg-blue-600 text-blue-400 hover:text-white`} title="الرئيسية" onClick={closeMenu}>
            <FaHome size={20} />
          </Link>

          <Link href="/dashboard/subjects" className={`${btnClass} hover:bg-gray-600 text-gray-400 hover:text-white`} title="المواد" onClick={closeMenu}>
            <FaBook size={20} />
          </Link>

          <Link href="/dashboard/exams" className={`${btnClass} hover:bg-purple-600 text-purple-400 hover:text-white`} title="الامتحانات" onClick={closeMenu}>
            <FaClipboardList size={20} />
          </Link>

          <Link href="/dashboard/announcements" className={`${btnClass} hover:bg-yellow-600 text-yellow-400 hover:text-white`} title="الإعلانات" onClick={closeMenu}>
            <FaBell size={20} />
          </Link>

          <Link href="/dashboard/share" className={`${btnClass} hover:bg-green-600 text-green-400 hover:text-white`} title="رفع ملف" onClick={closeMenu}>
            <FaCloudUploadAlt size={20} />
          </Link>

          {/* زرار الأدمن البرتقالي - هيظهر لك دلوقتي يا محمد */}
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

          <Link href="/dashboard/myUploads" className={`${btnClass} hover:bg-cyan-600 text-cyan-400 hover:text-white`} title="ملخصاتي" onClick={closeMenu}>
            <FaUserClock size={20} />
          </Link>

          <button onClick={handleLogout} className={`${btnClass} bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white`} title="خروج">
            <FaSignOutAlt size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
