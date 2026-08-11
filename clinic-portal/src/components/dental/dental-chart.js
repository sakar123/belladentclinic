"use client";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Activity, Eye, Filter, Layers3, RotateCcw, Search, X } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";
import { http } from "../../lib/http";
import { api } from "@/lib/api";
import DinoTooth from "./dino-tooth";
import {
  CONDITION_STYLES,
  resolveCondition,
  getToothDisplayWidth,
} from "./dinodent-config";
import {
  PERMANENT_UPPER_TEETH,
  PERMANENT_LOWER_TEETH,
  PRIMARY_UPPER_TEETH,
  PRIMARY_LOWER_TEETH,
  getToothRawNumber,
  inferPermanentNumberingSystem,
  isPrimaryFdi,
  normalizeChartTooth,
  normalizeToChartTooth,
  universalToPermanentFdi,
} from "./tooth-numbering";
import { TREATMENT_CUES } from "./treatment-cues-config";
import { OrthoWire } from "./ortho-wire";
import { LayerInspector } from './layer-inspector';
import { INCOMPATIBLE_STATUSES } from './dinodent-config';
import { PerioChartLine } from './perio-chart-line';
import { SurfacePanel } from './surface-panel';
import { MacroButtons } from './macro-buttons';
import { getAdultToothName, getPrimaryToothName } from "./tooth-data";
import { DINO_ASSETS } from './dinodent-config';
import { preloadDentalSprites } from './sprite-preloader';

export default function DentalChart({
  patientId,
  onSelect,
  selectedTooth,
  selectedTeeth = [],
  onSelectionChange,
  selectMode = "single",
  className,
  showLegend = true,
  interactiveSurfaces = false,
  selectedSurfaces = [],
  selectedSurfacesMap = undefined, // { [toothNumber]: ['M','O',...] }
  onSurfaceClick = undefined,      // (toothNumber, surface) => void
  showDetailsInMultiple = false,
  refreshToken = 0,
}) {
  const { mutate } = useSWRConfig();
  const [toothStatuses, setToothStatuses] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [teethRaw, setTeethRaw] = useState([]);
  const [activeStatuses, setActiveStatuses] = useState(new Set());
  const [zoom, setZoom] = useState(1.0);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showPlanned, setShowPlanned] = useState(true);
  const [toothJump, setToothJump] = useState("");
  const [toothJumpError, setToothJumpError] = useState(false);
  const containerRef = useRef(null);
  const [spritesReady, setSpritesReady] = useState(false);
  const [spriteDebug, setSpriteDebug] = useState(false);
  const [inspector, setInspector] = useState({ open: false, x: 0, y: 0, data: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await preloadDentalSprites(DINO_ASSETS);
      } finally {
        if (!cancelled) setSpritesReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Debug toggles: ?spriteDebug=1 and Ctrl+Shift+D
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get('spriteDebug') === '1') setSpriteDebug(true);
    } catch {}
    const onKey = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) setSpriteDebug((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const spritesLoading = !spritesReady;
  const permanentNumberingSystem = useMemo(() => {
    return inferPermanentNumberingSystem(
      teethRaw.map(getToothRawNumber)
    );
  }, [teethRaw]);

  // ── Data fetching ──

  const loadChartData = useCallback(async () => {
    try {
      const [teeth, statuses] = await Promise.all([
        http.get(`/Teeth`, { params: { patientId } }).catch(() => []),
        http.get(`/lookup/tooth-status`).catch(() => []),
      ]);
      const idToCode = {};
      (statuses || []).forEach((s) => {
        idToCode[s.id] = s.code || s.name || s.value;
      });
      const numberingSystem = inferPermanentNumberingSystem(
        (teeth || []).map(getToothRawNumber)
      );
      const map = {};
      (teeth || []).forEach((t) => {
        const rawNum = getToothRawNumber(t);
        const normalized = normalizeToChartTooth(rawNum, numberingSystem);
        const num = normalized?.chartNumber;
        const code =
          idToCode[t.toothStatusId || t.tooth_status_id] ||
          (t.toothStatus && (t.toothStatus.code || t.toothStatus.name)) ||
          t.statusCode ||
          t.status ||
          "HEALTHY";
        if (num) map[num] = code;
      });
      setTeethRaw(Array.isArray(teeth) ? teeth : []);
      setToothStatuses(map);
      const sm = {};
      (statuses || []).forEach((s) => {
        const key = String(s.code || s.name || s.value || "").toUpperCase();
        if (!key) return;
        sm[key] = {
          label: s.name || s.description || key,
          color: s.color || "#94a3b8",
        };
      });
      setStatusMap(sm);
      return { teeth, statusMap: map, numberingSystem };
    } catch {
      setTeethRaw([]);
      setToothStatuses({});
      setStatusMap({});
      return { teeth: [], statusMap: {}, numberingSystem: "universal" };
    }
  }, [patientId]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData, refreshToken]);

  const { data: allTreatments } = useSWR(
    patientId ? `treatments-${patientId}` : null,
    () => api.treatments.getAll({ patientId })
  );
  const { data: allDocuments } = useSWR(
    patientId ? `documents-${patientId}` : null,
    () => api.document.getAll({ patientId })
  );
  const { data: statusList } = useSWR("tooth-status", () =>
    api.lookup.toothStatus.getAll()
  );

  // Periodontal latest measurements (for mobility/furcation overlays)
  const { data: latestPerio } = useSWR(
    patientId ? `perio-latest-${patientId}` : null,
    () => api.perio.getLatest(patientId)
  );

  // ── Derived state ──

  const isDimmed = (num) => {
    if (!activeStatuses || activeStatuses.size === 0) return false;
    const code = toothStatuses[num];
    if (!code) return true;
    return !activeStatuses.has(String(code));
  };

  const formatChartToothNumber = (number) => {
    const normalized = normalizeChartTooth(number);
    return normalized?.displayNumber ?? Number(number);
  };

  const getChartToothName = (number) => {
    const normalized = normalizeChartTooth(number);
    if (!normalized) return `Tooth ${number}`;
    return normalized.kind === "primary"
      ? getPrimaryToothName(normalized.chartNumber)
      : getAdultToothName(normalized.chartNumber);
  };

  const scrollToChartTooth = (number) => {
    window.requestAnimationFrame(() => {
      const node = containerRef.current?.querySelector?.(`#tooth-container-${Number(number)}`);
      node?.scrollIntoView?.({ block: "center", inline: "center", behavior: "smooth" });
    });
  };

  const focusTooth = (number) => {
    const n = Number(number);
    if (!Number.isFinite(n)) return;
    if (selectMode === "multiple") {
      const curr = new Set(Array.isArray(selectedTeeth) ? selectedTeeth.map(Number) : []);
      if (!curr.has(n)) {
        curr.add(n);
        onSelectionChange?.(Array.from(curr));
      }
      setSelectedDetail(buildToothDetail(n));
    } else {
      onSelect?.(n);
      setSelectedDetail(buildToothDetail(n));
    }
    scrollToChartTooth(n);
  };

  const handleJumpTooth = (event) => {
    event.preventDefault();
    const normalized =
      normalizeToChartTooth(toothJump, permanentNumberingSystem) ||
      normalizeChartTooth(toothJump);
    const target = normalized?.chartNumber;
    if (!target || !renderedToothNumbers.map(Number).includes(Number(target))) {
      setToothJumpError(true);
      return;
    }
    setToothJump("");
    setToothJumpError(false);
    focusTooth(target);
  };

  const clearSelection = () => {
    if (selectMode === "multiple") onSelectionChange?.([]);
    else onSelect?.(undefined);
    setSelectedDetail(null);
  };

  const handleToothClick = (n) => {
    if (selectMode === "multiple") {
      const curr = new Set(
        Array.isArray(selectedTeeth) ? selectedTeeth : []
      );
      if (curr.has(n)) curr.delete(n);
      else curr.add(n);
      onSelectionChange?.(Array.from(curr));
      if (showDetailsInMultiple) {
        setSelectedDetail(buildToothDetail(n));
      }
    } else {
      onSelect?.(n);
      setSelectedDetail(buildToothDetail(n));
    }
  };

  function buildToothDetail(
    number,
    teethOverride = teethRaw,
    statusesOverride = toothStatuses,
    numberingSystemOverride = permanentNumberingSystem
  ) {
    const selected = normalizeChartTooth(number);
    const t = (teethOverride || []).find(
      (z) => {
        const normalized = normalizeToChartTooth(
          getToothRawNumber(z),
          numberingSystemOverride
        );
        return normalized?.kind === selected?.kind &&
          Number(normalized?.chartNumber) === Number(selected?.chartNumber);
      }
    );
    const statusId = t?.tooth_status_id || t?.toothStatusId;
    const statusCode = statusesOverride[number] || "HEALTHY";
    const treatments = (allTreatments || []).filter(
      (tr) => {
        const treatmentPatientId = tr.patient_id || tr.patientId;
        const toothNumbers = tr.tooth_numbers || tr.toothNumbers || [];
        const toothNumber = tr.tooth_number || tr.toothNumber;
        const scope = tr.treatment_scope || tr.treatmentScope;
        return String(treatmentPatientId) === String(patientId) &&
          (toothNumbers
            .map((n) => normalizeToChartTooth(n, numberingSystemOverride)?.chartNumber)
            .map(Number)
            .includes(Number(number)) ||
            Number(normalizeToChartTooth(toothNumber, numberingSystemOverride)?.chartNumber) === Number(number) ||
            scope === "FullMouth");
      }
    );
    const documents = (allDocuments || []).filter(
      (doc) =>
        String(doc.patient_id || doc.patientId) === String(patientId) &&
        Boolean(t) &&
        (doc.tooth_id || doc.toothId) === t.id
    );
    return t
      ? {
          number,
          name: t.tooth_name,
          status: statusCode,
          statusId,
          toothId: t.id,
          treatments,
          documents,
        }
      : null;
  }

  const chartDentition = useMemo(() => {
    let hasPrimary = false;
    let hasPermanent = false;
    for (const tooth of teethRaw || []) {
      const raw = getToothRawNumber(tooth);
      const normalized = normalizeToChartTooth(raw, permanentNumberingSystem);
      if (normalized?.kind === "primary") hasPrimary = true;
      if (normalized?.kind === "permanent") hasPermanent = true;
    }
    return {
      showPermanent: hasPermanent || !hasPrimary,
      showPrimary: hasPrimary,
      mixed: hasPermanent && hasPrimary,
    };
  }, [teethRaw, permanentNumberingSystem]);

  const renderedToothNumbers = useMemo(() => {
    const nums = [];
    if (chartDentition.showPermanent) {
      nums.push(...PERMANENT_UPPER_TEETH, ...PERMANENT_LOWER_TEETH);
    }
    if (chartDentition.showPrimary) {
      nums.push(...PRIMARY_UPPER_TEETH, ...PRIMARY_LOWER_TEETH);
    }
    return nums;
  }, [chartDentition.showPermanent, chartDentition.showPrimary]);

  const annotationsByTooth = useMemo(() => {
    if (!allTreatments) return {};
    const inferCue = (nameRaw) => {
      const name = String(nameRaw || '').toLowerCase();
      if (!name) return undefined;
      if (name.includes('implant')) return 'IMPLANT';
      if (name.includes('post')) return 'POST';
      if (name.includes('root canal') || name.includes('endodont')) return 'ROOT_CANAL';
      if (name.includes('extraction') || name.includes('extract')) return 'EXTRACTION';
      if (name.includes('crown')) return 'CROWN';
      if (name.includes('filling') || name.includes('composite') || name.includes('amalgam')) return 'FILLING';
      if (name.includes('veneer')) return 'VENEER';
      if (name.includes('bracket') || name.includes('braces')) return 'BRACKET';
      if (name.includes('retainer')) return 'RETAINER';
      if (name.includes('sealant')) return 'SEALANT';
      if (name.includes('splint')) return 'SPLINT';
      if (name.includes('calculus')) return 'CALCULUS';
      if (name.includes('pulpitis')) return 'PULPITIS';
      if (name.includes('apical')) return 'APICAL_LESION';
      return undefined;
    };
    const normalizeStatus = (value) => {
      const compact = String(value || "Planned").replace(/\s+/g, "").toLowerCase();
      if (compact === "completed") return "Completed";
      if (compact === "cancelled" || compact === "canceled") return "Cancelled";
      if (compact === "inprogress") return "InProgress";
      return "Planned";
    };
    const map = {};
    for (const tr of allTreatments) {
      // Filter by patientId
      if (String(tr.patient_id || tr.patientId) !== String(patientId)) continue;

      const status = normalizeStatus(tr.status);
      if (status === "Cancelled") continue;
      if (!showPlanned && status !== "Completed") continue;
      let cueCode = tr.visual_cue_code || tr.visualCueCode || inferCue(tr.service_name || tr.service?.name);
      if (!cueCode || !TREATMENT_CUES[cueCode]) continue;
      const resultingStatusCode = String(
        tr.resulting_tooth_status_code || tr.resultingToothStatusCode || ""
      ).toUpperCase();
      const toothNums = tr.tooth_numbers || tr.toothNumbers || [];
      const scope = tr.treatment_scope || tr.treatmentScope;
      let targetTeeth = [];
      if (scope === "FullMouth") {
        targetTeeth = renderedToothNumbers;
      } else if (toothNums.length > 0) {
        targetTeeth = toothNums
          .map((n) => normalizeToChartTooth(n, permanentNumberingSystem)?.chartNumber)
          .filter(Boolean);
      } else if (tr.tooth_number || tr.toothNumber) {
        const normalizedTooth = normalizeToChartTooth(
          tr.tooth_number || tr.toothNumber,
          permanentNumberingSystem
        )?.chartNumber;
        targetTeeth = normalizedTooth ? [normalizedTooth] : [];
      }
      for (const tn of targetTeeth) {
        const currentToothStatus = String(toothStatuses[tn] || "").toUpperCase();
        if (status === "Completed" && resultingStatusCode && currentToothStatus === resultingStatusCode) {
          continue;
        }
        if (!map[tn]) map[tn] = [];
        map[tn].push({
          cueCode,
          surfaces: tr.surfaces || "",
          status,
          treatmentId: tr.id,
        });
      }
    }
    return map;
  }, [allTreatments, showPlanned, patientId, renderedToothNumbers, permanentNumberingSystem, toothStatuses]);

  const orthoGroups = useMemo(() => {
    if (!allTreatments) return [];
    return allTreatments
      .filter((tr) => tr.patient_id === patientId || tr.patientId === patientId)
      .filter((tr) => tr.status !== "Cancelled")
      .filter((tr) => showPlanned || tr.status === "Completed")
      .filter((tr) => {
        const cueCode = tr.visual_cue_code || tr.visualCueCode;
        return cueCode && TREATMENT_CUES[cueCode]?.connectable;
      })
      .map((tr) => {
        const rawTeeth =
          tr.tooth_numbers ||
          tr.toothNumbers ||
          (tr.tooth_number || tr.toothNumber ? [tr.tooth_number || tr.toothNumber] : []);
        const chartTeeth = rawTeeth
          .map((n) => normalizeToChartTooth(n, permanentNumberingSystem))
          .filter((tooth) => tooth?.kind === "permanent")
          .map((tooth) => tooth.chartNumber);
        return { ...tr, chartTeeth };
      });
  }, [allTreatments, showPlanned, patientId, permanentNumberingSystem]);

  const counts = useMemo(() => {
    const c = {};
    Object.values(toothStatuses).forEach((code) => {
      const k = String(code);
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [toothStatuses]);

  const perioByTooth = useMemo(() => {
    const mob = {};
    const furc = {};
    const bopSites = {};
    const pdSites = {};
    const gmSites = {};
    const calSites = {};
    const ms = latestPerio?.measurements || [];
    for (const m of ms) {
      const t = Number(normalizeToChartTooth(m.tooth_number, permanentNumberingSystem)?.chartNumber);
      if (!Number.isFinite(t)) continue;
      mob[t] = Math.max(mob[t] || 0, Number(m.mobility || 0));
      furc[t] = Math.max(furc[t] || 0, Number(m.furcation || 0));
      // BOP and PD per site
      const idx = Number(m.site_index);
      if (!Array.isArray(bopSites[t])) bopSites[t] = [false, false, false, false, false, false];
      if (!Array.isArray(pdSites[t])) pdSites[t] = [0,0,0,0,0,0];
      if (!Array.isArray(gmSites[t])) gmSites[t] = [0,0,0,0,0,0];
      if (!Array.isArray(calSites[t])) calSites[t] = [0,0,0,0,0,0];
      if (m.bleeding_on_probing === true) bopSites[t][idx] = true;
      const pdv = Number(m.pocket_depth || 0);
      if (!isNaN(pdv)) pdSites[t][idx] = pdv;
      const gmv = Number(m.gingival_margin || 0);
      if (!isNaN(gmv)) gmSites[t][idx] = gmv;
      const calv = Number(m.clinical_attachment_level || 0);
      if (!isNaN(calv)) calSites[t][idx] = calv;
    }
    return { mob, furc, bopSites, pdSites, gmSites, calSites };
  }, [latestPerio, permanentNumberingSystem]);

  function isBridgeConnected(toothNumber, side) {
    const adjacent =
      side === "left" ? toothNumber - 1 : toothNumber + 1;
    const sameArch =
      (toothNumber <= 16 && adjacent <= 16 && adjacent >= 1) ||
      (toothNumber >= 17 && adjacent >= 17 && adjacent <= 32);
    if (!sameArch) return false;
    const myStyle = resolveCondition(toothStatuses[toothNumber]);
    const adjStyle = resolveCondition(toothStatuses[adjacent]);
    return Boolean(myStyle.bridgeConnector && adjStyle.bridgeConnector);
  }

  function getBridgePosition(toothNumber) {
    const style = resolveCondition(toothStatuses[toothNumber]);
    if (!style.bridgeConnector) return null;
    const leftConn = isBridgeConnected(toothNumber, 'left');
    const rightConn = isBridgeConnected(toothNumber, 'right');
    if (leftConn && rightConn) return 'center';
    if (rightConn) return 'begin';
    if (leftConn) return 'end';
    return null;
  }

  function isSplintSelf(toothNumber) {
    const s = String(toothStatuses[toothNumber] || '').toUpperCase();
    return s.includes('SPLINT');
  }
  function isSplintConnected(toothNumber, side) {
    const adjacent = side === 'left' ? toothNumber - 1 : toothNumber + 1;
    const sameArch =
      (toothNumber <= 16 && adjacent <= 16 && adjacent >= 1) ||
      (toothNumber >= 17 && adjacent >= 17 && adjacent <= 32);
    if (!sameArch) return false;
    return isSplintSelf(toothNumber) && isSplintSelf(adjacent);
  }
  function getSplintPosition(toothNumber) {
    if (!isSplintSelf(toothNumber)) return null;
    const leftConn = isSplintConnected(toothNumber, 'left');
    const rightConn = isSplintConnected(toothNumber, 'right');
    if (leftConn && rightConn) return 'center';
    if (rightConn) return 'begin';
    if (leftConn) return 'end';
    return null;
  }

  // ── Zoom ──

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      setZoom((prev) =>
        Math.min(Math.max(prev + (e.deltaY > 0 ? -0.1 : 0.1), 0.5), 2.5)
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "]") setZoom((prev) => Math.min(prev + 0.1, 2.5));
      else if (e.key === "[")
        setZoom((prev) => Math.max(prev - 0.1, 0.5));
      else if (e.key === "\\") setZoom(1.0);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Compact mode for selectors (treatment-drawer, patient page) ──
  const isCompact = !showLegend;
  const toothScale = isCompact ? 0.155 : 0.27;
  const selectedCount = selectMode === "multiple"
    ? (Array.isArray(selectedTeeth) ? selectedTeeth.length : 0)
    : (selectedTooth || selectedDetail ? 1 : 0);
  const findingCount = Object.entries(counts).reduce((sum, [code, count]) => {
    return String(code).toUpperCase() === "HEALTHY" ? sum : sum + Number(count || 0);
  }, 0);
  const plannedCueCount = Object.values(annotationsByTooth).reduce(
    (sum, items) => sum + (Array.isArray(items) ? items.length : 0),
    0
  );
  const findingCodes = useMemo(() => {
    return Object.keys(counts).filter((code) => String(code).toUpperCase() !== "HEALTHY");
  }, [counts]);
  const selectedToothLabels = selectMode === "multiple"
    ? (Array.isArray(selectedTeeth) ? selectedTeeth : [])
        .map(Number)
        .filter(Number.isFinite)
        .map((number) => ({
          number,
          label: formatChartToothNumber(number),
          name: getChartToothName(number),
        }))
    : (() => {
        const number = Number(selectedTooth || selectedDetail?.number);
        return Number.isFinite(number)
          ? [{ number, label: formatChartToothNumber(number), name: getChartToothName(number) }]
          : [];
      })();

  return (
    <div
      className={`flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className || ""}`}
      onWheel={handleWheel}
    >
      {/* Header */}
      {!isCompact && (
        <div className="border-b border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="inline-flex size-7 items-center justify-center rounded-md bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                  <Activity size={15} />
                </span>
                <span>Clinical Odontogram</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
                  {chartDentition.mixed
                    ? "Mixed dentition"
                    : chartDentition.showPrimary && !chartDentition.showPermanent
                      ? "20 primary teeth"
                      : "32 permanent teeth"}
                </span>
                <span className="rounded-full border border-rose-100 bg-rose-50 px-2 py-0.5 text-rose-700">
                  {findingCount} findings
                </span>
                <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-amber-700">
                  {plannedCueCount} planned cues
                </span>
                {selectedCount > 0 && (
                  <span className="rounded-full border border-teal-100 bg-teal-50 px-2 py-0.5 text-teal-700">
                    {selectedCount} selected
                  </span>
                )}
              </div>
            </div>
            {spritesLoading && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">Loading sprites...</span>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-slate-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveStatuses(new Set(findingCodes))}
                  className={`inline-flex h-7 items-center gap-1 rounded px-2 text-[11px] font-medium transition-colors ${
                    activeStatuses.size > 0
                      ? "bg-white text-teal-700 shadow-sm"
                      : "text-slate-500 hover:bg-white"
                  }`}
                >
                  <Filter size={12} />
                  Findings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStatuses(new Set());
                    setShowPlanned(true);
                  }}
                  className="inline-flex h-7 items-center gap-1 rounded px-2 text-[11px] font-medium text-slate-500 transition-colors hover:bg-white"
                >
                  <RotateCcw size={12} />
                  Clear
                </button>
              </div>
              <form
                onSubmit={handleJumpTooth}
                className={`inline-flex h-8 items-center gap-1 rounded-md border bg-white px-2 transition-colors ${
                  toothJumpError ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200"
                }`}
              >
                <Search size={13} className={toothJumpError ? "text-rose-500" : "text-slate-400"} />
                <input
                  value={toothJump}
                  onChange={(event) => {
                    setToothJump(event.target.value.replace(/[^0-9]/g, ""));
                    setToothJumpError(false);
                  }}
                  placeholder="Tooth #"
                  inputMode="numeric"
                  className="h-7 w-16 bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </form>
              <label className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
                <Eye size={14} className="text-slate-500" />
                <input
                  type="checkbox"
                  checked={showPlanned}
                  onChange={(e) => setShowPlanned(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Planned
              </label>
              <div className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5">
                <Layers3 size={14} className="text-slate-500" />
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="h-1 w-24 accent-teal-600"
                  aria-label="Chart zoom"
                />
                <span className="text-[10px] text-slate-500 font-mono w-8">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <button
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                onClick={() => setZoom(1.0)}
              >
                <RotateCcw size={13} />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Chart canvas */}
        <div
          className="flex-1 overflow-auto"
          style={{
            minHeight: isCompact ? 210 : 560,
            backgroundColor: "#ffffff",
            backgroundImage: isCompact
              ? undefined
              : "linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          ref={containerRef}
          onClick={() => inspector.open && setInspector({ open: false, x: 0, y: 0, data: null })}
        >
          <div
            className="flex flex-col items-center justify-center px-6"
            style={{
              zoom,
              paddingTop: isCompact ? 12 : 32,
              paddingBottom: isCompact ? 12 : 32,
              paddingLeft: isCompact ? 24 : 32,
              paddingRight: isCompact ? 24 : 32,
            }}
          >
            {chartDentition.showPermanent && (
              <>
                <TeethRow
                  teeth={PERMANENT_UPPER_TEETH}
                  isUpper={true}
                  toothStatuses={toothStatuses}
                  annotationsByTooth={annotationsByTooth}
                  perioMob={perioByTooth.mob}
                  perioFurc={perioByTooth.furc}
                  perioPdSites={perioByTooth.pdSites}
                  perioBopSites={perioByTooth.bopSites}
                  selectedTeeth={selectedTeeth}
                  selectedTooth={selectedTooth}
                  selectedDetail={selectedDetail}
                  selectMode={selectMode}
                  isDimmed={isDimmed}
                  handleToothClick={handleToothClick}
                  isBridgeConnected={isBridgeConnected}
                  getBridgePosition={getBridgePosition}
                  getSplintPosition={getSplintPosition}
                  scale={toothScale}
                  orthoGroups={orthoGroups}
                  isCompact={isCompact}
                  interactiveSurfaces={interactiveSurfaces}
                  selectedSurfacesGlobal={selectedSurfaces}
                  selectedSurfacesMap={selectedSurfacesMap}
                  onSurfaceClick={onSurfaceClick}
                  debugMode={spriteDebug}
                  onDebugContext={(payload) => setInspector({ open: true, x: payload.clientX, y: payload.clientY, data: payload })}
                />

                <OcclusalPlaneLabel isCompact={isCompact} />

                {latestPerio && (
                  <div className="w-full max-w-5xl">
                    {(() => {
                      const widths = PERMANENT_UPPER_TEETH.map(t => getToothDisplayWidth(t, toothScale));
                      const dataGm = PERMANENT_UPPER_TEETH.map(t => ({ tooth: t, sites: (perioByTooth.gmSites?.[t] || []).slice(0,3) }));
                      const dataCal = PERMANENT_UPPER_TEETH.map(t => ({ tooth: t, sites: (perioByTooth.calSites?.[t] || []).slice(0,3) }));
                      return (
                        <>
                          <PerioChartLine width={800} height={80} data={dataGm} toothWidths={widths} color="#475569" />
                          <PerioChartLine width={800} height={80} data={dataCal} toothWidths={widths} color="#ef4444" />
                        </>
                      );
                    })()}
                  </div>
                )}

                <TeethRow
                  teeth={PERMANENT_LOWER_TEETH}
                  isUpper={false}
                  toothStatuses={toothStatuses}
                  annotationsByTooth={annotationsByTooth}
                  perioMob={perioByTooth.mob}
                  perioFurc={perioByTooth.furc}
                  perioPdSites={perioByTooth.pdSites}
                  perioBopSites={perioByTooth.bopSites}
                  selectedTeeth={selectedTeeth}
                  selectedTooth={selectedTooth}
                  selectedDetail={selectedDetail}
                  selectMode={selectMode}
                  isDimmed={isDimmed}
                  handleToothClick={handleToothClick}
                  isBridgeConnected={isBridgeConnected}
                  getBridgePosition={getBridgePosition}
                  getSplintPosition={getSplintPosition}
                  scale={toothScale}
                  orthoGroups={orthoGroups}
                  isCompact={isCompact}
                  interactiveSurfaces={interactiveSurfaces}
                  selectedSurfacesGlobal={selectedSurfaces}
                  selectedSurfacesMap={selectedSurfacesMap}
                  onSurfaceClick={onSurfaceClick}
                  debugMode={spriteDebug}
                  onDebugContext={(payload) => setInspector({ open: true, x: payload.clientX, y: payload.clientY, data: payload })}
                />
                {latestPerio && (
                  <div className="w-full max-w-5xl">
                    {(() => {
                      const widths = PERMANENT_LOWER_TEETH.map(t => getToothDisplayWidth(t, toothScale));
                      const dataGm = PERMANENT_LOWER_TEETH.map(t => ({ tooth: t, sites: (perioByTooth.gmSites?.[t] || []).slice(0,3) }));
                      const dataCal = PERMANENT_LOWER_TEETH.map(t => ({ tooth: t, sites: (perioByTooth.calSites?.[t] || []).slice(0,3) }));
                      return (
                        <>
                          <PerioChartLine width={800} height={80} data={dataGm} toothWidths={widths} color="#475569" />
                          <PerioChartLine width={800} height={80} data={dataCal} toothWidths={widths} color="#ef4444" />
                        </>
                      );
                    })()}
                  </div>
                )}
              </>
            )}

            {chartDentition.showPrimary && (
              <div className={chartDentition.showPermanent ? "mt-8 w-full" : "w-full"}>
                {!isCompact && chartDentition.mixed && (
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <div className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-700">
                      Primary Dentition
                    </div>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                )}
                <PrimaryTeethRow
                  teeth={PRIMARY_UPPER_TEETH}
                  isUpper
                  toothStatuses={toothStatuses}
                  statusMap={statusMap}
                  annotationsByTooth={annotationsByTooth}
                  selectedTeeth={selectedTeeth}
                  selectedTooth={selectedTooth}
                  selectedDetail={selectedDetail}
                  selectMode={selectMode}
                  isDimmed={isDimmed}
                  handleToothClick={handleToothClick}
                  isCompact={isCompact}
                />
                <OcclusalPlaneLabel isCompact={isCompact} />
                <PrimaryTeethRow
                  teeth={PRIMARY_LOWER_TEETH}
                  isUpper={false}
                  toothStatuses={toothStatuses}
                  statusMap={statusMap}
                  annotationsByTooth={annotationsByTooth}
                  selectedTeeth={selectedTeeth}
                  selectedTooth={selectedTooth}
                  selectedDetail={selectedDetail}
                  selectMode={selectMode}
                  isDimmed={isDimmed}
                  handleToothClick={handleToothClick}
                  isCompact={isCompact}
                />
              </div>
            )}
          </div>
          {!isCompact && selectMode === "multiple" && selectedToothLabels.length > 0 && (
            <div className="sticky bottom-3 z-20 mx-auto mb-3 flex w-[calc(100%-24px)] max-w-4xl items-center justify-between gap-3 rounded-lg border border-teal-100 bg-white/95 px-3 py-2 shadow-lg shadow-slate-200/70 backdrop-blur">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Selected Teeth
                </div>
                <div className="mt-1 flex max-w-full flex-wrap gap-1.5">
                  {selectedToothLabels.slice(0, 12).map((tooth) => (
                    <button
                      type="button"
                      key={tooth.number}
                      title={tooth.name}
                      onClick={() => focusTooth(tooth.number)}
                      className="inline-flex h-6 min-w-8 items-center justify-center rounded-md border border-teal-100 bg-teal-50 px-2 text-[11px] font-semibold text-teal-800 transition-colors hover:border-teal-300 hover:bg-teal-100"
                    >
                      {tooth.label}
                    </button>
                  ))}
                  {selectedToothLabels.length > 12 && (
                    <span className="inline-flex h-6 items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-semibold text-slate-500">
                      +{selectedToothLabels.length - 12}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                aria-label="Clear selected teeth"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Right-side condition panel — QDento style */}
        {!isCompact && (
          <ConditionPanel
            selectedDetail={selectedDetail}
            toothStatuses={toothStatuses}
            statusMap={statusMap}
            statusList={statusList}
            allTreatments={allTreatments}
            counts={counts}
            activeStatuses={activeStatuses}
            setActiveStatuses={setActiveStatuses}
            onStatusChange={async (toothId, statusId) => {
              try {
                const t = (teethRaw || []).find((z) => z.id === toothId);
                if (!t) return;
                await api.teeth.update(toothId, {
                  ...t,
                  tooth_status_id: statusId,
                });
                const statuses = await http
                  .get(`/lookup/tooth-status`)
                  .catch(() => []);
                const idToCode = {};
                (statuses || []).forEach((s) => {
                  idToCode[s.id] = s.code || s.name || s.value;
                });
                const code = idToCode[statusId] || "HEALTHY";
                const updateKey = normalizeToChartTooth(
                  getToothRawNumber(t),
                  permanentNumberingSystem
                )?.chartNumber;
                if (updateKey) {
                  setToothStatuses((prev) => ({
                    ...prev,
                    [Number(updateKey)]: code,
                  }));
                }
                setSelectedDetail((prev) =>
                  prev?.toothId === toothId
                    ? { ...prev, status: code, statusId }
                    : prev
                );
              } catch {}
            }}
            onTreatmentComplete={async (treatmentId) => {
              try {
                await api.treatments.complete(treatmentId);
                mutate(patientId ? `treatments-${patientId}` : null);
                const { teeth, statusMap: map, numberingSystem: refreshedNumberingSystem } = await loadChartData();
                setSelectedDetail(
                  buildToothDetail(selectedDetail?.number, teeth, map, refreshedNumberingSystem)
                );
              } catch (err) {
                console.error("Failed to complete treatment", err);
              }
            }}
            onClose={() => setSelectedDetail(null)}
          />
        )}
        {/* Layer inspector (debug) */}
        <LayerInspector open={inspector.open} x={inspector.x} y={inspector.y} data={inspector.data} onClose={() => setInspector({ open: false, x: 0, y: 0, data: null })} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// TeethRow — one arch in QDento flat-grid style
// Variable widths: molar cells wider than frontal cells
// ────────────────────────────────────────────────────────

function TeethRow({
  teeth,
  isUpper,
  toothStatuses,
  annotationsByTooth,
  perioMob,
  perioFurc,
  perioPdSites,
  perioBopSites,
  selectedTeeth,
  selectedTooth,
  selectedDetail,
  selectMode,
  isDimmed,
  handleToothClick,
  isBridgeConnected,
  getBridgePosition,
  getSplintPosition,
  debugMode,
  onDebugContext,
  scale,
  orthoGroups,
  isCompact,
  interactiveSurfaces,
  selectedSurfacesGlobal,
  selectedSurfacesMap,
  onSurfaceClick,
}) {
  const leftHalf = teeth.slice(0, 8);
  const rightHalf = teeth.slice(8, 16);

  const isSelected = (n) =>
    (Array.isArray(selectedTeeth) && selectedTeeth.includes(n)) ||
    selectedTooth === n ||
    (selectMode !== "multiple" && selectedDetail?.number === n);

  const cellWidth = (n) => getToothDisplayWidth(n, scale);

  const renderNumberCell = (n) => {
    const w = cellWidth(n);
    const sel = isSelected(n);
    return (
      <div
        key={`num-${n}`}
        onClick={() => handleToothClick(n)}
        className="flex items-center justify-center cursor-pointer select-none transition-colors"
        style={{
          width: w,
          height: 18,
          fontSize: 10,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          borderRight: "1px solid #e2e8f0",
          borderBottom: isUpper ? "1px solid #cbd5e1" : "none",
          borderTop: !isUpper ? "1px solid #cbd5e1" : "none",
          backgroundColor: sel ? "#0d9488" : "transparent",
          color: sel ? "#fff" : "#64748b",
        }}
      >
        {universalToPermanentFdi(n)}
      </div>
    );
  };

  const renderToothCell = (n) => {
    const w = cellWidth(n);
    const ann = annotationsByTooth[n] || [];
    const bracketAnn = ann.find(
      (a) => TREATMENT_CUES[a.cueCode]?.connectable
    );
    const bracketStatus = bracketAnn ? bracketAnn.status : "Completed";
    const sel = isSelected(n);

    const bridgePosition = getBridgePosition ? getBridgePosition(n) : null;
    const splintPosition = getSplintPosition ? getSplintPosition(n) : null;
    const pdArr = (perioPdSites && perioPdSites[n]) || [];
    const bopArr = (perioBopSites && perioBopSites[n]) || [];
    // Fine-tuned perio overlay: show when any PD >=4 or any BOP true
    const hasPerio = (pdArr.some(v => (v||0) >= 4)) || (Array.isArray(bopArr) && bopArr.some(Boolean));

    return (
      <div
        key={`tooth-${n}`}
        id={`tooth-container-${n}`}
        data-status={bracketStatus}
        className="flex items-center justify-center overflow-visible"
        style={{
          width: w,
          borderRight: "1px solid #f8fafc",
          backgroundColor: sel ? "rgba(13,148,136,0.04)" : "transparent",
        }}
      >
        <DinoTooth
          number={n}
          status={toothStatuses[n]}
          annotations={ann}
          selected={sel}
          dimmed={isDimmed(n)}
          onClick={() => handleToothClick(n)}
          scale={scale}
          bridgeLeft={isBridgeConnected(n, "left")}
          bridgeRight={isBridgeConnected(n, "right")}
          bridgePosition={bridgePosition}
          splintPosition={splintPosition}
          perioActive={hasPerio}
          debugMode={debugMode}
          onDebugContext={onDebugContext}
          compact={true}
          showTooltip={!isCompact}
          interactiveSurfaces={interactiveSurfaces}
          selectedSurfaces={selectedSurfacesMap?.[n] || selectedSurfacesGlobal}
          onSurfaceClick={onSurfaceClick}
          mobilityGrade={perioMob?.[n] || 0}
          furcationGrade={perioFurc?.[n] || 0}
          bopSites={bopArr}
        />
      </div>
    );
  };

  const midlineGap = isCompact ? 8 : 16;

  return (
    <div className="flex flex-col items-center w-full">
      {!isCompact && (
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {isUpper ? "Maxillary Arch" : "Mandibular Arch"}
        </div>
      )}
      {isUpper ? (
        <>
          {/* Number row */}
          <div className="flex items-center">
            <div className="flex">{leftHalf.map(renderNumberCell)}</div>
            <div style={{ width: midlineGap }} />
            <div className="flex">{rightHalf.map(renderNumberCell)}</div>
          </div>
          {/* Teeth */}
          <div className="flex items-start relative">
            <div className="flex items-end">{leftHalf.map(renderToothCell)}</div>
            <div style={{ width: midlineGap }} className="flex-shrink-0" />
            <div className="flex items-end">{rightHalf.map(renderToothCell)}</div>
            {orthoGroups.map((tr) => {
              const t =
                tr.chartTeeth ||
                tr.tooth_numbers ||
                tr.toothNumbers ||
                (tr.tooth_number ? [tr.tooth_number] : []);
              const archTeeth = t.filter((n) => n <= 16);
              if (archTeeth.length < 2) return null;
              return (
                <OrthoWire
                  key={tr.id + "-upper"}
                  teeth={archTeeth}
                  isUpper={true}
                  cueCode={tr.visual_cue_code || tr.visualCueCode}
                />
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Teeth */}
          <div className="flex items-end relative">
            <div className="flex items-start">{leftHalf.map(renderToothCell)}</div>
            <div style={{ width: midlineGap }} className="flex-shrink-0" />
            <div className="flex items-start">{rightHalf.map(renderToothCell)}</div>
            {orthoGroups.map((tr) => {
              const t =
                tr.chartTeeth ||
                tr.tooth_numbers ||
                tr.toothNumbers ||
                (tr.tooth_number ? [tr.tooth_number] : []);
              const archTeeth = t.filter((n) => n > 16);
              if (archTeeth.length < 2) return null;
              return (
                <OrthoWire
                  key={tr.id + "-lower"}
                  teeth={archTeeth}
                  isUpper={false}
                  cueCode={tr.visual_cue_code || tr.visualCueCode}
                />
              );
            })}
          </div>
          {/* Number row */}
          <div className="flex items-center">
            <div className="flex">{leftHalf.map(renderNumberCell)}</div>
            <div style={{ width: midlineGap }} />
            <div className="flex">{rightHalf.map(renderNumberCell)}</div>
          </div>
        </>
      )}
    </div>
  );
}

function OcclusalPlaneLabel({ isCompact }) {
  return (
    <div className="my-2 flex w-full max-w-5xl items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      {!isCompact && (
        <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 shadow-sm">
          Occlusal Plane
        </div>
      )}
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function PrimaryTeethRow({
  teeth,
  isUpper,
  toothStatuses,
  statusMap,
  annotationsByTooth,
  selectedTeeth,
  selectedTooth,
  selectedDetail,
  selectMode,
  isDimmed,
  handleToothClick,
  isCompact,
}) {
  const leftHalf = teeth.slice(0, 5);
  const rightHalf = teeth.slice(5);
  const isSelected = (n) =>
    (Array.isArray(selectedTeeth) && selectedTeeth.includes(n)) ||
    selectedTooth === n ||
    (selectMode !== "multiple" && selectedDetail?.number === n);
  const midlineGap = isCompact ? 8 : 16;

  const renderNumberCell = (n) => (
    <button
      key={`primary-num-${n}`}
      type="button"
      onClick={() => handleToothClick(n)}
      className="flex h-6 items-center justify-center border-r border-slate-200 text-[10px] font-semibold text-slate-500 transition-colors hover:bg-slate-50"
      style={{
        width: isCompact ? 34 : 42,
        borderBottom: isUpper ? "1px solid #cbd5e1" : "none",
        borderTop: !isUpper ? "1px solid #cbd5e1" : "none",
        backgroundColor: isSelected(n) ? "#0d9488" : "transparent",
        color: isSelected(n) ? "#fff" : undefined,
      }}
    >
      {n}
    </button>
  );

  const renderToothCell = (n) => (
    <div
      key={`primary-tooth-${n}`}
      id={`tooth-container-${n}`}
      className="flex items-center justify-center"
      style={{ width: isCompact ? 34 : 42 }}
    >
      <PrimaryTooth
        number={n}
        status={toothStatuses[n]}
        statusMap={statusMap}
        annotations={annotationsByTooth[n] || []}
        selected={isSelected(n)}
        dimmed={isDimmed(n)}
        isUpper={isUpper}
        compact={isCompact}
        onClick={() => handleToothClick(n)}
      />
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full">
      {!isCompact && (
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {isUpper ? "Primary Maxillary Arch" : "Primary Mandibular Arch"}
        </div>
      )}
      {isUpper ? (
        <>
          <div className="flex items-center">
            <div className="flex">{leftHalf.map(renderNumberCell)}</div>
            <div style={{ width: midlineGap }} />
            <div className="flex">{rightHalf.map(renderNumberCell)}</div>
          </div>
          <div className="flex items-end">
            <div className="flex items-end">{leftHalf.map(renderToothCell)}</div>
            <div style={{ width: midlineGap }} />
            <div className="flex items-end">{rightHalf.map(renderToothCell)}</div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-start">
            <div className="flex items-start">{leftHalf.map(renderToothCell)}</div>
            <div style={{ width: midlineGap }} />
            <div className="flex items-start">{rightHalf.map(renderToothCell)}</div>
          </div>
          <div className="flex items-center">
            <div className="flex">{leftHalf.map(renderNumberCell)}</div>
            <div style={{ width: midlineGap }} />
            <div className="flex">{rightHalf.map(renderNumberCell)}</div>
          </div>
        </>
      )}
    </div>
  );
}

function PrimaryTooth({
  number,
  status,
  statusMap,
  annotations,
  selected,
  dimmed,
  isUpper,
  compact,
  onClick,
}) {
  const style = resolveCondition(status);
  const statusColor = statusMap?.[String(status || "").toUpperCase()]?.color || style.color || "#22c55e";
  const conditionKey = String(status || "HEALTHY").toUpperCase();
  const hasCaries = conditionKey.includes("CARIES") || conditionKey.includes("DECAY") || conditionKey.includes("CAVITY");
  const hasFilling = conditionKey.includes("FILL");
  const hasCrown = conditionKey.includes("CROWN") || conditionKey.includes("BRIDGE");
  const isGone = conditionKey.includes("MISSING") || conditionKey.includes("EXTRACT");
  const plannedCount = Array.isArray(annotations) ? annotations.length : 0;
  const h = compact ? 64 : 82;
  const w = compact ? 28 : 34;
  const crownY = isUpper ? h * 0.58 : h * 0.16;
  const rootY = isUpper ? 2 : h * 0.48;

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${number} ${getPrimaryToothName(number)} - ${style.label || "Healthy"}`}
      className="relative flex items-center justify-center transition-transform hover:-translate-y-0.5"
      style={{ width: w, height: h, opacity: dimmed ? 0.25 : 1 }}
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        <path
          d={isUpper
            ? `M${w * 0.28} 4 C${w * 0.18} ${h * 0.28}, ${w * 0.24} ${h * 0.44}, ${w * 0.42} ${h * 0.55} L${w * 0.5} ${h * 0.5} L${w * 0.58} ${h * 0.55} C${w * 0.76} ${h * 0.44}, ${w * 0.82} ${h * 0.28}, ${w * 0.72} 4`
            : `M${w * 0.28} ${h - 4} C${w * 0.18} ${h * 0.72}, ${w * 0.24} ${h * 0.56}, ${w * 0.42} ${h * 0.45} L${w * 0.5} ${h * 0.5} L${w * 0.58} ${h * 0.45} C${w * 0.76} ${h * 0.56}, ${w * 0.82} ${h * 0.72}, ${w * 0.72} ${h - 4}`}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity={isGone ? 0.25 : 0.9}
        />
        <rect
          x={w * 0.18}
          y={crownY}
          width={w * 0.64}
          height={h * 0.32}
          rx={w * 0.22}
          fill={isGone ? "#f1f5f9" : "#fff"}
          stroke={selected ? "#0d9488" : statusColor}
          strokeWidth={selected ? 2.2 : 1.4}
          opacity={isGone ? 0.3 : 1}
        />
        <path
          d={`M${w * 0.28} ${crownY + h * 0.12} C${w * 0.38} ${rootY + h * 0.1}, ${w * 0.62} ${rootY + h * 0.1}, ${w * 0.72} ${crownY + h * 0.12}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
        />
        {hasCaries && <circle cx={w * 0.38} cy={crownY + h * 0.15} r={compact ? 3 : 4} fill="#ef4444" opacity="0.85" />}
        {hasFilling && <circle cx={w * 0.5} cy={crownY + h * 0.16} r={compact ? 4 : 5} fill="#64748b" opacity="0.8" />}
        {hasCrown && (
          <rect
            x={w * 0.2}
            y={crownY + h * 0.02}
            width={w * 0.6}
            height={h * 0.28}
            rx={w * 0.2}
            fill="#d4a44a"
            opacity="0.45"
          />
        )}
        {isGone && (
          <g stroke="#ef4444" strokeWidth="3" strokeLinecap="round" opacity="0.7">
            <line x1={w * 0.22} y1={h * 0.28} x2={w * 0.78} y2={h * 0.72} />
            <line x1={w * 0.78} y1={h * 0.28} x2={w * 0.22} y2={h * 0.72} />
          </g>
        )}
      </svg>
      {plannedCount > 0 && (
        <span className="absolute right-0 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white shadow-sm">
          {plannedCount}
        </span>
      )}
      {selected && (
        <span className="pointer-events-none absolute inset-0 rounded-md border-2 border-teal-500/60 bg-teal-500/5" />
      )}
    </button>
  );
}

// ────────────────────────────────────────────────────────
// Right-side condition/detail panel
// ────────────────────────────────────────────────────────

function ConditionPanel({
  selectedDetail,
  toothStatuses,
  statusMap,
  statusList,
  allTreatments,
  counts,
  activeStatuses,
  setActiveStatuses,
  onStatusChange,
  onTreatmentComplete,
  onClose,
}) {
  const [surfaceHistory, setSurfaceHistory] = useState([]);
  const [surfaceStates, setSurfaceStates] = useState({});

  useEffect(() => {
    (async () => {
      try {
        if (!selectedDetail?.toothId) { setSurfaceHistory([]); return; }
        const hist = await api.toothSurfaces.getHistory(selectedDetail.toothId);
        setSurfaceHistory(Array.isArray(hist) ? hist : []);
      } catch { setSurfaceHistory([]); }
    })();
  }, [selectedDetail?.toothId]);

  useEffect(() => {
    setSurfaceStates({});
  }, [selectedDetail?.toothId]);
  const conditionGroups = [
    {
      title: "Conditions",
      items: [
        { code: "CARIES", style: CONDITION_STYLES.CARIES },
        { code: "FRACTURED", style: CONDITION_STYLES.FRACTURED },
        { code: "ABSCESSED", style: CONDITION_STYLES.ABSCESSED },
        { code: "ERODED", style: CONDITION_STYLES.ERODED },
        { code: "IMPACTED", style: CONDITION_STYLES.IMPACTED },
        { code: "MOBILITY", style: CONDITION_STYLES.MOBILITY },
      ],
    },
    {
      title: "Restorations",
      items: [
        { code: "RCT", style: CONDITION_STYLES.RCT },
        { code: "CROWNED", style: CONDITION_STYLES.CROWNED },
        { code: "BRIDGE", style: CONDITION_STYLES.BRIDGE },
        { code: "FILLED", style: CONDITION_STYLES.FILLED },
        { code: "IMPLANT", style: CONDITION_STYLES.IMPLANT },
        { code: "VENEER", style: CONDITION_STYLES.VENEER },
        { code: "PONTIC", style: CONDITION_STYLES.PONTIC },
        { code: "DENTURE", style: CONDITION_STYLES.DENTURE },
      ],
    },
    {
      title: "Status",
      items: [
        { code: "HEALTHY", style: CONDITION_STYLES.HEALTHY },
        { code: "MISSING", style: CONDITION_STYLES.MISSING },
        { code: "EXTRACTED", style: CONDITION_STYLES.EXTRACTED },
      ],
    },
  ];
  const selectedStatusCode = String(selectedDetail?.status || "HEALTHY").toUpperCase();
  const selectedStyle = resolveCondition(selectedDetail?.status || "HEALTHY");
  const selectedStatusMeta = statusMap?.[selectedStatusCode];
  const selectedStatusColor = selectedStatusMeta?.color || selectedStyle.color || "#94a3b8";
  const selectedTreatmentsCount = selectedDetail?.treatments?.length || 0;
  const selectedDocumentsCount = selectedDetail?.documents?.length || 0;
  const openTreatmentCount = (selectedDetail?.treatments || []).filter(
    (tr) => tr.status === "Planned" || tr.status === "InProgress" || tr.status === "In Progress"
  ).length;

  return (
    <div className="w-[320px] border-l border-slate-200 bg-white flex flex-col overflow-y-auto">
      {/* Selected tooth detail */}
      {selectedDetail ? (
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm font-bold text-slate-800">
                Tooth {isPrimaryFdi(selectedDetail.number) ? selectedDetail.number : universalToPermanentFdi(selectedDetail.number)}
                <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                  (#{selectedDetail.number})
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {selectedDetail.name ||
                  (isPrimaryFdi(selectedDetail.number)
                    ? getPrimaryToothName(selectedDetail.number)
                    : getAdultToothName(selectedDetail.number))}
              </div>
              <div className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                {resolveCondition(selectedDetail.status).label || selectedDetail.status || "Healthy"}
              </div>
            </div>
            <button
              onClick={onClose}
              className="inline-flex size-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close tooth detail"
            >
              <X size={14} />
            </button>
          </div>
          <div className="mb-3 grid grid-cols-3 gap-2">
            <div className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1.5">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <span className="size-2 rounded-full" style={{ backgroundColor: selectedStatusColor }} />
                Status
              </div>
              <div className="truncate text-[11px] font-semibold text-slate-700">
                {selectedStatusMeta?.label || selectedStyle.label || selectedDetail.status || "Healthy"}
              </div>
            </div>
            <div className="rounded-md border border-amber-100 bg-amber-50 px-2 py-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">Open</div>
              <div className="text-sm font-bold text-amber-800">{openTreatmentCount}</div>
            </div>
            <div className="rounded-md border border-sky-100 bg-sky-50 px-2 py-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-sky-600">Records</div>
              <div className="text-sm font-bold text-sky-800">{selectedTreatmentsCount + selectedDocumentsCount}</div>
            </div>
          </div>
          <OcclusalView status={selectedDetail.status} surfaceStates={surfaceStates} />
          {/* Surface Panel */}
          <div className="mt-2">
            <SurfacePanel
              toothNumber={selectedDetail.number}
              surfaceMap={surfaceStates}
              onChange={(m) => setSurfaceStates(m)}
            />
            <MacroButtons
              onApplySurfaces={(s) => setSurfaceStates(prev => ({ ...prev, O: s.includes('O') ? 'restoration' : (prev.O||'intact'), M: s.includes('M') ? 'restoration' : (prev.M||'intact'), D: s.includes('D') ? 'restoration' : (prev.D||'intact'), B: s.includes('B') ? 'restoration' : (prev.B||'intact'), L: s.includes('L') ? 'restoration' : (prev.L||'intact') }))}
              onRemoveCrown={() => setSurfaceStates(prev => ({ ...prev, O: 'intact', B: 'intact', M: 'intact', D: 'intact', L: 'intact' }))}
              showBridgeWarning={false}
            />
          </div>

          {/* Per-surface treatment history */}
          <div className="mt-4">
            <div className="text-[11px] text-slate-500 mb-1">Surface history</div>
            {surfaceHistory.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-center text-[11px] text-slate-400">
                No surface records
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {surfaceHistory.map(h => (
                  <div key={h.surface} className="border border-slate-200 rounded p-2 bg-slate-50/40">
                    <div className="text-xs font-semibold text-slate-700 mb-1">{h.surface}</div>
                    {(h.treatments || []).slice(0,4).map(t => (
                      <div key={t.id} className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="truncate">{t.service_name}</span>
                        <span className="text-slate-400 ml-2">{t.date ? new Date(t.date).toLocaleDateString() : ''}</span>
                      </div>
                    ))}
                    {(!h.treatments || h.treatments.length === 0) && (
                      <div className="text-[11px] text-slate-400">No history</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status selector */}
          <div className="mt-2">
            <select
              value={selectedDetail.statusId || ""}
              onChange={(e) => {
                const newId = e.target.value;
                const s = (statusList || []).find(z => String(z.id) === String(newId));
                const newCode = String(s?.code || s?.name || '').toUpperCase();
                const currCode = String(selectedDetail.status || '').toUpperCase();
                const set = INCOMPATIBLE_STATUSES[currCode];
                if (set && set.has(newCode)) {
                  const ok = window.confirm(`Change ${currCode} → ${newCode}? This may be incompatible.`);
                  if (!ok) return;
                }
                onStatusChange(selectedDetail.toothId, newId);
              }}
              className="w-full h-8 rounded border border-slate-200 bg-white px-2 text-xs"
            >
              {(statusList || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code || s.name} — {s.description || s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Treatment history */}
          {selectedDetail.treatments &&
            selectedDetail.treatments.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
                  Treatments
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedDetail.treatments.map((tr) => {
                    const statusColors = {
                      Planned:
                        "bg-amber-50 text-amber-700 border-amber-200",
                      InProgress:
                        "bg-blue-50 text-blue-700 border-blue-200",
                      Completed:
                        "bg-green-50 text-green-700 border-green-200",
                      Cancelled:
                        "bg-slate-50 text-slate-400 border-slate-200",
                    };
                    const canComplete =
                      tr.status === "Planned" ||
                      tr.status === "InProgress";
                    const treatmentDate =
                      tr.completed_at ||
                      tr.completedAt ||
                      tr.created_at ||
                      tr.createdAt;
                    const surfacesRaw = tr.surfaces || tr.surface_map || tr.surfaceMap;
                    const surfaceLabel = Array.isArray(surfacesRaw)
                      ? surfacesRaw.join("")
                      : surfacesRaw && typeof surfacesRaw === "object"
                        ? Object.entries(surfacesRaw)
                            .map(([tooth, value]) => `${tooth}:${Array.isArray(value) ? value.join("") : value}`)
                            .join(" ")
                        : surfacesRaw;
                    return (
                      <div
                        key={tr.id}
                        className="text-xs p-2 rounded border border-slate-100 bg-white shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium truncate">
                            {tr.service_name ||
                              tr.serviceName ||
                              tr.service?.name ||
                              "Treatment"}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${statusColors[tr.status] || statusColors.Planned}`}
                          >
                            {tr.status || "Planned"}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                          {treatmentDate && <span>{new Date(treatmentDate).toLocaleDateString()}</span>}
                          {surfaceLabel && <span className="rounded bg-slate-50 px-1.5 py-0.5 text-slate-500">Surface {String(surfaceLabel)}</span>}
                        </div>
                        {canComplete && (
                          <button
                            className="mt-1 text-[10px] px-2 py-0.5 rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTreatmentComplete?.(tr.id);
                            }}
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      ) : (
        <div className="p-5 border-b border-slate-200 bg-white">
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-xs text-slate-400 text-center">
            Select a tooth to view details
          </div>
        </div>
      )}

      {/* Condition legend grid */}
      <div className="p-4 flex-1 bg-slate-50/60">
        {conditionGroups.map((group) => (
          <div key={group.title} className="mb-3">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
              {group.title}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {group.items.map(({ code, style }) => {
                const apiStatus = statusMap?.[code];
                const color = apiStatus?.color || style.color || "#94a3b8";
                const label = apiStatus?.label || style.label;
                const count = counts[code] || 0;
                const isActive = activeStatuses.has(code);
                return (
                  <button
                    key={code}
                    onClick={() =>
                      setActiveStatuses((prev) => {
                        const n = new Set(prev);
                        n.has(code) ? n.delete(code) : n.add(code);
                        return n;
                      })
                    }
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] text-left transition-all border
                      ${
                        isActive
                          ? "bg-teal-50 border-teal-300 text-teal-800 shadow-sm"
                          : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                      }`}
                  >
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0 border"
                      style={{
                        backgroundColor: color,
                        borderColor: color,
                      }}
                    />
                    <span className="truncate flex-1">
                      {label}
                    </span>
                    {count > 0 && (
                      <span
                        className={`text-[9px] min-w-[16px] text-center px-1 rounded-full font-semibold ${
                          isActive
                            ? "bg-teal-200 text-teal-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {activeStatuses.size > 0 && (
          <button
            className="w-full text-[10px] text-teal-600 hover:text-teal-800 hover:underline mt-1"
            onClick={() => setActiveStatuses(new Set())}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// Occlusal surface view (5-surface diagram for selected tooth)
// ────────────────────────────────────────────────────────

function OcclusalView({ status, surfaceStates }) {
  const style = resolveCondition(status);

  // Surface highlight colors based on condition
  const surfaceMap = {
    CARIES: { O: "#ef4444", B: "#fca5a5", M: "#fca5a5", D: "#fca5a5", L: "#fca5a5" },
    DECAYED: { O: "#ef4444", B: "#fca5a5", M: "#fca5a5", D: "#fca5a5", L: "#fca5a5" },
    CAVITY: { O: "#ef4444" },
    FILLED: { O: "#64748b" },
    CROWNED: { O: "#d4a44a", B: "#d4a44a", M: "#d4a44a", D: "#d4a44a", L: "#d4a44a" },
    CROWN: { O: "#d4a44a", B: "#d4a44a", M: "#d4a44a", D: "#d4a44a", L: "#d4a44a" },
    BRIDGE: { O: "#b8860b", B: "#b8860b", M: "#b8860b", D: "#b8860b", L: "#b8860b" },
    PONTIC: { O: "#78716c", B: "#78716c", M: "#78716c", D: "#78716c", L: "#78716c" },
    RCT: { O: "#e11d48" },
    VENEER: { B: "#e2e8f0" },
  };
  const sColors = surfaceMap[String(status).toUpperCase()] || {};

  const size = 90;
  const p = 10;
  const s = size - p * 2;
  const third = s / 3;
  const bg = "#f8fafc";

  return (
    <div className="flex justify-center py-1">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`translate(${p}, ${p})`}>
            <rect width={s} height={s} fill="none" stroke="#e2e8f0" strokeWidth="1.5" rx="3" />
            {/* O */}
            <rect x={third} y={third} width={third} height={third}
              fill={sColors.O || bg} stroke="#cbd5e1" strokeWidth="1" />
            <text x={s/2} y={s/2} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="9" fontWeight="700">O</text>
            {/* B */}
            <polygon points={`0,0 ${s},0 ${third*2},${third} ${third},${third}`}
              fill={sColors.B || bg} stroke="#cbd5e1" strokeWidth="1" />
            <text x={s/2} y={third/2} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="9" fontWeight="700">B</text>
            {/* L */}
            <polygon points={`0,${s} ${third},${third*2} ${third*2},${third*2} ${s},${s}`}
              fill={sColors.L || bg} stroke="#cbd5e1" strokeWidth="1" />
            <text x={s/2} y={s - third/2} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="9" fontWeight="700">L</text>
            {/* D */}
            <polygon points={`0,0 ${third},${third} ${third},${third*2} 0,${s}`}
              fill={sColors.D || bg} stroke="#cbd5e1" strokeWidth="1" />
            <text x={third/2} y={s/2} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="9" fontWeight="700">D</text>
            {/* M */}
            <polygon points={`${s},0 ${s},${s} ${third*2},${third*2} ${third*2},${third}`}
              fill={sColors.M || bg} stroke="#cbd5e1" strokeWidth="1" />
            <text x={s - third/2} y={s/2} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize="9" fontWeight="700">M</text>
          </g>
        </svg>
        {/* Surface dots from interactive SurfacePanel */}
        {surfaceStates && (
          <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
            {['O','B','L','D','M'].map((k) => {
              const st = surfaceStates[k];
              if (!st || st === 'intact') return null;
              const color = st === 'restoration' ? '#3b82f6' : st === 'secondary-caries' ? '#ef4444' : st === 'defective' ? '#f97316' : st === 'non-caries' ? '#a855f7' : '#94a3b8';
              const pos = { O: { x: size/2, y: size/2 }, B: { x: size/2, y: p + third/2 }, L: { x: size/2, y: size - (p + third/2) }, D: { x: p + third/2, y: size/2 }, M: { x: size - (p + third/2), y: size/2 } }[k];
              return (
                <span key={k} className="absolute w-2.5 h-2.5 rounded-full border-2 border-white shadow" style={{ left: pos.x - 4, top: pos.y - 4, backgroundColor: color }} />
              );
            })}
          </div>
        )}
        {/* Status dot */}
        <div
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: style.color || "#94a3b8" }}
        />
      </div>
    </div>
  );
}
