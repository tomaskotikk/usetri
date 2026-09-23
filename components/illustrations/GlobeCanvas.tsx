'use client'

import { useEffect, useMemo, useRef } from 'react'
import { buildGlobe, drawGlobe } from './globeRender'

/**
 * The landing page's globe: the shared renderer, plus idle spin and drag-to-turn.
 * The geometry and painting live in globeRender.ts so the banner export can draw
 * the same sphere without a component.
 */
export function GlobeCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  // 0.5 rad puts the Atlantic front-and-centre: Americas left, Europe/Africa right
  const rotationRef = useRef(0.5)
  const velocityRef = useRef(0)
  const draggingRef = useRef(false)
  const lastXRef = useRef(0)

  const points = useMemo(() => buildGlobe(), [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let dpr = 1

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }
    resize()

    const observer = new ResizeObserver(resize)
    observer.observe(wrap)

    const onPointerDown = (e: PointerEvent) => {
      draggingRef.current = true
      lastXRef.current = e.clientX
      canvas.setPointerCapture(e.pointerId)
      canvas.style.cursor = 'grabbing'
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return
      const dx = e.clientX - lastXRef.current
      lastXRef.current = e.clientX
      rotationRef.current += dx * 0.006
      velocityRef.current = dx * 0.006
    }
    const onPointerUp = (e: PointerEvent) => {
      draggingRef.current = false
      canvas.releasePointerCapture?.(e.pointerId)
      canvas.style.cursor = 'grab'
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    canvas.style.cursor = 'grab'

    let raf = 0
    let last = performance.now()

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      if (!draggingRef.current) {
        velocityRef.current *= 0.94
        const idle = reduceMotion ? 0 : 0.055
        rotationRef.current += (idle + velocityRef.current * 12) * dt
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      drawGlobe(ctx, points, {
        cx: width / 2,
        cy: height / 2,
        r: Math.min(width, height) * 0.37,
        rotation: rotationRef.current,
        pulse: (Math.sin(now / 700) + 1) / 2,
      })

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [points])

  return (
    <div ref={wrapRef} className={className}>
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none select-none"
        aria-label="Interaktivní glóbus — tažením myší jím otočíš"
        role="img"
      />
    </div>
  )
}
