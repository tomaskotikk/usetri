'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Search, Users } from 'lucide-react'
import { ServiceIcon } from '@/components/illustrations/ServiceIcon'
import {
  categories,
  pricePerSeat,
  savingsPercent,
  services,
  type Service,
  type ServiceCategory,
} from '@/types/service'

function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.05, 0.4), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/predplatna/${service.slug}`}
        className="surface-card group relative flex h-full flex-col rounded-2xl p-5 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
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
          <ArrowUpRight className="h-4 w-4 text-fg-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
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
          {service.openGroups} otevřených skupin · {service.seats} míst v plánu
        </p>
      </Link>
    </motion.div>
  )
}

export function CatalogueBrowser() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<ServiceCategory | 'all'>('all')

  const normalised = query.trim().toLowerCase()

  const searchResults = useMemo(() => {
    if (!normalised) return null
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(normalised) ||
        s.plan.toLowerCase().includes(normalised) ||
        categories.find((c) => c.id === s.category)?.label.toLowerCase().includes(normalised),
    )
  }, [normalised])

  const visibleCategories = active === 'all' ? categories : categories.filter((c) => c.id === active)

  return (
    <>
      <div className="sticky top-[60px] z-30 bg-surface/90 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative lg:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledej službu…"
              aria-label="Hledat službu"
              className="w-full rounded-xl border border-border bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setActive('all')}
              className={`shrink-0 px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                active === 'all'
                  ? 'bg-navy-deep text-white border-navy-deep'
                  : 'border-border hover:border-navy-deep/30'
              }`}
            >
              Vše
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                  active === c.id
                    ? 'bg-navy-deep text-white border-navy-deep'
                    : 'border-border hover:border-navy-deep/30'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-14">
        {searchResults ? (
          <section>
            <h2 className="font-display font-extrabold text-2xl text-navy-deep mb-6">
              {searchResults.length === 0
                ? `Pro „${query}" jsme nic nenašli`
                : `Nalezeno ${searchResults.length} služeb`}
            </h2>
            {searchResults.length === 0 ? (
              <p className="text-fg-muted">
                Zkus jiný název, nebo{' '}
                <Link href="#" className="text-navy-deep font-semibold underline underline-offset-4 decoration-brand">
                  nám napiš
                </Link>
                , jakou službu přidat.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.map((s, i) => (
                  <ServiceCard key={s.slug} service={s} index={i} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="space-y-16">
            {visibleCategories.map((category) => {
              const list = services.filter((s) => s.category === category.id)
              return (
                <section key={category.id} id={category.id}>
                  <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
                    <div className="max-w-2xl">
                      <h2 className="font-display font-extrabold text-2xl md:text-3xl text-navy-deep tracking-tight">
                        {category.label}
                      </h2>
                      <p className="text-fg-muted mt-2">{category.description}</p>
                    </div>
                    <span className="text-sm text-fg-muted font-mono shrink-0">
                      {list.length} služeb
                    </span>
                  </header>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {list.map((s, i) => (
                      <ServiceCard key={s.slug} service={s} index={i} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
