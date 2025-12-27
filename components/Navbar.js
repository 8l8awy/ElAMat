"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
// 👇 1. استيراد المكون السري للأدمن
import AdminLink from '../components/AdminLink'; 
import { 
  FaHome, 
  FaBook, 
  FaBell, 
  FaSignOutAlt, 
  FaPlus, 
  FaCloudUploadAlt, 
  FaUserClock, 
  FaBars, 
  FaTimes,
  FaClipboardList // 👈 2. استيراد أيقونة الامتحانات
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
        <span id="userName" style={{color:'white', marginLeft:'10px', fontWeight:'bold'}}>{user?.name}</span>
        
        <Link href="/dashboard" className="nav-btn" title="الرئيسية" onClick={closeMenu}><FaHome /></Link>
        <Link href="/dashboard/subjects" className="nav-btn" title="المواد" onClick={closeMenu}><FaBook /></Link>
        
        {/* 👇 3. زر الامتحانات (يظهر للجميع) */}
        <Link href="/dashboard/exams" className="nav-btn" title="الامتحانات" onClick={closeMenu}>
            <FaClipboardList />
        </Link>

        <Link href="/dashboard/announcements" className="nav-btn" title="الإعلانات" onClick={closeMenu}><FaBell /></Link>
        
        <Link href="/dashboard/share" className="nav-btn" title="مشاركة ملخص" onClick={closeMenu}>
             <FaCloudUploadAlt />
        </Link>

        {/* 👇 4. الزر السري (يظهر لك أنت فقط كأدمن) */}
        <div onClick={closeMenu}>
            <AdminLink />
        </div>

        {/* زر الأدمن القديم (إذا كنت تريد الإبقاء عليه أو حذفه) */}
        {user?.isAdmin && (
            <Link href="/dashboard/admin" className="nav-btn" title="لوحة التحكم" style={{background:'#eab308', color:'black'}} onClick={closeMenu}>
                <FaPlus />
            </Link>
        )}

        <Link href="/dashboard/myUploads" className="nav-btn" title="ملخصاتي" onClick={closeMenu}><FaUserClock /></Link>
        
        <button onClick={handleLogout} className="nav-btn logout" title="تسجيل خروج"><FaSignOutAlt /></button>
      </div>
    </nav>
  );
}
