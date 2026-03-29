import { useState } from 'react';
import { C, btn, card } from '../lib/design';
import { supabase } from '../lib/supabase';

export default function MedicineScreen({ patientId, patient }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNotify = async () => {
    if (!email || submitting) return;
    setSubmitting(true);
    await supabase.from('waitlist').insert({
      patient_id: patientId || null,
      feature: 'medicine_delivery',
      contact: email,
      phone: patient?.phone || null,
    }).then(() => {});
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div style={{ background: C.cream, minHeight: '100vh', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '54px 20px 28px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Medicine Delivery</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>Order medicines to your door</div>
      </div>

      <div style={{ padding: '32px 24px 0', textAlign: 'center' }}>
        {/* Hero */}
        <div style={{ fontSize: 72, marginBottom: 20 }}>💊</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 10, lineHeight: 1.3 }}>Coming to Mahendragarh Soon</div>
        <div style={{ fontSize: 15, color: C.textMid, lineHeight: 1.7, marginBottom: 32 }}>
          We're partnering with local pharmacies in Mahendragarh to bring medicines to your door. Be the first to know when we launch.
        </div>

        {/* Features preview */}
        <div style={{ textAlign: 'left', marginBottom: 32 }}>
          {[
            { icon: '📋', label: 'Order from prescription', desc: 'Upload prescription, we prepare the order' },
            { icon: '🚗', label: 'Fast delivery', desc: 'Delivered within 2 hours in Mahendragarh' },
            { icon: '✅', label: 'Genuine medicines', desc: 'Only verified local pharmacies' },
            { icon: '💰', label: 'No extra charge', desc: 'MRP price, no delivery fee for first order' },
          ].map(f => (
            <div key={f.label} style={{ ...card.base, padding: '14px 16px', marginBottom: 10, display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{f.label}</div>
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Notify form */}
        {!submitted ? (
          <div style={{ ...card.base, padding: '20px 18px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>Get notified when we launch</div>
            <div style={{ fontSize: 13, color: C.textMid, marginBottom: 14 }}>We'll send you a WhatsApp message on {patient?.phone ? `+91 ${patient.phone}` : 'your number'}</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder='Your email (optional)' type='email'
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 12, color: C.text }} />
            <button onClick={handleNotify} style={{ ...btn.primary, borderRadius: 12, opacity: submitting ? 0.6 : 1 }}>
              {submitting ? '⏳ Saving...' : '🔔 Notify Me at Launch'}
            </button>
          </div>
        ) : (
          <div style={{ ...card.base, padding: '24px 20px', background: C.greenPale, border: `1px solid ${C.green}20` }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.green, marginBottom: 6 }}>You're on the list!</div>
            <div style={{ fontSize: 13, color: C.textMid }}>We'll notify you as soon as medicine delivery launches in Mahendragarh.</div>
          </div>
        )}

        <div style={{ marginTop: 24, padding: '14px 16px', background: C.warm, borderRadius: 14, textAlign: 'left' }}>
          <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>
            📞 Need medicines urgently? Call your local pharmacy:<br />
            <a href='tel:01285-000000' style={{ color: C.saffron, fontWeight: 700, textDecoration: 'none' }}>Mahendragarh Pharmacy — 01285-XXXXXX</a>
          </div>
        </div>
      </div>
    </div>
  );
}
