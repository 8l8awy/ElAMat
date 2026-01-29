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
        
        {/* تأثيرات الخلفية العميقة */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-800/5 rounded-full blur-[100px]"></div>
        </div>

        {/* الهيدر المطور بكلمة Elagamy المدمجة */}
        <header className="fixed top-0 left-0 right-0 z-[100] bg-black/40 backdrop-blur-2xl border-b border-white/5 py-5 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* اللوجو: Elagamy Materials */}
            <div className="flex items-center select-none">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-baseline leading-none">
                {/* حرف El */}
                <span className="text-white">El</span>
                
                {/* حاوية اللوجو: ملغية المسافات تماماً ومضبوطة رأسياً */}
                <span className="inline-flex items-center mx-0 px-0 self-center">
                  <img 
                    src="/a.png" 
                    alt="a" 
                    className="h-[0.82em] w-auto inline-block transform translate-y-[0.08em] transition-transform duration-500 hover:scale-110 drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]" 
                    onError={(e) => {
                      if (!e.target.src.includes(".jpg")) {
                        e.target.src = "/a.jpg";
                      }
                    }}
                  />
                </span>

                {/* حرف gamy - ملزوق في اللوجو */}
                <span className="text-white -mr-[0.05em]">gamy</span>
                
                {/* كلمة Materials بمسافة بسيطة شيك */}
                <span className="text-purple-600 mr-2 opacity-90 italic">Materials</span>
              </h1>
            </div>

            {/* نسخة الموقع */}
            <div className="hidden sm:block">
              <div className="text-[10px] text-gray-500 font-black bg-white/5 px-4 py-1.5 rounded-full border border-white/5 uppercase tracking-[0.3em] shadow-inner">
                V2.0
              </div>
            </div>
          </div>
        </header>

        {/* محتوى الصفحات مع حماية الـ Auth */}
        <div className="relative z-10 pt-28">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>

        {/* فوتر بسيط للتأكيد على الحقوق */}
        <footer className="relative z-10 py-10 text-center opacity-20 text-[10px] font-bold tracking-widest pointer-events-none uppercase">
          © 2026 Elagamy Materials Dashboard
        </footer>

      </body>
    </html>
  );
}
