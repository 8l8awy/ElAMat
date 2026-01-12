"use client"; 
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext"; 
import { useEffect } from "react";
// استيراد أدوات Firebase - تأكد من تصديرها من ملف lib/firebase.js
import { messaging, db } from "@/lib/firebase"; 
import { getToken } from "firebase/messaging";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

// 1. دالة تحويل مفتاح VAPID لإصلاح خطأ InvalidAccessError
function urlBase64ToUint8Array(base64String) {
  // تنظيف المفتاح من أي مسافات أو علامات تنصيص
  const cleanString = base64String.replace(/["']/g, "").trim();
  
  // تبديل الحروف غير المتوافقة مع atob (خاص بـ URL Safe Base64)
  const base64 = cleanString.replace(/-/g, "+").replace(/_/g, "/");
  
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const rawData = window.atob(base64 + padding);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
export default function RootLayout({ children }) {
  const isClosed = false; 

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // طلب إذن التنبيهات من الطالب
        const permission = await Notification.requestPermission();
        
        if (permission === "granted" && messaging) {
          // استخدام الدالة المحولة لإصلاح الخطأ البرمجي
          const currentToken = await getToken(messaging, {
            vapidKey: urlBase64ToUint8Array("42UVXpsFe-FugZJKD7o-iFU3Ejxw0mZpg_NBCYwuzzM") 
          });

          if (currentToken) {
            // التأكد من عدم تكرار تخزين الجهاز
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
                <p>We are just updating "El Agamy Materials" database.</p>
              </div>
            ) : (
              children
            )}
          </AuthProvider>
        </div>

        {/* كود AdSense الربحي - سيبدأ بالعمل فور قبول الموقع */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8855103518508999"
          crossOrigin="anonymous">
        </script>
      </body>
    </html>
  );
}
