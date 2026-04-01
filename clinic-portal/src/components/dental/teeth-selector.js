"use client";
import { useMemo, useRef, useState } from "react";

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

  // Marquee selection state
  const svgRef = useRef(null);
  const [marquee, setMarquee] = useState(null); // { x1, y1, x2, y2 }

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

  // --- Helper: get tooth rectangles layout in SVG viewBox coordinates ---
  const toothRects = useMemo(() => {
    const rects = [];
    const W = 40, H = 40;
    const X = (idx) => 20 + idx * 44;
    if (showPermanent) {
      permanentTop.forEach((n, idx) => rects.push({ n, x: X(idx), y: 40, w: W, h: H }));
      permanentBottom.forEach((n, idx) => rects.push({ n, x: X(idx), y: 190, w: W, h: H }));
    }
    if (showPrimary) {
      primaryTop.forEach((n, idx) => rects.push({ n, x: 20 + idx * 44, y: 90, w: W, h: H }));
      primaryBottom.forEach((n, idx) => rects.push({ n, x: 20 + idx * 44, y: 140, w: W, h: H }));
    }
    return rects;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPermanent, showPrimary, permanentTop, permanentBottom, primaryTop, primaryBottom]);

  function clientToSvgCoords(e) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal || { x: 0, y: 0, width: 740, height: 220 };
    const x = ((e.clientX - rect.left) / rect.width) * viewBox.width + viewBox.x;
    const y = ((e.clientY - rect.top) / rect.height) * viewBox.height + viewBox.y;
    return { x, y };
  }

  function isWithinToothTarget(evt) {
    let el = evt.target;
    const root = svgRef.current;
    while (el && el !== root && el instanceof Element) {
      if (el.getAttribute && el.getAttribute('data-tooth')) return true;
      el = el.parentNode;
    }
    return false;
  }

  function onPointerDown(e) {
    if (selectMode !== 'multiple') return; // marquee only for multi-select
    if (e.button !== 0) return; // left button only
    // If starting on a tooth, let the tooth's click handler handle toggle
    if (isWithinToothTarget(e)) return;
    const { x, y } = clientToSvgCoords(e);
    setMarquee({ x1: x, y1: y, x2: x, y2: y });
  }

  function onPointerMove(e) {
    if (!marquee) return;
    const { x, y } = clientToSvgCoords(e);
    setMarquee(prev => prev ? { ...prev, x2: x, y2: y } : null);
    e.preventDefault();
  }

  function intersects(a, b) {
    return !(a.x > b.x + b.w || a.x + a.w < b.x || a.y > b.y + b.h || a.y + a.h < b.y);
  }

  function onPointerUp(e) {
    if (!marquee) return;
    const m = marquee;
    setMarquee(null);
    const rx = Math.min(m.x1, m.x2);
    const ry = Math.min(m.y1, m.y2);
    const rw = Math.abs(m.x2 - m.x1);
    const rh = Math.abs(m.y2 - m.y1);
    const selectionRect = { x: rx, y: ry, w: rw, h: rh };
    // Skip if negligible drag (treat as click-drag only)
    if (rw < 2 && rh < 2) return;
    const hit = toothRects
      .filter(tr => intersects({ x: tr.x, y: tr.y, w: tr.w, h: tr.h }, selectionRect))
      .map(tr => Number(tr.n));
    if (hit.length === 0) return;
    const union = new Set(selectedSet);
    hit.forEach(n => union.add(n));
    onChange?.(Array.from(union));
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
      <svg
        ref={svgRef}
        viewBox="0 0 740 220"
        className="w-full h-auto select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Upper arch(s) */}
        {showPermanent && renderRow(permanentTop, 40)}
        {showPrimary && renderRow(primaryTop, 90)}
        {/* Lower arch(s) */}
        {showPrimary && renderRow(primaryBottom, 140)}
        {showPermanent && renderRow(permanentBottom, 190)}
        {/* Marquee overlay */}
        {marquee && (
          (() => {
            const x = Math.min(marquee.x1, marquee.x2);
            const y = Math.min(marquee.y1, marquee.y2);
            const w = Math.abs(marquee.x2 - marquee.x1);
            const h = Math.abs(marquee.y2 - marquee.y1);
            return (
              <g pointerEvents="none">
                <rect x={x} y={y} width={w} height={h} fill="#38bdf8" opacity="0.15" />
                <rect x={x} y={y} width={w} height={h} fill="none" stroke="#38bdf8" strokeDasharray="4 3" />
              </g>
            );
          })()
        )}
      </svg>
    </div>
  );
}

function ToothRect({ n, x, selected, fill, onClick }) {
  const stroke = selected ? '#0284c7' : '#cbd5e1';
  const strokeW = selected ? 3 : 2;
  const bg = fill || '#ffffff';
  return (
    <g transform={`translate(${x}, 0)`} className="cursor-pointer" onClick={onClick} data-tooth={String(n)}>
      <rect x="0" y="0" width="40" height="40" rx="8" ry="8" fill={bg} stroke={stroke} strokeWidth={strokeW} />
      <text x="20" y="-6" textAnchor="middle" fontSize="10" fill="#64748b">{n}</text>
    </g>
  );
}
