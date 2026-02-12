"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
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
  FaCogs
} from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Memoized toggle and close functions
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  // Optimized logout handler
  const handleLogout = useCallback(() => {
    logout();
    closeMenu();
    router.push('/');
  }, [logout, closeMenu, router]);

  // Check admin status on mount and when dependencies change
  useEffect(() => {
    const checkAdmin = () => {
      if (typeof window !== 'undefined') {
        const adminCode = localStorage.getItem("adminCode");
        setIsAdmin(!!adminCode);
      }
    };
    checkAdmin();
  }, [user]); // Re-check when user changes

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [router, closeMenu]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen, closeMenu]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Navigation items configuration
  const navItems = useMemo(() => [
    {
      href: '/dashboard',
      icon: FaHome,
      title: 'الرئيسية',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      href: '/dashboard/subjects',
      icon: FaBook,
      title: 'المواد',
      hoverColor: 'hover:bg-gray-600',
    },
    {
      href: '/dashboard/exams',
      icon: FaClipboardList,
      title: 'الامتحانات',
      hoverColor: 'hover:bg-purple-600',
    },
    {
      href: '/dashboard/announcements',
      icon: FaBell,
      title: 'الإعلانات',
      hoverColor: 'hover:bg-yellow-600',
    },
    {
      href: '/dashboard/share',
      icon: FaCloudUploadAlt,
      title: 'رفع ملخص / تكليف',
      hoverColor: 'hover:bg-green-600',
    },
    ...(isAdmin ? [{
      href: '/dashboard/admin',
      icon: FaCogs,
      title: 'لوحة التحكم الرئيسية',
      hoverColor: 'hover:bg-orange-600',
    }] : []),
    {
      href: '/dashboard/myUploads',
      icon: FaUserClock,
      title: 'ملخصاتي',
      hoverColor: 'hover:bg-cyan-600',
    },
  ], [isAdmin]);

  const btnClass = "nav-btn w-fit mx-auto p-3 flex justify-center items-center rounded-xl transition-all hover:scale-110 shadow-lg border border-white/5";

  return (
    <>
      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <nav className="navbar" role="navigation" aria-label="Main navigation">
        {/* Logo Header */}
        <div 
          className="flex items-center justify-center py-1 mb-0 select-none cursor-pointer group" 
          onClick={() => router.push('/dashboard')}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              router.push('/dashboard');
            }
          }}
          aria-label="Go to dashboard"
        >
          <img 
            src="/logo.png" 
            alt="EAM Logo" 
            className="h-8 md:h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-300 group-hover:scale-110"
            onError={(e) => { 
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = "/a.png";
            }} 
          />
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="burger-btn" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="nav-menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation Menu */}
        <div 
          id="nav-menu"
          className={`nav-buttons ${isMenuOpen ? 'active' : ''}`}
          role="menu"
        >
          {/* User Name Display */}
          {user?.name && (
            <span 
              className="text-white font-bold block text-center mb-4 text-sm md:text-base truncate px-2"
              aria-label={`Logged in as ${user.name}`}
            >
              {user.name}
            </span>
          )}
          
          {/* Navigation Links */}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`${btnClass} ${item.hoverColor}`} 
                title={item.title}
                onClick={closeMenu}
                role="menuitem"
                aria-label={item.title}
              >
                <Icon size={20} aria-hidden="true" />
              </Link>
            );
          })}

          {/* Admin Link Component */}
          <div className="w-fit mx-auto"> 
            <AdminLink onClick={closeMenu} />
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className={`${btnClass} logout bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white mt-2`}
            title="تسجيل خروج"
            role="menuitem"
            aria-label="Logout"
          >
            <FaSignOutAlt size={20} aria-hidden="true" />
          </button>
        </div>
      </nav>
    </>
  );
}
