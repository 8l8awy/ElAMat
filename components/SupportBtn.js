"use client";
import { useState } from "react";
import { FaHeadset, FaWhatsapp, FaTelegramPlane, FaTimes, FaEnvelope } from "react-icons/fa";

export default function SupportBtn() {
  const [isOpen, setIsOpen] = useState(false);

  // استبدل الأرقام ببياناتك
  const whatsappNumber = "+201000000000"; 
  const telegramUser = "ElAgamySupport"; 

  return (
    // الحاوية مثبتة في الزاوية، ومهم جداً: items-end لمنع التمدد
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      
      {/* القائمة (تظهر للأعلى) */}
      <div className={`flex flex-col gap-2 transition-all duration-300 pointer-events-auto ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'}`}>
        
        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" className="flex items-center justify-end gap-3 group">
          <span className="bg-white text-black px-2 py-1 rounded shadow text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">واتساب</span>
          <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
            <FaWhatsapp size={20} />
          </div>
        </a>

        <a href={`https://t.me/${telegramUser}`} target="_blank" className="flex items-center justify-end gap-3 group">
          <span className="bg-white text-black px-2 py-1 rounded shadow text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">تلجرام</span>
          <div className="w-10 h-10 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
            <FaTelegramPlane size={20} />
          </div>
        </a>
      </div>

      {/* الزر الرئيسي (دائرة زرقاء) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-blue-600'}`}
        style={{boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)'}}
      >
        {isOpen ? <FaTimes size={24} /> : <FaHeadset size={28} />}
      </button>

    </div>
  );
}
