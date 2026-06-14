import React from 'react';

// Interactive 5-surface tooth diagram for selecting filling surfaces
export function SurfaceSelector({ value = '', onChange }) {
  const surfaces = value.toUpperCase();
  
  const toggleSurface = (s) => {
    if (surfaces.includes(s)) {
      onChange(surfaces.replace(s, ''));
    } else {
      // Keep order M O D B L if we want, but string is fine
      onChange(surfaces + s);
    }
  };

  const isSel = (s) => surfaces.includes(s);
  const selFill = '#3b82f6';
  const unselFill = 'transparent';
  const hoverFill = '#bfdbfe';

  const size = 120;
  const padding = 10;
  const sSize = size - padding * 2;
  const third = sSize / 3;

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <p className="text-sm font-medium mb-2 text-slate-700">Select Surfaces</p>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="cursor-pointer">
        <g transform={`translate(${padding}, ${padding})`}>
          {/* Base rect */}
          <rect width={sSize} height={sSize} fill="none" stroke="#cbd5e1" strokeWidth="2" rx="4" />
          
          {/* Occlusal (O) - Center */}
          <rect 
            x={third} y={third} width={third} height={third} 
            fill={isSel('O') ? selFill : unselFill} 
            stroke="#94a3b8" strokeWidth="2"
            onClick={() => toggleSurface('O')}
            className="hover:fill-blue-200 transition-colors"
          />
          <text x={sSize/2} y={sSize/2} textAnchor="middle" dominantBaseline="middle" fill={isSel('O') ? 'white' : '#64748b'} className="text-xs font-bold pointer-events-none">O</text>

          {/* Buccal (B) - Top */}
          <polygon 
            points={`0,0 ${sSize},0 ${third*2},${third} ${third},${third}`} 
            fill={isSel('B') ? selFill : unselFill} 
            stroke="#94a3b8" strokeWidth="2"
            onClick={() => toggleSurface('B')}
            className="hover:fill-blue-200 transition-colors"
          />
          <text x={sSize/2} y={third/2} textAnchor="middle" dominantBaseline="middle" fill={isSel('B') ? 'white' : '#64748b'} className="text-xs font-bold pointer-events-none">B</text>

          {/* Lingual (L) - Bottom */}
          <polygon 
            points={`0,${sSize} ${third},${third*2} ${third*2},${third*2} ${sSize},${sSize}`} 
            fill={isSel('L') ? selFill : unselFill} 
            stroke="#94a3b8" strokeWidth="2"
            onClick={() => toggleSurface('L')}
            className="hover:fill-blue-200 transition-colors"
          />
          <text x={sSize/2} y={sSize - third/2} textAnchor="middle" dominantBaseline="middle" fill={isSel('L') ? 'white' : '#64748b'} className="text-xs font-bold pointer-events-none">L</text>

          {/* Distal (D) - Left */}
          <polygon 
            points={`0,0 ${third},${third} ${third},${third*2} 0,${sSize}`} 
            fill={isSel('D') ? selFill : unselFill} 
            stroke="#94a3b8" strokeWidth="2"
            onClick={() => toggleSurface('D')}
            className="hover:fill-blue-200 transition-colors"
          />
          <text x={third/2} y={sSize/2} textAnchor="middle" dominantBaseline="middle" fill={isSel('D') ? 'white' : '#64748b'} className="text-xs font-bold pointer-events-none">D</text>

          {/* Mesial (M) - Right */}
          <polygon 
            points={`${sSize},0 ${sSize},${sSize} ${third*2},${third*2} ${third*2},${third}`} 
            fill={isSel('M') ? selFill : unselFill} 
            stroke="#94a3b8" strokeWidth="2"
            onClick={() => toggleSurface('M')}
            className="hover:fill-blue-200 transition-colors"
          />
          <text x={sSize - third/2} y={sSize/2} textAnchor="middle" dominantBaseline="middle" fill={isSel('M') ? 'white' : '#64748b'} className="text-xs font-bold pointer-events-none">M</text>

          {/* Cervical (C) - Thin strip below box */}
          <rect
            x={10} y={sSize + 6} width={sSize - 20} height={8}
            fill={isSel('C') ? selFill : unselFill}
            stroke="#94a3b8" strokeWidth="2"
            onClick={() => toggleSurface('C')}
            className="hover:fill-blue-200 transition-colors"
          />
          <text x={sSize/2} y={sSize + 10} textAnchor="middle" dominantBaseline="middle" fill={isSel('C') ? 'white' : '#64748b'} className="text-[10px] font-bold pointer-events-none">C</text>
        </g>
      </svg>
      <div className="mt-2 text-xs text-slate-500 min-h-[16px]">
        {surfaces ? `Selected: ${surfaces}` : 'Click surfaces to select'}
      </div>
    </div>
  );
}
