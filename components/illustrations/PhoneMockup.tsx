'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Home, PlusCircle, Search, User } from 'lucide-react'
import { AnimatedNumber } from '../AnimatedNumber'
import { providerMeta } from './BrandGlyphs'
import type { GlyphKey } from '@/types/service'

const groups: { provider: GlyphKey; plan: string; taken: number; total: number; price: number }[] = [
  { provider: 'spotify', plan: 'Spotify Family', taken: 5, total: 6, price: 43 },
  { provider: 'netflix', plan: 'Netflix Premium', taken: 3, total: 4, price: 78 },
  { provider: 'disney', plan: 'Disney+ Standard', taken: 2, total: 4, price: 48 },
  { provider: 'youtube', plan: 'YouTube Premium', taken: 4, total: 6, price: 47 },
]

const toasts = [
  'Matěj se přidal do Spotify Family',
  'Platba 43 Kč proběhla v pořádku',
  'Uvolnilo se místo v Disney+',
]

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-7 pt-3.5 pb-1 text-navy-deep">
      <span className="text-[13px] font-semibold tracking-tight font-mono">9:41</span>
      <div className="flex items-center gap-1.5">
        {/* signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 4.4}
              y={8 - i * 2.4}
              width="2.8"
              height={3 + i * 2.4}
              rx="1"
              fill="currentColor"
              opacity={i === 3 ? 0.35 : 1}
            />
          ))}
        </svg>
        {/* wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
          <path d="M1 3.6A10 10 0 0 1 14 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3.6 6.3a6.2 6.2 0 0 1 7.8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="7.5" cy="9.2" r="1.3" fill="currentColor" />
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
          <rect x="0.6" y="0.6" width="21" height="10.8" rx="3.2" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.1" />
          <rect x="2.2" y="2.2" width="15" height="7.6" rx="2" fill="currentColor" />
          <path d="M23.2 4.3v3.4a2 2 0 0 0 0-3.4Z" fill="currentColor" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  )
}

export function PhoneMockup() {
  const [toastIndex, setToastIndex] = useState(0)
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    const show = setTimeout(() => setToastVisible(true), 3400)
    const loop = setInterval(() => {
      setToastVisible(false)
      setTimeout(() => {
        setToastIndex((i) => (i + 1) % toasts.length)
        setToastVisible(true)
      }, 900)
    }, 6400)
    return () => {
      clearTimeout(show)
      clearInterval(loop)
    }
  }, [])

  return (
    <div className="phone-shell relative w-[292px] max-w-full">
      {/* physical side buttons */}
      <div className="phone-button left-[-3px] top-[112px] h-[28px]" />
      <div className="phone-button left-[-3px] top-[160px] h-[52px]" />
      <div className="phone-button left-[-3px] top-[226px] h-[52px]" />
      <div className="phone-button right-[-3px] top-[186px] h-[78px]" />

      <div className="phone-body">
        <div className="phone-screen h-[600px] bg-[#f7f9fc]">
          {/* dynamic island */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 h-[26px] w-[86px] rounded-full bg-black">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-[#10151f]" />
          </div>

          <StatusBar />

          <div className="px-5 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-display font-extrabold text-[17px] text-navy-deep">
                Ušetři<span className="text-brand">.</span>
              </span>
              <div className="h-8 w-8 rounded-full bg-navy-deep text-white grid place-items-center text-[11px] font-semibold">
                TK
              </div>
            </div>

            {/* savings hero card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 rounded-[22px] p-4 text-white relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0d1b36 0%, #16294f 55%, #0b3a34 100%)' }}
            >
              <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-brand/25 blur-2xl" />
              <p className="text-[11px] uppercase tracking-widest text-white/55">Tento měsíc šetříš</p>
              <p className="text-[30px] font-bold font-mono leading-tight mt-0.5 tracking-[-0.05em]">
                <AnimatedNumber value={1247} suffix=" Kč" />
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="rounded-full bg-brand/20 text-brand text-[10px] font-semibold px-2 py-0.5">
                  ↑ 62 % úspora
                </span>
                <span className="text-[10px] text-white/50">oproti samostatným předplatným</span>
              </div>
            </motion.div>

            <div className="flex items-center justify-between mt-5 mb-2">
              <p className="text-[12px] font-semibold text-navy-deep">Tvoje skupiny</p>
              <p className="text-[11px] text-fg-muted">4 aktivní</p>
            </div>

            <div className="space-y-2">
              {groups.map((g, i) => {
                const meta = providerMeta[g.provider]
                const Glyph = meta.Glyph
                return (
                  <motion.div
                    key={g.plan}
                    initial={{ opacity: 0, x: 22 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.85 + i * 0.16, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-3 rounded-2xl bg-white border border-border/70 p-2.5"
                  >
                    <div
                      className="h-9 w-9 rounded-[11px] grid place-items-center shrink-0"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${meta.color} 16%, white)`,
                        color: meta.color,
                      }}
                    >
                      <Glyph className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-navy-deep truncate">{g.plan}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(g.taken / g.total) * 100}%` }}
                            transition={{ delay: 2.3 + i * 0.16, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                        </div>
                        <span className="text-[10px] text-fg-muted shrink-0">
                          {g.taken}/{g.total}
                        </span>
                      </div>
                    </div>
                    <span className="text-[12px] font-bold font-mono text-navy-deep shrink-0">{g.price} Kč</span>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* in-app notification */}
          <AnimatePresence>
            {toastVisible && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-[46px] left-3 right-3 z-30 rounded-2xl bg-navy-deep/92 backdrop-blur-md text-white px-3 py-2.5 flex items-center gap-2.5 shadow-lg"
              >
                <span className="h-7 w-7 rounded-lg bg-brand grid place-items-center shrink-0">
                  <Bell className="h-3.5 w-3.5 text-brand-foreground" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">Ušetři</p>
                  <p className="text-[11px] font-medium truncate">{toasts[toastIndex]}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* tab bar */}
          <div className="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-border/70 pt-2.5 pb-5">
            <div className="flex items-center justify-around px-6 text-fg-muted">
              <Home className="h-[18px] w-[18px] text-navy-deep" />
              <Search className="h-[18px] w-[18px]" />
              <PlusCircle className="h-[26px] w-[26px] text-brand" />
              <Bell className="h-[18px] w-[18px]" />
              <User className="h-[18px] w-[18px]" />
            </div>
            <div className="mx-auto mt-2.5 h-[4px] w-[108px] rounded-full bg-navy-deep/25" />
          </div>

          <div className="phone-glare" />
        </div>
      </div>
    </div>
  )
}
