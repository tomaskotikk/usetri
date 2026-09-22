import { BrandGlyph, hasGlyph } from './BrandGlyph'
import { providerMeta } from './BrandGlyphs'
import type { Service } from '@/types/service'

const sizes = {
  sm: { box: 'h-10 w-10 rounded-xl', glyph: 'h-5 w-5', text: 'text-[13px]' },
  md: { box: 'h-12 w-12 rounded-2xl', glyph: 'h-6 w-6', text: 'text-base' },
  lg: { box: 'h-16 w-16 rounded-2xl', glyph: 'h-8 w-8', text: 'text-xl' },
}

/**
 * Initials of the first two words ("Apple TV+" → AT), so same-brand services stay
 * distinct. Single-word names keep one letter — two would spell things like "NO".
 */
function monogram(name: string) {
  const words = name.split(/[\s+]+/).filter(Boolean)
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase()
  return words[0][0].toUpperCase()
}

export function ServiceIcon({
  service,
  size = 'md',
  onDark = false,
}: {
  service: Service
  size?: keyof typeof sizes
  onDark?: boolean
}) {
  const s = sizes[size]
  /* The slug table covers the whole catalogue; the older per-brand components stay
     as a fallback for anything it hasn't caught up with. */
  const Glyph = !hasGlyph(service.slug) && service.glyph ? providerMeta[service.glyph].Glyph : null

  return (
    <span
      className={`${s.box} grid place-items-center shrink-0`}
      style={{
        backgroundColor: onDark
          ? `color-mix(in srgb, ${service.color} 22%, #0b1730)`
          : `color-mix(in srgb, ${service.color} 12%, white)`,
        color: onDark ? `color-mix(in srgb, ${service.color} 75%, white)` : service.color,
      }}
      aria-hidden="true"
    >
      {hasGlyph(service.slug) ? (
        <BrandGlyph slug={service.slug} className={s.glyph} />
      ) : Glyph ? (
        <Glyph className={s.glyph} />
      ) : (
        <span className={`font-display font-extrabold ${s.text} leading-none tracking-tight`}>
          {monogram(service.name)}
        </span>
      )}
    </span>
  )
}
