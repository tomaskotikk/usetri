// lib/spd.test.ts
import { describe, it, expect } from 'vitest'
import { MESSAGE_LIMIT, buildSpd, paymentMessage } from './spd'

describe('buildSpd', () => {
  it('builds the Czech QR payment string', () => {
    expect(
      buildSpd({ iban: 'CZ6508000000192000145399', amount: 109, vs: 40000017, message: 'Usetri Netflix 10/2026 Tomas K.' }),
    ).toBe('SPD*1.0*ACC:CZ6508000000192000145399*AM:109.00*CC:CZK*X-VS:40000017*MSG:Usetri Netflix 10/2026 Tomas K.')
  })
})

describe('paymentMessage', () => {
  it('names the service, month and payer without diacritics', () => {
    expect(paymentMessage('Netflix', '2026-10-12', 'Tomáš Kotík')).toBe('Usetri Netflix 10/2026 Tomas K.')
  })

  it('keeps a single name whole', () => {
    expect(paymentMessage('Spotify', '2027-01-05', 'Žofie')).toBe('Usetri Spotify 1/2027 Zofie')
  })

  it('removes the SPD separator', () => {
    expect(paymentMessage('Disney*Plus', '2026-10-12', 'Jan Novák')).toBe('Usetri DisneyPlus 10/2026 Jan N.')
  })

  it('shortens a long service name, never the month or payer', () => {
    const message = paymentMessage('Microsoft 365 Family s extra dlouhým názvem tarifu', '2026-10-12', 'Tomáš Kotík')
    expect(message.length).toBeLessThanOrEqual(MESSAGE_LIMIT)
    expect(message.startsWith('Usetri Microsoft')).toBe(true)
    expect(message.endsWith(' 10/2026 Tomas K.')).toBe(true)
  })

  it('never exceeds the limit even for an absurd name', () => {
    expect(paymentMessage('Netflix', '2026-10-12', 'A'.repeat(100)).length).toBeLessThanOrEqual(MESSAGE_LIMIT)
  })
})
