import "./globals.css";
// import Script from "next/script"; // 👈 قمنا بإلغائه لأنه غير مستخدم
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
  // true  = الموقع مغلق (شاشة الصيانة 404)
  // false = الموقع مفتوح (يعمل بشكل طبيعي)
  const isClosed = true; 

  return (
    <html lang="ar" dir="rtl">
      <body>
        {isClosed ? (
          // ⚪ وضع الصيانة (الشاشة المغلقة)
          <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // ✅ تم التصحيح (حذفنا السطر الخطأ)
            alignItems: 'center',
            backgroundColor: '#fff',
            color: '#000',
            fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto',
          }}>
            <h1 style={{ fontSize: '8rem', fontWeight: '900', margin: 0, letterSpacing: '-5px' }}>404</h1>
            <div style={{ width: '50px', height: '5px', background: 'black', margin: '20px 0' }}></div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'normal' }}>Page Not Found... For Now.</h2>
            <p style={{ color: '#666', marginTop: '10px', textAlign: 'center' }}>
              نحن نقوم بتحديث السيرفرات. سنعود خلال ساعات.
            </p>
          </div>
        ) : (
          // 🟢 الوضع الطبيعي
          <AuthProvider>
            {children}
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
