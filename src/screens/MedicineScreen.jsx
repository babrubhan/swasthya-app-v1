import { useState } from 'react';
import { C, btn, card } from '../lib/design';
import { supabase } from '../lib/supabase';

export default function MedicineScreen({ patientId, patient }) {
  const [notified, setNotified] = useState(false);
  const [saving, setSaving] = useState(false);

  const joinWaitlist = async () => {
    if (saving) return;
    setSaving(true);
    await supabase.from('waitlist').insert({
      patient_id: patientId || null,
      feature: 'medicine_marketplace',
      phone: patient?.phone || null,
      city: patient?.city || 'Mahendragarh',
    });
    setSaving(false);
    setNotified(true);
  };

  return (
    <div style={{ background: C.cream, minHeight: '100vh', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '54px 20px 28px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Medicine Marketplace</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>Best price. No negotiation. Delivered or pickup.</div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>💊</div>
          <div style={{ display: 'inline-block', background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronL})`, color: C.white, fontSize: 12, fontWeight: 800, padding: '4px 14px', borderRadius: 20, marginBottom: 14, letterSpacing: 1, textTransform: 'uppercase' }}>Coming Soon to Mahendragarh</div>
          <div style={{ fontSize: 21, fontWeight: 800, color: C.text, lineHeight: 1.3, marginBottom: 10 }}>
            Upload prescription.<br />Get the best price.<br />You decide the rest.
          </div>
          <div style={{ fontSize: 14, color: C.textMid, lineHeight: 1.7 }}>
            No more walking shop to shop.<br />No more negotiating prices.<br />Let medical stores compete for your order.
          </div>
        </div>

        {/* How it works */}
        <div style={{ ...card.base, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 14 }}>How it will work</div>
          {[
            { step: '1', icon: '📋', title: 'Upload or type your prescription', desc: 'Photo of handwritten prescription or add medicines manually' },
            { step: '2', icon: '🏪', title: 'Stores get your request', desc: 'All registered medical stores in Mahendragarh receive your medicine list and quote their prices' },
            { step: '3', icon: '⚖️', title: 'You compare prices', desc: 'See total bill from each store. Choose the cheapest, the nearest, or the one that delivers' },
            { step: '4', icon: '✅', title: 'Order confirmed', desc: 'Store prepares your order. Pick it up or get it delivered — your choice' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: 14, marginBottom: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: C.saffron, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: C.white, flexShrink: 0 }}>{s.step}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{s.icon} {s.title}</div>
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 3, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Key benefits */}
        <div style={{ ...card.base, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 12 }}>Why this is different</div>
          {[
            { icon: '💰', text: 'Save 10–30% — stores compete on price so you always get the best deal' },
            { icon: '🕐', text: 'Save time — no more visiting 3 shops to find all medicines' },
            { icon: '✅', text: 'Genuine medicines only — all stores verified by Swasthya' },
            { icon: '🚗', text: 'Delivery or pickup — you decide what works for you' },
            { icon: '📱', text: 'No calls, no negotiation — everything through the app' },
          ].map(b => (
            <div key={b.text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{b.icon}</span>
              <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.5 }}>{b.text}</div>
            </div>
          ))}
        </div>

        {/* Waitlist */}
        <div style={{ ...card.base, padding: '20px', marginBottom: 16 }}>
          {!notified ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 4 }}>Be first when we launch</div>
              <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16, lineHeight: 1.5 }}>
                {patient?.phone ? `We'll notify you on +91 ${patient.phone} as soon as medicine marketplace launches in Mahendragarh.` : 'We\'ll send you a WhatsApp message when we launch.'}
              </div>
              <button onClick={joinWaitlist} style={{ ...btn.primary, borderRadius: 12, opacity: saving ? 0.6 : 1 }}>
                {saving ? '⏳ Saving...' : '🔔 Notify Me at Launch'}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.green, marginBottom: 6 }}>You're on the list!</div>
              <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.5 }}>We'll notify you the moment medicine marketplace launches in Mahendragarh.</div>
            </div>
          )}
        </div>

        {/* Urgent need */}
        <div style={{ ...card.base, padding: '14px 16px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: C.greenPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📞</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Need medicines urgently?</div>
            <a href='tel:01285000000' style={{ fontSize: 13, color: C.saffron, fontWeight: 700, textDecoration: 'none' }}>Call local pharmacy: 01285-XXXXXX</a>
            <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>We'll add their number once partnerships are confirmed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
