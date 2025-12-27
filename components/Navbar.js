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
  FaClipboardList
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

  // ✅ كلاس موحد لتوسيط جميع الأزرار
  // nav-btn: الكلاس القديم (للشكل)
  // flex justify-center items-center: لتوسيط الأيقونة في النصف تماماً
  const btnClass = "nav-btn flex justify-center items-center gap-2";

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
        <span id="userName" style={{color:'white', marginLeft:'10px', fontWeight:'bold', display:'block', textAlign:'center', marginBottom:'10px'}}>{user?.name}</span>
        
        {/* 1. الرئيسية */}
        <Link href="/dashboard" className={btnClass} title="الرئيسية" onClick={closeMenu}>
            <FaHome />
        </Link>

        {/* 2. المواد */}
        <Link href="/dashboard/subjects" className={btnClass} title="المواد" onClick={closeMenu}>
            <FaBook />
        </Link>
        
        {/* 3. الامتحانات */}
        <Link href="/dashboard/exams" className={btnClass} title="الامتحانات" onClick={closeMenu}>
            <FaClipboardList />
        </Link>

        {/* 4. الإعلانات */}
        <Link href="/dashboard/announcements" className={btnClass} title="الإعلانات" onClick={closeMenu}>
            <FaBell />
        </Link>
        
        {/* 5. مشاركة */}
        <Link href="/dashboard/share" className={btnClass} title="مشاركة ملخص" onClick={closeMenu}>
             <FaCloudUploadAlt />
        </Link>

        {/* 6. زر الأدمن (تأكدنا من توسيطه أيضاً) */}
        <div className="flex justify-center w-full"> 
            <AdminLink onClick={closeMenu} />
        </div>

        {/* 7. ملخصاتي */}
        <Link href="/dashboard/myUploads" className={btnClass} title="ملخصاتي" onClick={closeMenu}>
             <FaUserClock />
        </Link>
        
        {/* 8. خروج */}
        <button onClick={handleLogout} className={`${btnClass} logout`} title="تسجيل خروج">
            <FaSignOutAlt />
        </button>
      </div>
    </nav>
  );
}
