import type { GlyphKey } from '@/types/service'

type GlyphProps = { className?: string }

export function SpotifyGlyph({ className = '' }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path
        d="M6.6 9.3c3.5-1 7.6-.6 10.6 1.2M7.4 12.4c2.9-.8 6.2-.5 8.7 1M8.2 15.4c2.3-.6 4.8-.4 6.8.8"
        stroke="#fff"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function NetflixGlyph({ className = '' }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 2h3.6l4.8 13.2V2H18v20h-3.6L9.6 8.6V22H6V2Z" fill="currentColor" />
    </svg>
  )
}

export function YoutubeGlyph({ className = '' }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="1.5" y="4.5" width="21" height="15" rx="5" fill="currentColor" />
      <path d="M10 8.8 15.4 12 10 15.2V8.8Z" fill="#fff" />
    </svg>
  )
}

export function DisneyGlyph({ className = '' }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M3.4 4.6h5.1c4.3 0 7.2 2.8 7.2 7s-2.9 7-7.2 7H3.4V4.6Zm3.5 3v7h1.5c2.1 0 3.4-1.3 3.4-3.5S10.5 7.6 8.4 7.6H6.9Z"
        fill="currentColor"
      />
      <path d="M17.6 15.4h4.6M19.9 13.1v4.6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  )
}

export function AdobeGlyph({ className = '' }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M9.4 3 2 21h4.3l1.4-3.7h4.6L9.4 3Z" fill="currentColor" />
      <path d="M14.8 3 22 21h-4.3l-4-10.4L14.8 3Z" fill="currentColor" opacity="0.72" />
    </svg>
  )
}

export const providerMeta: Record<
  GlyphKey,
  { name: string; color: string; Glyph: (p: GlyphProps) => React.ReactElement }
> = {
  spotify: { name: 'Spotify', color: 'var(--provider-spotify)', Glyph: SpotifyGlyph },
  netflix: { name: 'Netflix', color: 'var(--provider-netflix)', Glyph: NetflixGlyph },
  disney: { name: 'Disney+', color: 'var(--provider-disney)', Glyph: DisneyGlyph },
  youtube: { name: 'YouTube', color: 'var(--provider-youtube)', Glyph: YoutubeGlyph },
  adobe: { name: 'Adobe CC', color: 'var(--provider-adobe)', Glyph: AdobeGlyph },
}
