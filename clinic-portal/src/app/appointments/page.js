"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { http } from "../../lib/http";
import { normalizePatient, normalizeStaff } from "../../lib/normalizers";
import Button from "../../components/ui/button";
import Dialog, { DialogBody, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import Input from "../../components/ui/input";
import Combobox from "../../components/ui/combobox";
import Badge from "../../components/ui/badge";
import { useToast } from "../../components/ui/toast";
import { motion } from "framer-motion";
import { X, User, CalendarDays, Clock } from "lucide-react";
import Link from "next/link";

// Subtle, white-first palette: neutral by default, blue secondary, pink tertiary
const statusColors = {
  scheduled: { badge: "gray", bg: "bg-gray-100", text: "text-gray-800" },
  confirmed: { badge: "secondary", bg: "bg-blue-100", text: "text-blue-800" },
  completed: { badge: "gray", bg: "bg-gray-200", text: "text-gray-800" },
  cancelled: { badge: "tertiary", bg: "bg-pink-100", text: "text-pink-800" },
};

function startOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  x.setHours(23, 59, 59, 999);
  return x;
}
function addDays(d, days) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Normalize an API Appointment DTO into the UI shape used by calendar/forms
function mapApiToUiAppt(a) {
  const startRaw = a?.appointment_start_time || a?.startTime || a?.start;
  const start = startRaw ? new Date(startRaw) : new Date();
  const dur = a?.duration_minutes ?? (a?.endTime ? Math.round((new Date(a.endTime) - start) / 60000) : 30);
  const end = new Date(start.getTime() + Math.max(1, dur) * 60000);
  return {
    ...a,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    patientId: a?.patient_id ?? a?.patientId,
    staffId: a?.staff_id ?? a?.staffId,
    statusId: a?.status_id ?? a?.statusId ?? a?.status?.id,
    title: a?.title || a?.reason || a?.reason_for_visit,
  };
}

export default function AppointmentsPage() {
  const [month, setMonth] = useState(new Date());
  const [cursor, setCursor] = useState(new Date()); // active date for week/day
  const [view, setView] = useState("month"); // month | week | day
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openView, setOpenView] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const { notify } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Fetch statuses once (cache)
        if (statuses.length === 0) {
          http.get("/api/AppointmentStatus").then((sts) => setStatuses(Array.isArray(sts) ? sts : [])).catch(() => {});
        }
        const apps = await http.get("/api/Appointment");
        setAllAppointments(Array.isArray(apps) ? apps.map(mapApiToUiAppt) : []);
      } catch (e) {
        console.error(e);
        setAllAppointments([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const appointments = useMemo(() => {
    const [start, end] = rangeForView(view, month, cursor);
    return (allAppointments || []).filter((a) => inRange(a, start, end));
  }, [allAppointments, view, month, cursor]);

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const startDay = start.getDay();
    const gridStart = addDays(start, -startDay);
    const cells = [];
    for (let i = 0; i < 42; i++) cells.push(addDays(gridStart, i));
    return cells;
  }, [month]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const a of appointments) {
      const start = new Date(a.startTime || a.start || a.start_date || a.startDate);
      if (isNaN(start)) continue;
      const key = new Date(start.getFullYear(), start.getMonth(), start.getDate()).toISOString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    return map;
  }, [appointments]);

  const openNew = (day) => {
    setEditing({
      id: undefined,
      patientId: undefined,
      staffId: undefined,
      startTime: new Date(day.setHours(9, 0, 0, 0)).toISOString(),
      endTime: new Date(day.setHours(9, 30, 0, 0)).toISOString(),
      status: "scheduled",
      notes: "",
    });
    setOpenForm(true);
    ensureLookups();
  };

  const ensureLookups = async () => {
    if (patients.length === 0) {
      http.get("/api/Patient")
        .then((x) => setPatients(Array.isArray(x) ? x.map(normalizePatient) : []))
        .catch(() => {});
    }
    if (staff.length === 0) {
      http.get("/api/Staff")
        .then((x) => setStaff(Array.isArray(x) ? x.map((s) => normalizeStaff(s)) : []))
        .catch(() => {});
    }
  };

  const onSubmit = async (data) => {
    try {
      const duration = Math.max(1, Math.round((new Date(data.endTime) - new Date(data.startTime)) / 60000));
      const payload = {
        patientId: data.patientId,
        staffId: data.staffId,
        statusId: data.statusId,
        appointmentStartTime: data.startTime,
        durationMinutes: duration,
        reasonForVisit: data.title || data.reason || "",
        notes: data.notes || "",
      };
      if (data.id) {
        await http.put(`/api/Appointment/${data.id}`, payload);
        notify({ title: "Appointment updated" });
      } else {
        await http.post("/api/Appointment", payload);
        notify({ title: "Appointment created" });
      }
      const apps = await http.get("/api/Appointment");
      setAllAppointments(Array.isArray(apps) ? apps.map(mapApiToUiAppt) : []);
      setOpenForm(false);
    } catch (e) {
      notify({ title: "Failed", description: String(e?.message || e) });
    }
  };

  const onDelete = async (id) => {
    try {
      await http.del(`/api/Appointment/${id}`);
      notify({ title: "Appointment deleted" });
      const apps = await http.get("/api/Appointment");
      setAllAppointments(Array.isArray(apps) ? apps : []);
      setOpenView(false);
    } catch (e) {
      notify({ title: "Delete failed", description: String(e?.message || e) });
    }
  };

  const gotoToday = () => {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setCursor(now);
  };

  // Open appointment with enriched details
  const handleOpenAppt = async (a) => {
    try {
      const full = await http.get(`/api/Appointment/${a.id}`);
      const ui = mapApiToUiAppt({ ...a, ...full });
      setEditing(ui);
      setOpenView(true);
    } catch (e) {
      setEditing(mapApiToUiAppt(a));
      setOpenView(true);
    }
  };

  function mapApiToUiAppt(a) {
    const startRaw = a.appointment_start_time || a.startTime || a.start;
    const start = startRaw ? new Date(startRaw) : new Date();
    const dur = a.duration_minutes ?? (a.endTime ? Math.round((new Date(a.endTime) - start) / 60000) : 30);
    const end = new Date(start.getTime() + Math.max(1, dur) * 60000);
    return {
      ...a,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      patientId: a.patient_id ?? a.patientId,
      staffId: a.staff_id ?? a.staffId,
      statusId: a.status_id ?? a.statusId ?? a.status?.id,
      title: a.title || a.reason || a.reason_for_visit,
    };
  }

  const navPrev = () => {
    if (view === "month") setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
    if (view === "week") setCursor(addDays(startOfWeek(cursor), -7));
    if (view === "day") setCursor(addDays(cursor, -1));
  };
  const navNext = () => {
    if (view === "month") setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));
    if (view === "week") setCursor(addDays(startOfWeek(cursor), 7));
    if (view === "day") setCursor(addDays(cursor, 1));
  };

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [cursor]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="text-sm text-app-muted">Calendar and scheduling</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex rounded-md border border-app-border overflow-hidden">
            <button className={`px-3 py-1.5 text-sm ${view==='month'?'bg-app-bg':''}`} onClick={() => setView('month')}>Month</button>
            <button className={`px-3 py-1.5 text-sm ${view==='week'?'bg-app-bg':''}`} onClick={() => setView('week')}>Week</button>
            <button className={`px-3 py-1.5 text-sm ${view==='day'?'bg-app-bg':''}`} onClick={() => setView('day')}>Day</button>
          </div>
          <Button variant="outline" onClick={navPrev}>{"<"} Prev</Button>
          <div className="min-w-[160px] text-center font-medium">
            {view==='month' && month.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            {view!=='month' && startOfWeek(cursor).toLocaleDateString()} {view!=='month' && '–'} {view!=='month' && endOfWeek(cursor).toLocaleDateString()}
          </div>
          <Button variant="outline" onClick={navNext}>Next {">"}</Button>
          <Button variant="outline" onClick={gotoToday}>Today</Button>
          <Button variant="secondary" onClick={() => openNew(new Date())}>New Appointment</Button>
        </div>
      </div>

      {view === 'month' && (
        <MonthGrid days={days} month={month} grouped={grouped} openNew={openNew} onOpen={handleOpenAppt} />
      )}

      {view !== 'month' && (
        <TimeGrid
          days={view==='week' ? weekDays : [cursor]}
          appointments={appointments}
          onOpen={handleOpenAppt}
          onCreate={(day, at) => openNew(new Date(day.getFullYear(), day.getMonth(), day.getDate(), at, 0, 0))}
          onMove={async (a, newStart, newEndOverride) => {
            // optimistic update
            const oldStart = new Date(a.startTime);
            const oldEnd = new Date(a.endTime);
            const dur = oldEnd - oldStart || (30*60*1000);
            const newEnd = newEndOverride ? newEndOverride : new Date(newStart.getTime() + dur);
            setAllAppointments((prev) => (prev || []).map((x) => x.id === a.id ? { ...x, startTime: newStart.toISOString(), endTime: newEnd.toISOString() } : x));
            try {
              const duration = Math.max(1, Math.round((newEnd - newStart) / 60000));
              const payload = {
                patientId: a.patientId || a.patient_id,
                staffId: a.staffId || a.staff_id,
                statusId: a.statusId || a.status_id || a.status?.id,
                appointmentStartTime: newStart.toISOString(),
                durationMinutes: duration,
                reasonForVisit: a.title || a.reason || a.reason_for_visit || "",
                notes: a.notes || "",
              };
              await http.put(`/api/Appointment/${a.id}`, payload);
              notify({ title: 'Rescheduled' });
            } catch (e) {
              notify({ title: 'Failed to reschedule', description: String(e?.message || e) });
            } finally {
              const apps = await http.get("/api/Appointment");
              setAllAppointments(Array.isArray(apps) ? apps.map(mapApiToUiAppt) : []);
            }
          }}
        />
      )}

      <ViewDialog
        open={openView}
        onClose={() => setOpenView(false)}
        appt={editing}
        patients={patients}
        staff={staff}
        onEdit={() => {
          setOpenView(false);
          setOpenForm(true);
          ensureLookups();
        }}
        onDelete={onDelete}
        statuses={statuses}
      />

      <AppointmentForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        value={editing}
        onChange={setEditing}
        onSubmit={onSubmit}
        patients={patients}
        staff={staff}
        statuses={statuses}
      />
    </div>
  );
}

function MonthGrid({ days, month, grouped, openNew, onOpen }) {
  return (
    <div className="rounded-xl border border-app-border bg-app-surface overflow-hidden">
      <div className="grid grid-cols-7 border-b border-app-border bg-app-bg/50 text-sm text-app-muted">
        {"Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",").map((d) => (
          <div key={d} className="px-3 py-2 border-r last:border-r-0 border-app-border">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d, idx) => {
          const otherMonth = d.getMonth() !== month.getMonth();
          const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
          const items = grouped.get(key) || [];
          const times = items
            .map((a) => new Date(a.startTime || a.start))
            .filter((t) => !isNaN(t))
            .sort((a, b) => a - b)
            .map((t) => t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          const maxTimes = 5;
          const note = times.length > 0
            ? `${Math.min(times.length, maxTimes) < times.length ? times.slice(0, maxTimes).join(', ') + ` +${times.length - maxTimes} more` : times.join(', ')}`
            : '';
          return (
            <div
              key={idx}
              className="min-h-[9rem] border-r border-b border-app-border p-2"
              onDoubleClick={() => openNew(new Date(d))}
              onContextMenu={(e) => { e.preventDefault(); openNew(new Date(d)); }}
              title="Double-click or right-click to add"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className={`text-xs ${otherMonth ? "text-app-muted" : ""}`}>{d.getDate()}</div>
                {items.length > 0 && (
                  <div className="text-[10px] text-app-muted truncate ml-2" title={times.join(', ')}>
                    {note}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                {items.map((a, i) => {
                  const s = String((a.status || "").toLowerCase());
                  const color = statusColors[s] || statusColors.scheduled;
                  const start = new Date(a.startTime || a.start);
                  const end = new Date(a.endTime || a.end);
                  const many = items.length >= 5;
                  return (
                    <motion.button
                      key={a.id}
                      onClick={() => onOpen(a)}
                      onDoubleClick={(e) => { e.stopPropagation(); }}
                      onContextMenu={(e) => { e.stopPropagation(); }}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`w-full ${color.bg} ${color.text} rounded-md px-2 ${many ? 'py-0.5 text-[10px]' : 'py-1 text-xs'} text-left`}
                      title={`${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    >
                      <div className={`truncate ${many ? 'font-normal' : 'font-medium'}`}>
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {a.title || a.reason || "Appointment"}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HOUR_PX = 48; // pixels per hour in time grid
const OPEN_HOUR = 7;
const CLOSE_HOUR = 19;

function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfWeek(d) {
  const s = startOfWeek(d);
  const x = addDays(s, 6);
  x.setHours(23, 59, 59, 999);
  return x;
}

function TimeGrid({ days, appointments, onOpen, onCreate, onMove }) {
  const containerRef = useRef(null);
  const byDay = useMemo(() => {
    const m = new Map();
    days.forEach((d) => {
      m.set(d.toDateString(), []);
    });
    for (const a of appointments) {
      const s = new Date(a.startTime || a.start);
      days.forEach((d) => {
        if (sameDay(s, d)) {
          m.get(d.toDateString()).push(a);
        }
      });
    }
    return m;
  }, [days, appointments]);
  return (
    <div className="rounded-xl border border-app-border bg-app-surface overflow-hidden">
      {/* Header row with day labels */}
      <div className="grid" style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}>
        <div className="border-b border-app-border bg-app-bg/50"></div>
        {days.map((d) => (
          <div key={d.toISOString()} className="border-b border-l border-app-border bg-app-bg/50 px-3 py-2 text-sm font-medium">
            {d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        ))}
      </div>
      {/* All-day row */}
      <div className="grid" style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}>
        <div className="border-b border-app-border px-2 text-xs text-app-muted py-2">All-day</div>
        {days.map((d) => {
          const events = (byDay.get(d.toDateString()) || []).filter(isAllDayEvent);
          return (
            <div
              key={`allday-${d.toISOString()}`}
              className="border-b border-l border-app-border min-h-9 bg-white/40"
              onDoubleClick={() => onCreate(d, 9)}
              onContextMenu={(e) => { e.preventDefault(); onCreate(d, 9); }}
              title="Double-click or right-click to add"
            >
              <div className="flex flex-wrap gap-1 p-1">
                {events.map((a) => (
                  <button
                    key={a.id}
                    className="rounded px-2 py-0.5 text-xs bg-blue-100 text-blue-800"
                    onClick={() => onOpen(a)}
                    onDoubleClick={(e) => { e.stopPropagation(); }}
                    onContextMenu={(e) => { e.stopPropagation(); }}
                  >
                    {a.title || a.reason || 'Appointment'}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Time rows */}
      <div className="relative" ref={containerRef}>
        <div className="grid" style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}>
          {/* Times column */}
          <div className="relative">
            {Array.from({ length: (CLOSE_HOUR - OPEN_HOUR) + 1 }, (_, i) => OPEN_HOUR + i).map((h) => (
              <div key={h} className="relative border-b border-app-border text-xs text-app-muted h-12 flex items-start justify-end pr-2" style={{ height: `${HOUR_PX}px` }}>
                <span>{`${String(h).padStart(2, '0')}:00`}</span>
              </div>
            ))}
          </div>
          {/* Day columns */}
          {days.map((day, dayIndex) => (
            <TimeColumn
              key={day.toISOString()}
              day={day}
              appointments={appointments}
              onOpen={onOpen}
              onCreate={onCreate}
              onMove={onMove}
              days={days}
              dayIndex={dayIndex}
              containerRef={containerRef}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimeColumn({ day, appointments, onOpen, onCreate, onMove, days, dayIndex, containerRef }) {
  const dayApps = useMemo(() => {
    return appointments
      .filter((a) => sameDay(new Date(a.startTime || a.start), day))
      .filter((a) => !isAllDayEvent(a));
  }, [appointments, day]);

  const onGridClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutes = Math.round((y / HOUR_PX) * 60 / 15) * 15; // snap 15m
    const atHour = Math.min(CLOSE_HOUR * 60, Math.max(OPEN_HOUR * 60, minutes));
    onCreate(day, Math.floor(atHour / 60));
  };

  return (
    <div className="relative border-l border-app-border" onDoubleClick={onGridClick} style={{ height: `${(CLOSE_HOUR - OPEN_HOUR) * HOUR_PX}px` }}>
      {/* Hour lines */}
      {Array.from({ length: (CLOSE_HOUR - OPEN_HOUR) + 1 }, (_, i) => OPEN_HOUR + i).map((h) => (
        <div key={h} className="absolute left-0 right-0 border-t border-app-border/70" style={{ top: `${(h - OPEN_HOUR) * HOUR_PX}px` }} />
      ))}
      {/* Appointments */}
      {dayApps.map((a) => (
        <DraggableAppt key={a.id} appt={a} day={day} dayIndex={dayIndex} days={days} containerRef={containerRef} onOpen={() => onOpen(a)} onMove={onMove} />
      ))}
    </div>
  );
}

// Helpers for ranges and filtering
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function rangeForView(view, month, cursor) {
  if (view === 'month') return [startOfMonth(month), endOfMonth(month)];
  if (view === 'week') return [startOfWeek(cursor), endOfWeek(cursor)];
  return [startOfDay(cursor), endOfDay(cursor)];
}
function inRange(appt, start, end) {
  const s = new Date(appt.startTime || appt.start);
  return s >= start && s <= end;
}
function isAllDayEvent(a) {
  const s = new Date(a.startTime || a.start);
  const e = new Date(a.endTime || a.end);
  if (isNaN(s) || isNaN(e)) return false;
  // Treat as all-day if it spans typical working hours or longer
  const spansWorkday = s.getHours() <= OPEN_HOUR && e.getHours() >= CLOSE_HOUR;
  const longDuration = (e - s) >= (8 * 60 * 60 * 1000);
  return spansWorkday || longDuration;
}

function DraggableAppt({ appt, day, dayIndex, days, containerRef, onOpen, onMove }) {
  const start = new Date(appt.startTime);
  const end = new Date(appt.endTime);
  const top = ((start.getHours() + start.getMinutes() / 60) - OPEN_HOUR) * HOUR_PX;
  const height = Math.max(24, ((end - start) / (1000 * 60 * 60)) * HOUR_PX);
  const sKey = String((appt.status || '').toLowerCase());
  const color = statusColors[sKey] || statusColors.scheduled;

  // Drag state
  const [dragging, setDragging] = useState(null); // 'move' | 'resize-top' | 'resize-bottom' | null
  const [offsetMin, setOffsetMin] = useState(0); // in minutes
  const [offsetDay, setOffsetDay] = useState(0);
  const startRef = useState(start)[0];
  const endRef = useState(end)[0];
  const origin = useState({ x: 0, y: 0 })[0];

  useEffect(() => {
    if (!dragging) return;
    const onMoveEvt = (e) => {
      const container = containerRef.current?.getBoundingClientRect();
      const usableWidth = (container?.width || 0) - 64; // minus time gutter
      const colWidth = days.length > 0 ? usableWidth / days.length : 0;
      // update offsets
      setOffsetMin((prev) => prev + (e.movementY / HOUR_PX) * 60);
      if (dragging === 'move' && colWidth > 0) {
        const dx = e.clientX - origin.x;
        const deltaCols = Math.round(dx / colWidth);
        const clamped = Math.max(-dayIndex, Math.min(deltaCols, days.length - 1 - dayIndex));
        setOffsetDay(clamped);
      }
    };
    const onUp = async () => {
      const deltaMin = offsetMin;
      const deltaDay = offsetDay;
      setDragging(null);
      setOffsetMin(0);
      setOffsetDay(0);

      if (dragging === 'move') {
        const base = new Date(startRef);
        base.setDate(base.getDate() + deltaDay);
        const newStart = new Date(base.getTime() + Math.round(deltaMin / 15) * 15 * 60 * 1000);
        // clamp to open/close
        const minutes = newStart.getHours() * 60 + newStart.getMinutes();
        const clamped = Math.max(OPEN_HOUR * 60, Math.min(CLOSE_HOUR * 60 - 15, minutes));
        newStart.setHours(0, 0, 0, 0);
        newStart.setMinutes(clamped);
        if (Math.abs(newStart - startRef) >= 1 * 60 * 1000) onMove(appt, newStart);
      }
      if (dragging === 'resize-top') {
        const newStart = new Date(startRef.getTime() + Math.round(deltaMin / 15) * 15 * 60 * 1000);
        // ensure at least 15m duration
        const minEnd = new Date(newStart.getTime() + 15 * 60 * 1000);
        const finalEnd = endRef > minEnd ? endRef : minEnd;
        onMove(appt, newStart, finalEnd);
      }
      if (dragging === 'resize-bottom') {
        const newEnd = new Date(endRef.getTime() + Math.round(deltaMin / 15) * 15 * 60 * 1000);
        const minEnd = new Date(startRef.getTime() + 15 * 60 * 1000);
        const finalEnd = newEnd > minEnd ? newEnd : minEnd;
        onMove(appt, startRef, finalEnd);
      }

      window.removeEventListener('mousemove', onMoveEvt);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMoveEvt);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMoveEvt);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  const effectiveTop = top + ((offsetMin / 60) * HOUR_PX);
  const dayShift = offsetDay;

  return (
    <div
      className={`absolute ${color.bg} ${color.text} rounded-md text-xs`}
      style={{ left: `4px`, right: `4px`, top: `${effectiveTop}px`, height: `${height}px` }}
      title={`${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
    >
      <div
        className="absolute inset-x-0 top-0 h-2 cursor-ns-resize"
        onMouseDown={(e) => { e.preventDefault(); dragging || setDragging('resize-top'); origin.x = e.clientX; origin.y = e.clientY; }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
        onMouseDown={(e) => { e.preventDefault(); dragging || setDragging('resize-bottom'); origin.x = e.clientX; origin.y = e.clientY; }}
      />
      <div
        className="px-2 py-1 cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => { e.preventDefault(); setDragging('move'); origin.x = e.clientX; origin.y = e.clientY; }}
        onDoubleClick={onOpen}
      >
        <div className="font-medium truncate">{appt.title || appt.reason || 'Appointment'}</div>
        <div className="text-[11px] opacity-80">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  );
}

function ViewDialog({ open, onClose, appt, onEdit, onDelete, statuses, patients = [], staff = [] }) {
  if (!appt) return null;
  const statusId = appt.statusId || appt.status_id || appt.status?.id;
  const statusObj = (statuses || []).find((x) => x.id === statusId);
  const statusLabel = statusObj?.name || appt.status || "Scheduled";
  const sKey = String(statusLabel || "").toLowerCase();
  const color = statusColors[sKey] || statusColors.scheduled;
  const start = appt.startTime ? new Date(appt.startTime) : null;
  const end = appt.endTime ? new Date(appt.endTime) : null;
  const durationMin = start && end ? Math.max(1, Math.round((end - start) / 60000)) : (appt.duration_minutes || 0);
  const patientId = appt.patientId || appt.patient_id;
  const staffId = appt.staffId || appt.staff_id;
  const patient = (patients || []).find((p) => p.id === patientId);
  const staffMember = (staff || []).find((s) => s.id === staffId);
  const patientName = patient ? `${patient.firstName || patient.person?.first_name || ''} ${patient.lastName || patient.person?.last_name || ''}`.trim() : patientId;
  const staffName = staffMember ? `${staffMember.firstName || staffMember.person?.first_name || ''} ${staffMember.lastName || staffMember.person?.last_name || ''}`.trim() : staffId;
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Appointment</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="font-medium text-base truncate">{appt.title || appt.reason || appt.reason_for_visit || "Appointment"}</div>
            <Badge variant={color.badge}>{statusLabel}</Badge>
          </div>
          <div className="flex items-center gap-2 text-app-muted">
            <CalendarDays size={14} />
            <span>{start ? start.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-app-muted">
            <Clock size={14} />
            <span>{start && end ? `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${durationMin} min)` : ''}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <User size={14} className="text-app-muted" />
              <span className="text-app-muted">Patient:</span>
              {patientId ? (
                <Link href={`/patients/${patientId}`} className="underline underline-offset-2 hover:text-app-foreground">
                  {patientName || patientId}
                </Link>
              ) : (
                <span className="text-app-muted">—</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-app-muted" />
              <span className="text-app-muted">Staff:</span>
              <span>{staffName || '—'}</span>
            </div>
          </div>
          {appt.notes && (
            <div>
              <div className="text-xs text-app-muted mb-1">Notes</div>
              <div className="whitespace-pre-line text-sm">{appt.notes}</div>
            </div>
          )}
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={() => onDelete(appt.id)}>Delete</Button>
        <Button variant="secondary" onClick={onEdit}>Edit</Button>
      </DialogFooter>
    </Dialog>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <div className="mb-1 text-app-muted">{label}</div>
      {children}
    </label>
  );
}

function AppointmentForm({ open, onClose, value, onChange, onSubmit, patients, staff, statuses }) {
  const v = value || {};
  const [errors, setErrors] = useState({});
  // Default status when opening form and none selected
  useEffect(() => {
    if (!open) return;
    const first = statuses && statuses[0];
    if (first && !v.statusId && onChange) {
      onChange({ ...v, statusId: first.id });
    }
  }, [open, statuses]);

  const validate = () => {
    const err = {};
    if (!v.patientId) err.patientId = "Required";
    if (!v.staffId) err.staffId = "Required";
    if (!v.statusId) err.statusId = "Required";
    if (!v.startTime) err.startTime = "Required";
    if (!v.endTime) err.endTime = "Required";
    if (v.startTime && v.endTime) {
      const s = new Date(v.startTime).getTime();
      const e = new Date(v.endTime).getTime();
      if (!isNaN(s) && !isNaN(e) && e <= s) err.endTime = "Must be after start time";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(v);
  };

  const patientOptions = (patients || []).map((p) => ({ value: p.id, label: `${p.firstName || p.person?.first_name || ""} ${p.lastName || p.person?.last_name || ""}`.trim() || p.id }));
  const staffOptions = (staff || []).map((s) => ({ value: s.id, label: `${s.firstName || s.person?.first_name || ""} ${s.lastName || s.person?.last_name || ""}`.trim() || s.id }));
  const statusOptions = (statuses || []).map((s) => ({ value: s.id, label: s.name || s.code || s.value }));

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={submit}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{v.id ? "Edit Appointment" : "New Appointment"}</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close"
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Patient">
              <Combobox
                value={v.patientId}
                onChange={(val) => onChange({ ...v, patientId: val })}
                options={patientOptions}
                placeholder="Select patient"
              />
              {errors.patientId && <div className="mt-1 text-xs text-red-600">{errors.patientId}</div>}
            </Field>
            <Field label="Staff">
              <Combobox
                value={v.staffId}
                onChange={(val) => onChange({ ...v, staffId: val })}
                options={staffOptions}
                placeholder="Select staff"
              />
              {errors.staffId && <div className="mt-1 text-xs text-red-600">{errors.staffId}</div>}
            </Field>
            <Field label="Start time">
              <Input
                type="datetime-local"
                value={toLocalInput(v.startTime)}
                onChange={(e) => onChange({ ...v, startTime: fromLocalInput(e.target.value) })}
              />
              {errors.startTime && <div className="mt-1 text-xs text-red-600">{errors.startTime}</div>}
            </Field>
            <Field label="End time">
              <Input
                type="datetime-local"
                value={toLocalInput(v.endTime)}
                onChange={(e) => onChange({ ...v, endTime: fromLocalInput(e.target.value) })}
              />
              {errors.endTime && <div className="mt-1 text-xs text-red-600">{errors.endTime}</div>}
            </Field>
            <Field label="Status">
              <Combobox
                value={v.statusId}
                onChange={(val) => onChange({ ...v, statusId: val })}
                options={statusOptions}
                placeholder="Select status"
              />
            </Field>
            <Field label="Title / Reason">
              <Input
                placeholder="e.g., Routine checkup"
                value={v.title || v.reason || ""}
                onChange={(e) => onChange({ ...v, title: e.target.value })}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes">
                <textarea
                  className="min-h-24 w-full rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm"
                  value={v.notes || ""}
                  onChange={(e) => onChange({ ...v, notes: e.target.value })}
                />
              </Field>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          {v.id && (
            <Button type="button" variant="secondary" onClick={() => onSubmit({ ...v, id: v.id })}>Save</Button>
          )}
          {!v.id && (
            <Button type="submit" variant="secondary">Create</Button>
          )}
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(val) {
  if (!val) return "";
  const d = new Date(val);
  return d.toISOString();
}
