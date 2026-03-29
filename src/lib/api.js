import { supabase } from './supabase';

// ── OTP ─────────────────────────────────────────────────────
export async function sendOtp(phone) {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error } = await supabase.from('otp_codes')
      .insert({ phone, code, expires_at: expires });
    if (error) throw error;
    alert(`Your Swasthya OTP: ${code}\n\n(SMS coming soon)`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function verifyOtp(phone, code) {
  try {
    const { data, error } = await supabase.from('otp_codes')
      .select('*').eq('phone', phone).eq('code', code)
      .eq('used', false).gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }).limit(1);
    if (error) throw error;
    if (!data?.length) return { ok: false, error: 'Invalid or expired OTP' };
    await supabase.from('otp_codes').update({ used: true }).eq('id', data[0].id);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── PATIENTS ─────────────────────────────────────────────────
export async function getOrCreatePatient(phone) {
  try {
    const { data: existing } = await supabase.from('patients')
      .select('*').eq('phone', phone).maybeSingle();
    if (existing) return { ok: true, patient: existing, isNew: false };
    const { data, error } = await supabase.from('patients')
      .insert({ phone }).select().single();
    if (error) throw error;
    return { ok: true, patient: data, isNew: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function savePatientProfile(patientId, profile) {
  try {
    const { data, error } = await supabase.from('patients')
      .update({
        name: profile.name,
        age: parseInt(profile.age) || null,
        gender: profile.gender || null,
        blood_group: profile.blood || null,
        city: profile.city || null,
        emergency_contact: profile.emergencyContact || null,
        allergies: profile.allergies || null,
        conditions: profile.conditions || null,
      })
      .eq('id', patientId).select().single();
    if (error) throw error;
    return { ok: true, patient: data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── RECORDS ──────────────────────────────────────────────────
export async function getRecords(patientId) {
  const { data, error } = await supabase.from('records')
    .select('*').eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function uploadReport(patientId, file, meta) {
  try {
    const ext = file.name.split('.').pop();
    const path = `${patientId}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('reports').upload(path, file, { contentType: file.type });
    if (upErr) throw upErr;
    const { data: pub } = supabase.storage.from('reports').getPublicUrl(path);
    const { data, error } = await supabase.from('records').insert({
      patient_id: patientId,
      title: meta.title,
      type: meta.type,
      doctor: meta.doctor || null,
      hospital: meta.hospital || null,
      file_url: pub?.publicUrl || null,
      file_type: file.type,
      date: new Date().toISOString().split('T')[0],
      status: 'normal',
    }).select().single();
    if (error) throw error;
    return { ok: true, record: data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function deleteRecord(recordId) {
  const { error } = await supabase.from('records').delete().eq('id', recordId);
  return { ok: !error, error };
}

// ── PRESCRIPTIONS ─────────────────────────────────────────────
export async function getPrescriptions(patientId) {
  const { data, error } = await supabase.from('prescriptions')
    .select('*, prescription_medicines(*)')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function savePrescription(patientId, fileUrl, medicines, meta) {
  try {
    const { data, error } = await supabase.from('prescriptions').insert({
      patient_id: patientId,
      doctor: meta.doctor || null,
      hospital: meta.hospital || null,
      date: meta.date || new Date().toISOString().split('T')[0],
      file_url: fileUrl,
      notes: meta.notes || null,
    }).select().single();
    if (error) throw error;
    if (medicines?.length) {
      await supabase.from('prescription_medicines').insert(
        medicines.map(m => ({ prescription_id: data.id, ...m }))
      );
    }
    return { ok: true, prescription: data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ── APPOINTMENTS ─────────────────────────────────────────────
export async function getAppointments(patientId) {
  const { data, error } = await supabase.from('appointments')
    .select('*').eq('patient_id', patientId)
    .order('date', { ascending: true });
  return { data: data || [], error };
}

export async function bookAppointment(patientId, appt) {
  try {
    const { data, error } = await supabase.from('appointments').insert({
      patient_id: patientId,
      clinic_id: appt.clinicId || null,
      clinic_name: appt.clinicName,
      clinic_phone: appt.clinicPhone || null,
      clinic_address: appt.clinicAddress || null,
      doctor: appt.doctor || null,
      specialty: appt.service,
      date: appt.date,
      time: appt.slot,
      type: 'Appointment',
      status: 'upcoming',
      note: appt.note || null,
    }).select().single();
    if (error) throw error;
    return { ok: true, appointment: data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function cancelAppointment(apptId) {
  const { error } = await supabase.from('appointments')
    .update({ status: 'cancelled' }).eq('id', apptId);
  return { ok: !error };
}

// ── HOME VISITS ────────────────────────────────────────────────
export async function requestHomeVisit(patientId, visit) {
  try {
    const { data, error } = await supabase.from('home_visits').insert({
      patient_id: patientId,
      service_type: visit.serviceType,
      address: visit.address,
      preferred_time: visit.preferredTime,
      notes: visit.notes || null,
      status: 'requested',
      patient_phone: visit.phone || null,
    }).select().single();
    if (error) throw error;
    return { ok: true, visit: data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function getHomeVisits(patientId) {
  const { data, error } = await supabase.from('home_visits')
    .select('*').eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

// ── CLINICS ────────────────────────────────────────────────────
export async function getClinics(city) {
  let q = supabase.from('clinics').select('*').eq('active', true)
    .order('rating', { ascending: false });
  if (city && city !== 'All') q = q.eq('city', city);
  const { data, error } = await q;
  return { data: data || [], error };
}

// ── SESSION ────────────────────────────────────────────────────
export const session = {
  save: (p) => localStorage.setItem('sw_patient', JSON.stringify(p)),
  load: () => { try { return JSON.parse(localStorage.getItem('sw_patient')); } catch { return null; } },
  clear: () => localStorage.removeItem('sw_patient'),
};
