import { useState, useEffect, useRef } from 'react';
import { sendOtp, verifyOtp, getOrCreatePatient, savePatientProfile, session } from './lib/api';
import { C, btn } from './lib/design';
import HomeScreen from './screens/HomeScreen';
import RecordsScreen from './screens/RecordsScreen';
import PrescriptionsScreen from './screens/PrescriptionsScreen';
import BookScreen from './screens/BookScreen';
import HomeVisitScreen from './screens/HomeVisitScreen';
import MedicineScreen from './screens/MedicineScreen';
import ProfileScreen from './screens/ProfileScreen';

// ── Nav ──────────────────────────────────────────────────────
const NAV = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'records', icon: '📋', label: 'Records' },
  { id: 'book', icon: '📅', label: 'Book' },
  { id: 'services', icon: '🚗', label: 'Home Visit' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

function NavBar({ tab, setTab }) {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: C.white, borderTop: `1px solid ${C.border}`, display: 'flex', padding: '8px 0 22px', zIndex: 100, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
      {NAV.map(item => (
        <div key={item.id} onClick={() => setTab(item.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', padding: '4px 0' }}>
          <span style={{ fontSize: 22, lineHeight: 1, filter: tab === item.id ? 'none' : 'grayscale(100%) opacity(0.4)' }}>{item.icon}</span>
          <span style={{ fontSize: 10, fontWeight: tab === item.id ? 700 : 500, color: tab === item.id ? C.saffron : C.textLight, letterSpacing: 0.3 }}>{item.label}</span>
          {tab === item.id && <div style={{ width: 5, height: 5, borderRadius: 3, background: C.saffron, marginTop: -2 }} />}
        </div>
      ))}
    </div>
  );
}

// ── Splash ────────────────────────────────────────────────────
function SplashScreen({ onNext }) {
  return (
    <div style={{ background: C.navy, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px 0' }}>
        <div style={{ width: 90, height: 90, borderRadius: 28, background: `linear-gradient(135deg, ${C.saffron}, ${C.saffronL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, marginBottom: 24, boxShadow: '0 12px 40px rgba(232,101,10,0.5)' }}>🏥</div>
        <div style={{ fontSize: 38, fontWeight: 800, color: C.white, letterSpacing: -1, marginBottom: 8 }}>Swasthya</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6, maxWidth: 260 }}>Your complete health companion — records, appointments & home care</div>
      </div>

      <div style={{ padding: '32px 24px 28px' }}>
        {/* Preview */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 18, marginBottom: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
          {[{ icon: '📋', text: 'Store all health reports safely', color: C.tealPale }, { icon: '📅', text: 'Book appointments nearby', color: C.saffronPale }, { icon: '🚗', text: 'Doctor visits at home', color: '#E3F2FD' }].map(r => (
            <div key={r.text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{r.icon}</div>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 20 }}>
          {['✓ ABHA Verified', '✓ DPDP Secure', '✓ Data in India'].map(t => (
            <div key={t} style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{t}</div>
          ))}
        </div>

        <button onClick={onNext} style={{ ...btn.primary, borderRadius: 16, fontSize: 16 }}>Get Started →</button>
        <button onClick={onNext} style={{ ...btn.secondary, borderRadius: 16, marginTop: 10, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>Already have an account? Log in</button>
      </div>
    </div>
  );
}

// ── Phone Screen ──────────────────────────────────────────────
function PhoneScreen({ onNext, onBack }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const valid = phone.length === 10;

  const send = async () => {
    if (!valid || loading) return;
    setLoading(true); setErr('');
    const res = await sendOtp(phone);
    setLoading(false);
    if (res.ok) onNext(phone);
    else setErr('Failed to send OTP. Check your connection.');
  };

  return (
    <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: C.navy, padding: '54px 22px 28px' }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.12)', border: 'none', color: C.white, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontFamily: 'inherit' }}>←</button>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.white, lineHeight: 1.2, marginBottom: 6 }}>Enter your<br />mobile number</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>We'll send a 6-digit OTP to verify you</div>
      </div>
      <div style={{ flex: 1, padding: '36px 22px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>Mobile Number</div>
        <div style={{ display: 'flex', alignItems: 'center', background: C.white, borderRadius: 16, border: `2px solid ${phone.length > 0 ? C.saffron : C.border}`, overflow: 'hidden', boxShadow: phone.length > 0 ? '0 0 0 4px rgba(232,101,10,0.1)' : 'none', transition: 'all 0.2s', marginBottom: 16 }}>
          <div style={{ padding: '16px 14px 16px 18px', background: C.warm, borderRight: `1px solid ${C.border}`, fontSize: 16, fontWeight: 700, color: C.text, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>🇮🇳 +91</div>
          <input type='tel' maxLength={10} placeholder='98765 43210' value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
            style={{ flex: 1, padding: '16px 18px', border: 'none', outline: 'none', fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: 2, background: 'transparent', fontFamily: 'inherit', minWidth: 0 }} />
        </div>
        <div style={{ padding: '12px 14px', background: C.warm, borderRadius: 12, border: `1px solid ${C.border}`, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>🔒 Your number is used <strong>only for login</strong>. Never shared with anyone.</div>
        </div>
        {err && <div style={{ color: C.red, fontSize: 13, marginBottom: 16, padding: '10px 14px', background: C.redPale, borderRadius: 10 }}>⚠️ {err}</div>}
        <div style={{ marginTop: 'auto' }}>
          <button onClick={send} style={{ ...btn.primary, borderRadius: 16, fontSize: 16, opacity: valid && !loading ? 1 : 0.4 }}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: C.textLight }}>New to Swasthya? <span style={{ color: C.saffron, fontWeight: 700 }}>Registration is free</span></div>
        </div>
      </div>
    </div>
  );
}

// ── OTP Screen ────────────────────────────────────────────────
function OtpScreen({ phone, onNext, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const r0 = useRef(); const r1 = useRef(); const r2 = useRef();
  const r3 = useRef(); const r4 = useRef(); const r5 = useRef();
  const refs = [r0, r1, r2, r3, r4, r5];

  useEffect(() => {
    r0.current?.focus();
    const iv = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(iv); setCanResend(true); return 0; } return t - 1; }), 1000);
    return () => clearInterval(iv);
  }, []);

  const onChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next); setError(false);
    if (val && i < 5) refs[i + 1].current?.focus();
  };

  const onKey = (i, e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus(); };

  const verify = async () => {
    const code = otp.join('');
    if (code.length < 6 || verifying) return;
    setVerifying(true);
    const res = await verifyOtp(phone, code);
    setVerifying(false);
    if (res.ok) onNext();
    else { setError(true); setOtp(['', '', '', '', '', '']); setTimeout(() => { setError(false); r0.current?.focus(); }, 600); }
  };

  const resend = async () => { setCanResend(false); setTimer(30); await sendOtp(phone); };

  const filled = otp.every(d => d !== '');

  return (
    <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: C.navy, padding: '54px 22px 28px' }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.12)', border: 'none', color: C.white, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontFamily: 'inherit' }}>←</button>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.white, marginBottom: 6 }}>Enter OTP</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Sent to <strong style={{ color: 'rgba(255,255,255,0.85)' }}>+91 {phone}</strong></div>
      </div>
      <div style={{ flex: 1, padding: '36px 22px' }}>
        <div style={{ textAlign: 'center', fontSize: 14, color: C.textMid, marginBottom: 24 }}>Enter the 6-digit code from the popup</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {otp.map((d, i) => (
            <input key={i} ref={refs[i]} type='tel' maxLength={1} value={d}
              onChange={e => onChange(i, e.target.value)} onKeyDown={e => onKey(i, e)}
              style={{ width: 46, height: 58, borderRadius: 14, textAlign: 'center', fontSize: 26, fontWeight: 800, fontFamily: 'inherit', border: `2px solid ${error ? C.red : d ? C.teal : C.border}`, background: C.white, color: error ? C.red : d ? C.teal : C.text, outline: 'none', boxShadow: error ? '0 0 0 3px rgba(217,48,37,0.12)' : d ? '0 0 0 3px rgba(10,139,122,0.1)' : 'none', transition: 'all 0.15s', animation: error ? 'shake 0.35s ease' : 'none' }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          {!canResend ? (
            <div style={{ fontSize: 13, color: C.textMid, background: C.warm, padding: '4px 14px', borderRadius: 20 }}>Resend in {timer}s</div>
          ) : (
            <button onClick={resend} style={{ fontSize: 13, fontWeight: 700, color: C.saffron, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Resend OTP</button>
          )}
        </div>
        <button onClick={verify} style={{ ...btn.primary, borderRadius: 16, fontSize: 16, opacity: filled && !verifying ? 1 : 0.4 }}>
          {verifying ? 'Verifying...' : 'Verify & Continue'}
        </button>
      </div>
    </div>
  );
}

// ── Setup Screen ──────────────────────────────────────────────
function SetupScreen({ onNext, onBack }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [blood, setBlood] = useState('');
  const [city, setCity] = useState('Mahendragarh');
  const canProceed = name.trim() && gender && city;

  const inputStyle = { width: '100%', padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', color: C.text };

  return (
    <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: C.navy, padding: '54px 22px 22px' }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.12)', border: 'none', color: C.white, fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, fontFamily: 'inherit' }}>←</button>
        <div style={{ fontSize: 26, fontWeight: 800, color: C.white, marginBottom: 4 }}>Tell us about you</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Takes just 30 seconds</div>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= 3 ? C.saffron : 'rgba(255,255,255,0.2)', opacity: i === 3 ? 0.5 : 1 }} />)}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 22px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 7 }}>Full Name *</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder='e.g. Ramesh Kumar'
            style={{ ...inputStyle, border: `1.5px solid ${name ? C.saffron : C.border}` }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 7 }}>Age</div>
            <input value={age} onChange={e => setAge(e.target.value.replace(/\D/g,''))} placeholder='42' maxLength={3} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 7 }}>Gender *</div>
            <select value={gender} onChange={e => setGender(e.target.value)} style={{ ...inputStyle, appearance: 'none', border: `1.5px solid ${gender ? C.saffron : C.border}` }}>
              <option value=''>Select</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 7 }}>Blood Group <span style={{ fontWeight: 400, color: C.textLight }}>(optional)</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {['A+','A−','B+','B−','O+','O−','AB+','AB−'].map(b => (
              <div key={b} onClick={() => setBlood(blood===b?'':b)} style={{ padding: '9px 0', borderRadius: 10, textAlign: 'center', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${blood===b?C.saffron:C.border}`, background: blood===b?C.saffronPale:C.white, color: blood===b?C.saffron:C.textMid, transition: 'all 0.15s' }}>{b}</div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 7 }}>Your City *</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Mahendragarh','Rewari','Narnaul','Other'].map(c => (
              <div key={c} onClick={() => setCity(c)} style={{ padding: '9px 18px', borderRadius: 24, cursor: 'pointer', fontSize: 14, fontWeight: 600, border: `1.5px solid ${city===c?C.teal:C.border}`, background: city===c?C.tealPale:C.white, color: city===c?C.teal:C.textMid, transition: 'all 0.15s' }}>{c}</div>
            ))}
          </div>
        </div>
        <button onClick={() => canProceed && onNext({ name, age, gender, blood, city })} style={{ ...btn.primary, borderRadius: 16, marginTop: 8, opacity: canProceed ? 1 : 0.4 }}>
          Create My Account →
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: C.textLight }}>By continuing you agree to our <span style={{ color: C.saffron, fontWeight: 700 }}>Terms of Service</span></div>
      </div>
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────
function SuccessScreen({ profile, onDone }) {
  return (
    <div style={{ background: C.navy, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px' }}>
      <div style={{ width: 110, height: 110, borderRadius: 55, background: `linear-gradient(135deg, ${C.teal}, ${C.tealL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, marginBottom: 24, boxShadow: '0 16px 48px rgba(10,139,122,0.5)' }}>✓</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.white, textAlign: 'center', marginBottom: 10 }}>You're all set!</div>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6, maxWidth: 270, marginBottom: 32 }}>
        Welcome, <strong style={{ color: C.white }}>{profile?.name?.split(' ')[0]}</strong>. Your Swasthya account is ready.
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {[
          { icon: '📋', bg: 'rgba(10,139,122,0.15)', label: 'Health Records Ready', sub: 'Upload your first report anytime' },
          { icon: '🏥', bg: 'rgba(232,101,10,0.15)', label: `Clinics in ${profile?.city || 'your city'}`, sub: 'Book appointments nearby' },
          { icon: '🔒', bg: 'rgba(255,255,255,0.07)', label: 'Data Secured', sub: 'DPDP compliant · Stored in India' },
        ].map(c => (
          <div key={c.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.white }}>{c.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onDone} style={{ ...btn.primary, background: C.white, color: C.navy, borderRadius: 16, fontSize: 16, boxShadow: '0 6px 24px rgba(0,0,0,0.2)' }}>
        Open Swasthya →
      </button>
    </div>
  );
}

// ── Loading Screen ────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ background: C.navy, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 54, marginBottom: 16 }}>🏥</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Swasthya</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Loading...</div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App() {
  const [flow, setFlow] = useState('loading');
  const [phone, setPhone] = useState('');
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('home');

  useEffect(() => {
    // Load fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    // Shake animation
    const style = document.createElement('style');
    style.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}';
    document.head.appendChild(style);
    // Restore session
    try {
      const saved = session.load();
      if (saved?.id) { setProfile(saved); setFlow('app'); }
      else setFlow('splash');
    } catch { setFlow('splash'); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOtpSuccess = async () => {
    const res = await getOrCreatePatient(phone);
    if (res.ok) {
      setProfile(res.patient);
      if (!res.isNew && res.patient.name) { session.save(res.patient); setFlow('app'); }
      else setFlow('setup');
    }
  };

  const handleSetupDone = async (formData) => {
    if (!profile) return;
    const res = await savePatientProfile(profile.id, formData);
    if (res.ok) { session.save(res.patient); setProfile(res.patient); setFlow('success'); }
  };

  const handleLogout = () => { session.clear(); setProfile(null); setFlow('splash'); };
  const handlePatientUpdate = (p) => { setProfile(p); session.save(p); };

  const appStyle = {
    fontFamily: "'Mukta', 'Noto Sans Devanagari', sans-serif",
    maxWidth: 430,
    margin: '0 auto',
    minHeight: '100vh',
    position: 'relative',
    boxShadow: '0 0 60px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  };

  if (flow === 'loading') return <div style={appStyle}><LoadingScreen /></div>;
  if (flow === 'splash')  return <div style={appStyle}><SplashScreen onNext={() => setFlow('phone')} /></div>;
  if (flow === 'phone')   return <div style={appStyle}><PhoneScreen onNext={p => { setPhone(p); setFlow('otp'); }} onBack={() => setFlow('splash')} /></div>;
  if (flow === 'otp')     return <div style={appStyle}><OtpScreen phone={phone} onNext={handleOtpSuccess} onBack={() => setFlow('phone')} /></div>;
  if (flow === 'setup')   return <div style={appStyle}><SetupScreen onNext={handleSetupDone} onBack={() => setFlow('otp')} /></div>;
  if (flow === 'success') return <div style={appStyle}><SuccessScreen profile={profile} onDone={() => setFlow('app')} /></div>;

  const renderScreen = () => {
    switch (tab) {
      case 'home':          return <HomeScreen patient={profile} setTab={setTab} />;
      case 'records':       return <RecordsScreen patientId={profile?.id} patient={profile} />;
      case 'prescriptions': return <PrescriptionsScreen patientId={profile?.id} />;
      case 'book':          return <BookScreen patientId={profile?.id} />;
      case 'services':      return <HomeVisitScreen patientId={profile?.id} patient={profile} />;
      case 'medicine':      return <MedicineScreen patientId={profile?.id} patient={profile} />;
      case 'profile':       return <ProfileScreen patient={profile} patientId={profile?.id} onLogout={handleLogout} onPatientUpdate={handlePatientUpdate} />;
      default:              return <HomeScreen patient={profile} setTab={setTab} />;
    }
  };

  return (
    <div style={appStyle}>
      {renderScreen()}
      <NavBar tab={tab} setTab={setTab} />
    </div>
  );
}
