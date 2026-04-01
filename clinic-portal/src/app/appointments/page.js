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
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'day' | 'week' | 'month'
  const [refDate, setRefDate] = useState(new Date().toISOString().slice(0,10));

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
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Input placeholder="Filter…" className="w-48" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="inline-flex rounded-md border border-app-border bg-app-surface p-1">
            {[
              { key: 'cards', label: 'List' },
              { key: 'day', label: 'Day' },
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
            ].map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setViewMode(opt.key)}
                className={`px-3 py-1.5 text-sm rounded-sm ${viewMode===opt.key ? 'bg-white shadow-sm' : 'text-app-muted'}`}
              >{opt.label}</button>
            ))}
          </div>
          {(viewMode !== 'cards') && (
            <input type="date" className="h-10 rounded-md border border-app-border bg-app-surface px-3 text-sm" value={refDate} onChange={(e) => setRefDate(e.target.value)} />
          )}
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

      {viewMode === 'cards' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((a) => (
              <AppointmentCard key={a.id} a={a} statuses={statuses || []} people={people || []} staffList={staffList || []} />
            ))}
          </div>
          {filtered.length === 0 && (
            <Empty title="No appointments" subtitle="Try a different filter or schedule a new appointment." />
          )}
        </>
      )}

      {viewMode === 'day' && (
        <DayView appointments={filtered} refDate={refDate} statuses={statuses||[]} people={people||[]} staffList={staffList||[]} />
      )}
      {viewMode === 'week' && (
        <WeekView appointments={filtered} refDate={refDate} statuses={statuses||[]} people={people||[]} staffList={staffList||[]} />
      )}
      {viewMode === 'month' && (
        <MonthView appointments={filtered} refDate={refDate} statuses={statuses||[]} people={people||[]} staffList={staffList||[]} />
      )}
    </div>
  );
}

function fmtTime(dt) {
  try { const d = new Date(dt); return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
}
function ymd(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function startOfWeek(date) {
  const d = new Date(date); const day = d.getDay(); // 0 Sun
  const diff = (day+6)%7; // Monday as first day
  const s = new Date(d); s.setDate(d.getDate()-diff); s.setHours(0,0,0,0); return s;
}
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate()+n); return d; }
function daysInMonth(y, m) { return new Date(y, m+1, 0).getDate(); }

function DayView({ appointments, refDate, statuses, people, staffList }) {
  const dayKey = refDate || new Date().toISOString().slice(0,10);
  const items = appointments.filter(a => ymd(a.appointment_start_time) === dayKey).sort((a,b) => new Date(a.appointment_start_time)-new Date(b.appointment_start_time));
  if (items.length === 0) return <Empty title="No appointments" subtitle={new Date(dayKey).toDateString()} />;
  return (
    <div className="space-y-2">
      {items.map(a => (
        <AppointmentCard key={a.id} a={a} statuses={statuses} people={people} staffList={staffList} />
      ))}
    </div>
  );
}

function WeekView({ appointments, refDate, statuses, people, staffList }) {
  const base = startOfWeek(refDate ? new Date(refDate) : new Date());
  const days = Array.from({length:7}, (_,i) => addDays(base, i));
  const groups = days.map(d => ({ date: d, key: ymd(d), items: appointments.filter(a => ymd(a.appointment_start_time)===ymd(d)).sort((a,b)=>new Date(a.appointment_start_time)-new Date(b.appointment_start_time)) }));
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {groups.map(g => (
        <div key={g.key} className="rounded border border-app-border p-2 min-h-[160px]">
          <div className="text-xs font-medium mb-2">{g.date.toLocaleDateString(undefined,{ weekday:'short', month:'short', day:'numeric' })}</div>
          {g.items.length === 0 && <div className="text-xs text-app-muted">No appts</div>}
          <div className="space-y-2">
            {g.items.map(a => {
              const p = a.patient?.person || people?.find(x => x.id === (a.patient?.id || a.patient_id))?.person || {};
              return (
                <Link key={a.id} href={`/appointments/${a.id}`} className="block rounded border border-app-border hover:bg-app-bg p-2">
                  <div className="text-xs font-medium">{fmtTime(a.appointment_start_time)} · {(p.first_name||'')+' '+(p.last_name||'')}</div>
                  {a.reason_for_visit && <div className="text-xs text-app-muted truncate">{a.reason_for_visit}</div>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthView({ appointments, refDate, statuses, people, staffList }) {
  const base = refDate ? new Date(refDate) : new Date();
  const year = base.getFullYear(); const month = base.getMonth();
  const first = new Date(year, month, 1);
  const start = startOfWeek(first);
  const total = daysInMonth(year, month);
  const weeks = 6; // show 6 rows to cover all months
  const cells = [];
  for (let w=0; w<weeks; w++) {
    for (let d=0; d<7; d++) cells.push(addDays(start, w*7+d));
  }
  const grouped = cells.map(date => {
    const key = ymd(date);
    const items = appointments.filter(a => ymd(a.appointment_start_time)===key).sort((a,b)=>new Date(a.appointment_start_time)-new Date(b.appointment_start_time));
    return { date, key, inMonth: date.getMonth()===month, items };
  });
  return (
    <div className="grid grid-cols-7 gap-[1px] bg-app-border rounded overflow-hidden">
      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(h => (
        <div key={h} className="bg-app-bg p-2 text-xs font-medium">{h}</div>
      ))}
      {grouped.map(g => (
        <div key={g.key} className={`bg-white dark:bg-app-surface min-h-[120px] p-2 ${g.inMonth?'':'opacity-50'}`}>
          <div className="text-xs font-medium mb-1">{g.date.getDate()}</div>
          <div className="space-y-1">
            {g.items.slice(0,3).map(a => {
              const p = a.patient?.person || people?.find(x => x.id === (a.patient?.id || a.patient_id))?.person || {};
              return (
                <Link key={a.id} href={`/appointments/${a.id}`} className="block rounded border border-app-border hover:bg-app-bg p-1 text-xs truncate">
                  {fmtTime(a.appointment_start_time)} · {(p.first_name||'')+' '+(p.last_name||'')}
                </Link>
              );
            })}
            {g.items.length > 3 && (
              <div className="text-[10px] text-app-muted">+{g.items.length-3} more</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
