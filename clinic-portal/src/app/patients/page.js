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
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!patients) return [];
    const term = q.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((p) => {
      const person = p.person || {};
      const name = `${person.first_name || ''} ${person.last_name || ''}`.toLowerCase();
      return (
        name.includes(term) ||
        (person.email || '').toLowerCase().includes(term) ||
        (person.phone_number || '').toLowerCase().includes(term)
      );
    });
  }, [patients, q]);

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
