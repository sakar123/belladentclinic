"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { http } from "../../lib/http";
import DinoTooth from "./dino-tooth";

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
  const [toothStatuses, setToothStatuses] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [activeStatuses, setActiveStatuses] = useState(new Set());
  const [legendOpen, setLegendOpen] = useState(true);
  const [zoom, setZoom] = useState(1.0);
  const containerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [teeth, statuses] = await Promise.all([
          http.get(`/api/Teeth`, { params: { patientId } }).catch(() => []),
          http.get(`/api/lookup/tooth-status`).catch(() => []),
        ]);
        const idToCode = {};
        (statuses || []).forEach((s) => {
          idToCode[s.id] = s.code || s.name || s.value;
        });
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
            color: s.color || '#3b82f6',
          };
        });
        setStatusMap(sm);
      } catch (e) {
        setToothStatuses({});
        setStatusMap({});
      }
    })();
  }, [patientId]);

  const teethArches = useMemo(() => {
    // Universal 1-32 mapping
    // Top: 1 (UR8) -> 16 (UL8)
    const top = Array.from({ length: 16 }, (_, i) => i + 1); 
    // Bottom: 32 (LR8) -> 17 (LL8) to align vertically (8 over 8)
    const bottom = Array.from({ length: 16 }, (_, i) => 32 - i);
    return { top, bottom };
  }, []);

  const isDimmed = (num) => {
    if (!activeStatuses || activeStatuses.size === 0) return false;
    const code = toothStatuses[num];
    if (!code) return true;
    return !activeStatuses.has(String(code));
  };

  const handleToothClick = (n) => {
    if (selectMode === 'multiple') {
      const curr = new Set(Array.isArray(selectedTeeth) ? selectedTeeth : []);
      if (curr.has(n)) curr.delete(n); else curr.add(n);
      onSelectionChange?.(Array.from(curr));
    } else {
      onSelect?.(n);
    }
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(prev => Math.min(Math.max(prev + delta, 0.4), 3));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === ']') setZoom(prev => Math.min(prev + 0.1, 3));
      else if (e.key === '[') setZoom(prev => Math.max(prev - 0.1, 0.4));
      else if (e.key === '\\') setZoom(1.0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className={`flex flex-col items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-2xl ${className}`}
      onWheel={handleWheel}
      ref={containerRef}
    >
      {/* Header with Zoom Controls */}
      <div className="w-full flex justify-between items-end mb-10 px-10 border-b border-slate-100 pb-8">
        <div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic">DinoChart<span className="text-blue-600 font-light not-italic">Pro</span></h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">Clinical Anatomical Reconstruction Engine</p>
        </div>
        
        <div className="flex items-center gap-12 bg-slate-50 p-6 rounded-[2rem] border border-slate-200/60 shadow-inner">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Magnification</span>
              <span className="text-sm font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{Math.round(zoom * 100)}%</span>
            </div>
            <input 
              type="range" min="0.4" max="3" step="0.1" value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-64 h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <button 
            onClick={() => setZoom(1.0)} 
            className="h-12 px-8 bg-white border-2 border-slate-200 rounded-2xl shadow-sm text-[10px] tracking-widest font-black uppercase hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Chart Viewport */}
      <div className="w-full overflow-auto bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-[inset_0_0_60px_rgba(0,0,0,0.5)] relative group" style={{ height: "1000px" }}>
        {/* Anatomical Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-1/2 left-0 w-full h-px bg-white" />
          <div className="absolute top-0 left-1/2 w-px h-full bg-white" />
        </div>

        <div 
          className="transition-all duration-500 ease-in-out flex flex-col items-center justify-center min-w-max min-h-full py-40 px-60"
          style={{ 
            zoom: zoom,
            gap: "120px" 
          }}
        >
          {/* Upper Arch (1-16) */}
          <div className="flex justify-center gap-4">
            {teethArches.top.map((n) => (
              <DinoTooth
                key={n}
                number={n}
                selected={(Array.isArray(selectedTeeth) && selectedTeeth.includes(n)) || selectedTooth === n}
                status={toothStatuses[n]}
                dimmed={isDimmed(n)}
                onClick={() => handleToothClick(n)}
                scale={0.35} // Larger default scale for the pro chart
              />
            ))}
          </div>

          {/* Lower Arch (32-17) */}
          <div className="flex justify-center gap-4">
            {teethArches.bottom.map((n) => (
              <DinoTooth
                key={n}
                number={n}
                selected={(Array.isArray(selectedTeeth) && selectedTeeth.includes(n)) || selectedTooth === n}
                status={toothStatuses[n]}
                dimmed={isDimmed(n)}
                onClick={() => handleToothClick(n)}
                scale={0.35}
              />
            ))}
          </div>
        </div>

        {/* Floating Tooltip/Hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Anatomical View • Use <span className="text-blue-400 mx-1">[ ]</span> to zoom • Click teeth to select
        </div>
      </div>

      {/* Legend & Filters */}
      {showLegend && (
        <div className="mt-12 w-full px-10">
          <div className="flex flex-wrap gap-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200/60 shadow-inner">
          {Object.entries(statusMap).map(([code, info]) => {
            const active = activeStatuses.has(String(code));
            const count = Object.values(toothStatuses).filter((c) => String(c) === String(code)).length;
            return (
              <button
                type="button" key={code}
                onClick={() => setActiveStatuses(prev => {
                  const next = new Set(prev);
                  if (next.has(code)) next.delete(code); else next.add(code);
                  return next;
                })}
                className={`inline-flex items-center gap-4 px-6 py-3 rounded-2xl border text-xs font-black tracking-tighter uppercase transition-all ${active ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-105' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 shadow-sm'}`}
              >
                <span className={`size-3 rounded-full ${active ? 'bg-white' : ''}`} style={active ? {} : { backgroundColor: info.color }} />
                <span>{info.label}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] ${active ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{count}</span>
              </button>
            );
          })}
          {Object.keys(statusMap).length > 0 && (
            <button type="button" className="ml-auto text-[10px] font-black text-blue-600 hover:underline px-6 uppercase tracking-tighter" onClick={() => setActiveStatuses(new Set())}>
              Clear Workspace
            </button>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeToUniversal(nRaw) {
  const n = Number(nRaw);
  if (!Number.isFinite(n)) return undefined;
  if (n <= 32) return n; 
  const q = Math.floor(n / 10);
  const t = n % 10;
  if (q === 1) return 9 - t;        
  if (q === 2) return 8 + t;        
  if (q === 3) return 25 - t;       
  if (q === 4) return 24 + t;       
  return undefined;
}
