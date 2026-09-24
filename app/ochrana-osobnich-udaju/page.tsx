import type { Metadata } from 'next'
import { Callout, LegalShell, LI, P, Section, UL } from '@/components/legal/LegalShell'
import { missing, OPERATOR, PROCESSORS } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Ochrana osobních údajů',
  description: 'Jaké údaje o tobě zpracováváme, proč a jak dlouho.',
}

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Ochrana osobních údajů"
      intro="Co o tobě víme, proč to potřebujeme, komu to předáváme a jak se toho zbavíš. Bez právnických obratů, které nikdo nečte."
    >
      <Section n={1} title="Kdo je správce">
        <P>
          Správcem tvých osobních údajů je {OPERATOR.name}
          {OPERATOR.ico ? `, IČO ${OPERATOR.ico}` : `, ${missing('IČO')}`}
          {OPERATOR.address ? `, se sídlem ${OPERATOR.address}` : `, ${missing('adresa sídla')}`}.
        </P>
        <P>
          Ve všem, co se týká osobních údajů, piš na <strong>{OPERATOR.email}</strong>. Pověřence pro
          ochranu osobních údajů nemáme jmenovaného — podle nařízení GDPR ho pro tento rozsah činnosti
          jmenovat nemusíme.
        </P>
      </Section>

      <Section n={2} title="Jaké údaje zpracováváme">
        <UL>
          <LI>
            <strong>E-mail a heslo</strong> — abys měl účet. Heslo se ukládá jen jako otisk, nevidíme ho.
          </LI>
          <LI>
            <strong>Jméno a profilový obrázek</strong> — vidí je ostatní členové skupin, do kterých se
            přidáš. Přihlásíš-li se přes Google, přebíráme je z tvého účtu Google.
          </LI>
          <LI>
            <strong>Skupiny a členství</strong> — které nabídky jsi založil a do kterých ses přidal, včetně
            ceny za místo a data.
          </LI>
          <LI>
            <strong>Číslo bankovního účtu zakladatele</strong> — pokud ho zadáš, vidí ho každý, kdo se
            přidá do některé z tvých skupin; ostatní uživatelé ho nevidí.
          </LI>
          <LI>
            <strong>Evidence plateb</strong> — za který měsíc člen platbu nahlásil, kdy ji zakladatel
            potvrdil a v jaké výši. Vidí ji jen plátce a zakladatel skupiny.
          </LI>
          <LI>
            <strong>Technické údaje</strong> — IP adresa a záznamy o přihlášení. Slouží k zabezpečení účtu
            a k odhalení zneužití.
          </LI>
        </UL>
        <Callout>
          <strong>Peníze přes nás neprocházejí.</strong> Platby posíláš přímo ze své banky. Čísla karet ani
          přihlašovací údaje do banky se k nám nikdy nedostanou — ukládáme jen číslo účtu, které zakladatel
          sám zadá, aby mu členové mohli zaplatit.
        </Callout>
      </Section>

      <Section n={3} title="Proč to zpracováváme">
        <UL>
          <LI>
            <strong>Plnění smlouvy</strong> — bez e-mailu a údajů o skupinách službu poskytnout nelze.
          </LI>
          <LI>
            <strong>Oprávněný zájem</strong> — zabezpečení účtů, prevence zneužití, provozní e-maily
            o dění ve tvých skupinách.
          </LI>
          <LI>
            <strong>Právní povinnost</strong> — pokud nám zákon uloží údaje uchovat.
          </LI>
          <LI>
            <strong>Souhlas</strong> — jen u věcí, které nejsou k provozu nutné. Souhlas můžeš kdykoliv
            odvolat.
          </LI>
        </UL>
      </Section>

      <Section n={4} title="Komu údaje předáváme">
        <P>
          Údaje neprodáváme. Předáváme je jen zpracovatelům, bez kterých by služba nefungovala, a jen
          v nezbytném rozsahu:
        </P>
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-navy-deep/4">
              <tr className="text-[13px] uppercase tracking-wider text-fg-muted">
                <th className="px-4 py-3 font-semibold">Zpracovatel</th>
                <th className="px-4 py-3 font-semibold">K čemu</th>
                <th className="px-4 py-3 font-semibold">Kde</th>
              </tr>
            </thead>
            <tbody>
              {PROCESSORS.map((p) => (
                <tr key={p.name} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold text-navy-deep">
                    <a href={p.url} target="_blank" rel="noreferrer noopener" className="underline-offset-4 hover:underline">
                      {p.name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-navy-deep/80">{p.role}</td>
                  <td className="px-4 py-3 text-fg-muted">{p.place}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          U zpracovatelů s přenosem mimo EU je přenos krytý standardními smluvními doložkami Evropské
          komise.
        </P>
      </Section>

      <Section n={5} title="Co vidí ostatní uživatelé">
        <P>
          Členové skupiny, do které se přidáš, vidí tvoje <strong>jméno a profilový obrázek</strong>.
          Tvůj e-mail se jim nezobrazuje.
        </P>
        <P>
          Pokud si s nimi chceš vyměnit kontakt, aby ti mohli poslat pozvánku do tarifu, uděláš to sám
          a dobrovolně.
        </P>
        <P>
          Založíš-li skupinu a zadáš k ní <strong>číslo bankovního účtu</strong>, vidí ho každý, kdo se
          přidá do některé z tvých skupin; ostatní uživatelé ho nevidí.
        </P>
        <UL>
          <LI>
            Zakladatel skupiny vidí, jestli a kdy jsi za daný měsíc zaplatil, a v jaké výši.
          </LI>
          <LI>
            Přednastavená platební zpráva nese do bankovního výpisu zakladatele tvoje křestní jméno
            a iniciálu příjmení.
          </LI>
          <LI>
            Když někdo ze skupiny pošle <strong>odkaz na pozvánku</strong>, kdokoli s tímto odkazem uvidí
            službu, cenu, počet volných míst a <strong>křestní jméno a profilový obrázek zakladatele</strong>
            — i bez přihlášení. Seznam členů ani další údaje pozvánka neukazuje.
          </LI>
        </UL>
      </Section>

      <Section n={6} title="Jak dlouho údaje držíme">
        <UL>
          <LI>Údaje účtu — po dobu jeho existence.</LI>
          <LI>
            Evidence plateb — po dobu trvání skupiny, i po odchodu člena. Smažeme ji spolu se skupinou
            nebo s účtem.
          </LI>
          <LI>Po zrušení účtu — smažeme je do 30 dnů.</LI>
          <LI>Záznamy o přihlášení — 12 měsíců.</LI>
          <LI>Co musíme uchovat ze zákona — po dobu, kterou zákon určí.</LI>
        </UL>
      </Section>

      <Section n={7} title="Tvoje práva">
        <UL>
          <LI>Vědět, jaké údaje o tobě máme, a dostat jejich kopii.</LI>
          <LI>Nechat je opravit, jsou-li nesprávné.</LI>
          <LI>Nechat je smazat.</LI>
          <LI>Omezit jejich zpracování nebo proti němu vznést námitku.</LI>
          <LI>Dostat je ve strojově čitelné podobě a přenést je jinam.</LI>
          <LI>Odvolat souhlas, pokud jsi ho udělil.</LI>
        </UL>
        <P>
          Napiš na <strong>{OPERATOR.email}</strong> a vyřídíme to do jednoho měsíce. Pokud se ti naše
          odpověď nebude zamlouvat, můžeš si stěžovat u <strong>Úřadu pro ochranu osobních údajů</strong>{' '}
          (uoou.gov.cz).
        </P>
      </Section>

      <Section n={8} title="Cookies">
        <P>
          Používáme jen cookies nutné k provozu — drží tvoje přihlášení. Bez nich by ses po každém kliknutí
          odhlásil, a proto k nim zákon souhlas nevyžaduje.
        </P>
        <P>
          <strong>Nepoužíváme reklamní ani analytické cookies</strong> a nikoho přes web nesledujeme. Kdyby
          se to změnilo, zeptáme se tě předem.
        </P>
      </Section>

      <Section n={9} title="Změny">
        <P>
          Tenhle dokument můžeme upravit. O podstatné změně dáme vědět e-mailem nebo v aplikaci. Datum
          poslední změny je nahoře.
        </P>
      </Section>
    </LegalShell>
  )
}
