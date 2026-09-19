import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Backdrop } from './Backdrop'

const faqs = [
  {
    q: 'Je to legální?',
    a: 'Ano. Sdílíš oficiální rodinné a multi-user plány přesně tak, jak to poskytovatelé sami umožňují — žádné cracknuté účty, žádné sdílení hesel po internetu.',
  },
  {
    q: 'Co když organizátor přestane platit?',
    a: 'Skupina dostane upozornění hned, jak platba neproběhne. Můžeš si zvolit nového organizátora nebo se přesunout do jiné skupiny — o zaplacený měsíc nepřijdeš.',
  },
  {
    q: 'Jak fungují platby?',
    a: 'Každý člen platí jen svůj podíl, automaticky každý měsíc. V téhle verzi je platební tok ukázkový — reálné platby zatím nejsou napojené.',
  },
  {
    q: 'Můžu kdykoliv odejít?',
    a: 'Jasně. Žádné závazky na rok, žádné výpovědní lhůty. Odejdeš ke konci zaplaceného období a místo se uvolní dalšímu.',
  },
]

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 px-4 overflow-hidden">
      <Backdrop variant="light" />
      <div className="mx-auto max-w-6xl grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16 relative">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold mb-3">FAQ</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-navy-deep tracking-tight">
            Časté otázky
          </h2>
          <p className="text-fg-muted mt-4">
            Nenašel jsi, co potřebuješ?{' '}
            <a href="#" className="text-navy-deep font-semibold underline underline-offset-4 decoration-brand">
              Napiš nám
            </a>
            , ozveme se do 24 hodin.
          </p>
        </div>

        <Accordion className="surface-card rounded-3xl divide-y divide-border px-6">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`} className="border-none">
              <AccordionTrigger className="font-display font-bold text-lg py-5 text-navy-deep hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-fg-muted leading-relaxed pb-5">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
