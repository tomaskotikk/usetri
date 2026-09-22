import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import type { GlyphKey, Service } from '@/types/service'
import type { ProfileRow, ServiceRow } from '@/types/database'

const GLYPHS: GlyphKey[] = ['spotify', 'netflix', 'disney', 'youtube', 'adobe']

/** Adapts a catalogue row to the shape the landing-page components already speak. */
export function toService(row: ServiceRow): Service {
  return {
    slug: row.slug,
    name: row.name,
    plan: row.plan,
    category: row.category as Service['category'],
    color: row.color,
    fullPrice: row.full_price,
    seats: row.seats,
    openGroups: 0,
    glyph: GLYPHS.includes(row.glyph as GlyphKey) ? (row.glyph as GlyphKey) : undefined,
  }
}

export interface Offer {
  id: string
  service: Service
  owner: { id: string; name: string; avatar: string | null }
  seatsTotal: number
  seatsTaken: number
  pricePerSeat: number
  note: string | null
  closed: boolean
  createdAt: string
  /** Set from the viewer's own memberships. */
  role: 'owner' | 'member' | null
  /** Who already sits in the plan — drives the avatar stack on the card. */
  members: { id: string; name: string; avatar: string | null }[]
}

/** Shape Supabase returns for the embedded joins below. */
type OfferRow = {
  id: string
  service_slug: string
  owner_id: string
  seats_total: number
  seats_taken: number
  price_per_seat: number
  note: string | null
  closed: boolean
  created_at: string
  services: ServiceRow | null
  profiles: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'> | null
}

const OFFER_SELECT =
  'id, service_slug, owner_id, seats_total, seats_taken, price_per_seat, note, closed, created_at, services(*), profiles!groups_owner_id_fkey(id, full_name, avatar_url)'

function toOffer(row: OfferRow, roles: Map<string, 'owner' | 'member'>): Offer | null {
  if (!row.services) return null
  return {
    id: row.id,
    service: toService(row.services),
    owner: {
      id: row.owner_id,
      name: row.profiles?.full_name?.trim() || 'Anonymní člen',
      avatar: row.profiles?.avatar_url ?? null,
    },
    seatsTotal: row.seats_total,
    seatsTaken: row.seats_taken,
    pricePerSeat: row.price_per_seat,
    note: row.note,
    closed: row.closed,
    createdAt: row.created_at,
    role: roles.get(row.id) ?? null,
    members: [],
  }
}

/** One extra round trip fills the avatar stacks for a whole page of offers. */
async function attachMembers(supabase: Supabase, offers: Offer[]) {
  if (offers.length === 0) return offers

  const { data } = await supabase
    .from('group_members')
    .select('group_id, user_id, role, joined_at, profiles(id, full_name, avatar_url)')
    .in('group_id', offers.map((o) => o.id))
    .order('joined_at')
    .returns<
      {
        group_id: string
        user_id: string
        profiles: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'> | null
      }[]
    >()

  const byGroup = new Map<string, Offer['members']>()
  for (const row of data ?? []) {
    const list = byGroup.get(row.group_id) ?? []
    list.push({
      id: row.user_id,
      name: row.profiles?.full_name?.trim() || 'Anonymní člen',
      avatar: row.profiles?.avatar_url ?? null,
    })
    byGroup.set(row.group_id, list)
  }

  for (const offer of offers) offer.members = byGroup.get(offer.id) ?? []
  return offers
}

/** Every dashboard page starts here: it redirects guests to the sign-in form. */
export async function requireUser() {
  const supabase = createClient(await cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/prihlaseni')
  return { supabase, user }
}

type Supabase = Awaited<ReturnType<typeof requireUser>>['supabase']

/** group id → the viewer's role in it, for the "join" / "you're in" states. */
async function myRoles(supabase: Supabase, userId: string) {
  const { data } = await supabase.from('group_members').select('group_id, role').eq('user_id', userId)
  return new Map((data ?? []).map((m) => [m.group_id, m.role as 'owner' | 'member']))
}

export async function getOffers(
  supabase: Supabase,
  userId: string,
  opts: { category?: string; search?: string; onlyOpen?: boolean; limit?: number } = {},
): Promise<Offer[]> {
  const roles = await myRoles(supabase, userId)

  // An embedded filter needs an inner join, otherwise PostgREST keeps the row
  // and nulls the service out, burning rows from the limit.
  const select = opts.category ? OFFER_SELECT.replace('services(*)', 'services!inner(*)') : OFFER_SELECT

  let query = supabase
    .from('groups')
    .select(select)
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 60)

  if (opts.onlyOpen) query = query.eq('closed', false)
  if (opts.category) query = query.eq('services.category', opts.category)

  const { data } = await query.returns<OfferRow[]>()
  let offers = (data ?? []).map((row) => toOffer(row, roles)).filter((o): o is Offer => o !== null)

  if (opts.category) offers = offers.filter((o) => o.service.category === opts.category)

  const search = opts.search?.trim().toLowerCase()
  if (search) {
    offers = offers.filter((o) =>
      `${o.service.name} ${o.service.plan} ${o.owner.name}`.toLowerCase().includes(search),
    )
  }
  return attachMembers(supabase, offers)
}

/** Offers the viewer owns or has joined. */
export async function getMyOffers(supabase: Supabase, userId: string): Promise<Offer[]> {
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, role')
    .eq('user_id', userId)
  if (!memberships?.length) return []

  const roles = new Map(memberships.map((m) => [m.group_id, m.role as 'owner' | 'member']))
  const { data } = await supabase
    .from('groups')
    .select(OFFER_SELECT)
    .in('id', [...roles.keys()])
    .order('created_at', { ascending: false })
    .returns<OfferRow[]>()

  const offers = (data ?? []).map((row) => toOffer(row, roles)).filter((o): o is Offer => o !== null)
  return attachMembers(supabase, offers)
}

export async function getOffer(supabase: Supabase, userId: string, id: string): Promise<Offer | null> {
  const roles = await myRoles(supabase, userId)
  const { data } = await supabase.from('groups').select(OFFER_SELECT).eq('id', id).maybeSingle<OfferRow>()
  return data ? toOffer(data, roles) : null
}

export async function getMembers(supabase: Supabase, groupId: string) {
  const { data } = await supabase
    .from('group_members')
    .select('id, role, joined_at, user_id, profiles(id, full_name, avatar_url)')
    .eq('group_id', groupId)
    .order('joined_at')
    .returns<
      {
        id: string
        role: string
        joined_at: string
        user_id: string
        profiles: Pick<ProfileRow, 'id' | 'full_name' | 'avatar_url'> | null
      }[]
    >()

  return (data ?? []).map((m) => ({
    id: m.id,
    userId: m.user_id,
    role: m.role as 'owner' | 'member',
    joinedAt: m.joined_at,
    name: m.profiles?.full_name?.trim() || 'Anonymní člen',
    avatar: m.profiles?.avatar_url ?? null,
  }))
}

export async function getCatalogue(supabase: Supabase): Promise<Service[]> {
  const { data } = await supabase.from('services').select('*').order('name')
  return (data ?? []).map(toService)
}

/** What the viewer pays and saves each month across the groups they're in. */
export function summarise(offers: Offer[]) {
  const joined = offers.filter((o) => o.role !== null)
  const monthly = joined.reduce((sum, o) => sum + o.pricePerSeat, 0)
  const alone = joined.reduce((sum, o) => sum + o.service.fullPrice, 0)
  const owned = offers.filter((o) => o.role === 'owner')
  return {
    groups: joined.length,
    monthly,
    saved: Math.max(0, alone - monthly),
    savedPercent: alone > 0 ? Math.round((1 - monthly / alone) * 100) : 0,
    owned: owned.length,
    freeSeats: owned.reduce((sum, o) => sum + Math.max(0, o.seatsTotal - o.seatsTaken), 0),
  }
}
