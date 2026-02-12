"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Note: In a production app, verify admin status via your AuthContext/Backend
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem("adminCode") : null;
    setIsAdmin(!!adminToken);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navItems = useMemo(() => [
    { href: '/dashboard', icon: FaHome, label: 'الرئيسية', color: 'hover:bg-blue-600' },
    { href: '/dashboard/subjects', icon: FaBook, label: 'المواد', color: 'hover:bg-gray-600' },
    { href: '/dashboard/exams', icon: FaClipboardList, label: 'الامتحانات', color: 'hover:bg-purple-600' },
    { href: '/dashboard/announcements', icon: FaBell, label: 'الإعلانات', color: 'hover:bg-yellow-600' },
    { href: '/dashboard/share', icon: FaCloudUploadAlt, label: 'رفع ملخص', color: 'hover:bg-green-600' },
    { href: '/dashboard/myUploads', icon: FaUserClock, label: 'ملخصاتي', color: 'hover:bg-cyan-600' },
  ], []);

  const btnClass = "nav-btn w-fit mx-auto p-3 flex justify-center items-center rounded-xl transition-all duration-200 hover:scale-110 shadow-lg border border-white/5";

  return (
    <nav className="navbar relative z-50">
      {/* Logo Section */}
      <div 
        className="flex items-center justify-center py-2 mb-2 select-none cursor-pointer group" 
        onClick={() => router.push('/dashboard')}
      >
        <img 
          src="/logo.png" 
          alt="EAM Logo" 
          className="h-10 md:h-14 w-auto object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.4)] transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.currentTarget.src = "/a.png" }} 
        />
      </div>

      {/* Mobile Toggle */}
      <button 
        className="burger-btn text-2xl p-2 md:hidden" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle Menu"
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Navigation Links */}
      <div className={`nav-buttons flex flex-col gap-3 transition-all ${isMenuOpen ? 'active' : ''}`}>
        
        {user?.name && (
          <span className="text-white font-bold text-center mb-4 text-sm block truncate px-2">
            {user.name}
          </span>
        )}
        
        {navItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className={`${btnClass} ${item.color}`} 
            title={item.label}
          >
            <item.icon size={20} />
          </Link>
        ))}

        {isAdmin && (
          <Link 
            href="/dashboard/admin" 
            className={`${btnClass} hover:bg-orange-600`} 
            title="لوحة التحكم"
          >
             <FaCogs size={20} />
          </Link>
        )}

        <div className="w-fit mx-auto"> 
            <AdminLink onClick={() => setIsMenuOpen(false)} />
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout} 
          className={`${btnClass} mt-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border-red-500/20`}
          title="تسجيل خروج"
        >
            <FaSignOutAlt size={20} />
        </button>
      </div>
    </nav>
  );
}
