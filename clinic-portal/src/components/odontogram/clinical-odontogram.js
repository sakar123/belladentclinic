"use client";

import dynamic from "next/dynamic";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { CheckCircle2, GitCommitHorizontal, RotateCcw, Save, X } from "lucide-react";
import { api } from "@/lib/api";
import Button from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  ADVANCED_ODONTOGRAM_CAPABILITIES,
  EMPTY_ADVANCED_ODONTOGRAM_CHART,
  applyAdvancedSelection,
  buildAdvancedOdontogramSaveRequest,
  getAdvancedToothFromEvent,
  hydrateAdvancedOdontogram,
  loadAdvancedOdontogramEngine,
  nextAdvancedSelection,
  normalizeAdvancedSelection,
  readAdvancedPlanChanges,
  subscribeAdvancedOdontogram,
} from "@/lib/odontogram/advanced-host-api";

const OdontogramShell = dynamic(
  () => import("react-advanced-odontogram").then((mod) => mod.OdontogramShell || mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[520px] rounded border border-app-border bg-white p-6 text-sm text-app-muted">
        Loading odontogram...
      </div>
    ),
  }
);

const ClinicalOdontogram = forwardRef(function ClinicalOdontogram({
  patientId,
  appointmentId,
  staffId,
  mode = "patient",
  readOnly = false,
  selectionMode = "none",
  selectedTeeth,
  onSelectionChange,
  onPlanItemsChange,
  onSaved,
  className,
  compact = false,
  showPlanPanel = true,
  title = "Clinical odontogram",
}, ref) {
  const { notify } = useToast();
  const scopeRef = useRef(null);
  const loadedKeyRef = useRef("");
  const localSelectedRef = useRef([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [planChanges, setPlanChanges] = useState([]);
  const [localSelected, setLocalSelected] = useState(() => normalizeAdvancedSelection(selectedTeeth));
  const [reloadKey, setReloadKey] = useState(0);

  const {
    data: odontogramState,
    error,
    mutate,
    isLoading,
  } = useSWR(patientId ? `advanced-odontogram-state-${patientId}` : null, () => api.odontogram.getState(patientId), {
    revalidateOnFocus: false,
  });

  const draftPlanItems = useMemo(() => {
    return (odontogramState?.plan_items || []).filter((item) => item.status === "Draft");
  }, [odontogramState?.plan_items]);

  useEffect(() => {
    const normalized = normalizeAdvancedSelection(selectedTeeth);
    localSelectedRef.current = normalized;
    setLocalSelected(normalized);
    window.setTimeout(() => applyAdvancedSelection(scopeRef.current, normalized), 0);
  }, [selectedTeeth]);

  useEffect(() => {
    localSelectedRef.current = localSelected;
  }, [localSelected]);

  useEffect(() => {
    onPlanItemsChange?.(odontogramState?.plan_items || []);
  }, [odontogramState?.plan_items, onPlanItemsChange]);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;
    let timer = null;
    const statusChart = odontogramState?.status_chart || EMPTY_ADVANCED_ODONTOGRAM_CHART;
    const planChart = odontogramState?.plan_chart || EMPTY_ADVANCED_ODONTOGRAM_CHART;
    const serialized = JSON.stringify({ statusChart, planChart });
    const loadedKey = `${reloadKey}:${serialized}`;

    loadAdvancedOdontogramEngine().then((mod) => {
      if (cancelled) return;
      timer = window.setTimeout(() => {
        if (cancelled || loadedKeyRef.current === loadedKey) return;
        hydrateAdvancedOdontogram(mod, { status_chart: statusChart, plan_chart: planChart });
        loadedKeyRef.current = loadedKey;
        setDirty(false);
        setPlanChanges(readAdvancedPlanChanges(mod));
        unsubscribe = subscribeAdvancedOdontogram(mod, () => {
          setDirty(true);
          setPlanChanges(readAdvancedPlanChanges(mod));
        });
        window.setTimeout(() => applyAdvancedSelection(scopeRef.current, localSelectedRef.current), 0);
      }, 100);
    });

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, [odontogramState?.status_chart, odontogramState?.plan_chart, reloadKey]);

  useEffect(() => {
    applyAdvancedSelection(scopeRef.current, localSelected);
  }, [localSelected, reloadKey]);

  useImperativeHandle(ref, () => ({
    capabilities: ADVANCED_ODONTOGRAM_CAPABILITIES,
    save: saveState,
    reload: reloadState,
    commitPlan: commitDraftPlan,
    dismissPlanItem,
    getState: () => odontogramState,
    getSelection: () => [...localSelectedRef.current],
    setSelection: (next) => setSelection(next),
    clearSelection: () => setSelection([]),
    getSnapshot: async () => {
      const mod = await loadAdvancedOdontogramEngine();
      return buildAdvancedOdontogramSaveRequest(mod, odontogramState);
    },
  }));

  async function saveState() {
    if (readOnly) return;
    setSaving(true);
    try {
      const mod = await loadAdvancedOdontogramEngine();
      const request = buildAdvancedOdontogramSaveRequest(mod, odontogramState);
      const saved = await api.odontogram.saveState(
        patientId,
        request,
        odontogramState?.row_version
      );
      await mutate(saved, { revalidate: false });
      setPlanChanges(request.plan_changes);
      setDirty(false);
      onSaved?.(saved);
      notify({ title: "Odontogram saved" });
    } catch (err) {
      const conflict = err?.status === 409;
      notify({
        title: conflict ? "Odontogram changed on the server" : "Could not save odontogram",
        description: err?.info?.message || err?.message || "Save failed",
      });
      if (conflict) {
        await mutate();
      }
    } finally {
      setSaving(false);
    }
  }

  async function reloadState() {
    setReloadKey((value) => value + 1);
    await mutate();
  }

  async function commitDraftPlan() {
    if (!appointmentId || !staffId || draftPlanItems.length === 0) return;
    setCommitting(true);
    try {
      const saved = await api.odontogram.commitPlan(patientId, {
        appointment_id: appointmentId,
        staff_id: staffId,
        plan_item_ids: draftPlanItems.map((item) => item.id),
        default_status: "Planned",
      });
      await mutate(saved, { revalidate: false });
      setDirty(false);
      onSaved?.(saved);
      notify({ title: "Plan committed", description: `${draftPlanItems.length} item${draftPlanItems.length === 1 ? "" : "s"} converted to treatment records.` });
    } catch (err) {
      notify({ title: "Could not commit plan", description: err?.info?.message || err?.message || "Commit failed" });
    } finally {
      setCommitting(false);
    }
  }

  async function dismissPlanItem(planItemId) {
    try {
      await api.odontogram.dismissPlanItem(patientId, planItemId);
      await mutate();
      notify({ title: "Plan item dismissed" });
    } catch (err) {
      notify({ title: "Could not dismiss item", description: err?.info?.message || err?.message || "Dismiss failed" });
    }
  }

  function handleChartClick(event) {
    if (selectionMode === "none") return;
    const tooth = getAdvancedToothFromEvent(event, scopeRef.current);
    if (!tooth) return;
    setSelection(nextAdvancedSelection(localSelectedRef.current, tooth, selectionMode));
  }

  function setSelection(next, { emit = true } = {}) {
    const normalized = normalizeAdvancedSelection(next);
    localSelectedRef.current = normalized;
    setLocalSelected(normalized);
    if (emit) onSelectionChange?.(normalized);
    window.setTimeout(() => applyAdvancedSelection(scopeRef.current, normalized), 0);
    return normalized;
  }

  if (isLoading) {
    return (
      <div className={cn("rounded border border-app-border bg-white p-4 text-sm text-app-muted", className)}>
        Loading odontogram...
      </div>
    );
  }

  if (error) {
    const description = error?.info?.message || error?.message || "Unknown error";
    return (
      <div className={cn("rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700", className)}>
        <div className="font-medium">Failed to load odontogram state.</div>
        <div className="mt-1 text-xs">{error?.status ? `HTTP ${error.status}: ` : ""}{description}</div>
      </div>
    );
  }

  const engineReadOnly = readOnly && selectionMode === "none";
  const viewOnly = readOnly && selectionMode !== "none";
  const compatibilityMode = Boolean(odontogramState?.compatibility_mode);
  const canCommit = Boolean(appointmentId && staffId && draftPlanItems.length > 0 && !readOnly && !compatibilityMode);
  const syncLabel = compatibilityMode
    ? (dirty ? "Unsaved snapshot edits" : "Using snapshot compatibility mode")
    : (dirty ? "Unsaved chart edits" : "Synced with backend clinical state");

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-app-border bg-white px-3 py-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-app-muted">
            {syncLabel}
            {planChanges.length > 0 ? ` · ${planChanges.length} plan change${planChanges.length === 1 ? "" : "s"}` : ""}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={reloadState}>
            <RotateCcw size={14} className="mr-1" /> Reload
          </Button>
          {!readOnly && (
            <Button size="sm" onClick={saveState} disabled={saving}>
              <Save size={14} className="mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          )}
          {canCommit && (
            <Button size="sm" variant="secondary" onClick={commitDraftPlan} disabled={committing}>
              <GitCommitHorizontal size={14} className="mr-1" /> {committing ? "Committing..." : "Commit Plan"}
            </Button>
          )}
        </div>
      </div>

      {showPlanPanel && (draftPlanItems.length > 0 || planChanges.length > 0) && (
        <div className="rounded border border-app-border bg-white p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 size={16} className="text-teal-700" /> Draft plan
          </div>
          {draftPlanItems.length === 0 && (
            <div className="text-xs text-app-muted">Save chart changes to prepare draft plan items.</div>
          )}
          {draftPlanItems.length > 0 && (
            <div className="space-y-2">
              {draftPlanItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded border border-app-border bg-app-bg px-3 py-2 text-xs">
                  <div className="min-w-0">
                    <div className="font-medium text-app-foreground">
                      Tooth {item.backend_tooth_number || item.advanced_tooth_number || "N/A"} · {formatAxis(item.axis)}
                    </div>
                    <div className="truncate text-app-muted">
                      {item.proposed_service_name || "Service not inferred"}
                      {item.proposed_surfaces ? ` · ${item.proposed_surfaces}` : ""}
                      {item.to_json?.label ? ` · ${item.to_json.label}` : ""}
                    </div>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      className="rounded p-1 text-slate-500 hover:bg-white hover:text-red-600"
                      aria-label="Dismiss plan item"
                      onClick={() => dismissPlanItem(item.id)}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              {!canCommit && !readOnly && (
                <div className="text-xs text-app-muted">Open this chart from an appointment to commit draft items into treatments.</div>
              )}
            </div>
          )}
        </div>
      )}

      <div
        ref={scopeRef}
        onClick={handleChartClick}
        className={cn(
          "advanced-odontogram-scope min-h-[720px] overflow-x-auto rounded border border-app-border bg-white",
          compact && "clinical-odontogram-compact min-h-[520px]",
          viewOnly && "clinical-odontogram-view-only"
        )}
        data-mode={mode}
      >
        <div className={compact ? "min-w-[980px]" : "min-w-[1180px]"}>
          <OdontogramShell
            key={reloadKey}
            language="en"
            numberingSystem="FDI"
            darkMode={false}
            readOnly={engineReadOnly}
            enableNotes={!readOnly}
            enableIcdas
            surfaceNotation="full"
            themeConfig={{
              colors: {
                background: "#f8fafc",
                panel: "#ffffff",
                card: "#ffffff",
                text: "#0f172a",
                muted: "#64748b",
                line: "#d7e0ec",
                accent: "#0f766e",
                accent2: "#0284c7",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
});

function formatAxis(axis) {
  return String(axis || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default ClinicalOdontogram;
