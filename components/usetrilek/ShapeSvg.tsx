import { memo, useId, type CSSProperties, type ReactElement } from 'react'
import { TONE } from './palette'
import { VIEW } from './rig'
import { isColour, type Box, type Gradient, type Paint, type Shape } from './shapes'

/** Artboard units → CSS length, via the `--u` the puppet root defines. */
export const u = (n: number) => `calc(var(--u) * ${+n.toFixed(3)})`

/**
 * The figure-wide paints every part refers to by name. Rendered once per figure
 * in an invisible <svg>; the parts' own <svg>s point at them by id.
 */
export function PaintDefs({ uid }: { uid: string }) {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute', overflow: 'hidden' }}>
      <defs>
        {Object.entries(TONE).map(([name, t]) => (
          <radialGradient key={name} id={`${uid}-${name}`} cx="0.36" cy="0.3" r="0.8" fx="0.3" fy="0.22">
            <stop offset="0" stopColor={t.l} />
            <stop offset="0.55" stopColor={t.m} />
            <stop offset="1" stopColor={t.d} />
          </radialGradient>
        ))}
        {/* A ball of clay: a soft hot spot, then the colour rolling away into shade. */}
        {Object.entries(TONE).map(([name, t]) => (
          <radialGradient key={`ball-${name}`} id={`${uid}-ball-${name}`} cx="0.4" cy="0.36" r="0.72" fx="0.34" fy="0.26">
            <stop offset="0" stopColor={t.hi} />
            <stop offset="0.3" stopColor={t.l} />
            <stop offset="0.72" stopColor={t.m} />
            <stop offset="1" stopColor={t.d} />
          </radialGradient>
        ))}
        {/*
          A limb seen as a cylinder: light near the middle, shade towards both edges.
          Nearly symmetric on purpose — limbs turn, and a one-sided highlight would
          swing round to the wrong side on a raised arm.
        */}
        {Object.entries(TONE).map(([name, t]) => (
          <linearGradient key={`tube-${name}`} id={`${uid}-tube-${name}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={t.d} />
            <stop offset="0.3" stopColor={t.l} />
            <stop offset="0.52" stopColor={t.m} />
            <stop offset="0.86" stopColor={t.d} />
            <stop offset="1" stopColor={t.dd} />
          </linearGradient>
        ))}
        <linearGradient id={`${uid}-tube-cuff`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={TONE.hood.dd} />
          <stop offset="0.32" stopColor={TONE.hood.m} />
          <stop offset="0.6" stopColor={TONE.hood.d} />
          <stop offset="1" stopColor={TONE.hood.dd} />
        </linearGradient>
        <radialGradient id={`${uid}-ao`}>
          <stop offset="0" stopColor="#1a0c05" stopOpacity="0.32" />
          <stop offset="1" stopColor="#1a0c05" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-neck`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={TONE.skin.m} />
          <stop offset="1" stopColor={TONE.skin.dd} />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6fbff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#8fdcff" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={`${uid}-hem`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={TONE.hood.dd} stopOpacity="0" />
          <stop offset="1" stopColor={TONE.hood.dd} stopOpacity="0.55" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function GradientDef({ id, g }: { id: string; g: Gradient }) {
  const stops = g.stops.map(([offset, color, opacity], i) => (
    <stop key={i} offset={offset} stopColor={color} stopOpacity={opacity} />
  ))
  return g.type === 'linear' ? (
    <linearGradient id={id} x1={g.x1 ?? 0} y1={g.y1 ?? 0} x2={g.x2 ?? 0} y2={g.y2 ?? 1}>
      {stops}
    </linearGradient>
  ) : (
    <radialGradient id={id} cx={g.cx ?? 0.5} cy={g.cy ?? 0.5} r={g.r ?? 0.5} fx={g.fx} fy={g.fy}>
      {stops}
    </radialGradient>
  )
}

/** Renders a shape list. Named paints resolve to the figure's defs, gradients to local ones. */
export function Shapes({ shapes, uid, local }: { shapes: Shape[]; uid: string; local: string }) {
  const defs: ReactElement[] = []
  const paint = (p?: Paint) => {
    if (p === undefined) return undefined
    if (typeof p === 'string') return isColour(p) ? p : `url(#${uid}-${p})`
    const id = `${local}-${defs.length}`
    defs.push(<GradientDef key={id} id={id} g={p} />)
    return `url(#${id})`
  }

  const draw = (s: Shape, key: number): ReactElement => {
    if (s.k === 'group') {
      return (
        <g key={key} transform={s.tf} opacity={s.op}>
          {s.kids.map(draw)}
        </g>
      )
    }
    const look = {
      fill: paint(s.fill) ?? 'none',
      stroke: paint(s.stroke),
      strokeWidth: s.sw,
      strokeLinecap: s.round ? ('round' as const) : undefined,
      strokeLinejoin: s.round ? ('round' as const) : undefined,
      opacity: s.op,
      transform: s.tf,
    }
    switch (s.k) {
      case 'path':
        return <path key={key} d={s.d} {...look} />
      case 'circle':
        return <circle key={key} cx={s.cx} cy={s.cy} r={s.r} {...look} />
      case 'ellipse':
        return <ellipse key={key} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...look} />
      case 'rect':
        return <rect key={key} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} {...look} />
      case 'text':
        return (
          <text
            key={key}
            x={s.x}
            y={s.y}
            fontSize={s.size}
            fontWeight={s.weight ?? 800}
            textAnchor={s.anchor}
            {...look}
            style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}
          >
            {s.text}
          </text>
        )
    }
  }

  const body = shapes.map(draw)
  return (
    <>
      {defs.length > 0 && <defs>{defs}</defs>}
      {body}
    </>
  )
}

/** Offset that puts artboard coordinates onto a full-artboard layer, whose left edge is x = -40. */
export const STAGE = [-VIEW.x, -VIEW.y] as const
const NO_SHIFT = [0, 0] as const

/**
 * One layer of the puppet: an <svg> covering `box` (in artboard units), shifted by
 * `at`. Inside a joint the origin is the joint, so `at` stays 0; on a full-artboard
 * layer, pass STAGE.
 */
export const ShapeSvg = memo(function ShapeSvg({
  uid,
  box,
  shapes,
  at = NO_SHIFT,
  style,
}: {
  uid: string
  box: Box
  shapes: Shape[]
  at?: readonly [number, number]
  style?: CSSProperties
}) {
  const local = `${uid}l${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const [x, y, w, h] = box
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: u(x + at[0]),
        top: u(y + at[1]),
        width: u(w),
        height: u(h),
        overflow: 'visible',
        ...style,
      }}
    >
      <Shapes shapes={shapes} uid={uid} local={local} />
    </svg>
  )
})
