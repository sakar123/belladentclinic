import React from 'react';
import { DINO_ASSETS } from './dinodent-config';
import { TREATMENT_CUES, getCueColor } from './treatment-cues-config';

/**
 * SVG treatment overlays rendered on top of tooth sprites.
 * Positioning matches QDento crown/root areas:
 *   Crown area: roughly 24%-75% of tooth height (from crown to CEJ)
 *   Root area: roughly 0%-40% for upper, 60%-100% for lower
 *   Buccal surface: ~55-65% of height (upper), ~35-45% (lower)
 */
export function TreatmentOverlay({ annotations, width, height, isUpper, toothNumber, isMolar }) {
  if (!annotations || annotations.length === 0) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {annotations.map((ann, idx) => {
        const cue = TREATMENT_CUES[ann.cueCode];
        if (!cue) return null;
        const color = getCueColor(cue, ann.status);

        switch (cue.type) {
          case 'surface-fill':
            return <SurfaceFill key={idx} surfaces={ann.surfaces} color={color} isUpper={isUpper} isMolar={isMolar} />;
          case 'bracket':
            return <Bracket key={idx} color={color} isUpper={isUpper} status={ann.status} />;
          case 'wire':
            return <RetainerWire key={idx} color={color} isUpper={isUpper} status={ann.status} />;
          case 'x-mark':
            return <XMark key={idx} color={color} />;
          case 'outline':
            return <CrownOutline key={idx} color={color} isUpper={isUpper} status={ann.status} />;
          case 'line':
            return <RootCanalLine key={idx} color={color} isUpper={isUpper} status={ann.status} />;
          case 'dot':
            return <SealantDot key={idx} color={color} isUpper={isUpper} />;
          case 'screw':
            return <ImplantScrew key={idx} color={color} isUpper={isUpper} />;
          case 'post':
            return <RootPost key={idx} color={color} isUpper={isUpper} status={ann.status} />;
          case 'front-surface':
            return <VeneerSurface key={idx} color={color} isUpper={isUpper} />;
          case 'apex-blob':
            return <ApicalLesion key={idx} color={color} isUpper={isUpper} />;
          case 'pulp-chamber':
            return <PulpChamber key={idx} color={color} isUpper={isUpper} />;
          case 'cervical-dots':
            return <CervicalDots key={idx} color={color} isUpper={isUpper} />;
          case 'splint':
            return <SplintBand key={idx} color={color} isUpper={isUpper} status={ann.status} />;
          default:
            return null;
        }
      })}
    </svg>
  );
}

// (removed duplicate early definitions of RootPost/ApicalLesion/PulpChamber/CervicalDots)

/**
 * 5-surface filling diagram — positioned in the crown area.
 * Uses QDento-style surface regions: center (O), top (B), bottom (L), left (D), right (M)
 */
function SurfaceFill({ surfaces, color, isUpper, isMolar, surfaceColors }) {
  const s = (surfaces || '').toUpperCase();
  // Crown center: upper teeth ~68%, lower teeth ~32%
  const crownY = isUpper ? 68 : 32;
  const sz = isMolar ? 40 : 34;
  const x = 50 - sz / 2;
  const y = crownY - sz / 2;

  // Support per-surface color map and optional stripe pattern
  const colors = surfaceColors && typeof surfaceColors === 'object' ? surfaceColors : null;
  const stripeId = `stripePattern-${isUpper ? 'u' : 'l'}-${Math.round(sz)}`;
  const fillVal = (surf) => {
    if (colors) {
      const v = colors[surf];
      if (v === 'stripe') return `url(#${stripeId})`;
      if (typeof v === 'string') return v;
    }
    return color;
  };

  return (
    <g transform={`translate(${x}, ${y})`}>
      <defs>
        <pattern id={stripeId} patternUnits="userSpaceOnUse" width="8" height="8">
          <image href={DINO_ASSETS.stripes} x="0" y="0" width="8" height="8" />
        </pattern>
      </defs>
      <rect width={sz} height={sz} fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="0.8" rx="1" />
      {/* O — center */}
      <rect x={sz*0.3} y={sz*0.3} width={sz*0.4} height={sz*0.4}
        fill={s.includes('O') ? fillVal('O') : 'none'} stroke={s.includes('O') ? 'none' : 'rgba(148,163,184,0.3)'} strokeWidth="0.5" />
      {/* M — right */}
      <polygon points={`${sz*0.7},${sz*0.3} ${sz},0 ${sz},${sz} ${sz*0.7},${sz*0.7}`}
        fill={s.includes('M') ? fillVal('M') : 'none'} stroke={s.includes('M') ? 'none' : 'rgba(148,163,184,0.3)'} strokeWidth="0.5" />
      {/* D — left */}
      <polygon points={`0,0 ${sz*0.3},${sz*0.3} ${sz*0.3},${sz*0.7} 0,${sz}`}
        fill={s.includes('D') ? fillVal('D') : 'none'} stroke={s.includes('D') ? 'none' : 'rgba(148,163,184,0.3)'} strokeWidth="0.5" />
      {/* B — top */}
      <polygon points={`0,0 ${sz},0 ${sz*0.7},${sz*0.3} ${sz*0.3},${sz*0.3}`}
        fill={s.includes('B') ? fillVal('B') : 'none'} stroke={s.includes('B') ? 'none' : 'rgba(148,163,184,0.3)'} strokeWidth="0.5" />
      {/* L — bottom */}
      <polygon points={`0,${sz} ${sz*0.3},${sz*0.7} ${sz*0.7},${sz*0.7} ${sz},${sz}`}
        fill={s.includes('L') ? fillVal('L') : 'none'} stroke={s.includes('L') ? 'none' : 'rgba(148,163,184,0.3)'} strokeWidth="0.5" />
    </g>
  );
}

/**
 * Bracket — metallic rectangle on buccal surface.
 * QDento: bracket on buccal surface with slot detail.
 * Buccal position: upper ~58%, lower ~42%
 */
function Bracket({ color, isUpper, status }) {
  const y = isUpper ? 56 : 38;
  const isCompleted = status === 'Completed';
  const bw = 26;
  const bh = 14;
  const bx = 50 - bw / 2;

  return (
    <g transform={`translate(${bx}, ${y - bh/2})`}>
      {isCompleted && (
        <defs>
          <linearGradient id={`bracketGrad-${y}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d1d5db" />
            <stop offset="40%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>
        </defs>
      )}
      <rect
        width={bw} height={bh} rx="1.5"
        fill={isCompleted ? `url(#bracketGrad-${y})` : color}
        stroke={isCompleted ? '#6b7280' : 'none'}
        strokeWidth="0.8"
      />
      {/* Slot line */}
      <line x1="3" y1={bh/2} x2={bw-3} y2={bh/2}
        stroke={isCompleted ? '#4b5563' : 'rgba(255,255,255,0.4)'}
        strokeWidth="1.5" />
      {/* Wing lines */}
      <line x1={bw*0.2} y1="2" x2={bw*0.2} y2={bh-2} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
      <line x1={bw*0.8} y1="2" x2={bw*0.8} y2={bh-2} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
    </g>
  );
}

/**
 * Retainer wire — thin wire on lingual surface.
 * Lingual position: upper ~72%, lower ~28%
 */
function RetainerWire({ color, isUpper, status }) {
  const y = isUpper ? 73 : 27;
  const isPlanned = status !== 'Completed';

  return (
    <line
      x1="5" y1={y} x2="95" y2={y}
      stroke={color}
      strokeWidth="2"
      strokeDasharray={isPlanned ? '3 2' : 'none'}
      strokeLinecap="round"
    />
  );
}

function XMark({ color }) {
  return (
    <g stroke={color} strokeWidth="6" strokeLinecap="round" opacity="0.8">
      <line x1="25" y1="25" x2="75" y2="75" />
      <line x1="75" y1="25" x2="25" y2="75" />
    </g>
  );
}

/**
 * Crown outline — dashed outline around crown area (planned only).
 * Crown area is roughly the middle band of the tooth.
 */
function CrownOutline({ color, isUpper, status }) {
  // Crown region: upper ~52-82%, lower ~18-48%
  const top = isUpper ? 52 : 18;
  const bot = isUpper ? 82 : 48;
  const isCompleted = status === 'Completed';

  return (
    <rect
      x="12" y={top} width="76" height={bot - top}
      fill={isCompleted ? color : "none"}
      fillOpacity={isCompleted ? "0.22" : undefined}
      stroke={color}
      strokeWidth={isCompleted ? "3" : "2.5"}
      strokeDasharray={isCompleted ? undefined : "4 2"}
      rx="4"
    />
  );
}

/**
 * Root canal line — vertical line through root canal (planned only).
 * Root area: upper ~5-50%, lower ~50-95%
 */
function RootCanalLine({ color, isUpper, status }) {
  if (status === 'Completed') return null;
  const y1 = isUpper ? 8 : 55;
  const y2 = isUpper ? 50 : 92;

  return (
    <line
      x1="50" y1={y1} x2="50" y2={y2}
      stroke={color} strokeWidth="3"
      strokeDasharray="4 2" strokeLinecap="round"
    />
  );
}

// Metallic post in root canal
function RootPost({ color, isUpper, status }) {
  const y1 = isUpper ? 10 : 55;
  const y2 = isUpper ? 50 : 90;
  const gradId = `postGrad-${isUpper ? 'u' : 'l'}`;
  const planned = status !== 'Completed';
  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d1d5db" />
          <stop offset="50%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#6b7280" />
        </linearGradient>
      </defs>
      <rect x="47" y={y1} width="6" height={y2 - y1} rx="2" fill={planned ? color : `url(#${gradId})`} opacity="0.9" />
    </g>
  );
}

// Red blob at apex area
function ApicalLesion({ color, isUpper }) {
  const cy = isUpper ? 18 : 82;
  return <circle cx="50" cy={cy} r="6" fill={color} opacity="0.7" />;
}

// Red pulp chamber fill
function PulpChamber({ color, isUpper }) {
  const y = isUpper ? 66 : 34;
  return <rect x="44" y={y - 5} width="12" height="10" rx="2" fill={color} opacity="0.7" />;
}

// Dots along cervical line
function CervicalDots({ color, isUpper }) {
  const y = isUpper ? 58 : 42;
  const xs = [30, 38, 46, 54, 62, 70];
  return (
    <g>
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill={color} opacity="0.9" />
      ))}
    </g>
  );
}

// Adhesive splint band across buccal surface
function SplintBand({ color, isUpper, status }) {
  const y = isUpper ? 60 : 40; // buccal mid band
  const planned = status !== 'Completed';
  return (
    <rect x="8" y={y - 2} width="84" height="4" rx="2" fill={color} opacity={planned ? 0.6 : 0.9} />
  );
}

/**
 * Sealant dot on occlusal surface.
 * Occlusal: upper ~75%, lower ~25%
 */
function SealantDot({ color, isUpper }) {
  const y = isUpper ? 75 : 25;
  return (
    <circle cx="50" cy={y} r="6" fill={color} opacity="0.75" />
  );
}

/**
 * Implant screw in root area.
 */
function ImplantScrew({ color, isUpper }) {
  const cy = isUpper ? 22 : 78;
  const h = 24;
  const w = 14;
  const x = 50 - w / 2;
  const y = cy - h / 2;

  return (
    <g transform={`translate(${x}, ${y})`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      {/* Screw body */}
      <rect x="2" y="0" width={w-4} height={h} rx="2" />
      {/* Thread lines */}
      <line x1="0" y1={h*0.2} x2={w} y2={h*0.2} />
      <line x1="0" y1={h*0.4} x2={w} y2={h*0.4} />
      <line x1="0" y1={h*0.6} x2={w} y2={h*0.6} />
      <line x1="0" y1={h*0.8} x2={w} y2={h*0.8} />
      {/* Point */}
      <line x1={w/2 - 2} y1={h} x2={w/2} y2={h + 4} />
      <line x1={w/2 + 2} y1={h} x2={w/2} y2={h + 4} />
    </g>
  );
}

/**
 * Veneer surface highlight on buccal (front) surface.
 */
function VeneerSurface({ color, isUpper }) {
  const top = isUpper ? 50 : 22;
  const h = 28;

  return (
    <rect
      x="20" y={top} width="60" height={h}
      fill={color} opacity="0.35" rx="3"
    />
  );
}
