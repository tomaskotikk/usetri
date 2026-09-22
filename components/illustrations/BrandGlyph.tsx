import { glyphShapes, type GlyphShape } from './glyphShapes'

/** Knocked-out parts are white so they read against the filled body beneath them. */
function shapeProps(shape: GlyphShape) {
  const paint = shape.ko ? '#fff' : 'currentColor'
  const stroked = 's' in shape && shape.s
  return stroked
    ? {
        fill: 'none',
        stroke: paint,
        strokeWidth: shape.s,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        opacity: shape.o,
      }
    : { fill: paint, opacity: shape.o }
}

function Shape({ shape }: { shape: GlyphShape }) {
  const props = shapeProps(shape)
  if (shape.k === 'p') return <path d={shape.d} {...props} />
  if (shape.k === 'c') return <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...props} />
  return <rect x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx} {...props} />
}

/** Renders the mark for a service slug, or nothing when we have no shape for it. */
export function BrandGlyph({ slug, className = '' }: { slug: string; className?: string }) {
  const shapes = glyphShapes[slug]
  if (!shapes) return null

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      {shapes.map((shape, i) => (
        <Shape key={i} shape={shape} />
      ))}
    </svg>
  )
}

export const hasGlyph = (slug: string) => slug in glyphShapes
