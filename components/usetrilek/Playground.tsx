'use client'
import { useEffect, useId, useState } from 'react'
import * as art from './art'
import { useDrift } from './extras'
import { CYAN } from './palette'
import { POSES, type PoseDef } from './poses'
import { Puppet } from './Puppet'
import { Shapes } from './ShapeSvg'
import { group } from './shapes'
import { GROUND, VIEW } from './rig'

const AUTO_MS = 3800

/** The stage is 720 × 540; he is drawn this wide on it, feet on FLOOR. */
const STAGE_W = 720
const STAGE_H = 540
const FLOOR = 506
const PUPPET_W = 400
const SCALE = PUPPET_W / VIEW.w
const PUPPET_LEFT = STAGE_W / 2 - (150 - VIEW.x) * SCALE
const PUPPET_TOP = FLOOR - (GROUND - VIEW.y) * SCALE

/** The subscriptions piled up behind him. x, bottom y, size, rotation, colour, slug. */
const TOWER: [number, number, number, number, string, string][] = [
  [620, 508, 108, 0, '#e50914', 'netflix-premium'],
  [612, 398, 92, -6, '#1db954', 'spotify-family'],
  [626, 302, 78, 5, '#ff0033', 'youtube-premium'],
  [616, 220, 60, -9, '#0063e5', 'disney-plus'],
  [96, 508, 88, 3, '#7b2bf9', 'hbo-max'],
  [104, 420, 64, -8, '#fa243c', 'apple-music'],
  [30, 508, 50, -12, '#58cc02', 'duolingo'],
]

/** Coins and sparkles drifting over the stage. x, y, size, duration, delay. */
const FLOATERS: { kind: 'coin' | 'spark'; x: number; y: number; r: number; dur: number; delay: number }[] = [
  { kind: 'coin', x: 90, y: 200, r: 20, dur: 3.2, delay: 0 },
  { kind: 'coin', x: 650, y: 110, r: 15, dur: 2.7, delay: 1 },
  { kind: 'coin', x: 250, y: 96, r: 11, dur: 3.6, delay: 2 },
  { kind: 'spark', x: 480, y: 64, r: 12, dur: 2.4, delay: 0 },
  { kind: 'spark', x: 40, y: 300, r: 9, dur: 2.2, delay: 0.8 },
  { kind: 'spark', x: 690, y: 340, r: 8, dur: 2.6, delay: 1.4 },
]

const pctX = (x: number) => `${(x / STAGE_W) * 100}%`
const pctY = (y: number) => `${(y / STAGE_H) * 100}%`

/** A coin or a sparkle drifting over the stage, on the compositor. */
function Floater({ uid, kind, x, y, r, dur, delay }: { uid: string } & (typeof FLOATERS)[number]) {
  const ref = useDrift(kind === 'coin' ? { kind: 'float', dur, delay, amp: -22 } : { kind: 'twinkle', dur, delay })
  const box = r * 2.4
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: `calc(${pctX(x)} - ${(box / STAGE_W) * 50}%)`,
        top: `calc(${pctY(y)} - ${(box / STAGE_H) * 50}%)`,
        width: pctX(box),
        height: pctY(box),
      }}
    >
      <svg viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`} className="h-full w-full overflow-visible" aria-hidden="true">
        <Shapes uid={uid} local={`${uid}l`} shapes={kind === 'coin' ? art.coin(r) : art.sparkle(r, CYAN)} />
      </svg>
    </div>
  )
}

function Scenery() {
  const uid = `sc${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <>
      <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id={`${uid}-floor`}>
            <stop offset="0" stopColor="#051a14" stopOpacity="0.14" />
            <stop offset="1" stopColor="#051a14" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={360} cy={512} rx={330} ry={30} fill={`url(#${uid}-floor)`} />
        <Shapes
          uid={uid}
          local={`${uid}t`}
          shapes={TOWER.map(([x, bottom, size, rot, colour, slug]) =>
            group(art.block(size, colour, slug), `translate(${x} ${bottom - size / 2}) rotate(${rot})`),
          )}
        />
      </svg>
      {FLOATERS.map((f, i) => (
        <Floater key={i} uid={`${uid}f${i}`} {...f} />
      ))}
    </>
  )
}

/**
 * The hero stage: Ušetřík in front of a pile of subscriptions. It walks through
 * the pose library on its own until someone picks a pose; every change is the
 * puppet's own spring, nothing re-drawn frame by frame.
 */
export function Playground() {
  const [current, setCurrent] = useState<PoseDef>(POSES[0])
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    const timer = setInterval(() => {
      setCurrent((c) => POSES[(POSES.findIndex((d) => d.id === c.id) + 1) % POSES.length])
    }, AUTO_MS)
    return () => clearInterval(timer)
  }, [auto])

  const pick = (def: PoseDef) => {
    setAuto(false)
    setCurrent(def)
  }
  const next = () => pick(POSES[(POSES.findIndex((d) => d.id === current.id) + 1) % POSES.length])

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[36px] bg-[radial-gradient(120%_100%_at_50%_0%,#ffffff_0%,#ecf7ff_55%,#d6ecff_100%)]">
        <div className="absolute inset-x-0 bottom-0 h-[18%] bg-[linear-gradient(180deg,transparent,rgba(5,11,26,0.05))]" />
        <Scenery />
        <button
          type="button"
          onClick={next}
          aria-label={`Ušetřík — ${current.name}. Další póza`}
          className="absolute cursor-pointer rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-brand/40"
          style={{ left: pctX(PUPPET_LEFT), top: pctY(PUPPET_TOP), width: pctX(PUPPET_W) }}
        >
          <Puppet pose={current.pose} motion={current.motion} extras={current.extras} seat={current.seat} />
        </button>
        <p className="absolute left-4 top-4 max-w-[calc(100%-2rem)] truncate rounded-full bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-navy-deep sm:left-5 sm:top-5">
          {current.name} <span className="font-normal text-fg-muted">· {current.use}</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Pózy">
        {POSES.map((def) => (
          <button
            key={def.id}
            type="button"
            onClick={() => pick(def)}
            aria-pressed={def.id === current.id}
            className={`h-9 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
              def.id === current.id ? 'bg-navy-deep text-white' : 'bg-white text-navy-deep hover:bg-[#dff8ee]'
            }`}
          >
            {def.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAuto((v) => !v)}
          className="h-9 rounded-full border border-navy-deep/15 px-3.5 text-[13px] font-semibold text-fg-muted hover:text-navy-deep"
        >
          {auto ? 'Zastavit přehrávání' : 'Přehrávat samo'}
        </button>
      </div>
    </div>
  )
}
