import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext"; 

// 1. تعريف الميتا داتا (كما فعلنا سابقاً)
export const metadata = {
  title: "El Agamy Materials | منصة العجمي التعليمية",
  description: "أفضل منصة لتحميل الملخصات، المراجعات النهائية، وبنوك الأسئلة لطلاب جامعة العجمي.",
  // لاحظ: إذا قمت بالخطوة 2 بوضع الملفات في مجلد app، لا تحتاج لإضافة icons هنا يدوياً
  // ولكن للتأكيد يمكنك تركها هكذا إذا كان لديك ملف favicon.ico في مجلد public
  // icons: {
  //   icon: '/favicon.ico', 
  // },
  openGraph: {
    title: "El Agamy Materials",
    description: "منصة تعليمية متكاملة لطلاب العجمي.",
    siteName: "El Agamy Materials",
    url: 'https://eamat.vercel.app',
    locale: 'ar_EG',
    type: 'website',
    // يفضل إضافة صورة للـ Open Graph هنا أيضاً للمشاركة على السوشيال ميديا
    // images: [{ url: 'https://eamat.vercel.app/og-image.png', width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }) {
  const isClosed = false;
  const GA_MEASUREMENT_ID = ''; 

  // 2. تجهيز البيانات المنظمة (Schema Markup)
  // استبدل الرابط برابط اللوجو الحقيقي الخاص بك
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'El Agamy Materials',
    url: 'https://eamat.vercel.app',
    logo: 'https://eamat.vercel.app/icon.png', // 👈👈 هام جداً: ضع رابط اللوجو المربع هنا
    sameAs: [
      // أضف روابط صفحاتك على السوشيال ميديا هنا إذا وجدت
      // 'https://www.facebook.com/yourpage',
      // 'https://twitter.com/yourhandle'
    ]
  }

  return (
    <html lang="ar">
      <body style={{ margin: 0, padding: 0 }}>
        
        {/* 3. إضافة السكربت الخاص بالبيانات المنظمة */}
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
              // ... (كود شاشة الإغلاق كما هو) ...
              <div style={{ /* ... */ }}>...</div>
            ) : (
              children
            )}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
