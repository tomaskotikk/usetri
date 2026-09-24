'use client'
import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import styles from './usetrilek.module.css'
import * as art from './art'
import { Extras, type Extra } from './extras'
import { MOTIONS, idle, sampleIntro, sampleLoop, sampleRelease, type Frame, type Sample, type Target, type Track } from './motion'
import { GROUND, HEAD_DROP, LEN, REST, VIEW, heldPlacement, joints, type Arm, type ArmTurns, type LegTurns, type Pose } from './rig'
import { PaintDefs, STAGE, ShapeSvg, u } from './ShapeSvg'
import type { Shape } from './shapes'
import { Swap } from './Swap'

/*
 * The puppet. Every moving part is its own layer, nested the way the bones are —
 * shoulder › elbow › wrist › hand — and every movement is a transform on a layer.
 * Browsers hand transforms of HTML layers to the GPU, so the figure is drawn once
 * and after that only composited: poses glide with CSS transitions and the loops
 * run as Web Animations off the main thread, smooth on a phone as on a desktop.
 */

// --- geometry helpers -------------------------------------------------------------

/** Artboard point → percentage of the full artboard, for transform-origins. */
const pct = (x: number, y: number) => `${(((x - VIEW.x) / VIEW.w) * 100).toFixed(3)}% ${(((y - VIEW.y) / VIEW.h) * 100).toFixed(3)}%`
/** Artboard offset → translate() in percentages of a full-artboard layer. */
const shift = (x: number, y: number) => `translate(${((x / VIEW.w) * 100).toFixed(3)}%, ${((y / VIEW.h) * 100).toFixed(3)}%)`
/** A joint layer: moved to its place in the parent, turned about itself. */
const place = (x: number, y: number, r: number) => `translate(${u(x)}, ${u(y)}) rotate(${+r.toFixed(3)}deg)`

const FEET = pct(REST.pelvis.x, GROUND)
const PELVIS = pct(REST.pelvis.x, REST.pelvis.y)
const NECK = pct(REST.neck.x, REST.neck.y)
const MOUTH = pct(art.MOUTH_AT.x, art.MOUTH_AT.y)
const EYE_LINE = pct(REST.neck.x, art.EYE_L.y)
const STRINGS = pct(art.STRINGS_PIVOT.x, art.STRINGS_PIVOT.y)

/** The box a looping layer's translations are measured against (translate % is of the layer's own size). */
const HELD_BOX = 60
const BOXES: Partial<Record<Target, { w: number; h: number }>> = {
  bodyIdle: VIEW,
  body: VIEW,
  upperIdle: VIEW,
  upper: VIEW,
  headIdle: VIEW,
  head: VIEW,
  hair: VIEW,
  strings: VIEW,
  eyes: VIEW,
  blink: VIEW,
  held: { w: HELD_BOX, h: HELD_BOX },
}

function transformOf(f: Frame, box?: { w: number; h: number }) {
  const turn = `rotate(${+(f.r ?? 0).toFixed(3)}deg) scale(${+(f.sx ?? 1).toFixed(4)}, ${+(f.sy ?? 1).toFixed(4)})`
  if (!box) return turn
  return `translate(${(((f.x ?? 0) / box.w) * 100).toFixed(3)}%, ${(((f.y ?? 0) / box.h) * 100).toFixed(3)}%) ${turn}`
}

// --- timing ------------------------------------------------------------------------

/** Springs from the stylesheet: loose for arms, plain for the head, firm for legs and body. */
type Spring = 'loose' | 'plain' | 'firm'
const CURVE: Record<Spring, string> = { loose: 'var(--spring-loose)', plain: 'var(--spring)', firm: 'var(--spring-firm)' }
const GLIDE = 'cubic-bezier(.4,.1,.3,1)'
/** New loops start while the pose is still settling, so there is never a dead stop between them. */
const LOOP_DELAY = 380
/** How long an old loop takes to fade out once the pose changes. */
const RELEASE_MS = 360

function ease(still: boolean, ms: number, delay = 0, spring: Spring = 'loose'): CSSProperties {
  return still ? {} : { transition: `transform ${ms}ms ${CURVE[spring]} ${delay}ms, opacity 260ms ease ${delay}ms` }
}

// --- static artwork, built once ---------------------------------------------------------

const ART = {
  torso: art.torso(),
  band: art.band(),
  chest: art.chest(),
  strings: art.strings(),
  cups: art.cups(),
  ears: art.ears(),
  skull: art.skull(),
  blush: art.blush(),
  browL: art.brow(false),
  browR: art.brow(true),
  nose: art.nose(),
  hair: art.hair(),
  phonesOn: art.phonesOn(),
  upperArm: art.upperArm(),
  forearm: art.forearm(),
  cuff: art.cuff(),
  thigh: art.thigh(),
  shin: art.shin(),
  shoe: art.shoe(),
}

/** Parts that come in variants (hands, eyes, mouths, props), built once per variant. */
const variants = new Map<string, Shape[]>()
function variant(key: string, build: () => Shape[]) {
  let shapes = variants.get(key)
  if (!shapes) {
    shapes = build()
    variants.set(key, shapes)
  }
  return shapes
}

const HELD_AT = [HELD_BOX / 2, HELD_BOX / 2] as const

type Bind = (t: Target) => (el: HTMLDivElement | null) => void

// --- limbs ------------------------------------------------------------------------------

function ArmRig({ uid, side, arm, turns, pose, bind, still }: { uid: string; side: 'L' | 'R'; arm: Arm; turns: ArmTurns; pose: Pose; bind: Bind; still: boolean }) {
  const shoulder = side === 'L' ? REST.shoulderL : REST.shoulderR
  const held = pose.held?.hand === side ? pose.held : undefined
  const at = held ? heldPlacement(pose) : null
  const pivot = held ? art.PROP_PIVOT[held.kind] : { x: 0, y: 0 }
  const handId = `${arm.hand}-${arm.flip ? 1 : 0}-${arm.watch ? 1 : 0}`

  return (
    <div className={styles.pt} style={{ transform: place(shoulder.x - VIEW.x, shoulder.y, turns.shoulder), ...ease(still, 860) }}>
      <div className={styles.pt} ref={bind(`arm${side}`)}>
        <ShapeSvg uid={uid} box={art.UPPER_ARM_BOX} shapes={ART.upperArm} />
        <div className={styles.pt} style={{ transform: place(0, LEN.upper, turns.elbow), ...ease(still, 860, 50) }}>
          <div className={styles.pt} ref={bind(`fore${side}`)}>
            <ShapeSvg uid={uid} box={art.FOREARM_BOX} shapes={ART.forearm} />
            <div className={styles.pt} style={{ transform: place(0, LEN.fore, turns.wrist), ...ease(still, 860, 100) }}>
              <div className={styles.pt} ref={bind(`hand${side}`)}>
                <Swap id={handId} delay={130} dur={150}>
                  <ShapeSvg uid={uid} box={art.HAND_BOX} shapes={variant(`hand-back-${handId}`, () => art.hand(arm.hand, 'back', arm.flip, arm.watch))} />
                </Swap>
                <div
                  className={styles.pt}
                  style={{
                    transform: at ? `${place(at.x, at.y, at.rot)} scale(${at.scale})` : undefined,
                    ...ease(still, 860, 100),
                  }}
                >
                  <div
                    ref={held ? bind('held') : undefined}
                    style={{
                      position: 'absolute',
                      left: u(-HELD_BOX / 2),
                      top: u(-HELD_BOX / 2),
                      width: u(HELD_BOX),
                      height: u(HELD_BOX),
                      transformOrigin: `${((HELD_BOX / 2 + pivot.x) / HELD_BOX) * 100}% ${((HELD_BOX / 2 + pivot.y) / HELD_BOX) * 100}%`,
                    }}
                  >
                    <Swap id={held?.kind ?? 'none'} delay={170} dur={200} pop full>
                      {held && <ShapeSvg uid={uid} box={art.PROP_BOX[held.kind]} shapes={variant(`prop-${held.kind}`, () => art.prop(held.kind))} at={HELD_AT} />}
                    </Swap>
                  </div>
                </div>
                <Swap id={handId} delay={130} dur={150}>
                  <ShapeSvg uid={uid} box={art.HAND_BOX} shapes={variant(`hand-front-${handId}`, () => art.hand(arm.hand, 'front', arm.flip))} />
                </Swap>
              </div>
            </div>
            <ShapeSvg uid={uid} box={art.CUFF_BOX} shapes={ART.cuff} />
          </div>
        </div>
      </div>
    </div>
  )
}

function LegRig({ uid, side, turns, bind, still }: { uid: string; side: 'L' | 'R'; turns: LegTurns; bind: Bind; still: boolean }) {
  const hipX = REST.pelvis.x + (side === 'L' ? -REST.hipDX : REST.hipDX)
  const hipY = REST.pelvis.y + REST.hipDY
  return (
    <div className={styles.pt} style={{ transform: place(hipX - VIEW.x, hipY, turns.hip), ...ease(still, 760, 0, 'firm') }}>
      <div className={styles.pt} ref={bind(`thigh${side}`)}>
        <div className={styles.pt} style={{ transform: `scaleY(${turns.stretch})`, ...ease(still, 760, 0, 'firm') }}>
          <ShapeSvg uid={uid} box={art.THIGH_BOX} shapes={ART.thigh} />
        </div>
        <div className={styles.pt} style={{ transform: place(0, LEN.thigh * turns.stretch, turns.knee), ...ease(still, 760, 40, 'firm') }}>
          <div className={styles.pt} ref={bind(`shin${side}`)}>
            <div className={styles.pt} style={{ transform: place(0, LEN.shin, turns.toe), ...ease(still, 760, 70, 'firm') }}>
              <ShapeSvg uid={uid} box={art.SHOE_BOX} shapes={ART.shoe} />
            </div>
            <ShapeSvg uid={uid} box={art.SHIN_BOX} shapes={ART.shin} />
          </div>
        </div>
      </div>
    </div>
  )
}

// --- head --------------------------------------------------------------------------------

function HeadRig({
  uid,
  pose,
  eyes,
  bind,
  blinkFx,
  mouthFx,
  still,
}: {
  uid: string
  pose: Pose
  eyes: Pose['face']['eyes']
  bind: Bind
  blinkFx: React.RefObject<HTMLDivElement | null>
  mouthFx: React.RefObject<HTMLDivElement | null>
  still: boolean
}) {
  const { face } = pose
  const turn = pose.turn ?? 0
  const look = face.look ?? [0, 0]
  const browL = art.browPose(face.brows, 'L')
  const browR = art.browPose(face.brows, 'R')
  const soft = (delay = 0) => ease(still, 600, delay, 'firm')

  return (
    <div className={styles.pt} style={{ transform: place(REST.neck.x - VIEW.x, REST.neck.y, pose.tilt ?? 0), ...ease(still, 900, 60, 'plain') }}>
      {/* back onto artboard coordinates, so the head's art needs no offsets */}
      <div style={{ position: 'absolute', left: u(-(REST.neck.x - VIEW.x)), top: u(-REST.neck.y), width: u(VIEW.w), height: u(VIEW.h) }}>
        <div className={styles.full} ref={bind('headIdle')} style={{ transformOrigin: NECK }}>
          <div className={styles.full} ref={bind('head')} style={{ transformOrigin: NECK }}>
            <div className={styles.full} style={{ transform: shift(0, HEAD_DROP) }}>
              <div className={styles.full} style={{ transform: shift(-turn * 2.8, 0), ...soft() }}>
                <ShapeSvg uid={uid} box={art.EARS_BOX} shapes={ART.ears} at={STAGE} />
              </div>
              <ShapeSvg uid={uid} box={art.SKULL_BOX} shapes={ART.skull} at={STAGE} />

              <div className={styles.full} style={{ transform: shift(turn * 7, 0), ...soft() }}>
                <div className={styles.full} style={{ opacity: Math.min(1, (face.blush ?? 1) * 0.68), transition: still ? undefined : 'opacity 400ms ease' }}>
                  <ShapeSvg uid={uid} box={art.BLUSH_BOX} shapes={ART.blush} at={STAGE} />
                </div>
                <div className={styles.full} style={{ transform: shift(look[0] * 2.4, look[1] * 2), ...soft(40) }}>
                  <div className={styles.full} ref={bind('eyes')}>
                    <div className={styles.full} ref={bind('blink')} style={{ transformOrigin: EYE_LINE }}>
                      <div className={styles.full} ref={blinkFx} style={{ transformOrigin: EYE_LINE }}>
                        <ShapeSvg uid={uid} box={art.EYES_BOX} shapes={variant(`eyes-${eyes}`, () => art.eyes(eyes))} at={STAGE} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.pt} style={{ transform: place(art.EYE_L.x - VIEW.x, art.BROW_Y + browL.y, browL.r), ...ease(still, 620, 60, 'plain') }}>
                  <ShapeSvg uid={uid} box={art.BROW_BOX} shapes={ART.browL} />
                </div>
                <div className={styles.pt} style={{ transform: place(art.EYE_R.x - VIEW.x, art.BROW_Y + browR.y, browR.r), ...ease(still, 620, 60, 'plain') }}>
                  <ShapeSvg uid={uid} box={art.BROW_BOX} shapes={ART.browR} />
                </div>
                <div className={styles.full} ref={mouthFx} style={{ transformOrigin: MOUTH }}>
                  <Swap id={face.mouth} delay={100} dur={130} full>
                    <ShapeSvg uid={uid} box={art.MOUTH_BOX} shapes={variant(`mouth-${face.mouth}`, () => art.mouth(face.mouth))} at={STAGE} />
                  </Swap>
                </div>
              </div>

              <div className={styles.full} style={{ transform: shift(turn * 9.45, 0), ...soft() }}>
                <ShapeSvg uid={uid} box={art.NOSE_BOX} shapes={ART.nose} at={STAGE} />
              </div>
              <div className={styles.full} ref={bind('hair')}>
                <ShapeSvg uid={uid} box={art.HAIR_BOX} shapes={ART.hair} at={STAGE} />
              </div>
              <div className={styles.full} style={{ opacity: pose.phonesOn ? 1 : 0, ...ease(still, 300, 150) }}>
                <ShapeSvg uid={uid} box={art.PHONES_ON_BOX} shapes={ART.phonesOn} at={STAGE} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- the bench -----------------------------------------------------------------------------

const BENCH = [
  { x: 150 - 104, color: '#e50914', slug: 'netflix-premium', size: 96, rot: -2 },
  { x: 150, color: '#1db954', slug: 'spotify-family', size: 104, rot: 0 },
  { x: 150 + 104, color: '#ff0033', slug: 'youtube-premium', size: 96, rot: 2 },
  { x: 150 + 110, color: '#0063e5', slug: 'disney-plus', size: 60, rot: 9, y: GROUND - 96 - 19 - 30 },
]

/** A bench of subscriptions: he sits on the middle block, the others show their marks. */
function Bench({ uid }: { uid: string }) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: u(150 - VIEW.x - 180),
          top: u(GROUND - 9),
          width: u(360),
          height: u(26),
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(5,26,20,.3), rgba(5,26,20,.12) 60%, transparent)',
        }}
      />
      {BENCH.map((b) => (
        <div key={b.slug} className={styles.pt} style={{ transform: place(b.x - VIEW.x, b.y ?? GROUND - b.size / 2, b.rot) }}>
          <ShapeSvg uid={uid} box={art.blockBox(b.size)} shapes={variant(`block-${b.slug}-${b.size}`, () => art.block(b.size, b.color, b.slug))} />
        </div>
      ))}
    </>
  )
}

// --- the puppet ----------------------------------------------------------------------------

export type PuppetProps = {
  pose: Pose
  /** A key of MOTIONS. */
  motion?: string
  extras?: Extra[]
  seat?: boolean
  shadow?: boolean
  /** Freezes him: no loops, no transitions (for exports and thumbnails). */
  still?: boolean
  /** Fixed width in px; without it he fills his container's width. */
  size?: number
  className?: string
  title?: string
}

export function Puppet({ pose, motion = 'none', extras = [], seat = false, shadow = true, still = false, size, className, title }: PuppetProps) {
  const uid = `ul${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const root = useRef<HTMLDivElement>(null)
  const bodyFx = useRef<HTMLDivElement>(null)
  const blinkFx = useRef<HTMLDivElement>(null)
  const mouthFx = useRef<HTMLDivElement>(null)
  const layers = useRef(new Map<Target, HTMLDivElement>())
  const running = useRef<{ el: HTMLDivElement; track: Track; anim: Animation; lead: boolean }[]>([])
  const started = useRef(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const onScreen = useRef(true)
  const [paused, setPaused] = useState(false)
  const [eyes, setEyes] = useState(pose.face.eyes)

  const [bind] = useState<Bind>(() => {
    const cache = new Map<Target, (el: HTMLDivElement | null) => void>()
    return (t: Target) => {
      let fn = cache.get(t)
      if (!fn) {
        fn = (el) => {
          if (el) {
            el.dataset.part = t
            layers.current.set(t, el)
          } else layers.current.delete(t)
        }
        cache.set(t, fn)
      }
      return fn
    }
  })

  const turns = joints(pose)
  const motionKey = JSON.stringify([motion, pose, still])

  /** Hands over from whatever the last pose was doing, then starts this pose's loops. */
  const play = useEffectEvent(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const first = !started.current
    started.current = true
    for (const t of timers.current) clearTimeout(t)
    timers.current = []

    // Let go of the old loops without a jolt: a curve carries on along its path and
    // fades out, keeping its speed; a keyed track (a blink) just settles back.
    for (const r of running.current) {
      const box = BOXES[r.track.target]
      const ms = r.track.dur * 1000
      const time = typeof r.anim.currentTime === 'number' ? r.anim.currentTime : 0
      const from = getComputedStyle(r.el).transform
      for (const a of r.el.getAnimations()) a.cancel()
      if ('fn' in r.track) {
        const phase = r.lead ? Math.min(1, time / ms) : (time % ms) / ms
        const frames = sampleRelease(r.track.fn, r.track.dur, phase, r.lead, RELEASE_MS)
        r.el.animate(
          frames.map((f) => ({ offset: f.offset, transform: transformOf(f.frame, box) })),
          { duration: RELEASE_MS },
        )
      } else if (from && from !== 'none') {
        r.el.animate([{ transform: from }, { transform: 'none' }], { duration: RELEASE_MS, easing: GLIDE })
      }
    }
    running.current = []
    if (still || reduce) return

    if (!first && bodyFx.current) {
      // Anticipation and settle: a small squash as he gathers himself for the new pose.
      for (const a of bodyFx.current.getAnimations()) a.cancel()
      bodyFx.current.animate(
        [
          { transform: 'translate(0, 0) scale(1, 1)' },
          { transform: 'translate(0, 0.5%) scale(1.025, 0.97)', offset: 0.22 },
          { transform: 'translate(0, -0.6%) scale(0.99, 1.02)', offset: 0.55 },
          { transform: 'translate(0, 0.1%) scale(1.004, 0.997)', offset: 0.8 },
          { transform: 'translate(0, 0) scale(1, 1)' },
        ],
        { duration: 640, easing: 'cubic-bezier(.3,.6,.4,1)' },
      )
    }

    /*
     * One animation per layer at any moment. Give a layer two transform animations
     * at once — an intro and a loop waiting behind it — and Chrome stops running
     * either on the GPU. So the intro plays alone, and the loop takes over when it
     * ends, started at exactly the intro's last instant so the phase never slips.
     */
    const run = (track: Track) => {
      const el = layers.current.get(track.target)
      if (!el) return
      for (const a of el.getAnimations()) a.cancel()
      const box = BOXES[track.target]
      const ms = track.dur * 1000
      const frames = (samples: Sample[]) =>
        samples.map((s) => ({ offset: s.offset, transform: transformOf(s.frame, box), easing: s.ease ?? 'linear' }))
      const keep = (anim: Animation, lead: boolean) => {
        running.current = [...running.current.filter((r) => r.el !== el), { el, track, anim, lead }]
        if (!onScreen.current) anim.pause()
      }
      const loopFrames = frames(sampleLoop(track))
      const intro = sampleIntro(track)
      if (!intro) {
        keep(el.animate(loopFrames, { duration: ms, iterations: Infinity }), false)
        return
      }
      const lead = el.animate(frames(intro), { duration: ms, fill: 'forwards' })
      keep(lead, true)
      lead.onfinish = () => {
        const loop = el.animate(loopFrames, { duration: ms, iterations: Infinity })
        if (typeof lead.startTime === 'number') loop.startTime = lead.startTime + ms
        lead.cancel()
        keep(loop, false)
      }
    }

    const own = MOTIONS[motion] ?? []
    const tracks = [...own, ...idle(pose, own)]
    const begin = () => tracks.forEach(run)
    if (first) begin()
    else timers.current.push(setTimeout(begin, LOOP_DELAY))
  })

  useLayoutEffect(() => {
    play()
  }, [motionKey])

  // Eyes change behind a blink, the way an animator hides a swap.
  useEffect(() => {
    if (pose.face.eyes === eyes) return
    for (const a of blinkFx.current?.getAnimations() ?? []) a.cancel()
    blinkFx.current?.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.08)', offset: 0.45 }, { transform: 'scaleY(1)' }], {
      duration: still ? 1 : 230,
      easing: 'ease-in-out',
    })
    const id = setTimeout(() => setEyes(pose.face.eyes), still ? 0 : 100)
    return () => clearTimeout(id)
  }, [pose.face.eyes, eyes, still])

  // A new mouth pops in with a little bounce.
  const mouth = pose.face.mouth
  const lastMouth = useRef(mouth)
  useEffect(() => {
    if (lastMouth.current === mouth) return
    lastMouth.current = mouth
    if (still) return
    for (const a of mouthFx.current?.getAnimations() ?? []) a.cancel()
    mouthFx.current?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(0.82)', offset: 0.35 }, { transform: 'scale(1.08)', offset: 0.7 }, { transform: 'scale(1)' }],
      { duration: 300, delay: 90, easing: 'ease-out' },
    )
  }, [mouth, still])

  // Off screen, everything holds still — a page full of him stays smooth.
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen.current = entry.isIntersecting
        // Everything in him and around him: loops, drifts, a pose change half done.
        for (const anim of el.getAnimations({ subtree: true })) {
          if (anim.playState === 'finished' || anim.playState === 'idle') continue
          if (entry.isIntersecting) anim.play()
          else anim.pause()
        }
        setPaused(!entry.isIntersecting)
      },
      { rootMargin: '120px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(
    () => () => {
      for (const t of timers.current) clearTimeout(t)
      for (const { anim } of running.current) anim.cancel()
    },
    [],
  )

  const x = turns.x
  const y = turns.y
  const phones = !pose.phonesOn
  const arms = (behind: boolean) =>
    (['L', 'R'] as const)
      .filter((s) => Boolean((s === 'L' ? pose.armL : pose.armR).behind) === behind)
      .map((s) => (
        <ArmRig
          key={s}
          uid={uid}
          side={s}
          arm={s === 'L' ? pose.armL : pose.armR}
          turns={s === 'L' ? turns.armL : turns.armR}
          pose={pose}
          bind={bind}
          still={still}
        />
      ))

  return (
    <div
      ref={root}
      className={[styles.puppet, className].filter(Boolean).join(' ')}
      data-paused={paused || undefined}
      style={size ? { width: size } : undefined}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <PaintDefs uid={uid} />

      <Swap id={seat ? 'seat' : 'none'} dur={260} full>
        {seat && <Bench uid={uid} />}
      </Swap>
      <Extras uid={uid} extras={extras} pose={pose} layer="back" still={still} />

      {/* the shadow stays on the ground while he jumps */}
      <div className={styles.full} style={{ transform: shift(x, 0), opacity: shadow && !seat ? 1 : 0, ...ease(still, 800, 0, 'firm') }}>
        <div
          ref={bind('shadow')}
          style={{
            position: 'absolute',
            left: u(REST.pelvis.x - VIEW.x - 80),
            top: u(GROUND - 8),
            width: u(160),
            height: u(24),
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(5,26,20,.34), rgba(5,26,20,.14) 60%, transparent)',
          }}
        />
      </div>

      <div className={styles.full} style={{ transform: shift(x, y), ...ease(still, 800, 0, 'firm') }}>
        <div className={styles.full} ref={bodyFx} style={{ transformOrigin: FEET }}>
          <div className={styles.full} ref={bind('bodyIdle')} style={{ transformOrigin: FEET }}>
            <div className={styles.full} ref={bind('body')} style={{ transformOrigin: FEET }}>
              <LegRig uid={uid} side="L" turns={turns.legL} bind={bind} still={still} />
              <LegRig uid={uid} side="R" turns={turns.legR} bind={bind} still={still} />

              <div className={styles.full} style={{ transformOrigin: PELVIS, transform: `rotate(${turns.lean}deg)`, ...ease(still, 800, 20, 'firm') }}>
                <div className={styles.full} ref={bind('upperIdle')} style={{ transformOrigin: PELVIS }}>
                  <div className={styles.full} ref={bind('upper')} style={{ transformOrigin: PELVIS }}>
                    {arms(true)}
                    <ShapeSvg uid={uid} box={art.TORSO_BOX} shapes={ART.torso} at={STAGE} />
                    <div className={styles.full} style={{ opacity: phones ? 1 : 0, ...ease(still, 300) }}>
                      <ShapeSvg uid={uid} box={art.BAND_BOX} shapes={ART.band} at={STAGE} />
                    </div>
                    <ShapeSvg uid={uid} box={art.CHEST_BOX} shapes={ART.chest} at={STAGE} />
                    <div className={styles.full} ref={bind('strings')} style={{ transformOrigin: STRINGS }}>
                      <ShapeSvg uid={uid} box={art.STRINGS_BOX} shapes={ART.strings} at={STAGE} />
                    </div>
                    <div className={styles.full} style={{ opacity: phones ? 1 : 0, ...ease(still, 300) }}>
                      <ShapeSvg uid={uid} box={art.CUPS_BOX} shapes={ART.cups} at={STAGE} />
                    </div>
                    <HeadRig uid={uid} pose={pose} eyes={eyes} bind={bind} blinkFx={blinkFx} mouthFx={mouthFx} still={still} />
                    {arms(false)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Extras uid={uid} extras={extras} pose={pose} layer="front" still={still} />
    </div>
  )
}
