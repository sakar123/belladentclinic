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
- Treatments use tooth_number (int) — there is no `tooth_id` column in DB. Do not reintroduce a FK without a schema change.
- Staff deletion will likely fail if the staff has appointments; the API returns 409 with guidance. Prefer deactivation (is_active) or reassignment flow.
- AppointmentStatus dropdowns should use `id` as value; API expects `status_id` in DTOs.
- When changing entities, confirm DB schema compatibility and update mappers + seeds; coordinate with portal normalizers.

How to use this log: Append a new entry on each work session with date, what changed, and any decisions taken. Keep it concise (3–6 lines).
