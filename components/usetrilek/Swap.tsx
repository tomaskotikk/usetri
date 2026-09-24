'use client'
import { useEffectEvent, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import styles from './usetrilek.module.css'

type Layer = { id: string; node: ReactNode; leaving: boolean; fresh: boolean }

/**
 * Crossfades whatever is inside when `id` changes — a hand shape, a mouth, a prop.
 * The old content stays until it has faded, so nothing ever blinks out of existence.
 */
export function Swap({
  id,
  children,
  delay = 0,
  dur = 160,
  appear = false,
  pop = false,
  full = false,
}: {
  id: string
  children: ReactNode
  delay?: number
  dur?: number
  /** Fade in on first mount too, not only on changes. */
  appear?: boolean
  /** Grow in from a little smaller, springing past full size. */
  pop?: boolean
  /** The layer covers its parent (for stage-positioned art) rather than sitting at its origin. */
  full?: boolean
}) {
  const [layers, setLayers] = useState<Layer[]>(() => [{ id, node: children, leaving: false, fresh: appear }])
  const [current, setCurrent] = useState(id)

  if (current !== id) {
    setCurrent(id)
    setLayers((ls) => [
      ...ls.filter((l) => l.id !== id).map((l) => ({ ...l, leaving: true })),
      { id, node: children, leaving: false, fresh: true },
    ])
  }

  return layers.map((l) => (
    <SwapLayer
      key={l.id}
      leaving={l.leaving}
      fadeIn={l.fresh}
      delay={delay}
      dur={dur}
      pop={pop}
      full={full}
      onGone={() => setLayers((ls) => ls.filter((x) => !(x.id === l.id && x.leaving)))}
    >
      {l.id === id ? children : l.node}
    </SwapLayer>
  ))
}

function SwapLayer({
  leaving,
  fadeIn,
  delay,
  dur,
  pop,
  full,
  onGone,
  children,
}: {
  leaving: boolean
  fadeIn: boolean
  delay: number
  dur: number
  pop: boolean
  full: boolean
  onGone: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const gone = useEffectEvent(onGone)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !fadeIn) return
    const frames = pop
      ? [
          { opacity: 0, transform: 'scale(0.6)' },
          { opacity: 1, transform: 'scale(1.08)', offset: 0.6 },
          { opacity: 1, transform: 'scale(1)' },
        ]
      : [{ opacity: 0 }, { opacity: 1 }]
    const a = el.animate(frames, { duration: pop ? dur * 1.8 : dur, delay, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'backwards' })
    return () => a.cancel()
  }, [fadeIn, pop, dur, delay])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !leaving) return
    const a = el.animate(pop ? [{ opacity: 1 }, { opacity: 0, transform: 'scale(0.8)' }] : [{ opacity: 1 }, { opacity: 0 }], {
      duration: dur * 0.8,
      delay: delay * 0.5,
      easing: 'ease-in',
      fill: 'forwards',
    })
    a.onfinish = () => gone()
    return () => a.cancel()
  }, [leaving, pop, dur, delay])

  return (
    <div ref={ref} className={full ? styles.full : styles.pt}>
      {children}
    </div>
  )
}
