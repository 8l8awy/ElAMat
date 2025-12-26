"use client";
import { useState, useEffect } from "react";
import { FaCheckCircle, FaSpinner, FaTrash, FaFilePdf, FaLock, FaCheck, FaTimes, FaImage, FaFileAlt, FaCloudUploadAlt } from "react-icons/fa";

export default function AdminPageImproved() {
  // حالات النظام
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFake404, setShowFake404] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [checkingCode, setCheckingCode] = useState(false);

  // متغيرات لوحة التحكم
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("مبادئ الاقتصاد");
  const [type, setType] = useState("summary");
  const [files, setFiles] = useState([]);
  
  const [materialsList, setMaterialsList] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");

  const subjects = [
    "مبادئ الاقتصاد",
    "لغة اجنبية (1)",
    "مبادئ المحاسبة المالية",
    "مبادئ القانون",
    "مبادئ ادارة الاعمال"
  ];

  // محاكاة بيانات للعرض
  useEffect(() => {
    // للتجربة - في الكود الحقيقي استخدم Firebase
    setMaterialsList([
      { id: "1", title: "ملخص الفصل الأول", subject: "مبادئ الاقتصاد", type: "summary", files: [{type: "application/pdf"}] },
      { id: "2", title: "شرح بالصور", subject: "لغة اجنبية (1)", type: "summary", files: [{type: "image/jpeg"}] }
    ]);
    setPendingList([
      { id: "p1", title: "طلب طالب - ملخص", subject: "مبادئ القانون", files: [{type: "application/pdf"}] }
    ]);
  }, []);

  const handleManualLogin = (e) => {
    e.preventDefault();
    if (inputCode === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("⛔ الكود غير صحيح");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) return <FaFilePdf color="#e74c3c" />;
    if (fileType.includes("image")) return <FaImage color="#3498db" />;
    return <FaFileAlt color="#95a5a6" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !title) return alert("❌ البيانات ناقصة");
    
    setUploading(true);
    setMessage("جاري الرفع...");
    
    // محاكاة الرفع
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }
    
    // إضافة للقائمة (في الكود الحقيقي: Firebase)
    const newItem = {
      id: Date.now().toString(),
      title,
      desc,
      subject,
      type,
      files: files.map(f => ({ name: f.name, type: f.type, size: f.size }))
    };
    
    setMaterialsList([newItem, ...materialsList]);
    
    setUploading(false);
    setUploadProgress(0);
    setTitle("");
    setDesc("");
    setFiles([]);
    setMessage("✅ تم الرفع بنجاح!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = (id, title) => {
    if (confirm(`حذف "${title}" نهائياً؟`)) {
      setMaterialsList(materialsList.filter(item => item.id !== id));
    }
  };

  const handleApprove = (id, title) => {
    if (confirm(`قبول ونشر "${title}"؟`)) {
      const approved = pendingList.find(item => item.id === id);
      setPendingList(pendingList.filter(item => item.id !== id));
      setMaterialsList([{ ...approved, id: Date.now().toString() }, ...materialsList]);
      setMessage(`✅ تم نشر "${title}"`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleReject = (id, title) => {
    if (confirm(`رفض "${title}"؟`)) {
      setPendingList(pendingList.filter(item => item.id !== id));
    }
  };

  if (showFake404) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#fff'
      }}>
        <h1 style={{fontSize: '3rem', fontWeight: '700', margin: '0 0 10px 0', color: '#000'}}>404</h1>
        <h2 style={{fontSize: '1rem', fontWeight: '400', margin: 0, color: '#666'}}>This page could not be found.</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '50px 40px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '420px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: '70px',
            height: '70px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 25px',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
          }}>
            <FaLock size={30} color="#fff" />
          </div>
          
          <h1 style={{fontSize: '2rem', marginBottom: '10px', fontWeight: '700', color: '#2d3748'}}>
            لوحة التحكم
          </h1>
          <p style={{color: '#718096', marginBottom: '35px', fontSize: '0.95rem'}}>
            أدخل كود الأدمن للدخول
          </p>
          
          <form onSubmit={handleManualLogin}>
            <div style={{marginBottom: '25px', position: 'relative'}}>
              <input
                type="password"
                placeholder="أدخل الكود السري"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  background: '#f7fafc',
                  color: '#2d3748',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
            
            <button
              type="submit"
              disabled={checkingCode}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '16px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1rem',
                width: '100%',
                cursor: checkingCode ? 'not-allowed' : 'pointer',
                opacity: checkingCode ? 0.7 : 1,
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
              onMouseOver={(e) => !checkingCode && (e.target.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {checkingCode ? "جاري التحقق..." : "دخول"}
            </button>
          </form>
          
          <p style={{marginTop: '25px', fontSize: '0.8rem', color: '#a0aec0'}}>
            للتجربة: استخدم <code style={{background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', color: '#667eea'}}>admin123</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{maxWidth: '1200px', margin: '0 auto'}}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '2.5rem',
            margin: 0,
            fontWeight: '700',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            🚀 لوحة التحكم
          </h1>
        </div>

        {/* Message Alert */}
        {message && (
          <div style={{
            background: 'rgba(72, 187, 120, 0.15)',
            border: '2px solid #48bb78',
            color: '#48bb78',
            padding: '18px 24px',
            borderRadius: '15px',
            textAlign: 'center',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '1.05rem',
            fontWeight: '500',
            backdropFilter: 'blur(10px)'
          }}>
            <FaCheckCircle size={22} /> {message}
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleUpload} style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '35px',
          marginBottom: '40px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{color: 'white', marginTop: 0, marginBottom: '30px', fontSize: '1.5rem', fontWeight: '600'}}>
            إضافة محتوى جديد
          </h2>

          {/* Title */}
          <div style={{marginBottom: '25px'}}>
            <label style={{color: 'white', display: 'block', marginBottom: '10px', fontWeight: '500'}}>
              العنوان *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ملخص الفصل الأول"
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Description */}
          <div style={{marginBottom: '25px'}}>
            <label style={{color: 'white', display: 'block', marginBottom: '10px', fontWeight: '500'}}>
              الوصف (اختياري)
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="وصف مختصر للمحتوى..."
              rows={3}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Subject & Type */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '25px'
          }}>
            <div>
              <label style={{color: 'white', display: 'block', marginBottom: '10px', fontWeight: '500'}}>
                المادة *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                {subjects.map((s, i) => (
                  <option key={i} value={s} style={{background: '#1e3c72', color: 'white'}}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{color: 'white', display: 'block', marginBottom: '10px', fontWeight: '500'}}>
                النوع *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <option value="summary" style={{background: '#1e3c72'}}>📝 ملخص</option>
                <option value="assignment" style={{background: '#1e3c72'}}>📋 تكليف</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div style={{marginBottom: '25px'}}>
            <label style={{color: 'white', display: 'block', marginBottom: '10px', fontWeight: '500'}}>
              الملفات (PDF أو صور) *
            </label>
            <div style={{
              border: '3px dashed rgba(255, 255, 255, 0.3)',
              borderRadius: '15px',
              padding: '30px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#48bb78';
              e.currentTarget.style.background = 'rgba(72, 187, 120, 0.1)';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              const droppedFiles = Array.from(e.dataTransfer.files);
              setFiles(droppedFiles);
            }}
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,image/*"
                multiple
                style={{display: 'none'}}
                id="fileInput"
              />
              <label htmlFor="fileInput" style={{cursor: 'pointer', display: 'block'}}>
                <FaCloudUploadAlt size={50} color="rgba(255, 255, 255, 0.5)" style={{marginBottom: '15px'}} />
                <p style={{color: 'white', fontSize: '1.1rem', margin: '0 0 8px 0', fontWeight: '500'}}>
                  اسحب الملفات هنا أو اضغط للاختيار
                </p>
                <p style={{color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', margin: 0}}>
                  يدعم PDF, JPG, PNG, GIF
                </p>
              </label>
            </div>

            {/* Selected Files Preview */}
            {files.length > 0 && (
              <div style={{marginTop: '20px'}}>
                <p style={{color: 'white', marginBottom: '12px', fontWeight: '500'}}>
                  الملفات المحددة ({files.length}):
                </p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  {files.map((file, index) => (
                    <div key={index} style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0}}>
                        {getFileIcon(file.type)}
                        <div style={{flex: 1, minWidth: 0}}>
                          <p style={{
                            color: 'white',
                            margin: 0,
                            fontSize: '0.95rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {file.name}
                          </p>
                          <p style={{color: 'rgba(255, 255, 255, 0.6)', margin: 0, fontSize: '0.85rem'}}>
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#ef4444',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div style={{marginBottom: '20px'}}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                height: '12px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #48bb78, #38a169)',
                  height: '100%',
                  width: `${uploadProgress}%`,
                  transition: 'width 0.3s',
                  borderRadius: '10px'
                }} />
              </div>
              <p style={{color: 'white', textAlign: 'center', marginTop: '8px', fontSize: '0.9rem'}}>
                {uploadProgress}%
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            style={{
              background: uploading ? 'rgba(255, 255, 255, 0.2)' : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              color: 'white',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1.1rem',
              width: '100%',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: uploading ? 'none' : '0 4px 15px rgba(72, 187, 120, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {uploading ? (
              <>
                <FaSpinner className="fa-spin" /> جاري الرفع...
              </>
            ) : (
              <>
                <FaCloudUploadAlt /> رفع المحتوى
              </>
            )}
          </button>
        </form>

        {/* Pending Requests */}
        {pendingList.length > 0 && (
          <div style={{
            background: 'rgba(234, 179, 8, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(234, 179, 8, 0.4)',
            borderRadius: '20px',
            padding: '30px',
            marginBottom: '40px'
          }}>
            <h2 style={{
              color: '#eab308',
              marginTop: 0,
              marginBottom: '25px',
              fontSize: '1.5rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              ⚠️ طلبات قيد الانتظار ({pendingList.length})
            </h2>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              {pendingList.map((item) => (
                <div key={item.id} style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '15px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '15px'
                }}>
                  <div style={{flex: 1, minWidth: '200px'}}>
                    <h4 style={{
                      color: 'white',
                      margin: '0 0 10px 0',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      {getFileIcon(item.files[0].type)} {item.title}
                      <span style={{
                        fontSize: '0.75rem',
                        background: 'rgba(234, 179, 8, 0.3)',
                        color: '#eab308',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: '500'
                      }}>
                        طالب
                      </span>
                    </h4>
                    <div style={{display: 'flex', gap: '12px', fontSize: '0.9rem', flexWrap: 'wrap'}}>
                      <span style={{
                        color: '#ccc',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '4px 10px',
                        borderRadius: '6px'
                      }}>
                        📌 {item.subject}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    <button
                      onClick={() => handleApprove(item.id, item.title)}
                      style={{
                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        boxShadow: '0 2px 10px rgba(72, 187, 120, 0.3)'
                      }}
                    >
                      قبول <FaCheck />
                    </button>
                    <button
                      onClick={() => handleReject(item.id, item.title)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        fontSize: '0.95rem'
                      }}
                    >
                      رفض <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published Materials */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            color: 'white',
            marginTop: 0,
            marginBottom: '25px',
            fontSize: '1.5rem',
            fontWeight: '600',
            borderRight: '4px solid #48bb78',
            paddingRight: '15px'
          }}>
            الملفات المنشورة ({materialsList.length})
          </h2>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {materialsList.map((item) => (
              <div key={item.id} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '15px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px'
              }}>
                <div style={{flex: 1, minWidth: '200px'}}>
                  <h4 style={{
                    color: 'white',
                    margin: '0 0 10px 0',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {getFileIcon(item.files[0].type)} {item.title}
                  </h4>
                  <div style={{display: 'flex', gap: '12px', fontSize: '0.9rem', flexWrap: 'wrap'}}>
                    <span style={{
                      color: '#ccc',
                      background: 'rgba(255,255,255,0.1)',
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}>
                      📌 {item.subject}
                    </span>
                    <span style={{
                      color: item.type === 'summary' ? '#48bb78' : '#f59e0b',
                      background: item.type === 'summary' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}>
                      {item.type === 'assignment' ? '📋 تكليف' : '📝 ملخص'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  style={{
                    background: 'transparent',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <FaTrash size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
