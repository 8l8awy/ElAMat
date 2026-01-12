"use client"; 
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext"; 

export default function RootLayout({ children }) {
  // متغير للتحكم في إغلاق الموقع أو فتحه للصيانة
  const isClosed = false; 

  return (
    <html lang="ar">
      <body style={{ margin: 0, padding: 0 }}>
        <div dir="rtl">
          <AuthProvider>
            {isClosed ? (
              /* شاشة الصيانة - تظهر فقط إذا كان isClosed = true */
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
                <div style={{ marginTop: '40px' }}>
                   <p>0% complete __________ 100%</p>
                </div>
              </div>
            ) : (
              /* محتوى الموقع الطبيعي */
              children
            )}
          </AuthProvider>
        </div>

        {/* كود Google AdSense - سيعمل تلقائياً بمجرد قبول الموقع */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8855103518508999"
          crossOrigin="anonymous">
        </script>
      </body>
    </html>
  );
}
