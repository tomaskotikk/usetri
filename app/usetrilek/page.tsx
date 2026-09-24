import type { Metadata } from 'next'
import Link from 'next/link'
import { Wordmark } from '@/components/brand/marks'
import { Playground } from '@/components/usetrilek/Playground'
import { Usetrilek, UsetrilekFace } from '@/components/usetrilek/Usetrilek'
import { POSES } from '@/components/usetrilek/poses'
import { TONE } from '@/components/usetrilek/palette'
import type { Face } from '@/components/usetrilek/rig'

export const metadata: Metadata = {
  title: 'Ušetřílek',
  description: 'Maskot Ušetři — postava z plastelíny, její pózy, výrazy a použití v appce.',
  robots: { index: false, follow: false },
}

const byId = Object.fromEntries(POSES.map((d) => [d.id, d]))

/** Soft card backgrounds, so a wall of poses doesn't read as one colour. */
const TINTS = [
  'from-[#effdf7] to-[#d5f7ea]',
  'from-[#eef6ff] to-[#d9e9ff]',
  'from-[#fff5ec] to-[#ffe4cf]',
  'from-[#f5f0ff] to-[#e5dbff]',
  'from-[#fffbe8] to-[#fff0b8]',
  'from-[#fff0f1] to-[#ffdadd]',
]

const FACES: { name: string; face: Face; turn?: number }[] = [
  { name: 'Úsměv', face: { eyes: 'open', brows: 'neutral', mouth: 'smile' } },
  { name: 'Nadšení', face: { eyes: 'happy', brows: 'raised', mouth: 'grin', blush: 1.5 } },
  { name: 'Mrknutí', face: { eyes: 'wink', brows: 'raised', mouth: 'smirk' }, turn: 0.2 },
  { name: 'Údiv', face: { eyes: 'wide', brows: 'raised', mouth: 'o' } },
  { name: 'Přemýšlí', face: { eyes: 'open', brows: 'skeptic', mouth: 'flat', look: [0.7, -1] }, turn: 0.3 },
  { name: 'Starost', face: { eyes: 'open', brows: 'worried', mouth: 'wobbly', look: [0, 0.4] } },
  { name: 'Rozpaky', face: { eyes: 'open', brows: 'worried', mouth: 'teeth', look: [-0.6, -0.2] }, turn: -0.2 },
  { name: 'Otrávený', face: { eyes: 'half', brows: 'neutral', mouth: 'flat', look: [0.8, 0] } },
  { name: 'Legrace', face: { eyes: 'happy', brows: 'neutral', mouth: 'tongue' }, turn: -0.15 },
  { name: 'Spokojenost', face: { eyes: 'closed', brows: 'neutral', mouth: 'smile', blush: 1.4 } },
]

/** Points on the idle figure, as a share of its box (viewBox -40 0 380 432). */
const DETAILS = [
  { x: 50, y: 12, title: 'Kudrny z plastelíny', text: 'Každá kudrna je vlastní kulička se světlem — z dálky účes, zblízka hmota.' },
  { x: 40, y: 41, title: 'Sluchátka kolem krku', text: 'Kluk, co sdílí Spotify. Tmavé mušle z boku, ať čtou jako sluchátka, ne jako oči.' },
  { x: 58, y: 46.5, title: 'Jiskřička na hrudi', text: 'Po původním Ušetříkovi — ta modrá hvězdička, co mu blikala nad hlavou.' },
  { x: 50, y: 58, title: 'Mikina v barvě značky', text: '#00D99A, klokaní kapsa, šňůrky a žebrovaný lem. Ušetři má na sobě.' },
  { x: 25, y: 66, title: 'Velké ruce', text: 'O kousek větší, než by měly být — gesto musí být čitelné i v ikoně 40 px.' },
  { x: 36, y: 94, title: 'Tenisky s mintovou podrážkou', text: 'Bílé, s tkaničkami a zeleným švihem. Stojí pevně na zemi.' },
]

const SWATCHES: { name: string; tone: keyof typeof TONE }[] = [
  { name: 'Pleť', tone: 'skin' },
  { name: 'Vlasy', tone: 'hair' },
  { name: 'Mikina', tone: 'hood' },
  { name: 'Kalhoty', tone: 'pants' },
  { name: 'Mince', tone: 'gold' },
  { name: 'Sluchátka', tone: 'navy' },
]

function Section({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#00a877]">{eyebrow}</p>
      <h2 className="mt-2 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-navy-deep">
        {title}
      </h2>
      {lead && <p className="mt-3 max-w-[620px] text-[16px] leading-relaxed text-fg-muted">{lead}</p>}
      <div className="mt-9">{children}</div>
    </section>
  )
}

function PhoneFrame({ label, children, dark = false }: { label: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <figure className="flex flex-col items-center">
      <div
        className={`relative h-[520px] w-[260px] overflow-hidden rounded-[44px] border-[7px] border-navy-deep shadow-[0_40px_80px_-40px_rgba(5,11,26,0.55)] ${
          dark ? 'bg-[radial-gradient(120%_80%_at_50%_0%,#16294f_0%,#0b1730_55%,#050b1a_100%)] text-white' : 'bg-[#f7f9fc] text-navy-deep'
        }`}
      >
        <div className="absolute left-1/2 top-2 z-10 h-[22px] w-[84px] -translate-x-1/2 rounded-full bg-navy-deep" />
        {children}
      </div>
      <figcaption className="mt-4 text-[13px] font-semibold text-fg-muted">{label}</figcaption>
    </figure>
  )
}

export default function UsetrilekPage() {
  return (
    <main className="min-h-dvh overflow-x-clip bg-[#f6fbf9]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-6 sm:px-6">
        <Link href="/" aria-label="Ušetři — domů">
          <Wordmark size={24} />
        </Link>
        <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-fg-muted shadow-sm">Maskot · verze 2</span>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-6 pt-10 sm:px-6 lg:grid-cols-[0.85fr_1.4fr] lg:pt-16">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#00a877]">Seznamte se</p>
          <h1 className="mt-2 font-display text-[clamp(3.2rem,8vw,5.6rem)] font-extrabold leading-[0.92] tracking-[-0.045em] text-navy-deep">
            Ušetřílek
          </h1>
          <p className="mt-5 max-w-[440px] text-[17px] leading-relaxed text-fg-muted">
            Kluk od vedle, co ví, kolik stojí Netflix na osobu. Z plastelíny, v mintové mikině, se sluchátky kolem krku — protože
            Spotify se přece sdílí.
          </p>
          <dl className="mt-8 grid max-w-[420px] grid-cols-3 gap-3">
            {[
              [String(POSES.length), 'póz'],
              [String(FACES.length), 'výrazů'],
              ['0', 'obrázků'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white px-4 py-3 shadow-[0_1px_0_rgba(5,11,26,0.04)]">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-[28px] font-extrabold leading-none tracking-[-0.03em] text-navy-deep">{value}</dd>
                <dd className="mt-1 text-[12px] text-fg-muted">{label}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 max-w-[420px] text-[13px] leading-relaxed text-fg-muted">
            Žádné obrázky — je poskládaný z kódu. Kostra, klouby a výrazy jsou data, takže stejná postava poběží na webu i v
            mobilní appce. Klikni na něj.
          </p>
        </div>
        <Playground />
      </section>

      {/* poses */}
      <Section
        eyebrow="Pózy"
        title="Na každou chvíli v appce jedna"
        lead="Každá póza je jen sada úhlů kloubů, výraz a pohyb. U každé je napsané, kam patří — tahle stránka je zároveň zadání."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POSES.map((def, i) => (
            <article key={def.id} className="overflow-hidden rounded-[28px] border border-border bg-white">
              <div className={`flex justify-center bg-gradient-to-b ${TINTS[i % TINTS.length]} pt-6`}>
                <Usetrilek
                  pose={def.pose}
                  motion={def.motion}
                  extras={def.extras}
                  seat={def.seat}
                  size={250}
                  title={`Ušetřílek — ${def.name}`}
                />
              </div>
              <div className="px-5 pb-5 pt-4">
                <h3 className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-navy-deep">{def.name}</h3>
                <p className="mt-1 text-[14px] leading-snug text-fg-muted">{def.use}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* faces */}
      <section className="bg-navy-deep">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-brand">Výrazy</p>
          <h2 className="mt-2 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white">
            Oči, obočí, pusa
          </h2>
          <p className="mt-3 max-w-[620px] text-[16px] leading-relaxed text-white/60">
            Tři díly, které se skládají nezávisle na póze — a mrká sám od sebe.
          </p>
          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {FACES.map(({ name, face, turn }) => (
              <figure key={name} className="flex flex-col items-center rounded-[26px] bg-white/[0.06] pb-4 pt-5">
                <UsetrilekFace face={face} turn={turn} size={112} />
                <figcaption className="mt-2 text-[13px] font-semibold text-white/80">{name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* details */}
      <Section eyebrow="Detaily" title="Zblízka" lead="Postava je z pár jednoduchých tvarů. Charakter dělají drobnosti.">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-[32px] bg-[radial-gradient(120%_100%_at_50%_0%,#f4fffb_0%,#cdf7e7_60%,#a9efd4_100%)] px-6 pt-8">
          <div className="relative mx-auto w-full max-w-[380px]">
            <Usetrilek pose={byId.stoji.pose} motion={byId.stoji.motion} className="w-full" title="Ušetřílek" />
            {DETAILS.map((d, i) => (
              <span
                key={d.title}
                className="absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-navy-deep text-[12px] font-bold text-white ring-4 ring-white/80"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
            ))}
          </div>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {DETAILS.map((d, i) => (
              <li key={d.title} className="rounded-[22px] border border-border bg-white p-5">
                <p className="flex items-center gap-2.5 font-display text-[17px] font-extrabold tracking-[-0.01em] text-navy-deep">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy-deep font-sans text-[11px] text-white">
                    {i + 1}
                  </span>
                  {d.title}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">{d.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {SWATCHES.map(({ name, tone }) => {
            const t = TONE[tone]
            return (
              <div key={name} className="rounded-[22px] border border-border bg-white p-3">
                <div
                  className="aspect-square w-full rounded-full"
                  style={{ background: `radial-gradient(circle at 34% 28%, ${t.hi} 0%, ${t.l} 22%, ${t.m} 58%, ${t.d} 100%)` }}
                />
                <p className="mt-2.5 text-[13px] font-bold text-navy-deep">{name}</p>
                <p className="font-mono text-[11px] uppercase text-fg-muted">{t.m}</p>
              </div>
            )
          })}
        </div>
      </Section>

      {/* in the app */}
      <section className="bg-[linear-gradient(180deg,#f6fbf9,#e3f8ef)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#00a877]">V appce</p>
          <h2 className="mt-2 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-navy-deep">
            Kde bude bydlet
          </h2>
          <p className="mt-3 max-w-[620px] text-[16px] leading-relaxed text-fg-muted">
            Tam, kde je appka jinak prázdná, kde se něco povedlo, nebo kde je potřeba ukázat, co dělat dál.
          </p>

          <div className="mt-10 grid justify-items-center gap-10 md:grid-cols-3">
            <PhoneFrame label="Prázdný stav — ještě žádná skupina">
              <div className="flex h-full flex-col px-5 pt-12">
                <p className="font-display text-[26px] font-extrabold tracking-[-0.03em]">Skupiny</p>
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <Usetrilek pose={byId.premysli.pose} motion={byId.premysli.motion} extras={byId.premysli.extras} size={190} />
                  <p className="mt-1 font-display text-[18px] font-extrabold tracking-[-0.02em]">Zatím žádná skupina</p>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-fg-muted">Najdi předplatné, které chceš sdílet, nebo založ vlastní.</p>
                </div>
                <div className="mb-8 grid h-11 place-items-center rounded-2xl bg-brand text-[14px] font-bold text-brand-foreground">
                  Prozkoumat katalog
                </div>
              </div>
            </PhoneFrame>

            <PhoneFrame label="Platba potvrzená" dark>
              <div className="flex h-full flex-col items-center px-5 pt-14 text-center">
                <Usetrilek pose={byId.hura.pose} motion={byId.hura.motion} extras={byId.hura.extras} size={210} />
                <p className="mt-2 font-display text-[30px] font-extrabold tracking-[-0.03em]">Zaplaceno!</p>
                <p className="mt-1 text-[13px] text-white/60">Netflix · 78 Kč · říjen</p>
                <div className="mt-auto mb-8 grid h-11 w-full place-items-center rounded-2xl bg-brand text-[14px] font-bold text-brand-foreground">
                  Hotovo
                </div>
              </div>
            </PhoneFrame>

            <PhoneFrame label="Domů — hlavička">
              <div className="relative h-[230px] overflow-hidden bg-[radial-gradient(120%_120%_at_80%_0%,#16294f_0%,#0b1730_50%,#050b1a_100%)] px-5 pt-12 text-white">
                <p className="font-display text-[26px] font-extrabold leading-tight tracking-[-0.03em]">
                  Ahoj,
                  <br />
                  Tomáš.
                </p>
                <p className="mt-1 text-[12.5px] text-white/60">Jsi ve 3 skupinách.</p>
                <div className="absolute -bottom-[92px] right-[-26px]">
                  <Usetrilek pose={byId.ahoj.pose} motion={byId.ahoj.motion} size={200} shadow={false} />
                </div>
              </div>
              <div className="relative -mt-6 mx-4 rounded-[22px] bg-white p-4 shadow-[0_18px_40px_-24px_rgba(5,11,26,0.4)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-muted">Tento měsíc šetříš</p>
                <p className="mt-1 font-display text-[30px] font-extrabold tracking-[-0.03em] text-navy-deep">587 Kč</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e3f8ef]">
                  <div className="h-full w-[78%] rounded-full bg-brand" />
                </div>
              </div>
              <div className="mx-4 mt-3 rounded-[22px] bg-white p-4">
                <p className="text-[13px] font-bold text-navy-deep">K zaplacení</p>
                <p className="text-[12px] text-fg-muted">Netflix · 78 Kč · do 3 dnů</p>
              </div>
            </PhoneFrame>
          </div>
        </div>
      </section>

      {/* how it's built */}
      <Section
        eyebrow="Pod kapotou"
        title="Postava jako data"
        lead="Žádné PNG ani Lottie. SVG složené z kódu, stínování jen přechody (žádné blur filtry, co by na telefonu sekaly), pohyb v CSS a animace se zastaví, když zmizí z obrazovky."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <pre className="self-start overflow-x-auto rounded-[24px] bg-navy-deep p-6 font-mono text-[13px] leading-relaxed text-[#bdf5df]">
            {`<Usetrilek
  pose={{
    armR: { upper: -30, fore: -84, hand: 'open' },
    armL: { upper: 101, fore: 97, hand: 'relaxed' },
    face: { eyes: 'open', brows: 'raised', mouth: 'grin' },
    …
  }}
  motion="wave"
/>`}
          </pre>
          <ul className="grid gap-3">
            {[
              ['Kostra', 'Ramena, lokty, zápěstí, kyčle, kolena. Póza = úhly kloubů, takže mezi pózami umí plynule přejít.'],
              ['Výraz', '6 druhů očí, 5 obočí, 9 pus. Mrkání a pohled do strany zvládne sám.'],
              ['Web i mobil', 'Jen tvary a přechody, které umí i react-native-svg — v Expo appce poběží ta samá postava.'],
              ['Výkon', 'Smyčky běží v CSS, ne v JavaScriptu, a mimo obrazovku se pauznou.'],
            ].map(([title, text]) => (
              <li key={title} className="rounded-[22px] border border-border bg-white p-5">
                <p className="font-display text-[17px] font-extrabold text-navy-deep">{title}</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </main>
  )
}
