'use client'
import { motion } from 'framer-motion'
import { Search, CreditCard, UserPlus, PartyPopper } from 'lucide-react'
import { Backdrop } from './Backdrop'

const steps = [
  {
    icon: Search,
    title: 'Najdi nebo založ skupinu',
    desc: 'Vyber si předplatné a skupinu, kde je volné místo. Nebo si založ vlastní a pozvi kamarády.',
  },
  {
    icon: CreditCard,
    title: 'Zaplať svůj podíl',
    desc: 'Platíš jen svou část, ne celý plán. Žádné vstupní poplatky, žádné závazky na rok.',
  },
  {
    icon: UserPlus,
    title: 'Organizátor tě přidá',
    desc: 'Do pár minut ti přijde pozvánka do sdíleného rodinného účtu.',
  },
  {
    icon: PartyPopper,
    title: 'Užívej si předplatné',
    desc: 'Stejný obsah, stejná kvalita, zlomek ceny. Každý měsíc.',
  },
]

export function HowItWorks() {
  return (
    <section id="jak-to-funguje" className="relative py-24 px-4 overflow-hidden">
      <Backdrop variant="light" />
      <div className="mx-auto max-w-6xl relative">
        <header className="max-w-2xl mb-14">
          <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold mb-3">
            Jak to funguje
          </p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-navy-deep tracking-tight">
            Čtyři kroky ke skutečné úspoře
          </h2>
          <p className="text-fg-muted mt-4 text-lg">
            Od registrace k prvnímu ušetřenému stovkáči to trvá pár minut.
          </p>
        </header>

        <div className="relative grid md:grid-cols-4 gap-5">
          <div className="hidden md:block absolute top-[74px] left-[10%] right-[10%] border-t-2 border-dashed border-border" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.14, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
              className="surface-card group relative rounded-3xl p-6 overflow-hidden hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
            >
              <span className="absolute -right-2 -top-7 font-display font-extrabold text-[96px] leading-none text-navy-deep/[0.05] select-none">
                {i + 1}
              </span>
              <div className="relative h-14 w-14 rounded-2xl grid place-items-center bg-navy-deep text-brand group-hover:scale-105 transition-transform">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="relative font-display font-bold text-lg text-navy-deep mt-6 leading-snug">
                {step.title}
              </h3>
              <p className="relative text-sm text-fg-muted mt-2 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
