'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, Home, CalendarDays, UserCog, Download } from 'lucide-react';
import { StatusPill } from '@/components/ui/status-pill';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import Dialog, { DialogBody, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TeethSelector from '@/components/dental/teeth-selector';

export default function PatientDetailsPage() {
  const params = useParams();
  const { id } = params;

  const { data: patient, error, mutate } = useSWR(id ? `patients/${id}` : null, () => api.patient.getById(id));
  const { data: statuses } = useSWR('appointment-status', () => api.lookup.appointmentStatus.getAll());
  const { data: docTypes } = useSWR('doc-types', () => api.lookup.documentTypes.getAll());
  const { data: billings } = useSWR('patient-billings', () => api.billing.getAll());
  // Fallback: Load appointments directly and filter by patient if not present on patient
  const { data: allAppointments } = useSWR('appts-all', () => api.appointment.getAll());
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('');
  const [desc, setDesc] = useState('');
  const { notify } = useToast();
  // Additional data/hooks must be declared before any conditional returns
  const { data: documents } = useSWR('patient-docs', () => api.document.getAll());
  const { data: docTypesMini } = useSWR('doc-types-mini', () => api.lookup.documentTypes.getAll());
  const [newTag, setNewTag] = useState('');

  if (error) return <div className="text-red-600">Failed to load patient details.</div>;
  if (!patient) return <div>Loading...</div>;

  const person = patient.person || {};
  const name = `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Patient';
  const initial = (person.first_name || person.last_name || 'P').charAt(0).toUpperCase();
  const tagsType = ((docTypesMini||docTypes||[])).find(d => String(d.name||d.document_type||d.code||'').toLowerCase().includes('tag'));
  const tags = (documents||[]).filter(d => d.patient_id === patient.id && (!!tagsType ? d.document_type_id === tagsType.id : true) && (d.description||'').startsWith('tag:'));

  // (moved allAppointments hook above to keep hook order stable)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Avatar className="bg-teal-600/10 text-teal-700"><AvatarFallback>{initial}</AvatarFallback></Avatar>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
          <div className="text-sm text-app-muted">Patient ID: {patient.id}</div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {(tags||[]).map(t => (
              <span key={t.id} className="px-2 py-0.5 rounded-full text-xs bg-sky-600/10 text-sky-700">{(t.description||'').replace(/^tag:/,'')}</span>
            ))}
            <form className="flex items-center gap-1" onSubmit={async (e) => {
              e.preventDefault();
              const label = (newTag||'').trim();
              if (!label) return;
              const type = tagsType || (docTypesMini||docTypes||[])[0];
              if (!type) { alert('No DocumentType found to save tags. Please add one named "Tag".'); return; }
              await api.document.create({ patient_id: patient.id, document_type_id: type.id, description: `tag:${label}`, document_path: '/virtual/tag', upload_date: new Date().toISOString(), is_sensitive: false });
              setNewTag('');
            }}>
              <input className="h-7 border border-app-border rounded px-2 text-xs" placeholder="Add tag" value={newTag} onChange={(e)=>setNewTag(e.target.value)} />
              <Button size="xs" type="submit">Add</Button>
            </form>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2"><Mail size={16} className="text-app-muted" /> {person.email || '—'}</div>
              <div className="flex items-center gap-2"><Phone size={16} className="text-app-muted" /> {person.phone_number || '—'}</div>
              <div className="flex items-center gap-2"><Home size={16} className="text-app-muted" /> {person.address || '—'}</div>
            </div>
            <div className="space-y-2">
              <div>DOB: <span className="font-medium">{person.date_of_birth ? new Date(person.date_of_birth).toLocaleDateString() : '—'}</span></div>
              <div>Gender: <span className="font-medium">{person.gender || '—'}</span></div>
              <div>Emergency: <span className="font-medium">{patient.emergency_contact_name || '—'}{patient.emergency_contact_phone ? ` (${patient.emergency_contact_phone})` : ''}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="teeth">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="teeth">Teeth</TabsTrigger>
        </TabsList>
        <div className="mt-2 flex items-center justify-end">
          <Button variant="destructive" onClick={async () => {
            const warn = 'This will permanently delete the patient and ALL related records: appointments, treatments, billings, payments, teeth, documents, and more. This action cannot be undone.\n\nType DELETE to confirm.';
            const input = prompt(warn);
            if (input !== 'DELETE') return;
            await api.patient.delete(patient.id);
            notify({ title: 'Patient deleted' });
            window.location.href = '/patients';
          }}>Delete Patient</Button>
        </div>
        <TabsContent value="appointments">
          <div className="space-y-2">
            {(() => {
              const appts = (patient.appointments && patient.appointments.length>0)
                ? patient.appointments
                : (allAppointments||[]).filter(a => (a.patient?.id || a.patient_id) === patient.id);
              if (appts.length === 0) return (
                <div className="text-sm text-app-muted">No appointments.</div>
              );
              return appts.map((a) => {
                const s = a.staff?.person || {}; const t = new Date(a.appointment_start_time);
                const sid = a.status_id || a.status?.id;
                const statusName = (statuses || []).find(st => st.id === sid)?.name || a.status?.name || '—';
                return (
                  <Card key={a.id} className="cursor-pointer" onClick={() => { window.location.href = `/appointments/${a.id}`; }}>
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-app-muted flex items-center gap-2"><CalendarDays size={16} /> {t.toLocaleDateString()} {t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-sm flex items-center gap-2"><UserCog size={16} className="text-app-muted" /> {`${s.first_name || ''} ${s.last_name || ''}`.trim()}</div>
                      </div>
                      <div className="shrink-0"><StatusPill text={statusName} /></div>
                    </CardContent>
                  </Card>
                );
              });
            })()}
          </div>
        </TabsContent>
        <TabsContent value="documents">
          <Card>
            <CardHeader><CardTitle>Upload Document</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-app-muted mb-1">File</div>
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
                <div>
                  <div className="text-xs text-app-muted mb-1">Type</div>
                  <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={docType} onChange={(e) => setDocType(e.target.value)}>
                    <option value="">Choose…</option>
                    {(docTypes || []).map(dt => (<option key={dt.id} value={dt.id}>{dt.name}</option>))}
                  </select>
                </div>
                <div>
                  <div className="text-xs text-app-muted mb-1">Description</div>
                  <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div className="text-right">
                <Button disabled={!file || !docType} onClick={async () => {
                  const fd = new FormData();
                  fd.append('file', file);
                  fd.append('patient_id', patient.id);
                  fd.append('document_type_id', docType);
                  fd.append('description', desc || file.name);
                  await api.document.upload(fd);
                  setFile(null); setDocType(''); setDesc('');
                  mutate();
                  notify({ title: 'Document uploaded' });
                }}>Upload</Button>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {(documents || [])
              .filter(d => d.patient_id === patient.id && !(d.description || '').startsWith('tag:'))
              .map(d => (
                <Card key={d.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{d.description || 'Document'}</div>
                      <div className="text-xs text-app-muted">{d.upload_date ? new Date(d.upload_date).toLocaleDateString() : ''}</div>
                    </div>
                    <button
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors shrink-0"
                      title="View / Download"
                      onClick={async () => {
                        try {
                          const { url } = await api.document.getDownloadUrl(d.id);
                          window.open(url, '_blank');
                        } catch { notify({ title: 'Download not available' }); }
                      }}
                    >
                      <Download size={16} />
                    </button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="billing">
          <Card>
            <CardHeader><CardTitle>Billing Summary</CardTitle></CardHeader>
            <CardContent>
              <PatientBillingList patientId={patient.id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="treatments">
          <div className="text-sm text-app-muted">No treatments.</div>
        </TabsContent>
        <TabsContent value="prescriptions">
          <div className="text-sm text-app-muted">No prescriptions.</div>
        </TabsContent>
        <TabsContent value="teeth">
          <PatientTeethPanel patient={patient} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PatientBillingList({ patientId }) {
  const { data: billings, mutate } = useSWR('patient-billings', () => api.billing.getAll());
  const { notify } = useToast();
  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [amount, setAmount] = useState('');
  const list = (billings || []).filter(b => b.patient_id === patientId);
  const total = list.reduce((s,b) => s + Number(b.total_amount||0), 0);
  const paid = list.reduce((s,b) => s + Number(b.amount_paid||0), 0);
  const remaining = Math.max(0, total - paid);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div><div className="text-xs text-app-muted">Total</div><div className="font-semibold">Rs {total.toLocaleString()}</div></div>
        <div><div className="text-xs text-app-muted">Paid</div><div className="font-semibold">Rs {paid.toLocaleString()}</div></div>
        <div><div className="text-xs text-app-muted">Remaining</div><div className="font-semibold">Rs {remaining.toLocaleString()}</div></div>
      </div>
      <div className="divide-y divide-app-border rounded border border-app-border">
        {list.length === 0 && <div className="text-sm text-app-muted p-3">No billing records.</div>}
        {list.map(b => {
          const rem = Math.max(0, Number(b.total_amount||0) - Number(b.amount_paid||0));
          const fully = rem <= 0;
          return (
            <div key={b.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{new Date(b.issue_date).toLocaleDateString()} · {b.status}</div>
                <div className="text-xs text-app-muted">Due {new Date(b.due_date).toLocaleDateString()}</div>
              </div>
              <div className="text-right text-sm">
                <div>Total Rs {Number(b.total_amount||0).toLocaleString()}</div>
                <div className="text-app-muted">Paid Rs {Number(b.amount_paid||0).toLocaleString()}</div>
                {!fully && (
                  <div className="mt-2 flex items-center justify-end gap-2">
                    <Button size="sm" onClick={() => { setPayTarget(b); setAmount(''); setPayOpen(true); }}>Add Payment</Button>
                    <Button size="sm" variant="outline" onClick={async () => { await api.billing.update(b.id, { ...b, amount_paid: b.total_amount, status: 'Paid' }); notify({ title: 'Marked as paid' }); mutate(); }}>Mark Paid</Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <Dialog open={payOpen} onClose={() => setPayOpen(false)}>
        <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
        <DialogBody>
          <div className="text-sm">Amount (Rs)</div>
          <Input type="number" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
          <Button onClick={async () => { const amt = Math.max(0, Number(amount||0)); const newPaid = Math.min(Number(payTarget.amount_paid||0) + amt, Number(payTarget.total_amount||0)); const status = newPaid >= Number(payTarget.total_amount||0) ? 'Paid' : 'Partial'; await api.billing.update(payTarget.id, { ...payTarget, amount_paid: newPaid, status }); setPayOpen(false); notify({ title: 'Payment recorded', description: `Rs ${amt.toLocaleString()}` }); mutate(); }}>Save</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function PatientTeethPanel({ patient }) {
  const { notify } = useToast();
  const { data: allTeeth, mutate } = useSWR('teeth', () => api.teeth.getAll());
  const { data: statuses } = useSWR('tooth-status', () => api.lookup.toothStatus.getAll());
  const [selectedFdi, setSelectedFdi] = useState(new Set()); // selected by FDI numbers

  const dob = patient.person?.date_of_birth ? new Date(patient.person.date_of_birth) : null;
  const today = new Date();
  const age = dob ? (today.getFullYear() - dob.getFullYear() - ((today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) ? 1 : 0)) : null;
  const primaryMode = age !== null ? age < 14 : false;

  const [showPermanent, setShowPermanent] = useState(!primaryMode);
  const [showPrimary, setShowPrimary] = useState(primaryMode);

  if (!allTeeth) return <div>Loading…</div>;
  const fullList = (allTeeth || []).filter(t => t.patient_id === patient.id).sort((a,b) => Number(a.tooth_number||0) - Number(b.tooth_number||0));
  const dentitionPrimary = fullList.length > 0 && Math.max(...fullList.map(t => Number(t.tooth_number||0))) <= 20;
  const list = fullList.filter(t => {
    // Only one dentition exists per patient; honor toggles accordingly
    if (dentitionPrimary) return showPrimary; // show all or none
    return showPermanent; // permanent set
  });

  const regionSets = dentitionPrimary ? {
    // Primary universal: 1–5 UR, 6–10 UL, 11–15 LL, 16–20 LR
    full: list.map(t => Number(t.tooth_number)),
    upperArch: list.filter(t => { const n=Number(t.tooth_number); return n>=1 && n<=10; }).map(t=>Number(t.tooth_number)),
    lowerArch: list.filter(t => { const n=Number(t.tooth_number); return n>=11 && n<=20; }).map(t=>Number(t.tooth_number)),
    q1: list.filter(t => { const n=Number(t.tooth_number); return n>=1 && n<=5; }).map(t=>Number(t.tooth_number)),
    q2: list.filter(t => { const n=Number(t.tooth_number); return n>=6 && n<=10; }).map(t=>Number(t.tooth_number)),
    q3: list.filter(t => { const n=Number(t.tooth_number); return n>=11 && n<=15; }).map(t=>Number(t.tooth_number)),
    q4: list.filter(t => { const n=Number(t.tooth_number); return n>=16 && n<=20; }).map(t=>Number(t.tooth_number)),
  } : {
    // Permanent universal: 1–8 UR, 9–16 UL, 17–24 LL, 25–32 LR; arches: 1–16 upper, 17–32 lower
    full: list.map(t => Number(t.tooth_number)),
    upperArch: list.filter(t => { const n=Number(t.tooth_number); return n>=1 && n<=16; }).map(t=>Number(t.tooth_number)),
    lowerArch: list.filter(t => { const n=Number(t.tooth_number); return n>=17 && n<=32; }).map(t=>Number(t.tooth_number)),
    q1: list.filter(t => { const n=Number(t.tooth_number); return n>=1 && n<=8; }).map(t=>Number(t.tooth_number)),
    q2: list.filter(t => { const n=Number(t.tooth_number); return n>=9 && n<=16; }).map(t=>Number(t.tooth_number)),
    q3: list.filter(t => { const n=Number(t.tooth_number); return n>=17 && n<=24; }).map(t=>Number(t.tooth_number)),
    q4: list.filter(t => { const n=Number(t.tooth_number); return n>=25 && n<=32; }).map(t=>Number(t.tooth_number)),
  };

  const toggle = (id) => {
    // map id to FDI number
    const t = fullList.find(z => z.id === id);
    if (!t) return;
    const n = Number(t.tooth_number);
    setSelectedFdi(prev => { const next = new Set(prev); if (next.has(n)) next.delete(n); else next.add(n); return next; });
  };
  const setRegion = (numbers) => setSelectedFdi(new Set(numbers));

  // Build color map by status for nice UI
  const colorized = {};
  for (const t of fullList) {
    const n = Number(t.tooth_number);
    colorized[n] = colorForStatus((statuses||[]).find(s => s.id === t.tooth_status_id)?.code || (statuses||[]).find(s => s.id === t.tooth_status_id)?.name || 'HEALTHY');
  }

  return (
    <div className="space-y-3">
      {/* Visual selector */}
      <div className="rounded border border-app-border p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Dental Chart</div>
          <div className="flex items-center gap-4 text-sm">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={showPermanent} onChange={(e)=>setShowPermanent(e.target.checked)} /> Permanent</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={showPrimary} onChange={(e)=>setShowPrimary(e.target.checked)} /> Primary</label>
          </div>
        </div>
        <TeethSelector
          showPermanent={showPermanent}
          showPrimary={showPrimary}
          selectMode="multiple"
          value={Array.from(selectedFdi)}
          colorized={colorized}
          onChange={(next) => setSelectedFdi(new Set((next||[]).map(Number)))}
        />
      </div>
      <div className="flex items-center gap-4 text-sm"></div>
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-xs text-app-muted">Quick select:</span>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.full)}>All</Button>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.upperArch)}>Upper Arch</Button>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.lowerArch)}>Lower Arch</Button>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.q1)}>Quadrant 1</Button>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.q2)}>Quadrant 2</Button>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.q3)}>Quadrant 3</Button>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.q4)}>Quadrant 4</Button>
        <span className="ml-auto text-xs text-app-muted">{primaryMode ? 'Primary dentition' : 'Permanent dentition'}{(showPrimary && showPermanent) ? ' (Both)' : ''}</span>
      </div>
      <div className="mt-2">
        <Button size="sm" variant="secondary" disabled={selectedFdi.size === 0} onClick={() => {
          const ids = Array.from(selectedFdi).map(n => (fullList.find(t => Number(t.tooth_number) === Number(n))?.id)).filter(Boolean);
          if (ids.length === 0) return;
          const query = new URLSearchParams({ patientId: patient.id, teeth: ids.join(',') });
          window.location.href = `/appointments/new?${query.toString()}`;
        }}>Schedule appointment with selected</Button>
      </div>

      <div className="rounded border border-app-border overflow-hidden">
        <div className="grid grid-cols-6 bg-app-bg text-xs font-medium border-b border-app-border">
          <div className="p-2">#</div>
          <div className="p-2 col-span-2">Name</div>
          <div className="p-2">Status</div>
          <div className="p-2 col-span-2">Actions</div>
        </div>
        {list.map(t => (
          <div key={t.id} className="grid grid-cols-6 items-center text-sm border-b border-app-border">
            <div className="p-2 flex items-center gap-2">
              <input type="checkbox" checked={selectedFdi.has(Number(t.tooth_number))} onChange={() => toggle(t.id)} />
              <span>{t.tooth_number}</span>
            </div>
            <div className="p-2 col-span-2 truncate">{t.tooth_name || ''}</div>
            <div className="p-2">
              <select className="h-9 rounded-md border border-app-border bg-app-surface px-2 text-sm" defaultValue={t.tooth_status_id} onChange={async (e) => { await api.teeth.update(t.id, { ...t, tooth_status_id: e.target.value }); notify({ title: 'Tooth status updated' }); mutate(); }}>
                {(statuses||[]).map(s => (<option key={s.id} value={s.id}>{s.name || s.description || s.code}</option>))}
              </select>
            </div>
            <div className="p-2 col-span-2"></div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={() => {
          const ids = Array.from(selectedFdi).map(n => (fullList.find(t => Number(t.tooth_number) === Number(n))?.id)).filter(Boolean);
          if (ids.length === 0) return;
          const query = new URLSearchParams({ patientId: patient.id, teeth: ids.join(',') });
          window.location.href = `/appointments/new?${query.toString()}`;
        }}>Schedule appointment with selected</Button>
      </div>
    </div>
  );
}

function colorForStatus(codeRaw) {
  const code = String(codeRaw || '').toLowerCase();
  if (code.includes('healthy')) return '#ffffff';
  if (code.includes('fill')) return '#9ca3af';
  if (code.includes('miss')) return '#f3f4f6';
  if (code.includes('decay') || code.includes('caries') || code.includes('attention')) return '#fecaca';
  return '#ffffff';
}
