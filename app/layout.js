"use client"; 
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext"; 
import { useEffect } from "react";
// استيراد أدوات Firebase
import { messaging, db } from "@/lib/firebase"; 
import { getToken } from "firebase/messaging";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export const metadata = {
  title: "El Agamy Materials | منصة العجمي التعليمية",
  description: "أفضل منصة لتحميل الملخصات، المراجعات النهائية لطلاب جامعة العجمي.",
  verification: {
    google: "S5pMWU_XezcEhJnIRbN_jJI7KqHnvF050Ed5268sCa8",
  },
  icons: {
    icon: "/icon.png", // استخدام شعارك الجديد
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

  // تفعيل نظام التنبيهات وتخزين الـ Token
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const currentToken = await getToken(messaging, {
            vapidKey: "42UVXpsFe-FugZJKD7o-iFU3Ejxw0mZpg_NBCYwuzzM" // مفتاحك الفعلي
          });

          if (currentToken) {
            const q = query(collection(db, "fcmTokens"), where("token", "==", currentToken));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
              await addDoc(collection(db, "fcmTokens"), {
                token: currentToken,
                createdAt: new Date(),
                device: navigator.userAgent
              });
              console.log("تم تفعيل التنبيهات بنجاح لمنصة العجمي!");
            }
          }
        }
      } catch (error) {
        console.error("خطأ في التنبيهات:", error);
      }
    };

    if (!isClosed) setupNotifications();
  }, [isClosed]);

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

        <div dir="rtl">
          <AuthProvider>
            {isClosed ? (
              // شاشة الصيانة
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

        {/* كود AdSense الربحي */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8855103518508999"
          crossOrigin="anonymous">
        </script>
      </body>
    </html>
  );
}
