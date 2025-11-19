"use client";
import Button from "../../components/ui/button";

export default function LoginPage() {
  const base = "/auth/login";
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-app-muted">Choose Staff or Patient account</p>
      </div>

      <div className="rounded-xl border border-app-border bg-app-surface p-6 space-y-3">
        <Button as="a" href={`${base}?returnTo=/&connection=Staff-Database`} className="w-full">Sign in as Staff</Button>
        <Button as="a" href={`${base}?returnTo=/&connection=Patients-Database`} variant="outline" className="w-full">Sign in as Patient</Button>
      </div>

      <p className="text-xs text-app-muted">
        Note: Update the connection names in `src/app/login/page.js` to match your Auth0 Database Connections.
      </p>
    </div>
  );
}
