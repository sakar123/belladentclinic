/**
 * DinoDent Clinical Mapping Configuration
 *
 * Maps Universal/FDI tooth numbers to DinoDent's 26-texture sprite system.
 * Opacities and layer configs matched to QDento's ToothPainter.cpp.
 */

// 0-31 DinoDent Index -> 0-25 Texture Index
const PERMA_IDX = [
  0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 0, // Top Arches
  8, 9, 10, 11, 12, 13, 14, 15, 15, 14, 13, 12, 11, 10, 9, 8, // Bottom Arches
];

const MOLAR_TEXTURE_SET = new Set([0, 1, 2, 8, 9, 10]);

const TEXTURE_CONFIGS = Array.from({ length: 26 }, (_, i) => {
  const isMolar = MOLAR_TEXTURE_SET.has(i);
  return { width: isMolar ? 180 : 120, height: 860 };
});

// Pre-calculate X offsets for each of the 26 textures in the horizontal sprite sheet
const TEXTURE_X_OFFSETS = [];
let currentX = 0;
for (let i = 0; i < 26; i++) {
  TEXTURE_X_OFFSETS[i] = currentX;
  currentX += TEXTURE_CONFIGS[i].width;
}

/**
 * Maps Universal Tooth Number (1-32) to DinoDent Index (0-31)
 */
export function universalToIndex(n) {
  if (n >= 1 && n <= 32) return n - 1;
  return -1;
}

export function getToothConfig(universalNumber) {
  const index = universalToIndex(universalNumber);
  if (index === -1) return null;

  const textureIdx = PERMA_IDX[index];
  const config = TEXTURE_CONFIGS[textureIdx];
  const xOffset = TEXTURE_X_OFFSETS[textureIdx];

  return {
    ...config,
    xOffset,
    textureIdx,
    isMolar: MOLAR_TEXTURE_SET.has(textureIdx),
    isUpper: universalNumber <= 16,
    shouldFlipX: (index >= 8 && index <= 15) || (index >= 24 && index <= 31),
  };
}

/** Get the display width for a tooth at a given scale */
export function getToothDisplayWidth(universalNumber, scale) {
  const config = getToothConfig(universalNumber);
  return config ? Math.round(config.width * scale) : Math.round(120 * scale);
}

export const DINO_ASSETS = {
  // Core atlases (Option A)
  teeth: '/images/dental/tooth_teeth.png',
  roots: '/images/dental/tooth_roots.png',
  lesion: '/images/dental/tooth_lesion.png',
  endo: '/images/dental/tooth_endo.png',
  crown: '/images/dental/tooth_crown.png',
  common: '/images/dental/tooth_common.png',
  buccal: '/images/dental/tooth_buccal.png',
  lingual: '/images/dental/tooth_lingual.png',
  occlusal: '/images/dental/tooth_occlusal.png',
  approximal: '/images/dental/tooth_approximal.png',
  stripes: '/images/dental/tooth_stripes.png',
  // Extended atlases
  cervical: '/images/dental/tooth_cervical.png',
  perio: '/images/dental/tooth_perio.png',
  post: '/images/dental/tooth_post.png',
  calculus: '/images/dental/tooth_calculus.png',
  resorption: '/images/dental/tooth_resorption.png',
  bridgeCon: '/images/dental/tooth_bridgeCon.png',
  bridgeSep: '/images/dental/tooth_bridgeSep.png',
  falseTooth: '/images/dental/tooth_false.png',
  fiberBridge: '/images/dental/tooth_fiberBridge.png',
  // Option B (arch-specific) placeholders
  teethUpper: null,
  teethLower: null,
};

export function getImplantConfig(isMolar, condition = 'IMPLANT') {
  const c = String(condition || 'IMPLANT').toUpperCase();
  if (c === 'DENTURE') {
    return {
      xOffset: isMolar ? 1020 : 360,
      width: isMolar ? 180 : 120,
    };
  }
  if (c === 'CALCULUS_IMPLANT') {
    return {
      xOffset: isMolar ? 660 : 120,
      width: isMolar ? 180 : 120,
    };
  }
  if (c === 'PERIO_IMPLANT') {
    return {
      xOffset: isMolar ? 840 : 240,
      width: isMolar ? 180 : 120,
    };
  }
  return {
    xOffset: isMolar ? 480 : 0,
    width: isMolar ? 180 : 120,
  };
}

/**
 * Universal (1-32) → FDI (11-48) conversion for display.
 */
const UNIVERSAL_TO_FDI = [
  0,
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  38, 37, 36, 35, 34, 33, 32, 31,
  41, 42, 43, 44, 45, 46, 47, 48,
];

export function universalToFDI(universalNumber) {
  const n = Number(universalNumber);
  if (n >= 1 && n <= 32) return UNIVERSAL_TO_FDI[n];
  return n;
}

/**
 * Tooth status → visual rendering instructions.
 * Opacities matched to QDento ToothPainter.cpp:
 *   Crown overlay: 0.8    (was 0.5)
 *   Endo overlay:  0.3    (was 0.45)
 *   Lesion:        0.3    (was 0.55)
 *   Surface fill:  0.35   (was 0.5)
 *   Bridge front:  0.8    (was 0.5)
 *   Splint behind: 0.3
 *   Denture:       0.5    (was 0.75)
 *   Extracted:     0.15   (was 0.1)
 *
 * Filters: QDento uses Qt CompositionMode_SourceIn for color tinting,
 * NOT CSS filter chains. Crown/bridge sprites render as-is at opacity.
 * Only endo gets a red-tint filter for canal coloring.
 */
export const CONDITION_STYLES = {
  // === Natural conditions ===
  HEALTHY:   { layers: [], opacity: 1, label: 'Healthy', color: '#22c55e' },
  CARIES:    { layers: ['lesion'], opacity: 1, label: 'Caries', color: '#ef4444', layerOpacity: 0.3 },
  DEFECTIVE_RESTORATION: { layers: ['lesion'], opacity: 1, label: 'Defective Restoration', color: '#f97316', layerOpacity: 0.25 },
  NON_CARIES_LESION: { layers: ['lesion'], opacity: 1, label: 'Non-Caries Lesion', color: '#a855f7', layerOpacity: 0.25 },
  FRACTURED: { layers: ['lesion'], opacity: 0.9, label: 'Fractured', color: '#f97316', layerOpacity: 0.25, filter: 'saturate(0.3)' },
  ABSCESSED: { layers: ['lesion'], opacity: 1, label: 'Abscessed', color: '#dc2626', layerOpacity: 0.3, rootGlow: true },
  ERODED:    { layers: [], opacity: 0.75, label: 'Eroded', color: '#a855f7', toothFilter: 'brightness(1.1)' },
  IMPACTED:  { layers: [], opacity: 0.55, label: 'Impacted', color: '#6366f1', offset: { y: 8, rotate: 12 } },
  MOBILITY:  { layers: [], opacity: 1, label: 'Mobility', color: '#eab308', wobble: true },
  MISSING:   { layers: [], opacity: 0.15, label: 'Missing', color: '#94a3b8' },
  EXTRACTED: { layers: [], opacity: 0.15, label: 'Extracted', color: '#94a3b8' },
  PULPITIS:  { layers: [], opacity: 1, label: 'Pulpitis', color: '#ef4444' },
  APICAL_LESION: { layers: [], opacity: 1, label: 'Apical Lesion', color: '#ef4444' },
  RESORPTION: { layers: [], opacity: 1, label: 'Resorption', color: '#ef4444' },
  NECROSIS: { layers: [], opacity: 1, label: 'Necrosis', color: '#7f1d1d' },
  TEMPORARY: { layers: [], opacity: 1, label: 'Temporary', color: '#38bdf8', toothFilter: 'hue-rotate(170deg) saturate(1.2)' },
  ROOT:     { layers: [], opacity: 1, label: 'Root', color: '#c084fc' },
  CALCULUS: { layers: [], opacity: 1, label: 'Calculus', color: '#f59e0b' },
  PERIODONTITIS: { layers: [], opacity: 1, label: 'Periodontitis', color: '#f97316' },

  // === Restorations / Prosthetics ===
  // Crown/bridge/pontic: sprite renders as-is at 0.8 opacity. No sepia/hue-rotate.
  FILLED:  { layers: ['occlusal'], opacity: 1, label: 'Filled', color: '#64748b', layerOpacity: 0.35 },
  CROWNED: { layers: ['crown'], opacity: 1, label: 'Crowned', color: '#d4a44a', layerOpacity: 0.8 },
  CROWN:   { layers: ['crown'], opacity: 1, label: 'Crown', color: '#d4a44a', layerOpacity: 0.8 },
  // Endo: red-tint filter for canal coloring (QDento uses SourceIn with Qt::red at 0.3)
  RCT:     { layers: ['endo'], opacity: 1, label: 'Root Canal', color: '#e11d48', layerOpacity: 0.3, filter: 'sepia(1) saturate(4) hue-rotate(-15deg)' },
  ENDO:    { layers: ['endo'], opacity: 1, label: 'Endodontic', color: '#e11d48', layerOpacity: 0.3, filter: 'sepia(1) saturate(4) hue-rotate(-15deg)' },
  IMPLANT: { layers: [], opacity: 1, label: 'Implant', color: '#0ea5e9', useImplantBase: true },
  VENEER:  { layers: ['buccal'], opacity: 1, label: 'Veneer', color: '#e2e8f0', layerOpacity: 0.35 },
  BRIDGE:  { layers: ['crown'], opacity: 1, label: 'Bridge', color: '#b8860b', bridgeConnector: true, layerOpacity: 0.8 },
  PONTIC:  { layers: ['crown'], opacity: 1, label: 'Pontic', color: '#78716c', hideRoots: true, bridgeConnector: true, layerOpacity: 0.8 },
  DENTURE: { layers: [], opacity: 0.5, label: 'Denture', color: '#fb7185', useImplantBase: true },
  POST:    { layers: [], opacity: 1, label: 'Radicular Post', color: '#94a3b8' },
  SPLINT:  { layers: [], opacity: 1, label: 'Splint', color: '#9ca3af', bridgeConnector: true },
};

/**
 * Resolves a raw status string to a CONDITION_STYLES key.
 */
export function resolveCondition(statusRaw) {
  if (!statusRaw) return CONDITION_STYLES.HEALTHY;
  const s = String(statusRaw).toUpperCase().trim();

  if (CONDITION_STYLES[s]) return CONDITION_STYLES[s];

  if (s.includes('EXTRACT')) return CONDITION_STYLES.EXTRACTED;
  if (s.includes('MISSING')) return CONDITION_STYLES.MISSING;
  if (s.includes('TEMP')) return CONDITION_STYLES.TEMPORARY;
  if (s.includes('BRIDGE')) return CONDITION_STYLES.BRIDGE;
  if (s.includes('PONTIC')) return CONDITION_STYLES.PONTIC;
  if (s.includes('VENEER')) return CONDITION_STYLES.VENEER;
  if (s.includes('DENTURE')) return CONDITION_STYLES.DENTURE;
  if (s.includes('IMPLANT')) return CONDITION_STYLES.IMPLANT;
  if (s.includes('CROWN')) return CONDITION_STYLES.CROWNED;
  if (s.includes('RCT') || s.includes('ENDO')) return CONDITION_STYLES.RCT;
  if (s.includes('FILL')) return CONDITION_STYLES.FILLED;
  if (s.includes('DECAY') || s.includes('CARIES') || s.includes('CAVITY')) return CONDITION_STYLES.CARIES;
  if (s.includes('FRACTUR')) return CONDITION_STYLES.FRACTURED;
  if (s.includes('ABSCESS') || s.includes('APICAL')) return CONDITION_STYLES.ABSCESSED;
  if (s.includes('ERODE') || s.includes('EROSION')) return CONDITION_STYLES.ERODED;
  if (s.includes('PULP')) return CONDITION_STYLES.PULPITIS;
  if (s.includes('RESORP')) return CONDITION_STYLES.RESORPTION;
  if (s.includes('NECROS')) return CONDITION_STYLES.NECROSIS;
  if (s.includes('ROOT')) return CONDITION_STYLES.ROOT;
  if (s.includes('CALCULUS') || s.includes('TARTAR')) return CONDITION_STYLES.CALCULUS;
  if (s.includes('PERIO')) return CONDITION_STYLES.PERIODONTITIS;
  if (s.includes('IMPACT')) return CONDITION_STYLES.IMPACTED;
  if (s.includes('MOBIL')) return CONDITION_STYLES.MOBILITY;

  return CONDITION_STYLES.HEALTHY;
}

// Frontend incompatible status matrix for warnings only (backend enforces 422)
export const INCOMPATIBLE_STATUSES = {
  HEALTHY: new Set([ 'FILLED','CARIES','CROWNED','BRIDGE','RCT','POST','IMPLANT' ]),
  MISSING: new Set([ 'HEALTHY','FILLED','CARIES','CROWNED','RCT','POST','PULPITIS','VENEER' ]),
  EXTRACTED: new Set([ 'HEALTHY','FILLED','CARIES','CROWNED','RCT','POST','PULPITIS','VENEER','IMPLANT' ]),
  IMPLANT: new Set([ 'HEALTHY','APICAL_LESION','TEMPORARY','MISSING','FILLED','PULPITIS','NECROSIS' ]),
  PONTIC: new Set([ 'HEALTHY','FILLED','CARIES','RCT','POST' ]),
  BRIDGE: new Set([ 'CARIES','RCT','POST' ]),
  CROWNED: new Set([ 'IMPLANT','PONTIC' ]),
};
