import { useState, useEffect, useCallback } from 'react';
import { C, btn, card } from '../lib/design';
import { getClinics, getAppointments, bookAppointment, cancelAppointment } from '../lib/api';

const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

const daysUntil = (d) => {
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  if (diff < 0) return 'Past';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
};

const typeIcon = {
  'Government Hospital': '🏛️',
  'Diagnostic Lab': '🔬',
  'Pathology Lab': '🧪',
  'General Physician': '👨‍⚕️',
  'Multi-specialty Hospital': '🏥',
};

// ── Booking Sheet ─────────────────────────────────────────────
function BookingSheet({ clinic, onClose, onConfirm }) {
  const [slot, setSlot] = useState('');
  const [service, setService] = useState(clinic.services?.[0] || '');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [booking, setBooking] = useState(false);

  const confirm = async () => {
    if (!slot || booking) return;
    setBooking(true);
    await onConfirm({ clinicName: clinic.name, clinicPhone: clinic.phone, clinicAddress: clinic.address, clinicId: clinic.id, service, date, slot, note });
    setBooking(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', maxWidth: 430, margin: '0 auto' }} onClick={onClose}>
      <div style={{ background: C.cream, width: '100%', borderRadius: '22px 22px 0 0', padding: '0 0 40px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border, margin: '14px auto 0' }} />

        {/* Clinic info */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>{clinic.name}</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>📍 {clinic.address}</div>
          {clinic.phone && (
            <a href={`tel:${clinic.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '6px 14px', background: C.greenPale, borderRadius: 20, textDecoration: 'none' }}>
              <span style={{ fontSize: 14 }}>📞</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{clinic.phone}</span>
            </a>
          )}
        </div>

        <div style={{ height: 1, background: C.border, margin: '16px 0' }} />

        <div style={{ padding: '0 20px' }}>
          {/* Service */}
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>Select Service</div>
          <select value={service} onChange={e => setService(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 16, color: C.text }}>
            {(clinic.services || []).map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Date */}
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>Date</div>
          <input type='date' value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 16, color: C.text, boxSizing: 'border-box' }} />

          {/* Slots */}
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10 }}>Select Time</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
            {(clinic.slots || []).map(s => (
              <div key={s} onClick={() => setSlot(s)} style={{ padding: '10px 0', borderRadius: 10, textAlign: 'center', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${slot === s ? C.saffron : C.border}`, background: slot === s ? C.saffronPale : C.white, color: slot === s ? C.saffron : C.textMid, transition: 'all 0.15s' }}>{s}</div>
            ))}
          </div>

          {/* Note */}
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>Note for doctor <span style={{ fontWeight: 400, color: C.textLight }}>(optional)</span></div>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder='Describe symptoms or reason for visit...'
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none', height: 72, boxSizing: 'border-box', marginBottom: 16, color: C.text }} />

          <button onClick={confirm} style={{ ...btn.primary, opacity: slot && !booking ? 1 : 0.4, borderRadius: 14 }}>
            {booking ? '⏳ Booking...' : `Confirm Appointment · ${slot || 'Select a time'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Clinic Card ───────────────────────────────────────────────
function ClinicCard({ clinic, onBook }) {
  return (
    <div style={{ ...card.base, padding: '16px', marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: C.tealPale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
          {typeIcon[clinic.type] || '🏥'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clinic.name}</div>
            {clinic.verified && <span style={{ fontSize: 14 }}>✅</span>}
          </div>
          <div style={{ fontSize: 12, color: C.teal, fontWeight: 600, marginTop: 2 }}>{clinic.type}</div>
          <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>📍 {clinic.address}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#B8860B' }}>★ {clinic.rating}</div>
          <div style={{ fontSize: 11, color: C.textLight }}>{clinic.reviews} reviews</div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: C.warm, color: C.textMid }}>🕐 {clinic.open_time}</span>
        {clinic.home_service && <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: C.tealPale, color: C.teal }}>🚗 Home Service</span>}
      </div>

      {/* Services */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {(clinic.services || []).slice(0, 4).map(s => (
          <span key={s} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: C.warm, color: C.textMid, fontWeight: 500 }}>{s}</span>
        ))}
        {(clinic.services || []).length > 4 && <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: C.warm, color: C.textMid }}>+{clinic.services.length - 4} more</span>}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {clinic.phone && (
          <a href={`tel:${clinic.phone}`} style={{ flex: 1, textDecoration: 'none' }}>
            <button style={{ ...btn.secondary, borderRadius: 12, padding: '11px 0', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              📞 Call
            </button>
          </a>
        )}
        <button onClick={() => onBook(clinic)} style={{ ...btn.primary, flex: 2, borderRadius: 12, padding: '11px 0', fontSize: 14 }}>
          📅 Book Appointment
        </button>
      </div>
    </div>
  );
}

// ── Appointment Card ──────────────────────────────────────────
function AppointmentCard({ appt, onCancel }) {
  const upcoming = appt.status === 'upcoming';
  const cancelled = appt.status === 'cancelled';

  return (
    <div style={{ ...card.base, padding: '14px 16px', marginBottom: 12, opacity: cancelled ? 0.6 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{appt.clinic_name || appt.doctor}</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 2 }}>{appt.specialty}</div>
        </div>
        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cancelled ? C.warm : upcoming ? C.tealPale : C.greenPale, color: cancelled ? C.textLight : upcoming ? C.teal : C.green }}>
          {cancelled ? 'Cancelled' : upcoming ? daysUntil(appt.date) : 'Done'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 14, marginBottom: upcoming ? 12 : 0 }}>
        <div style={{ fontSize: 13, color: C.textMid }}>📅 {fmtDate(appt.date)}</div>
        <div style={{ fontSize: 13, color: C.textMid }}>🕐 {appt.time}</div>
      </div>
      {appt.clinic_address && <div style={{ fontSize: 13, color: C.textMid, marginBottom: upcoming ? 12 : 0 }}>📍 {appt.clinic_address}</div>}
      {appt.note && <div style={{ fontSize: 12, color: C.textLight, fontStyle: 'italic', marginBottom: 12 }}>"{appt.note}"</div>}
      {upcoming && (
        <div style={{ display: 'flex', gap: 8 }}>
          {appt.clinic_phone && (
            <a href={`tel:${appt.clinic_phone}`} style={{ flex: 1, textDecoration: 'none' }}>
              <button style={{ ...btn.secondary, borderRadius: 12, padding: '10px 0', fontSize: 13 }}>📞 Call</button>
            </a>
          )}
          <button onClick={() => {
            const addr = encodeURIComponent((appt.clinic_name || '') + ' ' + (appt.clinic_address || '') + ' Haryana India');
            window.open(`https://maps.google.com/?q=${addr}`, '_blank');
          }} style={{ ...btn.secondary, flex: 1, borderRadius: 12, padding: '10px 0', fontSize: 13 }}>📍 Directions</button>
          <button onClick={() => onCancel(appt.id)} style={{ flex: 1, border: `1.5px solid ${C.red}`, borderRadius: 12, padding: '10px 0', fontSize: 13, fontWeight: 600, background: 'transparent', color: C.red, cursor: 'pointer', fontFamily: 'inherit' }}>✕ Cancel</button>
        </div>
      )}
    </div>
  );
}

// ── Main Book Screen ──────────────────────────────────────────
export default function BookScreen({ patientId }) {
  const [view, setView] = useState('clinics');
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [cityFilter, setCityFilter] = useState('Mahendragarh');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingClinic, setBookingClinic] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2500); };

  const loadClinics = useCallback(async () => {
    const { data } = await getClinics(cityFilter === 'All' ? null : cityFilter);
    setClinics(data);
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
    setBookingClinic(null);
    if (res.ok) { showToast('Appointment booked!'); loadAppointments(); }
    else showToast('Booking failed. Try again.');
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    await cancelAppointment(id);
    loadAppointments();
    showToast('Appointment cancelled');
  };

  const types = ['All', 'Government Hospital', 'Diagnostic Lab', 'Pathology Lab', 'General Physician'];
  const filtered = clinics.filter(c =>
    (typeFilter === 'All' || c.type === typeFilter) &&
    (c.name?.toLowerCase().includes(search.toLowerCase()) || c.address?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ background: C.cream, minHeight: '100vh', paddingBottom: 90 }}>
      {toast && <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: C.navy, color: C.white, padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 300, whiteSpace: 'nowrap' }}>✓ {toast}</div>}
      {bookingClinic && <BookingSheet clinic={bookingClinic} onClose={() => setBookingClinic(null)} onConfirm={handleBook} />}

      {/* Header */}
      <div style={{ background: C.navy, padding: '54px 20px 20px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.white }}>Book Appointment</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>Clinics & labs in Mahendragarh, Rewari & Narnaul</div>

        {/* Toggle */}
        <div style={{ display: 'flex', marginTop: 16, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 }}>
          {[['clinics', '🏥 Clinics & Labs'], ['appointments', '📅 My Appointments']].map(([id, label]) => (
            <div key={id} onClick={() => setView(id)} style={{ flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, background: view === id ? C.white : 'transparent', color: view === id ? C.text : 'rgba(255,255,255,0.6)', transition: 'all 0.2s' }}>{label}</div>
          ))}
        </div>
      </div>

      {view === 'clinics' ? (
        <>
          {/* Search */}
          <div style={{ padding: '14px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.white, borderRadius: 12, padding: '11px 14px', border: `1.5px solid ${C.border}`, boxShadow: `0 2px 8px ${C.shadow}` }}>
              <span>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search clinics, labs...'
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', color: C.text, background: 'transparent' }} />
            </div>
          </div>

          {/* City filter */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0', overflowX: 'auto' }}>
            {['All', 'Mahendragarh', 'Rewari', 'Narnaul'].map(c => (
              <div key={c} onClick={() => setCityFilter(c)} style={{ padding: '7px 14px', borderRadius: 20, flexShrink: 0, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: cityFilter === c ? C.saffron : C.white, color: cityFilter === c ? C.white : C.textMid, border: `1.5px solid ${cityFilter === c ? C.saffron : C.border}`, transition: 'all 0.15s' }}>
                {c === 'All' ? '📍 All Cities' : c}
              </div>
            ))}
          </div>

          {/* Type filter */}
          <div style={{ display: 'flex', gap: 8, padding: '8px 20px 0', overflowX: 'auto' }}>
            {types.map(t => (
              <div key={t} onClick={() => setTypeFilter(t)} style={{ padding: '6px 12px', borderRadius: 20, flexShrink: 0, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: typeFilter === t ? C.navy : C.white, color: typeFilter === t ? C.white : C.textMid, border: `1.5px solid ${typeFilter === t ? C.navy : C.border}`, transition: 'all 0.15s' }}>{t}</div>
            ))}
          </div>

          <div style={{ padding: '12px 20px 0' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: C.textLight }}>⏳ Loading clinics...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: C.textLight }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🏥</div>No clinics found
              </div>
            ) : (
              filtered.map(c => <ClinicCard key={c.id} clinic={c} onBook={() => setBookingClinic(c)} />)
            )}
          </div>
        </>
      ) : (
        <div style={{ padding: '14px 20px 0' }}>
          {appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: C.textLight }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>No appointments yet</div>
              <div style={{ fontSize: 13 }}>Book your first appointment from the Clinics tab</div>
            </div>
          ) : (
            appointments.map(a => <AppointmentCard key={a.id} appt={a} onCancel={handleCancel} />)
          )}
        </div>
      )}
    </div>
  );
}
