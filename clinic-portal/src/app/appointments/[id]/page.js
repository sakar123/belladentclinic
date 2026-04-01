'use client';

import useSWR from 'swr';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, User, UserCog, StickyNote, Plus } from 'lucide-react';
import { StatusPill } from '@/components/ui/status-pill';
import Dialog, { DialogBody, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Input from '@/components/ui/input';
import { useMemo, useState } from 'react';
import Empty from '@/components/ui/empty';
import { useToast } from '@/components/ui/toast';
import TeethSelector from '@/components/dental/teeth-selector';
import { getAdultToothName, getPrimaryToothName } from '@/components/dental/tooth-data';

export default function AppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { notify } = useToast();

  const { data: appointment, error } = useSWR(id ? `appointments/${id}` : null, () => api.appointment.getById(id));
  const { data: allAppointments } = useSWR('appts-all', () => api.appointment.getAll());
  const { data: services } = useSWR('services', () => api.service.getAll());
  const { data: staff } = useSWR('staff', () => api.staff.getAll());
  const { data: patients } = useSWR('patients', () => api.patient.getAll());
  const { data: statuses } = useSWR('appt-status', () => api.lookup.appointmentStatus.getAll());
  const { data: allTeeth } = useSWR('teeth', () => api.teeth.getAll());
  const { data: toothStatuses } = useSWR('tooth-status', () => api.lookup.toothStatus.getAll());
  const { data: apptTreatments } = useSWR('appt-treatments', () => api.treatments.getAll());
  const { data: docTypes } = useSWR('doc-types', () => api.lookup.documentTypes.getAll());
  const { data: documents, mutate: mutateDocs } = useSWR('docs', () => api.document.getAll());

  const handleCancel = async () => {
    const hasTreatments = (apptTreatments || []).some(t => t.appointment_id === appointment.id);
    if (hasTreatments) {
      notify({ title: 'Cannot cancel', description: 'This appointment has treatments. Complete it instead.' });
      return;
    }
    const proceed = confirm('Cancel this appointment? (This will mark it as Cancelled)');
    if (!proceed) return;
    // Prefer status change over deletion to preserve treatments/docs links
    const cancel = (statuses || []).find(s => (s.name || '').toLowerCase() === 'cancelled' || (s.name || '').toLowerCase() === 'canceled');
    if (cancel) {
      await api.appointment.update(id, {
        appointment_start_time: appointment.appointment_start_time,
        duration_minutes: appointment.duration_minutes,
        staff_id: appointment.staff?.id || appointment.staff_id,
        status_id: cancel.id,
        notes: appointment.notes,
        reason_for_visit: appointment.reason_for_visit,
        patient_id: appointment.patient?.id || appointment.patient_id,
      });
      notify({ title: 'Appointment marked as Cancelled' });
      router.push('/appointments');
      return;
    }
    // Fallback: try delete, but handle 409 by showing message
    try {
      await api.appointment.delete(id);
      notify({ title: 'Appointment deleted' });
      router.push('/appointments');
    } catch (e) {
      notify({ title: 'Cannot delete appointment', description: 'This appointment has related records. Please remove treatments/documents first or set status to Cancelled.' });
    }
  };

  if (error) return <div className="text-red-600">Failed to load appointment details.</div>;
  if (!appointment) return <div>Loading...</div>;

  const p = appointment.patient?.person || patients?.find(x => x.id === (appointment.patient?.id || appointment.patient_id))?.person || {};
  const s = appointment.staff?.person || staff?.find(x => x.id === (appointment.staff?.id || appointment.staff_id))?.person || {};
  const t = new Date(appointment.appointment_start_time);

  // Add treatment dialog state
  const [openAdd, setOpenAdd] = useState(false);
  const [selServiceId, setSelServiceId] = useState('');
  const [createNew, setCreateNew] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCost, setNewServiceCost] = useState('');
  const [note, setNote] = useState('');
  // tooth selection helpers
  const patientId = appointment.patient?.id || appointment.patient_id;
  const patientTeeth = (allTeeth || []).filter(t => t.patient_id === patientId);
  const [selToothId, setSelToothId] = useState('');
  const [newToothNumber, setNewToothNumber] = useState('');
  const [newToothStatusId, setNewToothStatusId] = useState('');
  const [toothChart, setToothChart] = useState({ mode: 'adult', tooth: null });
  const [selectedToothInline, setSelectedToothInline] = useState({ mode: 'adult', tooth: null });
  const selectedFDIInline = selectedToothInline?.tooth ? [Number(selectedToothInline.tooth)] : [];
  // multi-teeth mode
  const [multiTeeth, setMultiTeeth] = useState(false);
  const [multiToothNumbers, setMultiToothNumbers] = useState('');

  // Reschedule dialog state
  const [openReschedule, setOpenReschedule] = useState(false);
  const [newStaffId, setNewStaffId] = useState(appointment.staff?.id || appointment.staff_id || '');
  const [newStatusId, setNewStatusId] = useState(appointment.status?.id || appointment.status_id || '');
  const [newStartISO, setNewStartISO] = useState(appointment.appointment_start_time?.slice(0,16) || '');
  const [newDuration, setNewDuration] = useState(appointment.duration_minutes || 30);

  async function addTreatment() {
    // Create service if needed
    let svc = null;
    if (createNew) {
      svc = await api.service.create({ name: newServiceName, cost: Number(newServiceCost || 0) });
    } else {
      svc = (services || []).find(s => s.id === selServiceId);
    }
    if (!svc) return;
    const tsOptions = toothStatuses || [];
    const chosenStatus = tsOptions.find(ts => ts.id === newToothStatusId) || tsOptions.find(ts => (ts.code || '').toUpperCase() === 'HEALTHY') || tsOptions[0];

    if (multiTeeth) {
      // Parse comma-separated numbers and create a treatment per tooth
      const numbers = (multiToothNumbers || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(n => Number(n))
        .filter(n => !Number.isNaN(n));
      const uniqueNumbers = Array.from(new Set(numbers));
      if (uniqueNumbers.length === 0) return;

      const { getAdultToothName, getPrimaryToothName } = await import('@/components/dental/tooth-data');
      let createdCount = 0;
      for (const num of uniqueNumbers) {
        // Check if tooth exists for patient
        let tooth = (allTeeth || []).find(t => t.patient_id === patientId && Number(t.tooth_number) === Number(num));
        if (!tooth) {
          const isPrimary = Number(num) >= 51 && Number(num) <= 85;
          const toothName = isPrimary ? getPrimaryToothName(Number(num)) : getAdultToothName(Number(num));
          const createdTooth = await api.teeth.create({ patient_id: patientId, tooth_number: Number(num), tooth_status_id: chosenStatus?.id, tooth_name: toothName });
          tooth = createdTooth;
        }
        await api.treatments.create({
          appointment_id: appointment.id,
          patient_id: patientId,
          staff_id: appointment.staff?.id || appointment.staff_id,
          service_id: svc.id,
          tooth_id: tooth.id,
          tooth_number: Number(num),
          notes: note || undefined,
        });
        createdCount += 1;
      }
      // Update appointment status to in-progress if available
      const inprog = (statuses || []).find(s => (s.name || '').toLowerCase() === 'in progress' || (s.name || '').toLowerCase() === 'in-progress' || (s.name || '').toLowerCase() === 'inprogress');
      if (inprog) {
        await api.appointment.update(id, {
          appointment_start_time: appointment.appointment_start_time,
          duration_minutes: appointment.duration_minutes,
          staff_id: appointment.staff?.id || appointment.staff_id,
          status_id: inprog.id,
          notes: appointment.notes,
          reason_for_visit: appointment.reason_for_visit,
          patient_id: patientId,
        });
      }
      setOpenAdd(false);
      notify({ title: `Added ${createdCount} treatment${createdCount>1?'s':''}` });
      return;
    }

    // Single tooth flow: ensure tooth (existing or create new)
    let toothId = selToothId;
    if (!toothId) {
      const toothNumber = newToothNumber || toothChart.tooth;
      if (!toothNumber) return; // need a number if not selecting existing
      const { getAdultToothName, getPrimaryToothName } = await import('@/components/dental/tooth-data');
      const toothName = (toothChart.mode === 'adult') ? getAdultToothName(Number(toothNumber)) : getPrimaryToothName(Number(toothNumber));
      const createdTooth = await api.teeth.create({ patient_id: patientId, tooth_number: Number(toothNumber), tooth_status_id: chosenStatus?.id, tooth_name: toothName });
      toothId = createdTooth.id;
    }

    await api.treatments.create({
      appointment_id: appointment.id,
      patient_id: patientId,
      staff_id: appointment.staff?.id || appointment.staff_id,
      service_id: svc.id,
      tooth_id: toothId,
      tooth_number: selToothId ? undefined : Number(newToothNumber),
      notes: note || undefined,
    });
    // Optional: update tooth status if the user chose one and we have the current tooth
    if (newToothStatusId) {
      const currentTooth = (allTeeth || []).find(t => t.id === toothId);
      if (currentTooth && currentTooth.tooth_status_id !== newToothStatusId) {
        await api.teeth.update(currentTooth.id, { ...currentTooth, tooth_status_id: newToothStatusId });
      }
    }
    // Update appointment status to "In progress" if available
    const inprog = (statuses || []).find(s => (s.name || '').toLowerCase() === 'in progress' || (s.name || '').toLowerCase() === 'in-progress' || (s.name || '').toLowerCase() === 'inprogress');
    if (inprog) {
      await api.appointment.update(id, {
        appointment_start_time: appointment.appointment_start_time,
        duration_minutes: appointment.duration_minutes,
        staff_id: appointment.staff?.id || appointment.staff_id,
        status_id: inprog.id,
        notes: appointment.notes,
        reason_for_visit: appointment.reason_for_visit,
        patient_id: patientId,
      });
    }
    setOpenAdd(false);
    notify({ title: 'Treatment added' });
  }

  const sid = appointment.status_id || appointment.status?.id;
  const statusName = (statuses || []).find(st => st.id === sid)?.name || appointment.status?.name || '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointment</h1>
          <div className="text-sm text-app-muted">ID: {appointment.id}</div>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <StatusPill text={statusName} />
            <span className="text-app-muted">Patient:</span> <span className="font-medium">{`${p.first_name || ''} ${p.last_name || ''}`.trim() || '—'}</span>
            <span className="text-app-muted">Staff:</span> <span className="font-medium">{`${s.first_name || ''} ${s.last_name || ''}`.trim() || '—'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setOpenReschedule(true)}>Reschedule</Button>
          <Button variant="secondary" onClick={() => setOpenAdd(true)}><Plus size={16} /> Add Treatment</Button>
          <Button
            variant="outline"
            disabled={!((apptTreatments||[]).some(t => t.appointment_id === appointment.id))}
            onClick={async () => {
              const completed = (statuses || []).find(s => (s.name || '').toLowerCase() === 'completed');
              if (!completed) return;
              await api.appointment.update(id, {
                appointment_start_time: appointment.appointment_start_time,
                duration_minutes: appointment.duration_minutes,
                staff_id: appointment.staff?.id || appointment.staff_id,
                status_id: completed.id,
                notes: appointment.notes,
                reason_for_visit: appointment.reason_for_visit,
                patient_id: appointment.patient?.id || appointment.patient_id,
              });
              notify({ title: 'Appointment completed' });
            }}
          >Complete</Button>
          <Button
            variant="destructive"
            disabled={(apptTreatments||[]).some(t => t.appointment_id === appointment.id)}
            title={(apptTreatments||[]).some(t => t.appointment_id === appointment.id) ? 'Cannot cancel appointments with treatments' : undefined}
            onClick={handleCancel}
          >Cancel</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><User size={16} className="text-app-muted" /> Patient: <span className="font-medium">{`${p.first_name || ''} ${p.last_name || ''}`.trim()}</span></div>
              <div className="flex items-center gap-2"><UserCog size={16} className="text-app-muted" /> Staff: <span className="font-medium">{`${s.first_name || ''} ${s.last_name || ''}`.trim()}</span></div>
              <div className="flex items-center gap-2"><CalendarDays size={16} className="text-app-muted" /> Date: <span className="font-medium">{t.toLocaleDateString()}</span></div>
              <div className="flex items-center gap-2"><Clock size={16} className="text-app-muted" /> Time: <span className="font-medium">{t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
            </div>
            <div className="space-y-2 text-sm">
              <div>Status: <StatusPill text={statusName} /></div>
              <div className="flex items-start gap-2"><StickyNote size={16} className="text-app-muted mt-0.5" /> Reason: <span className="font-medium">{appointment.reason_for_visit || '—'}</span></div>
              <div className="flex items-start gap-2"><StickyNote size={16} className="text-app-muted mt-0.5" /> Notes: <span className="font-medium break-words">{appointment.notes || '—'}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visit Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitSummary appointment={appointment} allTeeth={allTeeth || []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photos & Files</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentFiles appointment={appointment} docTypes={docTypes||[]} documents={documents||[]} allTeeth={allTeeth||[]} onUploaded={() => mutateDocs()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Treatments for this appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="text-xs text-app-muted mb-1">Select tooth (inline)</div>
            <TeethSelector
              showPermanent={true}
              showPrimary={true}
              selectMode="single"
              value={selectedFDIInline}
              onChange={(arr) => {
                const n = Array.isArray(arr) && arr.length>0 ? arr[0] : null;
                setSelectedToothInline(prev => ({ ...prev, tooth: n }));
              }}
            />
            {selectedToothInline.tooth && (
              <div className="mt-2 text-xs">Selected: {Number(selectedToothInline.tooth) >= 51 ? getPrimaryToothName(Number(selectedToothInline.tooth)) : getAdultToothName(Number(selectedToothInline.tooth))}</div>
            )}
          </div>
          <ServicesForAppointment appointment={appointment} selectedTooth={selectedToothInline} allTeeth={allTeeth || []} toothStatuses={toothStatuses || []} appointmentsList={allAppointments || []} />
        </CardContent>
      </Card>

      {/* Add Treatment Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogHeader><DialogTitle>Add Treatment</DialogTitle></DialogHeader>
        <DialogBody>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <input id="multiTeeth" type="checkbox" checked={multiTeeth} onChange={(e) => setMultiTeeth(e.target.checked)} />
              <label htmlFor="multiTeeth">Apply to multiple teeth</label>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <input id="createNewService" type="checkbox" checked={createNew} onChange={(e) => { setCreateNew(e.target.checked); setSelServiceId(''); }} />
              <label htmlFor="createNewService">Service not listed — create new</label>
            </div>
            {!createNew && (
              <>
                <label className="text-xs text-app-muted">Select service</label>
                <select
                  className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm"
                  value={selServiceId}
                  onChange={(e) => { setSelServiceId(e.target.value); }}
                >
                  <option value="">Choose…</option>
                  {(services || []).map(s => (<option key={s.id} value={s.id}>{s.name} — Rs {Number(s.cost || 0).toLocaleString()}</option>))}
                </select>
              </>
            )}
            {createNew && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-app-muted mb-1">Service name</div>
                  <Input value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} />
                </div>
                <div>
                  <div className="text-xs text-app-muted mb-1">Base cost (Rs)</div>
                  <Input type="number" min="0" step="1" value={newServiceCost} onChange={(e) => { setNewServiceCost(e.target.value); }} />
                </div>
              </div>
            )}
            {!multiTeeth && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-app-muted mb-1">Existing tooth (optional)</div>
                  <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={selToothId} onChange={(e) => { setSelToothId(e.target.value); setNewToothNumber(''); }}>
                    <option value="">Select existing…</option>
                    {patientTeeth.map(t => (<option key={t.id} value={t.id}>Tooth #{t.tooth_number}</option>))}
                  </select>
                </div>
                <div>
                <div className="text-xs text-app-muted mb-1">Or pick from chart</div>
                <TeethSelector
                  showPermanent={true}
                  showPrimary={true}
                  selectMode="single"
                  value={toothChart.tooth ? [Number(toothChart.tooth)] : []}
                  onChange={(arr) => setToothChart(prev => ({ ...prev, tooth: (Array.isArray(arr) && arr.length>0) ? arr[0] : null }))}
                />
                  <div className="text-xs text-app-muted mt-2">Or enter a number</div>
                  <Input type="number" min="1" max="85" value={newToothNumber} onChange={(e) => { setNewToothNumber(e.target.value); setSelToothId(''); }} />
                </div>
              </div>
            )}
            {multiTeeth && (
              <div>
                <div className="text-xs text-app-muted mb-1">Tooth numbers (comma-separated)</div>
                <Input placeholder="e.g., 11, 12, 13" value={multiToothNumbers} onChange={(e) => setMultiToothNumbers(e.target.value)} />
              </div>
            )}
            {((!multiTeeth && (selToothId || newToothNumber || toothChart.tooth)) || (multiTeeth && multiToothNumbers.trim().length > 0)) && (
              <div>
                <div className="text-xs text-app-muted mb-1">Tooth status</div>
                <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={newToothStatusId} onChange={(e) => setNewToothStatusId(e.target.value)}>
                  {(toothStatuses || []).map(ts => (<option key={ts.id} value={ts.id}>{ts.name || ts.description || ts.code}</option>))}
                </select>
              </div>
            )}
            <div>
              <div className="text-xs text-app-muted mb-1">Notes</div>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button onClick={addTreatment} disabled={(!createNew && !selServiceId) || (createNew && (!newServiceName || newServiceCost === '')) || (!selToothId && !newToothNumber)}>
            Save Treatment
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={openReschedule} onClose={() => setOpenReschedule(false)}>
        <DialogHeader><DialogTitle>Reschedule Appointment</DialogTitle></DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-app-muted mb-1">Start</div>
              <Input type="datetime-local" value={newStartISO} onChange={(e) => setNewStartISO(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Duration (min)</div>
              <Input type="number" min="5" step="5" value={newDuration} onChange={(e) => setNewDuration(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <div className="text-xs text-app-muted mb-1">Staff</div>
              <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={newStaffId} onChange={(e) => setNewStaffId(e.target.value)}>
                <option value="">Unchanged</option>
                {(staff || []).map(st => (<option key={st.id} value={st.id}>{st.person.first_name} {st.person.last_name}</option>))}
              </select>
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Status</div>
              <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={newStatusId} onChange={(e) => setNewStatusId(e.target.value)}>
                <option value="">Unchanged</option>
                {(statuses || []).map(st => (<option key={st.id} value={st.id}>{st.name}</option>))}
              </select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenReschedule(false)}>Cancel</Button>
          <Button onClick={async () => {
            await api.appointment.update(id, {
              appointment_start_time: newStartISO ? new Date(newStartISO).toISOString() : appointment.appointment_start_time,
              duration_minutes: Number(newDuration || appointment.duration_minutes),
              staff_id: newStaffId || appointment.staff?.id || appointment.staff_id,
              status_id: newStatusId || appointment.status?.id || appointment.status_id,
              notes: appointment.notes,
              reason_for_visit: appointment.reason_for_visit,
              patient_id: appointment.patient?.id || appointment.patient_id,
            });
            setOpenReschedule(false);
            notify({ title: 'Appointment rescheduled' });
          }}>Save</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function VisitSummary({ appointment, allTeeth }) {
  const { data: treatments } = useSWR('treatments', () => api.treatments.getAll());
  const { data: services } = useSWR('services', () => api.service.getAll());
  const { data: staff } = useSWR('staff-mini', () => api.staff.getAll());
  const { data: patients } = useSWR('patients-mini', () => api.patient.getAll());
  if (!treatments || !services) return <div>Loading…</div>;
  const list = (treatments || []).filter(t => t.appointment_id === appointment.id);
  const p = appointment.patient?.person || (patients||[]).find(x => x.id === (appointment.patient?.id || appointment.patient_id))?.person || {};
  const s = appointment.staff?.person || (staff||[]).find(x => x.id === (appointment.staff?.id || appointment.staff_id))?.person || {};
  const when = appointment.appointment_start_time ? new Date(appointment.appointment_start_time) : null;
  const rows = list.map(t => {
    const svc = (services||[]).find(sv => sv.id === t.service_id);
    let num = t.tooth_number;
    if (!num) {
      const tt = (allTeeth||[]).find(z => z.id === t.tooth_id);
      num = tt?.tooth_number;
    }
    let toothName = '';
    if (num) {
      toothName = (Number(num) >= 51 && Number(num) <= 85) ? getPrimaryToothName(Number(num)) : getAdultToothName(Number(num));
    }
    return {
      id: t.id,
      service: svc?.name || 'Service',
      cost: Number(svc?.cost || 0),
      toothNumber: num,
      toothName,
      notes: t.notes || ''
    };
  });
  const total = rows.reduce((s, r) => s + r.cost, 0);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-app-muted">Patient</div>
          <div className="font-medium">{`${p.first_name || ''} ${p.last_name || ''}`.trim() || '—'}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-app-muted">Staff</div>
          <div className="font-medium">{`${s.first_name || ''} ${s.last_name || ''}`.trim() || '—'}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-app-muted">Date</div>
          <div className="font-medium">{when ? when.toLocaleDateString() : '—'}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-app-muted">Time</div>
          <div className="font-medium">{when ? when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</div>
        </div>
      </div>
      <div className="rounded border border-app-border overflow-hidden">
        <div className="grid grid-cols-12 text-xs font-medium bg-app-bg border-b border-app-border">
          <div className="col-span-6 p-2">Service</div>
          <div className="col-span-4 p-2">Tooth</div>
          <div className="col-span-2 p-2 text-right">Cost (Rs)</div>
        </div>
        {rows.length === 0 && (
          <div className="p-3 text-sm text-app-muted">No treatments recorded for this visit.</div>
        )}
        {rows.map(r => (
          <div key={r.id} className="grid grid-cols-12 text-sm border-b border-app-border last:border-b-0">
            <div className="col-span-6 p-2 truncate">{r.service}{r.notes ? <span className="text-app-muted"> · {r.notes}</span> : null}</div>
            <div className="col-span-4 p-2 truncate">{r.toothName || (r.toothNumber ? `Tooth ${r.toothNumber}` : '—')}</div>
            <div className="col-span-2 p-2 text-right">{r.cost.toLocaleString()}</div>
          </div>
        ))}
        {rows.length > 0 && (
          <div className="grid grid-cols-12 text-sm bg-app-bg">
            <div className="col-span-8 p-2"></div>
            <div className="col-span-2 p-2 font-medium text-right">Total</div>
            <div className="col-span-2 p-2 font-semibold text-right">{total.toLocaleString()}</div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-app-muted">Prepared by BellaDent</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()}>Print</Button>
        </div>
      </div>
    </div>
  );
}

function ServicesForAppointment({ appointment, selectedTooth, allTeeth, toothStatuses, appointmentsList }) {
  const { data: services } = useSWR('services', () => api.service.getAll());
  const { data: treatments, mutate } = useSWR('treatments', () => api.treatments.getAll());
  const { notify } = useToast();
  const [selected, setSelected] = useState({});
  const [editing, setEditing] = useState(null);
  const [editServiceId, setEditServiceId] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editToothId, setEditToothId] = useState('');

  if (!treatments) return <div>Loading…</div>;
  const baseList = (treatments || []).filter(t => t.appointment_id === appointment.id);
  let list = baseList;
  let currentTooth = null;
  if (selectedTooth?.tooth) {
    const patientId = appointment.patient?.id || appointment.patient_id;
    currentTooth = (allTeeth || []).find(tt => tt.patient_id === patientId && Number(tt.tooth_number) === Number(selectedTooth.tooth));
    if (currentTooth) {
      list = baseList.filter(t => t.tooth_id === currentTooth.id || Number(t.tooth_number||0) === Number(selectedTooth.tooth));
    }
  }
  if (list.length === 0) return <Empty title="No treatments recorded" subtitle="Treatments linked to this appointment will appear here." />;

  const total = list.reduce((sum, t) => sum + Number((services || []).find(s => s.id === t.service_id)?.cost || 0), 0);
  const apptMap = new Map((appointmentsList||[]).map(a => [a.id, a]));
  const history = (allTeeth && selectedTooth?.tooth) ? (treatments||[])
    .filter(t => t.patient_id === (appointment.patient?.id || appointment.patient_id))
    .filter(t => {
      const tooth = (allTeeth||[]).find(tt => tt.id === t.tooth_id);
      return tooth && Number(tooth.tooth_number) === Number(selectedTooth.tooth);
    })
    .map(t => ({
      id: t.id,
      service: (services||[]).find(s => s.id === t.service_id)?.name || 'Service',
      when: apptMap.get(t.appointment_id)?.appointment_start_time || null,
      notes: t.notes || ''
    }))
    .sort((a,b) => new Date(a.when||0) - new Date(b.when||0)) : [];

  return (
    <div className="space-y-3">
      {currentTooth && (
        <div className="flex items-center justify-between p-2 rounded border border-app-border">
          <div className="text-sm">Current tooth status: <span className="font-medium">{(toothStatuses||[]).find(s => s.id === currentTooth.tooth_status_id)?.name || '—'}</span></div>
          <div className="flex items-center gap-2">
            <select className="h-9 rounded-md border border-app-border bg-app-surface px-2 text-sm" defaultValue={currentTooth.tooth_status_id} onChange={async (e) => { await api.teeth.update(currentTooth.id, { ...currentTooth, tooth_status_id: e.target.value }); notify({ title: 'Tooth status updated' }); }}>
              {(toothStatuses||[]).map(s => (<option key={s.id} value={s.id}>{s.name || s.description || s.code}</option>))}
            </select>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-sm text-app-muted">Total service cost: <span className="font-semibold">Rs {total.toLocaleString()}</span></div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={async () => {
            const ids = Object.keys(selected).filter(k => selected[k]);
            if (ids.length === 0) return;
            const sum = list.filter(t => ids.includes(String(t.id))).reduce((s,t) => s + Number((services||[]).find(sv => sv.id === t.service_id)?.cost || 0), 0);
            const today = new Date();
            const due = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
            await api.billing.create({ patient_id: appointment.patient?.id || appointment.patient_id, issue_date: today.toISOString(), due_date: due.toISOString(), total_amount: sum, amount_paid: 0, status: 'Open' });
            notify({ title: 'Billing created', description: `Rs ${sum.toLocaleString()}` });
          }}>Create Billing for Selected</Button>
        </div>
      </div>
      <div className="divide-y divide-app-border rounded border border-app-border">
        {list.map((t) => {
          const svc = (services || []).find(s => s.id === t.service_id);
          const cost = Number(svc?.cost || 0);
          const checked = !!selected[t.id];
          return (
            <div key={t.id} className="p-3 grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <input type="checkbox" checked={checked} onChange={(e) => setSelected(prev => ({ ...prev, [t.id]: e.target.checked }))} />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{svc?.name || `Service ${t.service_id}`} <span className="text-app-muted text-xs">· Rs {cost.toLocaleString()}</span></div>
                <div className="text-xs text-app-muted truncate">{t.notes || ''}{typeof t.tooth_number === 'number' ? ` · Tooth #${t.tooth_number}` : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(t); setEditServiceId(t.service_id); setEditNotes(t.notes || ''); }}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={async () => { if (confirm('Delete treatment?')) { await api.treatments.delete(t.id); notify({ title: 'Treatment deleted' }); mutate(); } }}>Delete</Button>
              </div>
            </div>
          );
        })}
      </div>

      {history.length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Tooth history</div>
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="text-xs text-app-muted">
                <span className="font-medium text-app-foreground">{h.service}</span>
                {h.when ? ` · ${new Date(h.when).toLocaleDateString()} ${new Date(h.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                {h.notes ? ` · ${h.notes}` : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Treatment Dialog */}
      <Dialog open={!!editing} onClose={() => setEditing(null)}>
        <DialogHeader><DialogTitle>Edit Treatment</DialogTitle></DialogHeader>
        <DialogBody>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-app-muted mb-1">Service</div>
              <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={editServiceId} onChange={(e) => setEditServiceId(e.target.value)}>
                {(services || []).map(s => (<option key={s.id} value={s.id}>{s.name} — Rs {Number(s.cost||0).toLocaleString()}</option>))}
              </select>
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Tooth</div>
              <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={editToothId} onChange={(e) => setEditToothId(e.target.value)}>
                {(allTeeth || []).filter(t => t.patient_id === (appointment.patient?.id || appointment.patient_id)).map(t => (
                  <option key={t.id} value={t.id}>Tooth #{t.tooth_number}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Notes</div>
              <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          <Button onClick={async () => { await api.treatments.update(editing.id, { ...editing, service_id: editServiceId, tooth_id: editToothId, notes: editNotes }); setEditing(null); notify({ title: 'Treatment updated' }); mutate(); }}>Save</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function AppointmentFiles({ appointment, docTypes, documents, allTeeth, onUploaded }) {
  const { notify } = useToast();
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState('');
  const [toothId, setToothId] = useState('');
  const patientId = appointment.patient?.id || appointment.patient_id;
  const imageType = (docTypes||[]).find(d => String(d.name||d.document_type||d.code||'').toLowerCase().includes('image') || String(d.name||'').toLowerCase().includes('photo')) || (docTypes||[])[0];
  const list = (documents||[]).filter(d => d.patient_id === patientId && ((d.description||'').includes(appointment.id) || (d.description||'').toLowerCase().includes('appt')));
  const teethForPatient = (allTeeth || []).filter(t => t.patient_id === patientId);
  return (
    <div className="space-y-3">
      <div className="text-sm text-app-muted">Attach images or files to this visit. Tip: caption includes the appointment ID for easy filtering.</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <div className="text-xs text-app-muted mb-1">File</div>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <div className="text-xs text-app-muted mb-1">Tooth (optional)</div>
          <select className="h-10 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm" value={toothId} onChange={(e) => setToothId(e.target.value)}>
            <option value="">None</option>
            {(teethForPatient||[]).map(t => (<option key={t.id} value={t.id}>Tooth #{t.tooth_number}</option>))}
          </select>
        </div>
        <div>
          <div className="text-xs text-app-muted mb-1">Caption</div>
          <Input placeholder={`Appt ${appointment.id} photo`} value={desc} onChange={(e)=>setDesc(e.target.value)} />
        </div>
        <div>
          <Button onClick={async () => {
            if (!file || !imageType) return;
            const form = new FormData();
            form.append('file', file);
            form.append('patient_id', patientId);
            form.append('document_type_id', imageType.id);
            form.append('description', desc || `Appt ${appointment.id} photo`);
            form.append('is_sensitive', 'false');
            if (toothId) form.append('tooth_id', toothId);
            try {
              await api.document.upload(form);
              notify({ title: 'File uploaded' });
              setFile(null); setDesc(''); setToothId('');
              onUploaded?.();
            } catch (e) {
              notify({ title: 'Upload failed', description: String(e) });
            }
          }}>Upload</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.map(d => (
          <div key={d.id} className="p-2 rounded border border-app-border">
            <div className="text-xs text-app-muted">{new Date(d.upload_date||Date.now()).toLocaleString()}</div>
            <div className="text-sm font-medium truncate">{d.description}</div>
            <div className="text-xs text-app-muted truncate">{d.document_path?.split('/').pop()}</div>
          </div>
        ))}
        {list.length === 0 && (<div className="text-sm text-app-muted">No files for this visit yet.</div>)}
      </div>
    </div>
  );
}
