const SHARED_COST_RATIO = 0.35

export function estimateSharedCost(currentMonthlySpend: number): number {
  if (currentMonthlySpend <= 0) return 0
  return currentMonthlySpend * SHARED_COST_RATIO
}

export function estimateAnnualSavings(monthlyPrices: number[]): number {
  const total = monthlyPrices.reduce((sum, p) => sum + p, 0)
  if (total <= 0) return 0
  const monthlySavings = total - estimateSharedCost(total)
  return monthlySavings * 12
}
