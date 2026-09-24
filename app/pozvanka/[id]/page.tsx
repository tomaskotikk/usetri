import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ArrowRight, QrCode, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { Wordmark } from '@/components/brand/marks'
import { Avatar } from '@/components/dashboard/Sidebar'
import { BrandGlyph, hasGlyph } from '@/components/illustrations/BrandGlyph'
import { InviteJoinButton } from '@/components/invite/InviteJoinButton'
import { freeSeats, getInvite, inviteHeadline, invitePath, seatsLeft } from '@/lib/invite'
import { formatCzk } from '@/lib/format'
import { createClient } from '@/utils/supabase/server'

// One lookup for both the metadata and the page.
const loadInvite = cache(async (id: string) => getInvite(createClient(await cookies()), id))

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const invite = await loadInvite(id)
  if (!invite) return { title: 'Pozvánka', robots: { index: false } }

  const title = inviteHeadline(invite)
  const description = `${formatCzk(invite.pricePerSeat)} měsíčně místo ${formatCzk(invite.service.fullPrice)}. ${seatsLeft(freeSeats(invite))}.`
  return {
    title,
    description,
    // Private links: they travel by message, not by search.
    robots: { index: false, follow: false },
    openGraph: { title, description, type: 'website' },
  }
}

export default async function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invite = await loadInvite(id)
  if (!invite) notFound()

  const supabase = createClient(await cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: membership } = user
    ? await supabase.from('group_members').select('role').eq('group_id', id).eq('user_id', user.id).maybeSingle()
    : { data: null }

  const free = freeSeats(invite)
  const saving = invite.service.fullPrice - invite.pricePerSeat
  const color = invite.service.color
  const next = encodeURIComponent(invitePath(id))
  const unavailable = invite.closed ? 'Zakladatel právě nepřijímá nové členy.' : free === 0 ? 'Všechna místa jsou obsazená.' : null

  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center overflow-hidden px-4 pb-12 pt-8 text-white sm:pt-12">
      <div
        className="absolute inset-0 -z-20"
        style={{ background: 'radial-gradient(120% 90% at 50% 0%, #16294f 0%, #0b1730 45%, #050b1a 100%)' }}
      />
      <div
        className="absolute left-1/2 top-24 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: `color-mix(in srgb, ${color} 38%, transparent)` }}
      />
      <div className="absolute inset-0 -z-10 grain" />

      <Link href="/" aria-label="Ušetři — domů">
        <Wordmark size={26} tone="light" />
      </Link>

      <section className="mt-8 w-full max-w-[440px] rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] backdrop-blur-md sm:p-8">
        <div className="flex items-center gap-3">
          <Avatar name={invite.ownerName ?? 'Ušetři'} src={invite.ownerAvatar} className="h-10 w-10 ring-2 ring-white/15" />
          <p className="text-[15px] text-white/75">
            {invite.ownerName ? (
              <>
                <span className="font-semibold text-white">{invite.ownerName}</span> tě zve do skupiny
              </>
            ) : (
              'Pozvánka do skupiny'
            )}
          </p>
        </div>

        <div className="mt-7 flex items-center gap-4">
          <div
            className="grid h-20 w-20 shrink-0 place-items-center rounded-[26px] border"
            style={{
              backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
              color,
            }}
          >
            {hasGlyph(invite.service.slug) ? (
              <BrandGlyph slug={invite.service.slug} className="h-11 w-11" />
            ) : (
              <span className="font-display text-3xl font-extrabold">{invite.service.name.slice(0, 2)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-[34px] font-extrabold leading-none tracking-[-0.03em]">
              {invite.service.name}
            </h1>
            <p className="mt-1.5 text-[15px] text-white/60">{invite.service.plan}</p>
          </div>
        </div>

        <div className="mt-7 rounded-3xl bg-white/[0.06] p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-[46px] font-extrabold leading-none tracking-[-0.04em]">
                {formatCzk(invite.pricePerSeat)}
              </p>
              <p className="mt-1.5 text-[13px] text-white/55">
                měsíčně místo <span className="line-through">{formatCzk(invite.service.fullPrice)}</span>
              </p>
            </div>
            {saving > 0 && (
              <span className="rounded-full bg-brand/20 px-3 py-1 text-[13px] font-bold text-brand">
                ušetříš {formatCzk(saving)}
              </span>
            )}
          </div>

          <div className="mt-5 flex items-center gap-2.5 border-t border-white/10 pt-4">
            <span className="flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: invite.seatsTotal }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-5 rounded-full ${i < invite.seatsTaken ? 'bg-brand' : 'bg-white/20'}`}
                />
              ))}
            </span>
            <span className="text-[13px] text-white/70">
              {seatsLeft(free)}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {membership ? (
            <Link
              href={`/dashboard/nabidky/${id}`}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-[16px] font-bold text-brand-foreground transition-colors hover:bg-brand-soft"
            >
              Už jsi ve skupině — otevřít <ArrowRight className="h-5 w-5" />
            </Link>
          ) : unavailable ? (
            <>
              <p className="rounded-2xl bg-white/[0.08] px-4 py-3.5 text-center text-[14px] text-white/75">
                {unavailable}
              </p>
              <Link
                href={user ? '/dashboard/nabidky' : '/predplatna'}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Najít jinou skupinu <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : user ? (
            <InviteJoinButton groupId={id} />
          ) : (
            <>
              <Link
                href={`/registrace?next=${next}`}
                className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-[16px] font-bold text-brand-foreground transition-colors hover:bg-brand-soft"
              >
                <UserPlus className="h-5 w-5" /> Přidat se do skupiny
              </Link>
              <p className="text-center text-[14px] text-white/60">
                Už máš účet?{' '}
                <Link href={`/prihlaseni?next=${next}`} className="font-semibold text-white underline-offset-4 hover:underline">
                  Přihlas se
                </Link>
              </p>
            </>
          )}
        </div>
      </section>

      <ol className="mt-8 grid w-full max-w-[440px] gap-3 text-[14px] text-white/70">
        {[
          { icon: Users, text: 'Přidáš se do skupiny — zabere to minutu.' },
          { icon: QrCode, text: 'Zaplatíš svůj podíl QR platbou přímo zakladateli.' },
          { icon: ShieldCheck, text: 'Ušetři peníze nedrží, jen hlídá, kdo má zaplaceno.' },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.07]">
              <Icon className="h-4 w-4 text-brand" />
            </span>
            {text}
          </li>
        ))}
      </ol>
    </main>
  )
}
