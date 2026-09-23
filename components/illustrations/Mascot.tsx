'use client'
import { motion, useReducedMotion } from 'framer-motion'

export type MascotMood = 'idle' | 'wave' | 'cheer' | 'search' | 'sleep' | 'hang' | 'think'

/** Where his feet land inside the box, for standing him on a line with other art. */
export const FEET_RATIO = 101.5 / 120

/** Body tones derived from the brand green, so the mascot reads as the logo's dot. */
const SKIN = '#00d99a'
const SKIN_DARK = '#00b885'
const SKIN_LIGHT = '#7cf3ce'
const INK = '#050b1a'
const CYAN = '#4ec8ff'
const TONGUE = '#ff6b5e'

/** Pear-shaped with a flat, heavy base — a circle here just reads as a coin. */
const BAG_NECK = 'M90 59 C93 55 101 55 104 59 L107 70 L87 70 Z'
const BAG_BODY =
  'M92 71 C88 78 80 84 80.5 90 C81 96.5 88 100.5 97 100.5 C106 100.5 113 96.5 113.5 90 C114 84 106 78 102 71 Z'

/** A four-point sparkle, drawn from its centre. */
function sparkle(x: number, y: number, r: number) {
  const w = r * 0.22
  return (
    `M${x} ${y - r} C${x + w} ${y - w} ${x + w} ${y - w} ${x + r} ${y} ` +
    `C${x + w} ${y + w} ${x + w} ${y + w} ${x} ${y + r} ` +
    `C${x - w} ${y + w} ${x - w} ${y + w} ${x - r} ${y} ` +
    `C${x - w} ${y - w} ${x - w} ${y - w} ${x} ${y - r} Z`
  )
}

const loop = (duration: number, delay = 0) => ({
  duration,
  delay,
  repeat: Infinity,
  ease: 'easeInOut' as const,
})

/**
 * Ušetřík — the same character the mobile app ships, redrawn with plain SVG so the
 * website can use him too. Geometry, moods and timings are kept in step with
 * src/components/Mascot.tsx in the Expo project; change one and change the other.
 */
export function Mascot({
  size = 140,
  mood = 'idle',
  holds,
  tongue = false,
  still: stillProp = false,
  className,
}: {
  size?: number
  mood?: MascotMood
  /** What he carries in his right hand. The arm reaches for it either way. */
  holds?: 'coin' | 'bag'
  tongue?: boolean
  /** Freezes him for logo sheets and exports, where a breathing SVG is wrong. */
  still?: boolean
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const still = Boolean(reduceMotion) || Boolean(stillProp)

  const eyesShut = mood === 'cheer' || mood === 'sleep'
  const lookUp = mood === 'think' ? -2.5 : 0
  const scanning = mood === 'search' && !still

  const leftArm =
    mood === 'hang'
      ? 'M34 50 C30 38 30 28 33 20'
      : mood === 'cheer'
        ? 'M28 56 C17 48 14 36 18 28'
        : 'M27 62 C18 66 16 75 21 81'

  const rightArm = holds
    ? 'M92 62 C98 66 100 70 99 73'
    : mood === 'hang'
      ? 'M86 50 C90 38 90 28 87 20'
      : mood === 'cheer'
        ? 'M92 56 C103 48 106 36 102 28'
        : mood === 'wave'
          ? 'M93 58 C104 50 108 38 105 29'
          : 'M93 62 C102 66 104 75 99 81'

  const arm = { stroke: SKIN_DARK, strokeWidth: 9, strokeLinecap: 'round' as const, fill: 'none' }
  const lid = { stroke: INK, strokeWidth: 3.4, strokeLinecap: 'round' as const, fill: 'none' }

  // Eyes sweep right, hold, sweep back — a search, not a twitch.
  const scanKeys = { cx: [-2.5, 3.5, 3.5, -2.5, -2.5] }
  const scanTiming = { duration: 3.8, times: [0, 0.24, 0.37, 0.61, 1], repeat: Infinity, ease: 'easeInOut' as const }
  const eye = (base: number) => ({
    animate: { cx: scanKeys.cx.map((d) => base + d) },
    transition: scanTiming,
  })

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={still ? undefined : { y: [0, -6, 0] }}
      transition={loop(mood === 'sleep' ? 5.2 : 3.4)}
    >
      {/* A hop lives on its own layer so it can stack with the breathing above it. */}
      <motion.div
        animate={still || mood !== 'cheer' ? undefined : { y: [0, -12, 0, 0], scaleY: [1, 1.05, 1, 1] }}
        transition={{ duration: 1.6, times: [0, 0.19, 0.42, 1], repeat: Infinity, ease: 'easeOut' }}
      >
        <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
          <motion.path
            d={sparkle(99, 27, 9)}
            fill={CYAN}
            animate={still ? { opacity: 0.9 } : { opacity: [0.9, 0.35, 0.9] }}
            transition={loop(mood === 'cheer' ? 1.24 : 2.8)}
          />
          <motion.path
            d={sparkle(20, 41, 5.5)}
            fill={CYAN}
            animate={still ? { opacity: 0.55 } : { opacity: [0.55, 0.2, 0.55] }}
            transition={loop(3.4)}
          />

          <ellipse cx={mood === 'hang' ? 48 : 45} cy={mood === 'hang' ? 97 : 95} rx={9.5} ry={6.5} fill={SKIN_DARK} />
          <ellipse cx={mood === 'hang' ? 72 : 75} cy={mood === 'hang' ? 97 : 95} rx={9.5} ry={6.5} fill={SKIN_DARK} />

          <path d={leftArm} {...arm} />

          {mood === 'wave' && !holds && !still ? (
            <motion.path
              d={rightArm}
              {...arm}
              style={{ transformBox: 'view-box', transformOrigin: '93px 58px' }}
              animate={{ rotate: [-16, 14, -16] }}
              transition={loop(1.12)}
            />
          ) : (
            <path d={rightArm} {...arm} />
          )}

          <ellipse cx={60} cy={58} rx={36} ry={33} fill={SKIN} />
          <ellipse cx={60} cy={43} rx={26} ry={16} fill={SKIN_LIGHT} opacity={0.55} />

          {eyesShut ? (
            <>
              <path d="M41 57 q6.5 -7 13 0" {...lid} />
              <path d="M66 57 q6.5 -7 13 0" {...lid} />
            </>
          ) : scanning ? (
            <>
              <motion.circle cy={56} r={6.5} fill={INK} {...eye(47)} />
              <motion.circle cy={56} r={6.5} fill={INK} {...eye(73)} />
              <motion.circle cy={53.5} r={2.3} fill="#fff" {...eye(45)} />
              <motion.circle cy={53.5} r={2.3} fill="#fff" {...eye(71)} />
            </>
          ) : (
            <>
              <circle cx={47} cy={56 + lookUp} r={6.5} fill={INK} />
              <circle cx={73} cy={56 + lookUp} r={6.5} fill={INK} />
              <circle cx={45} cy={53.5 + lookUp} r={2.3} fill="#fff" />
              <circle cx={71} cy={53.5 + lookUp} r={2.3} fill="#fff" />
            </>
          )}

          <ellipse cx={35} cy={67} rx={5.5} ry={3.4} fill={INK} opacity={0.09} />
          <ellipse cx={85} cy={67} rx={5.5} ry={3.4} fill={INK} opacity={0.09} />

          {tongue ? (
            <>
              <path d="M47 68 q13 18 26 0 z" fill={INK} />
              <path
                d="M53.5 73 L66.5 73 C66.5 84 63.5 89.5 60 89.5 C56.5 89.5 53.5 84 53.5 73 Z"
                fill={TONGUE}
              />
              <path d="M60 79 v6" stroke="#d8483d" strokeWidth={1.6} strokeLinecap="round" />
            </>
          ) : mood === 'cheer' ? (
            <path d="M50 70 q10 14 20 0 z" fill={INK} />
          ) : mood === 'search' ? (
            <ellipse cx={60} cy={73} rx={4} ry={5} fill={INK} />
          ) : mood === 'sleep' ? (
            <path d="M54 74 h12" {...lid} />
          ) : mood === 'think' ? (
            <path d="M53 73 q7 4 14 -1" stroke={INK} strokeWidth={3.4} strokeLinecap="round" fill="none" />
          ) : (
            <path d="M50 71 q10 9 20 0" stroke={INK} strokeWidth={3.6} strokeLinecap="round" fill="none" />
          )}

          {holds && (
            <motion.g
              animate={still ? undefined : { y: [0, -3, 0] }}
              transition={loop(2.6)}
            >
              {holds === 'coin' ? (
                <>
                  <circle cx={99} cy={81} r={14} fill="#fff" stroke={INK} strokeWidth={2.6} />
                  <text x={99} y={86} fontSize={12} fontWeight="bold" fill={INK} textAnchor="middle" fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
                    Kč
                  </text>
                </>
              ) : (
                <>
                  <path d={BAG_NECK} fill="#fff" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
                  <path d={BAG_BODY} fill="#fff" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
                  {/* The cord that cinches the sack shut, drawn over both seams. */}
                  <rect x={85} y={67} width={24} height={6.5} rx={3.25} fill={INK} />
                  <text x={97} y={93} fontSize={12} fontWeight="bold" fill={INK} textAnchor="middle" fontFamily="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
                    Kč
                  </text>
                </>
              )}
            </motion.g>
          )}

          {mood === 'sleep' && (
            <>
              <motion.text
                x={92}
                fontSize={13}
                fontWeight="bold"
                fill={CYAN}
                animate={still ? { y: 33, opacity: 1 } : { y: [33, 23], opacity: [1, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              >
                z
              </motion.text>
              <motion.text
                x={100}
                fontSize={17}
                fontWeight="bold"
                fill={CYAN}
                animate={still ? { y: 21, opacity: 0.8 } : { y: [21, 9], opacity: [0.8, 0] }}
                transition={{ duration: 2.4, delay: 0.3, repeat: Infinity, ease: 'easeOut' }}
              >
                Z
              </motion.text>
            </>
          )}

          {mood === 'think' && (
            <text x={24} y={32} fontSize={19} fontWeight="bold" fill={CYAN} textAnchor="middle">
              ?
            </text>
          )}
        </svg>
      </motion.div>
    </motion.div>
  )
}
