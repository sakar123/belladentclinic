"use client";

import {
  isPermanentFdi,
  isPrimaryFdi,
  isUniversalPermanent,
  universalToPermanentFdi,
} from "@/components/dental/tooth-numbering";

const PRIMARY_TO_PERMANENT_SLOT = {
  51: 11, 52: 12, 53: 13, 54: 14, 55: 15,
  61: 21, 62: 22, 63: 23, 64: 24, 65: 25,
  71: 31, 72: 32, 73: 33, 74: 34, 75: 35,
  81: 41, 82: 42, 83: 43, 84: 44, 85: 45,
};

const PERMANENT_SLOT_TO_PRIMARY = Object.fromEntries(
  Object.entries(PRIMARY_TO_PERMANENT_SLOT).map(([primary, slot]) => [slot, Number(primary)])
);

function primaryUniversalIndexToFdi(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 20) return null;
  if (n <= 5) return 50 + n;
  if (n <= 10) return 60 + (n - 5);
  if (n <= 15) return 70 + (n - 10);
  return 80 + (n - 15);
}

export function backendToAdvancedToothNumber(value, options = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (options.primaryUniversal) {
    const primaryFdi = primaryUniversalIndexToFdi(n);
    if (primaryFdi) return PRIMARY_TO_PERMANENT_SLOT[primaryFdi] || null;
  }
  if (isPrimaryFdi(n)) return PRIMARY_TO_PERMANENT_SLOT[n] || null;
  if (isPermanentFdi(n)) return n;
  if (isUniversalPermanent(n)) return universalToPermanentFdi(n);
  return null;
}

export function advancedToBackendToothNumber(value, teeth = [], options = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const existing = (teeth || []).find((tooth) => {
    const raw = tooth?.tooth_number ?? tooth?.toothNumber ?? tooth?.number;
    return Number(backendToAdvancedToothNumber(raw, options)) === n;
  });
  if (existing) {
    return Number(existing.tooth_number ?? existing.toothNumber ?? existing.number);
  }
  if (options.primary && PERMANENT_SLOT_TO_PRIMARY[n]) return PERMANENT_SLOT_TO_PRIMARY[n];
  return isPermanentFdi(n) ? n : null;
}

export function advancedToDisplayToothNumber(value, teeth = [], options = {}) {
  const backend = advancedToBackendToothNumber(value, teeth, options);
  if (backend && isPrimaryFdi(backend)) return backend;
  return Number(value);
}

export function isBackendPrimaryTooth(value, options = {}) {
  const n = Number(value);
  return isPrimaryFdi(n) || (Boolean(options.primaryUniversal) && n >= 1 && n <= 20);
}

export function supportedAdvancedToothNumbers(teeth = [], options = {}) {
  return teeth
    .map((tooth) => backendToAdvancedToothNumber(tooth.tooth_number ?? tooth.toothNumber ?? tooth.number, options))
    .filter(Boolean);
}
