# Odontogram Replacement Implementation Plan

## Objective

Replace the custom odontogram rendering stack with `react-advanced-odontogram` while keeping the backend as the clinical source of truth for patients, teeth, treatments, surfaces, perio measurements, billing, and appointments.

## Current Decision

Use the upstream module behind an adapter and feature flag first. Do not delete the existing QDento/custom chart code until the replacement chart proves these workflows:

- Patient chart load from real backend teeth.
- Chart edits save and reload through the backend.
- Treatment planning still creates normalized `Treatment` and `TreatmentToothSurface` rows.
- Primary, permanent, and mixed dentition numbers round-trip without corrupting backend tooth numbers.
- Perio measurements remain stored in the normalized perio tables.

## Implemented State

- `react-advanced-odontogram@2.2.0` is installed in the portal and its stylesheet is copied into a scoped local CSS file used only by the standalone replacement route.
- The portal aliases the package to its browser ESM bundle in `next.config.mjs`.
- The patient Teeth tab uses the existing stable clinical `DentalChart`. It links to `/patients/{id}/odontogram` for isolated replacement-chart QA.
- The standalone route `/patients/{id}/odontogram` renders the upstream odontogram preview.
- Chart visual state saves to the backend snapshot endpoint and reloads from JSONB before falling back to normalized backend teeth.
- Snapshot reads are best-effort. If the snapshot endpoint is unavailable, unauthorized, or not migrated yet, the chart still renders from normalized backend teeth.
- Backend tooth create/update rejects unsupported numbers with `422` while allowing Universal permanent `1-32`, FDI permanent `11-48`, and FDI primary `51-85`.
- Legacy child charts seeded as `1-20` are mapped as primary teeth only when the patient is in primary dentition and all backend teeth are in that legacy range.

## Package

- npm package: `react-advanced-odontogram`
- Installed version: `2.2.0`
- Peer dependencies: React 18 or 19
- Important integration constraints:
  - Client-side only in Next.js.
  - Do not import `react-advanced-odontogram/style.css` directly; the package ships broad globals such as `body`, `.layout`, `.panel`, `.card`, `.btn`, and `select`.
  - Use the scoped local copy at `src/components/odontogram/react-advanced-odontogram-scoped.css`, imported from `src/app/patients/[id]/odontogram/layout.js`.
  - Treat it as a singleton: render one odontogram instance per page.
  - Persist its full JSON payload for visual round-tripping, but keep backend tables authoritative for clinical workflows.

## Backend Implementation

### Snapshot Table

Add one snapshot row per patient:

```sql
CREATE TABLE patient_odontogram_snapshot (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL UNIQUE REFERENCES patient(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  source_version VARCHAR(50) NOT NULL DEFAULT 'react-advanced-odontogram',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
);
```

### API

Use these endpoints:

- `GET /api/patients/{patientId}/odontogram-snapshot`
- `PUT /api/patients/{patientId}/odontogram-snapshot`

The `PUT` body is:

```json
{
  "source_version": "react-advanced-odontogram@2.2.0",
  "payload": {
    "version": "2.19",
    "globals": {},
    "teeth": {}
  }
}
```

### Tooth Number Compatibility

Allow backend tooth numbers up to `99` so the API accepts:

- Universal permanent numbers `1-32`
- FDI permanent numbers `11-48`
- FDI primary numbers `51-85`

The existing unique key remains `(patient_id, tooth_number)`.

## Portal Implementation

### Files Added

- `src/lib/odontogram/tooth-map.js`
- `src/lib/odontogram/backend-to-advanced.js`
- `src/components/odontogram/advanced-odontogram-client.js`
- `src/components/odontogram/react-advanced-odontogram-scoped.css`
- `src/app/patients/[id]/odontogram/layout.js`
- `src/app/patients/[id]/odontogram/page.js`

### Next.js Package Resolution

The package root currently needs a webpack alias in `next.config.mjs` because its export map exposes only an `import` condition for `"."`, which Next 14 rejects during production build. Keep this alias unless the upstream package adds a compatible `default` export condition:

```js
config.resolve.alias['react-advanced-odontogram$'] =
  path.resolve(__dirname, 'node_modules/react-advanced-odontogram/dist/odontogram.js');
```

### Feature Flag

The patient Teeth tab does not use this flag. It always renders the stable existing chart.

The standalone preview route defaults to enabled. Set this only when you need to disable the preview route:

```bash
NEXT_PUBLIC_ODONTOGRAM_PROVIDER=legacy
```

The route renders the replacement chart unless the value is explicitly `legacy`.

### Mapping Strategy

Backend tooth numbers are mapped into the upstream FDI slot model:

- Universal `1-32` -> permanent FDI `11-48`
- Permanent FDI `11-48` -> same number
- Primary FDI `51-85` -> corresponding quadrant slot `11-45` with `toothSelection: "milktooth"`

Backend statuses are converted conservatively:

- `MISSING` -> no tooth
- `EXTRACTED` -> no tooth with extraction wound
- `IMPLANT` -> implant
- `CROWNED`/`CROWN` -> crown restoration
- `BRIDGE`/`PONTIC` -> bridge restoration
- `RCT`/`ROOT_CANAL` -> endodontic filling
- `CALCULUS`, `PERIODONTITIS`, `CARIES`, `FRACTURED` -> matching visual indicators where supported

## Rollout Steps

1. Run backend migrations and verify `patient_odontogram_snapshot` exists.
2. Open a patient profile and confirm the Teeth tab still renders the stable existing chart at full width.
3. Open `/patients/{id}/odontogram` and confirm the replacement chart renders in the isolated preview route.
4. Confirm the preview chart renders from backend teeth before any snapshot exists.
5. Make a visual edit, save the snapshot, reload the page, and confirm it round-trips.
6. Create a treatment from the existing workflow and confirm billing/treatment tables still update.
7. Compare old and new chart output for a permanent adult patient, a primary child patient, and a mixed dentition patient.
8. After QA, replace remaining legacy chart call sites one at a time:
   - Appointment treatment drawer.
   - Patient `/me` dental section.
   - Visit summary/chart preview.
9. Only remove old QDento/custom components after all call sites use the adapter and tests pass.

## Verification Checklist

- Backend build passes.
- Portal lint/build passes.
- Snapshot GET returns `404` before first save and `200` after save.
- Snapshot payload is JSONB in Postgres.
- Universal and FDI tooth numbers do not duplicate or overwrite each other.
- No page renders more than one upstream odontogram instance.
- Root `globals.css` does not import upstream odontogram CSS.
- No normal selector in `react-advanced-odontogram-scoped.css` is outside `.advanced-odontogram-scope`.
- Normal patient pages do not request the odontogram snapshot endpoint.

## Remaining Work

- Add adapter logic from upstream planned treatments into normalized `Treatment` creation.
- Add optional export buttons using upstream PNG/PDF/FHIR helpers after clinical QA.
- Decide whether perio should remain fully custom or use upstream perio visualization only.
- Add focused unit tests for tooth mapping and backend snapshot upsert.
