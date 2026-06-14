export function Money({ value, currency = 'Rs' }) {
  if (value === undefined || value === null) return <span>—</span>;
  const v = Number(value);
  if (Number.isNaN(v)) return <span>{String(value)}</span>;
  return <span>{currency} {v.toLocaleString()}</span>;
}

