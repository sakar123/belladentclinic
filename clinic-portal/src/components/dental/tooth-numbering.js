"use client";

export const PERMANENT_UPPER_TEETH = Array.from({ length: 16 }, (_, i) => i + 1);
export const PERMANENT_LOWER_TEETH = Array.from({ length: 16 }, (_, i) => 32 - i);

export const PRIMARY_UPPER_TEETH = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
export const PRIMARY_LOWER_TEETH = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

const UNIVERSAL_TO_FDI = [
  0,
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  38, 37, 36, 35, 34, 33, 32, 31,
  41, 42, 43, 44, 45, 46, 47, 48,
];

export function isUniversalPermanent(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 && n <= 32;
}

export function isPermanentFdi(value) {
  const n = Number(value);
  const quadrant = Math.floor(n / 10);
  const tooth = n % 10;
  return Number.isFinite(n) && quadrant >= 1 && quadrant <= 4 && tooth >= 1 && tooth <= 8;
}

export function isPrimaryFdi(value) {
  const n = Number(value);
  const quadrant = Math.floor(n / 10);
  const tooth = n % 10;
  return Number.isFinite(n) && quadrant >= 5 && quadrant <= 8 && tooth >= 1 && tooth <= 5;
}

export function universalToPermanentFdi(value) {
  const n = Number(value);
  return isUniversalPermanent(n) ? UNIVERSAL_TO_FDI[n] : n;
}

export function permanentFdiToUniversal(value) {
  const n = Number(value);
  if (!isPermanentFdi(n)) return undefined;
  const quadrant = Math.floor(n / 10);
  const tooth = n % 10;
  if (quadrant === 1) return 9 - tooth;
  if (quadrant === 2) return 8 + tooth;
  if (quadrant === 3) return 25 - tooth;
  if (quadrant === 4) return 24 + tooth;
  return undefined;
}

export function inferPermanentNumberingSystem(values = []) {
  const nums = values.map(Number).filter(Number.isFinite);
  const permanent = nums.filter((n) => !isPrimaryFdi(n));
  if (permanent.some((n) => n >= 33 && n <= 48)) return "fdi";
  if (permanent.some((n) => (n >= 1 && n <= 10) || n === 19 || n === 20 || (n >= 29 && n <= 30))) {
    return "universal";
  }
  if (permanent.length > 0 && permanent.every(isPermanentFdi)) return "fdi";
  return "universal";
}

export function normalizePermanentToUniversal(value, numberingSystem = "universal") {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  if (numberingSystem === "fdi" && isPermanentFdi(n)) {
    return permanentFdiToUniversal(n);
  }
  if (isUniversalPermanent(n)) return n;
  if (isPermanentFdi(n)) return permanentFdiToUniversal(n);
  return undefined;
}

export function normalizeToChartTooth(value, numberingSystem = "universal") {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (isPrimaryFdi(n)) {
    return {
      kind: "primary",
      chartNumber: n,
      sourceNumber: n,
      displayNumber: n,
      key: chartToothKey("primary", n),
    };
  }
  const universal = normalizePermanentToUniversal(n, numberingSystem);
  if (!universal) return null;
  return {
    kind: "permanent",
    chartNumber: universal,
    sourceNumber: n,
    displayNumber: universalToPermanentFdi(universal),
    key: chartToothKey("permanent", universal),
  };
}

export function normalizeChartTooth(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (isPrimaryFdi(n)) {
    return {
      kind: "primary",
      chartNumber: n,
      sourceNumber: n,
      displayNumber: n,
      key: chartToothKey("primary", n),
    };
  }
  if (!isUniversalPermanent(n)) return null;
  return {
    kind: "permanent",
    chartNumber: n,
    sourceNumber: n,
    displayNumber: universalToPermanentFdi(n),
    key: chartToothKey("permanent", n),
  };
}

export function normalizeToUniversal(value, numberingSystem = "universal") {
  return normalizePermanentToUniversal(value, numberingSystem);
}

export function getToothRawNumber(tooth) {
  return tooth?.toothNumber ?? tooth?.number ?? tooth?.tooth_number;
}

export function getToothDisplayNumber(value, numberingSystem = "universal") {
  return normalizeToChartTooth(value, numberingSystem)?.displayNumber ?? Number(value);
}

export function chartToothKey(kind, chartNumber) {
  return `${kind}:${Number(chartNumber)}`;
}

export function getToothQuadrant(kind, chartNumber) {
  const n = Number(chartNumber);
  if (kind === "primary" || isPrimaryFdi(n)) {
    const q = Math.floor(n / 10);
    if (q === 5) return "q1";
    if (q === 6) return "q2";
    if (q === 7) return "q3";
    if (q === 8) return "q4";
    return "";
  }
  if (n >= 1 && n <= 8) return "q1";
  if (n >= 9 && n <= 16) return "q2";
  if (n >= 17 && n <= 24) return "q3";
  if (n >= 25 && n <= 32) return "q4";
  return "";
}

export function isUpperTooth(kind, chartNumber) {
  const n = Number(chartNumber);
  if (kind === "primary" || isPrimaryFdi(n)) {
    const q = Math.floor(n / 10);
    return q === 5 || q === 6;
  }
  return n >= 1 && n <= 16;
}

export function isLowerTooth(kind, chartNumber) {
  const n = Number(chartNumber);
  if (kind === "primary" || isPrimaryFdi(n)) {
    const q = Math.floor(n / 10);
    return q === 7 || q === 8;
  }
  return n >= 17 && n <= 32;
}

export function isPosteriorTooth(kind, chartNumber) {
  const q = getToothQuadrant(kind, chartNumber);
  const n = Number(chartNumber);
  if (kind === "primary" || isPrimaryFdi(n)) {
    const tooth = n % 10;
    return tooth >= 4 && tooth <= 5;
  }
  if (q === "q1") return n <= 5;
  if (q === "q2") return n >= 12;
  if (q === "q3") return n <= 21;
  if (q === "q4") return n >= 28;
  return false;
}
