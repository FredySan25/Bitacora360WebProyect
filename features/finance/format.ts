import { CURRENCY } from "./constants";

const moneyFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY });

/** e.g. "$1,250.50", or "-$20.00" for a negative amount. */
export function formatMoney(value: number): string {
  return moneyFormat.format(value);
}

/** Like `formatMoney`, but a positive amount carries its sign: "+$120.00". */
export function formatSignedMoney(value: number): string {
  return value > 0 ? `+${formatMoney(value)}` : formatMoney(value);
}

const compactMoneyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
  notation: "compact",
  // Two digits, so a half-way tick like 1,250 doesn't round up to "$1.3K"
  maximumFractionDigits: 2,
});

/** Short form for chart axes: "$0", "$750", "$1.25K". */
export function formatCompactMoney(value: number): string {
  return compactMoneyFormat.format(value);
}

/** e.g. "42 %". */
export function formatPercent(value: number): string {
  return `${Math.round(value)} %`;
}
