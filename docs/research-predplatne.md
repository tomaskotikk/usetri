# Ušetři — research předplatných: ceny a feasibility

Stav: 22. 9. 2026. Zdroje u každé sekce. Ceny jsou měsíční v Kč, pokud není uvedeno jinak.

---

## 1. Verdikt

**Jde to udělat, ale ne pro celý katalog.** Ze současných 51 služeb v `services` je reálně
funkční zhruba třetina. Zbytek buď sdílení technicky/smluvně nedovolí, nebo z něj sdílením
nevznikne žádná úspora.

Dva nezávislé blokátory:

1. **Podmínky poskytovatelů (ToS)** — většina „Family" tarifů vyžaduje **stejnou adresu**
   a stále víc jich to začíná i vynucovat (Spotify hlášení polohy, Netflix ověření e-mailem).
2. **Regulace plateb (ČNB)** — pokud peníze mezi členy potečou přes náš účet, jsme
   poskytovatel platebních služeb a potřebujeme registraci. Bez ní pokuta až 50 mil. Kč.

Blokátor č. 2 je vážnější, protože se netýká jednotlivé služby, ale celého produktu.

---

## 2. Právní feasibility

### 2.1 Platební tok = regulovaná činnost

Model „platím zprostředkovateli, ten drží peníze a po poskytnutí služby je vyplácí
poskytovateli sníženě o provizi" je podle stanoviska ČNB k online tržištím
**poskytování platebních služeb**. Vyžaduje minimálně registraci **poskytovatele
platebních služeb malého rozsahu (PSMR)** u ČNB; po překročení zákonného objemu
transakcí plnou licenci platební instituce. Provoz bez registrace je správní delikt
s pokutou **až 50 000 000 Kč**.

**Tři cesty ven:**

| Cesta | Jak | Náklad / riziko |
|---|---|---|
| A. Peníze vůbec nedržíme | App je jen seznamka + evidence. Platba mezi lidmi mimo nás (bankovní převod, Revolut). | Nulové riziko, ale slabý produkt — nevynutíme placení, nemáme provizi z transakce |
| B. Delegujeme na licencovaného PSP | Stripe Connect / Mangopay / Adyen for Platforms — peníze drží oni, my jsme jen technický zprostředkovatel | Reálná cesta pro MVP. Poplatky ~1,5–3 % + fixní. Stripe Connect umí CZ |
| C. Vlastní registrace PSMR u ČNB | Sami se registrujeme | Měsíce administrativy, kapitálové a AML požadavky. Ne pro MVP |

**Doporučení: cesta B.** Stripe Connect (destination / separate charges) → peníze
formálně nikdy nejsou naše. Monetizace přes application fee.

Pozn.: i u cesty B platí **AML povinnosti** pro peer-to-peer tržiště (identifikace
uživatelů, monitoring podezřelých transakcí). Nutné zapracovat do onboardingu.

### 2.2 Podmínky poskytovatelů

Sdílení předplatného mezi lidmi mimo domácnost **není trestný čin** — je to porušení
smlouvy mezi uživatelem a poskytovatelem. Riziko nese **majitel účtu** (zrušení účtu),
ne platforma. Precedens existuje: francouzský Spliiit a Sharesub fungují roky a staví
obranu na tom, že sami přístup neposkytují, jen spojují lidi a zabezpečují platbu.

**Praktický dopad pro nás:** nesmíme uživatele navádět k porušení ToS. V UI je potřeba
u každé služby jasně říct, jestli sdílení mimo domácnost povoluje, nebo ne — a u těch,
co ne, buď je z katalogu vyhodit, nebo je označit varováním.

Zdroje:
[ČNB — povolení k platebním službám pro online tržiště](https://www.cnb.cz/cs/dohled-financni-trh/legislativni-zakladna/stanoviska-k-regulaci-financniho-trhu/RS2024-31),
[ARROWS — AML rizika P2P tržišť](https://arws.cz/novinky-v-arrows/online-trziste-peer-to-peer),
[epravo — kdy se musíte registrovat](https://www.epravo.cz/top/clanky/kdy-se-musite-registrovat-k-poskytovani-platebnich-sluzeb-97084.html),
[Spliiit — je sdílení legální](https://www.spliiit.com/en/blog/le-partage-dabonnement-est-il-legal)

---

## 3. Katalog: co funguje a co ne

### 🟢 Zelená — sdílení mimo domácnost oficiálně jde

Tady je produkt bez problému.

| Služba | Proč |
|---|---|
| **Netflix** (Standard/Premium) | Oficiální „další člen" za 109 Kč, vlastní účet a heslo, může bydlet jinde |
| **NordVPN** | 10 zařízení, bez podmínky domácnosti |
| **Proton VPN / Proton Family** | 10 zařízení |
| **Surfshark** | Neomezený počet zařízení |
| **Calm Family** | Výslovně uvádí, že členové **nemusí** bydlet ve stejné domácnosti |
| **Nintendo Switch Online Family** | 8 účtů, Nintendo adresu neřeší |

### 🟠 Oranžová — Family tarif existuje, ale vyžaduje stejnou adresu

Funguje technicky, ale je to porušení ToS a poskytovatel to začíná vynucovat.
Použitelné jen s explicitním varováním v UI.

| Služba | Vynucování |
|---|---|
| **Spotify Family** | **Nově povinné hlášení polohy** (automatická detekce nebo bod na mapě). Nejpřísnější ze všech |
| **YouTube Premium Family** | Sdílená adresa je požadavek, Google periodicky ověřuje |
| **Headspace Family** | Všichni musí při registraci zadat **stejnou fyzickou adresu** |
| **Apple One / Apple Music Family** | Rodinné sdílení vázané na jednu platební metodu a Apple ID organizátora |
| **Microsoft 365 Family** | 6 uživatelů, formálně domácnost, vynucování slabé |
| **Google One** | Sdílení s až 5 členy rodiny, vynucování slabé |
| **Duolingo Super Family** | 6 samostatných účtů, adresa se neověřuje |
| **Disney+, HBO Max, ostatní VOD** | Standardní klauzule o domácnosti |

### 🔴 Červená — vyhodit z katalogu

| Služba | Důvod |
|---|---|
| **Xbox Game Pass**, **PlayStation Plus** | **Family tarif vůbec neexistuje.** Sdílení = předávání přihlašovacích údajů. V katalogu je uvedeno 4 resp. 2 místa — to je smyšlené |
| **EA Play, Ubisoft+** | Totéž, jednouživatelské |
| **ChatGPT Team, Perplexity, ElevenLabs, Midjourney** | Cena je **za sedadlo**, ne za tarif. ChatGPT Team = $25/seat. Rozdělením ceny mezi 2 lidi se **neušetří nic** — každý platí plnou cenu svého sedadla. Ekonomicky nesmyslné |
| **Netflix Standard bez extra member** | 2 obrazovky ≠ 2 účty pro cizí lidi |

**Klíčový poznatek k AI kategorii:** celá kategorie `ai` v katalogu stojí na nepochopení
per-seat pricingu. Buď ji smazat, nebo přepsat tak, aby ukazovala jen služby s reálným
množstevním slevovým prahem.

Zdroje:
[Krater — sdílení AI předplatného](https://krater.ai/blog/share-ai-subscription-multiple-users),
[Spotify — podmínky Premium Family](https://www.spotify.com/cz/legal/premium-family-terms/),
[SMARTmania — Spotify Family a hlášení polohy](https://smartmania.cz/pouzivate-rodinne-predplatne-spotify-nove-budete-muset-zacit-hlasit-polohu/),
[Spliiit — sdílení VPN](https://www.spliiit.com/en/blog/partager-vpn-famille-legal)

---

## 4. Trend: okno se zavírá

Za poslední rok přitvrdily tři největší služby v katalogu:

- **Netflix** — podle českých médií od poloviny června 2026 každý dospělý profil vyžaduje
  vlastní e-mailovou adresu a přihlášení jednorázovým kódem. *(Ověřeno pouze z médií,
  ne z oficiální dokumentace — nutno potvrdit, než na tom postavíme produkt.)*
- **Spotify** — povinné hlášení polohy u Family tarifu.
- **YouTube Premium** — v říjnu 2026 zdražil rodinný tarif z 389 na 459 Kč (+18 %).

Směr je jednoznačný: poskytovatelé sdílení mimo domácnost systematicky uzavírají.
Produkt postavený primárně na VOD a hudbě má omezenou životnost. **Odolné jsou kategorie,
kde poskytovatel sdílení sám nabízí** — VPN, Netflix extra member, Nintendo, Calm.

---

## 5. Ceny: co je v DB vs. realita

Ceny v tabulce `services` jsou odhadnuté a u velkých služeb výrazně mimo.

| Služba | V DB | Ověřeno | Rozdíl |
|---|---|---|---|
| Netflix Standard | 229 (2 místa) | **339** | −110 |
| Netflix Premium | 309 (4 místa) | **419** | −110 |
| Spotify Family | 259 | **299** | −40 |
| YouTube Premium Family | 279 | **459** | −180 |
| Disney+ Standard | 189 (4 místa!) | **219** (2 zařízení) | −30, špatný počet míst |
| HBO Max Standard | 219 | **259** | −40 |
| Microsoft 365 Family | 259 | **349** (nebo 3 499/rok) | −90 |
| Google One 2 TB | 249 | **299,99** | −51 |
| PlayStation Plus Premium | 419 (2 místa) | **445** (0 sdílených míst) | −26, tarif nesdílitelný |
| Apple One Family | není | **449** | chybí |

Kalkulačka úspor tedy dnes ukazuje **nižší úsporu, než jaká reálně je** — u YouTube
Premium o 180 Kč měsíčně. To je marketingově škoda, ne jen nepřesnost.

**Doporučená úprava schématu:** přidat do `services`

- `sharing_policy` enum `open | household | none` — pohání barvu štítku a varování v UI
- `price_verified_at` date + `price_source` text — ať je vidět, kdy cena naposled seděla
- `per_seat_pricing` bool — vyloučí služby, kde sdílení neušetří

Zdroje:
[Netflix CZ — oficiální ceník](https://help.netflix.com/cs/node/24926),
[Mobilizujeme — YouTube Premium 2026](https://mobilizujeme.cz/clanky/youtube-premium-cena-predplatne),
[CHIP — zdražení YouTube Premium](https://www.chip.cz/novinky/youtube-premium-cenik-zdrazovani-rijen-2026),
[Mobilizujeme — Disney+ 2026](https://mobilizujeme.cz/clanky/disney-plus-cena-predplatne),
[Mobilizujeme — HBO Max 2026](https://mobilizujeme.cz/clanky/max-cena-predplatne),
[Applemagazin — Apple One a iCloud+ ceny ČR](https://applemagazin.eu/2026/08/25/apple-one-icloud-plus-ceny-cr-prehled/),
[Microsoft CZ — Microsoft 365 Family](https://www.microsoft.com/cs-cz/microsoft-365/buy/microsoft-365-family),
[Google One — tarify](https://one.google.com/about/plans?hl=cs)

---

## 6. Co dál

**Než se napíše další řádek kódu:**

1. Rozhodnout platební model. Bez toho nemá smysl stavět checkout. Doporučení: Stripe Connect.
2. Pročistit katalog — smazat červenou skupinu (10 služeb), doplnit `sharing_policy`.
3. Opravit ceny u top 10 služeb. Rozdíly jsou v řádu desítek procent.

**Do produktu:**

4. Štítek u každé nabídky: „✅ Sdílení povoleno" / „⚠️ Vyžaduje stejnou adresu".
   Chrání uživatele i nás.
5. Automatizace cen — ceníky se v roce 2026 mění několikrát ročně. Ruční údržba 50 služeb
   nebude fungovat. Buď scraper na oficiální ceníky, nebo `price_verified_at` + upozornění
   po 90 dnech.

**Ověřit:**

6. Netflixové pravidlo z června 2026 (vlastní e-mail na profil) v oficiální dokumentaci.
7. České ceny Xbox Game Pass Ultimate, Adobe CC, Canva Teams, Figma — nenašel jsem
   spolehlivý zdroj.
