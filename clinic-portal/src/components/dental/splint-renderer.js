import React from 'react';
import { DINO_ASSETS } from './dinodent-config';

export function SplintRenderer({ mode = 'front', xOffset, width, displayH, scale, baseTransform }) {
  const w = width * scale;
  const crownTop = displayH * (210 / 860);
  const crownH = displayH * (440 / 860);
  const bottom = displayH - crownTop - crownH;

  const base = {
    position: 'absolute',
    inset: 0,
    width: w,
    height: displayH,
    backgroundSize: 'auto 100%',
    backgroundPosition: `-${xOffset * scale}px 0`,
    transform: baseTransform,
    zIndex: mode === 'front' ? 4 : 0,
  };

  if (mode === 'behind') {
    return (
      <div
        style={{
          ...base,
          backgroundImage: `url(${DINO_ASSETS.fiberBridge})`,
          opacity: 0.3,
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...base,
        backgroundImage: `url(${DINO_ASSETS.fiberBridge})`,
        clipPath: `inset(${crownTop}px 0 ${bottom}px 0)`,
        opacity: 0.8,
      }}
    />
  );
}

