'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { http } from '@/lib/http';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import RecipientSelector from '@/components/notifications/recipient-selector';
import CampaignPreviewCard from '@/components/notifications/campaign-preview-card';
import DeliveryStatsCard from '@/components/notifications/delivery-stats-card';
import TopicSelector from '@/components/notifications/topic-selector';
import AudienceFilterForm from '@/components/notifications/audience-filter-form';

function formatDT(dt) {
  try { return new Date(dt).toLocaleString(); } catch { return dt; }
}

function toLocalInputValue(d) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getId(value) {
  return value?.id || value?.Id;
}

function getPerson(entity) {
  return entity?.person || entity?.Person || {};
}

function personName(person) {
  return `${person.first_name || person.firstName || ''} ${person.last_name || person.lastName || ''}`.trim();
}

function readAppointmentStart(appointment) {
  return appointment?.appointment_start_time || appointment?.appointmentStartTime;
}

function readPatientId(appointment) {
  return appointment?.patient_id || appointment?.patientId || appointment?.patient?.id;
}

function readStatusId(appointment) {
  return appointment?.status_id || appointment?.statusId || appointment?.status?.id;
}

function readStatusName(status) {
  return status?.name || status?.status_name || status?.statusName || status?.label || '';
}

function readEmbeddedStatusName(appointment) {
  return readStatusName(appointment?.status) || appointment?.status_name || appointment?.statusName || '';
}

function validDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

export default function NotificationsPage() {
  const [tab, setTab] = useState('reminder');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-app-muted">Send reminders, mass emails, and view history</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 flex flex-wrap gap-2">
          <TabsTrigger value="reminder">Send Reminder</TabsTrigger>
          <TabsTrigger value="campaign">Campaign</TabsTrigger>
          <TabsTrigger value="quick">Quick Send</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="reminder"><SendReminderTab /></TabsContent>
        <TabsContent value="campaign"><CampaignTab /></TabsContent>
        <TabsContent value="quick"><QuickSendTab /></TabsContent>
        <TabsContent value="history"><HistoryTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function SendReminderTab() {
  const { notify } = useToast();
  const { data: appointments, error: appointmentsError } = useSWR('appointments-all', () => api.appointment.getAll());
  const { data: patients, error: patientsError } = useSWR('patients-all', () => api.patient.getAll());
  const { data: statuses } = useSWR('appointment-status-all', () => api.lookup.appointmentStatus.getAll());

  // Use local-formatted defaults for datetime-local
  const [start, setStart] = useState(() => toLocalInputValue(new Date()));
  const [end, setEnd] = useState(() => { const d = new Date(); d.setDate(d.getDate()+3); return toLocalInputValue(d); });
  const [rangeMode, setRangeMode] = useState('upcoming');
  const [statusFilter, setStatusFilter] = useState('all');
  // Debounced effective range
  const [effStart, setEffStart] = useState(start);
  const [effEnd, setEffEnd] = useState(end);
  const [loadingRows, setLoadingRows] = useState(false);
  useEffect(() => {
    setLoadingRows(true);
    const t = setTimeout(() => { setEffStart(start); setEffEnd(end); setLoadingRows(false); }, 500);
    return () => clearTimeout(t);
  }, [start, end]);
  const [selected, setSelected] = useState(new Set());

  const statusOptions = useMemo(() => {
    const map = new Map();
    (statuses || []).forEach((status) => {
      const id = String(getId(status) || '');
      if (id) map.set(id, readStatusName(status) || 'Unknown');
    });
    (appointments || []).forEach((appointment) => {
      const id = String(readStatusId(appointment) || '');
      if (id && !map.has(id)) map.set(id, readEmbeddedStatusName(appointment) || 'Unknown');
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [appointments, statuses]);

  const rows = useMemo(() => {
    if (!appointments || !patients) return [];
    const now = new Date();
    const startDt = rangeMode === 'upcoming' ? now : validDate(effStart);
    const endDt = rangeMode === 'upcoming' ? null : validDate(effEnd);
    const pmap = new Map((patients || []).map(p => [getId(p) || p.patient_id || p.patientId, p]));
    const statusMap = new Map((statuses || []).map(s => [String(getId(s) || ''), readStatusName(s) || 'Unknown']));

    return (appointments || [])
      .filter(a => {
        const when = validDate(readAppointmentStart(a));
        const statusId = String(readStatusId(a) || '');
        if (statusFilter !== 'all' && statusId !== statusFilter) return false;
        if (startDt && (!when || when < startDt)) return false;
        if (endDt && (!when || when > endDt)) return false;
        return true;
      })
      .map(a => {
        const patientId = readPatientId(a);
        const p = pmap.get(patientId) || {};
        const person = getPerson(p);
        const name = personName(person);
        const email = person.email || '';
        const when = validDate(readAppointmentStart(a));
        const reason = a.reason_for_visit || a.reasonForVisit || 'Appointment';
        const statusId = String(readStatusId(a) || '');
        const statusName = statusMap.get(statusId) || readEmbeddedStatusName(a) || 'Unknown';
        const dateCopy = when ? `${when.toLocaleDateString()} at ${when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No appointment time';
        const appointmentId = a.id || a.Id;
        return {
          id: appointmentId || `${patientId || 'patient'}-${readAppointmentStart(a) || reason}`,
          appointmentId,
          personId: person.id,
          name,
          email,
          context: `${reason} - ${dateCopy} - ${statusName}`,
          payload: {
            appointmentDate: when ? when.toISOString().slice(0,10) : '',
            appointmentTime: when ? when.toTimeString().slice(0,5) : '',
          }
        };
      });
  }, [appointments, patients, statuses, effStart, effEnd, rangeMode, statusFilter]);

  const onSelectAll = () => setSelected(new Set(rows.filter(r => r.personId).map(r => r.id || r.personId)));
  const onClearAll = () => setSelected(new Set());

  const applyRange = (mode) => {
    setRangeMode(mode);
    const now = new Date();
    if (mode === 'upcoming') {
      setStart(toLocalInputValue(now));
      return;
    }
    if (mode === 'today') {
      const from = now;
      const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0);
      setStart(toLocalInputValue(from));
      setEnd(toLocalInputValue(to));
    }
    if (mode === 'next7') {
      const from = now;
      const to = new Date(now);
      to.setDate(to.getDate() + 7);
      setStart(toLocalInputValue(from));
      setEnd(toLocalInputValue(to));
    }
    if (mode === 'custom') {
      setRangeMode('custom');
    }
  };

  const preview = async () => {
    try {
      const filters = {
        hasEmail: true,
        hasUpcomingAppointment: true,
      };
      if (rangeMode !== 'upcoming') {
        filters.appointmentBetweenStart = new Date(start).toISOString();
        filters.appointmentBetweenEnd = new Date(end).toISOString();
      }
      const res = await api.campaigns.preview({
        audienceType: 'Patient',
        channel: 'Email',
        topicCode: 'APPT_REMINDER',
        filters,
      });
      notify({ title: `Preview: ${res.eligibleCount || 0} eligible`, description: res.exclusions ? JSON.stringify(res.exclusions) : undefined });
    } catch (e) {
      notify({ title: 'Preview failed', description: String(e?.message || e) });
    }
  };

  const send = async () => {
    try {
      const chosen = rows.filter(r => selected.has(r.id || r.personId));
      const personIds = Array.from(new Set(chosen.map(r => r.personId).filter(Boolean)));
      const body = {
        topicCode: 'APPT_REMINDER',
        channel: 'Email',
        personIds,
        // scheduledFor: undefined,
        initiatedBy: 'portal',
        // We send without appointment_id here; payload is generic per topic
        payload: {},
      };
      const res = await api.notifications.dispatch(body);
      notify({ title: `Reminders queued: ${res.eligibleCount || 0} eligible`, description: res.exclusions ? JSON.stringify(res.exclusions) : undefined });
    } catch (e) {
      notify({ title: 'Dispatch failed', description: String(e?.message || e) });
    }
  };

  const totalUpcomingAppointments = useMemo(() => {
    const now = new Date();
    return (appointments || []).filter((appointment) => {
      const when = validDate(readAppointmentStart(appointment));
      return when && when >= now;
    }).length;
  }, [appointments]);
  const loadError = appointmentsError || patientsError;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loadError && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Failed to load appointments or patients.
            </div>
          )}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {[
              ['upcoming', 'Upcoming'],
              ['today', 'Today'],
              ['next7', 'Next 7 days'],
              ['custom', 'Custom'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => applyRange(value)}
                className={`rounded-md border px-3 py-1.5 text-sm ${rangeMode === value ? 'border-sky-700 bg-sky-700 text-white' : 'border-app-border bg-white text-slate-700 hover:bg-app-bg'}`}
              >
                {label}
              </button>
            ))}
            <select className="h-9 rounded-md border border-app-border bg-app-surface px-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              {statusOptions.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
            </select>
            <div className="ml-auto text-sm text-app-muted">{rows.length} shown of {totalUpcomingAppointments} upcoming</div>
          </div>
          {rangeMode !== 'upcoming' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-app-muted mb-1">Start</div>
                <Input type="datetime-local" value={start} onChange={(e) => { setRangeMode('custom'); setStart(e.target.value); }} />
              </div>
              <div>
                <div className="text-xs text-app-muted mb-1">End</div>
                <Input type="datetime-local" value={end} onChange={(e) => { setRangeMode('custom'); setEnd(e.target.value); }} />
              </div>
            </div>
          )}
          <RecipientSelector
            rows={rows}
            selectedIds={selected}
            setSelectedIds={setSelected}
            onSelectAll={onSelectAll}
            onClearAll={onClearAll}
            loading={!appointments || !patients || loadingRows}
            emptyMessage="No upcoming appointments match the current filters."
          />
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={preview}>Preview</Button>
            <Button onClick={send} disabled={selected.size === 0}>Send Reminders</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Reminder Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-app-border p-3">
              <div className="text-xs text-app-muted">Appointments</div>
              <div className="mt-1 text-xl font-semibold">{rows.length}</div>
            </div>
            <div className="rounded-md border border-app-border p-3">
              <div className="text-xs text-app-muted">Selected</div>
              <div className="mt-1 text-xl font-semibold">{selected.size}</div>
            </div>
            <div className="rounded-md border border-app-border p-3">
              <div className="text-xs text-app-muted">With email</div>
              <div className="mt-1 text-xl font-semibold">{rows.filter(r => r.email).length}</div>
            </div>
            <div className="rounded-md border border-app-border p-3">
              <div className="text-xs text-app-muted">Missing contact</div>
              <div className="mt-1 text-xl font-semibold">{rows.filter(r => !r.personId).length}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignTab() {
  const { notify } = useToast();
  const { data: roles } = useSWR('roles-all', () => api.lookup.roles.getAll());
  const { data: specialties } = useSWR('specialties-all', () => api.lookup.specialties.getAll());

  const [audience, setAudience] = useState('Patient');
  const [topicCode, setTopicCode] = useState('');
  const [filters, setFilters] = useState({ hasEmail: true });
  const [previewRes, setPreviewRes] = useState(null);
  const [campaignName, setCampaignName] = useState('New Campaign');
  const [scheduledAt, setScheduledAt] = useState('');
  const [launching, setLaunching] = useState(false);

  const doPreview = async () => {
    try {
      const res = await api.campaigns.preview({
        audienceType: audience,
        channel: 'Email',
        topicCode,
        filters,
      });
      setPreviewRes(res);
    } catch (e) {
      setPreviewRes(null);
      notify({ title: 'Preview failed', description: String(e?.message || e) });
    }
  };

  const createAndLaunch = async () => {
    setLaunching(true);
    try {
      const created = await api.campaigns.create({
        name: campaignName,
        audienceType: audience,
        topicCode,
        channel: 'Email',
        filters,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        initiatedBy: 'portal',
      });
      const res = await api.campaigns.launch(created.campaignId || created.id);
      notify({ title: `Campaign launched: ${res.eligibleCount || 0} eligible`, description: res.exclusions ? JSON.stringify(res.exclusions) : undefined });
    } catch (e) {
      notify({ title: 'Launch failed', description: String(e?.message || e) });
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Audience & Topic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-app-muted mb-1">Audience</div>
              <select className="w-full rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option value="Patient">Patient</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-app-muted mb-1">Topic</div>
              <TopicSelector value={topicCode} onChange={setTopicCode} filterAudience={audience} />
            </div>
          </div>
          <AudienceFilterForm audienceType={audience} filters={filters} setFilters={setFilters} roles={roles || []} specialties={specialties || []} />
          <div className="text-right">
            <Button variant="outline" onClick={doPreview}>Preview</Button>
          </div>
        </CardContent>
      </Card>

      {previewRes && (
        <CampaignPreviewCard result={previewRes} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Finalize</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="text-xs text-app-muted mb-1">Campaign Name</div>
            <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">Schedule (optional)</div>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
          <div className="md:col-span-3 text-right">
            <Button onClick={createAndLaunch} disabled={!campaignName || launching}>Create & Launch</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickSendTab() {
  const { notify } = useToast();
  const { data: patients } = useSWR('patients-all', () => http.get('/Patient'));
  const { data: staff } = useSWR('staff-all', () => http.get('/Staff'));
  const [audience, setAudience] = useState('Patient');
  const [personId, setPersonId] = useState('');
  const [topicCode, setTopicCode] = useState('');
  const [payloadText, setPayloadText] = useState('');

  const options = useMemo(() => {
    const src = audience === 'Patient' ? (patients || []) : (staff || []);
    return src.map(x => {
      const person = (x.person || {});
      const name = `${person.first_name || person.firstName || ''} ${person.last_name || person.lastName || ''}`.trim();
      return { value: person.id, label: `${name || '(no name)'} — ${person.email || 'no email'}` };
    });
  }, [patients, staff, audience]);

  const send = async () => {
    try {
      let payload = {};
      try { payload = payloadText ? JSON.parse(payloadText) : {}; } catch { payload = {}; }
      const res = await api.notifications.dispatch({
        topicCode,
        channel: 'Email',
        personIds: [personId],
        payload,
        initiatedBy: 'portal',
      });
      notify({ title: `Queued: ${res.eligibleCount || 0} eligible`, description: res.exclusions ? JSON.stringify(res.exclusions) : undefined });
    } catch (e) {
      notify({ title: 'Send failed', description: String(e?.message || e) });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>One-off Email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-app-muted mb-1">Audience</div>
            <select className="w-full rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" value={audience} onChange={(e) => { setAudience(e.target.value); setPersonId(''); }}>
              <option value="Patient">Patient</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-app-muted mb-1">Recipient</div>
            <select className="w-full rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" value={personId} onChange={(e) => setPersonId(e.target.value)}>
              <option value="">Select recipient…</option>
              {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="text-xs text-app-muted mb-1">Topic</div>
            <TopicSelector value={topicCode} onChange={setTopicCode} />
          </div>
          <div>
            <div className="text-xs text-app-muted mb-1">Payload (JSON)</div>
            <textarea className="min-h-28 w-full rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" placeholder='{"key":"value"}' value={payloadText} onChange={(e) => setPayloadText(e.target.value)} />
          </div>
        </div>
        <div className="text-right">
          <Button onClick={send} disabled={!personId}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryTab() {
  const { notify } = useToast();
  const { data: list, error, mutate } = useSWR('campaigns-list', () => api.campaigns.list().catch(() => []));
  const [expanded, setExpanded] = useState(null);
  const { data: stats } = useSWR(expanded ? `campaign-stats-${expanded}` : null, () => api.campaigns.stats(expanded));

  if (error) return <div className="text-red-600">Failed to load history.</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-app-border overflow-hidden">
            <div className="grid grid-cols-6 gap-2 px-3 py-2 bg-app-bg border-b border-app-border text-sm">
              <div>Name</div>
              <div>Status</div>
              <div>Topic</div>
              <div>Channel</div>
              <div>Created</div>
              <div></div>
            </div>
            <div>
              {(list || []).map(c => (
                <div key={c.id} className="grid grid-cols-6 gap-2 px-3 py-2 border-b border-app-border text-sm items-center">
                  <div className="font-medium truncate">{c.name}</div>
                  <div className={
                    (c.status || '').toLowerCase().includes('sent') || (c.status || '').toLowerCase().includes('complete') ? 'text-teal-700' :
                    (c.status || '').toLowerCase().includes('fail') || (c.status || '').toLowerCase().includes('cancel') ? 'text-rose-700' : 'text-amber-700'
                  }>{c.status}</div>
                  <div className="truncate">{c.topic_code || c.topicCode}</div>
                  <div>{c.channel}</div>
                  <div>{formatDT(c.created_at || c.createdAt)}</div>
                  <div className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>{expanded === c.id ? 'Hide' : 'View'}</Button>
                  </div>
                </div>
              ))}
              {(!list || list.length === 0) && (
                <div className="px-3 py-6 text-center text-sm text-app-muted">No campaigns yet.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {expanded && stats && (
        <DeliveryStatsCard stats={stats} />
      )}
    </div>
  );
}
