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
  const { user, logout } = useAuth(); // 'user' يحتوي على البيانات من Firestore
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
    // التحقق من الرتبة الحقيقية للمستخدم
    const checkPermissions = () => {
      // 1. فحص الرتبة من بيانات الـ AuthContext (الأكثر أماناً)
      if (user?.role === 'admin' || user?.role === 'moderator' || user?.isAdmin) {
        setIsAdmin(true);
      } 
      // 2. فحص الكود الخاص بك كمدير (98612)
      else if (typeof window !== 'undefined' && localStorage.getItem("adminCode") === "98612") {
        setIsAdmin(true);
      }
      else {
        setIsAdmin(false);
      }
    };
    checkPermissions();
  }, [user]); // يتحدث كلما تغيرت بيانات المستخدم

  const btnClass = "nav-btn w-fit mx-auto p-3 flex justify-center items-center rounded-xl transition-all hover:scale-110 shadow-lg border border-white/5";

  return (
    <nav className="navbar">
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
        
        <Link href="/dashboard/share" className={`${btnClass} hover:bg-green-600`} title="رفع ملخص / تكليف" onClick={closeMenu}>
             <FaCloudUploadAlt size={20} />
        </Link>

        {/* ✅ هذا الزرار لن يظهر إلا للأدمن والمشرفين */}
        {isAdmin && (
          <Link href="/dashboard/admin" className={`${btnClass} bg-orange-600/20 text-orange-500 hover:bg-orange-600 hover:text-white`} title="لوحة التحكم الرئيسية" onClick={closeMenu}>
               <FaCogs size={20} />
          </Link>
        )}

        {/* اختياري: إخفاء AdminLink أيضاً لو كان مخصصاً للإدارة فقط */}
        {isAdmin && (
          <div className="w-fit mx-auto"> 
              <AdminLink onClick={closeMenu} />
          </div>
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
