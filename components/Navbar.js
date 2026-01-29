"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AdminLink from './AdminLink'; 
import { 
  FaHome, FaBook, FaBell, FaSignOutAlt, 
  FaCloudUploadAlt, FaUserClock, FaBars, 
  FaTimes, FaClipboardList, FaCogs
} from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    router.push('/');
  };

  useEffect(() => {
    const checkAdmin = () => {
      if (typeof window !== 'undefined' && localStorage.getItem("adminCode")) {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);

  const btnClass = "nav-btn w-fit mx-auto p-3 flex justify-center items-center rounded-xl transition-all hover:scale-110 shadow-lg border border-white/5";

  return (
    <nav className="navbar">
      {/* 1. تم تحديث الهيدر هنا ليعرض اللوجو الجديد فقط */}
{/* 1. تم تكبير اللوجو وضبط المسافات */}
   {/* اللوجو الجديد بحجم أكبر وبدون أخطاء برمجية */}
      <div className="flex items-center justify-center py-4 mb-2 select-none cursor-pointer group" onClick={() => router.push('/dashboard')}>
        <img 
          src="/logo.png" 
          alt="EAM Logo" 
          className="h-14 md:h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_35px_rgba(168,85,247,0.9)]"
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
