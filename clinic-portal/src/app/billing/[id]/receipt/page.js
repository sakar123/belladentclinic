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
  const items = bill.line_items || [];
  const payments = bill.payments || [];
  const subtotal = items.reduce((s, it) => s + (Number(it.quantity||0)*Number(it.unit_price||0)), 0);
  const discountTotal = items.reduce((s, it) => s + (Number(it.quantity||0)*Number(it.unit_price||0))*(Number(it.discount_percentage||0)/100), 0);
  const total = subtotal - discountTotal;
  const paid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const remaining = Math.max(0, Number(total||0) - paid);
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
          <div className="p-4 grid grid-cols-6 text-sm bg-slate-50 border-b">
            <div className="font-medium col-span-2">Description</div>
            <div className="text-right font-medium">Qty</div>
            <div className="text-right font-medium">Unit</div>
            <div className="text-right font-medium">Disc%</div>
            <div className="text-right font-medium">Line Total</div>
          </div>
          {(items||[]).map((it, idx) => {
            const line = Number(it.quantity||0)*Number(it.unit_price||0)*(1-Number(it.discount_percentage||0)/100);
            return (
              <div key={it.id} className="p-4 grid grid-cols-6 text-sm border-b">
                <div className="col-span-2 truncate">{it.description}</div>
                <div className="text-right">{it.quantity}</div>
                <div className="text-right">Rs {Number(it.unit_price||0).toLocaleString()}</div>
                <div className="text-right">{Number(it.discount_percentage||0)}%</div>
                <div className="text-right">Rs {Number(line||0).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 border rounded">
          <div className="p-4 text-sm bg-slate-50 border-b font-medium">Payments</div>
          {(payments||[]).map(p => (
            <div key={p.id} className="p-4 grid grid-cols-4 text-sm border-b">
              <div>{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : ''}</div>
              <div className="truncate">{p.method}{p.transaction_ref ? ` · ${p.transaction_ref}` : ''}</div>
              <div className="truncate text-slate-500">{p.notes || ''}</div>
              <div className="text-right">Rs {Number(p.amount||0).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 border rounded p-4 text-sm">
          <div className="grid grid-cols-2">
            <div />
            <div className="space-y-1">
              <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-medium">Rs {Number(subtotal||0).toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span>Discounts</span><span className="font-medium">- Rs {Number(discountTotal||0).toLocaleString()}</span></div>
              <div className="flex items-center justify-between border-t pt-1"><span>Total</span><span className="font-semibold">Rs {Number(total||0).toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span>Paid</span><span className="font-semibold">Rs {paid.toLocaleString()}</span></div>
              <div className="flex items-center justify-between border-t pt-1"><span>Balance</span><span className="font-semibold">Rs {Number(remaining||0).toLocaleString()}</span></div>
            </div>
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
