import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext"; 

// 1. إعدادات الـ SEO (Metadata)
export const metadata = {
  title: "El Agamy Materials | منصة العجمي التعليمية",
  description: "أفضل منصة لتحميل الملخصات، المراجعات النهائية، وبنوك الأسئلة لطلاب جامعة العجمي. سجل الآن مجاناً وابدأ رحلة التفوق الدراسي.",
  verification: {
    google: "S5pMWU_XezcEhJnIRbN_jJI7KqHnvF050Ed5268sCa8",
  },
  openGraph: {
    title: "El Agamy Materials | منصة العجمي التعليمية",
    description: "كل ما يحتاجه طالب العجمي في مكان واحد: ملخصات، مراجعات، ومجتمع طلابي متكامل.",
    siteName: "El Agamy Materials",
    url: 'https://eamat.vercel.app',
    locale: 'ar_EG',
    type: 'website',
  },
  // ملاحظة: Next.js سيكتشف ملف icon.png تلقائياً من مجلد app
};

export default function RootLayout({ children }) {
  const isClosed = true; // التحكم في إغلاق الموقع
  const GA_MEASUREMENT_ID = ''; 

  // 2. بيانات جوجل المنظمة (Schema Markup) - اللوجو
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'El Agamy Materials',
    url: 'https://eamat.vercel.app',
    logo: 'https://eamat.vercel.app/icon.png', // ✅ الرابط صحيح
    sameAs: [] // يمكنك إضافة روابط فيسبوك أو تويتر هنا مستقبلاً
  }

  return (
    <html lang="ar">
      <body style={{ margin: 0, padding: 0 }}>
        
        {/* 3. حقن كود بيانات اللوجو لـ جوجل */}
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

        <div dir="rtl">
          <AuthProvider>
            {isClosed ? (
              // شاشة الصيانة (Blue Screen)
              <div style={{
                height: '100vh',
                width: '100vw',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                backgroundColor: '#0078d7',
                color: 'white',
                padding: '50px',
                boxSizing: 'border-box',
                fontFamily: '"Segoe UI", Tahoma, sans-serif',
                direction: 'ltr'
              }}>
                <h1 style={{ fontSize: '6rem', margin: 0, fontWeight: 'normal' }}>:(</h1>
                <h2 style={{ fontSize: '2rem', marginTop: '20px', fontWeight: 'normal' }}>
                  Your PC ran into a problem... just kidding!
                </h2>
                <p style={{ fontSize: '1.5rem', marginTop: '20px' }}>
                  We are just updating "El Agamy Materials" database.
                  <br />
                  <span style={{ fontSize: '1rem', opacity: 0.8 }}>Error Code: UPGRADING_SYSTEM_TO_V2</span>
                </p>
                <div style={{ marginTop: '40px' }}>
                  <p>0% complete __________ 100%</p>
                </div>
              </div>
            ) : (
              // الموقع يعمل
              children
            )}
          </AuthProvider>
        </div>

      </body>
    </html>
  );
}
