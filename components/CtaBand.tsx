'use client'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Mascot } from './illustrations/Mascot'
import { providerMeta } from './illustrations/BrandGlyphs'
import type { GlyphKey } from '@/types/service'

const order: GlyphKey[] = ['spotify', 'netflix', 'disney', 'youtube', 'adobe']

export function CtaBand() {
  return (
    <section className="px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] px-8 py-16 md:px-16 md:py-20 text-white"
        style={{
          background:
            'radial-gradient(120% 140% at 82% 10%, #10305c 0%, #071229 48%, #050b1a 100%)',
        }}
      >
        <div className="absolute inset-0 bg-grid-dark" />
        <div className="absolute -right-20 -top-24 h-[380px] w-[380px] glow scale-150 [--glow:color-mix(in_srgb,var(--brand)_20%,transparent)]" />
        <div className="absolute -left-24 bottom-0 h-[300px] w-[300px] glow scale-150 [--glow:color-mix(in_srgb,var(--cyan-accent)_15%,transparent)]" />

        <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <Mascot size={132} mood="cheer" holds="coin" className="-ml-4 mb-2" />
            <h2 className="font-display font-extrabold text-4xl md:text-5xl leading-[1.05] tracking-tight">
              Začni šetřit
              <br />
              <span className="text-shimmer">ještě dnes.</span>
            </h2>
            <p className="text-white/60 mt-5 text-lg max-w-md">
              Registrace zdarma, žádný poplatek za vstup. Odejít můžeš kdykoliv.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="h-14 rounded-2xl bg-brand text-brand-foreground hover:bg-brand-soft px-7 text-base font-semibold group"
              >
                Založit akci
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-2xl px-7 text-base bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white"
              >
                Prohlédnout skupiny
              </Button>
            </div>

            <p className="flex items-center gap-2 text-sm text-white/45 mt-6">
              <ShieldCheck className="h-4 w-4 text-brand" />
              Oficiální rodinné plány · GDPR · zabezpečené platby
            </p>
          </div>

          <div className="grid grid-cols-5 lg:grid-cols-2 gap-3">
            {order.map((p, i) => {
              const meta = providerMeta[p]
              const Glyph = meta.Glyph
              return (
                <motion.div
                  key={p}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="glass-dark rounded-2xl p-4 flex flex-col items-center lg:items-start gap-2"
                >
                  <span className="h-10 w-10 rounded-xl grid place-items-center bg-white" style={{ color: meta.color }}>
                    <Glyph className="h-5 w-5" />
                  </span>
                  <span className="hidden lg:block text-sm font-medium text-white/80">{meta.name}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
