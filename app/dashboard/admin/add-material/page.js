"use client";
import { useState } from "react";
// استخدام 4 مستويات للخروج للمجلد الرئيسي
import { db } from "../../../../lib/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { FaPlus, FaBook, FaUserTie, FaGraduationCap, FaArrowRight } from "react-icons/fa";

export default function AddMaterialPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    doctor: "",
    semester: 2, 
    type: "summary",
    link: "", 
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center bg-[#0a0a0a] p-10 rounded-[2.5rem] border border-red-500/20 shadow-2xl">
          <h2 className="text-red-500 text-2xl font-black mb-4">وصول غير مسموح!</h2>
          <p className="text-gray-400 mb-6 font-bold">عذراً يا بطل، هذه الصفحة للمشرفين فقط.</p>
          <button onClick={() => router.push('/dashboard')} className="bg-white text-black px-6 py-2 rounded-xl font-bold">العودة للرئيسية</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await addDoc(collection(db, "materials"), {
        ...formData,
        semester: Number(formData.semester),
        status: "approved",
        createdAt: serverTimestamp(),
      });
      
      setMessage("✅ تم إضافة المادة بنجاح للترم " + formData.semester);
      setFormData({ ...formData, name: "", doctor: "", link: "" });
    } catch (error) {
      console.error(error);
      setMessage("❌ فشل في إضافة المادة، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-black text-white" dir="rtl">
      <div className="max-w-3xl mx-auto pt-10 relative z-10">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-all font-bold text-sm">
          <FaArrowRight /> العودة للوحة الإدارة
        </button>

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-black">
            إضافة <span className="text-purple-500">مادة جديدة</span>
          </h1>
          <div className="bg-purple-600/10 text-purple-400 px-4 py-2 rounded-2xl border border-purple-500/20 text-xs font-black uppercase tracking-widest">
            الترم الثاني 2026
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/5 p-8 md:p-12 rounded-[3rem] shadow-2xl space-y-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-500 text-[10px] font-black mr-2 uppercase tracking-[0.2em]">اسم المادة</label>
              <div className="relative">
                <FaBook className="absolute right-4 top-4 text-gray-600" />
                <input
                  required
                  type="text"
                  placeholder="مثال: اقتصاد كلي"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black border border-white/5 rounded-2xl py-4 pr-12 pl-4 focus:border-purple-600 outline-none transition-all placeholder:text-gray-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-gray-500 text-[10px] font-black mr-2 uppercase tracking-[0.2em]">الدكتور</label>
              <div className="relative">
                {/* تم تصحيح اسم الأيقونة هنا 👇 */}
                <FaUserTie className="absolute right-4 top-4 text-gray-600" />
                <input
                  type="text"
                  placeholder="د. محمد علي"
                  value={formData.doctor}
                  onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                  className="w-full bg-black border border-white/5 rounded-2xl py-4 pr-12 pl-4 focus:border-purple-600 outline-none transition-all placeholder:text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-500 text-[10px] font-black mr-2 uppercase tracking-[0.2em]">رابط ملف الـ PDF</label>
            <input
              required
              type="url"
              placeholder="ضع رابط الدرايف هنا"
              value={formData.link}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
              className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 focus:border-purple-600 outline-none transition-all placeholder:text-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-500 text-[10px] font-black mr-2 uppercase tracking-[0.2em]">الترم</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 focus:border-purple-600 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value={2}>الترم الثاني</option>
                <option value={1}>الترم الأول</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-500 text-[10px] font-black mr-2 uppercase tracking-[0.2em]">التصنيف</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 focus:border-purple-600 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="summary">ملخص</option>
                <option value="assignment">تكليف</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-[1.5rem] bg-purple-600 hover:bg-purple-500 shadow-xl shadow-purple-600/20 font-black text-lg transition-all flex items-center justify-center gap-3 disabled:bg-gray-800 disabled:text-gray-500 disabled:scale-100 active:scale-95"
          >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
                <>
                  <FaPlus className="text-sm" />
                  <span>إضافة المادة للمنصة</span>
                </>
            )}
          </button>

          {message && (
            <div className={`text-center p-4 rounded-2xl font-black text-sm transition-all ${message.includes('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
