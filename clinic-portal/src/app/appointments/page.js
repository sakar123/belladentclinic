'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, User, UserCog, Filter } from 'lucide-react';
import Input from '@/components/ui/input';
import Empty from '@/components/ui/empty';

function StatusPill({ text }) {
  const normalized = (text || '').toLowerCase();
  const theme = normalized.includes('confirm') || normalized.includes('scheduled')
    ? 'bg-teal-600/10 text-teal-700'
    : normalized.includes('cancel')
    ? 'bg-rose-600/10 text-rose-700'
    : 'bg-sky-600/10 text-sky-700';
  return <span className={`px-2 py-1 rounded text-xs font-medium ${theme}`}>{text || '—'}</span>;
}

function AppointmentCard({ a, statuses, people, staffList }) {
  const p = a.patient?.person || people?.find(x => x.id === (a.patient?.id || a.patient_id))?.person || {};
  const s = a.staff?.person || staffList?.find(x => x.id === (a.staff?.id || a.staff_id))?.person || {};
  const when = new Date(a.appointment_start_time);
  const sid = a.status_id || a.status?.id;
  const statusName = (statuses || []).find(st => st.id === sid)?.name || a.status?.name || '—';
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm text-app-muted flex items-center gap-2">
            <CalendarDays size={16} />
            {when.toLocaleDateString()} · <Clock size={16} /> {when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="mt-1 font-medium truncate flex items-center gap-2">
            <User size={16} className="text-app-muted" />
            <span className="truncate">{`${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Patient'}</span>
          </div>
          <div className="text-sm text-app-muted flex items-center gap-2">
            <UserCog size={16} /> {`${s.first_name || ''} ${s.last_name || ''}`.trim() || '—'}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StatusPill text={statusName} />
          <Button asChild variant="outline" size="sm"><Link href={`/appointments/${a.id}`}>View</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AppointmentsPage() {
  const { data, error } = useSWR('appointments', () => api.appointment.getAll());
  const { data: statuses } = useSWR('appointment-status', () => api.lookup.appointmentStatus.getAll());
  const { data: people } = useSWR('patients', () => api.patient.getAll());
  const { data: staffList } = useSWR('staff', () => api.staff.getAll());
  const [q, setQ] = useState('');
  const [activeStatusIds, setActiveStatusIds] = useState(new Set());

  const toggleStatus = (id) => {
    setActiveStatusIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const clearStatus = () => setActiveStatusIds(new Set());

  const filtered = useMemo(() => {
    if (!data) return [];
    const t = q.trim().toLowerCase();
    let base = data;
    if (activeStatusIds.size > 0) {
      base = base.filter(a => {
        const sid = a.status_id || a.status?.id;
        return sid && activeStatusIds.has(sid);
      });
    }
    if (!t) return base;
    return base.filter((a) => {
      const p = a.patient?.person || {}; const s = a.staff?.person || {};
      const parts = [p.first_name, p.last_name, s.first_name, s.last_name, a.status?.name].map(x => (x || '').toLowerCase());
      return parts.some((x) => x.includes(t));
    });
  }, [data, q, activeStatusIds]);

  if (error) return <div className="text-red-600">Failed to load appointments.</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
          <p className="text-sm text-app-muted">Track schedules and statuses</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Filter appointments…" className="w-64" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button asChild><Link href="/appointments/new">Schedule</Link></Button>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex items-center flex-wrap gap-2">
        <button
          className={`px-2 py-1 rounded border text-xs ${activeStatusIds.size===0 ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-app-border'}`}
          onClick={clearStatus}
        >All</button>
        {(statuses || []).map(st => (
          <button
            key={st.id}
            className={`px-2 py-1 rounded border text-xs ${activeStatusIds.has(st.id) ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-app-border'}`}
            onClick={() => toggleStatus(st.id)}
          >{st.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <AppointmentCard key={a.id} a={a} statuses={statuses || []} people={people || []} staffList={staffList || []} />
        ))}
      </div>
      {filtered.length === 0 && (
        <Empty title="No appointments" subtitle="Try a different filter or schedule a new appointment." />
      )}
    </div>
  );
}
