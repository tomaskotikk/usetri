/**
 * Logo mark candidates for Ušetři. Each one is drawn on a 24x24 grid so it can
 * be dropped into a favicon, an app icon or a lockup without redrawing.
 *
 * `tone` swaps the palette rather than the geometry:
 *   color — navy body, brand-green accent, for light backgrounds
 *   light — white body, brand-green accent, for dark backgrounds
 *   mono  — one flat colour taken from `currentColor`, for stamps and embroidery
 */
export type MarkTone = 'color' | 'light' | 'mono'

export interface MarkProps {
  size?: number
  tone?: MarkTone
  className?: string
}

const NAVY = '#050b1a'
const BRAND = '#00d99a'

function palette(tone: MarkTone) {
  if (tone === 'mono') return { body: 'currentColor', accent: 'currentColor' }
  if (tone === 'light') return { body: '#ffffff', accent: BRAND }
  return { body: NAVY, accent: BRAND }
}

function frame(size: number, className?: string) {
  return { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', className, 'aria-hidden': true } as const
}

/**
 * A — Dělená mince. A coin cut into an unequal split: the large share and yours.
 * The acute above it is the diacritic from "Ušetři", used as a signature.
 */
export function MarkSplitCoin({ size = 24, tone = 'color', className }: MarkProps) {
  const { body, accent } = palette(tone)
  return (
    <svg {...frame(size, className)}>
      <path d="M13.3 4.594 A9 9 0 1 0 13.3 22.406 Z" fill={body} />
      <path d="M15 5.015 A9 9 0 0 1 15 21.985 Z" fill={accent} />
      <path d="M12.9 2.6 L16.1 0.7" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

/** B — Ú monogram. The wordmark's first letter, drawn as a single round stroke. */
export function MarkMonogram({ size = 24, tone = 'color', className }: MarkProps) {
  const { body, accent } = palette(tone)
  return (
    <svg {...frame(size, className)}>
      <path
        d="M5.4 7.2 V14 a6.6 6.6 0 0 0 13.2 0 V7.2"
        stroke={body}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M11.6 3.4 L15.4 1.2" stroke={accent} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

/** D — Sdílený prstenec. Four seats around one plan; the green arc is your share. */
export function MarkRing({ size = 24, tone = 'color', className }: MarkProps) {
  const { body, accent } = palette(tone)
  const r = 8.4
  const circumference = 2 * Math.PI * r
  const segment = circumference / 4 - 3.2
  return (
    <svg {...frame(size, className)}>
      <g transform="rotate(-90 12 12)">
        <circle
          cx="12"
          cy="12"
          r={r}
          stroke={body}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${segment} ${circumference / 4 - segment + 3.2}`}
          fill="none"
        />
        <circle
          cx="12"
          cy="12"
          r={r}
          stroke={accent}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${segment} ${circumference - segment}`}
          fill="none"
        />
      </g>
    </svg>
  )
}

/** Abstract alternatives, kept next to the mascot system for comparison. */
export const MARKS = [
  { id: 'A', name: 'Dělená mince', note: 'Podíl na jedné platbě. Čárka z „Ušetři" jako podpis.', Mark: MarkSplitCoin },
  { id: 'B', name: 'Ú monogram', note: 'Nejtěsnější vazba na wordmark. Nejlépe čitelné v 16 px.', Mark: MarkMonogram },
  { id: 'D', name: 'Sdílený prstenec', note: 'Čtyři místa v tarifu, zelený oblouk je tvůj podíl.', Mark: MarkRing },
] as const

/** The wordmark, as it already appears across the site and the app. */
export function Wordmark({
  size = 40,
  tone = 'color',
  className,
}: {
  size?: number
  tone?: MarkTone
  className?: string
}) {
  const color = tone === 'light' ? '#ffffff' : tone === 'mono' ? 'currentColor' : NAVY
  const dot = tone === 'mono' ? 'currentColor' : BRAND
  return (
    <span
      className={`font-display font-extrabold tracking-[-0.045em] leading-none ${className ?? ''}`}
      style={{ fontSize: size, color }}
    >
      Ušetři<span style={{ color: dot }}>.</span>
    </span>
  )
}
