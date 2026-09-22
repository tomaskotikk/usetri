'use client'
import Image from 'next/image'
import Link from 'next/link'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion'
import { ArrowRight, Hand, ShieldCheck, Star } from 'lucide-react'
import { Backdrop } from './Backdrop'
import { GlobeCanvas } from './illustrations/GlobeCanvas'
import { PhoneMockup } from './illustrations/PhoneMockup'
import { providerMeta } from './illustrations/BrandGlyphs'
import { services } from '@/types/service'

const EASE = [0.16, 1, 0.3, 1] as const

const stack: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.35 } },
}

const riseIn: Variants = {
  hidden: { opacity: 0, y: 34, filter: 'blur(12px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.3, ease: EASE },
  },
}

const railServices = [
  providerMeta.spotify,
  providerMeta.netflix,
  providerMeta.disney,
  providerMeta.youtube,
  providerMeta.adobe,
]

const faces = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
]

export function Hero() {
  const reduceMotion = useReducedMotion()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 70, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 70, damping: 20 })
  const phoneRotateY = useTransform(springX, [-0.5, 0.5], [9, -9])
  const phoneRotateX = useTransform(springY, [-0.5, 0.5], [-7, 7])

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const entrance = reduceMotion ? false : 'hidden'

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0)
        mouseY.set(0)
      }}
      className="relative isolate overflow-hidden min-h-screen flex items-center pt-28 pb-32 px-4 text-white"
      style={{ perspective: 2200 }}
    >
      <Backdrop variant="dark" />

      {/* interactive globe, anchored behind the phone */}
      {/* opacity only — scaling the wrapper would resize the canvas backing store */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.6, delay: 0.15, ease: 'easeOut' }}
        className="absolute -right-[7%] -top-[5%] h-[900px] w-[900px] hidden lg:block"
      >
        <GlobeCanvas className="h-full w-full" />
      </motion.div>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2.6, delay: 0.15, ease: 'easeOut' }}
        className="absolute -right-[32%] top-[52%] h-[560px] w-[560px] lg:hidden"
      >
        <GlobeCanvas className="h-full w-full" />
      </motion.div>

      <div className="mx-auto w-full max-w-6xl grid lg:grid-cols-[1.05fr_auto] gap-14 lg:gap-8 items-center relative">
        <motion.div
          variants={stack}
          initial={entrance}
          animate="show"
          className="relative z-10"
        >
          <motion.div
            variants={riseIn}
            className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium text-white/80 mb-7"
          >
            <ShieldCheck className="h-4 w-4 text-brand" />
            Oficiální rodinné plány — žádné triky
          </motion.div>

          <h1 className="font-display font-extrabold text-[clamp(3.4rem,7.4vw,6rem)] leading-[0.92] tracking-[-0.035em]">
            <motion.span variants={riseIn} className="block">
              Plať jen
            </motion.span>
            <motion.span variants={riseIn} className="block">
              svůj podíl.
            </motion.span>
            <motion.span variants={riseIn} className="block text-shimmer">
              Ne celé.
            </motion.span>
          </h1>

          <motion.div variants={riseIn} className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/nova"
              className="group inline-flex h-14 items-center gap-1 rounded-2xl bg-brand px-7 text-base font-semibold text-brand-foreground transition-colors hover:bg-brand-soft"
            >
              Nabídnout místo
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard/nabidky"
              className="inline-flex h-14 items-center rounded-2xl border border-white/20 bg-white/5 px-7 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              Najít skupinu
            </Link>
          </motion.div>

          <motion.div variants={riseIn} className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {faces.map((src, i) => (
                <div key={i} className="relative h-10 w-10 rounded-full ring-2 ring-navy-deep overflow-hidden">
                  <Image src={src} alt="" fill className="object-cover" />
                </div>
              ))}
              <div className="h-10 w-10 rounded-full ring-2 ring-navy-deep bg-brand text-brand-foreground grid place-items-center text-[11px] font-bold font-mono">
                +2k
              </div>
            </div>
            <div>
              <div className="flex gap-0.5 text-brand">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-[13px] sm:text-sm text-white/60 mt-0.5 max-w-[22ch] sm:max-w-none">
                2 400+ lidí už si rozdělilo předplatné
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 64, scale: 0.9, filter: 'blur(14px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          transition={{ delay: 0.55, duration: 1.7, ease: EASE }}
          style={{ rotateX: phoneRotateX, rotateY: phoneRotateY }}
          className="relative z-10 justify-self-center lg:justify-self-end"
        >
          {/* halo so the phone separates from the globe behind it */}
          <div className="absolute -inset-16 rounded-full bg-navy-deep/45 blur-3xl -z-10" />
          <div className="animate-float">
            <PhoneMockup />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 1.2, ease: EASE }}
        className="absolute bottom-0 inset-x-0 border-t border-white/10 bg-white/[0.03] backdrop-blur-sm"
      >
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center gap-6 md:gap-10">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/35 shrink-0 hidden sm:block">
            Funguje s
          </span>
          <div className="flex items-center gap-7 md:gap-10 flex-1 overflow-hidden">
            {railServices.map(({ Glyph, name }, i) => (
              <motion.span
                key={name}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.1 + i * 0.09, duration: 0.8, ease: EASE }}
                className="flex items-center gap-2.5 text-white/45 hover:text-white/80 transition-colors shrink-0"
              >
                <Glyph className="h-[18px] w-[18px]" />
                <span className="text-sm font-medium whitespace-nowrap hidden md:inline">{name}</span>
              </motion.span>
            ))}
            <span className="text-sm text-white/30 whitespace-nowrap hidden lg:inline">
              a dalších {services.length - railServices.length}
            </span>
          </div>

          <span className="hidden lg:flex items-center gap-2 text-xs text-white/30 shrink-0">
            <Hand className="h-3.5 w-3.5" />
            chytni glóbus a zatoč s ním
          </span>
        </div>
      </motion.div>
    </section>
  )
}
