"use client";

export const ADVANCED_ODONTOGRAM_SOURCE_VERSION = "react-advanced-odontogram@2.2.0";
export const ADVANCED_ODONTOGRAM_HOST_API_VERSION = "clinic-advanced-odontogram-host@1";

export const EMPTY_ADVANCED_ODONTOGRAM_CHART = {
  version: "2.19",
  globals: {
    wisdomVisible: true,
    showBase: true,
    occlusalVisible: true,
    showHealthyPulp: true,
    edentulous: false,
  },
  teeth: {},
};

export const ADVANCED_ODONTOGRAM_CAPABILITIES = {
  statusChartImportExport: true,
  planChartImportExport: true,
  planDiffExport: true,
  hostSelection: true,
  hostSurfaceSelection: "sidecar",
  perioImportExport: "sidecar",
};

export async function loadAdvancedOdontogramEngine() {
  return import("react-advanced-odontogram");
}

export function normalizeAdvancedSelection(value) {
  return Array.from(new Set((Array.isArray(value) ? value : []).map(Number).filter(Number.isFinite)));
}

export function nextAdvancedSelection(current, tooth, selectionMode) {
  const n = Number(tooth);
  if (!Number.isFinite(n) || selectionMode === "none") return normalizeAdvancedSelection(current);
  if (selectionMode === "single") return [n];

  const set = new Set(normalizeAdvancedSelection(current));
  if (set.has(n)) set.delete(n);
  else set.add(n);
  return Array.from(set);
}

export function getAdvancedToothFromEvent(event, scope) {
  const tile = event?.target?.closest?.(".tooth-tile[data-tooth]");
  if (!tile || !scope?.contains?.(tile)) return null;
  const tooth = Number(tile.dataset.tooth);
  return Number.isFinite(tooth) ? tooth : null;
}

export function applyAdvancedSelection(scope, selectedValues) {
  if (!scope) return;
  const selected = new Set(normalizeAdvancedSelection(selectedValues));
  scope.querySelectorAll(".tooth-tile[data-tooth]").forEach((tile) => {
    const tooth = Number(tile.dataset.tooth);
    const active = selected.has(tooth);
    tile.classList.toggle("active", active);
    if (tile.hasAttribute("aria-selected")) {
      tile.setAttribute("aria-selected", String(active));
    }
  });
}

export function hydrateAdvancedOdontogram(engine, state) {
  const statusChart = coerceAdvancedChart(state?.status_chart || state?.statusChart);
  const planChart = coerceAdvancedChart(state?.plan_chart || state?.planChart);

  engine?.importStatus?.(statusChart);
  engine?.setPlanChart?.(planChart);
}

export function subscribeAdvancedOdontogram(engine, onChange) {
  if (typeof engine?.onStateChange !== "function") return () => {};
  const unsubscribe = engine.onStateChange(onChange);
  return typeof unsubscribe === "function" ? unsubscribe : () => {};
}

export function readAdvancedPlanChanges(engine) {
  try {
    const changes = typeof engine?.getPlanChanges === "function" ? engine.getPlanChanges() : [];
    return Array.isArray(changes) ? changes : [];
  } catch {
    return [];
  }
}

export function readAdvancedOdontogramCharts(engine, fallback = {}) {
  return {
    statusChart: coerceAdvancedChart(engine?.getStatusChart?.() || fallback.status_chart || fallback.statusChart),
    planChart: coerceAdvancedChart(engine?.getPlanChart?.() || fallback.plan_chart || fallback.planChart),
    planChanges: readAdvancedPlanChanges(engine),
  };
}

export function buildAdvancedOdontogramSaveRequest(engine, fallback = {}) {
  const { statusChart, planChart, planChanges } = readAdvancedOdontogramCharts(engine, fallback);
  return {
    source_version: ADVANCED_ODONTOGRAM_SOURCE_VERSION,
    host_api_version: ADVANCED_ODONTOGRAM_HOST_API_VERSION,
    status_chart: statusChart,
    plan_chart: planChart,
    plan_changes: planChanges,
    client_saved_at: new Date().toISOString(),
  };
}

export function coerceAdvancedChart(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return EMPTY_ADVANCED_ODONTOGRAM_CHART;
  }
  if (!value.teeth || typeof value.teeth !== "object" || Array.isArray(value.teeth)) {
    return { ...EMPTY_ADVANCED_ODONTOGRAM_CHART, ...value, teeth: {} };
  }
  return value;
}
