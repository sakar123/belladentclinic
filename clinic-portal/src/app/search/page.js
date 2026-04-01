"use client";

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import Empty from '@/components/ui/empty';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { CalendarDays, User, UserCog } from 'lucide-react';

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-app-muted">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PatientRow({ p }) {
  const person = p.person || {};
  const name = `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Patient';
  const initial = (person.first_name || person.last_name || 'P')[0]?.toUpperCase();
  return (
    <Link href={`/patients/${p.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <Avatar className="bg-teal-600/10 text-teal-700"><AvatarFallback>{initial}</AvatarFallback></Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{name}</div>
            <div className="text-sm text-app-muted truncate">{person.email || '—'} · {person.phone_number || '—'}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StaffRow({ s }) {
  const p = s.person || {}; const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Staff';
  const initial = (p.first_name || p.last_name || 'S')[0]?.toUpperCase();
  return (
    <Link href={`/admin/staff/${s.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <Avatar className="bg-sky-600/10 text-sky-700"><AvatarFallback>{initial}</AvatarFallback></Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{name}</div>
            <div className="text-sm text-app-muted truncate">{s.role?.name || '—'}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function AppointmentRow({ a }) {
  const p = a.patient?.person || {}; const s = a.staff?.person || {};
  const t = new Date(a.appointment_start_time);
  return (
    <Link href={`/appointments/${a.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100 text-slate-700"><CalendarDays size={18} /></div>
          <div className="min-w-0">
            <div className="font-medium truncate">{t.toLocaleDateString()} {t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-sm text-app-muted truncate">{`${p.first_name || ''} ${p.last_name || ''}`.trim()} · {`${s.first_name || ''} ${s.last_name || ''}`.trim()}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function SearchPage() {
  const sp = useSearchParams();
  const q = (sp.get('q') || '').trim().toLowerCase();
  const { data: patients } = useSWR('search-patients', () => api.patient.getAll());
  const { data: staff } = useSWR('search-staff', () => api.staff.getAll());
  const { data: appts } = useSWR('search-appts', () => api.appointment.getAll());

  const pf = (patients || []).filter((p) => {
    if (!q) return false;
    const person = p.person || {};
    const name = `${person.first_name || ''} ${person.last_name || ''}`.toLowerCase();
    return [name, (person.email || '').toLowerCase(), (person.phone_number || '').toLowerCase()].some(x => x.includes(q));
  }).slice(0, 6);

  const sf = (staff || []).filter((s) => {
    if (!q) return false;
    const p = s.person || {}; const role = (s.role?.name || '').toLowerCase();
    const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
    return [name, (p.email || '').toLowerCase(), (p.phone_number || '').toLowerCase(), role].some(x => x.includes(q));
  }).slice(0, 6);

  const af = (appts || []).filter((a) => {
    if (!q) return false;
    const p = a.patient?.person || {}; const s = a.staff?.person || {}; const st = (a.status?.name || '').toLowerCase();
    const values = [p.first_name, p.last_name, s.first_name, s.last_name, st].map(v => (v || '').toLowerCase());
    return values.some(x => x.includes(q));
  }).slice(0, 6);

  const hasAny = pf.length + sf.length + af.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-app-muted">Results for “{sp.get('q') || ''}”</p>
      </div>
      {!hasAny && (
        <Empty title="No results" subtitle="Try a different search term." />
      )}
      {pf.length > 0 && (
        <Section title="Patients">
          {pf.map((p) => (<PatientRow key={p.id} p={p} />))}
        </Section>
      )}
      {sf.length > 0 && (
        <Section title="Staff">
          {sf.map((s) => (<StaffRow key={s.id} s={s} />))}
        </Section>
      )}
      {af.length > 0 && (
        <Section title="Appointments">
          {af.map((a) => (<AppointmentRow key={a.id} a={a} />))}
        </Section>
      )}
    </div>
  );
}

