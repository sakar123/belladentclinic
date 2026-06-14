import React from 'react';

// Renders gingival margin (GM) and CAL as polylines across an arch.
// points input: [{ tooth: n, sites: [gm0, gm1, gm2] }] for upper buccal (or per side).
export function PerioChartLine({ width, height, data, color = '#334155', toothWidths = null }) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const w = width || 800;
  const h = height || 120;
  const margin = 12;
  const usableW = w - margin * 2;
  const usableH = h - margin * 2;

  // Flatten sites; 3 sites per tooth side, positions evenly spaced
  const flat = [];
  data.forEach((d) => {
    const three = Array.isArray(d.sites) ? d.sites.slice(0, 3) : [0, 0, 0];
    flat.push(...three);
  });
  const maxVal = Math.max(6, ...flat.map(v => Math.abs(Number(v) || 0)));
  let xPositions = [];
  if (Array.isArray(toothWidths) && toothWidths.length === data.length) {
    // Scale widths to usableW
    const total = toothWidths.reduce((a,b) => a + (Number(b)||0), 0) || 1;
    let cursor = margin;
    for (let i = 0; i < toothWidths.length; i++) {
      const wScaled = (Number(toothWidths[i]) || 0) / total * usableW;
      // place three sites across the tooth width (approx thirds)
      xPositions.push(cursor + wScaled * (1/6));
      xPositions.push(cursor + wScaled * (1/2));
      xPositions.push(cursor + wScaled * (5/6));
      cursor += wScaled;
    }
  } else {
    const xStep = usableW / (flat.length - 1 || 1);
    for (let i = 0; i < flat.length; i++) {
      xPositions.push(margin + i * xStep);
    }
  }
  const yBase = h / 2; // baseline; lower = crown direction
  const coef = (usableH / 2) / (maxVal || 1);

  const toPoints = (arr) => arr.map((v, i) => {
    const x = xPositions[i] ?? (margin + i);
    const y = yBase - (Number(v) || 0) * coef;
    return `${x},${y}`;
  }).join(' ');

  const path = toPoints(flat);
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={path} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  );
}
