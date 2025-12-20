import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*', // هذا يعني "أي صفحة يدخل عليها الزائر"
        has: [
          {
            type: 'host',
            value: 'https://el-a-mat.vercel.app/', // 🔴 ضع هنا اسم الدومين القديم (الذي حذفته وتريد التحويل منه)
          },
        ],
        destination: 'https://eamat.vercel.app/:path*', // 🟢 ضع هنا رابط الدومين الجديد الذي تريد الزوار أن يذهبوا إليه
        permanent: true, // 301 (تحويل دائم) لنقل قوة الأرشفة في جوجل
      },
    ];
  },
};

export default nextConfig;
