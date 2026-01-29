import { AuthProvider } from '../context/AuthContext';
import "./globals.css";

export const metadata = {
  title: "El Agamy Materials",
  description: "منصة المواد الدراسية",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-black text-white min-h-screen relative overflow-x-hidden">
        
        {/* الخلفية البنفسجية */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-800/10 rounded-full blur-[100px]"></div>
        </div>

        {/* الهيدر مع اللوجو المدمج */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-center leading-none">
          El
                <span className="flex items-center mx-1">
                  {/* اللوجو مكان حرف الـ a */}
                  <img 
                    src="/a.png" 
                    alt="a" 
                    className="h-[1.1em] w-auto inline-block transform translate-y-[2px] drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]" 
                    onError={(e) => {
                      if (!e.target.src.includes(".jpg")) {
                        e.target.src = "/a.jpg";
                      }
                    }}
                  />
                    gamy 

                </span>
                <span className="text-purple-500 mr-1">Materials</span>
              </h1>
            </div>

            <div className="text-[10px] text-gray-500 font-bold bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest">
              V2.0
            </div>
          </div>
        </header>

        <div className="relative z-10 pt-24">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>

      </body>
    </html>
  );
}
