#  El Agamy Materials - Educational Platform

مشروع **El Agamy Materials** هو منصة تعليمية متكاملة تهدف لتنظيم وتسهيل الوصول للملخصات، التكليفات، والجداول الدراسية لطلاب الدفعة. المنصة مبنية بأحدث تقنيات الويب لضمان السرعة والأمان.

## 🚀 التقنيات المستخدمة (Tech Stack)
* **Framework**: [Next.js](https://nextjs.org/) (App Router/Pages Router).
* **Backend & DB**: [Firebase](https://firebase.google.com/) (Firestore & Auth).
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) & React Icons.
* **Deployment**: [Vercel](https://vercel.com/).

## 🔐 المميزات الأمنية (Security Features)
تم بناء النظام مع التركيز على حماية البيانات ومنع الوصول غير المصرح به:
* **Server-Side Verification**: يتم التحقق من صلاحيات الإدارة عبر **API Routes** في السيرفر لضمان عدم تسريب الأكواد السرية في المتصفح.
* **Secure Environment Variables**: تخزين مفاتيح الربط وأكواد الإدارة في متغيرات بيئة مشفرة (Environment Variables) بعيداً عن الكود المصدري.
* **Firestore Security Rules**: قواعد بيانات صارمة تمنع أي شخص غير مخول من تعديل أو حذف البيانات.

## 🛠️ كيف تشغل المشروع محلياً؟

1. **تحميل المشروع:**
   ```bash
   git clone [https://github.com/YourUserName/el-agamy-materials.git](https://github.com/YourUserName/el-agamy-materials.git)