"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2, ChevronsUpDown, Check } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Dialog, { DialogBody, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import DentalChart from "@/components/dental/dental-chart";
import { SurfaceSelector } from "@/components/dental/surface-selector";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { getAdultToothName, getPrimaryToothName } from "@/components/dental/tooth-data";
import {
  getToothRawNumber,
  inferPermanentNumberingSystem,
  isLowerTooth,
  isUpperTooth,
  normalizeChartTooth,
  normalizeToChartTooth,
} from "@/components/dental/tooth-numbering";
import { cn } from "@/lib/utils";

// TreatmentDrawer: Right-anchored slide-over with split panes
// Props:
// - open: boolean
// - onClose: () => void
// - appointmentId: string | Guid
// - patientId: string | Guid
// - onSaved?: (createdTreatments) => void
// - services?: optional preloaded services list [{ id, name, cost }]

export default function AddTreatment({ open, onClose, appointmentId, patientId, staffId, appointmentNotes, onSaved, services: propServices }) {
  const [services, setServices] = useState(propServices || []);
  const [loadingServices, setLoadingServices] = useState(false);
  const { notify } = useToast();

  // Current form state
  const [servicePopoverOpen, setServicePopoverOpen] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [creatingService, setCreatingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCost, setNewServiceCost] = useState("");
  const [scope, setScope] = useState("TEETH"); // 'MOUTH' | 'TEETH'
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  // Per-tooth surface selection map: { [toothNumber]: 'MO' }
  const [surfacesByTooth, setSurfacesByTooth] = useState({});
  const [notes, setNotes] = useState("");

  // Draft cart state
  const [draftTreatments, setDraftTreatments] = useState([]); // [{ key, serviceId?, newService?, serviceName, cost, scope, teeth, surfaces, notes }]
  const [saving, setSaving] = useState(false);
  const [healthyStatusId, setHealthyStatusId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [patientTeeth, setPatientTeeth] = useState([]);

  useEffect(() => {
    if (!open) return;
    if (propServices && Array.isArray(propServices)) {
      setServices(propServices);
      return;
    }
    (async () => {
      try {
        setLoadingServices(true);
        const list = await api.service.getAll();
        setServices(Array.isArray(list) ? list : []);
      } catch {
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    })();
  }, [open, propServices]);

  // Load HEALTHY tooth status id once when opening
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const list = await api.lookup.toothStatus.getAll();
        const healthy = (list || []).find(s => String(s.code || s.name).toUpperCase().includes('HEALTHY'));
        if (healthy) setHealthyStatusId(healthy.id);
      } catch {
        // ignore
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open || !patientId) return;
    (async () => {
      try {
        const list = await api.teeth.getAll({ patientId });
        setPatientTeeth(Array.isArray(list) ? list : []);
      } catch {
        setPatientTeeth([]);
      }
    })();
  }, [open, patientId]);

  // Load dental history for this patient (recent treatments)
  useEffect(() => {
    if (!open || !patientId) return;
    (async () => {
      try {
        const all = await api.treatments.getAll();
        const list = (all||[]).filter(t => t.patient_id === patientId)
          .sort((a,b) => new Date(b.completed_at || b.created_at || 0) - new Date(a.completed_at || a.created_at || 0))
          .slice(0, 20);
        setHistory(list);
      } catch {
        setHistory([]);
      }
    })();
  }, [open, patientId]);

  const patientNumberingSystem = useMemo(() => {
    return inferPermanentNumberingSystem(patientTeeth.map(getToothRawNumber));
  }, [patientTeeth]);

  const chartTeeth = useMemo(() => {
    return patientTeeth
      .map((tooth) => {
        const rawNumber = getToothRawNumber(tooth);
        const normalized = normalizeToChartTooth(rawNumber, patientNumberingSystem);
        if (!normalized) return null;
        return {
          id: tooth.id,
          sourceNumber: Number(rawNumber),
          chartKind: normalized.kind,
          chartNumber: normalized.chartNumber,
          displayNumber: normalized.displayNumber,
        };
      })
      .filter(Boolean);
  }, [patientTeeth, patientNumberingSystem]);

  const archSelections = useMemo(() => {
    const upper = chartTeeth
      .filter((tooth) => isUpperTooth(tooth.chartKind, tooth.chartNumber))
      .map((tooth) => tooth.chartNumber);
    const lower = chartTeeth
      .filter((tooth) => isLowerTooth(tooth.chartKind, tooth.chartNumber))
      .map((tooth) => tooth.chartNumber);
    return {
      upper: upper.length > 0 ? upper : Array.from({ length: 16 }, (_, i) => i + 1),
      lower: lower.length > 0 ? lower : Array.from({ length: 16 }, (_, i) => i + 17),
    };
  }, [chartTeeth]);

  const resolveBackendToothNumber = (chartNumber) => {
    const selected = normalizeChartTooth(chartNumber);
    if (!selected) return Number(chartNumber);
    const existing = chartTeeth.find((tooth) =>
      tooth.chartKind === selected.kind &&
      Number(tooth.chartNumber) === Number(selected.chartNumber)
    );
    return Number(existing?.sourceNumber ?? chartNumber);
  };

  const formatChartTooth = (chartNumber) => {
    const selected = normalizeChartTooth(chartNumber);
    return selected?.displayNumber ?? Number(chartNumber);
  };

  // Try to auto-select teeth based on appointment notes if present
  useEffect(() => {
    if (!open) return;
    if (!appointmentNotes) return;
    if (patientTeeth.length === 0) return;
    // Only auto-pick if user hasn't selected yet
    if (selectedTeeth && selectedTeeth.length > 0) return;
    const parsed = parseTeethFromText(String(appointmentNotes || ''));
    if (parsed.length > 0) {
      setScope('TEETH');
      setSelectedTeeth(parsed
        .map((n) => normalizeToChartTooth(n, patientNumberingSystem)?.chartNumber)
        .filter(Boolean));
    }
  }, [open, appointmentNotes, patientNumberingSystem, patientTeeth.length, selectedTeeth]);

  function parseTeethFromText(text) {
    try {
      const t = String(text || '').toLowerCase();
      // Find numbers possibly separated by commas/spaces, with optional leading '#'
      const matches = Array.from(t.matchAll(/#?(\d{1,2})/g)).map(m => Number(m[1]));
      // Keep unique and valid ranges: universal 1-32, or FDI 11-48 / 51-85
      const uniq = Array.from(new Set(matches)).filter(n => Number.isFinite(n));
      // Heuristic: prefer FDI if many 2-digit > 32 present, but we keep raw numbers as is; the DentalChart/selector accepts both primary (51-85) and permanent (1-32) and our TeethSelector shows both.
      // Filter to plausible dental numbers
      const plausible = uniq.filter(n => (n >= 1 && n <= 32) || (n >= 11 && n <= 48) || (n >= 51 && n <= 85));
      return plausible.slice(0, 16); // cap for safety
    } catch {
      return [];
    }
  }

  // Filtered options for combobox
  const serviceOptions = useMemo(() => {
    const q = (serviceSearch || "").toLowerCase();
    const base = (services || []).map(s => ({ value: String(s.id), label: `${s.name} — Rs ${Number(s.cost || 0).toLocaleString()}`, raw: s }));
    if (!q) return base;
    return base.filter(o => o.label.toLowerCase().includes(q) || (o.raw?.name || '').toLowerCase().includes(q));
  }, [services, serviceSearch]);

  const canAddCurrent = useMemo(() => {
    if (creatingService) {
      return newServiceName.trim().length > 0 && newServiceCost !== "" && (!Number.isNaN(Number(newServiceCost))) && (scope === 'MOUTH' || (scope === 'TEETH' && selectedTeeth.length > 0));
    }
    return Boolean(selectedServiceId) && (scope === 'MOUTH' || (scope === 'TEETH' && selectedTeeth.length > 0));
  }, [creatingService, newServiceName, newServiceCost, selectedServiceId, scope, selectedTeeth]);

  function resetForm() {
    setServiceSearch("");
    setSelectedServiceId("");
    setCreatingService(false);
    setNewServiceName("");
    setNewServiceCost("");
    setScope("MOUTH");
    setSelectedTeeth([]);
    setSurfacesByTooth({});
    setNotes("");
  }

  function addToCart() {
    if (!canAddCurrent) return;
    const key = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    if (creatingService) {
      setDraftTreatments(prev => [
        ...prev,
        {
          key,
          newService: { name: newServiceName.trim(), cost: Number(newServiceCost) },
          serviceName: newServiceName.trim(),
          cost: Number(newServiceCost) || 0,
          scope,
          teeth: scope === 'TEETH' ? [...selectedTeeth] : [],
          surfaces: scope === 'TEETH' && selectedTeeth.length === 1 ? (surfacesByTooth?.[selectedTeeth[0]] || '') : '',
          surfaceMap: { ...surfacesByTooth },
          notes: notes?.trim() || "",
        }
      ]);
    } else {
      const svc = (services || []).find(s => String(s.id) === String(selectedServiceId));
      setDraftTreatments(prev => [
        ...prev,
        {
          key,
          serviceId: selectedServiceId,
          serviceName: svc?.name || 'Service',
          cost: Number(svc?.cost || 0),
          scope,
          teeth: scope === 'TEETH' ? [...selectedTeeth] : [],
          surfaces: scope === 'TEETH' && selectedTeeth.length === 1 ? (surfacesByTooth?.[selectedTeeth[0]] || '') : '',
          surfaceMap: { ...surfacesByTooth },
          notes: notes?.trim() || "",
        }
      ]);
    }
    resetForm();
  }

  async function ensureToothExistsForPatient(patientId, toothNumber) {
    // Try to create tooth with a default HEALTHY status; ignore if already exists (409)
    try {
      const normalized = normalizeToChartTooth(toothNumber, patientNumberingSystem);
      const name = normalized?.kind === "primary"
        ? getPrimaryToothName(normalized.chartNumber)
        : getAdultToothName(normalized?.chartNumber ?? Number(toothNumber));
      let statusId = healthyStatusId;
      if (!statusId) {
        try {
          const list = await api.lookup.toothStatus.getAll();
          const healthy = (list || []).find(s => String(s.code || s.name).toUpperCase().includes('HEALTHY'));
          statusId = healthy?.id;
          if (healthy) setHealthyStatusId(healthy.id);
        } catch {}
      }
      const payload = { patient_id: patientId, tooth_number: Number(toothNumber), tooth_name: name };
      if (statusId) payload.tooth_status_id = statusId;
      await api.teeth.create(payload);
    } catch (e) {
      // Ignore if duplicate/exists or other non-fatal errors; treatment creation may still resolve tooth_number.
    }
  }

  async function handleSaveAll() {
    if (draftTreatments.length === 0) {
      notify({ title: 'Nothing to save', description: 'Add at least one drafted treatment.' });
      return;
    }
    setSaving(true);
    try {
      // Create any new services first (dedupe by name|cost)
      const createdServiceIds = new Map();
      for (const d of draftTreatments) {
        if (d.newService) {
          const key = `${d.newService.name}|${Number(d.newService.cost || 0)}`;
          if (!createdServiceIds.has(key)) {
            const svc = await api.service.create({ name: d.newService.name, cost: Number(d.newService.cost || 0), specialty_id: null, description: "" });
            createdServiceIds.set(key, svc?.id || svc?.Id || svc?.ID);
          }
        }
      }

      const createdTreatments = [];
      for (const d of draftTreatments) {
        const serviceId = d.serviceId || createdServiceIds.get(`${d.newService.name}|${Number(d.newService.cost || 0)}`);
        if (!serviceId) continue;
        let treatment_scope = 'NonTooth';
        // Normalize surfaces: map anterior 'I'→'O' and 'F'→'B'
        const normalizeSurfaces = (s) => (s || '').toUpperCase().replaceAll('I','O').replaceAll('F','B');
        let payload = {
          appointment_id: appointmentId,
          patient_id: patientId,
          staff_id: staffId,
          service_id: serviceId,
          notes: d.notes || '',
          surfaces: normalizeSurfaces((d.surfaces || '').trim()) || undefined,
        };
        if (d.scope === 'MOUTH') {
          treatment_scope = 'FullMouth';
        } else {
          const chartArr = Array.isArray(d.teeth) ? d.teeth.map(n => Number(n)).filter(Number.isFinite) : [];
          const backendArr = chartArr.map(resolveBackendToothNumber);
          const draftSurfaceMap = d.surfaceMap || {};
          const surfaceForChartTooth = (chartTooth) => (draftSurfaceMap?.[chartTooth] || surfacesByTooth?.[chartTooth] || '').toUpperCase();
          if (chartArr.length === 1) {
            treatment_scope = 'SingleTooth';
            await ensureToothExistsForPatient(patientId, backendArr[0]);
            const surf = surfaceForChartTooth(chartArr[0]);
            payload = { ...payload, tooth_number: backendArr[0], surfaces: normalizeSurfaces(surf) || undefined };
          } else if (chartArr.length > 1) {
            // If surfaces vary by tooth, split into per-tooth treatments; else use MultiTeeth with common surfaces
            for (const n of backendArr) await ensureToothExistsForPatient(patientId, n);
            const set = new Set(chartArr.map(n => normalizeSurfaces(surfaceForChartTooth(n))));
            // Remove empties
            const filtered = Array.from(set).filter(Boolean);
            if (filtered.length <= 1) {
              treatment_scope = 'MultipleTeeth';
              // surface_map for per-tooth differentiation (optional)
              const surface_map = Object.fromEntries(chartArr
                .map((chartTooth, idx) => [backendArr[idx], surfaceForChartTooth(chartTooth).split('').filter(Boolean)])
                .filter(([,v]) => v.length > 0)
              );
              payload = { ...payload, tooth_numbers: backendArr, surfaces: filtered[0] || undefined, surface_map: Object.keys(surface_map).length ? surface_map : undefined };
            } else {
              // Save one SingleTooth treatment per tooth with its own surfaces
              for (let i = 0; i < chartArr.length; i += 1) {
                const perToothPayload = {
                  ...payload,
                  treatment_scope: 'SingleTooth',
                  tooth_number: backendArr[i],
                  surfaces: normalizeSurfaces(surfaceForChartTooth(chartArr[i])) || undefined,
                };
                await api.treatments.create(perToothPayload);
              }
              continue; // skip default create below, already created
            }
          } else {
            treatment_scope = 'NonTooth';
          }
        }
        payload.treatment_scope = treatment_scope;
        const res = await api.treatments.create(payload);
        createdTreatments.push(res);
      }

      setDraftTreatments([]);
      onSaved?.(createdTreatments);
      onClose?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to save treatments', e);
      notify({ title: 'Failed to save treatments', description: e?.info?.message || e?.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  // Close + reset when overlay clicked or close button pressed
  function closeDrawer() {
    resetForm();
    setDraftTreatments([]);
    onClose?.();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 z-40" onClick={closeDrawer} />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-6xl bg-white dark:bg-app-surface shadow-xl border-l border-app-border flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
          <div className="text-base font-semibold">Add Treatment</div>
          <button className="p-2 rounded hover:bg-app-bg" onClick={closeDrawer} aria-label="Close"><X className="size-5" /></button>
        </div>

        {/* Split panes */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 h-0">
          {/* Left Pane: Form & Cart */}
          <div className="md:col-span-2 border-r border-app-border h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Service combobox with inline create */}
              <div>
                <div className="text-xs text-app-muted mb-1">Service</div>
                <Popover open={servicePopoverOpen} onOpenChange={setServicePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setServicePopoverOpen(true)}
                    >
                      {creatingService
                        ? (newServiceName ? `${newServiceName} — Rs ${Number(newServiceCost || 0).toLocaleString()}` : 'New service…')
                        : (selectedServiceId
                          ? (services.find(s => String(s.id) === String(selectedServiceId))?.name + ` — Rs ${Number(services.find(s => String(s.id) === String(selectedServiceId))?.cost || 0).toLocaleString()}`)
                          : 'Choose service…')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[80]">
                    <Command>
                      <CommandInput placeholder="Search services..." value={serviceSearch} onValueChange={setServiceSearch} />
                      <CommandEmpty>{loadingServices ? 'Loading…' : 'No results found.'}</CommandEmpty>
                      <CommandGroup>
                        {serviceOptions.map((opt) => (
                          <CommandItem
                            key={opt.value}
                            onSelect={() => {
                              setCreatingService(false);
                              setSelectedServiceId(opt.value);
                              setServicePopoverOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedServiceId === opt.value && !creatingService ? "opacity-100" : "opacity-0")} />
                            {opt.label}
                          </CommandItem>
                        ))}
                        {/* Create new option */}
                        {serviceSearch?.trim() && (
                          <CommandItem
                            key="__create__"
                            onSelect={() => {
                              setCreatingService(true);
                              setSelectedServiceId("");
                              setNewServiceName(serviceSearch.trim());
                              setServicePopoverOpen(false);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create &quot;{serviceSearch.trim()}&quot;
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {creatingService && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <div className="text-xs text-app-muted mb-1">Service name</div>
                      <Input value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} />
                    </div>
                    <div>
                      <div className="text-xs text-app-muted mb-1">Base cost (Rs)</div>
                      <Input type="number" min="0" step="1" value={newServiceCost} onChange={(e) => setNewServiceCost(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              {/* Scope toggle */}
              <div>
                <div className="text-xs text-app-muted mb-1">Scope</div>
                <div className="inline-flex rounded-md border border-app-border bg-app-surface p-1">
                  <button type="button" className={cn("px-3 py-1.5 text-sm rounded-sm", scope === 'MOUTH' ? 'bg-white shadow-sm' : 'text-app-muted')} onClick={() => setScope('MOUTH')}>Whole Mouth</button>
                  <button type="button" className={cn("px-3 py-1.5 text-sm rounded-sm", scope === 'TEETH' ? 'bg-white shadow-sm' : 'text-app-muted')} onClick={() => setScope('TEETH')}>Specific Teeth</button>
                </div>
              </div>

              {scope === 'TEETH' && (
                <div className="mt-4">
                  {selectedTeeth.length === 1 ? (
                    <SurfaceSelector
                      value={(surfacesByTooth?.[selectedTeeth[0]] || '').toUpperCase()}
                      onChange={(val) => setSurfacesByTooth(prev => ({ ...prev, [selectedTeeth[0]]: String(val || '').toUpperCase() }))}
                    />
                  ) : (
                    <div className="text-xs text-app-muted">
                      Select a single tooth to use the quick surface picker, or click directly on teeth in the chart to set per‑tooth surfaces.
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <div className="text-xs text-app-muted mb-1">Notes (optional)</div>
                <textarea className="w-full min-h-24 h-28 rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes" />
              </div>

              {/* Primary action */}
              <div className="pt-2">
                <Button onClick={addToCart} disabled={!canAddCurrent} className="w-full">
                  Add to Visit
                </Button>
              </div>

              {/* Cart list */}
              <div className="pt-4">
                <div className="text-xs text-app-muted mb-2">Drafted Treatments</div>
                {draftTreatments.length === 0 && (
                  <div className="text-xs text-app-muted">No drafted items yet. Add one above.</div>
                )}
                <ul className="space-y-2">
                  {draftTreatments.map((d) => (
                    <li key={d.key} className="flex items-center gap-3 justify-between p-2 border border-app-border rounded-sm bg-app-bg">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{d.serviceName} {d.cost ? `— Rs ${Number(d.cost).toLocaleString()}` : ''}</div>
                        <div className="text-xs text-app-muted truncate">{d.scope === 'MOUTH' ? 'Whole Mouth' : `Teeth: ${(d.teeth || []).map(formatChartTooth).join(', ')}`}{d.notes ? ` • ${d.notes}` : ''}</div>
                      </div>
                      <button className="p-2 rounded hover:bg-white" onClick={() => setDraftTreatments(prev => prev.filter(x => x.key !== d.key))} aria-label="Remove">
                        <Trash2 className="size-4 text-red-500" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dental History */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-app-muted font-medium">Dental History (recent)</div>
                  {history.length > 5 && (
                    <button className="text-[10px] text-blue-600 hover:underline px-1" onClick={() => setHistoryModalOpen(true)}>View All</button>
                  )}
                </div>
                {history.length === 0 && (
                  <div className="text-xs text-app-muted">No prior treatments.</div>
                )}
                <ul className="space-y-3 max-h-56 overflow-auto pr-1">
                  {history.slice(0, 5).map(h => {
                    const docName = h.staff?.person ? `${h.staff.person.first_name || ''} ${h.staff.person.last_name || ''}`.trim() : (h.staff_name || h.provider_name || 'Staff');
                    return (
                      <li key={h.id} className="text-xs flex flex-col gap-0.5 border-b border-app-border pb-2 last:border-0">
                        <div className="font-medium text-app-foreground">
                          {h.service_name || h.service?.name || 'Treatment'}
                          <span className="font-normal text-app-muted mx-1">·</span>
                          <span className="font-normal text-app-muted">{h.completed_at || h.created_at ? new Date(h.completed_at || h.created_at).toLocaleDateString() : ''}</span>
                          <span className="font-normal text-app-muted mx-1">·</span>
                          <span className="font-normal text-app-muted">{docName}</span>
                        </div>
                        {h.notes && <div className="text-app-muted whitespace-pre-wrap leading-normal mt-0.5">{h.notes}</div>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Footer (left pane only) */}
            <div className="sticky bottom-0 w-full border-t border-app-border p-3 bg-white/80 dark:bg-app-surface/80 backdrop-blur supports-[backdrop-filter]:bg-white/50">
              <Button className="w-full" onClick={handleSaveAll} disabled={draftTreatments.length === 0 || saving}>
                {saving ? 'Saving…' : `Save All (${draftTreatments.length} Treatment${draftTreatments.length === 1 ? '' : 's'})`}
              </Button>
            </div>
          </div>

          {/* Right Pane: Visual Chart (DentalChart) */}
          <div className="md:col-span-3 h-full relative">
            <div className={cn("absolute inset-0 p-4 overflow-y-auto", scope === 'MOUTH' && 'pointer-events-none opacity-40')}
                 aria-disabled={scope === 'MOUTH'}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-app-muted">Select teeth</div>
                {scope === 'TEETH' && (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => setSelectedTeeth(archSelections.upper)}>Maxillary Arch</Button>
                    <Button type="button" variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => setSelectedTeeth(archSelections.lower)}>Mandibular Arch</Button>
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => setSelectedTeeth([])}>Clear</Button>
                  </div>
                )}
              </div>
              <DentalChart
                patientId={patientId}
                selectedTeeth={selectedTeeth}
                onSelectionChange={setSelectedTeeth}
                selectMode="multiple"
                showLegend={false}
                className="w-full"
                interactiveSurfaces={scope === 'TEETH'}
                selectedSurfacesMap={Object.fromEntries(Object.entries(surfacesByTooth).map(([k,v]) => [Number(k), (v||'').toUpperCase().split('')]))}
                onSurfaceClick={(tooth, s) => {
                  setSurfacesByTooth(prev => {
                    const cur = (prev?.[tooth] || '').toUpperCase();
                    const has = cur.includes(s);
                    const next = has ? cur.replace(s, '') : (cur + s);
                    return { ...prev, [tooth]: next };
                  });
                }}
              />
              {scope === 'TEETH' && selectedTeeth.length > 0 && (
                <div className="mt-3 text-xs text-app-muted">Selected: {selectedTeeth.map(formatChartTooth).join(', ')}
                  {selectedTeeth.length === 1 && (surfacesByTooth?.[selectedTeeth[0]] ? ` — Surfaces: ${surfacesByTooth[selectedTeeth[0]].toUpperCase()}` : '')}
                </div>
              )}
              {scope === 'MOUTH' && (
                <div className="mt-3 text-xs text-app-muted">Whole Mouth selected — chart disabled.</div>
              )}
              {/* Appointment note preview at bottom-right */}
              {(appointmentNotes && String(appointmentNotes).trim().length > 0) && (
                <div className="absolute bottom-4 right-4 max-w-sm bg-white/90 dark:bg-app-surface/90 border border-app-border rounded-md shadow p-3 text-xs whitespace-pre-wrap">
                  <div className="font-medium mb-1 text-app-muted">Appointment note</div>
                  <div className="text-app-foreground">{appointmentNotes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Full Dental History Modal */}
      <Dialog open={historyModalOpen} onClose={() => setHistoryModalOpen(false)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Patient Dental History</DialogTitle>
            <button className="p-1 rounded hover:bg-app-bg" onClick={() => setHistoryModalOpen(false)} aria-label="Close history">
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {history.map(h => {
              const docName = h.staff?.person ? `${h.staff.person.first_name || ''} ${h.staff.person.last_name || ''}`.trim() : (h.staff_name || h.provider_name || 'Staff');
              return (
                <div key={h.id} className="text-sm flex flex-col gap-1 border-b border-app-border pb-4 last:border-0">
                  <div className="font-medium text-app-foreground">
                    {h.service_name || h.service?.name || 'Treatment'}
                  </div>
                  <div className="text-xs text-app-muted flex items-center gap-2">
                    <span>{h.completed_at || h.created_at ? new Date(h.completed_at || h.created_at).toLocaleDateString() : ''}</span>
                    <span>·</span>
                    <span>{docName}</span>
                  </div>
                  {h.notes && <div className="text-app-foreground whitespace-pre-wrap leading-relaxed mt-1 text-sm bg-app-surface p-3 rounded border border-app-border">{h.notes}</div>}
                </div>
              );
            })}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => setHistoryModalOpen(false)}>Close</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
