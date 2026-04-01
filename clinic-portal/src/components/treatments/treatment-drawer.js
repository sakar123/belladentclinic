"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2, ChevronsUpDown, Check } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
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
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { getAdultToothName, getPrimaryToothName } from "@/components/dental/tooth-data";
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
  const [scope, setScope] = useState("MOUTH"); // 'MOUTH' | 'TEETH'
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [notes, setNotes] = useState("");

  // Draft cart state
  const [draftTreatments, setDraftTreatments] = useState([]); // [{ key, serviceId?, newService?, serviceName, cost, scope, teeth, notes }]
  const [saving, setSaving] = useState(false);

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

  // Try to auto-select teeth based on appointment notes if present
  useEffect(() => {
    if (!open) return;
    if (!appointmentNotes) return;
    // Only auto-pick if user hasn't selected yet
    if (selectedTeeth && selectedTeeth.length > 0) return;
    const parsed = parseTeethFromText(String(appointmentNotes || ''));
    if (parsed.length > 0) {
      setScope('TEETH');
      setSelectedTeeth(parsed);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointmentNotes]);

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
          notes: notes?.trim() || "",
        }
      ]);
    }
    resetForm();
  }

  async function ensureToothExistsForPatient(patientId, toothNumber) {
    // Try create; if it already exists, API may 409 — ignore.
    try {
      const isPrimary = Number(toothNumber) >= 51 && Number(toothNumber) <= 85;
      const name = isPrimary ? getPrimaryToothName(Number(toothNumber)) : getAdultToothName(Number(toothNumber));
      await api.teeth.create({ patient_id: patientId, tooth_number: Number(toothNumber), tooth_name: name });
    } catch (e) {
      // Ignore if duplicate/exists; continue.
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
        let payload = {
          appointment_id: appointmentId,
          patient_id: patientId,
          staff_id: staffId,
          service_id: serviceId,
          notes: d.notes || '',
        };
        if (d.scope === 'MOUTH') {
          treatment_scope = 'FullMouth';
        } else {
          const arr = Array.isArray(d.teeth) ? d.teeth.map(n => Number(n)) : [];
          if (arr.length === 1) {
            treatment_scope = 'SingleTooth';
            await ensureToothExistsForPatient(patientId, arr[0]);
            payload = { ...payload, tooth_number: arr[0] };
          } else if (arr.length > 1) {
            treatment_scope = 'MultipleTeeth';
            for (const n of arr) await ensureToothExistsForPatient(patientId, n);
            payload = { ...payload, tooth_numbers: arr };
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
                            Create "{serviceSearch.trim()}"
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

              {/* Notes */}
              <div>
                <div className="text-xs text-app-muted mb-1">Notes (optional)</div>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any notes" />
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
                        <div className="text-xs text-app-muted truncate">{d.scope === 'MOUTH' ? 'Whole Mouth' : `Teeth: ${(d.teeth || []).join(', ')}`}{d.notes ? ` • ${d.notes}` : ''}</div>
                      </div>
                      <button className="p-2 rounded hover:bg-white" onClick={() => setDraftTreatments(prev => prev.filter(x => x.key !== d.key))} aria-label="Remove">
                        <Trash2 className="size-4 text-red-500" />
                      </button>
                    </li>
                  ))}
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
              <div className="text-xs text-app-muted mb-2">Select teeth</div>
              <DentalChart
                patientId={patientId}
                selectedTeeth={selectedTeeth}
                onSelectionChange={setSelectedTeeth}
                selectMode="multiple"
                showLegend={false}
                className="w-full"
              />
              {scope === 'TEETH' && selectedTeeth.length > 0 && (
                <div className="mt-3 text-xs text-app-muted">Selected: {selectedTeeth.join(', ')}</div>
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
    </div>
  );
}
