"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { adultTeeth, primaryTeethFDI, getAdultToothName, getPrimaryToothName, quadrantShorthandAdult, quadrantShorthandPrimary } from './tooth-data';

export default function ToothChart3D({ mode = 'adult', value, onChange, className }) {
  const [hover, setHover] = useState(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const rootRef = useRef(null);
  const teeth = useMemo(() => (mode === 'primary' ? primaryTeethFDI : adultTeeth), [mode]);
  const half = Math.ceil(teeth.length / 2);
  const upper = teeth.slice(0, half);
  const lower = teeth.slice(half);

  // Set focus index to selected tooth on value change
  useEffect(() => {
    const sel = value?.tooth;
    if (!sel) return;
    const idx = teeth.findIndex(t => (t.number || t.fdi) === sel);
    if (idx >= 0) setFocusIdx(idx);
  }, [value?.tooth, mode]);

  // Keyboard navigation
  function onKeyDown(e) {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' ' , 'a','A','p','P'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'a' || e.key === 'A') {
      onChange?.({ mode: 'adult', tooth: value?.tooth });
      return;
    }
    if (e.key === 'p' || e.key === 'P') {
      onChange?.({ mode: 'primary', tooth: value?.tooth });
      return;
    }
    const n = teeth.length;
    let next = focusIdx;
    if (e.key === 'ArrowLeft') next = Math.max(0, focusIdx - 1);
    if (e.key === 'ArrowRight') next = Math.min(n - 1, focusIdx + 1);
    if (e.key === 'ArrowUp') {
      // jump to upper row same column index
      if (focusIdx >= half) next = Math.max(0, focusIdx - half);
    }
    if (e.key === 'ArrowDown') {
      // jump to lower row
      if (focusIdx < half) next = Math.min(n - 1, focusIdx + half);
    }
    if (next !== focusIdx) setFocusIdx(next);
    if (e.key === 'Enter' || e.key === ' ') {
      const sel = teeth[next];
      const id = sel.number || sel.fdi;
      onChange?.({ mode, tooth: id });
    }
  }

  const renderRow = (row, jaw) => (
    <div className="flex justify-center gap-1">
      {row.map((t, i) => {
        const globalIdx = jaw === 'upper' ? i : i + half;
        const id = t.number || t.fdi;
        const active = value?.tooth === id;
        const focused = focusIdx === globalIdx;
        const style = getToothTransform(i, row.length, jaw);
        return (
          <Tooth
            key={id}
            t={t}
            mode={mode}
            active={active}
            focused={focused}
            style={style}
            onHover={setHover}
            onSelect={(tooth) => onChange?.({ mode, tooth })}
          />
        );
      })}
    </div>
  );

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={"relative select-none outline-none " + (className || '')}
      aria-label="Tooth selector"
    >
      <div className="flex items-center gap-2 mb-2 text-xs">
        <button className={`px-2 py-1 rounded border ${mode==='adult'?'bg-sky-600 text-white border-sky-600':'bg-white text-slate-700 border-app-border'}`} onClick={(e) => e.preventDefault() || onChange?.({ mode: 'adult', tooth: value?.tooth })}>Adult</button>
        <button className={`px-2 py-1 rounded border ${mode==='primary'?'bg-sky-600 text-white border-sky-600':'bg-white text-slate-700 border-app-border'}`} onClick={(e) => e.preventDefault() || onChange?.({ mode: 'primary', tooth: value?.tooth })}>Primary</button>
        <span className="ml-auto text-[10px] text-app-muted">Arrows move · Enter selects · A/P toggle</span>
      </div>
      {/* Quadrant badges */}
      <div className="flex justify-between text-[10px] text-app-muted px-2 mb-1">
        <span>UR</span><span>UL</span>
      </div>
      {/* Pseudo-3D layout: upper arc and lower arc */}
      <div className="space-y-6">
        {renderRow(upper, 'upper')}
        <div className="flex justify-between text-[10px] text-app-muted px-2">
          <span>LL</span><span>LR</span>
        </div>
        <div style={{ transform: 'scaleX(-1)' }}>{renderRow(lower, 'lower')}</div>
      </div>
      {hover && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded bg-slate-800 text-white shadow">
          {mode === 'adult'
            ? `${quadrantShorthandAdult(hover)} – ${getAdultToothName(hover)}`
            : `${quadrantShorthandPrimary(hover)} – ${getPrimaryToothName(hover)} (FDI ${hover})`}
        </div>
      )}
    </div>
  );
}

function getToothTransform(i, n, jaw) {
  // Curve using sine profile: center lifted for upper, lowered for lower
  const ratio = n <= 1 ? 0 : i / (n - 1);
  const arc = Math.sin(ratio * Math.PI); // 0..1..0
  const y = Math.round(8 * Math.pow(arc, 1.2)) * (jaw === 'upper' ? -1 : 1);
  const tilt = (ratio - 0.5) * (jaw === 'upper' ? -10 : 10); // degrees
  return { transform: `translateY(${y}px) perspective(400px) rotateX(${jaw==='upper'?8:-8}deg) rotateZ(${tilt}deg)` };
}

function Tooth({ t, mode, active, focused, onHover, onSelect, style }) {
  const id = t.number || t.fdi;
  const label = String(id);
  return (
    <button
      type="button"
      className={`relative w-6 h-8 rounded-b-[10px] rounded-t-[6px] border ${active ? 'border-sky-600' : 'border-app-border'} bg-gradient-to-br from-white to-slate-100 shadow hover:shadow-md ${focused ? 'ring-2 ring-sky-400' : ''}`}
      onMouseEnter={() => onHover?.(id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onSelect?.(id)}
      title={mode === 'adult' ? getAdultToothName(id) : getPrimaryToothName(id)}
      style={style}
    >
      <span className={`absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] ${active ? 'text-sky-700' : 'text-app-muted'}`}>{label}</span>
      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] ${active ? 'text-sky-700' : 'text-app-muted'}`}>{mode === 'adult' ? 'A' : 'P'}</span>
    </button>
  );
}
