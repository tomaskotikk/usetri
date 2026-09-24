// lib/billing.test.ts
import { describe, it, expect } from 'vitest'
import { addDays, currentPeriod, dueDateFor, formatDate, periodStatus, todayInPrague, upcomingPeriod } from './billing'

describe('dueDateFor', () => {
  it('keeps the day of the month', () => {
    expect(dueDateFor('2026-10-12', 0)).toBe('2026-10-12')
    expect(dueDateFor('2026-10-12', 1)).toBe('2026-11-12')
  })

  it('crosses the year', () => {
    expect(dueDateFor('2026-12-15', 1)).toBe('2027-01-15')
  })

  it('clamps to the end of a short month and comes back afterwards', () => {
    expect(dueDateFor('2026-01-31', 1)).toBe('2026-02-28')
    expect(dueDateFor('2026-01-31', 2)).toBe('2026-03-31')
    expect(dueDateFor('2028-01-31', 1)).toBe('2028-02-29')
  })
})

describe('currentPeriod', () => {
  it('is the start on the first day', () => {
    expect(currentPeriod('2026-10-12', '2026-10-12')).toBe('2026-10-12')
  })

  it('stays until the next due date', () => {
    expect(currentPeriod('2026-10-12', '2026-11-11')).toBe('2026-10-12')
    expect(currentPeriod('2026-10-12', '2026-11-12')).toBe('2026-11-12')
  })

  it('handles month ends', () => {
    expect(currentPeriod('2026-01-31', '2026-03-01')).toBe('2026-02-28')
    expect(currentPeriod('2026-01-31', '2026-03-30')).toBe('2026-02-28')
    expect(currentPeriod('2026-01-31', '2026-03-31')).toBe('2026-03-31')
  })
})

describe('upcomingPeriod', () => {
  it('shows the next period seven days ahead, not earlier', () => {
    expect(upcomingPeriod('2026-10-12', '2026-11-04')).toBeNull()
    expect(upcomingPeriod('2026-10-12', '2026-11-05')).toBe('2026-11-12')
  })
})

describe('periodStatus', () => {
  it('reflects the payment when there is one', () => {
    expect(periodStatus('2026-10-12', 'confirmed', '2026-12-01')).toBe('paid')
    expect(periodStatus('2026-10-12', 'reported', '2026-12-01')).toBe('reported')
  })

  it('becomes overdue after three days of grace', () => {
    expect(periodStatus('2026-10-12', null, '2026-10-15')).toBe('due')
    expect(periodStatus('2026-10-12', null, '2026-10-16')).toBe('overdue')
  })
})

describe('helpers', () => {
  it('adds days across a month', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02')
  })

  it('reads today in Prague, not UTC', () => {
    // 22:30 UTC on 30 Sep is already 1 Oct in Prague (CEST, +2).
    expect(todayInPrague(new Date('2026-09-30T22:30:00Z'))).toBe('2026-10-01')
  })

  it('formats a date the Czech way', () => {
    expect(formatDate('2026-10-02')).toBe('2. 10. 2026')
  })
})
