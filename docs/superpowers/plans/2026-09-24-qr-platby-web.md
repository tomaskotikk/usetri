# QR platby (web + databáze) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zakladatel skupiny zadá číslo účtu, členové dostanou české QR platby (SPD), nahlásí „Zaplatil jsem“ a zakladatel platbu potvrdí — vše na webu, zabezpečené v databázi.

**Architecture:** Čisté funkce (`lib/czech-account.ts`, `lib/billing.ts`, `lib/spd.ts`) nesou veškerou logiku a mají testy. Databáze ukládá jen výplatní účet a skutečné platby; splatnosti se dopočítávají z `group_members.billing_start`. RLS + triggery jsou jediná bezpečnostní hranice (mobil zapisuje napřímo). Web čte přes `lib/payments.ts`, zapisuje přes server actions v `app/dashboard/payment-actions.ts`.

**Tech Stack:** Next.js 16 (App Router, server actions), Supabase (Postgres, RLS), Vitest, `qrcode` (SVG na serveru), Tailwind, sonner, lucide-react.

**Spec:** `docs/superpowers/specs/2026-09-24-qr-platby-design.md`

**Mobil (Expo) je mimo tento plán** — samostatný plán po dokončení webu.

**Before you start:**
- Pracuj na větvi: `git checkout -b feat/qr-platby`.
- `AGENTS.md`: tahle verze Next.js se liší od tréninkových dat. Než budeš psát server actions / server components jinak než stávající kód, přečti si příslušný návod v `node_modules/next/dist/docs/`. Drž se vzorů v `app/dashboard/actions.ts` a `components/dashboard/OfferActions.tsx`.
- Supabase projekt: `eveezgloymxzpveltkyq`. Migrace se aplikují přes Supabase MCP `apply_migration`; kopie SQL se ukládá do repa.
- Všechna data plateb jsou řetězce `'YYYY-MM-DD'` v `Europe/Prague`. Nikdy nepředávej JS `Date` mezi vrstvami.

---

## File Structure

| Soubor | Akce | Odpovědnost |
|---|---|---|
| `lib/czech-account.ts` (+ `.test.ts`) | create | parsování českého čísla účtu, kontrolní součet, IBAN tam a zpět, formátování |
| `lib/billing.ts` (+ `.test.ts`) | create | splatnosti, aktuální/další období, stav období, dnešek v Praze |
| `lib/spd.ts` (+ `.test.ts`) | create | SPD řetězec a text zprávy pro příjemce |
| `lib/qr.ts` (+ `.test.ts`) | create | SPD řetězec → SVG QR kódu (jen server) |
| `supabase/migrations/20260924120000_payments_qr.sql` | create | tabulky, sloupce, triggery, RLS |
| `types/database.ts` | modify | typy nových tabulek a sloupců |
| `lib/payments.ts` | create | čtení: výplatní účet, platební pohled skupiny, inbox na přehled |
| `app/dashboard/payment-actions.ts` | create | server actions pro účet a platby |
| `app/dashboard/actions.ts` | modify | `ActionState.ok`, `createOffer` ukládá účet |
| `components/dashboard/OfferActions.tsx` | modify | exportovat `useAction` pro znovupoužití |
| `components/dashboard/AccountInput.tsx` | create | pole čísla účtu s živou validací |
| `components/dashboard/PayoutAccountForm.tsx` | create | formulář uložení účtu (Účet + karta zakladatele) |
| `components/dashboard/CopyButton.tsx` | create | kopírování do schránky |
| `components/dashboard/PaymentStatusBadge.tsx` | create | štítek stavu |
| `components/dashboard/PaymentActions.tsx` | create | tlačítka plateb + ovládání u člena pro zakladatele |
| `components/dashboard/PaymentCard.tsx` | create | karta platby s QR pro člena |
| `components/dashboard/PaymentInbox.tsx` | create | „K zaplacení“ + „Čeká na potvrzení“ na přehledu |
| `components/dashboard/NewOfferForm.tsx` | modify | krok s číslem účtu |
| `app/dashboard/nova/page.tsx` | modify | předvyplnit účet |
| `app/dashboard/ucet/page.tsx` | modify | sekce Výplatní účet |
| `app/dashboard/nabidky/[id]/page.tsx` | modify | platební karta, stavy členů, karta „doplň účet“ |
| `app/dashboard/page.tsx` | modify | PaymentInbox |
| `components/auth/AuthForm.tsx` | modify | věta o 18+ a podmínkách |
| `app/podminky/page.tsx`, `app/ochrana-osobnich-udaju/page.tsx`, `lib/legal.ts` | modify | texty o číslu účtu a QR platbách |

---

### Task 1: Czech account numbers

**Files:**
- Create: `lib/czech-account.ts`
- Test: `lib/czech-account.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/czech-account.test.ts
import { describe, it, expect } from 'vitest'
import { formatAccount, formatIban, parseCzechAccount, toIban } from './czech-account'

describe('parseCzechAccount', () => {
  it('parses an account with a prefix', () => {
    expect(parseCzechAccount('19-2000145399/0800')).toEqual({
      prefix: '19',
      number: '2000145399',
      bank: '0800',
    })
  })

  it('parses an account without a prefix and tolerates spaces', () => {
    expect(parseCzechAccount(' 2000145399 / 0800 ')).toEqual({ prefix: '', number: '2000145399', bank: '0800' })
  })

  it('drops leading zeros from both parts', () => {
    expect(parseCzechAccount('000019-2000145399/0800')?.prefix).toBe('19')
    expect(parseCzechAccount('178124-0000004159/0710')?.number).toBe('4159')
  })

  it('rejects a number that fails the mod-11 checksum', () => {
    expect(parseCzechAccount('123456789/0800')).toBeNull()
  })

  it('rejects a prefix that fails the checksum', () => {
    expect(parseCzechAccount('18-2000145399/0800')).toBeNull()
  })

  it('rejects a malformed bank code and garbage', () => {
    expect(parseCzechAccount('2000145399/800')).toBeNull()
    expect(parseCzechAccount('abc')).toBeNull()
    expect(parseCzechAccount('')).toBeNull()
    expect(parseCzechAccount('0000000000/0800')).toBeNull()
  })

  it('accepts a pasted IBAN with spaces', () => {
    expect(parseCzechAccount('CZ65 0800 0000 1920 0014 5399')).toEqual({
      prefix: '19',
      number: '2000145399',
      bank: '0800',
    })
  })

  it('rejects an IBAN with wrong check digits', () => {
    expect(parseCzechAccount('CZ6608000000192000145399')).toBeNull()
  })
})

describe('toIban', () => {
  it('matches the published Česká spořitelna and ČNB examples', () => {
    expect(toIban({ prefix: '19', number: '2000145399', bank: '0800' })).toBe('CZ6508000000192000145399')
    expect(toIban({ prefix: '178124', number: '4159', bank: '0710' })).toBe('CZ6907101781240000004159')
  })
})

describe('formatting', () => {
  it('writes the account the way Czech banks print it', () => {
    expect(formatAccount({ prefix: '19', number: '2000145399', bank: '0800' })).toBe('19-2000145399/0800')
    expect(formatAccount({ prefix: '', number: '2000145399', bank: '0800' })).toBe('2000145399/0800')
  })

  it('groups an IBAN by four', () => {
    expect(formatIban('CZ6508000000192000145399')).toBe('CZ65 0800 0000 1920 0014 5399')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/czech-account.test.ts`
Expected: FAIL — `Failed to resolve import "./czech-account"`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/czech-account.ts
/**
 * Czech bank account numbers: parsing, the ČNB checksum and IBAN conversion.
 *
 * Copied to usetri-mobile/src/lib/czech-account.ts — change both.
 */
export interface CzechAccount {
  /** Without leading zeros, '' when the account has none. */
  prefix: string
  /** Without leading zeros. */
  number: string
  /** Four-digit bank code. */
  bank: string
}

const WEIGHTS = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1]

/** CZ in the ISO 13616 letters-to-digits mapping (C = 12, Z = 35). */
const CZ_DIGITS = '1235'

/** ČNB weighted mod-11 check. Both parts are left-padded to ten digits first. */
function passesChecksum(digits: string) {
  const padded = digits.padStart(10, '0')
  const sum = [...padded].reduce((acc, d, i) => acc + Number(d) * WEIGHTS[i], 0)
  return sum % 11 === 0
}

function mod97(digits: string) {
  let rest = 0
  for (const d of digits) rest = (rest * 10 + Number(d)) % 97
  return rest
}

function isValid({ prefix, number }: CzechAccount) {
  return number.length > 0 && passesChecksum(prefix) && passesChecksum(number)
}

const stripZeros = (digits: string) => digits.replace(/^0+/, '')

function fromIban(raw: string): CzechAccount | null {
  const iban = raw.replace(/\s+/g, '').toUpperCase()
  if (!/^CZ\d{22}$/.test(iban)) return null
  // Country and check digits move to the end; a valid IBAN leaves remainder 1.
  if (mod97(iban.slice(4) + CZ_DIGITS + iban.slice(2, 4)) !== 1) return null
  return { prefix: stripZeros(iban.slice(8, 14)), number: stripZeros(iban.slice(14)), bank: iban.slice(4, 8) }
}

/** Accepts `číslo/kód`, `předčíslí-číslo/kód` or a pasted CZ IBAN. Null when invalid. */
export function parseCzechAccount(input: string): CzechAccount | null {
  const raw = input.trim()
  if (/^cz/i.test(raw)) {
    const parsed = fromIban(raw)
    return parsed && isValid(parsed) ? parsed : null
  }

  const match = raw.replace(/\s+/g, '').match(/^(?:(\d{1,6})-)?(\d{2,10})\/(\d{4})$/)
  if (!match) return null

  const parsed = { prefix: stripZeros(match[1] ?? ''), number: stripZeros(match[2]), bank: match[3] }
  return isValid(parsed) ? parsed : null
}

export function toIban({ prefix, number, bank }: CzechAccount) {
  const bban = bank + prefix.padStart(6, '0') + number.padStart(10, '0')
  const check = 98 - mod97(bban + CZ_DIGITS + '00')
  return `CZ${String(check).padStart(2, '0')}${bban}`
}

export function formatAccount({ prefix, number, bank }: CzechAccount) {
  return `${prefix ? `${prefix}-` : ''}${number}/${bank}`
}

export function formatIban(iban: string) {
  return iban.replace(/(.{4})/g, '$1 ').trim()
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/czech-account.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/czech-account.ts lib/czech-account.test.ts
git commit -m "feat: validace českého čísla účtu a převod na IBAN"
```

---

### Task 2: Billing periods

**Files:**
- Create: `lib/billing.ts`
- Test: `lib/billing.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/billing.test.ts
import { describe, it, expect } from 'vitest'
import { addDays, currentPeriod, dueDateFor, formatDate, periodStatus, todayInPrague, upcomingPeriod } from './billing'

describe('dueDateFor', () => {
  it('keeps the day of the month', () => {
    expect(dueDateFor('2026-10-12', 0)).toBe('2026-10-12')
    expect(dueDateFor('2026-10-12', 1)).toBe('2026-11-12')
  })

  it('crosses the year', () => {
    expect(dueDateFor('2026-12-15', 1)).toBe('2027-01-15')
  })

  it('clamps to the end of a short month and comes back afterwards', () => {
    expect(dueDateFor('2026-01-31', 1)).toBe('2026-02-28')
    expect(dueDateFor('2026-01-31', 2)).toBe('2026-03-31')
    expect(dueDateFor('2028-01-31', 1)).toBe('2028-02-29')
  })
})

describe('currentPeriod', () => {
  it('is the start on the first day', () => {
    expect(currentPeriod('2026-10-12', '2026-10-12')).toBe('2026-10-12')
  })

  it('stays until the next due date', () => {
    expect(currentPeriod('2026-10-12', '2026-11-11')).toBe('2026-10-12')
    expect(currentPeriod('2026-10-12', '2026-11-12')).toBe('2026-11-12')
  })

  it('handles month ends', () => {
    expect(currentPeriod('2026-01-31', '2026-03-01')).toBe('2026-02-28')
    expect(currentPeriod('2026-01-31', '2026-03-30')).toBe('2026-02-28')
    expect(currentPeriod('2026-01-31', '2026-03-31')).toBe('2026-03-31')
  })
})

describe('upcomingPeriod', () => {
  it('shows the next period seven days ahead, not earlier', () => {
    expect(upcomingPeriod('2026-10-12', '2026-11-04')).toBeNull()
    expect(upcomingPeriod('2026-10-12', '2026-11-05')).toBe('2026-11-12')
  })
})

describe('periodStatus', () => {
  it('reflects the payment when there is one', () => {
    expect(periodStatus('2026-10-12', 'confirmed', '2026-12-01')).toBe('paid')
    expect(periodStatus('2026-10-12', 'reported', '2026-12-01')).toBe('reported')
  })

  it('becomes overdue after three days of grace', () => {
    expect(periodStatus('2026-10-12', null, '2026-10-15')).toBe('due')
    expect(periodStatus('2026-10-12', null, '2026-10-16')).toBe('overdue')
  })
})

describe('helpers', () => {
  it('adds days across a month', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02')
  })

  it('reads today in Prague, not UTC', () => {
    // 22:30 UTC on 30 Sep is already 1 Oct in Prague (CEST, +2).
    expect(todayInPrague(new Date('2026-09-30T22:30:00Z'))).toBe('2026-10-01')
  })

  it('formats a date the Czech way', () => {
    expect(formatDate('2026-10-02')).toBe('2. 10. 2026')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/billing.test.ts`
Expected: FAIL — `Failed to resolve import "./billing"`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/billing.ts
/**
 * Billing periods. Every paying member pays on the anniversary of their
 * `billing_start`; a period runs from one due date to the next.
 *
 * Dates are 'YYYY-MM-DD' strings in Europe/Prague — never JS Dates, which shift
 * by a day between the UTC server, the browser and Postgres `date`.
 *
 * Copied to usetri-mobile/src/lib/billing.ts — change both. The SQL function
 * public.is_billing_date mirrors dueDateFor.
 */
export type IsoDate = string
export type PeriodStatus = 'paid' | 'reported' | 'overdue' | 'due'

/** Days after the due date before a period counts as overdue. */
const GRACE_DAYS = 3
/** How early the next period shows up. The database accepts payments this far ahead. */
export const PREVIEW_DAYS = 7

function parts(date: IsoDate) {
  const [y, m, d] = date.split('-').map(Number)
  return { y, m, d }
}

function iso(y: number, m: number, d: number): IsoDate {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** `m` is 1-based; day 0 of the next month is the last day of this one. */
function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const { y, m, d } = parts(date)
  const t = new Date(Date.UTC(y, m - 1, d + days))
  return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())
}

/** Due date `monthOffset` months after the start, clamped to the month's last day. */
export function dueDateFor(billingStart: IsoDate, monthOffset: number): IsoDate {
  const { y, m, d } = parts(billingStart)
  const index = y * 12 + (m - 1) + monthOffset
  const year = Math.floor(index / 12)
  const month = (index % 12) + 1
  return iso(year, month, Math.min(d, daysInMonth(year, month)))
}

function offsetOn(billingStart: IsoDate, today: IsoDate) {
  const s = parts(billingStart)
  const t = parts(today)
  let k = (t.y - s.y) * 12 + (t.m - s.m)
  // ISO strings compare correctly as text.
  if (dueDateFor(billingStart, k) > today) k -= 1
  return Math.max(0, k)
}

/** The latest due date on or before today. */
export function currentPeriod(billingStart: IsoDate, today: IsoDate): IsoDate {
  return dueDateFor(billingStart, offsetOn(billingStart, today))
}

/** The next due date, once it is at most PREVIEW_DAYS away. */
export function upcomingPeriod(billingStart: IsoDate, today: IsoDate): IsoDate | null {
  const next = dueDateFor(billingStart, offsetOn(billingStart, today) + 1)
  return next <= addDays(today, PREVIEW_DAYS) ? next : null
}

export function periodStatus(
  period: IsoDate,
  payment: 'reported' | 'confirmed' | null,
  today: IsoDate,
): PeriodStatus {
  if (payment === 'confirmed') return 'paid'
  if (payment === 'reported') return 'reported'
  return today > addDays(period, GRACE_DAYS) ? 'overdue' : 'due'
}

export function todayInPrague(now: Date = new Date()): IsoDate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Prague',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

/** "2. 10. 2026" — no Intl, so hydration always matches. */
export function formatDate(date: IsoDate) {
  const { y, m, d } = parts(date)
  return `${d}. ${m}. ${y}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/billing.test.ts`
Expected: PASS (12 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/billing.ts lib/billing.test.ts
git commit -m "feat: výpočet splatností a stavů plateb"
```

---

### Task 3: SPD payment string

**Files:**
- Create: `lib/spd.ts`
- Test: `lib/spd.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/spd.test.ts
import { describe, it, expect } from 'vitest'
import { MESSAGE_LIMIT, buildSpd, paymentMessage } from './spd'

describe('buildSpd', () => {
  it('builds the Czech QR payment string', () => {
    expect(
      buildSpd({ iban: 'CZ6508000000192000145399', amount: 109, vs: 40000017, message: 'Usetri Netflix 10/2026 Tomas K.' }),
    ).toBe('SPD*1.0*ACC:CZ6508000000192000145399*AM:109.00*CC:CZK*X-VS:40000017*MSG:Usetri Netflix 10/2026 Tomas K.')
  })
})

describe('paymentMessage', () => {
  it('names the service, month and payer without diacritics', () => {
    expect(paymentMessage('Netflix', '2026-10-12', 'Tomáš Kotík')).toBe('Usetri Netflix 10/2026 Tomas K.')
  })

  it('keeps a single name whole', () => {
    expect(paymentMessage('Spotify', '2027-01-05', 'Žofie')).toBe('Usetri Spotify 1/2027 Zofie')
  })

  it('removes the SPD separator', () => {
    expect(paymentMessage('Disney*Plus', '2026-10-12', 'Jan Novák')).toBe('Usetri DisneyPlus 10/2026 Jan N.')
  })

  it('shortens a long service name, never the month or payer', () => {
    const message = paymentMessage('Microsoft 365 Family s extra dlouhým názvem tarifu', '2026-10-12', 'Tomáš Kotík')
    expect(message.length).toBeLessThanOrEqual(MESSAGE_LIMIT)
    expect(message.startsWith('Usetri Microsoft')).toBe(true)
    expect(message.endsWith(' 10/2026 Tomas K.')).toBe(true)
  })

  it('never exceeds the limit even for an absurd name', () => {
    expect(paymentMessage('Netflix', '2026-10-12', 'A'.repeat(100)).length).toBeLessThanOrEqual(MESSAGE_LIMIT)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/spd.test.ts`
Expected: FAIL — `Failed to resolve import "./spd"`.

- [ ] **Step 3: Write the implementation**

```ts
// lib/spd.ts
/**
 * Czech QR payment ("QR Platba", Short Payment Descriptor 1.0).
 *
 * Copied to usetri-mobile/src/lib/spd.ts — change both.
 */
import type { IsoDate } from './billing'

/** SPD caps MSG at 60 characters. */
export const MESSAGE_LIMIT = 60

export function buildSpd({ iban, amount, vs, message }: { iban: string; amount: number; vs: number; message: string }) {
  return ['SPD', '1.0', `ACC:${iban}`, `AM:${amount.toFixed(2)}`, 'CC:CZK', `X-VS:${vs}`, `MSG:${message}`].join('*')
}

/** Some banks mangle diacritics and `*` separates SPD fields, so both go. */
function plain(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** "Usetri Netflix 10/2026 Tomas K." — what the owner sees on their statement. */
export function paymentMessage(serviceName: string, period: IsoDate, payerName: string) {
  const [year, month] = period.split('-')
  const words = plain(payerName).split(' ').filter(Boolean)
  const who = words.length > 1 ? `${words[0]} ${words[words.length - 1][0]}.` : (words[0] ?? '')
  const tail = ` ${Number(month)}/${year}${who ? ` ${who}` : ''}`

  const room = MESSAGE_LIMIT - 'Usetri '.length - tail.length
  const service = plain(serviceName).slice(0, Math.max(0, room)).trim()
  return `Usetri ${service}${tail}`.slice(0, MESSAGE_LIMIT)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/spd.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/spd.ts lib/spd.test.ts
git commit -m "feat: sestavení QR platby (SPD)"
```

---

### Task 4: QR SVG

**Files:**
- Create: `lib/qr.ts`
- Test: `lib/qr.test.ts`

- [ ] **Step 1: Install the library**

Run: `npm install qrcode && npm install -D @types/qrcode`
Expected: both added to `package.json`.

- [ ] **Step 2: Write the failing test**

```ts
// lib/qr.test.ts
import { describe, it, expect } from 'vitest'
import { qrSvg } from './qr'

describe('qrSvg', () => {
  it('renders an SVG with a viewBox so CSS can size it', async () => {
    const svg = await qrSvg('SPD*1.0*ACC:CZ6508000000192000145399*AM:109.00*CC:CZK')
    expect(svg.startsWith('<svg')).toBe(true)
    expect(svg).toContain('viewBox')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run lib/qr.test.ts`
Expected: FAIL — `Failed to resolve import "./qr"`.

- [ ] **Step 4: Write the implementation**

```ts
// lib/qr.ts
import QRCode from 'qrcode'

/** Server-side: renders the QR as inline SVG, so the page ships no QR library. */
export function qrSvg(text: string) {
  return QRCode.toString(text, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#0b1730', light: '#ffffff' },
  })
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run lib/qr.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/qr.ts lib/qr.test.ts package.json package-lock.json
git commit -m "feat: vykreslení QR kódu jako SVG"
```

---

### Task 5: Database migration

**Files:**
- Create: `supabase/migrations/20260924120000_payments_qr.sql`

Before writing the file, read the live body with `select pg_get_functiondef('public.guard_seat_capacity'::regproc);` and confirm the replacement below differs **only** by the two `new.billing_start` / `new.payment_ref` lines (it matched on 2026-09-24).

Current state (verified live): `guard_seat_capacity()` is a `BEFORE INSERT` trigger function on `group_members`, `SECURITY DEFINER`, `search_path ''`. `add_owner_as_member()` inserts the owner row after a group insert — it goes through the same trigger, so the owner also gets `billing_start` / `payment_ref` (unused, but both columns are `not null`, so the trigger must **always** set them, never skip).

- [ ] **Step 1: Write the migration file**

```sql
-- supabase/migrations/20260924120000_payments_qr.sql
-- QR payments between members. Spec: docs/superpowers/specs/2026-09-24-qr-platby-design.md
-- The mobile app writes to these tables directly, so RLS and triggers are the only guard.

-- Today's date where our users live, not UTC.
create or replace function public.prague_today()
returns date
language sql
stable
set search_path to ''
as $$ select (now() at time zone 'Europe/Prague')::date $$;

-- Mirrors dueDateFor in lib/billing.ts: `start + k months` clamps to the month end
-- and is always computed from the start, so 31. 1. → 28. 2. → 31. 3.
create or replace function public.is_billing_date(start date, d date)
returns boolean
language sql
immutable
set search_path to ''
as $$
  select d >= start
     and (start + make_interval(months =>
            ((extract(year from d) - extract(year from start)) * 12
             + extract(month from d) - extract(month from start))::int))::date = d
$$;

-- ── Payout accounts ────────────────────────────────────────────────────────────
-- Never on profiles: those are readable by every signed-in user.
create table public.payout_accounts (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  iban text not null check (iban ~ '^CZ[0-9]{22}$'),
  account_display text not null,
  updated_at timestamptz not null default now()
);

alter table public.payout_accounts enable row level security;

create policy "Owners and their members read the payout account"
  on public.payout_accounts for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1
      from public.groups g
      join public.group_members m on m.group_id = g.id
      where g.owner_id = payout_accounts.user_id
        and m.user_id = (select auth.uid())
    )
  );

create policy "Users write their own payout account"
  on public.payout_accounts for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update their own payout account"
  on public.payout_accounts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own payout account"
  on public.payout_accounts for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ── Billing columns on members ─────────────────────────────────────────────────
create sequence public.payment_ref_seq start 40000001;

-- The defaults fill existing rows: billing starts today, so nobody owes backwards.
alter table public.group_members
  add column billing_start date not null default public.prague_today(),
  add column payment_ref bigint not null default nextval('public.payment_ref_seq');

alter table public.group_members
  add constraint group_members_payment_ref_key unique (payment_ref);

-- Backfill done. From now on only the trigger assigns it: a column default would run
-- as the joining user (needing sequence rights) and burn two numbers per insert.
alter table public.group_members alter column payment_ref drop default;

-- Clients insert memberships directly, so both values are always overwritten here.
create or replace function public.guard_seat_capacity()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  g public.groups%rowtype;
begin
  select * into g from public.groups where id = new.group_id for update;
  if g.closed then
    raise exception 'Tahle nabídka je uzavřená.' using errcode = 'check_violation';
  end if;
  if (select count(*) from public.group_members m where m.group_id = new.group_id) >= g.seats_total then
    raise exception 'Skupina je plná.' using errcode = 'check_violation';
  end if;

  new.billing_start := public.prague_today();
  new.payment_ref := nextval('public.payment_ref_seq');
  return new;
end;
$function$;

-- ── Payments ───────────────────────────────────────────────────────────────────
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  period_start date not null,
  amount integer not null,
  status text not null check (status in ('reported', 'confirmed')),
  reported_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (group_id, user_id, period_start)
);

create index payments_user_idx on public.payments (user_id);

create or replace function public.guard_payment_insert()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  starts date;
begin
  select m.billing_start into starts
  from public.group_members m
  where m.group_id = new.group_id and m.user_id = new.user_id and m.role = 'member';

  if starts is null then
    raise exception 'Platit můžou jen členové skupiny.' using errcode = 'check_violation';
  end if;
  if not public.is_billing_date(starts, new.period_start) then
    raise exception 'Tohle není den splatnosti.' using errcode = 'check_violation';
  end if;
  if new.period_start > public.prague_today() + 7 then
    raise exception 'Tak daleko dopředu platit nejde.' using errcode = 'check_violation';
  end if;

  -- The client never decides the amount.
  new.amount := (select g.price_per_seat from public.groups g where g.id = new.group_id);

  if new.status = 'reported' then
    new.reported_at := now();
    new.confirmed_at := null;
  else
    new.reported_at := null;
    new.confirmed_at := now();
  end if;
  new.created_at := now();
  return new;
end;
$function$;

create trigger payments_guard_insert
  before insert on public.payments
  for each row execute function public.guard_payment_insert();

-- The only allowed change is reported → confirmed; everything else stays as it was.
create or replace function public.guard_payment_update()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if old.status <> 'reported' or new.status <> 'confirmed' then
    raise exception 'Platbu jde jen potvrdit.' using errcode = 'check_violation';
  end if;

  new.id := old.id;
  new.group_id := old.group_id;
  new.user_id := old.user_id;
  new.period_start := old.period_start;
  new.amount := old.amount;
  new.reported_at := old.reported_at;
  new.created_at := old.created_at;
  new.confirmed_at := now();
  return new;
end;
$function$;

create trigger payments_guard_update
  before update on public.payments
  for each row execute function public.guard_payment_update();

alter table public.payments enable row level security;

create policy "Payer and group owner read payments"
  on public.payments for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (select 1 from public.groups g where g.id = payments.group_id and g.owner_id = (select auth.uid()))
  );

create policy "Members report, owners mark paid"
  on public.payments for insert to authenticated
  with check (
    ((select auth.uid()) = user_id and status = 'reported')
    or (
      status = 'confirmed'
      and exists (select 1 from public.groups g where g.id = payments.group_id and g.owner_id = (select auth.uid()))
    )
  );

create policy "Owners confirm payments"
  on public.payments for update to authenticated
  using (exists (select 1 from public.groups g where g.id = payments.group_id and g.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.groups g where g.id = payments.group_id and g.owner_id = (select auth.uid())));

grant select, insert, update, delete on public.payout_accounts, public.payments to authenticated;

-- Owners may also delete a confirmed payment: that is undoing "Označit jako zaplacené".
create policy "Owners reject, payers take back a report"
  on public.payments for delete to authenticated
  using (
    exists (select 1 from public.groups g where g.id = payments.group_id and g.owner_id = (select auth.uid()))
    or ((select auth.uid()) = user_id and status = 'reported')
  );
```

- [ ] **Step 2: Apply the migration**

Use Supabase MCP `apply_migration` with `project_id: eveezgloymxzpveltkyq`, `name: payments_qr`, `query:` the file contents.
Expected: success. Then `list_migrations` shows `payments_qr`.

- [ ] **Step 3: Sanity-check existing rows**

Run via `execute_sql`:
```sql
select count(*) filter (where billing_start is null) as no_start,
       count(*) filter (where payment_ref < 40000001) as bad_ref,
       count(*) as total
from public.group_members;
```
Expected: `no_start = 0`, `bad_ref = 0`, `total = 26` (or current count).

- [ ] **Step 4: Check the SQL date function matches `lib/billing.ts`**

Run via `execute_sql`:
```sql
select
  public.is_billing_date('2026-01-31', '2026-02-28') as feb_end,      -- true
  public.is_billing_date('2026-01-31', '2026-03-31') as mar_back,     -- true
  public.is_billing_date('2026-01-31', '2026-03-28') as mar_wrong,    -- false
  public.is_billing_date('2026-10-12', '2026-11-12') as normal,       -- true
  public.is_billing_date('2026-10-12', '2026-09-12') as before_start; -- false
```
Expected: `true, true, false, true, false`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260924120000_payments_qr.sql
git commit -m "feat: databáze pro QR platby (účty, platby, RLS)"
```

---

### Task 6: Verify RLS and triggers against the live database

**Files:** none (verification only; every block ends in an exception, nothing persists).

- [ ] **Step 1: Pick test users**

Run via `execute_sql` (one statement — the tool only returns the last one):
```sql
select g.id as group_id, g.owner_id, m.user_id as member_id, g.price_per_seat,
       g.seats_total - g.seats_taken as free_seats, g.closed,
       (select p.id from public.profiles p
        where p.id not in (select x.user_id from public.group_members x where x.group_id = g.id)
        limit 1) as stranger_id
from public.groups g
join public.group_members m on m.group_id = g.id and m.role = 'member'
order by (g.seats_total - g.seats_taken > 0 and not g.closed) desc
limit 1;
```
Write down `GROUP`, `OWNER`, `MEMBER`, `STRANGER`, `PRICE`. Step 2 needs `free_seats > 0` and `closed = false`. If no group has a member, create one in the web app first (two accounts).

**How these checks work:** Supabase MCP `execute_sql` returns only the last statement's result, so a `begin … rollback` block would hide what you need to see. Each check is therefore one `DO` block that switches to the `authenticated` role, does the work, and ends with `raise exception 'RESULT …'` carrying the values. The exception rolls everything back and the values arrive in the error message. An error message that does **not** start with `RESULT` means an unexpected failure.

Helper used by every block (paste at the top of each `DO`, replacing `<UID>`):
```sql
perform set_config('request.jwt.claims', json_build_object('sub', '<UID>', 'role', 'authenticated')::text, true);
execute 'set local role authenticated';
```

- [ ] **Step 2: Member cannot pick their own billing_start or VS**

Needs an open group with a free seat (`<GROUP>`); if none exists, create one in the web app.
```sql
do $$
declare r record;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', '<STRANGER>', 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.group_members (group_id, user_id, billing_start, payment_ref)
  values ('<GROUP>', '<STRANGER>', '2030-01-01', 1)
  returning billing_start, payment_ref into r;
  raise exception 'RESULT billing_start=% payment_ref=% today=%', r.billing_start, r.payment_ref, public.prague_today();
end $$;
```
Expected: `RESULT billing_start=<today> payment_ref=<≥ 40000001> today=<today>`.

- [ ] **Step 3: Who can read a payout account**

```sql
do $$
declare stranger_sees int; member_sees int; owner_sees_other int;
begin
  insert into public.payout_accounts (user_id, iban, account_display)
  values ('<OWNER>', 'CZ6508000000192000145399', '19-2000145399/0800'),
         ('<STRANGER>', 'CZ6907101781240000004159', '178124-4159/0710')
  on conflict (user_id) do nothing;

  perform set_config('request.jwt.claims', json_build_object('sub', '<STRANGER>', 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into stranger_sees from public.payout_accounts where user_id = '<OWNER>';

  perform set_config('request.jwt.claims', json_build_object('sub', '<MEMBER>', 'role', 'authenticated')::text, true);
  select count(*) into member_sees from public.payout_accounts where user_id = '<OWNER>';

  perform set_config('request.jwt.claims', json_build_object('sub', '<OWNER>', 'role', 'authenticated')::text, true);
  select count(*) into owner_sees_other from public.payout_accounts where user_id = '<STRANGER>';

  raise exception 'RESULT stranger_sees=% member_sees=% owner_sees_other=%', stranger_sees, member_sees, owner_sees_other;
end $$;
```
Expected: `RESULT stranger_sees=0 member_sees=1 owner_sees_other=0`.

- [ ] **Step 4: Member cannot forge the amount**

```sql
do $$
declare got int;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', '<MEMBER>', 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.payments (group_id, user_id, period_start, amount, status)
  select '<GROUP>', '<MEMBER>', m.billing_start, 1, 'reported'
  from public.group_members m where m.group_id = '<GROUP>' and m.user_id = '<MEMBER>'
  returning amount into got;
  raise exception 'RESULT amount=%', got;
end $$;
```
Expected: `RESULT amount=<PRICE>`.

- [ ] **Step 5: Member cannot confirm their own payment**

```sql
do $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', '<MEMBER>', 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.payments (group_id, user_id, period_start, status)
  select '<GROUP>', '<MEMBER>', m.billing_start, 'confirmed'
  from public.group_members m where m.group_id = '<GROUP>' and m.user_id = '<MEMBER>';
  raise exception 'RESULT inserted (BAD)';
end $$;
```
Expected: error `new row violates row-level security policy for table "payments"` (not `RESULT`).

- [ ] **Step 6: Member cannot pay two months ahead**

```sql
do $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', '<MEMBER>', 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.payments (group_id, user_id, period_start, status)
  select '<GROUP>', '<MEMBER>', (m.billing_start + interval '2 months')::date, 'reported'
  from public.group_members m where m.group_id = '<GROUP>' and m.user_id = '<MEMBER>';
  raise exception 'RESULT inserted (BAD)';
end $$;
```
Expected: error `Tak daleko dopředu platit nejde.`

- [ ] **Step 7: Update and delete rules**

```sql
do $$
declare pid uuid; member_updated int; r record; payer_deleted int;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', '<MEMBER>', 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  insert into public.payments (group_id, user_id, period_start, status)
  select '<GROUP>', '<MEMBER>', m.billing_start, 'reported'
  from public.group_members m where m.group_id = '<GROUP>' and m.user_id = '<MEMBER>'
  returning id into pid;

  -- the payer cannot confirm (RLS filters the row out)
  update public.payments set status = 'confirmed' where id = pid;
  get diagnostics member_updated = row_count;

  -- the owner confirms; the amount change is ignored by the trigger
  perform set_config('request.jwt.claims', json_build_object('sub', '<OWNER>', 'role', 'authenticated')::text, true);
  update public.payments set status = 'confirmed', amount = 1 where id = pid
  returning status, amount, confirmed_at is not null as stamped into r;

  -- the payer can no longer take back a confirmed payment
  perform set_config('request.jwt.claims', json_build_object('sub', '<MEMBER>', 'role', 'authenticated')::text, true);
  delete from public.payments where id = pid;
  get diagnostics payer_deleted = row_count;

  raise exception 'RESULT member_updated=% status=% amount=% stamped=% payer_deleted=%',
    member_updated, r.status, r.amount, r.stamped, payer_deleted;
end $$;
```
Expected: `RESULT member_updated=0 status=confirmed amount=<PRICE> stamped=t payer_deleted=0`.

- [ ] **Step 8: Record the result**

If every expectation held, move on. If any failed, fix it with a new migration (`payments_qr_fix`), save it as a new file in `supabase/migrations/`, re-run this task, and commit.

---

### Task 7: Database types

**Files:**
- Modify: `types/database.ts`

- [ ] **Step 1: Extend `group_members.Row`**

Replace the `group_members` block:

```ts
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          role: string
          joined_at: string
          /** Set by the database on insert; clients cannot choose it. */
          billing_start: string
          /** Variable symbol for QR payments. Set by the database on insert. */
          payment_ref: number
        }
        Insert: { group_id: string; user_id: string; role?: string }
        Update: never
        Relationships: []
      }
```

- [ ] **Step 2: Add the new tables** after `group_members`:

```ts
      payout_accounts: {
        Row: { user_id: string; iban: string; account_display: string; updated_at: string }
        Insert: { user_id: string; iban: string; account_display: string; updated_at?: string }
        Update: { iban?: string; account_display?: string; updated_at?: string }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          group_id: string
          user_id: string
          period_start: string
          amount: number
          status: 'reported' | 'confirmed'
          reported_at: string | null
          confirmed_at: string | null
          created_at: string
        }
        /** amount and timestamps are set by the database. */
        Insert: { group_id: string; user_id: string; period_start: string; status: 'reported' | 'confirmed' }
        Update: { status?: 'confirmed' }
        Relationships: []
      }
```

- [ ] **Step 3: Add row aliases** at the bottom next to the others:

```ts
export type PayoutAccountRow = Database['public']['Tables']['payout_accounts']['Row']
export type PaymentRow = Database['public']['Tables']['payments']['Row']
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add types/database.ts
git commit -m "chore: typy pro výplatní účty a platby"
```

---

### Task 8: Payment reads

**Files:**
- Create: `lib/payments.ts`

No unit test: this is a thin Supabase query layer (like `lib/dashboard.ts`, which has none); the logic it calls is tested in Tasks 1–3. It is exercised in Task 14.

- [ ] **Step 1: Write the module**

```ts
// lib/payments.ts
import { toService, type Offer, type requireUser } from './dashboard'
import { currentPeriod, periodStatus, todayInPrague, upcomingPeriod, type IsoDate, type PeriodStatus } from './billing'
import type { ServiceRow } from '@/types/database'
import type { Service } from '@/types/service'

type Supabase = Awaited<ReturnType<typeof requireUser>>['supabase']

export interface PayoutAccount {
  iban: string
  /** As Czech banks print it: 19-2000145399/0800. */
  display: string
}

export interface PeriodView {
  period: IsoDate
  status: PeriodStatus
  paymentId: string | null
  /** What was recorded, or today's price when nothing is recorded yet. */
  amount: number
}

type Paid = { id: string; user_id: string; period_start: string; amount: number; status: 'reported' | 'confirmed' }

function viewOf(period: IsoDate, payments: Paid[], userId: string, price: number, today: IsoDate): PeriodView {
  const payment = payments.find((p) => p.user_id === userId && p.period_start === period) ?? null
  return {
    period,
    status: periodStatus(period, payment?.status ?? null, today),
    paymentId: payment?.id ?? null,
    amount: payment?.amount ?? price,
  }
}

export async function getPayoutAccount(supabase: Supabase, userId: string): Promise<PayoutAccount | null> {
  const { data } = await supabase
    .from('payout_accounts')
    .select('iban, account_display')
    .eq('user_id', userId)
    .maybeSingle()
  return data ? { iban: data.iban, display: data.account_display } : null
}

export interface PaymentView {
  /** The owner's account. RLS hides it from anyone outside the group. */
  account: PayoutAccount | null
  /** The viewer's own periods, when they are a paying member. */
  mine: { vs: number; periods: PeriodView[] } | null
  /** Owner only: member user id → their current period. */
  members: Map<string, PeriodView>
}

export async function getPaymentView(supabase: Supabase, viewerId: string, offer: Offer): Promise<PaymentView> {
  if (offer.role === null) return { account: null, mine: null, members: new Map() }

  const today = todayInPrague()
  const [account, { data: billing }, { data: payments }] = await Promise.all([
    getPayoutAccount(supabase, offer.owner.id),
    supabase
      .from('group_members')
      .select('user_id, billing_start, payment_ref')
      .eq('group_id', offer.id)
      .eq('role', 'member'),
    supabase
      .from('payments')
      .select('id, user_id, period_start, amount, status')
      .eq('group_id', offer.id)
      .returns<Paid[]>(),
  ])
  const paid = payments ?? []

  if (offer.role === 'member') {
    const me = billing?.find((b) => b.user_id === viewerId)
    if (!me) return { account, mine: null, members: new Map() }

    const periods = [currentPeriod(me.billing_start, today), upcomingPeriod(me.billing_start, today)]
      .filter((p): p is IsoDate => p !== null)
      .map((p) => viewOf(p, paid, viewerId, offer.pricePerSeat, today))
    return { account, mine: { vs: me.payment_ref, periods }, members: new Map() }
  }

  const members = new Map(
    (billing ?? []).map((b) => [
      b.user_id,
      viewOf(currentPeriod(b.billing_start, today), paid, b.user_id, offer.pricePerSeat, today),
    ]),
  )
  return { account, mine: null, members }
}

export interface InboxItem extends PeriodView {
  groupId: string
  service: Service
  /** Set on items waiting for the owner's confirmation. */
  payerName?: string
}

/** What the overview asks the viewer to act on: pay, or confirm. */
export async function getPaymentInbox(supabase: Supabase, userId: string) {
  const today = todayInPrague()

  const [{ data: memberships }, { data: mine }, { data: reported }] = await Promise.all([
    supabase
      .from('group_members')
      .select('group_id, billing_start, groups(price_per_seat, services(*))')
      .eq('user_id', userId)
      .eq('role', 'member')
      .returns<
        {
          group_id: string
          billing_start: string
          groups: { price_per_seat: number; services: ServiceRow | null } | null
        }[]
      >(),
    supabase
      .from('payments')
      .select('id, group_id, user_id, period_start, amount, status')
      .eq('user_id', userId)
      .returns<(Paid & { group_id: string })[]>(),
    supabase
      .from('payments')
      .select('id, group_id, period_start, amount, profiles(full_name), groups!inner(owner_id, services(*))')
      .eq('status', 'reported')
      .eq('groups.owner_id', userId)
      .order('reported_at')
      .returns<
        {
          id: string
          group_id: string
          period_start: string
          amount: number
          profiles: { full_name: string | null } | null
          groups: { owner_id: string; services: ServiceRow | null } | null
        }[]
      >(),
  ])

  const toPay: InboxItem[] = (memberships ?? []).flatMap((m) => {
    if (!m.groups?.services) return []
    const own = (mine ?? []).filter((p) => p.group_id === m.group_id)
    const view = viewOf(currentPeriod(m.billing_start, today), own, userId, m.groups.price_per_seat, today)
    if (view.status !== 'due' && view.status !== 'overdue') return []
    return [{ ...view, groupId: m.group_id, service: toService(m.groups.services) }]
  })

  const toConfirm: InboxItem[] = (reported ?? []).flatMap((r) =>
    r.groups?.services
      ? [
          {
            period: r.period_start,
            status: 'reported' as const,
            paymentId: r.id,
            amount: r.amount,
            groupId: r.group_id,
            service: toService(r.groups.services),
            payerName: r.profiles?.full_name?.trim() || 'Anonymní člen',
          },
        ]
      : [],
  )

  return { toPay, toConfirm }
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (If `.returns<>()` is flagged as deprecated by the installed supabase-js, keep it anyway — `lib/dashboard.ts` uses the same pattern.)

- [ ] **Step 3: Commit**

```bash
git add lib/payments.ts
git commit -m "feat: načítání stavů plateb pro skupinu a přehled"
```

---

### Task 9: Server actions

**Files:**
- Modify: `app/dashboard/actions.ts` (the `ActionState` type and `createOffer`)
- Create: `app/dashboard/payment-actions.ts`

- [ ] **Step 1: Let actions report success**

In `app/dashboard/actions.ts` replace:
```ts
export type ActionState = { error?: string } | null
```
with:
```ts
export type ActionState = { error?: string; ok?: boolean } | null
```

- [ ] **Step 2: Create the payment actions**

```ts
// app/dashboard/payment-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/dashboard'
import { formatAccount, parseCzechAccount, toIban } from '@/lib/czech-account'
import type { ActionState } from './actions'

const ACCOUNT_ERROR = 'Tohle číslo účtu nevypadá správně. Zkontroluj ho prosím.'

function refresh() {
  revalidatePath('/dashboard', 'layout')
}

/** Shared with createOffer: validates and upserts the viewer's payout account. */
export async function savePayoutAccount(_: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, user } = await requireUser()
  const parsed = parseCzechAccount(String(formData.get('account') ?? ''))
  if (!parsed) return { error: ACCOUNT_ERROR }

  const { error } = await supabase.from('payout_accounts').upsert({
    user_id: user.id,
    iban: toIban(parsed),
    account_display: formatAccount(parsed),
    updated_at: new Date().toISOString(),
  })
  if (error) return { error: 'Účet se nepodařilo uložit. Zkus to prosím znovu.' }

  refresh()
  return { ok: true }
}

export async function reportPayment(groupId: string, period: string): Promise<ActionState> {
  const { supabase, user } = await requireUser()
  const { error } = await supabase
    .from('payments')
    .insert({ group_id: groupId, user_id: user.id, period_start: period, status: 'reported' })

  if (error) {
    if (error.code === '23505') return { error: 'Tuhle platbu už jsi nahlásil.' }
    return { error: 'Platbu se nepodařilo nahlásit. Zkus to prosím znovu.' }
  }
  refresh()
  return null
}

export async function undoReport(paymentId: string): Promise<ActionState> {
  const { supabase, user } = await requireUser()
  const { data, error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('user_id', user.id)
    .eq('status', 'reported')
    .select('id')

  if (error || !data?.length) return { error: 'Nahlášení se nepodařilo vzít zpět.' }
  refresh()
  return null
}

export async function confirmPayment(paymentId: string): Promise<ActionState> {
  const { supabase } = await requireUser()
  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'confirmed' })
    .eq('id', paymentId)
    .select('id')

  // RLS filters out payments in groups the viewer does not own: zero rows, no error.
  if (error || !data?.length) return { error: 'Platbu se nepodařilo potvrdit.' }
  refresh()
  return null
}

export async function rejectPayment(paymentId: string): Promise<ActionState> {
  const { supabase } = await requireUser()
  const { data, error } = await supabase.from('payments').delete().eq('id', paymentId).select('id')

  if (error || !data?.length) return { error: 'Změna se nepovedla. Zkus to prosím znovu.' }
  refresh()
  return null
}

/** Owner records a payment that arrived another way, e.g. in cash. */
export async function markPaid(groupId: string, userId: string, period: string): Promise<ActionState> {
  const { supabase } = await requireUser()
  const { error } = await supabase
    .from('payments')
    .insert({ group_id: groupId, user_id: userId, period_start: period, status: 'confirmed' })

  if (error) {
    if (error.code === '23505') return { error: 'Tahle platba už je zapsaná.' }
    return { error: 'Platbu se nepodařilo zapsat.' }
  }
  refresh()
  return null
}
```

- [ ] **Step 3: Save the account when creating an offer**

In `app/dashboard/actions.ts`, add the import:
```ts
import { formatAccount, parseCzechAccount, toIban } from '@/lib/czech-account'
```
In `createOffer`, after the `note.length` check and before `supabase.from('groups').insert(...)`, add:
```ts
  const account = parseCzechAccount(String(formData.get('account') ?? ''))
  if (!account) return { error: 'Tohle číslo účtu nevypadá správně. Zkontroluj ho prosím.' }

  const { error: accountError } = await supabase.from('payout_accounts').upsert({
    user_id: user.id,
    iban: toIban(account),
    account_display: formatAccount(account),
    updated_at: new Date().toISOString(),
  })
  if (accountError) return { error: 'Číslo účtu se nepodařilo uložit. Zkus to prosím znovu.' }
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/actions.ts app/dashboard/payment-actions.ts
git commit -m "feat: server actions pro účet a platby"
```

---

### Task 10: Small client components

**Files:**
- Modify: `components/dashboard/OfferActions.tsx` (export `useAction`)
- Create: `components/dashboard/AccountInput.tsx`
- Create: `components/dashboard/PayoutAccountForm.tsx`
- Create: `components/dashboard/CopyButton.tsx`
- Create: `components/dashboard/PaymentStatusBadge.tsx`
- Create: `components/dashboard/PaymentActions.tsx`

- [ ] **Step 1: Export `useAction`**

In `components/dashboard/OfferActions.tsx` change `function useAction() {` to `export function useAction() {`.

- [ ] **Step 2: AccountInput**

```tsx
// components/dashboard/AccountInput.tsx
'use client'
import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { formatIban, parseCzechAccount, toIban } from '@/lib/czech-account'

/** Bank account field that checks the number as you type and shows the IBAN it becomes. */
export function AccountInput({ defaultValue = '' }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue)
  const [touched, setTouched] = useState(false)
  const parsed = useMemo(() => parseCzechAccount(value), [value])
  const showError = touched && value.trim() !== '' && !parsed

  return (
    <div>
      <input
        name="account"
        required
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="např. 2000145399/0800"
        aria-invalid={showError}
        className="h-12 w-full rounded-xl border border-border bg-white px-4 font-mono text-[15px] text-navy-deep outline-none transition placeholder:font-sans placeholder:text-fg-muted/60 focus:border-brand focus:ring-4 focus:ring-brand/15 aria-invalid:border-destructive"
      />
      {parsed && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-fg-muted">
          <Check className="h-3.5 w-3.5 text-brand" /> {formatIban(toIban(parsed))}
        </p>
      )}
      {showError && (
        <p className="mt-1.5 text-[12px] text-destructive">
          Tohle číslo účtu nevypadá správně. Zkontroluj předčíslí, číslo i kód banky.
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 3: PayoutAccountForm**

```tsx
// components/dashboard/PayoutAccountForm.tsx
'use client'
import { useActionState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AccountInput } from './AccountInput'
import { savePayoutAccount } from '@/app/dashboard/payment-actions'
import type { ActionState } from '@/app/dashboard/actions'

export function PayoutAccountForm({ current }: { current?: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(savePayoutAccount, null)

  useEffect(() => {
    if (state?.ok) toast.success('Číslo účtu je uložené.')
  }, [state])

  return (
    <form action={action} className="space-y-3">
      <AccountInput defaultValue={current} />
      {state?.error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="h-11 gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground hover:bg-brand-soft"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Uložit účet
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: CopyButton**

```tsx
// components/dashboard/CopyButton.tsx
'use client'
import { Copy } from 'lucide-react'
import { toast } from 'sonner'

export function CopyButton({ value, label }: { value: string; label: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} zkopírováno`)
    } catch {
      toast.error('Kopírování se nepovedlo.')
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Kopírovat: ${label}`}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-muted hover:text-navy-deep"
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  )
}
```

- [ ] **Step 5: PaymentStatusBadge**

```tsx
// components/dashboard/PaymentStatusBadge.tsx
import type { PeriodStatus } from '@/lib/billing'

const STYLES: Record<PeriodStatus, { label: string; className: string }> = {
  paid: { label: 'Zaplaceno', className: 'bg-brand/15 text-brand-foreground' },
  reported: { label: 'Čeká na potvrzení', className: 'bg-amber-100 text-amber-800' },
  due: { label: 'K zaplacení', className: 'bg-muted text-navy-deep' },
  overdue: { label: 'Po splatnosti', className: 'bg-destructive/10 text-destructive' },
}

export function PaymentStatusBadge({ status }: { status: PeriodStatus }) {
  const { label, className } = STYLES[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`}>
      {label}
    </span>
  )
}
```

- [ ] **Step 6: PaymentActions**

```tsx
// components/dashboard/PaymentActions.tsx
'use client'
import { Check, Loader2, Undo2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAction } from './OfferActions'
import {
  confirmPayment,
  markPaid,
  rejectPayment,
  reportPayment,
  undoReport,
} from '@/app/dashboard/payment-actions'
import type { PeriodView } from '@/lib/payments'

const spinner = <Loader2 className="h-4 w-4 animate-spin" />

export function ReportPaidButton({ groupId, period }: { groupId: string; period: string }) {
  const { pending, run } = useAction()
  return (
    <Button
      disabled={pending}
      onClick={run(() => reportPayment(groupId, period), 'Díky! Zakladatel teď platbu potvrdí.')}
      className="h-11 w-full gap-2 rounded-xl bg-brand font-semibold text-brand-foreground hover:bg-brand-soft"
    >
      {pending ? spinner : <Check className="h-4 w-4" />} Zaplatil jsem
    </Button>
  )
}

export function UndoReportButton({ paymentId }: { paymentId: string }) {
  const { pending, run } = useAction()
  return (
    <Button
      variant="ghost"
      disabled={pending}
      onClick={run(() => undoReport(paymentId), 'Nahlášení je zrušené.')}
      className="h-9 gap-1.5 rounded-xl px-3 text-sm text-fg-muted"
    >
      {pending ? spinner : <Undo2 className="h-4 w-4" />} Vzít zpět
    </Button>
  )
}

export function ConfirmPaymentButton({ paymentId }: { paymentId: string }) {
  const { pending, run } = useAction()
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={run(() => confirmPayment(paymentId), 'Platba potvrzena.')}
      className="h-8 gap-1.5 rounded-lg bg-brand px-2.5 text-[13px] font-semibold text-brand-foreground hover:bg-brand-soft"
    >
      {pending ? spinner : <Check className="h-3.5 w-3.5" />} Potvrdit
    </Button>
  )
}

export function RejectPaymentButton({ paymentId }: { paymentId: string }) {
  const { pending, run } = useAction()
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={run(
        () => rejectPayment(paymentId),
        'Platba vrácena mezi nezaplacené.',
        'Platba ti nedorazila? Člen ji uvidí znovu jako nezaplacenou.',
      )}
      className="h-8 gap-1.5 rounded-lg px-2.5 text-[13px] text-fg-muted hover:text-destructive"
    >
      {pending ? spinner : <X className="h-3.5 w-3.5" />} Nedorazilo
    </Button>
  )
}

export function MarkPaidButton({ groupId, userId, period }: { groupId: string; userId: string; period: string }) {
  const { pending, run } = useAction()
  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={run(() => markPaid(groupId, userId, period), 'Zapsáno jako zaplacené.')}
      className="h-8 gap-1.5 rounded-lg px-2.5 text-[13px] text-fg-muted hover:text-navy-deep"
    >
      {pending ? spinner : <Check className="h-3.5 w-3.5" />} Označit jako zaplacené
    </Button>
  )
}

/** What the owner can do about one member's current period. */
export function MemberPaymentControls({ groupId, userId, view }: { groupId: string; userId: string; view: PeriodView }) {
  if (view.status === 'reported' && view.paymentId) {
    return (
      <>
        <ConfirmPaymentButton paymentId={view.paymentId} />
        <RejectPaymentButton paymentId={view.paymentId} />
      </>
    )
  }
  if (view.status === 'due' || view.status === 'overdue') {
    return <MarkPaidButton groupId={groupId} userId={userId} period={view.period} />
  }
  return null
}
```

- [ ] **Step 7: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (If `aria-invalid:` is not a valid variant in this Tailwind setup, lint/build will not catch it — check the field visually in Task 14 and fall back to a conditional class `showError ? 'border-destructive' : ''`.)

- [ ] **Step 8: Commit**

```bash
git add components/dashboard/OfferActions.tsx components/dashboard/AccountInput.tsx components/dashboard/PayoutAccountForm.tsx components/dashboard/CopyButton.tsx components/dashboard/PaymentStatusBadge.tsx components/dashboard/PaymentActions.tsx
git commit -m "feat: komponenty pro účet a platební akce"
```

---

### Task 11: Payout account in offer creation and on the account page

**Files:**
- Modify: `components/dashboard/NewOfferForm.tsx`
- Modify: `app/dashboard/nova/page.tsx`
- Modify: `app/dashboard/ucet/page.tsx`

- [ ] **Step 1: NewOfferForm takes the saved account**

Change the signature and import:
```tsx
import { AccountInput } from './AccountInput'
...
export function NewOfferForm({ services, payoutAccount }: { services: Service[]; payoutAccount?: string }) {
```

Add a new `Field` inside the `space-y-6` card, **after** the „Poznámka pro zájemce“ field:
```tsx
        <Field
          label="Kam ti mají členové posílat peníze?"
          hint="Z čísla účtu vygenerujeme členům QR platbu. Uvidí ho jen lidé ve tvé skupině."
        >
          <AccountInput defaultValue={payoutAccount} />
        </Field>
```

Also change the note placeholder, which no longer needs to explain payment:
```tsx
            placeholder="Pozvánku do rodinného účtu posílám hned po první platbě…"
```

- [ ] **Step 2: The page passes it**

```tsx
// app/dashboard/nova/page.tsx
import type { Metadata } from 'next'
import { NewOfferForm } from '@/components/dashboard/NewOfferForm'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { getCatalogue, requireUser } from '@/lib/dashboard'
import { getPayoutAccount } from '@/lib/payments'

export const metadata: Metadata = { title: 'Nová nabídka — Ušetři' }

export default async function NewOfferPage() {
  const { supabase, user } = await requireUser()
  const [services, account] = await Promise.all([getCatalogue(supabase), getPayoutAccount(supabase, user.id)])

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nová nabídka"
        title="Nabídni místo"
        subtitle="Vyber službu, kterou už platíš, a nabídni volná místa ostatním. Zbytek dopočítáme."
      />

      <NewOfferForm services={services} payoutAccount={account?.display} />
    </div>
  )
}
```

- [ ] **Step 3: Account page section**

In `app/dashboard/ucet/page.tsx`:
- add imports `import { Landmark } from 'lucide-react'` (merge into the existing lucide import), `import { PayoutAccountForm } from '@/components/dashboard/PayoutAccountForm'`, `import { getPayoutAccount } from '@/lib/payments'`;
- extend the `Promise.all` with `getPayoutAccount(supabase, user.id)` and destructure it as `account`;
- insert this section between the profile `</section>` and the stats `<section className="grid gap-3 sm:grid-cols-3">`:

```tsx
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-navy-deep">
          <Landmark className="h-4 w-4 text-brand" /> Výplatní účet
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          Sem ti členové tvých skupin posílají peníze. Vidí ho jen lidé, kteří jsou v některé z tvých skupin.
        </p>
        <div className="mt-4 max-w-md">
          <PayoutAccountForm current={account?.display} />
        </div>
      </section>
```

- [ ] **Step 4: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/NewOfferForm.tsx app/dashboard/nova/page.tsx app/dashboard/ucet/page.tsx
git commit -m "feat: číslo účtu při zakládání skupiny a v nastavení účtu"
```

---

### Task 12: Payment card and the group detail page

**Files:**
- Create: `components/dashboard/PaymentCard.tsx`
- Modify: `app/dashboard/nabidky/[id]/page.tsx`

- [ ] **Step 1: PaymentCard (server component)**

```tsx
// components/dashboard/PaymentCard.tsx
import { CheckCircle2, Clock } from 'lucide-react'
import { CopyButton } from './CopyButton'
import { ReportPaidButton, UndoReportButton } from './PaymentActions'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { formatDate } from '@/lib/billing'
import { formatCzk } from '@/lib/format'
import { qrSvg } from '@/lib/qr'
import { buildSpd, paymentMessage } from '@/lib/spd'
import type { PayoutAccount, PeriodView } from '@/lib/payments'

export async function PaymentCard({
  groupId,
  serviceName,
  payerName,
  account,
  vs,
  view,
}: {
  groupId: string
  serviceName: string
  payerName: string
  account: PayoutAccount | null
  vs: number
  view: PeriodView
}) {
  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="font-display text-lg font-bold tracking-tight text-navy-deep">
        {formatCzk(view.amount)} <span className="font-sans text-sm font-medium text-fg-muted">splatné {formatDate(view.period)}</span>
      </h2>
      <PaymentStatusBadge status={view.status} />
    </div>
  )

  if (view.status === 'paid') {
    return (
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        {header}
        <p className="mt-3 flex items-center gap-2 text-sm text-fg-muted">
          <CheckCircle2 className="h-4 w-4 text-brand" /> Zakladatel platbu potvrdil. Tenhle měsíc máš vyřízený.
        </p>
      </section>
    )
  }

  if (!account) {
    return (
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        {header}
        <p className="mt-3 text-sm text-fg-muted">
          Zakladatel ještě nezadal číslo účtu. Jakmile ho doplní, objeví se tu QR platba.
        </p>
      </section>
    )
  }

  const message = paymentMessage(serviceName, view.period, payerName)
  const svg = await qrSvg(buildSpd({ iban: account.iban, amount: view.amount, vs, message }))
  const rows = [
    { label: 'Účet', shown: account.display, copy: account.display },
    { label: 'Částka', shown: formatCzk(view.amount), copy: String(view.amount) },
    { label: 'VS', shown: String(vs), copy: String(vs) },
    { label: 'Zpráva', shown: message, copy: message },
  ]

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      {header}

      <div className="mt-5 flex flex-col gap-5 sm:flex-row">
        {/* SVG comes from our own QR renderer, not user input. */}
        <div
          className="mx-auto h-44 w-44 shrink-0 rounded-2xl border border-border bg-white p-3 sm:mx-0 [&>svg]:h-full [&>svg]:w-full"
          aria-label="QR platba — naskenuj ji v aplikaci své banky"
          role="img"
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        <dl className="min-w-0 flex-1 divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 py-2">
              <dt className="w-16 shrink-0 text-[11px] uppercase tracking-widest text-fg-muted">{row.label}</dt>
              <dd className="min-w-0 flex-1 truncate font-mono text-[13px] text-navy-deep">{row.shown}</dd>
              <CopyButton value={row.copy} label={row.label} />
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-5">
        {view.status === 'reported' && view.paymentId ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted px-4 py-3">
            <p className="flex items-center gap-2 text-sm text-navy-deep">
              <Clock className="h-4 w-4 text-fg-muted" /> Čeká na potvrzení od zakladatele
            </p>
            <UndoReportButton paymentId={view.paymentId} />
          </div>
        ) : (
          <ReportPaidButton groupId={groupId} period={view.period} />
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Wire it into the detail page**

In `app/dashboard/nabidky/[id]/page.tsx`:

Imports — add:
```tsx
import { Landmark } from 'lucide-react' // merge into the existing lucide import
import { PaymentCard } from '@/components/dashboard/PaymentCard'
import { MemberPaymentControls } from '@/components/dashboard/PaymentActions'
import { PaymentStatusBadge } from '@/components/dashboard/PaymentStatusBadge'
import { PayoutAccountForm } from '@/components/dashboard/PayoutAccountForm'
import { getPaymentView } from '@/lib/payments'
```

After `const members = await getMembers(supabase, offer.id)` add:
```tsx
  const payments = await getPaymentView(supabase, user.id, offer)
  const myName = members.find((m) => m.userId === user.id)?.name ?? ''
```

Directly after the hero `</section>` (before `{offer.note && (`), add:
```tsx
      {isOwner && !payments.account && (
        <section className="rounded-3xl border-2 border-brand/40 bg-card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-navy-deep">
            <Landmark className="h-4 w-4 text-brand" /> Doplň číslo účtu, ať ti členové můžou platit
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            Členům z něj vygenerujeme QR platbu. Uvidí ho jen lidé ve tvých skupinách.
          </p>
          <div className="mt-4 max-w-md">
            <PayoutAccountForm />
          </div>
        </section>
      )}

      {payments.mine?.periods.map((view) => (
        <PaymentCard
          key={view.period}
          groupId={offer.id}
          serviceName={offer.service.name}
          payerName={myName}
          account={payments.account}
          vs={payments.mine!.vs}
          view={view}
        />
      ))}
```

In the members list, inside `<li>` after the `<div className="min-w-0 flex-1">…</div>` and **before** the `RemoveMemberButton` block, add:
```tsx
              {isOwner && member.role === 'member' && payments.members.get(member.userId) && (
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <PaymentStatusBadge status={payments.members.get(member.userId)!.status} />
                  <MemberPaymentControls
                    groupId={offer.id}
                    userId={member.userId}
                    view={payments.members.get(member.userId)!}
                  />
                </div>
              )}
```

Replace the closing info paragraph text („Platby zatím nejsou napojené…“) with:
```tsx
        Peníze posíláš napřímo zakladateli skupiny. Ušetři je nedrží — jen hlídá, co je zaplacené.
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/PaymentCard.tsx "app/dashboard/nabidky/[id]/page.tsx"
git commit -m "feat: QR platba a stavy plateb v detailu skupiny"
```

---

### Task 13: Payment inbox on the overview

**Files:**
- Create: `components/dashboard/PaymentInbox.tsx`
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: PaymentInbox**

```tsx
// components/dashboard/PaymentInbox.tsx
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ServiceIcon } from '@/components/illustrations/ServiceIcon'
import { ConfirmPaymentButton, RejectPaymentButton } from './PaymentActions'
import { PaymentStatusBadge } from './PaymentStatusBadge'
import { formatDate } from '@/lib/billing'
import { formatCzk } from '@/lib/format'
import type { InboxItem } from '@/lib/payments'

export function PaymentInbox({ toPay, toConfirm }: { toPay: InboxItem[]; toConfirm: InboxItem[] }) {
  if (toPay.length === 0 && toConfirm.length === 0) return null

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {toPay.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold tracking-tight text-navy-deep">K zaplacení</h2>
          <ul className="mt-3 divide-y divide-border">
            {toPay.map((item) => (
              <li key={`${item.groupId}-${item.period}`}>
                <Link href={`/dashboard/nabidky/${item.groupId}`} className="flex items-center gap-3 py-3">
                  <ServiceIcon service={item.service} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-navy-deep">{item.service.name}</span>
                    <span className="block text-[12px] text-fg-muted">splatné {formatDate(item.period)}</span>
                  </span>
                  <span className="font-mono text-sm font-semibold text-navy-deep">{formatCzk(item.amount)}</span>
                  <PaymentStatusBadge status={item.status} />
                  <ChevronRight className="h-4 w-4 text-fg-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {toConfirm.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold tracking-tight text-navy-deep">
            Čeká na potvrzení <span className="font-sans text-sm font-medium text-fg-muted">{toConfirm.length}</span>
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {toConfirm.map((item) => (
              <li key={item.paymentId} className="flex flex-wrap items-center gap-3 py-3">
                <ServiceIcon service={item.service} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-navy-deep">{item.payerName}</span>
                  <span className="block text-[12px] text-fg-muted">
                    {item.service.name} · {formatCzk(item.amount)} · {formatDate(item.period)}
                  </span>
                </span>
                <ConfirmPaymentButton paymentId={item.paymentId!} />
                <RejectPaymentButton paymentId={item.paymentId!} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Render it on the overview**

In `app/dashboard/page.tsx`:
- import `PaymentInbox` from `@/components/dashboard/PaymentInbox` and `getPaymentInbox` from `@/lib/payments`;
- extend the `Promise.all` to `const [mine, fresh, inbox] = await Promise.all([…, getPaymentInbox(supabase, user.id)])`;
- insert `<PaymentInbox toPay={inbox.toPay} toConfirm={inbox.toConfirm} />` directly after the `<PageHeader … />` element (before the first `<Reveal className="hidden lg:block">`). It is not wrapped in a `hidden` class, so it shows on mobile too.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/PaymentInbox.tsx app/dashboard/page.tsx
git commit -m "feat: platby k zaplacení a k potvrzení na přehledu"
```

---

### Task 14: End-to-end check in the browser

**Files:** none unless bugs are found.

- [ ] **Step 1: Run the whole test suite and a production build**

Run: `npm test && npm run build`
Expected: all tests pass, build succeeds.

- [ ] **Step 2: Walk the flow with two accounts** (`npm run dev`, one normal window + one private window)

1. Account A: Účet → Výplatní účet → zadej `2000145399/0800` → pod polem se ukáže `CZ.. …`; uložit → toast.
2. Account A: Nová nabídka → pole účtu je předvyplněné → zveřejnit.
3. Zkus neplatné číslo `123456789/0800` → červená hláška, server vrátí stejnou chybu.
4. Account B: přidej se do skupiny → v detailu karta „K zaplacení“ s QR, řádky Účet/Částka/VS/Zpráva; kopírovací tlačítka dávají toast.
5. Naskenuj QR bankovní aplikací (George / ČSOB / KB / Air Bank) — platba se předvyplní se správným účtem, částkou, VS a zprávou. **Neodesílej ji.**
6. Account B: „Zaplatil jsem“ → stav „Čeká na potvrzení“ + „Vzít zpět“ funguje.
7. Account A: přehled ukazuje „Čeká na potvrzení 1“ → Nedorazilo → B vidí znovu „K zaplacení“.
8. B znovu nahlásí, A potvrdí v detailu skupiny → B vidí „Zaplaceno“, na přehledu B zmizí z „K zaplacení“.
9. Account A u jiného člena: „Označit jako zaplacené“ funguje.
10. Account A smaže výplatní účet přes SQL (`delete from payout_accounts where user_id = …`) → detail skupiny ukáže kartu „Doplň číslo účtu“; B vidí „Zakladatel ještě nezadal číslo účtu“. Pak účet znovu ulož.
11. Zkontroluj mobilní šířku (DevTools, 390 px): karta s QR se skládá pod sebe, nic nepřetéká.

- [ ] **Step 3: Fix and commit anything found**

```bash
git add -A
git commit -m "fix: drobnosti z ručního testu QR plateb"
```
(Skip if nothing changed.)

---

### Task 15: Registration note and legal texts

**Files:**
- Modify: `components/auth/AuthForm.tsx`
- Modify: `app/podminky/page.tsx`
- Modify: `app/ochrana-osobnich-udaju/page.tsx`
- Modify: `lib/legal.ts`

The privacy notice currently promises bank account numbers never reach us — that becomes false with this feature and **must** change in the same release.

- [ ] **Step 1: Registration sentence**

In `components/auth/AuthForm.tsx`, directly after the submit `</Button>` inside the `<form>`, add:
```tsx
        {!isLogin && (
          <p className="text-center text-[12px] text-fg-muted">
            Registrací potvrzuješ, že ti je alespoň 18 let a souhlasíš s{' '}
            <Link href="/podminky" className="underline underline-offset-2 hover:text-navy-deep">
              podmínkami
            </Link>
            .
          </p>
        )}
```
(`/podminky` article 3 already says accounts are for people over 18 — no change needed there.)

- [ ] **Step 2: Terms — Payments section**

In `app/podminky/page.tsx`, section 5 „Platby“, replace the first `<P>` („Členové si způsob platby dohodnou mezi sebou. …“) with:
```tsx
        <P>
          Zakladatel skupiny může v Ušetři uvést číslo svého bankovního účtu. Ušetři z něj členům vytvoří
          QR platbu a eviduje, kdo platbu nahlásil a kterou zakladatel potvrdil. Peníze posílá člen přímo
          ze své banky zakladateli. Evidence v Ušetři slouží jen pro přehled členů a není dokladem o platbě.
        </P>
        <P>
          Ceny uvedené v katalogu a v kalkulačce jsou orientační a vycházejí z veřejných ceníků
          poskytovatelů, které se mohou kdykoliv změnit.
        </P>
```

- [ ] **Step 3: Privacy notice**

In `app/ochrana-osobnich-udaju/page.tsx`, section 2:
- add a new `<LI>` after „Skupiny a členství“:
```tsx
          <LI>
            <strong>Číslo bankovního účtu zakladatele</strong> — pokud ho zadáš, vidí ho členové tvých
            skupin, aby ti mohli poslat platbu. Nikdo jiný k němu přístup nemá.
          </LI>
          <LI>
            <strong>Evidence plateb</strong> — za který měsíc člen platbu nahlásil, kdy ji zakladatel
            potvrdil a v jaké výši. Vidí ji jen plátce a zakladatel skupiny.
          </LI>
```
- replace the `<Callout>` with:
```tsx
        <Callout>
          <strong>Peníze přes nás neprocházejí.</strong> Platby posíláš přímo ze své banky. Čísla karet ani
          přihlašovací údaje do banky se k nám nikdy nedostanou — ukládáme jen číslo účtu, které zakladatel
          sám zadá, aby mu členové mohli zaplatit.
        </Callout>
```

- [ ] **Step 4: Bump the legal date**

In `lib/legal.ts`: `export const LEGAL_UPDATED = '24. září 2026'`.

- [ ] **Step 5: Type-check, lint, commit**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

```bash
git add components/auth/AuthForm.tsx app/podminky/page.tsx app/ochrana-osobnich-udaju/page.tsx lib/legal.ts
git commit -m "docs: podmínky a ochrana údajů pro QR platby, věta o 18+ u registrace"
```

---

## After this plan

- **Mobil (Expo):** samostatný plán — zkopírovat `lib/czech-account.ts`, `lib/billing.ts`, `lib/spd.ts` do `usetri-mobile/src/lib/`, `react-native-qrcode-svg`, `expo-clipboard`, `react-native-view-shot` + `expo-sharing` pro „Sdílet QR“, obrazovky `CreateSheet`, `ProfileScreen`, `OfferSheet`/`MemberSheet`, `HomeScreen`. Ověřit, že `todayInPrague` funguje v Hermes (Intl s `timeZone`).
- **E-mailové připomínky:** samostatná specifikace (cron + Resend).
- **Historie plateb** (spec: „Historie potvrzených plateb je vidět v seznamu plateb“): odloženo. Data v `payments` zůstávají, takže seznam jde přidat později bez migrace.
