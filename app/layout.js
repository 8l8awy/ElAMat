// ملف: app/layout.js
import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "ملخصات العجمي | El Agamy Materials",
  description: "مكتبتك الشاملة للتفوق الجامعي. احصل على أقوى ملخصات العجمي، مراجعات نهائية، وبنوك أسئلة لمواد الاقتصاد والمحاسبة والقانون. شروحات مبسطة وملفات جاهزة للتحميل فوراً.",
  keywords: ["ملخصات العجمي", "El Agamy Materials", "مراجعات نهائية", "اقتصاد", "محاسبة", "PDF تعليمي"],
  icons: {
    icon: '/favicon.ico',
  },
  // ✅ تم إضافة كود التحقق الذي أرسلته هنا
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
  // 🔴 إذا كان لديك كود Google Analytics (يبدأ بـ G-) ضعيه هنا، وإلا اتركيه كما هو
  const GA_MEASUREMENT_ID = ''; 

  return (
    <html lang="ar" dir="rtl">
      <body>
        {/* سيتم تفعيل التحليلات فقط إذا وضعتي الكود الخاص بها */}
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

        {children}
      </body>
    </html>
  );
}
