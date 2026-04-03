/**
 * DinoDent Clinical Mapping Configuration
 * 
 * Maps Universal/FDI tooth numbers to DinoDent's 26-texture sprite system.
 * Based on DinoDent's ToothUtils.cpp and SpriteSheets.cpp.
 */

// 0-31 DinoDent Index -> 0-25 Texture Index
const PERMA_IDX = [
  0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 0, // Top Arches
  8, 9, 10, 11, 12, 13, 14, 15, 15, 14, 13, 12, 11, 10, 9, 8 // Bottom Arches
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
 * Universal order: 1-16 (UR8 to UL8), 17-32 (LL8 to LR8)
 */
export function universalToIndex(n) {
  if (n >= 1 && n <= 16) return n - 1; // 1 -> 0, 16 -> 15
  if (n >= 17 && n <= 32) return n - 1; // 17 -> 16, 32 -> 31
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
    isUpper: universalNumber <= 16,
    // DinoDent logic: textures 0-7 and 8-15 are symmetric. 
    // We may need to flip some textures if they are shared.
    // In DinoDent, the textures are drawn as-is, but the scene flips them.
    shouldFlipX: (index >= 8 && index <= 15) || (index >= 24 && index <= 31)
  };
}

export const DINO_ASSETS = {
  teeth: '/images/dental/tooth_teeth.png',
  roots: '/images/dental/tooth_roots.png',
  lesion: '/images/dental/tooth_lesion.png',
  endo: '/images/dental/tooth_endo.png',
  crown: '/images/dental/tooth_crown.png',
  common: '/images/dental/tooth_common.png', // implants, dentures
  buccal: '/images/dental/tooth_buccal.png',
  lingual: '/images/dental/tooth_lingual.png',
  occlusal: '/images/dental/tooth_occlusal.png',
  approximal: '/images/dental/tooth_approximal.png',
};

export function getImplantConfig(isMolar) {
  return {
    xOffset: isMolar ? 480 : 0,
    width: isMolar ? 180 : 120
  };
}
