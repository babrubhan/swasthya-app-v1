import { useState, useEffect, useCallback } from 'react';
import { C, btn, card } from '../lib/design';
import { supabase } from '../lib/supabase';
import { getPrescriptions, savePrescription } from '../lib/api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const FREQ = ['Once daily', 'Twice daily', 'Thrice daily', 'Every 8 hours', 'Every 12 hours', 'As needed'];
const TIMING = ['Before food', 'After food', 'With food', 'At bedtime', 'Morning', 'Evening'];

// ── Medicine Card ─────────────────────────────────────────────
function MedicineCard({ med, onToggle }) {
  return (
    <div style={{ ...card.base, padding: '14px 16px', marginBottom: 10, display: 'flex', gap: 14, alignItems: 'flex-start', opacity: med.completed ? 0.55 : 1 }}>
      <div onClick={onToggle} style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${med.completed ? C.green : C.border}`, background: med.completed ? C.green : C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
        {med.completed && <span style={{ color: C.white, fontSize: 14, fontWeight: 800 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, textDecoration: med.completed ? 'line-through' : 'none' }}>
          {med.name} {med.dose && <span style={{ fontWeight: 500, color: C.textMid }}>· {med.dose}</span>}
        </div>
        <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>
          {[med.frequency, med.timing, med.duration && `for ${med.duration}`].filter(Boolean).join(' · ')}
        </div>
        {med.instructions && <div style={{ fontSize: 12, color: C.textLight, marginTop: 2, fontStyle: 'italic' }}>{med.instructions}</div>}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: C.goldPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💊</div>
    </div>
  );
}

// ── Add Medicine Form ─────────────────────────────────────────
function AddMedicineForm({ onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState('Twice daily');
  const [timing, setTiming] = useState('After food');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');

  return (
    <div style={{ background: C.warm, borderRadius: 16, padding: 16, border: `1.5px solid ${C.border}`, marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14 }}>Add Medicine</div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder='Medicine name *'
        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${name ? C.saffron : C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 10, color: C.text }} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <input value={dose} onChange={e => setDose(e.target.value)} placeholder='Dose (e.g. 500mg)'
          style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: C.text }} />
        <input value={duration} onChange={e => setDuration(e.target.value)} placeholder='Duration (e.g. 5 days)'
          style={{ flex: 1, padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: C.text }} />
      </div>
      <select value={frequency} onChange={e => setFrequency(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 10, color: C.text }}>
        {FREQ.map(f => <option key={f}>{f}</option>)}
      </select>
      <select value={timing} onChange={e => setTiming(e.target.value)}
        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 10, color: C.text }}>
        {TIMING.map(t => <option key={t}>{t}</option>)}
      </select>
      <input value={instructions} onChange={e => setInstructions(e.target.value)} placeholder='Special instructions (optional)'
        style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 14, color: C.text }} />
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ ...btn.secondary, flex: 1, borderRadius: 10, padding: '11px 0', fontSize: 14 }}>Cancel</button>
        <button onClick={() => { if (!name) return; onAdd({ name, dose, frequency, timing, duration, instructions, completed: false }); }} style={{ ...btn.primary, flex: 2, borderRadius: 10, padding: '11px 0', fontSize: 14, opacity: name ? 1 : 0.4 }}>Add Medicine</button>
      </div>
    </div>
  );
}

// ── Upload Prescription Sheet ─────────────────────────────────
function UploadPrescriptionSheet({ patientId, onClose, onDone }) {
  const [step, setStep] = useState('upload'); // upload | scan | medicines | details
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [doctor, setDoctor] = useState('');
  const [hospital, setHospital] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    setStep('scan');
    setScanning(true);

    // OCR via Google Vision or Anthropic API
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        // Call Anthropic API for OCR
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: f.type, data: base64 } },
                { type: 'text', text: `This is a medical prescription. Extract all medicines and return ONLY a JSON array with no markdown, like:
[{"name":"Medicine Name","dose":"500mg","frequency":"Twice daily","timing":"After food","duration":"5 days","instructions":""}]
If you cannot read any medicine clearly, return [].
Extract only what you can read with reasonable confidence.` }
              ]
            }]
          })
        });
        const data = await res.json();
        const text = data?.content?.[0]?.text || '[]';
        try {
          const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
          setMedicines(parsed.map(m => ({ ...m, completed: false })));
        } catch { setMedicines([]); }
        setScanning(false);
        setStep('medicines');
      };
      reader.readAsDataURL(f);
    } catch {
      setScanning(false);
      setStep('medicines');
    }
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    let fileUrl = null;
    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${patientId}/rx_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('reports').upload(path, file, { contentType: file.type });
      if (!upErr) {
        const { data: pub } = supabase.storage.from('reports').getPublicUrl(path);
        fileUrl = pub?.publicUrl || null;
      }
    }
    const res = await savePrescription(patientId, fileUrl, medicines, { doctor, hospital });
    setSaving(false);
    if (res.ok) onDone('Prescription saved!');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.cream, zIndex: 200, display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ background: C.navy, padding: '54px 20px 22px', flexShrink: 0 }}>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.12)', border: 'none', color: C.white, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontFamily: 'inherit' }}>←</button>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Add Prescription</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
          {step === 'upload' && 'Upload a photo of your prescription'}
          {step === 'scan' && 'Reading your prescription...'}
          {step === 'medicines' && 'Review extracted medicines'}
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px 20px 40px' }}>
        {/* Step: Upload */}
        {step === 'upload' && (
          <>
            {[
              { icon: '📷', label: 'Take Photo', sub: 'Click prescription with camera', accept: 'image/*', capture: 'camera' },
              { icon: '🖼️', label: 'Choose from Gallery', sub: 'Select saved photo', accept: 'image/*', capture: '' },
              { icon: '📄', label: 'Upload PDF', sub: 'Select PDF prescription', accept: 'application/pdf', capture: '' },
            ].map(opt => (
              <label key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: C.white, borderRadius: 16, border: `1.5px solid ${C.border}`, boxShadow: `0 2px 10px ${C.shadow}`, marginBottom: 12, cursor: 'pointer' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: C.goldPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{opt.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{opt.sub}</div>
                </div>
                <span style={{ fontSize: 18, color: C.textLight }}>›</span>
                <input type='file' accept={opt.accept} capture={opt.capture || undefined} style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              </label>
            ))}
            <div style={{ marginTop: 8 }}>
              <button onClick={() => setStep('medicines')} style={{ ...btn.secondary, borderRadius: 12 }}>
                ✏️ Enter medicines manually
              </button>
            </div>
            <div style={{ padding: '12px 14px', background: C.warm, borderRadius: 12, border: `1px solid ${C.border}`, marginTop: 12 }}>
              <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>💡 Our AI reads the prescription and extracts medicine names, doses and timings automatically.</div>
            </div>
          </>
        )}

        {/* Step: Scanning */}
        {step === 'scan' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            {preview && <img src={preview} alt='prescription' style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 12, marginBottom: 24 }} />}
            <div style={{ fontSize: 36, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>Reading prescription...</div>
            <div style={{ fontSize: 13, color: C.textMid }}>Our AI is extracting medicine names and doses</div>
          </div>
        )}

        {/* Step: Medicines */}
        {step === 'medicines' && (
          <>
            {preview && (
              <img src={preview} alt='prescription' style={{ width: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 12, marginBottom: 16 }} />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                {medicines.length > 0 ? `${medicines.length} medicine${medicines.length > 1 ? 's' : ''} found` : 'Add medicines'}
              </div>
              <button onClick={() => setShowAddForm(true)} style={{ fontSize: 13, fontWeight: 700, color: C.saffron, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add</button>
            </div>

            {medicines.length === 0 && !showAddForm && (
              <div style={{ ...card.base, padding: 20, textAlign: 'center', color: C.textMid, marginBottom: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💊</div>
                <div style={{ fontSize: 14 }}>No medicines detected automatically.</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>Tap "+ Add" to enter medicines manually.</div>
              </div>
            )}

            {showAddForm && <AddMedicineForm onCancel={() => setShowAddForm(false)} onAdd={m => { setMedicines(prev => [...prev, m]); setShowAddForm(false); }} />}

            {medicines.map((m, i) => (
              <div key={i} style={{ ...card.base, padding: '12px 14px', marginBottom: 10, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{m.name} {m.dose && `· ${m.dose}`}</div>
                  <div style={{ fontSize: 12, color: C.textMid, marginTop: 3 }}>{[m.frequency, m.timing, m.duration && `for ${m.duration}`].filter(Boolean).join(' · ')}</div>
                  {m.instructions && <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{m.instructions}</div>}
                </div>
                <button onClick={() => setMedicines(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', color: C.textLight, alignSelf: 'flex-start' }}>✕</button>
              </div>
            ))}

            {medicines.length > 0 && (
              <div style={{ marginTop: 4, padding: '10px 14px', background: C.goldPale, borderRadius: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: C.gold, lineHeight: 1.5 }}>⚠️ Please review and correct any errors before saving. AI reading is best-effort.</div>
              </div>
            )}

            {/* Doctor/Hospital */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 7 }}>Doctor <span style={{ fontWeight: 400, color: C.textLight }}>(optional)</span></div>
              <input value={doctor} onChange={e => setDoctor(e.target.value)} placeholder='e.g. Dr. Rajesh Yadav'
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: C.text }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 7 }}>Clinic / Hospital <span style={{ fontWeight: 400, color: C.textLight }}>(optional)</span></div>
              <input value={hospital} onChange={e => setHospital(e.target.value)} placeholder='e.g. General Hospital Mahendragarh'
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: C.text }} />
            </div>

            <button onClick={save} style={{ ...btn.primary, opacity: saving ? 0.6 : 1 }}>
              {saving ? '⏳ Saving...' : '💾 Save Prescription'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Prescription Detail ───────────────────────────────────────
function PrescriptionDetail({ rx, onBack, onUpdate }) {
  const [medicines, setMedicines] = useState(rx.prescription_medicines || []);

  const toggle = async (i) => {
    const updated = medicines.map((m, j) => j === i ? { ...m, completed: !m.completed } : m);
    setMedicines(updated);
    await supabase.from('prescription_medicines').update({ completed: updated[i].completed }).eq('id', medicines[i].id);
  };

  const fileUrl = rx.file_url;

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.cream, zIndex: 200, display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto', overflowY: 'auto' }}>
      <div style={{ background: C.navy, padding: '54px 20px 22px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.12)', border: 'none', color: C.white, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontFamily: 'inherit' }}>←</button>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.white }}>Prescription</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
          {rx.doctor || 'Doctor'} · {fmtDate(rx.date)}
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px 20px 40px' }}>
        {/* Original scan */}
        {fileUrl && (
          <div style={{ ...card.base, padding: 14, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Original Prescription</div>
            {/\.(jpg|jpeg|png|gif|webp)$/.test((fileUrl.split('?')[0] || '').toLowerCase()) ? (
              <img src={fileUrl} alt='prescription' style={{ width: '100%', borderRadius: 10, objectFit: 'contain', maxHeight: 250 }} />
            ) : (
              <a href={fileUrl} target='_blank' rel='noreferrer' style={{ display: 'block', padding: '12px 0', textAlign: 'center', color: C.saffron, fontWeight: 700, textDecoration: 'none' }}>Open Original ↗</a>
            )}
          </div>
        )}

        {/* Medicines */}
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>
          Medicines ({medicines.filter(m => !m.completed).length} remaining)
        </div>
        {medicines.length === 0 ? (
          <div style={{ ...card.base, padding: 20, textAlign: 'center', color: C.textMid }}>No medicines recorded</div>
        ) : (
          medicines.map((m, i) => <MedicineCard key={m.id || i} med={m} onToggle={() => toggle(i)} />)
        )}

        <div style={{ marginTop: 8, padding: '10px 14px', background: C.redPale, borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: C.red }}>⚠️ Always follow your doctor's instructions. AI extraction may have errors.</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Prescriptions Screen ─────────────────────────────────
export default function PrescriptionsScreen({ patientId }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const load = useCallback(async () => {
    if (!patientId) { setLoading(false); return; }
    const { data } = await getPrescriptions(patientId);
    setPrescriptions(data);
    setLoading(false);
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  if (showUpload) return <UploadPrescriptionSheet patientId={patientId} onClose={() => setShowUpload(false)} onDone={m => { setShowUpload(false); showToast(m); load(); }} />;
  if (selected) return <PrescriptionDetail rx={selected} onBack={() => setSelected(null)} onUpdate={load} />;

  return (
    <div style={{ background: C.cream, minHeight: '100vh', paddingBottom: 90 }}>
      {toast && <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: C.navy, color: C.white, padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 300, whiteSpace: 'nowrap' }}>✓ {toast}</div>}

      <div style={{ background: C.navy, padding: '54px 20px 20px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Prescriptions</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>Doctor's prescriptions & medicines</div>
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        <button onClick={() => setShowUpload(true)} style={{ ...btn.primary, borderRadius: 14, marginBottom: 4 }}>
          💊 Add Prescription
        </button>
      </div>

      <div style={{ padding: '14px 20px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: C.textLight }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>Loading...
          </div>
        ) : prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: C.textLight }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💊</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>No prescriptions yet</div>
            <div style={{ fontSize: 13 }}>Upload a prescription photo and we'll read the medicines for you</div>
          </div>
        ) : (
          prescriptions.map(rx => (
            <div key={rx.id} onClick={() => setSelected(rx)} style={{ ...card.base, padding: '14px 16px', marginBottom: 12, cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: C.goldPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>💊</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Dr. {rx.doctor || 'Prescription'}</div>
                <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>{fmtDate(rx.date)} · {rx.prescription_medicines?.length || 0} medicines</div>
                {rx.hospital && <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>{rx.hospital}</div>}
              </div>
              <div style={{ fontSize: 18, color: C.textLight }}>›</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
