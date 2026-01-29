import { AuthProvider } from '../context/AuthContext';
import "./globals.css";

export const metadata = {
  title: "El Agamy Materials",
  description: "منصة المواد الدراسية",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#020202] text-white min-h-screen relative overflow-x-hidden font-sans">
        
        {/* الخلفية */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-800/5 rounded-full blur-[100px]"></div>
        </div>

        {/* الهيدر المطور باللوجو الجديد */}
        <header className="fixed top-0 left-0 right-0 z-[100] bg-black/40 backdrop-blur-2xl border-b border-white/5 py-3 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            <div className="flex items-center gap-4">
              {/* حاوية اللوجو الجديد */}
              <div className="relative group flex items-center gap-3">
                <img 
                  src="/logo.png"  // تأكد من تسمية ملف اللوجو الجديد logo.png ووضعه في folder الـ public
                  alt="EAM Logo" 
                  className="h-10 md:h-12 w-auto object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.target.src = "/a.png" }} // كـ Backup لو الصورة مظهرتش
                />
                
                {/* كلمة Materials بجانب اللوجو بشكل شيك */}
                <div className="flex flex-col leading-none">
                  <span className="text-white font-black text-lg md:text-xl tracking-tighter uppercase">ELAGAMY</span>
                  <span className="text-purple-500 font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase italic opacity-80">Materials</span>
                </div>
              </div>
            </div>

            {/* نسخة الموقع بتصميم زجاجي */}
            <div className="hidden sm:block text-[10px] text-gray-400 font-black bg-white/5 px-4 py-1.5 rounded-full border border-white/10 tracking-[0.2em] shadow-lg">
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
