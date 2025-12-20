// ✅ ابحث عن دالة handlePreviewFile واستبدلها بهذا:

const handlePreviewFile = (fileUrl, fileName) => {
  const fileExtension = fileName.split('.').pop().toLowerCase();
  
  // تحديد نوع الملف
  const isPdf = fileExtension === 'pdf' || fileUrl.toLowerCase().includes('.pdf');
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(fileExtension);
  
  setPreviewFile({
    url: fileUrl,
    name: fileName,
    type: isPdf ? 'pdf' : (isImage ? 'image' : 'other')
  });
};

// ✅ في قسم عرض الملفات داخل المودال، استبدل الكود بهذا:

{selectedMaterial.files && selectedMaterial.files.length > 0 ? (
  selectedMaterial.files.map((file, index) => (
    <div key={index} className="modal-file-item" style={{background:'#222', padding:'15px', borderRadius:'10px', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <span style={{color:'white', display:'flex', alignItems:'center', gap:'10px'}}>
        {file.type?.includes('pdf') || file.name?.endsWith('.pdf') ? (
          <FaFilePdf color="#ef4444"/>
        ) : (
          <FaFileImage color="#3b82f6"/>
        )} 
        {file.name}
      </span>
      <div style={{display:'flex', gap:'10px'}}>
        
        {/* زر المعاينة */}
        <button 
          onClick={() => handlePreviewFile(file.url, file.name)}
          className="btn-preview"
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '6px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          <FaEye /> معاينة
        </button>
        
        <a 
          href={getDownloadUrl(file.url)} 
          onClick={() => handleDownloadStats(selectedMaterial.id)}
          className="view-file-btn" 
          style={{background:'#00f260', color:'#000', padding:'8px 15px', borderRadius:'8px', textDecoration:'none', fontSize:'0.9em', display:'flex', alignItems:'center', gap:'5px', fontWeight:'600'}}
        >
          <FaCloudArrowDown /> تحميل
        </a>
      </div>
    </div>
  ))
) : (
  <p style={{textAlign:'center', color:'#888'}}>لا توجد ملفات مرفقة.</p>
)}

// ✅ نافذة المعاينة المحسّنة - استبدل الكود القديم بهذا:

{previewFile && (
  <div className="modal active" onClick={() => setPreviewFile(null)} style={{display:'flex', zIndex: 3000, background: 'rgba(0, 0, 0, 0.95)'}}>
    
    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
      maxWidth: '900px', 
      width: '95%', 
      height: '90vh', 
      display:'flex', 
      flexDirection:'column', 
      padding: '0', 
      overflow: 'hidden',
      background: '#0f0f0f',
      border: '1px solid #333'
    }}>
      
      {/* شريط العنوان */}
      <div style={{
        padding:'15px', 
        background:'#1a1a1a', 
        display:'flex', 
        justifyContent:'space-between', 
        alignItems:'center', 
        borderBottom:'1px solid #333'
      }}>
        <h3 style={{color:'white', margin:0, fontSize:'1em', display: 'flex', alignItems: 'center', gap: '10px'}}>
          {previewFile.type === 'pdf' ? '📄' : '🖼️'} {previewFile.name || 'معاينة الملف'}
        </h3>
        <button 
          className="close-btn" 
          onClick={() => setPreviewFile(null)} 
          style={{
            background:'transparent', 
            border:'none', 
            color:'white', 
            fontSize:'1.5em', 
            cursor:'pointer',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          ×
        </button>
      </div>

      {/* محتوى المعاينة */}
      <div style={{
        flex:1, 
        position:'relative', 
        background:'#000', 
        overflow: 'hidden', 
        display:'flex', 
        justifyContent:'center',
        alignItems: 'center'
      }}>
        {previewFile.type === 'pdf' ? (
          <>
            <iframe 
              src={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile.url)}&embedded=true`}
              width="100%" 
              height="100%" 
              style={{border:'none'}}
              title="PDF Preview"
            ></iframe>
            <a 
              href={previewFile.url} 
              target="_blank" 
              rel="noreferrer" 
              style={{
                position:'absolute', 
                bottom:'20px', 
                left:'50%', 
                transform:'translateX(-50%)', 
                background:'white', 
                padding:'10px 25px', 
                borderRadius:'25px', 
                textDecoration:'none', 
                color:'black', 
                fontSize:'0.9em', 
                fontWeight:'bold', 
                boxShadow:'0 5px 15px rgba(0,0,0,0.5)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) translateY(0)'}
            >
              🔗 فتح في نافذة خارجية
            </a>
          </>
        ) : previewFile.type === 'image' ? (
          <div className="modal-image-scroll" style={{
            maxHeight: '80vh',
            overflowY: 'auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            background: '#000',
            borderRadius: '8px'
          }}>
            <img 
              src={previewFile.url} 
              alt="Preview" 
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '800px',
                objectFit: 'contain'
              }}
            />
          </div>
        ) : (
          // للملفات غير المدعومة
          <div style={{
            textAlign: 'center',
            padding: '50px',
            color: '#888'
          }}>
            <div style={{fontSize: '4em', marginBottom: '20px'}}>📄</div>
            <h3 style={{color: 'white', marginBottom: '15px'}}>لا يمكن معاينة هذا النوع من الملفات</h3>
            <p style={{marginBottom: '30px'}}>يمكنك تحميل الملف لعرضه على جهازك</p>
            <a 
              href={previewFile.url} 
              download
              style={{
                display: 'inline-block',
                background: '#00f260',
                color: '#000',
                padding: '15px 30px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ⬇️ تحميل الملف
            </a>
          </div>
        )}
      </div>
    </div>
  </div>
)}
