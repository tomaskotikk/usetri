'use client'

import { useRef, useState } from 'react'
import { Check, Download } from 'lucide-react'
import { Mascot, type MascotMood } from '../illustrations/Mascot'
import { darkField, displayFont, downloadCanvas, drawWordmark, rasterize } from './exportPng'

/**
 * Ušetřík standing above the wordmark — the lockup you install as an app icon or
 * drop into a profile. Square, so it survives every avatar crop.
 */
export function LockupDownload({
  filename,
  label,
  mood = 'cheer',
  holds = 'coin',
  size = 1024,
  dark = false,
}: {
  filename: string
  label: string
  mood?: MascotMood
  holds?: 'coin' | 'bag'
  size?: number
  /** Dark field behind the lockup; otherwise the PNG is transparent. */
  dark?: boolean
}) {
  const host = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'working' | 'done'>('idle')

  const run = async () => {
    const svg = host.current?.querySelector('svg')
    if (!svg) return
    setState('working')
    try {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      if (dark) darkField(ctx, size, size)

      // Proportions held as fractions of the square, so any export size composes alike.
      const mascotSize = size * 0.62
      const mascotLeft = (size - mascotSize) / 2
      const mascotTop = size * 0.07
      const wordSize = size * 0.155
      const baseline = size * 0.9

      const [image, family] = await Promise.all([
        rasterize(svg, mascotSize, mascotSize),
        displayFont(800, wordSize),
      ])

      ctx.drawImage(image, mascotLeft, mascotTop, mascotSize, mascotSize)
      drawWordmark(ctx, {
        centreX: size / 2,
        baseline,
        size: wordSize,
        family,
        color: dark ? '#ffffff' : '#050b1a',
      })

      await downloadCanvas(canvas, `${filename}-${size}.png`)
      setState('done')
      window.setTimeout(() => setState('idle'), 1800)
    } catch {
      setState('idle')
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`w-[180px] rounded-3xl flex flex-col items-center pt-3 pb-5 ${
          dark ? '' : 'bg-white border border-border'
        }`}
        style={dark ? { background: 'linear-gradient(150deg, #050b1a 0%, #0d1b36 60%, #0b3a34 100%)' } : undefined}
      >
        <div ref={host}>
          <Mascot size={112} mood={mood} holds={holds} still />
        </div>
        <span
          className={`font-display font-extrabold tracking-[-0.045em] leading-none ${
            dark ? 'text-white' : 'text-navy-deep'
          }`}
          style={{ fontSize: 28 }}
        >
          Ušetři<span className="text-brand">.</span>
        </span>
      </div>
      <span className="font-mono text-[10px] text-fg-muted">{label}</span>
      <button
        onClick={() => void run()}
        disabled={state === 'working'}
        className="flex items-center gap-1.5 rounded-lg bg-navy-deep/5 hover:bg-navy-deep/10 disabled:opacity-50 px-2.5 py-1 text-[10.5px] font-semibold text-navy-deep transition"
      >
        {state === 'done' ? <Check className="h-3 w-3 text-brand" /> : <Download className="h-3 w-3" />}
        {state === 'done' ? 'staženo' : `PNG ${size}`}
      </button>
    </div>
  )
}
