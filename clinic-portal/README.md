This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Calendar API Notes (Appointments)

Current implementation of the Appointments calendar (Month/Week/Day) fetches all appointments via `GET /api/Appointment` and filters them client‑side to the visible range. This is intentional due to the backend endpoint returning the full list without range filtering.

Planned improvement (recommended for scale):
- Add a server‑side range endpoint or support query parameters for filtering by time window, e.g. `GET /api/Appointment?start_date=...&end_date=...` (snake_case to match DTOs), or a dedicated search endpoint (e.g. `POST /api/Appointment/search`) that accepts a JSON body with `start_date`, `end_date`, `patient_id`, `staff_id`, and `status` filters.
- Update the frontend to request only the current view’s range (month/week/day) to reduce payload size and latency.

Until then, client-side filtering is safe for small/medium datasets but may be inefficient with very large appointment tables. Revisit this once backend support is available.

## Auth0 Setup (Staff & Patient Login)

This app uses Auth0 for authentication via the App Router SDK. Configure these env vars in `.env.local`:

- AUTH0_SECRET — random string (e.g., `openssl rand -hex 32`)
- AUTH0_BASE_URL — e.g., `http://localhost:3000`
- AUTH0_ISSUER_BASE_URL — your Auth0 domain, e.g., `https://YOUR_TENANT.eu.auth0.com`
- AUTH0_CLIENT_ID — from the Auth0 application
- AUTH0_CLIENT_SECRET — from the Auth0 application

Routes are mounted at `/api/auth/[auth0]` and a simple login UI exists at `/login` with two buttons that pass `connection=Staff-Database` and `connection=Patients-Database`. Update those connection names in `src/app/login/page.js` to match your Auth0 Database Connections or remove the `connection` param if you use Universal Login with multiple connections.

Protecting staff-only pages: `src/middleware.js` currently protects `/comms` using Auth0 middleware. Add more paths to `config.matcher` as needed.

Role-based access (staff vs patient):
- Add a custom namespaced claim with user roles to ID tokens (e.g., `https://clinic.app/roles: ["staff"]`) using an Auth0 Action (Post Login) or Rules.
- Expose the claim name to the frontend via `NEXT_PUBLIC_AUTH0_ROLE_CLAIM` (defaults to `https://clinic.app/roles`).
- The Communications page (`/comms`) checks this claim and shows an unauthorized message for non-staff users.
- For stronger enforcement, add server-side role checks in API routes once the claim is available.

Linking patients to Auth0 users:
- Add a custom namespaced claim with the patient record id (e.g., `https://clinic.app/patient_id: "123"`) OR store `patientId` in `user_metadata`.
- Set `NEXT_PUBLIC_AUTH0_PATIENT_ID_CLAIM` to your claim name if using a custom claim (defaults to `https://clinic.app/patient_id`).
- The patient portal at `/me` reads this value to fetch the patient, upcoming appointments, prescriptions, and an interactive dental chart.

How to get Auth0 credentials:
1) Create an Application (Regular Web App) in Auth0 Dashboard.
2) Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
3) Allowed Logout URLs: `http://localhost:3000`
4) Allowed Web Origins: `http://localhost:3000`
5) Copy Domain → `AUTH0_ISSUER_BASE_URL`, Client ID → `AUTH0_CLIENT_ID`, Client Secret → `AUTH0_CLIENT_SECRET`.

## Messaging (Twilio SMS and SendGrid Email)

This app includes a staff Communications page at `/comms` with tabs for SMS and Marketing Email.

Environment variables for SMS (Twilio):
- TWILIO_ACCOUNT_SID — from Twilio Console
- TWILIO_AUTH_TOKEN — from Twilio Console
- TWILIO_FROM_NUMBER — your verified/sender number (e.g., `+1XXXXXXXXXX`)

Environment variables for Email (SendGrid by Twilio):
- SENDGRID_API_KEY — from SendGrid dashboard (Twilio SendGrid)
- EMAIL_FROM — default sender (e.g., `no-reply@yourdomain.com`, verified in SendGrid)

How to get Twilio credentials:
1) Create a Twilio account at https://www.twilio.com/ and obtain your Account SID and Auth Token from the Console.
2) Buy or verify a phone number capable of SMS. Use it as `TWILIO_FROM_NUMBER`.

How to get SendGrid API key:
1) Create/Log in at https://sendgrid.com/ and go to Settings → API Keys.
2) Create an API key with “Mail Send” permissions.
3) Verify a sender identity or domain and use that as `EMAIL_FROM`.

Notes:
- If the necessary env vars are not set, the `/api/send-sms` and `/api/send-email` routes simulate a successful send and return `{ simulated: true }` so you can test the UI.
- For production, set the env vars and the routes will use real Twilio/SendGrid SDKs.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
