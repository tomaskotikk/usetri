'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy, Download } from 'lucide-react'
import { Mascot, type MascotMood } from '../illustrations/Mascot'
import { SpotifyGlyph, NetflixGlyph, YoutubeGlyph, DisneyGlyph } from '../illustrations/BrandGlyphs'
import { displayFont, downloadCanvas, rasterize } from './exportPng'

/** Instagram's tallest feed format, so a post takes the most screen it can. */
const W = 1080
const H = 1350
const M = 88

const INK = '#050b1a'
const MUTED = '#5b6478'
const BRAND = '#00d99a'
const LINE = '#e3e8f2'

/**
 * Prices verified against providers in September 2026. Seat counts are the ones
 * the provider actually sells — not what the catalogue used to claim — because a
 * public post is a price claim we have to stand behind.
 */
const PLANS = [
  { key: 'spotify' as const, name: 'Spotify Family', color: '#1db954', full: 299, seats: 6 },
  { key: 'youtube' as const, name: 'YouTube Premium', color: '#ff0033', full: 459, seats: 6 },
  { key: 'netflix' as const, name: 'Netflix Premium', color: '#e50914', full: 419, seats: 4 },
  { key: 'disney' as const, name: 'Disney+ Standard', color: '#0063e5', full: 219, seats: 2 },
]

type PlanKey = (typeof PLANS)[number]['key']

const GLYPHS: Record<PlanKey, (p: { className?: string }) => React.ReactElement> = {
  spotify: SpotifyGlyph,
  youtube: YoutubeGlyph,
  netflix: NetflixGlyph,
  disney: DisneyGlyph,
}

const MOODS: MascotMood[] = ['wave', 'cheer', 'think', 'search']

interface Assets {
  mascots: Partial<Record<MascotMood, HTMLImageElement>>
  glyphs: Partial<Record<PlanKey, HTMLImageElement>>
  family: string
}

const share = (plan: (typeof PLANS)[number]) => Math.round(plan.full / plan.seats)
const cut = (plan: (typeof PLANS)[number]) => Math.round((1 - share(plan) / plan.full) * 100)
const czk = (n: number) => n.toLocaleString('cs-CZ')

function rgba(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function text(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  opts: { font: string; color: string; align?: CanvasTextAlign },
) {
  ctx.font = opts.font
  ctx.fillStyle = opts.color
  ctx.textAlign = opts.align ?? 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(value, x, y)
  ctx.textAlign = 'left'
}

/** White, but not flat — the same field the ad and the banner use. */
function field(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  const bloom = ctx.createRadialGradient(W / 2, H * 0.3, 40, W / 2, H * 0.3, 900)
  bloom.addColorStop(0, 'rgba(0,217,154,0.14)')
  bloom.addColorStop(1, 'rgba(0,217,154,0)')
  ctx.fillStyle = bloom
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(5,11,26,0.04)'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let x = 0; x <= W; x += 108) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
  }
  for (let y = 0; y <= H; y += 108) {
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
  }
  ctx.stroke()
}

function darkField(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, W * 0.6, H)
  g.addColorStop(0, '#050b1a')
  g.addColorStop(0.55, '#0d1b36')
  g.addColorStop(1, '#0b3a34')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  const bloom = ctx.createRadialGradient(W / 2, H * 0.34, 40, W / 2, H * 0.34, 760)
  bloom.addColorStop(0, 'rgba(0,217,154,0.22)')
  bloom.addColorStop(1, 'rgba(0,217,154,0)')
  ctx.fillStyle = bloom
  ctx.fillRect(0, 0, W, H)
}

function kicker(ctx: CanvasRenderingContext2D, a: Assets, label: string, y: number) {
  ctx.fillStyle = BRAND
  roundRect(ctx, M, y - 22, 52, 5, 3)
  ctx.fill()
  ctx.letterSpacing = '0.18em'
  text(ctx, label.toUpperCase(), M + 74, y - 12, { font: `700 26px ${a.family}`, color: BRAND })
  ctx.letterSpacing = '0px'
}

/** Wordmark and address, identical on every post so the set reads as a series. */
function footer(ctx: CanvasRenderingContext2D, a: Assets, dark = false) {
  const y = H - 74
  ctx.letterSpacing = '-0.045em'
  ctx.font = `800 44px ${a.family}`
  const nameWidth = ctx.measureText('Ušetři').width
  ctx.fillStyle = dark ? '#ffffff' : INK
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('Ušetři', M, y)
  ctx.fillStyle = BRAND
  ctx.fillText('.', M + nameWidth, y)
  ctx.letterSpacing = '0px'

  text(ctx, 'usetri.app', W - M, y, {
    font: `600 32px ${a.family}`,
    color: dark ? 'rgba(255,255,255,0.55)' : MUTED,
    align: 'right',
  })
}

function planTile(ctx: CanvasRenderingContext2D, a: Assets, key: PlanKey, x: number, y: number, size: number) {
  const plan = PLANS.find((p) => p.key === key)
  if (!plan) return
  ctx.fillStyle = rgba(plan.color, 0.13)
  roundRect(ctx, x, y, size, size, size * 0.3)
  ctx.fill()
  const glyph = a.glyphs[key]
  if (glyph) ctx.drawImage(glyph, x + size * 0.22, y + size * 0.22, size * 0.56, size * 0.56)
}

/* ---------------- the posts ---------------- */

function postPriceShock(ctx: CanvasRenderingContext2D, a: Assets) {
  const plan = PLANS[0]
  field(ctx)
  kicker(ctx, a, plan.name, 200)

  text(ctx, `${czk(plan.full)} Kč`, M, 380, { font: `800 96px ${a.family}`, color: MUTED })
  ctx.strokeStyle = '#d63b2f'
  ctx.lineWidth = 9
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(M - 8, 348)
  ctx.lineTo(M + ctx.measureText(`${czk(plan.full)} Kč`).width + 8, 344)
  ctx.stroke()

  ctx.letterSpacing = '-0.04em'
  text(ctx, `${czk(share(plan))} Kč`, M, 600, { font: `800 200px ${a.family}`, color: INK })
  ctx.letterSpacing = '0px'

  text(ctx, `když se o tarif podělí ${plan.seats} lidí`, M, 676, {
    font: `500 40px ${a.family}`,
    color: MUTED,
  })

  ctx.fillStyle = BRAND
  roundRect(ctx, M, 740, 300, 92, 46)
  ctx.fill()
  text(ctx, `−${cut(plan)} % měsíčně`, M + 150, 800, {
    font: `700 38px ${a.family}`,
    color: '#00251a',
    align: 'center',
  })

  planTile(ctx, a, plan.key, W - M - 150, 190, 150)
  const mascot = a.mascots.cheer
  if (mascot) ctx.drawImage(mascot, W - M - 330, 880, 340, 340)

  footer(ctx, a)
}

function postPriceTable(ctx: CanvasRenderingContext2D, a: Assets) {
  field(ctx)
  kicker(ctx, a, 'Ceník', 200)

  ctx.letterSpacing = '-0.04em'
  text(ctx, 'Kolik platíš', M, 306, { font: `800 84px ${a.family}`, color: INK })
  text(ctx, 'a kolik bys mohl', M, 394, { font: `800 84px ${a.family}`, color: BRAND })
  ctx.letterSpacing = '0px'

  let y = 480
  for (const plan of PLANS) {
    planTile(ctx, a, plan.key, M, y + 14, 88)
    text(ctx, plan.name, M + 118, y + 56, { font: `700 38px ${a.family}`, color: INK })
    text(ctx, `${plan.seats} míst`, M + 118, y + 100, { font: `500 28px ${a.family}`, color: MUTED })

    text(ctx, `${czk(plan.full)} Kč`, W - M - 200, y + 56, {
      font: `500 34px ${a.family}`,
      color: MUTED,
      align: 'right',
    })
    ctx.strokeStyle = MUTED
    ctx.lineWidth = 3
    const wide = ctx.measureText(`${czk(plan.full)} Kč`).width
    ctx.beginPath()
    ctx.moveTo(W - M - 200 - wide, y + 44)
    ctx.lineTo(W - M - 200, y + 44)
    ctx.stroke()

    text(ctx, `${czk(share(plan))} Kč`, W - M, y + 62, {
      font: `800 48px ${a.family}`,
      color: INK,
      align: 'right',
    })

    y += 148
    if (plan !== PLANS[PLANS.length - 1]) {
      ctx.strokeStyle = LINE
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(M, y - 26)
      ctx.lineTo(W - M, y - 26)
      ctx.stroke()
    }
  }

  footer(ctx, a)
}

function postSteps(ctx: CanvasRenderingContext2D, a: Assets) {
  field(ctx)
  kicker(ctx, a, 'Jak to funguje', 200)

  ctx.letterSpacing = '-0.04em'
  text(ctx, 'Tři kroky', M, 322, { font: `800 96px ${a.family}`, color: INK })
  ctx.letterSpacing = '0px'

  const steps = [
    ['Najdi skupinu', 'Vyber službu a připoj se k volnému místu.'],
    ['Zaplať svůj podíl', 'Jednou měsíčně, automaticky z karty.'],
    ['Používej', 'Vlastní účet, vlastní heslo, vlastní profil.'],
  ]

  let y = 470
  steps.forEach(([title, body], i) => {
    ctx.fillStyle = i === 0 ? BRAND : rgba('#050b1a', 0.06)
    roundRect(ctx, M, y, 84, 84, 26)
    ctx.fill()
    text(ctx, String(i + 1), M + 42, y + 58, {
      font: `800 44px ${a.family}`,
      color: i === 0 ? '#00251a' : INK,
      align: 'center',
    })

    text(ctx, title, M + 122, y + 42, { font: `700 46px ${a.family}`, color: INK })
    text(ctx, body, M + 122, y + 92, { font: `500 32px ${a.family}`, color: MUTED })
    y += 168
  })

  const mascot = a.mascots.wave
  if (mascot) ctx.drawImage(mascot, W - M - 300, 960, 300, 300)

  footer(ctx, a)
}

function postSafety(ctx: CanvasRenderingContext2D, a: Assets) {
  field(ctx)
  kicker(ctx, a, 'Bezpečná platba', 200)

  ctx.letterSpacing = '-0.04em'
  text(ctx, 'Peníze držíme', M, 330, { font: `800 84px ${a.family}`, color: INK })
  text(ctx, 'v úschově', M, 424, { font: `800 84px ${a.family}`, color: BRAND })
  ctx.letterSpacing = '0px'

  const lines = [
    'Platbu uvolníme, až potvrdíš přístup.',
    'Nedorazí do 72 hodin? Vracíme automaticky.',
    'Zrušíš kdykoliv, bez závazku.',
  ]

  let y = 550
  for (const line of lines) {
    ctx.fillStyle = BRAND
    roundRect(ctx, M, y - 26, 34, 34, 10)
    ctx.fill()
    ctx.strokeStyle = '#00251a'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(M + 9, y - 10)
    ctx.lineTo(M + 15, y - 3)
    ctx.lineTo(M + 25, y - 17)
    ctx.stroke()

    text(ctx, line, M + 62, y, { font: `500 36px ${a.family}`, color: INK })
    y += 92
  }

  const mascot = a.mascots.think
  if (mascot) ctx.drawImage(mascot, W - M - 340, 880, 340, 340)

  footer(ctx, a)
}

function postCta(ctx: CanvasRenderingContext2D, a: Assets) {
  darkField(ctx)

  const mascot = a.mascots.cheer
  if (mascot) ctx.drawImage(mascot, W / 2 - 210, 310, 420, 420)

  ctx.letterSpacing = '-0.045em'
  ctx.font = `800 140px ${a.family}`
  ctx.textBaseline = 'alphabetic'
  const nameWidth = ctx.measureText('Ušetři').width
  const dotWidth = ctx.measureText('.').width
  const left = W / 2 - (nameWidth + dotWidth) / 2
  ctx.fillStyle = '#ffffff'
  ctx.fillText('Ušetři', left, 860)
  ctx.fillStyle = BRAND
  ctx.fillText('.', left + nameWidth, 860)
  ctx.letterSpacing = '0px'

  text(ctx, 'plať jen svůj podíl', W / 2, 930, {
    font: `500 42px ${a.family}`,
    color: 'rgba(255,255,255,0.6)',
    align: 'center',
  })

  ctx.font = `700 44px ${a.family}`
  const url = 'usetri.app'
  const urlWidth = ctx.measureText(url).width
  ctx.fillStyle = BRAND
  roundRect(ctx, W / 2 - urlWidth / 2 - 48, 1010, urlWidth + 96, 100, 50)
  ctx.fill()
  text(ctx, url, W / 2, 1074, { font: `700 44px ${a.family}`, color: '#00251a', align: 'center' })
}

/** Hashtags live on their own line so they can be moved to the first comment. */
const TAGS = '#usetri #predplatne #uspory #osobnifinance #financetipy #ceskystartup'

const POSTS = [
  {
    id: 'cena',
    label: 'Cenový šok',
    paint: postPriceShock,
    caption: `Spotify Family stojí 299 Kč měsíčně. Rozdělený mezi 6 lidí vyjde na 50 Kč.

Za rok je to rozdíl 2 988 Kč — a posloucháš přesně to samé.

Každý má svůj účet, svoje heslo, svoje playlisty. Nesdílí se přihlašovací údaje, sdílí se tarif.

Pozn.: rodinný tarif Spotify počítá s jednou domácností.

👉 usetri.app`,
  },
  {
    id: 'cenik',
    label: 'Ceník služeb',
    paint: postPriceTable,
    caption: `Čtyři nejčastější předplatná a to, co za ně platíš, když je táhneš sám.

Spotify Family — 299 → 50 Kč
YouTube Premium — 459 → 77 Kč
Netflix Premium — 419 → 105 Kč
Disney+ Standard — 219 → 110 Kč

Ceny ověřené k září 2026. Počet míst odpovídá tomu, co poskytovatel skutečně prodává — ne tomu, co se píše po internetu.

Kolik měsíčně necháš za předplatné ty? Napiš do komentářů.

👉 usetri.app`,
  },
  {
    id: 'kroky',
    label: 'Jak to funguje',
    paint: postSteps,
    caption: `Tři kroky, nic víc.

1. Najdeš službu a připojíš se k volnému místu v tarifu.
2. Platíš svůj podíl jednou měsíčně, automaticky z karty.
3. Používáš. Vlastní účet, vlastní heslo, vlastní profil.

Žádné posílání hesel. Žádné upomínání kamarádů. Žádné trapné zprávy na konci měsíce.

👉 usetri.app`,
  },
  {
    id: 'bezpeci',
    label: 'Bezpečná platba',
    paint: postSafety,
    caption: `Největší obava u sdíleného předplatného: pošlu peníze a přístup nedorazí.

Proto peníze nedrží majitel účtu ani my. Platba čeká v úschově u licencované platební instituce a uvolní se až ve chvíli, kdy potvrdíš, že ti přístup funguje.

Nedorazí do 72 hodin? Vracíme automaticky, bez řešení.

👉 usetri.app`,
  },
  {
    id: 'cta',
    label: 'Výzva k akci',
    paint: postCta,
    caption: `Ušetři. Plať jen svůj podíl.

Spoj se s lidmi, rozdělte si rodinné tarify a plať zlomek ceny za služby, které už stejně používáš.

Spouštíme. Odkaz v biu.

👉 usetri.app`,
  },
] as const

/* ---------------- studio ---------------- */

function PostCard({
  post,
  assets,
}: {
  post: (typeof POSTS)[number]
  assets: Assets | null
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [state, setState] = useState<'idle' | 'done'>('idle')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx || !assets) return
    post.paint(ctx, assets)
  }, [post, assets])

  const download = async () => {
    const source = canvas.current
    if (!source) return
    await downloadCanvas(source, `usetri-post-${post.id}-${W}x${H}.png`)
    setState('done')
    window.setTimeout(() => setState('idle'), 1800)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(`${post.caption}

${TAGS}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvas}
        width={W}
        height={H}
        className="w-full rounded-2xl border border-border shadow-sm"
        style={{ aspectRatio: `${W} / ${H}` }}
      />
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-navy-deep">{post.label}</span>
        <button
          onClick={() => void download()}
          disabled={!assets}
          className="flex items-center gap-1.5 rounded-lg bg-navy-deep/5 hover:bg-navy-deep/10 disabled:opacity-40 px-3 py-1.5 text-[11.5px] font-semibold text-navy-deep transition"
        >
          {state === 'done' ? <Check className="h-3.5 w-3.5 text-brand" /> : <Download className="h-3.5 w-3.5" />}
          {state === 'done' ? 'staženo' : 'PNG'}
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">Popisek</span>
          <button
            onClick={() => void copy()}
            className="flex items-center gap-1.5 rounded-lg bg-navy-deep/5 hover:bg-navy-deep/10 px-3 py-1.5 text-[11.5px] font-semibold text-navy-deep transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-brand" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'zkopírováno' : 'Kopírovat'}
          </button>
        </div>
        <p className="text-[13.5px] text-navy-deep leading-relaxed whitespace-pre-line">{post.caption}</p>
        <p className="text-[12.5px] text-fg-muted leading-relaxed mt-4 pt-4 border-t border-border/70">{TAGS}</p>
      </div>
    </div>
  )
}

export function PostStudio() {
  const mascotHosts = useRef<Partial<Record<MascotMood, HTMLDivElement | null>>>({})
  const glyphHosts = useRef<Partial<Record<PlanKey, HTMLDivElement | null>>>({})
  const [assets, setAssets] = useState<Assets | null>(null)

  const collect = useCallback(async () => {
    const family = await displayFont(800, 200)
    const mascots: Assets['mascots'] = {}
    const glyphs: Assets['glyphs'] = {}

    await Promise.all(
      MOODS.map(async (mood) => {
        const svg = mascotHosts.current[mood]?.querySelector('svg')
        if (svg) mascots[mood] = await rasterize(svg, 420, 420)
      }),
    )
    await Promise.all(
      PLANS.map(async ({ key }) => {
        const svg = glyphHosts.current[key]?.querySelector('svg')
        if (svg) glyphs[key] = await rasterize(svg, 160, 160)
      }),
    )

    setAssets({ mascots, glyphs, family })
  }, [])

  useEffect(() => {
    void collect()
  }, [collect])

  return (
    <div>
      {/* Off-screen sources: the art has to exist as live SVG before it can be rasterised. */}
      <div className="fixed -left-[9999px] top-0" aria-hidden="true">
        {MOODS.map((mood) => (
          <div
            key={mood}
            ref={(el) => {
              mascotHosts.current[mood] = el
            }}
          >
            <Mascot size={420} mood={mood} holds={mood === 'cheer' ? 'coin' : mood === 'think' ? 'bag' : undefined} still />
          </div>
        ))}
        {PLANS.map((plan) => {
          const Glyph = GLYPHS[plan.key]
          return (
            <div
              key={plan.key}
              ref={(el) => {
                glyphHosts.current[plan.key] = el
              }}
              style={{ color: plan.color, width: 160, height: 160 }}
            >
              <Glyph className="h-full w-full" />
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {POSTS.map((post) => (
          <PostCard key={post.id} post={post} assets={assets} />
        ))}
      </div>
    </div>
  )
}
