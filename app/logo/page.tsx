import type { Metadata } from 'next'
import { MARKS, Wordmark, type MarkProps } from '@/components/brand/marks'
import { MascotIcon } from '@/components/brand/MascotLogo'
import { PngDownload } from '@/components/brand/PngDownload'
import { LockupDownload } from '@/components/brand/LockupDownload'
import { WordmarkDownload } from '@/components/brand/WordmarkDownload'
import { AvatarDownload } from '@/components/brand/AvatarDownload'
import { Mascot } from '@/components/illustrations/Mascot'

export const metadata: Metadata = {
  title: 'Ušetři — značka',
  robots: { index: false, follow: false },
}

type MarkComponent = (props: MarkProps) => React.ReactElement

const DARK = 'linear-gradient(150deg, #050b1a 0%, #0d1b36 60%, #0b3a34 100%)'

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="px-7 py-7 border-b border-border/70 last:border-b-0">
      <p className="text-[11px] uppercase tracking-[0.18em] text-fg-muted mb-1">{title}</p>
      {note && <p className="text-[12.5px] text-fg-muted mb-5 max-w-[640px] leading-relaxed">{note}</p>}
      <div className={note ? '' : 'mt-5'}>{children}</div>
    </div>
  )
}

function MascotSystem() {
  return (
    <section className="rounded-[28px] border-2 border-brand bg-white overflow-hidden">
      <header className="flex items-baseline gap-3 px-7 pt-6 pb-5 border-b border-border/70">
        <span className="h-8 px-3 rounded-xl bg-brand text-brand-foreground grid place-items-center font-display font-extrabold text-[13px]">
          HLAVNÍ
        </span>
        <div>
          <h2 className="font-display text-[20px] font-extrabold text-navy-deep tracking-tight">Ušetřík</h2>
          <p className="text-[13px] text-fg-muted mt-0.5">
            Postava z webu, beze změny. Postava nese značku, hlava nese ikonu.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2">
        <div className="p-12 grid place-items-center border-r border-b border-border/70">
          <Mascot size={250} mood="wave" still />
        </div>
        <div className="p-12 grid place-items-center border-b border-border/70" style={{ background: DARK }}>
          <Mascot size={250} mood="cheer" holds="coin" still />
        </div>
      </div>

      <Panel
        title="Postava — hlavní logo"
        note="Pro web, socky, plakáty a reklamy. Od 64 px výš. Každá varianta se stahuje jako PNG 1024 px s průhledným pozadím."
      >
        <div className="flex flex-wrap items-end gap-10">
          <PngDownload filename="usetrik-mava" label="mává">
            <Mascot size={150} mood="wave" still />
          </PngDownload>
          <PngDownload filename="usetrik-jasa-mince" label="jásá s mincí">
            <Mascot size={150} mood="cheer" holds="coin" still />
          </PngDownload>
          <PngDownload filename="usetrik-pytel" label="s pytlem">
            <Mascot size={150} mood="idle" holds="bag" still />
          </PngDownload>
          <PngDownload filename="usetrik-hleda" label="hledá">
            <Mascot size={150} mood="search" still />
          </PngDownload>
          <PngDownload filename="usetrik-premysli" label="přemýšlí">
            <Mascot size={150} mood="think" still />
          </PngDownload>
        </div>
      </Panel>

      <Panel
        title="Ikona — hlava, stejná konstrukce"
        note="App ikona, favicon, avatar. Pod 26 px se pusa zavírá do úsměvu a mizí odlesky v očích — otevřená pusa by se slila do šmouhy. Nad 44 px přibude jiskra."
      >
        <div className="flex items-end gap-9 mb-8">
          {[96, 64, 44, 32, 24, 16].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <MascotIcon size={s} />
              <span className="font-mono text-[10px] text-fg-muted">{s}px</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-10">
          <PngDownload filename="usetri-ikona" label="ikona">
            <MascotIcon size={120} />
          </PngDownload>
          <PngDownload filename="usetri-ikona-tmava" label="na tmavém" background="#0d1b36">
            <MascotIcon size={120} tone="onDark" />
          </PngDownload>
          <PngDownload filename="usetri-ikona-app" label="app ikona" size={1024} background="#0d1b36">
            <MascotIcon size={120} />
          </PngDownload>
          <PngDownload filename="usetri-favicon" label="favicon" size={512}>
            <MascotIcon size={120} />
          </PngDownload>
        </div>
      </Panel>

      <Panel
        title="Lockup na instalaci — Ušetřík a pod ním název"
        note="Čtverec, takže přežije každý ořez. Tohle nahraj jako app ikonu, profilovku nebo logo do obchodu."
      >
        <div className="flex flex-wrap items-start gap-10">
          <LockupDownload filename="usetri-logo" label="na světlém" />
          <LockupDownload filename="usetri-logo-tmave" label="na tmavém" dark />
          <LockupDownload filename="usetri-logo-mava" label="mává" mood="wave" holds={undefined} />
        </div>
      </Panel>

      <Panel title="Další lockupy">
        <div className="flex flex-wrap items-center gap-14">
          <div className="flex items-center gap-4">
            <Mascot size={92} mood="wave" still />
            <Wordmark size={38} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Mascot size={92} mood="cheer" holds="coin" still />
            <Wordmark size={26} />
          </div>
          <div className="flex items-center gap-3">
            <MascotIcon size={44} />
            <Wordmark size={30} />
          </div>
        </div>
      </Panel>

      <Panel title="Na sockách">
        <div className="flex flex-wrap items-start gap-7">
          <div className="flex flex-col items-center gap-2">
            <div className="h-24 w-24 rounded-full bg-white border border-border grid place-items-center overflow-hidden">
              <MascotIcon size={96} />
            </div>
            <span className="font-mono text-[10px] text-fg-muted">avatar</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-24 w-24 rounded-full grid place-items-center overflow-hidden" style={{ background: DARK }}>
              <MascotIcon size={96} tone="onDark" />
            </div>
            <span className="font-mono text-[10px] text-fg-muted">avatar tmavý</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-24 w-24 rounded-[26px] grid place-items-center overflow-hidden"
              style={{ background: 'linear-gradient(150deg, #0d1b36 0%, #0b3a34 120%)' }}
            >
              <MascotIcon size={92} />
            </div>
            <span className="font-mono text-[10px] text-fg-muted">app ikona</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-24 w-[183px] rounded-2xl overflow-hidden relative flex items-center px-4 gap-2"
              style={{ background: DARK }}
            >
              <Mascot size={64} mood="cheer" holds="coin" still />
              <div className="min-w-0">
                <Wordmark size={17} tone="light" />
                <p className="text-[7.5px] text-white/55 mt-1 leading-tight">plať jen svůj podíl</p>
              </div>
            </div>
            <span className="font-mono text-[10px] text-fg-muted">OG / cover</span>
          </div>
        </div>
      </Panel>
    </section>
  )
}

function Concept({ id, name, note, Mark }: { id: string; name: string; note: string; Mark: MarkComponent }) {
  return (
    <section className="rounded-[28px] border border-border bg-white overflow-hidden">
      <header className="flex items-baseline gap-3 px-7 pt-6 pb-5 border-b border-border/70">
        <span className="h-8 w-8 rounded-xl bg-navy-deep text-white grid place-items-center font-display font-extrabold text-[15px]">
          {id}
        </span>
        <div>
          <h2 className="font-display text-[20px] font-extrabold text-navy-deep tracking-tight">{name}</h2>
          <p className="text-[13px] text-fg-muted mt-0.5">{note}</p>
        </div>
      </header>

      <div className="grid grid-cols-2">
        <div className="p-10 grid place-items-center border-r border-b border-border/70">
          <Mark size={120} tone="color" />
        </div>
        <div className="p-10 grid place-items-center border-b border-border/70" style={{ background: DARK }}>
          <Mark size={120} tone="light" />
        </div>
      </div>

      <Panel title="Čitelnost a export">
        <div className="flex items-end gap-9">
          {[64, 32, 24, 16].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <Mark size={s} tone="color" />
              <span className="font-mono text-[10px] text-fg-muted">{s}px</span>
            </div>
          ))}
          <div className="ml-4">
            <PngDownload filename={`usetri-${id.toLowerCase()}`} label="světlá">
              <Mark size={110} tone="color" />
            </PngDownload>
          </div>
          <PngDownload filename={`usetri-${id.toLowerCase()}-tmava`} label="tmavá" background="#0d1b36">
            <Mark size={110} tone="light" />
          </PngDownload>
        </div>
      </Panel>
    </section>
  )
}

export default function LogoPage() {
  return (
    <main className="min-h-screen bg-surface px-10 py-16">
      <div className="max-w-[1180px] mx-auto">
        <header className="mb-12">
          <Wordmark size={34} />
          <h1 className="font-display text-[46px] font-extrabold text-navy-deep tracking-[-0.04em] mt-6 leading-none">
            Značka
          </h1>
          <p className="text-[17px] text-fg-muted mt-4 max-w-[680px] leading-relaxed">
            Logo je Ušetřík z webu, nekreslený znovu. Celá postava jde tam, kde má místo —
            web, socky, plakáty, reklamy. Jeho hlava jde tam, kde je 32 px a ostrý ořez —
            favicon, app ikona, avatar. Každá varianta má pod sebou tlačítko, které ji stáhne
            jako PNG.
          </p>
        </header>

        <AvatarDownload />

        <div className="h-8" />

        <WordmarkDownload />

        <div className="h-8" />

        <MascotSystem />

        <div className="flex items-center gap-4 mt-16 mb-6">
          <h2 className="font-display text-[15px] font-extrabold uppercase tracking-[0.18em] text-fg-muted">
            Abstraktní alternativy — pro srovnání
          </h2>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-8">
          {MARKS.map((m) => (
            <Concept key={m.id} id={m.id} name={m.name} note={m.note} Mark={m.Mark} />
          ))}
        </div>
      </div>
    </main>
  )
}
