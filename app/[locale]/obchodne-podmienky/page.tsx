import { Metadata } from 'next';
import LegalDocumentTabs from './LegalDocumentTabs';

type LegalContent = {
  metadataTitle: string;
  metadataDescription: string;
  label: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  appLabel: string;
  appTitle: string;
  appSubtitle: string;
  appEffectiveDate: string;
  shopTabLabel: string;
  appTabLabel: string;
  bodyHtml: string;
};

const contentByLocale: Record<string, LegalContent> = {
  sk: {
    metadataTitle: 'Obchodné podmienky | GardenYX',
    metadataDescription:
      'Obchodné podmienky e-shopu GardenYX vrátane objednávok, platieb, dodania, reklamácií a odstúpenia od zmluvy.',
    label: 'Obchodné podmienky e-shopu',
    title: 'Obchodné podmienky',
    subtitle: 'E-shop (gardenyx.eu)',
    effectiveDate: 'Dátum účinnosti: 6. marca 2026',
    appLabel: 'Podmienky používania aplikácie',
    appTitle: 'Podmienky používania',
    appSubtitle: 'Mobilná aplikácia',
    appEffectiveDate: 'Dátum účinnosti: 6. marca 2026',
    shopTabLabel: 'E-shop',
    appTabLabel: 'Aplikácia',
    bodyHtml: `
      <h2>1. Všeobecné ustanovenia</h2>
      <p>Tieto Obchodné podmienky ("Podmienky") upravujú používanie internetového obchodu na gardenyx.eu ("E-shop") a nákup produktov ponúkaných prostredníctvom neho. E-shop prevádzkuje spoločnosť JOINA Garden, s. r. o., so sídlom Karpatské námestie 7770/10A, Bratislava – mestská časť Rača 831 06, Slovenská republika, IČO: 57 313 504 ("Predávajúci", "my").</p>
      <p>Odoslaním objednávky cez E-shop vy ("Kupujúci") súhlasíte s týmito Podmienkami. Prečítajte si ich pozorne pred uskutočnením nákupu.</p>
      <h2>2. Produkty</h2>
      <p>E-shop ponúka rastlinné hnojivá a súvisiace záhradnícke produkty ("Produkty"). Všetky Produkty sú popísané s ich kľúčovými charakteristikami, zložením, návodom na použitie a cenou na príslušných produktových stránkach.</p>
      <p>Obrázky produktov sú ilustračné a môžu sa mierne líšiť od skutočného produktu.</p>
      <h2>3. Objednávanie a uzavretie zmluvy</h2>
      <h3>3.1 Zadanie objednávky</h3>
      <p>Na zadanie objednávky vyberte požadované Produkty, pridajte ich do košíka, zadajte požadované dodacie a fakturačné údaje, zvoľte spôsob platby a potvrďte objednávku.</p>
      <p>Odoslaním objednávky uskutočníte záväzný návrh na kúpu vybraných Produktov. Prijatie objednávky potvrdíme e-mailom ("Potvrdenie objednávky"). Kúpna zmluva je uzavretá odoslaním Produktov a zaslaním potvrdenia o odoslaní.</p>
      <h3>3.2 Odmietnutie objednávky</h3>
      <p>Vyhradzujeme si právo odmietnuť alebo zrušiť akúkoľvek objednávku, ak Produkty nie sú dostupné, ak došlo k chybe v cene alebo popise, alebo ak máme podozrenie z podvodného konania. V takých prípadoch vás budeme informovať a vrátime vám celú platbu.</p>
      <h2>4. Ceny a platby</h2>
      <h3>4.1 Ceny</h3>
      <p>Všetky ceny zobrazené v E-shope zahŕňajú daň z pridanej hodnoty (DPH), pokiaľ nie je uvedené inak. Náklady na dodanie sa vypočítajú a zobrazia osobitne pred potvrdením objednávky.</p>
      <h3>4.2 Spôsoby platby</h3>
      <p>Akceptujeme spôsoby platby uvedené v E-shope v čase nákupu. Platba je splatná pri zadaní objednávky. Všetky platby spracovávajú bezpeční poskytovatelia platobných služieb.</p>
      <h3>4.3 Fakturácia</h3>
      <p>Faktúru s DPH vám zašleme elektronicky po odoslaní objednávky. Faktúra slúži ako doklad o kúpe a je potrebná pre reklamácie.</p>
      <h2>5. Dodanie</h2>
      <h3>5.1 Oblasť dodania</h3>
      <p>Doručujeme do krajín uvedených v E-shope. Oblasti dodania a poplatky za prepravu sa môžu meniť bez predchádzajúceho upozornenia.</p>
      <h3>5.2 Dodacie lehoty</h3>
      <p>Predpokladané dodacie lehoty sú zobrazené v E-shope a v Potvrdení objednávky. Dodacie lehoty sú orientačné a nie sú zaručené. Meškania môžu nastať z dôvodov mimo našej kontroly. O významných meškaniach vás budeme informovať.</p>
      <h3>5.3 Prechod nebezpečenstva</h3>
      <p>Pri spotrebiteľských nákupoch prechádza nebezpečenstvo straty alebo poškodenia Produktov na vás momentom dodania.</p>
      <h3>5.4 Kontrola pri prevzatí</h3>
      <p>Prosíme, skontrolujte Produkty pri prevzatí. Ak spozorujete akékoľvek poškodenie balenia alebo Produktov, zaznamenajte to na dodací list a kontaktujte nás do 48 hodín na support@gardenyx.eu.</p>
      <h2>6. Právo na odstúpenie od zmluvy (spotrebiteľské nákupy)</h2>
      <h3>6.1 14-dňová lehota na odstúpenie</h3>
      <p>Ak ste spotrebiteľ (fyzická osoba nakupujúca na osobné účely), máte právo odstúpiť od kúpnej zmluvy do 14 dní od prevzatia Produktov bez udania dôvodu, v súlade so smernicou EÚ 2011/83/EÚ a zákonom č. 102/2014 Z. z.</p>
      <h3>6.2 Ako odstúpiť</h3>
      <p>Na uplatnenie práva na odstúpenie zašlite jednoznačné vyhlásenie (napr. e-mailom na support@gardenyx.eu) pred uplynutím 14-dňovej lehoty. Môžete použiť formulár na odstúpenie dostupný na našej webovej stránke, nie je to však povinné.</p>
      <h3>6.3 Následky odstúpenia</h3>
      <p>Pri platnom odstúpení vám vrátime všetky prijaté platby vrátane štandardných nákladov na dodanie do 14 dní od prijatia vášho oznámenia o odstúpení. Vrátenie platieb môžeme pozdržať až do prevzatia vrátených Produktov alebo preukázania ich odoslania. Priame náklady na vrátenie Produktov znášate vy.</p>
      <h3>6.4 Výnimky</h3>
      <p>Právo na odstúpenie sa nevzťahuje na:</p>
      <ul>
        <li>Produkty, ktoré boli otvorené a nemožno ich vrátiť z dôvodov hygieny alebo ochrany zdravia (napr. otvorené balenie hnojiva)</li>
        <li>Produkty, ktoré boli po dodaní neoddeliteľne zmiešané s inými položkami</li>
        <li>Produkty, ktoré rýchlo podliehajú kazeniu alebo majú krátku dobu exspirácie</li>
      </ul>
      <h2>7. Záruka a reklamácie</h2>
      <h3>7.1 Zákonná záruka</h3>
      <p>Všetky Produkty predávané spotrebiteľom majú zákonnú záručnú dobu 24 mesiacov od dátumu dodania podľa Občianskeho zákonníka a zákona č. 250/2007 Z. z. o ochrane spotrebiteľa.</p>
      <h3>7.2 Rozsah záruky</h3>
      <p>Záruka sa vzťahuje na vady materiálu, výroby alebo zloženia, ktoré existovali v čase dodania. Záruka sa nevzťahuje na vady spôsobené nesprávnym skladovaním, použitím v rozpore s návodom alebo bežným opotrebením.</p>
      <h3>7.3 Podanie reklamácie</h3>
      <p>Na podanie reklamácie nás kontaktujte na support@gardenyx.eu s číslom objednávky, popisom vady a prípadnými fotkami. Reklamáciu vybavíme do 30 dní od jej prijatia.</p>
      <h3>7.4 Nápravné prostriedky</h3>
      <p>V závislosti od povahy vady máte nárok na opravu, výmenu, primeranú zľavu z ceny alebo úplné vrátenie peňazí podľa príslušnej legislatívy na ochranu spotrebiteľa.</p>
      <h2>8. Bezpečnosť produktov a použitie</h2>
      <p>Rastlinné hnojivá a súvisiace produkty sa musia používať v súlade s pokynmi na etikete a obale. Nezodpovedáme za škody spôsobené nesprávnym použitím, skladovaním alebo aplikáciou Produktov.</p>
      <p>Niektoré Produkty môžu byť klasifikované podľa nariadenia EÚ (ES) č. 1107/2009 alebo nariadenia (EÚ) 2019/1009. Kde je to relevantné, Produkty spĺňajú požiadavky príslušných kariet bezpečnostných údajov.</p>
      <p>Všetky Produkty uchovávajte mimo dosahu detí a domácich zvierat.</p>
      <h2>9. Zákaznícky účet</h2>
      <p>V E-shope si môžete vytvoriť účet na uľahčenie budúcich nákupov. Ste zodpovední za zachovanie dôvernosti prihlasovacích údajov. Vyhradzujeme si právo pozastaviť alebo vymazať účty porušujúce tieto Podmienky.</p>
      <h2>10. Duševné vlastníctvo</h2>
      <p>Všetok obsah E-shopu vrátane popisov produktov, obrázkov, grafiky, log a ochranných známok je vlastníctvom alebo je licencovaný pre JOINA Garden, s. r. o. a je chránený príslušnými zákonmi o duševnom vlastníctve.</p>
      <h2>11. Obmedzenie zodpovednosti</h2>
      <p>V maximálnom rozsahu povolenom právnymi predpismi a bez obmedzenia vašich zákonných spotrebiteľských práv:</p>
      <ul>
        <li>E-shop a jeho obsah sa poskytujú "tak, ako sú" bez záruk nad rámec zákonných.</li>
        <li>Nezodpovedáme za nepriame, náhodné alebo následné škody z používania E-shopu alebo Produktov.</li>
        <li>Naša celková zodpovednosť nepresiahne sumu zaplatenú za Produkty, ktoré sú predmetom nároku.</li>
      </ul>
      <p>Nič v týchto Podmienkach nevylučuje našu zodpovednosť za úmrtie alebo úraz spôsobený našou nedbalosťou, podvod alebo zodpovednosť, ktorú nie je možné vylúčiť podľa právnych predpisov.</p>
      <h2>12. Alternatívne riešenie sporov</h2>
      <p>Ak ste spotrebiteľ a nie ste spokojní s vybavením vašej reklamácie, máte právo podať návrh na alternatívne riešenie sporu Slovenskej obchodnej inšpekcii (SOI) alebo použiť platformu EÚ na riešenie sporov online na https://ec.europa.eu/consumers/odr.</p>
      <h2>13. Vyššia moc</h2>
      <p>Nezodpovedáme za akékoľvek meškanie alebo nesplnenie našich povinností podľa týchto Podmienok, ak je spôsobené okolnosťami mimo našej primeranej kontroly, vrátane prírodných katastrof, pandémií, opatrení vlády, výpadkov dodávateľského reťazca alebo zlyhaní prepravcov.</p>
      <h2>14. Rozhodné právo a príslušnosť</h2>
      <p>Tieto Podmienky sa riadia právnym poriadkom Slovenskej republiky. Akékoľvek spory budú riešené príslušnými súdmi SR. Ak ste spotrebiteľ s bydliskom v EÚ, môžete tiež podať žalobu na súdoch vašej krajiny pobytu a vzťahujú sa na vás kogentné ustanovenia na ochranu spotrebiteľa vašej krajiny.</p>
      <h2>15. Zmeny týchto podmienok</h2>
      <p>Tieto Podmienky môžeme kedykoľvek zmeniť. Aktualizovaná verzia bude zverejnená v E-shope s novým dátumom účinnosti. Objednávky zadané pred zmenou sa riadia Podmienkami platnými v čase objednávky.</p>
      <h2>16. Oddeliteľnosť ustanovení</h2>
      <p>Ak sa akékoľvek ustanovenie týchto Podmienok ukáže ako neplatné alebo nevymáhateľné, ostatné ustanovenia zostávajú v plnej platnosti.</p>
      <h2>17. Kontaktujte nás</h2>
      <p>V prípade otázok k týmto Podmienkam alebo vašim objednávkam:</p>
      <p><strong>JOINA Garden, s. r. o.</strong><br />Karpatské námestie 7770/10A<br />Bratislava – mestská časť Rača 831 06<br />Slovenská republika<br /><strong>IČO:</strong> 57 313 504<br /><strong>E-mail:</strong> support@gardenyx.eu</p>
      <hr />
      <p><strong>Podmienky používania aplikácie</strong></p>
      <p><strong>GARDENYX</strong></p>
      <p><strong>Podmienky používania</strong></p>
      <p><em>Mobilná aplikácia</em></p>
      <p>Dátum účinnosti: 6. marca 2026</p>
      <h2>1. Súhlas s podmienkami</h2>
      <p>Tieto Podmienky používania ("Podmienky") upravujú váš prístup k mobilnej aplikácii GardenYX ("Aplikácia") a jej používanie. Aplikáciu prevádzkuje spoločnosť JOINA Garden, s. r. o., Karpatské námestie 7770/10A, Bratislava – mestská časť Rača 831 06, Slovenská republika, IČO: 57 313 504 ("my", "Spoločnosť").</p>
      <p>Stiahnutím, nainštalovaním alebo používaním Aplikácie súhlasíte s týmito Podmienkami. Ak nesúhlasíte, Aplikáciu nepoužívajte.</p>
      <h2>2. Oprávnenosť</h2>
      <p>Na používanie Aplikácie musíte mať najmenej 16 rokov. Používaním Aplikácie potvrdzujete, že spĺňate túto vekovú podmienku. Ak máte menej ako 18 rokov, potvrdzujete, že ste získali súhlas rodiča alebo zákonného zástupcu.</p>
      <h2>3. Registrácia účtu</h2>
      <p>Na prístup k určitým funkciám si musíte vytvoriť účet pomocou jednej z podporovaných metód autentifikácie (e-mail a heslo, Google prihlásenie alebo prihlásenie cez Apple). Ste zodpovední za zachovanie dôvernosti vašich prihlasovacích údajov a za všetky aktivity pod vaším účtom.</p>
      <p>Súhlasíte s tým, že pri registrácii poskytnete presné, aktuálne a úplné informácie a budete ich podľa potreby aktualizovať. Vyhradzujeme si právo pozastaviť alebo zrušiť účty obsahujúce nepravdivé alebo zavádzajúce informácie.</p>
      <h2>4. Popis aplikácie a funkcie</h2>
      <p>GardenYX je aplikácia na správu starostlivosti o rastliny, ktorá pomáha používateľom sledovať, monitorovať a starať sa o ich rastliny. Aplikácia ponúka:</p>
      <ul>
        <li>Profily rastlín so sledovaním starostlivosti a pripomienkami</li>
        <li>AI identifikáciu rastlín z obrázkov</li>
        <li>AI diagnózu zdravia rastlín</li>
        <li>AI chatbot pre rady o starostlivosti (RastoAI)</li>
        <li>Plánovanie starostlivosti (zalévanie, hnojenie, presádzanie)</li>
        <li>Push notifikácie s pripomienkami</li>
        <li>Organizáciu záhrad a miestností</li>
      </ul>
      <h2>5. Predplatné a platby</h2>
      <h3>5.1 Freemium model</h3>
      <p>Aplikácia funguje na freemium modeli. Základné funkcie sú dostupné zadarmo. Prémiové funkcie vyžadujú aktívne predplatné ("Pro" plán).</p>
      <h3>5.2 Spracovanie platieb</h3>
      <p>Platby za predplatné spracováva Apple App Store (iOS) alebo Google Play (Android). Všetky fakturácie, vrátenia a platobné spory sa riadia podmienkami príslušného obchodu s aplikáciami. Priamo nespracovávame ani neukladáme vaše platobné informácie.</p>
      <h3>5.3 Správa predplatného</h3>
      <p>Predplatné spravuje RevenueCat a synchronizuje sa medzi zariadeniami. Predplatné môžete spravovať alebo zrušiť v nastaveních obchodu s aplikáciami.</p>
      <h3>5.4 Zmeny cien</h3>
      <p>Vyhradzujeme si právo zmeniť ceny predplatného. O zmenách vás budeme informovať vopred a budú platiť od nasledujúceho fakturačného obdobia.</p>
      <h2>6. Používateľský obsah</h2>
      <p>Zostávate vlastníkom všetkého obsahu, ktorý vytvoríte alebo nahráte cez Aplikáciu, vrátane profilov rastlín, fotografií, poznámok, histórie starostlivosti a konverzácií ("Používateľský obsah").</p>
      <p>Nahratím Používateľského obsahu nám udeľujete nevýhradnú, celosvetovú, bezodplatnú licenciu na používanie, ukladanie a spracovanie takého obsahu výlučne na účely poskytovania a zlepšovania služieb Aplikácie. Táto licencia zaniká vymazaním vášho obsahu alebo účtu.</p>
      <h2>7. AI funkcie a vyhlásenia o odmietnutí zodpovednosti</h2>
      <p>Aplikácia poskytuje AI funkcie vrátane identifikácie rastlín, diagnózy zdravia, odporúčaní starostlivosti a AI chatbota. Tieto funkcie sú určené len na informatívne a poradenské účely.</p>
      <p><strong>Dôležité:</strong> Presnosti alebo úplnosti AI výsledkov nezaručujeme. Identifikácia rastlín, diagnózy zdravia a odporúčania starostlivosti môžu obsahovať chyby. Nemali by ste sa spoliehať výlučne na AI výstupy pri rozhodnutiach, ktoré môžu ovplyvniť zdravie vašich rastlín alebo zahŕňať bezpečnostné aspekty. Vylučujeme akúkoľvek zodpovednosť za straty alebo škody vyplývajúce z výlučného spoliehania sa na AI obsah.</p>
      <h2>8. Oprávnenia zariadenia</h2>
      <p>Aplikácia môže požiadať o prístup ku kamere, fotogalérii a systému notifikácií. Tieto oprávnenia sú voliteľné a môžete ich spravovať v nastaveniach zariadenia. Určité funkcie (napr. identifikácia rastlín z fotky) nebudú fungovať bez príslušných oprávnení.</p>
      <h2>9. Prijateľné používanie</h2>
      <p>Súhlasíte s tým, že nebudete:</p>
      <ul>
        <li>Používať Aplikáciu na akýkoľvek nezákonný účel</li>
        <li>Pokúšať sa o spätné inžinierstvo, dekompiláciu alebo rozoberanie Aplikácie</li>
        <li>Narušovať servery alebo siete Aplikácie</li>
        <li>Nahrávať škodlivý obsah, vírusy alebo škodlivý kód</li>
        <li>Používať Aplikáciu na zhromažďovanie osobných údajov iných používateľov</li>
        <li>Obchádzať bezpečnostné opatrenia</li>
        <li>Používať automatizované systémy alebo botov na prístup k Aplikácii</li>
        <li>Predávať, sublicencovať alebo komerčne využívať Aplikáciu bez nášho písomného súhlasu</li>
      </ul>
      <h2>10. Duševné vlastníctvo</h2>
      <p>Aplikácia vrátane jej dizajnu, kódu, grafiky, log a všetkého obsahu poskytovaného nami (okrem Používateľského obsahu) je vlastníctvom alebo je licencovaná pre JOINA Garden, s. r. o. a je chránená autorským právom, ochrannými známkami a inými zákonmi o duševnom vlastníctve.</p>
      <p>Udeľuje sa vám obmedzená, nevýhradná, neprenositeľná, odvolateľná licencia na používanie Aplikácie na osobné, nekomerčné účely v súlade s týmito Podmienkami.</p>
      <h2>11. Dostupnosť a aktualizácie</h2>
      <p>Snažíme sa udržiavať Aplikáciu dostupnú a funkčnú, ale nezaručujeme neprerušovanú alebo bezchybnú prevádzku. Môžeme kedykoľvek upraviť, pozastaviť alebo ukončiť akúkoľvek časť Aplikácie bez predchádzajúceho upozornenia.</p>
      <h2>12. Obmedzenie zodpovednosti</h2>
      <p>V maximálnom rozsahu povolenom právnymi predpismi:</p>
      <ul>
        <li>Aplikácia sa poskytuje "tak, ako je" a "ako je dostupná" bez akýchkoľvek záruk, či už výslovných alebo implikovaných.</li>
        <li>Nezodpovedáme za nepriame, náhodné, špeciálne, následné ani represívne škody vrátane straty zisku, údajov alebo dobrej povesti.</li>
        <li>Naša celková zodpovednosť voči vám za akékoľvek nároky nepresiahne sumu, ktorú ste zaplatili za predplatné za 12 mesiacov pred nárokom.</li>
      </ul>
      <h2>13. Odškodnenie</h2>
      <p>Súhlasíte s tým, že odškodníte a ochránite JOINA Garden, s. r. o., jej vedúcich pracovníkov, riaditeľov, zamestnancov a zástupcov pred akýmikoľvek nárokmi, škodami, stratami alebo výdavkami vyplývajúcimi z porušenia týchto Podmienok alebo používania Aplikácie.</p>
      <h2>14. Ukončenie</h2>
      <p>Môžeme pozastaviť alebo ukončiť váš prístup k Aplikácii kedykoľvek s primeraným oznámením. Svoj účet môžete kedykoľvek zrušiť cez Nastavenia v Aplikácii.</p>
      <p>Po ukončení váš nárok na používanie Aplikácie okamžite zaniká. Ustanovenia, ktoré majú byť podľa svojej povahy platné aj po ukončení (vrátane častí 10, 12, 13 a 15), zostávajú v platnosti.</p>
      <h2>15. Rozhodné právo a riešenie sporov</h2>
      <p>Tieto Podmienky sa riadia právnymi predpismi Slovenskej republiky. Akékoľvek spory budú riešené príslušnými súdmi Slovenskej republiky. Nič v týchto Podmienkach neobmedzuje vaše práva ako spotrebiteľa podľa kogentných zákonov vašej krajiny pobytu.</p>
      <h2>16. Zmeny týchto podmienok</h2>
      <p>Tieto Podmienky môžeme kedykoľvek zmeniť. O podstatných zmenách vás budeme informovať. Pokračovaním v používaní Aplikácie po takýchto zmenách vyjadrujete súhlas so zmenenými Podmienkami.</p>
      <h2>17. Oddeliteľnosť ustanovení</h2>
      <p>Ak sa akékoľvek ustanovenie týchto Podmienok ukáže ako neplatné alebo nevymáhateľné, ostatné ustanovenia zostávajú v plnej platnosti a účinnosti.</p>
      <h2>18. Kontaktujte nás</h2>
      <p>Ak máte akékoľvek otázky k týmto Podmienkam, kontaktujte nás:</p>
      <p><strong>JOINA Garden, s. r. o.</strong><br />Karpatské námestie 7770/10A<br />Bratislava – mestská časť Rača 831 06<br />Slovenská republika<br /><strong>E-mail:</strong> support@gardenyx.eu</p>
    `,
  },
  en: {
    metadataTitle: 'Terms of Use | GardenYX',
    metadataDescription:
      'GardenYX e-shop terms of use including orders, payments, delivery, complaints, and withdrawal rights.',
    label: 'E-shop Terms of Use',
    title: 'Terms of Use',
    subtitle: 'E-shop (gardenyx.eu)',
    effectiveDate: 'Effective Date: March 6, 2026',
    appLabel: 'App Terms of Use',
    appTitle: 'Terms of Use',
    appSubtitle: 'Mobile Application',
    appEffectiveDate: 'Effective Date: March 6, 2026',
    shopTabLabel: 'E-shop',
    appTabLabel: 'App',
    bodyHtml: `
      <h2>1. General Provisions</h2>
      <p>These Terms of Use ("Terms") govern the use of the online store at gardenyx.eu ("E-shop") and the purchase of products offered through it. The E-shop is operated by JOINA Garden, s. r. o., with its registered office at Karpatské námestie 7770/10A, Bratislava – mestská časť Rača 831 06, Slovak Republic, IČO: 57 313 504 ("Seller", "we", "us").</p>
      <p>By placing an order through the E-shop, you ("Buyer", "you") agree to these Terms. Please read them carefully before making a purchase.</p>
      <h2>2. Products</h2>
      <p>The E-shop offers plant fertilizers and related gardening products ("Products"). All Products are described with their key characteristics, composition, usage instructions, and pricing on the relevant product pages.</p>
      <p>Product images are illustrative and may differ slightly from the actual product. We make reasonable efforts to present Products accurately but do not warrant that descriptions or images are entirely free of error.</p>
      <h2>3. Ordering and Contract Formation</h2>
      <h3>3.1 Placing an Order</h3>
      <p>To place an order, select the desired Products, add them to your cart, provide the required delivery and billing information, choose a payment method, and confirm your order.</p>
      <p>By submitting an order, you make a binding offer to purchase the selected Products. We will confirm receipt of your order by email ("Order Confirmation"). A purchase contract is formed when we dispatch the Products and send a shipment confirmation email.</p>
      <h3>3.2 Order Rejection</h3>
      <p>We reserve the right to reject or cancel any order if the Products are unavailable, there is a pricing or product description error, or we suspect fraudulent activity. In such cases, we will notify you and issue a full refund if payment has already been processed.</p>
      <h2>4. Prices and Payment</h2>
      <h3>4.1 Prices</h3>
      <p>All prices displayed on the E-shop include applicable value-added tax (VAT) unless otherwise stated. Delivery charges are calculated and displayed separately before you confirm your order.</p>
      <h3>4.2 Payment Methods</h3>
      <p>We accept the payment methods listed on the E-shop at the time of purchase. Payment is due at the time of order placement unless otherwise specified. All payments are processed by secure third-party payment service providers.</p>
      <h3>4.3 Invoicing</h3>
      <p>A VAT invoice will be sent to you electronically after your order is dispatched. The invoice serves as proof of purchase and is required for any warranty claims.</p>
      <h2>5. Delivery</h2>
      <h3>5.1 Delivery Area</h3>
      <p>We deliver to the countries listed on the E-shop at the time of order. Delivery areas and associated shipping fees may change without prior notice.</p>
      <h3>5.2 Delivery Times</h3>
      <p>Estimated delivery times are displayed on the E-shop and in the Order Confirmation. Delivery times are estimates and not guaranteed. Delays may occur due to circumstances beyond our control (e.g., carrier delays, customs procedures). We will notify you of any significant delays.</p>
      <h3>5.3 Risk of Loss</h3>
      <p>For consumer purchases, the risk of loss or damage to the Products passes to you upon delivery. If you arrange your own carrier (not offered by us), risk passes upon handover to the carrier.</p>
      <h3>5.4 Inspection Upon Delivery</h3>
      <p>Please inspect the Products upon delivery. If you notice any damage to the packaging or the Products, note it on the delivery receipt and contact us within 48 hours at support@gardenyx.eu.</p>
      <h2>6. Right of Withdrawal (Consumer Purchases)</h2>
      <h3>6.1 14-Day Withdrawal Period</h3>
      <p>If you are a consumer (natural person purchasing for personal use), you have the right to withdraw from the purchase contract within 14 days of receiving the Products, without providing a reason, in accordance with EU Directive 2011/83/EU and Slovak Act No. 102/2014 Coll.</p>
      <h3>6.2 How to Withdraw</h3>
      <p>To exercise your right of withdrawal, send a clear statement (e.g., by email to support@gardenyx.eu) before the 14-day period expires. You may use the withdrawal form available on our website, but it is not mandatory.</p>
      <h3>6.3 Effects of Withdrawal</h3>
      <p>Upon valid withdrawal, we will refund all payments received from you, including standard delivery costs, within 14 days of receiving your withdrawal notice. We may withhold the refund until we receive the returned Products or proof of shipment. You shall bear the direct cost of returning the Products.</p>
      <h3>6.4 Exceptions</h3>
      <p>The right of withdrawal does not apply to:</p>
      <ul>
        <li>Products that have been opened and cannot be returned for hygiene or health protection reasons (e.g., opened fertilizer packaging that is no longer sealed)</li>
        <li>Products that have been mixed inseparably with other items after delivery</li>
        <li>Products that deteriorate or expire rapidly</li>
      </ul>
      <h2>7. Warranty and Complaints</h2>
      <h3>7.1 Statutory Warranty</h3>
      <p>All Products sold to consumers come with a statutory warranty period of 24 months from the date of delivery, in accordance with the Slovak Civil Code and Act No. 250/2007 Coll. on Consumer Protection.</p>
      <h3>7.2 Warranty Coverage</h3>
      <p>The warranty covers defects in material, manufacturing, or composition that were present at the time of delivery. The warranty does not cover defects caused by improper storage, use contrary to product instructions, or normal wear.</p>
      <h3>7.3 Filing a Complaint</h3>
      <p>To file a warranty complaint, contact us at support@gardenyx.eu with your order number, description of the defect, and supporting photos if applicable. We will resolve complaints within 30 days of receipt in accordance with applicable law.</p>
      <h3>7.4 Remedies</h3>
      <p>Depending on the nature of the defect, you are entitled to repair, replacement, a reasonable price reduction, or a full refund, in accordance with applicable consumer protection legislation.</p>
      <h2>8. Product Safety and Usage</h2>
      <p>Plant fertilizers and related products must be used in accordance with the instructions provided on the product label and packaging. We are not liable for any damage caused by improper use, storage, or application of Products.</p>
      <p>Some Products may be classified as plant protection products or fertilizers under EU Regulation (EC) No 1107/2009 or Regulation (EU) 2019/1009. Where applicable, Products comply with the relevant safety data sheet requirements.</p>
      <p>Keep all Products out of reach of children and pets. In case of accidental ingestion or exposure, follow the instructions on the product label and seek medical attention if necessary.</p>
      <h2>9. Customer Account</h2>
      <p>You may create an account on the E-shop to facilitate future purchases. You are responsible for keeping your login credentials confidential. We reserve the right to suspend or delete accounts that violate these Terms.</p>
      <h2>10. Intellectual Property</h2>
      <p>All content on the E-shop, including product descriptions, images, graphics, logos, and trademarks, is owned by or licensed to JOINA Garden, s. r. o. and is protected by applicable intellectual property laws. You may not reproduce, distribute, or commercially use any content without our prior written consent.</p>
      <h2>11. Limitation of Liability</h2>
      <p>To the maximum extent permitted by applicable law and without limiting your statutory consumer rights:</p>
      <ul>
        <li>The E-shop and its content are provided "as is" without warranties beyond those required by law.</li>
        <li>We shall not be liable for indirect, incidental, or consequential damages arising from the use of the E-shop or the Products.</li>
        <li>Our total liability for any claim shall not exceed the amount you paid for the Products giving rise to the claim.</li>
      </ul>
      <p>Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud, or any liability that cannot be excluded under applicable law.</p>
      <h2>12. Alternative Dispute Resolution</h2>
      <p>If you are a consumer and are not satisfied with how we handled your complaint, you have the right to submit a proposal for alternative dispute resolution to the Slovak Trade Inspection (Slovenská obchodná inšpekcia, SOI) or use the EU Online Dispute Resolution platform at https://ec.europa.eu/consumers/odr.</p>
      <h2>13. Force Majeure</h2>
      <p>We shall not be liable for any delay or failure to perform our obligations under these Terms if such delay or failure is caused by circumstances beyond our reasonable control, including natural disasters, pandemics, government actions, supply chain disruptions, or carrier failures.</p>
      <h2>14. Governing Law and Jurisdiction</h2>
      <p>These Terms are governed by the laws of the Slovak Republic. Any disputes shall be resolved by the competent courts of the Slovak Republic. If you are a consumer residing in the EU, you may also bring proceedings in the courts of your country of residence, and you benefit from the mandatory consumer protection provisions of your local law.</p>
      <h2>15. Changes to These Terms</h2>
      <p>We may amend these Terms at any time. The updated version will be published on the E-shop with a new effective date. Orders placed before the change are governed by the Terms in effect at the time of the order.</p>
      <h2>16. Severability</h2>
      <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
      <h2>17. Contact Us</h2>
      <p>For any questions or concerns regarding these Terms or your orders:</p>
      <p><strong>JOINA Garden, s. r. o.</strong><br />Karpatské námestie 7770/10A<br />Bratislava – mestská časť Rača 831 06<br />Slovak Republic<br /><strong>IČO:</strong> 57 313 504<br /><strong>Email:</strong> support@gardenyx.eu</p>
      <hr />
      <p><strong>App Terms of Use</strong></p>
      <p><strong>GARDENYX</strong></p>
      <p><strong>Terms of Use</strong></p>
      <p><em>Mobile Application</em></p>
      <p>Effective Date: March 6, 2026</p>
      <h2>1. Acceptance of Terms</h2>
      <p>These Terms of Use ("Terms") govern your access to and use of the GardenYX mobile application ("App") operated by JOINA Garden, s. r. o., Karpatské námestie 7770/10A, Bratislava – mestská časť Rača 831 06, Slovak Republic, IČO: 57 313 504 ("we", "us", "Company").</p>
      <p>By downloading, installing, or using the App, you agree to be bound by these Terms. If you do not agree, do not use the App.</p>
      <h2>2. Eligibility</h2>
      <p>You must be at least 16 years of age to use the App. By using the App, you represent and warrant that you meet this age requirement. If you are under 18, you confirm that you have obtained parental or guardian consent to use the App.</p>
      <h2>3. Account Registration</h2>
      <p>To access certain features, you must create an account using one of the supported authentication methods (email and password, Google Sign-In, or Sign in with Apple). You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.</p>
      <p>You agree to provide accurate, current, and complete information during registration and to update it as necessary. We reserve the right to suspend or terminate accounts that contain false or misleading information.</p>
      <p>An anonymous trial account may be created for limited use. Anonymous accounts are temporary and their data is cleared upon registration of a full account.</p>
      <h2>4. App Description and Features</h2>
      <p>GardenYX is a plant care management app that helps users track, monitor, and care for their plants. The App offers the following features:</p>
      <ul>
        <li>Plant profiles with care tracking and reminders</li>
        <li>AI-powered plant identification via image recognition</li>
        <li>AI-powered plant health diagnosis</li>
        <li>AI chatbot for plant care advice (RastoAI)</li>
        <li>Care scheduling (watering, fertilizing, repotting)</li>
        <li>Push notifications for care reminders</li>
        <li>Garden and room organization</li>
      </ul>
      <p>The App is available on iOS, Android, and as a progressive web application.</p>
      <h2>5. Subscription and Payments</h2>
      <h3>5.1 Freemium Model</h3>
      <p>The App operates on a freemium model. Basic features are available for free. Premium features require an active subscription ("Pro" plan).</p>
      <h3>5.2 Payment Processing</h3>
      <p>Subscription payments are processed through the Apple App Store (iOS) or Google Play (Android). All billing, refunds, and payment disputes are governed by the terms of the applicable app store. We do not directly process or store your payment information.</p>
      <h3>5.3 Subscription Management</h3>
      <p>Subscriptions are managed through RevenueCat and synchronized across devices using your account identifier. You can manage or cancel your subscription through your device’s app store settings.</p>
      <h3>5.4 Price Changes</h3>
      <p>We reserve the right to change subscription pricing. Any price changes will be communicated in advance and will apply to the next billing cycle after the change takes effect.</p>
      <h2>6. User Content</h2>
      <p>You retain ownership of all content you create or upload through the App, including plant profiles, photos, notes, care history, and chat conversations ("User Content").</p>
      <p>By uploading User Content, you grant us a non-exclusive, worldwide, royalty-free license to use, store, and process such content solely for the purpose of providing and improving the App services. This license terminates when you delete your content or your account.</p>
      <p>You are solely responsible for your User Content. You represent that you have the right to upload any content you submit and that it does not violate any third-party rights.</p>
      <h2>7. AI Features and Disclaimers</h2>
      <p>The App provides AI-powered features including plant identification, health diagnosis, care recommendations, and an AI chatbot. These features are provided for informational and advisory purposes only.</p>
      <p><strong>Important:</strong> AI-generated results are not guaranteed to be accurate or complete. Plant identification, health diagnoses, and care recommendations may contain errors. You should not rely solely on AI outputs for decisions that could affect the health of your plants or involve safety considerations (e.g., identifying potentially toxic plants). We disclaim all liability for any loss or damage resulting from reliance on AI-generated content.</p>
      <h2>8. Device Permissions</h2>
      <p>The App may request access to your device camera, photo library, and notification system. These permissions are optional and you can manage them through your device settings. Certain features (such as plant identification from photos) will not function without the relevant permissions.</p>
      <h2>9. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the App for any unlawful purpose</li>
        <li>Attempt to reverse engineer, decompile, or disassemble the App</li>
        <li>Interfere with or disrupt the App’s servers or networks</li>
        <li>Upload malicious content, viruses, or harmful code</li>
        <li>Use the App to collect personal data of other users</li>
        <li>Circumvent or attempt to circumvent any security measures</li>
        <li>Use automated systems or bots to access the App</li>
        <li>Resell, sublicense, or commercially exploit the App without our written consent</li>
      </ul>
      <h2>10. Intellectual Property</h2>
      <p>The App, including its design, code, graphics, logos, and all content provided by us (excluding User Content), is owned by or licensed to JOINA Garden, s. r. o. and is protected by copyright, trademark, and other intellectual property laws.</p>
      <p>You are granted a limited, non-exclusive, non-transferable, revocable license to use the App for personal, non-commercial purposes in accordance with these Terms.</p>
      <h2>11. Availability and Updates</h2>
      <p>We strive to keep the App available and functional, but we do not guarantee uninterrupted or error-free operation. We may modify, suspend, or discontinue any part of the App at any time without prior notice.</p>
      <p>We may release updates to the App from time to time. Some updates may be required for continued use. Continued use of the App after an update constitutes acceptance of any changes.</p>
      <h2>12. Limitation of Liability</h2>
      <p>To the maximum extent permitted by applicable law:</p>
      <ul>
        <li>The App is provided "as is" and "as available" without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</li>
        <li>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of or inability to use the App.</li>
        <li>Our total aggregate liability to you for any claims arising under these Terms shall not exceed the amount you paid for the App subscription in the 12 months preceding the claim.</li>
      </ul>
      <h2>13. Indemnification</h2>
      <p>You agree to indemnify and hold harmless JOINA Garden, s. r. o., its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable legal fees) arising from your violation of these Terms or your use of the App.</p>
      <h2>14. Termination</h2>
      <p>We may suspend or terminate your access to the App at any time, with or without cause, upon reasonable notice. You may terminate your account at any time through the App’s Settings.</p>
      <p>Upon termination, your right to use the App ceases immediately. Provisions that by their nature should survive termination (including Sections 10, 12, 13, and 15) shall continue in effect.</p>
      <h2>15. Governing Law and Dispute Resolution</h2>
      <p>These Terms are governed by and construed in accordance with the laws of the Slovak Republic, without regard to conflict of law principles.</p>
      <p>Any disputes arising under or in connection with these Terms shall be resolved by the competent courts of the Slovak Republic. Nothing in these Terms limits your rights as a consumer under mandatory consumer protection laws of your country of residence.</p>
      <h2>16. Changes to These Terms</h2>
      <p>We may modify these Terms at any time. We will notify you of material changes by posting updated Terms in the App or by other appropriate means. Your continued use of the App after such changes constitutes acceptance of the revised Terms.</p>
      <h2>17. Severability</h2>
      <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.</p>
      <h2>18. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us:</p>
      <p><strong>JOINA Garden, s. r. o.</strong><br />Karpatské námestie 7770/10A<br />Bratislava – mestská časť Rača 831 06<br />Slovak Republic<br /><strong>Email:</strong> support@gardenyx.eu</p>
    `,
  },
  hu: {
    metadataTitle: 'Általános Szerződési Feltételek | GardenYX',
    metadataDescription:
      'A GardenYX e-shop felhasználási feltételei, beleértve a rendelést, fizetést, szállítást, reklamációt és elállási jogot.',
    label: 'Az e-shop felhasználási feltételei',
    title: 'Általános Szerződési Feltételek',
    subtitle: 'E-shop (gardenyx.eu)',
    effectiveDate: 'Érvényes: 2026. március 6.',
    appLabel: 'Az alkalmazás felhasználási feltételei',
    appTitle: 'Felhasználási feltételek',
    appSubtitle: 'Mobilalkalmazás',
    appEffectiveDate: 'Hatálybalépés dátuma: 2026. március 6.',
    shopTabLabel: 'E-shop',
    appTabLabel: 'Alkalmazás',
    bodyHtml: `
      <h2>1. Általános rendelkezések</h2>
      <p>Jelen Felhasználási Feltételek ("Feltételek") szabályozzák az online áruház használatát a gardenyx.eu webhelyen ("E-shop") és az ott kínált termékek megvásárlását. Az E-shopot a JOINA Garden, s. r. o. üzemelteti, amely a Karpatské námestie 7770/10A, Bratislava – mestská časť Rača 831 06, Szlovák Köztársaság, IČO: 57 313 504 címen bejegyzett szervezet ("Eladó", "mi", "nekünk").</p>
      <p>Az E-shopban történő megrendelés leadásával Ön ("Vásárló", "Ön") elfogadja jelen Feltételeket. Kérjük, olvassa el azokat figyelmesen a vásárlás előtt.</p>
      <h2>2. Termékek</h2>
      <p>Az E-shop növénytápszereket és kapcsolódó kertészeti termékeket kínál ("Termékek"). Az összes terméket a megfelelő termékoldalon leírják, beleértve a főbb jellemzőiket, összetételüket, használati útmutatóikat és áraikat.</p>
      <p>A termékek képei illusztratív jellegűek és kisebb mértékben eltérhetnek a valódi terméktől. Ésszerű erőfeszítéseket teszünk a Termékek pontos bemutatásáért, de nem garantáljuk, hogy a leírások vagy képek teljesen hibamentesek.</p>
      <h2>3. Rendelés és szerződéskötés</h2>
      <h3>3.1 Rendelés leadása</h3>
      <p>Megrendelés leadásához válassza ki a kívánt Termékeket, adja hozzá őket a kosárhoz, adja meg a szükséges szállítási és számlázási adatokat, válassza ki a fizetési módot, és erősítse meg megrendelését.</p>
      <p>A megrendelés benyújtásával Ön kötelező ajánlatot tesz a kiválasztott Termékek megvásárlására. Mi e-mailben igazoljuk a megrendelés kézhezvételét ("Megrendelés-megerősítés"). A vásárlási szerződés akkor köttetik meg, amikor szállítjuk a Termékeket és küldjük a szállítás-megerősítő e-mailt.</p>
      <h3>3.2 Megrendelés elutasítása</h3>
      <p>Fenntartjuk a jogot bármely megrendelést elutasítani vagy törölni, ha a Termékek nem érhetők el, árdöntési vagy termékkörnyezeti hiba van, vagy gyanúsnak tartjuk a csalárd tevékenységet. Ilyen esetben értesítjük Önt, és teljes visszatérítést nyújtunk, ha a fizetés már feldolgozták.</p>
      <h2>4. Árak és fizetés</h2>
      <h3>4.1 Árak</h3>
      <p>Az E-shopban megjelenített összes ár tartalmazza a vonatkozó hozzáadottérték-adót (ÁFA), hacsak másként nem kerül feltüntetésre. A szállítási költségeket külön számítják ki és mutatják a megrendelés megerősítése előtt.</p>
      <h3>4.2 Fizetési módok</h3>
      <p>A vásárláskor a megrendelés idején elérhetőnek tartott fizetési módokat fogadjuk el. A fizetés a megrendelés leadásakor esedékes, hacsak másként nem kerül meghatározásra. Az összes fizetést biztonságos harmadik féltől származó fizetési szolgáltatók dolgozzák fel.</p>
      <h3>4.3 Számlázás</h3>
      <p>Az ÁFA-számla elektronikusan kerül küldésre a megrendelés szállításakor. A számla a vásárlás bizonyítéka és szükséges a jótállási igények előterjesztéséhez.</p>
      <h2>5. Szállítás</h2>
      <h3>5.1 Szállítási terület</h3>
      <p>Az E-shopban felsorolt országokba szállítunk a megrendelés idején. A szállítási területek és a kapcsolódó szállítási díjak előzetes értesítés nélkül módosulhatnak.</p>
      <h3>5.2 Szállítási idő</h3>
      <p>A becsült szállítási időt az E-shopban és a Megrendelés-megerősítésben mutatják. A szállítási idők becslések és nem garantáltak. Késedelmek előfordulhatnak az ellenőrzésünkön kívül eső okok miatt (pl. fuvarozó késedelme, vámeljárások). Tájékoztatjuk Önt az esetleges jelentős késedelmekről.</p>
      <h3>5.3 Kárveszély átszállása</h3>
      <p>A fogyasztói vásárlásoknál a Termékek veszteségének vagy sérülésének kockázata Önre száll át a szállítástól. Ha saját fuvarszállítót választ (nem az általunk kínáltat), a kockázat átszáll a fuvarozónak történő átadáskor.</p>
      <h3>5.4 Átvételi ellenőrzés</h3>
      <p>Kérjük, vizsgálja meg a Termékeket szállítás után. Ha a csomagolásban vagy a Termékekben sérülést észlel, jegyezze a szállítási bizonylatban és forduljon hozzánk 48 órán belül a support@gardenyx.eu címen.</p>
      <h2>6. Elállási jog (fogyasztói vásárlások)</h2>
      <h3>6.1 14 napos elállási idő</h3>
      <p>Ha Ön fogyasztónak minősül (a személyes felhasználásra vásárló természetes személy), a 2011/83/EU számú EU-irányelv és a Szlovák Köztársaság 102/2014. évi törvényének megfelelően az átvételtől számított 14 napon belül, ok nélkül jogosult a vásárlási szerződéstől elállni.</p>
      <h3>6.2 Elállás módja</h3>
      <p>Elállási jogának gyakorlásához küldjön egyértelmű nyilatkozatot (pl. e-mailben a support@gardenyx.eu címre) a 14 napos időszak lejárta előtt. Használhatja a weboldalunkon elérhető elállási nyomtatványt, de nem kötelező.</p>
      <h3>6.3 Elállás következményei</h3>
      <p>Az érvényes elállás esetén visszatérítjük az Öntől kapott összes fizetést, beleértve a szabványos szállítási költségeket, az elállási nyilatkozat kézhezvételétől számított 14 napon belül. Visszatarthatjuk a visszatérítést, amíg meg nem kapjuk a visszaküldött Termékeket vagy a szállítás bizonyítékát. Ön viseli a Termékek visszaküldésének közvetlen költségeit.</p>
      <h3>6.4 Kivételek</h3>
      <p>Az elállási jog nem vonatkozik a következőkre:</p>
      <ul>
        <li>Nyitott Termékekre, amelyeket higiéniai vagy egészségvédelmi okokból nem lehet visszaküldeni (pl. megnyitott műtrágya-csomag, amely már nem lezárt)</li>
        <li>Termékekre, amelyeket a szállítás után szétválaszthatatlanul összekevertek más termékekkel</li>
        <li>Gyorsan romlásnak kitett vagy gyorsan lejáró Termékekre</li>
      </ul>
      <h2>7. Szavatosság és reklamáció</h2>
      <h3>7.1 Törvényes szavatosság</h3>
      <p>Az összes, fogyasztónak értékesített Terméket a szállítástól számított 24 hónapos jótállási időszak jár a Szlovák Polgári Törvénykönyv és a Fogyasztóvédelemről szóló 250/2007. évi törvény szerint.</p>
      <h3>7.2 Szavatossági fedezet</h3>
      <p>A jótállás az anyagi, gyártási vagy összetételi hibákat fedi le, amelyek a szállítás időpontjában jelen voltak. A jótállás nem fedi le a nem megfelelő tárolásból, a termékkívánalmakkal ellentétes használatból vagy a szokásos elhasználódásból eredő hibákat.</p>
      <h3>7.3 Reklamáció benyújtása</h3>
      <p>Jótállási igényt nyújtson be a support@gardenyx.eu címen, megrendelési számával, a hiba leírásával és támogató fotók csatolásával, ha rendelkezésre áll. A bejegyzett igénytől számított 30 napon belül a vonatkozó jogszabálynak megfelelően rendezzük az igényt.</p>
      <h3>7.4 Jogorvoslatok</h3>
      <p>A hiba jellegétől függően Ön jogosult a javításra, csere, ésszerű ár-kedvezmény vagy teljes visszatérítésre a vonatkozó fogyasztóvédelmi jogszabályzat szerint.</p>
      <h2>8. Termékbiztonság és használat</h2>
      <p>A növénytápszereket és a kapcsolódó termékeket a termék címkéjén és csomagolásán feltüntetett utasítások szerint kell használni. Nem vagyunk felelősek a Termékek nem megfelelő használatából, tárolásából vagy alkalmazásából eredő sérülésekért.</p>
      <p>Egyes Termékek az 1107/2009. számú (EC) rendelet vagy a 2019/1009. számú (EU) rendelet szerint növényvédelmi szereknek vagy műtrágyáknak minősülhetnek. Ahol alkalmazható, a Termékek megfelelnek a vonatkozó biztonsági adatlapok követelményeinek.</p>
      <p>Tartson minden Terméket a gyermekek és háziállatok elérésétől távol. Véletlen lenyelés vagy kitettség esetén kövesse a termék címkéjén szereplő utasításokat, és szükség esetén kérjen orvosi ellátást.</p>
      <h2>9. Vásárlói fiók</h2>
      <p>Az E-shopban hozhat létre fiókot a jövőbeli vásárlások megkönnyítéséhez. Ön felelős a bejelentkezési adatainak szigorú bizalmas kezeléséért. Fenntartjuk a jogot a Feltételeket megsértő fiókok felfüggesztésére vagy törlésére.</p>
      <h2>10. Szellemi tulajdon</h2>
      <p>Az E-shopban található összes tartalom, beleértve a termékleirásokat, képeket, grafikákat, logókat és védjegyeket, a JOINA Garden, s. r. o. tulajdonában van vagy az általa licencelt, és az alkalmazandó szellemi tulajdon törvények által védetted. Az előzetes írásos hozzájárulásunk nélkül nem másolhatja le, terjesztheti vagy kereskedelmi célokra nem felhasználhatja fel a tartalmat.</p>
      <h2>11. Felelősségkorlátozás</h2>
      <p>A törvény által megengedett maximális mértékben és az Ön kötelező fogyasztói jogai korlátozása nélkül:</p>
      <ul>
        <li>Az E-shop és tartalma az "ésszerűen" kerül biztosított, a törvény által előírt jótálláson túlmutató jótállás nélkül.</li>
        <li>Nem vagyunk felelősek az E-shop vagy a Termékek használatából eredő közvetett, mellékelt vagy következményes károkért.</li>
        <li>Az igényekre vonatkozó teljes felelősségünk nem haladja meg az igényt okozó Termékek értékét.</li>
      </ul>
      <p>Semmi ezekben a Feltételekben nem zárja ki vagy korlátozza felelősségünket a halál vagy személyi sérülés miatt okozott sérülésekért, amelyek gondatlanságunkból, csalárd tevékenységből vagy az alkalmazandó törvény szerint nem zárható ki a felelősség.</p>
      <h2>12. Alternatív vitarendezés</h2>
      <p>Ha Ön fogyasztónak minősül és nem elégedett azzal, ahogy reklamációját kezeltük, jogosult az alternatív vitarendezésre irányuló javaslatot benyújtani a Szlovák Kereskedelmi Ellenőrzéshez (Slovenská obchodná inšpekcia, SOI) vagy az EU Online Vitarendezési platformot használni a https://ec.europa.eu/consumers/odr címen.</p>
      <h2>13. Vis maior</h2>
      <p>Nem felelünk az ebben a Feltételekben foglalt kötelességeink teljesítésének késedelméért vagy elmulasztásáért, ha az az ellenőrzésünkön kívül eső körülmények miatt létrejön, beleértve a természeti katasztrófákat, járványokat, kormányzati intézkedéseket, ellátási lánc zavarokat vagy fuvarozó hibákat.</p>
      <h2>14. Alkalmazandó jog és illetékesség</h2>
      <p>Jelen Feltételek a Szlovák Köztársaság jogáról vonatkoznak. Bármely vita a Szlovák Köztársaság illetékes bíróságai által kerül rendezésre. Ha Ön az EU-ban lakó fogyasztónak minősül, az Ön beleegyezésével bírósághoz fordulhat az EU-tagállam bíróságaihoz, és az Ön helyi joga által előírt kötelező fogyasztóvédelmi rendelkezésekből profitál.</p>
      <h2>15. Feltételek módosítása</h2>
      <p>Bármikor módosíthatjuk a Feltételeket. A frissített verzió az E-shopban kerül közzétételre az új érvényes dátummal. A módosítás előtt leadott megrendelésekre a megrendelés idején érvényes Feltételek vonatkoznak.</p>
      <h2>16. Részleges érvénytelenség</h2>
      <p>Ha a Feltételek bármely rendelkezése érvénytelenek vagy végrehajthatónak találtatnak, a többi rendelkezés teljes erővel és hatályban marad.</p>
      <h2>17. Kapcsolat</h2>
      <p>Bármilyen kérdésben vagy kifogásban ezekre a Feltételekre vagy megrendelésekre:</p>
      <p><strong>JOINA Garden, s. r. o.</strong><br />Karpatské námestie 7770/10A<br />Bratislava – mestská časť Rača 831 06<br />Szlovák Köztársaság<br /><strong>IČO:</strong> 57 313 504<br /><strong>E-mail:</strong> support@gardenyx.eu</p>
      <hr />
      <p><strong>Az alkalmazás felhasználási feltételei</strong></p>
      <p><strong>GARDENYX</strong></p>
      <p><strong>Felhasználási feltételek</strong></p>
      <p><em>Mobilalkalmazás</em></p>
      <p>Hatálybalépés dátuma: 2026. március 6.</p>
      <h2>1. Feltételek elfogadása</h2>
      <p>Ezek a Felhasználási feltételek ("Feltételek") a GardenYX mobilalkalmazáshoz ("Alkalmazás") való hozzáférést és használatát szabályozzák, amelyet a JOINA Garden, s. r. o., Karpatské námestie 7770/10A, Bratislava – mestská časť Rača 831 06, Szlovák Köztársaság, IČO: 57 313 504 ("mi", "nekünk", "Vállalat") üzemeltet.</p>
      <p>Az Alkalmazás letöltésével, telepítésével vagy használatával Ön elfogadja ezen Feltételekhez kötöttnek lenni. Ha nem fogadja el, ne használja az Alkalmazást.</p>
      <h2>2. Jogosultság</h2>
      <p>Legalább 16 éves korúnak kell lennie az Alkalmazás használatához. Az Alkalmazás használatával Ön kijelenti és garantálja, hogy megfelel ennek az életkori követelménynek. Ha 18 év alatti, megerősíti, hogy szülői vagy gondviselői hozzájárulást szerzett az Alkalmazás használatához.</p>
      <h2>3. Fiókregisztráció</h2>
      <p>Bizonyos funkciók eléréséhez létre kell hoznia egy fiókot az egyik támogatott hitelesítési módszer segítségével (e-mail és jelszó, Google Sign-In, vagy Apple-be való bejelentkezés). Ön felelős bejelentkezési adatainak bizalmas kezeléséről és fiókjában lévő összes tevékenységért.</p>
      <p>Ön beleegyezik, hogy a regisztráció során pontos, aktuális és teljes információt ad meg, és szükség szerint frissíti azt. Fenntartjuk a jogot, hogy felfüggesszük vagy szüntessük meg azokat a fiókokat, amelyek hamis vagy félrevezető információkat tartalmaznak.</p>
      <p>Egy anonim próbafiók hozható létre korlátozott használat céljára. Az anonim fiókok átmeneti jellegűek, és adataik törlődnek a teljes fiók regisztrációja során.</p>
      <h2>4. Alkalmazás leírása és funkciói</h2>
      <p>A GardenYX egy növénygondozási alkalmazás, amely segít a felhasználóknak nyomon követni, figyelemmel kísérni és gondozni azok növényeit. Az Alkalmazás a következő funkciókat kínálja:</p>
      <ul>
        <li>Növény-profilok gondozáskövéréssel és emlékeztetőkkel</li>
        <li>AI-alapú növényfelismerés képfelismeréssel</li>
        <li>AI-alapú növényi egészségi diagnózis</li>
        <li>AI chatbot növénygondozási tanácsokhoz (RastoAI)</li>
        <li>Gondozásütemezés (öntözés, trágyázás, átültetés)</li>
        <li>Leküldéses értesítések gondozási emlékeztetőkhöz</li>
        <li>Kert és szoba szervezése</li>
      </ul>
      <p>Az Alkalmazás iOS-en, Androidon és progresszív webalkalmazásként is elérhető.</p>
      <h2>5. Előfizetés és fizetés</h2>
      <h3>5.1 Freemium modell</h3>
      <p>Az Alkalmazás freemium modellen alapul. Az alapvető funkciók ingyenesen elérhetőek. A prémium funkciók aktív előfizetést igényelnek ("Pro" csomag).</p>
      <h3>5.2 Fizetés feldolgozása</h3>
      <p>Az előfizetési díjak az Apple App Store (iOS) vagy Google Play (Android) segítségével kerülnek feldolgozásra. Az összes számlázás, visszatérítés és fizetési vita az alkalmazható alkalmazásbolt feltételeivel szabályozott. Mi nem közvetlenül dolgozzuk fel vagy tároljuk fizetési információit.</p>
      <h3>5.3 Előfizetés kezelése</h3>
      <p>Az előfizetéseket a RevenueCat kezeli és az Ön fiók azonosítójának segítségével szinkronizálja az eszközök között. Az előfizetést az Ön eszközének alkalmazásbolt beállításain keresztül kezelheti vagy szüntetheti meg.</p>
      <h3>5.4 Árváltozások</h3>
      <p>Fenntartjuk a jogot az előfizetési díjak módosítására. Az árváltozásokról előzetesen értesítjük Önt, és a változtatás után az első számlázási ciklusra vonatkoznak.</p>
      <h2>6. Felhasználói tartalom</h2>
      <p>Ön megtartja az Alkalmazáson keresztül létrehozott vagy feltöltött összes tartalom tulajdonjogát, beleértve a növényprofilt, fényképeket, jegyzeteket, gondozástörténetet és csevegési beszélgetéseket ("Felhasználói tartalom").</p>
      <p>A Felhasználói tartalom feltöltésével Ön nem kizárólagos, világméretű, jogdíjmentes licencet ad nekünk az ilyen tartalom használatára, tárolására és feldolgozására, kizárólag az Alkalmazás-szolgáltatások biztosítása és fejlesztése céljából. Ez a licenc akkor szűnik meg, ha Ön törli tartalmát vagy fiókját.</p>
      <p>Kizárólag Ön felelős a Felhasználói tartalmáért. Ön garantálja, hogy joga van az Ön által benyújtott tartalom feltöltésére, és hogy az nem sérti harmadik fél jogait.</p>
      <h2>7. AI funkciók és felelősségkizárások</h2>
      <p>Az Alkalmazás AI-alapú funkciókat biztosít, beleértve a növényfelismerést, az egészségi diagnózist, gondozási javaslatokat és egy AI chatbot-ot. Ezek a funkciók kizárólag informatív és tanácsadó célból kerülnek biztosításra.</p>
      <p><strong>Fontos:</strong> Az AI által generált eredmények nem garantáltan pontosak vagy teljesek. A növényfelismerés, az egészségi diagnózisok és gondozási javaslatok hibákat tartalmazhatnak. Az AI-kimenetre nem szabad kizárólagosan támaszkodnia olyan döntésekhez, amelyek hatással lehetnek a növények egészségére, vagy olyan biztonsági szempontokat érinthetnek (például potenciálisan mérgező növények azonosítása). Lemondunk az AI által generált tartalom felhasználásából eredő bármilyen veszteség vagy kár miatti felelősségről.</p>
      <h2>8. Eszközengedélyek</h2>
      <p>Az Alkalmazás hozzáférést kérhet az Ön eszközének kamerájához, fotótárához és értesítési rendszeréhez. Ezek az engedélyek opcionálisak, és az Ön eszköz beállításain keresztül kezelheti azokat. Bizonyos funkciók (például fényképekből származó növényfelismerés) az érintett engedélyek nélkül nem működnek.</p>
      <h2>9. Elfogadható használat</h2>
      <p>Ön beleegyezik, hogy nem:</p>
      <ul>
        <li>Használja az Alkalmazást jogellenes célokra</li>
        <li>Kísérli meg az Alkalmazás fordított mérnöki megoldását, dekompilálását vagy szétszedését</li>
        <li>Zavarja vagy megzavarja az Alkalmazás szervereit vagy hálózatait</li>
        <li>Kártékony tartalmakat, vírusokat vagy ártalmas kódot tölt fel</li>
        <li>Az Alkalmazást más felhasználók személyes adatainak gyűjtésére használja</li>
        <li>Megkerüli vagy kísérli meg megkerülni a biztonsági intézkedéseket</li>
        <li>Automatizált rendszereket vagy robotokat használ az Alkalmazás eléréséhez</li>
        <li>Az Alkalmazást értékesíti, alicenceli vagy kereskedelmi célra használja fel írásos hozzájárulásunk nélkül</li>
      </ul>
      <h2>10. Szellemi tulajdon</h2>
      <p>Az Alkalmazás, beleértve annak kialakítását, kódját, grafikáját, logóit és az összes általunk biztosított tartalmat (a Felhasználói tartalom kivételével), a JOINA Garden, s. r. o. tulajdona vagy licencelve, és szerzői jog, védjegy és egyéb szellemi tulajdoni jogok védelme alatt áll.</p>
      <p>Ön korlátozott, nem kizárólagos, nem átruházható, visszavonható licencet kap az Alkalmazás személyes, nem kereskedelmi célú használatára ezen Feltételek szerint.</p>
      <h2>11. Elérhetőség és frissítések</h2>
      <p>Igyekszünk az Alkalmazást elérhetővé és működőképessé tartani, de nem garantáljuk a zavartalan vagy hibamentes működést. Bármikor módosíthatjuk, felfüggeszthetjük vagy megszüntethetjük meg az Alkalmazás bármely részét előzetes értesítés nélkül.</p>
      <p>Az Alkalmazáshoz időről időre kiadhatunk frissítéseket. Egyes frissítések szükségesek lehetnek a folyamatos használathoz. Az Alkalmazás frissítés után történő folyamatos használata a módosítások elfogadását jelenti.</p>
      <h2>12. Felelősségkorlátozás</h2>
      <p>A vonatkozó jogszabályok által maximálisan megengedett mértékben:</p>
      <ul>
        <li>Az Alkalmazás "olyan, amilyen" és "ahogy elérhető" alapon kerül biztosításra, szavatosság nélkül, sem kifejezett, sem hallgatólagos.</li>
        <li>Mi nem vagyunk felelősek az Alkalmazás használatából vagy annak használatának lehetetlenségéből eredő közvetett, járulékos, különleges, következményes vagy büntető károkért, beleértve a profit, adat vagy jóhírnév elvesztését.</li>
        <li>Az Ön felé fennálló teljes összesített felelősségünk ezekből a Feltételekből eredő bármilyen igényre nem haladhatja meg az összeget, amelyet az igényt megelőző 12 hónapban az Alkalmazás előfizetéséért fizetett.</li>
      </ul>
      <h2>13. Kártérítés</h2>
      <p>Ön beleegyezik, hogy kártérítést nyújt és védelmet nyújt a JOINA Garden, s. r. o. és annak tisztségviselői, igazgatói, alkalmazottai és képviselői számára az Ön ezen Feltételek megsértéséből vagy az Alkalmazás használatából eredő bármilyen igény, kár, veszteség vagy költség alól.</p>
      <h2>14. Megszüntetés</h2>
      <p>Bármikor, okkal vagy anélkül, ésszerű értesítéssel felfüggeszthetjük vagy megszüntethetjük az Alkalmazáshoz való hozzáférését. Fiókját az Alkalmazás beállításai segítségével bármikor megszüntetheti.</p>
      <p>A megszüntetés után az Alkalmazás használatához való joga azonnal megszűnik. A természetüknél fogva a megszüntetés után is fennmaradó rendelkezések (beleértve a 10., 12., 13. és 15. szakaszokat) továbbra is hatályban maradnak.</p>
      <h2>15. Alkalmazandó jog</h2>
      <p>Ezek a Feltételek a Szlovák Köztársaság jogszabályai szerint irányadók és értelmezendők, a jogütközési elveket figyelmen kívül hagyva.</p>
      <p>Az ezekből a Feltételekből vagy azokkal összefüggésben felmerülő bármilyen vitát a Szlovák Köztársaság illetékes bíróságai döntik el. Ezen Feltételek semmilyen módon nem korlátozzák a fogyasztóvédelmi kötelező jogszabályok szerinti jogait lakóhelye szerint.</p>
      <h2>16. Feltételek módosítása</h2>
      <p>Bármikor módosíthatjuk ezeket a Feltételeket. Lényeges módosításokról értesítjük Önt az Alkalmazásban a módosított Feltételek közzétételével vagy más megfelelő módon. Az Alkalmazás ilyen módosítások utáni folyamatos használata a módosított Feltételek elfogadását jelenti.</p>
      <h2>17. Részleges érvénytelenség</h2>
      <p>Ha ezen Feltételek bármely rendelkezése érvénytelennek vagy nem végrehajthatónak bizonyul, a többi rendelkezés teljes erővel és hatályban marad.</p>
      <h2>18. Kapcsolat</h2>
      <p>Ha bármilyen kérdése merül fel ezen Feltételek kapcsán, kérjük, vegye fel velünk a kapcsolatot:</p>
      <p><strong>JOINA Garden, s. r. o.</strong><br />Karpatské námestie 7770/10A<br />Bratislava – mestská časť Rača 831 06<br />Szlovák Köztársaság<br /><strong>E-mail:</strong> support@gardenyx.eu</p>
    `,
  },
};

function getContent(locale: string) {
  return contentByLocale[locale] ?? contentByLocale.sk;
}

function splitBodyHtml(bodyHtml: string) {
  const [shopBodyHtml, appRawBodyHtml = ''] = bodyHtml.split('<hr />');
  const appHeadingStart = appRawBodyHtml.indexOf('<h2>');

  return {
    shopBodyHtml: shopBodyHtml.trim(),
    appBodyHtml: appHeadingStart >= 0 ? appRawBodyHtml.slice(appHeadingStart).trim() : appRawBodyHtml.trim(),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = getContent(locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gardenyx.eu';
  const canonicalUrl = `${siteUrl}/${locale}/obchodne-podmienky`;

  return {
    title: content.metadataTitle,
    description: content.metadataDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: content.metadataTitle,
      description: content.metadataDescription,
      url: canonicalUrl,
      siteName: 'GardenYX',
      type: 'article',
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = getContent(locale);
  const { shopBodyHtml, appBodyHtml } = splitBodyHtml(content.bodyHtml);
  const sections = [
    {
      key: 'shop' as const,
      tabLabel: content.shopTabLabel,
      label: content.label,
      title: content.title,
      subtitle: content.subtitle,
      effectiveDate: content.effectiveDate,
      bodyHtml: shopBodyHtml,
    },
    {
      key: 'app' as const,
      tabLabel: content.appTabLabel,
      label: content.appLabel,
      title: content.appTitle,
      subtitle: content.appSubtitle,
      effectiveDate: content.appEffectiveDate,
      bodyHtml: appBodyHtml,
    },
  ];

  return (
    <main className="bg-stone-50 py-12 sm:py-16">
      <div className="container mx-auto px-6 sm:px-8">
        <article className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
          <LegalDocumentTabs sections={sections} />
        </article>
      </div>
    </main>
  );
}
