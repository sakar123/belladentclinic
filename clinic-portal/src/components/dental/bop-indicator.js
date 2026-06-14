import React from 'react';

// Draw small droplets for BOP-positive sites
// bopSites: array of 6 booleans [DB, B, MB, ML, L, DL]
export function BopIndicator({ bopSites = [], width, height, isUpper }) {
  if (!Array.isArray(bopSites) || bopSites.every(v => !v)) return null;
  const w = width || 100;
  const h = height || 100;
  const positions = [12, 32, 52, 48, 68, 88]; // approx site x positions
  const cy = isUpper ? h * 0.22 : h * 0.78; // near root apex area
  return (
    <svg viewBox="0 0 100 100" style={{ position:'absolute', inset:0, zIndex:26, pointerEvents:'none' }}>
      {bopSites.map((b, i) => b ? (
        <g key={i} transform={`translate(${positions[i]}, ${cy})`}>
          <path d="M0,-3 C2,-3 3,-1.5 3,0 C3,1.8 1.8,3 0,3 C-1.8,3 -3,1.8 -3,0 C-3,-1.5 -2,-3 0,-3 Z" fill="#ef4444" opacity="0.8" />
        </g>
      ) : null)}
    </svg>
  );
}

