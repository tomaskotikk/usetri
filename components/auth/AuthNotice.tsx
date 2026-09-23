'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Mascot } from '@/components/illustrations/Mascot'

const EASE = [0.16, 1, 0.3, 1] as const

/** The "now go and check your inbox" screen, shared by sign-up and password reset. */
export function AuthNotice({ title, message, hint }: { title: string; message: string; hint?: string }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="text-center"
    >
      <div className="mx-auto mb-2 w-fit">
        <Mascot size={104} mood="cheer" />
      </div>
      <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-navy-deep">{title}</h1>
      <p className="mt-3 text-fg-muted">{message}</p>
      {hint && <p className="mt-2 text-sm text-fg-muted/80">{hint}</p>}

      <Link
        href="/prihlaseni"
        className="mt-8 inline-block text-sm font-semibold text-navy-deep underline-offset-4 hover:underline"
      >
        Zpět na přihlášení
      </Link>
    </motion.div>
  )
}

/** One error style for every auth form. */
export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
      {children}
    </p>
  )
}
