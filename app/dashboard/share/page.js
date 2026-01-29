"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaGraduationCap, FaExchangeAlt, FaUserEdit } from "react-icons/fa";

export default function StudentSharePage() {
  const [title, setTitle] = useState("");
  const [studentName, setStudentName] = useState("");
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(2);
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // قوائم المواد الموحدة (لازم تطابق الـ Admin وصفحة المواد)
  const subjectsBank = {
    year1: {
      1: ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"],
      2: ["محاسبة الشركات", "القانون التجاري", "اقتصاد كلي", "لغة إنجليزية تخصصية", "إدارة التنظيم"]
    },
    year2: { 1: ["مادة تجريبية"], 2: [] },
    year3: { 1: [], 2: [] },
    year4: { 1: [], 2: [] }
  };

  const currentSubjects = subjectsBank[`year${year}`][semester] || [];

  const handleFileChange = (e) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleStudentUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title || !subject || !studentName) return alert("برجاء إكمال جميع البيانات ⚠️");
    
    setIsUploading(true);

    try {
      // 1. رفع الملف لـ Cloudinary (نفس طريقتك في الـ Admin)
      const uploadedFilesData = [];
      for (let file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "ml_default"); // تأكد من الـ Preset بتاعك
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/dhj0extnk/auto/upload`, {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        uploadedFilesData.push({ name: file.name, url: data.secure_url, type: file.type });
      }

      // 2. إرسال البيانات لـ Firebase بحالة "pending" للمراجعة
      await addDoc(collection(db, "materials"), {
        title,
        studentName,
        subject,
        year: Number(year),
        semester: Number(semester),
        type,
        files: uploadedFilesData,
        status: "pending", // 👈 "pending" عشان تراجعها الأول في صفحة الـ Admin
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      setTitle(""); setStudentName(""); setFiles([]);
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الرفع، حاول مرة أخرى");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white p-4 md:p-10 font-sans" dir="rtl">
      <div className="max-w-3xl mx-auto">
        
        {/* هيدر الصفحة */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4">شارك ملخصاتك </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">ساهم في مساعدة زمايلك</p>
        </div>

        {/* فورم الرفع */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {isSuccess ? (
            <div className="py-20 text-center animate-bounce">
              <FaCheckCircle className="text-green-500 text-7xl mx-auto mb-6" />
              <h2 className="text-2xl font-black">تم الإرسال بنجاح!</h2>
              <p className="text-gray-400 mt-2">سيتم مراجعة الملخص ونشره فوراً</p>
            </div>
          ) : (
            <form onSubmit={handleStudentUpload} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 mr-2 flex items-center gap-2"><FaUserEdit/> اسمك (ليظهر على الملخص)</label>
                  <input type="text" value={studentName} onChange={(e)=>setStudentName(e.target.value)} className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all" placeholder="اكتب اسمك الثلاثي" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 mr-2 flex items-center gap-2"><FaCloudUploadAlt/> عنوان الملخص</label>
                  <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all" placeholder="مثال: شرح محاسبة شركات - الفصل 1" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block mr-2">الفرقة</label>
                  <select value={year} onChange={(e)=>setYear(e.target.value)} className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none">
                    {[1, 2, 3, 4].map(y => <option key={y} value={y} className="bg-black">فرقة {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block mr-2">الترم</label>
                  <select value={semester} onChange={(e)=>setSemester(e.target.value)} className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none">
                    <option value={1} className="bg-black">الأول</option>
                    <option value={2} className="bg-black">الثاني</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs text-gray-500 mb-2 block mr-2">النوع</label>
                  <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none">
                    <option value="summary" className="bg-black">ملخص</option>
                    <option value="assignment" className="bg-black">تكليف</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500 mb-2 block mr-2">المادة الدراسية</label>
                <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500">
                  <option value="" className="bg-black">اختر المادة...</option>
                  {currentSubjects.map((s, i) => <option key={i} value={s} className="bg-black">{s}</option>)}
                </select>
              </div>

              {/* منطقة رفع الملف */}
              <div className="relative group">
                <input type="file" onChange={handleFileChange} multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all ${files.length > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 group-hover:border-purple-500/30'}`}>
                  {files.length > 0 ? (
                    <div className="text-green-400 font-bold flex flex-col items-center gap-2">
                      <FaCheckCircle size={30}/> تم اختيار {files.length} ملفات
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <FaCloudUploadAlt size={40} className="mx-auto mb-4 opacity-20"/>
                      <p className="font-bold">اضغط أو اسحب الملفات هنا (PDF/صور)</p>
                      <p className="text-[10px] uppercase mt-2 opacity-50 tracking-[0.2em]">Max size 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={isUploading} className="w-full bg-purple-600 hover:bg-purple-500 py-5 rounded-2xl font-black text-xl shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all active:scale-95 disabled:opacity-50">
                {isUploading ? <FaSpinner className="animate-spin mx-auto text-2xl" /> : "إرسال للمراجعة والنشر"}
              </button>
            </form>
          )}

          {/* وهج خلفي زيني */}
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-600/10 rounded-full blur-[80px] -z-10"></div>
        </div>
      </div>
    </div>
  );
}
