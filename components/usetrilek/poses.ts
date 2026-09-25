import type { Extra } from './extras'
import type { MOTIONS } from './motion'
import type { Arm, Pose } from './rig'

/**
 * The pose library. Each entry is where he stands, what he feels, how he moves
 * and where the app uses him — so the page that shows him doubles as the spec.
 */
export type PoseDef = {
  id: string
  name: string
  /** Where in the app this one belongs. */
  use: string
  pose: Pose
  /** How he moves while holding it — a key of MOTIONS. */
  motion: keyof typeof MOTIONS
  extras?: Extra[]
  /** Sits on a pile of subscriptions instead of standing on the ground. */
  seat?: boolean
}

/** Arms hanging the way the web mascot's do: out from behind the ball, curling back in. */
const hangL: Arm = { upper: 140, fore: 68 }
const hangR: Arm = { upper: 40, fore: 112 }
/** Elbow out a little further than hanging, as if about to plant a fist on his side. */
const hipL: Arm = { upper: 154, fore: 76 }

export const POSES: PoseDef[] = [
  {
    id: 'ahoj',
    motion: 'wave',
    name: 'Ahoj!',
    use: 'Vítání, onboarding, hlavička domovské obrazovky',
    pose: {
      lean: -2,
      tilt: -4,
      armL: hangL,
      armR: { upper: -45, fore: -84 },
      face: { eyes: 'open', mouth: 'grin' },
    },
  },
  {
    id: 'stoji',
    motion: 'stand',
    name: 'V klidu',
    use: 'Výchozí stav, prázdná místa v rozhraní',
    pose: {
      armL: hangL,
      armR: hangR,
      face: { eyes: 'open', mouth: 'smile' },
    },
  },
  {
    id: 'premysli',
    motion: 'think',
    name: 'Přemýšlí',
    use: 'Výběr služby, prázdný stav „ještě nemáš skupinu“',
    pose: {
      tilt: -5,
      turn: 0.25,
      armL: hangL,
      armR: { upper: 100, fore: 160, front: true },
      face: { eyes: 'open', mouth: 'smirk', look: [0.6, -0.9] },
      noSparkle: true,
    },
    extras: ['thought'],
  },
  {
    id: 'hura',
    motion: 'jump',
    name: 'Hurá!',
    use: 'Platba potvrzená, skupina je plná',
    pose: {
      armL: { upper: -118, fore: -98 },
      armR: { upper: -62, fore: -82 },
      face: { eyes: 'happy', mouth: 'open', blush: 1.5 },
      noSparkle: true,
    },
    extras: ['confetti'],
  },
  {
    id: 'ukazuje',
    motion: 'point',
    name: 'Ukazuje',
    use: 'Nápověda a tipy — „tady klikni“',
    pose: {
      x: -18,
      lean: 3,
      turn: 0.45,
      armL: hipL,
      armR: { upper: -12, fore: -20 },
      face: { eyes: 'open', mouth: 'smile', look: [1, -0.2] },
    },
  },
  {
    id: 'qr',
    motion: 'show',
    name: 'QR platba',
    use: 'Obrazovka platby — naskenuj a zaplať',
    pose: {
      tilt: -4,
      turn: 0.1,
      armL: hangL,
      armR: { upper: 58, fore: -96, front: true },
      face: { eyes: 'open', mouth: 'grin' },
      held: { kind: 'phone', hand: 'R', along: 24, rot: 6 },
      noSparkle: true,
    },
  },
  {
    id: 'mince',
    motion: 'flip',
    name: 'Ušetřil!',
    use: 'Přehled úspor, měsíční shrnutí',
    pose: {
      lean: -2,
      armL: hipL,
      armR: { upper: -62, fore: -104 },
      face: { eyes: 'wide', mouth: 'grin', look: [0.5, -0.7], blush: 1.3 },
      held: { kind: 'coin', hand: 'R', along: 26, scale: 0.8 },
      noSparkle: true,
    },
    extras: ['sparkles'],
  },
  {
    id: 'hleda',
    motion: 'search',
    name: 'Hledá',
    use: 'Vyhledávání v katalogu, žádné výsledky',
    pose: {
      lean: 4,
      turn: 0.5,
      armL: hangL,
      armR: { upper: 70, fore: -140, front: true },
      face: { eyes: 'wide', mouth: 'o', look: [1, 0] },
      held: { kind: 'magnifier', hand: 'R', along: 10, rot: 8 },
    },
  },
  {
    id: 'palec',
    motion: 'thumb',
    name: 'Palec nahoru',
    use: 'Uloženo, hotovo, všechno sedí',
    pose: {
      tilt: -3,
      turn: 0.1,
      armL: hangL,
      armR: { upper: 22, fore: -78, front: true, thumb: true },
      face: { eyes: 'wink', mouth: 'grin' },
      noSparkle: true,
    },
  },
  {
    id: 'krci',
    motion: 'shrug',
    name: 'Krčí rameny',
    use: 'Chyba, nic tu není, stránka nenalezena',
    pose: {
      tilt: 6,
      armL: { upper: 168, fore: -128 },
      armR: { upper: 12, fore: -52 },
      face: { eyes: 'open', mouth: 'teeth', look: [0, -0.4] },
      noSparkle: true,
    },
    extras: ['question', 'sweat'],
  },
  {
    id: 'nese',
    motion: 'carry',
    name: 'Nese úspory',
    use: 'Kolik jsi letos ušetřil',
    pose: {
      tilt: 3,
      turn: -0.15,
      armL: hangL,
      armR: { upper: 100, fore: -25, front: true },
      face: { eyes: 'happy', mouth: 'grin' },
      held: { kind: 'bag', hand: 'R', along: 6, scale: 0.9 },
    },
    extras: ['coins'],
  },
  {
    id: 'ceka',
    motion: 'wait',
    name: 'Čeká',
    use: 'Čeká se na platbu od člena',
    pose: {
      tilt: 2,
      armL: { upper: 160, fore: -75, front: true, watch: true },
      armR: hangR,
      face: { eyes: 'half', mouth: 'flat', look: [-1, -0.1] },
    },
  },
  {
    id: 'posloucha',
    motion: 'listen',
    name: 'Poslouchá',
    use: 'Hudební předplatné, Spotify skupiny',
    pose: {
      tilt: -6,
      phonesOn: true,
      armL: hangL,
      armR: { upper: 30, fore: -115, front: true },
      face: { eyes: 'closed', mouth: 'smile', blush: 1.3 },
      noSparkle: true,
    },
    extras: ['notes'],
  },
  {
    id: 'zve',
    motion: 'welcome',
    name: 'Zve do skupiny',
    use: 'Pozvánka — „pojď k nám, je tu volné místo“',
    pose: {
      armL: { upper: -152, fore: -118 },
      armR: { upper: -28, fore: -62 },
      face: { eyes: 'open', mouth: 'grin', blush: 1.3 },
      noSparkle: true,
    },
    extras: ['hearts'],
  },
  {
    id: 'sedi',
    motion: 'sit',
    name: 'Sedí na předplatných',
    use: 'Úvod webu, první spuštění appky',
    seat: true,
    pose: {
      y: -98,
      tilt: -4,
      armL: { upper: 132, fore: 84 },
      armR: { upper: -45, fore: -84 },
      footL: { x: 8, y: 18, r: 8 },
      footR: { x: -8, y: 18, r: -8 },
      face: { eyes: 'open', mouth: 'grin' },
    },
  },
  {
    id: 'visi',
    motion: 'dangle',
    name: 'Visí',
    use: 'Stažení seznamu dolů — obnovení v appce',
    pose: {
      armL: { upper: -100, fore: -93 },
      armR: { upper: -80, fore: -87 },
      footL: { x: 9, y: -3, r: 12 },
      footR: { x: -9, y: -3, r: -12 },
      face: { eyes: 'open', mouth: 'smile', look: [0, -0.6] },
      noSparkle: true,
    },
  },
  {
    id: 'spi',
    motion: 'sleep',
    name: 'Spí',
    use: 'Noční režim, patička webu, nic nového',
    pose: {
      lean: 2,
      tilt: 7,
      squash: 0.98,
      armL: { upper: 138, fore: 80 },
      armR: { upper: 42, fore: 100 },
      face: { eyes: 'closed', mouth: 'o', look: [0, 0.5] },
    },
    extras: ['zzz'],
  },
]

export const REST_POSE = POSES.find((p) => p.id === 'stoji')!.pose
