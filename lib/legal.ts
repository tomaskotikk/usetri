/**
 * Everything the legal pages say about who runs Ušetři, in one place.
 *
 * Unfilled values render as a loud placeholder rather than an empty string, so a
 * missing IČO is impossible to ship by accident. Terms of use without a named
 * operator are not enforceable — and Google requires them before it lets an OAuth
 * app out of testing.
 */
export const OPERATOR = {
  name: 'Tomáš Kotík',
  /** Živnostenský list zatím nevyřízený — doplnit po přidělení IČO. */
  ico: null as string | null,
  address: null as string | null,
  email: 'podpora@usetri.app',
  site: 'usetri.app',
}

/** Marks a value the operator still has to supply. */
export const missing = (label: string) => `[DOPLNIT: ${label}]`

export const LEGAL_UPDATED = '23. září 2026'

/** Third parties that touch personal data, for the privacy notice. */
export const PROCESSORS = [
  {
    name: 'Supabase',
    role: 'databáze, účty a přihlašování',
    place: 'EU (Irsko)',
    url: 'https://supabase.com/privacy',
  },
  {
    name: 'Vercel',
    role: 'provoz webu a aplikace',
    place: 'EU s přenosem do USA',
    url: 'https://vercel.com/legal/privacy-policy',
  },
  {
    name: 'Resend',
    role: 'odesílání e-mailů',
    place: 'EU s přenosem do USA',
    url: 'https://resend.com/legal/privacy-policy',
  },
  {
    name: 'Google',
    role: 'přihlášení přes účet Google, pokud ho použiješ',
    place: 'EU s přenosem do USA',
    url: 'https://policies.google.com/privacy',
  },
]

export const LEGAL_PAGES = [
  { href: '/podminky', label: 'Podmínky použití' },
  { href: '/ochrana-osobnich-udaju', label: 'Ochrana osobních údajů' },
  { href: '/bezpecnost', label: 'Bezpečnost a platby' },
]
