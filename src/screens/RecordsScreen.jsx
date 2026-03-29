import { useState, useEffect, useCallback } from 'react';
import { C, btn, card } from '../lib/design';
import { getRecords, uploadReport, deleteRecord } from '../lib/api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const typeIcon = { 'Lab Report': '🔬', 'Imaging': '🩻', 'Prescription': '💊', 'Discharge Summary': '🏥', 'Other': '📄' };
const typeColor = { 'Lab Report': C.tealPale, 'Imaging': C.bluePale, 'Prescription': C.goldPale, 'Discharge Summary': C.saffronPale, 'Other': C.warm };

// ── Upload Sheet ──────────────────────────────────────────────
function UploadSheet({ patientId, onClose, onDone }) {
  const [step, setStep] = useState('choose');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Lab Report');
  const [doctor, setDoctor] = useState('');
  const [hospital, setHospital] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    setStep('details');
  };

  const save = async () => {
    if (!title || saving) return;
    setSaving(true); setErr('');
    const res = await uploadReport(patientId, file, { title, type, doctor, hospital });
    setSaving(false);
    if (res.ok) onDone('Report uploaded!');
    else setErr(res.error || 'Upload failed. Check your connection.');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.cream, zIndex: 200, display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '54px 20px 22px' }}>
        <button onClick={onClose} style={{ width:36,height:36,borderRadius:18,background:'rgba(255,255,255,0.12)',border:'none',color:C.white,fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,fontFamily:'inherit' }}>←</button>
        <div style={{ fontSize:22,fontWeight:800,color:C.white }}>Upload Report</div>
        <div style={{ fontSize:13,color:'rgba(255,255,255,0.5)',marginTop:3 }}>Add health document to your record</div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'20px 20px 40px' }}>
        {step === 'choose' && (
          <>
            <div style={{ fontSize:13,fontWeight:700,color:C.textMid,marginBottom:14,textTransform:'uppercase',letterSpacing:0.8 }}>Choose upload method</div>
            {[
              { icon:'📷', label:'Take Photo', sub:'Click report with your camera', accept:'image/*', capture:'camera' },
              { icon:'🖼️', label:'Choose from Gallery', sub:'Select saved photo', accept:'image/*', capture:'' },
              { icon:'📄', label:'Upload PDF', sub:'Select a PDF file', accept:'application/pdf', capture:'' },
            ].map(opt => (
              <label key={opt.label} style={{ display:'flex',alignItems:'center',gap:14,padding:'16px 18px',background:C.white,borderRadius:16,border:`1.5px solid ${C.border}`,boxShadow:`0 2px 10px ${C.shadow}`,marginBottom:12,cursor:'pointer' }}>
                <div style={{ width:48,height:48,borderRadius:14,background:C.tealPale,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0 }}>{opt.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15,fontWeight:700,color:C.text }}>{opt.label}</div>
                  <div style={{ fontSize:12,color:C.textMid,marginTop:2 }}>{opt.sub}</div>
                </div>
                <span style={{ fontSize:18,color:C.textLight }}>›</span>
                <input type='file' accept={opt.accept} capture={opt.capture || undefined} style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
              </label>
            ))}
            <div style={{ padding:'12px 14px',background:C.warm,borderRadius:12,border:`1px solid ${C.border}`,marginTop:4 }}>
              <div style={{ fontSize:13,color:C.textMid,lineHeight:1.6 }}>🔒 Your reports are <strong>encrypted</strong> and only visible to you.</div>
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            {/* File preview */}
            <div style={{ background:C.tealPale,borderRadius:14,padding:'14px 16px',display:'flex',alignItems:'center',gap:12,border:`1px solid rgba(10,139,122,0.2)`,marginBottom:20 }}>
              {preview ? (
                <img src={preview} alt='preview' style={{ width:60,height:60,borderRadius:10,objectFit:'cover',flexShrink:0 }} />
              ) : (
                <div style={{ width:60,height:60,borderRadius:10,background:'rgba(10,139,122,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0 }}>📄</div>
              )}
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14,fontWeight:700,color:C.teal }}>File ready</div>
                <div style={{ fontSize:12,color:C.textMid,marginTop:1 }}>{file?.name}</div>
              </div>
              <button onClick={() => { setStep('choose'); setFile(null); setPreview(null); }} style={{ fontSize:18,background:'none',border:'none',cursor:'pointer',color:C.textLight }}>✕</button>
            </div>

            {/* Report name */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:13,fontWeight:700,color:C.textMid,marginBottom:7 }}>Report Name *</div>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder='e.g. Blood Test, Chest X-Ray, CBC...'
                style={{ width:'100%',padding:'13px 16px',borderRadius:12,border:`1.5px solid ${title?C.saffron:C.border}`,background:C.white,fontSize:15,fontWeight:500,color:C.text,outline:'none',fontFamily:'inherit',boxSizing:'border-box' }} />
            </div>

            {/* Type */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:13,fontWeight:700,color:C.textMid,marginBottom:7 }}>Report Type</div>
              <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                {['Lab Report','Imaging','Prescription','Discharge Summary','Other'].map(t => (
                  <div key={t} onClick={()=>setType(t)} style={{ padding:'8px 14px',borderRadius:20,cursor:'pointer',fontSize:13,fontWeight:600,border:`1.5px solid ${type===t?C.saffron:C.border}`,background:type===t?C.saffronPale:C.white,color:type===t?C.saffron:C.textMid,transition:'all 0.15s' }}>{t}</div>
                ))}
              </div>
            </div>

            {/* Doctor */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:13,fontWeight:700,color:C.textMid,marginBottom:7 }}>Doctor <span style={{ fontWeight:400,color:C.textLight }}>(optional)</span></div>
              <input value={doctor} onChange={e=>setDoctor(e.target.value)} placeholder='e.g. Dr. Rajesh Yadav'
                style={{ width:'100%',padding:'13px 16px',borderRadius:12,border:`1.5px solid ${C.border}`,background:C.white,fontSize:15,fontWeight:500,color:C.text,outline:'none',fontFamily:'inherit',boxSizing:'border-box' }} />
            </div>

            {/* Hospital */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13,fontWeight:700,color:C.textMid,marginBottom:7 }}>Clinic / Hospital <span style={{ fontWeight:400,color:C.textLight }}>(optional)</span></div>
              <input value={hospital} onChange={e=>setHospital(e.target.value)} placeholder='e.g. General Hospital Mahendragarh'
                style={{ width:'100%',padding:'13px 16px',borderRadius:12,border:`1.5px solid ${C.border}`,background:C.white,fontSize:15,fontWeight:500,color:C.text,outline:'none',fontFamily:'inherit',boxSizing:'border-box' }} />
            </div>

            {err && <div style={{ color:C.red,fontSize:13,marginBottom:12,padding:'10px 14px',background:C.redPale,borderRadius:10 }}>⚠️ {err}</div>}

            <button onClick={save} style={{ ...btn.primary, opacity: title&&!saving?1:0.4 }}>
              {saving ? '⏳ Uploading...' : '⬆️ Save Report'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Record Detail ─────────────────────────────────────────────
function RecordDetail({ record, onBack, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');
  const fileUrl = record.file_url;
  const urlPath = fileUrl ? fileUrl.split('?')[0].toLowerCase() : '';
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/.test(urlPath);
  const isPdf = /\.pdf$/.test(urlPath);

  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(''), 2500); };

  const handleDelete = async () => {
    if (!window.confirm('Delete this report permanently?')) return;
    setDeleting(true);
    await deleteRecord(record.id);
    onDelete();
  };

  const handleShare = () => {
    if (fileUrl && navigator.share) navigator.share({ title: record.title, url: fileUrl });
    else if (fileUrl) { navigator.clipboard.writeText(fileUrl); showToast('Link copied!'); }
    else showToast('No file attached');
  };

  return (
    <div style={{ position:'fixed',inset:0,background:C.cream,zIndex:200,display:'flex',flexDirection:'column',maxWidth:430,margin:'0 auto',overflowY:'auto' }}>
      {toast && <div style={{ position:'fixed',bottom:100,left:'50%',transform:'translateX(-50%)',background:C.navy,color:C.white,padding:'10px 20px',borderRadius:12,fontSize:14,fontWeight:600,zIndex:300,whiteSpace:'nowrap' }}>✓ {toast}</div>}

      {/* Header */}
      <div style={{ background:C.navy,padding:'54px 20px 22px',flexShrink:0 }}>
        <button onClick={onBack} style={{ width:36,height:36,borderRadius:18,background:'rgba(255,255,255,0.12)',border:'none',color:C.white,fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,fontFamily:'inherit' }}>←</button>
        <div style={{ fontSize:20,fontWeight:800,color:C.white,lineHeight:1.2 }}>{record.title}</div>
        <div style={{ fontSize:13,color:'rgba(255,255,255,0.5)',marginTop:4 }}>{record.type} · {fmtDate(record.date)}</div>
      </div>

      <div style={{ flex:1,padding:'16px 20px 40px' }}>
        {/* Meta card */}
        <div style={{ ...card.base,padding:'14px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:44,height:44,borderRadius:22,background:C.navyMid,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:C.white,flexShrink:0 }}>👨‍⚕️</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15,fontWeight:700,color:C.text }}>{record.doctor || 'Doctor not specified'}</div>
            <div style={{ fontSize:13,color:C.textMid,marginTop:2 }}>{record.hospital || record.type}</div>
          </div>
          <span style={{ padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:record.status==='warning'?C.goldPale:C.greenPale,color:record.status==='warning'?C.gold:C.green }}>
            {record.status==='warning'?'⚠ Review':'✓ Normal'}
          </span>
        </div>

        {/* File viewer */}
        {fileUrl && (
          <div style={{ ...card.base,padding:16,marginBottom:14 }}>
            <div style={{ fontSize:12,fontWeight:700,color:C.textMid,marginBottom:12,textTransform:'uppercase',letterSpacing:0.8 }}>Attached File</div>
            {isImage && (
              <img src={fileUrl} alt={record.title} style={{ width:'100%',borderRadius:10,objectFit:'contain',maxHeight:'60vh',background:C.warm }} />
            )}
            {isPdf && (
              <div style={{ textAlign:'center',padding:'20px 0' }}>
                <div style={{ fontSize:48,marginBottom:8 }}>📄</div>
                <div style={{ fontSize:14,fontWeight:700,color:C.text,marginBottom:12 }}>PDF Document</div>
                <a href={fileUrl} target='_blank' rel='noreferrer'
                  style={{ display:'inline-block',padding:'10px 28px',background:C.navy,color:C.white,borderRadius:10,fontSize:14,fontWeight:700,textDecoration:'none' }}>
                  Open PDF ↗
                </a>
              </div>
            )}
            {!isImage && !isPdf && (
              <div style={{ textAlign:'center',padding:'16px 0' }}>
                <a href={fileUrl} target='_blank' rel='noreferrer'
                  style={{ display:'inline-block',padding:'10px 28px',background:C.navy,color:C.white,borderRadius:10,fontSize:14,fontWeight:700,textDecoration:'none' }}>
                  View File ↗
                </a>
              </div>
            )}
          </div>
        )}

        {!fileUrl && (
          <div style={{ ...card.base,padding:24,marginBottom:14,textAlign:'center',color:C.textMid }}>
            <div style={{ fontSize:36,marginBottom:8 }}>📋</div>
            <div style={{ fontSize:14 }}>No file attached to this report</div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ padding:'10px 14px',background:C.redPale,borderRadius:10,border:`1px solid #FFCDD2`,marginBottom:16 }}>
          <div style={{ fontSize:12,color:C.red,lineHeight:1.5 }}>⚠️ For reference only. Always consult your doctor for medical advice.</div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex',gap:10,marginBottom:10 }}>
          {fileUrl && (
            <a href={fileUrl} download target='_blank' rel='noreferrer' style={{ flex:2,textDecoration:'none' }}>
              <button style={{ ...btn.primary,borderRadius:12 }}>⬇️ Download</button>
            </a>
          )}
          <button onClick={handleShare} style={{ ...btn.secondary,flex:1,borderRadius:12 }}>🔗 Share</button>
        </div>
        <button onClick={handleDelete} disabled={deleting} style={{ ...btn.danger,borderRadius:12,fontSize:13 }}>
          {deleting?'Deleting...':'🗑 Delete Report'}
        </button>
      </div>
    </div>
  );
}

// ── Main Records Screen ───────────────────────────────────────
export default function RecordsScreen({ patientId, patient }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(''),2500); };

  const load = useCallback(async () => {
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    const { data } = await getRecords(patientId);
    setRecords(data);
    setLoading(false);
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const filters = ['All','Lab Report','Imaging','Prescription','Discharge Summary'];
  const filtered = records.filter(r =>
    (filter === 'All' || r.type === filter) &&
    (r.title?.toLowerCase().includes(search.toLowerCase()) ||
     r.doctor?.toLowerCase().includes(search.toLowerCase()) ||
     r.hospital?.toLowerCase().includes(search.toLowerCase()))
  );

  if (showUpload) return <UploadSheet patientId={patientId} onClose={()=>setShowUpload(false)} onDone={(m)=>{ setShowUpload(false); showToast(m); load(); }} />;
  if (selected) return <RecordDetail record={selected} onBack={()=>setSelected(null)} onDelete={()=>{ setSelected(null); load(); showToast('Report deleted'); }} />;

  return (
    <div style={{ background:C.cream,minHeight:'100vh',paddingBottom:90 }}>
      {toast && <div style={{ position:'fixed',bottom:100,left:'50%',transform:'translateX(-50%)',background:C.navy,color:C.white,padding:'10px 20px',borderRadius:12,fontSize:14,fontWeight:600,zIndex:300,whiteSpace:'nowrap' }}>✓ {toast}</div>}

      {/* Header */}
      <div style={{ background:C.navy,padding:'54px 20px 20px' }}>
        <div style={{ fontSize:22,fontWeight:800,color:C.white }}>{patient?.name?.split(' ')[0] || 'My'}'s Health Records</div>
        <div style={{ fontSize:13,color:'rgba(255,255,255,0.5)',marginTop:3 }}>{records.length} document{records.length!==1?'s':''} stored · Encrypted</div>

        {/* Search */}
        <div style={{ marginTop:16,display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,0.1)',borderRadius:12,padding:'10px 14px',border:'1px solid rgba(255,255,255,0.15)' }}>
          <span style={{ fontSize:16 }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search reports, doctors...'
            style={{ flex:1,border:'none',outline:'none',background:'transparent',color:C.white,fontSize:14,fontFamily:'inherit' }} />
        </div>
      </div>

      {/* Upload button */}
      <div style={{ padding:'16px 20px 0' }}>
        <button onClick={()=>setShowUpload(true)} style={{ ...btn.teal,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}>
          <span style={{ fontSize:18 }}>📤</span> Upload New Report
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex',gap:8,padding:'14px 20px 0',overflowX:'auto' }}>
        {filters.map(f => (
          <div key={f} onClick={()=>setFilter(f)} style={{ padding:'7px 14px',borderRadius:20,flexShrink:0,fontSize:13,fontWeight:600,cursor:'pointer',background:filter===f?C.navy:C.white,color:filter===f?C.white:C.textMid,border:`1.5px solid ${filter===f?C.navy:C.border}`,transition:'all 0.15s' }}>{f}</div>
        ))}
      </div>

      {/* List */}
      <div style={{ padding:'14px 20px 0' }}>
        {loading ? (
          <div style={{ textAlign:'center',padding:'50px 0',color:C.textLight }}>
            <div style={{ fontSize:28,marginBottom:10 }}>⏳</div>
            <div>Loading your records...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center',padding:'50px 0',color:C.textLight }}>
            <div style={{ fontSize:48,marginBottom:12 }}>📂</div>
            <div style={{ fontSize:16,fontWeight:700,color:C.text,marginBottom:6 }}>
              {records.length===0?'No reports yet':'No results found'}
            </div>
            <div style={{ fontSize:13 }}>
              {records.length===0?'Upload your first health document to get started':'Try a different search or filter'}
            </div>
          </div>
        ) : (
          filtered.map(record => (
            <div key={record.id} onClick={()=>setSelected(record)} style={{ ...card.base,padding:'14px 16px',marginBottom:12,cursor:'pointer',display:'flex',gap:14,alignItems:'center' }}>
              <div style={{ width:48,height:48,borderRadius:14,background:typeColor[record.type]||C.warm,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0 }}>
                {typeIcon[record.type]||'📄'}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:15,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{record.title}</div>
                <div style={{ fontSize:12,color:C.textMid,marginTop:3 }}>{record.doctor||'—'} · {fmtDate(record.date)}</div>
                <div style={{ fontSize:11,color:C.textLight,marginTop:2 }}>{record.hospital||record.type}</div>
              </div>
              <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,flexShrink:0 }}>
                <span style={{ padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:700,background:record.status==='warning'?C.goldPale:C.greenPale,color:record.status==='warning'?C.gold:C.green }}>
                  {record.status==='warning'?'⚠ Review':'✓ Normal'}
                </span>
                {record.file_url && <span style={{ fontSize:10,color:C.textLight }}>📎 File</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
