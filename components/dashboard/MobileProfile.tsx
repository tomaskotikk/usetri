'use client'
import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, CircleHelp, CreditCard, FileText, Loader2, LogOut, Pencil, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { logout } from '@/app/auth/actions'
import { updateProfileName, type ActionState } from '@/app/dashboard/actions'
import { PayoutAccountForm } from './PayoutAccountForm'
import { formatCzk } from '@/lib/format'

/**
 * The profile on phones — a copy of the Expo app's ProfileScreen
 * (usetri-mobile/src/screens/ProfileScreen.tsx) at its own sizes, so the website
 * and the app are the same product in the hand. The app's bottom sheets become
 * sections that open in place.
 */
export function MobileProfile({
  name,
  email,
  avatar,
  stats,
  account,
}: {
  name: string
  email: string
  avatar: string | null
  stats: { groups: number; monthly: number; saved: number }
  account: string | null
}) {
  const [editingName, setEditingName] = useState(false)
  const [editingAccount, setEditingAccount] = useState(false)
  const [nameState, saveName, savingName] = useActionState<ActionState, FormData>(async (previous, form) => {
    const result = await updateProfileName(previous, form)
    if (result?.ok) {
      toast.success('Jméno je uložené.')
      setEditingName(false)
    }
    return result
  }, null)

  const initials =
    (name || email)
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'

  return (
    <div className="-mx-5 -mt-6 pt-[calc(env(safe-area-inset-top)+12px)] sm:-mx-8">
      <h1 className="px-5 pb-3.5 font-display text-[30px] font-extrabold tracking-[-1.2px] text-navy-deep">
        Profil
      </h1>

      <section className="mx-5 flex items-center gap-3.5 rounded-[24px] border border-border bg-white p-[15px]">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-[52px] w-[52px] rounded-[18px] object-cover" />
        ) : (
          <span className="grid h-[52px] w-[52px] place-items-center rounded-[18px] bg-navy-deep text-lg font-extrabold text-white">
            {initials}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17.5px] font-extrabold tracking-[-0.4px] text-navy-deep">
            {name || 'Bez jména'}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-fg-muted">{email}</p>
        </div>
        <button
          type="button"
          onClick={() => setEditingName((v) => !v)}
          aria-label="Upravit jméno"
          aria-expanded={editingName}
          className="grid h-9 w-9 place-items-center rounded-[14px] border border-border text-navy-deep active:scale-90"
        >
          <Pencil className="h-[15px] w-[15px]" />
        </button>
      </section>

      {editingName && (
        <form action={saveName} className="mx-5 mt-3 space-y-3 rounded-[24px] border border-border bg-white p-[15px]">
          <label className="block text-[13px] font-semibold text-navy-deep" htmlFor="profile-name">
            Jméno
          </label>
          <input
            id="profile-name"
            name="name"
            defaultValue={name}
            autoComplete="name"
            autoCapitalize="words"
            placeholder="Tomáš Kotík"
            className="h-12 w-full rounded-xl border border-border bg-white px-4 text-[15px] text-navy-deep outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
          {nameState?.error && (
            <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {nameState.error}
            </p>
          )}
          <button
            type="submit"
            disabled={savingName}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-brand-foreground disabled:opacity-60"
          >
            {savingName && <Loader2 className="h-4 w-4 animate-spin" />} Uložit
          </button>
        </form>
      )}

      <section className="mx-5 mt-3 flex items-center rounded-[24px] border border-border bg-white py-[15px]">
        <Stat label="Skupiny" value={String(stats.groups)} />
        <span className="h-7 w-px bg-border" />
        <Stat label="Měsíčně" value={formatCzk(stats.monthly)} />
        <span className="h-7 w-px bg-border" />
        <Stat label="Ušetřeno" value={formatCzk(stats.saved)} />
      </section>

      <Group title="Výplatní účet">
        <Row
          icon={CreditCard}
          label={account ?? 'Doplnit číslo účtu'}
          hint="Sem ti členové tvých skupin posílají peníze."
          onClick={() => setEditingAccount((v) => !v)}
          open={editingAccount}
        />
        {editingAccount && (
          <div className="space-y-3 border-t border-border p-[15px]">
            <p className="text-[13.5px] leading-[19px] text-fg-muted">
              Vidí ho každý, kdo se přidá do některé z tvých skupin; ostatní uživatelé ho nevidí.
            </p>
            <PayoutAccountForm current={account ?? undefined} />
          </div>
        )}
      </Group>

      <Group title="Nastavení">
        <Row icon={CircleHelp} label="Jak to funguje" href="/#jak-to-funguje" />
        <Row icon={FileText} label="Podmínky použití" href="/podminky" divided />
        <Row icon={Shield} label="Ochrana osobních údajů" href="/ochrana-osobnich-udaju" divided />
      </Group>

      <Group title="Účet">
        <form
          action={logout}
          onSubmit={(e) => {
            if (!window.confirm('Odhlásit se? Budeš se muset znovu přihlásit.')) e.preventDefault()
          }}
        >
          <button type="submit" className="w-full text-left">
            <RowBody icon={LogOut} label="Odhlásit se" danger />
          </button>
        </form>
      </Group>

      <p className="mt-[26px] px-[34px] text-center text-xs leading-[18px] text-fg-muted">
        Peníze posíláš napřímo zakladateli skupiny. Ušetři je nedrží — jen hlídá, co je zaplacené.
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <p className="text-[16.5px] font-extrabold tracking-[-0.4px] text-navy-deep">{value}</p>
      <p className="mt-[3px] text-[11px] text-fg-muted">{label}</p>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-[26px] space-y-2.5 px-5">
      <h2 className="text-[11px] font-bold uppercase tracking-[1.2px] text-fg-muted">{title}</h2>
      <div className="overflow-hidden rounded-[24px] border border-border bg-white">{children}</div>
    </section>
  )
}

type Icon = typeof CreditCard

function RowBody({
  icon: Icon,
  label,
  hint,
  danger = false,
  chevron = false,
  open = false,
}: {
  icon: Icon
  label: string
  hint?: string
  danger?: boolean
  chevron?: boolean
  open?: boolean
}) {
  return (
    <span className="flex items-center gap-[13px] px-[15px] py-[13px]">
      <span
        className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] ${danger ? 'bg-[#fdeceb]' : 'bg-surface'}`}
      >
        <Icon className={`h-4 w-4 ${danger ? 'text-[#d63b2f]' : 'text-navy-deep'}`} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[14.5px] font-semibold ${danger ? 'text-[#d63b2f]' : 'text-navy-deep'}`}>
          {label}
        </span>
        {hint && <span className="mt-px block truncate text-xs text-fg-muted">{hint}</span>}
      </span>
      {chevron && (
        <ChevronRight
          className={`h-[17px] w-[17px] shrink-0 text-[#b6bfcd] transition-transform ${open ? 'rotate-90' : ''}`}
        />
      )}
    </span>
  )
}

function Row({
  icon,
  label,
  hint,
  href,
  onClick,
  open,
  divided = false,
}: {
  icon: Icon
  label: string
  hint?: string
  href?: string
  onClick?: () => void
  open?: boolean
  divided?: boolean
}) {
  const body = <RowBody icon={icon} label={label} hint={hint} chevron open={open} />
  const border = divided ? 'border-t border-border' : ''
  if (href) {
    return (
      <Link href={href} className={`block active:bg-surface ${border}`}>
        {body}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} aria-expanded={open} className={`block w-full text-left active:bg-surface ${border}`}>
      {body}
    </button>
  )
}
