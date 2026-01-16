import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default async function sitemap() {
  const baseUrl = "https://eamat.vercel.app";

  try {
    // 1. جلب جميع المواد/الملخصات من Firebase
    // افترضنا أن اسم المجموعة (Collection) هو "materials"
    const querySnapshot = await getDocs(collection(db, "materials"));
    
    const materialsUrls = querySnapshot.docs.map((doc) => ({
      url: `${baseUrl}/materials/${doc.id}`, // تأكد من أن هذا هو مسار عرض المادة في موقعك
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // 2. الروابط الأساسية الثابتة
    const staticUrls = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ];

    return [...staticUrls, ...materialsUrls];
  } catch (error) {
    console.error("خطأ في إنشاء السايت ماب:", error);
    // في حال حدث خطأ، نرجع الروابط الأساسية على الأقل لضمان عمل الموقع
    return [
      { url: baseUrl, lastModified: new Date() },
    ];
  }
}
