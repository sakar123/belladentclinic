'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  Download,
  FilePlus2,
  ReceiptText,
  RefreshCw,
  Search,
  Send,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Empty from '@/components/ui/empty';
import Dialog, { DialogBody, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

const QUEUES = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'partial', label: 'Partial' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'paid', label: 'Paid' },
];

const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Insurance', 'Bank Transfer', 'Mobile-Pay'];

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value) {
  return `Rs ${number(value).toLocaleString()}`;
}

function idOf(entity) {
  return entity?.id || entity?.Id;
}

function field(entity, snake, camel) {
  return entity?.[snake] ?? entity?.[camel];
}

function parseDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateLabel(value) {
  const date = parseDate(value);
  return date ? date.toLocaleDateString() : '-';
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function daysUntil(value) {
  const due = parseDate(value);
  if (!due) return null;
  return Math.ceil((due.getTime() - startOfToday().getTime()) / 86400000);
}

function personFromPatient(patient) {
  return patient?.person || patient?.Person || patient || {};
}

function patientName(patient) {
  const person = personFromPatient(patient);
  return `${person.first_name || person.firstName || ''} ${person.last_name || person.lastName || ''}`.trim() || 'Patient';
}

function resolvePatient(bill, patients = []) {
  const patientId = field(bill, 'patient_id', 'patientId') || bill?.patient?.id;
  return bill?.patient || patients.find((patient) => String(idOf(patient)) === String(patientId)) || null;
}

function getAmounts(bill) {
  const total = number(field(bill, 'total_amount', 'totalAmount'));
  const paid = number(field(bill, 'amount_paid', 'amountPaid'));
  return {
    total,
    paid,
    balance: Math.max(0, total - paid),
  };
}

function getBillState(bill) {
  const { total, paid, balance } = getAmounts(bill);
  const rawStatus = String(bill?.status || '').toLowerCase();
  const dueDate = field(bill, 'due_date', 'dueDate');
  const days = daysUntil(dueDate);
  const overdue = balance > 0 && days !== null && days < 0;
  const paidInFull = balance <= 0 || rawStatus === 'paid';
  const partial = !paidInFull && paid > 0;

  if (paidInFull) return { key: 'paid', label: 'Paid', tone: 'good', total, paid, balance, days };
  if (overdue) return { key: 'overdue', label: 'Overdue', tone: 'bad', total, paid, balance, days };
  if (partial) return { key: 'partial', label: 'Partial', tone: 'warn', total, paid, balance, days };
  return { key: 'open', label: 'Open', tone: 'neutral', total, paid, balance, days };
}

function dueCopy(state) {
  if (state.days === null) return 'No due date';
  if (state.key === 'paid') return 'Settled';
  if (state.days < 0) return `${Math.abs(state.days)}d overdue`;
  if (state.days === 0) return 'Due today';
  return `Due in ${state.days}d`;
}

function statusClass(tone) {
  if (tone === 'good') return 'bg-emerald-600/10 text-emerald-700 border-emerald-200';
  if (tone === 'bad') return 'bg-rose-600/10 text-rose-700 border-rose-200';
  if (tone === 'warn') return 'bg-amber-500/10 text-amber-700 border-amber-200';
  return 'bg-sky-600/10 text-sky-700 border-sky-200';
}

function StatusBadge({ state }) {
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium', statusClass(state.tone))}>
      {state.label}
    </span>
  );
}

function makeSearchText(bill, patient) {
  const person = personFromPatient(patient);
  return [
    idOf(bill),
    patientName(patient),
    person.email,
    person.phone_number || person.phoneNumber,
    bill?.status,
    field(bill, 'issue_date', 'issueDate'),
    field(bill, 'due_date', 'dueDate'),
    bill?.notes,
  ].filter(Boolean).join(' ').toLowerCase();
}

function enrichBill(bill, patients) {
  const patient = resolvePatient(bill, patients);
  const state = getBillState(bill);
  const issueDate = field(bill, 'issue_date', 'issueDate');
  const dueDate = field(bill, 'due_date', 'dueDate');
  return {
    bill,
    id: idOf(bill),
    patient,
    patientName: patientName(patient),
    state,
    issueDate,
    dueDate,
    searchText: makeSearchText(bill, patient),
  };
}

function sortRows(rows, sortKey) {
  const copy = rows.slice();
  return copy.sort((a, b) => {
    if (sortKey === 'balance') return b.state.balance - a.state.balance;
    if (sortKey === 'amount') return b.state.total - a.state.total;
    if (sortKey === 'patient') return a.patientName.localeCompare(b.patientName);
    if (sortKey === 'due') {
      const aTime = parseDate(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bTime = parseDate(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    }
    const aTime = parseDate(a.issueDate)?.getTime() ?? 0;
    const bTime = parseDate(b.issueDate)?.getTime() ?? 0;
    return bTime - aTime;
  });
}

function exportCsv(rows) {
  const header = ['Invoice', 'Patient', 'Issue Date', 'Due Date', 'Status', 'Total', 'Paid', 'Balance'];
  const body = rows.map((row) => [
    row.id,
    row.patientName,
    row.issueDate || '',
    row.dueDate || '',
    row.state.label,
    row.state.total,
    row.state.paid,
    row.state.balance,
  ]);
  const csv = [header, ...body]
    .map((line) => line.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `billing-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function StatTile({ label, value, subtext, icon: Icon, tone = 'neutral' }) {
  const toneClass = tone === 'good' ? 'text-emerald-700 bg-emerald-600/10'
    : tone === 'bad' ? 'text-rose-700 bg-rose-600/10'
    : tone === 'warn' ? 'text-amber-700 bg-amber-500/10'
    : 'text-sky-700 bg-sky-600/10';

  return (
    <Card className="rounded-lg">
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-app-muted">{label}</div>
          <div className="mt-1 truncate text-2xl font-semibold text-slate-950">{value}</div>
          {subtext && <div className="mt-1 text-xs text-app-muted">{subtext}</div>}
        </div>
        <div className={cn('grid size-10 shrink-0 place-items-center rounded-md', toneClass)}>
          <Icon size={19} />
        </div>
      </CardContent>
    </Card>
  );
}

function AgingBar({ label, value, total, tone }) {
  const width = total > 0 ? Math.max(3, Math.round((value / total) * 100)) : 0;
  const barClass = tone === 'bad' ? 'bg-rose-600' : tone === 'warn' ? 'bg-amber-500' : 'bg-sky-600';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-app-muted">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-app-bg">
        <div className={cn('h-full rounded-full', barClass)} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function InvoiceInspector({ row, onRecordPayment, onMarkPaid, onReminder, onOpenInvoice }) {
  if (!row) {
    return (
      <Card className="h-full rounded-lg">
        <CardContent className="grid min-h-[360px] place-items-center p-6 text-center">
          <div>
            <div className="mx-auto grid size-12 place-items-center rounded-md bg-app-bg text-app-muted">
              <ReceiptText size={22} />
            </div>
            <div className="mt-3 font-medium">Select an invoice</div>
            <div className="mt-1 text-sm text-app-muted">Invoice actions and balance details appear here.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const person = personFromPatient(row.patient);
  const progress = row.state.total > 0 ? Math.min(100, Math.round((row.state.paid / row.state.total) * 100)) : 0;

  return (
    <Card className="rounded-lg">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">Invoice {String(row.id || '').slice(0, 8)}</CardTitle>
            <div className="mt-1 text-sm text-app-muted">{dateLabel(row.issueDate)} issued</div>
          </div>
          <StatusBadge state={row.state} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-4">
        <div className="rounded-lg border border-app-border bg-app-bg p-3">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-md bg-white text-sky-700">
              <UserRound size={18} />
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium">{row.patientName}</div>
              <div className="truncate text-xs text-app-muted">{person.email || person.phone_number || person.phoneNumber || 'No contact saved'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-app-muted">Due</div>
            <div className={cn('mt-1 font-medium', row.state.tone === 'bad' && 'text-rose-700')}>{dateLabel(row.dueDate)}</div>
            <div className="text-xs text-app-muted">{dueCopy(row.state)}</div>
          </div>
          <div>
            <div className="text-xs text-app-muted">Balance</div>
            <div className="mt-1 text-xl font-semibold">{money(row.state.balance)}</div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-app-muted">Paid {money(row.state.paid)}</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-app-bg">
            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-app-muted">
            <span>Total {money(row.state.total)}</span>
            <span>{row.state.balance > 0 ? `${money(row.state.balance)} left` : 'Paid in full'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onOpenInvoice}>
            <ArrowUpRight size={16} /> Open
          </Button>
          <Button variant="outline" asChild>
            <a href={`/billing/${row.id}/receipt`} target="_blank" rel="noreferrer">
              <ReceiptText size={16} /> Receipt
            </a>
          </Button>
          {row.state.balance > 0 && (
            <>
              <Button onClick={onRecordPayment}>
                <CreditCard size={16} /> Payment
              </Button>
              <Button variant="outline" onClick={onMarkPaid}>
                <CheckCircle2 size={16} /> Mark Paid
              </Button>
              <Button className="col-span-2" variant="outline" onClick={onReminder}>
                <Send size={16} /> Send Reminder
              </Button>
            </>
          )}
        </div>

        {row.bill?.notes && (
          <div className="rounded-md border border-app-border p-3 text-sm">
            <div className="mb-1 text-xs font-medium text-app-muted">Notes</div>
            <div className="text-slate-700">{row.bill.notes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BillingPage() {
  const router = useRouter();
  const { notify } = useToast();
  const { data: billings, error, mutate, isValidating } = useSWR('billings', () => api.billing.getAll());
  const { data: patients } = useSWR('patients-mini', () => api.patient.getAll());

  const [query, setQuery] = useState('');
  const [queue, setQueue] = useState('all');
  const [sortBy, setSortBy] = useState('due');
  const [selectedId, setSelectedId] = useState(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [newPatientId, setNewPatientId] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const rows = useMemo(() => (billings || []).map((bill) => enrichBill(bill, patients || [])), [billings, patients]);

  const queueCounts = useMemo(() => {
    return rows.reduce((acc, row) => {
      acc.all += 1;
      acc[row.state.key] = (acc[row.state.key] || 0) + 1;
      return acc;
    }, { all: 0, open: 0, partial: 0, overdue: 0, paid: 0 });
  }, [rows]);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const base = rows.filter((row) => {
      if (queue !== 'all' && row.state.key !== queue) return false;
      if (!needle) return true;
      return row.searchText.includes(needle);
    });
    return sortRows(base, sortBy);
  }, [query, queue, rows, sortBy]);

  const selectedRow = useMemo(() => (
    filteredRows.find((row) => String(row.id) === String(selectedId)) || filteredRows[0] || null
  ), [filteredRows, selectedId]);

  useEffect(() => {
    if (!filteredRows.length) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    if (!filteredRows.some((row) => String(row.id) === String(selectedId))) {
      setSelectedId(filteredRows[0].id);
    }
  }, [filteredRows, selectedId]);

  const summary = useMemo(() => {
    return rows.reduce((acc, row) => {
      acc.total += row.state.total;
      acc.paid += row.state.paid;
      acc.balance += row.state.balance;
      if (row.state.key !== 'paid') acc.open += 1;
      if (row.state.key === 'overdue') {
        acc.overdue += 1;
        acc.overdueAmount += row.state.balance;
      }
      return acc;
    }, { total: 0, paid: 0, balance: 0, open: 0, overdue: 0, overdueAmount: 0 });
  }, [rows]);

  const aging = useMemo(() => {
    return rows.reduce((acc, row) => {
      if (row.state.balance <= 0) return acc;
      const days = row.state.days;
      if (days === null || days >= 0) acc.current += 1;
      else if (days >= -30) acc.days30 += 1;
      else if (days >= -60) acc.days60 += 1;
      else acc.days90 += 1;
      return acc;
    }, { current: 0, days30: 0, days60: 0, days90: 0 });
  }, [rows]);

  const openPaymentDialog = (row) => {
    setPayTarget(row);
    setPayAmount(row?.state?.balance ? String(row.state.balance) : '');
    setPayMethod('');
    setPayRef('');
    setPayNotes('');
    setPayOpen(true);
  };

  const createBilling = async () => {
    const today = new Date();
    const due = newDue ? new Date(newDue) : new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
    const created = await api.billing.create({
      patient_id: newPatientId,
      issue_date: today.toISOString(),
      due_date: due.toISOString(),
      total_amount: Number(newAmount || 0),
      amount_paid: 0,
      status: 'Open',
      notes: newNotes || null,
    });
    setNewOpen(false);
    setNewPatientId('');
    setNewAmount('');
    setNewDue('');
    setNewNotes('');
    notify({ title: 'Invoice created' });
    await mutate();
    if (created?.id) setSelectedId(created.id);
  };

  const recordPayment = async () => {
    if (!payTarget) return;
    const amount = Math.max(0, Number(payAmount || 0));
    await api.billing.addPayment(payTarget.id, {
      billing_id: payTarget.id,
      amount,
      method: payMethod,
      transaction_ref: payRef || null,
      notes: payNotes || null,
      created_by: 'staff',
    });
    setPayOpen(false);
    setPayTarget(null);
    notify({ title: 'Payment recorded', description: `${money(amount)} via ${payMethod}` });
    mutate();
  };

  const markPaid = async (row) => {
    if (!row || row.state.balance <= 0) return;
    await api.billing.addPayment(row.id, {
      billing_id: row.id,
      amount: row.state.balance,
      method: 'Cash',
      transaction_ref: null,
      notes: 'Marked as paid from billing center',
      created_by: 'staff',
    });
    notify({ title: 'Marked as paid', description: `${money(row.state.balance)} recorded` });
    mutate();
  };

  const sendReminder = async (row) => {
    if (!row || row.state.balance <= 0) return;
    const person = personFromPatient(row.patient);
    const personId = person?.id;
    if (!personId) {
      notify({ title: 'Reminder not sent', description: 'No patient contact record is attached to this bill.' });
      return;
    }
    try {
      await api.notifications.dispatch({
        topicCode: 'BILLING_INVOICE',
        channel: 'Email',
        personIds: [personId],
        payload: {
          patient_name: row.patientName,
          total_amount: String(row.state.total),
          due_date: row.dueDate || '',
          balance_due: String(row.state.balance),
        },
        initiatedBy: 'portal',
      });
      notify({ title: 'Reminder sent', description: `${row.patientName} was queued for billing follow-up.` });
    } catch (err) {
      notify({ title: 'Failed to send reminder', description: String(err?.message || err) });
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Failed to load billing history.
      </div>
    );
  }

  const loading = !billings;
  const totalAging = aging.current + aging.days30 + aging.days60 + aging.days90;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-app-muted">Accounts receivable, payment collection, and invoice follow-up</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCw size={16} className={isValidating ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button variant="outline" disabled={filteredRows.length === 0} onClick={() => exportCsv(filteredRows)}>
            <Download size={16} /> Export
          </Button>
          <Button onClick={() => setNewOpen(true)}>
            <FilePlus2 size={16} /> New Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Receivable" value={loading ? '...' : money(summary.balance)} subtext={`${summary.open} open invoices`} icon={WalletCards} tone="warn" />
        <StatTile label="Collected" value={loading ? '...' : money(summary.paid)} subtext={`${money(summary.total)} billed total`} icon={Banknote} tone="good" />
        <StatTile label="Overdue" value={loading ? '...' : money(summary.overdueAmount)} subtext={`${summary.overdue} overdue invoices`} icon={AlertCircle} tone="bad" />
        <StatTile label="Invoices" value={loading ? '...' : rows.length.toLocaleString()} subtext={`${queueCounts.paid} paid, ${queueCounts.partial} partial`} icon={ReceiptText} />
      </div>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
        <Card className="overflow-hidden rounded-lg">
          <CardHeader className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Invoice Ledger</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" size={16} />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="h-10 w-full pl-9 sm:w-72"
                    placeholder="Search patient, invoice, status..."
                  />
                </div>
                <select
                  className="h-10 rounded-md border border-app-border bg-app-surface px-3 text-sm"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  <option value="due">Due date</option>
                  <option value="balance">Balance</option>
                  <option value="amount">Amount</option>
                  <option value="patient">Patient</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUEUES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setQueue(item.key)}
                  className={cn(
                    'inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium',
                    queue === item.key
                      ? 'border-sky-700 bg-sky-700 text-white'
                      : 'border-app-border bg-white text-slate-700 hover:bg-app-bg'
                  )}
                >
                  {item.label}
                  <span className={cn('rounded px-1.5 py-0.5 text-xs', queue === item.key ? 'bg-white/20' : 'bg-app-bg text-app-muted')}>
                    {queueCounts[item.key] || 0}
                  </span>
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-y border-app-border bg-app-bg text-xs font-medium uppercase tracking-wide text-app-muted">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const selected = String(selectedRow?.id) === String(row.id);
                    const progress = row.state.total > 0 ? Math.min(100, Math.round((row.state.paid / row.state.total) * 100)) : 0;
                    return (
                      <tr
                        key={row.id}
                        tabIndex={0}
                        onClick={() => setSelectedId(row.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') setSelectedId(row.id);
                        }}
                        className={cn(
                          'cursor-pointer border-b border-app-border last:border-0 outline-none hover:bg-app-bg/70 focus:bg-app-bg',
                          selected && 'bg-sky-50/80'
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-950">{row.patientName}</div>
                          <div className="text-xs text-app-muted">Invoice {String(row.id || '').slice(0, 8)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{dateLabel(row.dueDate)}</div>
                          <div className={cn('text-xs text-app-muted', row.state.tone === 'bad' && 'font-medium text-rose-700')}>
                            {dueCopy(row.state)}
                          </div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge state={row.state} /></td>
                        <td className="px-4 py-3 text-right font-medium">{money(row.state.total)}</td>
                        <td className="px-4 py-3 text-right text-app-muted">{money(row.state.paid)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{money(row.state.balance)}</td>
                        <td className="px-4 py-3">
                          <div className="w-32">
                            <div className="h-2 rounded-full bg-app-bg">
                              <div className="h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="mt-1 text-xs text-app-muted">{progress}% paid</div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!loading && filteredRows.length === 0 && (
              <div className="p-5">
                <Empty title="No invoices match" subtitle="Adjust the queue, search term, or sort order." />
              </div>
            )}
            {loading && <div className="p-6 text-sm text-app-muted">Loading billing records...</div>}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <InvoiceInspector
            row={selectedRow}
            onRecordPayment={() => openPaymentDialog(selectedRow)}
            onMarkPaid={() => markPaid(selectedRow)}
            onReminder={() => sendReminder(selectedRow)}
            onOpenInvoice={() => selectedRow && router.push(`/billing/${selectedRow.id}`)}
          />

          <Card className="rounded-lg">
            <CardHeader className="p-4">
              <CardTitle>Aging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <AgingBar label="Current / upcoming" value={aging.current} total={totalAging} />
              <AgingBar label="1-30 days overdue" value={aging.days30} total={totalAging} tone="warn" />
              <AgingBar label="31-60 days overdue" value={aging.days60} total={totalAging} tone="bad" />
              <AgingBar label="60+ days overdue" value={aging.days90} total={totalAging} tone="bad" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={payOpen} onClose={() => setPayOpen(false)}>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="rounded-md border border-app-border bg-app-bg p-3 text-sm">
            <div className="font-medium">{payTarget?.patientName || ''}</div>
            <div className="mt-1 grid grid-cols-3 gap-3 text-xs text-app-muted">
              <div>Total <span className="block font-medium text-slate-900">{money(payTarget?.state?.total)}</span></div>
              <div>Paid <span className="block font-medium text-slate-900">{money(payTarget?.state?.paid)}</span></div>
              <div>Balance <span className="block font-medium text-slate-900">{money(payTarget?.state?.balance)}</span></div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-app-muted">Amount</span>
              <Input type="number" min="0.01" step="0.01" value={payAmount} onChange={(event) => setPayAmount(event.target.value)} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-app-muted">Method</span>
              <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={payMethod} onChange={(event) => setPayMethod(event.target.value)}>
                <option value="">Select method...</option>
                {PAYMENT_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-app-muted">Reference</span>
              <Input value={payRef} onChange={(event) => setPayRef(event.target.value)} placeholder="Transaction or claim id" />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block text-xs font-medium text-app-muted">Notes</span>
              <textarea className="h-20 w-full rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" value={payNotes} onChange={(event) => setPayNotes(event.target.value)} />
            </label>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
          <Button disabled={!payAmount || !payMethod} onClick={recordPayment}>
            <CreditCard size={16} /> Record Payment
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={newOpen} onClose={() => setNewOpen(false)}>
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-app-muted">Patient</span>
              <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={newPatientId} onChange={(event) => setNewPatientId(event.target.value)}>
                <option value="">Select patient...</option>
                {(patients || []).map((patient) => (
                  <option key={idOf(patient)} value={idOf(patient)}>{patientName(patient)}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-app-muted">Amount</span>
              <Input type="number" min="0" step="1" value={newAmount} onChange={(event) => setNewAmount(event.target.value)} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-xs font-medium text-app-muted">Due date</span>
              <Input type="date" value={newDue} onChange={(event) => setNewDue(event.target.value)} />
            </label>
            <label className="text-sm md:col-span-3">
              <span className="mb-1 block text-xs font-medium text-app-muted">Notes</span>
              <textarea className="h-20 w-full rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" value={newNotes} onChange={(event) => setNewNotes(event.target.value)} />
            </label>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
          <Button disabled={!newPatientId || !newAmount} onClick={createBilling}>
            <FilePlus2 size={16} /> Create
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
