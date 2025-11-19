"use client";
import { useEffect, useMemo, useState } from "react";
import { http } from "../../lib/http";

const DEFAULT_COLORS = {
  healthy: "#ffffff",
  filled: "#9ca3af",
  missing: "#f3f4f6",
  attention: "#fecaca",
};

export default function DentalChart({ patientId, onSelect, selectedTooth, className, showLegend = true }) {
  const [toothStatuses, setToothStatuses] = useState({}); // { 1: 'HEALTHY', ... }
  const [statusMap, setStatusMap] = useState({}); // { HEALTHY: { color: '#fff', label: 'Healthy' } }
  const [activeStatuses, setActiveStatuses] = useState(new Set());
  const [legendOpen, setLegendOpen] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [teeth, statuses] = await Promise.all([
          http.get(`/api/Teeth`, { params: { patientId } }).catch(() => []),
          http.get(`/api/ToothStatus`).catch(() => []),
        ]);
        const map = {};
        (teeth || []).forEach((t) => {
          map[t.toothNumber || t.number] = t.statusCode || t.status;
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
            selected={selectedTooth === n}
            fill={fillFor(n)}
            dimmed={isDimmed(n)}
            label={labelFor(n)}
            onClick={() => onSelect?.(n)}
          />
        ))}
        {/* Bottom arch */}
        {teeth.bottom.map((n, idx) => (
          <Tooth
            key={n}
            n={n}
            x={40 + idx * 60}
            y={240}
            selected={selectedTooth === n}
            fill={fillFor(n)}
            dimmed={isDimmed(n)}
            label={labelFor(n)}
            onClick={() => onSelect?.(n)}
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

function Tooth({ n, x, y, fill, label, onClick, selected, dimmed }) {
  return (
    <g transform={`translate(${x}, ${y})`} className="cursor-pointer" onClick={onClick}>
      <rect x="0" y="0" width="48" height="64" rx="10" ry="10" fill={fill} stroke={selected ? '#3b82f6' : '#94a3b8'} strokeWidth={selected ? 3 : 2} opacity={dimmed ? 0.35 : 1} />
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
