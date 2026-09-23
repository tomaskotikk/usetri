'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Download } from 'lucide-react'
import { displayFont, downloadCanvas } from './exportPng'

const TEXT = 'Ušetři'
const DOT = '.'
const TRACKING = '-0.045em'

export type AvatarTheme = 'light' | 'dark' | 'brand'

const THEMES: Record<AvatarTheme, { label: string; ink: string; dot: string; fill: (ctx: CanvasRenderingContext2D, s: number) => void }> = {
  light: {
    label: 'Bílé',
    ink: '#050b1a',
    dot: '#00d99a',
    fill: (ctx, s) => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, s, s)
    },
  },
  dark: {
    label: 'Tmavé',
    ink: '#ffffff',
    dot: '#00d99a',
    fill: (ctx, s) => {
      const g = ctx.createLinearGradient(0, 0, s * 0.6, s)
      g.addColorStop(0, '#050b1a')
      g.addColorStop(0.55, '#0d1b36')
      g.addColorStop(1, '#0b3a34')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, s, s)
    },
  },
  brand: {
    label: 'Zelené',
    ink: '#00251a',
    dot: '#ffffff',
    fill: (ctx, s) => {
      ctx.fillStyle = '#00d99a'
      ctx.fillRect(0, 0, s, s)
    },
  },
}

/** How much of the circle's radius the wordmark is allowed to reach. */
const SAFE = 0.86

function applyType(ctx: CanvasRenderingContext2D, family: string, size: number) {
  ctx.font = `800 ${size}px ${family}`
  if ('letterSpacing' in ctx) ctx.letterSpacing = TRACKING
}

/**
 * Paints the profile picture.
 *
 * Instagram masks the square to a circle, so the wordmark has to fit inside that
 * circle, not the square. The binding constraint is the corners of the type's
 * bounding box: with half-width w and half-height h they sit at √(w²+h²) from the
 * centre, which has to stay under the safe radius. Both scale with the font size,
 * so the largest size that fits comes straight out of that identity.
 */
function paintAvatar(ctx: CanvasRenderingContext2D, size: number, theme: AvatarTheme, family: string) {
  const t = THEMES[theme]
  t.fill(ctx, size)

  const probe = 400
  applyType(ctx, family, probe)
  const probed = ctx.measureText(TEXT + DOT)
  if (probed.width <= 0) return

  const widthPerPx = probed.width / probe
  const heightPerPx = (probed.actualBoundingBoxAscent + probed.actualBoundingBoxDescent) / probe

  const radius = (size / 2) * SAFE
  const fontSize = (2 * radius) / Math.hypot(widthPerPx, heightPerPx)

  applyType(ctx, family, fontSize)
  const m = ctx.measureText(TEXT + DOT)
  const ascent = m.actualBoundingBoxAscent
  const descent = m.actualBoundingBoxDescent

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  const baseline = size / 2 + (ascent - descent) / 2
  const left = size / 2 - m.width / 2
  const nameWidth = ctx.measureText(TEXT).width

  ctx.fillStyle = t.ink
  ctx.fillText(TEXT, left, baseline)
  ctx.fillStyle = t.dot
  ctx.fillText(DOT, left + nameWidth, baseline)
}

function Preview({ theme, family }: { theme: AvatarTheme; family: string | null }) {
  const big = useRef<HTMLCanvasElement>(null)
  const small = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!family) return
    for (const [ref, size] of [
      [big, 512],
      [small, 512],
    ] as const) {
      const ctx = ref.current?.getContext('2d')
      if (ctx) paintAvatar(ctx, size, theme, family)
    }
  }, [theme, family])

  return (
    <div className="flex items-end gap-5">
      <div className="flex flex-col items-center gap-2">
        <canvas ref={big} width={512} height={512} className="h-[168px] w-[168px] rounded-full" />
        <span className="font-mono text-[10px] text-fg-muted">{THEMES[theme].label}</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <canvas ref={small} width={512} height={512} className="h-[77px] w-[77px] rounded-full" />
        <span className="font-mono text-[10px] text-fg-muted">skutečná velikost</span>
      </div>
    </div>
  )
}

function ExportButton({ theme, size, family }: { theme: AvatarTheme; size: number; family: string | null }) {
  const [state, setState] = useState<'idle' | 'working' | 'done'>('idle')

  const run = async () => {
    setState('working')
    try {
      const resolved = family ?? (await displayFont(800, 400))
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      paintAvatar(ctx, size, theme, resolved)
      await downloadCanvas(canvas, `usetri-avatar-${theme}-${size}.png`)
      setState('done')
      window.setTimeout(() => setState('idle'), 1800)
    } catch {
      setState('idle')
    }
  }

  return (
    <button
      onClick={() => void run()}
      disabled={state === 'working'}
      className="flex items-center gap-1.5 rounded-lg bg-navy-deep/5 hover:bg-navy-deep/10 disabled:opacity-50 px-3 py-1.5 text-[11.5px] font-semibold text-navy-deep transition"
    >
      {state === 'done' ? <Check className="h-3.5 w-3.5 text-brand" /> : <Download className="h-3.5 w-3.5" />}
      {state === 'working' ? 'generuju…' : state === 'done' ? 'staženo' : `${size} px`}
    </button>
  )
}

export function AvatarDownload() {
  const [family, setFamily] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void displayFont(800, 400).then((f) => {
      if (!cancelled) setFamily(f)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="rounded-[28px] border-2 border-brand bg-white overflow-hidden">
      <header className="flex items-baseline gap-3 px-7 pt-6 pb-5 border-b border-border/70">
        <span className="h-8 px-3 rounded-xl bg-brand text-brand-foreground grid place-items-center font-display font-extrabold text-[13px]">
          PROFILOVKA
        </span>
        <div>
          <h2 className="font-display text-[20px] font-extrabold text-navy-deep tracking-tight">
            Wordmark do kolečka
          </h2>
          <p className="text-[13px] text-fg-muted mt-0.5">
            Čtverec, ale sázený tak, aby se celý název vešel do kruhového ořezu Instagramu.
          </p>
        </div>
      </header>

      <div className="px-7 py-8 flex flex-wrap items-start gap-12">
        {(Object.keys(THEMES) as AvatarTheme[]).map((theme) => (
          <div key={theme} className="flex flex-col gap-4">
            <Preview theme={theme} family={family} />
            <div className="flex items-center gap-2">
              <ExportButton theme={theme} size={320} family={family} />
              <ExportButton theme={theme} size={1024} family={family} />
            </div>
          </div>
        ))}
      </div>

      <div className="px-7 pb-7">
        <p className="text-[12.5px] text-fg-muted leading-relaxed max-w-[680px]">
          Instagram ořezává profilovku na kruh, takže obdélníkové logo přijde o oba konce — proto
          se ti z &bdquo;Ušetři.&ldquo; stalo &bdquo;Ušetř&ldquo;. Tady se velikost písma dopočítává z kružnice: rohy
          textového bloku leží ve vzdálenosti √(š² + v²) od středu a ta musí zůstat pod 86 %
          poloměru. Nic se neořízne a kolem zbyde dech.
        </p>
        <p className="text-[12.5px] text-fg-muted leading-relaxed max-w-[680px] mt-3">
          Nahrávej <strong>1024 px</strong> — Instagram si ho přeškáluje sám a z většího zdroje
          to dopadne líp. Menší náhled vedle ukazuje, jak profilovka vypadá ve skutečné velikosti
          na profilu.
        </p>
      </div>
    </section>
  )
}
