"use client";
import React from 'react';

// Dev/debug overlay for a single DinoTooth instance
export function SpriteDebugOverlay({
  enabled,
  number,
  textureIdx,
  xOffset,
  width,
  height,
  scale,
  displayW,
  displayH,
  isUpper,
}) {
  if (!enabled) return null;
  const crownTop = displayH * (210 / 860);
  const crownH = displayH * (440 / 860);
  const labelBg = 'rgba(2, 6, 23, 0.8)';
  const textColor = '#e2e8f0';
  const box = (x, y, w, h, color, dash) => (
    <rect x={x} y={y} width={w} height={h} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray={dash ? '4 3' : 'none'} />
  );

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
      <svg width={displayW} height={displayH} viewBox={`0 0 ${displayW} ${displayH}`}>
        {/* Full tooth box (red) */}
        {box(0.75, 0.75, displayW - 1.5, displayH - 1.5, '#ef4444')}
        {/* Crown band (green) */}
        {box(1.5, crownTop, displayW - 3, crownH, '#22c55e', true)}
        {/* Roots region (blue) — approximate top/bottom halves */}
        {isUpper ? box(1.5, 0, displayW - 3, crownTop - 2, '#60a5fa', true) : box(1.5, crownTop + crownH + 2, displayW - 3, displayH - (crownTop + crownH) - 3, '#60a5fa', true)}
      </svg>
      {/* Column label and atlas coords */}
      <div style={{ position: 'absolute', top: -10, left: 0, pointerEvents: 'none' }}>
        <span style={{
          background: labelBg,
          color: textColor,
          fontSize: 10,
          padding: '2px 4px',
          borderRadius: 3,
          border: '1px solid rgba(148,163,184,0.2)'
        }}>col {textureIdx} • xOff {Math.round(xOffset)} • w {width} • s {scale}</span>
      </div>
    </div>
  );
}

