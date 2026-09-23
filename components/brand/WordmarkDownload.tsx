'use client'

import { useState } from 'react'
import { Check, Download } from 'lucide-react'
import { displayFont, downloadCanvas } from './exportPng'

const TEXT = 'Ušetři'
const DOT = '.'
const INK = '#050b1a'
const BRAND = '#00d99a'
/** The tracking the wordmark uses everywhere else on the site. */
const TRACKING = '-0.045em'
/** Clear space around the mark, as a multiple of the type size. */
const PAD = 0.2

function applyType(ctx: CanvasRenderingContext2D, family: string, size: number) {
  ctx.font = `800 ${size}px ${family}`
  // Chrome 99+/Safari 16+. Without it the export is a few percent wider than the
  // site's wordmark, which is exactly the kind of drift a logo file must not have.
  if ('letterSpacing' in ctx) ctx.letterSpacing = TRACKING
}

/**
 * Renders the wordmark on its own at an exact pixel width.
 *
 * The canvas is cropped to the glyphs' real ink bounds rather than the font's
 * line box, so the PNG has no dead space above the caron or below the baseline.
 */
async function exportWordmark(targetWidth: number, background: string | null) {
  const family = await displayFont(800, 400)

  const measure = document.createElement('canvas').getContext('2d')
  if (!measure) return

  const probe = 400
  applyType(measure, family, probe)
  const probeWidth = measure.measureText(TEXT + DOT).width
  if (probeWidth <= 0) return

  const pad = (targetWidth * PAD) / (1 + PAD * 2)
  const size = ((targetWidth - pad * 2) / probeWidth) * probe

  applyType(measure, family, size)
  const full = measure.measureText(TEXT + DOT)
  const ascent = full.actualBoundingBoxAscent
  const descent = full.actualBoundingBoxDescent
  const inkWidth = full.width

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(inkWidth + pad * 2)
  canvas.height = Math.round(ascent + descent + pad * 2)
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (background) {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  applyType(ctx, family, size)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  const baseline = pad + ascent
  const nameWidth = ctx.measureText(TEXT).width

  ctx.fillStyle = INK
  ctx.fillText(TEXT, pad, baseline)
  ctx.fillStyle = BRAND
  ctx.fillText(DOT, pad + nameWidth, baseline)

  const tag = background ? 'bile' : 'pruhledne'
  await downloadCanvas(canvas, `usetri-wordmark-${tag}-${canvas.width}x${canvas.height}.png`)
}

function ExportButton({ width, background }: { width: number; background: string | null }) {
  const [state, setState] = useState<'idle' | 'working' | 'done'>('idle')

  const run = async () => {
    setState('working')
    try {
      await exportWordmark(width, background)
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
      {state === 'working' ? 'generuju…' : state === 'done' ? 'staženo' : `${width} px`}
    </button>
  )
}

export function WordmarkDownload() {
  return (
    <section className="rounded-[28px] border border-border bg-white overflow-hidden">
      <header className="px-7 pt-6 pb-5 border-b border-border/70">
        <h2 className="font-display text-[20px] font-extrabold text-navy-deep tracking-tight">Wordmark</h2>
        <p className="text-[13px] text-fg-muted mt-0.5">
          Samotný název. Tam, kde je maskot moc — patička, faktura, razítko, podpis v mailu.
        </p>
      </header>

      <div className="px-7 py-16 grid place-items-center bg-white">
        <span
          className="font-display font-extrabold tracking-[-0.045em] leading-none text-navy-deep"
          style={{ fontSize: 132 }}
        >
          {TEXT}
          <span className="text-brand">{DOT}</span>
        </span>
      </div>

      <div className="px-7 py-6 border-t border-border/70 flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] uppercase tracking-[0.18em] text-fg-muted w-[92px]">Na bílém</span>
          <ExportButton width={2048} background="#ffffff" />
          <ExportButton width={4096} background="#ffffff" />
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] uppercase tracking-[0.18em] text-fg-muted w-[92px]">Průhledné</span>
          <ExportButton width={2048} background={null} />
          <ExportButton width={4096} background={null} />
        </div>
      </div>

      <div className="px-7 pb-6">
        <p className="text-[12.5px] text-fg-muted leading-relaxed max-w-[640px]">
          Výřez sedí na skutečné hranice písmen — nad háčkem ani pod účařím není prázdné místo.
          Prokládání je stejné jako na webu (−0,045 em), takže stažené logo a nadpis na stránce
          jsou totožné. Volné pole kolem je 20 % velikosti písma; menší odstup už značku dusí.
        </p>
      </div>
    </section>
  )
}
