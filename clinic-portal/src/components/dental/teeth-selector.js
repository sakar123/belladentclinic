"use client";
import { useMemo, useRef, useState } from "react";
import DinoTooth from "./dino-tooth";

// A reusable teeth selector using high-fidelity DinoTooth sprites.
export default function TeethSelector({
  value = [],
  onChange,
  showPermanent = true,
  showPrimary = false,
  selectMode = 'multiple',
  toothStatuses = {}, // NEW: status map { number: code }
  className,
}) {
  // Universal numbering
  const permanentTop = useMemo(() => [1,2,3,4,5,6,7,8, 9,10,11,12,13,14,15,16], []);
  const permanentBottom = useMemo(() => [32,31,30,29,28,27,26,25, 24,23,22,21,20,19,18,17], []);
  
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

  function renderRow(list) {
    return (
      <div className="flex justify-center gap-1">
        {list.map((n) => (
          <DinoTooth
            key={n}
            number={n}
            selected={selectedSet.has(n)}
            status={toothStatuses[n] || 'HEALTHY'}
            onClick={() => toggle(n)}
            compact={true}
            scale={0.15}
            showTooltip={false}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-inner ${className}`}>
      <div className="flex flex-col gap-8">
        {showPermanent && (
          <>
            {renderRow(permanentTop)}
            {renderRow(permanentBottom)}
          </>
        )}
        
        {/* Note: Primary dentition logic can be added here mapping to DinoDent temporary sprites */}
        {showPrimary && (
          <div className="text-center text-[10px] text-slate-400 font-bold uppercase py-4 border-t border-dashed">
            Primary Dentition Reconstruction coming soon
          </div>
        )}
      </div>
    </div>
  );
}
