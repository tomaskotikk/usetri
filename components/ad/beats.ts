import type { MascotMood } from '@/components/illustrations/Mascot'

/** Which in-phone screen a beat shows. */
export type ScreenKey = 'home' | 'catalog' | 'escrow' | 'payment' | 'savings' | 'brand'

/** Headlines are tokenised so words can stagger in and accents can be painted. */
export type Token = { t: string; hl?: boolean }

export interface Beat {
  screen: ScreenKey
  /** How long this beat holds, in milliseconds. */
  ms: number
  kicker: string
  head: Token[]
  sub?: string
  mood: MascotMood
  holds?: 'coin' | 'bag'
}

const tok = (line: string, highlight: string[] = []): Token[] =>
  line.split(' ').map((t) => ({ t, hl: highlight.includes(t.replace(/[,.?!]/g, '')) }))

export const beats: Beat[] = [
  {
    screen: 'home',
    ms: 2800,
    kicker: 'Ušetři',
    head: tok('Platíš předplatné sám?', ['sám']),
    sub: 'Spotify, Netflix, Disney+ — plná cena každý měsíc.',
    mood: 'wave',
  },
  {
    screen: 'catalog',
    ms: 2800,
    kicker: 'Najdi skupinu',
    head: tok('Najdi lidi, co platí to samé.', ['to', 'samé']),
    sub: 'Rodinný tarif má volná místa. Stačí je obsadit.',
    mood: 'search',
  },
  {
    screen: 'escrow',
    ms: 3400,
    kicker: 'Bezpečná platba',
    head: tok('Peníze držíme v úschově, dokud nemáš přístup.', ['v', 'úschově']),
    sub: 'Nedorazí přístup do 72 hodin? Vracíme automaticky.',
    mood: 'think',
    holds: 'bag',
  },
  {
    screen: 'payment',
    ms: 2800,
    kicker: 'Každý měsíc',
    head: tok('O platby se staráme my.', ['my']),
    sub: 'Žádné upomínky, žádné trapné zprávy.',
    mood: 'cheer',
  },
  {
    screen: 'savings',
    ms: 3400,
    kicker: 'Výsledek',
    head: tok('Ušetři až 4 320 Kč ročně.', ['4', '320', 'Kč']),
    sub: 'Stejné služby. Zlomek ceny.',
    mood: 'cheer',
    holds: 'coin',
  },
  {
    screen: 'brand',
    ms: 4200,
    kicker: '',
    head: [],
    mood: 'cheer',
    holds: 'coin',
  },
]

export const totalMs = beats.reduce((sum, b) => sum + b.ms, 0)

/** Elapsed time on the loop -> which beat is on screen. */
export function beatAt(elapsed: number) {
  let t = elapsed % totalMs
  for (let i = 0; i < beats.length; i++) {
    if (t < beats[i].ms) return { index: i, progress: t / beats[i].ms }
    t -= beats[i].ms
  }
  return { index: beats.length - 1, progress: 1 }
}
