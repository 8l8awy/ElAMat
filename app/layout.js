"use client"; 
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext"; 
import { useEffect } from "react";
// تأكد من تصدير messaging و db من ملف firebase.js
import { messaging, db } from "@/lib/firebase"; 
import { getToken } from "firebase/messaging";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export default function RootLayout({ children }) {
  const isClosed = false; 

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted" && messaging) { // أضفنا فحص وجود messaging
          const currentToken = await getToken(messaging, {
            vapidKey: "42UVXpsFe-FugZJKD7o-iFU3Ejxw0mZpg_NBCYwuzzM" 
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
            }
          }
        }
      } catch (error) {
        console.error("خطأ في التنبيهات:", error);
      }
    };

    if (!isClosed) setupNotifications();
  }, [isClosed]);

  return (
    <html lang="ar">
      <body style={{ margin: 0, padding: 0 }}>
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
              </div>
            ) : (
              children
            )}
          </AuthProvider>
        </div>
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8855103518508999"
          crossOrigin="anonymous">
        </script>
      </body>
    </html>
  );
}
