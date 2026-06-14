"use client";
import React from 'react';
import Button from '@/components/ui/button';

export function MacroButtons({ onApplySurfaces, onRemoveCrown, showBridgeWarning }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <Button size="xs" variant="outline" onClick={() => onApplySurfaces?.('MO')}>MO Filling</Button>
      <Button size="xs" variant="outline" onClick={() => onApplySurfaces?.('MOD')}>MOD Filling</Button>
      <Button size="xs" variant="outline" onClick={() => onRemoveCrown?.()}>Remove Crown/Overlay</Button>
      {showBridgeWarning && (
        <span className="text-[10px] px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
          Bridge requires ≥2 adjacent teeth
        </span>
      )}
    </div>
  );
}

