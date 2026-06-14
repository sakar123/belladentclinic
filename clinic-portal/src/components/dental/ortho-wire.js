import React, { useState, useEffect } from 'react';
import { TREATMENT_CUES, getCueColor } from './treatment-cues-config';

export function OrthoWire({ teeth, isUpper, cueCode }) {
  const [archPositions, setArchPositions] = useState(null);

  useEffect(() => {
    if (!teeth || teeth.length === 0) return;
    
    // Read positions after render using getBoundingClientRect to account for transforms
    const updatePositions = () => {
      const pos = {};
      let found = false;
      const firstEl = document.getElementById(`tooth-container-${teeth[0]}`);
      const container = firstEl?.parentElement;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      teeth.forEach(n => {
        const el = document.getElementById(`tooth-container-${n}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          pos[n] = {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height,
            status: el.dataset.status || 'Completed'
          };
          found = true;
        }
      });
      if (found) setArchPositions(pos);
    };

    updatePositions();
    // Add small delay to ensure rendering completes
    const timer = setTimeout(updatePositions, 50);
    return () => clearTimeout(timer);
  }, [teeth]);

  if (!teeth || teeth.length < 2 || !archPositions) return null;

  const cue = TREATMENT_CUES[cueCode];
  if (!cue || !cue.connectable) return null;

  // We want to connect the centers of the teeth based on archPositions
  // archPositions[n] should be { x, y, width, height } relative to the arch container
  
  // Sort teeth by number to draw wire in order
  const sortedTeeth = [...teeth].sort((a, b) => a - b);
  
  const points = [];
  let isAllCompleted = true;
  let isAllPlanned = true;

  sortedTeeth.forEach(n => {
    const pos = archPositions[n];
    if (pos) {
      // Find the y offset based on cue position
      let yOffset = pos.height / 2; // Default center
      if (cue.position === 'buccal') {
         yOffset = isUpper ? pos.height * 0.6 : pos.height * 0.4;
      } else if (cue.position === 'lingual') {
         yOffset = isUpper ? pos.height * 0.7 : pos.height * 0.3;
      }
      
      points.push({
        x: pos.x + pos.width / 2,
        y: pos.y + yOffset,
        // we'll determine status for wire color/dash
        status: pos.status || 'Completed' // fall back
      });

      if (pos.status !== 'Completed') isAllCompleted = false;
      if (pos.status === 'Completed') isAllPlanned = false;
    }
  });

  if (points.length < 2) return null;

  // Construct SVG path connecting points with curve
  let pathD = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    // Simple quadratic bezier, arching slightly based on isUpper
    const midX = (prev.x + curr.x) / 2;
    // Control point pulled slightly 'up' or 'down' relative to curve
    const dy = Math.abs(curr.y - prev.y);
    const cpY = isUpper ? Math.min(prev.y, curr.y) - 5 : Math.max(prev.y, curr.y) + 5;
    
    // For adjacent teeth just use a straight line or slight curve
    if (Math.abs(prev.x - curr.x) < 60) {
      pathD += ` L ${curr.x},${curr.y}`;
    } else {
      pathD += ` Q ${midX},${cpY} ${curr.x},${curr.y}`;
    }
  }

  // Determine wire color and style
  const wireColor = cue.wireColor || getCueColor(cue, isAllCompleted ? 'Completed' : 'Planned');
  const isDashed = !isAllCompleted;

  return (
    <svg 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none',
        zIndex: 5 // below the brackets themselves
      }}
    >
      <path 
        d={pathD} 
        fill="none" 
        stroke={wireColor} 
        strokeWidth="3" 
        strokeDasharray={isDashed ? "5 3" : "none"} 
      />
    </svg>
  );
}