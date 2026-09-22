import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'
import { ServiceIcon } from './illustrations/ServiceIcon'
import { Mascot } from './illustrations/Mascot'
import { getPopularServices } from '@/lib/supabase-stub'
import { pricePerSeat, savingsPercent, services } from '@/types/service'

export async function PopularServices() {
  const popular = await getPopularServices(7)

  return (
    <section id="skupiny" className="py-24 px-4 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-12">
          <div>
            <Mascot size={112} mood="search" className="-ml-3 mb-1" />
            <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold mb-3">
              Nejžádanější právě teď
            </p>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-navy-deep tracking-tight">
              Vyber si a přidej se
            </h2>
          </div>
          <Link
            href="/predplatna"
            className="group inline-flex items-center gap-2 text-navy-deep font-semibold shrink-0"
          >
            Všech {services.length} služeb
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popular.map((service) => (
            <Link
              key={service.slug}
              href={`/predplatna/${service.slug}`}
              className="surface-card group relative flex flex-col rounded-2xl p-5 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
            >
              <span
                className="absolute inset-x-0 -top-16 h-24 blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                style={{ background: service.color }}
              />
              <div className="relative flex items-start gap-3">
                <ServiceIcon service={service} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-deep leading-tight truncate">{service.name}</p>
                  <p className="text-xs text-fg-muted truncate mt-0.5">{service.plan}</p>
                </div>
              </div>

              <div className="relative mt-5 flex items-end justify-between">
                <div>
                  <p className="font-mono font-bold text-2xl text-navy-deep tracking-tight">
                    {pricePerSeat(service)} Kč
                  </p>
                  <p className="text-[11px] text-fg-muted">měsíčně za osobu</p>
                </div>
                <span className="rounded-full bg-brand/12 text-[11px] font-semibold text-[color:var(--brand-foreground)] px-2.5 py-1">
                  −{savingsPercent(service)} %
                </span>
              </div>

              <p className="relative mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-[11px] text-fg-muted">
                <Users className="h-3.5 w-3.5" />
                {service.openGroups} otevřených skupin
              </p>
            </Link>
          ))}

          <Link
            href="/predplatna"
            className="group relative flex flex-col justify-between rounded-2xl p-5 overflow-hidden text-white"
            style={{
              background: 'radial-gradient(120% 140% at 80% 10%, #16294f 0%, #0b1730 60%, #050b1a 100%)',
            }}
          >
            <div className="absolute -right-10 -bottom-12 h-40 w-40 rounded-full bg-brand/25 blur-3xl" />
            <p className="relative font-display font-bold text-xl leading-snug">
              Netflix, Apple, HBO, Duolingo, Proton, Strava…
            </p>
            <p className="relative inline-flex items-center gap-2 text-brand font-semibold mt-6">
              Prozkoumat katalog
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </p>
          </Link>
        </div>
      </div>
    </section>
  )
}
