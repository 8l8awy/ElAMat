"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 1. استيراد الراوتر
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaBook, 
  FaBell, 
  FaSignOutAlt, 
  FaPlus, 
  FaCloudUploadAlt, 
  FaUserClock, 
  FaBars, 
  FaTimes 
} from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter(); // 2. تفعيل الراوتر
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // 3. دالة خروج مخصصة
  const handleLogout = () => {
    logout();          // مسح بيانات المستخدم
    closeMenu();       // إغلاق القائمة (في الموبايل)
    router.push('/');  // التوجيه فوراً لصفحة الدخول
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
        <Link href="/dashboard/announcements" className="nav-btn" title="الإعلانات" onClick={closeMenu}><FaBell /></Link>
        
        <Link href="/dashboard/share" className="nav-btn" title="مشاركة ملخص" onClick={closeMenu}>
             <FaCloudUploadAlt />
        </Link>

        {user?.isAdmin && (
            <Link href="/dashboard/admin" className="nav-btn" title="لوحة التحكم" style={{background:'#eab308', color:'black'}} onClick={closeMenu}>
                <FaPlus />
            </Link>
        )}

        <Link href="/dashboard/myUploads" className="nav-btn" title="ملخصاتي" onClick={closeMenu}><FaUserClock /></Link>
        
        {/* 4. استخدام الدالة الجديدة هنا */}
        <button onClick={handleLogout} className="nav-btn logout" title="تسجيل خروج"><FaSignOutAlt /></button>
      </div>
    </nav>
  );
}