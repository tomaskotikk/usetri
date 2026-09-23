'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Download } from 'lucide-react'
import { Mascot } from '../illustrations/Mascot'
import { buildGlobe, drawGlobe } from '../illustrations/globeRender'
import { displayFont, downloadCanvas, drawCentred, rasterize } from './exportPng'

/**
 * Instagram's profile grid is 3:4 since the 2024 redesign. A 4:5 post shown in a
 * 3:4 cell gets ~34px trimmed off each side, which slides the seams of a banner
 * and makes it look zoomed. Cutting the tiles at 3:4 in the first place means the
 * grid shows each one whole; the opened post is cropped top and bottom instead,
 * which nobody looking at a profile banner cares about.
 */
const PRESETS = [
  { id: 'grid', label: 'Mřížka 3:4', strip: 3039, height: 1350, note: '3039×1350' },
  { id: 'post', label: 'Post 4:5', strip: 3240, height: 1350, note: '3240×1350' },
] as const

type PresetId = (typeof PRESETS)[number]['id']

/** Feet sit at 84.6% down the mascot's box. */
const FEET_RATIO = 101.5 / 120
/** Fractions of the strip, so a preset change rescales the whole composition. */
const MASCOT_INSET = 0.077
const MASCOT_SIZE = 0.1327
const WORDMARK_WIDTH = 0.673

interface Frame {
  strip: number
  height: number
  tile: number
  /** 1350px is the reference height every vertical measure is expressed against. */
  u: number
}

function frameOf(preset: (typeof PRESETS)[number]): Frame {
  return {
    strip: preset.strip,
    height: preset.height,
    tile: preset.strip / 3,
    u: preset.height / 1350,
  }
}

/**
 * Everything hangs off the vertical middle rather than the top, so whatever crop
 * Instagram applies to a tile, it takes evenly from both ends and keeps the lot.
 */
function layout(f: Frame) {
  const mid = f.height / 2
  const centre = f.strip / 2
  return {
    centre,
    globe: { cx: centre, cy: mid - 130 * f.u, r: 610 * f.u },
    wordmark: mid + 85 * f.u,
    feet: mid + 125 * f.u,
    tagline: mid + 215 * f.u,
    url: mid + 310 * f.u,
    washTop: mid - 295 * f.u,
    mascots: [
      { cx: f.strip * MASCOT_INSET, mood: 'wave' as const, holds: undefined },
      { cx: f.strip * (1 - MASCOT_INSET), mood: 'cheer' as const, holds: 'coin' as const },
    ],
    mascotSize: f.strip * MASCOT_SIZE,
  }
}

/** Fits the wordmark to an exact width, since the strip decides the type size. */
function wordmarkSize(ctx: CanvasRenderingContext2D, family: string, target: number) {
  const probe = 400
  ctx.font = `800 ${probe}px ${family}`
  const width = ctx.measureText('Ušetři.').width
  return width > 0 ? (target / width) * probe : probe
}

function drawWordmarkLine(
  ctx: CanvasRenderingContext2D,
  family: string,
  size: number,
  centre: number,
  baseline: number,
) {
  ctx.font = `800 ${size}px ${family}`
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  const name = 'Ušetři'
  const nameWidth = ctx.measureText(name).width
  const dotWidth = ctx.measureText('.').width
  const left = centre - (nameWidth + dotWidth) / 2

  ctx.fillStyle = '#050b1a'
  ctx.fillText(name, left, baseline)
  ctx.fillStyle = '#00d99a'
  ctx.fillText('.', left + nameWidth, baseline)
}

/** White, but not flat — a brand bloom and a faint grid, same as the ad's frame. */
function paintField(ctx: CanvasRenderingContext2D, f: Frame) {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, f.strip, f.height)

  const bloom = ctx.createRadialGradient(f.strip / 2, f.height * 0.32, 60, f.strip / 2, f.height * 0.32, 1500 * f.u)
  bloom.addColorStop(0, 'rgba(0,217,154,0.16)')
  bloom.addColorStop(1, 'rgba(0,217,154,0)')
  ctx.fillStyle = bloom
  ctx.fillRect(0, 0, f.strip, f.height)

  const step = 124 * f.u
  ctx.strokeStyle = 'rgba(5,11,26,0.045)'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let x = 0; x <= f.strip; x += step) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, f.height)
  }
  for (let y = 0; y <= f.height; y += step) {
    ctx.moveTo(0, y)
    ctx.lineTo(f.strip, y)
  }
  ctx.stroke()
}

/** Lifts the globe's lower half towards the page so the wordmark stays crisp. */
function paintTypeWash(ctx: CanvasRenderingContext2D, f: Frame, top: number) {
  const wash = ctx.createLinearGradient(0, top, 0, f.height)
  wash.addColorStop(0, 'rgba(255,255,255,0)')
  wash.addColorStop(0.42, 'rgba(255,255,255,0.62)')
  wash.addColorStop(1, 'rgba(255,255,255,0.8)')
  ctx.fillStyle = wash
  ctx.fillRect(0, top, f.strip, f.height - top)
}

/** What a 3:4 grid cell keeps of one tile. Equal to the tile when already 3:4. */
function gridCrop(f: Frame) {
  const width = Math.min(f.tile, f.height * 0.75)
  return { inset: (f.tile - width) / 2, width }
}

function Guides({ f }: { f: Frame }) {
  const crop = gridCrop(f)
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute top-0 border-x border-dashed border-navy-deep/25"
          style={{ left: i * f.tile, width: f.tile, height: f.height }}
        >
          <span className="absolute top-6 left-6 rounded-lg bg-navy-deep/10 px-3 py-1.5 font-mono text-[26px] text-navy-deep/60">
            {i + 1}
          </span>
          {crop.inset > 0 && (
            <div
              className="absolute top-0 border-x-2 border-dashed border-brand"
              style={{ left: crop.inset, width: crop.width, height: f.height }}
            />
          )}
        </div>
      ))}
    </>
  )
}

export function BannerStudio() {
  const preview = useRef<HTMLCanvasElement>(null)
  const mascotHosts = useRef<(HTMLDivElement | null)[]>([])
  const frameBox = useRef<HTMLDivElement>(null)
  const [boxWidth, setBoxWidth] = useState(1100)
  const [presetId, setPresetId] = useState<PresetId>('grid')
  const [guides, setGuides] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const points = useMemo(() => buildGlobe(), [])
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0]
  const f = frameOf(preset)
  const place = layout(f)
  const mascotSize = Math.round(place.mascotSize)

  useEffect(() => {
    const el = frameBox.current
    if (!el) return
    const observer = new ResizeObserver((entries) => setBoxWidth(entries[0].contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /** Paints the whole strip onto a context at full banner resolution. */
  const paintBanner = useCallback(
    async (ctx: CanvasRenderingContext2D) => {
      paintField(ctx, f)
      drawGlobe(ctx, points, { ...place.globe, rotation: 0.5, pulse: 0.55, detail: 2.4 * f.u, theme: 'light' })
      paintTypeWash(ctx, f, place.washTop)

      const family = await displayFont(800, 400)
      drawWordmarkLine(
        ctx,
        family,
        wordmarkSize(ctx, family, f.strip * WORDMARK_WIDTH),
        place.centre,
        place.wordmark,
      )

      const images = await Promise.all(
        place.mascots.map(async (_, i) => {
          const svg = mascotHosts.current[i]?.querySelector('svg')
          return svg ? rasterize(svg, mascotSize, mascotSize) : null
        }),
      )
      images.forEach((image, i) => {
        if (!image) return
        const m = place.mascots[i]
        ctx.drawImage(image, m.cx - mascotSize / 2, place.feet - mascotSize * FEET_RATIO, mascotSize, mascotSize)
      })

      drawCentred(ctx, 'plať jen svůj podíl', {
        centreX: place.centre,
        baseline: place.tagline,
        font: `500 ${58 * f.u}px ${family}`,
        color: '#5b6478',
      })

      // A filled pill, because brand green as plain text on white reads weakly.
      const urlSize = 48 * f.u
      ctx.font = `700 ${urlSize}px ${family}`
      const url = 'usetri.app'
      const urlWidth = ctx.measureText(url).width
      const padX = 44 * f.u
      const pillH = 96 * f.u
      ctx.fillStyle = '#00d99a'
      ctx.beginPath()
      ctx.roundRect(place.centre - urlWidth / 2 - padX, place.url - 66 * f.u, urlWidth + padX * 2, pillH, pillH / 2)
      ctx.fill()
      drawCentred(ctx, url, {
        centreX: place.centre,
        baseline: place.url,
        font: `700 ${urlSize}px ${family}`,
        color: '#00251a',
      })
    },
    [points, f, place, mascotSize],
  )

  useEffect(() => {
    const canvas = preview.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    void paintBanner(ctx)
  }, [paintBanner])

  const exportPart = async (part: 'full' | 0 | 1 | 2) => {
    const key = String(part)
    setBusy(key)
    try {
      const full = part === 'full'
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(full ? f.strip : f.tile)
      canvas.height = f.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      if (!full) ctx.translate(-(part as number) * f.tile, 0)
      await paintBanner(ctx)

      await downloadCanvas(
        canvas,
        full
          ? `usetri-banner-${Math.round(f.strip)}x${f.height}.png`
          : `usetri-banner-${(part as number) + 1}z3-${Math.round(f.tile)}x${f.height}.png`,
      )
      setDone(key)
      window.setTimeout(() => setDone(null), 1800)
    } finally {
      setBusy(null)
    }
  }

  const button = (part: 'full' | 0 | 1 | 2, label: string, primary = false) => {
    const key = String(part)
    return (
      <button
        key={key}
        onClick={() => void exportPart(part)}
        disabled={busy !== null}
        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition disabled:opacity-40 ${
          primary ? 'bg-navy-deep text-white hover:bg-navy-soft' : 'bg-navy-deep/5 text-navy-deep hover:bg-navy-deep/10'
        }`}
      >
        {done === key ? <Check className="h-4 w-4 text-brand" /> : <Download className="h-4 w-4" />}
        {busy === key ? 'generuju…' : done === key ? 'staženo' : label}
      </button>
    )
  }

  const scale = boxWidth / f.strip

  return (
    <div>
      {/* Off-screen sources: the mascots have to exist as live SVG to be rasterised. */}
      <div className="fixed -left-[9999px] top-0" aria-hidden="true">
        {place.mascots.map((m, i) => (
          <div
            key={i}
            ref={(el) => {
              mascotHosts.current[i] = el
            }}
          >
            <Mascot size={mascotSize} mood={m.mood} holds={m.holds} still />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPresetId(p.id)}
            className={`rounded-xl px-4 py-2.5 text-[13px] font-semibold transition ${
              presetId === p.id ? 'bg-brand text-brand-foreground' : 'bg-navy-deep/5 text-navy-deep hover:bg-navy-deep/10'
            }`}
          >
            {p.label}
            <span className="ml-2 font-mono text-[11px] opacity-70">{p.note}</span>
          </button>
        ))}
      </div>

      <div ref={frameBox} className="rounded-[28px] border border-border bg-white overflow-hidden">
        <div className="relative w-full overflow-hidden" style={{ height: scale * f.height }}>
          <canvas
            ref={preview}
            width={Math.round(f.strip)}
            height={f.height}
            className="absolute top-0 left-0 origin-top-left"
            style={{ width: f.strip, height: f.height, transform: `scale(${scale})` }}
          />
          {guides && (
            <div
              className="absolute top-0 left-0 origin-top-left"
              style={{ width: f.strip, height: f.height, transform: `scale(${scale})` }}
            >
              <Guides f={f} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 mt-6">
        {button('full', 'Celý banner', true)}
        {button(0, 'Dlaždice 1')}
        {button(1, 'Dlaždice 2')}
        {button(2, 'Dlaždice 3')}
        <button
          onClick={() => setGuides((g) => !g)}
          className="rounded-xl bg-navy-deep/5 hover:bg-navy-deep/10 px-4 py-2.5 text-[13px] font-semibold text-navy-deep transition"
        >
          {guides ? 'Skrýt vodítka' : 'Ukázat vodítka'}
        </button>
      </div>
    </div>
  )
}
