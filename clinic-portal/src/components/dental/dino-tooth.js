"use client";
import React from 'react';
import { getToothConfig, getImplantConfig, DINO_ASSETS } from './dinodent-config';

/**
 * DinoTooth: A multi-layered anatomical tooth component.
 * Stacks PNG layers based on clinical status.
 */
export default function DinoTooth({ 
  number, // Universal 1-32
  status = 'HEALTHY',
  selected, 
  onClick, 
  dimmed,
  label,
  className = "",
  compact = false,
  scale = 0.2 // Global scale for the sprite
}) {
  const config = getToothConfig(number);
  if (!config) return null;

  const { xOffset, width, height, isUpper, shouldFlipX, textureIdx } = config;
  
  // Status flags
  const s = String(status || '').toUpperCase();
  const isMissing = s.includes('MISSING') || s.includes('EXTRACT');
  const isDecay = s.includes('DECAY') || s.includes('CARIES') || s.includes('CAVITY');
  const isRCT = s.includes('RCT') || s.includes('ENDO');
  const isCrown = s.includes('CROWN');
  const isImplant = s.includes('IMPLANT');
  const isFilling = s.includes('FILL');

  const displayW = width * scale;
  const displayH = height * scale;

  // Layer Style Helper
  const getLayerStyle = (assetPath, customX = xOffset, customW = width) => ({
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${assetPath})`,
    backgroundPosition: `-${customX * scale}px 0px`,
    backgroundSize: `auto 100%`,
    width: customW * scale,
    height: displayH,
    transform: `
      ${isUpper ? 'rotate(180deg)' : ''} 
      ${shouldFlipX ? 'scaleX(-1)' : ''}
    `,
    transition: 'all 0.3s ease',
  });

  // Implant logic
  const implantConfig = getImplantConfig(MOLAR_TEXTURE_SET.has(textureIdx));
  
  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-300 flex flex-col items-center flex-shrink-0 ${className}`}
      style={{ 
        width: displayW, 
        height: compact ? displayH : displayH + 30,
        opacity: dimmed ? 0.3 : (isMissing ? 0.15 : 1),
        zIndex: selected ? 10 : 1
      }}
    >
      {/* Selection Glow */}
      {selected && (
        <div 
          className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full animate-pulse"
          style={{ transform: 'scale(1.5)', top: '20%' }}
        />
      )}

      {/* Tooth Number */}
      {!compact && (
        <div className={`text-[11px] font-black text-slate-400 mb-2 ${isUpper ? 'order-first' : 'order-last mt-2'}`}>
          {number}
        </div>
      )}

      <div className="relative group" style={{ width: displayW, height: displayH }}>
        {/* Hover Effect */}
        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors rounded-full" />

        {/* 1. Base Layer (Tooth or Implant) */}
        <div style={getLayerStyle(isImplant ? DINO_ASSETS.common : DINO_ASSETS.teeth, isImplant ? implantConfig.xOffset : xOffset, isImplant ? implantConfig.width : width)} />

        {/* 2. Roots Layer (Only if not implant) */}
        {!isImplant && <div style={getLayerStyle(DINO_ASSETS.roots)} />}

        {/* 3. Endo/RCT Layer */}
        {isRCT && (
          <div style={{
            ...getLayerStyle(DINO_ASSETS.endo),
            filter: 'sepia(1) saturate(10) hue-rotate(-50deg)', // Reddish tint
            opacity: 0.8
          }} />
        )}

        {/* 4. Lesion/Cavity Layer */}
        {isDecay && (
          <div style={{
            ...getLayerStyle(DINO_ASSETS.lesion),
            filter: 'brightness(0.5) contrast(1.5)',
            opacity: 0.9
          }} />
        )}

        {/* 5. Filling Layer (Approximate using a tinted lesion or surface) */}
        {isFilling && (
          <div style={{
            ...getLayerStyle(DINO_ASSETS.occlusal),
            filter: 'invert(0.5) sepia(1) saturate(2) hue-rotate(180deg)', // Silver/Blue tint
            opacity: 0.7
          }} />
        )}

        {/* 6. Crown Layer */}
        {isCrown && (
          <div style={{
            ...getLayerStyle(DINO_ASSETS.crown),
            filter: 'sepia(1) saturate(2) hue-rotate(10deg) brightness(1.1)', // Gold/Ceramic tint
            opacity: 0.85
          }} />
        )}

        {/* Selection Indicator Overlay */}
        {selected && (
          <div 
            className="absolute inset-0 border-2 border-blue-500/50 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            style={{ margin: '-4px' }}
          />
        )}
      </div>

      {/* Label */}
      {!compact && label && (
        <div className={`text-[9px] font-bold text-slate-400 truncate w-full text-center px-1 mt-1 ${isUpper ? 'order-last' : 'absolute -bottom-5'}`}>
          {label}
        </div>
      )}
    </div>
  );
}

const MOLAR_TEXTURE_SET = new Set([0, 1, 2, 8, 9, 10]);
