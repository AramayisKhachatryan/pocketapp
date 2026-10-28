// Calendar helpers with no UI dependencies.

export function greetingFor(date: Date): string {
  const h = date.getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  if (h >= 17 && h < 23) return 'Good evening'
  return 'Working late'
}

export function daysInYear(year: number): number {
  return (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000
}

/** 1-based day of the year (Jan 1 = 1). */
export function dayOfYear(date: Date): number {
  return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 1)) / 86_400_000 + 1
}

/** Fraction of the year (0..1) at which each month after January begins. */
export function monthStarts(year: number): number[] {
  const total = daysInYear(year)
  return Array.from({ length: 11 }, (_, i) => dayOfYear(new Date(year, i + 1, 1)) - 1).map((d) => d / total)
}
