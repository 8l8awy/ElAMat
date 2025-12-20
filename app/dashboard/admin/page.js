"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../../../lib/firebase"; 
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, serverTimestamp, orderBy, onSnapshot, updateDoc } from "firebase/firestore";
import { FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaLock, FaSignOutAlt, FaExclamationTriangle, FaTimes, FaCheck, FaDownload, FaImage, FaUser, FaThumbtack } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { saveAs } from 'file-saver';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ☁️ بيانات Cloudinary
  const CLOUD_NAME = "dhj0extnk"; 
  const UPLOAD_PRESET = "ml_default"; 

  // حالات النظام
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFake404, setShowFake404] = useState(true); 
  const [inputCode, setInputCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  // متغيرات لوحة التحكم
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]); 
  const [materialsList, setMaterialsList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // للمعاينة
  const [downloading, setDownloading] = useState(false);

  const subjects = ["مبادئ الاقتصاد", "لغة اجنبية (1)", "مبادئ المحاسبة المالية", "مبادئ القانون", "مبادئ ادارة الاعمال"];

  // ✅ 1. الفحص الذكي عند فتح الصفحة
  useEffect(() => {
    const checkAccess = async () => {
      const savedCode = localStorage.getItem("adminCode");
      const isSecretMode = searchParams.get("mode") === "login";

      if (savedCode) {
        await verifyCode(savedCode, true);
      } else if (isSecretMode) {
        setIsLoading(false);
        setShowFake404(false);
      } else {
        setIsLoading(false);
        setShowFake404(true);
      }
    };

    checkAccess();
  }, []);

  // دالة التحقق من الكود
  const verifyCode = async (codeToVerify, isAutoCheck = false) => {
    if (!isAutoCheck) setCheckingCode(true);

    try {
      const codesRef = collection(db, "allowedCodes");
      const q = query(codesRef, where("code", "==", codeToVerify.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.admin === true) {
          setIsAuthenticated(true);
          setShowFake404(false);
          localStorage.setItem("adminCode", codeToVerify); 
        } else {
          if (!isAutoCheck) alert("⛔ هذا الكود ليس لمشرف (Admin)");
          if (isAutoCheck) handleLoginFail(); 
        }
      } else {
        if (!isAutoCheck) alert("⛔ الكود غير صحيح");
        if (isAutoCheck) handleLoginFail();
      }
    } catch (error) {
      console.error(error);
      if (!isAutoCheck) alert("خطأ في الاتصال");
    }
    
    setIsLoading(false);
    if (!isAutoCheck) setCheckingCode(false);
  };

  const handleLoginFail = () => {
    localStorage.removeItem("adminCode");
    setIsAuthenticated(false);
    setShowFake404(true);
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    await verifyCode(inputCode);
  };

  // ... (دوال الرفع والحذف والتحميل) ...
  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "materials"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaterialsList(data);
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleDelete = async (id, title) => { 
      if (confirm(`حذف "${title}"؟`)) {
          await deleteDoc(doc(db, "materials", id)); 
          if(selectedFile?.id === id) setSelectedFile(null);
      }
  };

  const handleFileChange = (e) => { if (e.target.files) setFiles(Array.from(e.target.files)); };
  
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
    const data = await res.json();
    return data.secure_url;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title) return alert("البيانات ناقصة");
    setUploading(true); setMessage("جاري الرفع...");
    
    try {
      // رفع الملفات واحد تلو الآخر (أو الأول فقط إذا كنت تريد ملف واحد)
      // هنا سنفترض أننا نرفع أول ملف فقط لأن قاعدة البيانات لديك تخزن fileUrl واحد
      // إذا كنت تريد دعم ملفات متعددة، يجب تغيير هيكلة قاعدة البيانات لتكون files: []
      
      const file = files[0];
      const url = await uploadToCloudinary(file);
      
      // تحديد نوع الملف
      let fileType = 'other';
      if (file.type.includes('pdf')) fileType = 'pdf';
      else if (file.type.includes('image')) fileType = 'image';

      await addDoc(collection(db, "materials"), {
        title, subject, type, 
        fileUrl: url, 
        fileType: fileType,
        uploader: "Admin", // لأن الأدمن هو من يرفع
        date: new Date().toISOString(), 
        status: "approved", 
        viewCount: 0, 
        downloadCount: 0, 
        createdAt: serverTimestamp(),
      });
      
      setUploading(false); setTitle(""); setFiles([]); setMessage("تم بنجاح! ");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) { 
        console.error(error);
        setUploading(false); 
        alert("خطأ في الرفع"); 
    }
  };

  const handleDownload = async (fileUrl, title, fileType) => {
    setDownloading(true);
    try {
        if (fileType === 'pdf' || fileUrl.endsWith('.pdf')) {
            saveAs(fileUrl, `${title}.pdf`);
        } else {
            saveAs(fileUrl, `${title}.jpg`);
        }
    } catch (error) {
        alert("فشل التحميل.");
    } finally {
        setDownloading(false);
    }
  };

  // ⏳ شاشة تحميل
  if (isLoading) {
    return (
      <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff'}}>
        <FaSpinner className="fa-spin" size={40} color="#333" />
      </div>
    );
  }

  // 👻 1. صفحة 404 الوهمية
  if (showFake404) {
    return (
      <div style={{height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#000', background: '#fff', fontFamily: 'sans-serif'}}>
        <h1 style={{fontSize: '2rem', fontWeight: '600', margin: '0 0 10px 0'}}>404</h1>
        <h2 style={{fontSize: '14px', fontWeight: 'normal', margin: 0}}>This page could not be found.</h2>
      </div>
    );
  }

  // 🔒 2. شاشة تسجيل الدخول
  if (!isAuthenticated) {
    return (
      <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', color: 'white', fontFamily: 'sans-serif'}}>
        <div style={{background: 'rgba(255, 255, 255, 0.05)', padding: '50px 40px', borderRadius: '20px', textAlign: 'center', border: '1px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px'}}>
          <h1 style={{fontSize: '1.8rem', marginBottom: '10px', fontWeight: 'bold'}}>Admin Access</h1>
          <form onSubmit={handleManualLogin}>
            <div style={{marginBottom: '20px', position: 'relative'}}>
                <FaLock style={{position: 'absolute', left: '15px', top: '15px', color: '#666'}} />
                <input type="password" placeholder="Security Code" value={inputCode} onChange={(e) => setInputCode(e.target.value)} style={{width: '100%', padding: '15px 15px 15px 45px', borderRadius: '10px', border: '1px solid #444', background: '#111', color: 'white', fontSize: '1rem', outline: 'none'}} />
            </div>
            <button type="submit" disabled={checkingCode} style={{background: 'white', color: 'black', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', width: '100%', cursor: 'pointer', opacity: checkingCode ? 0.7 : 1}}>
              {checkingCode ? "Verifying..." : "Login"}
