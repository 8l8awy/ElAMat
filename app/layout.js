import { AuthProvider } from '../context/AuthContext';
import "./globals.css";

export const metadata = {
  title: "El Agamy Materials | منصة العجمي التعليمية",
  description: "منصة تعليمية شاملة لطلاب الاقتصاد، تحتوي على ملخصات، تكاليف، ومحاضرات محدثة باستمرار.",
  icons: {
    icon: '/icon.png',
  },
  verification: {
    google: 'S5pMWU_XezcEhJnIRbN_jJI7KqHnvF050Ed5268sCa8', // 👈 الكود الجديد هنا
  },
  openGraph: {
    title: 'El Agamy Materials',
    description: 'كل ما يحتاجه طالب الاقتصاد في مكان واحد.',
    siteName: 'El Agamy Materials',
    locale: 'ar_AR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
