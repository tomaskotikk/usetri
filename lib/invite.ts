import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { formatCzk } from './format'

/** What an invite link shows — to anyone who has it, signed in or not. */
export interface Invite {
  id: string
  service: { slug: string; name: string; plan: string; color: string; fullPrice: number }
  pricePerSeat: number
  seatsTotal: number
  seatsTaken: number
  closed: boolean
  /** First name only; null when the owner never filled one in. */
  ownerName: string | null
  ownerAvatar: string | null
}

export async function getInvite(supabase: SupabaseClient<Database>, id: string): Promise<Invite | null> {
  // A malformed id would make Postgres throw on the uuid cast; treat it as not found.
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null

  const { data } = await supabase.rpc('get_invite', { p_group: id })
  const row = data?.[0]
  if (!row) return null

  return {
    id: row.id,
    service: {
      slug: row.service_slug,
      name: row.service_name,
      plan: row.service_plan,
      color: row.service_color,
      fullPrice: row.full_price,
    },
    pricePerSeat: row.price_per_seat,
    seatsTotal: row.seats_total,
    seatsTaken: row.seats_taken,
    closed: row.closed,
    ownerName: row.owner_first_name,
    ownerAvatar: row.owner_avatar_url,
  }
}

export const freeSeats = (invite: Pick<Invite, 'seatsTotal' | 'seatsTaken'>) =>
  Math.max(0, invite.seatsTotal - invite.seatsTaken)

/** "Zbývá 1 místo" / "Zbývají 3 místa" / "Zbývá 5 míst" / "Obsazeno". */
export function seatsLeft(free: number) {
  if (free <= 0) return 'Obsazeno'
  if (free === 1) return 'Zbývá 1 místo'
  if (free < 5) return `Zbývají ${free} místa`
  return `Zbývá ${free} míst`
}

export function invitePath(groupId: string) {
  return `/pozvanka/${groupId}`
}

/** "Tomáš tě zve do skupiny Spotify" — the line both the page and the preview image lead with. */
export function inviteHeadline(invite: Pick<Invite, 'ownerName' | 'service'>) {
  return invite.ownerName
    ? `${invite.ownerName} tě zve do skupiny ${invite.service.name}`
    : `Pozvánka do skupiny ${invite.service.name}`
}

/** The message that goes out with the link from the share sheet. */
export function inviteMessage(serviceName: string, pricePerSeat: number, fullPrice: number) {
  return `Pojď se mnou do skupiny ${serviceName} přes Ušetři — ${formatCzk(pricePerSeat)} měsíčně místo ${formatCzk(fullPrice)}.`
}

/**
 * Where to send someone after signing in. Only same-site paths are honoured — a
 * bare "//host" would be a protocol-relative URL off our domain.
 */
export function safeNext(next: unknown, fallback = '/dashboard') {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : fallback
}
