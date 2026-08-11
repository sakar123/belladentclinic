# React Advanced Odontogram Full Adoption Plan

## Decision

Adopt `react-advanced-odontogram` as the primary odontogram UI across the portal.

The current preview route has proven that the upstream UI is a better clinical surface than the custom Dino/QDento chart. The replacement should now move from isolated preview to the default chart, but the backend must remain the source of truth for clinical records, treatment history, billing, appointments, tooth state, surfaces, perio measurements, and audit history.

This plan supersedes the preview-only rollout posture in `docs/odontogram-replacement-implementation.md`.

## Non-Negotiables

- The upstream chart must round-trip visually without data loss.
- Backend normalized tables must still be queryable and authoritative.
- Chart edits must not become anonymous JSON only.
- Planned treatment changes must create/update real `Treatment` rows before they affect appointments, billing, reports, or tooth status.
- Completed treatments must update real backend tooth status and then rehydrate the odontogram.
- Perio values must persist to existing `PerioStatus` / `PerioMeasurement` tables, not only to the chart snapshot.
- The app must render only one upstream odontogram instance per page unless the fork removes the package singleton constraint.
- Rollback to the current `DentalChart` must remain available until all patient, appointment, treatment drawer, `/me`, and perio workflows pass QA.

## Current State

Already implemented:

- `react-advanced-odontogram@2.2.0` is installed.
- `/patients/{id}/odontogram` renders the upstream preview.
- The package CSS is scoped locally under `.advanced-odontogram-scope`.
- `patient_odontogram_snapshot` JSONB persistence exists.
- `GET/PUT /api/patients/{patientId}/odontogram-snapshot` exists.
- Portal adapter maps backend teeth/statuses into the upstream chart payload.
- The patient Teeth tab still uses the stable custom `DentalChart`.
- A chunk-load recovery script and standalone asset postbuild step are in place for reliable local/prod serving.

Current odontogram call sites to replace:

- `clinic-portal/src/app/patients/[id]/page.js`: patient Teeth tab.
- `clinic-portal/src/app/appointments/[id]/page.js`: appointment detail chart instances.
- `clinic-portal/src/components/treatments/treatment-drawer.js`: treatment selection chart.
- `clinic-portal/src/app/me/page.js`: patient self-service teeth chart.
- `clinic-portal/src/app/patients/[id]/odontogram/page.js`: preview route, which should become either the canonical full-screen chart route or redirect to the patient Teeth tab after replacement.
- `clinic-portal/src/components/dental/perio-grid.js`: current custom perio entry UI, to be replaced or bridged with upstream `PerioChart`.

## Target Architecture

Use three persistence layers:

1. Lossless upstream snapshot

   Store the exact upstream status chart and plan chart JSON so every UI detail round-trips even when our normalized schema does not yet understand a field.

2. Parsed per-tooth chart state

   Store one JSONB row per patient/tooth/chart kind so the backend can diff, audit, and rehydrate safely without only relying on one large blob.

3. Normalized clinical projections

   Sync clinically meaningful changes into existing backend tables:

   - `tooth`
   - `tooth_status`
   - `treatment`
   - `treatment_tooth`
   - `treatmenttoothsurface`
   - `periostatus`
   - `periomeasurement`
   - billing/service records when treatment workflows explicitly create billable work

The snapshot is the visual round-trip source. The normalized tables are the clinical source.

## Backend Data Model Changes

Keep `patient_odontogram_snapshot`, but extend the backend with versioned parsed state.

Add `odontogram_tooth_state`:

```sql
CREATE TABLE odontogram_tooth_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  tooth_id UUID NULL REFERENCES tooth(id) ON DELETE SET NULL,
  backend_tooth_number INT NOT NULL,
  advanced_tooth_number INT NOT NULL,
  chart_kind VARCHAR(20) NOT NULL, -- Status | Plan
  state_json JSONB NOT NULL,
  state_hash VARCHAR(128) NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(50),
  UNIQUE(patient_id, chart_kind, backend_tooth_number)
);
```

Add `odontogram_plan_item`:

```sql
CREATE TABLE odontogram_plan_item (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  appointment_id UUID NULL REFERENCES appointment(id) ON DELETE SET NULL,
  treatment_id UUID NULL REFERENCES treatment(id) ON DELETE SET NULL,
  backend_tooth_number INT NULL,
  advanced_tooth_number INT NULL,
  axis VARCHAR(80) NOT NULL,
  from_json JSONB NULL,
  to_json JSONB NOT NULL,
  proposed_service_id UUID NULL REFERENCES service(id),
  proposed_surfaces VARCHAR(20) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Draft', -- Draft | Committed | Dismissed
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50),
  updated_by VARCHAR(50)
);
```

Add optional audit table if no general audit exists:

```sql
CREATE TABLE odontogram_audit_event (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patient(id) ON DELETE CASCADE,
  event_type VARCHAR(80) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(50)
);
```

## Backend API Changes

Add a full state endpoint:

```http
GET /api/patients/{patientId}/odontogram-state
```

Returns:

```json
{
  "patient_id": "uuid",
  "source_version": "react-advanced-odontogram@2.2.0",
  "schema_version": 1,
  "row_version": "etag-or-updated-at-hash",
  "status_chart": { "version": "2.19", "globals": {}, "teeth": {} },
  "plan_chart": { "version": "2.19", "globals": {}, "teeth": {} },
  "teeth": [],
  "treatments": [],
  "latest_perio": null,
  "plan_items": []
}
```

Add a save endpoint:

```http
PUT /api/patients/{patientId}/odontogram-state
If-Match: <row_version>
```

Body:

```json
{
  "source_version": "react-advanced-odontogram@2.2.0",
  "status_chart": { "version": "2.19", "globals": {}, "teeth": {} },
  "plan_chart": { "version": "2.19", "globals": {}, "teeth": {} },
  "plan_changes": [],
  "client_saved_at": "2026-08-09T00:00:00Z"
}
```

Behavior:

- Validate patient exists.
- Validate JSON object shape and payload size.
- Upsert `patient_odontogram_snapshot`.
- Upsert `odontogram_tooth_state` rows for status and plan charts.
- Parse supported status fields into normalized tooth projections.
- Parse plan differences into draft `odontogram_plan_item` rows.
- Return `409 Conflict` on stale `If-Match`.
- Return `422 Unprocessable Entity` for clinical validation failures.

Add a plan commit endpoint:

```http
POST /api/patients/{patientId}/odontogram-plan/commit
```

Body:

```json
{
  "appointment_id": "uuid",
  "staff_id": "uuid",
  "plan_item_ids": ["uuid"],
  "default_status": "Planned"
}
```

Behavior:

- Converts selected plan items into real `Treatment` rows.
- Links teeth through `treatment_tooth`.
- Writes surfaces into `treatmenttoothsurface`.
- Does not create billing unless the existing treatment/service workflow says it should.
- Marks plan items as `Committed`.
- Rehydrates status/plan chart from backend response.

Add a perio sync endpoint only if the upstream `PerioChart` cannot be cleanly wired to existing `POST /api/perio`:

```http
PUT /api/patients/{patientId}/odontogram-perio
```

Otherwise, keep using:

- `GET /api/perio/latest?patientId=...`
- `POST /api/perio`

## Backend Services

Add `IAdvancedOdontogramService` / `AdvancedOdontogramService`.

Responsibilities:

- Load full odontogram state for a patient.
- Merge saved snapshot with current normalized backend records.
- Persist snapshot and parsed tooth states in one transaction.
- Compute plan differences.
- Create/dismiss/commit plan items.
- Apply clinical validation through existing `ToothStatusValidator` and `TreatmentService`.
- Never let chart JSON bypass tooth/treatment/perio validation.

Add `IAdvancedOdontogramMapper`.

Responsibilities:

- Convert backend teeth/treatments/perio into upstream `status_chart`.
- Convert upstream `status_chart` into parsed backend tooth state.
- Convert upstream `plan_chart` and `getPlanChanges()` output into draft plan items.
- Preserve unknown fields in JSONB instead of dropping them.

## Mapping Rules

### Tooth Existence

- `toothSelection: "tooth-base"` -> present permanent tooth.
- `toothSelection: "milktooth"` -> present primary tooth.
- `toothSelection: "none"` -> missing tooth when no extraction wound exists.
- `extractionWound: true` -> extracted/recent extraction.
- `toothSelection: "implant"` -> implant.
- `toothSelection: "tooth-under-gum"` -> impacted/unerupted.

### Restorations

- `restorationType: "crown"` -> CROWN/CROWNED dominant status and, in plan mode, a Crown service candidate.
- `restorationType: "bridge"` -> bridge/pontic candidate; validate at least two teeth before commit.
- `restorationType: "veneer"` -> veneer candidate.
- Inlay/onlay/filling material states -> store surfaces and materials in parsed tooth state; map to treatment candidates only after explicit plan commit.

### Endodontics

- `endo` values -> RCT/post/endodontic finding.
- Plan-mode endo changes -> root canal/post service candidates.
- Completion must still call `POST /api/treatments/{id}/complete` so tooth status and treatment history update consistently.

### Caries and Surface Findings

- Caries, ICDAS, secondary caries, root caries, and radiographic depth must be losslessly stored in `odontogram_tooth_state.state_json`.
- If the finding is treatment-plan relevant, create a draft plan item.
- Do not collapse detailed caries states into only one `tooth_status_id`; use `tooth_status_id` only as a derived quick-view status.

### Perio

- Six-site PD, GM, CAL, BOP, mobility, and furcation must persist to `PerioMeasurementDTO`.
- Upstream perio rows with no backend equivalent should remain in `odontogram_tooth_state` or snapshot JSON until a schema extension is added.
- Use the upstream `PerioChart` for UI if it can be seeded and exported reliably; otherwise fork the package to expose stable `getPerioChart` / `setPerioChart` APIs.

### Notes

- Per-tooth notes remain in chart JSON and parsed tooth state.
- Do not convert them into clinical documents automatically.
- Later, add a deliberate "Promote to clinical note" action if needed.

## Frontend Plan

### New Wrapper

Create:

```text
clinic-portal/src/components/odontogram/clinical-odontogram.js
```

Props:

```js
{
  patientId,
  appointmentId,
  mode, // "patient" | "appointment" | "treatment-picker" | "patient-self" | "readonly"
  readOnly,
  selectionMode, // "none" | "single" | "multiple" | "surface"
  selectedTeeth,
  selectedSurfacesMap,
  onSelectionChange,
  onSurfaceSelectionChange,
  onPlanItemsChange,
  className
}
```

Responsibilities:

- Fetch `GET /api/patients/{id}/odontogram-state`.
- Hydrate upstream status chart with `importStatus`.
- Hydrate upstream plan chart with `setPlanChart`.
- Subscribe to edits with `onStateChange`.
- Debounce autosave to `PUT /api/patients/{id}/odontogram-state`.
- Provide manual Save, Reload, Commit Plan, and Dismiss Plan Item controls.
- Emit selected teeth/surfaces to treatment forms.
- Respect the singleton constraint by rendering one chart per page.

### Fork Requirement

Fork or vendor the package before full replacement if these host controls are not available cleanly:

- `onToothSelectionChange`.
- `selectedTeeth` / `setSelectedTeeth`.
- `selectedSurfaces` / `setSelectedSurfaces`.
- `getPerioChart` / `setPerioChart`.
- Hide/show built-in topbar sections.
- Hide/export library controls when the portal provides its own save/export actions.
- Instance-scoped state instead of module singleton, or a documented one-instance mode.
- Fully scoped CSS emitted from the package, not broad globals.
- Stable TypeScript types for chart payload and tooth state.

Recommended fork package name:

```text
@belladent/react-advanced-odontogram
```

Keep the fork as close to upstream as possible. Do not rewrite the visual renderer unless needed for host integration.

## Replacement Sequence

### Phase 1: Adopt on Patient Teeth Tab

Replace `DentalChart` in `patients/[id]/page.js` with `ClinicalOdontogram`.

Acceptance criteria:

- Adult, child, and mixed dentition charts load.
- Crown, implant, missing, extraction, bridge, filling, and RCT visuals appear.
- Manual Save persists snapshot and parsed tooth states.
- Reload restores the same visuals.
- Treatment completion still updates the chart after refresh.
- "Open replacement preview" button is removed or changed to "Open full screen".

### Phase 2: Plan-to-Treatment Workflow

Add a "Commit Plan" flow above or beside the odontogram.

Flow:

1. User edits the plan chart.
2. App calls `getPlanChanges()`.
3. Backend converts changes into draft `odontogram_plan_item` rows.
4. UI shows draft items with inferred service, teeth, surfaces, and warnings.
5. User selects appointment/staff/service overrides.
6. Commit creates real treatments.
7. Existing treatment list and billing flows refresh.

Acceptance criteria:

- Crown fitting on James Jackson becomes a real planned treatment and remains visible.
- Completing the treatment changes the tooth status and the odontogram visual.
- Surface-based fillings produce `treatmenttoothsurface` rows.

### Phase 3: Replace Treatment Drawer Chart

Current drawer renders a second `DentalChart`; upstream package is singleton. Do not render two upstream charts at the same time.

Options:

- Preferred: convert the treatment drawer into a side panel attached to the single page-level `ClinicalOdontogram`.
- Alternative: when the drawer opens, unmount the read-only appointment chart and remount `ClinicalOdontogram` in picker mode.

Acceptance criteria:

- Multi-tooth selection works.
- Surface selection works.
- Arch shortcuts work.
- Whole-mouth treatments still work without requiring chart selection.
- The selected teeth map back to backend tooth numbers before saving treatments.

### Phase 4: Replace Appointment Detail Charts

Replace appointment page odontogram instances with `ClinicalOdontogram`.

Acceptance criteria:

- Appointment chart opens with patient state.
- Treatment creation uses selected teeth/surfaces from the upstream chart.
- Existing appointment treatments render as plan/status overlays.
- No page renders two upstream odontogram instances at once.

### Phase 5: Replace `/me`

Replace the patient self-service chart with read-only or limited interaction mode.

Acceptance criteria:

- Patient can view tooth state.
- Patient cannot create clinical chart edits unless explicitly allowed.
- "Schedule appointment with selected tooth" still works.

### Phase 6: Replace Perio UI

Use upstream `PerioChart` as the default perio chart if the fork exposes reliable state import/export. Otherwise keep the current `PerioGrid` temporarily and place it under the same odontogram page until the fork exposes perio APIs.

Acceptance criteria:

- PD, GM, CAL, BOP, mobility, and furcation save to backend.
- Latest perio data rehydrates into the chart.
- Perio statistics endpoint still works.
- Reports use normalized perio records, not just snapshot JSON.

### Phase 7: Remove Legacy Chart

After all call sites pass QA:

- Remove `DentalChart` imports from patient, appointment, treatment drawer, and `/me`.
- Keep old dental components for one release behind `NEXT_PUBLIC_ODONTOGRAM_PROVIDER=legacy`.
- Then delete unused Dino/QDento files, sprite preloader, treatment overlay, surface panel, macro buttons, custom perio line overlays, and old tests.

## Frontend Save Behavior

Use explicit save first, then add autosave after QA.

Recommended behavior:

- Every chart edit marks local state dirty.
- Manual Save persists status/plan chart and parsed state.
- A 10-15 second debounced autosave can be added after reliability is proven.
- Navigation away with dirty state prompts the user.
- Save failure shows an actionable toast and does not clear dirty state.
- `409 Conflict` reloads latest backend state and asks the user to reapply changes.

## Security and Compliance

- Do not send chart state to any third-party service.
- Store all chart data in the clinic backend only.
- Require `AllStaff` for read, `SupportOrAbove` for save, and `ClinicalOrAbove` for completing or clinically committing treatments.
- Store `created_by` / `updated_by` from authenticated staff context.
- Validate patient ID ownership on every save.
- Limit JSON payload size.
- Whitelist expected chart fields when projecting into normalized tables.
- Preserve unknown JSON fields only in snapshot/per-tooth JSONB, not as trusted clinical facts.

## Testing Plan

Backend tests:

- Snapshot upsert.
- Full odontogram-state save.
- Per-tooth state upsert.
- Status chart -> tooth status projection.
- Plan chart -> draft plan items.
- Plan item commit -> treatment rows.
- Surface map persistence.
- Perio payload persistence.
- Concurrency conflict on stale row version.
- Invalid tooth numbers rejected.

Frontend tests:

- Payload mapper round-trips backend adult/permanent teeth.
- Payload mapper round-trips primary and mixed dentition.
- Dirty/save/reload behavior.
- Plan changes produce draft items.
- Treatment picker returns backend tooth numbers.
- Read-only mode prevents edits.

E2E QA:

- James Jackson crown fitting.
- Adult implant case.
- Missing/extraction case.
- Multi-surface filling case.
- Bridge case across multiple teeth.
- Primary dentition child.
- Mixed dentition child.
- Perio chart save/reload.
- `/me` read-only chart.
- Appointment treatment drawer.

## Rollback

Keep this flag until adoption is complete:

```bash
NEXT_PUBLIC_ODONTOGRAM_PROVIDER=legacy
```

Rollback should:

- Render old `DentalChart`.
- Keep backend normalized data intact.
- Leave upstream snapshots in place for future re-enable.
- Avoid deleting snapshots or parsed state.

## Recommended Implementation Order

1. Fork/vendor package only for host integration hooks and CSS scope.
2. Add backend full odontogram-state DTOs, service, mapper, and endpoints.
3. Add `odontogram_tooth_state` and `odontogram_plan_item` migrations.
4. Build `ClinicalOdontogram` wrapper.
5. Replace patient Teeth tab.
6. Implement plan-to-treatment commit.
7. Replace treatment drawer and appointment charts without violating singleton constraints.
8. Replace `/me`.
9. Replace perio UI.
10. Run full QA and remove legacy chart only after one stable release.

## Key Risk

The biggest risk is not visual rendering. The preview already proves the visual UI is better.

The real risk is clinical data integrity: chart changes must become backend teeth, findings, perio measurements, and treatments in a controlled, auditable way. The correct implementation is therefore snapshot plus parsed state plus normalized projection, not snapshot-only persistence.
