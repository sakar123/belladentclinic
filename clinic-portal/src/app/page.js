"use client";
import useSWR from "swr";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, CreditCard, Activity } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <Card className="elevate">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-app-muted">{label}</div>
            <div className="text-2xl font-semibold mt-1">{value}</div>
            {sub ? <div className="text-xs text-app-muted mt-1">{sub}</div> : null}
          </div>
          <div className="p-3 rounded-lg bg-teal-600/10 text-teal-700">
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const { data: patients } = useSWR("dashboard-patients", () => api.patient.getAll());
  const { data: appointments } = useSWR("dashboard-appointments", () => api.appointment.getAll());
  const { data: invoices } = useSWR("dashboard-billing", () => api.billing.getAll());

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const sevenDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

  const apptsToday = (appointments || []).filter((a) => {
    const t = new Date(a.appointment_start_time);
    return t >= startOfToday && t < endOfToday;
  });
  const apptsNext7 = (appointments || []).filter((a) => {
    const t = new Date(a.appointment_start_time);
    return t >= startOfToday && t < sevenDays;
  });

  // Build last 7 days series
  const series = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i));
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    const count = (appointments || []).filter((a) => {
      const t = new Date(a.appointment_start_time);
      return t >= dayStart && t < dayEnd;
    }).length;
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, value: count };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to BellaDent</h1>
        <p className="text-sm text-app-muted">Overview and quick insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat icon={Users} label="Patients" value={patients ? patients.length : "—"} />
        <Stat icon={CalendarDays} label="Today" value={apptsToday.length} sub="Appointments" />
        <Stat icon={Activity} label="Next 7 days" value={apptsNext7.length} sub="Appointments" />
        <Stat icon={CreditCard} label="Invoices" value={invoices ? invoices.length : "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Appointments (last 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} width={28} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(apptsNext7
                .slice()
                .sort((a, b) => new Date(a.appointment_start_time) - new Date(b.appointment_start_time))
                .slice(0, 6)
              ).map((a) => {
                const t = new Date(a.appointment_start_time);
                const when = `${t.toLocaleDateString()} ${t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                const p = a.patient?.person;
                const s = a.staff?.person;
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p ? `${p.first_name} ${p.last_name}` : 'Patient'}</div>
                      <div className="text-xs text-app-muted truncate">
                        {s ? `${s.first_name} ${s.last_name}` : '—'} · {when}
                      </div>
                    </div>
                  </div>
                );
              })}
              {!appointments && <div className="text-sm text-app-muted">Loading…</div>}
              {appointments && apptsNext7.length === 0 && (
                <div className="text-sm text-app-muted">No upcoming appointments.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
