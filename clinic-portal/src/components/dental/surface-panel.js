"use client";
import React, { useEffect, useState } from 'react';
import { getToothConfig } from './dinodent-config';
import { ButtonSurfaceMatrix } from './button-surface-matrix';

// Simple per-surface state cycle and colors
const SURFACE_STATES = ['intact', 'restoration', 'secondary-caries', 'defective', 'non-caries'];
const SURFACE_COLORS = {
  intact: '#f8fafc',
  restoration: '#3b82f6', // blue
  'secondary-caries': '#ef4444', // red
  defective: '#f97316', // orange
  'non-caries': '#a855f7', // purple
};
const EMPTY_SURFACE_MAP = {};

export function SurfacePanel({
  toothNumber,
  surfaceMap = EMPTY_SURFACE_MAP, // { M: 'intact'|'restoration'|... }
  onChange,
}) {
  const [states, setStates] = useState(surfaceMap || {});

  useEffect(() => {
    setStates(surfaceMap || {});
  }, [toothNumber, surfaceMap]);

  const config = getToothConfig(Number(toothNumber));
  const isUpper = config?.isUpper;
  const isMolar = config?.isMolar;

  const handleSurfaceClick = (pos) => {
    const s = ButtonSurfaceMatrix.getSurface(Number(toothNumber), pos);
    const curr = states[s] || 'intact';
    const idx = SURFACE_STATES.indexOf(curr);
    const next = SURFACE_STATES[(idx + 1) % SURFACE_STATES.length];
    const nextMap = { ...states, [s]: next };
    setStates(nextMap);
    onChange?.(nextMap);
  };

  const size = 120;
  const p = 12;
  const s = size - p * 2;
  const third = s / 3;

  const fillFor = (surface) => SURFACE_COLORS[states[surface] || 'intact'];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs text-slate-500">Occlusal Surfaces</div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="cursor-pointer select-none">
        <g transform={`translate(${p}, ${p})`}>
          <rect width={s} height={s} fill="none" stroke="#cbd5e1" strokeWidth="2" rx="4" />
          {/* O (center) */}
          <rect x={third} y={third} width={third} height={third}
            fill={fillFor('O')} stroke="#94a3b8" strokeWidth="1.5"
            onClick={() => handleSurfaceClick('center')} />
          {/* B (top) */}
          <polygon points={`0,0 ${s},0 ${third*2},${third} ${third},${third}`}
            fill={fillFor('B')} stroke="#94a3b8" strokeWidth="1.5"
            onClick={() => handleSurfaceClick('top')} />
          {/* L (bottom) */}
          <polygon points={`0,${s} ${third},${third*2} ${third*2},${third*2} ${s},${s}`}
            fill={fillFor('L')} stroke="#94a3b8" strokeWidth="1.5"
            onClick={() => handleSurfaceClick('bottom')} />
          {/* D (left) */}
          <polygon points={`0,0 ${third},${third} ${third},${third*2} 0,${s}`}
            fill={fillFor('D')} stroke="#94a3b8" strokeWidth="1.5"
            onClick={() => handleSurfaceClick('left')} />
          {/* M (right) */}
          <polygon points={`${s},0 ${s},${s} ${third*2},${third*2} ${third*2},${third}`}
            fill={fillFor('M')} stroke="#94a3b8" strokeWidth="1.5"
            onClick={() => handleSurfaceClick('right')} />
          {/* C (cervical strip) */}
          <rect x={10} y={s+6} width={s-20} height={8}
            fill={fillFor('C')} stroke="#94a3b8" strokeWidth="1.5"
            onClick={() => handleSurfaceClick('side')} />
        </g>
      </svg>
      <div className="flex gap-2 mt-1">
        {SURFACE_STATES.map((st) => (
          <div key={st} className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="inline-block w-2.5 h-2.5 rounded-sm border" style={{ backgroundColor: SURFACE_COLORS[st], borderColor: '#94a3b8' }} />
            <span>{st}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
