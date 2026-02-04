"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FaCloudUploadAlt, FaCheckCircle, FaSpinner, FaUserEdit, FaAlignLeft } from "react-icons/fa";

export default function StudentSharePage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState(""); // 👈 إضافة خانة الوصف
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
      2: ["السلوك التنظيمي", "طرق ومهارات الاتصال", "حقوق الإنسان", "رياضيات الأعمال", "التفكير الابتكاري", "مبادئ علم الاجتماع"]
    },
    year2: { 
      1: ["محاسبة التكاليف", "إدارة التسويق", "إدارة المشتريات", "التنمية المستدامة"], 
      2: ["مبادئ المحاسبة الإدارية", "إدارة الإنتاج والعمليات", "تحليلات الأعمال", "مبادئ الإدارة المالية", "نظم المعلومات الإدارية", "لغة أجنبية (2)"] 
    },
    year3: { 
      1: ["إدارة الجودة", "المالية العامة", "منهج البحث العلمي"], 
      2: [
        "محاسبة إدارية متقدمة", 
        "جداول العمل الإلكترونية", 
        "نظم المعلومات المحاسبية", 
        "الإدارة الاستراتيجية", 
        "اقتصاديات النقود والبنوك", 
        "ريادة الأعمال والمشروعات الصغيرة",
        "إدارة مالية متقدمة (بنوك)", 
        "المحاسبة المتوسطة 2 (بنوك)"
      ] 
    },
    year4: { 
      1: ["إدارة المخاطر", "مراجعة الحسابات", "محاسبة المنشآت المتخصصة"], 
      2: [
        "إدارة المحافظ المالية والمشتقات", 
        "إدارة الموارد البشرية", 
        "الأعمال الإلكترونية", 
        "الإحصاء التطبيقي", 
        "قواعد البيانات", 
        "مشروع التخرج"
      ] 
    }
  };
  const currentSubjects = subjectsBank[`year${year}`][semester] || [];

  useEffect(() => {
    setSubject(currentSubjects[0] || "");
  }, [year, semester]);

  const handleFileChange = (e) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleStudentUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title || !subject || !studentName) return alert("برجاء إكمال البيانات الأساسية ⚠️");
    
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
        desc, // 👈 حفظ الوصف في الداتا بيز
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
      setTitle(""); setStudentName(""); setDesc(""); setFiles([]);
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      alert("حدث خطأ أثناء الرفع، حاول مرة أخرى");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    // التعديل: p-0 في الموبايل لإزالة الحواف
    <div className="min-h-screen bg-transparent text-white p-0 md:p-10 font-sans relative z-10" dir="rtl">
      <div className="max-w-3xl mx-auto pt-6 px-4 md:px-0">
        
        <div className="text-center mb-10 px-4">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 drop-shadow-2xl uppercase">شارك ملخصاتك</h1>
          <p className="text-purple-400 font-black uppercase tracking-[0.3em] text-[10px] opacity-80">ساهم في مساعدة زمايلك</p>
        </div>

        {/* تعديل الحواف هنا لتكون Edge-to-Edge في الموبايل */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border-y md:border border-white/5 rounded-none md:rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
          {isSuccess ? (
            <div className="py-20 text-center animate-bounce">
              <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
              <h2 className="text-2xl font-black">وصل يا بطل! ✅</h2>
              <p className="text-gray-400 mt-2 font-bold italic">الملخص تحت المراجعة وهينزل فوراً</p>
            </div>
          ) : (
            <form onSubmit={handleStudentUpload} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2 flex items-center gap-2 italic"><FaUserEdit className="text-purple-500"/> اسم الطالب</label>
                  <input type="text" value={studentName} onChange={(e)=>setStudentName(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold" placeholder="اسمك الثلاثي" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2 flex items-center gap-2 italic"><FaCloudUploadAlt className="text-purple-500"/> العنوان</label>
                  <input type="text" value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold" placeholder="مثال: مراجعة نهائية اقتصاد" />
                </div>
              </div>

              {/* 👈 إضافة خانة الوصف الجديدة */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2 flex items-center gap-2 italic"><FaAlignLeft className="text-purple-500"/> وصف إضافي (اختياري)</label>
                <textarea value={desc} onChange={(e)=>setDesc(e.target.value)} rows="2" className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500 transition-all font-bold resize-none" placeholder="اكتب ملاحظة لزمايلك عن الملخص..."></textarea>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-500 mb-2 block mr-2 uppercase tracking-widest">الفرقة</label>
                  <select value={year} onChange={(e)=>setYear(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-sm font-bold">
                    {[1, 2, 3, 4].map(y => <option key={y} value={y} className="bg-black">فرقة {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 mb-2 block mr-2 uppercase tracking-widest">الترم</label>
                  <select value={semester} onChange={(e)=>setSemester(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-sm font-bold text-blue-400">
                    <option value={1} className="bg-black font-bold">الأول</option>
                    <option value={2} className="bg-black font-bold">الثاني</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-gray-500 mb-2 block mr-2 uppercase tracking-widest">نوع الملف</label>
                  <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-sm font-bold">
                    <option value="summary" className="bg-black text-purple-400">📚 ملخص</option>
                    <option value="assignment" className="bg-black text-green-400">📝 تكليف</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 mb-2 block mr-2 uppercase tracking-widest italic">اختر المادة الدراسية</label>
                <select value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl outline-none focus:border-purple-500 font-bold appearance-none">
                  <option value="" className="bg-black opacity-50">قائمة المواد المتاحة...</option>
                  {currentSubjects.map((s, i) => <option key={i} value={s} className="bg-black">{s}</option>)}
                </select>
              </div>

              <div className="relative group">
                <input type="file" onChange={handleFileChange} multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className={`border-2 border-dashed rounded-[2rem] p-10 text-center transition-all duration-500 ${files.length > 0 ? 'border-green-500/50 bg-green-500/10' : 'border-white/10 bg-white/[0.01]'}`}>
                  {files.length > 0 ? (
                    <div className="text-green-400 font-black flex flex-col items-center gap-2">
                      <FaCheckCircle size={30}/> جاهز لرفع {files.length} ملفات
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <FaCloudUploadAlt size={40} className="mx-auto mb-4 opacity-20"/>
                      <p className="font-black text-[10px] uppercase tracking-widest">اضغط أو اسحب الصور هنا</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={isUploading} className="w-full bg-purple-600 hover:bg-purple-500 py-5 rounded-[1.5rem] font-black text-md shadow-xl transition-all active:scale-95 disabled:opacity-50 uppercase italic tracking-widest">
                {isUploading ? <FaSpinner className="animate-spin mx-auto text-2xl" /> : "إرسال للمراجعة"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
