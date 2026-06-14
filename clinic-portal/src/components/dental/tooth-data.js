// Adult (permanent) dentition numbers 1–32 (Universal) with dentist-friendly names
// Primary (deciduous) teeth FDI 51–55 (upper right), 61–65 (upper left), 71–75 (lower left), 81–85 (lower right)

export const adultTeeth = Array.from({ length: 32 }, (_, i) => {
  const n = i + 1;
  const mapName = {
    1: 'Upper Right Third Molar',
    2: 'Upper Right Second Molar',
    3: 'Upper Right First Molar',
    4: 'Upper Right Second Premolar',
    5: 'Upper Right First Premolar',
    6: 'Upper Right Canine',
    7: 'Upper Right Lateral Incisor',
    8: 'Upper Right Central Incisor',
    9: 'Upper Left Central Incisor',
    10: 'Upper Left Lateral Incisor',
    11: 'Upper Left Canine',
    12: 'Upper Left First Premolar',
    13: 'Upper Left Second Premolar',
    14: 'Upper Left First Molar',
    15: 'Upper Left Second Molar',
    16: 'Upper Left Third Molar',
    17: 'Lower Left Third Molar',
    18: 'Lower Left Second Molar',
    19: 'Lower Left First Molar',
    20: 'Lower Left Second Premolar',
    21: 'Lower Left First Premolar',
    22: 'Lower Left Canine',
    23: 'Lower Left Lateral Incisor',
    24: 'Lower Left Central Incisor',
    25: 'Lower Right Central Incisor',
    26: 'Lower Right Lateral Incisor',
    27: 'Lower Right Canine',
    28: 'Lower Right First Premolar',
    29: 'Lower Right Second Premolar',
    30: 'Lower Right First Molar',
    31: 'Lower Right Second Molar',
    32: 'Lower Right Third Molar',
  };
  return { number: n, name: mapName[n] || `Tooth ${n}` };
});

export const primaryTeethFDI = [
  // Upper Right (51–55)
  { fdi: 55, name: 'Upper Right Second Molar (Primary)' },
  { fdi: 54, name: 'Upper Right First Molar (Primary)' },
  { fdi: 53, name: 'Upper Right Canine (Primary)' },
  { fdi: 52, name: 'Upper Right Lateral Incisor (Primary)' },
  { fdi: 51, name: 'Upper Right Central Incisor (Primary)' },
  // Upper Left (61–65)
  { fdi: 61, name: 'Upper Left Central Incisor (Primary)' },
  { fdi: 62, name: 'Upper Left Lateral Incisor (Primary)' },
  { fdi: 63, name: 'Upper Left Canine (Primary)' },
  { fdi: 64, name: 'Upper Left First Molar (Primary)' },
  { fdi: 65, name: 'Upper Left Second Molar (Primary)' },
  // Lower Left (71–75)
  { fdi: 75, name: 'Lower Left Second Molar (Primary)' },
  { fdi: 74, name: 'Lower Left First Molar (Primary)' },
  { fdi: 73, name: 'Lower Left Canine (Primary)' },
  { fdi: 72, name: 'Lower Left Lateral Incisor (Primary)' },
  { fdi: 71, name: 'Lower Left Central Incisor (Primary)' },
  // Lower Right (81–85)
  { fdi: 81, name: 'Lower Right Central Incisor (Primary)' },
  { fdi: 82, name: 'Lower Right Lateral Incisor (Primary)' },
  { fdi: 83, name: 'Lower Right Canine (Primary)' },
  { fdi: 84, name: 'Lower Right First Molar (Primary)' },
  { fdi: 85, name: 'Lower Right Second Molar (Primary)' },
];

// Map FDI to a DB tooth_number integer. If DB supports only 1–32, map primary into 1–32 buckets (approx) or use FDI as-is if backend accepts >32.
// We’ll prefer storing as-is if backend accepts any INT; else provide an approximate mapping function.

export function getAdultToothName(universalNumber) {
  const t = adultTeeth.find(t => t.number === Number(universalNumber));
  return t?.name || `Tooth ${universalNumber}`;
}

export function getPrimaryToothName(fdi) {
  const t = primaryTeethFDI.find(t => t.fdi === Number(fdi));
  return t?.name || `Tooth ${fdi}`;
}

export function quadrantShorthandAdult(n) {
  n = Number(n);
  if (n >= 1 && n <= 8) return 'UR';
  if (n >= 9 && n <= 16) return 'UL';
  if (n >= 17 && n <= 24) return 'LL';
  if (n >= 25 && n <= 32) return 'LR';
  return '';
}

export function quadrantShorthandPrimary(fdi) {
  const q = String(fdi)[0];
  if (q === '5') return 'UR';
  if (q === '6') return 'UL';
  if (q === '7') return 'LL';
  if (q === '8') return 'LR';
  return '';
}
