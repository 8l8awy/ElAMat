import { AuthProvider } from '../context/AuthContext';
import "./globals.css";

export const metadata = {
  title: "El Agamy Materials",
  description: "منصة المواد الدراسية",
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