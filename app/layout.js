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
          // 🎨 الخيار 1: تصميم حديث مع خلفية متدرجة
          <div style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // خلفية موف وأزرق
            color: 'white',
            textAlign: 'center',
            padding: '20px',
            fontFamily: 'sans-serif'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '20px', animation: 'bounce 2s infinite' }}>🚀</div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>جاري تجهيز الانطلاق</h1>
            <p style={{ fontSize: '1.2rem', opacity: '0.9', maxWidth: '600px', lineHeight: '1.8' }}>
              نقوم بإضافة ملخصات ومواد جديدة لتكون جاهزة لك.
              <br />
       عد إلينا قريباً !
            </p>
            {/* زر وهمي للشكل الجمالي */}
            <div style={{ marginTop: '30px', padding: '10px 25px', background: 'rgba(255,255,255,0.2)', borderRadius: '50px', backdropFilter: 'blur(5px)' }}>
              قريباً جداً...
            </div>
            
            {/* كود الحركة البسيطة */}
            <style>{`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
              }
            `}</style>
          </div>
        ) : (
          children
        )}
