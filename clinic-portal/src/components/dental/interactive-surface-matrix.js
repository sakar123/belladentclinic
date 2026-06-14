"use client";
import React from 'react';
import { ButtonSurfaceMatrix } from './button-surface-matrix';

export function InteractiveSurfaceMatrix({
  toothNumber,
  isUpper,
  width,
  height,
  selectedSurfaces = [], // Array of 'M', 'D', 'O', 'B', 'L', 'I', 'F'
  onSurfaceClick,
}) {
  // We divide the crown area into 5 regions.
  // Crown is typically the middle ~50% of the graphic. 
  // Let's create a responsive SVG that covers the whole element but focuses the polygons in the crown area.
  
  const crownY = isUpper ? height * 0.45 : height * 0.25;
  const crownHeight = height * 0.4;
  const crownWidth = width * 0.8;
  const offsetX = (width - crownWidth) / 2;

  const handlePolygonClick = (e, pos) => {
    e.stopPropagation();
    const surface = ButtonSurfaceMatrix.getSurface(toothNumber, pos);
    if (onSurfaceClick) onSurfaceClick(toothNumber, surface);
  };

  const isSelected = (pos) => {
    const surface = ButtonSurfaceMatrix.getSurface(toothNumber, pos);
    return selectedSurfaces.includes(surface);
  };

  // SVG polygons based on a 100x100 view box scaled to crown area
  const fillStyle = (pos) => ({
    fill: isSelected(pos) ? 'rgba(13, 148, 136, 0.4)' : 'transparent',
    stroke: 'rgba(148, 163, 184, 0.4)',
    strokeWidth: 1.5,
    cursor: 'pointer',
    pointerEvents: 'all',
  });

  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 20, pointerEvents: 'none' }}
    >
      <g transform={`translate(${offsetX}, ${crownY}) scale(${crownWidth / 100}, ${crownHeight / 100})`}>
        {/* Top */}
        <polygon 
          points="0,0 100,0 75,25 25,25" 
          style={fillStyle('top')} 
          onClick={(e) => handlePolygonClick(e, 'top')}
          className="hover:fill-teal-500/20 transition-colors"
        />
        {/* Bottom */}
        <polygon 
          points="0,100 25,75 75,75 100,100" 
          style={fillStyle('bottom')} 
          onClick={(e) => handlePolygonClick(e, 'bottom')}
          className="hover:fill-teal-500/20 transition-colors"
        />
        {/* Left */}
        <polygon 
          points="0,0 25,25 25,75 0,100" 
          style={fillStyle('left')} 
          onClick={(e) => handlePolygonClick(e, 'left')}
          className="hover:fill-teal-500/20 transition-colors"
        />
        {/* Right */}
        <polygon 
          points="100,0 100,100 75,75 75,25" 
          style={fillStyle('right')} 
          onClick={(e) => handlePolygonClick(e, 'right')}
          className="hover:fill-teal-500/20 transition-colors"
        />
        {/* Center */}
        <polygon 
          points="25,25 75,25 75,75 25,75" 
          style={fillStyle('center')} 
          onClick={(e) => handlePolygonClick(e, 'center')}
          className="hover:fill-teal-500/20 transition-colors"
        />
        {/* Cervical (side strip) */}
        <rect
          x="10" y="85" width="80" height="10"
          style={fillStyle('side')}
          onClick={(e) => handlePolygonClick(e, 'side')}
          className="hover:fill-teal-500/20 transition-colors"
        />
      </g>
    </svg>
  );
}
