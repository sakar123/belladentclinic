BellaDent Dental Chart — QDento Parity Notes

Overview
- Sprite atlases under `public/images/dental` follow a 26-column layout (6 molars @ 180px, 20 others @ 120px).
- `atlas.json` documents column widths, offsets, shared regions in `tooth_common.png`, and extended overlays.
- Renderer (`dino-tooth.js`) composes layers to match QDento’s ToothPainter.cpp ordering.

Atlas Manifest (atlas.json)
- `permanentIndices`: 32-length mapping for universal teeth (1–32) to texture columns.
- `columns`: width/offset per texture index; molars flagged for sizing.
- `commonTexture.regions`: implant/denture base rectangles in `tooth_common.png`.
- `spriteRects`: crown/surface crop rectangles used by zoom/UIs.
- `atlases`: file paths for core and extended overlays (cervical, perio, post, calculus, resorption, bridge sprites).

Compositing Order (high level)
1) Splint behind (optional)
2) Lesion (0.3)
3) Perio overlay (optional)
4) Calculus sprite (optional)
5) Base tooth / implant / root-only / extracted-dim
6) Resorption overlay
7) Endo overlay (0.3, red tint)
8) Post sprite (0.5, blue tint)
9) Surface fills (occlusal, approximal halves, buccal, lingual, cervical)
10) Crown/prosthetic front (0.8)
11) Bridge/splint connectors (sprites)
12) Treatment glyphs (SVG)
13) Selection/Hover

Status Taxonomy
- Canonical codes seeded by backend migration (HEALTHY, CARIES, FILLED, DEFECTIVE_RESTORATION, NON_CARIES_LESION, PULPITIS, NECROSIS, RESORPTION, APICAL_LESION, RCT, POST, ROOT, FRACTURED, MISSING, EXTRACTED, PERIODONTITIS, MOBILITY, CROWNED, BRIDGE, SPLINT, PONTIC, IMPLANT, IMPACTED, DENTURE, CALCULUS, VENEER, ABSCESSED).

Surfaces
- Six-surface system: M, O (I for anteriors), D, B (F for anteriors), L, C (cervical).
- `button-surface-matrix.ts` maps click-quadrants to surfaces by tooth position.
- `interactive-surface-matrix.js` adds a cervical strip below the 5-surface grid.

Bridge Terminal Logic
- Bridge positions: begin | center | end based on neighboring bridge connectors.
- Sprite halves via `clip-path: inset(...)` when composing connectors.

Perio Model
- `PerioGrid` tracks PD/GM/CAL with BOP mobility and molar furcations.
- Gingival/CAL lines render as arch polylines (flagged via V2 feature).

Notes
- Feature flag `NEXT_PUBLIC_QDENTO_CHART_V2` gates new renderer options.
- `sprite-preloader.js` preloads atlases before first render when V2 is enabled.

