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
    const interval = setInterval(check, 1000); // تحديث دوري لضمان الظهور
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <>
      {/* زر الموبايل للفتح */}
      <button className="md:hidden fixed top-4 left-4 z-[100] bg-purple-600 p-3 rounded-xl shadow-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* الناف بار الجانبي - جهة الشمال */}
      <nav className={`fixed top-0 left-0 h-screen bg-[#0a0a0a] border-r border-white/5 z-[90] transition-all duration-300 ${isMenuOpen ? 'w-64' : 'w-0 -left-64'} md:w-20 md:left-0 flex flex-col items-center py-8 gap-6 overflow-y-auto custom-scrollbar`}>
        
        {/* اللوجو */}
        <div className="mb-6 cursor-pointer group" onClick={() => router.push('/dashboard')}>
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-all" />
        </div>

        {/* الروابط */}
        <div className="flex flex-col gap-4 w-full px-2">
          <NavItem href="/dashboard" icon={<FaHome size={20}/>} title="الرئيسية" color="hover:bg-blue-600" />
          <NavItem href="/dashboard/subjects" icon={<FaBook size={20}/>} title="المواد" color="hover:bg-gray-600" />
          <NavItem href="/dashboard/exams" icon={<FaClipboardList size={20}/>} title="الامتحانات" color="hover:bg-purple-600" />
          <NavItem href="/dashboard/share" icon={<FaCloudUploadAlt size={20}/>} title="رفع ملخص" color="hover:bg-green-600" />
          
          {/* زر الإدارة - الدرع البرتقالي */}
          {hasAccess && (
            <NavItem href="/admin?mode=login" icon={<FaShieldAlt size={20}/>} title="لوحة الإدارة" color="bg-orange-600/20 text-orange-500 hover:bg-orange-600 hover:text-white border-orange-500/30" />
          )}

          <NavItem href="/dashboard/myUploads" icon={<FaUserClock size={20}/>} title="ملخصاتي" color="hover:bg-cyan-600" />
        </div>

        {/* تسجيل الخروج */}
        <button onClick={handleLogout} className="mt-auto p-3 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-lg shadow-red-600/10">
          <FaSignOutAlt size={20} />
        </button>
      </nav>
    </>
  );
}

function NavItem({ href, icon, title, color }) {
  return (
    <Link href={href} className={`w-12 h-12 mx-auto flex items-center justify-center rounded-2xl border border-white/5 transition-all shadow-md group relative ${color}`}>
      {icon}
      {/* Tooltip يظهر عند الوقوف على الزر */}
      <span className="absolute left-16 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {title}
      </span>
    </Link>
  );
}
