"use client";
import React, { useEffect } from 'react';

export function LayerInspector({ open, x, y, data, onClose }) {
  useEffect(() => {
    if (!open || !data) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, data, onClose]);

  if (!open || !data) return null;
  const layers = data.layers || [];

  return (
    <div
      style={{ position: 'fixed', top: y + 6, left: x + 6, zIndex: 9999 }}
      className="max-w-sm shadow-xl border border-slate-200 rounded bg-white text-slate-800 text-[11px] min-w-[240px]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-2 py-1.5 border-b border-slate-200 font-semibold bg-slate-50">Tooth #{data.number} • Layers</div>
      <div className="max-h-[300px] overflow-auto p-2">
        <div className="text-slate-500 mb-1">Texture col {data.metrics?.textureIdx} • xOff {Math.round(data.metrics?.xOffset||0)} • w {data.metrics?.width}</div>
        {layers.length === 0 ? (
          <div className="text-slate-500">No layer data.</div>
        ) : layers.map((l, i) => (
          <div key={i} className="border border-slate-100 rounded p-1.5 mb-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">{l.name || `Layer ${i+1}`}</div>
              <div className="text-slate-400">z{String(l.z ?? i)}</div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 text-slate-600 mt-1">
              <div>opacity: <span className="text-slate-800">{l.opacity ?? '—'}</span></div>
              <div>filter: <span className="text-slate-800">{l.filter || '—'}</span></div>
              <div>clip: <span className="text-slate-800">{l.clip || '—'}</span></div>
              <div>asset: <span className="text-slate-800 truncate">{l.asset || '—'}</span></div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end p-1.5 border-t border-slate-200 bg-slate-50">
        <button className="px-2 py-0.5 text-[11px] rounded border border-slate-200 hover:bg-slate-100" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
