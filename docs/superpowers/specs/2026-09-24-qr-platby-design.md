# Ušetři — QR platby mezi členy (fáze 1)

Datum: 2026-09-24
Stav: Schváleno uživatelem, čeká na review specifikace

## Účel

Členové skupin si dnes platby domlouvají mimo appku („Platby zatím nejsou napojené“).
Tahle fáze přidá platby **bez toho, abychom drželi peníze** (cesta A z
`docs/research-predplatne.md` — žádná regulace ČNB):

- zakladatel zadá číslo účtu,
- appka členům generuje české QR platby (SPD) s částkou, VS a zprávou,
- člen nahlásí „Zaplatil jsem“, zakladatel potvrdí,
- obě strany vidí, co je zaplacené, co čeká a co je po splatnosti.

Peníze jdou přímo z banky člena do banky zakladatele. Ušetři jen eviduje.

## Mimo rozsah

- E-mailové připomínky (vyžadují cron) — samostatná další specifikace.
- Automatické párování plateb s bankovním výpisem.
- Placení více měsíců dopředu.
- Stripe / jakékoli držení peněz (fáze 2).
- Čištění katalogu a `sharing_policy` — samostatná specifikace.

## Fakturační model

**Každý člen platí k výročí svého `billing_start`.** Kdo začal platit 12. 10., má splatnost
12. každého měsíce. Žádné poměrné částky.

- Zakladatel (`role = 'owner'`) neplatí — platby se týkají jen `role = 'member'`.
- **Období** = `[start, start + 1 měsíc)`. Den splatnosti = první den období.
- Pokud měsíc nemá den `billing_start` (31. → únor), splatnost je poslední den měsíce.
  Další měsíc se vrací na původní den (31. 1. → 28. 2. → 31. 3.). Počítá se vždy od
  `billing_start`, ne od předchozí splatnosti.
- **Aktuální období** = poslední období, jehož splatnost ≤ dnes.
- **Náhled dalšího období**: 7 dní před další splatností se ukáže i karta na další měsíc.
- **Stav období** (odvozený, neukládá se):
  - `paid` — existuje záznam v `payments` se `status = 'confirmed'`
  - `reported` — existuje záznam se `status = 'reported'`
  - `overdue` — žádný záznam a dnes > splatnost + 3 dny
  - `due` — jinak
- Stav se počítá **jen pro aktuální období** (a náhled dalšího). Starší nezaplacená
  období se nezobrazují jako dluh — zakladatel řeší neplatiče odebráním ze skupiny.
  Historie potvrzených plateb je vidět v seznamu plateb.

Čas: všechna data jsou kalendářní data v `Europe/Prague`.

## Databáze

Jedna migrace `payments_qr`.

### `payout_accounts` (nová)

| sloupec | typ | pozn. |
|---|---|---|
| `user_id` | uuid PK → `profiles.id` on delete cascade | |
| `iban` | text not null | `check (iban ~ '^CZ[0-9]{22}$')` |
| `account_display` | text not null | jak uživatel zadal, normalizováno: `[předčíslí-]číslo/kód` |
| `updated_at` | timestamptz default now() | |

RLS:
- select: vlastník (`auth.uid() = user_id`) **nebo** člen skupiny, jejímž zakladatelem je
  `user_id` (`exists group_members m join groups g … where g.owner_id = user_id and m.user_id = auth.uid()`).
- insert / update: jen vlastník. delete: jen vlastník.

Nikdy nepřidávat účet do `profiles` — ty jsou čitelné všemi přihlášenými.

### `group_members` (úprava)

- `billing_start date not null default (now() at time zone 'Europe/Prague')::date`
  — stávající řádky dostanou datum nasazení (žádný zpětný dluh).
- `payment_ref bigint not null unique default nextval('payment_ref_seq')`,
  sekvence začíná na `40000001` → slouží jako **VS** (8 číslic).
- **Trigger `before insert`** (sloučit do stávajícího `guard_seat_capacity`) oba sloupce
  **vždy přepíše** serverovými hodnotami — klient (mobil vkládá napřímo) si nesmí zvolit
  vlastní `billing_start` ani VS.
- `group_members` dál nemá žádnou UPDATE policy — sloupce po vložení nejdou změnit.
- `payment_ref` je čitelný všemi přihlášenými (jako celá tabulka) — nízké riziko, vědomá volba.

### `payments` (nová)

| sloupec | typ | pozn. |
|---|---|---|
| `id` | uuid PK default gen_random_uuid() | |
| `group_id` | uuid → `groups.id` on delete cascade | |
| `user_id` | uuid → `profiles.id` on delete cascade | plátce |
| `period_start` | date not null | splatnost období |
| `amount` | int not null | Kč; nastavuje trigger |
| `status` | text not null check in (`reported`, `confirmed`) | |
| `reported_at` | timestamptz | |
| `confirmed_at` | timestamptz | |
| `created_at` | timestamptz default now() | |

`unique (group_id, user_id, period_start)`.

**Trigger `before insert`:**
- `amount := groups.price_per_seat` (klient částku neurčuje),
- ověří, že `user_id` je v `group_members` té skupiny s `role = 'member'`,
- ověří, že `period_start` je platná splatnost pro jeho `billing_start`
  (`period_start >= billing_start`, SQL funkce `is_billing_date(billing_start, d)` se
  stejnou logikou jako `lib/billing.ts` včetně konce měsíce) a že není víc než 7 dní po
  dnešku, kde dnešek = `(now() at time zone 'Europe/Prague')::date` (ne UTC `current_date`),
- nastaví `reported_at` / `confirmed_at` podle `status`.

**Trigger `before update`:** povolen jen přechod `reported → confirmed`; nastaví
`confirmed_at = now()`; ostatní sloupce se nesmí měnit.

RLS:
- select: plátce nebo zakladatel skupiny.
- insert: plátce se `status = 'reported'` a `user_id = auth.uid()`;
  **nebo** zakladatel skupiny se `status = 'confirmed'` (ruční „zaplaceno“, např. hotovost).
- update: jen zakladatel skupiny.
- delete: zakladatel skupiny („Nedorazilo“ u `reported`, ale záměrně i u `confirmed` jako
  zpět vzaté „Označit jako zaplacené“) **nebo** plátce, pokud `status = 'reported'`
  („Vzít zpět“).

IBAN zakladatele uvidí každý, kdo se přidá do otevřené skupiny — plyne z návrhu (bez účtu
nejde zaplatit), vědomá volba.

Mobil zapisuje do Supabase napřímo, takže **RLS + triggery jsou jediná bezpečnostní hranice**.

## Sdílená logika (čisté funkce, s testy)

Web: `lib/`. Mobil je samostatný balíček bez sdíleného kódu → stejné soubory
se zkopírují do `usetri-mobile/src/lib/` (hlavička: „kopie z webu, měnit obojí“).

### `lib/czech-account.ts`
- `parseCzechAccount(input): { prefix, number, bank } | null` — přijme
  `123456789/0800`, `19-123456789/0800`, mezery okolo; ověří váhový kontrolní součet
  (mod 11, váhy 6,3,7,9,10,5,8,4,2,1 na číslo **zleva doplněné nulami na 10 číslic**;
  předčíslí se stejně doplní na 10, tj. efektivně váhy 10,5,8,4,2,1) a že kód banky je
  4 číslice.
- `toIban(parsed): string` — `CZkk` + kód banky + předčíslí (6) + číslo (10), mod 97.
- `formatAccount(parsed): string` — normalizovaný tvar pro `account_display`.
- Přijme i vložený IBAN (`CZ65 0800 …`) — ověří mod 97 a převede zpět na český tvar.

### `lib/billing.ts`
Všechna data jako řetězce `'YYYY-MM-DD'` (žádný JS `Date` — posun o den mezi UTC
serverem, klientem a Postgres `date`). `todayInPrague()` vrací dnešek v `Europe/Prague`.
- `dueDateFor(billingStart, monthOffset): string`
- `currentPeriod(billingStart, today): string`
- `upcomingPeriod(billingStart, today): string | null` — vrací další splatnost, pokud je ≤ 7 dní.
- `periodStatus(period, payment | null, today): 'paid' | 'reported' | 'overdue' | 'due'`

### `lib/spd.ts`
- `buildSpd({ iban, amount, vs, message }): string` →
  `SPD*1.0*ACC:CZ…*AM:109.00*CC:CZK*X-VS:40000017*MSG:…`
- `paymentMessage(serviceName, period, payerName)` → `Usetri Netflix 10/2026 Tomas K.`
  — bez diakritiky, `*` odstraněny, max 60 znaků (zkrátí jméno služby).

## Web

### Založení skupiny (`NewOfferForm`, `createOffer`)
- Nový krok po výběru ceny: **„Kam ti mají členové posílat peníze?“** — pole
  „Číslo účtu“ (placeholder `123456789/0800`), okamžitá validace na klientu.
- Pokud už `payout_accounts` existuje, předvyplní se a stačí potvrdit.
- `createOffer` účet validuje znovu a udělá upsert do `payout_accounts` před vložením skupiny.
- Povinné pro nové skupiny — vynucuje jen UI/server action, ne databáze (mobil vkládá
  skupinu napřímo). Záměrně: případ „zakladatel bez účtu“ je stejně pokrytý níže.

### Účet (`/dashboard/ucet`)
- Sekce **„Výplatní účet“** — zobrazení + úprava čísla účtu (server action `savePayoutAccount`).

### Detail skupiny (`/dashboard/nabidky/[id]`)
- Nahradit info box „Platby zatím nejsou napojené“.
- **Člen** vidí kartu `PaymentCard` pro aktuální období (+ náhled dalšího):
  - QR (SVG z knihovny `qrcode`, generované na serveru),
  - řádky Účet / Částka / VS / Zpráva, každý s tlačítkem kopírovat (toast „Zkopírováno“),
  - tlačítko **„Zaplatil jsem“** → `reportPayment(groupId, period)`,
  - ve stavu `reported`: „Čeká na potvrzení od zakladatele“ + **„Vzít zpět“**,
  - ve stavu `paid`: zelené „Zaplaceno ✓“, QR skryté,
  - pokud zakladatel nemá účet: „Zakladatel ještě nezadal číslo účtu.“
- **Zakladatel** vidí u každého člena v seznamu štítek stavu aktuálního období a akce:
  - `reported` → **Potvrdit** / **Nedorazilo**,
  - `due` / `overdue` → **Označit jako zaplacené**,
  - `paid` → nic (jen štítek).
- Zakladatel bez účtu: výrazná karta „Doplň číslo účtu, ať ti členové můžou platit“ s formulářem.

### Přehled (`/dashboard`)
- Sekce **„K zaplacení“** — moje aktuální období `due` / `overdue` napříč skupinami
  (odkaz na detail). Náhled dalšího období sem nepatří, je jen v detailu skupiny.
- Sekce **„Čeká na potvrzení (n)“** — pro zakladatele, platby `reported` v jeho skupinách.
- Obě se skryjí, když jsou prázdné.

### Server actions (`app/dashboard/actions.ts`)
`savePayoutAccount`, `reportPayment`, `undoReport`, `confirmPayment`, `rejectPayment`
(delete reported), `markPaid` (owner insert confirmed). Chybové hlášky česky ve stylu
stávajících akcí. Po akci `refresh()`.

### Data (`lib/dashboard.ts`)
- `getPaymentView(supabase, userId, groupId)` — účet zakladatele, moje období a jejich
  platby, pro zakladatele stav každého člena.
- `getPaymentInbox(supabase, userId)` — data pro sekce na přehledu.
- `group_members` select rozšířit o `billing_start`, `payment_ref`.

## Mobil (Expo)

Stejné chování, po dokončení webu:
- `CreateSheet` — krok s číslem účtu.
- `ProfileScreen` — výplatní účet.
- `OfferSheet` / `MemberSheet` — platební karta člena a akce zakladatele.
- `HomeScreen` — „K zaplacení“ a „Čeká na potvrzení“.
- QR: `react-native-qrcode-svg` (`react-native-svg` už je v projektu).
- **Na telefonu nejde naskenovat QR z vlastní obrazovky** → kopírovací řádky jsou hlavní
  cesta a tlačítko **„Sdílet QR“** (`react-native-view-shot` + `expo-sharing`) umožní
  uložit obrázek a načíst ho v bankovní aplikaci.
- Kopírování: `expo-clipboard`.

## Registrace

Pod tlačítko registrace věta: „Registrací potvrzuješ, že ti je alespoň 18 let a souhlasíš
s podmínkami.“ (odkaz na `/podminky`). Stejná věta do `/podminky`. Nic se neukládá.
Na přání uživatele; nesouvisí s platbami → vlastní commit.

## Chyby a okrajové případy

- Neplatné číslo účtu → „Tohle číslo účtu nevypadá správně. Zkontroluj ho prosím.“
- Dvojí nahlášení stejného období → unique constraint → „Tuhle platbu už jsi nahlásil.“
- Zakladatel změní cenu → týká se jen plateb vložených potom (`amount` se ukládá).
- Člen odejde / je odebrán → jeho `payments` zůstanou (historie), nové se nevytvoří.
- Zakladatel smaže skupinu → cascade smaže platby.
- Zakladatel změní účet → QR se generuje z aktuálního účtu; staré platby se nemění.

## Testování

- Vitest: `czech-account` (platná / neplatná čísla, předčíslí, IBAN tam a zpět, známé
  reálné IBANy), `billing` (konec měsíce, přestupný rok, přechod roku, stav po 3 dnech),
  `spd` (formát, diakritika, oříznutí, `*` ve jméně).
- RLS: ručně přes `execute_sql` s `set local role authenticated` + `request.jwt.claims`
  — cizí uživatel nevidí `payout_accounts`, člen nemůže potvrdit vlastní platbu, nemůže
  vložit jinou částku, nemůže nahlásit období 2 měsíce dopředu, nemůže si při vstupu
  zvolit vlastní `billing_start` ani VS.
- QR ověřit naskenováním reálnou bankovní appkou (George / ČSOB / KB) — ruční krok.

## Pořadí prací

1. Čisté funkce + testy.
2. Migrace + RLS + ověření RLS.
3. Typy `types/database.ts`.
4. Web: účet → založení skupiny → detail skupiny → přehled → registrace.
5. Mobil.
