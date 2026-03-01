// lib/cloudinary.js
const CLOUDINARY_CLOUD_NAME = "dhj0extnk"; // نفس الاسم من كودك القديم
const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // نفس الـ Preset

export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('فشل رفع الملف');
    
    const data = await res.json();
    return {
      name: file.name,
      url: data.secure_url,
      type: file.type,
      size: file.size
    };
  } catch (err) {
    console.error("Cloudinary Error:", err);
    throw err;
  }
}