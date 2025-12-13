import { AuthProvider } from '../context/AuthContext';
import "./globals.css";

export const metadata = {
  title: "El Agamy Materials | منصة العجمي التعليمية",
  description: "منصة تعليمية شاملة لطلاب الاقتصاد، تحتوي على ملخصات، تكاليف، ومحاضرات محدثة باستمرار.",
  icons: {
    icon: '/icon.png', // تأكد أنك أضفت الصورة في الخطوة السابقة
  },
  verification: {
    google: 'pt1w4p5h-Q8RGvS1PjMC-8hpfdwTslNy8m-kF4BnFNs', // 👈 هذا هو كود التفعيل الخاص بك
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
