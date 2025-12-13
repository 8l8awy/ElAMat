"use client";
import { useState, useEffect } from "react";
// لاحظ أننا أزلنا استدعاء فايربيز إذا لم نكن نحتاجه هنا لتجنب الأخطاء
// أو نستخدم المسار الصحيح لو احتجناه:
// import { db } from "../../lib/firebase"; 

export default function DashboardPage() {
  return (
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{textAlign: 'center'}}>
        <h1>لوحة المعلومات</h1>
        <p>اختر صفحة من القائمة للتصفح</p>
      </div>
    </div>
  );
}
