import {
  figureCellClassName,
  figureValueClassName,
  labelClassName,
} from "@/core/components/surfaces";

type StatTileProps = {
  label: string;
  value: string;
  /** Short context under the value, e.g. "18 de 21". */
  detail?: string;
};

/** A single headline number with its label; goes inside a figure row. */
export function StatTile({ label, value, detail }: StatTileProps) {
  return (
    <div className={figureCellClassName}>
      <p className={labelClassName}>{label}</p>
      <p className={figureValueClassName}>{value}</p>
      {detail && <p className="truncate text-[0.8125rem] text-ink-muted">{detail}</p>}
    </div>
  );
}
