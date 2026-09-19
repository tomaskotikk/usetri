import { ShieldCheck } from 'lucide-react'
import { AnimatedNumber } from './AnimatedNumber'

const stats = [
  { value: 2400, suffix: '+', label: 'aktivních skupin' },
  { value: 62, suffix: ' %', label: 'průměrná úspora', accent: true },
  { value: 0, suffix: ' Kč', label: 'poplatek za vstup' },
]

export function StatsBand() {
  return (
    <section className="bg-white border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-14 grid md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-center">
        <div className="max-w-md">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-brand font-semibold mb-3">
            <ShieldCheck className="h-4 w-4" />
            Bez šedé zóny
          </p>
          <p className="text-lg text-navy-deep leading-relaxed">
            Sdílíte oficiální rodinné plány přesně tak, jak je poskytovatelé nabízí.
            Žádné přeprodávání účtů, žádné sdílení hesel po internetu.
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-8 md:gap-14">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd
                className={`font-mono font-bold text-3xl md:text-4xl tracking-tight ${
                  stat.accent ? 'text-brand' : 'text-navy-deep'
                }`}
              >
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </dd>
              <dt className="text-xs uppercase tracking-widest text-fg-muted mt-2">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
