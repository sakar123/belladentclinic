"use client";

import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Dialog, { DialogBody, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Input from '@/components/ui/input';
import { useMemo, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { ChevronDown } from 'lucide-react';

function money(v) { const n = Number(v||0); return `Rs ${n.toLocaleString()}`; }

function MethodBadge({ method }) {
  const m = (method||'').toLowerCase();
  const cls = m.includes('cash') ? 'bg-emerald-600/10 text-emerald-700'
    : m.includes('credit') ? 'bg-sky-600/10 text-sky-700'
    : m.includes('insurance') ? 'bg-purple-600/10 text-purple-700'
    : m.includes('bank') ? 'bg-slate-600/10 text-slate-700'
    : 'bg-amber-600/10 text-amber-700';
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{method}</span>;
}

export default function BillingDetailPage({ params }) {
  const router = useRouter();
  const { notify } = useToast();
  const { id } = params;
  const { data: bill, mutate } = useSWR(id ? `billing-${id}` : null, () => api.billing.getById(id));
  const { data: patients } = useSWR('patients-mini', () => api.patient.getAll());
  const { data: discountTypes } = useSWR('discount-types', () => api.lookup.discountTypes.getAll());
  const person = useMemo(() => {
    if (!bill) return {};
    return (bill.patient?.person) || (patients||[]).find(p => p.id === bill.patient_id)?.person || {};
  }, [bill, patients]);

  const [liOpen, setLiOpen] = useState(false);
  const [liData, setLiData] = useState({ description: '', line_item_type: 'Service', quantity: 1, unit_price: 0, discount_percentage: 0 });
  const [editingLineItem, setEditingLineItem] = useState(null);
  const [lineItemDraft, setLineItemDraft] = useState({ description: '', line_item_type: 'Service', quantity: 1, unit_price: 0, discount_percentage: 0 });
  const [payOpen, setPayOpen] = useState(false);
  const [pay, setPay] = useState({ amount: '', method: '', transaction_ref: '', notes: '' });
  const [notes, setNotes] = useState('');
  const [liDiscountMenuOpen, setLiDiscountMenuOpen] = useState(false);

  const issue = bill?.issue_date ? new Date(bill.issue_date) : null;
  const due = bill?.due_date ? new Date(bill.due_date) : null;
  const items = bill?.line_items || [];
  const payments = bill?.payments || [];
  const subtotal = items.reduce((s, it) => s + (Number(it.quantity||0)*Number(it.unit_price||0)), 0);
  const discountTotal = items.reduce((s, it) => s + (Number(it.quantity||0)*Number(it.unit_price||0))*(Number(it.discount_percentage||0)/100), 0);
  const total = subtotal - discountTotal;
  const paid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const balance = Math.max(0, total - paid);

  useEffect(() => {
    if (!bill) return;
    const newStatus = balance <= 0 ? 'Paid' : (bill.status === 'Paid' ? 'Open' : bill.status);
    if (newStatus !== bill.status || Number(bill.amount_paid || 0) !== paid) {
      api.billing.update(bill.id, { ...bill, status: newStatus, amount_paid: paid }).then(() => mutate());
    }
  }, [balance, paid, bill, mutate]);

  const openChargeEditor = (item) => {
    setEditingLineItem(item);
    setLineItemDraft({
      description: item.description || '',
      line_item_type: item.line_item_type || 'Service',
      quantity: Number(item.quantity || 1),
      unit_price: Number(item.unit_price || 0),
      discount_percentage: Number(item.discount_percentage || 0),
    });
  };

  const saveChargeEditor = async () => {
    if (!editingLineItem) return;
    await api.billing.updateLineItem(bill.id, editingLineItem.id, {
      billing_id: bill.id,
      description: lineItemDraft.description,
      line_item_type: lineItemDraft.line_item_type,
      quantity: Math.max(1, Number(lineItemDraft.quantity || 1)),
      unit_price: Math.max(0, Number(lineItemDraft.unit_price || 0)),
      discount_percentage: Math.max(0, Math.min(100, Number(lineItemDraft.discount_percentage || 0))),
    });
    setEditingLineItem(null);
    notify({ title: 'Charge updated', description: 'The bill total was recalculated. Payments were kept.' });
    mutate();
  };

  if (!bill) return <div className="p-4">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" className="no-print" onClick={() => router.push('/billing')}>← Back</Button>
          <h1 className="text-2xl font-semibold">Invoice</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="no-print"><a href={`/billing/${bill.id}/receipt`} target="_blank" rel="noreferrer">Print</a></Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-app-muted">Patient</div>
            <div className="font-semibold">{`${person.first_name||''} ${person.last_name||''}`.trim()}</div>
            <div className="text-sm text-app-muted">{person.email || ''}</div>
            <div className="text-sm text-app-muted">{person.phone_number || ''}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-app-muted">Issue</div>
            <div className="font-medium">{issue ? issue.toLocaleDateString() : '-'}</div>
            <div className="text-xs text-app-muted">Due</div>
            <div className="font-medium">{due ? due.toLocaleDateString() : '-'}</div>
            <div className="text-xs text-app-muted">Status</div>
            <div className="font-semibold">{bill.status}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4"><CardTitle>Charges</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[40px_1fr_80px_110px_90px_120px_90px] text-sm bg-app-bg border-b border-app-border px-3 py-2">
            <div>#</div><div>Description</div><div className="text-right">Qty</div><div className="text-right">Price</div><div className="text-right">Discount</div><div className="text-right">Total</div><div className="text-right no-print">Edit</div>
          </div>
          {(items||[]).map((it, idx) => {
            const lineTotal = Number(it.quantity||0)*Number(it.unit_price||0)*(1 - Number(it.discount_percentage||0)/100);
            return (
              <div key={it.id} className="grid grid-cols-[40px_1fr_80px_110px_90px_120px_90px] items-center text-sm px-3 py-2 border-b border-app-border">
                <div>{idx+1}</div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{it.description}</div>
                  <div className="text-xs text-app-muted">{it.service_name || it.line_item_type}</div>
                </div>
                <div className="text-right">{it.quantity}</div>
                <div className="text-right">{money(it.unit_price)}</div>
                <div className="text-right">{Number(it.discount_percentage||0)}%</div>
                <div className="text-right font-medium">{money(lineTotal)}</div>
                <div className="text-right no-print">
                  <Button size="sm" variant="outline" onClick={() => openChargeEditor(it)}>Edit</Button>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="p-4 text-sm text-app-muted">No charges yet.</div>
          )}
          <div className="p-3"><Button size="sm" variant="outline" className="no-print" onClick={() => { setLiData({ description:'', line_item_type:'Other', quantity:1, unit_price:0, discount_percentage:0 }); setLiOpen(true); }}>Add Charge</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4"><CardTitle>Payments</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-app-bg border-b border-app-border">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Notes</th>
                  <th className="px-3 py-2 font-medium text-right">Amount</th>
                  <th className="px-3 py-2 font-medium">Method</th>
                  <th className="px-3 py-2 font-medium">Ref</th>
                  <th className="px-3 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(payments||[]).map(p => (
                  <tr key={p.id} className="border-b border-app-border last:border-0 hover:bg-app-bg/50">
                    <td className="px-3 py-2 whitespace-nowrap">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : ''}</td>
                    <td className="px-3 py-2 text-app-muted max-w-[200px] truncate">{p.notes || ''}</td>
                    <td className="px-3 py-2 text-right font-medium">{money(p.amount)}</td>
                    <td className="px-3 py-2"><MethodBadge method={p.method} /></td>
                    <td className="px-3 py-2 text-xs text-app-muted max-w-[150px] truncate">{p.transaction_ref || ''}</td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="outline" className="no-print" onClick={async ()=>{ await api.billing.deletePayment(bill.id, p.id); notify({ title: 'Payment removed' }); mutate(); }}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(balance > 0 && bill.status !== 'Paid') && (
            <div className="p-3 border-t border-app-border"><Button size="sm" className="no-print" onClick={() => { setPay({ amount: balance.toString(), method:'', transaction_ref:'', notes:'' }); setPayOpen(true); }}>+ Record Payment</Button></div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4"><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div><div className="text-xs text-app-muted">Subtotal</div><div className="font-medium">{money(subtotal)}</div></div>
          <div><div className="text-xs text-app-muted">Discount</div><div className="font-medium">- {money(discountTotal)}</div></div>
          <div><div className="text-xs text-app-muted">Total</div><div className="font-semibold">{money(total)}</div></div>
          <div><div className="text-xs text-app-muted">Paid</div><div className="font-semibold">{money(paid)}</div></div>
          <div className="col-span-2 md:col-span-4 text-right">
            <div className="text-xs text-app-muted">Balance Due</div>
            <div className="text-xl font-semibold">{money(balance)}</div>
          </div>
          <div className="col-span-2 md:col-span-4 flex items-center gap-2">
            {(balance > 0 && bill.status !== 'Paid') && (
              <Button variant="outline" className="no-print" onClick={async ()=>{
                const pct = Number(prompt('Apply discount percent to all items (0-100):','10'));
                if (!Number.isFinite(pct)) return;
                await api.billing.applyDiscount(bill.id, pct);
                notify({ title: 'Discount applied', description: `${pct}%` });
                mutate();
              }}>Apply Discount</Button>
            )}
            {(balance > 0 && bill.status !== 'Paid') && (
              <Button className="no-print" onClick={async ()=>{
                await api.billing.addPayment(bill.id, { billing_id: bill.id, amount: balance, method: 'Cash', transaction_ref: null, notes: 'Marked as paid', created_by: 'staff' });
                notify({ title: 'Marked as Paid' });
                mutate();
              }}>Mark as Paid</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4"><CardTitle>Notes</CardTitle></CardHeader>
        <CardContent className="p-4">
          <textarea className="w-full h-28 rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" defaultValue={bill.notes || ''} onBlur={e => setNotes(e.target.value)} placeholder="Add notes for this bill" />
          <div className="text-right mt-2"><Button variant="outline" onClick={async ()=>{ await api.billing.update(bill.id, { ...bill, notes: notes || '' }); notify({ title: 'Notes saved' }); mutate(); }}>Save Notes</Button></div>
        </CardContent>
      </Card>

      {/* Add Charge */}
      <Dialog open={liOpen} onClose={() => setLiOpen(false)}>
        <DialogHeader><DialogTitle>Add Charge</DialogTitle></DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-app-muted mb-1">Category</div>
              <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={liData.line_item_type} onChange={e => setLiData({ ...liData, line_item_type: e.target.value })}>
                {['Service','Product','Lab','Adjustment','Other'].map(x => (<option key={x} value={x}>{x}</option>))}
              </select>
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Description</div>
              <Input value={liData.description} onChange={e => setLiData({ ...liData, description: e.target.value })} />
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Quantity</div>
              <Input type="number" min="1" value={liData.quantity} onChange={e => setLiData({ ...liData, quantity: Number(e.target.value) })} />
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Price (Rs)</div>
              <Input type="number" step="0.01" value={liData.unit_price} onChange={e => setLiData({ ...liData, unit_price: Number(e.target.value) })} />
            </div>
            <div className="relative">
              <div className="text-xs text-app-muted mb-1">Discount %</div>
              <div className="flex items-center gap-1">
                <Input type="number" min="0" max="100" step="0.01" value={liData.discount_percentage} onChange={e => setLiData({ ...liData, discount_percentage: Number(e.target.value) })} />
                <button
                  type="button"
                  className="size-9 grid place-items-center rounded-md hover:bg-app-bg"
                  aria-label="Choose discount code"
                  onClick={() => setLiDiscountMenuOpen(v => !v)}
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              {liDiscountMenuOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-app-surface border border-app-border rounded-md shadow-sm z-10">
                  <div className="max-h-60 overflow-auto py-1">
                    {(discountTypes||[]).map((d) => (
                      <button
                        key={d.id || d.discount_name}
                        type="button"
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-app-bg"
                        onClick={() => { setLiData({ ...liData, discount_percentage: Number(d.discount_percentage || 0) }); setLiDiscountMenuOpen(false); }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{d.discount_name || 'Discount'}</span>
                          <span className="ml-2 text-app-muted">{Number(d.discount_percentage||0)}%</span>
                        </div>
                      </button>
                    ))}
                    {(!discountTypes || discountTypes.length === 0) && (
                      <div className="px-3 py-2 text-sm text-app-muted">No discount codes</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setLiOpen(false)}>Cancel</Button>
          <Button disabled={!liData.description} onClick={async ()=>{
            await api.billing.addLineItem(bill.id, { billing_id: bill.id, description: liData.description, line_item_type: liData.line_item_type, quantity: Number(liData.quantity||1), unit_price: Number(liData.unit_price||0), discount_percentage: Number(liData.discount_percentage||0) });
            setLiOpen(false); notify({ title: 'Charge added' }); mutate();
          }}>Add Charge</Button>
        </DialogFooter>
      </Dialog>

      {/* Edit Charge */}
      <Dialog open={!!editingLineItem} onClose={() => setEditingLineItem(null)}>
        <DialogHeader><DialogTitle>Edit Charge</DialogTitle></DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-app-muted mb-1">Category</div>
              <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={lineItemDraft.line_item_type} onChange={e => setLineItemDraft({ ...lineItemDraft, line_item_type: e.target.value })}>
                {['Service','Product','Lab','Adjustment','Other'].map(x => (<option key={x} value={x}>{x}</option>))}
              </select>
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Description</div>
              <Input value={lineItemDraft.description} onChange={e => setLineItemDraft({ ...lineItemDraft, description: e.target.value })} />
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Quantity</div>
              <Input type="number" min="1" value={lineItemDraft.quantity} onChange={e => setLineItemDraft({ ...lineItemDraft, quantity: Number(e.target.value) })} />
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Price (Rs)</div>
              <Input type="number" min="0" step="0.01" value={lineItemDraft.unit_price} onChange={e => setLineItemDraft({ ...lineItemDraft, unit_price: Number(e.target.value) })} />
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Discount %</div>
              <Input type="number" min="0" max="100" step="0.01" value={lineItemDraft.discount_percentage} onChange={e => setLineItemDraft({ ...lineItemDraft, discount_percentage: Number(e.target.value) })} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={async () => {
              if (!editingLineItem || !confirm('Remove this charge from the bill?')) return;
              await api.billing.deleteLineItem(bill.id, editingLineItem.id);
              setEditingLineItem(null);
              notify({ title: 'Charge removed', description: 'The bill total was recalculated. Payments were kept.' });
              mutate();
            }}
          >
            Remove
          </Button>
          <Button variant="outline" onClick={() => setEditingLineItem(null)}>Cancel</Button>
          <Button disabled={!lineItemDraft.description} onClick={saveChargeEditor}>Save</Button>
        </DialogFooter>
      </Dialog>

      {/* Record Payment */}
      <Dialog open={payOpen} onClose={() => setPayOpen(false)}>
        <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-app-muted mb-1">Amount (Rs) *</div>
              <Input type="number" min="0.01" step="0.01" value={pay.amount} onChange={e => setPay({ ...pay, amount: e.target.value })} />
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Method *</div>
              <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={pay.method} onChange={e => setPay({ ...pay, method: e.target.value })}>
                <option value="">Select…</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Insurance">Insurance</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile-Pay">Mobile-Pay</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Transaction Ref</div>
              <Input value={pay.transaction_ref} onChange={e => setPay({ ...pay, transaction_ref: e.target.value })} placeholder="e.g., TXN123456" />
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-app-muted mb-1">Notes</div>
              <textarea className="w-full h-20 rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" value={pay.notes} onChange={e => setPay({ ...pay, notes: e.target.value })} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
          <Button disabled={!pay.amount || !pay.method} onClick={async ()=>{
            await api.billing.addPayment(bill.id, { billing_id: bill.id, amount: Number(pay.amount), method: pay.method, transaction_ref: pay.transaction_ref || null, notes: pay.notes || null, created_by: 'staff' });
            setPayOpen(false); notify({ title: 'Payment recorded' }); mutate();
          }}>Record</Button>
        </DialogFooter>
      </Dialog>

    </div>
  );
}
