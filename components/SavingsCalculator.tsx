'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { AnimatedNumber } from './AnimatedNumber'
import { Mascot } from './illustrations/Mascot'
import { providerMeta } from './illustrations/BrandGlyphs'
import { estimateAnnualSavings, estimateSharedCost } from '@/lib/savings'
import type { GlyphKey } from '@/types/service'

const options: { provider: GlyphKey; label: string; price: number }[] = [
  { provider: 'spotify', label: 'Spotify Family', price: 65 },
  { provider: 'netflix', label: 'Netflix Premium', price: 78 },
  { provider: 'disney', label: 'Disney+', price: 48 },
  { provider: 'youtube', label: 'YouTube Premium', price: 47 },
  { provider: 'adobe', label: 'Adobe CC', price: 363 },
]

export function SavingsCalculator() {
  const [checked, setChecked] = useState<Set<string>>(new Set(['spotify', 'netflix']))

  const toggle = (provider: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(provider)) {
        next.delete(provider)
      } else {
        next.add(provider)
      }
      return next
    })
  }

  const selected = options.filter((o) => checked.has(o.provider))
  const monthlyNow = selected.reduce((sum, o) => sum + o.price, 0)
  const monthlyWith = Math.round(estimateSharedCost(monthlyNow))
  const annualSavings = Math.round(estimateAnnualSavings(selected.map((o) => o.price)))

  return (
    <section id="kalkulacka" className="py-24 px-4 bg-white">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
        <div>
          <Mascot size={92} mood="cheer" holds="bag" className="-ml-2 mb-1" />
          <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold mb-3">Kalkulačka</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-navy-deep tracking-tight">
            Kolik bys ušetřil/a za rok?
          </h2>
          <p className="text-fg-muted mt-4 text-lg max-w-md">
            Zaškrtni předplatná, která teď platíš sám/sama. Spočítáme, kolik z toho zůstane
            ve tvé peněžence, když se o ně podělíš.
          </p>

          <motion.div
            key={annualSavings}
            initial={{ scale: 0.99 }}
            animate={{ scale: 1 }}
            className="relative mt-9 rounded-3xl p-8 text-white overflow-hidden"
            style={{
              background: 'radial-gradient(120% 140% at 85% 10%, #10305c 0%, #071229 55%, #050b1a 100%)',
            }}
          >
            <div className="absolute -right-10 -top-14 h-48 w-48 rounded-full bg-brand/25 blur-3xl" />
            <p className="relative text-xs uppercase tracking-[0.2em] text-white/50">Ušetříš ročně</p>
            <p className="relative font-mono font-bold text-5xl md:text-6xl mt-2 tracking-[-0.06em] text-shimmer">
              <AnimatedNumber value={annualSavings} suffix=" Kč" />
            </p>

            <div className="relative flex items-center gap-6 mt-6 pt-6 border-t border-white/10">
              <div>
                <p className="text-xs text-white/45">Teď platíš</p>
                <p className="font-mono font-semibold text-lg text-white/80 line-through decoration-white/30">
                  {monthlyNow} Kč
                </p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-xs text-white/45">S Ušetři</p>
                <p className="font-mono font-semibold text-lg text-brand">{monthlyWith} Kč</p>
              </div>
              <span className="ml-auto rounded-full bg-brand/15 text-brand text-xs font-semibold px-3 py-1.5">
                měsíčně
              </span>
            </div>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {options.map((o) => {
            const meta = providerMeta[o.provider]
            const Glyph = meta.Glyph
            const active = checked.has(o.provider)
            return (
              <button
                key={o.provider}
                type="button"
                onClick={() => toggle(o.provider)}
                aria-pressed={active}
                className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                  active
                    ? 'border-brand bg-brand/[0.06] shadow-[0_12px_30px_-18px_rgba(0,217,154,0.9)]'
                    : 'border-border bg-white hover:border-navy-deep/25 hover:-translate-y-0.5'
                }`}
              >
                <span className="flex items-start justify-between">
                  <span
                    className="h-11 w-11 rounded-2xl grid place-items-center"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${meta.color} 12%, white)`,
                      color: meta.color,
                    }}
                  >
                    <Glyph className="h-5 w-5" />
                  </span>
                  <span
                    className={`h-6 w-6 rounded-full grid place-items-center border-2 transition-colors ${
                      active ? 'bg-brand border-brand' : 'border-border'
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5 text-brand-foreground" strokeWidth={3} />}
                  </span>
                </span>
                <span className="block font-semibold text-navy-deep mt-4">{o.label}</span>
                <span className="block text-sm text-fg-muted font-mono mt-0.5">{o.price} Kč / měsíc</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
