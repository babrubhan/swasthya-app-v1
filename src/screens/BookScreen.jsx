import { useState, useEffect, useCallback } from 'react';
import { C, btn, card } from '../lib/design';
import { supabase } from '../lib/supabase';
import { getAppointments, bookAppointment, cancelAppointment } from '../lib/api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '—';
const daysUntil = (d) => {
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  if (diff < 0) return 'Past'; if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow'; return `In ${diff} days`;
};

const TYPE_ICON = { 'Government Hospital': '🏛️', 'Diagnostic Lab': '🔬', 'Pathology Lab': '🧪', 'General Physician': '👨‍⚕️', 'Multi-specialty Hospital': '🏥', 'Dentist': '🦷', 'Eye Clinic': '👁️', 'Physiotherapy': '🦽' };
const TYPE_COLOR = { 'Government Hospital': C.bluePale, 'Diagnostic Lab': C.tealPale, 'Pathology Lab': C.tealPale, 'General Physician': C.saffronPale, 'Multi-specialty Hospital': C.bluePale };

// ── Booking Sheet ─────────────────────────────────────────────
function BookingSheet({ clinic, onClose, onConfirm }) {
  const [slot, setSlot] = useState('');
  const [service, setService] = useState(clinic.services?.[0] || '');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [booking, setBooking] = useState(false);

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:300,display:'flex',alignItems:'flex-end',maxWidth:430,margin:'0 auto' }} onClick={onClose}>
      <div style={{ background:C.cream,width:'100%',borderRadius:'22px 22px 0 0',maxHeight:'92vh',overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
        <div style={{ width:40,height:4,borderRadius:2,background:C.border,margin:'14px auto 0' }} />
        <div style={{ padding:'14px 20px 0' }}>
          <div style={{ fontSize:18,fontWeight:800,color:C.text }}>{clinic.name}</div>
          <div style={{ fontSize:13,color:C.textMid,marginTop:3 }}>📍 {clinic.address}</div>
          {clinic.phone && (
            <a href={`tel:${clinic.phone}`} style={{ display:'inline-flex',alignItems:'center',gap:6,marginTop:8,padding:'6px 14px',background:C.greenPale,borderRadius:20,textDecoration:'none' }}>
              <span>📞</span><span style={{ fontSize:13,fontWeight:700,color:C.green }}>{clinic.phone}</span>
            </a>
          )}
        </div>
        <div style={{ height:1,background:C.border,margin:'14px 0' }} />
        <div style={{ padding:'0 20px 36px' }}>
          <div style={{ fontSize:13,fontWeight:700,color:C.textMid,marginBottom:8 }}>Service</div>
          <select value={service} onChange={e=>setService(e.target.value)} style={{ width:'100%',padding:'12px 14px',borderRadius:12,border:`1.5px solid ${C.border}`,background:C.white,fontSize:14,fontFamily:'inherit',outline:'none',marginBottom:14,color:C.text }}>
            {(clinic.services||[]).map(s=><option key={s}>{s}</option>)}
          </select>
          <div style={{ fontSize:13,fontWeight:700,color:C.textMid,marginBottom:8 }}>Date</div>
          <input type='date' value={date} onChange={e=>setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
            style={{ width:'100%',padding:'12px 14px',borderRadius:12,border:`1.5px solid ${C.border}`,background:C.white,fontSize:14,fontFamily:'inherit',outline:'none',marginBottom:14,color:C.text,boxSizing:'border-box' }} />
          {(clinic.slots||[]).length > 0 && <>
            <div style={{ fontSize:13,fontWeight:700,color:C.textMid,marginBottom:10 }}>Time Slot</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:14 }}>
              {clinic.slots.map(s=>(
                <div key={s} onClick={()=>setSlot(s)} style={{ padding:'10px 0',borderRadius:10,textAlign:'center',fontSize:13,fontWeight:600,cursor:'pointer',border:`1.5px solid ${slot===s?C.saffron:C.border}`,background:slot===s?C.saffronPale:C.white,color:slot===s?C.saffron:C.textMid,transition:'all 0.15s' }}>{s}</div>
              ))}
            </div>
          </>}
          <div style={{ fontSize:13,fontWeight:700,color:C.textMid,marginBottom:8 }}>Note for doctor <span style={{ fontWeight:400,color:C.textLight }}>(optional)</span></div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder='Symptoms or reason for visit...'
            style={{ width:'100%',padding:'12px 14px',borderRadius:12,border:`1.5px solid ${C.border}`,background:C.white,fontSize:14,fontFamily:'inherit',outline:'none',resize:'none',height:72,boxSizing:'border-box',marginBottom:16,color:C.text }} />
          <button onClick={async()=>{
            if (booking) return;
            setBooking(true);
            await onConfirm({ clinicName:clinic.name, clinicPhone:clinic.phone, clinicAddress:clinic.address, clinicId:clinic.id, service, date, slot:slot||'Walk-in', note });
            setBooking(false);
          }} style={{ ...btn.primary,borderRadius:14,opacity:booking?0.6:1 }}>
            {booking?'Booking...':'Confirm Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Provider Detail Screen ────────────────────────────────────
function ProviderDetail({ clinic, onBack, onBook }) {
  const isBookable = clinic.online_booking !== false;
  const services = clinic.services || [];
  const prices = clinic.service_prices || {};
  const doctors = clinic.doctors || [];

  return (
    <div style={{ background:C.cream,minHeight:'100vh',paddingBottom:90 }}>
      {/* Header */}
      <div style={{ background:C.navy,padding:'54px 20px 24px' }}>
        <button onClick={onBack} style={{ width:36,height:36,borderRadius:18,background:'rgba(255,255,255,0.12)',border:'none',color:C.white,fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16,fontFamily:'inherit' }}>←</button>
        <div style={{ display:'flex',gap:14,alignItems:'center' }}>
          <div style={{ width:54,height:54,borderRadius:16,background:TYPE_COLOR[clinic.type]||C.tealPale,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0 }}>
            {TYPE_ICON[clinic.type]||'🏥'}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:19,fontWeight:800,color:C.white,lineHeight:1.2 }}>{clinic.name}</div>
            <div style={{ fontSize:13,color:'rgba(255,255,255,0.6)',marginTop:3 }}>{clinic.type}</div>
          </div>
          {clinic.verified && <span style={{ fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:C.teal,color:C.white }}>✓ Verified</span>}
        </div>
      </div>

      <div style={{ padding:'16px 20px 0' }}>
        {/* Quick info */}
        <div style={{ ...card.base,padding:'16px',marginBottom:14 }}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
            {[
              { icon:'📍', label:'Address', val:clinic.address },
              { icon:'🕐', label:'Hours', val:clinic.open_time||'—' },
              { icon:'⭐', label:'Rating', val:clinic.rating?`${clinic.rating} (${clinic.reviews||0} reviews)`:'No ratings yet' },
              { icon:'📏', label:'Distance', val:clinic.distance_km?`${clinic.distance_km} km away`:'—' },
            ].map(r=>(
              <div key={r.label}>
                <div style={{ fontSize:11,fontWeight:700,color:C.textLight,textTransform:'uppercase',letterSpacing:0.5,marginBottom:3 }}>{r.icon} {r.label}</div>
                <div style={{ fontSize:13,fontWeight:600,color:C.text,lineHeight:1.4 }}>{r.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Call + Book actions */}
        <div style={{ display:'flex',gap:10,marginBottom:14 }}>
          {clinic.phone && (
            <a href={`tel:${clinic.phone}`} style={{ flex:1,textDecoration:'none' }}>
              <button style={{ ...btn.secondary,borderRadius:12,padding:'12px 0',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>📞 Call Now</button>
            </a>
          )}
          {isBookable ? (
            <button onClick={()=>onBook(clinic)} style={{ ...btn.primary,flex:2,borderRadius:12,padding:'12px 0' }}>📅 Book Appointment</button>
          ) : (
            <div style={{ flex:2,padding:'12px 0',borderRadius:12,background:C.warm,border:`1px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
              <span style={{ fontSize:13,color:C.textMid,fontWeight:600 }}>📞 Call to Book</span>
            </div>
          )}
          <button onClick={()=>{
            const addr = encodeURIComponent((clinic.name||'')+ ' ' +(clinic.address||'')+' Haryana India');
            window.open(`https://maps.google.com/?q=${addr}`,'_blank');
          }} style={{ ...btn.secondary,width:48,padding:'12px 0',borderRadius:12,flexShrink:0 }}>🗺️</button>
        </div>

        {!isBookable && (
          <div style={{ padding:'10px 14px',background:C.goldPale,borderRadius:10,border:`1px solid ${C.gold}30`,marginBottom:14 }}>
            <div style={{ fontSize:13,color:C.gold,fontWeight:600 }}>⚠️ Online booking not available — call to schedule or walk in directly.</div>
          </div>
        )}

        {/* Home service */}
        {clinic.home_service && (
          <div style={{ padding:'12px 14px',background:C.tealPale,borderRadius:12,border:`1px solid ${C.teal}30`,marginBottom:14,display:'flex',gap:10,alignItems:'center' }}>
            <span style={{ fontSize:20 }}>🚗</span>
            <div style={{ fontSize:13,color:C.teal,fontWeight:600 }}>Home service available — technician or doctor can visit your home</div>
          </div>
        )}

        {/* Services & Prices */}
        {services.length > 0 && (
          <div style={{ ...card.base,padding:'16px',marginBottom:14 }}>
            <div style={{ fontSize:14,fontWeight:800,color:C.text,marginBottom:12 }}>Services & Prices</div>
            {services.map(service => (
              <div key={service} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:`1px solid ${C.warm}` }}>
                <div style={{ fontSize:14,color:C.text }}>{service}</div>
                <div style={{ fontSize:13,fontWeight:700,color:prices[service]?C.saffron:C.textLight }}>
                  {prices[service] || 'Call for price'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Doctors */}
        {doctors.length > 0 && (
          <div style={{ ...card.base,padding:'16px',marginBottom:14 }}>
            <div style={{ fontSize:14,fontWeight:800,color:C.text,marginBottom:12 }}>Doctors</div>
            {doctors.map((doc,i) => (
              <div key={i} style={{ display:'flex',gap:12,alignItems:'center',padding:'10px 0',borderBottom:i<doctors.length-1?`1px solid ${C.warm}`:'none' }}>
                <div style={{ width:44,height:44,borderRadius:22,background:C.navyMid,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:C.white,flexShrink:0 }}>👨‍⚕️</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:C.text }}>{doc.name}</div>
                  <div style={{ fontSize:12,color:C.textMid,marginTop:2 }}>{doc.specialty}</div>
                  {doc.availability && <div style={{ fontSize:11,color:doc.available?C.green:C.textLight,marginTop:2,fontWeight:600 }}>{doc.available?'✓ Available today':'Away today'} · {doc.availability}</div>}
                </div>
                {doc.fee && <div style={{ fontSize:14,fontWeight:700,color:C.saffron,flexShrink:0 }}>{doc.fee}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Accepted insurance */}
        {clinic.accepts_ab && (
          <div style={{ padding:'12px 14px',background:'#E8F5E9',borderRadius:12,border:'1px solid #A5D6A7',marginBottom:14,display:'flex',gap:10,alignItems:'center' }}>
            <span style={{ fontSize:20 }}>🇮🇳</span>
            <div style={{ fontSize:13,color:'#2E7D32',fontWeight:600 }}>Ayushman Bharat (AB-PMJAY) accepted here</div>
          </div>
        )}

        {/* Available slot preview */}
        {(clinic.slots||[]).length > 0 && (
          <div style={{ ...card.base,padding:'16px',marginBottom:14 }}>
            <div style={{ fontSize:14,fontWeight:800,color:C.text,marginBottom:10 }}>Today's Available Slots</div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
              {clinic.slots.slice(0,6).map(s=>(
                <div key={s} style={{ padding:'7px 14px',borderRadius:20,background:C.tealPale,color:C.teal,fontSize:13,fontWeight:600 }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* Footer note */}
        <div style={{ padding:'10px 14px',background:C.warm,borderRadius:10,marginBottom:4 }}>
          <div style={{ fontSize:12,color:C.textMid,lineHeight:1.6 }}>ℹ️ Information is updated by the provider. Always call to confirm availability before visiting.</div>
        </div>
      </div>
    </div>
  );
}

// ── Provider Card (list view) ─────────────────────────────────
function ProviderCard({ clinic, onView, onBook }) {
  const isBookable = clinic.online_booking !== false;
  return (
    <div style={{ ...card.base,padding:'16px',marginBottom:12 }}>
      <div style={{ display:'flex',gap:12,alignItems:'flex-start',marginBottom:10 }} onClick={()=>onView(clinic)} style2={{ cursor:'pointer' }}>
        <div style={{ width:50,height:50,borderRadius:14,background:TYPE_COLOR[clinic.type]||C.warm,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0,cursor:'pointer' }} onClick={()=>onView(clinic)}>
          {TYPE_ICON[clinic.type]||'🏥'}
        </div>
        <div style={{ flex:1,minWidth:0,cursor:'pointer' }} onClick={()=>onView(clinic)}>
          <div style={{ display:'flex',alignItems:'center',gap:6,flexWrap:'wrap' }}>
            <div style={{ fontSize:15,fontWeight:700,color:C.text }}>{clinic.name}</div>
            {clinic.verified && <span style={{ fontSize:12 }}>✅</span>}
            {!isBookable && <span style={{ fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:10,background:C.goldPale,color:C.gold }}>Walk-in / Call</span>}
          </div>
          <div style={{ fontSize:12,color:C.teal,fontWeight:600,marginTop:2 }}>{clinic.type}</div>
          <div style={{ fontSize:12,color:C.textMid,marginTop:2 }}>📍 {clinic.address}{clinic.distance_km?` · ${clinic.distance_km}km`:''}</div>
        </div>
        <div style={{ textAlign:'right',flexShrink:0,cursor:'pointer' }} onClick={()=>onView(clinic)}>
          {clinic.rating && <div style={{ fontSize:14,fontWeight:800,color:'#B8860B' }}>★ {clinic.rating}</div>}
          <div style={{ fontSize:10,color:C.textLight,marginTop:1 }}>{clinic.reviews||0} reviews</div>
        </div>
      </div>

      {/* Tags row */}
      <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:10 }}>
        {clinic.open_time && <span style={{ fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,background:C.warm,color:C.textMid }}>🕐 {clinic.open_time}</span>}
        {clinic.home_service && <span style={{ fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,background:C.tealPale,color:C.teal }}>🚗 Home Service</span>}
        {clinic.accepts_ab && <span style={{ fontSize:11,fontWeight:600,padding:'3px 9px',borderRadius:20,background:'#E8F5E9',color:'#2E7D32' }}>🇮🇳 AB-PMJAY</span>}
      </div>

      {/* Services preview */}
      <div style={{ display:'flex',flexWrap:'wrap',gap:6,marginBottom:12 }}>
        {(clinic.services||[]).slice(0,3).map(s=>(
          <span key={s} style={{ fontSize:11,padding:'3px 9px',borderRadius:20,background:C.warm,color:C.textMid }}>{s}</span>
        ))}
        {(clinic.services||[]).length>3 && <span onClick={()=>onView(clinic)} style={{ fontSize:11,padding:'3px 9px',borderRadius:20,background:C.warm,color:C.saffron,fontWeight:600,cursor:'pointer' }}>+{clinic.services.length-3} more →</span>}
      </div>

      {/* Action buttons */}
      <div style={{ display:'flex',gap:8 }}>
        <button onClick={()=>onView(clinic)} style={{ ...btn.secondary,flex:1,borderRadius:12,padding:'10px 0',fontSize:13 }}>View Details</button>
        {clinic.phone && (
          <a href={`tel:${clinic.phone}`} style={{ flex:1,textDecoration:'none' }}>
            <button style={{ ...btn.secondary,borderRadius:12,padding:'10px 0',fontSize:13,width:'100%' }}>📞 Call</button>
          </a>
        )}
        {isBookable && (
          <button onClick={()=>onBook(clinic)} style={{ ...btn.primary,flex:2,borderRadius:12,padding:'10px 0',fontSize:13 }}>📅 Book</button>
        )}
      </div>
    </div>
  );
}

// ── Appointment Card ──────────────────────────────────────────
function AppointmentCard({ appt, onCancel }) {
  const upcoming = appt.status === 'upcoming';
  const cancelled = appt.status === 'cancelled';
  return (
    <div style={{ ...card.base,padding:'14px 16px',marginBottom:12,opacity:cancelled?0.6:1 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
        <div>
          <div style={{ fontSize:15,fontWeight:700,color:C.text }}>{appt.clinic_name||appt.doctor}</div>
          <div style={{ fontSize:13,color:C.textMid,marginTop:2 }}>{appt.specialty}</div>
        </div>
        <span style={{ padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:cancelled?C.warm:upcoming?C.tealPale:C.greenPale,color:cancelled?C.textLight:upcoming?C.teal:C.green }}>
          {cancelled?'Cancelled':upcoming?daysUntil(appt.date):'Done'}
        </span>
      </div>
      <div style={{ display:'flex',gap:14,marginBottom:appt.clinic_address||appt.note?8:0 }}>
        <div style={{ fontSize:13,color:C.textMid }}>📅 {fmtDate(appt.date)}</div>
        <div style={{ fontSize:13,color:C.textMid }}>🕐 {appt.time}</div>
      </div>
      {appt.clinic_address && <div style={{ fontSize:13,color:C.textMid,marginBottom:4 }}>📍 {appt.clinic_address}</div>}
      {appt.note && <div style={{ fontSize:12,color:C.textLight,fontStyle:'italic',marginBottom:8 }}>"{appt.note}"</div>}
      {upcoming && (
        <div style={{ display:'flex',gap:8,marginTop:8 }}>
          {appt.clinic_phone && <a href={`tel:${appt.clinic_phone}`} style={{ flex:1,textDecoration:'none' }}><button style={{ ...btn.secondary,borderRadius:12,padding:'9px 0',fontSize:13,width:'100%' }}>📞 Call</button></a>}
          <button onClick={()=>{const a=encodeURIComponent((appt.clinic_name||'')+' '+(appt.clinic_address||'')+' Haryana India');window.open(`https://maps.google.com/?q=${a}`,'_blank');}} style={{ ...btn.secondary,flex:1,borderRadius:12,padding:'9px 0',fontSize:13 }}>🗺️ Directions</button>
          <button onClick={()=>onCancel(appt.id)} style={{ flex:1,border:`1.5px solid ${C.red}`,borderRadius:12,padding:'9px 0',fontSize:13,fontWeight:600,background:'transparent',color:C.red,cursor:'pointer',fontFamily:'inherit' }}>✕ Cancel</button>
        </div>
      )}
    </div>
  );
}

// ── Main Book Screen ──────────────────────────────────────────
export default function BookScreen({ patientId }) {
  const [view, setView] = useState('directory');
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('Mahendragarh');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = m => { setToast(m); setTimeout(()=>setToast(''),2500); };

  const loadClinics = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('clinics').select('*').eq('active', true).order('rating', { ascending: false });
    if (cityFilter !== 'All') q = q.eq('city', cityFilter);
    const { data } = await q;
    setClinics(data || []);
    setLoading(false);
  }, [cityFilter]);

  const loadAppointments = useCallback(async () => {
    if (!patientId) return;
    const { data } = await getAppointments(patientId);
    setAppointments(data);
  }, [patientId]);

  useEffect(() => { loadClinics(); }, [loadClinics]);
  useEffect(() => { if (view === 'appointments') loadAppointments(); }, [view, loadAppointments]);

  const handleBook = async (apptData) => {
    const res = await bookAppointment(patientId, apptData);
    setBooking(null);
    if (res.ok) { showToast('Appointment booked!'); loadAppointments(); }
    else showToast('Booking failed. Try again.');
  };

  const handleCancel = async id => {
    if (!window.confirm('Cancel this appointment?')) return;
    const { ok } = await cancelAppointment(id);
    if (ok) { loadAppointments(); showToast('Cancelled'); }
  };

  const types = ['All','Government Hospital','Diagnostic Lab','Pathology Lab','General Physician','Multi-specialty Hospital'];
  const filtered = clinics.filter(c =>
    (typeFilter === 'All' || c.type === typeFilter) &&
    (c.name?.toLowerCase().includes(search.toLowerCase()) ||
     c.address?.toLowerCase().includes(search.toLowerCase()) ||
     (c.services||[]).some(s=>s.toLowerCase().includes(search.toLowerCase())))
  );

  // Show provider detail
  if (selected) return <ProviderDetail clinic={selected} onBack={()=>setSelected(null)} onBook={c=>{setSelected(null);setBooking(c);}} />;

  return (
    <div style={{ background:C.cream,minHeight:'100vh',paddingBottom:90 }}>
      {toast && <div style={{ position:'fixed',bottom:100,left:'50%',transform:'translateX(-50%)',background:C.navy,color:C.white,padding:'10px 20px',borderRadius:12,fontSize:14,fontWeight:600,zIndex:300,whiteSpace:'nowrap' }}>✓ {toast}</div>}
      {booking && <BookingSheet clinic={booking} onClose={()=>setBooking(null)} onConfirm={handleBook} />}

      {/* Header */}
      <div style={{ background:C.navy,padding:'54px 20px 20px' }}>
        <div style={{ fontSize:22,fontWeight:800,color:C.white }}>Healthcare Near You</div>
        <div style={{ fontSize:13,color:'rgba(255,255,255,0.5)',marginTop:3 }}>Clinics, hospitals, labs & doctors in Mahendragarh, Rewari & Narnaul</div>
        <div style={{ display:'flex',marginTop:14,background:'rgba(255,255,255,0.08)',borderRadius:12,padding:4 }}>
          {[['directory','🏥 Directory'],['appointments','📅 My Appointments']].map(([id,label])=>(
            <div key={id} onClick={()=>setView(id)} style={{ flex:1,textAlign:'center',padding:'9px 0',borderRadius:10,cursor:'pointer',fontSize:13,fontWeight:700,background:view===id?C.white:'transparent',color:view===id?C.text:'rgba(255,255,255,0.6)',transition:'all 0.2s' }}>{label}</div>
          ))}
        </div>
      </div>

      {view === 'directory' ? (
        <>
          {/* Search */}
          <div style={{ padding:'12px 20px 0' }}>
            <div style={{ display:'flex',alignItems:'center',gap:10,background:C.white,borderRadius:12,padding:'11px 14px',border:`1.5px solid ${C.border}` }}>
              <span>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Search clinics, services, doctors...'
                style={{ flex:1,border:'none',outline:'none',fontSize:14,fontFamily:'inherit',color:C.text,background:'transparent' }} />
              {search && <button onClick={()=>setSearch('')} style={{ background:'none',border:'none',cursor:'pointer',color:C.textLight,fontSize:16 }}>✕</button>}
            </div>
          </div>

          {/* City filter */}
          <div style={{ display:'flex',gap:8,padding:'10px 20px 0',overflowX:'auto' }}>
            {['All','Mahendragarh','Rewari','Narnaul'].map(c=>(
              <div key={c} onClick={()=>setCityFilter(c)} style={{ padding:'7px 14px',borderRadius:20,flexShrink:0,fontSize:13,fontWeight:600,cursor:'pointer',background:cityFilter===c?C.saffron:C.white,color:cityFilter===c?C.white:C.textMid,border:`1.5px solid ${cityFilter===c?C.saffron:C.border}`,transition:'all 0.15s' }}>
                {c==='All'?'📍 All Cities':c}
              </div>
            ))}
          </div>

          {/* Type filter */}
          <div style={{ display:'flex',gap:8,padding:'8px 20px 0',overflowX:'auto' }}>
            {types.map(t=>(
              <div key={t} onClick={()=>setTypeFilter(t)} style={{ padding:'6px 12px',borderRadius:20,flexShrink:0,fontSize:12,fontWeight:600,cursor:'pointer',background:typeFilter===t?C.navy:C.white,color:typeFilter===t?C.white:C.textMid,border:`1.5px solid ${typeFilter===t?C.navy:C.border}`,transition:'all 0.15s' }}>{t}</div>
            ))}
          </div>

          <div style={{ padding:'4px 20px 0',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <div style={{ fontSize:13,color:C.textMid,paddingTop:10 }}>{loading?'Loading...':filtered.length===0?'No results':''+filtered.length+' providers found'}</div>
          </div>

          <div style={{ padding:'8px 20px 0' }}>
            {loading ? (
              <div style={{ textAlign:'center',padding:'50px 0',color:C.textLight }}><div style={{ fontSize:28,marginBottom:10 }}>⏳</div>Loading providers...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:'center',padding:'50px 0',color:C.textLight }}>
                <div style={{ fontSize:36,marginBottom:10 }}>🏥</div>
                <div style={{ fontSize:16,fontWeight:700,color:C.text,marginBottom:6 }}>No providers found</div>
                <div style={{ fontSize:13 }}>Try a different city or search term</div>
              </div>
            ) : (
              filtered.map(c=><ProviderCard key={c.id} clinic={c} onView={setSelected} onBook={setBooking} />)
            )}
          </div>

          {/* Add your clinic CTA */}
          <div style={{ margin:'4px 20px 20px',padding:'16px 18px',background:`linear-gradient(135deg, ${C.navy}, ${C.navyMid})`,borderRadius:16,display:'flex',gap:14,alignItems:'center' }}>
            <span style={{ fontSize:28 }}>🏥</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14,fontWeight:700,color:C.white }}>Are you a clinic or doctor?</div>
              <div style={{ fontSize:12,color:'rgba(255,255,255,0.55)',marginTop:2 }}>List your practice on Swasthya — free for Mahendragarh</div>
            </div>
            <a href='tel:9876500000' style={{ textDecoration:'none' }}>
              <button style={{ padding:'8px 14px',borderRadius:20,border:'none',background:C.saffron,color:C.white,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',flexShrink:0 }}>Join →</button>
            </a>
          </div>
        </>
      ) : (
        <div style={{ padding:'14px 20px 0' }}>
          {appointments.length === 0 ? (
            <div style={{ textAlign:'center',padding:'50px 0',color:C.textLight }}>
              <div style={{ fontSize:36,marginBottom:10 }}>📅</div>
              <div style={{ fontSize:16,fontWeight:700,color:C.text,marginBottom:6 }}>No appointments yet</div>
              <div style={{ fontSize:13 }}>Browse the directory and book your first appointment</div>
            </div>
          ) : (
            appointments.map(a=><AppointmentCard key={a.id} appt={a} onCancel={handleCancel} />)
          )}
        </div>
      )}
    </div>
  );
}
