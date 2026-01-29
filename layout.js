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

        {/* الهيدر المطور والمضبوط بالمللي */}
        <header className="fixed top-0 left-0 right-0 z-[100] bg-black/40 backdrop-blur-2xl border-b border-white/5 py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            <div className="flex items-center select-none">
              {/* Container اللوجو مع إلغاء أي فراغات وهمية */}
              <h1 className="flex items-center gap-0 text-2xl md:text-3xl font-black tracking-tighter leading-none">
                
                {/* كلمة El */}
                <span className="text-white">El</span>
                
                {/* اللوجو - محشور في النص تماماً */}
                <span className="flex items-center justify-center -mx-[2px] self-center"> 
                  <img 
                    src="/a.png" 
                    alt="a" 
                    className="h-[0.80em] w-auto block transform translate-y-[0.1em] drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]" 
                    onError={(e) => {
                      if (!e.target.src.includes(".jpg")) {
                        e.target.src = "/a.jpg";
                      }
                    }}
                  />
                </span>

                {/* كلمة gamy */}
                <span className="text-white">gamy</span>
                
                {/* كلمة Materials */}
                <span className="text-purple-600 mr-2 italic font-black opacity-90">Materials</span>
              </h1>
            </div>

            {/* نسخة الموقع بتصميم شيك */}
            <div className="hidden sm:block text-[10px] text-gray-500 font-black bg-white/5 px-3 py-1 rounded-full border border-white/5 tracking-[0.2em] shadow-inner uppercase">
              V2.0
            </div>
          </div>
        </header>

        {/* محتوى الصفحات */}
        <div className="relative z-10 pt-28">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>

        {/* الفوتر */}
        <footer className="relative z-10 py-10 text-center opacity-20 text-[10px] font-bold tracking-widest pointer-events-none uppercase">
          © 2026 Elagamy Materials Dashboard
        </footer>

      </body>
    </html>
  );
}
