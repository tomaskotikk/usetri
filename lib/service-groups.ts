import { pricePerSeat, type Service } from '@/types/service'

const ORGANISERS = [
  'Tereza K.',
  'Matěj S.',
  'Klára V.',
  'Jakub P.',
  'Anna R.',
  'Filip D.',
  'Petra M.',
  'Ondřej L.',
]

/** Deterministic so the server and client render identical mock groups. */
function hash(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export interface ServiceGroup {
  id: string
  organiser: string
  rating: string
  seatsTaken: number
  seatsTotal: number
  runningMonths: number
  price: number
}

export function groupsForService(service: Service): ServiceGroup[] {
  const base = hash(service.slug)
  const count = 3 + (base % 3)

  return Array.from({ length: count }, (_, i) => {
    const seed = hash(`${service.slug}:${i}`)
    const seatsTaken = 1 + (seed % Math.max(1, service.seats - 1))
    return {
      id: `${service.slug}-${i + 1}`,
      organiser: ORGANISERS[(seed >>> 3) % ORGANISERS.length],
      rating: (4.6 + ((seed >>> 5) % 5) / 10).toFixed(1),
      seatsTaken,
      seatsTotal: service.seats,
      runningMonths: 1 + ((seed >>> 7) % 18),
      price: pricePerSeat(service),
    }
  })
}
