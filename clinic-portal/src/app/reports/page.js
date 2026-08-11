"use client";

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Activity,
  BarChart3,
  Download,
  Filter,
  LineChart as LineChartIcon,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '@/lib/api';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CHART_COLORS = ['#0f766e', '#0284c7', '#be123c', '#ca8a04', '#7c3aed', '#334155', '#059669', '#c2410c'];

const FIELD_DEFS = {
  source: { label: 'Source', type: 'text' },
  date: { label: 'Date', type: 'date' },
  month: { label: 'Month', type: 'text' },
  patient: { label: 'Patient', type: 'text' },
  staff: { label: 'Staff', type: 'text' },
  status: { label: 'Status', type: 'text' },
  service: { label: 'Service', type: 'text' },
  category: { label: 'Category', type: 'text' },
  gender: { label: 'Gender', type: 'text' },
  ageBand: { label: 'Age Band', type: 'text' },
  amount: { label: 'Amount', type: 'number' },
  paid: { label: 'Paid', type: 'number' },
  balance: { label: 'Balance', type: 'number' },
  minutes: { label: 'Minutes', type: 'number' },
  tooth: { label: 'Tooth', type: 'text' },
  reason: { label: 'Reason', type: 'text' },
};

const REPORTS = {
  all: {
    label: 'All Activity',
    defaultGroup: 'source',
    defaultMetric: 'count',
    fields: ['source', 'date', 'patient', 'staff', 'status', 'service', 'category', 'amount', 'paid', 'balance'],
    groups: ['source', 'month', 'status', 'patient', 'staff', 'service', 'category'],
    metrics: ['count', 'amount', 'paid', 'balance', 'minutes'],
  },
  appointments: {
    label: 'Appointments',
    defaultGroup: 'status',
    defaultMetric: 'count',
    fields: ['date', 'patient', 'staff', 'status', 'reason', 'minutes'],
    groups: ['status', 'month', 'staff', 'patient', 'reason'],
    metrics: ['count', 'minutes'],
  },
  billing: {
    label: 'Billing',
    defaultGroup: 'month',
    defaultMetric: 'amount',
    fields: ['date', 'patient', 'status', 'amount', 'paid', 'balance'],
    groups: ['month', 'status', 'patient'],
    metrics: ['count', 'amount', 'paid', 'balance'],
  },
  treatments: {
    label: 'Treatments',
    defaultGroup: 'service',
    defaultMetric: 'count',
    fields: ['date', 'patient', 'staff', 'service', 'status', 'tooth', 'amount'],
    groups: ['service', 'status', 'month', 'staff', 'patient', 'tooth'],
    metrics: ['count', 'amount'],
  },
  patients: {
    label: 'Patients',
    defaultGroup: 'ageBand',
    defaultMetric: 'count',
    fields: ['date', 'patient', 'gender', 'ageBand'],
    groups: ['gender', 'ageBand', 'month'],
    metrics: ['count'],
  },
  documents: {
    label: 'Documents',
    defaultGroup: 'category',
    defaultMetric: 'count',
    fields: ['date', 'patient', 'category'],
    groups: ['category', 'month', 'patient'],
    metrics: ['count'],
  },
  services: {
    label: 'Services',
    defaultGroup: 'category',
    defaultMetric: 'amount',
    fields: ['service', 'category', 'amount'],
    groups: ['category', 'service'],
    metrics: ['count', 'amount'],
  },
};

const METRICS = {
  count: { label: 'Records', format: 'number' },
  amount: { label: 'Amount', format: 'money' },
  paid: { label: 'Paid', format: 'money' },
  balance: { label: 'Balance', format: 'money' },
  minutes: { label: 'Minutes', format: 'number' },
};

const DATE_PRESETS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: 'year', label: 'This year' },
  { value: 'custom', label: 'Custom' },
];

const TEXT_OPERATORS = ['contains', 'equals', 'not'];
const NUMBER_OPERATORS = ['equals', 'gt', 'gte', 'lt', 'lte'];
const DATE_OPERATORS = ['on', 'after', 'before'];
const TOKEN_ALIASES = {
  q: 'text',
  type: 'source',
  source: 'source',
  status: 'status',
  patient: 'patient',
  staff: 'staff',
  provider: 'staff',
  service: 'service',
  category: 'category',
  gender: 'gender',
  tooth: 'tooth',
};

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function text(value) {
  return String(value ?? '').trim();
}

function normalize(value) {
  return text(value).toLowerCase();
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getId(value) {
  return value?.id || value?.Id || value;
}

function getPersonName(person) {
  if (!person) return '';
  return `${person.first_name || person.firstName || ''} ${person.last_name || person.lastName || ''}`.trim();
}

function entityPersonName(entity) {
  return getPersonName(entity?.person || entity?.Person || entity);
}

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function getDateRange(preset, from, to) {
  if (preset === 'custom') {
    return {
      from: from ? startOfDay(new Date(from)) : null,
      to: to ? endOfDay(new Date(to)) : null,
    };
  }
  if (preset === 'all') return { from: null, to: null };

  const now = new Date();
  const today = startOfDay(now);
  if (preset === 'today') return { from: today, to: endOfDay(now) };
  if (preset === 'year') return { from: new Date(now.getFullYear(), 0, 1), to: endOfDay(now) };

  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - (days - 1));
  return { from: fromDate, to: endOfDay(now) };
}

function monthLabel(date) {
  if (!date) return 'No date';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function ageFromDob(value) {
  const dob = toDate(value);
  if (!dob) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

function ageBand(age) {
  if (!Number.isFinite(age)) return 'Unknown';
  if (age < 13) return 'Child';
  if (age < 20) return 'Teen';
  if (age < 35) return '20-34';
  if (age < 50) return '35-49';
  if (age < 65) return '50-64';
  return '65+';
}

function buildSearchText(values, display) {
  return normalize([
    display?.primary,
    display?.detail,
    display?.party,
    ...Object.values(values || {}),
  ].filter(Boolean).join(' '));
}

function makeRow({ id, source, date, values, metrics, display, href }) {
  const dateObj = toDate(date);
  const rowValues = {
    source,
    date: dateObj,
    month: monthLabel(dateObj),
    ...values,
  };
  return {
    id: `${source}-${id}`,
    source,
    date: dateObj,
    values: rowValues,
    metrics: { count: 1, ...metrics },
    display: {
      date: dateObj ? dateObj.toLocaleDateString() : '-',
      status: values?.status || '-',
      amount: metrics?.amount || 0,
      ...display,
    },
    href,
    searchText: buildSearchText(rowValues, display),
  };
}

function buildReportRows({ appointments = [], billings = [], patients = [], staff = [], services = [], treatments = [], documents = [], statuses = [], docTypes = [] }) {
  const patientMap = new Map(patients.map((patient) => [String(getId(patient)), patient]));
  const staffMap = new Map(staff.map((member) => [String(getId(member)), member]));
  const serviceMap = new Map(services.map((service) => [String(getId(service)), service]));
  const statusMap = new Map(statuses.map((status) => [String(getId(status)), status]));
  const docTypeMap = new Map(docTypes.map((docType) => [String(getId(docType)), docType]));

  const patientName = (patientId, embedded) => {
    return entityPersonName(embedded) || entityPersonName(patientMap.get(String(patientId))) || 'Unknown patient';
  };
  const staffName = (staffId, embedded) => {
    return entityPersonName(embedded) || entityPersonName(staffMap.get(String(staffId))) || 'Unassigned';
  };
  const serviceName = (serviceId, fallback) => {
    return fallback || serviceMap.get(String(serviceId))?.name || 'Service';
  };
  const serviceCost = (serviceId) => number(serviceMap.get(String(serviceId))?.cost);

  const appointmentRows = appointments.map((appointment) => {
    const date = appointment.appointment_start_time || appointment.appointmentStartTime;
    const status = appointment.status?.name || statusMap.get(String(appointment.status_id || appointment.statusId))?.name || 'Unknown';
    const patient = patientName(appointment.patient_id || appointment.patientId || appointment.patient?.id, appointment.patient?.person || appointment.patient);
    const provider = staffName(appointment.staff_id || appointment.staffId || appointment.staff?.id, appointment.staff?.person || appointment.staff);
    const reason = appointment.reason_for_visit || appointment.reasonForVisit || 'Visit';
    const minutes = number(appointment.duration_minutes || appointment.durationMinutes);
    return makeRow({
      id: getId(appointment),
      source: 'Appointments',
      date,
      values: { patient, staff: provider, status, reason, minutes },
      metrics: { minutes },
      display: {
        primary: reason,
        detail: provider,
        party: patient,
        status,
      },
      href: `/appointments/${getId(appointment)}`,
    });
  });

  const billingRows = billings.map((billing) => {
    const date = billing.issue_date || billing.issueDate || billing.created_at || billing.createdAt || billing.due_date || billing.dueDate;
    const patient = patientName(billing.patient_id || billing.patientId, billing.patient);
    const amount = number(billing.total_amount || billing.totalAmount);
    const paid = number(billing.amount_paid || billing.amountPaid);
    const balance = Math.max(0, amount - paid);
    const status = billing.status || 'Open';
    return makeRow({
      id: getId(billing),
      source: 'Billing',
      date,
      values: { patient, status, amount, paid, balance },
      metrics: { amount, paid, balance },
      display: {
        primary: `Invoice ${String(getId(billing) || '').slice(0, 8)}`,
        detail: `Paid ${formatMoney(paid)} · Balance ${formatMoney(balance)}`,
        party: patient,
        status,
        amount,
      },
      href: `/billing/${getId(billing)}`,
    });
  });

  const treatmentRows = treatments.map((treatment) => {
    const date = treatment.completed_at || treatment.completedAt || treatment.created_at || treatment.createdAt;
    const patient = patientName(treatment.patient_id || treatment.patientId, treatment.patient);
    const provider = staffName(treatment.staff_id || treatment.staffId, treatment.staff);
    const service = serviceName(treatment.service_id || treatment.serviceId, treatment.service_name || treatment.serviceName);
    const amount = serviceCost(treatment.service_id || treatment.serviceId);
    const status = treatment.status || 'Planned';
    const toothNumbers = Array.isArray(treatment.tooth_numbers || treatment.toothNumbers)
      ? (treatment.tooth_numbers || treatment.toothNumbers)
      : treatment.tooth_number || treatment.toothNumber
        ? [treatment.tooth_number || treatment.toothNumber]
        : [];
    const tooth = toothNumbers.length > 0 ? toothNumbers.join(', ') : treatment.treatment_scope || treatment.treatmentScope || 'General';
    return makeRow({
      id: getId(treatment),
      source: 'Treatments',
      date,
      values: { patient, staff: provider, service, status, tooth, amount, category: treatment.treatment_scope || treatment.treatmentScope || '' },
      metrics: { amount },
      display: {
        primary: service,
        detail: toothNumbers.length > 0 ? `Tooth ${tooth}` : tooth,
        party: patient,
        status,
        amount,
      },
      href: treatment.appointment_id || treatment.appointmentId ? `/appointments/${treatment.appointment_id || treatment.appointmentId}` : undefined,
    });
  });

  const patientRows = patients.map((patient) => {
    const person = patient.person || patient.Person || {};
    const name = patientName(getId(patient), person);
    const date = patient.created_at || patient.createdAt || person.created_at || person.createdAt || person.date_of_birth || person.dateOfBirth;
    const age = ageFromDob(person.date_of_birth || person.dateOfBirth);
    const gender = person.gender || 'Unknown';
    return makeRow({
      id: getId(patient),
      source: 'Patients',
      date,
      values: { patient: name, gender, ageBand: ageBand(age), age: age ?? '', category: gender },
      metrics: { age: age || 0 },
      display: {
        primary: name,
        detail: person.phone_number || person.phoneNumber || person.email || '',
        party: gender,
        status: ageBand(age),
      },
      href: `/patients/${getId(patient)}`,
    });
  });

  const documentRows = documents.map((document) => {
    const patient = patientName(document.patient_id || document.patientId, document.patient);
    const docType = docTypeMap.get(String(document.document_type_id || document.documentTypeId));
    const category = document.document_type_code || document.documentTypeCode || docType?.name || docType?.document_type_code || 'Document';
    const date = document.upload_date || document.uploadDate || document.created_at || document.createdAt;
    return makeRow({
      id: getId(document),
      source: 'Documents',
      date,
      values: { patient, category, status: document.is_sensitive || document.isSensitive ? 'Sensitive' : 'Standard' },
      metrics: {},
      display: {
        primary: document.description || category,
        detail: category,
        party: patient,
        status: document.is_sensitive || document.isSensitive ? 'Sensitive' : 'Standard',
      },
    });
  });

  const serviceRows = services.map((service) => {
    const amount = number(service.cost);
    const category = service.specialty?.name || service.specialty_name || service.specialtyName || service.description || 'General';
    return makeRow({
      id: getId(service),
      source: 'Services',
      date: service.created_at || service.createdAt,
      values: { service: service.name || 'Service', category, amount, status: service.is_active === false ? 'Inactive' : 'Active' },
      metrics: { amount },
      display: {
        primary: service.name || 'Service',
        detail: category,
        party: 'Service catalog',
        status: service.is_active === false ? 'Inactive' : 'Active',
        amount,
      },
      href: `/admin/services/${getId(service)}`,
    });
  });

  return {
    all: [...appointmentRows, ...billingRows, ...treatmentRows, ...patientRows, ...documentRows, ...serviceRows],
    appointments: appointmentRows,
    billing: billingRows,
    treatments: treatmentRows,
    patients: patientRows,
    documents: documentRows,
    services: serviceRows,
  };
}

function parseSmartQuery(query) {
  const filters = [];
  let remaining = query || '';
  const tokenPattern = /(\w+):(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  remaining = remaining.replace(tokenPattern, (_, key, quotedDouble, quotedSingle, bare) => {
    filters.push({ key: key.toLowerCase(), value: quotedDouble ?? quotedSingle ?? bare ?? '' });
    return ' ';
  });

  return {
    filters,
    terms: remaining.split(/\s+/).map((part) => part.trim()).filter(Boolean),
  };
}

function compareText(actual, expected, operator) {
  const a = normalize(actual);
  const e = normalize(expected);
  if (!e) return true;
  if (operator === 'equals') return a === e;
  if (operator === 'not') return a !== e && !a.includes(e);
  return a.includes(e);
}

function compareNumber(actual, expected, operator) {
  const a = number(actual);
  const e = Number(expected);
  if (!Number.isFinite(e)) return true;
  if (operator === 'gt') return a > e;
  if (operator === 'gte') return a >= e;
  if (operator === 'lt') return a < e;
  if (operator === 'lte') return a <= e;
  return a === e;
}

function compareDate(actual, expected, operator) {
  const actualDate = toDate(actual);
  const expectedDate = toDate(expected);
  if (!actualDate || !expectedDate) return true;
  if (operator === 'after') return actualDate >= startOfDay(expectedDate);
  if (operator === 'before') return actualDate <= endOfDay(expectedDate);
  return actualDate >= startOfDay(expectedDate) && actualDate <= endOfDay(expectedDate);
}

function matchesFilter(row, filter) {
  if (!filter?.field || !filter?.value) return true;
  const type = FIELD_DEFS[filter.field]?.type || 'text';
  const actual = row.values?.[filter.field] ?? row.metrics?.[filter.field];
  if (type === 'number') return compareNumber(actual, filter.value, filter.operator || 'equals');
  if (type === 'date') return compareDate(actual, filter.value, filter.operator || 'on');
  return compareText(actual, filter.value, filter.operator || 'contains');
}

function matchesSmartToken(row, token) {
  if (!token.value) return true;
  if (token.key === 'from') return compareDate(row.date, token.value, 'after');
  if (token.key === 'to') return compareDate(row.date, token.value, 'before');
  if (token.key === 'min') return compareNumber(row.metrics.amount ?? row.values.amount, token.value, 'gte');
  if (token.key === 'max') return compareNumber(row.metrics.amount ?? row.values.amount, token.value, 'lte');

  const field = TOKEN_ALIASES[token.key] || token.key;
  if (field === 'text') return row.searchText.includes(normalize(token.value));
  return compareText(row.values?.[field] ?? row.metrics?.[field] ?? '', token.value, 'contains');
}

function filterRows(rows, { query, dateRange, customFilters }) {
  const smart = parseSmartQuery(query);
  return rows.filter((row) => {
    if (dateRange.from && row.date && row.date < dateRange.from) return false;
    if (dateRange.to && row.date && row.date > dateRange.to) return false;
    if (dateRange.from && !row.date) return false;
    if (dateRange.to && !row.date) return false;
    if (!smart.filters.every((token) => matchesSmartToken(row, token))) return false;
    if (!smart.terms.every((term) => row.searchText.includes(normalize(term)))) return false;
    return customFilters.every((filter) => matchesFilter(row, filter));
  });
}

function aggregateRows(rows, groupBy, metric) {
  const map = new Map();
  rows.forEach((row) => {
    const rawLabel = row.values?.[groupBy];
    const label = rawLabel instanceof Date
      ? rawLabel.toLocaleDateString()
      : text(rawLabel || 'Unspecified');
    const current = map.get(label) || { name: label, value: 0, count: 0 };
    current.count += 1;
    current.value += metric === 'count' ? 1 : number(row.metrics?.[metric] ?? row.values?.[metric]);
    map.set(label, current);
  });

  return Array.from(map.values())
    .sort((a, b) => {
      if (groupBy === 'month') return a.name.localeCompare(b.name);
      return b.value - a.value;
    })
    .slice(0, 16);
}

function formatMoney(value) {
  return `Rs ${number(value).toLocaleString()}`;
}

function formatMetric(value, metric) {
  return METRICS[metric]?.format === 'money' ? formatMoney(value) : number(value).toLocaleString();
}

function getOperators(field) {
  const type = FIELD_DEFS[field]?.type || 'text';
  if (type === 'number') return NUMBER_OPERATORS;
  if (type === 'date') return DATE_OPERATORS;
  return TEXT_OPERATORS;
}

function operatorLabel(operator) {
  return {
    contains: 'contains',
    equals: 'equals',
    not: 'does not contain',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    on: 'on',
    after: 'after',
    before: 'before',
  }[operator] || operator;
}

function Kpi({ label, value, tone = 'default' }) {
  const color = tone === 'good' ? 'text-emerald-700' : tone === 'warn' ? 'text-amber-700' : tone === 'bad' ? 'text-rose-700' : 'text-slate-900';
  return (
    <div className="rounded-md border border-app-border bg-white p-3">
      <div className="text-xs text-app-muted">{label}</div>
      <div className={cn('mt-1 text-xl font-semibold', color)}>{value}</div>
    </div>
  );
}

function ReportChart({ chartType, data, metric }) {
  if (!data.length) {
    return <div className="grid h-80 place-items-center text-sm text-app-muted">No chart data</div>;
  }

  const commonTooltip = <Tooltip formatter={(value) => formatMetric(value, metric)} />;
  const axisColor = '#64748b';

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke={axisColor} fontSize={12} />
          <YAxis stroke={axisColor} fontSize={12} width={56} tickFormatter={(value) => metric === 'count' ? value : compactNumber(value)} />
          {commonTooltip}
          <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2.4} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke={axisColor} fontSize={12} />
          <YAxis stroke={axisColor} fontSize={12} width={56} tickFormatter={(value) => metric === 'count' ? value : compactNumber(value)} />
          {commonTooltip}
          <Area type="monotone" dataKey="value" stroke="#0f766e" fill="#0f766e" fillOpacity={0.18} strokeWidth={2.4} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {commonTooltip}
          <Pie data={data.slice(0, 8)} dataKey="value" nameKey="name" innerRadius={70} outerRadius={118} paddingAngle={2}>
            {data.slice(0, 8).map((entry, index) => (
              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke={axisColor} fontSize={12} />
        <YAxis stroke={axisColor} fontSize={12} width={56} tickFormatter={(value) => metric === 'count' ? value : compactNumber(value)} />
        {commonTooltip}
        <Bar dataKey="value" fill="#0f766e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function compactNumber(value) {
  const n = number(value);
  if (Math.abs(n) >= 1000000) return `${Math.round(n / 100000) / 10}m`;
  if (Math.abs(n) >= 1000) return `${Math.round(n / 100) / 10}k`;
  return n;
}

function exportCsv(rows) {
  const header = ['Date', 'Source', 'Name', 'Patient', 'Detail', 'Status', 'Amount', 'Paid', 'Balance'];
  const body = rows.map((row) => [
    row.display.date,
    row.source,
    row.display.primary,
    row.display.party,
    row.display.detail,
    row.display.status,
    row.metrics.amount || '',
    row.metrics.paid || '',
    row.metrics.balance || '',
  ]);
  const csv = [header, ...body]
    .map((line) => line.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `clinic-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { data: appointments, mutate: refreshAppointments } = useSWR('reports-appointments', () => api.appointment.getAll());
  const { data: billings, mutate: refreshBillings } = useSWR('reports-billing', () => api.billing.getAll());
  const { data: patients, mutate: refreshPatients } = useSWR('reports-patients', () => api.patient.getAll());
  const { data: staff, mutate: refreshStaff } = useSWR('reports-staff', () => api.staff.getAll());
  const { data: services, mutate: refreshServices } = useSWR('reports-services', () => api.service.getAll());
  const { data: treatments, mutate: refreshTreatments } = useSWR('reports-treatments', () => api.treatments.getAll());
  const { data: documents, mutate: refreshDocuments } = useSWR('reports-documents', () => api.document.getAll());
  const { data: statuses } = useSWR('reports-appointment-statuses', () => api.lookup.appointmentStatus.getAll());
  const { data: docTypes } = useSWR('reports-document-types', () => api.lookup.documentTypes.getAll());

  const [reportKey, setReportKey] = useState('all');
  const [query, setQuery] = useState('');
  const [datePreset, setDatePreset] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [groupBy, setGroupBy] = useState(REPORTS.all.defaultGroup);
  const [metric, setMetric] = useState(REPORTS.all.defaultMetric);
  const [chartType, setChartType] = useState('bar');
  const [customFilters, setCustomFilters] = useState([]);

  const report = REPORTS[reportKey] || REPORTS.all;
  const loading = !appointments || !billings || !patients || !staff || !services || !treatments || !documents;

  useEffect(() => {
    const nextReport = REPORTS[reportKey] || REPORTS.all;
    setGroupBy(nextReport.defaultGroup);
    setMetric(nextReport.defaultMetric);
    setCustomFilters([]);
  }, [reportKey]);

  const rowsByReport = useMemo(() => buildReportRows({
    appointments: appointments || [],
    billings: billings || [],
    patients: patients || [],
    staff: staff || [],
    services: services || [],
    treatments: treatments || [],
    documents: documents || [],
    statuses: statuses || [],
    docTypes: docTypes || [],
  }), [appointments, billings, docTypes, documents, patients, services, staff, statuses, treatments]);

  const sourceRows = useMemo(() => rowsByReport[reportKey] || rowsByReport.all || [], [reportKey, rowsByReport]);
  const dateRange = useMemo(() => getDateRange(datePreset, customFrom, customTo), [customFrom, customTo, datePreset]);
  const filteredRows = useMemo(() => filterRows(sourceRows, { query, dateRange, customFilters }), [customFilters, dateRange, query, sourceRows]);
  const chartData = useMemo(() => aggregateRows(filteredRows, groupBy, metric), [filteredRows, groupBy, metric]);
  const visibleRows = filteredRows.slice(0, 80);

  const totals = useMemo(() => {
    return filteredRows.reduce((acc, row) => {
      acc.records += 1;
      acc.amount += number(row.metrics.amount);
      acc.paid += number(row.metrics.paid);
      acc.balance += number(row.metrics.balance);
      acc.minutes += number(row.metrics.minutes);
      return acc;
    }, { records: 0, amount: 0, paid: 0, balance: 0, minutes: 0 });
  }, [filteredRows]);

  const activeFields = report.fields.map((field) => ({ value: field, label: FIELD_DEFS[field]?.label || field }));
  const groupOptions = report.groups.map((field) => ({ value: field, label: FIELD_DEFS[field]?.label || field }));
  const metricOptions = report.metrics.map((item) => ({ value: item, label: METRICS[item]?.label || item }));

  const addFilter = () => {
    const field = activeFields[0]?.value || 'status';
    setCustomFilters((current) => [
      ...current,
      { id: `${Date.now()}-${current.length}`, field, operator: getOperators(field)[0], value: '' },
    ]);
  };

  const updateFilter = (id, patch) => {
    setCustomFilters((current) => current.map((filter) => {
      if (filter.id !== id) return filter;
      const next = { ...filter, ...patch };
      if (patch.field) next.operator = getOperators(patch.field)[0];
      return next;
    }));
  };

  const refreshAll = () => {
    refreshAppointments();
    refreshBillings();
    refreshPatients();
    refreshStaff();
    refreshServices();
    refreshTreatments();
    refreshDocuments();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-app-muted">Custom views from clinic activity, billing, treatments, and patient data</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshAll}>
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button variant="secondary" disabled={filteredRows.length === 0} onClick={() => exportCsv(filteredRows)}>
            <Download size={16} /> Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Report Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.4fr_180px_160px_160px_150px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" size={16} />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder='patient:"James" status:paid from:2026-01-01'
                className="pl-9"
              />
            </div>
            <select className="h-11 rounded-md border border-app-border bg-app-surface px-3 text-sm" value={reportKey} onChange={(event) => setReportKey(event.target.value)}>
              {Object.entries(REPORTS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
            </select>
            <select className="h-11 rounded-md border border-app-border bg-app-surface px-3 text-sm" value={datePreset} onChange={(event) => setDatePreset(event.target.value)}>
              {DATE_PRESETS.map((preset) => <option key={preset.value} value={preset.value}>{preset.label}</option>)}
            </select>
            <select className="h-11 rounded-md border border-app-border bg-app-surface px-3 text-sm" value={groupBy} onChange={(event) => setGroupBy(event.target.value)}>
              {groupOptions.map((option) => <option key={option.value} value={option.value}>By {option.label}</option>)}
            </select>
            <select className="h-11 rounded-md border border-app-border bg-app-surface px-3 text-sm" value={metric} onChange={(event) => setMetric(event.target.value)}>
              {metricOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          {datePreset === 'custom' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[420px]">
              <Input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} />
              <Input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={addFilter}>
              <Plus size={15} /> Add Filter
            </Button>
            <Button size="sm" variant="ghost" disabled={!query && customFilters.length === 0 && datePreset === 'all'} onClick={() => { setQuery(''); setCustomFilters([]); setDatePreset('all'); setCustomFrom(''); setCustomTo(''); }}>
              Clear
            </Button>
          </div>

          {customFilters.length > 0 && (
            <div className="space-y-2">
              {customFilters.map((filter) => {
                const operators = getOperators(filter.field);
                return (
                  <div key={filter.id} className="grid grid-cols-1 gap-2 rounded-md border border-app-border bg-app-bg p-2 md:grid-cols-[180px_150px_1fr_auto]">
                    <select className="h-9 rounded-md border border-app-border bg-white px-2 text-sm" value={filter.field} onChange={(event) => updateFilter(filter.id, { field: event.target.value, value: '' })}>
                      {activeFields.map((field) => <option key={field.value} value={field.value}>{field.label}</option>)}
                    </select>
                    <select className="h-9 rounded-md border border-app-border bg-white px-2 text-sm" value={filter.operator} onChange={(event) => updateFilter(filter.id, { operator: event.target.value })}>
                      {operators.map((operator) => <option key={operator} value={operator}>{operatorLabel(operator)}</option>)}
                    </select>
                    <Input
                      type={FIELD_DEFS[filter.field]?.type === 'date' ? 'date' : FIELD_DEFS[filter.field]?.type === 'number' ? 'number' : 'text'}
                      value={filter.value}
                      onChange={(event) => updateFilter(filter.id, { value: event.target.value })}
                    />
                    <Button size="icon" variant="ghost" aria-label="Remove filter" onClick={() => setCustomFilters((current) => current.filter((item) => item.id !== filter.id))}>
                      <X size={16} />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <Kpi label="Rows" value={loading ? '...' : totals.records.toLocaleString()} />
        <Kpi label="Amount" value={formatMoney(totals.amount)} />
        <Kpi label="Paid" value={formatMoney(totals.paid)} tone="good" />
        <Kpi label="Balance" value={formatMoney(totals.balance)} tone={totals.balance > 0 ? 'warn' : 'default'} />
        <Kpi label="Minutes" value={totals.minutes.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>{METRICS[metric]?.label || 'Metric'} by {FIELD_DEFS[groupBy]?.label || groupBy}</CardTitle>
              <div className="inline-flex rounded-md border border-app-border bg-white p-1">
                {[
                  ['bar', BarChart3],
                  ['line', LineChartIcon],
                  ['area', Activity],
                  ['pie', Filter],
                ].map(([type, Icon]) => (
                  <button
                    key={type}
                    type="button"
                    aria-label={type}
                    onClick={() => setChartType(type)}
                    className={cn('grid size-9 place-items-center rounded text-app-muted hover:bg-app-bg', chartType === type && 'bg-teal-600 text-white hover:bg-teal-600')}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ReportChart chartType={chartType} data={chartData} metric={metric} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Top Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {chartData.slice(0, 8).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3 rounded-md border border-app-border px-3 py-2 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="font-medium">{formatMetric(item.value, metric)}</span>
                </div>
              ))}
              {chartData.length === 0 && <div className="text-sm text-app-muted">No groups</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Results</CardTitle>
            <div className="text-sm text-app-muted">{visibleRows.length.toLocaleString()} shown of {filteredRows.length.toLocaleString()}</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-y border-app-border bg-app-bg text-xs font-medium text-app-muted">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Patient</th>
                  <th className="px-3 py-2">Detail</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.id} className="border-b border-app-border last:border-0 hover:bg-app-bg/50">
                    <td className="whitespace-nowrap px-3 py-2">{row.display.date}</td>
                    <td className="px-3 py-2">{row.source}</td>
                    <td className="max-w-[220px] px-3 py-2">
                      {row.href ? (
                        <a className="font-medium text-sky-700 hover:underline" href={row.href}>{row.display.primary}</a>
                      ) : (
                        <span className="font-medium">{row.display.primary}</span>
                      )}
                    </td>
                    <td className="max-w-[220px] px-3 py-2 truncate">{row.display.party || '-'}</td>
                    <td className="max-w-[260px] px-3 py-2 truncate text-app-muted">{row.display.detail || '-'}</td>
                    <td className="px-3 py-2">{row.display.status || '-'}</td>
                    <td className="px-3 py-2 text-right">{row.metrics.amount ? formatMoney(row.metrics.amount) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleRows.length === 0 && (
            <div className="p-6 text-center text-sm text-app-muted">
              {loading ? 'Loading report data...' : 'No matching records'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
