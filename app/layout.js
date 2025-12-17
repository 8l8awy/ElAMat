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
  // true  = الموقع مغلق (شاشة الموت الزرقاء تظهر)
  // false = الموقع مفتوح (الموقع يعمل بشكل طبيعي)
  const isClosed = true; // 👈 غيري هذه القيمة إلى false لفتح الموقع

  const GA_MEASUREMENT_ID = ''; // 👈 ضعي معرف جوجل أناليتكس هنا إذا توفر لديك

  return (
    <html lang="ar">
      <body style={{ margin: 0, padding: 0 }}>
        
        {/* أكواد جوجل (اختياري) - تعمل فقط إذا وضعتي المعرف */}
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
            width: '100vw', // تأكيد العرض الكامل
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start', // النص يبدأ من اليسار
            backgroundColor: '#0078d7', // أزرق ويندوز
            color: 'white',
            padding: '50px',
            boxSizing: 'border-box', // لمنع مشاكل الـ Padding
            fontFamily: '"Segoe UI", Tahoma, sans-serif',
            direction: 'ltr' // مهم: النص بالإنجليزي من اليسار لليمين
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
            
            {/* رسالة مخفية صغيرة بالعربي في الأسفل لطمأنة الزوار */}
            <div style={{ position: 'absolute', bottom: '20px', right: '30px', direction: 'rtl', fontSize: '14px', opacity: 0.7 }}>
              جاري تحديث السيرفرات...
            </div>
          </div>
        ) : (
          // 🟢 الموقع الطبيعي (عندما isClosed = false)
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
