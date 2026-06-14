"use client";

import useSWR from 'swr';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import Input from '@/components/ui/input';
import { useMemo, useState } from 'react';
import { FileText, Image as ImageIcon, Paperclip, Download } from 'lucide-react';
import Empty from '@/components/ui/empty';

function iconFor(doc) {
  const name = (doc.file_name || doc.filename || '').toLowerCase();
  const typeName = (doc.type?.name || doc.document_type?.name || '').toLowerCase();
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || typeName.includes('image')) return ImageIcon;
  if (name.endsWith('.pdf') || typeName.includes('pdf')) return FileText;
  return Paperclip;
}

function DocCard({ d }) {
  const p = d.patient?.person || {};
  const name = `${p.first_name || ''} ${p.last_name || ''}`.trim();
  const Icon = iconFor(d);
  const label = d.title || d.file_name || d.filename || `Document ${d.id}`;
  const date = d.created_at || d.uploaded_at || d.date_created || null;
  const when = date ? new Date(date).toLocaleDateString() : '';
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-3 rounded-lg bg-slate-100 text-slate-700"><Icon size={18} /></div>
          <div className="min-w-0">
            <div className="font-medium truncate">{label}</div>
            <div className="text-sm text-app-muted truncate">{when}{when ? ' · ' : ''}{name ? `${name}` : ''}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-app-muted">{d.type?.name || d.document_type?.name || ''}</span>
          <button
            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
            title="View / Download"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const { url } = await api.document.getDownloadUrl(d.id);
                window.open(url, '_blank');
              } catch { /* presigned URL not available for legacy docs */ }
            }}
          >
            <Download size={16} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DocumentsPage() {
  const { data: docs, error } = useSWR('documents', () => api.document.getAll());
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!docs) return [];
    const t = q.trim().toLowerCase();
    if (!t) return docs;
    return docs.filter((d) => {
      const p = d.patient?.person || {};
      const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
      const label = (d.title || d.file_name || d.filename || '').toLowerCase();
      const type = (d.type?.name || d.document_type?.name || '').toLowerCase();
      return [name, label, type].some(x => x.includes(t));
    });
  }, [docs, q]);

  if (error) return <div className="text-red-600">Failed to load documents.</div>;
  if (!docs) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="text-sm text-app-muted">Files attached to patients and treatments</p>
      </div>
      <div className="flex items-center gap-2">
        <Input placeholder="Search by title, type, or patient…" className="w-80" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((d) => (<DocCard key={d.id} d={d} />))}
      </div>
      {filtered.length === 0 && (
        <Empty title="No documents found" subtitle="Try a different search term." />
      )}
    </div>
  );
}
