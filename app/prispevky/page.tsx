import type { Metadata } from 'next'
import { PostStudio } from '@/components/brand/PostStudio'
import { Wordmark } from '@/components/brand/marks'

export const metadata: Metadata = {
  title: 'Ušetři — příspěvky na Instagram',
  robots: { index: false, follow: false },
}

export default function PostsPage() {
  return (
    <main className="min-h-screen bg-surface px-10 py-16">
      <div className="max-w-[1180px] mx-auto">
        <header className="mb-12">
          <Wordmark size={34} />
          <h1 className="font-display text-[46px] font-extrabold text-navy-deep tracking-[-0.04em] mt-6 leading-none">
            Příspěvky
          </h1>
          <p className="text-[17px] text-fg-muted mt-4 max-w-[680px] leading-relaxed">
            Pět samostatných příspěvků 1080 × 1350 px. Každý stojí sám za sebe, nic se nespojuje
            přes švy, takže na mřížce Instagramu nezáleží. Pod každým je hotový popisek
            i s hashtagy — stáhni PNG, zkopíruj text, nahraj.
          </p>
        </header>

        <PostStudio />

        <section className="mt-12 rounded-[24px] border border-border bg-white p-7">
          <h2 className="font-display text-[17px] font-extrabold text-navy-deep tracking-tight">
            Než to nahraješ
          </h2>
          <ul className="mt-4 space-y-2.5 text-[14.5px] text-navy-deep list-disc pl-5 marker:text-fg-muted">
            <li>
              <strong>Ceny jsou ověřené k září 2026</strong> a počty míst odpovídají tomu, co
              poskytovatel reálně prodává. Ceníky se mění několikrát ročně — před nahráním je
              projdi znovu.
            </li>
            <li>
              Pořadí, které dává smysl: <strong>Cenový šok → Ceník → Jak to funguje → Bezpečná
              platba → Výzva k akci</strong>. První tři vysvětlují, poslední dva odbourávají
              námitky.
            </li>
            <li>
              Příspěvek <strong>Bezpečná platba</strong> mluví o úschově. Nahraj ho až ve chvíli,
              kdy escrow přes Stripe Connect skutečně běží.
            </li>
            <li>
              V popisku u <strong>Spotify a YouTube</strong> je poznámka o podmínce jedné
              domácnosti. Nemaž ji — nabádat k porušení podmínek poskytovatele se nevyplácí.
            </li>
            <li>
              <strong>Hashtagy</strong> můžeš nechat v popisku, nebo je dát do prvního
              komentáře. Dosah je stejný, text pod příspěvkem vypadá čistěji.
            </li>
          </ul>
        </section>
      </div>
    </main>
  )
}
