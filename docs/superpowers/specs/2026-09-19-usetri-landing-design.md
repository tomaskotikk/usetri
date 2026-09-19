# Ušetři — Landing + Group Detail Design (Frontend MVP)

Date: 2026-09-19
Status: Approved by user, pending spec review

## Purpose

Ušetři connects people to co-buy official multi-user subscriptions (Spotify Duo/Family,
Netflix, Disney+, YouTube Premium, Adobe CC, etc.) and split the cost. An organizer
creates a "group," others join and pay their share. This phase builds **only the
frontend / product marketing layer** — no real payment logic, no real backend. The goal
is a visually strong, trustworthy, sellable product that convinces visitors to try the app
once real functionality ships.

Target audience: people 18–35 — students, roommates, families — who want to save on
streaming/software subscriptions.

## Tech Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- shadcn/ui (buttons, cards, dialogs, inputs, accordion)
- Framer Motion (scroll animations, parallax, number counters)
- Lucide React (icons)
- Supabase client: stub only — typed interfaces, mock data, no real queries. Function
  signatures should match what a real Supabase client call would look like, so swapping
  in real queries later is a drop-in replacement.

## Scope

Two pages:

1. **`/` — Landing page.** Full marketing structure (see below).
2. **`/skupina/[id]` — Group detail page.** Shown when a visitor clicks a subscription
   card from the grid. Minimal content: provider header, plan name, total price, price
   per person (emphasized), spots-taken progress bar, "Přidat se" CTA (mock — no real
   payment flow; clicking shows a toast, e.g. "Platby zatím nejsou napojené", and does
   not change `spotsTaken` or any state), back-to-grid link.

Out of scope for this phase: authentication, real payment processing, organizer
dashboard, user account pages, backend/API routes, database.

## Design System

- **Theme**: Light mode is primary and the only fully-built theme for this MVP. Colors
  are defined as CSS custom properties (`--bg`, `--fg`, `--accent`, `--card-bg`, `--border`,
  etc.) on `:root` so a dark theme can be added later by redefining the same tokens —
  but dark mode itself is **not** built now, just the token structure that makes it
  possible without a rewrite.
- **Accent color**: electric green (`#00C875`-range) — used for primary CTAs, links,
  progress bars, active states. Chosen for the "money / savings" association while
  staying distinct from any single provider's brand color.
- **Provider brand colors**: each `SubscriptionCard` and the group detail header use the
  real provider color as a secondary accent (Spotify green, Netflix red, Disney+ blue,
  YouTube red, Adobe red) so groups are visually distinguishable at a glance.
- **Typography**: Inter (or Geist, loaded via `next/font`) — large high-contrast
  headings, generous white space.
- **Photos**: real people via Unsplash (random/curated URLs), used in the hero
  background collage and testimonial cards. Warm, authentic, not corporate-stock-looking.
- **Motion**: Framer Motion `useScroll`/`useTransform` for hero parallax; fade-in +
  slide-up on scroll for section reveals; hover lift + shadow on cards; animated
  number counters for savings figures and stats.

## Landing Page Structure (in order)

1. **Navbar** — sticky, background blur activates on scroll.
2. **Hero** — large headline ("Plať jen svůj podíl. Ne celé předplatné."), 2-sentence
   subhead, primary CTA ("Založit akci" / "Najít skupinu"), parallax background of
   floating/rotating provider logo icons, and a small teaser calculator: single input
   (current monthly spend) → animated single-number output (cost with Ušetři). This
   teaser is inline hero markup, not the `<SavingsCalculator />` component — it has no
   checkboxes and no annual breakdown; it exists to hook the visitor before section 6's
   full calculator.
3. **Social proof** — row of provider logos (Spotify, Netflix, Disney+, Adobe, YouTube
   Premium, plus Xbox Game Pass shown decoratively to signal "many more providers work
   too" — Xbox Game Pass has no corresponding mock data/card/type entry, logos-row only),
   mock stats (active groups count, average savings %), testimonial cards with Unsplash
   photos + short quotes.
4. **Jak to funguje** — 3–4 step cards with icons, scroll-triggered reveal
   (Najdi/založ skupinu → Zaplať podíl → Organizátor tě přidá → Užívej si předplatné).
5. **Subscription grid** — `SubscriptionCard` components fed by mock data (12–15
   entries across 5 providers), filterable by provider, each card shows logo, plan
   name, price/person, spots-taken progress bar, hover lift+shadow, click routes to
   `/skupina/[id]`.
6. **Savings calculator** — standalone interactive section, rendered by the
   `<SavingsCalculator />` component: user checks which subscriptions they currently pay
   for, app computes and animates estimated annual savings.
7. **FAQ** — shadcn accordion ("Je to legální?", "Co když organizátor přestane platit?",
   "Jak fungují platby?").
8. **Footer** — links, social icons, GDPR/secure-payments trust badges.

Microcopy is in Czech, casual but professional tone — target audience needs to trust the
app with money.

## Components

`<Navbar />`, `<Hero />`, `<ProviderLogos />`, `<HowItWorks />`, `<SubscriptionCard />`,
`<SubscriptionGrid />`, `<SavingsCalculator />`, `<Testimonials />`, `<FAQ />`, `<Footer />`,
plus a group detail view rendered at `/skupina/[id]`.

## Data Layer (stub)

`types/subscription.ts`:

```typescript
interface SubscriptionGroup {
  id: string
  provider: 'spotify' | 'netflix' | 'disney' | 'youtube' | 'adobe'
  planName: string
  totalPrice: number
  pricePerPerson: number
  spotsTotal: number
  spotsTaken: number
  organizerId: string
  createdAt: string
}
```

`lib/mock-data.ts` — 12–15 sample `SubscriptionGroup` records spread across the 5
providers, enough to make the grid look alive and support filtering.

`lib/supabase-stub.ts` — typed functions (`getGroups()`, `getGroupById(id)`) with async
signatures matching what real Supabase calls will look like, returning the mock data.
This is the seam where real Supabase integration plugs in later without touching
components.

## Non-functional requirements

- Accessibility: sufficient contrast, alt text on images, keyboard-navigable
  interactive elements (accordion, calculator inputs, cards).
- Fully responsive, mobile-first (primary target is mobile usage).
- Performance: `next/image` for all images, lazy-load below-the-fold sections.

## Explicitly deferred (not this phase)

- Dark mode theme (tokens are ready, theme itself is not built)
- Real authentication / accounts
- Real payment processing
- Organizer dashboard / group management UI
- Backend API routes / real Supabase queries
