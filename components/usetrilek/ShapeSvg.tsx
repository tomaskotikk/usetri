import { memo, useId, type CSSProperties, type ReactElement } from 'react'
import { VIEW } from './rig'
import { isColour, type Box, type Gradient, type Paint, type Shape } from './shapes'

/** Artboard units → CSS length, via the `--u` the puppet root defines. */
export const u = (n: number) => `calc(var(--u) * ${+n.toFixed(3)})`

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

/** Offset that puts artboard coordinates onto a full-artboard layer, whose corner is VIEW's. */
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
