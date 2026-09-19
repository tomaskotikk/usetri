import { describe, it, expect } from 'vitest'
import { categories, pricePerSeat, savingsPercent, services } from './service'

describe('service catalogue', () => {
  it('has unique slugs', () => {
    const slugs = services.map((s) => s.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('only uses categories that exist', () => {
    const ids = new Set(categories.map((c) => c.id))
    for (const s of services) {
      expect(ids.has(s.category)).toBe(true)
    }
  })

  it('covers every category with at least three services', () => {
    for (const c of categories) {
      expect(services.filter((s) => s.category === c.id).length).toBeGreaterThanOrEqual(3)
    }
  })

  it('always makes sharing cheaper than paying alone', () => {
    for (const s of services) {
      expect(s.seats).toBeGreaterThan(1)
      expect(pricePerSeat(s)).toBeLessThan(s.fullPrice)
      expect(savingsPercent(s)).toBeGreaterThan(0)
    }
  })
})
