import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/**
 * The home-screen icon on iOS, which cannot be an SVG and cannot be transparent —
 * iOS squares it off and fills the gaps itself. So the mascot gets the brand's
 * navy behind him, and the whole thing is rasterised at build time.
 */
const MASCOT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <ellipse cx="60" cy="60" rx="56" ry="52" fill="#00d99a"/>
  <ellipse cx="60" cy="37" rx="40" ry="24" fill="#7cf3ce" opacity="0.55"/>
  <circle cx="43" cy="57" r="10.2" fill="#050b1a"/>
  <circle cx="77" cy="57" r="10.2" fill="#050b1a"/>
  <circle cx="39.8" cy="52.4" r="3.6" fill="#ffffff"/>
  <circle cx="73.8" cy="52.4" r="3.6" fill="#ffffff"/>
  <path d="M45 76 q15 13 30 0" stroke="#050b1a" stroke-width="7.5" stroke-linecap="round" fill="none"/>
</svg>`

export default function AppleIcon() {
  const src = `data:image/svg+xml;base64,${Buffer.from(MASCOT).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(150deg, #0d1b36 0%, #0b3a34 100%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={132} height={132} alt="" />
      </div>
    ),
    size,
  )
}
