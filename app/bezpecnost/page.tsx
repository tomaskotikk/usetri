import type { Metadata } from 'next'
import { Callout, LegalShell, LI, P, Section, UL } from '@/components/legal/LegalShell'
import { OPERATOR } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Bezpečnost a platby',
  description: 'Jak to u nás chodí s penězi a jak se nenechat napálit.',
}

export default function SafetyPage() {
  return (
    <LegalShell
      title="Bezpečnost a platby"
      intro="Jak to u nás dnes chodí s penězi, co za tebe hlídáme a co si musíš pohlídat sám."
    >
      <Section n={1} title="Peníze přes nás netečou">
        <Callout>
          Ušetři <strong>nepřijímá, nedrží ani nevyplácí</strong> peníze. Platbu si domluvíte a pošlete
          mezi sebou přímo — bankovním převodem, Revolutem, jak chcete.
        </Callout>
        <P>
          Je to tak schválně. Jakmile by peníze procházely přes nás, stali bychom se podle zákona
          poskytovatelem platebních služeb a potřebovali bychom k tomu povolení České národní banky.
          Dokud ho nemáme, peněz se nedotkneme.
        </P>
        <P>
          Znamená to ale i to, že <strong>nemůžeme zasáhnout, když platba nedorazí</strong> nebo když
          někdo nedodrží, co slíbil. Následující body proto ber vážně.
        </P>
      </Section>

      <Section n={2} title="Jak se nenechat napálit">
        <UL>
          <LI>
            <strong>Nikdy neposílej peníze dřív, než máš přístup.</strong> Domluvte se, že zakladatel
            nejdřív pošle pozvánku a ty zaplatíš po tom, co ti funguje.
          </LI>
          <LI>
            <strong>První měsíc plať po jednom měsíci.</strong> Trvalý příkaz nastav až ve chvíli, kdy víš,
            že druhá strana funguje.
          </LI>
          <LI>
            <strong>Nikomu neposílej svoje heslo.</strong> U rodinných tarifů dostaneš pozvánku na vlastní
            účet. Kdo po tobě chce přihlašovací údaje, dělá něco špatně.
          </LI>
          <LI>
            <strong>Plať tak, aby zůstala stopa.</strong> Bankovní převod se dá doložit, hotovost ne.
          </LI>
        </UL>
      </Section>

      <Section n={3} title="Co hlídáme my">
        <UL>
          <LI>Účty jsou vázané na ověřený e-mail nebo na účet Google.</LI>
          <LI>Hesla ukládáme jen jako otisk — nevidíme je ani my.</LI>
          <LI>Spojení s webem je vždy šifrované.</LI>
          <LI>Nabídky, které porušují pravidla nebo poškozují uživatele, odstraňujeme.</LI>
        </UL>
        <P>
          Co nehlídáme: zda zakladatel opravdu má tarif, který nabízí, a zda ti přístup dá. To zjistíš
          jedině tím, že mu dáš šanci to ukázat dřív, než pošleš peníze.
        </P>
      </Section>

      <Section n={4} title="Podmínky poskytovatelů">
        <P>
          Řada rodinných tarifů vyžaduje, aby všichni členové žili ve stejné domácnosti. Některé
          poskytovatele to dnes už i ověřují.
        </P>
        <P>
          U každé služby v katalogu píšeme, co o sdílení říkají její podmínky. Rozhodnutí je na tobě
          a <strong>riziko, že poskytovatel účet omezí, neseš ty</strong> — sdílení mimo domácnost je
          porušením smlouvy s ním, ne trestným činem.
        </P>
      </Section>

      <Section n={5} title="Co chystáme">
        <P>
          Pracujeme na placení přes platformu přes licencovanou platební instituci. Peníze by pak čekaly
          v úschově a majiteli se uvolnily až po tom, co potvrdíš, že ti přístup funguje.
        </P>
        <P>
          Dokud to nebude hotové, tuhle ochranu nenabízíme a netvrdíme, že ji máme.
        </P>
      </Section>

      <Section n={6} title="Když něco nesedí">
        <P>
          Narazil jsi na podvodnou nabídku, zneužitý účet nebo bezpečnostní chybu? Napiš na{' '}
          <strong>{OPERATOR.email}</strong>. Bezpečnostní hlášení řešíme přednostně.
        </P>
      </Section>
    </LegalShell>
  )
}
