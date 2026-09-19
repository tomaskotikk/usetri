import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Clock, ShieldCheck, Star, Users } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { JoinButton } from '@/components/catalogue/JoinButton'
import { ServiceIcon } from '@/components/illustrations/ServiceIcon'
import { Progress } from '@/components/ui/progress'
import { groupsForService } from '@/lib/service-groups'
import { categories, getService, pricePerSeat, savingsPercent, services } from '@/types/service'

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = getService(slug)
  if (!service) return { title: 'Služba nenalezena — Ušetři' }
  return {
    title: `${service.name} — sdílené předplatné od ${pricePerSeat(service)} Kč | Ušetři`,
    description: `Rozděl si ${service.name} ${service.plan} s dalšími lidmi a plať jen ${pricePerSeat(service)} Kč měsíčně místo ${service.fullPrice} Kč.`,
  }
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const service = getService(slug)
  if (!service) notFound()

  const category = categories.find((c) => c.id === service.category)
  const groups = groupsForService(service)
  const perSeat = pricePerSeat(service)
  const related = services.filter((s) => s.category === service.category && s.slug !== service.slug).slice(0, 4)

  return (
    <>
      <Navbar />

      <header className="relative overflow-hidden pt-32 pb-14 px-4 text-white">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(120% 130% at 78% 0%, #10305c 0%, #071229 50%, #050b1a 100%)',
          }}
        />
        <div className="absolute inset-0 -z-10 bg-grid-dark" />
        <div
          className="absolute -right-24 -top-20 h-[420px] w-[420px] rounded-full blur-[140px] -z-10 opacity-30"
          style={{ background: service.color }}
        />

        <div className="mx-auto max-w-6xl">
          <Link
            href="/predplatna"
            className="inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Zpět na katalog
          </Link>

          <div className="flex flex-col md:flex-row md:items-end gap-8 mt-6">
            <div className="flex items-start gap-5">
              <div className="rounded-3xl bg-white/95 p-3">
                <ServiceIcon service={service} size="lg" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.18em] text-brand font-semibold">
                  {category?.label}
                </span>
                <h1 className="font-display font-extrabold text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[1.05] tracking-tight mt-2">
                  {service.name}
                </h1>
                <p className="text-white/60 mt-1.5">{service.plan}</p>
              </div>
            </div>

            <div className="md:ml-auto flex items-end gap-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/45">Tvůj podíl</p>
                <p className="font-mono font-bold text-4xl text-brand tracking-tight mt-1">
                  {perSeat} Kč
                </p>
                <p className="text-xs text-white/45 mt-0.5">měsíčně</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/45">Bez sdílení</p>
                <p className="font-mono font-semibold text-2xl text-white/60 line-through decoration-white/30 mt-2">
                  {service.fullPrice} Kč
                </p>
              </div>
              <span className="rounded-full bg-brand/15 text-brand text-sm font-semibold px-3.5 py-1.5 mb-2">
                −{savingsPercent(service)} %
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 grid lg:grid-cols-[1.5fr_1fr] gap-10 items-start">
          <section>
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-navy-deep tracking-tight">
              Otevřené skupiny
            </h2>
            <p className="text-fg-muted mt-2 mb-7">
              {groups.length === 1
                ? '1 skupina hledá další členy.'
                : groups.length < 5
                  ? `${groups.length} skupiny hledají další členy.`
                  : `${groups.length} skupin hledá další členy.`}{' '}
              Vyber si organizátora a přidej se.
            </p>

            <div className="space-y-4">
              {groups.map((group) => {
                const left = group.seatsTotal - group.seatsTaken
                return (
                  <article
                    key={group.id}
                    className="surface-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-5"
                  >
                    <div className="h-12 w-12 rounded-full bg-navy-deep text-white grid place-items-center font-semibold shrink-0">
                      {group.organiser.charAt(0)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-navy-deep">{group.organiser}</p>
                        <span className="flex items-center gap-1 text-xs text-fg-muted">
                          <Star className="h-3.5 w-3.5 fill-brand text-brand" />
                          {group.rating}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-fg-muted">
                          <Clock className="h-3.5 w-3.5" />
                          {group.runningMonths} měs. aktivní
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <Progress
                          value={(group.seatsTaken / group.seatsTotal) * 100}
                          className="h-1.5 w-full flex-1 max-w-[220px]"
                        />
                        <span className="text-xs text-fg-muted font-mono whitespace-nowrap">
                          {group.seatsTaken}/{group.seatsTotal} obsazeno
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0">
                      <p className="font-mono font-bold text-xl text-navy-deep">{group.price} Kč</p>
                      <JoinButton label={left > 0 ? 'Přidat se' : 'Obsazeno'} />
                    </div>
                  </article>
                )
              })}
            </div>

            {related.length > 0 && (
              <section className="mt-14">
                <h2 className="font-display font-extrabold text-2xl text-navy-deep tracking-tight mb-6">
                  Podobné služby
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/predplatna/${r.slug}`}
                      className="surface-card rounded-2xl p-4 flex items-center gap-3 hover:-translate-y-1 transition-transform"
                    >
                      <ServiceIcon service={r} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-navy-deep truncate">{r.name}</p>
                        <p className="text-xs text-fg-muted truncate">{r.plan}</p>
                      </div>
                      <p className="font-mono font-bold text-navy-deep shrink-0">{pricePerSeat(r)} Kč</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </section>

          <aside className="lg:sticky lg:top-28 space-y-4">
            <div className="surface-card-lg rounded-3xl p-6">
              <p className="text-sm text-fg-muted">Nenašel jsi vhodnou skupinu?</p>
              <p className="font-display font-bold text-xl text-navy-deep mt-1 mb-4">
                Založ vlastní a pozvi lidi
              </p>
              <JoinButton label="Založit skupinu" full />

              <dl className="mt-6 pt-5 border-t border-border space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Celá cena plánu</dt>
                  <dd className="font-mono font-semibold text-navy-deep">{service.fullPrice} Kč</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Počet míst</dt>
                  <dd className="font-mono font-semibold text-navy-deep">{service.seats}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Cena za osobu</dt>
                  <dd className="font-mono font-semibold text-brand">{perSeat} Kč</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-fg-muted">Ušetříš ročně</dt>
                  <dd className="font-mono font-semibold text-navy-deep">
                    {((service.fullPrice - perSeat) * 12).toLocaleString('cs-CZ')} Kč
                  </dd>
                </div>
              </dl>
            </div>

            <div className="surface-card rounded-3xl p-6 space-y-3 text-sm text-fg-muted">
              <p className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                Oficiální rodinný plán — žádné sdílení hesel po internetu.
              </p>
              <p className="flex items-start gap-2.5">
                <Users className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                Organizátoři mají hodnocení od ostatních členů.
              </p>
              <p className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-brand mt-0.5 shrink-0" />
                Odejít můžeš ke konci zaplaceného měsíce.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  )
}
