import Image from 'next/image'
import { Star } from 'lucide-react'
import { providerMeta } from './illustrations/BrandGlyphs'
import type { GlyphKey } from '@/types/service'

const ratingBreakdown = [
  { stars: 5, pct: 84 },
  { stars: 4, pct: 12 },
  { stars: 3, pct: 3 },
  { stars: 2, pct: 1 },
]

const testimonials: {
  name: string
  role: string
  quote: string
  photo: string
  provider: GlyphKey
  saves: string
  offset: number
}[] = [
  {
    name: 'Tereza',
    role: '24, Brno',
    quote: 'Konečně platím jen za Netflix, co fakt sleduju. Skupinu jsem našla za deset minut.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    provider: 'netflix',
    saves: '−78 Kč/měs',
    offset: 0,
  },
  {
    name: 'Matěj',
    role: '21, student',
    quote: 'S kámoši ze studentáku sdílíme Spotify Family. Rozpočítalo se to samo, nikdo nikomu nic nedluží.',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    provider: 'spotify',
    saves: '−116 Kč/měs',
    offset: 36,
  },
  {
    name: 'Klára',
    role: '29, grafička',
    quote: 'Adobe CC bych si sama nikdy nedovolila. Takhle mám plnou verzi za čtvrtinu ceny.',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    provider: 'adobe',
    saves: '−1 089 Kč/měs',
    offset: 12,
  },
]

export function Testimonials() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-14">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold mb-3">Reference</p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-navy-deep tracking-tight">
              Co říkají lidi jako ty
            </h2>
          </div>

          <div className="surface-card rounded-2xl p-5 flex items-center gap-6 shrink-0">
            <div className="text-center">
              <p className="font-display font-extrabold text-4xl text-navy-deep tracking-tight">4,8</p>
              <div className="flex gap-0.5 text-brand justify-center mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <p className="text-[11px] text-fg-muted mt-1.5">312 hodnocení</p>
            </div>

            <div className="w-px self-stretch bg-border" />

            <div className="space-y-1.5 min-w-[130px]">
              {ratingBreakdown.map((row) => (
                <div key={row.stars} className="flex items-center gap-2">
                  <span className="text-[11px] text-fg-muted w-3 tabular-nums">{row.stars}</span>
                  <span className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${row.pct}%` }} />
                  </span>
                  <span className="text-[11px] text-fg-muted w-8 text-right tabular-nums">{row.pct} %</span>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => {
            const meta = providerMeta[t.provider]
            const Glyph = meta.Glyph
            return (
              <figure
                key={t.name}
                style={{ marginTop: t.offset }}
                className="surface-card rounded-3xl p-7 flex flex-col hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5 text-brand">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <span
                    className="h-9 w-9 rounded-xl grid place-items-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${meta.color} 12%, white)`,
                      color: meta.color,
                    }}
                  >
                    <Glyph className="h-4.5 w-4.5" />
                  </span>
                </div>

                <blockquote className="text-navy-deep text-[17px] leading-relaxed mt-5 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-border">
                  <div className="relative h-11 w-11 rounded-full overflow-hidden shrink-0">
                    <Image src={t.photo} alt={t.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy-deep leading-tight">{t.name}</p>
                    <p className="text-sm text-fg-muted">{t.role}</p>
                  </div>
                  <span className="text-sm font-semibold font-mono text-brand shrink-0">{t.saves}</span>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
