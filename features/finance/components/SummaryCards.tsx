import { useId, type ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@/core/components/icons";
import { formatMonth, type MonthKey } from "@/core/lib/dates";
import { formatMoney, formatPercent, formatSignedMoney } from "../format";
import { percentChange, savingsRate, type MonthTotals } from "../stats";

type TileProps = {
  label: string;
  value: string;
  children?: ReactNode;
};

/** A headline number with its label; the detail under it goes in as children. */
function Tile({ label, value, children }: TileProps) {
  const labelId = useId();

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="rounded-2xl border border-border bg-paper-elevated p-4"
    >
      <p id={labelId} className="text-xs font-medium text-ink-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
      {children}
    </div>
  );
}

function Detail({ children }: { children: ReactNode }) {
  return <p className="mt-0.5 text-xs text-ink-muted">{children}</p>;
}

type DeltaProps = {
  /** Current value minus the previous one. */
  difference: number;
  /** The change as shown, already signed: "+12 %" or "+$120.00". */
  text: string;
  /** Whether a rise is good news (income) or bad news (expenses). */
  upIsGood: boolean;
  /** Name of the month it's compared with, e.g. "septiembre". */
  against: string;
};

/** Change against the previous month. The arrow and the sign carry the direction, not just the color. */
function Delta({ difference, text, upIsGood, against }: DeltaProps) {
  if (difference === 0) return <Detail>Igual que en {against}</Detail>;

  const up = difference > 0;
  const Arrow = up ? ArrowUpIcon : ArrowDownIcon;
  return (
    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
      <Arrow className={`h-3.5 w-3.5 shrink-0 ${up === upIsGood ? "text-positive" : "text-danger"}`} />
      <span>
        {text} vs. {against}
      </span>
    </p>
  );
}

function signedPercent(value: number): string {
  return value > 0 ? `+${formatPercent(value)}` : formatPercent(value);
}

type SummaryCardsProps = {
  totals: MonthTotals;
  /** The month before, to show how each number changed. */
  previous?: { month: MonthKey; totals: MonthTotals };
  showSavingsRate?: boolean;
};

/** Income, expenses and balance of a month, optionally compared with the month before. */
export function SummaryCards({ totals, previous, showSavingsRate }: SummaryCardsProps) {
  const against = previous && formatMonth(previous.month, { month: "long" });
  const rate = savingsRate(totals);

  function change(current: number, before: number, upIsGood: boolean, emptyText: string) {
    if (!against) return null;
    const percent = percentChange(current, before);
    if (percent === null) return <Detail>{emptyText}</Detail>;
    return (
      <Delta
        difference={current - before}
        text={signedPercent(percent)}
        upIsGood={upIsGood}
        against={against}
      />
    );
  }

  return (
    <div className={`grid gap-3 sm:grid-cols-3 ${showSavingsRate ? "lg:grid-cols-4" : ""}`}>
      <Tile label="Ingresos" value={formatMoney(totals.income)}>
        {previous &&
          change(totals.income, previous.totals.income, true, `Sin ingresos en ${against}`)}
      </Tile>

      <Tile label="Gastos" value={formatMoney(totals.expenses)}>
        {previous &&
          change(totals.expenses, previous.totals.expenses, false, `Sin gastos en ${against}`)}
      </Tile>

      <Tile label="Balance" value={formatMoney(totals.balance)}>
        {previous &&
          against &&
          (previous.totals.income === 0 && previous.totals.expenses === 0 ? (
            <Detail>Sin movimientos en {against}</Detail>
          ) : (
            <Delta
              difference={totals.balance - previous.totals.balance}
              text={formatSignedMoney(totals.balance - previous.totals.balance)}
              upIsGood
              against={against}
            />
          ))}
      </Tile>

      {showSavingsRate && (
        <Tile label="Tasa de ahorro" value={rate === null ? "—" : formatPercent(rate)}>
          <Detail>
            {rate === null
              ? "Sin ingresos en el mes"
              : rate < 0
                ? "Gastaste más de lo que ingresó"
                : "del ingreso del mes"}
          </Detail>
        </Tile>
      )}
    </div>
  );
}
