import "./globals.css";
import Script from "next/script";
// 👇 هام: تأكدي أن هذا المسار صحيح لملف AuthContext الخاص بك
import { AuthProvider } from "@/context/AuthContext"; 

export const metadata = {
  title: "ملخصات العجمي | El Agamy Materials",
  description: "مكتبتك الشاملة للتفوق الجامعي. احصل على أقوى ملخصات العجمي، مراجعات نهائية، وبنوك أسئلة.",
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
  // 🔒 للتحكم في الموقع:
  // true  = الموقع مغلق (شاشة الموت الزرقاء)
  // false = الموقع مفتوح (مع تفعيل المصادقة)
  const isClosed = true; 

  const GA_MEASUREMENT_ID = ''; 

  return (
    <html lang="ar">
      <body style={{ margin: 0, padding: 0 }}>
        
        {/* أكواد جوجل (اختياري) */}
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
          // 💻 الخيار 1: شاشة الموت الزرقاء (BSOD)
          <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start', // النص يبدأ من اليسار
            backgroundColor: '#0078d7', // أزرق ويندوز
            color: 'white',
            padding: '50px',
            fontFamily: 'Segoe UI, Tahoma, sans-serif',
            direction: 'ltr' // مهم: النص بالإنجليزي من اليسار لليمين
          }}>
            <h1 style={{ fontSize: '6rem', margin: 0 }}>:(</h1>
            <h2 style={{ fontSize: '2rem', marginTop: '20px' }}>
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
          // 🟢 الموقع الطبيعي
          // 👇 هنا أضفنا AuthProvider لحل مشكلة البناء السابقة
          <div dir="rtl">
            <AuthProvider>
              {children}
            </AuthProvider>
          </div>
        )}

      </body>
    </html>
  );
}
