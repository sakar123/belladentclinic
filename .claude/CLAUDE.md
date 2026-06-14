# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Primary Reference

Read `AGENTS.md` first — it is the single source of truth for project state, conventions, decisions, and session history. Update its Session Log when completing non-trivial work.

## Commands

### Backend (.NET 9)
```bash
# Run API (from clinic-backend/ClinicApi)
dotnet run

# Run all tests (from clinic-backend/)
dotnet test Clinic-Api.sln

# Run a single test class
dotnet test Clinic-Api.sln --filter "FullyQualifiedName~AppointmentApiTests"
```

### Portal (Next.js 14, App Router)
```bash
cd clinic-portal
npm run dev     # dev server on :3000
npm run build
npm run lint    # ESLint 9
```

### Landing Page (Next.js 15, static export)
```bash
cd clinic-landingpage
npm run dev     # dev server on :3001
npm run build   # outputs to /out (static export)
```

### Docker Compose (preferred for full-stack)
```bash
docker compose --profile db up -d                    # DB only
docker compose --profile api up --build              # DB + API
docker compose --profile tests run --rm api-tests    # run tests in Docker
docker compose --profile portal up --build           # DB + API + portal
docker compose --profile landing up --build          # landing page
```

### Quick API checks (API on :8080)
```bash
curl -sS http://localhost:8080/api/Patient | jq 'length, .[0].person'
curl -sS http://localhost:8080/api/Appointment | jq 'length, .[0]'
curl -sS http://localhost:8080/api/Treatments | jq '.[0]'
```

## Architecture

**Monorepo — dental clinic management SaaS (BellaDent)**

```
clinic-backend/      # .NET 9 Web API — port 8080
clinic-portal/       # Next.js 14 staff/patient portal — port 3000
clinic-landingpage/  # Next.js 15 static marketing + booking site — port 3001 (Docker: Nginx)
clinic-db/           # Postgres 16 schema + seeds
```

### Backend (`clinic-backend/ClinicApi`)

- **Entry**: `Program.cs` — DI, Serilog, CORS, EF Core, Auth middleware
- **Pattern**: thin controllers → services → generic repository → EF Core (`DentalClinicContext`)
- **DTOs**: snake_case at the API boundary; AutoMapper profiles in `Mappers/`
- **Validation**: FluentValidation in `Validators/`
- **CORS**: loaded from `appsettings.local.json` (dev: localhost:3000/3001) or `appsettings.Production.json`; `app.UseRouting()` must precede `app.UseCors()` for preflight to work
- **DB**: Postgres 16 via Npgsql/EF Core; UUID PKs, `TIMESTAMPTZ` columns, all datetimes coerced to UTC in `DentalClinicContext`; auto-migrations run in Development
- **Logging**: Serilog with rolling file (`logs/clinic-api-.log`); `RequestLoggingContextMiddleware` enriches with correlation/request IDs

### Portal (`clinic-portal/src`)

- **HTTP client**: `lib/http.js` — auto-converts snake_case ↔ camelCase and wraps all API calls; API endpoints defined in `lib/api.js`
- **Normalizers**: `lib/normalizers.js` flattens nested `person` objects from API responses for rendering
- **Auth**: Auth0 via `middleware.js`; `AUTH0_*` env vars required; patient self-service at `/me`
- **Dev-only mock routes**: `src/app/api/*` — return mock data locally without backend; return 404 in production (except `send-email`/`send-sms` which require `SENDGRID_API_KEY`/`TWILIO_*` env vars)
- **API proxy**: `next.config.mjs` rewrites `/backend/:path*` → real API; `NEXT_PUBLIC_API_BASE_URL` sets the target
- **Global loading**: fetch monkey-patch + overlay provider prevents double-submit on all mutating actions

### Landing Page (`clinic-landingpage/src`)

- Static export (`output: 'export'`); API URL must be absolute at build time (`NEXT_PUBLIC_CLINIC_API_BASE_URL`)
- Sends explicit OPTIONS preflight before cross-origin API requests (handled by `[EnableCors]` + explicit OPTIONS actions on `LandingPageController`)

### Database

- All tables: UUID PKs (`uuid-ossp`), `TIMESTAMPTZ` timestamps, `TEXT` for soft enums (gender, bill_status, payment_method)
- Postgres enums registered via `HasPostgresEnum<>()` in `DentalClinicContext` to avoid Int32 binding errors
- Patient creation auto-seeds teeth (permanent set 11–48 for adults, primary 51–85 for children based on DOB)

## Key Conventions

- **API DTOs**: snake_case (`patient_id`, `appointment_start_time`). Never change this — the portal HTTP client depends on it.
- **Treatments reference teeth** via `tooth_number` (int, resolved to the patient's tooth row); `tooth_id` FK also exists.
- **Staff deletion** returns 409 (not 500) when appointments exist; portal surfaces the friendly message.
- **Appointments**: currently fetched in full and filtered client-side by visible date range — not scalable; server-side range filtering is a known next action.
- **Mapper TODOs**: some navigation properties are intentionally left `null` to avoid cycles; expand only when an endpoint explicitly needs the graph.
- **Currency**: display as `Rs` (Nepali Rupees).
