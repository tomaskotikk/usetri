// lib/qr.test.ts
import { describe, it, expect } from 'vitest'
import { qrSvg } from './qr'

describe('qrSvg', () => {
  it('renders an SVG with a viewBox so CSS can size it', async () => {
    const svg = await qrSvg('SPD*1.0*ACC:CZ6508000000192000145399*AM:109.00*CC:CZK')
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('viewBox')
  })
})
