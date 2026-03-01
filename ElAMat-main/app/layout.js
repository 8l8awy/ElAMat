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
  const isClosed = true; 
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
        {/* Google AdSense */}
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

        {/* Google Analytics */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}

        {/* الخلفية البنفسجية الموحدة لكل الموقع */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* توهج بنفسجي علوي */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-purple-600/10 rounded-full blur-[100px] md:blur-[150px]"></div>
          {/* توهج أزرق/بنفسجي سفلي */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10">
          <AuthProvider>
            {isClosed ? (
              /* شاشة الصيانة المحدثة لتناسب الثيم الجديد */
              <div className="h-screen w-full fixed inset-0 z-[9999] flex flex-col justify-center items-center bg-[#050505] p-10 text-center">
                <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center animate-pulse mb-6">
                   <span className="text-5xl text-purple-400">:(</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">...</h2>
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
