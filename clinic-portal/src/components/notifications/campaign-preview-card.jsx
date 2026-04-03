import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "../ui/table";

export default function CampaignPreviewCard({ result }) {
  if (!result) return null;
  const { matchedCount, eligibleCount, excludedCount, exclusions, sample } = result;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="rounded-md border border-app-border p-3">
            <div className="text-xs text-app-muted">Matched</div>
            <div className="text-xl font-semibold">{matchedCount ?? 0}</div>
          </div>
          <div className="rounded-md border border-app-border p-3">
            <div className="text-xs text-app-muted">Eligible</div>
            <div className="text-xl font-semibold text-teal-700">{eligibleCount ?? 0}</div>
          </div>
          <div className="rounded-md border border-app-border p-3">
            <div className="text-xs text-app-muted">Excluded</div>
            <div className="text-xl font-semibold text-rose-700">{excludedCount ?? 0}</div>
          </div>
        </div>
        {exclusions && (
          <div className="text-xs text-app-muted mb-3">Exclusions: {Object.entries(exclusions).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
        )}
        {Array.isArray(sample) && sample.length > 0 && (
          <div className="rounded-md border border-app-border overflow-hidden">
            <div className="px-3 py-2 bg-app-bg border-b border-app-border text-sm">Sample</div>
            <Table>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>Eligible</Th>
                  <Th>Reason</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sample.slice(0, 10).map((s, i) => (
                  <Tr key={i}>
                    <Td>{s.name || '—'}</Td>
                    <Td>{s.contactValue || '—'}</Td>
                    <Td>{s.isEligible ? 'Yes' : 'No'}</Td>
                    <Td>{s.exclusionReason || '—'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

