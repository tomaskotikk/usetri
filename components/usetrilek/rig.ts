/**
 * Ušetřík's skeleton. He is the web mascot — a green ball that is body and head in
 * one, two noodle arms and two feet — and poses are plain data: arm angles, where
 * the feet stand, how the ball leans and a face. The same library drives the
 * website and, later, the Expo app. Nothing in here touches React or the DOM.
 *
 * Angles are in degrees, SVG-style: 0 points right, 90 points down, -90 points up.
 * Arm angles in a pose are absolute (not relative to the parent bone), which keeps
 * posing readable: "forearm at -90" is "forearm straight up" wherever the upper arm
 * is. `joints()` turns them into the relative turns a puppet of nested layers needs.
 * L and R are the viewer's left and right.
 */

export type Pt = { x: number; y: number }

export type Eyes = 'open' | 'happy' | 'closed' | 'wide' | 'wink' | 'half'
export type Mouth = 'smile' | 'grin' | 'open' | 'o' | 'flat' | 'smirk' | 'tongue' | 'teeth' | 'wobbly'

export type Arm = {
  upper: number
  fore: number
  /** A fist with the thumb up at the end of the arm. Otherwise the arm just ends round, as on the web. */
  thumb?: boolean
  /** Draws the arm over the ball. By default it comes out from behind it, as on the web. */
  front?: boolean
  /** A wristwatch on this arm. */
  watch?: boolean
}

/** A foot's offset from where it stands at rest, and its turn. */
export type Foot = { x?: number; y?: number; r?: number }

export type Face = {
  eyes: Eyes
  mouth: Mouth
  /** Where he looks, each axis -1..1. */
  look?: [number, number]
  /** How strong the cheeks are, 1 being the web mascot's. */
  blush?: number
}

export type PropKind = 'phone' | 'coin' | 'magnifier' | 'bag'

/**
 * Something held at the end of an arm, drawn upright: `along` the arm past the
 * wrist and `across` it (towards the viewer's right when the arm hangs down).
 */
export type HeldProp = { kind: PropKind; hand: 'L' | 'R'; along: number; across?: number; rot?: number; scale?: number }

export type Pose = {
  /** Moves the whole figure; negative y lifts him off the ground. */
  x?: number
  y?: number
  /** The ball rocks on its feet. Positive is clockwise, to the viewer's right. */
  lean?: number
  /** The face turns on the ball, about its middle. */
  tilt?: number
  /** Slides the face round the ball for a three-quarter look, -1..1. */
  turn?: number
  /** Holds the ball squashed (< 1) or stretched (> 1), keeping its volume. */
  squash?: number
  armL: Arm
  armR: Arm
  footL?: Foot
  footR?: Foot
  face: Face
  held?: HeldProp
  /** Headphones on. */
  phonesOn?: boolean
  /** Hides his sparkle, where a hand or a prop needs the space. */
  noSparkle?: boolean
}

/** The drawing area. The figure stands in the middle, feet on GROUND; the margins are for reach and jumps. */
export const VIEW = { x: -60, y: 40, w: 420, h: 392 } as const
export const GROUND = 414

/** One unit of the web mascot's 120 × 120 drawing, in artboard units. */
export const K = 3.5
/** Where the web drawing's origin lands on the artboard: its feet stand on GROUND, centred on x = 150. */
export const WEB_ORIGIN = { x: 150 - 60 * K, y: GROUND - 101.5 * K } as const
/** A point of the web mascot's drawing (components/illustrations/Mascot.tsx), on this artboard. */
export const web = (x: number, y: number): Pt => ({ x: WEB_ORIGIN.x + x * K, y: WEB_ORIGIN.y + y * K })

export const BALL = { ...web(60, 58), rx: 36 * K, ry: 33 * K } as const
/** The bottom of the ball, where it sits on its feet: it rocks and squashes about this point. */
export const SEAT = { x: BALL.x, y: BALL.y + BALL.ry } as const

export const REST = {
  /** Deep enough inside the ball that a round shoulder never peeks past its edge. */
  shoulderL: web(29.5, 61),
  shoulderR: web(90.5, 61),
  /** Where each foot touches the ground. */
  footL: web(45, 101.5),
  footR: web(75, 101.5),
} as const

export const LEN = { upper: 50, fore: 52 } as const
/** The web mascot's arms are 9-unit round strokes. */
export const ARM_W = 9 * K

export const rad = (deg: number) => (deg * Math.PI) / 180

/** Wraps an angle into (-180, 180], so a turn always takes the short way round. */
export function norm(deg: number) {
  const d = ((((deg + 180) % 360) + 360) % 360) - 180
  return d === -180 ? 180 : d
}

export function polar(from: Pt, deg: number, len: number): Pt {
  return { x: from.x + Math.cos(rad(deg)) * len, y: from.y + Math.sin(rad(deg)) * len }
}

export function rotateAbout(p: Pt, centre: Pt, deg: number): Pt {
  const c = Math.cos(rad(deg))
  const s = Math.sin(rad(deg))
  const dx = p.x - centre.x
  const dy = p.y - centre.y
  return { x: centre.x + dx * c - dy * s, y: centre.y + dx * s + dy * c }
}

export type Skeleton = {
  /** The middle of the ball, and its top — things around him are placed from these. */
  centre: Pt
  top: Pt
  shoulderL: Pt
  shoulderR: Pt
  elbowL: Pt
  elbowR: Pt
  wristL: Pt
  wristR: Pt
  footL: Pt
  footR: Pt
}

/** Where every joint ends up, in artboard units. Used to place things around him. */
export function solve(pose: Pose): Skeleton {
  const dx = pose.x ?? 0
  const dy = pose.y ?? 0
  const seat = { x: SEAT.x + dx, y: SEAT.y + dy }
  const onBall = (p: Pt) => rotateAbout({ x: p.x + dx, y: p.y + dy }, seat, pose.lean ?? 0)

  const shoulderL = onBall(REST.shoulderL)
  const shoulderR = onBall(REST.shoulderR)
  const elbowL = polar(shoulderL, pose.armL.upper, LEN.upper)
  const elbowR = polar(shoulderR, pose.armR.upper, LEN.upper)
  const foot = (rest: Pt, f?: Foot) => ({ x: rest.x + dx + (f?.x ?? 0), y: rest.y + dy + (f?.y ?? 0) })

  return {
    centre: onBall(BALL),
    top: onBall({ x: BALL.x, y: BALL.y - BALL.ry }),
    shoulderL,
    shoulderR,
    elbowL,
    elbowR,
    wristL: polar(elbowL, pose.armL.fore, LEN.fore),
    wristR: polar(elbowR, pose.armR.fore, LEN.fore),
    footL: foot(REST.footL, pose.footL),
    footR: foot(REST.footR, pose.footR),
  }
}

export type ArmTurns = { shoulder: number; elbow: number }
export type FootTurns = { x: number; y: number; r: number }

/**
 * The pose as a puppet of nested layers sees it: each joint turns relative to its
 * parent. An arm layer is drawn pointing straight down, so a turn of 0 hangs it.
 */
export function joints(pose: Pose) {
  const lean = pose.lean ?? 0
  const arm = (a: Arm): ArmTurns => ({ shoulder: norm(a.upper - 90 - lean), elbow: norm(a.fore - a.upper) })
  const foot = (f?: Foot): FootTurns => ({ x: f?.x ?? 0, y: f?.y ?? 0, r: f?.r ?? 0 })
  const squash = pose.squash ?? 1
  return {
    x: pose.x ?? 0,
    y: pose.y ?? 0,
    lean,
    tilt: pose.tilt ?? 0,
    turn: pose.turn ?? 0,
    /** Squash keeps the ball's volume: shorter means wider. */
    sx: 1 / Math.sqrt(squash),
    sy: squash,
    armL: arm(pose.armL),
    armR: arm(pose.armR),
    footL: foot(pose.footL),
    footR: foot(pose.footR),
  }
}

/** The turn that stands something upright inside the hand layer of an arm pointing along `fore`. */
export const upright = (fore: number, rot = 0) => norm(rot - (fore - 90))

/**
 * Where a held prop sits and how it turns inside the hand's layer, so that it ends
 * up upright in the world whatever the arm is doing. The hand layer points down
 * its arm: +y runs along the arm, +x across it.
 */
export function heldPlacement(pose: Pose) {
  const held = pose.held
  if (!held) return null
  const arm = held.hand === 'L' ? pose.armL : pose.armR
  return { x: held.across ?? 0, y: held.along, rot: upright(arm.fore, held.rot), scale: held.scale ?? 1 }
}
