import Link from 'next/link'
import { Mascot } from './illustrations/Mascot'
import { InstagramGlyph } from './illustrations/SocialGlyphs'
import { LEGAL_PAGES } from '@/lib/legal'

export const INSTAGRAM = {
  handle: '@usetri.app',
  url: 'https://www.instagram.com/usetri.app/',
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-navy-deep text-white py-12 px-4">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row justify-between items-center gap-8">
        <span className="flex items-center gap-2 font-display font-extrabold text-xl">
          <Mascot size={44} mood="sleep" />
          Ušetři<span className="text-brand">.</span>
        </span>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/60">
          {LEGAL_PAGES.map((page) => (
            <Link key={page.href} href={page.href} className="transition-colors hover:text-white">
              {page.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <a
            href={INSTAGRAM.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Ušetři na Instagramu, ${INSTAGRAM.handle}`}
            className="group inline-flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:border-brand/40 hover:bg-white/10 hover:text-white"
          >
            <InstagramGlyph className="h-[18px] w-[18px] transition-colors group-hover:text-brand" />
            {INSTAGRAM.handle}
          </a>
          <span className="text-sm text-white/40">© 2026</span>
        </div>
      </div>
    </footer>
  )
}
