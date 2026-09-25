/**
 * How UĹˇetĹ™Ă­k moves, as data. A motion is a set of tracks; a track loops one layer
 * of the puppet (an arm joint, the ball, the face, a footâ€¦) through a smooth
 * periodic curve. Curves are written the way an animator thinks â€” splines through
 * acted keys with holds, real parabolas for anything in the air, damped springs for
 * a jelly body settling â€” and then sampled densely, so any renderer can play them
 * as plain keyframes: the web on the compositor, the app on the UI thread.
 *
 * He is a ball of jelly, so the ball does most of the acting: it squashes to load
 * and stretches to go, wobbles when it lands, rocks on its feet, and the face slides
 * round it to nod and look. Arms trail the body a beat late; eyes lead the head.
 *
 * Units: rotations in degrees, translations in artboard units, scales as factors.
 */

import type { Pose } from './rig'

export type Target =
  /** The whole figure, feet and all, about the point between his feet. */
  | 'body'
  /** The ball about its bottom: weight shifting, breathing, then acting. */
  | 'sway'
  | 'breath'
  | 'ball'
  /** The face on the ball, about the ball's middle: idle drift, then acting. */
  | 'faceIdle'
  | 'face'
  | 'eyes'
  | 'blink'
  | 'mouth'
  | 'sparkA'
  | 'sparkB'
  | 'shadow'
  | 'held'
  | 'armL'
  | 'foreL'
  | 'handL'
  | 'armR'
  | 'foreR'
  | 'handR'
  | 'footL'
  | 'footR'

export type Frame = { r?: number; x?: number; y?: number; sx?: number; sy?: number }

export type Track =
  | { target: Target; dur: number; fn: (t: number) => Frame }
  /** Explicit keyframes, played as written â€” for things that snap, like a blink. */
  | { target: Target; dur: number; keys: readonly { t: number; f: Frame; ease?: string }[] }

export type Motion = readonly Track[]

// --- curve helpers ------------------------------------------------------------------

const TAU = Math.PI * 2

/** A sine over one cycle, lagging by `lag` of a cycle. */
export const sin = (t: number, lag = 0) => Math.sin(TAU * (t - lag))

/** 0 â†’ 1 â†’ 0 over one cycle, at rest at both ends. */
export const swell = (t: number, lag = 0) => 0.5 - 0.5 * Math.cos(TAU * (t - lag))

const wrap = (t: number) => ((t % 1) + 1) % 1
const smooth = (t: number) => t * t * (3 - 2 * t)

/**
 * A smooth loop through keys [t, value], t in [0, 1): a periodic monotone cubic
 * (Fritschâ€“Carlson), so a held value stays held and nothing overshoots a key the
 * animator didn't ask for. Overshoot, where wanted, is written in as its own key.
 */
export function spline(keys: readonly (readonly [number, number])[]) {
  const n = keys.length
  const ts = keys.map((k) => k[0])
  const vs = keys.map((k) => k[1])
  const at = (i: number) => {
    const j = ((i % n) + n) % n
    return { t: ts[j] + Math.floor(i / n), v: vs[j] }
  }
  const slope = (i: number) => {
    const a = at(i)
    const b = at(i + 1)
    return (b.v - a.v) / (b.t - a.t)
  }
  const tangents = ts.map((_, i) => {
    const s0 = slope(i - 1)
    const s1 = slope(i)
    // A turning point or a hold: stop there, don't sail past it.
    if (s0 * s1 <= 0) return 0
    // Otherwise the weighted harmonic mean of the neighbouring slopes.
    const h0 = at(i).t - at(i - 1).t
    const h1 = at(i + 1).t - at(i).t
    return (3 * (h0 + h1)) / ((2 * h1 + h0) / s0 + (h1 + 2 * h0) / s1)
  })
  return (t: number) => {
    const x = wrap(t)
    let i = n - 1
    for (let k = 0; k < n; k++) if (ts[k] <= x) i = k
    const a = at(i)
    const b = at(i + 1)
    const h = b.t - a.t
    const s = (x - a.t) / h
    const s2 = s * s
    const s3 = s2 * s
    return (
      (2 * s3 - 3 * s2 + 1) * a.v +
      (s3 - 2 * s2 + s) * h * tangents[i] +
      (-2 * s3 + 3 * s2) * b.v +
      (s3 - s2) * h * tangents[(i + 1) % n]
    )
  }
}

type Keys = readonly (readonly [number, number])[]

/** The same keyed curve on several channels at once. */
function keyed(channels: Partial<Record<keyof Frame, Keys>>, lag = 0) {
  const curves = Object.entries(channels).map(([k, keys]) => [k as keyof Frame, spline(keys!)] as const)
  return (t: number): Frame => Object.fromEntries(curves.map(([k, c]) => [k, c(t - lag)]))
}

/** Keys scaled by -1 â€” the other arm of a symmetric gesture. */
const mirror = (keys: Keys): Keys => keys.map(([t, v]) => [t, -v] as const)


/**
 * Squash and stretch that keeps the volume: `s` is the height factor, the width
 * gives way by its square root, as a ball of jelly does.
 */
const squash = (s: number): Frame => ({ sy: s, sx: 1 / Math.sqrt(s) })

/** A throw under gravity: 0 on the ground, 1 at the top, a true parabola between `from` and `to`. */
function flight(t: number, from: number, to: number) {
  if (t <= from || t >= to) return 0
  const s = (t - from) / (to - from)
  return 4 * s * (1 - s)
}

/**
 * A jelly settling after a knock: starts at `-amp`, rings at `freq` wobbles per
 * cycle and dies away, reaching exactly 0 at u = 1.
 */
function ring(u: number, amp: number, freq: number, decay: number) {
  if (u <= 0 || u >= 1) return 0
  return -amp * Math.exp(-decay * u) * Math.cos(TAU * freq * u) * (1 - u ** 6)
}

// --- sampling -------------------------------------------------------------------------

export type Sample = { offset: number; frame: Frame; ease?: string }

function scaleFrame(f: Frame, k: number): Frame {
  return {
    r: (f.r ?? 0) * k,
    x: (f.x ?? 0) * k,
    y: (f.y ?? 0) * k,
    sx: 1 + ((f.sx ?? 1) - 1) * k,
    sy: 1 + ((f.sy ?? 1) - 1) * k,
  }
}

/** Enough keyframes that straight lines between them read as a curve, even on a fast landing. */
const samplesFor = (dur: number) => Math.max(30, Math.ceil(dur * 50))

/** One cycle of a track, as keyframes. */
export function sampleLoop(track: Track): Sample[] {
  if ('keys' in track) return track.keys.map((k) => ({ offset: k.t, frame: k.f, ease: k.ease }))
  const n = samplesFor(track.dur)
  return Array.from({ length: n + 1 }, (_, i) => ({ offset: i / n, frame: scaleFrame(track.fn(i / n), 1) }))
}

/**
 * Whether a curve already starts still and in place â€” a keyed jump does, a sine
 * doesn't. Those that do can loop from the first frame at full size.
 */
export function startsAtRest(fn: (t: number) => Frame) {
  const e = 0.002
  const a = scaleFrame(fn(0), 1)
  const b = scaleFrame(fn(e), 1)
  const off = Math.abs(a.r!) + Math.abs(a.x!) + Math.abs(a.y!) + Math.abs(a.sx! - 1) * 40 + Math.abs(a.sy! - 1) * 40
  const speed = (Math.abs(b.r! - a.r!) + Math.abs(b.x! - a.x!) + Math.abs(b.y! - a.y!) + (Math.abs(b.sx! - a.sx!) + Math.abs(b.sy! - a.sy!)) * 40) / e
  return off < 0.05 && speed < 0.5
}

/**
 * The first cycle, faded in from rest: a loop that starts at full swing would
 * jerk. The envelope eases in and out, so the handover to the loop is seamless in
 * both position and speed. Curves that already start at rest need none.
 */
export function sampleIntro(track: Track): Sample[] | null {
  if ('keys' in track || startsAtRest(track.fn)) return null
  const n = samplesFor(track.dur)
  return Array.from({ length: n + 1 }, (_, i) => ({ offset: i / n, frame: scaleFrame(track.fn(i / n), smooth(i / n)) }))
}

/**
 * Letting go of a loop mid-swing: it carries on along its own curve for a moment
 * while its size fades to nothing, so the part keeps its speed instead of
 * stopping dead when the next pose takes over. `phase` is where the loop was, in
 * cycles; `easingIn` says it was still in its fade-in.
 */
export function sampleRelease(fn: (t: number) => Frame, dur: number, phase: number, easingIn: boolean, releaseMs: number): Sample[] {
  const n = 18
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n
    const p = phase + (t * releaseMs) / (dur * 1000)
    const size = (easingIn ? smooth(Math.min(1, p)) : 1) * (1 - smooth(t))
    return { offset: t, frame: scaleFrame(fn(p), size) }
  })
}

// --- being alive ---------------------------------------------------------------------------

/** A snap into a look, a hair past it, and a settle â€” eyes move in darts, not glides. */
const DART = 'cubic-bezier(.25,.9,.35,1)'

/**
 * Blinks: a quick close, a hold of two frames, a slower open. Once, then a long
 * gap, then twice in a row â€” the double blink is what makes it look alive.
 */
const BLINK: Track = {
  target: 'blink',
  dur: 6.7,
  keys: [
    { t: 0, f: {} },
    { t: 0.31, f: {}, ease: 'cubic-bezier(.5,0,.9,.6)' },
    { t: 0.318, f: { sy: 0.07, y: 0.6 } },
    { t: 0.324, f: { sy: 0.07, y: 0.6 }, ease: 'cubic-bezier(.2,.5,.4,1)' },
    { t: 0.342, f: {} },
    { t: 0.79, f: {}, ease: 'cubic-bezier(.5,0,.9,.6)' },
    { t: 0.798, f: { sy: 0.07, y: 0.6 } },
    { t: 0.803, f: { sy: 0.07, y: 0.6 }, ease: 'cubic-bezier(.2,.5,.4,1)' },
    { t: 0.818, f: { sy: 0.9 } },
    { t: 0.83, f: { sy: 0.07, y: 0.6 } },
    { t: 0.835, f: { sy: 0.07, y: 0.6 }, ease: 'cubic-bezier(.2,.5,.4,1)' },
    { t: 0.853, f: {} },
    { t: 1, f: {} },
  ],
}

/** Glances away and back now and then, with a hold â€” a quick look round the room. */
const GLANCE: Track = {
  target: 'eyes',
  dur: 9.4,
  keys: [
    { t: 0, f: {} },
    { t: 0.52, f: {}, ease: DART },
    { t: 0.535, f: { x: -9.8, y: 1.6 } },
    { t: 0.55, f: { x: -9, y: 1.4 } },
    { t: 0.66, f: { x: -9, y: 1.4 }, ease: DART },
    { t: 0.677, f: { x: 0.6, y: -0.2 } },
    { t: 0.69, f: {} },
    { t: 1, f: {} },
  ],
}

/** A breath: in quicker than out, with a little rest at the bottom. 0 â†’ 1 â†’ 0. */
const BREATH = spline([
  [0, 0],
  [0.36, 1],
  [0.44, 0.97],
  [0.88, 0.03],
])

/** A sparkle's twinkle: a flare, a slow fade to small, and back; turning as it goes. */
const twinkle = (lag: number) => {
  const size = spline([
    [0, 1],
    [0.1, 1.24],
    [0.24, 0.9],
    [0.52, 0.74],
    [0.8, 0.96],
  ])
  return (t: number): Frame => {
    const s = size(t - lag)
    return { sx: s, sy: s, r: 14 * sin(t, lag), y: -5 * swell(t, lag + 0.1) }
  }
}

/**
 * Being alive: breathing swells the ball and floats the arms out a beat later, the
 * weight drifts from foot to foot, the face never quite holds still, the sparkles
 * twinkle and he blinks. Every pose gets this underneath its own motion, on the
 * layers its motion leaves free. Periods are all different, so it never repeats.
 */
export function idle(pose: Pose, own: Motion): Track[] {
  const uses = new Set(own.map((t) => t.target))
  const tracks: Track[] = [
    { target: 'breath', dur: 3.9, fn: (t) => squash(1 + 0.022 * BREATH(t)) },
    { target: 'sway', dur: 7.3, fn: (t) => ({ r: 0.9 * sin(t) + 0.25 * sin(3 * t, 0.2) }) },
    { target: 'faceIdle', dur: 6.1, fn: (t) => ({ r: 1.3 * sin(t) + 0.45 * sin(2 * t, 0.3), x: 1.6 * sin(t, 0.22), y: 0.9 * swell(t, 0.1) }) },
    { target: 'sparkA', dur: 2.7, fn: twinkle(0) },
    { target: 'sparkB', dur: 3.4, fn: twinkle(0.4) },
    // Arms float out on each breath in, the forearms a touch after the upper arms.
    { target: 'armL', dur: 3.9, fn: (t) => ({ r: 1.8 * BREATH(t - 0.06) }) },
    { target: 'armR', dur: 3.9, fn: (t) => ({ r: -1.8 * BREATH(t - 0.06) }) },
    { target: 'foreL', dur: 3.9, fn: (t) => ({ r: 1.6 * BREATH(t - 0.14) }) },
    { target: 'foreR', dur: 3.9, fn: (t) => ({ r: -1.6 * BREATH(t - 0.14) }) },
  ]
  if (['open', 'wide', 'half'].includes(pose.face.eyes)) tracks.push(BLINK)
  if (pose.face.eyes === 'open') tracks.push(GLANCE)
  return tracks.filter((t) => !uses.has(t.target))
}

// --- the library -------------------------------------------------------------------------

/** The jump's beats, as shares of its cycle: crouch, take-off, touch-down. */
const J = { crouch: 0.09, launch: 0.18, land: 0.5 } as const
/** How high he gets, in artboard units. */
const JUMP_H = 84

/** Height of the jelly, frame by frame: load, stretch into the air, round at the top, splat, wobble out. */
function jumpBall(t: number): number {
  if (t < J.crouch) return 1 - 0.15 * smooth(t / J.crouch)
  if (t < J.launch) {
    const s = (t - J.crouch) / (J.launch - J.crouch)
    return 0.85 + 0.29 * s * s * (3 - 2 * s)
  }
  if (t < J.land) {
    // Stretched by speed: long at take-off and touch-down, round at the top.
    const s = (t - J.launch) / (J.land - J.launch)
    return 1 + 0.14 * Math.abs(1 - 2 * s) ** 1.4
  }
  const u = (t - J.land) / (1 - J.land)
  const hit = 0.09
  if (u < hit) return 1.14 - 0.32 * smooth(u / hit)
  return 1 + ring((u - hit) / (1 - hit), 0.18, 2.4, 5.2)
}

const jumpAir = (t: number) => flight(t, J.launch, J.land)

export const MOTIONS: Record<string, Motion> = {
  none: [],

  /**
   * Hi! Three swings of a loose forearm, the ball leaning into each and the face
   * tilting a beat behind, a word on the lips, then a nod and a rest before the next.
   */
  wave: [
    {
      target: 'foreR',
      dur: 2.7,
      fn: keyed({ r: [[0, 0], [0.06, 18], [0.15, -15], [0.24, 17], [0.33, -14], [0.42, 12], [0.5, -5], [0.57, 1.5], [0.63, 0]] }),
    },
    { target: 'armR', dur: 2.7, fn: keyed({ r: [[0, 0], [0.08, -4], [0.17, 3], [0.26, -4], [0.35, 3], [0.44, -2.5], [0.54, 0.8], [0.62, 0]] }) },
    {
      target: 'ball',
      dur: 2.7,
      fn: keyed({
        r: [[0, 0], [0.08, 1.3], [0.17, -0.7], [0.26, 1.3], [0.35, -0.7], [0.44, 1], [0.56, 0]],
        sy: [[0, 1], [0.64, 1], [0.7, 0.975], [0.78, 1.012], [0.86, 1]],
        sx: [[0, 1], [0.64, 1], [0.7, 1.013], [0.78, 0.994], [0.86, 1]],
      }),
    },
    {
      target: 'face',
      dur: 2.7,
      fn: keyed({
        r: [[0, 0], [0.12, 3], [0.21, -1], [0.3, 3], [0.39, -1], [0.48, 2.4], [0.6, 0]],
        y: [[0, 0], [0.64, 0], [0.7, 4.5], [0.79, -1], [0.87, 0]],
      }),
    },
    {
      target: 'mouth',
      dur: 2.7,
      fn: keyed({ sy: [[0, 1], [0.05, 1.2], [0.1, 0.92], [0.15, 1.12], [0.22, 1]], sx: [[0, 1], [0.05, 0.94], [0.1, 1.05], [0.15, 0.97], [0.22, 1]] }),
    },
  ],

  /** Standing easy: a look round the room, the face following the eyes a beat behind. */
  stand: [
    {
      target: 'eyes',
      dur: 7.6,
      keys: [
        { t: 0, f: {} },
        { t: 0.4, f: {}, ease: DART },
        { t: 0.417, f: { x: -10, y: 1.8 } },
        { t: 0.435, f: { x: -9.2, y: 1.6 } },
        { t: 0.58, f: { x: -9.2, y: 1.6 }, ease: DART },
        { t: 0.6, f: { x: 8.9, y: -2.6 } },
        { t: 0.618, f: { x: 8.2, y: -2.4 } },
        { t: 0.75, f: { x: 8.2, y: -2.4 }, ease: DART },
        { t: 0.768, f: { x: -0.6, y: 0.2 } },
        { t: 0.785, f: {} },
        { t: 1, f: {} },
      ],
    },
    { target: 'face', dur: 7.6, fn: keyed({ x: [[0, 0], [0.41, 0], [0.47, -5.5], [0.59, -5.5], [0.66, 4.5], [0.76, 4.5], [0.83, 0]], r: [[0, 0], [0.47, -1.5], [0.59, -1.5], [0.66, 1.5], [0.76, 1.5], [0.83, 0]] }) },
    { target: 'ball', dur: 7.6, fn: keyed({ r: [[0, 0], [0.48, -0.8], [0.6, -0.8], [0.68, 0.7], [0.78, 0.7], [0.86, 0]] }) },
  ],

  /** Fist under his chin, tapping twice; the eyes wander off to one side while he makes up his mind. */
  think: [
    { target: 'foreR', dur: 5.6, fn: keyed({ r: [[0, 0], [0.04, -6], [0.08, 0], [0.12, -6], [0.16, 0], [0.52, 0], [0.56, -6], [0.6, 0], [0.64, -6], [0.68, 0]] }) },
    {
      target: 'eyes',
      dur: 5.6,
      keys: [
        { t: 0, f: {} },
        { t: 0.3, f: {}, ease: DART },
        { t: 0.322, f: { x: -17.5, y: 1.4 } },
        { t: 0.34, f: { x: -16.6, y: 1.2 } },
        { t: 0.46, f: { x: -16.6, y: 1.2 }, ease: 'ease-in-out' },
        { t: 0.5, f: { x: -15, y: -1.4 } },
        { t: 0.62, f: { x: -15, y: -1.4 }, ease: DART },
        { t: 0.642, f: { x: 0.7, y: 0.2 } },
        { t: 0.66, f: {} },
        { t: 1, f: {} },
      ],
    },
    { target: 'face', dur: 5.6, fn: keyed({ r: [[0, 0], [0.25, 2.6], [0.5, 2.6], [0.75, -1.4]], x: [[0, 0], [0.31, 0], [0.38, -5], [0.62, -5], [0.69, 0]] }) },
    { target: 'mouth', dur: 5.6, fn: keyed({ x: [[0, 0], [0.31, 0], [0.38, -4], [0.62, -4], [0.69, 0]], sx: [[0, 1], [0.38, 0.9], [0.62, 0.9], [0.69, 1]] }) },
    { target: 'ball', dur: 5.6, fn: (t) => ({ r: 1.5 * sin(t, 0.1) }) },
  ],

  /**
   * A jump with everything in it: squash to load, stretch to launch, a true parabola
   * through the air, round at the top, stretched again falling, a splat on landing
   * and a jelly wobble dying out. The feet tuck, the arms fling up and flop down late,
   * the face slides down the ball on each impact.
   */
  jump: [
    { target: 'body', dur: 1.9, fn: (t) => ({ y: -JUMP_H * jumpAir(t) }) },
    { target: 'ball', dur: 1.9, fn: (t) => squash(jumpBall(t)) },
    {
      target: 'shadow',
      dur: 1.9,
      fn: (t) => {
        const s = 1 - 0.46 * jumpAir(t) + (t < J.launch ? 0.06 * swell(t / J.launch / 2) : 0)
        return { sx: s, sy: s }
      },
    },
    {
      target: 'footL',
      dur: 1.9,
      fn: keyed({
        y: [[0, 0], [J.crouch, 0], [J.launch, 6], [0.26, -8], [0.34, -15], [0.44, -5], [J.land, 0]],
        r: [[0, 0], [J.crouch, -3], [0.24, -6], [0.34, -17], [0.45, -4], [J.land, 0], [0.55, 4], [0.64, 0]],
        x: [[0, 0], [J.crouch, -4], [J.launch, 0], [J.land, 0], [0.54, -6], [0.64, 0]],
      }),
    },
    {
      target: 'footR',
      dur: 1.9,
      fn: keyed({
        y: [[0, 0], [J.crouch, 0], [J.launch, 6], [0.27, -8], [0.35, -15], [0.45, -5], [J.land, 0]],
        r: [[0, 0], [J.crouch, 3], [0.25, 6], [0.35, 17], [0.46, 4], [J.land, 0], [0.55, -4], [0.64, 0]],
        x: [[0, 0], [J.crouch, 4], [J.launch, 0], [J.land, 0], [0.54, 6], [0.64, 0]],
      }),
    },
    { target: 'armL', dur: 1.9, fn: keyed({ r: [[0, 0], [J.crouch, -13], [J.launch, 11], [0.34, 2], [0.46, 9], [0.54, -17], [0.63, 6], [0.72, -2], [0.8, 0]] }) },
    { target: 'armR', dur: 1.9, fn: keyed({ r: [[0, 0], [J.crouch, 13], [J.launch, -11], [0.34, -2], [0.46, -9], [0.54, 17], [0.63, -6], [0.72, 2], [0.8, 0]] }) },
    { target: 'foreL', dur: 1.9, fn: keyed({ r: [[0, 0], [0.11, -11], [0.21, 15], [0.36, 0], [0.48, 11], [0.57, -21], [0.66, 8], [0.75, -3], [0.83, 0]] }) },
    { target: 'foreR', dur: 1.9, fn: keyed({ r: [[0, 0], [0.11, 11], [0.21, -15], [0.36, 0], [0.48, -11], [0.57, 21], [0.66, -8], [0.75, 3], [0.83, 0]] }) },
    { target: 'face', dur: 1.9, fn: keyed({ y: [[0, 0], [J.crouch, 6.5], [J.launch, -5], [0.34, -2], [0.47, -3.5], [0.54, 10], [0.63, -3.5], [0.72, 1.2], [0.8, 0]] }) },
    { target: 'mouth', dur: 1.9, fn: keyed({ sy: [[0, 1], [J.crouch, 0.88], [J.launch, 1.14], [0.34, 1.22], [0.48, 1.05], [0.54, 0.86], [0.64, 1.05], [0.74, 1]], sx: [[0, 1], [J.crouch, 1.08], [J.launch, 0.95], [0.34, 1.02], [0.54, 1.1], [0.64, 0.98], [0.74, 1]] }) },
  ],

  /** Two jabs of the arm â€” it stretches out like rubber â€” the ball leaning into each, then a breath. */
  point: [
    {
      target: 'foreR',
      dur: 2.8,
      fn: keyed({
        sy: [[0, 1], [0.05, 0.94], [0.1, 1.16], [0.17, 0.97], [0.24, 1.01], [0.3, 1], [0.46, 1], [0.51, 0.94], [0.56, 1.14], [0.63, 0.97], [0.7, 1.01], [0.76, 1]],
        r: [[0, 0], [0.05, 2], [0.1, -3], [0.2, 1], [0.3, 0], [0.46, 0], [0.51, 2], [0.56, -3], [0.66, 1], [0.76, 0]],
      }),
    },
    { target: 'armR', dur: 2.8, fn: keyed({ r: [[0, 0], [0.05, 2], [0.1, -2.5], [0.2, 0.8], [0.3, 0], [0.46, 0], [0.51, 2], [0.56, -2.5], [0.66, 0.8], [0.76, 0]]}) },
    {
      target: 'ball',
      dur: 2.8,
      fn: keyed({
        r: [[0, 0], [0.05, -0.9], [0.1, 1.8], [0.2, 0.3], [0.3, 0], [0.46, 0], [0.51, -0.9], [0.56, 1.6], [0.66, 0.3], [0.76, 0]],
        sy: [[0, 1], [0.05, 0.98], [0.1, 1.02], [0.2, 1], [0.46, 1], [0.51, 0.98], [0.56, 1.02], [0.66, 1]],
      }),
    },
    { target: 'face', dur: 2.8, fn: keyed({ x: [[0, 0], [0.1, 3.5], [0.3, 0.5], [0.46, 0], [0.56, 3.5], [0.76, 0]], y: [[0, 0], [0.1, 2], [0.2, 0], [0.56, 2], [0.66, 0]] }) },
    { target: 'mouth', dur: 2.8, fn: keyed({ sy: [[0, 1], [0.08, 1.15], [0.16, 0.95], [0.26, 1], [0.54, 1], [0.6, 1.12], [0.7, 1]] }) },
  ],

  /** Holds the phone out, turning it a little towards whoever should scan it, and checks it's still there. */
  show: [
    { target: 'armR', dur: 3.6, fn: (t) => ({ r: -3 * swell(t) }) },
    { target: 'foreR', dur: 3.6, fn: (t) => ({ r: 3.5 * sin(t, 0.08) }) },
    { target: 'held', dur: 3.6, fn: (t) => ({ r: 3 * sin(t, 0.16), y: -2 * swell(t, 0.1) }) },
    { target: 'ball', dur: 3.6, fn: (t) => ({ r: 1.3 * swell(t, 0.05) }) },
    {
      target: 'eyes',
      dur: 3.6,
      keys: [
        { t: 0, f: {} },
        { t: 0.18, f: {}, ease: DART },
        { t: 0.2, f: { x: 9.6, y: -3.4 } },
        { t: 0.22, f: { x: 9, y: -3 } },
        { t: 0.48, f: { x: 9, y: -3 }, ease: DART },
        { t: 0.5, f: { x: -0.5, y: 0.2 } },
        { t: 0.52, f: {} },
        { t: 1, f: {} },
      ],
    },
    { target: 'face', dur: 3.6, fn: keyed({ x: [[0, 0], [0.19, 0], [0.26, 4], [0.48, 4], [0.55, 0]], r: [[0, 0], [0.26, 2], [0.48, 2], [0.56, -1], [0.7, 0]] }) },
  ],

  /** Flips the coin â€” a dip to load, two turns through the air, a soft catch â€” and watches it all the way. */
  flip: [
    {
      target: 'held',
      dur: 2.4,
      fn: (t) => {
        const air = flight(t, 0.16, 0.5)
        const s = t > 0.16 && t < 0.5 ? (t - 0.16) / 0.34 : 0
        const dip = spline([[0, 0], [0.1, 0], [0.14, 5], [0.16, 0], [0.5, 0], [0.54, 6], [0.62, 0]])(t)
        return { y: -96 * air + dip, sx: Math.cos(TAU * 2 * s), r: 8 * sin(2 * s) }
      },
    },
    { target: 'foreR', dur: 2.4, fn: keyed({ r: [[0, 0], [0.1, 8], [0.16, -10], [0.24, -2], [0.46, 0], [0.5, 8], [0.58, -2], [0.66, 0]] }) },
    { target: 'armR', dur: 2.4, fn: keyed({ r: [[0, 0], [0.1, 3], [0.16, -5], [0.3, 0], [0.5, 4], [0.6, 0]] }) },
    { target: 'ball', dur: 2.4, fn: keyed({ sy: [[0, 1], [0.1, 0.965], [0.17, 1.03], [0.26, 1], [0.5, 1], [0.54, 0.97], [0.61, 1.012], [0.68, 1]], sx: [[0, 1], [0.1, 1.018], [0.17, 0.985], [0.26, 1], [0.5, 1], [0.54, 1.016], [0.61, 0.994], [0.68, 1]] }) },
    { target: 'face', dur: 2.4, fn: keyed({ y: [[0, 0], [0.12, 1.5], [0.22, -4], [0.33, -6.5], [0.5, 0], [0.55, 2.5], [0.64, 0]], r: [[0, 0], [0.33, -2], [0.5, 0]] }) },
    { target: 'eyes', dur: 2.4, fn: keyed({ y: [[0, 0], [0.16, 0], [0.24, -6], [0.33, -9], [0.48, 0.5], [0.54, 0]], x: [[0, 0], [0.24, -1.5], [0.33, -2], [0.5, 0]] }) },
    { target: 'mouth', dur: 2.4, fn: keyed({ sy: [[0, 1], [0.2, 1.1], [0.33, 1.2], [0.5, 1], [0.55, 0.9], [0.62, 1]] }) },
  ],

  /** Sweeps the lens one way, stops and peers, sweeps back; the eyes lead, the face follows, the hand trails. */
  search: [
    { target: 'armR', dur: 3.8, fn: keyed({ r: [[0, 0], [0.18, 7], [0.36, 7], [0.56, -6], [0.74, -6], [0.92, 0]] }) },
    { target: 'foreR', dur: 3.8, fn: keyed({ r: [[0, 0], [0.18, 4], [0.36, 4], [0.56, -4], [0.74, -4], [0.92, 0]] }, 0.035) },
    { target: 'held', dur: 3.8, fn: keyed({ r: [[0, 0], [0.2, -6], [0.3, -3], [0.38, -4], [0.58, 6], [0.68, 3], [0.76, 4], [0.94, 0]] }) },
    { target: 'eyes', dur: 3.8, fn: keyed({ x: [[0, 0], [0.13, 7.5], [0.36, 7.5], [0.5, -6.5], [0.74, -6.5], [0.87, 0]] }) },
    { target: 'face', dur: 3.8, fn: keyed({ x: [[0, 0], [0.2, 5], [0.36, 5], [0.58, -4], [0.74, -4], [0.94, 0]], y: [[0, 0], [0.24, 2.5], [0.34, 2.5], [0.42, 0], [0.62, 2.5], [0.72, 2.5], [0.8, 0]] }) },
    { target: 'ball', dur: 3.8, fn: keyed({ r: [[0, 0], [0.2, 1.6], [0.36, 1.6], [0.58, -1.3], [0.74, -1.3], [0.94, 0]] }) },
  ],

  /** Pumps the thumb twice, bouncing on each, and nods along. */
  thumb: [
    { target: 'foreR', dur: 2.4, fn: keyed({ r: [[0, 0], [0.07, -6], [0.14, 7], [0.2, -2], [0.27, 0], [0.44, 0], [0.5, -5], [0.56, 6], [0.62, -1.5], [0.7, 0]] }) },
    { target: 'handR', dur: 2.4, fn: keyed({ r: [[0, 0], [0.07, -5], [0.14, 6], [0.2, -2], [0.27, 0], [0.44, 0], [0.5, -4], [0.56, 5], [0.62, -1.5], [0.7, 0]] }, 0.03) },
    { target: 'ball', dur: 2.4, fn: keyed({ sy: [[0, 1], [0.07, 0.97], [0.14, 1.03], [0.22, 0.994], [0.3, 1], [0.44, 1], [0.5, 0.975], [0.56, 1.025], [0.64, 1]], sx: [[0, 1], [0.07, 1.015], [0.14, 0.986], [0.22, 1.003], [0.3, 1], [0.44, 1], [0.5, 1.013], [0.56, 0.988], [0.64, 1]] }) },
    { target: 'face', dur: 2.4, fn: keyed({ y: [[0, 0], [0.14, 4.5], [0.26, 0], [0.56, 3.5], [0.68, 0]], r: [[0, 0], [0.14, -2], [0.3, 0], [0.56, -1.5], [0.7, 0]] }) },
    { target: 'mouth', dur: 2.4, fn: keyed({ sy: [[0, 1], [0.14, 1.12], [0.26, 1], [0.56, 1.1], [0.68, 1]] }) },
  ],

  /** Arms up, the ball sinking between them â€” "no idea" â€” hold, and drop with a little bounce. */
  shrug: [
    { target: 'armL', dur: 3, fn: keyed({ r: [[0, 0], [0.12, 9], [0.46, 9], [0.58, 0], [0.64, -2.5], [0.72, 0]] }) },
    { target: 'armR', dur: 3, fn: keyed({ r: mirror([[0, 0], [0.12, 9], [0.46, 9], [0.58, 0], [0.64, -2.5], [0.72, 0]]) }) },
    { target: 'foreL', dur: 3, fn: keyed({ r: [[0, 0], [0.14, 13], [0.46, 11], [0.6, 0], [0.67, -4], [0.75, 0]] }) },
    { target: 'foreR', dur: 3, fn: keyed({ r: mirror([[0, 0], [0.14, 13], [0.46, 11], [0.6, 0], [0.67, -4], [0.75, 0]]) }) },
    { target: 'ball', dur: 3, fn: keyed({ sy: [[0, 1], [0.12, 0.94], [0.46, 0.95], [0.58, 1.025], [0.66, 0.99], [0.74, 1]], sx: [[0, 1], [0.12, 1.03], [0.46, 1.025], [0.58, 0.988], [0.66, 1.005], [0.74, 1]] }) },
    { target: 'face', dur: 3, fn: keyed({ r: [[0, 0], [0.14, 6], [0.3, 4], [0.46, 6], [0.6, 0]], y: [[0, 0], [0.12, 3], [0.46, 3], [0.58, -1], [0.66, 0]] }) },
    {
      target: 'eyes',
      dur: 3,
      keys: [
        { t: 0, f: {} },
        { t: 0.1, f: {}, ease: DART },
        { t: 0.12, f: { x: 6.4, y: -6.4 } },
        { t: 0.14, f: { x: 6, y: -6 } },
        { t: 0.48, f: { x: 6, y: -6 }, ease: DART },
        { t: 0.5, f: { x: -0.4, y: 0.3 } },
        { t: 0.52, f: {} },
        { t: 1, f: {} },
      ],
    },
    { target: 'mouth', dur: 3, fn: keyed({ sx: [[0, 1], [0.14, 1.08], [0.46, 1.05], [0.6, 1]], sy: [[0, 1], [0.14, 0.9], [0.46, 0.92], [0.6, 1]] }) },
  ],

  /**
   * Marching on the spot with the sack: one foot up, then the other, the jelly
   * squashing on every step and leaning over the foot it stands on; the sack swings
   * a beat behind, the free arm swings against the step.
   */
  carry: [
    { target: 'footL', dur: 1.3, fn: (t) => (t < 0.5 ? { y: -15 * Math.sin((Math.PI * t) / 0.5), r: -7 * Math.sin((Math.PI * t) / 0.5) } : {}) },
    { target: 'footR', dur: 1.3, fn: (t) => (t >= 0.5 ? { y: -15 * Math.sin((Math.PI * (t - 0.5)) / 0.5), r: 7 * Math.sin((Math.PI * (t - 0.5)) / 0.5) } : {}) },
    { target: 'body', dur: 1.3, fn: (t) => ({ y: -5 * swell(2 * t) }) },
    { target: 'ball', dur: 1.3, fn: (t) => ({ ...squash(1 - 0.03 * Math.cos(2 * TAU * t)), r: 2.2 * sin(t) }) },
    { target: 'held', dur: 1.3, fn: (t) => ({ r: 9 * sin(t, 0.13) }) },
    { target: 'armR', dur: 1.3, fn: (t) => ({ r: 2.5 * sin(t, 0.06) }) },
    { target: 'armL', dur: 1.3, fn: (t) => ({ r: -7 * sin(t, 0.04) }) },
    { target: 'foreL', dur: 1.3, fn: (t) => ({ r: -6 * sin(t, 0.12) }) },
    { target: 'face', dur: 1.3, fn: (t) => ({ y: 2.6 * swell(2 * t, 0.07), r: 1.4 * sin(t, 0.1) }) },
  ],

  /** Taps a foot, lifts the watch to check it, looks up at you, and every now and then lets out a sigh. */
  wait: [
    { target: 'footR', dur: 0.72, fn: keyed({ y: [[0, 0], [0.14, -6], [0.34, 0]], r: [[0, 0], [0.14, -7], [0.34, 0]], sy: [[0, 1], [0.34, 1], [0.4, 0.9], [0.52, 1]], sx: [[0, 1], [0.34, 1], [0.4, 1.06], [0.52, 1]] }) },
    { target: 'armL', dur: 4.2, fn: keyed({ r: [[0, 0], [0.06, 6], [0.34, 6], [0.44, 0]] }) },
    { target: 'foreL', dur: 4.2, fn: keyed({ r: [[0, 0], [0.08, -9], [0.34, -9], [0.46, 0]] }) },
    {
      target: 'eyes',
      dur: 4.2,
      keys: [
        { t: 0, f: {} },
        { t: 0.42, f: {}, ease: DART },
        { t: 0.44, f: { x: 10.4, y: -2 } },
        { t: 0.46, f: { x: 9.8, y: -1.8 } },
        { t: 0.84, f: { x: 9.8, y: -1.8 }, ease: DART },
        { t: 0.86, f: { x: -0.3, y: 0.3 } },
        { t: 0.88, f: {} },
        { t: 1, f: {} },
      ],
    },
    { target: 'face', dur: 4.2, fn: keyed({ r: [[0, 0], [0.1, 2.2], [0.4, 2.2], [0.5, -1.5], [0.84, -1.5], [0.92, 0]], y: [[0, 0], [0.1, 2], [0.4, 2], [0.5, 0], [0.7, 0], [0.76, 2.5], [0.86, 0]] }) },
    { target: 'ball', dur: 4.2, fn: keyed({ sy: [[0, 1], [0.64, 1], [0.7, 1.035], [0.8, 0.955], [0.9, 1]], sx: [[0, 1], [0.64, 1], [0.7, 0.983], [0.8, 1.023], [0.9, 1]] }) },
    { target: 'mouth', dur: 4.2, fn: keyed({ sx: [[0, 1], [0.7, 1], [0.76, 0.7], [0.84, 0.75], [0.9, 1]], sy: [[0, 1], [0.7, 1], [0.76, 1.6], [0.84, 1.5], [0.9, 1]] }) },
  ],

  /** Nods on the beat, taps a foot, sways across two bars, lost in it. */
  listen: [
    { target: 'face', dur: 0.5, fn: keyed({ y: [[0, 0], [0.14, 5.5], [0.3, 4.2], [0.72, 0.4]] }) },
    { target: 'ball', dur: 0.5, fn: keyed({ sy: [[0, 1], [0.14, 0.974], [0.4, 1.006], [0.72, 1]], sx: [[0, 1], [0.14, 1.013], [0.4, 0.997], [0.72, 1]] }) },
    { target: 'sway', dur: 2, fn: (t) => ({ r: 2.4 * sin(t) }) },
    { target: 'footL', dur: 1, fn: keyed({ y: [[0, 0], [0.1, -6], [0.24, 0]], sy: [[0, 1], [0.24, 1], [0.3, 0.9], [0.4, 1]] }) },
    { target: 'armR', dur: 2, fn: (t) => ({ r: 1.6 * sin(t, 0.06) }) },
    { target: 'foreR', dur: 0.5, fn: keyed({ r: [[0, 0], [0.18, -2.5], [0.7, 0]] }) },
    { target: 'mouth', dur: 1, fn: keyed({ sx: [[0, 1], [0.2, 1.06], [0.5, 1], [0.7, 1.05]], sy: [[0, 1], [0.2, 0.94], [0.5, 1], [0.7, 0.95]] }) },
  ],

  /** Arms open wide, forearms beckoning in twice â€” "come on in" â€” with a happy bounce. */
  welcome: [
    { target: 'foreL', dur: 1.9, fn: keyed({ r: [[0, 0], [0.1, 17], [0.21, -2], [0.33, 15], [0.45, -1.5], [0.55, 0]] }) },
    { target: 'foreR', dur: 1.9, fn: keyed({ r: mirror([[0, 0], [0.1, 17], [0.21, -2], [0.33, 15], [0.45, -1.5], [0.55, 0]]) }) },
    { target: 'armL', dur: 1.9, fn: keyed({ r: [[0, 0], [0.12, 4], [0.23, 0], [0.35, 4], [0.48, 0]] }) },
    { target: 'armR', dur: 1.9, fn: keyed({ r: mirror([[0, 0], [0.12, 4], [0.23, 0], [0.35, 4], [0.48, 0]]) }) },
    { target: 'ball', dur: 1.9, fn: keyed({ sy: [[0, 1], [0.1, 0.97], [0.2, 1.028], [0.32, 0.97], [0.44, 1.028], [0.56, 0.995], [0.64, 1]], sx: [[0, 1], [0.1, 1.015], [0.2, 0.986], [0.32, 1.015], [0.44, 0.986], [0.56, 1.003], [0.64, 1]] }) },
    { target: 'face', dur: 1.9, fn: keyed({ r: [[0, 0], [0.2, 3], [0.5, -2], [0.8, 0]], y: [[0, 0], [0.1, 3], [0.22, 0], [0.33, 3], [0.45, 0]] }) },
  ],

  /** Feet swinging off the edge, out of step with each other and with the wave. */
  sit: [
    { target: 'footL', dur: 1.35, fn: (t) => ({ y: -8 * swell(t), sx: 1 + 0.08 * sin(t, 0.25), sy: 1 + 0.08 * sin(t, 0.25), r: 7 * sin(t) }) },
    { target: 'footR', dur: 1.35, fn: (t) => ({ y: -8 * swell(t, 0.5), sx: 1 + 0.08 * sin(t, 0.75), sy: 1 + 0.08 * sin(t, 0.75), r: -7 * sin(t, 0.5) }) },
    { target: 'foreR', dur: 1.05, fn: (t) => ({ r: 16 * sin(t) }) },
    { target: 'armR', dur: 1.05, fn: (t) => ({ r: -3 * swell(t, 0.05) }) },
    { target: 'sway', dur: 2.7, fn: (t) => ({ r: 1.5 * sin(t) }) },
    { target: 'face', dur: 2.1, fn: (t) => ({ r: 2.2 * sin(t, 0.2), y: 1.2 * swell(2 * t) }) },
  ],

  /** Hanging on by both hands: the feet swing out of step, the ball turns a little under its grip. */
  dangle: [
    { target: 'footL', dur: 2.2, fn: (t) => ({ r: 9 * sin(t), x: 3 * sin(t, 0.05) }) },
    { target: 'footR', dur: 2.2, fn: (t) => ({ r: 9 * sin(t, 0.18), x: 3 * sin(t, 0.23) }) },
    { target: 'ball', dur: 2.2, fn: (t) => ({ r: 1.6 * sin(t, 0.08), ...squash(1 + 0.012 * sin(2 * t)) }) },
    { target: 'foreL', dur: 2.2, fn: (t) => ({ r: -1.5 * sin(t, 0.1) }) },
    { target: 'foreR', dur: 2.2, fn: (t) => ({ r: -1.5 * sin(t, 0.1) }) },
    { target: 'face', dur: 4.4, fn: (t) => ({ x: 2.5 * sin(t), r: 1.2 * sin(t, 0.2) }) },
  ],

  /** Asleep on his feet: deep slow breaths, the face drooping on each, a little snore. */
  sleep: [
    { target: 'breath', dur: 5, fn: (t) => squash(1 + 0.05 * BREATH(t)) },
    { target: 'face', dur: 5, fn: (t) => ({ y: 3.5 * BREATH(t - 0.08) - 1.5, r: 1.2 * sin(t, 0.1) }) },
    { target: 'mouth', dur: 5, fn: (t) => ({ sx: 1 + 0.18 * BREATH(t - 0.04), sy: 1 + 0.3 * BREATH(t - 0.04) }) },
    { target: 'armL', dur: 5, fn: (t) => ({ r: 2.2 * BREATH(t - 0.06) }) },
    { target: 'armR', dur: 5, fn: (t) => ({ r: -2.2 * BREATH(t - 0.06) }) },
  ],
}

