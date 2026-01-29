import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "El Agamy Materials | منصة العجمي التعليمية",
  description: "أفضل منصة لتحميل الملخصات، المراجعات النهائية، وبنوك الأسئلة لطلاب جامعة العجمي. سجل الآن مجاناً وابدأ رحلة التفوق الدراسي.",
  verification: {
    google: "S5pMWU_XezcEhJnIRbN_jJI7KqHnvF050Ed5268sCa8",
  },
  icons: {
    icon: "/icon.jpeg",
    apple: "/icon.jpeg",
  },
  openGraph: {
    title: "El Agamy Materials | منصة العجمي التعليمية",
    description: "كل ما يحتاجه طالب العجمي في مكان واحد: ملخصات، مراجعات، ومجتمع طلابي متكامل.",
    siteName: "El Agamy Materials",
    url: 'https://eamat.vercel.app',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  const isClosed = false; 
  const GA_MEASUREMENT_ID = ''; 

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'El Agamy Materials',
    url: 'https://eamat.vercel.app',
    logo: 'https://eamat.vercel.app/icon.png',
  };

  return (
    <html lang="ar" dir="rtl">
      <head>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8855103518508999"
          crossOrigin="anonymous">
        </script>
      </head>
      <body className="bg-[#050505] min-h-screen relative overflow-x-hidden text-white font-sans">
        
        {/* بيانات Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* 1. الهيدر الجديد (يحتوي على الصورة فقط) */}
        <header className="fixed top-0 left-0 right-0 z-[100] bg-black/40 backdrop-blur-2xl border-b border-white/5 py-3 px-6 md:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center select-none cursor-pointer">
              <img 
                src="/logo.png" // ⚠️ تأكد أن الصورة في public باسم logo.png
                alt="EAM Logo" 
                className="h-10 md:h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-500 hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }} 
              />
              <span className="hidden font-black text-xl text-purple-500 italic">EAM Portal</span>
            </div>
            <div className="text-[10px] text-gray-500 font-black bg-white/5 px-4 py-1.5 rounded-full border border-white/5 tracking-[0.2em] shadow-inner uppercase">
              V2.0
            </div>
          </div>
        </header>

        {/* 2. خلفية التوهج البنفسجي */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-purple-600/10 rounded-full blur-[100px] md:blur-[150px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 pt-24 md:pt-32">
          <AuthProvider>
            {isClosed ? (
              <div className="h-screen w-full fixed inset-0 z-[9999] flex flex-col justify-center items-center bg-[#050505] p-10 text-center">
                <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center animate-pulse mb-6">
                   <span className="text-5xl text-purple-400">:(</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">نحن في صيانة سريعة</h2>
                <div className="mt-10 w-64 h-2 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-600 animate-progress"></div>
                </div>
              </div>
            ) : (
              children
            )}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
