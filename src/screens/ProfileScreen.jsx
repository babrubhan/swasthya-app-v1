import { useState, useEffect } from 'react';
import { C, btn, card } from '../lib/design';
import { supabase } from '../lib/supabase';
import { savePatientProfile } from '../lib/api';
import { session } from '../lib/api';

function EditProfileSheet({ patient, patientId, onClose, onSaved }) {
  const [name, setName] = useState(patient.name || '');
  const [age, setAge] = useState(patient.age ? String(patient.age) : '');
  const [gender, setGender] = useState(patient.gender || '');
  const [blood, setBlood] = useState(patient.blood_group || '');
  const [city, setCity] = useState(patient.city || '');
  const [emergencyContact, setEmergencyContact] = useState(patient.emergency_contact || '');
  const [allergies, setAllergies] = useState(patient.allergies || '');
  const [conditions, setConditions] = useState(patient.conditions || '');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const save = async () => {
    if (!name || saving) return;
    setSaving(true);
    const res = await savePatientProfile(patientId, { name, age, gender, blood, city, emergencyContact, allergies, conditions });
    setSaving(false);
    if (res.ok) {
      session.save(res.patient);
      setToast('Profile updated!');
      setTimeout(() => onSaved(res.patient), 1200);
    } else setToast('Failed to save. Try again.');
  };

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: C.text, marginBottom: 12 };
  const labelStyle = { fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 6, display: 'block' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.cream, zIndex: 200, display: 'flex', flexDirection: 'column', maxWidth: 430, margin: '0 auto', overflowY: 'auto' }}>
      {toast && <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: C.navy, color: C.white, padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 400, whiteSpace: 'nowrap' }}>✓ {toast}</div>}
      <div style={{ background: C.navy, padding: '54px 20px 22px', flexShrink: 0 }}>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.12)', border: 'none', color: C.white, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontFamily: 'inherit' }}>←</button>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Edit Profile</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>Update your health information</div>
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        <label style={labelStyle}>Full Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder='Your full name' style={{ ...inputStyle, border: `1.5px solid ${name ? C.saffron : C.border}` }} />

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Age</label>
            <input value={age} onChange={e => setAge(e.target.value.replace(/\D/g, ''))} placeholder='e.g. 35' maxLength={3} style={{ ...inputStyle, marginBottom: 0 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)} style={{ ...inputStyle, marginBottom: 0, appearance: 'none' }}>
              <option value=''>Select</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12 }} />

        <label style={labelStyle}>Blood Group</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
          {['A+', 'A−', 'B+', 'B−', 'O+', 'O−', 'AB+', 'AB−'].map(b => (
            <div key={b} onClick={() => setBlood(blood === b ? '' : b)} style={{ padding: '9px 0', borderRadius: 10, textAlign: 'center', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${blood === b ? C.saffron : C.border}`, background: blood === b ? C.saffronPale : C.white, color: blood === b ? C.saffron : C.textMid, transition: 'all 0.15s' }}>{b}</div>
          ))}
        </div>

        <label style={labelStyle}>City</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {['Mahendragarh', 'Rewari', 'Narnaul', 'Other'].map(c => (
            <div key={c} onClick={() => setCity(c)} style={{ padding: '8px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600, border: `1.5px solid ${city === c ? C.teal : C.border}`, background: city === c ? C.tealPale : C.white, color: city === c ? C.teal : C.textMid, transition: 'all 0.15s' }}>{c}</div>
          ))}
        </div>

        <label style={labelStyle}>Emergency Contact <span style={{ fontWeight: 400, color: C.textLight }}>(optional)</span></label>
        <input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder='Name & phone of emergency contact' style={inputStyle} />

        <label style={labelStyle}>Known Allergies <span style={{ fontWeight: 400, color: C.textLight }}>(optional)</span></label>
        <input value={allergies} onChange={e => setAllergies(e.target.value)} placeholder='e.g. Penicillin, Sulfa drugs' style={inputStyle} />

        <label style={labelStyle}>Chronic Conditions <span style={{ fontWeight: 400, color: C.textLight }}>(optional)</span></label>
        <input value={conditions} onChange={e => setConditions(e.target.value)} placeholder='e.g. Diabetes, Hypertension' style={inputStyle} />

        <button onClick={save} style={{ ...btn.primary, opacity: name && !saving ? 1 : 0.4, borderRadius: 14 }}>
          {saving ? '⏳ Saving...' : '✓ Save Profile'}
        </button>
      </div>
    </div>
  );
}

export default function ProfileScreen({ patient, patientId, onLogout, onPatientUpdate }) {
  const [stats, setStats] = useState({ records: 0, appointments: 0, prescriptions: 0 });
  const [editOpen, setEditOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    Promise.all([
      supabase.from('records').select('id', { count: 'exact', head: true }).eq('patient_id', patientId),
      supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('patient_id', patientId).eq('status', 'upcoming'),
      supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('patient_id', patientId),
    ]).then(([r, a, p]) => setStats({ records: r.count || 0, appointments: a.count || 0, prescriptions: p.count || 0 }));
  }, [patientId]);

  const name = patient?.name || 'Your Profile';
  const initial = name[0]?.toUpperCase() || '?';
  const meta = [patient?.age ? `Age ${patient.age}` : null, patient?.blood_group || null, patient?.city || null].filter(Boolean).join(' · ');

  if (editOpen) return <EditProfileSheet patient={patient} patientId={patientId} onClose={() => setEditOpen(false)} onSaved={(p) => { setEditOpen(false); onPatientUpdate(p); }} />;

  if (helpOpen) return (
    <div style={{ background: C.cream, minHeight: '100vh', paddingBottom: 90 }}>
      <div style={{ background: C.navy, padding: '54px 20px 22px' }}>
        <button onClick={() => setHelpOpen(false)} style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.12)', border: 'none', color: C.white, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontFamily: 'inherit' }}>←</button>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Help & Support</div>
      </div>
      <div style={{ padding: '16px 20px 0' }}>
        {[
          { icon: '📞', label: 'Call Us (Free)', desc: '1800-XXX-XXXX', sub: '8 AM – 10 PM, every day', href: 'tel:1800XXXXXXX' },
          { icon: '💬', label: 'WhatsApp Support', desc: '+91 98765 00000', sub: 'Usually replies in 30 minutes', href: 'https://wa.me/9876500000' },
          { icon: '📧', label: 'Email Us', desc: 'support@swasthya.in', sub: 'Response within 24 hours', href: 'mailto:support@swasthya.in' },
        ].map(h => (
          <a key={h.label} href={h.href} target='_blank' rel='noreferrer' style={{ textDecoration: 'none' }}>
            <div style={{ ...card.base, padding: '16px 18px', marginBottom: 12, display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: C.tealPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{h.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{h.label}</div>
                <div style={{ fontSize: 14, color: C.saffron, fontWeight: 700, marginTop: 2 }}>{h.desc}</div>
                <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>{h.sub}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );

  const settings = [
    { icon: '👤', bg: C.saffronPale, label: 'Edit Personal Details', desc: meta || 'Add your details', action: () => setEditOpen(true) },
    { icon: '📱', bg: C.tealPale, label: 'Phone Number', desc: patient?.phone ? `+91 ${patient.phone}` : '—' },
    { icon: '🇮🇳', bg: '#EEF2FF', label: 'ABHA Health ID', desc: patient?.abha_id || 'Not linked yet' },
    { icon: '🚨', bg: C.redPale, label: 'Emergency Contact', desc: patient?.emergency_contact || 'Not set', action: () => setEditOpen(true) },
    { icon: '⚕️', bg: C.goldPale, label: 'Allergies & Conditions', desc: patient?.allergies || patient?.conditions || 'Not set', action: () => setEditOpen(true) },
    { icon: '🔔', bg: C.warm, label: 'Notifications', desc: 'Appointment reminders' },
    { icon: '🔒', bg: C.redPale, label: 'Privacy & Security', desc: 'Data and sharing settings' },
    { icon: '📞', bg: C.tealPale, label: 'Help & Support', desc: '1800-XXX-XXXX · Free', action: () => setHelpOpen(true) },
    { icon: '🚪', bg: C.redPale, label: 'Logout', desc: 'Sign out of Swasthya', action: onLogout, danger: true },
  ];

  return (
    <div style={{ background: C.cream, minHeight: '100vh', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '54px 20px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 68, height: 68, borderRadius: 34, background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: C.white, border: '3px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>{initial}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.white }}>{name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{meta || 'Complete your profile'}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: C.teal, color: C.white }}>✓ Registered</span>
            {patient?.city && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.15)', color: C.white }}>{patient.city}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, padding: '16px 20px 0' }}>
        {[
          { num: stats.records, label: 'Reports' },
          { num: stats.appointments, label: 'Appointments' },
          { num: stats.prescriptions, label: 'Prescriptions' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, ...card.base, padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.saffron }}>{s.num}</div>
            <div style={{ fontSize: 11, color: C.textMid, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div style={{ margin: '16px 0 0' }}>
        {settings.map(s => (
          <div key={s.label} onClick={s.action} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: `1px solid ${C.warm}`, cursor: s.action ? 'pointer' : 'default', transition: 'background 0.1s' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: s.danger ? C.red : C.text }}>{s.label}</div>
              <div style={{ fontSize: 12, color: C.textLight, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.desc}</div>
            </div>
            {s.action && <span style={{ fontSize: 18, color: C.textLight, flexShrink: 0 }}>›</span>}
          </div>
        ))}
      </div>

      <div style={{ padding: '20px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: C.textLight }}>Swasthya v1.0 · DPDP Compliant · Made in India 🇮🇳</div>
      </div>
    </div>
  );
}
