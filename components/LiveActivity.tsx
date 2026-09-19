'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { providerMeta } from './illustrations/BrandGlyphs'
import type { GlyphKey } from '@/types/service'

type Event = { name: string; city: string; service: string; glyph: GlyphKey; ago: string }

// Cities are stored in the genitive — they're rendered after "z".
const feed: Event[] = [
  { name: 'Matěj S.', city: 'Brna', service: 'Spotify Family', glyph: 'spotify', ago: 'před 2 min' },
  { name: 'Klára V.', city: 'Prahy', service: 'Netflix Premium', glyph: 'netflix', ago: 'před 6 min' },
  { name: 'Ondřej L.', city: 'Ostravy', service: 'Disney+ Standard', glyph: 'disney', ago: 'před 11 min' },
  { name: 'Petra M.', city: 'Plzně', service: 'YouTube Premium', glyph: 'youtube', ago: 'před 14 min' },
  { name: 'Jakub P.', city: 'Olomouce', service: 'Adobe CC', glyph: 'adobe', ago: 'před 21 min' },
  { name: 'Anna R.', city: 'Liberce', service: 'Spotify Duo', glyph: 'spotify', ago: 'před 27 min' },
  { name: 'Filip D.', city: 'Hradce Králové', service: 'Netflix Standard', glyph: 'netflix', ago: 'před 33 min' },
  { name: 'Tereza K.', city: 'Zlína', service: 'Disney+ Standard', glyph: 'disney', ago: 'před 38 min' },
]

export function LiveActivity() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setOffset((o) => (o + 1) % feed.length), 3600)
    return () => clearInterval(id)
  }, [])

  const visible = [0, 1, 2].map((i) => feed[(offset + i) % feed.length])

  return (
    <section className="bg-surface border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
          </span>
          <span className="text-xs uppercase tracking-[0.2em] text-fg-muted font-semibold">
            Právě teď
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
          {visible.map((event, slot) => {
            const meta = providerMeta[event.glyph]
            const Glyph = meta.Glyph
            return (
              <AnimatePresence mode="wait" key={slot}>
                <motion.div
                  key={`${event.name}-${event.service}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className={`flex items-center gap-3 rounded-xl bg-white border border-border px-3.5 py-2.5 ${
                    slot === 2 ? 'hidden lg:flex' : slot === 1 ? 'hidden sm:flex' : 'flex'
                  }`}
                >
                  <span
                    className="h-8 w-8 rounded-lg grid place-items-center shrink-0"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${meta.color} 12%, white)`,
                      color: meta.color,
                    }}
                  >
                    <Glyph className="h-4 w-4" />
                  </span>
                  <p className="text-[13px] leading-tight min-w-0">
                    <span className="font-semibold text-navy-deep">{event.name}</span>
                    <span className="text-fg-muted"> z {event.city} se přidal/a do </span>
                    <span className="font-medium text-navy-deep">{event.service}</span>
                  </p>
                  <span className="text-[11px] text-fg-muted whitespace-nowrap ml-auto shrink-0">
                    {event.ago}
                  </span>
                </motion.div>
              </AnimatePresence>
            )
          })}
        </div>
      </div>
    </section>
  )
}
