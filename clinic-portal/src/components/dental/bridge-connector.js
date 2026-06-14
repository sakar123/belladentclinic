import React from 'react';
import { DINO_ASSETS } from './dinodent-config';

export function BridgeConnector({ position, xOffset, width, displayH, scale, baseTransform }) {
  if (!position) return null;
  const w = width * scale;
  const half = w / 2;
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
    opacity: 0.85,
    zIndex: 4,
  };

  const styleFull = {
    ...base,
    backgroundImage: `url(${DINO_ASSETS.bridgeCon})`,
    clipPath: `inset(${crownTop}px 0 ${bottom}px 0)`,
  };
  const styleLeftCon = {
    ...base,
    backgroundImage: `url(${DINO_ASSETS.bridgeCon})`,
    clipPath: `inset(${crownTop}px ${half}px ${bottom}px 0)`,
  };
  const styleRightCon = {
    ...base,
    backgroundImage: `url(${DINO_ASSETS.bridgeCon})`,
    clipPath: `inset(${crownTop}px 0 ${bottom}px ${half}px)`,
  };
  const styleLeftSep = {
    ...base,
    backgroundImage: `url(${DINO_ASSETS.bridgeSep})`,
    clipPath: `inset(${crownTop}px ${half}px ${bottom}px 0)`,
  };
  const styleRightSep = {
    ...base,
    backgroundImage: `url(${DINO_ASSETS.bridgeSep})`,
    clipPath: `inset(${crownTop}px 0 ${bottom}px ${half}px)`,
  };

  if (position === 'center') {
    return <div style={styleFull} />;
  }
  if (position === 'begin') {
    return (
      <>
        <div style={styleLeftSep} />
        <div style={styleRightCon} />
      </>
    );
  }
  if (position === 'end') {
    return (
      <>
        <div style={styleLeftCon} />
        <div style={styleRightSep} />
      </>
    );
  }
  return null;
}

