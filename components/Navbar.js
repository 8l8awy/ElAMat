"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaBook, FaBell, FaSignOutAlt, 
  FaCloudUploadAlt, FaUserClock, FaBars, 
  FaTimes, FaClipboardList, FaShieldAlt
} from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    router.push('/');
  };

  // التحقق من الصلاحية (سواء كان أدمن أو مود)
  useEffect(() => {
    const checkAccess = () => {
      const role = localStorage.getItem("adminRole");
      const code = localStorage.getItem("adminCode");
      // يظهر الزرار لو الشخص مراجع (moderator) أو مدير (admin)
      if (role === "moderator" || role === "admin" || code === "98600") {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    };
    checkAccess();
    window.addEventListener('storage', checkAccess);
    return () => window.removeEventListener('storage', checkAccess);
  }, []);

  const btnClass = "nav-btn w-fit mx-auto p-3 flex justify-center items-center rounded-xl transition-all hover:scale-110 shadow-lg border border-white/5";

  return (
    <nav className="navbar" style={{ padding: '10px 0' }}>
      <div className="flex items-center justify-center py-1 mb-0 select-none cursor-pointer group" onClick={() => router.push('/dashboard')}>
        <img 
          src="/logo.png" 
          alt="EAM Logo" 
          className="h-10 md:h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-300 group-hover:scale-110"
          onError={(e) => { e.target.src = "/a.png" }} 
        />
      </div>

      <button className="burger-btn" onClick={toggleMenu} style={{ right: '15px' }}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* القائمة بدون حواف جانبية في الموبايل */}
      <div className={`nav-buttons ${isMenuOpen ? 'active' : ''}`} style={{ width: '100%', left: 0, padding: '20px 0' }}>
        
        <span className="block text-center mb-4 text-white font-black text-[10px] uppercase tracking-widest opacity-60">
            {user?.name || "طالب"}
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
        
        <Link href="/dashboard/share" className={`${btnClass} hover:bg-green-600`} title="رفع ملخص" onClick={closeMenu}>
             <FaCloudUploadAlt size={20} />
        </Link>

        {/* زر لوحة التحكم يظهر للمود (98600) فوراً 👈 */}
        {hasAccess && (
          <Link href="/admin?mode=login" className={`${btnClass} bg-orange-600/20 border-orange-500/50 text-orange-500 hover:bg-orange-600 hover:text-white`} title="لوحة التحكم" onClick={closeMenu}>
               <FaShieldAlt size={20} />
          </Link>
        )}

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
