const numberFormat = new Intl.NumberFormat("es", { maximumFractionDigits: 2 });

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** e.g. "10 × 60 kg", or "12 reps" for a bodyweight set. */
export function formatSet({ reps, weightKg }: { reps: number; weightKg: number }): string {
  return weightKg === 0 ? `${reps} reps` : `${reps} × ${formatNumber(weightKg)} kg`;
}
