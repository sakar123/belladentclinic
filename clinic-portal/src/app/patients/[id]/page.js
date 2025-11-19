"use client";
import { useEffect, useState } from "react";
import { http } from "../../../lib/http";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import Skeleton from "../../../components/ui/skeleton";
import { Mail, Phone, Calendar, User, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import DentalChart from "../../../components/dental/dental-chart";
import Dialog, { DialogBody, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import Button from "../../../components/ui/button";
import { useToast } from "../../../components/ui/toast";
import Combobox from "../../../components/ui/combobox";
import Input from "../../../components/ui/input";
import Badge from "../../../components/ui/badge";
import { normalizePatient } from "../../../lib/normalizers";

export default function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const search = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await http.get(`/api/Patient/${id}`);
        if (mounted) setPatient(normalizePatient(data));
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!patient) return <div className="text-app-muted">Patient not found.</div>;

  const tabFromQuery = search?.get('tab') || 'overview';

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <div>
        <h1 className="text-2xl font-semibold">{patient.firstName} {patient.lastName}</h1>
        <p className="text-sm text-app-muted">Patient ID: {patient.id}</p>
      </div>

      <Tabs value={tabFromQuery} onValueChange={(v) => {
        const q = new URLSearchParams(Array.from(search?.entries?.() || []));
        if (v) q.set('tab', v); else q.delete('tab');
        router.replace(`?${q.toString()}`);
      }}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><User size={16} className="text-app-muted" /> {patient.gender || "—"}</div>
                <div className="flex items-center gap-2"><Calendar size={16} className="text-app-muted" /> {patient.dob || "—"}</div>
                <div className="flex items-center gap-2"><Mail size={16} className="text-app-muted" /> {patient.email || "—"}</div>
                <div className="flex items-center gap-2"><Phone size={16} className="text-app-muted" /> {patient.phone || "—"}</div>
                <div className="flex items-center gap-2 sm:col-span-2"><MapPin size={16} className="text-app-muted" /> {patient.address || "—"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2"><User size={16} className="text-app-muted" /> {patient.emergencyContactName || "—"}</div>
                <div className="flex items-center gap-2"><Phone size={16} className="text-app-muted" /> {patient.emergencyContactPhone || "—"}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-app-muted">Coming soon</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-app-muted">Coming soon</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <ClinicalTab patientId={patient.id} />
      </Tabs>
    </motion.div>
  );
}

function ClinicalTab({ patientId }) {
  const search = useSearchParams();
  const router = useRouter();
  const [selectedTooth, setSelectedTooth] = useState(() => {
    const t = search?.get('tooth');
    return t ? Number(t) : undefined;
  });
  const [treatments, setTreatments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [activeTab, setActiveTab] = useState(search?.get('t') || 'treatments');
  const [loadingT, setLoadingT] = useState(true);
  const [loadingD, setLoadingD] = useState(true);
  const [loadingP, setLoadingP] = useState(false);
  const [detail, setDetail] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoadingT(true);
        const t = await http.get('/api/Treatments', { params: { patientId } }).catch((e) => { throw e; });
        setTreatments(Array.isArray(t) ? t : []);
      } catch (e) {
        notify({ title: 'Failed to load treatments', description: String(e?.message || e) });
      } finally {
        setLoadingT(false);
      }
    })();
  }, [patientId]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingD(true);
        const d = await http.get('/api/Document', { params: { patientId } }).catch((e) => { throw e; });
        setDocuments(Array.isArray(d) ? d : []);
      } catch (e) {
        notify({ title: 'Failed to load documents', description: String(e?.message || e) });
      } finally {
        setLoadingD(false);
      }
    })();
  }, [patientId]);

  useEffect(() => {
    if (activeTab !== 'prescriptions') return;
    (async () => {
      try {
        setLoadingP(true);
        // Aggregate prescriptions per treatment
        const lists = await Promise.all((treatments || []).map((t) =>
          http.get('/api/Prescription', { params: { treatmentId: t.id } }).catch(() => [])
        ));
        setPrescriptions(lists.flat());
      } catch (e) {
        notify({ title: 'Failed to load prescriptions', description: String(e?.message || e) });
      } finally {
        setLoadingP(false);
      }
    })();
  }, [activeTab, treatments]);

  // Persist sub-tab in query
  useEffect(() => {
    const q = new URLSearchParams(Array.from(search?.entries?.() || []));
    q.set('t', activeTab);
    router.replace(`?${q.toString()}`);
  }, [activeTab]);

  // Persist selected tooth in query
  useEffect(() => {
    const q = new URLSearchParams(Array.from(search?.entries?.() || []));
    if (selectedTooth) q.set('tooth', String(selectedTooth));
    else q.delete('tooth');
    router.replace(`?${q.toString()}`);
  }, [selectedTooth]);

  const filterByTooth = (items) => {
    if (!selectedTooth) return items;
    return (items || []).filter((x) => {
      const tooth = x.toothNumber || x.tooth || x.tooth_id || x.toothId;
      return Number(tooth) === Number(selectedTooth);
    });
  };

  return (
    <TabsContent value="clinical">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Dental Chart</CardTitle>
            <div className="flex items-center gap-2">
              <div className="text-xs text-app-muted">{selectedTooth ? `Tooth #${selectedTooth}` : 'Select a tooth'}</div>
              {selectedTooth && (
                <Button size="sm" variant="ghost" onClick={() => setSelectedTooth(undefined)}>Clear</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DentalChart patientId={patientId} selectedTooth={selectedTooth} onSelect={(n) => setSelectedTooth(n)} />
            <div className="mt-3 text-right">
              <Button size="sm" variant="outline" onClick={() => setOpenCreate(true)} disabled={!selectedTooth}>
                Create Treatment for #{selectedTooth || '—'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clinical History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3 inline-flex rounded-md border border-app-border overflow-hidden">
              <button className={`px-3 py-1.5 text-sm ${activeTab==='treatments'?'bg-app-bg':''}`} onClick={() => setActiveTab('treatments')}>Treatments</button>
              <button className={`px-3 py-1.5 text-sm ${activeTab==='prescriptions'?'bg-app-bg':''}`} onClick={() => setActiveTab('prescriptions')}>Prescriptions</button>
              <button className={`px-3 py-1.5 text-sm ${activeTab==='documents'?'bg-app-bg':''}`} onClick={() => setActiveTab('documents')}>Documents</button>
            </div>

            {activeTab === 'treatments' && (
              <div className="space-y-2">
                {loadingT && <Skeleton className="h-8 w-full" />}
                {!loadingT && filterByTooth(treatments).map((t) => (
                  <HistoryItem key={t.id}
                    title={t.name || t.procedure || `Treatment ${t.id}`}
                    subtitle={new Date(t.date || t.createdAt || t.created_at || Date.now()).toLocaleString()}
                    chip={t.toothNumber || t.tooth || t.toothId || t.tooth_id ? `#${t.toothNumber || t.tooth || t.toothId || t.tooth_id}` : undefined}
                    onClick={() => setDetail({ type: 'treatment', data: t })}
                  />
                ))}
                {!loadingT && filterByTooth(treatments).length === 0 && <div className="text-sm text-app-muted">No treatments found.</div>}
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="space-y-2">
                {loadingP && <Skeleton className="h-8 w-full" />}
                {!loadingP && filterByTooth(prescriptions).map((p) => (
                  <HistoryItem key={p.id}
                    title={p.medication || p.name || `Prescription ${p.id}`}
                    subtitle={p.dosage || p.instructions || ''}
                    chip={p.toothNumber || p.tooth || p.toothId || p.tooth_id ? `#${p.toothNumber || p.tooth || p.toothId || p.tooth_id}` : undefined}
                    onClick={() => setDetail({ type: 'prescription', data: p })}
                  />
                ))}
                {!loadingP && filterByTooth(prescriptions).length === 0 && <div className="text-sm text-app-muted">No prescriptions found.</div>}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-2">
                {loadingD && <Skeleton className="h-8 w-full" />}
                {!loadingD && filterByTooth(documents).map((d) => (
                  <HistoryItem key={d.id}
                    title={d.title || d.name || `Document ${d.id}`}
                    subtitle={new Date(d.date || d.createdAt || d.created_at || Date.now()).toLocaleString()}
                    chip={d.toothNumber || d.tooth || d.toothId || d.tooth_id ? `#${d.toothNumber || d.tooth || d.toothId || d.tooth_id}` : undefined}
                    onClick={() => setDetail({ type: 'document', data: d })}
                  />
                ))}
                {!loadingD && filterByTooth(documents).length === 0 && <div className="text-sm text-app-muted">No documents found.</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DetailDialog detail={detail} onClose={() => setDetail(null)} />
      <CreateTreatmentDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        patientId={patientId}
        toothNumber={selectedTooth}
        onCreated={async () => {
          // refresh treatments
          const t = await http.get('/api/Treatments', { params: { patientId } }).catch(() => []);
          setTreatments(Array.isArray(t) ? t : []);
          notify({ title: 'Treatment created' });
        }}
      />
    </TabsContent>
  );
}

function HistoryItem({ title, subtitle, chip, onClick }) {
  return (
    <button onClick={onClick} className="w-full text-left rounded-md border border-app-border px-3 py-2 hover:bg-app-bg">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium truncate">{title}</div>
        {chip && <Badge variant="blue">{chip}</Badge>}
      </div>
      {subtitle && <div className="text-xs text-app-muted truncate">{subtitle}</div>}
    </button>
  );
}

function DetailDialog({ detail, onClose }) {
  if (!detail) return null;
  const { type, data } = detail;
  const title = type === 'treatment' ? 'Treatment Details' : type === 'prescription' ? 'Prescription Details' : 'Document Details';
  return (
    <Dialog open={true} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogBody>
        {type === 'treatment' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <FieldKV k="Name" v={data.name || data.procedure || `Treatment ${data.id}`} />
            <FieldKV k="Tooth" v={data.toothNumber || data.tooth || data.toothId || data.tooth_id || '—'} />
            <FieldKV k="Date" v={new Date(data.date || data.createdAt || data.created_at || Date.now()).toLocaleString()} />
            <FieldKV k="Status" v={data.status || '—'} />
            {data.notes && <div className="sm:col-span-2"><div className="text-app-muted text-xs mb-1">Notes</div><div className="text-sm whitespace-pre-wrap">{data.notes}</div></div>}
          </div>
        )}
        {type === 'prescription' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <FieldKV k="Medication" v={data.medication || data.name || `Prescription ${data.id}`} />
            <FieldKV k="Dosage" v={data.dosage || '—'} />
            <FieldKV k="Frequency" v={data.frequency || '—'} />
            <FieldKV k="For Tooth" v={data.toothNumber || data.tooth || data.toothId || data.tooth_id || '—'} />
            {data.instructions && <div className="sm:col-span-2"><div className="text-app-muted text-xs mb-1">Instructions</div><div className="text-sm whitespace-pre-wrap">{data.instructions}</div></div>}
          </div>
        )}
        {type === 'document' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <FieldKV k="Title" v={data.title || data.name || `Document ${data.id}`} />
            <FieldKV k="Type" v={data.type || data.category || '—'} />
            <FieldKV k="Date" v={new Date(data.date || data.createdAt || data.created_at || Date.now()).toLocaleString()} />
            <FieldKV k="For Tooth" v={data.toothNumber || data.tooth || data.toothId || data.tooth_id || '—'} />
            {data.description && <div className="sm:col-span-2"><div className="text-app-muted text-xs mb-1">Description</div><div className="text-sm whitespace-pre-wrap">{data.description}</div></div>}
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </DialogFooter>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-app-muted text-sm">{label}</div>
      {children}
    </label>
  );
}

function FieldKV({ k, v }) {
  return (
    <div>
      <div className="text-xs text-app-muted">{k}</div>
      <div className="text-sm">{String(v)}</div>
    </div>
  );
}

function CreateTreatmentDialog({ open, onClose, patientId, toothNumber, onCreated }) {
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useExisting, setUseExisting] = useState(true);
  const [teeth, setTeeth] = useState([]);
  const [v, setV] = useState({
    toothNumber,
    serviceId: undefined,
    // Existing appointment path
    appointmentId: undefined,
    // New appointment path
    staffId: undefined,
    statusId: undefined,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 30 * 60000).toISOString(),
    // Common
    notes: "",
  });
  const { notify } = useToast();

  useEffect(() => { setV((prev) => ({ ...prev, toothNumber })); }, [toothNumber]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [svc, appts, staffList, st, toothList] = await Promise.all([
          http.get('/api/Service').catch(() => []),
          http.get('/api/Appointment', { params: { patientId } }).catch(() => []),
          http.get('/api/Staff').catch(() => []),
          http.get('/api/AppointmentStatus').catch(() => []),
          http.get('/api/Teeth', { params: { patientId } }).catch(() => []),
        ]);
        setServices(Array.isArray(svc) ? svc : []);
        setAppointments(Array.isArray(appts) ? appts : []);
        setStaff(Array.isArray(staffList) ? staffList : []);
        setStatuses(Array.isArray(st) ? st : []);
        setTeeth(Array.isArray(toothList) ? toothList : []);
        // default status if not set
        setV((prev) => ({ ...prev, statusId: prev.statusId ?? (st?.[0]?.id) }));
      } catch (e) {
        notify({ title: 'Failed to load lookups', description: String(e?.message || e) });
      }
    })();
  }, [open]);

  const validate = () => {
    const err = {};
    if (!v.toothNumber) err.toothNumber = 'Required';
    if (!v.serviceId) err.serviceId = 'Required';
    if (useExisting) {
      if (!v.appointmentId) err.appointmentId = 'Select an appointment';
    } else {
      if (!v.staffId) err.staffId = 'Select staff';
      if (!v.startTime) err.startTime = 'Required';
      if (!v.endTime) err.endTime = 'Required';
    }
    return err;
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      notify({ title: 'Missing fields', description: Object.values(errs).join(', ') });
      return;
    }
    setLoading(true);
    try {
      let appointmentId = v.appointmentId;
      let staffId = v.staffId;
      if (!useExisting) {
        const duration = Math.max(1, Math.round((new Date(v.endTime) - new Date(v.startTime)) / 60000));
        const ap = await http.post('/api/Appointment', {
          patientId,
          staffId: v.staffId,
          statusId: v.statusId || (statuses?.[0]?.id),
          appointmentStartTime: v.startTime,
          durationMinutes: duration,
          reasonForVisit: `Treatment for tooth #${v.toothNumber}`,
          notes: v.notes || '',
        });
        appointmentId = ap?.id;
      } else {
        // derive staff from chosen appointment if not provided
        const ap = (appointments || []).find((a) => a.id === v.appointmentId);
        staffId = staffId || ap?.staffId || ap?.staff_id;
      }

      const tooth = (teeth || []).find((t) => (t.toothNumber || t.number) === v.toothNumber);
      const toothId = tooth?.id;
      await http.post('/api/Treatments', {
        appointmentId,
        patientId,
        staffId,
        serviceId: v.serviceId,
        toothId,
        toothNumber: v.toothNumber,
        notes: v.notes,
      });
      onClose();
      await onCreated?.();
      notify({ title: 'Treatment created' });
    } catch (e) {
      notify({ title: 'Failed to create treatment', description: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  };

  const serviceOptions = (services || []).map((s) => ({ value: s.id, label: s.name || s.title || `Service ${s.id}` }));
  const apptOptions = (appointments || []).map((a) => {
    const start = a.appointment_start_time || a.startTime || a.start;
    const when = start ? new Date(start).toLocaleString() : '—';
    return ({ value: a.id, label: `${when}${a.title ? ` • ${a.title}` : ''}` });
  });
  const staffOptions = (staff || []).map((s) => ({ value: s.id, label: `${s.firstName || s.person?.first_name || ''} ${s.lastName || s.person?.last_name || ''}`.trim() || s.id }));
  const statusOptions = (statuses || []).map((s) => ({ value: s.id, label: s.name || s.code || s.value }));

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>Create Treatment</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2">
              <Button type="button" variant={useExisting ? 'secondary' : 'outline'} onClick={() => setUseExisting(true)}>Use existing appt</Button>
              <Button type="button" variant={!useExisting ? 'secondary' : 'outline'} onClick={() => setUseExisting(false)}>Create new appt</Button>
            </div>
            <Field label="Tooth number">
              <Input value={v.toothNumber || ''} readOnly />
            </Field>
            <Field label="Service">
              <Combobox value={v.serviceId} onChange={(val) => setV({ ...v, serviceId: val })} options={serviceOptions} placeholder="Select service" />
            </Field>
            {useExisting ? (
              <Field label="Appointment">
                <Combobox value={v.appointmentId} onChange={(val) => setV({ ...v, appointmentId: val })} options={apptOptions} placeholder="Select appointment" />
              </Field>
            ) : (
              <>
                <Field label="Staff">
                  <Combobox value={v.staffId} onChange={(val) => setV({ ...v, staffId: val })} options={staffOptions} placeholder="Select staff" />
                </Field>
                <Field label="Status">
                  <Combobox value={v.statusId} onChange={(val) => setV({ ...v, statusId: val })} options={statusOptions} placeholder="Select status" />
                </Field>
                <Field label="Start time">
                  <Input type="datetime-local" value={toLocalInput(v.startTime)} onChange={(e) => setV({ ...v, startTime: fromLocalInput(e.target.value) })} />
                </Field>
                <Field label="End time">
                  <Input type="datetime-local" value={toLocalInput(v.endTime)} onChange={(e) => setV({ ...v, endTime: fromLocalInput(e.target.value) })} />
                </Field>
              </>
            )}
            <Field label="Notes">
              <textarea className="min-h-24 w-full rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} />
            </Field>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="secondary" disabled={!v.serviceId || !v.toothNumber || loading}>Create</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

function fromLocalInput(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toISOString();
}
