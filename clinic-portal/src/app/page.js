export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-app-muted">Overview and quick insights</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-app-border bg-app-surface p-6 elevate min-h-32" />
        <div className="rounded-xl border border-app-border bg-app-surface p-6 elevate min-h-32" />
        <div className="rounded-xl border border-app-border bg-app-surface p-6 elevate min-h-32" />
      </div>
      <div className="rounded-xl border border-app-border bg-app-surface p-6 elevate min-h-64" />
    </div>
  );
}
