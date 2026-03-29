import { useState, useEffect, useCallback } from 'react';
import { C, btn, card } from '../lib/design';
import { requestHomeVisit, getHomeVisits } from '../lib/api';

const SERVICES = [
  { id: 'blood_collection', icon: '🩸', label: 'Lab Sample Collection', desc: 'Trained technician visits home', price: '₹50', eta: 'Same day' },
  { id: 'injection', icon: '💉', label: 'Injection / IV Drip', desc: 'Registered nurse', price: '₹150', eta: '2–4 hrs' },
  { id: 'doctor_visit', icon: '🩺', label: 'Doctor Home Visit', desc: 'General physician', price: '₹300', eta: '3–6 hrs' },
  { id: 'physiotherapy', icon: '🦽', label: 'Physiotherapy', desc: 'Certified therapist', price: '₹400', eta: 'Next day' },
  { id: 'wound_dressing', icon: '🩹', label: 'Wound Dressing', desc: 'Trained nurse', price: '₹200', eta: '2–4 hrs' },
  { id: 'ecg', icon: '❤️', label: 'ECG at Home', desc: 'Technician + report', price: '₹350', eta: 'Same day' },
  { id: 'nursing', icon: '👩‍⚕️', label: 'Nursing Care', desc: 'Post-surgery or illness', price: '₹500', eta: 'Next day' },
  { id: 'elder_care', icon: '👴', label: 'Elder Care', desc: 'Daily care & assistance', price: '₹600', eta: 'Next day' },
];

const STATUS_COLOR = {
  requested: { bg: C.goldPale, color: C.gold, label: '⏳ Requested' },
  confirmed: { bg: C.tealPale, color: C.teal, label: '✓ Confirmed' },
  on_the_way: { bg: C.bluePale, color: C.blue, label: '🚗 On the way' },
  completed: { bg: C.greenPale, color: C.green, label: '✅ Completed' },
  cancelled: { bg: C.warm, color: C.textLight, label: '✕ Cancelled' },
};

function RequestSheet({ service, patientPhone, onClose, onConfirm }) {
  const [address, setAddress] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!address || !time || submitting) return;
    setSubmitting(true);
    await onConfirm({ serviceType: service.label, address, preferredTime: time, notes, phone: patientPhone });
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', maxWidth: 430, margin: '0 auto' }} onClick={onClose}>
      <div style={{ background: C.cream, width: '100%', borderRadius: '22px 22px 0 0', padding: '0 20px 40px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border, margin: '14px auto 16px' }} />

        {/* Service summary */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: C.saffronPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{service.icon}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{service.label}</div>
            <div style={{ fontSize: 13, color: C.textMid, marginTop: 2 }}>{service.desc}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.saffron }}>{service.price}</span>
              <span style={{ fontSize: 12, color: C.textLight }}>· Arrives {service.eta}</span>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: C.border, marginBottom: 16 }} />

        <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>Your Address *</div>
        <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder='House no., Street, Area, Landmark, Mahendragarh...'
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${address ? C.saffron : C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none', height: 80, boxSizing: 'border-box', marginBottom: 14, color: C.text, transition: 'border-color 0.2s' }} />

        <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>Preferred Time *</div>
        <input value={time} onChange={e => setTime(e.target.value)} placeholder='e.g. 10:00 AM, 2:30 PM, Morning...'
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${time ? C.saffron : C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 14, color: C.text }} />

        <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>Additional notes <span style={{ fontWeight: 400, color: C.textLight }}>(optional)</span></div>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder='Any specific requirements or medical information...'
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 20, color: C.text }} />

        <button onClick={submit} style={{ ...btn.primary, opacity: address && time && !submitting ? 1 : 0.4, borderRadius: 14 }}>
          {submitting ? '⏳ Requesting...' : `Request ${service.label} · ${service.price}`}
        </button>
      </div>
    </div>
  );
}

export default function HomeVisitScreen({ patientId, patient }) {
  const [view, setView] = useState('services');
  const [selected, setSelected] = useState(null);
  const [visits, setVisits] = useState([]);
  const [toast, setToast] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const loadVisits = useCallback(async () => {
    if (!patientId) return;
    const { data } = await getHomeVisits(patientId);
    setVisits(data);
  }, [patientId]);

  useEffect(() => { if (view === 'visits') loadVisits(); }, [view, loadVisits]);

  const handleRequest = async (data) => {
    const res = await requestHomeVisit(patientId, data);
    setSelected(null);
    if (res.ok) { showToast('Request sent! We\'ll call you to confirm.'); loadVisits(); }
    else showToast('Request failed. Please try again or call us.');
  };

  return (
    <div style={{ background: C.cream, minHeight: '100vh', paddingBottom: 90 }}>
      {toast && <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: C.navy, color: C.white, padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 300, whiteSpace: 'nowrap' }}>✓ {toast}</div>}
      {selected && <RequestSheet service={selected} patientPhone={patient?.phone} onClose={() => setSelected(null)} onConfirm={handleRequest} />}

      {/* Header */}
      <div style={{ background: C.navy, padding: '54px 20px 20px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Home Services</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>Healthcare at your doorstep in Mahendragarh</div>

        <div style={{ display: 'flex', marginTop: 16, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 }}>
          {[['services', '🏠 Services'], ['visits', '📋 My Requests']].map(([id, label]) => (
            <div key={id} onClick={() => setView(id)} style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, background: view === id ? C.white : 'transparent', color: view === id ? C.text : 'rgba(255,255,255,0.6)', transition: 'all 0.2s' }}>{label}</div>
          ))}
        </div>
      </div>

      {view === 'services' ? (
        <div style={{ padding: '14px 20px 0' }}>
          {/* Trust banner */}
          <div style={{ background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronL})`, borderRadius: 16, padding: '16px 18px', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.white, marginBottom: 4 }}>🚗 Serving Mahendragarh</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, marginBottom: 10 }}>Trained & verified healthcare professionals. All visits confirmed by call.</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['✓ Verified Staff', '✓ Background Checked', '✓ Insured'].map(t => (
                <span key={t} style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.2)', color: C.white, padding: '3px 10px', borderRadius: 20 }}>{t}</span>
              ))}
            </div>
          </div>

          {SERVICES.map(service => (
            <div key={service.id} onClick={() => setSelected(service)} style={{ ...card.base, padding: '14px 16px', marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: C.saffronPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{service.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{service.label}</div>
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{service.desc}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.saffron }}>{service.price}</div>
                <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{service.eta}</div>
              </div>
            </div>
          ))}

          <div style={{ ...card.base, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: C.greenPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📞</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Need help choosing?</div>
              <a href='tel:1800XXXXXXX' style={{ fontSize: 14, color: C.saffron, fontWeight: 700, textDecoration: 'none' }}>Call 1800-XXX-XXXX (Free)</a>
              <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>8 AM – 10 PM, every day</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '14px 20px 0' }}>
          {visits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: C.textLight }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏠</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>No requests yet</div>
              <div style={{ fontSize: 13 }}>Request a home service and track it here</div>
            </div>
          ) : (
            visits.map(v => {
              const st = STATUS_COLOR[v.status] || STATUS_COLOR.requested;
              return (
                <div key={v.id} style={{ ...card.base, padding: '14px 16px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{v.service_type}</div>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: 13, color: C.textMid, marginBottom: 4 }}>📍 {v.address}</div>
                  <div style={{ fontSize: 13, color: C.textMid, marginBottom: v.notes ? 4 : 0 }}>🕐 {v.preferred_time}</div>
                  {v.notes && <div style={{ fontSize: 12, color: C.textLight, fontStyle: 'italic' }}>"{v.notes}"</div>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
