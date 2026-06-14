export const TREATMENT_CUES = {
  FILLING: {
    label: 'Filling',
    // Rendered as a 5-surface diagram overlay on crown area
    type: 'surface-fill',         // special renderer
    completedColor: '#8b95a3',    // silver/gray
    plannedColor: '#3b82f6',      // blue
    position: 'crown',            // overlay on crown/occlusal area
  },
  BRIDGE: {
    label: 'Bridge',
    type: 'bridge-connector',
    completedColor: '#b8860b',
    plannedColor: '#3b82f6',
    position: 'crown',
    connectable: true,
  },
  DENTURE: {
    label: 'Denture',
    type: 'denture-base',
    completedColor: '#fb7185',
    plannedColor: '#3b82f6',
    position: 'full',
  },
  CROWN: {
    label: 'Crown',
    type: 'outline',              // outline shape around crown
    completedColor: '#d4a44a',    // gold
    plannedColor: '#3b82f6',
    position: 'crown',
    shape: 'cap',                 // cap outline shape
  },
  ROOT_CANAL: {
    label: 'Root Canal',
    type: 'line',                 // line through root canal
    completedColor: '#e11d48',    // rose
    plannedColor: '#3b82f6',
    position: 'root',
  },
  EXTRACTION: {
    label: 'Extraction',
    type: 'x-mark',              // big X across tooth
    completedColor: '#94a3b8',    // gray (tooth goes MISSING via status)
    plannedColor: '#ef4444',      // red X for planned extraction
    position: 'full',
  },
  BRACKET: {
    label: 'Braces',
    type: 'bracket',              // metallic bracket on buccal surface
    completedColor: '#94a3b8',    // metallic silver
    plannedColor: '#3b82f6',
    position: 'buccal',
    connectable: true,            // can render wire between adjacent bracketed teeth
    wireColor: '#9ca3af',
  },
  RETAINER: {
    label: 'Retainer',
    type: 'wire',                 // thin wire on lingual surface
    completedColor: '#94a3b8',    // silver
    plannedColor: '#3b82f6',
    position: 'lingual',
    connectable: true,
    wireColor: '#94a3b8',
  },
  SEALANT: {
    label: 'Sealant',
    type: 'dot',                  // colored dot on occlusal
    completedColor: '#0ea5e9',    // cyan/teal
    plannedColor: '#3b82f6',
    position: 'occlusal',
  },
  IMPLANT: {
    label: 'Implant',
    type: 'screw',                // screw symbol in root area
    completedColor: '#0ea5e9',    // cyan
    plannedColor: '#3b82f6',
    position: 'root',
  },
  POST: {
    label: 'Root Post',
    type: 'post',                 // metallic post in canal
    completedColor: '#9ca3af',
    plannedColor: '#3b82f6',
    position: 'root',
  },
  APICAL_LESION: {
    label: 'Apical Lesion',
    type: 'apex-blob',            // red blob at apex
    completedColor: '#ef4444',
    plannedColor: '#ef4444',
    position: 'root',
  },
  PULPITIS: {
    label: 'Pulpitis',
    type: 'pulp-chamber',         // red pulp chamber
    completedColor: '#ef4444',
    plannedColor: '#ef4444',
    position: 'crown',
  },
  CALCULUS: {
    label: 'Calculus',
    type: 'cervical-dots',        // dots at gumline
    completedColor: '#f59e0b',
    plannedColor: '#f59e0b',
    position: 'cervical',
  },
  SPLINT: {
    label: 'Splint',
    type: 'splint',               // adhesive splint band
    completedColor: '#9ca3af',
    plannedColor: '#3b82f6',
    position: 'buccal',
    connectable: true,
    wireColor: '#94a3b8',
  },
  VENEER: {
    label: 'Veneer',
    type: 'front-surface',        // front face highlight
    completedColor: '#e2e8f0',    // light porcelain
    plannedColor: '#3b82f6',
    position: 'buccal',
  },
};

// Status → color logic
export function getCueColor(cueConfig, treatmentStatus) {
  if (treatmentStatus === 'Completed') return cueConfig.completedColor;
  return cueConfig.plannedColor; // Planned or InProgress
}
