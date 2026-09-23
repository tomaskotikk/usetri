import type { Metadata } from 'next'
import { BannerStudio } from '@/components/brand/BannerStudio'
import { Wordmark } from '@/components/brand/marks'

export const metadata: Metadata = {
  title: 'Ušetři — Instagram banner',
  robots: { index: false, follow: false },
}

export default function BannerPage() {
  return (
    <main className="min-h-screen bg-surface px-10 py-16">
      <div className="max-w-[1180px] mx-auto">
        <header className="mb-10">
          <Wordmark size={34} />
          <h1 className="font-display text-[46px] font-extrabold text-navy-deep tracking-[-0.04em] mt-6 leading-none">
            Instagram banner
          </h1>
          <p className="text-[17px] text-fg-muted mt-4 max-w-[680px] leading-relaxed">
            Jeden obraz rozdělený na tři příspěvky. Nápis i zeměkoule přetékají přes švy,
            takže se mřížka na profilu čte jako jeden celek.
          </p>
        </header>

        <BannerStudio />

        <section className="mt-10 rounded-[24px] border border-border bg-white p-7">
          <h2 className="font-display text-[17px] font-extrabold text-navy-deep tracking-tight">
            Jak to nahrát, aby to sedělo
          </h2>
          <ol className="mt-4 space-y-2.5 text-[14.5px] text-navy-deep list-decimal pl-5 marker:text-fg-muted">
            <li>
              Instagram řadí mřížku odzadu, takže nahraj <strong>dlaždici 3, pak 2, pak 1</strong>.
              V profilu se pak poskládají zleva doprava správně.
            </li>
            <li>
              Všechny tři nahraj <strong>rychle za sebou</strong>, než ti mezi ně vleze jiný příspěvek.
            </li>
            <li>
              Pak je <strong>připni nahoru</strong> (tři tečky → Připnout k profilu) — připnuté
              příspěvky zůstanou v první řadě, i když budeš postovat dál.
            </li>
            <li>
              Mřížka Instagramu je od roku 2024 <strong>3:4</strong>. Post ve formátu 4:5 v ní
              přijde o zhruba 34 px z každé strany, což posune švy — proto je výchozí
              přednastavení <strong>Mřížka 3:4</strong> s dlaždicemi 1013 × 1350.
            </li>
            <li>
              Rozkliknutý příspěvek Instagram ořízne shora a zdola. V mřížce to sedí přesně,
              v detailu uvidíš o kousek méně — pro banner na profilu to nevadí.
            </li>
          </ol>
        </section>
      </div>
    </main>
  )
}
