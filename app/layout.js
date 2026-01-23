import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";

// 1. إعدادات الـ SEO و Metadata
export const metadata = {
  title: "El Agamy Materials | منصة العجمي التعليمية",
  description: "أفضل منصة لتحميل الملخصات، المراجعات النهائية، وبنوك الأسئلة لطلاب جامعة العجمي.",
  verification: {
    google: "S5pMWU_XezcEhJnIRbN_jJI7KqHnvF050Ed5268sCa8",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
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
  const isClosed = false; // اجعلها true إذا أردت تفعيل شاشة الصيانة

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
        {/* كود Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8855103518508999"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="bg-[#050505] min-h-screen relative overflow-x-hidden">
        {/* بيانات Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* تأثيرات الخلفية البنفسجية الموحدة (التي طلبتها) */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-purple-600/10 rounded-full blur-[100px] md:blur-[150px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10">
          <AuthProvider>
            {isClosed ? (
              /* شاشة الصيانة Blue Screen */
              <div style={{
                height: '100vh', width: '100vw', position: 'fixed',
                top: 0, left: 0, zIndex: 9999, display: 'flex',
                flexDirection: 'column', justifyContent: 'center',
                alignItems: 'flex-start', backgroundColor: '#0078d7',
                color: 'white', padding: '50px', boxSizing: 'border-box',
                fontFamily: '"Segoe UI", Tahoma, sans-serif', direction: 'ltr'
              }}>
                <h1 style={{ fontSize: '6rem', margin: 0 }}>:(</h1>
                <h2 style={{ fontSize: '2rem', marginTop: '20px' }}>Maintenance Mode</h2>
                <p style={{ fontSize: '1.5rem', marginTop: '20px' }}>We are updating the database. Be right back!</p>
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
