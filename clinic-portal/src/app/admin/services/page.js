'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import Input from '@/components/ui/input';
import { useMemo, useState } from 'react';
import { Stethoscope } from 'lucide-react';
import Empty from '@/components/ui/empty';

function money(n) {
  const v = Number(n); if (Number.isNaN(v)) return '—';
  return `Rs ${v.toLocaleString()}`;
}

function ServiceCard({ s }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-3 rounded-lg bg-teal-600/10 text-teal-700"><Stethoscope size={18} /></div>
          <div className="min-w-0">
            <div className="font-medium truncate">{s.name}</div>
            <div className="text-sm text-app-muted truncate">{s.specialty?.name || 'General'}</div>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-app-muted">Cost</div>
            <div className="font-semibold">{money(s.cost)}</div>
          </div>
          <Button asChild variant="outline" size="sm"><Link href={`/admin/services/${s.id}`}>Edit</Link></Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServicesPage() {
  const { data: services, error } = useSWR('services', () => api.service.getAll());
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!services) return [];
    const t = q.trim().toLowerCase();
    if (!t) return services;
    return services.filter((s) => [s.name, s.specialty?.name].filter(Boolean).map(x => x.toLowerCase()).some(x => x.includes(t)));
  }, [services, q]);

  if (error) return <div className="text-red-600">Failed to load services.</div>;
  if (!services) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="text-sm text-app-muted">Configure offered treatments</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search services…" className="w-72" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button asChild><Link href="/admin/services/new">Add Service</Link></Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s) => (<ServiceCard key={s.id} s={s} />))}
      </div>
      {filtered.length === 0 && (
        <Empty title="No services found" subtitle="Try a different search or add a new service." />
      )}
    </div>
  );
}
