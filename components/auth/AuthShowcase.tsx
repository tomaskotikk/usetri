'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, Users } from 'lucide-react'
import { Backdrop } from '@/components/Backdrop'
import { GlobeCanvas } from '@/components/illustrations/GlobeCanvas'
import { providerMeta } from '@/components/illustrations/BrandGlyphs'
import { AnimatedNumber } from '@/components/AnimatedNumber'

const EASE = [0.16, 1, 0.3, 1] as const

export function AuthShowcase() {
  const reduce = useReducedMotion()
  const enter = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { delay, duration: 1.2, ease: EASE },
  })
  const Spotify = providerMeta.spotify.Glyph
  const Netflix = providerMeta.netflix.Glyph

  return (
    <div className="relative isolate hidden lg:flex overflow-hidden text-white items-center justify-center">
      <Backdrop variant="dark" />
      <div className="absolute left-1/2 top-1/2 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2 opacity-80">
        <GlobeCanvas className="h-full w-full" />
      </div>

      <div className="relative z-10 w-[380px] space-y-4">
        <motion.div {...enter(0.3)} className="animate-float">
          <div className="glass-dark rounded-3xl p-6 backdrop-blur-xl">
            <p className="text-[11px] uppercase tracking-widest text-white/55">Tento měsíc bys ušetřil</p>
            <p className="mt-1 font-mono text-4xl font-bold tracking-[-0.05em]">
              <AnimatedNumber value={1247} suffix=" Kč" />
            </p>
            <span className="mt-3 inline-block rounded-full bg-brand/20 px-2.5 py-0.5 text-[11px] font-semibold text-brand">
              ↑ 62 % oproti samostatným předplatným
            </span>
          </div>
        </motion.div>

        <motion.div {...enter(0.6)} className="ml-10">
          <div className="glass-dark flex items-center gap-3 rounded-2xl p-4 backdrop-blur-xl">
            <Spotify className="h-7 w-7 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Spotify Family</p>
              <p className="text-xs text-white/55">5 z 6 míst obsazeno</p>
            </div>
            <span className="font-mono text-sm font-semibold text-brand">43 Kč</span>
          </div>
        </motion.div>

        <motion.div {...enter(0.9)} className="mr-10">
          <div className="glass-dark flex items-center gap-3 rounded-2xl p-4 backdrop-blur-xl">
            <Netflix className="h-7 w-7 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Netflix Premium</p>
              <p className="flex items-center gap-1 text-xs text-white/55">
                <Users className="h-3 w-3" /> Zbývá 1 místo
              </p>
            </div>
            <span className="font-mono text-sm font-semibold text-brand">78 Kč</span>
          </div>
        </motion.div>

        <motion.ul {...enter(1.2)} className="space-y-2 pt-4 text-sm text-white/70">
          {['Oficiální rodinné plány, žádné triky', 'Platíš jen svůj podíl', 'Zrušíš kdykoliv'].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-brand" /> {t}
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  )
}
