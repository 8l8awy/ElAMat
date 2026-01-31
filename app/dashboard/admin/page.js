"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase"; 
import { collection, deleteDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot, addDoc, updateDoc } from "firebase/firestore";
import { 
  FaSpinner, FaTrash, FaFilePdf, FaFileImage, 
  FaCloudUploadAlt, FaLayerGroup, FaCheck, FaTimes, FaShieldAlt, FaInfoCircle 
} from "react-icons/fa";

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFake404, setShowFake404] = useState(true);
  const [adminRole, setAdminRole] = useState("moderator");

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState(""); 
  const [year, setYear] = useState(1);
  const [semester, setSemester] = useState(2);
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
   
  const [materialsList, setMaterialsList] = useState([]); 
  const [pendingList, setPendingList] = useState([]); 
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const subjectsBank = {
    year1: {
      1: ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"],
      2: ["محاسبة الشركات", "القانون التجاري", "اقتصاد كلي", "لغة إنجليزية تخصصية", "إدارة التنظيم"]
    },
    year2: { 1: ["مادة تجريبية سنة تانية"], 2: [] },
    year3: { 1: [], 2: [] },
    year4: { 1: [], 2: [] }
  };

  const currentSubjects = subjectsBank[`year${year}`][semester] || [];

  useEffect(() => {
    setSubject(currentSubjects[0] || "");
  }, [year, semester]);

  const verifyCode = async (codeToVerify, isAutoCheck = false) => {
    try {
      const q = query(collection(db, "allowedCodes"), where("code", "==", codeToVerify.trim()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty && querySnapshot.docs[0].data().admin === true) {
        const userData = querySnapshot.docs[0].data();
        setIsAuthenticated(true);
        setShowFake404(false);
        localStorage.setItem("adminCode", codeToVerify);
        localStorage.setItem("adminRole", userData.role || "admin"); 
        setAdminRole(userData.role || "admin");
      } else { handleLoginFail(); }
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  useEffect(() => {
    const checkAccess = async () => {
      const savedCode = localStorage.getItem("adminCode");
      const isSecretMode = searchParams.get("mode") === "login";
      if (savedCode) { await verifyCode(savedCode, true); }
      else if (isSecretMode) { setIsLoading(false); setShowFake404(false); }
      else { setIsLoading(false); setShowFake404(true); }
    };
    checkAccess();
  }, []);

  const handleLoginFail = () => {
    localStorage.removeItem("adminCode");
    localStorage.removeItem("adminRole");
    setIsAuthenticated(false);
    setShowFake404(true);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaterialsList(allData.filter(item => item.status === "approved"));
      setPendingList(allData.filter(item => item.status === "pending").map(item => ({...item, selectedType: item.type || "summary"})));
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleAction = async (id, newStatus, finalType) => {
    try {
      if (newStatus === "approved") {
        await updateDoc(doc(db, "materials", id), { 
            status: "approved",
            type: finalType // تحديث النوع المختار (ملخص أو تكليف)
        });
        setMessage("تمت الموافقة والنشر بنجاح ✅");
      } else {
        await deleteDoc(doc(db, "materials", id));
        setMessage("تم رفض وحذف الطلب ❌");
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert("خطأ في العملية"); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title) return alert("البيانات ناقصة");
    setUploading(true);
    try {
      const uploadedFilesData = [];
      for (let file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
        const data = await res.json();
        uploadedFilesData.push({ name: file.name, url: data.secure_url, type: file.type });
      }
      await addDoc(collection(db, "materials"), {
        title, desc, subject, type, year: Number(year), semester: Number(semester),
        files: uploadedFilesData, status: "approved", uploader: "Admin", createdAt: serverTimestamp(),
      });
      setUploading(false); setTitle(""); setDesc(""); setFiles([]); setMessage("تم النشر بنجاح ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { alert(error.message); setUploading(false); }
  };

  const handleDelete = async (id, title) => {
    if (adminRole !== "admin") return alert("للمدير فقط ⛔");
    if (confirm(`حذف "${title}" نهائياً؟`)) await deleteDoc(doc(db, "materials", id));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><FaSpinner className="animate-spin text-4xl text-purple-600" /></div>;
  if (showFake404) return <div className="min-h-screen flex items-center justify-center bg-white text-black font-sans"><h1 className="text-4xl font-bold border-r pr-4 mr-4">404</h1><div>This page could not be found.</div></div>;

  return (
    <div className="min-h-screen w-full text-white p-4 font-sans relative" dir="rtl">
      <div className="fixed inset-0 -z-10 bg-[#050505]"><div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px]"></div></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto pt-6">
        <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">Admin Central 🚀</h1>
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${adminRole === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
               <FaShieldAlt className="inline ml-1"/> {adminRole === 'admin' ? "مدير نظام" : "مُراجع"}
            </span>
          </div>
        </div>

        {message && <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 bg-green-500/20 text-green-400 px-8 py-4 rounded-2xl font-bold border border-green-500/20 backdrop-blur-md">{message}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          
          {/* عمود الرفع السريع */}
          <div className="lg:col-span-1">
            <div className="bg-[#111] backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 sticky top-4 shadow-2xl">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-purple-400 font-sans italic tracking-tighter"><FaCloudUploadAlt/> نشر سريع</h2>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="grid grid-cols-2 gap-2">
                  <select value={year} onChange={(e)=>setYear(e.target.value)} className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs font-bold outline-none">
                    {[1,2,3,4].map(y => <option key={y} value={y} className="bg-black">فرقة {y}</option>)}
                  </select>
                  <select value={semester} onChange={(e)=>setSemester(e.target.value)} className="bg-black/40 border border-white/5 p-3 rounded-xl text-xs font-bold outline-none font-sans italic text-blue-400">
                    <option value={1} className="bg-black">الترم الأول</option>
                    <option value={2} className="bg-black">الترم الثاني</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                    <button type="button" onClick={() => setType("summary")} className={`py-2 rounded-lg font-black text-[10px] transition-all ${type === "summary" ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>ملخص</button>
                    <button type="button" onClick={() => setType("assignment")} className={`py-2 rounded-lg font-black text-[10px] transition-all ${type === "assignment" ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>تكليف</button>
                  </div>
                </div>

                <input type="text" className="w-full bg-black/40 rounded-2xl p-4 outline-none border border-white/5 text-sm font-bold" value={title} onChange={(e)=>setTitle(e.target.value)} required placeholder="عنوان المنشور" />
                
                <textarea className="w-full bg-black/40 rounded-2xl p-4 outline-none border border-white/5 text-sm font-bold resize-none" rows="2" value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="وصف مختصر (اختياري)"></textarea>

                <select className="w-full bg-black/40 rounded-2xl p-4 outline-none appearance-none border border-white/5 text-sm font-bold" value={subject} onChange={(e)=>setSubject(e.target.value)}>
                    {currentSubjects.map((s, i) => <option key={i} className="bg-gray-900" value={s}>{s}</option>)}
                </select>

                <div className="relative group">
                  <input type="file" onChange={(e) => setFiles(Array.from(e.target.files))} multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className={`border-2 border-dashed rounded-[2rem] p-6 text-center transition-all ${files.length > 0 ? 'border-green-500/50 bg-green-500/5' : 'border-white/10'}`}>
                    {files.length > 0 ? <p className="text-green-400 font-black text-xs">جاهز لرفع {files.length} ملفات</p> : <FaCloudUploadAlt size={24} className="mx-auto opacity-20"/>}
                  </div>
                </div>

                <button type="submit" disabled={uploading} className="w-full bg-purple-600 hover:bg-purple-500 py-5 rounded-[1.5rem] font-black shadow-xl transition-all text-xs uppercase italic tracking-widest">
                  {uploading ? "جاري الرفع..." : "نشر الآن"}
                </button>
              </form>
            </div>
          </div>

          {/* عمود المراجعة والأرشيف */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* قسم مراجعة الطلبات */}
            {pendingList.length > 0 && (
              <div className="bg-yellow-500/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-yellow-500/20 shadow-xl">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-yellow-500 italic uppercase"><FaSpinner className="animate-spin"/> مراجعة طلبات الطلاب ({pendingList.length})</h2>
                <div className="space-y-6">
                  {pendingList.map((item) => (
                    <div key={item.id} className="bg-black/60 rounded-[2.5rem] p-7 border border-white/5">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <h4 className="font-black text-white text-md mb-1">{item.title}</h4>
                          {item.desc && <p className="text-[11px] text-gray-400 mb-2 italic">{item.desc}</p>}
                          <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">بواسطة: {item.studentName} | {item.subject}</p>
                        </div>
                        
                        {/* خيارات النوع قبل الموافقة */}
                        <div className="flex flex-col gap-2">
                           <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 gap-1">
                              <button onClick={() => {
                                  const newList = pendingList.map(p => p.id === item.id ? {...p, selectedType: "summary"} : p);
                                  setPendingList(newList);
                              }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${item.selectedType === 'summary' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>ملخص</button>
                              <button onClick={() => {
                                  const newList = pendingList.map(p => p.id === item.id ? {...p, selectedType: "assignment"} : p);
                                  setPendingList(newList);
                              }} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${item.selectedType === 'assignment' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>تكليف</button>
                           </div>
                           <div className="flex gap-2 justify-end mt-1">
                              <button onClick={() => handleAction(item.id, "approved", item.selectedType)} className="bg-green-600 text-white p-3 rounded-xl hover:scale-110 transition-all shadow-lg shadow-green-600/20"><FaCheck/></button>
                              <button onClick={() => handleAction(item.id, "rejected")} className="bg-red-600 text-white p-3 rounded-xl hover:scale-110 transition-all shadow-lg shadow-red-600/20"><FaTimes/></button>
                           </div>
                        </div>
                      </div>

                      {/* عرض كافة الصور المصغرة */}
                      <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5">
                        {item.files?.map((file, idx) => (
                          <div key={idx} className="relative cursor-pointer group" onClick={() => window.open(file.url, '_blank')}>
                            {file.type?.includes('pdf') ? (
                              <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 transition-all group-hover:bg-red-500/20"><FaFilePdf className="text-red-500 text-2xl"/></div>
                            ) : (
                              <img src={file.url} className="w-20 h-20 object-cover rounded-2xl border border-white/10 group-hover:border-purple-500 group-hover:scale-105 transition-all" alt="thumb" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* أرشيف المحتوى */}
            <div className="bg-[#111] backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3 border-b border-white/5 pb-6 italic uppercase tracking-tighter"><FaLayerGroup className="text-blue-500"/> الأرشيف العام ({materialsList.length})</h2>
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {materialsList.map((item) => (
                  <div key={item.id} className="bg-black/30 rounded-[2rem] p-5 flex items-center justify-between border border-white/5 hover:border-purple-500/30 transition-all group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                       <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                          {item.files?.[0]?.type?.includes('pdf') ? <FaFilePdf className="text-red-500"/> : <FaFileImage className="text-blue-400"/>}
                       </div>
                       <div className="min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase ${item.type === 'summary' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{item.type === 'summary' ? 'ملخص' : 'تكليف'}</span>
                            <h4 className="font-black text-sm text-white italic truncate">{item.title}</h4>
                         </div>
                         {item.desc && <p className="text-[10px] text-gray-500 mb-1 italic truncate">{item.desc}</p>}
                         <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{item.subject} | فرقة {item.year}</div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                        {adminRole === "admin" && (
                          <button onClick={() => handleDelete(item.id, item.title)} className="bg-red-500/5 text-red-500 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg"><FaTrash size={14}/></button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
