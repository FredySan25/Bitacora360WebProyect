import { daysInYear } from "../lib/dates";

/** A day of the rose: how much of its habits got done (0-3, null if none were due) and whether there was a workout. */
export type RoseDay = { level: 0 | 1 | 2 | 3 | null; trained: boolean };

/** A month of the rose: its budget held, went over, or there was none. */
export type RoseMonth = "ok" | "over" | null;

type YearRoseProps = {
  year: number;
  /** Index of today within the year, 0 for January 1. */
  todayIndex: number;
  /** One entry per day from January 1 up to today. Empty while loading. */
  days: RoseDay[];
  /** One entry per month up to the current one. */
  months: RoseMonth[];
  /** What the rose says, for screen readers. */
  label: string;
};

const SIZE = 340;
const R = SIZE / 2;
const INNER = R * 0.4;
const MAX_LENGTH = R * 0.34;
const BUDGET_RADIUS = R * 0.8;
const MONTH_LABELS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
const LEVEL_LENGTH = [0.1, 0.38, 0.7, 1];

/** First day of each month, as an index within the year, plus the length of the year. */
function monthStarts(year: number): number[] {
  const starts = [0];
  for (let month = 1; month < 12; month++) {
    starts.push(Math.round((Date.UTC(year, month, 1) - Date.UTC(year, 0, 1)) / 86_400_000));
  }
  starts.push(daysInYear(year));
  return starts;
}

function point(radius: number, angle: number): string {
  return `${(R + radius * Math.cos(angle)).toFixed(1)} ${(R + radius * Math.sin(angle)).toFixed(1)}`;
}

function tick(from: number, to: number, angle: number): string {
  return `M${point(from, angle)}L${point(to, angle)}`;
}

/** Every path of the rose, as SVG path data, plus where each month's name goes. */
function drawRose(year: number, todayIndex: number, days: RoseDay[], months: RoseMonth[]) {
  const total = daysInYear(year);
  const starts = monthStarts(year);
  const angleOf = (day: number) => ((-90 + ((day - todayIndex) * 360) / total) * Math.PI) / 180;

  const levels = ["", "", "", "", ""]; // future or nothing due, then levels 0 to 3
  let trained = "";
  for (let day = 0; day < total; day++) {
    const angle = angleOf(day);
    const entry = day <= todayIndex ? days[day] : undefined;
    if (!entry || entry.level === null) {
      levels[0] += tick(INNER, INNER + MAX_LENGTH * 0.08, angle);
    } else {
      levels[entry.level + 1] += tick(INNER, INNER + LEVEL_LENGTH[entry.level] * MAX_LENGTH, angle);
    }
    if (entry?.trained) trained += tick(INNER - R * 0.11, INNER - R * 0.04, angle);
  }

  let separators = "";
  let held = "";
  let over = "";
  const monthLabels: { text: string; left: string; top: string }[] = [];
  for (let month = 0; month < 12; month++) {
    separators += tick(INNER - R * 0.13, INNER + MAX_LENGTH + R * 0.02, angleOf(starts[month] - 0.5));
    const state = months[month];
    if (state) {
      const end = month === months.length - 1 ? todayIndex + 0.5 : starts[month + 1] - 1.2;
      const arc = `M${point(BUDGET_RADIUS, angleOf(starts[month] + 0.7))}A${BUDGET_RADIUS} ${BUDGET_RADIUS} 0 0 1 ${point(BUDGET_RADIUS, angleOf(end))}`;
      if (state === "over") over += arc;
      else held += arc;
    }
    const middle = angleOf((starts[month] + starts[month + 1]) / 2);
    monthLabels.push({
      text: MONTH_LABELS[month],
      left: `${(((R + R * 0.92 * Math.cos(middle)) / SIZE) * 100).toFixed(2)}%`,
      top: `${(((R + R * 0.92 * Math.sin(middle)) / SIZE) * 100).toFixed(2)}%`,
    });
  }

  return {
    levels,
    trained,
    separators,
    held,
    over,
    now: tick(INNER - R * 0.14, R * 0.99, angleOf(todayIndex)),
    strokeWidth: ((2 * Math.PI * INNER) / total) * 0.72,
    monthLabels,
  };
}

/**
 * Rosa 360: the year as a dial, one tick per day, with today pointing north.
 * The length of a tick is the share of habits done, a dash inside marks a day
 * with a workout, and the outer arc is each month's budget, dashed when it went
 * over. Drawn from data the page already has; it never reads anything itself.
 */
export function YearRose({ year, todayIndex, days, months, label }: YearRoseProps) {
  const { levels, trained, separators, held, over, now, strokeWidth, monthLabels } = drawRose(
    year,
    todayIndex,
    days,
    months,
  );

  return (
    <div className="relative aspect-square w-full max-w-[340px] shrink-0">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={label} className="h-full w-full">
        <path d={separators} stroke="var(--rule)" strokeWidth="1" fill="none" />
        <path d={levels[0]} stroke="var(--rule)" strokeWidth={strokeWidth} fill="none" />
        <path d={levels[1]} stroke="var(--rule)" strokeWidth={strokeWidth} fill="none" />
        <path
          d={levels[2]}
          stroke="var(--ink-muted)"
          strokeOpacity="0.55"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <path
          d={levels[3]}
          stroke="var(--accent)"
          strokeOpacity="0.55"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <path d={levels[4]} stroke="var(--accent)" strokeWidth={strokeWidth} fill="none" />
        <path d={trained} stroke="var(--ink)" strokeWidth={strokeWidth} fill="none" />
        <path d={held} stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path
          d={over}
          stroke="var(--danger)"
          strokeWidth="3"
          strokeDasharray="2 4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={now}
          stroke="var(--ink)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      {monthLabels.map((month) => (
        <span
          key={month.text}
          aria-hidden="true"
          className="absolute -translate-x-1/2 -translate-y-1/2 text-[0.6875rem] text-ink-muted"
          style={{ left: month.left, top: month.top }}
        >
          {month.text}
        </span>
      ))}
      <p
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center font-display text-[1.375rem] font-semibold text-ink-muted tabular-nums"
      >
        {year}
      </p>
    </div>
  );
}

/** What each mark of the rose means; goes next to it. */
export function YearRoseLegend() {
  return (
    <ul className="flex flex-col gap-1.5 text-sm text-ink-muted">
      <li className="flex items-center gap-2.5">
        <svg width="26" height="12" aria-hidden="true" className="shrink-0">
          <path d="M2 11V7M8 11V4M14 11V1M20 11V6" stroke="var(--accent)" strokeWidth="2" />
        </svg>
        Cada marca es un día: más larga, más hábitos cumplidos
      </li>
      <li className="flex items-center gap-2.5">
        <svg width="26" height="12" aria-hidden="true" className="shrink-0">
          <path d="M4 9V4M12 9V4M20 9V4" stroke="var(--ink)" strokeWidth="2" />
        </svg>
        Raya interior: ese día entrenaste
      </li>
      <li className="flex items-center gap-2.5">
        <svg width="26" height="12" aria-hidden="true" className="shrink-0">
          <path d="M2 4h10" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
          <path d="M15 9h10" stroke="var(--danger)" strokeWidth="3" strokeDasharray="2 3" />
        </svg>
        Arco: presupuesto del mes, punteado si te pasaste
      </li>
    </ul>
  );
}
