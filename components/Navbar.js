"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AdminLink from './AdminLink'; 
import { 
  FaHome, FaBook, FaBell, FaSignOutAlt, 
  FaCloudUploadAlt, FaUserClock, FaBars, FaTimes, FaClipboardList
} from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    router.push('/');
  };

  // 🎨 هذا هو الستايل السحري الموحد (مربع زجاجي أنيق)
  const baseBtn = "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 shadow-md border hover:scale-110 hover:shadow-lg";

  return (
    <nav className="navbar flex items-center justify-between p-4 bg-[#0b0c15] text-white shadow-2xl relative z-50">
      
      {/* الشعار */}
      <div className="flex items-center gap-3">
        <img src="/logo-no-background-1.png" alt="Logo" width="45" /> 
        <span className="font-bold text-lg hidden md:block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          El Agamy Materials
        </span>
      </div>
      
      {/* زر القائمة للموبايل */}
      <button className="md:hidden text-2xl text-gray-300 hover:text-white transition-colors" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* حاوية الأزرار */}
      <div className={`flex items-center gap-3 ${isMenuOpen ? 'fixed inset-0 bg-[#0b0c15]/95 z-40 flex-col justify-center gap-8 animate-fadeIn' : 'hidden md:flex'}`}>
        
        {/* اسم المستخدم يظهر فقط في الموبايل */}
        {isMenuOpen && <h2 className="text-2xl font-bold text-white mb-4">مرحباً {user?.name}</h2>}

        {/* 1. الرئيسية (أزرق) */}
        <Link href="/dashboard" onClick={closeMenu} title="الرئيسية" 
              className={`${baseBtn} bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-600 hover:text-white hover:border-blue-600`}>
           <FaHome size={18} />
        </Link>

        {/* 2. المواد (رمادي فاتح) */}
        <Link href="/dashboard/subjects" onClick={closeMenu} title="المواد" 
              className={`${baseBtn} bg-gray-700/30 text-gray-300 border-gray-600/30 hover:bg-gray-600 hover:text-white hover:border-gray-500`}>
           <FaBook size={18} />
        </Link>
        
        {/* 3. الامتحانات (بنفسجي) */}
        <Link href="/dashboard/exams" onClick={closeMenu} title="الامتحانات" 
              className={`${baseBtn} bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-600 hover:text-white hover:border-purple-600`}>
            <FaClipboardList size={18} />
        </Link>

        {/* 4. الإعلانات (أصفر) */}
        <Link href="/dashboard/announcements" onClick={closeMenu} title="الإعلانات" 
              className={`${baseBtn} bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500 hover:text-black hover:border-yellow-500`}>
           <FaBell size={18} />
        </Link>
        
        {/* 5. مشاركة (أخضر) */}
        <Link href="/dashboard/share" onClick={closeMenu} title="رفع ملف" 
              className={`${baseBtn} bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-600 hover:text-white hover:border-green-600`}>
             <FaCloudUploadAlt size={18} />
        </Link>

        {/* 6. ملخصاتي (سيان/سماوي) */}
        <Link href="/dashboard/myUploads" onClick={closeMenu} title="ملخصاتي" 
              className={`${baseBtn} bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-600 hover:text-white hover:border-cyan-600`}>
           <FaUserClock size={18} />
        </Link>

        {/* 7. زر الأدمن (أحمر - سيظهر فقط للأدمن) */}
        <div onClick={closeMenu}>
            <AdminLink />
        </div>
        
        {/* 8. خروج (أحمر غامق) */}
        <button onClick={handleLogout} title="تسجيل خروج" 
                className={`${baseBtn} bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-600 hover:text-white hover:border-red-600 ml-2`}>
           <FaSignOutAlt size={18} />
        </button>

        {/* زر إغلاق إضافي للموبايل */}
        {isMenuOpen && (
            <button onClick={closeMenu} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                <FaTimes size={24} />
            </button>
        )}
      </div>
    </nav>
  );
}
