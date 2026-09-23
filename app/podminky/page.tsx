import type { Metadata } from 'next'
import { Callout, LegalShell, LI, P, Section, UL } from '@/components/legal/LegalShell'
import { missing, OPERATOR } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Podmínky použití',
  description: 'Pravidla, za kterých můžeš Ušetři používat.',
}

export default function TermsPage() {
  return (
    <LegalShell
      title="Podmínky použití"
      intro="Tyhle podmínky určují, co Ušetři dělá, co nedělá a za co kdo odpovídá. Používáním služby s nimi souhlasíš."
    >
      <Section n={1} title="Kdo službu provozuje">
        <P>
          Službu Ušetři na adrese {OPERATOR.site} provozuje {OPERATOR.name}
          {OPERATOR.ico ? `, IČO ${OPERATOR.ico}` : `, ${missing('IČO')}`}
          {OPERATOR.address ? `, se sídlem ${OPERATOR.address}` : `, ${missing('adresa sídla')}`} (dále jen
          &bdquo;provozovatel&ldquo;).
        </P>
        <P>
          Kontaktovat nás můžeš na <strong>{OPERATOR.email}</strong>. Na zprávy odpovídáme v pracovní dny.
        </P>
      </Section>

      <Section n={2} title="Co Ušetři je">
        <P>
          Ušetři je <strong>seznamovací a evidenční nástroj</strong>. Pomáhá lidem, kteří chtějí sdílet jedno
          předplatné, najít se navzájem a vést si přehled o tom, kdo v které skupině je a kolik za ni platí.
        </P>
        <Callout>
          Ušetři <strong>není</strong> poskytovatelem Spotify, Netflixu, Disney+ ani žádné jiné služby, kterou
          v katalogu najdeš. Nemáme k nim žádný vztah, nejsme jejich partner ani prodejce a nezajišťujeme
          k nim přístup.
        </Callout>
        <P>Konkrétně Ušetři:</P>
        <UL>
          <LI>neprodává předplatné ani místa v tarifech,</LI>
          <LI>nezakládá ani nespravuje účty u poskytovatelů služeb,</LI>
          <LI>nezprostředkovává hesla ani přihlašovací údaje,</LI>
          <LI>není stranou dohody mezi zakladatelem skupiny a jejími členy.</LI>
        </UL>
      </Section>

      <Section n={3} title="Účet">
        <P>
          Účet si může založit fyzická osoba starší 18 let. Údaje, které při registraci uvedeš, musí být
          pravdivé. Za přístup ke svému účtu odpovídáš ty — heslo nikomu nesděluj.
        </P>
        <P>
          Účet je osobní a nepřevoditelný. Kdykoliv ho můžeš zrušit; provozovatel ho může zrušit v případech
          uvedených v článku 8.
        </P>
      </Section>

      <Section n={4} title="Skupiny a dohoda mezi členy">
        <P>
          Zakladatel skupiny v ní nabízí volná místa a určuje cenu za místo. Člen se k místu přihlásí. Tím
          mezi nimi vzniká <strong>dohoda, jejíž stranou provozovatel není</strong>.
        </P>
        <UL>
          <LI>Za to, že členovi skutečně zajistí přístup, odpovídá zakladatel skupiny.</LI>
          <LI>Za to, že za místo zaplatí, odpovídá člen.</LI>
          <LI>Případné spory mezi nimi řeší členové mezi sebou.</LI>
        </UL>
        <P>
          Údaje v nabídce — cena, počet míst, poznámka — vkládá zakladatel. Provozovatel je neověřuje a
          neručí za jejich správnost.
        </P>
      </Section>

      <Section n={5} title="Platby">
        <Callout>
          Platby mezi členy <strong>neprocházejí přes Ušetři</strong>. Provozovatel peníze nepřijímá,
          nedrží ani nevyplácí, a proto ani neručí za to, že platba mezi členy proběhne.
        </Callout>
        <P>
          Členové si způsob platby dohodnou mezi sebou. Ceny uvedené v katalogu a v kalkulačce jsou
          orientační a vycházejí z veřejných ceníků poskytovatelů, které se mohou kdykoliv změnit.
        </P>
        <P>
          Pokud provozovatel v budoucnu zavede placení přes platformu, bude to probíhat prostřednictvím
          licencované platební instituce a tyto podmínky se předem změní.
        </P>
      </Section>

      <Section n={6} title="Podmínky poskytovatelů služeb">
        <P>
          Každý poskytovatel má vlastní obchodní podmínky a některé rodinné tarify v nich vyžadují, aby
          členové žili ve stejné domácnosti. <strong>Dodržení těchto podmínek je na tobě.</strong>
        </P>
        <P>
          U služeb v katalogu uvádíme, co jejich podmínky o sdílení říkají, ale jde o informaci, ne o právní
          radu. Provozovatel nenese odpovědnost za to, že ti poskytovatel omezí nebo zruší účet.
        </P>
      </Section>

      <Section n={7} title="Co na Ušetři nesmíš">
        <UL>
          <LI>Vydávat se za někoho jiného nebo uvádět nepravdivé údaje.</LI>
          <LI>Nabízet místa, ke kterým nemůžeš zajistit přístup.</LI>
          <LI>Sdílet cizí přihlašovací údaje nebo je po ostatních vyžadovat.</LI>
          <LI>Obtěžovat ostatní uživatele, rozesílat spam nebo nabízet nesouvisející zboží a služby.</LI>
          <LI>Získávat data ze služby automatizovaně nebo obcházet její technická opatření.</LI>
        </UL>
      </Section>

      <Section n={8} title="Omezení odpovědnosti">
        <P>
          Službu poskytujeme tak, jak je. Snažíme se, aby fungovala, ale nezaručujeme nepřetržitý provoz
          ani to, že v ní najdeš skupinu.
        </P>
        <P>
          Provozovatel neodpovídá za škodu vzniklou z dohody mezi členy, z jednání jiného uživatele ani
          z porušení podmínek poskytovatele služby. Tím není dotčena odpovědnost, kterou podle zákona
          vyloučit nelze — zejména za úmyslné jednání a za újmu na zdraví.
        </P>
        <P>
          Provozovatel může účet omezit nebo zrušit, pokud uživatel poruší tyto podmínky, poškozuje ostatní
          uživatele nebo službu využívá k protiprávnímu jednání.
        </P>
      </Section>

      <Section n={9} title="Změny podmínek">
        <P>
          Podmínky můžeme změnit. O podstatné změně dáme vědět e-mailem nebo v aplikaci nejméně 14 dní
          předem. Pokud se změnou nesouhlasíš, můžeš do té doby účet zrušit.
        </P>
      </Section>

      <Section n={10} title="Rozhodné právo a spory">
        <P>
          Vztah mezi tebou a provozovatelem se řídí právem České republiky. Spory rozhodují české soudy.
        </P>
        <P>
          Jsi-li spotřebitel, máš právo na mimosoudní řešení sporu u <strong>České obchodní inspekce</strong>{' '}
          (adr.coi.cz). Tím není dotčeno tvoje právo obrátit se na soud.
        </P>
      </Section>
    </LegalShell>
  )
}
