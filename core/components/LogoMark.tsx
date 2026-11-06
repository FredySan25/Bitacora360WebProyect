/**
 * The Bitácora360 mark: a dial of days with a red north tick, the same
 * figure as the year rose on the Today page. Decorative: the name goes next to it.
 */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true" className="shrink-0">
      <circle
        cx="15"
        cy="15"
        r="11"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="5"
        strokeDasharray="1.1 2.35"
      />
      <path d="M15 1.5v8" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
