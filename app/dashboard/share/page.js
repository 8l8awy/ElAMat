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
      const uploadedFilesData = [];
      for (let file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "ml_default"); 
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/dhj0extnk/auto/upload`, {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        uploadedFilesData.push({ name: file.name, url: data.secure_url, type: file.type });
      }

      await addDoc(collection(db, "materials"), {
        title,
        studentName,
        subject,
        year: Number(year),
        semester: Number(semester),
        type,
        files: uploadedFilesData,
        status: "pending", 
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
    /* تم إزالة bg-[#020202] وجعل الخلفية شفافة bg-transparent */
    <div className="min-h-screen bg-transparent text-white p-4 md:p-10 font-sans relative z-10" dir="rtl">
      <div className="max-w-3xl mx-auto">
        
        {/* هيدر الصفحة */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 drop-shadow-2xl">شارك ملخصاتك</h1>
          <p className="text-purple-400 font-bold uppercase tracking-[0.3em] text-xs opacity-80">ساهم في مساعدة زمايلك</p>
        </div>

        {/* فورم الرفع - تم جعله بخلفية زجاجية Backdrop Blur */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {isSuccess ? (
            <div className="py-20 text-center animate-pulse">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                 <FaCheckCircle className="text-green-500 text-5xl" />
              </div>
              <h2 className="text-2xl font-black">تم الإرسال بنجاح!</h2>
              <p className="text-gray-400 mt-2 font-bold">سيتم مراجعة الملخص ونشره فوراً</p>
            </div>
          ) : (
            <form onSubmit={handleStudentUpload} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2 flex items-center gap-2"><FaUserEdit className="text-purple-500"/> اسمك (ليظهر على الملخص)</label>
                  <input type="text" value={studentName} onChange={(e)=>setStudentName(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold placeholder:text-gray-700" placeholder="اكتب اسمك الثلاثي" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2 flex items-center gap-2"><FaCloudUploadAlt className="text-purple-500"/> عنوان الملخص</label>
                  <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold placeholder:text-gray-700" placeholder="مثال: شرح محاسبة شركات - الفصل 1" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 mb-2 block mr-2 uppercase tracking-widest">الفرقة</label>
                  <select value={year} onChange={(e)=>setYear(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none font-bold">
                    {[1, 2, 3, 4].map(y => <option key={y} value={y} className="bg-black">فرقة {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 mb-2 block mr-2 uppercase tracking-widest">الترم</label>
                  <select value={semester} onChange={(e)=>setSemester(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none font-bold">
                    <option value={1} className="bg-black font-bold">الأول</option>
                    <option value={2} className="bg-black font-bold">الثاني</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-500 mb-2 block mr-2 uppercase tracking-widest">النوع</label>
                  <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none font-bold">
                    <option value="summary" className="bg-black font-bold text-blue-400">📚 ملخص</option>
                    <option value="assignment" className="bg-black font-bold text-green-400">📝 تكليف</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 mb-2 block mr-2 uppercase tracking-widest">المادة الدراسية</label>
                <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500 font-bold">
                  <option value="" className="bg-black">اختر المادة من القائمة...</option>
                  {currentSubjects.map((s, i) => <option key={i} value={s} className="bg-black">{s}</option>)}
                </select>
              </div>

              {/* منطقة رفع الملف */}
              <div className="relative group">
                <input type="file" onChange={handleFileChange} multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all duration-500 ${files.length > 0 ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-white/[0.01] group-hover:border-purple-500/30 group-hover:bg-purple-500/[0.02]'}`}>
                  {files.length > 0 ? (
                    <div className="text-green-400 font-black flex flex-col items-center gap-2 animate-pulse">
                      <FaCheckCircle size={30}/> تم اختيار {files.length} ملفات جاهزة للرفع
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <FaCloudUploadAlt size={40} className="mx-auto mb-4 opacity-20 group-hover:opacity-100 group-hover:text-purple-500 transition-all"/>
                      <p className="font-black text-sm uppercase tracking-wider">اضغط أو اسحب الملفات هنا</p>
                      <p className="text-[9px] uppercase mt-2 opacity-40 tracking-[0.3em] font-black">Maximum Quality PDF / Images</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={isUploading} className="w-full bg-purple-600 hover:bg-purple-500 py-5 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(147,51,234,0.3)] hover:shadow-[0_15px_40px_rgba(147,51,234,0.5)] transition-all active:scale-95 disabled:opacity-50">
                {isUploading ? <FaSpinner className="animate-spin mx-auto text-2xl" /> : "إرسال للمراجعة والنشر"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
