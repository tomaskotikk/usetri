import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { glyphDataUri } from '@/components/illustrations/glyphSvg'
import { freeSeats, getInvite, seatsLeft } from '@/lib/invite'
import { formatCzk } from '@/lib/format'

export const alt = 'Pozvánka do skupiny na Ušetři'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * The site's own fonts, subset to the characters on the card. Loaded from Google
 * Fonts at render time because the bundled default has no Czech glyphs worth
 * showing; a failed fetch just falls back to it.
 */
async function loadFont(family: string, weight: number, text: string) {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`,
      )
    ).text()
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1]
    return url ? await (await fetch(url)).arrayBuffer() : null
  } catch {
    return null
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // No cookies here: the crawler fetching a preview is never signed in.
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
  const invite = await getInvite(supabase, id)

  const color = invite?.service.color ?? '#00d99a'
  const glyph = invite ? glyphDataUri(invite.service.slug, color, 120) : null
  const free = invite ? freeSeats(invite) : 0

  const lead = invite?.ownerName ? `${invite.ownerName} tě zve do skupiny` : 'Pozvánka do skupiny'
  const name = invite?.service.name ?? 'Ušetři'
  const plan = invite?.service.plan ?? 'Sdílej předplatné, plať jen svůj podíl.'
  const price = invite ? formatCzk(invite.pricePerSeat) : ''
  const full = invite ? formatCzk(invite.service.fullPrice) : ''
  const seats = invite ? seatsLeft(free) : ''

  const text = `Ušetři.${lead}${name}${plan}${price}${full}${seats} / měsíc místo`
  const [display, sans] = await Promise.all([
    loadFont('Bricolage Grotesque', 800, text),
    loadFont('Plus Jakarta Sans', 600, text),
  ])
  const fonts = [
    ...(display ? [{ name: 'Display', data: display, weight: 800 as const, style: 'normal' as const }] : []),
    ...(sans ? [{ name: 'Sans', data: sans, weight: 600 as const, style: 'normal' as const }] : []),
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          color: '#fff',
          fontFamily: 'Sans',
          background: 'radial-gradient(120% 120% at 85% 0%, #16294f 0%, #0b1730 45%, #050b1a 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -120,
            top: -160,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background: color,
            opacity: 0.28,
            filter: 'blur(120px)',
          }}
        />

        <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 44, letterSpacing: -1.5 }}>
          Ušetři<span style={{ color: '#00d99a' }}>.</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${color}2e`,
              border: `3px solid ${color}66`,
            }}
          >
            {glyph ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={glyph} width={120} height={120} alt="" />
            ) : (
              <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 80, color }}>{name.slice(0, 2)}</div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 34, color: 'rgba(255,255,255,0.7)' }}>{lead}</div>
            <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 104, lineHeight: 1, letterSpacing: -4, marginTop: 8 }}>
              {name}
            </div>
            <div style={{ display: 'flex', fontSize: 32, color: 'rgba(255,255,255,0.6)', marginTop: 14 }}>{plan}</div>
          </div>
        </div>

        {invite ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
              <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 84, letterSpacing: -3 }}>{price}</div>
              <div style={{ display: 'flex', fontSize: 32, color: 'rgba(255,255,255,0.6)' }}>/ měsíc</div>
              <div style={{ display: 'flex', gap: 10, fontSize: 32, color: 'rgba(255,255,255,0.45)' }}>
                místo <span style={{ textDecoration: 'line-through' }}>{full}</span>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 32,
                color: '#00251a',
                background: '#00d99a',
                borderRadius: 9999,
                padding: '14px 30px',
              }}
            >
              {seats}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex' }} />
        )}
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  )
}
