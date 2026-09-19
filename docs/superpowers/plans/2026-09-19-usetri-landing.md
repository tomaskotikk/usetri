# Ušetři Landing + Group Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Ušetři frontend MVP — a Next.js 14 marketing landing page and a group-detail page for a subscription cost-sharing product, fully mocked (no backend/payments), per `docs/superpowers/specs/2026-09-19-usetri-landing-design.md`.

**Architecture:** Single Next.js App Router project. A pure-logic layer (`lib/`, `types/`) holds mock data, a Supabase-shaped stub client, and savings-calculator math — this layer gets unit tests (Vitest). UI is composed from small, single-responsibility components under `components/`, assembled into two routes: `app/page.tsx` (landing) and `app/skupina/[id]/page.tsx` (detail). Visual/motion work is verified manually via the dev server (no snapshot/visual tests — see Testing Strategy).

**Tech Stack:** Next.js 14 (App Router, TypeScript), Tailwind CSS, shadcn/ui (button, accordion, progress, input, toast via `sonner`), Framer Motion, Lucide React, Vitest (logic tests only).

---

## Testing Strategy

- **Unit-tested (TDD):** `lib/savings.ts` (pure math), `lib/supabase-stub.ts` (shape/behavior), `lib/mock-data.ts` (schema conformance of every record).
- **Not unit-tested:** presentational components (`Navbar`, `Hero`, `ProviderLogos`, etc.) — these are verified by running the dev server and visually checking the golden path and responsive breakpoints (use the `run` skill), per project convention that UI correctness needs a real browser check, not asserted DOM structure.
- Test runner: Vitest, colocated as `*.test.ts` next to the file under test.

## File Structure

```
usetri/
  app/
    layout.tsx            # root layout, font loading, globals.css import
    page.tsx               # landing page — composes all sections
    globals.css             # design tokens (CSS vars), Tailwind base
    skupina/[id]/page.tsx   # group detail page
    skupina/[id]/toast-cta.tsx  # mock "Přidat se" CTA, client component
  types/
    subscription.ts         # SubscriptionGroup interface
  lib/
    mock-data.ts             # 12-15 SubscriptionGroup records
    mock-data.test.ts
    supabase-stub.ts         # getGroups(), getGroupById()
    supabase-stub.test.ts
    savings.ts               # pure calculator functions
    savings.test.ts
  components/
    AnimatedNumber.tsx
    Navbar.tsx
    Hero.tsx
    ProviderLogos.tsx
    HowItWorks.tsx
    SubscriptionCard.tsx
    SubscriptionGrid.tsx
    SavingsCalculator.tsx
    Testimonials.tsx
    FAQ.tsx
    Footer.tsx
    ui/                      # shadcn-generated (button, accordion, progress, input, sonner)
  vitest.config.ts
  tailwind.config.ts
  package.json
```

---

### Task 1: Scaffold Next.js project + Tailwind + shadcn/ui

**Files:**
- Create: entire project scaffold in `C:/Users/tomas/Desktop/Usetri` (already git-initialized, has `docs/`)

- [ ] **Step 1: Scaffold Next.js app in place**

Run (answer prompts: TypeScript yes, ESLint yes, Tailwind yes, `src/` no, App Router yes, import alias `@/*`):

```bash
npx create-next-app@latest . --typescript --eslint --tailwind --app --no-src-dir --import-alias "@/*" --use-npm
```

Expected: project files created alongside existing `docs/` and `.git/` without overwriting them.

- [ ] **Step 2: Init shadcn/ui**

```bash
npx shadcn@latest init -d
```

Expected: creates `components.json`, `lib/utils.ts`, updates `tailwind.config.ts`.

- [ ] **Step 3: Add the shadcn components this project actually uses**

```bash
npx shadcn@latest add button accordion progress input sonner
```

Expected: `components/ui/{button,accordion,progress,input,sonner}.tsx` created. (No `card` or `dialog` — no task uses them; every card-like surface is a plain styled `div`, and the join CTA uses a toast, not a dialog.)

- [ ] **Step 4: Install Framer Motion and Lucide**

```bash
npm install framer-motion lucide-react
```

- [ ] **Step 5: Install Vitest**

```bash
npm install -D vitest @vitejs/plugin-react jsdom
```

No React Testing Library — per the Testing Strategy, components are verified manually in the browser, not with rendered-DOM assertions, so RTL is never imported by any task.

- [ ] **Step 6: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 7: Add `"test": "vitest run"` script to `package.json`**

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Tailwind, shadcn/ui, Vitest"
```

---

### Task 2: Design tokens + fonts

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/globals.css` token section with Ušetři theme**

Add at the top of `app/globals.css` (keep Tailwind's `@tailwind` directives below it):

```css
:root {
  --bg: #ffffff;
  --bg-subtle: #fafafa;
  --fg: #111418;
  --fg-muted: #5a6472;
  --accent: #00c875;
  --accent-fg: #05231a;
  --border: #e6e8eb;
  --card-bg: #ffffff;

  --provider-spotify: #1db954;
  --provider-netflix: #e50914;
  --provider-disney: #113ccf;
  --provider-youtube: #ff0000;
  --provider-adobe: #a020f0;
}

body {
  background: var(--bg);
  color: var(--fg);
}
```

Note: `--provider-adobe` is purple, not Adobe's real brand red, specifically so it doesn't collide with `--provider-youtube` (`#ff0000`) — the spec's requirement is that provider colors make cards "visually distinguishable at a glance," which two identical reds would defeat.

- [ ] **Step 2: Load Inter via `next/font` in `app/layout.tsx`**

```tsx
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

`Toaster` renders the `sonner` toast portal used by the group detail page's "Přidat se" CTA (Task 14) — without it, `toast(...)` calls silently do nothing.

- [ ] **Step 3: Set `fontFamily.sans` and accent/border colors in `tailwind.config.ts`**

`create-next-app` + `shadcn init` will have already generated `tailwind.config.ts` with a `content` array and a `theme.extend` block (shadcn adds its own `colors`/`borderRadius` entries there). Merge the `fontFamily` and `colors.accent`/`colors.border` keys shown below into that existing `theme.extend` object — do not replace the file, add to it:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ...keep whatever shadcn init already generated here (border, input,
        // ring, background, foreground, primary, secondary, etc.)...
        accent: 'var(--accent)',
        border: 'var(--border)',
      },
      borderRadius: {
        // ...keep shadcn's generated lg/md/sm radius values here...
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
```

- [ ] **Step 4: Run dev server, confirm page renders with Inter font and white background**

```bash
npm run dev
```

Visit `http://localhost:3000` — expect default Next.js starter page styled with Inter.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx tailwind.config.ts
git commit -m "feat: add design tokens and Inter font"
```

---

### Task 3: `SubscriptionGroup` type

**Files:**
- Create: `types/subscription.ts`

- [ ] **Step 1: Write the type**

```typescript
export type Provider = 'spotify' | 'netflix' | 'disney' | 'youtube' | 'adobe'

export interface SubscriptionGroup {
  id: string
  provider: Provider
  planName: string
  totalPrice: number
  pricePerPerson: number
  spotsTotal: number
  spotsTaken: number
  organizerId: string
  createdAt: string
}
```

- [ ] **Step 2: Commit**

```bash
git add types/subscription.ts
git commit -m "feat: add SubscriptionGroup type"
```

---

### Task 4: Mock data (TDD)

**Files:**
- Create: `lib/mock-data.test.ts`
- Create: `lib/mock-data.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import { mockGroups } from './mock-data'
import type { Provider } from '@/types/subscription'

const validProviders: Provider[] = ['spotify', 'netflix', 'disney', 'youtube', 'adobe']

describe('mockGroups', () => {
  it('has between 12 and 15 records', () => {
    expect(mockGroups.length).toBeGreaterThanOrEqual(12)
    expect(mockGroups.length).toBeLessThanOrEqual(15)
  })

  it('every record has a valid provider and consistent pricing/spots', () => {
    for (const g of mockGroups) {
      expect(validProviders).toContain(g.provider)
      expect(g.pricePerPerson).toBeCloseTo(g.totalPrice / g.spotsTotal, 1)
      expect(g.spotsTaken).toBeLessThanOrEqual(g.spotsTotal)
      expect(g.spotsTaken).toBeGreaterThanOrEqual(0)
    }
  })

  it('has unique ids', () => {
    const ids = mockGroups.map((g) => g.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('covers all 5 providers', () => {
    const covered = new Set(mockGroups.map((g) => g.provider))
    expect(covered.size).toBe(5)
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

```bash
npm run test -- mock-data
```

Expected: FAIL — `Cannot find module './mock-data'`

- [ ] **Step 3: Write `lib/mock-data.ts`** (14 records, prices in CZK)

```typescript
import type { SubscriptionGroup } from '@/types/subscription'

export const mockGroups: SubscriptionGroup[] = [
  { id: '1', provider: 'spotify', planName: 'Spotify Family', totalPrice: 259, pricePerPerson: 43, spotsTotal: 6, spotsTaken: 4, organizerId: 'u1', createdAt: '2026-08-01' },
  { id: '2', provider: 'spotify', planName: 'Spotify Duo', totalPrice: 165, pricePerPerson: 83, spotsTotal: 2, spotsTaken: 1, organizerId: 'u2', createdAt: '2026-08-03' },
  { id: '3', provider: 'netflix', planName: 'Netflix Premium (4K, 4 obrazovky)', totalPrice: 309, pricePerPerson: 78, spotsTotal: 4, spotsTaken: 2, organizerId: 'u3', createdAt: '2026-08-05' },
  { id: '4', provider: 'netflix', planName: 'Netflix Standard', totalPrice: 229, pricePerPerson: 77, spotsTotal: 3, spotsTaken: 3, organizerId: 'u4', createdAt: '2026-07-20' },
  { id: '5', provider: 'disney', planName: 'Disney+ Standard', totalPrice: 189, pricePerPerson: 48, spotsTotal: 4, spotsTaken: 1, organizerId: 'u5', createdAt: '2026-08-10' },
  { id: '6', provider: 'disney', planName: 'Disney+ Premium', totalPrice: 269, pricePerPerson: 68, spotsTotal: 4, spotsTaken: 2, organizerId: 'u6', createdAt: '2026-08-12' },
  { id: '7', provider: 'youtube', planName: 'YouTube Premium Family', totalPrice: 279, pricePerPerson: 47, spotsTotal: 6, spotsTaken: 5, organizerId: 'u7', createdAt: '2026-08-02' },
  { id: '8', provider: 'youtube', planName: 'YouTube Premium Family', totalPrice: 279, pricePerPerson: 56, spotsTotal: 5, spotsTaken: 2, organizerId: 'u8', createdAt: '2026-08-15' },
  { id: '9', provider: 'adobe', planName: 'Adobe CC All Apps (Teams)', totalPrice: 1450, pricePerPerson: 363, spotsTotal: 4, spotsTaken: 1, organizerId: 'u9', createdAt: '2026-08-08' },
  { id: '10', provider: 'adobe', planName: 'Adobe CC Photography', totalPrice: 349, pricePerPerson: 175, spotsTotal: 2, spotsTaken: 1, organizerId: 'u10', createdAt: '2026-08-18' },
  { id: '11', provider: 'spotify', planName: 'Spotify Family', totalPrice: 259, pricePerPerson: 52, spotsTotal: 5, spotsTaken: 3, organizerId: 'u11', createdAt: '2026-08-20' },
  { id: '12', provider: 'netflix', planName: 'Netflix Premium (4K, 4 obrazovky)', totalPrice: 309, pricePerPerson: 103, spotsTotal: 3, spotsTaken: 1, organizerId: 'u12', createdAt: '2026-08-22' },
  { id: '13', provider: 'disney', planName: 'Disney+ Standard', totalPrice: 189, pricePerPerson: 63, spotsTotal: 3, spotsTaken: 2, organizerId: 'u13', createdAt: '2026-08-25' },
  { id: '14', provider: 'youtube', planName: 'YouTube Premium Duo', totalPrice: 179, pricePerPerson: 90, spotsTotal: 2, spotsTaken: 1, organizerId: 'u14', createdAt: '2026-08-27' },
]
```

- [ ] **Step 4: Run test, verify it passes**

```bash
npm run test -- mock-data
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/mock-data.ts lib/mock-data.test.ts
git commit -m "feat: add mock subscription group data"
```

---

### Task 5: Supabase stub client (TDD)

**Files:**
- Create: `lib/supabase-stub.test.ts`
- Create: `lib/supabase-stub.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import { getGroups, getGroupById } from './supabase-stub'

describe('supabase-stub', () => {
  it('getGroups resolves with all mock groups', async () => {
    const groups = await getGroups()
    expect(groups.length).toBeGreaterThan(0)
  })

  it('getGroupById resolves the matching group', async () => {
    const groups = await getGroups()
    const target = groups[0]
    const found = await getGroupById(target.id)
    expect(found?.id).toBe(target.id)
  })

  it('getGroupById resolves undefined for an unknown id', async () => {
    const found = await getGroupById('does-not-exist')
    expect(found).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

```bash
npm run test -- supabase-stub
```

Expected: FAIL — module not found

- [ ] **Step 3: Write `lib/supabase-stub.ts`**

```typescript
import type { SubscriptionGroup } from '@/types/subscription'
import { mockGroups } from './mock-data'

export async function getGroups(): Promise<SubscriptionGroup[]> {
  return mockGroups
}

export async function getGroupById(id: string): Promise<SubscriptionGroup | undefined> {
  return mockGroups.find((g) => g.id === id)
}
```

- [ ] **Step 4: Run test, verify it passes**

```bash
npm run test -- supabase-stub
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/supabase-stub.ts lib/supabase-stub.test.ts
git commit -m "feat: add mocked Supabase-shaped data client"
```

---

### Task 6: Savings calculator math (TDD)

**Files:**
- Create: `lib/savings.test.ts`
- Create: `lib/savings.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest'
import { estimateSharedCost, estimateAnnualSavings } from './savings'

describe('estimateSharedCost', () => {
  it('returns ~35% of current spend as the shared-cost estimate', () => {
    expect(estimateSharedCost(400)).toBeCloseTo(140, 0)
  })

  it('returns 0 for 0 or negative input', () => {
    expect(estimateSharedCost(0)).toBe(0)
    expect(estimateSharedCost(-50)).toBe(0)
  })
})

describe('estimateAnnualSavings', () => {
  it('sums monthly prices and returns annual savings at the shared-cost ratio', () => {
    // monthly total 300 -> shared ~105 -> monthly savings ~195 -> annual ~2340
    expect(estimateAnnualSavings([150, 150])).toBeCloseTo(2340, -1)
  })

  it('returns 0 for an empty list', () => {
    expect(estimateAnnualSavings([])).toBe(0)
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

```bash
npm run test -- savings
```

Expected: FAIL — module not found

- [ ] **Step 3: Write `lib/savings.ts`**

```typescript
const SHARED_COST_RATIO = 0.35

export function estimateSharedCost(currentMonthlySpend: number): number {
  if (currentMonthlySpend <= 0) return 0
  return currentMonthlySpend * SHARED_COST_RATIO
}

export function estimateAnnualSavings(monthlyPrices: number[]): number {
  const total = monthlyPrices.reduce((sum, p) => sum + p, 0)
  if (total <= 0) return 0
  const monthlySavings = total - estimateSharedCost(total)
  return monthlySavings * 12
}
```

- [ ] **Step 4: Run test, verify it passes**

```bash
npm run test -- savings
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/savings.ts lib/savings.test.ts
git commit -m "feat: add savings calculator math"
```

---

### Task 7: `Navbar` component

**Files:**
- Create: `components/Navbar.tsx`

- [ ] **Step 1: Implement sticky navbar with scroll-blur**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors ${
        scrolled ? 'bg-white/80 backdrop-blur-md border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
        <span className="font-bold text-lg">Ušetři</span>
        <Button className="bg-accent text-accent-fg hover:bg-accent/90">Založit akci</Button>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Manually verify** — add `<Navbar />` temporarily to `app/page.tsx`, run `npm run dev`, scroll and confirm blur activates. Remove the temporary usage (real usage comes in Task 15).

- [ ] **Step 3: Commit**

```bash
git add components/Navbar.tsx
git commit -m "feat: add Navbar component"
```

---

### Task 8: `AnimatedNumber` + `Hero` component with teaser calculator

**Files:**
- Create: `components/AnimatedNumber.tsx`
- Create: `components/Hero.tsx`

- [ ] **Step 1: Implement a shared animated-counter component** (spec requires "animated number counters for savings figures and stats" — this is reused in Hero, ProviderLogos, and SavingsCalculator)

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion'

export function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { damping: 20, stiffness: 100 })
  const display = useTransform(spring, (v) => `${Math.round(v).toLocaleString('cs-CZ')}${suffix}`)
  const isFirstRender = useRef(true)

  useEffect(() => {
    motionValue.set(value)
    isFirstRender.current = false
  }, [value, motionValue])

  return <motion.span>{display}</motion.span>
}
```

- [ ] **Step 2: Implement hero with parallax bg, headline, and single-input teaser calculator**

```tsx
'use client'
import { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimatedNumber } from './AnimatedNumber'
import { estimateSharedCost } from '@/lib/savings'

export function Hero() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 400], [0, 100])
  const [spend, setSpend] = useState(500)

  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-4">
      <motion.div style={{ y }} className="absolute inset-0 -z-10 opacity-10 text-6xl flex flex-wrap gap-8 p-8">
        {'🎵🎬✨📺🎨'.repeat(4)}
      </motion.div>

      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Plať jen svůj podíl.
          <br />
          Ne celé předplatné.
        </h1>
        <p className="mt-4 text-lg text-[color:var(--fg-muted)]">
          Spoj se s lidmi a sdílejte oficiální rodinná předplatná Spotify, Netflix, Disney+
          a dalších. Ušetři až 65 % měsíčně.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" className="bg-accent text-accent-fg hover:bg-accent/90">
            Založit akci
          </Button>
          <Button size="lg" variant="outline">
            Najít skupinu
          </Button>
        </div>

        <div className="mt-12 mx-auto max-w-sm rounded-xl border border-border bg-white p-6 shadow-sm">
          <label className="text-sm font-medium block mb-2">Kolik teď platíš měsíčně?</label>
          <Input
            type="number"
            value={spend}
            onChange={(e) => setSpend(Number(e.target.value))}
            className="text-center text-lg"
          />
          <p className="mt-4 text-sm text-[color:var(--fg-muted)]">S Ušetři bys platil/a jen</p>
          <p className="text-3xl font-extrabold text-accent">
            <AnimatedNumber value={Math.round(estimateSharedCost(spend))} suffix=" Kč" />
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Manually verify** — temporarily render in `app/page.tsx`, run dev server, confirm the number animates (counts up/down) when you change the input and the background icons parallax-shift on scroll.

- [ ] **Step 4: Commit**

```bash
git add components/AnimatedNumber.tsx components/Hero.tsx
git commit -m "feat: add Hero component, animated counter, and teaser calculator"
```

---

### Task 9: `ProviderLogos` + `Testimonials` (social proof)

**Files:**
- Create: `components/ProviderLogos.tsx`
- Create: `components/Testimonials.tsx`

- [ ] **Step 1: Implement `ProviderLogos`**

```tsx
import { AnimatedNumber } from './AnimatedNumber'

const providers = ['Spotify', 'Netflix', 'Disney+', 'Adobe', 'YouTube Premium', 'Xbox Game Pass']

export function ProviderLogos() {
  return (
    <section className="py-12 border-y border-border bg-[color:var(--bg-subtle)]">
      <div className="mx-auto max-w-5xl px-4">
        <p className="text-center text-sm text-[color:var(--fg-muted)] mb-6">
          Funguje se všemi hlavními poskytovateli
        </p>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 font-semibold text-[color:var(--fg-muted)]">
          {providers.map((p) => (
            <span key={p}>{p}</span>
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-10 text-center">
          <div>
            <p className="text-3xl font-extrabold text-accent">
              <AnimatedNumber value={2400} suffix="+" />
            </p>
            <p className="text-sm text-[color:var(--fg-muted)]">aktivních skupin</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-accent">
              <AnimatedNumber value={62} suffix=" %" />
            </p>
            <p className="text-sm text-[color:var(--fg-muted)]">průměrná úspora</p>
          </div>
        </div>
      </div>
    </section>
  )
}
```

`AnimatedNumber` was created in Task 8 — this component animates from 0 up to the target value once it mounts.

- [ ] **Step 2: Implement `Testimonials`** (Unsplash photo URLs use fixed seeds so they don't change on reload)

```tsx
import Image from 'next/image'

const testimonials = [
  { name: 'Tereza, 24', quote: 'Konečně platím jen za Netflix, co fakt sleduju.', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
  { name: 'Matěj, 21', quote: 'S kámoši ze studentáku sdílíme Spotify Family, super jednoduché.', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  { name: 'Klára, 29', quote: 'Adobe CC bych si sama nikdy nedovolila, takhle je to v pohodě.', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
]

export function Testimonials() {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-3">
              <Image src={t.photo} alt={t.name} width={40} height={40} className="rounded-full object-cover" />
              <span className="font-medium">{t.name}</span>
            </div>
            <p className="text-[color:var(--fg-muted)]">"{t.quote}"</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Allow Unsplash images in `next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
}
module.exports = nextConfig
```

- [ ] **Step 4: Manually verify** — render both temporarily in `app/page.tsx`, confirm photos load and stats display.

- [ ] **Step 5: Commit**

```bash
git add components/ProviderLogos.tsx components/Testimonials.tsx next.config.js
git commit -m "feat: add ProviderLogos and Testimonials sections"
```

---

### Task 10: `HowItWorks` component

**Files:**
- Create: `components/HowItWorks.tsx`

- [ ] **Step 1: Implement with scroll-reveal**

```tsx
'use client'
import { motion } from 'framer-motion'
import { Search, CreditCard, UserPlus, PartyPopper } from 'lucide-react'

const steps = [
  { icon: Search, title: 'Najdi nebo založ skupinu', desc: 'Vyber si předplatné a skupinu s volným místem.' },
  { icon: CreditCard, title: 'Zaplať svůj podíl', desc: 'Platíš jen svou část, ne celé předplatné.' },
  { icon: UserPlus, title: 'Organizátor tě přidá', desc: 'Dostaneš pozvánku do sdíleného účtu.' },
  { icon: PartyPopper, title: 'Užívej si předplatné', desc: 'Stejný obsah, zlomek ceny.' },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4 bg-[color:var(--bg-subtle)]">
      <h2 className="text-center text-3xl font-bold mb-12">Jak to funguje</h2>
      <div className="mx-auto max-w-5xl grid md:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <step.icon className="mx-auto mb-3 text-accent" size={32} />
            <h3 className="font-semibold mb-1">{step.title}</h3>
            <p className="text-sm text-[color:var(--fg-muted)]">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Manually verify** — render temporarily, scroll into view, confirm staggered fade-in.

- [ ] **Step 3: Commit**

```bash
git add components/HowItWorks.tsx
git commit -m "feat: add HowItWorks component"
```

---

### Task 11: `SubscriptionCard` + `SubscriptionGrid`

**Files:**
- Create: `components/SubscriptionCard.tsx`
- Create: `components/SubscriptionGrid.tsx`

- [ ] **Step 1: Implement `SubscriptionCard`**

```tsx
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import type { SubscriptionGroup } from '@/types/subscription'

const providerColor: Record<SubscriptionGroup['provider'], string> = {
  spotify: 'var(--provider-spotify)',
  netflix: 'var(--provider-netflix)',
  disney: 'var(--provider-disney)',
  youtube: 'var(--provider-youtube)',
  adobe: 'var(--provider-adobe)',
}

export function SubscriptionCard({ group }: { group: SubscriptionGroup }) {
  const spotsLeft = group.spotsTotal - group.spotsTaken
  return (
    <Link
      href={`/skupina/${group.id}`}
      className="block rounded-xl border border-border bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div
        className="w-10 h-10 rounded-lg mb-4"
        style={{ backgroundColor: providerColor[group.provider] }}
      />
      <h3 className="font-semibold">{group.planName}</h3>
      <p className="text-2xl font-extrabold text-accent mt-1">{group.pricePerPerson} Kč<span className="text-sm font-normal text-[color:var(--fg-muted)]">/měsíc</span></p>
      <Progress value={(group.spotsTaken / group.spotsTotal) * 100} className="mt-4" />
      <p className="text-xs text-[color:var(--fg-muted)] mt-1">
        {spotsLeft > 0 ? `${spotsLeft} volných míst` : 'Obsazeno'}
      </p>
    </Link>
  )
}
```

- [ ] **Step 2: Implement `SubscriptionGrid`** with provider filter

```tsx
'use client'
import { useState } from 'react'
import { SubscriptionCard } from './SubscriptionCard'
import type { SubscriptionGroup, Provider } from '@/types/subscription'

const filters: { label: string; value: Provider | 'all' }[] = [
  { label: 'Vše', value: 'all' },
  { label: 'Spotify', value: 'spotify' },
  { label: 'Netflix', value: 'netflix' },
  { label: 'Disney+', value: 'disney' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Adobe', value: 'adobe' },
]

export function SubscriptionGrid({ groups }: { groups: SubscriptionGroup[] }) {
  const [active, setActive] = useState<Provider | 'all'>('all')
  const visible = active === 'all' ? groups : groups.filter((g) => g.provider === active)

  return (
    <section className="py-20 px-4">
      <h2 className="text-center text-3xl font-bold mb-6">Aktivní skupiny</h2>
      <div className="flex justify-center gap-2 flex-wrap mb-10">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActive(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              active === f.value ? 'bg-accent text-accent-fg border-accent' : 'border-border'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mx-auto max-w-5xl grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((g) => (
          <SubscriptionCard key={g.id} group={g} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Manually verify** — render `<SubscriptionGrid groups={mockGroups} />` temporarily, confirm filter buttons work and cards route to `/skupina/[id]` (404 expected until Task 14).

- [ ] **Step 4: Commit**

```bash
git add components/SubscriptionCard.tsx components/SubscriptionGrid.tsx
git commit -m "feat: add SubscriptionCard and filterable SubscriptionGrid"
```

---

### Task 12: `SavingsCalculator` (full, checkbox-based)

**Files:**
- Create: `components/SavingsCalculator.tsx`

- [ ] **Step 1: Implement using `estimateAnnualSavings`**

```tsx
'use client'
import { useState } from 'react'
import { AnimatedNumber } from './AnimatedNumber'
import { estimateAnnualSavings } from '@/lib/savings'

const options = [
  { label: 'Spotify Family', price: 65 },
  { label: 'Netflix Premium', price: 78 },
  { label: 'Disney+', price: 48 },
  { label: 'YouTube Premium', price: 47 },
  { label: 'Adobe CC', price: 363 },
]

export function SavingsCalculator() {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (label: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }

  const selectedPrices = options.filter((o) => checked.has(o.label)).map((o) => o.price)
  const annualSavings = estimateAnnualSavings(selectedPrices)

  return (
    <section className="py-20 px-4 bg-[color:var(--bg-subtle)]">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-3xl font-bold mb-6">Kolik bys ušetřil/a za rok?</h2>
        <div className="text-left rounded-xl border border-border bg-white p-6">
          {options.map((o) => (
            <label key={o.label} className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                checked={checked.has(o.label)}
                onChange={() => toggle(o.label)}
              />
              <span className="flex-1">{o.label}</span>
              <span className="text-[color:var(--fg-muted)]">{o.price} Kč/měs</span>
            </label>
          ))}
        </div>
        <p className="mt-6 text-sm text-[color:var(--fg-muted)]">Odhadovaná roční úspora</p>
        <p className="text-4xl font-extrabold text-accent">
          <AnimatedNumber value={Math.round(annualSavings)} suffix=" Kč" />
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Manually verify** — render temporarily, check boxes, confirm number animates/updates.

- [ ] **Step 3: Commit**

```bash
git add components/SavingsCalculator.tsx
git commit -m "feat: add full SavingsCalculator section"
```

---

### Task 13: `FAQ` + `Footer`

**Files:**
- Create: `components/FAQ.tsx`
- Create: `components/Footer.tsx`

- [ ] **Step 1: Implement `FAQ`**

```tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  { q: 'Je to legální?', a: 'Ano — sdílíš oficiální rodinné/multi-user plány přesně tak, jak to poskytovatelé umožňují.' },
  { q: 'Co když organizátor přestane platit?', a: 'Skupina dostane upozornění a může si najít nového organizátora nebo se přeskupit.' },
  { q: 'Jak fungují platby?', a: 'V této verzi je platební tok jen ukázkový — reálné platby zatím nejsou napojené.' },
]

export function FAQ() {
  return (
    <section className="py-20 px-4">
      <h2 className="text-center text-3xl font-bold mb-10">Časté otázky</h2>
      <Accordion type="single" collapsible className="mx-auto max-w-2xl">
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`item-${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
```

- [ ] **Step 2: Implement `Footer`**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-border py-10 px-4 text-sm text-[color:var(--fg-muted)]">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row justify-between gap-4">
        <span>© 2026 Ušetři</span>
        <div className="flex gap-4">
          <span>GDPR</span>
          <span>Bezpečné platby</span>
          <span>Podmínky</span>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Manually verify** — render both temporarily, confirm accordion expands/collapses.

- [ ] **Step 4: Commit**

```bash
git add components/FAQ.tsx components/Footer.tsx
git commit -m "feat: add FAQ and Footer components"
```

---

### Task 14: Group detail page

**Files:**
- Create: `app/skupina/[id]/page.tsx`

- [ ] **Step 1: Implement server component fetching via the stub**

```tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGroupById } from '@/lib/supabase-stub'
import { Progress } from '@/components/ui/progress'
import { ToastCta } from './toast-cta'

export default async function GroupDetailPage({ params }: { params: { id: string } }) {
  const group = await getGroupById(params.id)
  if (!group) notFound()

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm text-[color:var(--fg-muted)]">← Zpět na skupiny</Link>
        <h1 className="text-3xl font-bold mt-4">{group.planName}</h1>
        <p className="text-[color:var(--fg-muted)] capitalize">{group.provider}</p>

        <div className="mt-6 rounded-xl border border-border p-6">
          <p className="text-sm text-[color:var(--fg-muted)]">Cena za osobu</p>
          <p className="text-4xl font-extrabold text-accent">{group.pricePerPerson} Kč<span className="text-base font-normal">/měsíc</span></p>
          <p className="text-sm text-[color:var(--fg-muted)] mt-2">Celková cena: {group.totalPrice} Kč</p>

          <Progress value={(group.spotsTaken / group.spotsTotal) * 100} className="mt-6" />
          <p className="text-xs text-[color:var(--fg-muted)] mt-1">
            {group.spotsTaken} z {group.spotsTotal} míst obsazeno
          </p>

          <ToastCta />
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Implement the mock CTA as a small client component using the `sonner` toast** (`app/skupina/[id]/toast-cta.tsx`)

```tsx
'use client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function ToastCta() {
  return (
    <div className="mt-6">
      <Button
        className="w-full bg-accent text-accent-fg hover:bg-accent/90"
        onClick={() => toast('Platby zatím nejsou napojené — tohle je jen ukázka.')}
      >
        Přidat se
      </Button>
    </div>
  )
}
```

- [ ] **Step 3: Manually verify** — run dev server, visit `/skupina/1`, confirm data renders; visit `/skupina/does-not-exist`, confirm Next.js 404 page; click "Přidat se", confirm message appears and no data changes.

- [ ] **Step 4: Commit**

```bash
git add app/skupina
git commit -m "feat: add group detail page with mock join CTA"
```

---

### Task 15: Assemble landing page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Compose all sections in spec order**

```tsx
import { Navbar } from '@/components/Navbar'
import dynamic from 'next/dynamic'
import { Hero } from '@/components/Hero'
import { ProviderLogos } from '@/components/ProviderLogos'
import { getGroups } from '@/lib/supabase-stub'

// Below-the-fold sections load lazily so the hero paints first (spec NFR: lazy-load below-the-fold sections)
const Testimonials = dynamic(() => import('@/components/Testimonials').then((m) => m.Testimonials))
const HowItWorks = dynamic(() => import('@/components/HowItWorks').then((m) => m.HowItWorks))
const SubscriptionGrid = dynamic(() => import('@/components/SubscriptionGrid').then((m) => m.SubscriptionGrid))
const SavingsCalculator = dynamic(() => import('@/components/SavingsCalculator').then((m) => m.SavingsCalculator))
const FAQ = dynamic(() => import('@/components/FAQ').then((m) => m.FAQ))
const Footer = dynamic(() => import('@/components/Footer').then((m) => m.Footer))

export default async function Home() {
  const groups = await getGroups()

  return (
    <>
      <Navbar />
      <Hero />
      <ProviderLogos />
      <Testimonials />
      <HowItWorks />
      <SubscriptionGrid groups={groups} />
      <SavingsCalculator />
      <FAQ />
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Run full test suite**

```bash
npm run test
```

Expected: all `lib/*.test.ts` pass (11 tests total across Tasks 4-6).

- [ ] **Step 3: Manually verify full page** — use the `run` skill or `npm run dev`, visit `/`, scroll through every section top to bottom, check: navbar blur on scroll, hero teaser calculator responds to input, provider logos + stats visible, testimonial photos load, how-it-works steps fade in on scroll, grid filter switches providers, clicking a card navigates to its detail page, savings calculator checkboxes update the total, FAQ accordion opens/closes, footer renders.

- [ ] **Step 4: Check responsiveness** — resize browser to ~375px width (mobile), confirm no horizontal scroll and all sections stack cleanly.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble landing page from all sections"
```

---

### Task 16: Accessibility + image alt text pass

**Files:**
- Modify: `components/Testimonials.tsx` (alt text already present — verify)
- Modify: `components/Hero.tsx`, `components/SubscriptionCard.tsx` (verify interactive elements are keyboard-reachable)

- [ ] **Step 1: Tab through the full page with keyboard only** (no mouse) — confirm every interactive element (nav CTA, hero input, filter buttons, subscription cards, calculator checkboxes, accordion triggers, "Přidat se" button) is reachable and shows a visible focus ring. Tailwind's default focus rings should already cover this; if any element has `outline-none` without a replacement, add `focus-visible:ring-2 focus-visible:ring-accent`.

- [ ] **Step 2: Confirm color contrast** — check `--fg-muted` (`#5a6472`) on white background meets WCAG AA for body text (it does, ~4.6:1); check accent green (`#00c875`) is never used as text on white for small text (it's used for large numbers only, which is fine at AA-large).

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: accessibility pass on focus states"
```

---

## Definition of Done

- [ ] `npm run test` passes (all `lib/*.test.ts`)
- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] Landing page (`/`) matches the section order and content from the spec
- [ ] Group detail page (`/skupina/[id]`) works for a valid id and 404s for an invalid one
- [ ] Page is usable at 375px width with no horizontal scroll
- [ ] Full keyboard navigation works with visible focus states
