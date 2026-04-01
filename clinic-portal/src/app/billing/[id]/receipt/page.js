"use client";

import useSWR from 'swr';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';

export default function ReceiptPage({ params }) {
  const { id } = params;
  const { data: bill } = useSWR(id ? `billing-${id}` : null, () => api.billing.getById(id));
  const { data: patients } = useSWR('patients-mini', () => api.patient.getAll());
  if (!bill) return <div className="p-6">Loading…</div>;
  const person = (bill.patient?.person) || (patients||[]).find(p => p.id === bill.patient_id)?.person || {};
  const issue = bill.issue_date ? new Date(bill.issue_date) : null;
  const due = bill.due_date ? new Date(bill.due_date) : null;
  const remaining = Math.max(0, Number(bill.total_amount||0) - Number(bill.amount_paid||0));
  return (
    <div className="min-h-screen bg-white text-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <img src="/images/belladent_logo_with_name.jpg" alt="BellaDent" className="h-10 w-auto" />
            <div className="text-sm">BellaDent Dental Clinic</div>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold">Receipt</div>
            <div>ID: {bill.id}</div>
            <div>Issued: {issue ? issue.toLocaleDateString() : '-'}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-slate-500">Billed To</div>
            <div className="font-semibold">{`${person.first_name || ''} ${person.last_name || ''}`.trim()}</div>
            <div className="text-slate-600">{person.email || ''}</div>
            <div className="text-slate-600">{person.phone_number || ''}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Due Date</div>
            <div className="font-semibold">{due ? due.toLocaleDateString() : '-'}</div>
            <div className="text-xs text-slate-500">Status</div>
            <div className="font-semibold">{bill.status}</div>
          </div>
        </div>
        <div className="mt-6 border rounded">
          <div className="p-4 grid grid-cols-3 text-sm bg-slate-50 border-b">
            <div className="font-medium">Description</div>
            <div className="text-right font-medium">Paid</div>
            <div className="text-right font-medium">Remaining</div>
          </div>
          <div className="p-4 grid grid-cols-3 text-sm">
            <div>{bill.status || 'Billing'}</div>
            <div className="text-right">Rs {Number(bill.amount_paid||0).toLocaleString()}</div>
            <div className="text-right">Rs {remaining.toLocaleString()}</div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-slate-500">Thank you for choosing BellaDent.</div>
          <Button onClick={() => window.print()}>Print</Button>
        </div>
      </div>
    </div>
  );
}

