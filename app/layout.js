import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "ملخصات العجمي | El Agamy Materials",
  description: "مكتبتك الشاملة للتفوق الجامعي. احصل على أقوى ملخصات العجمي، مراجعات نهائية، وبنوك أسئلة لمواد الاقتصاد والمحاسبة والقانون. شروحات مبسطة وملفات PDF جاهزة للتحميل فوراً.",
  keywords: ["ملخصات العجمي", "El Agamy Materials", "مراجعات نهائية", "اقتصاد", "محاسبة", "PDF تعليمي"],
  icons: {
    icon: '/favicon.ico',
  },
  // ✅ كود التوثيق الخاص بجوجل (لا تحذفيه)
  verification: {
    google: "S5pMWU_XezcEhJnIRbN_jJI7KqHnvF050Ed5268sCa8",
  },
  openGraph: {
    title: "ملخصات العجمي | El Agamy Materials",
    description: "حمل أفضل الملخصات والمراجعات النهائية مجاناً.",
    siteName: "El Agamy Materials",
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  // 🔒 تحكمي في حالة الموقع من هنا:
  // true  = الموقع مغلق (وضع الصيانة)
  // false = الموقع مفتوح ويعمل بشكل طبيعي
  const isClosed = true; 

  // 🔴 ضعي كود Google Analytics هنا إذا توفر مستقبلاً
  const GA_MEASUREMENT_ID = ''; 

  return (
    <html lang="ar" dir="rtl">
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif' }}>
        
        {/* سكربتات جوجل (تعمل في الخلفية) */}
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

        {/* ✅ منطق الإغلاق والفتح */}
        {isClosed ? (
          // 🛑 تصميم شاشة الصيانة
          <div style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#111', // خلفية سوداء
            color: 'white',
            textAlign: 'center',
            padding: '20px',
            boxSizing: 'border-box'
          }}>
            <h1 style={{ fontSize: '4rem', margin: '0 0 20px 0' }}>🚧</h1>
            <h2 style={{ fontSize: '2rem', margin: '0 0 15px 0', fontWeight: 'bold' }}>الموقع تحت الصيانة</h2>
            <p style={{ color: '#aaa', fontSize: '1.2rem', maxWidth: '500px', lineHeight: '1.6' }}>
              نقوم حالياً ببعض التحديثات والتحسينات لتقديم تجربة أفضل.
              <br />
              سنعود للعمل قريباً جداً!
            </p>
          </div>
        ) : (
          // 🟢 عرض الموقع الطبيعي
          children
        )}

      </body>
    </html>
  );
  }
