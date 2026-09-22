/** Groups thousands with a non-breaking space — deterministic on server and client. */
export function formatNumber(value: number) {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function formatCzk(value: number) {
  return `${formatNumber(value)} Kč`
}

/** "dnes" / "před 3 dny" / "12. 3. 2026" — no Intl, so hydration always matches. */
export function formatSince(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'dnes'
  if (days === 1) return 'včera'
  if (days < 7) return `před ${days} dny`
  if (days < 60) return `před ${Math.floor(days / 7)} týdny`
  return `před ${Math.floor(days / 30)} měsíci`
}
