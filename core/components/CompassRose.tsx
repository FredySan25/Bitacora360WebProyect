const SIZE = 440;
const R = SIZE / 2;
const MONTH_STARTS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

function point(radius: number, degrees: number): string {
  const angle = ((degrees - 90) * Math.PI) / 180;
  return `${(R + radius * Math.cos(angle)).toFixed(1)} ${(R + radius * Math.sin(angle)).toFixed(1)}`;
}

function dayAngle(day: number): number {
  return (day * 360) / 365;
}

// One tick per day, longer each week; one line where each month starts
const TICKS = Array.from({ length: 365 }, (_, day) => {
  const length = day % 7 === 0 ? 0.3 : 0.18;
  return `M${point(R * 0.46, dayAngle(day))}L${point(R * (0.46 + length), dayAngle(day))}`;
}).join("");
const MONTHS = MONTH_STARTS.map(
  (start) => `M${point(R * 0.36, dayAngle(start - 0.5))}L${point(R * 0.84, dayAngle(start - 0.5))}`,
).join("");

/**
 * The year dial without data, for the screens before signing in. Decorative:
 * the Today page has the real one, with the user's days.
 */
export function CompassRose({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true" className={className}>
      <path d={TICKS} stroke="var(--rule)" strokeWidth="1.4" fill="none" />
      <path d={MONTHS} stroke="var(--ink-muted)" strokeWidth="1.2" fill="none" />
      <circle
        cx={R}
        cy={R}
        r={R * 0.78}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeDasharray="3 7"
        strokeLinecap="round"
      />
      <path d={`M${R} 8v64`} stroke="var(--danger)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
