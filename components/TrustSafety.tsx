'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, KeyRound, Lock, Undo2 } from 'lucide-react'

const guarantees = [
  {
    icon: Lock,
    title: 'Peníze držíme, dokud nemáš přístup',
    desc: 'Platba jde na vázaný účet. Organizátorovi ji uvolníme až ve chvíli, kdy potvrdíš, že tě do plánu přidal.',
  },
  {
    icon: Undo2,
    title: 'Nedostaneš přístup do 24 hodin? Vracíme vše',
    desc: 'Bez dohadování a bez poplatku. Peníze putují zpět na kartu, ze které přišly.',
  },
  {
    icon: BadgeCheck,
    title: 'Ověření organizátoři s historií',
    desc: 'U každé skupiny vidíš hodnocení od členů, jak dlouho běží a kolikrát už proběhla platba.',
  },
  {
    icon: KeyRound,
    title: 'Žádné sdílení hesel',
    desc: 'Pozvánka do oficiálního rodinného plánu chodí na tvůj e-mail. Svoje heslo si nastavuješ sám/sama.',
  },
]

const flow = [
  { step: 'Zaplatíš svůj podíl', note: 'kartou přes zabezpečenou bránu' },
  { step: 'Peníze zůstanou u nás', note: 'organizátor je zatím nevidí' },
  { step: 'Dostaneš pozvánku', note: 'obvykle do pár minut' },
  { step: 'Potvrdíš a platba se uvolní', note: 'až teď dostane organizátor peníze' },
]

export function TrustSafety() {
  return (
    <section className="relative overflow-hidden py-24 px-4 text-white">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(110% 120% at 15% 0%, #10305c 0%, #071229 48%, #050b1a 100%)',
        }}
      />
      <div className="absolute inset-0 -z-10 bg-grid-dark" />
      <div className="absolute -right-24 top-1/4 h-[420px] w-[420px] -z-10 glow scale-150 [--glow:color-mix(in_srgb,var(--brand)_12%,transparent)]" />

      <div className="mx-auto max-w-6xl grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-20 items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold mb-3">
            Bezpečnost
          </p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight leading-[1.05]">
            Jak chráníme
            <br />
            tvoje peníze
          </h2>
          <p className="text-white/55 mt-5 max-w-md text-lg">
            Sdílení předplatného stojí a padá na důvěře mezi cizími lidmi. Tak jsme ji
            zabudovali rovnou do platby.
          </p>

          <div className="mt-10 space-y-7">
            {guarantees.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-4"
              >
                <span className="h-11 w-11 rounded-xl glass-dark grid place-items-center shrink-0 text-brand">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold leading-snug">{item.title}</h3>
                  <p className="text-sm text-white/50 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="glass-dark rounded-3xl p-8 lg:sticky lg:top-28"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-6">Průběh platby</p>

          <ol className="relative space-y-7 before:absolute before:left-[15px] before:top-3 before:bottom-3 before:w-px before:bg-white/15">
            {flow.map((item, i) => (
              <li key={item.step} className="relative flex gap-4">
                <span
                  className={`relative z-10 h-8 w-8 rounded-full grid place-items-center text-xs font-bold shrink-0 ${
                    i === flow.length - 1
                      ? 'bg-brand text-brand-foreground'
                      : 'bg-navy-soft text-white/70 border border-white/15'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="pt-1">
                  <p className="font-medium leading-tight">{item.step}</p>
                  <p className="text-sm text-white/45 mt-1">{item.note}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-sm">
            <span className="text-white/45">Poplatek za zprostředkování</span>
            <span className="font-mono font-semibold text-brand">0 Kč</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
