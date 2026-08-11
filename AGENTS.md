# Agent Guide and Working Notes (Clinic Suite)

Scope: Root — applies to the entire repository and all subprojects.

Purpose: Keep persistent context for human contributors and AI agents so work can resume smoothly after breaks. This file is the single source of truth for project state, decisions, and next actions. Update it when you start/finish a work session.

## Agent Checklist
- Read this entire file before making changes.
- Follow the Runbook to start services locally when needed.
- Respect Conventions and Decisions when adding/modifying code.
- Update Session Log (append a new dated entry) and Next Actions.
- Keep changes minimal and focused; avoid unrelated refactors.

## Project Overview
- Backend: `clinic-backend` — .NET 9 Web API (controllers/services for patients, appointments, billing, prescriptions, staff, roles, specialties, teeth, documents, sales, services). Tests in `ClinicApi.Tests` (xUnit + FluentAssertions). Dockerfile supports API and tests.
- Frontend Portal: `clinic-portal` — Next.js App Router app for staff/patient portal. Uses `NEXT_PUBLIC_API_BASE_URL` to reach the API. Contains dev-only mock API routes under `src/app/api/*` for local development without the backend.
- Landing: `clinic-landingpage` — Next.js marketing site.
- Database: `clinic-db` — Postgres schema + seed SQL. Compose mounts these for first boot.
- Orchestration: `docker-compose.yml` with profiles: `db`, `api`, `tests`, `portal`, `landing`.

## Repository Map
- Root
  - `docker-compose.yml` — defines services: `db` (Postgres), `api` (Clinic API), `api-tests` (test runner), `portal` (Next.js portal), `landing` (static site on Nginx). Uses profiles to start subsets.
  - `README.md` — brief description for landing repo name.

- clinic-backend
  - Solution: `clinic-backend/Clinic-Api.sln`
  - Projects:
    - API: `clinic-backend/ClinicApi`
      - Controllers: `ClinicApi/Controllers/*` (Appointments, Billing, Documents, Patient, Role, Sale, Specialty, Staff, Teeth, Treatment, etc.)
      - Services: `ClinicApi/Services/Implementations/*`
      - Data/EF: `ClinicApi/Data/*` (context and generic repository)
      - Models: `ClinicApi/Models/{Entities,DTOs}`; Mappers in `ClinicApi/Mappers/*`
      - Entry point: `ClinicApi/Program.cs`
      - Port: 8080 (via ASPNETCORE_URLS)
      - Env: `ConnectionStrings__clinicDbConnection` (compose sets `Host=db;Database=clinic_db;...`)
    - Tests: `clinic-backend/ClinicApi.Tests` (xUnit + FluentAssertions)
      - Unit and Integration tests by domain (e.g., `Integration/AppointmentApiTests.cs`)
  - Dockerfile: multi-stage
    - `api` target — publishes and runs the API
    - `tests` target — runs `dotnet test` for the solution

- clinic-db
  - Schema: `clinic-db/database-schema.sql` (uses `uuid-ossp`, enums for genders/billing status/payment methods; tables: role, specialty, person, staff, patient, appointment, service, treatment, prescriptions, billing, payments, teeth, etc.)
  - Seed: `clinic-db/insert-statement.sql`
  - Compose: `db` service (image `postgres:16-alpine`, port `5433:5433`, volume `pgdata`, mounts schema/seed to `/docker-entrypoint-initdb.d`)

- clinic-portal (Patient/Staff management portal)
  - Framework: Next.js (App Router)
  - Build: Dockerfile builds standalone Next.js and runs `server.js` (Node 20, non-root user). Exposes port 3000.
  - Compose: `portal` service (maps `3000:3000`, depends on `api`, `env_file: clinic-portal/.env.local`).
  - API base: `NEXT_PUBLIC_API_BASE_URL` (compose uses `http://api:8080` inside the network).
  - Auth: Auth0 via `src/middleware.js`; configure `AUTH0_*` in `.env.local`.
  - Dev mocks: `src/app/api/*` provide in-memory routes (e.g., Patient, Staff, Appointment, Treatment, Teeth, send-email, send-sms) for local dev without the backend.
  - Notable pages: Patients, Appointments, Services, Billing, Documents, Staff, Reports, Settings, Comms, Me.

- clinic-landingpage (Marketing site with appointment booking)
  - Framework: Next.js static export served by Nginx (Dockerfile uses `next export` → `/out`, then copies to Nginx).
  - Compose: `landing` service (maps `3001:80`).
  - API usage: Appointment booking should call the same Clinic API as the portal. Because this is a static export, configure absolute API URLs at build time (or inject via runtime config) to reach the `api` service in Docker or the public API URL in production.

Data Flow
- Landing and Portal → Clinic API (`clinic-backend/ClinicApi`) → Postgres (`clinic-db`).
- Portal dev-only routes can simulate API; prefer the real API when running via Docker Compose.

## Runbook
Local with Docker Compose (preferred):
- Start DB only: `docker compose --profile db up -d`
- Start API (waits for DB): `docker compose --profile api up --build`
- Run API tests: `docker compose --profile tests run --rm api-tests`
- Start Portal (depends on API): `docker compose --profile portal up --build`
- Start Landing: `docker compose --profile landing up --build`

Direct development (without Docker):
- DB: Postgres 16; apply `clinic-db/database-schema.sql` then `insert-statement.sql`.
- API: .NET 9 SDK. From `clinic-backend/ClinicApi`: `dotnet run`.
- Tests: From `clinic-backend`: `dotnet test Clinic-Api.sln`.
- Portal: Node 18+. From `clinic-portal`: `npm i && npm run dev`.
- Landing: From `clinic-landingpage`: `npm i && npm run dev`.

Environment variables and endpoints:
- Compose sets `ConnectionStrings__clinicDbConnection` for the API (host `db`).
- Portal talks to API via `NEXT_PUBLIC_API_BASE_URL` (compose uses `http://api:8080`).
- Auth0 (portal): set `AUTH0_SECRET`, `AUTH0_BASE_URL`/`APP_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` in `clinic-portal/.env.local`.
- Optional comms: `TWILIO_*`, `SENDGRID_API_KEY`, `EMAIL_FROM` enable real sends; otherwise routes simulate success.

## Conventions
- API DTOs use snake_case in payloads. Portal transforms snake_case ↔ camelCase via `src/lib/utils.js` and `src/lib/http.js`.
- Keep controllers thin; business logic in Services; use Mappers for DTO ↔ Entity.
- Prefer small, focused commits and PRs. Include rationale in the Session Log here.

## Decisions and Context
- Portal mock API routes exist under `clinic-portal/src/app/api/*` for local/dev. In Docker or production, point `NEXT_PUBLIC_API_BASE_URL` to the real API and avoid hitting these mocks.
- Appointment views currently fetch all appointments then client-filter by visible range. For scale, add server-side range filtering (see Next Actions).
- Some backend mapper navigation properties have TODOs left `null` intentionally to avoid cycles unless specifically requested by endpoints.

## Next Actions (short, actionable)
- Add appointment range filtering on API (query params or search endpoint) and update portal requests accordingly.
- Decide whether to disable portal mock routes in non-dev builds (e.g., by convention or build-time flag).
- Resolve/confirm mapper TODOs for related objects (only if API needs to return expanded graphs).
- Finalize Auth0 roles/claims and expand middleware protection to more routes as needed.
- Add CI to build API, run tests, and lint portal; optionally compose-based integration job.
- QA the adopted `ClinicalOdontogram` against adult, pediatric, and mixed dentition patients; verify save/reload, plan commit, drawer selection, appointment page, `/me`, and the full-screen route with the real API.
- Decide whether to fork/vendor `react-advanced-odontogram` for stable host APIs for selected teeth, surfaces, and perio import/export; current integration bridges those gaps outside the package.
- Keep `NEXT_PUBLIC_ODONTOGRAM_PROVIDER=legacy` rollback until advanced-chart QA passes on real seeded and production-like data.
- Repair existing backend test-project compile drift so `dotnet test Clinic-Api.sln` can run again.
- QA crown fitting on James Jackson or another seeded adult patient: planned crown should show a blue dashed crown cue; completed crown should show the CROWNED tooth status after refresh.
- QA Auth0 session persistence across protected pages after refresh/direct navigation; confirm the Auth0 app allows refresh tokens for the local SPA client.
 - Optional: Add docker-compose.dev.yml for hot-reload (dotnet watch, next dev) to avoid rebuilds during active development.
 - Optional: Switch compose DB to custom image on 5433 or keep simple 5433 image; align API connection string accordingly.

## Session Log
- 2025-09-18: Established this AGENTS.md as persistent context. Current compose orchestrates db/api/portal/landing. DB schema + seeds ready. Backend has controllers/services and tests; minor mapper TODOs present. Portal integrates Auth0 and mock API routes; HTTP client uses snake/camel transforms; appointment range improvement recommended. Landing site ready with Dockerfile. Proposed Next Actions above.

- 2025-09-19: Dockerized local DB via clinic-db/Dockerfile.DB (Postgres 16) listening on 5433; seeds from database-schema.sql and insert-statement.sql. Added scripts/db-clean-and-stop.sh to run cleanup SQL then stop container. Enabled EF Core DbContext in API (Program.cs) to consume connection string from appsettings; added appsettings.Docker.json and enabled Swagger for Docker env; added Dev/Docker CORS policy (allows localhost:3000/3001). For portal, added proxy rewrite (/backend → API) and compose env, then documented CORS-first approach with NEXT_PUBLIC_API_BASE_URL from .env.production; allowed .env.production in .dockerignore. Fixed build error by defining Field component in patients/[id]/page.js. Provided docker build/run commands for DB, API, and portal; noted when rebuilds are required and proposed a dev compose for hot reload.

- 2025-09-19 (later): End-to-end alignment and UX improvements.
  - Backend alignment with DB schema
    - Person: nullable email/phone_number/address/a_identifier to match DB.
    - Patient/Staff mappers/services now load and include Person in DTOs (UI can render names/emails).
    - Staff: fixed FK attribute (person_id), corrected updated_by; license_number nullable; mapper coalesces to "".
    - Service/Document/Tooth/Role/Specialty/AppointmentStatus: nav nullability and collections initialized per schema.
    - Treatment: replaced non-existent tooth_id with tooth_number (int?); removed Tooth nav; updated mapper, seeds.
    - Staff delete: if FK violation (appointments exist), API returns 409 Conflict with friendly message instead of raw 500.
  - Portal adjustments
    - Disabled auth for dev; removed checks/middleware so CRUD is frictionless.
    - White-first theme (blue secondary, pink accent). Forced light mode; updated buttons (default/secondary/accent) and inputs.
    - HTTP client fixed same-origin path construction; .env.local sets NEXT_PUBLIC_API_BASE_URL=http://localhost:8080.
    - Normalizers (patients/staff) flatten nested person and handle snake/camel and enum coercion.
    - Patients/Staff lists: show names/phones/emails; role dropdown; license number handled; delete shows friendly error per API.
    - Appointments calendar:
      - Create/Update/Reschedule now map UI fields to API DTO (patient_id, staff_id, status_id, appointment_start_time, duration_minutes, reason_for_visit, notes).
      - Month view shows compact time note (up to 5 times, then +N more); chip sizes adapt for dense days.
      - Clicking an appointment fetches full details; View dialog shows status/date/time/duration, staff, and patient (clickable to /patients/{id}).
    - Treatments: switched API routes to plural (/api/Treatments). Patient page shows treatments; Create Treatment dialog now supports:
      - Using an existing appointment (combobox), or creating a new appointment (staff, status, start/end) before creating the treatment; posts mapped DTOs accordingly.
  - Tests: adjusted seeds to use treatment.tooth_number instead of tooth_id and ensured DocumentType column mapping.

- 2025-12-02: Fix Postgres enum binding for gender. Added model-level enum registrations in `DentalClinicContext` with `HasPostgresEnum<...>` and imported `Npgsql.EntityFrameworkCore.PostgreSQL`; keeps `gender`/`bill_status`/`payment_method` columns mapped to their Postgres enums so inserts from LandingPage no longer bind as Int32.
  
  - Added structured error logging for enum/DB issues:
    - PatientService: log raw/parsed gender and detailed PostgresException fields on SaveChanges failures.
    - AppointmentService: wrap SaveChanges with detailed PostgresException logging including FK IDs and parsed datetime.

- 2025-12-12: Unified file logging with Serilog for full runtime.
  - Added `RequestLoggingContextMiddleware` to enrich all logs with correlation ID, request ID, method, path, query, client IP, user agent, and user info.
  - Configured Serilog sinks in `appsettings*.json` for console + rolling file `logs/clinic-api-.log` with 30-day retention; removed hard-coded sinks in Program to rely on config.
  - Kept Serilog request logging enabled; bootstrap logger still writes console+file during early startup.

- 2026-03-09: CORS origins now read from configuration.
  - Program.cs loads optional `appsettings.local.json` overlay and reads `Cors:AllowedOrigins` array for the CORS policy (no typed models).
  - Added `clinic-backend/ClinicApi/appsettings.local.json` with localhost:3000/3001 and 127.0.0.1 equivalents.
  - Updated `appsettings.Production.json` to allow `https://belladentclinic.com`; enabled `UseCors` in all environments.
  - Landing page API client (`clinic-landingpage/src/lib/api.js`) sends an explicit OPTIONS preflight before API requests when cross-origin.

- 2026-03-29: Fixed CORS preflight for landing page.
  - Added `app.UseRouting()` before `app.UseCors("DevCors")` in `ClinicApi/Program.cs` to ensure proper preflight handling.
  - Decorated `LandingPageController` with `[EnableCors("DevCors")]` and added explicit `OPTIONS` endpoints for `reviews` and `appointment` to satisfy manual preflight from the static site.
  - Verified production `Cors:AllowedOrigins` includes `https://belladentclinic.com` and `https://www.belladentclinic.com`.
  - Added `EnvironmentName` key to all `appsettings*.json` and a startup log line in `Program.cs` that prints both the runtime ASP.NET Core environment and the configured `EnvironmentName`.
  - Introduced `ClinicSettings.ClinicEmail` in all appsettings files and used it in `AppointmentService` to send the clinic notification email for landing page bookings.

- 2026-03-31: Portal UI redesign (BellaDent branding).
  - Updated global theme (softer bg, subtle borders, teal/sky accents) and elevated card shadows for depth.
  - New gradient header with BellaDent logo from landing page, quick actions (New Appointment, New Patient), and improved search.
  - Sidebar refreshed with logo, modern active states, and a Settings shortcut; maintains collapse behavior.
  - Dashboard rebuilt: KPIs (patients, today, next 7 days, invoices), a 7‑day appointments line chart (Recharts), and upcoming list.
  - Patients page redesigned to card grid with avatars, email/phone icons, and search filtering; Appointments page similarly modernized with status pills.
  - No backend or DB changes; all data wired to existing API calls. Assets copied from `clinic-landingpage/public/images` to `clinic-portal/public/images`.

- 2026-03-31 (later): Production readiness sweep for portal.
  - Header made full-width; sidebar and pages brought to consistent card-based design with icons/avatars.
  - Staff, Billing, Documents, Reports redesigned; Services converted to cards with search; Lookups header polished.
  - Fixed API call bug in appointment details (singular delete); added 404 (`not-found.js`) and error boundary (`error.js`).
  - Dev-only API routes under `src/app/api/*` now return 404 in production unless required env is present for send-email/send-sms.
  - Login page styled and routes back to `/`; currency switched to `Rs`.

- 2026-03-31 (final): Portal UX enhancements and utilities.
  - Global search page (`/search`) with header search navigation; results across patients, staff, appointments.
  - Added route-level skeletons (`loading.js`) for core pages and app-wide `not-found`/`error` fallbacks.
  - Reusable UI: `Empty`, `StatusPill`, `Money`, and floating action buttons (FAB) for quick create.
  - Appointment and Patient detail pages updated to card-based layouts with icons and pills.
  - Added Services “New” page with name/cost/specialty form (uses existing API); dev API routes remain disabled in prod.

- 2026-03-31 (final+): API fixes + clinical workflows.
  - Backend: fixed 400 on POST /api/service by accepting empty/invalid specialty_id as null via a custom Guid? JSON converter; ServiceDTO.description nullable.
  - Backend: enforced UTC DateTime conversions globally; explicitly mapped DATE columns (dob/issue/due) to avoid Npgsql Kind=Unspecified errors.
  - Backend: added `POST /api/document/upload` to store files under `uploads/<patient>` and create Document rows.
  - Backend: (reverted) Removed temporary billing line items controller; flows now create a simple Billing row instead.
  - Portal: global loading overlay provider + fetch monkey patch to prevent double-clicks and show pretty loading for all mutating actions; upgraded app-level `loading.js` to animated branded loader.
  - Portal: Appointment details — Add Service dialog (inline create service if not listed, quantity, discount, lab flag) creates Billing line item; Reschedule dialog updates time/staff/status; status pill added near title.
  - Portal: Patient details — Documents tab now supports uploads to API; refreshes after upload.

## Recent Commands and Tips
- API run (local): from `clinic-backend/ClinicApi` → `dotnet run`
- Portal run (local): from `clinic-portal` → `npm run dev` (ensure `.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`)
- Quick API checks:
  - Patients: `curl -sS http://localhost:8080/api/Patient | jq 'length, .[0].person'`
  - Staff:    `curl -sS http://localhost:8080/api/Staff   | jq 'length, .[0].person'`
  - Appt:     `curl -sS http://localhost:8080/api/Appointment | jq 'length, .[0]'`
  - Treatments: `curl -sS http://localhost:8080/api/Treatments | head`

## Notes for Future Agents
- DTOs are snake_case at the API boundary; the portal’s HTTP client auto-converts, but normalization ensures nested person fields are flattened for rendering.
- Treatments reference teeth via `tooth_id` (FK). The API also accepts `tooth_number` and resolves it to the patient’s tooth; create the tooth first if it doesn’t exist.
- Staff deletion will likely fail if the staff has appointments; the API returns 409 with guidance. Prefer deactivation (is_active) or reassignment flow.
- AppointmentStatus dropdowns should use `id` as value; API expects `status_id` in DTOs.
- When changing entities, confirm DB schema compatibility and update mappers + seeds; coordinate with portal normalizers.

How to use this log: Append a new entry on each work session with date, what changed, and any decisions taken. Keep it concise (3–6 lines).

## Session Log (new entries)
- 2026-05-02: Treatment validation error handling.
  - Backend: `POST/PUT /api/treatments` now catch service-level `InvalidOperationException` clinical rule failures and return `422 Unprocessable Entity` with a structured `{ message }` body instead of surfacing as unhandled 500s.
  - Preserves the existing root-canal-on-implant guardrail while making the API response intentional for the portal/client.

- 2026-04-05: Portal polish + defaults.
  - Buttons: primary hover no longer flips to white; now uses lighter teal (`hover:bg-teal-600`).
  - Forms: Patients/New and Staff/New (admin and staff modal) now use a Gender dropdown with values Male/Female/Other and send those exact tokens to the API.
  - Appointments: default view switched from List to Week.

- 2026-04-05: Treatment completion auto-updates tooth status (full-stack).
  - DB: Added `service.resulting_tooth_status_id` (nullable FK) and `treatment.status` + `treatment.completed_at` with status check constraint.
  - Seeds: Mapped services to statuses (Extraction→MISSING, Root Canal→RCT, Crown→CROWNED, Filling→FILLED); set seeded treatments to Completed.
  - Backend: Entities/DTOs/Mappers updated; TreatmentService includes service nav, exposes Complete/Cancel; TreatmentsController adds POST `/{id}/complete|cancel`; EF config sets Service→ToothStatus relation and default status.
  - Frontend: api.treatments.complete/cancel added; Dental chart ToothDetailPanel shows status badge, service name, resulting status arrow, dates; adds Complete action that revalidates treatments and refreshes tooth statuses.
 
- 2026-04-10: QDento Odontogram & Perio integration (phase 1).
  - Backend: Added PerioController + PerioService with entities mapped; endpoints `GET /api/perio/latest?patientId=...` and `POST /api/perio` to persist measurements. Wired DI registration. Added basic clinical validations in TreatmentService (block surface-based plans on missing/extracted, RCT on implants, bridge requires >=2 teeth). Soft-delete treatments now voids via cancel; added `POST /api/treatments/{id}/void` alias. Included treatment.surfaces in creation/update and in Billing description; updated SQL schema to include `periostatus`, `periomeasurement`, and `treatmenttoothsurface` for Compose.
  - Frontend: DentalChart now overlays mobility (roman numerals) and furcation (triangles) from latest perio; Treatment drawer sends `surfaces` (MO, MOD, etc.) to API; Patient page adds a Periodontal Chart section (editable grid) that posts to `/api/perio` and displays values >=4mm in red.
  - Notes: Rendering stack matches QDento (base→missing/impacted→existing/planned/completed layers). Multi-tooth arch macros are available in Treatment drawer; patient page has quick region selectors. Further parity items queued (supernumeral handling, additional detailed surface incompatibility checks, richer perio visuals).
- 2026-04-02: Notifications feature (portal).
  - Portal: Added Notifications hub at `/notifications` with four tabs — Send Reminder (filters appointments by date range, selects recipients, preview + dispatch via backend), Campaign (audience+topic selection, dynamic filters, preview, create & launch), Quick Send (one-off email to a patient/staff with optional JSON payload), and History (lists campaigns and shows delivery stats).
  - Components: Created reusable `RecipientSelector`, `CampaignPreviewCard`, `DeliveryStatsCard`, `TopicSelector`, and `AudienceFilterForm` under `src/components/notifications` using existing UI primitives.
  - API: Extended `src/lib/api.js` with `notifications.dispatch`, `campaigns.preview/create/launch/getById/stats/list` (uses `http` for snake/camel conversion on new endpoints).
  - Navigation: Added "Notifications" to the sidebar.
  - Notes: History tab lists via `/api/campaigns`; if listing endpoint is unavailable, it gracefully shows empty state. All sends queue to background worker automatically.
- 2026-04-01: Dental chart status overlays.
  - Portal: Updated `DentalChart` to keep healthy teeth plain white and overlay SVG glyphs for statuses (RCT, veneer, bridge, crown, implant, filling, inlay, onlay, braces, fracture, cavity, missing, other). Statuses beyond healthy retain color fill for quick scanning; icons render inside each tooth rectangle without additional libs.
  - No backend changes; glyph mapping derives from status code strings returned by `/api/ToothStatus`. Legend unchanged.
  - Staff: Fixed edit issues — added dev API routes for `PUT/DELETE /api/Staff/:id` and updated staff form to send gender as string tokens ("Male", "Female", "Other", "PreferNotToSay") to match API expectations.
  - Services: Implemented admin edit page at `clinic-portal/src/app/admin/services/[id]/page.js` that loads a service, allows editing name/cost/specialty, and saves via `api.service.update`.
  - Patients/Teeth UI: Removed bulk "Choose status… / Apply to selected" controls. Kept and duplicated "Schedule appointment with selected" — now appears below the dental chart selector and at the bottom of the teeth panel; also added on `/me` Dental Chart section using currently selected tooth.
  - Teeth selector: Added marquee (click-drag) multi-select on the SVG chart allowing multiple drags to accumulate selection. Implemented in `src/components/dental/teeth-selector.js` with an overlay rectangle and additive selection.

- 2026-04-01: Treatment Drawer refactor.
  - Portal: Replaced “Add Treatment” modal with a right-anchored `Add Treatment` side panel using a split layout (form/cart left, teeth selector right). Files: `clinic-portal/src/components/treatments/add-treatment.js` (re-export) and `clinic-portal/src/components/treatments/treatment-drawer.js` (implementation).
  - Appointment page: removed old modal UI and wired drawer open/close. Bulk save creates services if needed, then posts treatments (per-tooth for specific scope, single for whole mouth). Auto-advances appointment to In Progress on first save.
  - Cleaned legacy inputs: removed multi-teeth checkbox, existing-tooth dropdown, numeric input, tooth status selector, and “service not listed” checkbox per spec.
  - Right pane now uses `DentalChart` (multi-select) for selection, with legend hidden in the drawer; keeps statuses and glyph overlays for better context.

- 2026-03-31: Multi-tooth treatment flow.
  - Backend: TreatmentDTO `tooth_id` made optional; create/update now accept `tooth_number` (resolved by patient_id + tooth_number) and error if tooth missing.
  - Portal: Add Treatment dialog supports “Apply to multiple teeth” with comma-separated numbers; creates or reuses teeth and posts one treatment per tooth. Maintains single-tooth flow.
  - UX: Tooth status selector applies to created teeth. Appointment auto-advances to In Progress on first add.

- 2026-03-31: Teeth auto-seeding + patient teeth management.
  - Backend: On patient creation (API and Landing), auto-create teeth based on DOB using FDI: permanent (11–48) or primary (51–85). All set to HEALTHY (creates status if missing).
  - Portal: Patient profile adds Teeth tab with full list, per-tooth status editing, region quick-select (quadrants, arches, full), and bulk apply. “Set appointment with selected” passes patient and teeth to new appointment.
  - Appointments/new: Reads `patientId` and `teeth` query params; displays preselected teeth info and seeds notes.
- 2026-04-05: Billing Center Redesign (phase 1).
  - DB: added notes to billing and payment tables in schema; demo notes in seeds.
  - Backend: expanded BillingDTO with notes + enrichments; added notes to PaymentDTO; DTO/mappers updated; BillingService now returns rich detail, manages payments and line items, discount application, and totals recalculation; BillingController exposes nested payment/line-item endpoints.
  - Frontend: api.js includes payment/line item/discount methods; new `/billing/[id]` detail page with line items, payments, summary, notes; list cards are clickable; payment dialog creates real Payment with method/ref/notes; receipt shows line items and payment history; appointment page navigates to created bill and links to patient bills.

- 2026-04-11: QDento parity — Stage 0/1/3 initial.
  - Backend: Added ToothStatus.color and migration to upsert canonical 28-status taxonomy with colors; updated Lookup DTO to include color. Seeded service.visual_cue_code by name patterns. Wired TreatmentToothSurface creation in TreatmentService and added GET /api/teeth/{toothId}/surfaces endpoint with SurfaceHistoryDTO.
  - Frontend: Added atlas.json manifest, extended DINO_ASSETS (bridge, denture, cervical, post, perio, calculus, resorption), sprite preloader with V2 flag, BRIDGE/DENTURE treatment cues, CONDITION_STYLES aligned (Caries merge, new lesion types, Periodontitis), added 6th cervical surface to selector and interactive overlay, added api.toothSurfaces.getHistory and treatment-drawer surface_map payload. next.config includes NEXT_PUBLIC_QDENTO_* env.

- 2026-04-11: QDento parity — Stage 2/4 fine-tune + Stage 5 basics.
  - DinoTooth: aligned layer order, added perioActive, bridgePosition, splintPosition, surfaceStates, bopSites props; switched POST/RESORPTION/CALCULUS to sprite layers; false-tooth crown for DENTURE; added SplintRenderer front/behind; BridgeConnector sprites with fallback gradient; BOP droplets overlay.
  - Chart: fine-tuned perioActive (any PD ≥4 or BOP); computed per-tooth PD/GM/CAL/BOP maps; added PerioChartLine polylines (GM in gray, CAL in red) per arch under V2 flag.
  - PerioGrid: restructured to include BOP toggles, GM/CAL rows; state shape expanded; Save emits {pd, gm, cal, bop, mobility, furcation}.
  - Backend: added PerioMeasurement.recession + migration; Perio DTOs include recession; PerioService maps new field and exposes GetStatisticsAsync; PerioController adds GET /api/perio/statistics; Added PerioStatisticsDTO. api.perio.statistics added.

- 2026-04-11: QDento parity — Stage 6 UI panels.
  - Added SurfacePanel (zoomed occlusal grid with 6-surface interactive states and color coding) and MacroButtons (MO/MOD/Remove Crown, bridge hint).
  - ConditionPanel embeds SurfacePanel and shows per-surface treatment history (via /api/teeth/{toothId}/surfaces). OcclusalView displays surface status dots.
  - TreatmentOverlay SurfaceFill accepts per-surface colors and supports stripes via tooth_stripes pattern (backward compatible with single color).

- 2026-04-11: QDento parity — Stage 7 validation/pricing.
  - Backend: ToothStatusValidator with incompatibility matrix; applied in ToothService.Update with 422 response on violations (IncompatibleToothStatusException). Added SurfacePricingTier entity + migration; TreatmentService uses tier multiplier for surface-based costs (fallback to 1.25x if no tiers configured).
  - Frontend: INCOMPATIBLE_STATUSES map exported; ConditionPanel warns on incompatible status changes before calling the API.

- 2026-05-01: Portal auth login flow refinement.
  - Navbar login now initiates Auth0 `loginWithRedirect` directly instead of routing to a sign-in page first.
  - `login()` now accepts an optional return path and passes it through Auth0 app state for post-login return handling.
  - `/login` is now redirect-only and immediately sends unauthenticated users to the IdP.
  - Fixed missing client Auth0 env exposure by adding `NEXT_PUBLIC_AUTH0_DOMAIN`, `NEXT_PUBLIC_AUTH0_CLIENT_ID`, and `NEXT_PUBLIC_AUTH0_AUDIENCE`; provider now logs a clear error if client Auth0 vars are absent.
  - Made Auth0 audience optional for local login. Removed the local `NEXT_PUBLIC_AUTH0_AUDIENCE` because Auth0 rejected `https://api.belladentclinic.com` with `access_denied: Service not found`.
  - Finalized real local Auth0 flow: restored the correct audience `https://api.belladentclinic.com/api/`, enabled Auth0 validation in `clinic-backend/ClinicApi/appsettings.local.json`, added Auth0 redirect callback routing to `returnTo`, and only send `connection` when explicitly configured.
  - Forced the portal’s local Auth0 login connection to `Staff-Database` via `NEXT_PUBLIC_AUTH0_CONNECTION`; mirrored the backend local Auth0 `Connection` setting for consistency with staff invitation/auth flows.
  - Local portal now targets the real backend origin `https://localhost:5112/api` instead of the old Next `/backend` proxy, and `src/lib/api.js` now attaches Auth0 bearer tokens via `authFetch` so protected endpoints work under real local Auth0.

- 2026-06-13: Dental chart foundation + clinical UI pass.
  - Portal: Fixed DinoTooth compositing so lesion/perio/calculus overlays render above tooth anatomy; status opacity now applies to base anatomy so missing/extracted markers stay visible.
  - Portal: Fixed dental hook/runtime issues, replaced DOM-ref teeth caching with React state, normalized selected-detail/treatment overlay tooth lookups, and corrected the lookup API path.
  - Portal: Upgraded the full DentalChart UI with a clinical odontogram header, stats chips, larger staff chart on the patient Teeth tab, a wider detail panel, arch labels, and backend status colors in the legend.
  - Verification: `npm run lint` passes with existing non-dental warnings; `npm run build` passes.

- 2026-06-13: Dental chart phase 2 numbering and mixed dentition pass.
  - Portal: Added shared tooth-numbering utilities for Universal chart positions, permanent FDI, primary FDI, arch/quadrant helpers, and raw backend tooth number extraction.
  - Portal: DentalChart now separates raw API tooth normalization from clicked/selected chart numbers, supports primary/mixed dentition rows, and normalizes statuses, treatment cues, ortho connectors, and perio overlays.
  - Portal: Patient Teeth tab, Treatment drawer, Appointment detail editor, Visit Summary, and `/me` dental card now translate chart selections back to backend tooth numbers before scheduling or saving treatments.
  - Portal: Treatment drawer preserves per-tooth surface selections in drafts and uses patient-aware arch quick-selects.
  - Verification: `npm run lint` passes with existing warnings; `npm run build` passes.

- 2026-06-14: Dental chart phase 3 workflow polish.
  - Portal: Added tooth jump/search, finding focus/clear controls, and a sticky selected-teeth tray to the full DentalChart for faster chairside navigation.
  - Portal: Primary teeth now get chart anchors so search/focus works for mixed dentition as well as permanent teeth.
  - Portal: Improved the tooth detail panel with status color, open-treatment/record counts, clearer surface-history empty states, and richer treatment rows with dates/surfaces.
  - Verification: `npm run lint` passes with existing warnings; `npm run build` passes.

- 2026-08-09: Odontogram replacement research.
  - Reviewed `react-advanced-odontogram` / `React-Odontogram-Modul` as a candidate replacement for the current Dino/QDento dental chart UI.
  - Verified published npm package `react-advanced-odontogram@2.2.0` is MIT, ESM-only, React 18/19 compatible, and exports `OdontogramShell`, `importStatus`, `getStatusChart`, `getPlanChart`, and `setPlanChart`.
  - Key risks: module-level singleton (one chart per page), FDI/primary tooth mapping mismatch, limited published perio setter exports, and need for backend JSON snapshot/adapter rather than replacing normalized teeth/treatment/perio tables.

- 2026-08-09: Odontogram replacement implementation guide.
  - Added `docs/odontogram-replacement-implementation.md` with a phased backend/frontend runbook for replacing the current dental chart with `react-advanced-odontogram`.
  - Guide covers tooth-number validation, snapshot JSONB API, derivation mapping, portal wrapper, feature flag rollout, fork criteria, plan-to-treatment flow, perio risks, testing, and rollback.

- 2026-08-09: Odontogram replacement implementation phase 1.
  - Backend: added `PatientOdontogramSnapshot` JSONB persistence, `GET/PUT /api/patients/{patientId}/odontogram-snapshot`, EF mapping/migration/snapshot, and widened tooth-number validation to support FDI primary/permanent numbers.
  - Portal: installed `react-advanced-odontogram@2.2.0`, imported package CSS, added Next webpack alias for the package export-map quirk, and added adapter/wrapper files under `src/lib/odontogram` and `src/components/odontogram`.
  - UI: added `/patients/[id]/odontogram` replacement route and linked it from the patient Teeth tab for side-by-side QA before deleting legacy QDento/Dino components.
  - Verification: `dotnet build ClinicApi/ClinicApi.csproj --no-restore` succeeds with existing warnings; full solution build still exits after five minutes with 0 errors after API compile; `npm run lint` and `npm run build` pass.

- 2026-08-09: Odontogram replacement implementation phase 2.
  - Backend: added `ToothNumberValidator`; ToothService now rejects impossible Universal/FDI values with 422 responses, and snapshot saves require a JSON object payload.
  - Backend: aligned snapshot EF defaults/migration/model snapshot with SQL schema defaults; added focused tooth-number validator coverage.
  - Portal: Patient Teeth tab now renders `react-advanced-odontogram` by default with `NEXT_PUBLIC_ODONTOGRAM_PROVIDER=legacy` as rollback; standalone route passes pediatric context into the adapter.
  - Portal: adapter now maps legacy child teeth seeded as `1-20` to primary slots only for primary-dentition charts; wrapper reload/theming behavior matches upstream APIs.
  - Verification: API project builds; portal lint/build pass. Full backend tests are still blocked by older test compile drift unrelated to this odontogram pass.

- 2026-08-09: Odontogram replacement frontend fix.
  - Portal: snapshot reads now fall back to normalized backend teeth for all snapshot errors, not just 404, removing the blocking "Failed to load odontogram snapshot" state when the endpoint/migration/auth is unavailable.
  - Verification: `npm run lint` and `npm run build` pass; a dev server had been started on `http://localhost:3001` for QA.

- 2026-08-09: Odontogram replacement frontend containment.
  - Stopped the local portal server on port 3001 per request and did not restart it.
  - Portal: restored the patient Teeth tab to the existing stable `DentalChart` and removed snapshot/advanced package loading from that page.
  - Portal: removed the upstream odontogram CSS import from root `globals.css`; generated a scoped local copy so package globals only apply inside `.advanced-odontogram-scope` on the preview chart.
  - Portal: widened the advanced preview wrapper and changed clipping to horizontal scroll so the replacement route does not render as a half-screen chart.
  - Portal: snapshot reads now fall back to normalized backend teeth for all snapshot errors, not just 404, removing the blocking "Failed to load odontogram snapshot" state when the endpoint/migration/auth is unavailable.
  - Verification: `npm run lint` and `npm run build` pass.

- 2026-08-09: Crown fitting odontogram visibility fix.
  - Backend: TreatmentService now rejects tooth-scoped treatments when selected teeth cannot be resolved, preventing silent treatments with no `treatment_tooth` link; completion also fails if a tooth-status-changing service has no linked teeth.
  - Backend: new treatment status input normalizes `In Progress` to `InProgress` instead of always saving `Planned`.
  - Portal: patient Add Treatment now requires a tooth for crown/filling/root/extraction-style services and refreshes chart treatment/teeth data after save/complete.
  - Portal: DentalChart reloads data via a refresh token, keeps completed crown cues visible until the tooth status reflects the resulting status, and renders a visible completed crown overlay fallback.
  - Verification: `npm run lint`, `npm run build`, and `dotnet build ClinicApi/ClinicApi.csproj --no-restore` pass. Targeted `dotnet test ... --filter TreatmentServiceSurfaceTests` is still blocked by existing unrelated test-project compile drift.

- 2026-08-09: Auth persistence and odontogram library usage check.
  - Portal: Auth0Provider now uses `cacheLocation="localstorage"`, refresh tokens, and iframe fallback to reduce unexpected protected-page logouts after reloads or silent-token failures.
  - Portal: protected-page guards now initiate Auth0 login with the current path as `returnTo`; `/login` sanitizes `returnTo` and redirects already-authenticated users away from the sign-in page.
  - Portal: advanced odontogram preview now hydrates saved `_planChart` data via `setPlanChart`; main patient Teeth tab remains on stable `DentalChart` while the upstream `react-advanced-odontogram` route is isolated at `/patients/{id}/odontogram`.
  - Verification: `npm run lint` passes with existing warnings; `npm run build` passes.

- 2026-08-09: Portal chunk-load recovery fix.
  - Portal: added an inline root `ChunkReloadScript` to recover once from stale Next.js chunk references after rebuilds, avoiding blank screens from `ChunkLoadError` even when `app/layout` or `/patients/{id}/odontogram` chunks are the missing files.
  - Portal: added `scripts/prepare-standalone.mjs` and `postbuild` so local standalone runs include `.next/static` and `public`, matching Docker's runtime artifact copy.
  - Verification: `npm run lint` passes with existing warnings; `npm run build` passes and prepares standalone runtime assets.

- 2026-08-09: React advanced odontogram full adoption plan.
  - Added `docs/react-advanced-odontogram-full-adoption-plan.md` after deciding the preview UI should become the primary odontogram throughout the portal.
  - Plan keeps the upstream chart as the UI while preserving backend clinical authority through snapshot JSONB, parsed per-tooth state, normalized treatment/surface/perio projections, plan-to-treatment commit, audit, security, QA, and rollback.
  - Identified replacement call sites: patient Teeth tab, appointment detail charts, treatment drawer, `/me`, preview route, and perio UI.

- 2026-08-09: React advanced odontogram full adoption implementation.
  - Backend: added full `odontogram-state` and `odontogram-plan/commit` APIs, parsed tooth-state/plan/audit tables, JSONB snapshot compatibility, EF migration/schema updates, normalized tooth projection, and treatment creation through existing clinical services.
  - Portal: added `ClinicalOdontogram` as the primary wrapper and adopted it on patient Teeth, full-screen odontogram, appointment detail, treatment drawer, and `/me`, while preserving `NEXT_PUBLIC_ODONTOGRAM_PROVIDER=legacy` rollback.
  - Integration: root-scoped upstream CSS, explicit save/reload, row-version conflict handling, plan-item commit/dismiss UI, singleton-safe appointment/drawer mounting, and FDI primary/permanent tooth mapping.
  - Notes: installed upstream package does not expose reliable host selected-tooth/surface/perio APIs, so surface entry and perio persistence remain bridged with existing UI until a fork/vendor decision.
  - Verification: API project build passes; portal lint/build pass with existing warnings; full backend tests remain blocked by existing test-project compile drift.

- 2026-08-09: Advanced odontogram host API layer.
  - Portal: added `src/lib/odontogram/advanced-host-api.js` as the app-owned adapter contract over `react-advanced-odontogram` for chart hydration, save payloads, plan diffs, DOM-backed tooth selection, capabilities, and source/host API versioning.
  - Portal: `ClinicalOdontogram` now exposes an imperative API (`save`, `reload`, `commitPlan`, `dismissPlanItem`, `getSnapshot`, `getSelection`, `setSelection`, `clearSelection`) so page-level workflows can depend on clinic-owned behavior instead of upstream internals.
  - Verification: `npm run lint` passes with existing warnings; `npm run build` passes.

- 2026-08-09: Frontend loading diagnostics.
  - Portal: added a dev-only frontend log bridge (`/api/dev/frontend-log` + `FrontendLogBridge`) so browser console errors, warnings, unhandled rejections, and failed fetch diagnostics print in the Next dev terminal.
  - Portal: auth token lookup failures and failed API responses now log sanitized diagnostics in development; protected pages show Auth0 errors instead of an indefinite spinner.
  - Portal: odontogram load failure UI now shows HTTP status and message, and `Button` now supports Radix-style `asChild` via `@radix-ui/react-slot` to remove the leaked DOM prop warning.
  - Debug note: local backend on `https://localhost:5112/api` is reachable but returns `401 Bearer` without a valid Auth0 access token; reload with the log bridge active to confirm whether the failing load is missing token, Auth0 audience/role, or another API error.
  - Verification: `npm run lint` passes with existing warnings; `npm run build` passes; frontend log endpoint smoke test prints in the dev server.

- 2026-08-09: Odontogram state 404 fallback.
  - Portal: `api.odontogram.getState` now falls back to the older snapshot/teeth compatibility path when `/patients/{id}/odontogram-state` returns 404, preventing the blocking red load failure while API deployments catch up.
  - Portal: `api.odontogram.saveState` falls back to `odontogram-snapshot` persistence on the same 404 path; `ClinicalOdontogram` labels this as snapshot compatibility mode and keeps plan commit disabled there.
  - Verification: `npm run lint` passes with existing warnings; `npm run build` passes; API project build passes.

- 2026-08-09: Odontogram 500 and stale chunk recovery.
  - Backend: `GET /api/patients/{id}/odontogram-state` now detects missing odontogram persistence tables (`patient_odontogram_snapshot`, parsed state, plan, audit) and returns a teeth-derived compatibility state instead of a 500.
  - Backend: snapshot reads return no snapshot when the snapshot table is absent; snapshot/full-state saves and plan commit return explicit migration-required errors instead of unhandled database exceptions.
  - Portal: odontogram state loading now also falls back on HTTP 500, and the chunk reload guard catches failed `_next/static/chunks` fetch/script loads during stale post-build navigation.
  - Verification: API project build passes with existing warnings; `npm run lint` and `npm run build` pass with existing warnings.

- 2026-08-09: Applied advanced odontogram migrations locally.
  - Added EF migration metadata attributes to the two new migration classes so `dotnet ef migrations list` discovers them.
  - Applied `20260809190000_AddPatientOdontogramSnapshot` and `20260809203000_AddAdvancedOdontogramState` to the local Development database at `localhost:5432/clinic_db`.
  - Verification: `__EFMigrationsHistory` contains both new migration IDs; tables `patient_odontogram_snapshot`, `odontogram_tooth_state`, `odontogram_plan_item`, and `odontogram_audit_event` exist; API project build passes.

- 2026-08-09: Portal auth gate and chunk retry hardening.
  - Portal: moved protected-route authentication gating into `Providers` so page/SWR API calls wait until Auth0 finishes loading and the HTTP token getter is installed.
  - Portal: shared HTTP helper now retries once with a fresh Auth0 access token after a 401, covering stale cached tokens after local Auth0/API configuration changes.
  - Portal: chunk reload guard now allows a small number of fast stale-chunk refreshes instead of suppressing follow-up missing chunk errors for 30 seconds.
  - Verification: `npm run lint` passes with existing warnings; `npm run build` passes.

- 2026-08-09: Appointment billing and patient clinical page cleanup.
  - Portal: appointment treatment billing now opens/updates the existing bill for billed treatments instead of creating duplicate bills; unbilled selected treatments are added to the existing bill and previous payments are preserved.
  - Portal: billing detail page renamed line-item UI to charges and added edit/remove controls for description, category, quantity, price, and discount with automatic total recalculation.
  - Portal: patient Teeth tab was simplified with one scheduling action, reduced selection controls, clearer Dental Chart/History labels, and a cleaner periodontal measurement grid using displayed tooth numbers.
  - Backend: billing line-item creation rejects attempts to bill the same treatment twice and returns 409 Conflict with a structured message.
  - Verification: portal lint/build pass; API project build passes with existing warnings; local API and portal were restarted.

- 2026-08-10: Reports builder redesign.
  - Portal: replaced the fixed Reports page with a configurable report builder over appointments, billing, treatments, patients, documents, and services.
  - Added smart query tokens, date presets/custom date range, addable field filters, dynamic grouping/metrics, KPI cards, chart-type switching, top groups, result drill-through links, and CSV export.
  - Verification: `npm run lint` passes with existing warnings; `npm run build` passes; `/reports` returns 200 from the restarted local portal.

- 2026-08-10: Billing center redesign.
  - Portal: replaced the Billing card grid with a compact accounts-receivable workbench: KPI strip, invoice queue filters, searchable/sortable ledger table, selected-invoice inspector, and aging breakdown.
  - Moved repeated per-invoice actions into the inspector, preserving create invoice, record payment, mark paid, send reminder, receipt, detail navigation, and CSV export workflows.
  - Verification: `npm run lint` passes with existing warnings; `npm run build` passes; `/billing` returns 200 from the restarted local portal.

- 2026-08-10: Notifications appointment list fix.
  - Portal: Send Reminder now loads appointments/patients through the same API helpers as the rest of the app instead of mixed `http.get('/Appointment')` calls.
  - Replaced hidden Scheduled/Confirmed-only plus next-3-days filtering with visible All/Today/Next 7/Custom date controls and an All Statuses selector, so all appointments can be listed.
  - Recipient selection now keys by appointment row id, keeps rows visible even when contact data is missing, and only selects sendable patient-contact rows.
  - Verification: `npm run lint` passes with existing warnings; `npm run build` passes; `/notifications` returns 200 from the restarted local portal.

- 2026-08-10: Notifications upcoming appointment default.
  - Portal: Send Reminder now defaults to Upcoming appointments instead of all historical appointments.
  - Removed the All appointments range button; kept Today, Next 7 days, Custom, and All Statuses as visible narrowing controls.
  - Preview always requests an upcoming-appointment audience, adding explicit date bounds only for narrower ranges.
  - Verification: `npm run lint` passes with existing warnings; `npm run build` passes; `/notifications` returns 200 from the restarted local portal.

- 2026-08-10: BellaDent logo display pass.
  - Portal: added a shared `BellaDentLogo` component using Next Image with object-contain sizing for the wordmark and mark assets.
  - Enlarged logo presentation in the header, sidebar, login redirect, auth gate, and billing receipt; removed cropped/raw logo image tags.
  - Verification: `npm run lint` passes with only existing non-logo warnings; `npm run build` passes; `/` and `/login` return 200 from the restarted local portal.

- 2026-08-11: Production EC2 database migration.
  - Connected to EC2 with `temps/belladent-prod-ec2-ssh-kp.pem`; fixed API boot by linking `/opt/appsettings.Production.json` into `/opt/ClinicApi/appsettings.Production.json`.
  - Backed up production Postgres to `/opt/db-backups/clinic_db_20260811T034226Z.dump`, added a `uuid_generate_v4()` compatibility wrapper over `gen_random_uuid()`, dry-ran the migration with rollback, then applied schema migrations through `20260809203000_AddAdvancedOdontogramState`.
  - Production `clinic_db` now has notification, perio/QDento, and advanced odontogram tables; `ClinicApi` is active and `/api/appointment` returns 200 locally on the instance.
  - Deployment note: the EC2 API binary is still the older GitHub Actions artifact and does not contain the new Advanced/Odontogram controllers or August migration classes; deploy backend code through the pipeline before relying on `/api/patients/{id}/odontogram-state` in production.
