"use client"; // ضروري لأننا نستخدم التفاعل والتنبيهات
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext"; 
import { useEffect } from "react";
// استيراد أدوات Firebase (تأكد من إعداد ملف firebase.js في مجلد lib)
import { messaging, db } from "@/lib/firebase"; 
import { getToken } from "firebase/messaging";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

// 1. إعدادات الـ SEO (Metadata)
// ملاحظة: في Next.js 13+، الـ Metadata يجب أن تكون في ملف "layout.js" سيرفر أو ملف منفصل.
// إذا واجهت خطأ بسبب "use client"، انقل الـ metadata لملف اسمه page.js أو استمر هكذا إذا كان المشروع يقبلها.
export const metadata = {
  title: "El Agamy Materials | منصة العجمي التعليمية",
  description: "أفضل منصة لتحميل الملخصات، المراجعات النهائية لطلاب جامعة العجمي.",
  verification: {
    google: "S5pMWU_XezcEhJnIRbN_jJI7KqHnvF050Ed5268sCa8",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "El Agamy Materials | منصة العجمي التعليمية",
    description: "كل ما يحتاجه طالب العجمي في مكان واحد.",
    siteName: "El Agamy Materials",
    url: 'https://eamat.vercel.app',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  const isClosed = false; 
  const GA_MEASUREMENT_ID = ''; 

  // --- كود التنبيهات الجديد (لا يؤثر على التصميم) ---
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // طلب الإذن من المتصفح
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          // الحصول على الـ Token
          const currentToken = await getToken(messaging, {
            vapidKey: "ضع_هنا_مفتاح_VAPID_الخاص_بمشروعك" // استخرجه من إعدادات Firebase
          });

          if (currentToken) {
            // التأكد من عدم تكرار التخزين
            const q = query(collection(db, "fcmTokens"), where("token", "==", currentToken));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
              await addDoc(collection(db, "fcmTokens"), {
                token: currentToken,
                createdAt: new Date(),
                device: navigator.userAgent
              });
              console.log("تم تفعيل التنبيهات وحفظ الجهاز!");
            }
          }
        }
      } catch (error) {
        console.error("خطأ في التنبيهات:", error);
      }
    };

    if (!isClosed) setupNotifications(); // لا نطلب إذن إذا كان الموقع مغلقاً
  }, [isClosed]);
  // ----------------------------------------------

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'El Agamy Materials',
    url: 'https://eamat.vercel.app',
    logo: 'https://eamat.vercel.app/icon.png',
  };

  return (
    <html lang="ar">
      <body style={{ margin: 0, padding: 0 }}>
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

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
              <div style={{
                height: '100vh', width: '100vw', position: 'fixed',
                top: 0, left: 0, zIndex: 9999, display: 'flex',
                flexDirection: 'column', justifyContent: 'center',
                alignItems: 'flex-start', backgroundColor: '#0078d7',
                color: 'white', padding: '50px', boxSizing: 'border-box',
                fontFamily: '"Segoe UI", Tahoma, sans-serif', direction: 'ltr'
              }}>
                <h1 style={{ fontSize: '6rem', margin: 0 }}>:(</h1>
                <h2>Your PC ran into a problem... just kidding!</h2>
                <p>We are just updating "El Agamy Materials" database.</p>
                <div style={{ marginTop: '40px' }}><p>0% complete __________ 100%</p></div>
              </div>
            ) : (
              children
            )}
          </AuthProvider>
        </div>

        {/* كود AdSense الخاص بك - يبقى في مكانه الأخير لضمان الأداء */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8855103518508999"
          crossOrigin="anonymous">
        </script>
      </body>
    </html>
  );
}
