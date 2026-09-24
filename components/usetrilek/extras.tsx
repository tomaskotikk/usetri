'use client'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import styles from './usetrilek.module.css'
import { startDrift, type Drift } from './loops'
import { BRAND, CYAN } from './palette'
import * as art from './art'
import { solve, VIEW, type Pose } from './rig'
import { ShapeSvg, u } from './ShapeSvg'
import type { Box, Shape } from './shapes'
import { Swap } from './Swap'

export type Extra = 'confetti' | 'thought' | 'sparkles' | 'zzz' | 'coins' | 'question' | 'hearts' | 'notes'

/** Runs a drift on the element for as long as it is mounted — held still if the figure is off screen. */
export function useDrift(drift: Drift | null) {
  const ref = useRef<HTMLDivElement>(null)
  const key = drift ? JSON.stringify(drift) : ''
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !key || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const anim = startDrift(el, JSON.parse(key) as Drift)
    if (el.closest('[data-paused]')) anim.pause()
    return () => anim.cancel()
  }, [key])
  return ref
}

/**
 * One floating thing, as its own HTML layer: its drift runs on the compositor, so
 * confetti costs nothing per frame. Placed by artboard point.
 */
function Item({ uid, x, y, box, shapes, drift }: { uid: string; x: number; y: number; box: Box; shapes: Shape[]; drift: Drift | null }) {
  const ref = useDrift(drift)
  const [bx, by, bw, bh] = box
  return (
    <div ref={ref} style={{ position: 'absolute', left: u(x - VIEW.x + bx), top: u(y + by), width: u(bw), height: u(bh) }}>
      <ShapeSvg uid={uid} box={box} shapes={shapes} at={[-bx, -by]} />
    </div>
  )
}

function Confetto({ x, y, w, h, colour, drift }: { x: number; y: number; w: number; h: number; colour: string; drift: Drift | null }) {
  const ref = useDrift(drift)
  return (
    <div
      ref={ref}
      style={{ position: 'absolute', left: u(x - VIEW.x), top: u(y + 20), width: u(w), height: u(h), borderRadius: u(2), background: colour }}
    />
  )
}

const SPARKLE = (r: number): Box => [-r, -r, r * 2, r * 2]
const COIN: Box = [-12, -12, 26, 26]
const HEART: Box = [-13, -15, 26, 22]
const NOTE: Box = [-7, -21, 21, 26]
const TEXT: Box = [-14, -34, 28, 40]

/** x, y, width, height, colour, delay, duration, drift (% of own width), spin */
const CONFETTI: [number, number, number, number, string, number, number, number, number][] = [
  [20, 20, 7, 12, BRAND, 0, 2.6, 260, 320],
  [62, -10, 8, 8, '#ffd23f', 0.9, 3.1, -180, -260],
  [96, 30, 6, 11, CYAN, 1.7, 2.8, 170, 280],
  [238, 0, 7, 12, '#ff7a6b', 0.4, 2.9, -290, -300],
  [270, 36, 8, 8, BRAND, 1.3, 3.2, 150, 240],
  [210, -20, 6, 10, '#ffd23f', 2.1, 2.7, 270, 340],
  [300, -4, 7, 11, CYAN, 0.7, 3, -170, -220],
  [4, 70, 6, 9, '#ff7a6b', 1.9, 2.8, 230, 260],
  [150, -30, 7, 7, '#b388ff', 1.1, 3.3, -140, 300],
  [120, -6, 6, 12, BRAND, 2.4, 2.9, 130, -280],
  [180, 16, 7, 9, '#ff7a6b', 0.2, 3.1, -230, 260],
  [326, 50, 6, 10, '#ffd23f', 1.5, 2.6, -130, 320],
]

const text = (t: string, size: number, colour: string): Shape[] => [
  { k: 'text', x: 0, y: 0, text: t, size, weight: 900, anchor: 'middle', fill: colour },
]

function layerFor(uid: string, extras: Extra[], pose: Pose, layer: 'back' | 'front', still: boolean): ReactNode[] {
  const head = solve(pose).head
  const items: ReactNode[] = []
  const has = (e: Extra) => extras.includes(e)
  // A still figure keeps his confetti where it is.
  const go = (d: Drift) => (still ? null : d)

  if (layer === 'back') {
    if (has('sparkles')) {
      const sparkles = [
        [-78, -30, 11, CYAN, 2.4, 0],
        [82, -44, 8, '#ffd23f', 2, 0.6],
        [96, 60, 6, BRAND, 2.6, 1.1],
      ] as const
      sparkles.forEach(([dx, dy, r, colour, dur, delay], i) =>
        items.push(
          <Item
            key={`s${i}`}
            uid={uid}
            x={head.x + dx}
            y={head.y + dy}
            box={SPARKLE(r)}
            shapes={art.sparkle(r, colour)}
            drift={go({ kind: 'twinkle', dur, delay })}
          />,
        ),
      )
    }
    if (has('coins')) {
      const coins = [
        [-70, 20, 0],
        [74, 0, 0.9],
        [-50, -40, 1.7],
      ] as const
      coins.forEach(([dx, dy, delay], i) =>
        items.push(
          <Item
            key={`c${i}`}
            uid={uid}
            x={head.x + dx}
            y={head.y + dy}
            box={COIN}
            shapes={art.coin(11)}
            drift={go({ kind: 'rise', dur: 2.8, delay, dx: i % 2 ? -40 : 40 })}
          />,
        ),
      )
    }
    return items
  }

  if (has('thought'))
    items.push(
      <Item
        key="t"
        uid={uid}
        x={head.x + 92}
        y={head.y - 74}
        box={art.THOUGHT_BOX}
        shapes={art.thought()}
        drift={go({ kind: 'float', dur: 3.4, amp: -6 })}
      />,
    )
  if (has('question'))
    items.push(
      <Item
        key="q"
        uid={uid}
        x={head.x + 58}
        y={head.y - 48}
        box={TEXT}
        shapes={text('?', 40, CYAN)}
        drift={go({ kind: 'float', dur: 2.6, amp: -14 })}
      />,
    )
  if (has('zzz'))
    ['z', 'Z', 'Z'].forEach((z, i) =>
      items.push(
        <Item
          key={`z${i}`}
          uid={uid}
          x={head.x + 40 + i * 6}
          y={head.y - 40}
          box={TEXT}
          shapes={text(z, 14 + i * 5, CYAN)}
          drift={go({ kind: 'rise', dur: 2.4, delay: i * 0.8, dx: 60 })}
        />,
      ),
    )
  if (has('hearts')) {
    const hearts = [
      [-60, -20, 0],
      [62, -36, 0.8],
      [80, 10, 1.6],
    ] as const
    hearts.forEach(([dx, dy, delay], i) =>
      items.push(
        <Item
          key={`h${i}`}
          uid={uid}
          x={head.x + dx}
          y={head.y + dy}
          box={HEART}
          shapes={[{ k: 'group', tf: 'scale(1.4)', kids: art.heart() }]}
          drift={go({ kind: 'rise', dur: 2.6, delay, dx: i % 2 ? 50 : -50 })}
        />,
      ),
    )
  }
  if (has('notes')) {
    const notes = [
      [-72, -10, 0, BRAND],
      [70, -40, 0.9, CYAN],
      [84, 20, 1.8, '#b388ff'],
      [-60, -56, 2.4, '#ffd23f'],
    ] as const
    notes.forEach(([dx, dy, delay, colour], i) =>
      items.push(
        <Item
          key={`n${i}`}
          uid={uid}
          x={head.x + dx}
          y={head.y + dy}
          box={NOTE}
          shapes={art.note(colour)}
          drift={go({ kind: 'rise', dur: 3, delay, dx: i % 2 ? 60 : -60 })}
        />,
      ),
    )
  }
  if (has('confetti'))
    CONFETTI.forEach(([x, y, w, h, colour, delay, dur, dx, spin], i) =>
      items.push(<Confetto key={`f${i}`} x={x} y={y} w={w} h={h} colour={colour} drift={go({ kind: 'fall', dur, delay, dx, spin })} />),
    )
  return items
}

/**
 * Things around him — confetti, a thought, notes, hearts. They arrive after the
 * pose has settled and leave the moment it changes.
 */
export function Extras({
  uid,
  extras,
  pose,
  layer,
  still,
}: {
  uid: string
  extras: Extra[]
  pose: Pose
  layer: 'back' | 'front'
  still: boolean
}) {
  const head = solve(pose).head
  const id = `${extras.join(',')}@${Math.round(head.x)},${Math.round(head.y)}`
  return (
    <div className={styles.full} style={{ pointerEvents: 'none' }}>
      <Swap id={id} delay={still ? 0 : 420} dur={300} full>
        {extras.length ? layerFor(uid, extras, pose, layer, still) : null}
      </Swap>
    </div>
  )
}
