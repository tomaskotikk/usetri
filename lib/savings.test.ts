import { describe, it, expect } from 'vitest'
import { estimateSharedCost, estimateAnnualSavings } from './savings'

describe('estimateSharedCost', () => {
  it('returns ~35% of current spend as the shared-cost estimate', () => {
    expect(estimateSharedCost(400)).toBeCloseTo(140, 0)
  })

  it('returns 0 for 0 or negative input', () => {
    expect(estimateSharedCost(0)).toBe(0)
    expect(estimateSharedCost(-50)).toBe(0)
  })
})

describe('estimateAnnualSavings', () => {
  it('sums monthly prices and returns annual savings at the shared-cost ratio', () => {
    // monthly total 300 -> shared ~105 -> monthly savings ~195 -> annual ~2340
    expect(estimateAnnualSavings([150, 150])).toBeCloseTo(2340, -1)
  })

  it('returns 0 for an empty list', () => {
    expect(estimateAnnualSavings([])).toBe(0)
  })
})
