export default function sitemap() {
  const baseUrl = 'https://el-a-mat.vercel.app'; // رابط موقعك الحقيقي

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // يمكنك إضافة المزيد من الصفحات هنا
  ]
}
