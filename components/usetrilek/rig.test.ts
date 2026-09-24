import { describe, expect, it } from 'vitest'
import { HAND_SCALE, LEN, REST, heldPlacement, joints, norm, polar, rad, rotateAbout, solve, type Pose, type Pt } from './rig'
import { MOTIONS, idle, sampleIntro, sampleLoop, spline, startsAtRest, type Track } from './motion'
import { POSES } from './poses'

const standing: Pose = {
  armL: { upper: 90, fore: 90, hand: 'relaxed' },
  armR: { upper: 90, fore: 90, hand: 'relaxed' },
  legL: { thigh: 90, shin: 90 },
  legR: { thigh: 90, shin: 90 },
  face: { eyes: 'open', brows: 'neutral', mouth: 'smile' },
}

const close = (a: number, b: number, digits = 6) => expect(a).toBeCloseTo(b, digits)
const same = (a: Pt, b: Pt) => {
  close(a.x, b.x, 4)
  close(a.y, b.y, 4)
}

describe('solve', () => {
  it('hangs straight limbs from the rest joints', () => {
    const k = solve(standing)
    close(k.elbowL.x, REST.shoulderL.x)
    close(k.elbowL.y, REST.shoulderL.y + LEN.upper)
    close(k.wristR.y, REST.shoulderR.y + LEN.upper + LEN.fore)
    close(k.ankleL.y, REST.pelvis.y + REST.hipDY + LEN.thigh + LEN.shin)
  })

  it('moves the whole figure with x and y', () => {
    const k = solve({ ...standing, x: 10, y: -20 })
    close(k.pelvis.x, REST.pelvis.x + 10)
    close(k.head.y, REST.head.y - 20)
  })

  it('turns the upper body about the pelvis, not the legs', () => {
    // Positive is clockwise, as in SVG: the shoulders tip to the viewer's right.
    const k = solve({ ...standing, lean: 10 })
    expect(k.neck.x).toBeGreaterThan(REST.neck.x)
    close(k.hipL.x, REST.pelvis.x - REST.hipDX)
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
 * The puppet nests its layers — shoulder › elbow › wrist — and turns each by the
 * relative angle from joints(). Walking that chain must land every joint exactly
 * where the absolute pose puts it, or arms would drift from their shoulders.
 */
describe('joints', () => {
  const walk = (pose: Pose, side: 'L' | 'R') => {
    const t = joints(pose)
    const turns = side === 'L' ? t.armL : t.armR
    const rest = side === 'L' ? REST.shoulderL : REST.shoulderR
    const pelvis = { x: REST.pelvis.x + t.x, y: REST.pelvis.y + t.y }
    const shoulder = rotateAbout({ x: rest.x + t.x, y: rest.y + t.y }, pelvis, t.lean)
    // A limb layer hangs down (+y, i.e. 90°) before it is turned.
    const armDir = 90 + t.lean + turns.shoulder
    const elbow = polar(shoulder, armDir, LEN.upper)
    const wrist = polar(elbow, armDir + turns.elbow, LEN.fore)
    return { shoulder, elbow, wrist }
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

  it('lands every knee and ankle where solve() does', () => {
    for (const def of POSES) {
      const t = joints(def.pose)
      const k = solve(def.pose)
      for (const side of ['L', 'R'] as const) {
        const leg = side === 'L' ? t.legL : t.legR
        const hip = side === 'L' ? k.hipL : k.hipR
        const knee = polar(hip, 90 + leg.hip, LEN.thigh * leg.stretch)
        const ankle = polar(knee, 90 + leg.hip + leg.knee, LEN.shin)
        same(knee, side === 'L' ? k.kneeL : k.kneeR)
        same(ankle, side === 'L' ? k.ankleL : k.ankleR)
      }
    }
  })

  it('places a held prop where the hand holds it, upright', () => {
    for (const def of POSES.filter((d) => d.pose.held)) {
      const pose = def.pose
      const held = pose.held!
      const arm = held.hand === 'L' ? pose.armL : pose.armR
      const wrist = held.hand === 'L' ? solve(pose).wristL : solve(pose).wristR
      const angle = arm.fore + (arm.twist ?? 0)
      const dy = arm.flip ? -held.dy : held.dy

      // where it should be: along the hand, as the hand art measures it
      const c = Math.cos(rad(angle))
      const s = Math.sin(rad(angle))
      const want = { x: wrist.x + held.dx * HAND_SCALE * c - dy * HAND_SCALE * s, y: wrist.y + held.dx * HAND_SCALE * s + dy * HAND_SCALE * c }

      // where the puppet puts it: in the hand layer, which is the world turned by angle - 90
      const p = heldPlacement(pose)!
      const frame = angle - 90
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
    // halfway between two falling keys it is still well on its way
    const speed = (fall(0.451) - fall(0.449)) / 0.002
    expect(speed).toBeGreaterThan(50)
    // and at the middle key itself it hasn't stalled
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

  it('loop seamlessly: the last keyframe of a cycle is the first', () => {
    for (const [name, track] of all) {
      const loop = sampleLoop(track)
      const a = loop[0].frame
      const b = loop[loop.length - 1].frame
      for (const k of ['r', 'x', 'y', 'sx', 'sy'] as const) {
        expect(b[k] ?? (k.startsWith('s') ? 1 : 0), `${name} ${track.target} ${k}`).toBeCloseTo(a[k] ?? (k.startsWith('s') ? 1 : 0), 3)
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
      const targets = [...own, ...idle(def.pose, own)].map((t) => `${t.target}/${t.dur}`)
      const parts = [...own, ...idle(def.pose, own)].map((t) => t.target)
      // A part may carry two tracks only if they are the same track.
      expect(new Set(parts).size, `${def.id}: ${targets.join(' ')}`).toBe(parts.length)
    }
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
      for (const p of Object.values(solve(d.pose))) {
        expect(p.x, `${d.id} x`).toBeGreaterThan(-40)
        expect(p.x, `${d.id} x`).toBeLessThan(340)
        expect(p.y, `${d.id} y`).toBeGreaterThan(0)
        expect(p.y, `${d.id} y`).toBeLessThan(432)
      }
    }
  })
})
