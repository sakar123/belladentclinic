'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import Input from '@/components/ui/input';
import { useMemo, useState } from 'react';
import { CreditCard, CalendarDays, User, AlertTriangle } from 'lucide-react';
import Empty from '@/components/ui/empty';
import Button from '@/components/ui/button';
import Dialog, { DialogBody, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';

function money(n) {
  if (n === undefined || n === null) return '—';
  const v = Number(n);
  if (Number.isNaN(v)) return String(n);
  return `Rs ${v.toLocaleString()}`;
}

function StatusPill({ status }) {
  const s = (status || '').toString().toLowerCase();
  const theme = s.includes('paid') && !s.includes('partial')
    ? 'bg-emerald-600/10 text-emerald-700'
    : s.includes('overdue')
    ? 'bg-rose-600/10 text-rose-700'
    : 'bg-amber-500/10 text-amber-700';
  return <span className={`px-2 py-1 rounded text-xs font-medium ${theme}`}>{status || '—'}</span>;
}

function BillingCard({ b, patients }) {
  const fallbackPerson = (patients || []).find(px => px.id === (b.patient?.id || b.patient_id))?.person || {};
  const p = b.patient?.person || fallbackPerson || {};
  const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Patient';
  const due = b.due_date ? new Date(b.due_date) : null;
  const daysLeft = due ? Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const overdue = daysLeft !== null && daysLeft < 0;
  const remaining = Math.max(0, Number(b.total_amount||0) - Number(b.amount_paid||0));
  const fullyPaid = remaining <= 0;
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-medium truncate flex items-center gap-2">
            <User size={16} className="text-app-muted" />
            <span className="truncate">{name}</span>
          </div>
          <div className="text-sm text-app-muted flex items-center gap-2 mt-1">
            <CalendarDays size={16} /> Due: {due ? due.toLocaleDateString() : '—'}
            {overdue && (
              <span className="inline-flex items-center gap-1 text-rose-700"><AlertTriangle size={14} /> Overdue</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm text-app-muted">Total</div>
          <div className="text-lg font-semibold">{money(b.total_amount)}</div>
          <div className="text-xs text-app-muted">Paid {money(b.amount_paid)}</div>
          <div className={`text-xs ${fullyPaid ? 'text-emerald-700' : 'text-app-muted'}`}>Remaining {money(remaining)}</div>
        </div>
        <div className="shrink-0">{fullyPaid ? <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-600/10 text-emerald-700">Paid</span> : <StatusPill status={b.status} />}</div>
      </CardContent>
    </Card>
  );
}

export default function BillingPage() {
  const { data: billings, error, mutate } = useSWR('billings', () => api.billing.getAll());
  const { data: patients } = useSWR('patients-mini', () => api.patient.getAll());
  const [q, setQ] = useState('');
  const { notify } = useToast();
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [newPatientId, setNewPatientId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDue, setNewDue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    if (!billings) return [];
    const t = q.trim().toLowerCase();
    let base = billings.slice();
    if (statusFilter !== 'all') {
      base = base.filter(b => {
        const rem = Math.max(0, Number(b.total_amount||0) - Number(b.amount_paid||0));
        const due = b.due_date ? new Date(b.due_date) : null;
        const overdue = rem > 0 && due && (Date.now() > due.getTime());
        const s = (b.status||'').toLowerCase();
        if (statusFilter === 'paid') return rem <= 0 || s === 'paid';
        if (statusFilter === 'partial') return rem > 0 && Number(b.amount_paid||0) > 0;
        if (statusFilter === 'open') return rem > 0 && Number(b.amount_paid||0) === 0;
        if (statusFilter === 'overdue') return overdue;
        return true;
      });
    }
    if (!t) return base;
    return base.filter((b) => {
      const fallbackPerson = (patients || []).find(px => px.id === (b.patient?.id || b.patient_id))?.person || {};
      const p = b.patient?.person || fallbackPerson || {};
      const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
      return [name, (b.status || '').toString().toLowerCase()].some(x => x.includes(t));
    });
  }, [billings, q, statusFilter, patients]);

  if (error) return <div className="text-red-600">Failed to load billing history.</div>;
  if (!billings) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-app-muted">Payments and outstanding balances</p>
      </div>
      {(() => {
        const total = billings.reduce((s,b) => s + Number(b.total_amount||0), 0);
        const paid = billings.reduce((s,b) => s + Number(b.amount_paid||0), 0);
        const remaining = Math.max(0, total - paid);
        const overdue = billings.filter(b => {
          const rem = Math.max(0, Number(b.total_amount||0) - Number(b.amount_paid||0));
          const due = b.due_date ? new Date(b.due_date) : null;
          return rem > 0 && due && (Date.now() > due.getTime());
        }).length;
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4"><div className="text-xs text-app-muted">Total</div><div className="text-xl font-semibold">{money(total)}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-xs text-app-muted">Paid</div><div className="text-xl font-semibold">{money(paid)}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-xs text-app-muted">Remaining</div><div className="text-xl font-semibold">{money(remaining)}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-xs text-app-muted">Overdue</div><div className="text-xl font-semibold">{overdue}</div></CardContent></Card>
          </div>
        );
      })()}
      <div className="flex items-center justify-between gap-2">
        <Input placeholder="Filter by name or status…" className="w-72" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {['all','open','partial','paid','overdue'].map(sf => (
              <button key={sf} onClick={() => setStatusFilter(sf)} className={`px-2 py-1 rounded text-xs border ${statusFilter===sf?'bg-sky-600 text-white border-sky-600':'bg-white text-slate-700 border-app-border'}`}>{sf[0].toUpperCase()+sf.slice(1)}</button>
            ))}
          </div>
          <Button onClick={() => { setNewOpen(true); setNewPatientId(''); setNewAmount(''); setNewDue(''); }}>New Billing</Button>
          <Button variant="outline" onClick={() => {
            const rows = filtered.map(b => ({
              id: b.id,
              patient: (() => {
                const fallback = (patients || []).find(px => px.id === (b.patient?.id || b.patient_id))?.person || {};
                const per = b.patient?.person || fallback || {};
                return `${per.first_name||''} ${per.last_name||''}`.trim();
              })(),
              issue_date: b.issue_date,
              due_date: b.due_date,
              status: b.status,
              total_amount: b.total_amount,
              amount_paid: b.amount_paid,
              remaining: Math.max(0, Number(b.total_amount||0) - Number(b.amount_paid||0)),
            }));
            const header = Object.keys(rows[0]||{id:'',patient:'',issue_date:'',due_date:'',status:'',total_amount:'',amount_paid:'',remaining:''});
            const csv = [header.join(','), ...rows.map(r => header.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'billing-export.csv'; a.click(); URL.revokeObjectURL(url);
          }}>Export CSV</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((b) => {
          const remaining = Math.max(0, Number(b.total_amount||0) - Number(b.amount_paid||0));
          const fullyPaid = remaining <= 0;
          return (
            <div key={b.id} className="space-y-2">
              <BillingCard b={b} patients={patients || []} />
              {!fullyPaid && (
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => { setPayTarget(b); setPayAmount(''); setPayOpen(true); }}>Add Payment</Button>
                  <Button size="sm" variant="outline" onClick={async () => {
                    await api.billing.update(b.id, { ...b, amount_paid: b.total_amount, status: 'Paid' });
                    notify({ title: 'Marked as paid' });
                    mutate();
                  }}>Mark Paid</Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <a className="text-sm text-sky-700 hover:underline" href={`/billing/${b.id}/receipt`} target="_blank" rel="noreferrer">Receipt</a>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <Empty title="No billing records" subtitle="Try a different filter." />
      )}

      <Dialog open={payOpen} onClose={() => setPayOpen(false)}>
        <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
        <DialogBody>
          <div className="space-y-2 text-sm">
            <div>Patient: <span className="font-medium">{payTarget ? (() => {
              const fb = (patients || []).find(px => px.id === (payTarget.patient?.id || payTarget.patient_id))?.person || {};
              const per = payTarget.patient?.person || fb || {};
              return `${per.first_name||''} ${per.last_name||''}`.trim();
            })() : ''}</span></div>
            <div>Total: <span className="font-medium">{money(payTarget?.total_amount)}</span></div>
            <div>Paid: <span className="font-medium">{money(payTarget?.amount_paid)}</span></div>
            <div>Remaining: <span className="font-medium">{money(Math.max(0, (Number(payTarget?.total_amount||0) - Number(payTarget?.amount_paid||0))))}</span></div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-app-muted mb-1">Payment amount (Rs)</div>
            <Input type="number" min="0" step="1" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
          <Button onClick={async () => {
            const amt = Math.max(0, Number(payAmount || 0));
            const newPaid = Math.min(Number(payTarget.amount_paid || 0) + amt, Number(payTarget.total_amount || 0));
            const newStatus = newPaid >= Number(payTarget.total_amount || 0) ? 'Paid' : 'Partial';
            await api.billing.update(payTarget.id, { ...payTarget, amount_paid: newPaid, status: newStatus });
            setPayOpen(false); setPayTarget(null); setPayAmount('');
            notify({ title: 'Payment recorded', description: `Rs ${amt.toLocaleString()}` });
            mutate();
          }}>Save</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={newOpen} onClose={() => setNewOpen(false)}>
        <DialogHeader><DialogTitle>Create Billing</DialogTitle></DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-app-muted mb-1">Patient</div>
              <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={newPatientId} onChange={(e) => setNewPatientId(e.target.value)}>
                <option value="">Select…</option>
                {(patients || []).map(p => (<option key={p.id} value={p.id}>{p.person.first_name} {p.person.last_name}</option>))}
              </select>
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Amount (Rs)</div>
              <Input type="number" min="0" step="1" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Due date</div>
              <Input type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
          <Button onClick={async () => {
            const today = new Date();
            const due = newDue ? new Date(newDue) : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
            await api.billing.create({
              patient_id: newPatientId,
              issue_date: today.toISOString(),
              due_date: due.toISOString(),
              total_amount: Number(newAmount||0),
              amount_paid: 0,
              status: 'Open',
            });
            setNewOpen(false);
            notify({ title: 'Billing created' });
            mutate();
          }} disabled={!newPatientId || !newAmount}>Create</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
