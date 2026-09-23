'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Mascot, type MascotMood } from '@/components/illustrations/Mascot'

/** The same curve the showcase beside it animates on. */
const EASE = [0.16, 1, 0.3, 1] as const

/**
 * The shared shape of every auth screen: Ušetřík, a heading, a subtitle, then the
 * form. Keeping it in one place is what stops the four screens drifting apart.
 */
export function AuthPanel({
  mood,
  title,
  subtitle,
  children,
}: {
  mood: MascotMood
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  const reduce = useReducedMotion()
  const enter = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.8, ease: EASE },
  })

  return (
    <div>
      <motion.div {...enter(0)} className="mb-5 -ml-3">
        <Mascot size={76} mood={mood} />
      </motion.div>

      <motion.h1
        {...enter(0.08)}
        className="font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.03em] text-navy-deep"
      >
        {title}
      </motion.h1>
      <motion.p {...enter(0.14)} className="mt-2 text-fg-muted">
        {subtitle}
      </motion.p>

      <motion.div {...enter(0.2)}>{children}</motion.div>
    </div>
  )
}
