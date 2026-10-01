type StatTileProps = {
  label: string;
  value: string;
  /** Short context under the value, e.g. "18 de 21". */
  detail?: string;
};

/** A single headline number with its label. */
export function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <div className="rounded-2xl border border-border bg-paper-elevated p-4">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
      {detail && <p className="mt-0.5 truncate text-xs text-ink-muted">{detail}</p>}
    </div>
  );
}
