import { glyphShapes, type GlyphShape } from '@/components/illustrations/glyphShapes'
import { BODY, BODY_DARK, BODY_DEEP, BODY_LIGHT, CYAN, HEART, INK, NAVY, TONGUE, TONGUE_LINE, WHITE } from './palette'
import { ARM_W, K, LEN, WEB_ORIGIN, web, type Eyes, type Mouth, type PropKind } from './rig'
import { capsule, circle, ellipse, group, line, mix, path, sparklePath, type Box, type Shape } from './shapes'

/**
 * Every piece of Ušetřík, as shape lists. The ball and his face are the web
 * mascot's own paths (components/illustrations/Mascot.tsx), drawn in its 120-unit
 * space and scaled onto the artboard, so he is the same character to the pixel.
 * Limbs and props are drawn in the frame of the layer that carries them: an arm
 * from its joint downwards, a prop around the point the hand holds.
 */

/** Draws web-mascot coordinates onto the artboard. */
const WEB = `translate(${WEB_ORIGIN.x} ${WEB_ORIGIN.y}) scale(${K})`
const onWeb = (kids: Shape[]): Shape[] => [group(kids, WEB)]
/** A box given in web-mascot units, as artboard units. */
const webBox = (x: number, y: number, w: number, h: number): Box => [WEB_ORIGIN.x + x * K, WEB_ORIGIN.y + y * K, w * K, h * K]

const text = (x: number, y: number, t: string, size: number, fill: string, weight = 700): Shape => ({
  k: 'text',
  x,
  y,
  text: t,
  size,
  weight,
  anchor: 'middle',
  fill,
})

// --- the ball ------------------------------------------------------------------------

export const BALL_BOX = webBox(23, 24, 74, 68)
export const ball = (): Shape[] => onWeb([ellipse(60, 58, 36, 33, BODY), ellipse(60, 43, 26, 16, BODY_LIGHT, 0, 0.55)])

// --- face --------------------------------------------------------------------------

export const EYE_L = web(47, 56)
export const EYE_R = web(73, 56)
export const MOUTH_AT = web(60, 73)

export const BLUSH_BOX = webBox(28, 62, 64, 10)
/** The web mascot's cheeks; the layer's opacity turns them up with the mood. */
export const blush = (): Shape[] => onWeb([ellipse(35, 67, 5.5, 3.4, INK, 0, 0.09), ellipse(85, 67, 5.5, 3.4, INK, 0, 0.09)])

function eye(kind: Exclude<Eyes, 'wink'>, x: number, y: number): Shape[] {
  switch (kind) {
    case 'happy':
      return [line(`M${x - 6} ${y + 1} q6.5 -7 13 0`, INK, 3.4)]
    case 'closed':
      return [line(`M${x - 6} ${y - 1} q6.5 5.5 13 0`, INK, 3.4)]
    case 'half':
      return [
        path(`M${x - 6.5} ${y - 0.6} A6.5 6.5 0 0 0 ${x + 6.5} ${y - 0.6} Z`, INK),
        line(`M${x - 7} ${y - 0.8} L${x + 7} ${y - 0.8}`, INK, 2.2),
        circle(x - 2.4, y + 2, 1.6, WHITE),
      ]
    case 'wide':
      return [circle(x, y, 7.4, INK), circle(x - 2.4, y - 2.8, 2.7, WHITE), circle(x + 2.6, y + 2.5, 1, WHITE)]
    default:
      return [circle(x, y, 6.5, INK), circle(x - 2, y - 2.5, 2.3, WHITE)]
  }
}

export const EYES_BOX = webBox(38, 46, 44, 19)
export function eyes(kind: Eyes): Shape[] {
  return onWeb([...eye(kind === 'wink' ? 'open' : kind, 47, 56), ...eye(kind === 'wink' ? 'happy' : kind, 73, 56)])
}

export const MOUTH_BOX = webBox(45, 66, 30, 26)
export function mouth(kind: Mouth): Shape[] {
  switch (kind) {
    case 'grin':
      return onWeb([path('M50 70 q10 14 20 0 z', INK)])
    case 'open':
      return onWeb([
        path('M48 69.5 q12 17 24 0 z', INK),
        path('M54.2 75.6 Q60 72.4 65.8 75.6 Q63.4 78.2 60 78.3 Q56.6 78.2 54.2 75.6 Z', TONGUE),
      ])
    case 'tongue':
      return onWeb([
        path('M47 68 q13 18 26 0 z', INK),
        path('M53.5 73 L66.5 73 C66.5 84 63.5 89.5 60 89.5 C56.5 89.5 53.5 84 53.5 73 Z', TONGUE),
        line('M60 79 v6', TONGUE_LINE, 1.6),
      ])
    case 'o':
      return onWeb([ellipse(60, 73, 4, 5, INK)])
    case 'flat':
      return onWeb([line('M54 74 h12', INK, 3.4)])
    case 'smirk':
      return onWeb([line('M53 73 q7 4 14 -1', INK, 3.4)])
    case 'teeth':
      return onWeb([path('M49 69.5 h22 q0 9.5 -11 9.5 q-11 0 -11 -9.5 z', INK), path('M50.3 70.4 h19.4 l-0.7 2.9 h-18 z', WHITE)])
    case 'wobbly':
      return onWeb([line('M51 73.5 q2.25 -2.6 4.5 0 t4.5 0 t4.5 0 t4.5 0', INK, 3.2)])
    default:
      return onWeb([line('M50 71 q10 9 20 0', INK, 3.6)])
  }
}

// --- his sparkle ------------------------------------------------------------------------

/** The two cyan sparkles that ride along with him on the web. */
export const SPARKLES = [
  { at: web(99, 27), box: webBox(89, 17, 20, 20), shapes: onWeb([path(sparklePath(99, 27, 9), CYAN)]) },
  { at: web(20, 41), box: webBox(14, 35, 12, 12), shapes: onWeb([path(sparklePath(20, 41, 5.5), CYAN, 0.75)]) },
] as const

// --- headphones -------------------------------------------------------------------------

export const PHONES_BOX = webBox(17, 12, 86, 54)
export function phones(): Shape[] {
  const cup = (x: number, side: 1 | -1): Shape[] => [
    { k: 'rect', x: x - 5, y: 47, w: 10, h: 18, rx: 5, fill: NAVY },
    { k: 'rect', x: x - 1.4 + side * 1.6, y: 50.5, w: 2.8, h: 11, rx: 1.4, fill: CYAN },
  ]
  return onWeb([
    line('M24.5 53 C22 13 98 13 95.5 53', NAVY, 3.4),
    line('M33 30 C44 19.5 76 19.5 87 30', WHITE, 1.1, 0.35),
    ...cup(24, 1),
    ...cup(96, -1),
  ])
}

// --- limbs ------------------------------------------------------------------------------

/** From the shoulder (origin) down the upper arm: the web mascot's round 9-unit stroke. */
export const UPPER_ARM_BOX: Box = [-ARM_W / 2 - 1, -ARM_W / 2 - 1, ARM_W + 2, LEN.upper + ARM_W + 2]
export const upperArm = (): Shape[] => [capsule(0, 0, LEN.upper, ARM_W, BODY_DARK)]

/** From the elbow (origin) to the wrist; the round end is his hand. */
export const FOREARM_BOX: Box = [-ARM_W / 2 - 4, -ARM_W / 2 - 1, ARM_W + 8, LEN.fore + ARM_W + 2]
export const forearm = (): Shape[] => [capsule(0, 0, LEN.fore, ARM_W, BODY_DARK)]

/** A watch strapped just short of the wrist, face to the viewer. */
export function watch(): Shape[] {
  const y = LEN.fore - 14
  return [
    { k: 'rect', x: -ARM_W / 2 - 1.5, y: y - 6.5, w: ARM_W + 3, h: 13, rx: 4, fill: INK },
    { k: 'circle', cx: 0, cy: y, r: 13, fill: WHITE, stroke: INK, sw: 3.8 },
    line(`M0 ${y} L0 ${y - 7.5} M0 ${y} L5.5 ${y + 2}`, INK, 2.2),
    circle(0, y, 1.8, BODY),
  ]
}

/**
 * A fist with the thumb up, drawn upright around the middle of the fist. Creases
 * face the viewer so it reads as a hand, not a bigger blob of arm.
 */
export const THUMB_BOX: Box = [-24, -52, 48, 76]
export function thumb(): Shape[] {
  return [
    capsule(4, -36, -10, 3.9 * K, BODY_DARK),
    circle(0, 0, 5.8 * K, BODY_DARK),
    line('M-12 -5 q7 -3.5 14 0', BODY_DEEP, 2.6, 0.85),
    line('M-13 3 q7 -3.5 14 0', BODY_DEEP, 2.6, 0.85),
    line('M-11 11 q6 -3 12 0', BODY_DEEP, 2.6, 0.85),
  ]
}

/** A foot, from where it touches the ground (origin) up. */
export const FOOT_BOX: Box = [-36, -48, 72, 50]
export const foot = (): Shape[] => [ellipse(0, -6.5 * K, 9.5 * K, 6.5 * K, BODY_DARK)]

// --- props --------------------------------------------------------------------------------
// Flat white with ink outlines, like the coin and the sack he carries on the web.
// Each is drawn around the point his hand holds it by.

/** "https://usetri.app" — a real code, so the one in his hand actually scans. */
const QR_ROWS = [
  '1111111011000010101111111', '1000001000000010001000001', '1011101010011100101011101', '1011101011010001101011101',
  '1011101011110111101011101', '1000001001001010001000001', '1111111010101010101111111', '0000000001010110000000000',
  '1111001010000110110011101', '1001010011000000110100010', '0101111000000010010110000', '0011110110011111011001100',
  '1101101111010000011110111', '0100100110110101011110001', '0111001101001010010010110', '1000010101101101011110001',
  '0001101110010001111111111', '0000000011101100100010101', '1111111001011000101010111', '1000001001101001100010011',
  '1011101001111100111111000', '1011101011001111111011111', '1011101010111100001010110', '1000001010000001010010100',
  '1111111010001010001111111',
]
const QR_PATH = QR_ROWS.flatMap((row, y) => [...row].map((bit, x) => (bit === '1' ? `M${x} ${y}h1v1h-1z` : ''))).join('')

export const qr = (x: number, y: number, size: number, colour = INK): Shape => ({
  k: 'path',
  d: QR_PATH,
  fill: colour,
  tf: `translate(${x} ${y}) scale(${size / 25})`,
})

function phone(): Shape[] {
  return [
    group(
      [
        { k: 'rect', x: -9.5, y: -16, w: 19, h: 32, rx: 3.8, fill: INK },
        { k: 'rect', x: -7.9, y: -13.6, w: 15.8, h: 27.2, rx: 2.2, fill: WHITE },
        { k: 'rect', x: -2.6, y: -12.6, w: 5.2, h: 1.3, rx: 0.65, fill: INK },
        qr(-5.6, -9.6, 11.2),
        { k: 'rect', x: -5.6, y: 3.4, w: 11.2, h: 1.2, rx: 0.6, fill: '#c9d2e0' },
        { k: 'rect', x: -5.6, y: 6.2, w: 11.2, h: 4.2, rx: 2.1, fill: BODY },
      ],
      `scale(${K})`,
    ),
  ]
}

export function coin(r = 14 * K): Shape[] {
  const s = r / 14
  return [
    group(
      [{ k: 'circle', cx: 0, cy: 0, r: 14, fill: WHITE, stroke: INK, sw: 2.6 }, text(0, 5, 'Kč', 12, INK)],
      `scale(${s})`,
    ),
  ]
}

function magnifier(): Shape[] {
  return [
    group(
      [
        { k: 'rect', x: -2, y: -5, w: 4, h: 14, rx: 2, fill: INK },
        { k: 'circle', cx: 0, cy: -13, r: 8, fill: '#e9fbff', stroke: INK, sw: 2.8 },
        line('M-4.6 -15 q1.4 -3.3 5.2 -3.8', WHITE, 1.7),
        ellipse(3, -9.6, 2.4, 1.3, CYAN, -35, 0.45),
      ],
      `scale(${K})`,
    ),
  ]
}

/** The web mascot's money sack, held by the cord. */
function bag(): Shape[] {
  return [
    group(
      [
        { k: 'path', d: 'M90 59 C93 55 101 55 104 59 L107 70 L87 70 Z', fill: WHITE, stroke: INK, sw: 2.4, round: true },
        {
          k: 'path',
          d: 'M92 71 C88 78 80 84 80.5 90 C81 96.5 88 100.5 97 100.5 C106 100.5 113 96.5 113.5 90 C114 84 106 78 102 71 Z',
          fill: WHITE,
          stroke: INK,
          sw: 2.6,
          round: true,
        },
        { k: 'rect', x: 85, y: 67, w: 24, h: 6.5, rx: 3.25, fill: INK },
        text(97, 93, 'Kč', 12, INK),
      ],
      `scale(${K}) translate(-97 -70)`,
    ),
  ]
}

export const PROP_BOX: Record<PropKind, Box> = {
  phone: [-11 * K, -17.5 * K, 22 * K, 35 * K],
  coin: [-16 * K, -16 * K, 32 * K, 32 * K],
  magnifier: [-11 * K, -23 * K, 22 * K, 33 * K],
  bag: [-19 * K, -17 * K, 38 * K, 50 * K],
}

export function prop(kind: PropKind): Shape[] {
  if (kind === 'phone') return phone()
  if (kind === 'coin') return coin()
  if (kind === 'magnifier') return magnifier()
  return bag()
}

// --- things around him ----------------------------------------------------------------------

function glyph(shapes: readonly GlyphShape[], fg: string, ko: string): Shape[] {
  return shapes.map((s) => {
    const paint = s.ko ? ko : fg
    const stroked = 's' in s && s.s
    const look = stroked ? { fill: 'none', stroke: paint, sw: s.s, round: true, op: s.o } : { fill: paint, op: s.o }
    if (s.k === 'p') return { k: 'path', d: s.d, ...look }
    if (s.k === 'c') return { k: 'circle', cx: s.cx, cy: s.cy, r: s.r, ...look }
    return { k: 'rect', x: s.x, y: s.y, w: s.w, h: s.h, rx: s.rx, ...look }
  })
}

/**
 * One subscription as a chunky flat block: the service colour on the front, a
 * lighter lid for depth, the mark on the face. Centred on (0, 0).
 */
export function block(size: number, color: string, slug?: string): Shape[] {
  const s = size
  const d = s * 0.17
  const r = s * 0.25
  const g = s * 0.5
  const marks = slug ? glyphShapes[slug] : undefined
  return [
    { k: 'rect', x: -s / 2, y: -s / 2 - d, w: s, h: s + d, rx: r, fill: mix(color, '#ffffff', 0.38) },
    { k: 'rect', x: -s / 2, y: -s / 2, w: s, h: s, rx: r, fill: color },
    ...(marks ? [group(glyph(marks, '#ffffff', color), `translate(${-g / 2} ${-g / 2}) scale(${g / 24})`)] : []),
  ]
}

export const blockBox = (size: number): Box => [-size / 2 - 2, -size * 0.67 - 2, size + 4, size * 1.17 + 4]

export const sparkle = (r: number, colour: string): Shape[] => [path(sparklePath(0, 0, r), colour)]

export const heart = (colour = HEART): Shape[] => [
  path('M0 4 C-7 -2 -9 -8 -4.5 -10 C-2 -11 0 -9 0 -7 C0 -9 2 -11 4.5 -10 C9 -8 7 -2 0 4 Z', colour),
]

export const note = (colour: string): Shape[] => [
  ellipse(0, 0, 6, 4.6, colour, -22),
  { k: 'rect', x: 3.6, y: -20, w: 2.6, h: 20, rx: 1.3, fill: colour },
  path('M6.2 -20 Q14 -16 12 -8 Q11 -13 6.2 -14 Z', colour),
]

/** A bead of sweat, the kind cartoons use for "oops". Tip up, centred on its bulb. */
export const SWEAT_BOX: Box = [-10, -20, 20, 30]
export const sweat = (): Shape[] => [
  path('M0 -17 C3 -10 9 -3 9 2.5 A9 9 0 0 1 -9 2.5 C-9 -3 -3 -10 0 -17 Z', CYAN),
  ellipse(-3.2, 1.5, 2, 3.4, WHITE, 20, 0.75),
]

/** A thought cloud with two subscriptions in it, and a question. Centred on (0, 0). */
export function thought(): Shape[] {
  const puffs = [
    [-26, 4, 20],
    [-6, -10, 24],
    [18, -6, 22],
    [30, 10, 17],
    [4, 14, 20],
    [-18, 16, 16],
  ] as const
  const trail = [
    [-46, 52, 5],
    [-34, 36, 8],
  ] as const
  // Ink first, a size up, then white over it: one outline round the whole cloud.
  return [
    ...[...trail, ...puffs].map(([x, y, r]) => circle(x, y, r + 2.6, INK)),
    ...[...trail, ...puffs].map(([x, y, r]) => circle(x, y, r, WHITE)),
    group(block(22, '#e50914', 'netflix-premium'), 'translate(-14 5) rotate(-8)'),
    group(block(22, '#1db954', 'spotify-family'), 'translate(13 3) rotate(7)'),
    text(34, -10, '?', 22, INK, 900),
  ]
}
export const THOUGHT_BOX: Box = [-58, -42, 116, 106]
