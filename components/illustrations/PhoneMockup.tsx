'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Compass, House, Music, Plus, Play, TrendingDown, User, Users } from 'lucide-react'
import { AnimatedNumber } from '../AnimatedNumber'
import { BrandGlyph } from './BrandGlyph'
import { Mascot } from './Mascot'
import { formatDate, todayInPrague } from '@/lib/billing'
import { formatCzk } from '@/lib/format'

/**
 * The Expo app's home screen (usetri-mobile/src/screens/HomeScreen.tsx), drawn at
 * the app's own point sizes on a 390 pt wide canvas and scaled down into the frame
 * — so the landing page shows the real app, not a lookalike. When the app's home
 * screen changes, change this with it.
 */

/** The app's palette (usetri-mobile/src/theme.ts). */
const c = {
  navyDeep: '#050b1a',
  navyMid: '#10305c',
  surface: '#f7f9fc',
  brand: '#00d99a',
  brandForeground: '#00251a',
  muted: '#5b6478',
  border: '#e3e8f2',
  faint: '#9aa3b4',
}

/** Screen width inside the frame (292 − 2 × 3 shell − 2 × 9 bezel) over the app's 390 pt. */
const SCALE = 268 / 390
const SCREEN_HEIGHT = 600

type Group = {
  slug: string
  name: string
  plan: string
  color: string
  category: 'hudba' | 'video'
  price: number
  fullPrice: number
  total: number
  role: 'owner' | 'member'
  owner: string
  members: string[]
}

const groups: Group[] = [
  {
    slug: 'spotify-family',
    name: 'Spotify',
    plan: 'Family (6 členů)',
    color: '#1db954',
    category: 'hudba',
    price: 44,
    fullPrice: 259,
    total: 6,
    role: 'owner',
    owner: 'Tomáš Kotík',
    members: ['Tomáš Kotík', 'Matěj Novák', 'Klára Dvořáková', 'Eliška Horáková', 'Jan Svoboda'],
  },
  {
    slug: 'netflix-premium',
    name: 'Netflix',
    plan: 'Premium (4K, 4 obrazovky)',
    color: '#e50914',
    category: 'video',
    price: 78,
    fullPrice: 309,
    total: 4,
    role: 'member',
    owner: 'Klára Dvořáková',
    members: ['Klára Dvořáková', 'Tomáš Kotík', 'Adam Beneš'],
  },
  {
    slug: 'disney-plus',
    name: 'Disney+',
    plan: 'Standard (2 obrazovky)',
    color: '#0063e5',
    category: 'video',
    price: 48,
    fullPrice: 189,
    total: 4,
    role: 'member',
    owner: 'Jan Svoboda',
    members: ['Jan Svoboda', 'Tomáš Kotík'],
  },
]

// Same sums the app's summary makes, so the numbers on screen agree with each other.
const monthly = groups.reduce((sum, g) => sum + g.price, 0)
const alone = groups.reduce((sum, g) => sum + g.fullPrice, 0)
const saved = alone - monthly
const percent = Math.round((1 - monthly / alone) * 100)

const ease = [0.16, 1, 0.3, 1] as const

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between pl-8 pr-6 pt-3.5 pb-1 text-white">
      <span className="font-mono text-[13px] font-semibold tracking-tight">9:41</span>
      <div className="flex items-center gap-1">
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

/** The app's ServiceMark: the service's glyph on a tile tinted with its colour. */
function ServiceMark({ slug, color, size = 42 }: { slug: string; color: string; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.33,
        backgroundColor: `${color}1f`,
        border: `1px solid ${color}33`,
        color,
      }}
    >
      <span style={{ width: size * 0.54, height: size * 0.54 }} className="block [&>svg]:h-full [&>svg]:w-full">
        <BrandGlyph slug={slug} />
      </span>
    </div>
  )
}

function MemberStack({ members, free }: { members: string[]; free: number }) {
  const size = 26
  return (
    <div className="flex items-center" style={{ paddingLeft: size * 0.28 }}>
      {members.slice(0, 4).map((name) => (
        <span
          key={name}
          className="grid place-items-center rounded-full font-extrabold"
          style={{
            width: size,
            height: size,
            marginLeft: -size * 0.28,
            backgroundColor: c.brand,
            color: c.brandForeground,
            fontSize: size * 0.34,
            border: '2px solid #fff',
          }}
        >
          {initials(name)}
        </span>
      ))}
      {Array.from({ length: Math.min(free, 3) }).map((_, i) => (
        <span
          key={`free-${i}`}
          className="grid place-items-center rounded-full bg-white font-bold"
          style={{
            width: size,
            height: size,
            marginLeft: -size * 0.28,
            color: c.muted,
            fontSize: size * 0.4,
            border: `2px dashed ${c.muted}59`,
          }}
        >
          +
        </span>
      ))}
    </div>
  )
}

function Tag({ label, dark = false }: { label: string; dark?: boolean }) {
  return (
    <span
      className="rounded-full px-2 py-[2.5px] text-[10px] font-bold"
      style={
        dark
          ? { backgroundColor: c.navyDeep, color: '#fff' }
          : { backgroundColor: 'rgba(0,217,154,0.16)', color: c.brandForeground }
      }
    >
      {label}
    </span>
  )
}

/** The app's OfferCard (usetri-mobile/src/components/OfferCard.tsx). */
function OfferCard({ group }: { group: Group }) {
  const free = group.total - group.members.length
  const CategoryIcon = group.category === 'hudba' ? Music : Play

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border bg-white p-[15px]"
      style={{ borderColor: c.border, boxShadow: '0 6px 14px rgba(5,11,26,0.06)' }}
    >
      <div className="flex items-center gap-3">
        <ServiceMark slug={group.slug} color={group.color} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[16.5px] font-bold tracking-[-0.3px]" style={{ color: c.navyDeep }}>
              {group.name}
            </span>
            {group.role === 'owner' ? <Tag label="tvoje" dark /> : <Tag label="jsi člen" />}
          </div>
          <p className="mt-px truncate text-[12.5px]" style={{ color: c.muted }}>
            {group.plan}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[17px] font-extrabold tracking-[-0.5px]" style={{ color: c.navyDeep }}>
            {formatCzk(group.price)}
          </p>
          <p className="text-[10.5px]" style={{ color: c.muted }}>
            měsíčně
          </p>
        </div>
      </div>

      <div className="mt-3 flex">
        <MemberStack members={group.members} free={free} />
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2.5 border-t pt-3" style={{ borderColor: c.border }}>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <CategoryIcon className="h-3 w-3 shrink-0" style={{ color: c.faint }} />
          <span className="flex items-center gap-1">
            {Array.from({ length: group.total }).map((_, i) => (
              <span
                key={i}
                className="h-[7px] w-[7px] rounded-full"
                style={{ backgroundColor: i < group.members.length ? c.brand : c.border }}
              />
            ))}
          </span>
          <span className="truncate text-[12px]" style={{ color: c.muted }}>
            {free === 0 ? 'plno' : `volná ${free}`} · {group.owner}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-bold"
            style={{ backgroundColor: 'rgba(0,217,154,0.14)', color: c.brandForeground }}
          >
            <TrendingDown className="h-[11px] w-[11px]" />−{formatCzk(group.fullPrice - group.price)}
          </span>
          <ChevronRight className="h-[17px] w-[17px]" style={{ color: '#b6bfcd' }} />
        </div>
      </div>

      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: group.color }} />
    </div>
  )
}

function Tab({ icon: Icon, label, active = false }: { icon: typeof House; label: string; active?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-[3px] py-0.5">
      <Icon
        className="h-[21px] w-[21px]"
        style={{ color: active ? c.navyDeep : c.faint, transform: active ? 'translateY(-3px) scale(1.08)' : undefined }}
      />
      <span className="text-[10.5px] font-semibold" style={{ color: active ? c.navyDeep : c.faint }}>
        {label}
      </span>
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: c.brand, opacity: active ? 1 : 0 }} />
    </div>
  )
}

export function PhoneMockup() {
  const today = todayInPrague()
  const due = groups[1]

  return (
    <div className="phone-shell relative w-[292px] max-w-full" role="img" aria-label="Úvodní obrazovka aplikace Ušetři">
      {/* physical side buttons */}
      <div className="phone-button left-[-3px] top-[112px] h-[28px]" />
      <div className="phone-button left-[-3px] top-[160px] h-[52px]" />
      <div className="phone-button left-[-3px] top-[226px] h-[52px]" />
      <div className="phone-button right-[-3px] top-[186px] h-[78px]" />

      <div className="phone-body">
        <div className="phone-screen" style={{ height: SCREEN_HEIGHT, backgroundColor: c.surface }} aria-hidden="true">
          {/* dynamic island */}
          <div className="absolute top-2.5 left-1/2 z-20 h-[26px] w-[86px] -translate-x-1/2 rounded-full bg-black">
            <span className="absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#10151f]" />
          </div>
          <StatusBar />

          {/* The app itself, at its own sizes. */}
          <div
            className="relative origin-top-left"
            style={{ width: 390, height: SCREEN_HEIGHT / SCALE, transform: `scale(${SCALE})` }}
          >
            <header
              className="rounded-b-[28px] px-5 pb-[22px] pt-[72px] text-white"
              style={{ background: `linear-gradient(180deg, ${c.navyMid} 0%, #0b1730 55%, ${c.navyDeep} 100%)` }}
            >
              <p className="font-display text-[19px] font-extrabold tracking-[-0.5px]">
                Ušetři<span style={{ color: c.brand }}>.</span>
              </p>

              <div className="mt-2.5 flex items-center gap-2.5">
                <div className="min-w-0 flex-1">
                  <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.8, ease }}
                    className="font-display text-[28px] font-extrabold leading-tight tracking-[-1px]"
                  >
                    Ahoj, Tomáš.
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.8, ease }}
                    className="mt-1 text-[13.5px] text-white/55"
                  >
                    Jsi v {groups.length} skupinách.
                  </motion.p>
                </div>
                <Mascot size={88} mood="wave" holds="bag" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.45, duration: 1, ease }}
                className="mt-4 rounded-[24px] border border-white/[0.12] bg-white/[0.06] p-[18px]"
              >
                <p className="text-[11px] uppercase tracking-[1.4px] text-white/55">Tento měsíc šetříš</p>
                <p className="mt-1 text-[38px] font-extrabold leading-none tracking-[-1.8px]">
                  <AnimatedNumber value={saved} suffix=" Kč" />
                </p>
                <span
                  className="mt-2.5 inline-flex items-center gap-[5px] rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{ backgroundColor: 'rgba(0,217,154,0.18)', color: c.brand }}
                >
                  <TrendingDown className="h-3 w-3" />o {percent} % méně než samostatně
                </span>
                <div className="mt-4 flex gap-3.5 border-t border-white/10 pt-3.5">
                  {[
                    ['Platíš měsíčně', formatCzk(monthly)],
                    ['Skupiny', String(groups.length)],
                    ['Ročně ušetříš', formatCzk(saved * 12)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex-1">
                      <p className="text-[10px] uppercase tracking-[0.8px] text-white/50">{label}</p>
                      <p className="mt-[3px] text-base font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </header>

            <div className="flex flex-col gap-[26px] p-5">
              {/* QR payments: what the member owes this month. */}
              <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7, duration: 0.9, ease }}
                className="flex flex-col gap-3"
              >
                <p className="text-[19px] font-extrabold tracking-[-0.5px]" style={{ color: c.navyDeep }}>
                  K zaplacení
                </p>
                <div className="rounded-[24px] border bg-white px-3.5" style={{ borderColor: c.border }}>
                  <div className="flex items-center gap-3 py-3">
                    <ServiceMark slug={due.slug} color={due.color} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-bold tracking-[-0.2px]" style={{ color: c.navyDeep }}>
                        {due.name}
                      </p>
                      <p className="mt-0.5 text-[12px]" style={{ color: c.muted }}>
                        splatné {formatDate(today)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[14px] font-bold tabular-nums" style={{ color: c.navyDeep }}>
                        {formatCzk(due.price)}
                      </p>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        style={{ backgroundColor: '#eef1f7', color: c.navyDeep }}
                      >
                        K zaplacení
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4" style={{ color: '#b6bfcd' }} />
                  </div>
                </div>
              </motion.section>

              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-[19px] font-extrabold tracking-[-0.5px]" style={{ color: c.navyDeep }}>
                    Tvoje skupiny
                  </p>
                  <p className="text-[14px] font-semibold" style={{ color: c.muted }}>
                    {groups.length}
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {groups.map((group, i) => (
                    <motion.div
                      key={group.slug}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.9 + i * 0.12, duration: 0.9, ease }}
                    >
                      <OfferCard group={group} />
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>

            {/* floating tab bar (usetri-mobile/src/components/TabBar.tsx) */}
            <div className="absolute inset-x-0 bottom-0 px-3.5 pb-[34px]">
              <div
                className="flex items-center justify-between rounded-[26px] border bg-white px-2 pt-[9px] pb-[7px]"
                style={{ borderColor: c.border, boxShadow: '0 10px 24px rgba(5,11,26,0.16)' }}
              >
                <Tab icon={House} label="Domů" active />
                <Tab icon={Compass} label="Objevit" />
                <span
                  className="mx-1.5 -mt-[22px] grid h-[54px] w-[54px] place-items-center rounded-[18px] border-4"
                  style={{
                    backgroundColor: c.brand,
                    borderColor: c.surface,
                    boxShadow: '0 10px 24px rgba(5,11,26,0.16)',
                  }}
                >
                  <Plus className="h-6 w-6" style={{ color: c.brandForeground }} />
                </span>
                <Tab icon={Users} label="Skupiny" />
                <Tab icon={User} label="Profil" />
              </div>
              <div className="mx-auto mt-3 h-[5px] w-[134px] rounded-full bg-black/25" />
            </div>
          </div>

          <div className="phone-glare" />
        </div>
      </div>
    </div>
  )
}
