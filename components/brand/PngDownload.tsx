'use client'

import { useRef, useState } from 'react'
import { Check, Download } from 'lucide-react'

/**
 * Rasterises whatever SVG it wraps and hands it to the browser as a PNG.
 *
 * The SVG is cloned before export so the copy can carry its own width, height and
 * resolved `currentColor` — the live one on the page must keep inheriting those.
 */
async function svgToPng(svg: SVGSVGElement, size: number, filename: string, background?: string) {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(size))
  clone.setAttribute('height', String(size))
  // `currentColor` resolves against the live element's inherited colour, which a
  // detached clone no longer has — so pin it before serialising.
  clone.style.color = window.getComputedStyle(svg).color

  const source = new XMLSerializer().serializeToString(clone)
  const svgUrl = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }))

  try {
    const image = new Image()
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('SVG se nepodařilo vykreslit'))
      image.src = svgUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas není dostupné')
    if (background) {
      ctx.fillStyle = background
      ctx.fillRect(0, 0, size, size)
    }
    ctx.drawImage(image, 0, 0, size, size)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('PNG se nepodařilo vytvořit')

    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = filename
    link.click()
    URL.revokeObjectURL(href)
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}

export function PngDownload({
  filename,
  label,
  size = 1024,
  background,
  children,
}: {
  /** Without the extension — the size is appended, so files stay self-describing. */
  filename: string
  label: string
  size?: number
  /** Leave unset for a transparent PNG. */
  background?: string
  children: React.ReactNode
}) {
  const host = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'working' | 'done'>('idle')

  const run = async () => {
    const svg = host.current?.querySelector('svg')
    if (!svg) return
    setState('working')
    try {
      await svgToPng(svg, size, `${filename}-${size}.png`, background)
      setState('done')
      window.setTimeout(() => setState('idle'), 1600)
    } catch {
      setState('idle')
    }
  }

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div ref={host}>{children}</div>
      <span className="font-mono text-[10px] text-fg-muted">{label}</span>
      <button
        onClick={run}
        disabled={state === 'working'}
        className="flex items-center gap-1.5 rounded-lg bg-navy-deep/5 hover:bg-navy-deep/10 disabled:opacity-50 px-2.5 py-1 text-[10.5px] font-semibold text-navy-deep transition"
      >
        {state === 'done' ? <Check className="h-3 w-3 text-brand" /> : <Download className="h-3 w-3" />}
        {state === 'done' ? 'staženo' : `PNG ${size}`}
      </button>
    </div>
  )
}
