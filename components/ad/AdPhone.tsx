'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Check, Clock, Home, Lock, PlusCircle, Search, ShieldCheck, User, Users } from 'lucide-react'
import { AnimatedNumber } from '../AnimatedNumber'
import { providerMeta } from '../illustrations/BrandGlyphs'
import type { GlyphKey } from '@/types/service'
import type { ScreenKey } from './beats'

const ease = [0.16, 1, 0.3, 1] as const

/** Rise-and-fade entrance shared by every card inside the phone. */
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.62, ease },
})

const groups: { provider: GlyphKey; plan: string; taken: number; total: number; price: number }[] = [
  { provider: 'spotify', plan: 'Spotify Family', taken: 5, total: 6, price: 50 },
  { provider: 'netflix', plan: 'Netflix Premium', taken: 3, total: 4, price: 105 },
  { provider: 'disney', plan: 'Disney+ Standard', taken: 2, total: 4, price: 55 },
  { provider: 'youtube', plan: 'YouTube Premium', taken: 4, total: 6, price: 77 },
]

const offers: { provider: GlyphKey; plan: string; free: number; price: number; full: number }[] = [
  { provider: 'spotify', plan: 'Spotify Family', free: 1, price: 50, full: 299 },
  { provider: 'netflix', plan: 'Netflix Premium', free: 2, price: 105, full: 419 },
  { provider: 'youtube', plan: 'YouTube Premium', free: 2, price: 77, full: 459 },
  { provider: 'disney', plan: 'Disney+ Standard', free: 1, price: 55, full: 219 },
]

function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-7 pt-3.5 pb-1 ${dark ? 'text-white' : 'text-navy-deep'}`}>
      <span className="text-[13px] font-semibold tracking-tight font-mono">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.4} y={8 - i * 2.4} width="2.8" height={3 + i * 2.4} rx="1" fill="currentColor" />
          ))}
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
          <path d="M1 3.6A10 10 0 0 1 14 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3.6 6.3a6.2 6.2 0 0 1 7.8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="7.5" cy="9.2" r="1.3" fill="currentColor" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
          <rect x="0.6" y="0.6" width="21" height="10.8" rx="3.2" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.1" />
          <rect x="2.2" y="2.2" width="15" height="7.6" rx="2" fill="currentColor" />
          <path d="M23.2 4.3v3.4a2 2 0 0 0 0-3.4Z" fill="currentColor" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  )
}

function AppBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-3">
      <span className="font-display font-extrabold text-[17px] text-navy-deep">
        Ušetři<span className="text-brand">.</span>
      </span>
      <div className="h-8 w-8 rounded-full bg-navy-deep text-white grid place-items-center text-[11px] font-semibold">
        TK
      </div>
    </div>
  )
}

function TabBar({ active = 0 }: { active?: number }) {
  const icons = [Home, Search, PlusCircle, Bell, User]
  return (
    <div className="absolute bottom-0 inset-x-0 bg-white/92 backdrop-blur border-t border-border/70 pt-2.5 pb-5">
      <div className="flex items-center justify-around px-6 text-fg-muted">
        {icons.map((Icon, i) =>
          i === 2 ? (
            <Icon key={i} className="h-[26px] w-[26px] text-brand" />
          ) : (
            <Icon key={i} className={`h-[18px] w-[18px] ${i === active ? 'text-navy-deep' : ''}`} />
          ),
        )}
      </div>
      <div className="mx-auto mt-2.5 h-[4px] w-[108px] rounded-full bg-navy-deep/25" />
    </div>
  )
}

function ProviderTile({ provider, size = 'md' }: { provider: GlyphKey; size?: 'md' | 'lg' }) {
  const meta = providerMeta[provider]
  const Glyph = meta.Glyph
  const box = size === 'lg' ? 'h-11 w-11 rounded-[14px]' : 'h-9 w-9 rounded-[11px]'
  return (
    <div
      className={`${box} grid place-items-center shrink-0`}
      style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 16%, white)`, color: meta.color }}
    >
      <Glyph className={size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'} />
    </div>
  )
}

/* ---------------- screens ---------------- */

function HomeScreen() {
  return (
    <>
      <StatusBar />
      <AppBar />
      <div className="px-5">
        <motion.div
          {...rise(0.1)}
          className="mt-4 rounded-[22px] p-4 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d1b36 0%, #16294f 55%, #0b3a34 100%)' }}
        >
          <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-brand/25 blur-2xl" />
          <p className="text-[11px] uppercase tracking-widest text-white/55">Tento měsíc platíš</p>
          <p className="text-[30px] font-bold font-mono leading-tight mt-0.5 tracking-[-0.05em]">1 396 Kč</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="rounded-full bg-destructive/20 text-[10px] font-semibold px-2 py-0.5 text-white">
              4 tarify, všechny sám
            </span>
          </div>
        </motion.div>

        <div className="flex items-center justify-between mt-5 mb-2">
          <p className="text-[12px] font-semibold text-navy-deep">Tvoje předplatná</p>
          <p className="text-[11px] text-fg-muted">4 aktivní</p>
        </div>

        <div className="space-y-2">
          {groups.map((g, i) => {
            const meta = providerMeta[g.provider]
            return (
              <motion.div
                key={g.plan}
                {...rise(0.3 + i * 0.1)}
                className="flex items-center gap-3 rounded-2xl bg-white border border-border/70 p-2.5"
              >
                <ProviderTile provider={g.provider} />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-navy-deep truncate">{g.plan}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(g.taken / g.total) * 100}%` }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.9, ease }}
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
      <TabBar active={0} />
    </>
  )
}

function CatalogScreen() {
  return (
    <>
      <StatusBar />
      <AppBar />
      <div className="px-5">
        <motion.div
          {...rise(0.08)}
          className="mt-4 flex items-center gap-2 rounded-2xl bg-white border border-border px-3 py-2.5"
        >
          <Search className="h-4 w-4 text-fg-muted shrink-0" />
          <span className="text-[12px] text-navy-deep">Spotify</span>
          <motion.span
            className="w-[1.5px] h-3.5 bg-brand"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>

        <div className="flex items-center justify-between mt-4 mb-2">
          <p className="text-[12px] font-semibold text-navy-deep">Volná místa</p>
          <p className="text-[11px] text-brand font-semibold">6 nabídek</p>
        </div>

        <div className="space-y-2">
          {offers.map((o, i) => (
            <motion.div
              key={o.plan}
              {...rise(0.22 + i * 0.11)}
              className="rounded-2xl bg-white border border-border/70 p-3"
            >
              <div className="flex items-center gap-3">
                <ProviderTile provider={o.provider} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-semibold text-navy-deep truncate">{o.plan}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-[10.5px] text-fg-muted">
                    <Users className="h-3 w-3" />
                    <span>{o.free} volné místo</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-bold font-mono text-navy-deep leading-none">{o.price} Kč</p>
                  <p className="text-[9.5px] text-fg-muted line-through mt-1 font-mono">{o.full} Kč</p>
                </div>
              </div>
              {i === 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 1.15, duration: 0.5, ease }}
                  className="overflow-hidden"
                >
                  <div className="mt-2.5 rounded-xl bg-brand py-2 text-center text-[11.5px] font-bold text-brand-foreground">
                    Přidat se
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <TabBar active={1} />
    </>
  )
}

function EscrowScreen() {
  const steps = [
    { label: 'Zaplaceno', note: '50 Kč strženo z karty', state: 'done' },
    { label: 'Čekáme na přístup', note: 'Matěj tě pozve do tarifu', state: 'active' },
    { label: 'Uvolníme majiteli', note: 'Až potvrdíš, že to funguje', state: 'todo' },
  ] as const

  return (
    <>
      <StatusBar />
      <AppBar />
      <div className="px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease }}
          className="mt-5 mx-auto h-16 w-16 rounded-3xl grid place-items-center relative"
          style={{ background: 'linear-gradient(140deg, #00d99a 0%, #4ec8ff 130%)' }}
        >
          <motion.span
            className="absolute inset-0 rounded-3xl bg-brand/40"
            animate={{ scale: [1, 1.45], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <Lock className="h-7 w-7 text-brand-foreground relative" />
        </motion.div>

        <motion.div {...rise(0.18)} className="text-center mt-3.5">
          <p className="font-display text-[17px] font-extrabold text-navy-deep tracking-tight">Platba v úschově</p>
          <p className="text-[11px] text-fg-muted mt-1 px-2 leading-relaxed">
            Tvých 50 Kč drží Stripe, ne majitel účtu.
          </p>
        </motion.div>

        <motion.div {...rise(0.32)} className="mt-4 rounded-[20px] bg-white border border-border/70 p-3.5">
          {steps.map((s, i) => (
            <motion.div key={s.label} {...rise(0.44 + i * 0.13)} className="flex gap-3 items-start">
              <div className="flex flex-col items-center shrink-0">
                <span
                  className={`h-6 w-6 rounded-full grid place-items-center ${
                    s.state === 'done'
                      ? 'bg-brand text-brand-foreground'
                      : s.state === 'active'
                        ? 'bg-cyan-accent/20 text-cyan-accent'
                        : 'bg-secondary text-fg-muted'
                  }`}
                >
                  {s.state === 'done' ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : s.state === 'active' ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                {i < steps.length - 1 && <span className="w-[2px] h-5 mt-1 rounded-full bg-border" />}
              </div>
              <div className="min-w-0 pt-0.5 pb-2">
                <p className="text-[12px] font-semibold text-navy-deep leading-none">{s.label}</p>
                <p className="text-[10.5px] text-fg-muted mt-1 leading-snug">{s.note}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div {...rise(0.92)} className="mt-3 flex items-center gap-2 rounded-2xl bg-brand/10 px-3 py-2.5">
          <ShieldCheck className="h-4 w-4 text-brand shrink-0" />
          <p className="text-[10.5px] text-navy-deep leading-snug">Bez přístupu do 72 h ti platbu vrátíme.</p>
        </motion.div>
      </div>
      <TabBar active={3} />
    </>
  )
}

function PaymentScreen() {
  const rows: [string, string][] = [
    ['Spotify Family — tvůj podíl', '50 Kč'],
    ['Poplatek Ušetři', '2 Kč'],
    ['Další platba', '12. 10.'],
  ]

  return (
    <>
      <StatusBar />
      <AppBar />

      <motion.div
        initial={{ opacity: 0, y: -22, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.9, duration: 0.5, ease }}
        className="absolute top-[46px] left-3 right-3 z-30 rounded-2xl bg-navy-deep/92 backdrop-blur-md text-white px-3 py-2.5 flex items-center gap-2.5 shadow-lg"
      >
        <span className="h-7 w-7 rounded-lg bg-brand grid place-items-center shrink-0">
          <Bell className="h-3.5 w-3.5 text-brand-foreground" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-white/50">Ušetři</p>
          <p className="text-[11px] font-medium truncate">Platba 50 Kč proběhla v pořádku</p>
        </div>
      </motion.div>

      <div className="px-5">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 190, damping: 13, delay: 0.12 }}
          className="mt-8 mx-auto h-[72px] w-[72px] rounded-full bg-brand grid place-items-center relative"
        >
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-brand"
            animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <motion.path
              d="M9 18.5 L15.5 25 L27 12"
              stroke="#00251a"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.38, duration: 0.45, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>

        <motion.div {...rise(0.44)} className="text-center mt-4">
          <p className="font-display text-[19px] font-extrabold text-navy-deep tracking-tight">Zaplaceno</p>
          <p className="text-[11px] text-fg-muted mt-1">Automaticky, každý měsíc.</p>
        </motion.div>

        <motion.div
          {...rise(0.6)}
          className="mt-5 rounded-[20px] bg-white border border-border/70 overflow-hidden"
        >
          {rows.map(([k, v], i) => (
            <div
              key={k}
              className={`flex items-center justify-between px-3.5 py-3 ${i > 0 ? 'border-t border-border/60' : ''}`}
            >
              <span className="text-[11.5px] text-fg-muted">{k}</span>
              <span className={`text-[12px] font-mono font-bold ${i === 2 ? 'text-fg-muted' : 'text-navy-deep'}`}>
                {v}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
      <TabBar active={0} />
    </>
  )
}

function SavingsScreen() {
  const bars = [32, 44, 41, 58, 63, 57, 72, 78, 74, 88, 92, 100]
  const rows: { provider: GlyphKey; name: string; saved: number }[] = [
    { provider: 'youtube', name: 'YouTube Premium', saved: 4584 },
    { provider: 'netflix', name: 'Netflix Premium', saved: 3768 },
    { provider: 'spotify', name: 'Spotify Family', saved: 2988 },
  ]

  return (
    <>
      <StatusBar />
      <AppBar />
      <div className="px-5">
        <motion.div
          {...rise(0.08)}
          className="mt-4 rounded-[22px] p-4 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d1b36 0%, #16294f 50%, #0b3a34 100%)' }}
        >
          <div className="absolute -right-6 -top-12 h-32 w-32 rounded-full bg-brand/30 blur-2xl" />
          <p className="text-[11px] uppercase tracking-widest text-white/55">Celkem ušetřeno</p>
          <p className="text-[34px] font-bold font-mono leading-tight mt-1 tracking-[-0.055em]">
            <AnimatedNumber value={11340} suffix=" Kč" />
          </p>
          <p className="text-[10px] text-white/45 mt-1">za posledních 12 měsíců</p>

          <div className="flex items-end gap-[5px] h-12 mt-3.5">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.3 + i * 0.045, duration: 0.6, ease }}
                className="flex-1 rounded-t-[3px]"
                style={{ background: i > 8 ? 'var(--brand)' : 'rgba(0,217,154,0.38)' }}
              />
            ))}
          </div>
        </motion.div>

        <p className="text-[12px] font-semibold text-navy-deep mt-5 mb-2">Podle služby</p>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <motion.div
              key={r.name}
              {...rise(0.55 + i * 0.12)}
              className="flex items-center gap-3 rounded-2xl bg-white border border-border/70 p-2.5"
            >
              <ProviderTile provider={r.provider} />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-navy-deep truncate">{r.name}</p>
                <p className="text-[10px] text-fg-muted mt-0.5">za rok</p>
              </div>
              <span className="text-[12.5px] font-bold font-mono text-brand shrink-0">
                −{r.saved.toLocaleString('cs-CZ')} Kč
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      <TabBar active={4} />
    </>
  )
}

/**
 * The outro screen. Deliberately just light — the scene pushes the phone at the
 * camera on this beat, so anything drawn here would be magnified sevenfold.
 */
function BrandScreen() {
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: 'linear-gradient(155deg, #050b1a 0%, #0d1b36 52%, #0b3a34 100%)' }}
    >
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(60% 44% at 50% 40%, rgba(0,217,154,0.3) 0%, rgba(0,217,154,0) 72%)' }}
      />
    </div>
  )
}

const screens: Record<ScreenKey, () => React.ReactElement> = {
  home: HomeScreen,
  catalog: CatalogScreen,
  escrow: EscrowScreen,
  payment: PaymentScreen,
  savings: SavingsScreen,
  brand: BrandScreen,
}

/**
 * The ad's phone. Same shell as the marketing mockup, but the screen inside is
 * driven by the beat timeline instead of its own timers.
 */
export function AdPhone({ screen }: { screen: ScreenKey }) {
  const Screen = screens[screen]
  return (
    <div className="phone-shell relative w-[292px]">
      <div className="phone-button left-[-3px] top-[112px] h-[28px]" />
      <div className="phone-button left-[-3px] top-[160px] h-[52px]" />
      <div className="phone-button left-[-3px] top-[226px] h-[52px]" />
      <div className="phone-button right-[-3px] top-[186px] h-[78px]" />

      <div className="phone-body">
        <div className="phone-screen h-[600px] bg-[#f7f9fc]">
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 h-[26px] w-[86px] rounded-full bg-black">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-[#10151f]" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.975 }}
              transition={{ duration: 0.42, ease }}
              className="absolute inset-0"
            >
              <Screen />
            </motion.div>
          </AnimatePresence>

          <div className="phone-glare z-40" />
        </div>
      </div>
    </div>
  )
}
