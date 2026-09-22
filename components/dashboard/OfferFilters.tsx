'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import { categories } from '@/types/service'

export function OfferFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  const activeCategory = params.get('kategorie') ?? ''
  const [query, setQuery] = useState(params.get('q') ?? '')

  const push = (next: { q?: string; kategorie?: string }) => {
    const sp = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(next)) {
      if (value) sp.set(key, value)
      else sp.delete(key)
    }
    startTransition(() => router.replace(sp.size ? `?${sp}` : '/dashboard/nabidky', { scroll: false }))
  }

  // Debounced so every keystroke doesn't hit the server.
  useEffect(() => {
    const current = params.get('q') ?? ''
    if (query === current) return
    const id = setTimeout(() => push({ q: query }), 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hledej službu nebo člověka…"
          aria-label="Hledat v nabídkách"
          className="h-12 w-full rounded-xl border border-border bg-white pl-11 pr-10 text-[15px] text-navy-deep outline-none transition placeholder:text-fg-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/15"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Zrušit hledání"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-fg-muted hover:text-navy-deep"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <Chip active={!activeCategory} onClick={() => push({ kategorie: '' })}>
          Vše
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.id}
            active={activeCategory === c.id}
            onClick={() => push({ kategorie: activeCategory === c.id ? '' : c.id })}
          >
            {c.label}
          </Chip>
        ))}
      </div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
        active
          ? 'border-navy-deep bg-navy-deep text-white'
          : 'border-border bg-white text-fg-muted hover:border-navy-deep/30 hover:text-navy-deep'
      }`}
    >
      {children}
    </button>
  )
}
