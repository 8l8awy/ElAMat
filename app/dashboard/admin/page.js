// ✅ استبدل فقط قسم handleFileChange و نموذج الرفع بهذا الكود المحسّن

const handleFileChange = (e) => { 
  if (e.target.files) {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // عرض أسماء الملفات في الكونسول للتأكد
    console.log("تم اختيار الملفات:", selectedFiles.map(f => f.name));
  }
};

// ✅ في قسم الـ JSX، استبدل نموذج الرفع بهذا:

return (
  <div className="admin-container">
    {/* ... باقي الكود ... */}

    <form onSubmit={handleUpload} style={{borderBottom: '1px solid #333', paddingBottom: '30px', marginBottom: '30px'}}>
      
      {/* العنوان */}
      <div className="form-group">
        <label style={{color: '#fff', marginBottom: '8px', display: 'block', fontWeight: 'bold'}}>العنوان</label>
        <input 
          type="text" 
          className="form-input" 
          value={title} 
          onChange={(e)=>setTitle(e.target.value)} 
          placeholder="مثال: ملخص الفصل الأول"
          required 
        />
      </div>

      {/* الوصف (اختياري) */}
      <div className="form-group">
        <label style={{color: '#fff', marginBottom: '8px', display: 'block', fontWeight: 'bold'}}>الوصف (اختياري)</label>
        <textarea 
          className="form-input" 
          value={desc} 
          onChange={(e)=>setDesc(e.target.value)} 
          placeholder="وصف مختصر للملف..."
          rows="3"
          style={{resize: 'vertical', fontFamily: 'inherit'}}
        />
      </div>

      {/* المادة والنوع */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
        <div className="form-group">
          <label style={{color: '#fff', marginBottom: '8px', display: 'block', fontWeight: 'bold'}}>المادة</label>
          <select className="form-select" value={subject} onChange={(e)=>setSubject(e.target.value)}>
            {subjects.map((s,i)=><option key={i} value={s}>{s}</option>)}
          </select>
        </div>
        
        <div className="form-group">
          <label style={{color: '#fff', marginBottom: '8px', display: 'block', fontWeight: 'bold'}}>النوع</label>
          <select className="form-select" value={type} onChange={(e)=>setType(e.target.value)}>
            <option value="summary">📝 ملخص</option>
            <option value="assignment">📋 تكليف</option>
          </select>
        </div>
      </div>

      {/* منطقة رفع الملفات المحسّنة */}
      <div className="form-group">
        <label style={{color: '#fff', marginBottom: '8px', display: 'block', fontWeight: 'bold'}}>
          📎 الملفات (PDF أو صور)
        </label>
        
        <div style={{
          border: '2px dashed #00f260', 
          borderRadius: '15px', 
          padding: '40px 20px', 
          textAlign: 'center',
          background: 'rgba(0, 242, 96, 0.05)',
          cursor: 'pointer',
          transition: 'all 0.3s',
          position: 'relative'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 242, 96, 0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 242, 96, 0.05)'}
        >
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept=".pdf,image/*,.jpg,.jpeg,.png,.gif,.webp" 
            multiple 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              opacity: 0,
              cursor: 'pointer'
            }}
          />
          
          <div style={{pointerEvents: 'none'}}>
            <div style={{fontSize: '3rem', marginBottom: '15px'}}>📁</div>
            
            {files.length === 0 ? (
              <>
                <p style={{color: '#00f260', fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 10px 0'}}>
                  اضغط هنا أو اسحب الملفات
                </p>
                <p style={{color: '#888', fontSize: '0.9rem', margin: 0}}>
                  يدعم: PDF, JPG, PNG, GIF, WebP
                </p>
              </>
            ) : (
              <>
                <p style={{color: '#00f260', fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 15px 0'}}>
                  ✅ تم اختيار {files.length} ملف
                </p>
                
                {/* قائمة الملفات المختارة */}
                <div style={{
                  background: '#111', 
                  borderRadius: '10px', 
                  padding: '15px',
                  textAlign: 'right',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {files.map((file, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      marginBottom: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      fontSize: '0.9rem'
                    }}>
                      <span style={{fontSize: '1.2rem'}}>
                        {file.type.includes('pdf') ? '📄' : '🖼️'}
                      </span>
                      <span style={{color: '#ccc', flex: 1, textAlign: 'right'}}>
                        {file.name}
                      </span>
                      <span style={{
                        color: '#00f260', 
                        fontSize: '0.8rem',
                        background: 'rgba(0,242,96,0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ملاحظة مهمة */}
        <p style={{
          color: '#fbbf24', 
          fontSize: '0.85rem', 
          marginTop: '10px',
          padding: '10px',
          background: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(251, 191, 36, 0.3)'
        }}>
          💡 يمكنك رفع أكثر من ملف مرة واحدة (PDF + صور معاً)
        </p>
      </div>

      {/* زر الرفع */}
      <button 
        type="submit" 
        className="submit-btn" 
        disabled={uploading}
        style={{
          background: uploading ? '#555' : '#00f260',
          cursor: uploading ? 'not-allowed' : 'pointer',
          opacity: uploading ? 0.7 : 1
        }}
      >
        {uploading ? "⏳ جاري الرفع..." : "🚀 رفع الملفات"}
      </button>
    </form>

    {/* ... باقي الكود ... */}
  </div>
);
