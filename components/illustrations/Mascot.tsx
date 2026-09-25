'use client'
import { useEffect, useId, useState, useSyncExternalStore } from 'react'
import { jitter, playlist, poseById, type MascotHolds, type MascotMood } from '@/components/usetrilek/moods'
import { Puppet } from '@/components/usetrilek/Puppet'
import { GROUND, VIEW } from '@/components/usetrilek/rig'

export type { MascotMood }

/** Where his feet land inside the box, for standing him on a line with other art. */
export const FEET_RATIO = 101.5 / 120

/**
 * The puppet's artboard is the web drawing's 120-unit box, cropped a little shorter;
 * this lifts it so both stand on exactly the same feet, at exactly the same scale.
 */
const PUPPET_TOP = FEET_RATIO - (GROUND - VIEW.y) / VIEW.w

/** Below this he is an icon: no confetti or clouds round him, no shadow under him. */
const SMALL = 100

const reducedMotion = {
  subscribe(onChange: () => void) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  },
  get: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  server: () => false,
}

/**
 * Ušetřík — the wordmark's dot with a face, the same character the mobile app ships.
 * Live, he is the animated puppet (components/usetrilek) and works through a
 * playlist of poses that fits his mood; `still` gives the flat drawing for logo
 * sheets and exports, which read the <svg> back out.
 */
export function Mascot({
  size = 140,
  mood = 'idle',
  holds,
  tongue = false,
  still = false,
  className,
}: {
  size?: number
  mood?: MascotMood
  /** What he carries in his right hand. */
  holds?: MascotHolds
  tongue?: boolean
  /** Freezes him for logo sheets and exports, where a moving figure is wrong. */
  still?: boolean
  className?: string
}) {
  if (still) return <StaticMascot size={size} mood={mood} holds={holds} tongue={tongue} className={className} />
  return <LiveMascot size={size} mood={mood} holds={holds} tongue={tongue} className={className} />
}

function LiveMascot({
  size,
  mood,
  holds,
  tongue,
  className,
}: {
  size: number
  mood: MascotMood
  holds?: MascotHolds
  tongue: boolean
  className?: string
}) {
  const seed = useId()
  const calm = useSyncExternalStore(reducedMotion.subscribe, reducedMotion.get, reducedMotion.server)
  const list = playlist(mood, holds)
  const listKey = `${mood}+${holds ?? ''}`
  const [at, setAt] = useState({ list: listKey, step: 0 })
  const step = at.list === listKey ? at.step % list.length : 0

  // Onto the next pose when this one has played out. The first hold is stretched by
  // a per-figure amount, so a page full of him never changes pose all at once.
  useEffect(() => {
    if (calm || list.length < 2) return
    const ms = (list[step][1] + (step === 0 ? jitter(seed, 2.5) : 0)) * 1000
    const timer = setTimeout(() => setAt({ list: listKey, step: step + 1 }), ms)
    return () => clearTimeout(timer)
  }, [calm, list, listKey, step, seed])

  const def = poseById(list[step][0])
  const pose = tongue ? { ...def.pose, face: { ...def.pose.face, mouth: 'tongue' as const } } : def.pose
  const small = size < SMALL

  return (
    <div className={className} style={{ width: size, height: size }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div style={{ position: 'absolute', left: 0, top: PUPPET_TOP * size, width: size }}>
          <Puppet pose={pose} motion={def.motion} extras={small ? undefined : def.extras} seat={def.seat} shadow={!small} still={calm} />
        </div>
      </div>
    </div>
  )
}

// --- the flat drawing, for exports ------------------------------------------------------

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

/**
 * The drawing the puppet is built from, flat and still. Kept in step with
 * src/components/Mascot.tsx in the Expo project; change one and change the other.
 */
function StaticMascot({
  size,
  mood,
  holds,
  tongue,
  className,
}: {
  size: number
  mood: MascotMood
  holds?: MascotHolds
  tongue: boolean
  className?: string
}) {
  const eyesShut = mood === 'cheer' || mood === 'sleep'
  const lookUp = mood === 'think' ? -2.5 : 0

  const leftArm =
    mood === 'hang' ? 'M34 50 C30 38 30 28 33 20' : mood === 'cheer' ? 'M28 56 C17 48 14 36 18 28' : 'M27 62 C18 66 16 75 21 81'

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
  const font = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
        <path d={sparkle(99, 27, 9)} fill={CYAN} opacity={0.9} />
        <path d={sparkle(20, 41, 5.5)} fill={CYAN} opacity={0.55} />

        <ellipse cx={mood === 'hang' ? 48 : 45} cy={mood === 'hang' ? 97 : 95} rx={9.5} ry={6.5} fill={SKIN_DARK} />
        <ellipse cx={mood === 'hang' ? 72 : 75} cy={mood === 'hang' ? 97 : 95} rx={9.5} ry={6.5} fill={SKIN_DARK} />

        <path d={leftArm} {...arm} />
        <path d={rightArm} {...arm} />

        <ellipse cx={60} cy={58} rx={36} ry={33} fill={SKIN} />
        <ellipse cx={60} cy={43} rx={26} ry={16} fill={SKIN_LIGHT} opacity={0.55} />

        {eyesShut ? (
          <>
            <path d="M41 57 q6.5 -7 13 0" {...lid} />
            <path d="M66 57 q6.5 -7 13 0" {...lid} />
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
            <path d="M53.5 73 L66.5 73 C66.5 84 63.5 89.5 60 89.5 C56.5 89.5 53.5 84 53.5 73 Z" fill={TONGUE} />
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

        {holds === 'coin' && (
          <>
            <circle cx={99} cy={81} r={14} fill="#fff" stroke={INK} strokeWidth={2.6} />
            <text x={99} y={86} fontSize={12} fontWeight="bold" fill={INK} textAnchor="middle" fontFamily={font}>
              Kč
            </text>
          </>
        )}
        {holds === 'bag' && (
          <>
            <path d={BAG_NECK} fill="#fff" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
            <path d={BAG_BODY} fill="#fff" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
            {/* The cord that cinches the sack shut, drawn over both seams. */}
            <rect x={85} y={67} width={24} height={6.5} rx={3.25} fill={INK} />
            <text x={97} y={93} fontSize={12} fontWeight="bold" fill={INK} textAnchor="middle" fontFamily={font}>
              Kč
            </text>
          </>
        )}

        {mood === 'sleep' && (
          <>
            <text x={92} y={33} fontSize={13} fontWeight="bold" fill={CYAN}>
              z
            </text>
            <text x={100} y={21} fontSize={17} fontWeight="bold" fill={CYAN} opacity={0.8}>
              Z
            </text>
          </>
        )}

        {mood === 'think' && (
          <text x={24} y={32} fontSize={19} fontWeight="bold" fill={CYAN} textAnchor="middle">
            ?
          </text>
        )}
      </svg>
    </div>
  )
}
