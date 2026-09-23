/**
 * The icon tier of the brand.
 *
 * The logo itself is the site's Ušetřík — `components/illustrations/Mascot.tsx`,
 * rendered with `still` — because that is the character people already know. This
 * file only adds what he cannot do: survive a 16px favicon. It is his head, drawn
 * to the same construction and cropped to fill the frame.
 */

const BRAND = '#00d99a'
const BRAND_LIGHT = '#7cf3ce'
const INK = '#050b1a'
const CYAN = '#4ec8ff'
const TONGUE = '#ff6b5e'

export type IconTone = 'color' | 'onDark' | 'mono'

function tones(tone: IconTone) {
  if (tone === 'mono') {
    return { body: 'currentColor', highlight: 'transparent', ink: '#ffffff', cyan: 'currentColor', tongue: 'transparent', blush: 'transparent' }
  }
  return {
    body: BRAND,
    highlight: BRAND_LIGHT,
    ink: INK,
    cyan: CYAN,
    tongue: TONGUE,
    blush: tone === 'onDark' ? 'rgba(0,0,0,0.16)' : 'rgba(5,11,26,0.09)',
  }
}

/**
 * Detail falls away as he shrinks: under 26px the mouth closes to a smile and the
 * catchlights go, because an open mouth turns into a smudge at favicon size.
 */
export function MascotIcon({
  size = 48,
  tone = 'color',
  className,
}: {
  size?: number
  tone?: IconTone
  className?: string
}) {
  const c = tones(tone)
  const small = size < 26
  const mid = size < 44

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      {!mid && (
        <path
          d="M103 13 L105.4 20.6 L113 23 L105.4 25.4 L103 33 L100.6 25.4 L93 23 L100.6 20.6 Z"
          fill={c.cyan}
        />
      )}

      <ellipse cx="58" cy="62" rx="56" ry="52" fill={c.body} />
      <ellipse cx="58" cy="39" rx="40" ry="24" fill={c.highlight} opacity="0.55" />

      {!small && (
        <>
          <ellipse cx="16" cy="76" rx="8.5" ry="5.2" fill={c.blush} />
          <ellipse cx="100" cy="76" rx="8.5" ry="5.2" fill={c.blush} />
        </>
      )}

      <circle cx="41" cy="59" r="10.2" fill={c.ink} />
      <circle cx="75" cy="59" r="10.2" fill={c.ink} />
      {!small && (
        <>
          <circle cx="37.8" cy="54.4" r="3.6" fill="#fff" />
          <circle cx="71.8" cy="54.4" r="3.6" fill="#fff" />
        </>
      )}

      {small ? (
        <path d="M43 78 q15 13 30 0" stroke={c.ink} strokeWidth="7.5" strokeLinecap="round" fill="none" />
      ) : (
        <>
          <path d="M41 76 q17 21 34 0 z" fill={c.ink} />
          <path d="M49.5 82 L66.5 82 C66.5 94.5 62.8 101 58 101 C53.2 101 49.5 94.5 49.5 82 Z" fill={c.tongue} />
        </>
      )}
    </svg>
  )
}
