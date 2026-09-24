'use client'
import { useActionState, useMemo, useState } from 'react'
import { Check, Loader2, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ServiceIcon } from '@/components/illustrations/ServiceIcon'
import { AccountInput } from './AccountInput'
import { createOffer, type ActionState } from '@/app/dashboard/actions'
import { formatCzk } from '@/lib/format'
import { categories, type Service } from '@/types/service'

export function NewOfferForm({ services, payoutAccount }: { services: Service[]; payoutAccount?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createOffer, null)
  const [selected, setSelected] = useState<Service | null>(null)
  const [query, setQuery] = useState('')
  const [seats, setSeats] = useState(4)
  const [price, setPrice] = useState(0)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return services
    return services.filter((s) => `${s.name} ${s.plan}`.toLowerCase().includes(q))
  }, [services, query])

  const pick = (service: Service) => {
    setSelected(service)
    setSeats(service.seats)
    setPrice(Math.round(service.fullPrice / service.seats))
  }

  const othersPay = selected ? price * Math.max(0, seats - 1) : 0
  const ownerPays = selected ? Math.max(0, selected.fullPrice - othersPay) : 0

  if (!selected) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledej službu…"
            aria-label="Hledat službu"
            className="h-12 w-full rounded-xl border border-border bg-white pl-11 pr-4 text-[15px] text-navy-deep outline-none transition placeholder:text-fg-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </div>

        {categories.map((category) => {
          const items = visible.filter((s) => s.category === category.id)
          if (items.length === 0) return null
          return (
            <section key={category.id}>
              <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-widest text-fg-muted">
                {category.label}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((service) => (
                  <button
                    key={service.slug}
                    type="button"
                    onClick={() => pick(service)}
                    className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_14px_30px_-18px_rgba(5,11,26,0.4)]"
                  >
                    <ServiceIcon service={service} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-navy-deep">
                        {service.name}
                      </span>
                      <span className="block truncate text-[12px] text-fg-muted">{service.plan}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-mono text-[13px] font-semibold text-navy-deep">
                        {formatCzk(service.fullPrice)}
                      </span>
                      <span className="block text-[11px] text-fg-muted">{service.seats} míst</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )
        })}

        {visible.length === 0 && (
          <p className="rounded-3xl border border-dashed border-border px-6 py-12 text-center text-sm text-fg-muted">
            Takovou službu v katalogu nemáme.
          </p>
        )}
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="service" value={selected.slug} />

      <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-4">
        <ServiceIcon service={selected} size="md" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold tracking-tight text-navy-deep">{selected.name}</p>
          <p className="truncate text-sm text-fg-muted">{selected.plan}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setSelected(null)}
          className="h-9 rounded-xl px-3 text-sm text-fg-muted"
        >
          Změnit
        </Button>
      </div>

      <div className="space-y-6 rounded-3xl border border-border bg-card p-5 sm:p-6">
        <Field
          label="Kolik míst má plán celkem"
          hint={`Oficiální plán ${selected.name} pokrývá ${selected.seats} lidí včetně tebe.`}
        >
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSeats(n)}
                aria-pressed={seats === n}
                className={`h-10 w-10 rounded-xl border text-sm font-semibold transition-colors ${
                  seats === n
                    ? 'border-navy-deep bg-navy-deep text-white'
                    : 'border-border bg-white text-fg-muted hover:border-navy-deep/30 hover:text-navy-deep'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <input type="hidden" name="seats" value={seats} />
        </Field>

        <Field
          label="Cena za jedno místo"
          hint={`Férový podíl vychází na ${formatCzk(Math.round(selected.fullPrice / seats))} měsíčně.`}
        >
          <div className="relative w-44">
            <input
              name="price"
              type="number"
              min={1}
              max={5000}
              required
              value={price || ''}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="h-12 w-full rounded-xl border border-border bg-white pl-4 pr-12 font-mono text-[15px] text-navy-deep outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-fg-muted">Kč</span>
          </div>
        </Field>

        <Field label="Poznámka pro zájemce" hint="Nepovinné. Třeba jak a kdy se platí.">
          <textarea
            name="note"
            rows={3}
            maxLength={400}
            placeholder="Pozvánku do rodinného účtu posílám hned po první platbě…"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-[15px] text-navy-deep outline-none transition placeholder:text-fg-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </Field>

        <Field
          label="Kam ti mají členové posílat peníze?"
          hint="Z čísla účtu vygenerujeme členům QR platbu. Vidí ho každý, kdo se přidá do tvé skupiny; ostatní ho nevidí."
        >
          <AccountInput defaultValue={payoutAccount} />
        </Field>
      </div>

      {/* live maths so the owner sees what the offer does for them */}
      <div className="relative isolate overflow-hidden rounded-3xl p-5 text-white sm:p-6">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(135deg, #0d1b36 0%, #16294f 55%, #0b3a34 100%)' }}
        />
        <div className="absolute -right-10 -top-12 -z-10 h-32 w-32 rounded-full bg-brand/25 blur-2xl" />
        <p className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/55">
          <Sparkles className="h-3.5 w-3.5 text-brand" /> Co ti nabídka udělá
        </p>
        <div className="mt-3 flex flex-wrap gap-8">
          <div>
            <p className="text-[12px] text-white/60">Ty zaplatíš měsíčně</p>
            <p className="mt-0.5 font-mono text-2xl font-bold tracking-[-0.04em]">{formatCzk(ownerPays)}</p>
          </div>
          <div>
            <p className="text-[12px] text-white/60">Vyberete od {seats - 1} členů</p>
            <p className="mt-0.5 font-mono text-2xl font-bold tracking-[-0.04em] text-brand">
              {formatCzk(othersPay)}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-white/60">Celá cena plánu</p>
            <p className="mt-0.5 font-mono text-2xl font-bold tracking-[-0.04em] text-white/70">
              {formatCzk(selected.fullPrice)}
            </p>
          </div>
        </div>
        {othersPay > selected.fullPrice && (
          <p className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-[12px] text-white/80">
            Vybereš víc, než kolik plán stojí. Férovější je cena do{' '}
            {formatCzk(Math.round(selected.fullPrice / seats))} za místo.
          </p>
        )}
      </div>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full gap-2 rounded-xl bg-brand text-base font-semibold text-brand-foreground hover:bg-brand-soft"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Zveřejnit nabídku
      </Button>
    </form>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-navy-deep">{label}</p>
      {hint && <p className="mb-2.5 mt-0.5 text-[12px] text-fg-muted">{hint}</p>}
      {children}
    </div>
  )
}
