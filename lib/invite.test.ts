import { describe, it, expect } from 'vitest'
import { formatCzk } from './format'
import { freeSeats, inviteHeadline, inviteMessage, safeNext, seatsLeft } from './invite'

const service = { slug: 'spotify-family', name: 'Spotify', plan: 'Family', color: '#1db954', fullPrice: 259 }

describe('safeNext', () => {
  it('keeps same-site paths', () => {
    expect(safeNext('/pozvanka/abc')).toBe('/pozvanka/abc')
  })

  it('falls back for anything that could leave the site', () => {
    expect(safeNext('//evil.example')).toBe('/dashboard')
    expect(safeNext('https://evil.example')).toBe('/dashboard')
    expect(safeNext(null)).toBe('/dashboard')
    expect(safeNext('')).toBe('/dashboard')
  })
})

describe('invite copy', () => {
  it('names who invites when we know it', () => {
    expect(inviteHeadline({ ownerName: 'Tomáš', service })).toBe('Tomáš tě zve do skupiny Spotify')
    expect(inviteHeadline({ ownerName: null, service })).toBe('Pozvánka do skupiny Spotify')
  })

  it('writes the share message with both prices', () => {
    expect(inviteMessage('Spotify', 44, 259)).toBe(
      `Pojď se mnou do skupiny Spotify přes Ušetři — ${formatCzk(44)} měsíčně místo ${formatCzk(259)}.`,
    )
  })

  it('declines the seat count the Czech way', () => {
    expect(seatsLeft(0)).toBe('Obsazeno')
    expect(seatsLeft(1)).toBe('Zbývá 1 místo')
    expect(seatsLeft(3)).toBe('Zbývají 3 místa')
    expect(seatsLeft(5)).toBe('Zbývá 5 míst')
  })

  it('never reports negative free seats', () => {
    expect(freeSeats({ seatsTotal: 4, seatsTaken: 5 })).toBe(0)
  })
})
