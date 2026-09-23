'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FEET_RATIO, Mascot } from '../illustrations/Mascot'
import { Wordmark } from '../brand/marks'
import { AdPhone } from './AdPhone'
import { beats, type Beat } from './beats'

export type AdFormat = '16:9' | '9:16'

export const CANVAS: Record<AdFormat, { w: number; h: number }> = {
  '16:9': { w: 1920, h: 1080 },
  '9:16': { w: 1080, h: 1920 },
}

const ease = [0.16, 1, 0.3, 1] as const
/** Slow in, slow out. The push into the phone has to feel like a camera move. */
const glide = [0.62, 0, 0.26, 1] as const

const PHONE_SCALE: Record<AdFormat, number> = { '16:9': 1.46, '9:16': 1.8 }
const MASCOT_SIZE: Record<AdFormat, number> = { '16:9': 350, '9:16': 280 }
/** Copy hangs from a fixed line instead of centring, so headlines stop jumping between beats. */
const COPY_TOP: Record<AdFormat, number> = { '16:9': 214, '9:16': 30 }

/** Authored geometry of the phone, needed to work out where it sits and how far to push. */
const SHELL = { w: 292, h: 624 }
const SCREEN = { w: 268, h: 600 }
/** The band the portrait layout gives the phone. */
const PORTRAIT_PHONE = { top: 30, height: 1180 }

const DARK = 'linear-gradient(155deg, #050b1a 0%, #0d1b36 52%, #0b3a34 100%)'

/** Where the phone's shell centre lands on the canvas, in canvas pixels. */
function shellCentre(format: AdFormat) {
  const canvas = CANVAS[format]
  const x =
    format === '16:9'
      ? canvas.w * (1.05 / 2) + canvas.w * (0.95 / 2) / 2
      : canvas.w / 2
  const y = format === '16:9' ? canvas.h / 2 : PORTRAIT_PHONE.top + PORTRAIT_PHONE.height / 2
  return { x, y }
}

/** How far the phone has to grow before its screen alone covers the frame. */
function outroZoom(format: AdFormat) {
  const canvas = CANVAS[format]
  return Math.max(canvas.w / SCREEN.w, canvas.h / SCREEN.h) * 1.06
}

/** White, but not flat — a grid, a brand bloom and grain give the frame depth. */
function Backdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-grid-light" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 72% 45%, rgba(0,217,154,0.16) 0%, rgba(0,217,154,0) 68%),' +
            'radial-gradient(45% 40% at 18% 78%, rgba(78,200,255,0.12) 0%, rgba(78,200,255,0) 70%)',
        }}
      />
      <div className="absolute inset-0 grain" />
    </>
  )
}

function Headline({ beat, index, format }: { beat: Beat; index: number; format: AdFormat }) {
  const wide = format === '16:9'
  const headSize = wide ? 'text-[92px] leading-[0.98]' : 'text-[78px] leading-[1.02]'
  const subSize = wide ? 'text-[28px]' : 'text-[29px]'

  return (
    <motion.div key={index} className={wide ? 'max-w-[800px]' : 'max-w-[700px]'}>
      {beat.kicker && (
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease }}
          className={`flex items-center gap-3 ${wide ? 'mb-6' : 'mb-4'}`}
        >
          <span className="h-[3px] w-10 rounded-full bg-brand" />
          <span className={`font-semibold uppercase tracking-[0.2em] text-brand ${wide ? 'text-[20px]' : 'text-[19px]'}`}>
            {beat.kicker}
          </span>
        </motion.div>
      )}

      <h2 className={`font-display font-extrabold text-navy-deep tracking-[-0.042em] ${headSize}`}>
        {beat.head.map((token, i) => (
          <span key={`${token.t}-${i}`} className="inline-block overflow-hidden align-bottom pb-[0.08em] mr-[0.26em]">
            <motion.span
              className={`inline-block ${token.hl ? 'text-brand' : ''}`}
              initial={{ y: '112%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ delay: 0.12 + i * 0.055, duration: 0.72, ease }}
            >
              {token.t}
            </motion.span>
          </span>
        ))}
      </h2>

      {beat.sub && (
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 + beat.head.length * 0.055 + 0.1, duration: 0.7, ease }}
          className={`text-fg-muted leading-relaxed ${subSize} ${wide ? 'mt-7' : 'mt-5'}`}
        >
          {beat.sub}
        </motion.p>
      )}
    </motion.div>
  )
}

/**
 * The end card. The phone is still flying at the camera underneath this; because it
 * carries the same gradient, the card fading in over it reads as the screen itself
 * arriving rather than as a cut. What is left is the wordmark and Ušetřík.
 */
function Outro({ format }: { format: AdFormat }) {
  const wide = format === '16:9'

  return (
    <>
      <motion.div
        className="absolute inset-0 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.95, ease: 'linear' }}
        style={{ background: DARK }}
      >
        <div className="absolute inset-0 bg-grid-dark" />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(52% 46% at 50% 38%, rgba(0,217,154,0.22) 0%, rgba(0,217,154,0) 72%)' }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 z-50 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.45, duration: 0.95, ease }}
      >
        <Mascot
          size={wide ? 300 : 340}
          mood="cheer"
          holds="coin"
          className="drop-shadow-[0_30px_50px_rgba(0,0,0,0.45)]"
        />
        <div className="text-center" style={{ marginTop: wide ? 6 : 16 }}>
          <Wordmark size={wide ? 132 : 118} tone="light" />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.05, duration: 0.7, ease }}
            className={`text-white/55 mt-6 ${wide ? 'text-[30px]' : 'text-[28px]'}`}
          >
            usetri.app
          </motion.p>
        </div>
      </motion.div>
    </>
  )
}

/** Six pills that fill as the loop runs, so a viewer can feel the length. */
function BeatTrack({ index, progress }: { index: number; progress: number }) {
  return (
    <div className="flex gap-2.5">
      {beats.map((b, i) => (
        <div key={i} className="h-[5px] rounded-full bg-navy-deep/10 overflow-hidden" style={{ width: b.ms / 28 }}>
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%' }}
          />
        </div>
      ))}
    </div>
  )
}

export function AdScene({ index, progress, format }: { index: number; progress: number; format: AdFormat }) {
  const beat = beats[index]
  const canvas = CANVAS[format]
  const wide = format === '16:9'
  const isOutro = beat.screen === 'brand'

  // On the last beat the whole handset — frame and all — flies at the camera until
  // its screen is the frame. Everything else about the phone stays put.
  const centre = shellCentre(format)
  const phone = (
    <motion.div
      initial={{ scale: PHONE_SCALE[format], x: 0, y: 0 }}
      animate={
        isOutro
          ? { scale: outroZoom(format), x: canvas.w / 2 - centre.x, y: canvas.h / 2 - centre.y }
          : { scale: PHONE_SCALE[format], x: 0, y: 0 }
      }
      transition={isOutro ? { duration: 2.6, ease: glide } : { duration: 0 }}
      className="origin-center"
    >
      <motion.div
        animate={{ y: isOutro ? 0 : [0, -18, 0] }}
        transition={isOutro ? { duration: 0.5, ease } : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <AdPhone screen={beat.screen} />
      </motion.div>
    </motion.div>
  )

  const mascot = (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${beat.mood}-${beat.holds ?? 'free'}`}
        initial={{ opacity: 0, y: 26, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16, scale: 0.94 }}
        transition={{ duration: 0.45, ease }}
      >
        <Mascot size={MASCOT_SIZE[format]} mood={beat.mood} holds={beat.holds} />
      </motion.div>
    </AnimatePresence>
  )

  /** Stands his feet on the same line the phone bottoms out on. */
  const phoneBottom = centre.y + (SHELL.h * PHONE_SCALE[format]) / 2
  const mascotBottom = canvas.h - phoneBottom + MASCOT_SIZE[format] * (FEET_RATIO - 1)

  if (wide) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <Backdrop />

        <div className="relative h-full grid grid-cols-[1.05fr_0.95fr] items-center">
          <div className="pl-[120px] pr-10 h-full" style={{ paddingTop: COPY_TOP['16:9'] }}>
            <AnimatePresence mode="wait">
              {!isOutro && <Headline key={index} beat={beat} index={index} format={format} />}
            </AnimatePresence>
          </div>

          <div className="relative h-full grid place-items-center">
            <div
              className="absolute h-[660px] w-[660px] rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(0,217,154,0.22) 0%, rgba(0,217,154,0) 70%)' }}
            />
            {phone}
          </div>
        </div>

        {!isOutro && (
          <>
            <div
              className="absolute left-[104px] z-30 drop-shadow-[0_26px_44px_rgba(5,11,26,0.16)]"
              style={{ bottom: mascotBottom }}
            >
              {mascot}
            </div>
            <div className="absolute bottom-[54px] left-1/2 -translate-x-1/2">
              <BeatTrack index={index} progress={progress} />
            </div>
          </>
        )}

        <AnimatePresence>{isOutro && <Outro key="outro" format={format} />}</AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Backdrop />

      <div className="relative h-full flex flex-col items-center" style={{ paddingTop: PORTRAIT_PHONE.top }}>
        <div className="relative grid place-items-center w-full" style={{ height: PORTRAIT_PHONE.height }}>
          <div
            className="absolute h-[820px] w-[820px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(0,217,154,0.22) 0%, rgba(0,217,154,0) 70%)' }}
          />
          {phone}
        </div>

        <div className="w-full px-[70px] flex flex-col items-start" style={{ paddingTop: COPY_TOP['9:16'] }}>
          <AnimatePresence mode="wait">
            {!isOutro && <Headline key={index} beat={beat} index={index} format={format} />}
          </AnimatePresence>
        </div>
      </div>

      {!isOutro && (
        <>
          <div className="absolute right-[8px] bottom-[70px] z-30 drop-shadow-[0_24px_40px_rgba(5,11,26,0.16)]">
            {mascot}
          </div>
          <div className="absolute left-[70px] bottom-[30px]">
            <BeatTrack index={index} progress={progress} />
          </div>
        </>
      )}

      <AnimatePresence>{isOutro && <Outro key="outro" format={format} />}</AnimatePresence>
    </div>
  )
}
