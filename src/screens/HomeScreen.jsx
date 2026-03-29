import { C } from '../lib/design';

const ACTIONS = [
  { icon: '📋', label: 'My Reports', sub: 'View & upload', tab: 'records', bg: `linear-gradient(135deg, #0A8B7A, #12B09C)`, shadow: 'rgba(10,139,122,0.35)' },
  { icon: '📅', label: 'Book Appointment', sub: 'Clinics & labs nearby', tab: 'book', bg: `linear-gradient(135deg, #E8650A, #FF8534)`, shadow: 'rgba(232,101,10,0.35)' },
  { icon: '💊', label: 'Prescriptions', sub: 'Medicines & doses', tab: 'prescriptions', bg: `linear-gradient(135deg, #B8860B, #D4A017)`, shadow: 'rgba(184,134,11,0.35)' },
  { icon: '🚗', label: 'Home Visit', sub: 'Doctor comes to you', tab: 'services', bg: `linear-gradient(135deg, #1565C0, #2979FF)`, shadow: 'rgba(21,101,192,0.35)' },
];

export default function HomeScreen({ patient, setTab }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = patient?.name?.split(' ')[0] || 'there';

  return (
    <div style={{ background: '#F5F0EA', minHeight: '100vh', paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: '54px 22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 3, color: C.saffronL, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Swasthya</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.white, lineHeight: 1.2 }}>{greeting}, {firstName} 👋</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>📍 {patient?.city || 'Mahendragarh'}, Haryana</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 21, background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: C.white }}>
            {(patient?.name?.[0] || '?').toUpperCase()}
          </div>
        </div>
      </div>

      {/* 2×2 Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '20px 20px 0' }}>
        {ACTIONS.map(action => (
          <div key={action.tab} onClick={() => setTab(action.tab)} style={{ background: action.bg, borderRadius: 20, padding: '20px 16px 18px', cursor: 'pointer', boxShadow: `0 8px 24px ${action.shadow}`, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 125, position: 'relative', overflow: 'hidden', transition: 'transform 0.15s' }}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ fontSize: 34, lineHeight: 1 }}>{action.icon}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.white, lineHeight: 1.2 }}>{action.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>{action.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Medicine coming soon tile */}
      <div style={{ padding: '14px 20px 0' }}>
        <div onClick={() => setTab('medicine')} style={{ background: `linear-gradient(135deg, #2E7D52, #43A570)`, borderRadius: 16, padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 6px 20px rgba(46,125,82,0.3)' }}>
          <div style={{ fontSize: 28 }}>💊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.white }}>Medicine Delivery</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Coming soon to Mahendragarh · Join waitlist</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.2)', color: C.white, padding: '4px 10px', borderRadius: 20 }}>Soon</span>
        </div>
      </div>

      {/* Helpline */}
      <div style={{ margin: '14px 20px 0', background: C.white, borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, border: `1px solid #E8E2D8`, boxShadow: '0 2px 10px rgba(15,29,53,0.06)' }}>
        <div style={{ width: 46, height: 46, borderRadius: 23, background: '#EAF7EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📞</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Need help?</div>
          <a href='tel:1800XXXXXXX' style={{ fontSize: 14, color: C.saffron, fontWeight: 700, textDecoration: 'none' }}>Call 1800-XXX-XXXX (Free)</a>
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>8 AM – 10 PM, every day</div>
        </div>
      </div>
    </div>
  );
}
