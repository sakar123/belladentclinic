"use client";
import React, { useCallback, useMemo, useState, memo } from 'react';
import { getToothConfig, getImplantConfig, DINO_ASSETS, resolveCondition } from './dinodent-config';
import { getAdultToothName } from './tooth-data';
import { TreatmentOverlay } from './treatment-overlay';
import { InteractiveSurfaceMatrix } from './interactive-surface-matrix';
import { BridgeConnector } from './bridge-connector';
import { SplintRenderer } from './splint-renderer';
import { BopIndicator } from './bop-indicator';
import { SpriteDebugOverlay } from './sprite-debug-overlay';

const MOLAR_TEXTURE_INDICES = new Set([0, 1, 2, 8, 9, 10]);
const FALLBACK_TOOTH_CONFIG = {
  xOffset: 0,
  width: 120,
  height: 860,
  isUpper: true,
  shouldFlipX: false,
  textureIdx: -1,
};

/**
 * DinoTooth — multi-layered anatomical tooth renderer.
 *
 * Compositing order matches QDento ToothPainter.cpp getToothPixmap():
 * 1. Base tooth (or implant base)
 * 2. Roots (unless hidden)
 * 3. Lesion overlay        @ layerOpacity (QDento: 0.3)
 * 4. Endo / root canal     @ layerOpacity (QDento: 0.3) + color filter
 * 5. Surface overlays      @ layerOpacity (QDento: 0.35)
 * 6. Crown overlay         @ layerOpacity (QDento: 0.8)
 * 7. Bridge connector bars
 * 8. Treatment annotations (SVG)
 */
function DinoTooth({
  number,
  status = 'HEALTHY',
  annotations = [],
  selected,
  onClick,
  dimmed,
  label,
  className = "",
  compact = false,
  scale = 0.25,
  showTooltip = undefined,
  bridgeLeft = false,
  bridgeRight = false,
  // New v2 props (safe defaults)
  perioActive = false,
  bridgePosition = null,    // 'begin' | 'center' | 'end'
  splintPosition = null,    // 'begin' | 'center' | 'end'
  surfaceStates = null,     // { M: {fill, outline}, D: {...}, ... }
  bopSites = null,          // [DB,B,MB,ML,L,DL]
  debugMode = false,
  onDebugContext = undefined,
  interactiveSurfaces = false,
  selectedSurfaces = [],
  onSurfaceClick = undefined,
  mobilityGrade = 0,
  furcationGrade = 0,
}) {
  const [hovered, setHovered] = useState(false);
  const config = getToothConfig(number);
  const safeConfig = config || FALLBACK_TOOTH_CONFIG;
  const { xOffset, width, height, isUpper, shouldFlipX, textureIdx } = safeConfig;
  const isMolar = useMemo(() => MOLAR_TEXTURE_INDICES.has(textureIdx), [textureIdx]);
  const displayW = width * scale;
  const displayH = height * scale;

  const style = useMemo(() => resolveCondition(status), [status]);
  const conditionKey = typeof status === 'string' ? status.toUpperCase().trim() : '';
  const isImplantBase = style.useImplantBase === true;
  const hideRoots = style.hideRoots === true;
  const tooltipEnabled = showTooltip !== undefined ? showTooltip : !compact;
  const implantConfig = getImplantConfig(isMolar, conditionKey);

  const baseTransform = useMemo(() =>
    [isUpper ? 'rotate(180deg)' : '', shouldFlipX ? 'scaleX(-1)' : ''].filter(Boolean).join(' '),
    [isUpper, shouldFlipX]
  );

  const baseOpacity = style.opacity ?? 1;

  const makeLayerStyle = useCallback((assetPath, customX = xOffset, customW = width, filter, extra = {}) => ({
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${assetPath})`,
    backgroundPosition: `-${customX * scale}px 0px`,
    backgroundSize: 'auto 100%',
    width: customW * scale,
    height: displayH,
    transform: baseTransform,
    filter: filter || undefined,
    ...extra,
  }), [xOffset, width, scale, displayH, baseTransform]);

  // ── Build layers in QDento-inspired compositing order (memoized) ──
  const { layers, debugLayers, overlays } = useMemo(() => {
    const layers = [];
    const debugLayers = [];

    // 1) Splint behind (if splintPosition provided)
    if (splintPosition && DINO_ASSETS.fiberBridge) {
      layers.push(
        <div key="splint-behind" style={makeLayerStyle(DINO_ASSETS.fiberBridge, xOffset, width, undefined, { opacity: 0.3 })} />
      );
      debugLayers.push({ z: layers.length, name: 'splint-behind', opacity: 0.3 });
    }

    const conditionLayers = style.layers || [];

    // 2) Base tooth or implant base. Status opacity applies to anatomy only,
    // so overlays such as missing/extracted marks remain readable.
    if (isImplantBase) {
      layers.push(
        <div key="base-impl" style={{ ...makeLayerStyle(DINO_ASSETS.common, implantConfig.xOffset, implantConfig.width), opacity: baseOpacity }} />
      );
      debugLayers.push({ z: layers.length, name: 'base-impl', asset: 'common', opacity: baseOpacity });
    } else {
      layers.push(
        <div key="base" style={{ ...makeLayerStyle(DINO_ASSETS.teeth, xOffset, width, style.toothFilter), opacity: baseOpacity }} />
      );
      debugLayers.push({ z: layers.length, name: 'base-tooth', asset: 'teeth', filter: style.toothFilter, opacity: baseOpacity });
    }

    // Roots (if visible)
    if (!isImplantBase && !hideRoots) {
      layers.push(<div key="roots" style={{ ...makeLayerStyle(DINO_ASSETS.roots), opacity: baseOpacity }} />);
      debugLayers.push({ z: layers.length, name: 'roots', asset: 'roots', opacity: baseOpacity });
    }

    // 3) Lesion/perio/calculus overlays must sit above the tooth anatomy.
    if (conditionLayers.includes('lesion') && DINO_ASSETS.lesion) {
      layers.push(
        <div key="lesion" style={{ ...makeLayerStyle(DINO_ASSETS.lesion, xOffset, width), opacity: style.layerOpacity ?? 0.3 }} />
      );
      debugLayers.push({ z: layers.length, name: 'lesion', opacity: style.layerOpacity ?? 0.3, asset: 'lesion' });
    }

    if (perioActive && DINO_ASSETS.perio) {
      layers.push(<div key="perio" style={makeLayerStyle(DINO_ASSETS.perio)} />);
      debugLayers.push({ z: layers.length, name: 'perio', asset: 'perio' });
    }

    if (conditionKey === 'CALCULUS' && DINO_ASSETS.calculus) {
      layers.push(<div key="calculus" style={{ ...makeLayerStyle(DINO_ASSETS.calculus), opacity: 0.9 }} />);
      debugLayers.push({ z: layers.length, name: 'calculus', opacity: 0.9, asset: 'calculus' });
    }

    // 6) Resorption overlay
    if (conditionKey === 'RESORPTION' && DINO_ASSETS.resorption) {
      layers.push(<div key="resorption" style={makeLayerStyle(DINO_ASSETS.resorption)} />);
      debugLayers.push({ z: layers.length, name: 'resorption', asset: 'resorption' });
    }

    // 7) Endo overlay (with tint)
    if (conditionLayers.includes('endo') && DINO_ASSETS.endo) {
      layers.push(
        <div key="endo" style={{ ...makeLayerStyle(DINO_ASSETS.endo), opacity: 0.3, filter: style.filter }} />
      );
      debugLayers.push({ z: layers.length, name: 'endo', opacity: 0.3, filter: style.filter, asset: 'endo' });
    }

    // 8) Post sprite (replaces old SVG post)
    if (conditionKey === 'POST' && DINO_ASSETS.post) {
      layers.push(
        <div key="post" style={{ ...makeLayerStyle(DINO_ASSETS.post), opacity: 0.5, filter: 'hue-rotate(190deg) saturate(1.4)' }} />
      );
      debugLayers.push({ z: layers.length, name: 'post', opacity: 0.5, filter: 'hue-rotate(190deg) saturate(1.4)', asset: 'post' });
    }

    // BOP droplets near apex per site
    if (bopSites && Array.isArray(bopSites) && bopSites.some(Boolean)) {
      layers.push(
        <BopIndicator key="bop" bopSites={bopSites} width={displayW} height={displayH} isUpper={isUpper} />
      );
    }

    // Cervical bands for BOP on buccal/lingual groups
    if (bopSites && Array.isArray(bopSites)) {
      const hasBuc = !!(bopSites[0] || bopSites[1] || bopSites[2]);
      const hasLing = !!(bopSites[3] || bopSites[4] || bopSites[5]);
      const band = (y) => (
        <svg key={`bop-band-${y}`} viewBox="0 0 100 100" style={{ position:'absolute', inset:0, zIndex:18, pointerEvents:'none' }}>
          <rect x="10" y={y-1} width="80" height="4" fill="#ef4444" opacity="0.2" />
        </svg>
      );
      if (hasBuc) layers.push(band(isUpper ? 58 : 42));
      if (hasLing) layers.push(band(isUpper ? 42 : 58));
    }

    // 9) Surface overlays — occlusal, approximal, buccal, lingual, cervical
    const SURFACE_LAYER_ORDER = ['occlusal', 'approximal', 'buccal', 'lingual', 'cervical'];
    for (const kind of SURFACE_LAYER_ORDER) {
      if (!conditionLayers.includes(kind)) continue;
      const asset = DINO_ASSETS[kind];
      if (!asset) continue;
      layers.push(
        <div key={`surface-${kind}`} style={{ ...makeLayerStyle(asset, xOffset, width), opacity: style.layerOpacity ?? 0.35 }} />
      );
      debugLayers.push({ z: layers.length, name: `surface-${kind}`, opacity: style.layerOpacity ?? 0.35, asset: kind });
    }

    // 10) Crown/prosthetic (front)
    if (conditionLayers.includes('crown') && DINO_ASSETS.crown) {
      layers.push(
        <div key={`crown`} style={{ ...makeLayerStyle(DINO_ASSETS.crown, xOffset, width), opacity: style.layerOpacity ?? 0.8 }} />
      );
      debugLayers.push({ z: layers.length, name: 'crown', opacity: style.layerOpacity ?? 0.8, asset: 'crown' });
    }

    // Denture crown (false tooth) when DENTURE — overlay crown area
    if (conditionKey === 'DENTURE' && DINO_ASSETS.falseTooth) {
      const crownTop = displayH * (210 / 860);
      const crownH = displayH * (440 / 860);
      layers.push(
        <div key="false-crown" style={{
          ...makeLayerStyle(DINO_ASSETS.falseTooth, xOffset, width),
          clipPath: `inset(${crownTop}px 0 ${displayH - crownTop - crownH}px 0)`,
          opacity: 0.9,
        }} />
      );
    }

    // Splint front crown overlay (after crown)
    if (splintPosition && DINO_ASSETS.fiberBridge) {
      layers.push(
        <SplintRenderer key="splint-front" mode="front" xOffset={xOffset} width={width} displayH={displayH} scale={scale} baseTransform={baseTransform} />
      );
      debugLayers.push({ z: layers.length, name: 'splint-front' });
    }

    // 11) Bridge connectors — sprite-based when assets available; gradient fallback otherwise
    if (style.bridgeConnector && bridgePosition && DINO_ASSETS.bridgeCon && DINO_ASSETS.bridgeSep) {
      layers.push(
        <BridgeConnector
          key="bridge-connector"
          position={bridgePosition}
          xOffset={xOffset}
          width={width}
          displayH={displayH}
          scale={scale}
          baseTransform={baseTransform}
        />
      );
      debugLayers.push({ z: layers.length, name: `bridge-${bridgePosition}` });
    } else if (style.bridgeConnector && (bridgeLeft || bridgeRight)) {
      const barH = Math.max(6, displayH * 0.035);
      const barY = isUpper ? displayH * 0.62 : displayH * 0.32;
      const barW = displayW * 0.65;
      const barStyle = {
        position: 'absolute',
        height: barH,
        borderRadius: barH / 2,
        background: 'linear-gradient(180deg, #d4a44a 0%, #b8860b 40%, #96700a 100%)',
        opacity: 0.85,
        zIndex: 3,
      };
      if (bridgeLeft) layers.push(<div key="bridge-l" style={{ ...barStyle, top: barY, left: -barW * 0.55, width: barW }} />);
      if (bridgeRight) layers.push(<div key="bridge-r" style={{ ...barStyle, top: barY, right: -barW * 0.55, width: barW }} />);
      debugLayers.push({ z: layers.length, name: 'bridge-fallback', opacity: 0.85 });
    }

    // Abscess root glow (visual cue)
    if (style.rootGlow) {
      layers.push(
        <div key="root-glow" style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: displayH * 0.4,
          background: 'radial-gradient(ellipse at 50% 85%, rgba(220,38,38,0.45) 0%, transparent 55%)',
          transform: baseTransform, pointerEvents: 'none',
        }} />
      );
    }

    // SVG overlays retained: IMPLANT screw, PULPITIS chamber, APICAL_LESION blob, ROOT mask
    const overlays = [];
    if (conditionKey === 'IMPLANT') {
      const cy = isUpper ? 22 : 78;
      const h = 26; const w = 14; const x = 50 - w/2; const y = cy - h/2;
      overlays.push(
        <svg key="impl-screw" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
          <g transform={`translate(${x}, ${y})`} fill="none" stroke="#0ea5e9" strokeWidth="1.7" strokeLinecap="round">
            <rect x="2" y="0" width={w-4} height={h} rx="2" />
            <line x1="0" y1={h*0.2} x2={w} y2={h*0.2} />
            <line x1="0" y1={h*0.4} x2={w} y2={h*0.4} />
            <line x1="0" y1={h*0.6} x2={w} y2={h*0.6} />
            <line x1="0" y1={h*0.8} x2={w} y2={h*0.8} />
            <line x1={w/2 - 2} y1={h} x2={w/2} y2={h + 4} />
            <line x1={w/2 + 2} y1={h} x2={w/2} y2={h + 4} />
          </g>
        </svg>
      );
    }
    if (conditionKey === 'PULPITIS') {
      const y = isUpper ? 66 : 34;
      overlays.push(
        <svg key="pulp" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, zIndex: 16, pointerEvents: 'none' }}>
          <rect x="44" y={y-5} width="12" height="10" rx="2" fill="#ef4444" opacity="0.7" />
        </svg>
      );
    }
    if (conditionKey === 'APICAL_LESION') {
      const cy = isUpper ? 18 : 82;
      overlays.push(<svg key="apex" viewBox="0 0 100 100" style={{ position:'absolute', inset:0, zIndex:16, pointerEvents:'none' }}><circle cx="50" cy={cy} r="6" fill="#ef4444" opacity="0.7"/></svg>);
    }
    if (conditionKey === 'ROOT') {
      overlays.push(
        <svg key="rootmask" viewBox="0 0 100 100" style={{ position:'absolute', inset:0, zIndex:14, pointerEvents:'none' }}>
          <rect x="8" y={isUpper?60:0} width="84" height={20} fill="#ffffff" opacity="0.85" />
        </svg>
      );
    }

    return { layers, debugLayers, overlays };
  }, [
    makeLayerStyle, style, conditionKey, isImplantBase, hideRoots, implantConfig,
    splintPosition, perioActive, bridgePosition, bridgeLeft, bridgeRight,
    bopSites, xOffset, width, displayW, displayH, isUpper,
    scale, baseTransform, baseOpacity,
  ]);

  // Content transforms for offset conditions (impacted)
  const contentTransforms = [];
  if (style.offset?.y) contentTransforms.push(`translateY(${style.offset.y * scale}px)`);
  if (style.offset?.rotate) contentTransforms.push(`rotate(${style.offset.rotate}deg)`);

  if (!config) return null;

  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); onDebugContext?.({ number, layers: debugLayers, metrics: { textureIdx, xOffset, width, height, scale, displayW, displayH }, clientX: e.clientX, clientY: e.clientY }); }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative cursor-pointer flex flex-col items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: displayW,
        height: displayH,
        opacity: dimmed ? 0.2 : 1,
        zIndex: (selected || hovered) ? 10 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >
      <div
        className={style.wobble ? 'animate-[wobble_2s_ease-in-out_infinite]' : undefined}
        style={{
          position: 'relative',
          width: displayW,
          height: displayH,
          transform: contentTransforms.length ? contentTransforms.join(' ') : undefined,
        }}
      >
        {layers}
        {overlays}
        <SpriteDebugOverlay
          enabled={debugMode || (process.env.NEXT_PUBLIC_QDENTO_DEBUG === 'true')}
          number={number}
          textureIdx={textureIdx}
          xOffset={xOffset}
          width={width}
          height={height}
          scale={scale}
          displayW={displayW}
          displayH={displayH}
          isUpper={isUpper}
        />

        {/* Status Overlays */}
        {(conditionKey === 'MISSING' || conditionKey === 'EXTRACTED') && (
          <svg key="status-x" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none' }}>
            <line x1="20" y1="20" x2="80" y2="80" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
            <line x1="80" y1="20" x2="20" y2="80" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
          </svg>
        )}

        {/* Mobility overlay (Roman numerals above/below tooth root) */}
        {mobilityGrade > 0 && (
          <div key="mobility-overlay" className="absolute inset-x-0 flex justify-center z-30 pointer-events-none" style={{ top: isUpper ? -16 : 'auto', bottom: isUpper ? 'auto' : -16 }}>
            <span className="text-[10px] font-bold px-1 rounded bg-amber-500 text-white shadow-sm">
              {mobilityGrade === 1 ? 'I' : mobilityGrade === 2 ? 'II' : 'III'}
            </span>
          </div>
        )}

        {/* Furcation involvement indicator for molars — triangle icons between roots */}
        {isMolar && furcationGrade > 0 && (
          <svg key="furc" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, zIndex: 25, pointerEvents: 'none' }}>
            {(() => {
              const cy = isUpper ? 62 : 38; // between roots area
              const tri = [50, cy - 6, 42, cy + 6, 58, cy + 6];
              const fill = furcationGrade === 3 ? '#ef4444' : furcationGrade === 2 ? 'url(#furcHalf)' : 'none';
              const stroke = furcationGrade > 0 ? '#ef4444' : 'none';
              return (
                <g>
                  {furcationGrade === 2 && (
                    <defs>
                      <linearGradient id="furcHalf" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="transparent" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  )}
                  <polygon points={`${tri[0]},${tri[1]} ${tri[2]},${tri[3]} ${tri[4]},${tri[5]}`} fill={fill} stroke={stroke} strokeWidth="2" />
                </g>
              );
            })()}
          </svg>
        )}
        {/* implant screw drawn above handled earlier in overlays */}
        {conditionKey === 'MOBILITY' && (
          <div key="status-mob" className="absolute inset-x-0 flex justify-center z-30 pointer-events-none" style={{ top: isUpper ? -15 : 'auto', bottom: isUpper ? 'auto' : -15 }}>
            <span className="bg-yellow-500 text-white text-[10px] font-bold px-1 rounded shadow-sm">M</span>
          </div>
        )}
        {conditionKey === 'FRACTURED' && (
          <div key="status-frac" className="absolute inset-x-0 flex justify-center z-30 pointer-events-none" style={{ top: isUpper ? -15 : 'auto', bottom: isUpper ? 'auto' : -15 }}>
            <span className="bg-red-600 text-white text-[10px] font-bold px-1 rounded shadow-sm">F</span>
          </div>
        )}
        {(conditionKey === 'UNKNOWN' || status === '?' || !status) && status !== 'HEALTHY' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span className="text-slate-300 text-4xl font-bold opacity-40">?</span>
          </div>
        )}

        {/* 8. Treatment annotations (SVG overlay) */}
        {annotations?.length > 0 && (
          <TreatmentOverlay
            annotations={annotations}
            width={displayW}
            height={displayH}
            isUpper={isUpper}
            toothNumber={number}
            isMolar={isMolar}
          />
        )}

        {/* 9. Interactive Surface Selection Overlay */}
        {interactiveSurfaces && (
          <InteractiveSurfaceMatrix
            toothNumber={number}
            isUpper={isUpper}
            width={displayW}
            height={displayH}
            selectedSurfaces={selectedSurfaces}
            onSurfaceClick={(tooth, surface) => onSurfaceClick?.(tooth, surface)}
          />
        )}

        {/* Selection highlight — teal inset */}
        {selected && (
          <div style={{
            position: 'absolute', inset: -1,
            border: '2px solid rgba(20,184,166,0.6)',
            borderRadius: 3,
            background: 'rgba(20,184,166,0.06)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Hover highlight */}
        {hovered && !selected && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(20,184,166,0.04)',
            borderRadius: 2,
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Tooltip on hover */}
      {tooltipEnabled && hovered && (
        <div
          className={`absolute ${isUpper ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap`}
          style={{ zIndex: 50 }}
        >
          <div className="px-2 py-1.5 bg-slate-800 text-white rounded shadow-lg text-[10px] leading-tight">
            <span className="font-bold">#{number}</span>
            <span className="mx-1.5 text-slate-300">{getAdultToothName(number)}</span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: style.color || '#64748b' }} />
              <span className="text-slate-200">{style.label || 'Healthy'}</span>
            </span>
          </div>
        </div>
      )}

      {/* Optional custom label */}
      {!compact && label && (
        <div className="text-[9px] font-medium text-slate-400 truncate w-full text-center px-1">
          {label}
        </div>
      )}

      <style jsx>{`
        @keyframes wobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }
      `}</style>

      {/* Transform note: Our quadrant transforms (rotate 180, optional scaleX) are equivalent to QDento’s Q1/Q2/Q3/Q4 scheme due to atlas base orientation. */}
    </div>
  );
}

function shallowArrayEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function annotationsShallowEq(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] || {}; const y = b[i] || {};
    if (x.cueCode !== y.cueCode || x.status !== y.status || x.surfaces !== y.surfaces) return false;
  }
  return true;
}

const areEqual = (prev, next) => {
  return (
    prev.number === next.number &&
    prev.status === next.status &&
    prev.selected === next.selected &&
    prev.dimmed === next.dimmed &&
    prev.scale === next.scale &&
    prev.bridgePosition === next.bridgePosition &&
    prev.splintPosition === next.splintPosition &&
    prev.perioActive === next.perioActive &&
    prev.mobilityGrade === next.mobilityGrade &&
    prev.furcationGrade === next.furcationGrade &&
    prev.debugMode === next.debugMode &&
    shallowArrayEqual(prev.selectedSurfaces, next.selectedSurfaces) &&
    shallowArrayEqual(prev.bopSites, next.bopSites) &&
    annotationsShallowEq(prev.annotations, next.annotations)
  );
};

export default memo(DinoTooth, areEqual);
