"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import AdminLink from './AdminLink'; 
import { 
  FaHome, 
  FaBook, 
  FaBell, 
  FaSignOutAlt, 
  FaCloudUploadAlt, 
  FaUserClock, 
  FaBars, 
  FaTimes,
  FaClipboardList,
  FaFileUpload // أيقونة إضافية إذا أحببت استخدامها للتكاليف
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

  // تنسيق الزر (في المنتصف + Fit Content)
  const btnClass = "nav-btn w-fit mx-auto p-3 flex justify-center items-center rounded-xl transition-all hover:scale-110";

  return (
    <nav className="navbar">
      <h1>
        <img src="/logo-no-background-1.png" alt="" width="50" style={{verticalAlign:'middle'}} /> 
        <span style={{marginLeft:'10px'}}>El Agamy Materials</span>
      </h1>
      
      <button className="burger-btn" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`nav-buttons ${isMenuOpen ? 'active' : ''}`}>
        
        <span id="userName" style={{color:'white', fontWeight:'bold', display:'block', textAlign:'center', marginBottom:'15px'}}>
            {user?.name}
        </span>
        
        {/* 1. الرئيسية */}
        <Link href="/dashboard" className={`${btnClass} hover:bg-blue-600`} title="الرئيسية" onClick={closeMenu}>
            <FaHome size={20} />
        </Link>

        {/* 2. المواد */}
        <Link href="/dashboard/subjects" className={`${btnClass} hover:bg-gray-600`} title="المواد" onClick={closeMenu}>
            <FaBook size={20} />
        </Link>
        
        {/* 3. الامتحانات */}
        <Link href="/dashboard/exams" className={`${btnClass} hover:bg-purple-600`} title="الامتحانات" onClick={closeMenu}>
            <FaClipboardList size={20} />
        </Link>

        {/* 4. الإعلانات */}
        <Link href="/dashboard/announcements" className={`${btnClass} hover:bg-yellow-600`} title="الإعلانات" onClick={closeMenu}>
            <FaBell size={20} />
        </Link>
        
        {/* 5. مشاركة (رفع الملخصات والتكاليف) 👈 هذا هو الزر */}
        <Link href="/dashboard/share" className={`${btnClass} hover:bg-green-600`} title="رفع ملخص / تكليف" onClick={closeMenu}>
             <FaCloudUploadAlt size={20} />
        </Link>

        {/* 6. زر الأدمن */}
        <div className="w-fit mx-auto"> 
            <AdminLink onClick={closeMenu} />
        </div>

        {/* 7. ملخصاتي */}
        <Link href="/dashboard/myUploads" className={`${btnClass} hover:bg-cyan-600`} title="ملخصاتي" onClick={closeMenu}>
             <FaUserClock size={20} />
        </Link>
        
        {/* 8. خروج */}
        <button onClick={handleLogout} className={`${btnClass} logout bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white`} title="تسجيل خروج" style={{marginTop:'10px'}}>
            <FaSignOutAlt size={20} />
        </button>
      </div>
    </nav>
  );
}
