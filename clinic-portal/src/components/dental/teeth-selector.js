"use client";
import { useMemo } from "react";

// A reusable teeth selector inspired by Apexo's selector.
// Supports permanent (FDI 11–48) and primary (FDI 51–85) sets, multi or single select.
// Props:
// - value: array of selected tooth numbers (FDI) or a single number if selectMode='single'
// - onChange: (nextSelected) => void
// - showPermanent: boolean
// - showPrimary: boolean
// - selectMode: 'multiple' | 'single'
// - colorized: { [fdi:number]: color }
// - className: string

export default function TeethSelector({
  value = [],
  onChange,
  showPermanent = true,
  showPrimary = false,
  selectMode = 'multiple',
  colorized = {},
  className,
}) {
  // Universal numbering
  const permanentTop = useMemo(() => [16,15,14,13,12,11,10,9, 8,7,6,5,4,3,2,1], []);
  const permanentBottom = useMemo(() => [17,18,19,20,21,22,23,24, 25,26,27,28,29,30,31,32], []);
  const primaryTop = useMemo(() => [10,9,8,7,6, 5,4,3,2,1], []);
  const primaryBottom = useMemo(() => [11,12,13,14,15, 16,17,18,19,20], []);

  const selectedSet = useMemo(() => new Set(Array.isArray(value) ? value.map(Number) : [Number(value)].filter(Boolean)), [value]);

  function toggle(n) {
    const current = new Set(selectedSet);
    if (selectMode === 'single') {
      const next = current.has(n) ? [] : [n];
      onChange?.(next);
      return;
    }
    if (current.has(n)) current.delete(n); else current.add(n);
    onChange?.(Array.from(current));
  }

  function renderRow(list, y) {
    return (
      <g transform={`translate(0, ${y})`}>
        {list.map((n, idx) => (
          <ToothRect
            key={n}
            n={n}
            x={20 + idx * 44}
            selected={selectedSet.has(n)}
            fill={colorized[n]}
            onClick={() => toggle(n)}
          />
        ))}
      </g>
    );
  }

  return (
    <div className={className}>
      <svg viewBox="0 0 740 220" className="w-full h-auto select-none">
        {/* Upper arch(s) */}
        {showPermanent && renderRow(permanentTop, 40)}
        {showPrimary && renderRow(primaryTop, 90)}
        {/* Lower arch(s) */}
        {showPrimary && renderRow(primaryBottom, 140)}
        {showPermanent && renderRow(permanentBottom, 190)}
      </svg>
    </div>
  );
}

function ToothRect({ n, x, selected, fill, onClick }) {
  const stroke = selected ? '#0284c7' : '#cbd5e1';
  const strokeW = selected ? 3 : 2;
  const bg = fill || '#ffffff';
  return (
    <g transform={`translate(${x}, 0)`} className="cursor-pointer" onClick={onClick}>
      <rect x="0" y="0" width="40" height="40" rx="8" ry="8" fill={bg} stroke={stroke} strokeWidth={strokeW} />
      <text x="20" y="-6" textAnchor="middle" fontSize="10" fill="#64748b">{n}</text>
    </g>
  );
}
