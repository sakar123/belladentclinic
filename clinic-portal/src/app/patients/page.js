'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, UserRound } from 'lucide-react';
import Input from '@/components/ui/input';
import Empty from '@/components/ui/empty';

function PatientCard({ p }) {
  const person = p.person || {};
  const name = `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unnamed Patient';
  const initial = (person.first_name || person.last_name || 'P').charAt(0).toUpperCase();
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="bg-teal-600/10 text-teal-700">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{name}</div>
            <div className="flex items-center gap-3 text-sm text-app-muted">
              <span className="flex items-center gap-1 min-w-0"><Mail size={14} /> <span className="truncate">{person.email || '—'}</span></span>
              <span className="flex items-center gap-1"><Phone size={14} /> {person.phone_number || '—'}</span>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/patients/${p.id}`}>View</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PatientsPage() {
  const { data: patients, error } = useSWR('patients', () => api.patient.getAll());
  const { data: appts } = useSWR('appts-all', () => api.appointment.getAll());
  const { data: treatments } = useSWR('treatments-all', () => api.treatments.getAll());
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest | lastVisit | alpha

  const lastVisitMap = useMemo(() => {
    const map = new Map();
    (appts||[]).forEach(a => {
      const pid = a.patient?.id || a.patient_id; if (!pid) return;
      const d = a.appointment_start_time ? new Date(a.appointment_start_time).getTime() : 0;
      const prev = map.get(pid) || 0; if (d > prev) map.set(pid, d);
    });
    (treatments||[]).forEach(t => {
      const pid = t.patient_id; if (!pid) return;
      const d = t.completed_at ? new Date(t.completed_at).getTime() : (t.created_at ? new Date(t.created_at).getTime() : 0);
      const prev = map.get(pid) || 0; if (d > prev) map.set(pid, d);
    });
    return map;
  }, [appts, treatments]);

  const filtered = useMemo(() => {
    if (!patients) return [];
    const term = q.trim().toLowerCase();
    let base = patients;
    if (term) {
      base = patients.filter((p) => {
        const person = p.person || {};
        const name = `${person.first_name || ''} ${person.last_name || ''}`.toLowerCase();
        return (
          name.includes(term) ||
          (person.email || '').toLowerCase().includes(term) ||
          (person.phone_number || '').toLowerCase().includes(term)
        );
      });
    }
    const sorted = [...base];
    if (sortBy === 'alpha') {
      sorted.sort((a,b) => {
        const an = `${a.person?.first_name||''} ${a.person?.last_name||''}`.toLowerCase();
        const bn = `${b.person?.first_name||''} ${b.person?.last_name||''}`.toLowerCase();
        return an.localeCompare(bn);
      });
    } else if (sortBy === 'lastVisit') {
      sorted.sort((a,b) => (lastVisitMap.get(b.id)||0) - (lastVisitMap.get(a.id)||0));
    } else {
      // newest first: use created_at if present, otherwise fallback to last visit
      sorted.sort((a,b) => {
        const ac = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bc = b.created_at ? new Date(b.created_at).getTime() : 0;
        const av = lastVisitMap.get(a.id)||0;
        const bv = lastVisitMap.get(b.id)||0;
        return (bc||bv) - (ac||av);
      });
    }
    return sorted;
  }, [patients, q, sortBy, lastVisitMap]);

  if (error) return <div className="text-red-600">Failed to load patients.</div>;
  if (!patients) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
          <p className="text-sm text-app-muted">Manage your patient directory</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search patients…"
            className="w-64"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="h-10 rounded-md border border-app-border bg-app-surface px-3 text-sm" value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="lastVisit">Last visit</option>
            <option value="alpha">Alphabetical</option>
          </select>
          <Button asChild>
            <Link href="/patients/new"><UserRound size={16} /> Add Patient</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <PatientCard key={p.id} p={p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <Empty title="No patients found" subtitle="Try a different search or add a new patient." />
      )}
    </div>
  );
}
