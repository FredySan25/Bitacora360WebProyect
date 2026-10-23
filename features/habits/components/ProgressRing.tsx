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

/** Decorative progress ring; the "X de Y" text next to it carries the meaning. */
export function ProgressRing({ done, total, size = 44 }: ProgressRingProps) {
  const ratio = total > 0 ? Math.min(done / total, 1) : 0;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 36 36"
      width={size}
      height={size}
      className="shrink-0 -rotate-90"
    >
      <circle cx="18" cy="18" r={RADIUS} fill="none" stroke="var(--rule)" strokeWidth="4" />
      <circle
        cx="18"
        cy="18"
        r={RADIUS}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
        className="transition-[stroke-dashoffset] duration-300 motion-reduce:transition-none"
      />
    </svg>
  );
}
