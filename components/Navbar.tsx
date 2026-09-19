'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const links = [
  { label: 'Předplatná', href: '/predplatna' },
  { label: 'Jak to funguje', href: '/#jak-to-funguje' },
  { label: 'Kalkulačka', href: '/#kalkulacka' },
  { label: 'FAQ', href: '/#faq' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const light = scrolled

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        light ? 'bg-white/85 backdrop-blur-xl border-b border-border py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4">
        <Link
          href="/"
          className={`font-display font-extrabold text-xl tracking-tight transition-colors ${
            light ? 'text-navy-deep' : 'text-white'
          }`}
        >
          Ušetři<span className="text-brand">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors ${
                light ? 'text-fg-muted hover:text-navy-deep' : 'text-white/70 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Button
          className={`rounded-xl transition-colors ${
            light
              ? 'bg-navy-deep hover:bg-navy text-white'
              : 'bg-brand text-brand-foreground hover:bg-brand-soft'
          }`}
        >
          Založit akci
        </Button>
      </div>
    </header>
  )
}
