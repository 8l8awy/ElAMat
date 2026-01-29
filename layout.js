import { AuthProvider } from '../context/AuthContext';
import "./globals.css";

export const metadata = {
  title: "El Agamy Materials",
  description: "منصة المواد الدراسية",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className=" text-white min-h-screen relative overflow-x-hidden font-sans">
        
        {/* الخلفية */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-800/5 rounded-full blur-[100px]"></div>
        </div>

        {/* الهيدر المطور باللوجو الجديد */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/40 backdrop-blur-2xl border-b border-white/5 py-4 px-6 md:px-12">
  <div className="max-w-7xl mx-auto flex items-center justify-between">
    
    {/* اللوجو كصورة فقط - بدون أي كلام */}
    <div className="flex items-center select-none cursor-pointer">
       <img 
          src="/logo.png" 
          alt="EAM Logo" 
          className="h-10 md:h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-500 hover:scale-110 hover:drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]"
          onError={(e) => { e.target.src = "/a.png" }} 
       />
    </div>

    {/* نسخة الموقع - بتوازن شكل الهيدر من الناحية التانية */}
    <div className="text-[10px] text-gray-500 font-black bg-white/5 px-4 py-1.5 rounded-full border border-white/5 tracking-[0.2em] shadow-inner uppercase">
      V2.0
    </div>
  </div>
</header>
        {/* المحتوى */}
        <div className="relative z-10 pt-28">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>

        <footer className="relative z-10 py-10 text-center opacity-20 text-[10px] font-bold tracking-widest uppercase">
          © 2026 Elagamy Materials
        </footer>

      </body>
    </html>
  );
}
