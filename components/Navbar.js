"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AdminLink from '../components/AdminLink'; 
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

  // 🎨 ستايل موحد لكل الأزرار (مربع + أيقونة في المنتصف)
  const btnStyle = "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 hover:scale-110 shadow-md text-lg";

  return (
    <nav className="navbar flex items-center justify-between p-4 bg-[#0b0c15] text-white">
      <div className="flex items-center gap-3">
        <img src="/logo-no-background-1.png" alt="Logo" width="45" /> 
        <span className="font-bold text-lg hidden md:block">El Agamy Materials</span>
      </div>
      
      {/* زر الموبايل */}
      <button className="md:hidden text-2xl" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* قائمة الأزرار */}
      <div className={`flex items-center gap-3 ${isMenuOpen ? 'fixed inset-0 bg-[#0b0c15]/95 z-50 flex-col justify-center gap-6' : 'hidden md:flex'}`}>
        
        {/* اسم المستخدم (يظهر فقط في الموبايل أو الشاشات الكبيرة) */}
        {isMenuOpen && <span className="text-xl font-bold mb-4">{user?.name}</span>}

        {/* 1. الرئيسية */}
        <Link href="/dashboard" onClick={closeMenu} title="الرئيسية" 
              className={`${btnStyle} bg-blue-600 text-white hover:bg-blue-500`}>
           <FaHome />
        </Link>

        {/* 2. المواد */}
        <Link href="/dashboard/subjects" onClick={closeMenu} title="المواد" 
              className={`${btnStyle} bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white`}>
           <FaBook />
        </Link>
        
        {/* 3. الامتحانات (جديد) */}
        <Link href="/dashboard/exams" onClick={closeMenu} title="الامتحانات" 
              className={`${btnStyle} bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500 hover:text-white`}>
            <FaClipboardList />
        </Link>

        {/* 4. الإعلانات */}
        <Link href="/dashboard/announcements" onClick={closeMenu} title="الإعلانات" 
              className={`${btnStyle} bg-gray-800 text-yellow-400 hover:bg-gray-700`}>
           <FaBell />
        </Link>
        
        {/* 5. مشاركة */}
        <Link href="/dashboard/share" onClick={closeMenu} title="رفع ملف" 
              className={`${btnStyle} bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500 hover:text-white`}>
             <FaCloudUploadAlt />
        </Link>

        {/* 6. زر الأدمن (مربع أحمر) */}
        <div onClick={closeMenu}>
            <AdminLink />
        </div>

        {/* 7. ملخصاتي */}
        <Link href="/dashboard/myUploads" onClick={closeMenu} title="ملخصاتي" 
              className={`${btnStyle} bg-gray-800 text-cyan-400 hover:bg-gray-700`}>
           <FaUserClock />
        </Link>
        
        {/* 8. خروج */}
        <button onClick={handleLogout} title="تسجيل خروج" 
                className={`${btnStyle} bg-red-600 text-white hover:bg-red-500 mt-4 md:mt-0`}>
           <FaSignOutAlt />
        </button>

        {/* زر إغلاق القائمة في الموبايل */}
        {isMenuOpen && (
            <button onClick={closeMenu} className="absolute top-6 right-6 text-gray-400 text-3xl">
                <FaTimes />
            </button>
        )}
      </div>
    </nav>
  );
}
