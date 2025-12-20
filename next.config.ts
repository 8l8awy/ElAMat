import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'el-a-mat.vercel.app', // ✅ ضع الدومين فقط هكذا
          },
        ],
        destination: 'https://eamat.vercel.app/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
