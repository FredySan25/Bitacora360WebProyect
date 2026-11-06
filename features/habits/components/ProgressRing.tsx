type ProgressRingProps = {
  /** Habits done on the day being shown. */
  done: number;
  /** Habits scheduled that day. */
  total: number;
  /** Width and height in pixels. */
  size?: number;
};

const RADIUS = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Decorative dial with a north tick, like the logo; the "X de Y" text next to it carries the meaning. */
export function ProgressRing({ done, total, size = 48 }: ProgressRingProps) {
  const ratio = total > 0 ? Math.min(done / total, 1) : 0;

  return (
    <svg aria-hidden="true" viewBox="0 0 36 36" width={size} height={size} className="shrink-0">
      <circle
        cx="18"
        cy="18"
        r={RADIUS}
        fill="none"
        stroke="var(--rule)"
        strokeWidth="5"
        strokeDasharray="1.4 1.6"
      />
      <circle
        cx="18"
        cy="18"
        r={RADIUS}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="5"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
        transform="rotate(-90 18 18)"
        className="transition-[stroke-dashoffset] duration-300 motion-reduce:transition-none"
      />
      <path d="M18 0.5v6" stroke="var(--danger)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
