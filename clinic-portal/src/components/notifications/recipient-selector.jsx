"use client";
import { useMemo } from "react";
import { Table, Thead, Tbody, Tr, Th, Td } from "../ui/table";
import Button from "../ui/button";

export default function RecipientSelector({ rows, selectedIds, setSelectedIds, onSelectAll, onClearAll, loading = false, emptyMessage = "No recipients" }) {
  const allIds = useMemo(() => rows.map(r => r.personId).filter(Boolean), [rows]);
  const allSelected = useMemo(() => allIds.length > 0 && allIds.every(id => selectedIds.has(id)), [allIds, selectedIds]);

  const toggle = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="rounded-md border border-app-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-app-bg border-b border-app-border">
        <div className="text-sm text-app-muted">Recipients</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAll}>Select All</Button>
          <Button variant="outline" size="sm" onClick={onClearAll}>Deselect All</Button>
        </div>
      </div>
      <div className="max-h-[360px] overflow-auto">
        <Table>
          <Thead>
            <Tr>
              <Th className="w-10">
                <input type="checkbox" checked={allSelected} onChange={(e) => {
                  if (e.target.checked) onSelectAll(); else onClearAll();
                }} />
              </Th>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Context</Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading && (
              <Tr>
                <Td colSpan={4} className="text-center py-6 text-sm text-app-muted">Loading recipients…</Td>
              </Tr>
            )}
            {!loading && rows.length === 0 && (
              <Tr>
                <Td colSpan={4} className="text-center py-6 text-sm text-app-muted">{emptyMessage}</Td>
              </Tr>
            )}
            {!loading && rows.map((r) => (
              <Tr key={`${r.personId}-${r.context || ''}`}>
                <Td className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(r.personId)}
                    onChange={() => toggle(r.personId)}
                  />
                </Td>
                <Td>{r.name || '—'}</Td>
                <Td>{r.email || '—'}</Td>
                <Td>{r.context || '—'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
