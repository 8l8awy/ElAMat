"use client";
import { useState } from "react";
import { FaHeadset, FaWhatsapp, FaTelegramPlane, FaTimes, FaEnvelope } from "react-icons/fa";

export default function SupportBtn() {
  const [isOpen, setIsOpen] = useState(false);

  // 👇 قم بتعديل بياناتك هنا
  const whatsappNumber = "+201000000000"; // رقمك مع كود الدولة
  const telegramUser = "ElAgamyAdmin"; // اسم المستخدم في تلجرام
  const email = "support@elagamy.com"; 

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      
      {/* القائمة المنبثقة (تظهر عند الفتح) */}
      <div className={`flex flex-col gap-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        
        {/* زر واتساب */}
        <a 
          href={`https://wa.me/${whatsappNumber}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#25D366] text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <span className="font-bold text-sm">واتساب</span>
          <FaWhatsapp size={20} />
        </a>

        {/* زر تلجرام (اختياري) */}
        <a 
          href={`https://t.me/${telegramUser}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-[#0088cc] text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <span className="font-bold text-sm">تلجرام</span>
          <FaTelegramPlane size={20} />
        </a>

         {/* زر الايميل (اختياري) */}
         <a 
          href={`mailto:${email}`} 
          className="flex items-center gap-3 bg-gray-700 text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          <span className="font-bold text-sm">إيميل</span>
          <FaEnvelope size={20} />
        </a>

      </div>

      {/* الزر الرئيسي العائم */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-blue-600'}`}
      >
        {isOpen ? <FaTimes size={24} /> : <FaHeadset size={28} />}
      </button>

    </div>
  );
}