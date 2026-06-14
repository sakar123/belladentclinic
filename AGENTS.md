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
