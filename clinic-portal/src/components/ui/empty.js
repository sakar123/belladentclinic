export default function Empty({ title = 'Nothing here yet', subtitle = 'Try adjusting your filters or add a new record.', action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center border border-app-border rounded-xl p-10 bg-app-surface">
      <div className="text-lg font-medium">{title}</div>
      <div className="text-sm text-app-muted mt-1">{subtitle}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

