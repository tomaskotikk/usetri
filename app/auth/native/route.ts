import type { NextRequest } from 'next/server'

// The phone cannot use its own deep link as the Supabase redirect: Supabase drops
// any redirect URL whose host is a bare IP, which is all Expo Go ever produces.
// So Supabase returns here instead — an allow-listed https origin — and this hands
// the result on to the app. Only the app's own schemes are accepted as targets,
// and the PKCE code is worthless without the verifier the app kept to itself.
const APP_SCHEMES = ['usetri://', 'exp://']

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const next = searchParams.get('next')

  if (!next || !APP_SCHEMES.some((scheme) => next.startsWith(scheme))) {
    return new Response('Neplatná návratová adresa.', { status: 400 })
  }

  // Everything Supabase appended (code, or error details) travels on untouched.
  const result = new URLSearchParams(searchParams)
  result.delete('next')

  const query = result.toString()
  const target = query ? `${next}${next.includes('?') ? '&' : '?'}${query}` : next

  // Not NextResponse.redirect — it only accepts http(s) URLs. A fragment on the
  // incoming URL rides along by itself: browsers re-attach it when the Location
  // header carries none, so implicit-flow tokens reach the app too.
  return new Response(null, { status: 303, headers: { Location: target } })
}
