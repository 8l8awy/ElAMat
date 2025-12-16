import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "ملخصات العجمي | El Agamy Materials",
  description: "مكتبتك الشاملة للتفوق الجامعي. احصل على أقوى ملخصات العجمي، مراجعات نهائية، وبنوك أسئلة لمواد الاقتصاد والمحاسبة والقانون. شروحات مبسطة وملفات PDF جاهزة للتحميل فوراً.",
  keywords: ["ملخصات العجمي", "El Agamy Materials", "مراجعات نهائية", "اقتصاد", "محاسبة", "PDF تعليمي"],
  icons: {
    icon: '/favicon.ico',
  },
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
  // 🔒 للتحكم في حالة الموقع:
  // اجعليها true لإغلاق الموقع وإظهار شاشة الصيانة السوداء
  // اجعليها false لإعادة فتح الموقع للطلاب
  const isClosed = true; 

  const GA_MEASUREMENT_ID = ''; 

  return (
    <html lang="en"> {/* جعلنا اللغة الإنجليزية للشاشة السوداء */}
      <body style={{ margin: 0, padding: 0 }}>
        
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

        {/* ✅ منطق الإغلاق */}
        {isClosed ? (
          // ⬛ تصميم شاشة 404 السوداء (Dark Mode 404)
          <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000', // خلفية سوداء تماماً
            color: '#fff',      // نص أبيض
            fontFamily: '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              // للموبايل: نجعل النص تحت الرقم
              '@media (max-width: 600px)': {
                 flexDirection: 'column'
              }
            }}>
                <h1 style={{
                  fontSize: '3rem',
                  fontWeight: '500',
                  margin: '0 20px 0 0',
                  borderRight: '1px solid rgba(255,255,255,.3)', // خط فاصل رمادي خفيف
                  paddingRight: '20px'
                }}>404</h1>
                <h2 style={{
                  fontSize: '1rem',
                  fontWeight: 'normal',
                  margin: 0,
                  lineHeight: '1.5'
                }}>This site is currently undergoing maintenance.<br/>We will be back shortly.</h2>
            </div>
          </div>
        ) : (
          // 🟢 الموقع الطبيعي
          <div dir="rtl"> {/* نعيد الاتجاه لليمين للمحتوى العربي */}
            {children}
          </div>
        )}

      </body>
    </html>
  );
    }
