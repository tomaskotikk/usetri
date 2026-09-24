'use client'
import { useId } from 'react'
import styles from './usetrilek.module.css'
import * as art from './art'
import type { Face } from './rig'
import { PaintDefs, Shapes } from './ShapeSvg'
import { group, type Shape } from './shapes'

export { Puppet as Usetrilek, type PuppetProps as UsetrilekProps } from './Puppet'

/**
 * Just his head, for expression sheets and avatars: one flat <svg>, no puppet.
 * `turn` slides the features the way the puppet does for a three-quarter look.
 */
export function UsetrilekFace({ face, turn = 0, size = 120, className }: { face: Face; turn?: number; size?: number; className?: string }) {
  const uid = `uf${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const look = face.look ?? [0, 0]
  const brow = (side: 'L' | 'R') => {
    const at = side === 'L' ? art.EYE_L : art.EYE_R
    const b = art.browPose(face.brows, side)
    return group(art.brow(side === 'R'), `translate(${at.x} ${art.BROW_Y + b.y}) rotate(${b.r})`)
  }
  const shift = (dx: number, kids: Shape[]) => group(kids, `translate(${dx} 0)`)

  const shapes: Shape[] = [
    shift(-turn * 2.8, art.ears()),
    ...art.skull(),
    shift(turn * 7, [group(art.blush(), undefined, Math.min(1, (face.blush ?? 1) * 0.68)), brow('L'), brow('R'), ...art.mouth(face.mouth)]),
    shift(turn * 9.45, art.nose()),
    ...art.hair(),
  ]
  const eyes = group(art.eyes(face.eyes), `translate(${turn * 7 + look[0] * 2.4} ${look[1] * 2})`)
  const blinks = face.eyes === 'open' || face.eyes === 'wide' || face.eyes === 'half'

  return (
    <svg viewBox="100 26 100 124" width={size} height={(size * 124) / 100} className={className} aria-hidden="true">
      <PaintDefs uid={uid} />
      <Shapes shapes={shapes} uid={uid} local={`${uid}s`} />
      <g className={blinks ? styles.blink : undefined} style={{ transformOrigin: `150px ${art.EYE_L.y}px` }}>
        <Shapes shapes={[eyes]} uid={uid} local={`${uid}e`} />
      </g>
    </svg>
  )
}
