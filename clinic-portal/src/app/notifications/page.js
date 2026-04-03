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
import TopicSelector, { TOPICS } from '@/components/notifications/topic-selector';
import AudienceFilterForm from '@/components/notifications/audience-filter-form';

function formatDT(dt) {
  try { return new Date(dt).toLocaleString(); } catch { return dt; }
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
  const { data: appointments } = useSWR('appointments-all', () => http.get('/api/Appointment'));
  const { data: patients } = useSWR('patients-all', () => http.get('/api/Patient'));

  const [start, setStart] = useState(() => new Date().toISOString().slice(0,16));
  const [end, setEnd] = useState(() => {
    const d = new Date(); d.setDate(d.getDate()+3); return d.toISOString().slice(0,16);
  });
  const [selected, setSelected] = useState(new Set());

  const rows = useMemo(() => {
    if (!appointments || !patients) return [];
    const startDt = new Date(start);
    const endDt = new Date(end);
    const pmap = new Map(patients.map(p => [p.id || p.patient_id, p]));
    return (appointments || [])
      .filter(a => {
        const when = new Date(a.appointment_start_time || a.appointmentStartTime);
        const statusName = (a.status?.name || '').toLowerCase();
        const goodStatus = statusName.includes('scheduled') || statusName.includes('confirm');
        return goodStatus && when >= startDt && when <= endDt;
      })
      .map(a => {
        const p = pmap.get(a.patient_id || a.patient?.id) || {};
        const person = p.person || {};
        const name = `${person.first_name || person.firstName || ''} ${person.last_name || person.lastName || ''}`.trim();
        const email = person.email || '';
        const when = new Date(a.appointment_start_time || a.appointmentStartTime);
        return {
          appointmentId: a.id,
          personId: person.id,
          name,
          email,
          context: `${when.toLocaleDateString()} ${when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          payload: {
            appointmentDate: when.toISOString().slice(0,10),
            appointmentTime: when.toTimeString().slice(0,5),
          }
        };
      });
  }, [appointments, patients, start, end]);

  const onSelectAll = () => setSelected(new Set(rows.map(r => r.personId).filter(Boolean)));
  const onClearAll = () => setSelected(new Set());

  const preview = async () => {
    try {
      const res = await api.campaigns.preview({
        audienceType: 'Patient',
        channel: 'Email',
        topicCode: 'APPOINTMENT_REMINDER',
        filters: {
          hasEmail: true,
          hasUpcomingAppointment: true,
          appointmentBetweenStart: new Date(start).toISOString(),
          appointmentBetweenEnd: new Date(end).toISOString(),
        },
      });
      notify({ title: `Preview: ${res.eligibleCount || 0} eligible`, description: res.exclusions ? JSON.stringify(res.exclusions) : undefined });
    } catch (e) {
      notify({ title: 'Preview failed', description: String(e?.message || e) });
    }
  };

  const send = async () => {
    try {
      const chosen = rows.filter(r => selected.has(r.personId));
      const body = {
        topicCode: 'APPOINTMENT_REMINDER',
        channel: 'Email',
        personIds: chosen.map(r => r.personId),
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Appointment Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-app-muted mb-1">Start</div>
              <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">End</div>
              <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          <RecipientSelector rows={rows} selectedIds={selected} setSelectedIds={setSelected} onSelectAll={onSelectAll} onClearAll={onClearAll} />
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={preview}>Preview</Button>
            <Button onClick={send} disabled={selected.size === 0}>Send Reminders</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-app-muted space-y-1">
            <li>Only Scheduled/Confirmed appointments are included.</li>
            <li>Preview shows eligible recipients before sending.</li>
            <li>Sends are queued and delivered automatically.</li>
          </ul>
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
  const [topicCode, setTopicCode] = useState('MARKETING_PROMOTION');
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
  const { data: patients } = useSWR('patients-all', () => http.get('/api/Patient'));
  const { data: staff } = useSWR('staff-all', () => http.get('/api/Staff'));
  const [audience, setAudience] = useState('Patient');
  const [personId, setPersonId] = useState('');
  const [topicCode, setTopicCode] = useState('SYSTEM_NOTICE');
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

