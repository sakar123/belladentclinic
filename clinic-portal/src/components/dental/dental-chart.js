"use client";
import { useEffect, useMemo, useState } from "react";
import { http } from "../../lib/http";

const DEFAULT_COLORS = {
  healthy: "#ffffff",
  filled: "#9ca3af",
  missing: "#f3f4f6",
  attention: "#fecaca",
};

export default function DentalChart({
  patientId,
  onSelect,
  selectedTooth,
  selectedTeeth = [], // optional multi-select support
  onSelectionChange,   // called with array when selectMode='multiple'
  selectMode = 'single',
  className,
  showLegend = true,
}) {
  const [toothStatuses, setToothStatuses] = useState({}); // { 1: 'HEALTHY', ... }
  const [statusMap, setStatusMap] = useState({}); // { HEALTHY: { color: '#fff', label: 'Healthy' } }
  const [activeStatuses, setActiveStatuses] = useState(new Set());
  const [legendOpen, setLegendOpen] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [teeth, statuses] = await Promise.all([
          http.get(`/api/Teeth`, { params: { patientId } }).catch(() => []),
          http.get(`/api/lookup/tooth-status`).catch(() => []),
        ]);
        // Build id -> code map for statuses
        const idToCode = {};
        (statuses || []).forEach((s) => {
          idToCode[s.id] = s.code || s.name || s.value;
        });
        // Map tooth number -> status code
        const map = {};
        (teeth || []).forEach((t) => {
          const rawNum = t.toothNumber || t.number || t.tooth_number;
          const num = normalizeToUniversal(rawNum);
          const code = (
            idToCode[t.toothStatusId || t.tooth_status_id]
            || (t.toothStatus && (t.toothStatus.code || t.toothStatus.name))
            || t.statusCode || t.status
          );
          if (num) map[num] = code;
        });
        setToothStatuses(map);
        const sm = {};
        (statuses || []).forEach((s) => {
          const key = s.code || s.name || s.value;
          sm[key] = {
            label: s.name || s.description || key,
            color: s.color || colorForStatus(key),
          };
        });
        setStatusMap(sm);
      } catch (e) {
        setToothStatuses({});
        setStatusMap({});
      }
    })();
  }, [patientId]);

  const teeth = useMemo(() => {
    const top = Array.from({ length: 16 }, (_, i) => 16 - i); // 16..1
    const bottom = Array.from({ length: 16 }, (_, i) => 17 + i); // 17..32
    return { top, bottom };
  }, []);

  const fillFor = (num) => {
    const code = toothStatuses[num];
    if (!code) return DEFAULT_COLORS.healthy;
    // Keep healthy as white; otherwise use mapped color for quick scan
    if (String(code).toLowerCase().includes('healthy')) return DEFAULT_COLORS.healthy;
    const entry = statusMap[code];
    return entry?.color || colorForStatus(code);
  };

  const labelFor = (num) => {
    const code = toothStatuses[num];
    if (!code) return "Healthy";
    return statusMap[code]?.label || code;
  };

  const isDimmed = (num) => {
    if (!activeStatuses || activeStatuses.size === 0) return false;
    const code = toothStatuses[num];
    if (!code) return true;
    return !activeStatuses.has(String(code));
  };

  const toggleStatus = (code) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  return (
    <div className={className}>
      <svg viewBox="0 0 1000 400" className="w-full h-auto">
        {/* Top arch */}
        {teeth.top.map((n, idx) => (
          <Tooth
            key={n}
            n={n}
            x={40 + idx * 60}
            y={80}
            selected={(Array.isArray(selectedTeeth) && selectedTeeth.includes(n)) || selectedTooth === n}
            fill={fillFor(n)}
            statusCode={toothStatuses[n]}
            statusColor={(statusMap[toothStatuses[n]] || {}).color}
            dimmed={isDimmed(n)}
            label={labelFor(n)}
            onClick={() => {
              if (selectMode === 'multiple') {
                const curr = new Set(Array.isArray(selectedTeeth) ? selectedTeeth : []);
                if (curr.has(n)) curr.delete(n); else curr.add(n);
                onSelectionChange?.(Array.from(curr));
              } else {
                onSelect?.(n);
              }
            }}
          />
        ))}
        {/* Bottom arch */}
        {teeth.bottom.map((n, idx) => (
          <Tooth
            key={n}
            n={n}
            x={40 + idx * 60}
            y={240}
            selected={(Array.isArray(selectedTeeth) && selectedTeeth.includes(n)) || selectedTooth === n}
            fill={fillFor(n)}
            statusCode={toothStatuses[n]}
            statusColor={(statusMap[toothStatuses[n]] || {}).color}
            dimmed={isDimmed(n)}
            label={labelFor(n)}
            onClick={() => {
              if (selectMode === 'multiple') {
                const curr = new Set(Array.isArray(selectedTeeth) ? selectedTeeth : []);
                if (curr.has(n)) curr.delete(n); else curr.add(n);
                onSelectionChange?.(Array.from(curr));
              } else {
                onSelect?.(n);
              }
            }}
          />
        ))}
      </svg>
      {showLegend && (
        <div className="mt-3">
          <button
            type="button"
            className="mb-2 text-xs text-app-muted hover:underline"
            onClick={() => setLegendOpen((v) => !v)}
          >
            {legendOpen ? 'Hide legend' : 'Show legend'}
          </button>
          {legendOpen && (
          <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(statusMap).map(([code, info]) => {
            const active = activeStatuses.has(String(code));
            const count = Object.values(toothStatuses).filter((c) => String(c) === String(code)).length;
            return (
              <button
                type="button"
                key={code}
                onClick={() => toggleStatus(String(code))}
                className={`inline-flex items-center gap-2 px-2 py-1 rounded border ${active ? 'bg-app-bg border-blue-300' : 'border-app-border'}`}
                title={active ? 'Click to remove filter' : 'Click to filter by this status'}
              >
                <span className="inline-block size-3 rounded-sm" style={{ backgroundColor: info.color }} />
                <span className="text-app-muted">{info.label} ({count})</span>
              </button>
            );
          })}
          {Object.keys(statusMap).length > 0 && (
            <button type="button" className="ml-auto text-xs text-app-muted hover:underline" onClick={() => setActiveStatuses(new Set())}>
              Reset
            </button>
          )}
          </div>
          )}
        </div>
      )}
    </div>
  );
}

function Tooth({ n, x, y, fill, label, onClick, selected, dimmed, statusCode, statusColor }) {
  const glyph = glyphForStatus(statusCode);
  const borderColor = selected ? '#3b82f6' : '#94a3b8';
  const borderW = selected ? 3 : 2;
  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer" onClick={onClick}>
      <rect x="0" y="0" width="48" height="64" rx="10" ry="10" fill={fill} stroke={borderColor} strokeWidth={borderW} opacity={dimmed ? 0.35 : 1} />
      {glyph && (
        <g transform="translate(0,0)" opacity={dimmed ? 0.35 : 1}>
          {renderGlyph(glyph, statusColor || '#0ea5e9')}
        </g>
      )}
      <text x="24" y="-10" textAnchor="middle" fontSize="10" fill="#64748b">{n}</text>
      <title>{`#${n} • ${label}`}</title>
    </g>
  );
}

function colorForStatus(codeRaw) {
  const code = String(codeRaw || '').toLowerCase();
  if (code.includes('healthy')) return DEFAULT_COLORS.healthy;
  if (code.includes('fill')) return DEFAULT_COLORS.filled;
  if (code.includes('miss')) return DEFAULT_COLORS.missing;
  if (code.includes('decay') || code.includes('caries') || code.includes('attention')) return DEFAULT_COLORS.attention;
  return DEFAULT_COLORS.healthy;
}

// Convert FDI (11–48) to universal (1–32). If already universal, return as-is.
function normalizeToUniversal(nRaw) {
  const n = Number(nRaw);
  if (!Number.isFinite(n)) return undefined;
  if (n <= 32) return n; // assume universal permanent
  const q = Math.floor(n / 10);
  const t = n % 10;
  if (q === 1) return 9 - t;        // upper right → 1..8
  if (q === 2) return 8 + t;        // upper left  → 9..16
  if (q === 3) return 25 - t;       // lower left  → 17..24 (reverse)
  if (q === 4) return 24 + t;       // lower right → 25..32
  // Primary (5–8) not rendered on this chart; ignore for now
  return undefined;
}

// Map status code to a semantic glyph name
function glyphForStatus(codeRaw) {
  const code = String(codeRaw || '').toLowerCase();
  if (!code || code.includes('healthy')) return null;
  if (code.includes('rct') || (code.includes('root') && code.includes('canal')) || code.includes('endodont')) return 'rct';
  if (code.includes('veneer')) return 'veneer';
  if (code.includes('bridge')) return 'bridge';
  if (code.includes('implant')) return 'implant';
  if (code.includes('crown')) return 'crown';
  if (code.includes('filling') || code.includes('restor') || code.includes('amalgam') || code.includes('composite')) return 'filling';
  if (code.includes('caries') || code.includes('decay') || code.includes('cavity')) return 'cavity';
  if (code.includes('onlay')) return 'onlay';
  if (code.includes('inlay')) return 'inlay';
  if (code.includes('fract') || code.includes('crack')) return 'fracture';
  if (code.includes('braces') || code.includes('ortho') || code.includes('aligner')) return 'braces';
  if (code.includes('extraction') || code.includes('extract') || code.includes('removed') || code.includes('missing')) return 'missing';
  return 'other';
}

// Render small SVG glyphs within the 48x64 tooth rect. Coordinates are local to the rect.
function renderGlyph(name, color) {
  const c = color || '#0ea5e9';
  switch (name) {
    case 'cavity':
      // small dot center
      return <circle cx="24" cy="32" r="4" fill="#111827" />;
    case 'missing':
      // an X across the tooth
      return (
        <g stroke="#ef4444" strokeWidth="3" strokeLinecap="round">
          <line x1="8" y1="12" x2="40" y2="52" />
          <line x1="40" y1="12" x2="8" y2="52" />
        </g>
      );
    case 'rct':
      // vertical canal with lateral branches
      return (
        <g stroke={c} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M24 10 L24 54" />
          <path d="M24 26 C20 28, 18 30, 16 32" />
          <path d="M24 38 C28 40, 30 42, 32 44" />
        </g>
      );
    case 'veneer':
      // thin facial shell at incisal/occlusal third
      return <rect x="8" y="10" width="32" height="8" rx="3" fill={c} opacity="0.8" />;
    case 'crown':
      // stylized crown
      return (
        <g fill={c}>
          <path d="M10 20 L16 12 L24 20 L32 12 L38 20 L38 28 L10 28 Z" />
        </g>
      );
    case 'bridge':
      // chain-like bar indicating bridge
      return (
        <g stroke={c} strokeWidth="2" fill="none" strokeLinecap="round">
          <line x1="10" y1="22" x2="38" y2="22" />
          <circle cx="16" cy="22" r="4" />
          <circle cx="32" cy="22" r="4" />
        </g>
      );
    case 'implant':
      // screw-like implant post
      return (
        <g stroke={c} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M24 12 L24 48" />
          <path d="M18 18 L30 18" />
          <path d="M18 24 L30 24" />
          <path d="M18 30 L30 30" />
          <path d="M20 36 L28 36" />
        </g>
      );
    case 'filling':
      // central square
      return <rect x="18" y="26" width="12" height="12" fill={c} opacity="0.9" rx="2" />;
    case 'inlay':
      // diamond shape
      return (
        <g fill={c} opacity="0.9">
          <path d="M24 22 L30 32 L24 42 L18 32 Z" />
        </g>
      );
    case 'onlay':
      // triangle on cusp
      return (
        <g fill={c} opacity="0.9">
          <path d="M24 14 L34 26 L14 26 Z" />
        </g>
      );
    case 'fracture':
      // lightning crack
      return (
        <path d="M20 12 L26 26 L22 26 L28 40" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      );
    case 'braces':
      // horizontal wire with brackets
      return (
        <g stroke={c} strokeWidth="2" fill="none" strokeLinecap="round">
          <line x1="10" y1="32" x2="38" y2="32" />
          <rect x="16" y="28" width="6" height="8" fill={c} />
          <rect x="26" y="28" width="6" height="8" fill={c} />
        </g>
      );
    case 'other':
    default:
      // small dot marker top-right
      return <circle cx="38" cy="10" r="4" fill={c} />;
  }
}
