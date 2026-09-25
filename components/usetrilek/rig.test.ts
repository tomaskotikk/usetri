import { describe, expect, it } from 'vitest'
import { BALL, GROUND, LEN, REST, SEAT, VIEW, heldPlacement, joints, norm, polar, rad, rotateAbout, solve, web, type Pose, type Pt } from './rig'
import { MOTIONS, idle, sampleIntro, sampleLoop, spline, startsAtRest, type Track } from './motion'
import { POSES } from './poses'

const hanging: Pose = {
  armL: { upper: 90, fore: 90 },
  armR: { upper: 90, fore: 90 },
  face: { eyes: 'open', mouth: 'smile' },
}

const close = (a: number, b: number, digits = 6) => expect(a).toBeCloseTo(b, digits)
const same = (a: Pt, b: Pt) => {
  close(a.x, b.x, 4)
  close(a.y, b.y, 4)
}

describe('web', () => {
  it('draws the web mascot to scale, feet on the ground', () => {
    same(web(60, 58), BALL)
    close(web(45, 101.5).y, GROUND)
    close(web(60, 0).x, 150)
    close(BALL.rx / 36, BALL.ry / 33)
  })
})

describe('solve', () => {
  it('hangs straight arms from the shoulders', () => {
    const k = solve(hanging)
    close(k.elbowL.x, REST.shoulderL.x)
    close(k.elbowL.y, REST.shoulderL.y + LEN.upper)
    close(k.wristR.y, REST.shoulderR.y + LEN.upper + LEN.fore)
  })

  it('moves the whole figure with x and y', () => {
    const k = solve({ ...hanging, x: 10, y: -20 })
    close(k.centre.x, BALL.x + 10)
    close(k.top.y, BALL.y - BALL.ry - 20)
    close(k.footL.y, REST.footL.y - 20)
  })

  it('rocks the ball on its feet, not the feet', () => {
    // Positive is clockwise, as in SVG: the top of the ball tips to the viewer's right.
    const k = solve({ ...hanging, lean: 10 })
    expect(k.top.x).toBeGreaterThan(BALL.x)
    same(k.footL, REST.footL)
    same(rotateAbout(k.centre, SEAT, -10), BALL)
  })
})

describe('norm', () => {
  it('wraps into (-180, 180]', () => {
    expect(norm(190)).toBe(-170)
    expect(norm(-190)).toBe(170)
    expect(norm(180)).toBe(180)
    expect(norm(-180)).toBe(180)
    expect(norm(-218)).toBe(142)
  })
})

/**
 * The puppet nests its layers — ball › shoulder › elbow › wrist — and turns each by
 * the relative angle from joints(). Walking that chain must land every joint exactly
 * where the absolute pose puts it, or arms would drift from their shoulders.
 */
describe('joints', () => {
  const walk = (pose: Pose, side: 'L' | 'R') => {
    const t = joints(pose)
    const turns = side === 'L' ? t.armL : t.armR
    const rest = side === 'L' ? REST.shoulderL : REST.shoulderR
    const seat = { x: SEAT.x + t.x, y: SEAT.y + t.y }
    const shoulder = rotateAbout({ x: rest.x + t.x, y: rest.y + t.y }, seat, t.lean)
    // An arm layer hangs down (+y, i.e. 90°) before it is turned.
    const armDir = 90 + t.lean + turns.shoulder
    const elbow = polar(shoulder, armDir, LEN.upper)
    const wrist = polar(elbow, armDir + turns.elbow, LEN.fore)
    return { elbow, wrist }
  }

  it('lands every arm joint of every pose where solve() does', () => {
    for (const def of POSES) {
      const k = solve(def.pose)
      const L = walk(def.pose, 'L')
      const R = walk(def.pose, 'R')
      same(L.elbow, k.elbowL)
      same(L.wrist, k.wristL)
      same(R.elbow, k.elbowR)
      same(R.wrist, k.wristR)
    }
  })

  it('keeps the ball’s volume when it is squashed', () => {
    const t = joints({ ...hanging, squash: 0.9 })
    close(t.sx * t.sx * t.sy, 1)
  })

  it('places a held prop where the hand holds it, upright', () => {
    for (const def of POSES.filter((d) => d.pose.held)) {
      const pose = def.pose
      const held = pose.held!
      const arm = held.hand === 'L' ? pose.armL : pose.armR
      const wrist = held.hand === 'L' ? solve(pose).wristL : solve(pose).wristR

      // where it should be: along the forearm past the wrist, and across it
      const along = polar(wrist, arm.fore, held.along)
      const want = polar(along, arm.fore - 90, held.across ?? 0)

      // where the puppet puts it: in the hand layer, which is the world turned by fore - 90
      const p = heldPlacement(pose)!
      const frame = arm.fore - 90
      const got = { x: wrist.x + p.x * Math.cos(rad(frame)) - p.y * Math.sin(rad(frame)), y: wrist.y + p.x * Math.sin(rad(frame)) + p.y * Math.cos(rad(frame)) }
      same(got, want)
      close(norm(frame + p.rot), norm(held.rot ?? 0), 4)
    }
  })
})

describe('spline', () => {
  const curve = spline([
    [0, 0],
    [0.2, 10],
    [0.5, 10],
    [0.7, -4],
  ])

  it('passes through its keys and loops', () => {
    close(curve(0), 0)
    close(curve(0.2), 10)
    close(curve(0.5), 10)
    close(curve(0.7), -4)
    close(curve(1), curve(0))
  })

  it('keeps moving through keys on a steady fall, instead of stopping at each', () => {
    const fall = spline([
      [0, 0],
      [0.3, -30],
      [0.4, -20],
      [0.5, -10],
      [0.6, 0],
    ])
    expect((fall(0.451) - fall(0.449)) / 0.002).toBeGreaterThan(50)
    expect((fall(0.401) - fall(0.399)) / 0.002).toBeGreaterThan(50)
  })

  it('holds a held value without bulging past it', () => {
    for (let t = 0.2; t <= 0.5; t += 0.01) {
      expect(curve(t)).toBeLessThanOrEqual(10 + 1e-9)
      expect(curve(t)).toBeGreaterThanOrEqual(10 - 1e-9)
    }
  })
})

describe('motions', () => {
  const all: [string, Track][] = Object.entries(MOTIONS).flatMap(([name, m]) => m.map((t) => [name, t] as [string, Track]))
  const idles: [string, Track][] = POSES.flatMap((d) => idle(d.pose, MOTIONS[d.motion]).map((t) => [`${d.id} idle`, t] as [string, Track]))

  it('loop seamlessly: the last keyframe of a cycle is the first', () => {
    for (const [name, track] of [...all, ...idles]) {
      const loop = sampleLoop(track)
      const a = loop[0].frame
      const b = loop[loop.length - 1].frame
      for (const k of ['r', 'x', 'y', 'sx', 'sy'] as const) {
        expect(b[k] ?? (k.startsWith('s') ? 1 : 0), `${name} ${track.target} ${k}`).toBeCloseTo(a[k] ?? (k.startsWith('s') ? 1 : 0), 3)
      }
    }
  })

  it('never jump between two neighbouring frames', () => {
    // A jump bigger than this between samples 20 ms apart would read as a glitch.
    for (const [name, track] of [...all, ...idles]) {
      if ('keys' in track) continue
      const loop = sampleLoop(track)
      for (let i = 1; i < loop.length; i++) {
        const a = loop[i - 1].frame
        const b = loop[i].frame
        const step = (Math.abs(b.y! - a.y!) + Math.abs(b.x! - a.x!)) / (track.dur * (loop[i].offset - loop[i - 1].offset))
        expect(step, `${name} ${track.target} at ${loop[i].offset.toFixed(2)}`).toBeLessThan(900)
        expect(Math.abs(b.sy! - a.sy!), `${name} ${track.target} squash at ${loop[i].offset.toFixed(2)}`).toBeLessThan(0.12)
      }
    }
  })

  it('ease in from rest, and hand over to the loop where it starts', () => {
    for (const [, track] of all) {
      const intro = sampleIntro(track)
      if (!intro) continue
      const first = intro[0].frame
      expect(first.r).toBeCloseTo(0)
      expect(first.sx).toBeCloseTo(1)
      const last = intro[intro.length - 1].frame
      const loop = sampleLoop(track)[0].frame
      expect(last.r).toBeCloseTo(loop.r ?? 0, 3)
      expect(last.y).toBeCloseTo(loop.y ?? 0, 3)
    }
  })

  it('skip the fade-in only for curves that start still', () => {
    expect(startsAtRest((t) => ({ r: 10 * Math.sin(2 * Math.PI * t) }))).toBe(false)
    expect(startsAtRest((t) => ({ y: 5 - 5 * Math.cos(2 * Math.PI * t) }))).toBe(true)
    expect(startsAtRest(() => ({ r: 3 }))).toBe(false)
  })

  it('never animate a part twice at once', () => {
    for (const def of POSES) {
      const own = MOTIONS[def.motion]
      const parts = [...own, ...idle(def.pose, own)].map((t) => t.target)
      expect(new Set(parts).size, `${def.id}: ${parts.join(' ')}`).toBe(parts.length)
    }
  })

  it('jump: leaves the ground, comes back down and ends where it began', () => {
    const body = MOTIONS.jump.find((t) => t.target === 'body')!
    const ball = MOTIONS.jump.find((t) => t.target === 'ball')!
    if (!('fn' in body) || !('fn' in ball)) throw new Error('jump tracks are curves')
    const heights = Array.from({ length: 101 }, (_, i) => body.fn(i / 100).y ?? 0)
    expect(Math.min(...heights)).toBeLessThan(-60)
    close(body.fn(0).y ?? 0, 0)
    close(body.fn(0.99).y ?? 0, 0)
    // squashed on landing, whole again by the end
    expect(Math.min(...Array.from({ length: 101 }, (_, i) => ball.fn(i / 100).sy ?? 1))).toBeLessThan(0.86)
    close(ball.fn(0.999).sy ?? 1, 1, 2)
  })
})

describe('pose library', () => {
  it('has unique ids, a use and a real motion for every pose', () => {
    const ids = POSES.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const d of POSES) {
      expect(d.use.length).toBeGreaterThan(5)
      expect(MOTIONS[d.motion], d.id).toBeDefined()
    }
  })

  it('keeps every joint inside the drawing', () => {
    for (const d of POSES) {
      for (const [name, p] of Object.entries(solve(d.pose))) {
        expect(p.x, `${d.id} ${name} x`).toBeGreaterThan(VIEW.x)
        expect(p.x, `${d.id} ${name} x`).toBeLessThan(VIEW.x + VIEW.w)
        expect(p.y, `${d.id} ${name} y`).toBeGreaterThan(VIEW.y)
        expect(p.y, `${d.id} ${name} y`).toBeLessThanOrEqual(GROUND)
      }
    }
  })
})
