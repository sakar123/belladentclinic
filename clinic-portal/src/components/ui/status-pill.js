export function StatusPill({ text, ok = 'teal', warn = 'amber', bad = 'rose' }) {
  const t = (text || '').toString().toLowerCase();
  let cls = 'bg-slate-100 text-slate-700';
  if (/(confirm|schedule|active|paid|ok|success|complete)/.test(t)) cls = 'bg-teal-600/10 text-teal-700';
  else if (/(overdue|pending|hold|review|warn|due)/.test(t)) cls = 'bg-amber-500/10 text-amber-700';
  else if (/(cancel|error|fail|past due|declined)/.test(t)) cls = 'bg-rose-600/10 text-rose-700';
  return <span className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center ${cls}`}>{text || '—'}</span>;
}

