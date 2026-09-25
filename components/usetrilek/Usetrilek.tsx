'use client'
import { useId } from 'react'
import styles from './usetrilek.module.css'
import * as art from './art'
import type { Face } from './rig'
import { Shapes } from './ShapeSvg'
import { group, type Shape } from './shapes'

export { Puppet as Usetrilek, type PuppetProps as UsetrilekProps } from './Puppet'

/** The ball with a margin, for the face on its own. */
const [bx, by, bw, bh] = art.BALL_BOX
const PAD = 8

/**
 * Just the ball and his face, for expression sheets and avatars: one flat <svg>, no
 * puppet. `turn` slides the features round the ball the way the puppet does.
 */
export function UsetrilekFace({ face, turn = 0, size = 120, className }: { face: Face; turn?: number; size?: number; className?: string }) {
  const uid = `uf${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const look = face.look ?? [0, 0]
  const shift = (dx: number, dy: number, kids: Shape[], op?: number) => group(kids, `translate(${dx} ${dy})`, op)

  const shapes: Shape[] = [
    ...art.ball(),
    shift(turn * 18, 0, art.blush(), Math.min(1, face.blush ?? 1)),
    shift(turn * 26, 0, art.mouth(face.mouth)),
  ]
  const eyes = shift(turn * 22 + look[0] * 10, look[1] * 8.75, art.eyes(face.eyes))
  const blinks = face.eyes === 'open' || face.eyes === 'wide' || face.eyes === 'half'

  return (
    <svg
      viewBox={`${bx - PAD} ${by - PAD} ${bw + PAD * 2} ${bh + PAD * 2}`}
      width={size}
      height={(size * (bh + PAD * 2)) / (bw + PAD * 2)}
      className={className}
      aria-hidden="true"
    >
      <Shapes shapes={shapes} uid={uid} local={`${uid}s`} />
      <g className={blinks ? styles.blink : undefined} style={{ transformOrigin: `150px ${art.EYE_L.y}px` }}>
        <Shapes shapes={[eyes]} uid={uid} local={`${uid}e`} />
      </g>
    </svg>
  )
}
