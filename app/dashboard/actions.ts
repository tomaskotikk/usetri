'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export type ActionState = { error?: string } | null

async function client() {
  const supabase = createClient(await cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/prihlaseni')
  return { supabase, user }
}

function refresh() {
  revalidatePath('/dashboard', 'layout')
}

export async function createOffer(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await client()

  const serviceSlug = String(formData.get('service') ?? '')
  const seatsTotal = Number(formData.get('seats'))
  const pricePerSeat = Number(formData.get('price'))
  const note = String(formData.get('note') ?? '').trim()

  if (!serviceSlug) return { error: 'Vyber službu, kterou chceš sdílet.' }
  if (!Number.isInteger(seatsTotal) || seatsTotal < 2 || seatsTotal > 12)
    return { error: 'Počet míst musí být mezi 2 a 12.' }
  if (!Number.isInteger(pricePerSeat) || pricePerSeat < 1 || pricePerSeat > 5000)
    return { error: 'Cena za místo musí být mezi 1 a 5 000 Kč.' }
  if (note.length > 400) return { error: 'Poznámka může mít nejvýš 400 znaků.' }

  const { data, error } = await supabase
    .from('groups')
    .insert({
      service_slug: serviceSlug,
      owner_id: user.id,
      seats_total: seatsTotal,
      price_per_seat: pricePerSeat,
      note: note || null,
    })
    .select('id')
    .single()

  if (error || !data) return { error: 'Nabídku se nepodařilo založit. Zkus to prosím znovu.' }

  refresh()
  redirect(`/dashboard/nabidky/${data.id}`)
}

export async function joinOffer(groupId: string): Promise<ActionState> {
  const { supabase, user } = await client()
  const { error } = await supabase.from('group_members').insert({ group_id: groupId, user_id: user.id })

  if (error) {
    // The capacity trigger raises these before the row lands.
    if (error.message.includes('plná')) return { error: 'Skupina je mezitím plná.' }
    if (error.message.includes('uzavřená')) return { error: 'Tahle nabídka je uzavřená.' }
    if (error.code === '23505') return { error: 'V téhle skupině už jsi.' }
    return { error: 'Přidání se nepovedlo. Zkus to prosím znovu.' }
  }

  refresh()
  return null
}

export async function leaveOffer(groupId: string): Promise<ActionState> {
  const { supabase, user } = await client()
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .eq('role', 'member')

  if (error) return { error: 'Odchod se nepovedl. Zkus to prosím znovu.' }
  refresh()
  return null
}

export async function setOfferClosed(groupId: string, closed: boolean): Promise<ActionState> {
  const { supabase, user } = await client()
  const { error } = await supabase
    .from('groups')
    .update({ closed })
    .eq('id', groupId)
    .eq('owner_id', user.id)

  if (error) return { error: 'Změna se nepovedla. Zkus to prosím znovu.' }
  refresh()
  return null
}

export async function deleteOffer(groupId: string): Promise<ActionState> {
  const { supabase, user } = await client()
  const { error } = await supabase.from('groups').delete().eq('id', groupId).eq('owner_id', user.id)
  if (error) return { error: 'Smazání se nepovedlo. Zkus to prosím znovu.' }

  refresh()
  redirect('/dashboard/moje')
}

/** Owners can free up a seat taken by someone else. */
export async function removeMember(groupId: string, userId: string): Promise<ActionState> {
  const { supabase, user } = await client()
  const { data: group } = await supabase.from('groups').select('owner_id').eq('id', groupId).single()
  if (group?.owner_id !== user.id) return { error: 'Tohle může udělat jen zakladatel skupiny.' }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .eq('role', 'member')

  if (error) return { error: 'Odebrání se nepovedlo.' }
  refresh()
  return null
}
