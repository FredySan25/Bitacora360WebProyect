import { iconButtonClassName } from "@/core/components/buttonStyles";
import { AlertIcon, CheckIcon, PencilIcon, TrashIcon } from "@/core/components/icons";
import { formatMoney, formatPercent } from "../format";
import { budgetState, sumAmounts, type BudgetState } from "../stats";

// The track is a lighter step of the fill, so the state reads across the whole bar
const STATES: Record<
  BudgetState,
  { label: string; fill: string; track: string; text: string; icon: typeof CheckIcon }
> = {
  ok: {
    label: "En orden",
    fill: "bg-positive",
    track: "bg-positive/20",
    text: "text-positive",
    icon: CheckIcon,
  },
  warning: {
    label: "Cerca del límite",
    fill: "bg-warning",
    track: "bg-warning/20",
    text: "text-warning",
    icon: AlertIcon,
  },
  over: {
    label: "Excedido",
    fill: "bg-danger",
    track: "bg-danger/20",
    text: "text-danger",
    icon: AlertIcon,
  },
};

/**
 * Share of the limit already spent, as a whole percent that never contradicts
 * the state: 79.6% stays "79 %" (still in order) and anything over the limit
 * shows at least "101 %".
 */
function usedPercent(spent: number, limit: number, state: BudgetState): number {
  const percent = (spent / limit) * 100;
  return state === "over" ? Math.max(101, Math.round(percent)) : Math.floor(percent);
}

type BudgetProgressProps = {
  /** Category label, e.g. "Comida". */
  label: string;
  spent: number;
  limit: number;
  onEdit: () => void;
  onDelete: () => void;
};

/** One budget: what was spent against its limit, with a bar and a state that changes at 80% and past 100%. */
export function BudgetProgress({ label, spent, limit, onEdit, onDelete }: BudgetProgressProps) {
  const state = budgetState(spent, limit);
  const { label: stateLabel, fill, track, text, icon: StateIcon } = STATES[state];
  const percent = usedPercent(spent, limit, state);
  const difference = sumAmounts([limit, -spent]);

  return (
    <li className="px-4 py-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{label}</p>
          <p className="text-xs text-ink-muted">
            {formatMoney(spent)} de {formatMoney(limit)}
          </p>
        </div>

        {/* Icon and label carry the state; the color only reinforces it */}
        <p className="flex shrink-0 items-center gap-1 py-1.5 text-xs font-medium text-ink">
          <StateIcon className={`h-4 w-4 ${text}`} />
          {stateLabel}
        </p>

        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar presupuesto de ${label}`}
          className={iconButtonClassName}
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Eliminar presupuesto de ${label}`}
          className={iconButtonClassName}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      <div
        role="progressbar"
        aria-label={`Presupuesto de ${label}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(percent, 100)}
        aria-valuetext={`${formatPercent(percent)}, ${stateLabel}`}
        className={`mt-3 h-2 overflow-hidden rounded-full ${track}`}
      >
        <div
          className={`h-full rounded-full transition-[width] ${fill}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <p className="mt-1.5 text-xs text-ink-muted">
        {formatPercent(percent)} usado ·{" "}
        {state === "over"
          ? `Te pasaste por ${formatMoney(-difference)}`
          : `Te quedan ${formatMoney(difference)}`}
      </p>
    </li>
  );
}
