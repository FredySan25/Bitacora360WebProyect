import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 5.5C6 4.5 9 4 12 4.8V19c-3-.8-6-.3-8 .7z" />
      <path d="M20 5.5C18 4.5 15 4 12 4.8V19c3-.8 6-.3 8 .7z" />
    </BaseIcon>
  );
}

export function TodayIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8.5 3v4M15.5 3v4" />
      <path d="M9.5 14.5l1.8 1.8 3.4-3.6" />
    </BaseIcon>
  );
}

export function HabitsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12.2l2.3 2.3 4.7-4.9" />
    </BaseIcon>
  );
}

export function FinanceIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="6" width="17" height="12.5" rx="2" />
      <path d="M3.5 10h17" />
      <path d="M15.5 14.5h2" />
    </BaseIcon>
  );
}

export function WatchlistIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M10.5 9.5v5l4-2.5z" />
    </BaseIcon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14" />
      <path d="M10 8l-4 4 4 4M6 12h9.5" />
    </BaseIcon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </BaseIcon>
  );
}
