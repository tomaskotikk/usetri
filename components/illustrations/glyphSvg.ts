import { glyphShapes, type GlyphShape } from './glyphShapes'

function attrs(shape: GlyphShape, color: string) {
  const paint = shape.ko ? '#fff' : color
  const opacity = shape.o !== undefined ? ` opacity="${shape.o}"` : ''
  return shape.s
    ? `fill="none" stroke="${paint}" stroke-width="${shape.s}" stroke-linecap="round" stroke-linejoin="round"${opacity}`
    : `fill="${paint}"${opacity}`
}

function element(shape: GlyphShape, color: string) {
  const a = attrs(shape, color)
  if (shape.k === 'p') return `<path d="${shape.d}" ${a}/>`
  if (shape.k === 'c') return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" ${a}/>`
  return `<rect x="${shape.x}" y="${shape.y}" width="${shape.w}" height="${shape.h}" rx="${shape.rx ?? 0}" ${a}/>`
}

/**
 * A service mark as a data URI, for places that take an image rather than JSX —
 * the invite's link-preview picture. Same shapes as BrandGlyph. Null when we have
 * no mark for the slug.
 */
export function glyphDataUri(slug: string, color: string, size = 96) {
  const shapes = glyphShapes[slug]
  if (!shapes) return null
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">${shapes
    .map((s) => element(s, color))
    .join('')}</svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}
