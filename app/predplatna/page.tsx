import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CatalogueBrowser } from '@/components/catalogue/CatalogueBrowser'
import { categories, services } from '@/types/service'

export const metadata: Metadata = {
  title: 'Všechna předplatná — Ušetři',
  description:
    'Katalog služeb, které se dají sdílet: streaming, hudba, hry, software, AI, VPN, cloud, vzdělávání i sport.',
}

export default function CataloguePage() {
  const totalGroups = services.reduce((sum, s) => sum + s.openGroups, 0)

  return (
    <>
      <Navbar />

      <header className="relative overflow-hidden pt-36 pb-14 px-4 text-white">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(120% 130% at 80% 0%, #10305c 0%, #071229 50%, #050b1a 100%)',
          }}
        />
        <div className="absolute inset-0 -z-10 bg-grid-dark" />
        <div className="absolute -left-20 top-0 h-[360px] w-[360px] -z-10 glow scale-150 [--glow:color-mix(in_srgb,var(--brand)_15%,transparent)]" />

        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold mb-4">Katalog</p>
          <h1 className="font-display font-extrabold text-[clamp(2.6rem,5.5vw,4.2rem)] leading-[1] tracking-tight max-w-3xl">
            Všechno, co se dá <span className="text-shimmer">sdílet</span>
          </h1>
          <p className="text-white/60 text-lg mt-5 max-w-xl">
            Od streamovacích služeb přes AI nástroje až po VPN a jazykové aplikace. Vyber si
            službu a přidej se ke skupině, která má volné místo.
          </p>

          <div className="flex flex-wrap gap-8 mt-10">
            <div>
              <p className="font-mono font-bold text-3xl text-brand">{services.length}</p>
              <p className="text-xs uppercase tracking-widest text-white/50 mt-1">dostupných služeb</p>
            </div>
            <div>
              <p className="font-mono font-bold text-3xl">{totalGroups}</p>
              <p className="text-xs uppercase tracking-widest text-white/50 mt-1">otevřených skupin</p>
            </div>
            <div>
              <p className="font-mono font-bold text-3xl">{categories.length}</p>
              <p className="text-xs uppercase tracking-widest text-white/50 mt-1">kategorií</p>
            </div>
          </div>
        </div>
      </header>

      <main className="bg-surface min-h-screen">
        <CatalogueBrowser />
      </main>

      <Footer />
    </>
  )
}
