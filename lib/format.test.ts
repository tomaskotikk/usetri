import { describe, it, expect } from 'vitest'
import { formatCzk, formatNumber, formatSince } from './format'

const NBSP = ' '

describe('formatNumber', () => {
  it('leaves values under a thousand alone', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(999)).toBe('999')
  })

  it('groups thousands with a non-breaking space', () => {
    expect(formatNumber(1247)).toBe(`1${NBSP}247`)
    expect(formatNumber(1234567)).toBe(`1${NBSP}234${NBSP}567`)
  })

  it('rounds so prices never render a fraction', () => {
    expect(formatNumber(43.4)).toBe('43')
    expect(formatNumber(43.6)).toBe('44')
  })
})

describe('formatCzk', () => {
  it('keeps the amount and the unit on one line', () => {
    expect(formatCzk(1247)).toBe(`1${NBSP}247${NBSP}Kč`)
  })
})

describe('formatSince', () => {
  const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()

  it('names the recent days', () => {
    expect(formatSince(daysAgo(0))).toBe('dnes')
    expect(formatSince(daysAgo(1))).toBe('včera')
    expect(formatSince(daysAgo(3))).toBe('před 3 dny')
  })

  it('switches to weeks and months as it ages', () => {
    expect(formatSince(daysAgo(14))).toBe('před 2 týdny')
    expect(formatSince(daysAgo(90))).toBe('před 3 měsíci')
  })

  it('treats a future timestamp as today rather than a negative count', () => {
    expect(formatSince(new Date(Date.now() + 60_000).toISOString())).toBe('dnes')
  })
})
