"use client";
import { useState } from 'react';

export default function MaterialsPage() {
  const [previewFile, setPreviewFile] = useState(null);

  // ملاحظة: هذا الكود تقريبي بناءً على الأخطاء التي ظهرت في Vercel
  // تأكد من مطابقة أسماء المتغيرات مع مشروعك الأصلي

  return (
    <div className="container">
      {/* القسم العلوي من الصفحة (Header/Title) */}
      <div className="header">
        <h1>Materials Dashboard</h1>
      </div>

      {/* قائمة الملفات أو المحتوى الأساسي */}
      <div className="content">
        {/* افترضنا هنا وجود قائمة ملفات، عند الضغط عليها يتم تعيين previewFile */}
        <p>اختر ملفاً لعرضه...</p>
      </div>

      {/* نافذة المعاينة - الجزء الذي كان يحتوي على الخطأ */}
      {previewFile && (
        <div className="preview-modal">
          {/* هنا قمنا بإضافة الـ Fragment <> </> لإصلاح الخطأ */}
          <>
            <div className="preview-header">
              <div className="flex justify-between items-center">
                <h3>معاينة: {previewFile.name}</h3>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="close-button"
                >
                  إغلاق
                </button>
              </div>
            </div>

            <div className="preview-body">
              {previewFile.type === 'pdf' ? (
                <object 
                  data={previewFile.url} 
                  type="application/pdf" 
                  width="100%" 
                  height="100%" 
                  className="pdf-viewer"
                >
                  <iframe 
                    src={previewFile.url} 
                    width="100%" 
                    height="100%" 
                    title="PDF Preview"
                  >
                    هذا المتصفح لا يدعم عرض ملفات PDF.
                  </iframe>
                </object>
              ) : (
                <div className="image-preview">
                  <img src={previewFile.url} alt="Preview" style={{ maxWidth: '100%' }} />
                </div>
              )}
            </div>
          </>
        </div>
      )}
    </div>
  );
}
