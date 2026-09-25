'use client'
import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import styles from './usetrilek.module.css'
import * as art from './art'
import { Extras, type Extra } from './extras'
import { MOTIONS, idle, sampleIntro, sampleLoop, sampleRelease, spline, type Frame, type Sample, type Target, type Track } from './motion'
import { BALL, GROUND, LEN, REST, SEAT, VIEW, heldPlacement, joints, upright, type Arm, type ArmTurns, type FootTurns, type Pose } from './rig'
import { STAGE, ShapeSvg, u } from './ShapeSvg'
import type { Shape } from './shapes'
import { Swap } from './Swap'

/*
 * The puppet. Every moving part is its own layer, nested the way the bones are —
 * ball › shoulder › elbow › wrist — and every movement is a transform on a layer.
 * Browsers hand transforms of HTML layers to the GPU, so the figure is drawn once
 * and after that only composited: poses glide with CSS transitions and the loops
 * run as Web Animations off the main thread, smooth on a phone as on a desktop.
 */

// --- geometry helpers -------------------------------------------------------------

/** Artboard point → percentage of the full artboard, for transform-origins. */
const pct = (x: number, y: number) => `${(((x - VIEW.x) / VIEW.w) * 100).toFixed(3)}% ${(((y - VIEW.y) / VIEW.h) * 100).toFixed(3)}%`
/** Artboard offset → translate() in percentages of a full-artboard layer. */
const shift = (x: number, y: number) => `translate(${((x / VIEW.w) * 100).toFixed(3)}%, ${((y / VIEW.h) * 100).toFixed(3)}%)`
/** A joint layer: moved to an artboard point, turned about itself. */
const place = (x: number, y: number, r: number) => `translate(${u(x - VIEW.x)}, ${u(y - VIEW.y)}) rotate(${+r.toFixed(3)}deg)`
/** A joint inside another joint: moved by an offset in its parent's frame. */
const nest = (x: number, y: number, r: number) => `translate(${u(x)}, ${u(y)}) rotate(${+r.toFixed(3)}deg)`

const FEET = pct(SEAT.x, GROUND)
const SEAT_AT = pct(SEAT.x, SEAT.y)
const CENTRE = pct(BALL.x, BALL.y)
const EYE_LINE = pct(BALL.x, art.EYE_L.y)
const MOUTH = pct(art.MOUTH_AT.x, art.MOUTH_AT.y)
const SPARK_AT = art.SPARKLES.map((s) => pct(s.at.x, s.at.y))

/** How far the features slide round the ball for a full three-quarter turn, and for a full look. */
const TURN = { eyes: 22, mouth: 26, blush: 18 } as const
const LOOK = { x: 10, y: 8.75 } as const

/** The boxes a looping layer's translations are measured against (translate % is of the layer's own size). */
const HELD_BOX = 60
const FOOT_BOX = 100
const BOXES: Partial<Record<Target, { w: number; h: number }>> = {
  body: VIEW,
  sway: VIEW,
  breath: VIEW,
  ball: VIEW,
  faceIdle: VIEW,
  face: VIEW,
  eyes: VIEW,
  blink: VIEW,
  mouth: VIEW,
  sparkA: VIEW,
  sparkB: VIEW,
  held: { w: HELD_BOX, h: HELD_BOX },
  footL: { w: FOOT_BOX, h: FOOT_BOX },
  footR: { w: FOOT_BOX, h: FOOT_BOX },
}

function transformOf(f: Frame, box?: { w: number; h: number }) {
  const turn = `rotate(${+(f.r ?? 0).toFixed(3)}deg) scale(${+(f.sx ?? 1).toFixed(4)}, ${+(f.sy ?? 1).toFixed(4)})`
  if (!box) return turn
  return `translate(${(((f.x ?? 0) / box.w) * 100).toFixed(3)}%, ${(((f.y ?? 0) / box.h) * 100).toFixed(3)}%) ${turn}`
}

// --- timing ------------------------------------------------------------------------

/** Springs from the stylesheet: loose for arms, plain for the face, firm for feet and body. */
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

/**
 * The jelly settling after he changes pose: a squash as he gathers himself, then a
 * wobble that dies out, about the bottom of the ball.
 */
const WOBBLE = (() => {
  const sy = spline([
    [0, 1],
    [0.14, 0.945],
    [0.34, 1.034],
    [0.53, 0.986],
    [0.72, 1.005],
    [0.88, 0.999],
  ])
  return Array.from({ length: 31 }, (_, i) => {
    const s = sy(i / 30)
    return { transform: `scale(${(1 / Math.sqrt(s)).toFixed(4)}, ${s.toFixed(4)})` }
  })
})()

// --- static artwork, built once ---------------------------------------------------------

const ART = {
  ball: art.ball(),
  blush: art.blush(),
  phones: art.phones(),
  upperArm: art.upperArm(),
  forearm: art.forearm(),
  watch: art.watch(),
  thumb: art.thumb(),
  foot: art.foot(),
}

/** Parts that come in variants (eyes, mouths, props), built once per variant. */
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
const FOOT_AT = [FOOT_BOX / 2, FOOT_BOX] as const

type Bind = (t: Target) => (el: HTMLDivElement | null) => void

/** Stacking inside the ball: sparkles, arms behind, the ball and face, arms in front. */
const Z = { sparkles: 0, behind: 1, ball: 2, front: 3 } as const

// --- limbs ------------------------------------------------------------------------------

function ArmRig({ uid, side, arm, turns, pose, bind, still }: { uid: string; side: 'L' | 'R'; arm: Arm; turns: ArmTurns; pose: Pose; bind: Bind; still: boolean }) {
  const shoulder = side === 'L' ? REST.shoulderL : REST.shoulderR
  const held = pose.held?.hand === side ? pose.held : undefined
  const at = held ? heldPlacement(pose) : null

  return (
    <div
      className={styles.pt}
      style={{ zIndex: arm.front ? Z.front : Z.behind, transform: place(shoulder.x, shoulder.y, turns.shoulder), ...ease(still, 820) }}
    >
      <div className={styles.pt} ref={bind(`arm${side}`)}>
        <ShapeSvg uid={uid} box={art.UPPER_ARM_BOX} shapes={ART.upperArm} />
        <div className={styles.pt} style={{ transform: nest(0, LEN.upper, turns.elbow), ...ease(still, 820, 50) }}>
          <div className={styles.pt} ref={bind(`fore${side}`)}>
            <ShapeSvg uid={uid} box={art.FOREARM_BOX} shapes={ART.forearm} />
            <div className={styles.pt} style={{ opacity: arm.watch ? 1 : 0, ...ease(still, 300, 200) }}>
              <ShapeSvg uid={uid} box={art.FOREARM_BOX} shapes={ART.watch} />
            </div>
            <div className={styles.pt} style={{ transform: nest(0, LEN.fore, 0) }}>
              <div className={styles.pt} ref={bind(`hand${side}`)}>
                <div
                  className={styles.pt}
                  style={{
                    transform: `translate(0, ${u(12)}) rotate(${upright(arm.fore)}deg) scale(${arm.thumb ? 1 : 0.4})`,
                    opacity: arm.thumb ? 1 : 0,
                    ...ease(still, 820, 100),
                  }}
                >
                  <ShapeSvg uid={uid} box={art.THUMB_BOX} shapes={ART.thumb} />
                </div>
                <div
                  className={styles.pt}
                  style={{ transform: at ? `${nest(at.x, at.y, at.rot)} scale(${at.scale})` : undefined, ...ease(still, 820, 100) }}
                >
                  <div
                    ref={held ? bind('held') : undefined}
                    style={{ position: 'absolute', left: u(-HELD_BOX / 2), top: u(-HELD_BOX / 2), width: u(HELD_BOX), height: u(HELD_BOX) }}
                  >
                    <Swap id={held?.kind ?? 'none'} delay={170} dur={200} pop full>
                      {held && <ShapeSvg uid={uid} box={art.PROP_BOX[held.kind]} shapes={variant(`prop-${held.kind}`, () => art.prop(held.kind))} at={HELD_AT} />}
                    </Swap>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FootRig({ uid, side, foot, bind, still }: { uid: string; side: 'L' | 'R'; foot: FootTurns; bind: Bind; still: boolean }) {
  const rest = side === 'L' ? REST.footL : REST.footR
  return (
    <div className={styles.pt} style={{ transform: place(rest.x + foot.x, rest.y + foot.y, foot.r), ...ease(still, 760, 0, 'firm') }}>
      <div
        ref={bind(`foot${side}`)}
        style={{ position: 'absolute', left: u(-FOOT_BOX / 2), top: u(-FOOT_BOX), width: u(FOOT_BOX), height: u(FOOT_BOX), transformOrigin: '50% 100%' }}
      >
        <ShapeSvg uid={uid} box={art.FOOT_BOX} shapes={ART.foot} at={FOOT_AT} />
      </div>
    </div>
  )
}

// --- face --------------------------------------------------------------------------------

function FaceRig({
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
  const soft = (delay = 0) => ease(still, 620, delay, 'firm')

  return (
    <div className={styles.full} style={{ zIndex: Z.ball, transformOrigin: CENTRE, transform: `rotate(${pose.tilt ?? 0}deg)`, ...ease(still, 900, 60, 'plain') }}>
      <div className={styles.full} ref={bind('faceIdle')} style={{ transformOrigin: CENTRE }}>
        <div className={styles.full} ref={bind('face')} style={{ transformOrigin: CENTRE }}>
          <div className={styles.full} style={{ transform: shift(turn * TURN.blush, 0), ...soft() }}>
            <div className={styles.full} style={{ opacity: Math.min(1, face.blush ?? 1), transition: still ? undefined : 'opacity 400ms ease' }}>
              <ShapeSvg uid={uid} box={art.BLUSH_BOX} shapes={ART.blush} at={STAGE} />
            </div>
          </div>
          <div className={styles.full} style={{ transform: shift(turn * TURN.eyes + look[0] * LOOK.x, look[1] * LOOK.y), ...soft(40) }}>
            <div className={styles.full} ref={bind('eyes')}>
              <div className={styles.full} ref={bind('blink')} style={{ transformOrigin: EYE_LINE }}>
                <div className={styles.full} ref={blinkFx} style={{ transformOrigin: EYE_LINE }}>
                  <ShapeSvg uid={uid} box={art.EYES_BOX} shapes={variant(`eyes-${eyes}`, () => art.eyes(eyes))} at={STAGE} />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.full} style={{ transform: shift(turn * TURN.mouth, 0), ...soft(20) }}>
            <div className={styles.full} ref={mouthFx} style={{ transformOrigin: MOUTH }}>
              <div className={styles.full} ref={bind('mouth')} style={{ transformOrigin: MOUTH }}>
                <Swap id={face.mouth} delay={100} dur={130} full>
                  <ShapeSvg uid={uid} box={art.MOUTH_BOX} shapes={variant(`mouth-${face.mouth}`, () => art.mouth(face.mouth))} at={STAGE} />
                </Swap>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- the bench -----------------------------------------------------------------------------

/** A pile of subscriptions to sit on: the middle block last, so it stands in front. */
const BENCH = [
  { x: SEAT.x - 124, color: '#e50914', slug: 'netflix-premium', size: 100, rot: -3 },
  { x: SEAT.x + 124, color: '#ff0033', slug: 'youtube-premium', size: 100, rot: 3 },
  { x: SEAT.x, color: '#1db954', slug: 'spotify-family', size: 120, rot: 0 },
]

function Bench({ uid }: { uid: string }) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: u(SEAT.x - VIEW.x - 200),
          top: u(GROUND - VIEW.y - 11),
          width: u(400),
          height: u(26),
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(5,11,26,.16), rgba(5,11,26,.07) 60%, transparent)',
        }}
      />
      {BENCH.map((b) => (
        <div key={b.slug} className={styles.pt} style={{ transform: place(b.x, GROUND - b.size / 2, b.rot) }}>
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
  const ballFx = useRef<HTMLDivElement>(null)
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

    if (!first && ballFx.current) {
      for (const a of ballFx.current.getAnimations()) a.cancel()
      ballFx.current.animate(WOBBLE, { duration: 860, easing: 'linear' })
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
    blinkFx.current?.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.07)', offset: 0.42 }, { transform: 'scaleY(1)' }], {
      duration: still ? 1 : 240,
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
      [{ transform: 'scale(1)' }, { transform: 'scale(0.8)', offset: 0.35 }, { transform: 'scale(1.09)', offset: 0.7 }, { transform: 'scale(1)' }],
      { duration: 320, delay: 90, easing: 'ease-out' },
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

  const arm = (side: 'L' | 'R') => (
    <ArmRig
      uid={uid}
      side={side}
      arm={side === 'L' ? pose.armL : pose.armR}
      turns={side === 'L' ? turns.armL : turns.armR}
      pose={pose}
      bind={bind}
      still={still}
    />
  )

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
      <Swap id={seat ? 'seat' : 'none'} dur={260} full>
        {seat && <Bench uid={uid} />}
      </Swap>
      <Extras uid={uid} extras={extras} pose={pose} layer="back" still={still} />

      {/* the shadow stays on the ground while he jumps */}
      <div className={styles.full} style={{ transform: shift(turns.x, 0), opacity: shadow && !seat ? 1 : 0, ...ease(still, 800, 0, 'firm') }}>
        <div
          ref={bind('shadow')}
          style={{
            position: 'absolute',
            left: u(SEAT.x - VIEW.x - 118),
            top: u(GROUND - VIEW.y - 13),
            width: u(236),
            height: u(26),
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(5,11,26,.2), rgba(5,11,26,.08) 62%, transparent)',
          }}
        />
      </div>

      <div className={styles.full} style={{ transform: shift(turns.x, turns.y), ...ease(still, 800, 0, 'firm') }}>
        <div className={styles.full} ref={bind('body')} style={{ transformOrigin: FEET }}>
          <FootRig uid={uid} side="L" foot={turns.footL} bind={bind} still={still} />
          <FootRig uid={uid} side="R" foot={turns.footR} bind={bind} still={still} />

          <div
            className={styles.full}
            style={{ transformOrigin: SEAT_AT, transform: `rotate(${turns.lean}deg) scale(${turns.sx.toFixed(4)}, ${turns.sy.toFixed(4)})`, ...ease(still, 800, 20, 'firm') }}
          >
            <div className={styles.full} ref={ballFx} style={{ transformOrigin: SEAT_AT }}>
              <div className={styles.full} ref={bind('sway')} style={{ transformOrigin: SEAT_AT }}>
                <div className={styles.full} ref={bind('breath')} style={{ transformOrigin: SEAT_AT }}>
                  <div className={styles.full} ref={bind('ball')} style={{ transformOrigin: SEAT_AT }}>
                    <div className={styles.full} style={{ zIndex: Z.sparkles, opacity: pose.noSparkle ? 0 : 1, ...ease(still, 300, pose.noSparkle ? 0 : 300) }}>
                      {art.SPARKLES.map((s, i) => (
                        <div key={i} className={styles.full} ref={bind(i ? 'sparkB' : 'sparkA')} style={{ transformOrigin: SPARK_AT[i] }}>
                          <ShapeSvg uid={uid} box={s.box} shapes={s.shapes as Shape[]} at={STAGE} />
                        </div>
                      ))}
                    </div>
                    {arm('L')}
                    {arm('R')}
                    <div className={styles.full} style={{ zIndex: Z.ball }}>
                      <ShapeSvg uid={uid} box={art.BALL_BOX} shapes={ART.ball} at={STAGE} />
                    </div>
                    <FaceRig uid={uid} pose={pose} eyes={eyes} bind={bind} blinkFx={blinkFx} mouthFx={mouthFx} still={still} />
                    <div className={styles.full} style={{ zIndex: Z.ball, opacity: pose.phonesOn ? 1 : 0, ...ease(still, 300, 150) }}>
                      <ShapeSvg uid={uid} box={art.PHONES_BOX} shapes={ART.phones} at={STAGE} />
                    </div>
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
