"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaBook, FaBell, FaSignOutAlt, 
  FaCloudUploadAlt, FaUserClock, FaBars, 
  FaTimes, FaClipboardList, FaShieldAlt
} from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const check = () => {
      const code = localStorage.getItem("adminCode");
      const role = localStorage.getItem("adminRole");
      // يظهر الزرار لو الكود 98600 أو الرتبة مراجع/أدمن
      if (code === "98600" || role === "moderator" || role === "admin") {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    };
    check();
    const interval = setInterval(check, 1000); 
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <>
      {/* 1. الناف بار العلوي (يظهر في الكمبيوتر فقط md:flex) */}
      <nav className="hidden md:flex fixed top-0 left-0 w-full h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 z-[100] items-center justify-between px-8">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/dashboard')}>
          <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          <span className="text-white font-black italic text-sm tracking-tighter uppercase">EAM Materials</span>
        </div>

        <div className="flex items-center gap-2">
          <NavLink href="/dashboard" icon={<FaHome size={18}/>} title="الرئيسية" />
          <NavLink href="/dashboard/subjects" icon={<FaBook size={18}/>} title="المواد" />
          <NavLink href="/dashboard/exams" icon={<FaClipboardList size={18}/>} title="الامتحانات" />
          <NavLink href="/dashboard/share" icon={<FaCloudUploadAlt size={18}/>} title="رفع ملخص" />
          
          {hasAccess && (
            <NavLink href="/admin?mode=login" icon={<FaShieldAlt size={18}/>} title="الإدارة" variant="admin" />
          )}
          
          <NavLink href="/dashboard/myUploads" icon={<FaUserClock size={18}/>} title="ملخصاتي" />
          
          <button onClick={handleLogout} className="p-3 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all ml-4">
            <FaSignOutAlt size={18} />
          </button>
        </div>
      </nav>

      {/* 2. الناف بار للموبايل (Sidebar جانبي يظهر في الموبايل فقط md:hidden) */}
      <div className="md:hidden">
        <button className="fixed top-4 left-4 z-[110] bg-purple-600 p-3 rounded-xl shadow-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className={`fixed top-0 left-0 h-screen bg-[#0a0a0a] border-r border-white/5 z-[100] transition-all duration-300 ${isMenuOpen ? 'w-64' : 'w-0 -left-64'} flex flex-col items-center py-8 gap-6`}>
          <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain mb-6" />
          <div className="flex flex-col gap-4 w-full px-4">
             <MobileNavLink href="/dashboard" icon={<FaHome/>} label="الرئيسية" onClick={() => setIsMenuOpen(false)} />
             <MobileNavLink href="/dashboard/subjects" icon={<FaBook/>} label="المواد" onClick={() => setIsMenuOpen(false)} />
             <MobileNavLink href="/dashboard/share" icon={<FaCloudUploadAlt/>} label="رفع ملخص" onClick={() => setIsMenuOpen(false)} />
             {hasAccess && (
               <MobileNavLink href="/admin?mode=login" icon={<FaShieldAlt/>} label="لوحة الإدارة" onClick={() => setIsMenuOpen(false)} variant="admin" />
             )}
             <MobileNavLink href="/dashboard/myUploads" icon={<FaUserClock/>} label="ملخصاتي" onClick={() => setIsMenuOpen(false)} />
             <button onClick={handleLogout} className="flex items-center gap-3 p-4 rounded-2xl bg-red-600/10 text-red-500 w-full font-bold">
                <FaSignOutAlt/> تسجيل خروج
             </button>
          </div>
        </nav>
      </div>

      {/* مسافة للأجهزة المكتبية عشان المحتوى ميبدأش من تحت الناف بار */}
      <div className="hidden md:block h-16 w-full"></div>
    </>
  );
}

// مكون روابط الكمبيوتر
function NavLink({ href, icon, title, variant }) {
  const isAdmin = variant === "admin";
  return (
    <Link href={href} title={title} className={`p-3 rounded-xl transition-all border border-white/5 flex items-center justify-center ${isAdmin ? 'bg-orange-600/20 text-orange-500 border-orange-500/30 hover:bg-orange-600 hover:text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}>
      {icon}
    </Link>
  );
}

// مكون روابط الموبايل
function MobileNavLink({ href, icon, label, onClick, variant }) {
  const isAdmin = variant === "admin";
  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-4 p-4 rounded-2xl border border-white/5 font-bold text-sm ${isAdmin ? 'bg-orange-600/10 text-orange-500 border-orange-500/20' : 'text-gray-300'}`}>
      {icon} {label}
    </Link>
  );
}
