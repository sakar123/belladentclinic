'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, ShieldCheck } from 'lucide-react';
import Input from '@/components/ui/input';
import { useMemo, useState } from 'react';
import Empty from '@/components/ui/empty';
import { withRole } from '@/components/withAuth';

function StaffCard({ s }) {
  const p = s.person || {};
  const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Staff Member';
  const initial = (p.first_name || p.last_name || 'S').charAt(0).toUpperCase();
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="bg-sky-600/10 text-sky-700">
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{name}</div>
            <div className="flex items-center gap-2 text-xs text-app-muted">
              <span className="inline-flex items-center gap-1"><ShieldCheck size={14} /> {s.role?.name || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-app-muted">
              <span className="flex items-center gap-1 min-w-0"><Mail size={14} /> <span className="truncate">{p.email || '—'}</span></span>
              <span className="flex items-center gap-1"><Phone size={14} /> {p.phone_number || '—'}</span>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/staff/${s.id}`}>Edit</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StaffPage() {
  const { data: staff, error } = useSWR('staff', () => api.staff.getAll());
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!staff) return [];
    const t = q.trim().toLowerCase();
    if (!t) return staff;
    return staff.filter((s) => {
      const p = s.person || {}; const role = s.role?.name || '';
      const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
      return [name, (p.email || '').toLowerCase(), (p.phone_number || '').toLowerCase(), role.toLowerCase()].some(x => x.includes(t));
    });
  }, [staff, q]);

  if (error) return <div className="text-red-600 p-6">Failed to load staff.</div>;
  if (!staff) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Staff</h1>
          <p className="text-sm text-app-muted">Manage your clinic team</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search staff…" className="w-64" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button asChild>
            <Link href="/admin/staff/invite">Invite Staff</Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s) => (<StaffCard key={s.id} s={s} />))}
      </div>
      {filtered.length === 0 && (
        <Empty title="No staff found" subtitle="Try a different search or invite a staff member." />
      )}
    </div>
  );
}

export default withRole(StaffPage, 'AdminOnly');
