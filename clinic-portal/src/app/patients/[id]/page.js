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
import { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import Dialog, { DialogBody, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DentalChart from '@/components/dental/dental-chart';
import PerioGrid from '@/components/dental/perio-grid';
import { SurfaceSelector } from '@/components/dental/surface-selector';
import {
  getToothQuadrant,
  getToothDisplayNumber,
  inferPermanentNumberingSystem,
  isLowerTooth,
  isUpperTooth,
  normalizeToChartTooth,
} from '@/components/dental/tooth-numbering';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';

export default function PatientDetailsPage() {
  const params = useParams();
  const { id } = params;

  const { data: patient, error, mutate } = useSWR(id ? `patients/${id}` : null, () => api.patient.getById(id));
  const { data: statuses } = useSWR('appointment-status', () => api.lookup.appointmentStatus.getAll());
  const { data: docTypes } = useSWR('doc-types', () => api.lookup.documentTypes.getAll());
  const { data: billings } = useSWR('patient-billings', () => api.billing.getAll());
  // Fallback: Load appointments directly and filter by patient if not present on patient
  const { data: allAppointments } = useSWR('appts-all', () => api.appointment.getAll());
  // Treatments, staff, services for Treatments tab
  const { data: allTreatments, mutate: mutateTreatments } = useSWR('treatments', () => api.treatments.getAll());
  const { data: services } = useSWR('services', () => api.service.getAll());
  const { data: staff } = useSWR('staff-all', () => api.staff.getAll());
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('');
  const [desc, setDesc] = useState('');
  const { notify } = useToast();
  // Additional data/hooks must be declared before any conditional returns
  const { data: documents } = useSWR('patient-docs', () => api.document.getAll());
  const { data: docTypesMini } = useSWR('doc-types-mini', () => api.lookup.documentTypes.getAll());
  const [newTag, setNewTag] = useState('');
  // Add Treatment dialog state
  const [addOpen, setAddOpen] = useState(false);
  const todayLocal = (() => { const d = new Date(); const pad = (n)=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; })();
  const [add, setAdd] = useState({ when: todayLocal, serviceId: '', toothNumber: '', staffId: '', status: 'Planned', notes: '', surfaces: '' });

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
          <div className="flex items-center justify-between">
            <CardTitle>Profile</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild><a href={`/appointments/new?patientId=${patient.id}`}>Quick Appointment</a></Button>
            </div>
          </div>
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
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-app-muted">Patient treatments</div>
            <Button size="sm" onClick={() => { setAdd({ when: todayLocal, serviceId: '', toothNumber: '', staffId: '', status: 'Planned', notes: '', surfaces: '' }); setAddOpen(true); }}>+ Add Treatment</Button>
          </div>
          <div className="rounded-md border border-app-border overflow-hidden">
            <Table>
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Treatment</Th>
                  <Th>Tooth/Area</Th>
                  <Th>Dentist/Provider</Th>
                  <Th>Status</Th>
                  <Th>Notes</Th>
                  <Th className="text-right">Cost</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(() => {
                  const rows = (allTreatments || []).filter(t => t.patient_id === patient.id);
                  if (rows.length === 0) return (
                    <Tr><Td colSpan={7} className="text-center py-6 text-sm text-app-muted">No treatments recorded for this patient.</Td></Tr>
                  );
                  return rows
                    .sort((a,b) => new Date(b.completed_at || b.created_at || 0) - new Date(a.completed_at || a.created_at || 0))
                    .map(t => {
                      const date = new Date(t.completed_at || t.created_at || new Date());
                      const svcName = t.service_name || (services||[]).find(s => s.id === t.service_id)?.name || '—';
                      const svcCost = Number((services||[]).find(s => s.id === t.service_id)?.cost || 0);
                      const provider = (staff||[]).find(s => s.id === t.staff_id)?.person || {};
                      const providerName = `${provider.first_name || ''} ${provider.last_name || ''}`.trim() || '—';
                      const status = t.status || 'Planned';
                      const tooths = (t.tooth_numbers && t.tooth_numbers.length > 0) ? t.tooth_numbers
                        : (t.tooth_number ? [t.tooth_number] : []);
                      const area = tooths.length > 0 ? `#${tooths.join(', #')}` : (t.treatment_scope && t.treatment_scope.toUpperCase().includes('MOUTH') ? 'Full Mouth' : 'General');
                      return (
                        <Tr key={t.id}>
                          <Td>{date.toLocaleDateString()}</Td>
                          <Td>{svcName}</Td>
                          <Td>{area}</Td>
                          <Td>{providerName}</Td>
                          <Td>{status}</Td>
                          <Td className="truncate max-w-[220px]">{t.notes || '—'}</Td>
                          <Td className="text-right">{svcCost ? `Rs ${svcCost.toLocaleString()}` : '—'}</Td>
                        </Tr>
                      );
                    });
                })()}
              </Tbody>
            </Table>
          </div>

          {/* Add Treatment Modal */}
          <Dialog open={addOpen} onClose={() => setAddOpen(false)}>
            <DialogHeader><DialogTitle>Add Treatment</DialogTitle></DialogHeader>
            <DialogBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-app-muted mb-1">Date & Time</div>
                  <Input type="datetime-local" value={add.when} onChange={(e) => setAdd(prev => ({ ...prev, when: e.target.value }))} />
                </div>
                <div>
                  <div className="text-xs text-app-muted mb-1">Provider</div>
                  <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={add.staffId} onChange={(e)=> setAdd(prev => ({ ...prev, staffId: e.target.value }))}>
                    <option value="">Select…</option>
                    {(staff||[]).map(s => {
                      const p = s.person || {}; const name = `${p.first_name||''} ${p.last_name||''}`.trim();
                      return <option key={s.id} value={s.id}>{name || s.id}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <div className="text-xs text-app-muted mb-1">Treatment Type</div>
                  <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={add.serviceId} onChange={(e)=> setAdd(prev => ({ ...prev, serviceId: e.target.value }))}>
                    <option value="">Select…</option>
                    {(services||[]).map(s => (
                      <option key={s.id} value={s.id}>{s.name} — Rs {Number(s.cost||0).toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="text-xs text-app-muted mb-1">Tooth number (optional)</div>
                  <Input placeholder="# e.g., 14" value={add.toothNumber} onChange={(e)=> setAdd(prev => ({ ...prev, toothNumber: e.target.value.replace(/[^0-9,]/g,'') }))} />
                </div>
                {add.serviceId && (services||[]).find(s => String(s.id) === String(add.serviceId))?.visual_cue_code === 'FILLING' && (
                  <div className="md:col-span-2">
                    <SurfaceSelector value={add.surfaces} onChange={(s) => setAdd(prev => ({ ...prev, surfaces: s }))} />
                  </div>
                )}
                <div>
                  <div className="text-xs text-app-muted mb-1">Status</div>
                  <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={add.status} onChange={(e)=> setAdd(prev => ({ ...prev, status: e.target.value }))}>
                    {['Planned','In Progress','Completed'].map(x => (<option key={x} value={x}>{x}</option>))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-app-muted mb-1">Notes</div>
                  <textarea className="w-full h-24 rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" value={add.notes} onChange={(e)=> setAdd(prev => ({ ...prev, notes: e.target.value }))} />
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button disabled={!add.serviceId || !add.staffId} onClick={async () => {
                try {
                  // Create appointment for this treatment
                  const target = new Date(add.when);
                  // Pick an appropriate appointment status (In Progress > Scheduled > first)
                  const stName = (n) => (n||'').toLowerCase();
                  const inProg = (statuses||[]).find(s => stName(s.name).includes('progress'))?.id;
                  const sched = (statuses||[]).find(s => stName(s.name).includes('sched'))?.id;
                  const statusId = inProg || sched || (statuses||[])[0]?.id;
                  const svcName = (services||[]).find(s => String(s.id)===String(add.serviceId))?.name || 'Treatment';
                  const appt = await api.appointment.create({
                    patient_id: patient.id,
                    staff_id: add.staffId,
                    status_id: statusId,
                    appointment_start_time: target.toISOString(),
                    duration_minutes: 30,
                    reason_for_visit: `Treatment: ${svcName}`,
                    notes: add.notes || ''
                  });
                  // Create treatment
                  const payload = {
                    appointment_id: appt.id || appt.Id,
                    patient_id: patient.id,
                    staff_id: add.staffId,
                    service_id: add.serviceId,
                    notes: add.notes || '',
                    surfaces: add.surfaces || ''
                  };
                  const tn = String(add.toothNumber||'').trim();
                  if (tn) {
                    const arr = tn.split(',').map(x => Number(x.trim())).filter(n => Number.isFinite(n));
                    if (arr.length === 1) payload.tooth_number = arr[0];
                    if (arr.length > 1) payload.tooth_numbers = arr;
                  }
                  const created = await api.treatments.create(payload);
                  if (add.status === 'Completed' && created?.id) {
                    await api.treatments.complete(created.id);
                  }
                  setAddOpen(false);
                  notify({ title: 'Treatment added' });
                  mutateTreatments();
                } catch (e) {
                  notify({ title: 'Failed to add treatment', description: e?.info?.message || e?.message || 'Please try again.' });
                }
              }}>Save</Button>
            </DialogFooter>
          </Dialog>
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
  const { data: allTeeth, mutate } = useSWR(patient ? `teeth-${patient.id}` : null, () => api.teeth.getAll({ patientId: patient.id }));
  const { data: statuses } = useSWR('tooth-status', () => api.lookup.toothStatus.getAll());
  const { data: treatments } = useSWR(patient ? `treatments-${patient.id}` : null, () => api.treatments.getAll({ patientId: patient.id }));
  const { data: documents } = useSWR(patient ? `documents-${patient.id}` : null, () => api.document.getAll({ patientId: patient.id }));
  const { data: services } = useSWR('services', () => api.service.getAll());
  const [selectedFdi, setSelectedFdi] = useState(new Set()); // selected by FDI numbers

  const dob = patient.person?.date_of_birth ? new Date(patient.person.date_of_birth) : null;
  const today = new Date();
  const age = dob ? (today.getFullYear() - dob.getFullYear() - ((today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) ? 1 : 0)) : null;
  const primaryMode = age !== null ? age < 14 : false;

  const [showPermanent, setShowPermanent] = useState(!primaryMode);
  const [showPrimary, setShowPrimary] = useState(primaryMode);

  const fullList = useMemo(() => {
    return (allTeeth || [])
      .filter(t => t.patient_id === patient.id)
      .sort((a,b) => Number(a.tooth_number||0) - Number(b.tooth_number||0));
  }, [allTeeth, patient.id]);

  const numberingSystem = useMemo(() => {
    return inferPermanentNumberingSystem(fullList.map(t => t.tooth_number));
  }, [fullList]);

  const mapped = useMemo(() => {
    return fullList.map(t => {
      const normalized = normalizeToChartTooth(t.tooth_number, numberingSystem);
      return {
        ...t,
        chartKind: normalized?.kind,
        chartNumber: normalized?.chartNumber,
        displayNumber: normalized?.displayNumber,
      };
    });
  }, [fullList, numberingSystem]);

  const hasPermanent = mapped.some(t => t.chartKind === 'permanent');
  const hasPrimary = mapped.some(t => t.chartKind === 'primary');

  useEffect(() => {
    if (!allTeeth) return;
    if (hasPrimary && !hasPermanent) {
      setShowPrimary(true);
      setShowPermanent(false);
    } else if (hasPermanent && !hasPrimary) {
      setShowPermanent(true);
      setShowPrimary(false);
    } else if (hasPermanent && hasPrimary) {
      setShowPermanent(true);
      setShowPrimary(true);
    }
  }, [allTeeth, hasPermanent, hasPrimary]);

  const list = useMemo(() => mapped.filter(t =>
    (t.chartKind === 'permanent' && showPermanent) ||
    (t.chartKind === 'primary' && showPrimary)
  ), [mapped, showPermanent, showPrimary]);

  const regionSets = useMemo(() => ({
    full: list.map(t => t.chartNumber).filter(Boolean),
    upperArch: list.filter(t => isUpperTooth(t.chartKind, t.chartNumber)).map(t => t.chartNumber),
    lowerArch: list.filter(t => isLowerTooth(t.chartKind, t.chartNumber)).map(t => t.chartNumber),
    q1: list.filter(t => getToothQuadrant(t.chartKind, t.chartNumber) === 'q1').map(t => t.chartNumber),
    q2: list.filter(t => getToothQuadrant(t.chartKind, t.chartNumber) === 'q2').map(t => t.chartNumber),
    q3: list.filter(t => getToothQuadrant(t.chartKind, t.chartNumber) === 'q3').map(t => t.chartNumber),
    q4: list.filter(t => getToothQuadrant(t.chartKind, t.chartNumber) === 'q4').map(t => t.chartNumber),
  }), [list]);

  const toggle = (id) => {
    const t = mapped.find(z => z.id === id);
    if (!t || !t.chartNumber) return;
    const n = Number(t.chartNumber);
    setSelectedFdi(prev => { const next = new Set(prev); if (next.has(n)) next.delete(n); else next.add(n); return next; });
  };
  const setRegion = (numbers) => setSelectedFdi(new Set(numbers));

  const selectedChartNumbers = useMemo(() => Array.from(selectedFdi).map(Number), [selectedFdi]);
  
  // Build history entries
  const historyEntries = useMemo(() => {
    if (!treatments) return [];
    const formatRawNumbers = (numbers) => {
      const labels = (numbers || [])
        .map(n => getToothDisplayNumber(n, numberingSystem))
        .filter(Boolean)
        .map(n => `#${n}`);
      return labels.length > 0 ? labels.join(', ') : 'Full Mouth';
    };
    let tList = treatments.filter(t => t.patient_id === patient.id);
    if (selectedChartNumbers.length > 0) {
      tList = tList.filter(t => {
        const tn = t.tooth_numbers || (t.tooth_number ? [t.tooth_number] : []);
        const normalizedNumbers = tn
          .map(n => normalizeToChartTooth(n, numberingSystem)?.chartNumber)
          .filter(Boolean);
        return selectedChartNumbers.some(num => normalizedNumbers.includes(num)) || t.treatment_scope?.toUpperCase().includes('MOUTH');
      });
    }
    
    let dList = (documents || []).filter(d => d.patient_id === patient.id);
    if (selectedChartNumbers.length > 0) {
      // Find specific tooth IDs for selected universal numbers
      const selectedIds = mapped.filter(t => selectedChartNumbers.includes(Number(t.chartNumber))).map(t => t.id);
      dList = dList.filter(d => d.tooth_id && selectedIds.includes(d.tooth_id));
    }

    const unified = [
      ...tList.map(t => ({
        id: t.id,
        date: t.completed_at || t.created_at,
        type: 'Treatment',
        title: t.service_name || (services||[]).find(s => s.id === t.service_id)?.name || 'Treatment',
        status: t.status,
        notes: t.notes || '',
        teeth: formatRawNumbers(t.tooth_numbers || (t.tooth_number ? [t.tooth_number] : [])),
        surfaces: t.surfaces || ''
      })),
      ...dList.map(d => ({
        id: d.id,
        date: d.upload_date || d.created_at,
        type: 'Document',
        title: d.document_type_code || d.description || 'Image',
        status: 'Uploaded',
        notes: d.description || '',
        teeth: mapped.find(t => t.id === d.tooth_id)?.displayNumber || '',
        surfaces: ''
      }))
    ];
    return unified.sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [treatments, documents, selectedChartNumbers, patient.id, services, mapped, numberingSystem]);

  // UI toggle for showing/hiding the dental history list
  const [historyOpen, setHistoryOpen] = useState(true);

  // Latest periodontal data for this patient
  const [perioInitial, setPerioInitial] = useState({ pd: {}, gm: {}, cal: {}, bop: {}, mobility: {}, furcation: {} });
  useEffect(() => {
    (async () => {
      try {
        const latest = await api.perio.getLatest(patient.id);
        const pd = {}; const gm = {}; const cal = {}; const bop = {};
        const mobility = {}; const furcation = {};
        for (const m of (latest?.measurements || [])) {
          const t = Number(normalizeToChartTooth(m.tooth_number, numberingSystem)?.chartNumber);
          if (!Number.isFinite(t)) continue;
          pd[t] = pd[t] || {}; gm[t] = gm[t] || {}; cal[t] = cal[t] || {}; bop[t] = bop[t] || {};
          pd[t][m.site_index] = m.pocket_depth;
          gm[t][m.site_index] = m.gingival_margin;
          cal[t][m.site_index] = m.clinical_attachment_level;
          bop[t][m.site_index] = !!m.bleeding_on_probing;
          mobility[t] = Math.max(mobility[t] || 0, m.mobility || 0);
          furcation[t] = Math.max(furcation[t] || 0, m.furcation || 0);
        }
        setPerioInitial({ pd, gm, cal, bop, mobility, furcation });
      } catch {
        setPerioInitial({ pd: {}, gm: {}, cal: {}, bop: {}, mobility: {}, furcation: {} });
      }
    })();
  }, [patient.id, numberingSystem]);

  if (!allTeeth) return <div>Loading…</div>;

  return (
    <div className="space-y-3">
      {/* Visual selector using shared DentalChart */}
      <DentalChart
        patientId={patient.id}
        selectMode="multiple"
        selectedTeeth={Array.from(selectedFdi)}
        onSelectionChange={(next) => setSelectedFdi(new Set((next||[]).map(Number)))}
        showDetailsInMultiple
        className="min-h-[640px]"
      />
      {(hasPermanent || hasPrimary) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex rounded-md border border-app-border bg-white p-1 text-xs shadow-sm">
            <button
              type="button"
              disabled={!hasPermanent}
              onClick={() => {
                if (!hasPermanent) return;
                setShowPermanent(prev => {
                  const next = !prev;
                  if (!next && !showPrimary) setShowPrimary(true);
                  return next;
                });
              }}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${showPermanent ? 'bg-teal-600 text-white shadow-sm' : 'text-app-muted hover:bg-slate-50'} ${!hasPermanent ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              Permanent
            </button>
            <button
              type="button"
              disabled={!hasPrimary}
              onClick={() => {
                if (!hasPrimary) return;
                setShowPrimary(prev => {
                  const next = !prev;
                  if (!next && !showPermanent) setShowPermanent(true);
                  return next;
                });
              }}
              className={`rounded px-3 py-1.5 font-medium transition-colors ${showPrimary ? 'bg-sky-600 text-white shadow-sm' : 'text-app-muted hover:bg-slate-50'} ${!hasPrimary ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              Primary
            </button>
          </div>
          <span className="text-xs text-app-muted">{showPrimary && showPermanent ? 'Mixed dentition' : showPrimary ? 'Primary dentition' : 'Permanent dentition'}</span>
        </div>
      )}
      <div className="flex items-center flex-wrap gap-2">
        <span className="text-xs text-app-muted">Quick select:</span>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.full)}>All</Button>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.upperArch)}>Upper Arch</Button>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.lowerArch)}>Lower Arch</Button>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.q1)}>Quadrant 1</Button>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.q2)}>Quadrant 2</Button>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.q3)}>Quadrant 3</Button>
        <Button size="sm" variant="outline" onClick={() => setRegion(regionSets.q4)}>Quadrant 4</Button>
      </div>
      <div className="mt-2">
        <Button size="sm" variant="secondary" disabled={selectedFdi.size === 0} onClick={() => {
          const ids = Array.from(selectedFdi).map(n => (mapped.find(t => Number(t.chartNumber) === Number(n))?.id)).filter(Boolean);
          if (ids.length === 0) return;
          const query = new URLSearchParams({ patientId: patient.id, teeth: ids.join(',') });
          window.location.href = `/appointments/new?${query.toString()}`;
        }}>Schedule appointment with selected</Button>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="text-sm font-semibold">Dental History</div>
        <div className="flex items-center gap-2">
          {historyOpen ? (
            <Button size="xs" variant="outline" onClick={() => setHistoryOpen(false)}>Close</Button>
          ) : (
            <Button size="xs" variant="outline" onClick={() => setHistoryOpen(true)}>Show</Button>
          )}
        </div>
      </div>
      {historyOpen && (
      <div className="rounded border border-app-border overflow-hidden">
        <div className="grid grid-cols-5 bg-app-bg text-xs font-medium border-b border-app-border">
          <div className="p-2">Date</div>
          <div className="p-2">Type</div>
          <div className="p-2">Description</div>
          <div className="p-2">Teeth / Surfaces</div>
          <div className="p-2">Status</div>
        </div>
        {historyEntries.length === 0 ? (
          <div className="p-4 text-sm text-center text-app-muted">No history found for the selected teeth.</div>
        ) : (
          historyEntries.map(h => (
            <div key={`${h.type}-${h.id}`} className="grid grid-cols-5 items-center text-sm border-b border-app-border">
              <div className="p-2 truncate">{new Date(h.date).toLocaleDateString()}</div>
              <div className="p-2 truncate">
                <span className={`px-2 py-0.5 rounded text-[10px] ${h.type === 'Treatment' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                  {h.type}
                </span>
              </div>
              <div className="p-2 truncate" title={h.notes}>
                <div className="font-medium">{h.title}</div>
                {h.notes && <div className="text-[10px] text-app-muted truncate">{h.notes}</div>}
              </div>
              <div className="p-2 truncate">
                {h.teeth} {h.surfaces ? `(${h.surfaces})` : ''}
              </div>
              <div className="p-2 truncate">
                <span className={`px-2 py-0.5 rounded text-[10px] ${h.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                  {h.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {/* Removed duplicate 'Schedule appointment with selected' button (keep the one near quick select) */}

      {/* Periodontal Charting */}
      <div className="rounded border border-app-border p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Periodontal Chart</div>
        </div>
        <PerioGrid
          patientId={patient.id}
          initialData={perioInitial}
          onSave={async ({ pd, gm, cal, bop, mobility, furcation }) => {
            // Flatten to measurements list
            const measurements = [];
            const teeth = new Set([
              ...Object.keys(pd || {}).map(Number),
              ...Object.keys(gm || {}).map(Number),
              ...Object.keys(cal || {}).map(Number),
              ...Object.keys(bop || {}).map(Number),
              ...Object.keys(mobility || {}).map(Number),
              ...Object.keys(furcation || {}).map(Number),
            ].filter(Boolean));
            for (const t of teeth) {
              for (let s = 0; s < 6; s++) {
                const pocket = Number(pd?.[t]?.[s] || 0);
                const gmVal = Number(gm?.[t]?.[s] || 0);
                const calVal = Number(cal?.[t]?.[s] || 0);
                const recession = Math.max(0, gmVal);
                const finalCal = (!isNaN(calVal) && calVal > 0) ? calVal : (pocket + recession);
                const bopVal = Boolean(bop?.[t]?.[s]);
                const mobVal = Number(mobility?.[t] || 0);
                const furcVal = Number(furcation?.[t]?.[s] ?? furcation?.[t] ?? 0);
                // Only push a site if any data present
                const hasAny = (pocket || gmVal || finalCal || bopVal || mobVal || furcVal);
                if (!hasAny) continue;
                measurements.push({
                  tooth_number: Number(t),
                  site_index: s,
                  pocket_depth: pocket,
                  clinical_attachment_level: finalCal,
                  gingival_margin: gmVal,
                  recession,
                  bleeding_on_probing: bopVal,
                  mobility: mobVal,
                  furcation: furcVal,
                });
              }
            }
            // Resolve a staff_id to attribute this exam. Pick the first active staff.
            let staffId;
            try {
              const staffList = await api.staff.getAll();
              staffId = (staffList || [])[0]?.id;
            } catch {}
            if (!staffId) {
              alert('No staff found to attribute the periodontal exam. Please create staff first.');
              return;
            }
            await api.perio.create({ patient_id: patient.id, staff_id: staffId, smoker: false, bone_loss: 0, measurements });
          }}
        />
      </div>
    </div>
  );
}
