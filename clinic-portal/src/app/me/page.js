"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import Button from "../../components/ui/button";
import Skeleton from "../../components/ui/skeleton";
import DentalChart from "../../components/dental/dental-chart";
import Dialog, { DialogBody, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { http } from "../../lib/http";
import { normalizePatient } from "../../lib/normalizers";
import { CalendarDays, Clock, Pill } from "lucide-react";

export default function MePage() {
  const router = useRouter();
  const search = useSearchParams();
  const [patient, setPatient] = useState(null);
  const [appt, setAppt] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [selectedTooth, setSelectedTooth] = useState();
  const [toothStatuses, setToothStatuses] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const patientId = useMemo(() => {
    return search?.get('patientId') || search?.get('id') || undefined;
  }, [search]);

  useEffect(() => {
    if (!patientId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [p, tData] = await Promise.all([
          http.get(`/api/Patient/${patientId}`),
          http.get('/api/Treatments', { params: { patientId } }).catch(() => []),
        ]);
        if (!mounted) return;
        setPatient(normalizePatient(p));
        // upcoming appointment
        setTreatments(Array.isArray(tData) ? tData : []);
        let apps = await http.get('/api/Appointment', { params: { patientId } }).catch(() => []);
        if (!Array.isArray(apps)) apps = [];
        const now = new Date();
        const next = apps
          .map(a => ({ ...a, start: new Date(a.startTime || a.start) }))
          .filter(a => a.start && a.start >= now)
          .sort((a, b) => a.start - b.start)[0];
        const future = apps
          .map(a => ({ ...a, start: new Date(a.startTime || a.start), end: new Date(a.endTime || a.end) }))
          .filter(a => a.start && a.start >= startOfDay(now))
          .sort((a, b) => a.start - b.start);
        setAppt(next || null);
        setUpcoming(future);
        // prescriptions by aggregating from treatments
        const lists = await Promise.all((tData || []).map((t) =>
          http.get('/api/Prescription', { params: { treatmentId: t.id } }).catch(() => [])
        ));
        setPrescriptions(lists.flat());
        // teeth + status map for detail panel
        const [teeth, statuses] = await Promise.all([
          http.get(`/api/Teeth`, { params: { patientId } }).catch(() => []),
          http.get(`/api/ToothStatus`).catch(() => []),
        ]);
        const tmap = {};
        (teeth || []).forEach((t) => { tmap[t.toothNumber || t.number] = t.statusCode || t.status; });
        setToothStatuses(tmap);
        const sm = {};
        (statuses || []).forEach((s) => {
          const key = s.code || s.name || s.value;
          sm[key] = { label: s.name || s.description || key, color: s.color };
        });
        setStatusMap(sm);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [patientId]);

  if (!patientId) {
    return (
      <div className="max-w-lg mx-auto space-y-3">
        <h1 className="text-2xl font-semibold">My Portal</h1>
        <p className="text-sm text-app-muted">Provide a patientId in the URL query to view records, e.g. <code>?patientId=...</code>.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome{patient?.firstName ? `, ${patient.firstName}` : ''}</h1>
        <p className="text-sm text-app-muted">Your upcoming schedule and dental health snapshot</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            {appt ? (
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2"><CalendarDays size={16} className="text-app-muted" /> {appt.start.toLocaleDateString()}</div>
                <div className="flex items-center gap-2"><Clock size={16} className="text-app-muted" /> {appt.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-app-muted">{appt.title || appt.reason || 'Dental appointment'}</div>
              </div>
            ) : (
              <div className="text-sm text-app-muted">No upcoming appointments scheduled.</div>
            )}
            {upcoming.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-app-muted mb-1">Next Weeks</div>
                <div className="space-y-2 max-h-56 overflow-auto pr-1">
                  {groupByWeek(upcoming).map(({ week, items }) => (
                    <div key={week} className="text-xs">
                      <div className="font-medium mb-1">Week of {new Date(week).toLocaleDateString()}</div>
                      <ul className="space-y-1">
                        {items.map((a) => (
                          <li key={a.id} className="flex items-center justify-between border-b border-app-border/60 pb-1">
                            <span>{a.start.toLocaleDateString(undefined, { weekday: 'short' })} {a.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-app-muted truncate ml-2">{a.title || a.reason || 'Appointment'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Prescriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 && (
              <div className="text-sm text-app-muted">No prescriptions on file.</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prescriptions.map((p) => (
                <button key={p.id} onClick={() => setDetail({ type: 'prescription', data: p })} className="text-left rounded-md border border-app-border px-3 py-2 hover:bg-app-bg">
                  <div className="flex items-center gap-2">
                    <Pill size={16} className="text-app-muted" />
                    <div className="font-medium truncate">{p.medication || p.name || `Prescription ${p.id}`}</div>
                  </div>
                  <div className="text-xs text-app-muted truncate">{p.dosage || p.instructions || ''}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Teeth</CardTitle>
        </CardHeader>
        <CardContent>
          <DentalChart patientId={patientId} selectedTooth={selectedTooth} onSelect={setSelectedTooth} />
          <div className="mt-4">
            {!selectedTooth && (
              <div className="text-sm text-app-muted">Select a tooth to see details and related history.</div>
            )}
            {selectedTooth && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Tooth #{selectedTooth}</div>
                  <div className="text-xs text-app-muted">{statusLabel(toothStatuses[selectedTooth], statusMap)}</div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-app-muted mb-1">Treatments</div>
                    <div className="space-y-1">
                      {filterByTooth(treatments, selectedTooth).slice(0,3).map((t) => (
                        <div key={t.id} className="rounded border border-app-border px-2 py-1 text-xs">
                          <div className="font-medium truncate">{t.name || t.procedure || `Treatment ${t.id}`}</div>
                          <div className="text-app-muted">{new Date(t.date || t.createdAt || t.created_at || Date.now()).toLocaleDateString()}</div>
                        </div>
                      ))}
                      {filterByTooth(treatments, selectedTooth).length === 0 && <div className="text-xs text-app-muted">None</div>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-app-muted mb-1">Prescriptions</div>
                    <div className="space-y-1">
                      {filterByTooth(prescriptions, selectedTooth).slice(0,3).map((p) => (
                        <div key={p.id} className="rounded border border-app-border px-2 py-1 text-xs">
                          <div className="font-medium truncate">{p.medication || p.name || `Prescription ${p.id}`}</div>
                          <div className="text-app-muted truncate">{p.dosage || p.instructions || ''}</div>
                        </div>
                      ))}
                      {filterByTooth(prescriptions, selectedTooth).length === 0 && <div className="text-xs text-app-muted">None</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <DetailDialog detail={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function DetailDialog({ detail, onClose }) {
  if (!detail) return null;
  const { type, data } = detail;
  return (
    <Dialog open={true} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Prescription Details</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <FieldKV k="Medication" v={data.medication || data.name || `Prescription ${data.id}`} />
          <FieldKV k="Dosage" v={data.dosage || '—'} />
          <FieldKV k="Frequency" v={data.frequency || '—'} />
          <FieldKV k="Instructions" v={data.instructions || '—'} />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </DialogFooter>
    </Dialog>
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

// Helpers
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function groupByWeek(apps) {
  const map = new Map();
  for (const a of apps) {
    const k = startOfWeek(a.start).toISOString();
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(a);
  }
  return Array.from(map.entries()).map(([week, items]) => ({ week, items }));
}
function filterByTooth(items, tooth) {
  return (items || []).filter((x) => Number(x.toothNumber || x.tooth || x.tooth_id || x.toothId) === Number(tooth));
}
function statusLabel(code, statusMap) {
  if (!code) return 'Healthy';
  return statusMap?.[code]?.label || String(code);
}
