import { Shield, Mail, Lock, UserCheck, Bell, FileText } from 'lucide-react';

const sections = [
  {
    icon: <Shield className="w-8 h-8" />,
    title: '1. Prevádzkovateľ a účel spracúvania',
    content: (
      <>
        <p className="mb-4">
          Prevádzkovateľom je spoločnosť <strong>Enhold s.r.o.</strong>, so sídlom 
          Drobného 1900/2, 841 02 Bratislava – mestská časť Dúbravka, IČO: 55400817, 
          zapísaná v Obchodnom registri Okresného súdu Bratislava I (ďalej len 
          „prevádzkovateľ“). V zmysle Nariadenia (EÚ) 2016/679 (GDPR) a zákona 
          č. 18/2018 Z. z. o ochrane osobných údajov spracúvame vaše osobné údaje 
          na účely riadneho poskytovania našich služieb, spracovania objednávok, 
          zabezpečenia komunikácie so zákazníkmi a plnenia našich právnych 
          povinností.
        </p>
      </>
    )
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: '2. Zbieranie a použitie osobných údajov',
    content: (
      <>
        <p className="mb-4">
          Pri návšteve našej stránky <strong>najsilnejsiaklbovavyziva.sk</strong> 
          (resp. <strong>fitdoplnky.sk</strong>) a pri nákupe produktov môžeme 
          spracúvať najmä nasledujúce kategórie osobných údajov:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Meno a priezvisko</li>
          <li>Kontaktné informácie (e-mail, telefónne číslo)</li>
          <li>Adresa bydliska alebo dodacia adresa</li>
          <li>Platobné informácie (napr. číslo účtu, údaje o platbe)</li>
          <li>IP adresa a informácie o prehliadači (cookies a pod.)</li>
        </ul>
        <p>
          Tieto údaje používame na spracovanie vašich objednávok, zlepšenie 
          našich služieb a komunikáciu s vami v súvislosti s vašimi objednávkami 
          či našimi produktmi. Právnym základom spracúvania je najmä plnenie 
          zmluvy (objednávky), plnenie zákonných povinností a prípadne náš 
          oprávnený záujem (napr. pri zlepšovaní našej ponuky).
        </p>
      </>
    )
  },
  {
    icon: <Lock className="w-8 h-8" />,
    title: '3. Bezpečnosť a doba uchovávania',
    content: (
      <>
        <p className="mb-4">
          Zabezpečujeme, aby vaše osobné údaje boli chránené pred neoprávneným 
          prístupom, zmenou, zverejnením alebo zničením. Používame rôzne 
          bezpečnostné technológie a postupy na ochranu vašich údajov. Osobné 
          údaje uchovávame len počas nevyhnutnej doby v súlade s účelom ich 
          spracúvania (napr. počas trvania zmluvného vzťahu, po dobu uchovávania 
          účtovných dokladov stanovenú zákonom a pod.).
        </p>
      </>
    )
  },
  {
    icon: <UserCheck className="w-8 h-8" />,
    title: '4. Zdieľanie osobných údajov',
    content: (
      <>
        <p className="mb-4">
          Vaše osobné údaje nezdieľame s tretími stranami, okrem prípadov, kde je 
          to nevyhnutné na splnenie povinností vyplývajúcich z kúpnej zmluvy 
          (napr. doručovateľské spoločnosti a platobné brány), plnenie zákonných 
          požiadaviek alebo ochranu našich práv a majetku. V prípade, ak 
          spracúvanie osobných údajov vykonáva pre nás externý partner 
          (sprostredkovateľ), dbáme, aby bolo upravené písomnou zmluvou, ktorá 
          zabezpečuje primeranú ochranu vašich údajov podľa GDPR.
        </p>
      </>
    )
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: '5. Práva zákazníka (dotknutej osoby)',
    content: (
      <>
        <p className="mb-4">
          Ako dotknutá osoba máte v súvislosti so spracúvaním osobných údajov 
          najmä tieto práva:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            <strong>Právo na prístup k údajom</strong> – môžete si vyžiadať 
            kópiu osobných údajov, ktoré o vás spracúvame.
          </li>
          <li>
            <strong>Právo na opravu</strong> – máte právo na opravu nesprávnych 
            či neaktuálnych osobných údajov.
          </li>
          <li>
            <strong>Právo na vymazanie (zabudnutie)</strong> – môžete nás požiadať 
            o vymazanie vašich osobných údajov, ak už nie sú potrebné na účely, 
            na ktoré boli získané, resp. ak uplynula ich zákonná lehota spracúvania.
          </li>
          <li>
            <strong>Právo na obmedzenie spracúvania</strong> – v určitých 
            prípadoch môžete požadovať, aby sme vaše osobné údaje 
            spracúvali len pre najnutnejšie zákonné účely.
          </li>
          <li>
            <strong>Právo namietať</strong> – v prípade spracúvania na základe 
            oprávneného záujmu môžete podať námietku.
          </li>
          <li>
            <strong>Právo na prenosnosť údajov</strong> – ak je to technicky 
            možné, na základe vašej žiadosti vám poskytneme údaje v bežne 
            používanom formáte alebo ich priamo prenesieme inému prevádzkovateľovi.
          </li>
          <li>
            <strong>Právo podať sťažnosť</strong> – ak sa domnievate, že 
            spracúvanie vašich údajov je v rozpore s platnými právnymi 
            predpismi, môžete podať sťažnosť na Úrad na ochranu osobných údajov 
            SR (<a
              href="https://dataprotection.gov.sk"
              target="_blank"
              rel="noreferrer"
            >
              https://dataprotection.gov.sk
            </a>).
          </li>
        </ul>
        <p>
          Ak máte akékoľvek otázky alebo chcete uplatniť niektoré z týchto práv, 
          kontaktujte nás, prosím, na e-mailovej adrese 
          <strong> info@fitdoplnky.sk</strong>.
        </p>
      </>
    )
  },
  {
    icon: <Bell className="w-8 h-8" />,
    title: '6. Zmeny v ochrane osobných údajov',
    content: (
      <>
        <p className="mb-4">
          Vyhradzujeme si právo aktualizovať alebo zmeniť tieto pravidlá ochrany 
          osobných údajov kedykoľvek. O všetkých podstatných zmenách vás budeme 
          informovať prostredníctvom našej webovej stránky alebo e-mailom. 
          Odporúčame pravidelne kontrolovať túto stránku, aby ste sa oboznámili 
          s prípadnými zmenami.
        </p>
      </>
    )
  }
];

export default function OchranaOsobnychUdajovPage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Ochrana osobných údajov</h1>
          
          <div className="bg-green-50 rounded-2xl p-6 mb-12">
            <p className="text-sm text-gray-600">
              <strong>Posledná aktualizácia:</strong> 19.12.2023
            </p>
            <p className="mt-4">
              Vitajte na webovej stránke <strong>najsilnejsiaklbovavyziva.sk</strong> 
              (resp. <strong>fitdoplnky.sk</strong>). Vaše súkromie a ochrana 
              osobných údajov sú pre nás mimoriadne dôležité. V tomto dokumente 
              vysvetľujeme, aké údaje zbierame, prečo ich zbierame a ako s nimi 
              zaobchádzame v súlade s Nariadením (EÚ) 2016/679 (GDPR) a zákonom 
              č. 18/2018 Z. z. o ochrane osobných údajov.
            </p>
          </div>

          <div className="space-y-12">
            {sections.map((section, index) => (
              <section
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="text-green-600 flex-shrink-0">
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                    <div className="text-gray-600">{section.content}</div>
                  </div>
                </div>
              </section>
            ))}
          </div>

          <section className="mt-12 bg-gray-50 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <Mail className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold mb-4">Kontakt</h2>
                <p className="text-gray-600">
                  Ak máte akékoľvek otázky týkajúce sa tejto politiky ochrany 
                  osobných údajov alebo chcete uplatniť niektoré z vyššie 
                  uvedených práv, neváhajte nás kontaktovať na{' '}
                  <a
                    href="mailto:info@fitdoplnky.sk"
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    info@fitdoplnky.sk
                  </a>
                  {'.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
