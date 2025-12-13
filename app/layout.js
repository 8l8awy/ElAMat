import { AuthProvider } from '../context/AuthContext';
import "./globals.css";

export const metadata = {
  title: "El Agamy Materials ",
  description: "منصة تعليمية شاملة لطلاب العجمي، تحتوي على ملخصات، ومحاضرات محدثة باستمرار.",
  keywords: ["اقتصاد", "كلية التجارة", "ملخصات", "العجمي", "El Agamy Materials"],
  icons: {
    icon: '/icon.png', // هذا السطر يربط الأيقونة التي أضفناها منذ قليل
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
