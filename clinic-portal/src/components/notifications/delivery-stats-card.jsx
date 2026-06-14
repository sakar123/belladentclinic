import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const fields = [
  { key: 'targeted', label: 'Targeted' },
  { key: 'eligible', label: 'Eligible' },
  { key: 'excluded', label: 'Excluded' },
  { key: 'queued', label: 'Queued' },
  { key: 'sent', label: 'Sent' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'opened', label: 'Opened' },
  { key: 'clicked', label: 'Clicked' },
  { key: 'bounced', label: 'Bounced' },
  { key: 'complained', label: 'Complained' },
  { key: 'failed', label: 'Failed' },
];

export default function DeliveryStatsCard({ stats }) {
  if (!stats) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {fields.map(f => (
            <div key={f.key} className="rounded-md border border-app-border p-3">
              <div className="text-xs text-app-muted">{f.label}</div>
              <div className="text-xl font-semibold">{stats[f.key] ?? 0}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

