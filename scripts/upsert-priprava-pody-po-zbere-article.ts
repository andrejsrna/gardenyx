import 'dotenv/config';
import prisma from '../app/lib/prisma';

const slug = 'ako-pripravit-podu-po-zbere';
const imageBase = 'https://cdn.gardenyx.eu/gardenyx/articles/priprava-pody-po-zbere';
const coverImage = `${imageBase}/priprava-pody-po-zbere-hero-20261011.png`;
const compostImage = `${imageBase}/vyzrety-kompost-na-zahone-20261011.png`;
const mulchImage = `${imageBase}/mulcovany-zahon-na-zimu-20261011.png`;
const publishedAt = new Date('2026-10-11T12:00:00.000Z');

const contentSk = `Po poslednej úrode je lákavé záhon prekopať, prisypať hnojivo a nechať ho tak do jari. Pôde však často pomôže viac jednoduchý postup: odstrániť choré zvyšky, podľa potreby pridať vyzretý kompost a nenechať povrch cez zimu holý. Rozhoduje aj to, čo tu budete pestovať na budúci rok.

**Rýchla odpoveď:** Zo záhona odstráňte napadnuté rastliny a trvácu burinu, zdravé zvyšky vhodne skompostujte. Ak pôda potrebuje organickú hmotu, pridajte vyzretý kompost na povrch. Záhon prikryte mulčom alebo včas vysejte zelené hnojenie. Minerálne živiny pridávajte podľa potreby a pôdneho rozboru, nie automaticky po každej úrode.

## 1. Upracte záhon, ale neodstraňujte všetok život

Korene a zdravé rastlinné zvyšky môžu postupne dopĺňať organickú hmotu. Zo záhona však odstráňte trvácu burinu so semenami a silno napadnuté časti rastlín. Pri chorobách a škodcoch zvážte, či váš kompost dosiahne dostatočnú teplotu; ak nie, napadnutý materiál doň nepridávajte. Miestne pravidlá pre biologický odpad majú prednosť.

Poznačte si, kde rástli paradajky, zemiaky či kapustoviny. Striedanie plodín pomáha obmedziť opakované problémy na tom istom mieste; pri ďalšej výsadbe zohľadnite aj minuloročné hnojenie. Ak plánujete na jeseň vysádzať cesnak, prejdite na osobitný návod [jesenná príprava záhona pre cesnak a cibuľu](/sk/blog/hnojivo-na-cesnak-a-cibulu) — tento článok rieši najmä *voľný záhon po zbere*, nie dávkovanie pre vysadenú plodinu.

## 2. Posúďte pôdu skôr, než niečo pridáte

Vezmite do ruky trochu pôdy: rozpadá sa do drobných hrudiek, alebo je zlepená a mokrá? Po daždi sledujte, či voda odteká, alebo zostáva stáť. S premokrenou pôdou nepracujte: šliapanie a rýľovanie ju môžu utlačiť. Ak rastliny počas sezóny zaostávali, príčinou nemuseli byť živiny — pozrite aj na vlahu, odvodnenie, choroby a pH.

Pri opakovanom slabom raste alebo plánovaní nového zeleninového záhona má zmysel pôdny rozbor. Výsledok pomôže rozlíšiť nedostatok živín od nevhodnej kyslosti. Vápno, fosfor či draslík nepridávajte plošne bez dôvodu: prebytok živín je tiež problém. Čo znamenajú čísla na obale prípravkov, vysvetľujeme v článku [NPK hnojivo: ako čítať pomery živín](/sk/blog/npk-hnojivo-co-znamena).

## 3. Vyzretý kompost zlepšuje štruktúru, nie je náhradou rozboru

Vyzretý záhradný kompost je tmavý, drobivý a vonia po zemine. Na povrch záhona môžete naniesť primeranú vrstvu a nechať dážď a pôdne organizmy pracovať za vás. Na ľahkej pôde zlepšuje schopnosť držať vodu; na ťažkej postupne pomáha vytvárať lepšiu štruktúru. Nepridávajte ho bezhlavo po každej sezóne — dôležité je množstvo organickej hmoty, ktoré už pôda dostala.

![Vyzretý kompost rozprestretý na jesennom zeleninovom záhone](${compostImage})

Čerstvý maštaľný hnoj a nezrelý kompost nie sú to isté ako vyzretý kompost. Ich použitie závisí od plodiny, času do výsadby a hygieny úrody; neprikladajte ich ku koreňom alebo sadbe ako univerzálnu „štartovaciu“ dávku. Ak používate kupovaný prípravok, rešpektujte etiketu.

## 4. Mulč alebo zelené hnojenie: ako vybrať ochranu záhona

Holá pôda je vystavená silnému dažďu, erózii a rastu burín. **Mulč** zo zdravého lístia či vyzretého kompostu chráni povrch; nezasypte ním korunky živých rastlín a pri premokrení nesnažte sa vodu „vyliečiť“ ďalšou vrstvou. **Zelené hnojenie** sú rastliny zasiate na pokrytie pôdy: korene držia pôdu a porast konkuruje burinám. Termín a druh vyberte podľa lokálneho počasia a podľa toho, kedy bude záhon znovu potrebný. V októbri už nemusí stihnúť vyrásť každá zmes; pozrite požiadavky na obale osiva.

![Záhon s jesenným mulčom vedľa záhona so zeleným hnojením](${mulchImage})

| Situácia | Vhodnejší ďalší krok |
| --- | --- |
| Voľný záhon, na výsev je ešte vhodný termín | Vysiať vhodnú pokryvnú plodinu podľa termínu a návodu osiva. |
| Výsevné okno už skončilo | Prikryť pôdu zdravým mulčom, nenechať ju holú. |
| Pôda je premokrená a zhutnená | Nešliapať po nej, zabezpečiť odtok vody a počkať s prácami. |
| Čoskoro sadíte ozimný cesnak | Postup prispôsobiť konkrétnej plodine, neprekryť miesto výsadby nevhodnou vrstvou. |

## 5. Kedy doplniť živiny a kedy nehnojiť

Kompost dopĺňa organickú hmotu, nie však automaticky všetky živiny v presnom pomere. Naopak, silná minerálna dávka nenahradí zdravú pôdnu štruktúru. Ak je záhon produktívny a dostával primeranú výživu, na jeseň nemusí potrebovať žiadne ďalšie hnojivo. Pri zistenom deficite vyberte vhodný prípravok podľa rozboru a plánovanej plodiny.

Pre výber výživy **počas rastu zeleniny** slúži stránka [hnojivo na zeleninu](/sk/hnojivo-na-zeleninu) a návod [ako hnojiť zeleninu v sezóne](/sk/blog/ako-hnojit-zeleninu). Listové prípravky pre rastúce rastliny nie sú náhradou za jesennú starostlivosť o prázdny záhon; neaplikujte ich na holú pôdu len preto, že prišla jeseň.

## Jesenný checklist a najčastejšie chyby

1. Odstráňte silno napadnuté rastliny a trvácu burinu; zdravý materiál spracujte vhodne.
2. Zapíšte si predplodinu a plán na nasledujúcu sezónu.
3. Skontrolujte odtok vody, štruktúru a podľa potreby objednajte rozbor pôdy.
4. Ak chýba organická hmota, naneste vyzretý kompost bez zbytočného prehnojovania.
5. Pôdu zakryte mulčom alebo včas vysiatou vhodnou pokryvnou plodinou.

Vyhnite sa rýľovaniu mokrej pôdy, opakovanému pestovaniu rovnakej plodiny na rovnakom mieste, čerstvému hnoju priamo pod citlivú sadbu a plošnej aplikácii vápna či NPK bez znalosti pôdy. Netreba každý záhon do jari obrátiť naruby: pri zdravom povrchu býva šetrnejší zásah lepší.

## FAQ

### Musím po každej úrode prihnojiť prázdny záhon?

Nie. Rozhoduje stav pôdy, predchádzajúca výživa a plodina plánovaná na ďalšiu sezónu. Najprv zistite príčinu prípadného slabého rastu, nehnojte naslepo.

### Stačí kompost namiesto hnojiva?

Vyzretý kompost pomáha najmä pôdnej štruktúre a dodáva určitú výživu, ale jeho zloženie nie je stála receptúra. Pri preukázanom nedostatku konkrétnej živiny sa riaďte rozborom a potrebou plodiny.

### Čo ak už nestihnem vysiať zelené hnojenie?

Pôdu prikryte primeraným zdravým mulčom. Nesejte teplomilnú zmes neskoro len preto, aby záhon nebol prázdny; druh a termín vždy závisia od počasia.

## Zdroje a ďalšie čítanie

- [RHS: Organic matter: what is it?](https://www.rhs.org.uk/soil-composts-mulches/what-is-organic-matter)
- [RHS: Mulches and mulching](https://www.rhs.org.uk/soil-composts-mulches/mulch)
- [RHS: Green manures](https://www.rhs.org.uk/soil-composts-mulches/green-manures)
- [RHS: Soil pH and testing](https://www.rhs.org.uk/soil-composts-mulches/ph-and-testing-soil)`;

const contentEn = `After the last harvest, an empty bed does not automatically need a heavy dose of fertilizer or deep digging. First remove diseased debris, assess the soil, add mature compost if needed, and protect the surface through winter. What you plan to grow next matters too.

**Quick answer:** Remove badly infected plants and perennial weeds; compost healthy residues appropriately. Where organic matter is needed, spread mature compost on the surface. Cover bare soil with mulch or sow a suitable green manure while there is still time. Add mineral nutrients only if the soil and next crop actually require them.

## 1. Clear the bed without stripping it bare

Remove perennial weeds and heavily diseased material. Healthy residues can often be composted, but a home compost heap may not reach temperatures sufficient to deal with all plant diseases. Follow local green-waste rules. Record where tomatoes, potatoes and brassicas grew so you can plan crop rotation next year.

If you are planting overwintering garlic, follow our separate guide to [garlic and onion autumn preparation](/en/blog/garlic-and-onion-fertilizer-autumn). This article is about caring for an *empty bed after harvest*, not the precise feeding schedule of a planted crop.

## 2. Assess soil before buying amendments

Check its texture, drainage and moisture after rainfall. Avoid walking or digging on wet soil, which can compact it. Weak growth is not always a nutrient problem: insufficient water, poor drainage, pests or an unsuitable pH may be responsible. A soil test is helpful when establishing a new vegetable bed or troubleshooting repeated poor performance. Do not add lime, phosphorus or potassium indiscriminately. See our guide to [NPK fertilizer numbers](/en/blog/npk-fertilizer-meaning) for how to read a label.

## 3. Use mature compost for soil structure

Finished compost is dark, crumbly and earthy smelling. A modest layer on a bed can improve the soil's water management and structure as organisms incorporate it. Sandy soil may retain moisture better; heavy soil gradually becomes easier to work. Compost still supplies some nutrients, so take previous additions into account rather than applying large quantities every year.

![Mature compost spread over an autumn vegetable bed](${compostImage})

Fresh manure and unfinished compost are different materials. Their safe use depends on the crop and timing; neither should be put directly against sensitive planting material as a universal starter. Always follow the label of any purchased soil amendment.

## 4. Cover the ground: mulch or green manure

Bare soil is vulnerable to winter rain, erosion and weeds. Healthy leaf mulch or mature compost helps protect the surface; avoid smothering the crowns of living plants. Green manures are cover crops sown to protect the soil with living foliage and roots. Choose a species and sowing time appropriate to your climate and the next planting date. Not every mix will establish if sown late in October.

![Leaf-mulched autumn bed beside a green cover-crop bed](${mulchImage})

| Situation | Practical choice |
| --- | --- |
| The sowing window is still open | Sow a suitable cover crop following its seed instructions. |
| It is too late for that crop | Protect bare ground with healthy mulch. |
| The ground is waterlogged | Avoid treading on it; address drainage before cultivation. |
| You will plant garlic soon | Adjust the bed to that crop rather than using a one-size-fits-all cover. |

## 5. Fertilize only when the bed needs it

Compost is not a precisely formulated nutrient mix; mineral fertilizer is not a replacement for good soil structure. A productive vegetable bed that received appropriate nutrients during the season may need no additional autumn feeding. Use test results and the next crop's requirements to identify any real shortage.

For feeding vegetables **while they are actively growing**, see [vegetable fertilizer](/en/vegetable-fertilizer) and [how to fertilize vegetables](/en/blog/how-to-fertilize-vegetables). Foliar feeds for growing crops are not a substitute for caring for an empty bed; do not spray them on bare soil as an autumn ritual.

## Autumn checklist and common mistakes

1. Remove badly infected residues and persistent weeds.
2. Record the previous crop and decide what will grow here next year.
3. Check drainage, texture and, when justified, soil test results.
4. Add mature compost if organic matter is needed; avoid excess.
5. Cover bare soil with mulch or an appropriately timed green manure.

Avoid digging saturated ground, repeating the same crop in the same place, putting fresh manure directly under sensitive planting material and adding lime or NPK fertilizer without understanding your soil.

## FAQ

### Must I fertilize after every harvest?

No. Consider the soil's condition, what it has received already and what you will grow next. Diagnose poor growth before applying more nutrients.

### Is compost enough to replace fertilizer?

Mature compost improves soil and supplies some nutrients, but its composition varies. If a test reveals a particular nutrient deficiency, plan a targeted correction for the next crop.

### What if I missed the cover-crop sowing window?

Use appropriate healthy mulch instead. Do not sow a tender mix too late just to make the bed look green.

## Sources and further reading

- [RHS: Organic matter](https://www.rhs.org.uk/soil-composts-mulches/what-is-organic-matter)
- [RHS: Mulches and mulching](https://www.rhs.org.uk/soil-composts-mulches/mulch)
- [RHS: Green manures](https://www.rhs.org.uk/soil-composts-mulches/green-manures)
- [RHS: Soil pH and testing](https://www.rhs.org.uk/soil-composts-mulches/ph-and-testing-soil)`;

const contentHu = `Az utolsó betakarítás után az üres ágyásnak nincs automatikusan szüksége nagy adag műtrágyára vagy mély ásásra. Először távolítsa el a beteg növényi maradványokat, mérje fel a talaj állapotát, szükség esetén használjon érett komposztot, és télre védje a felszínt. Az is számít, mit fog jövőre termeszteni.

**Rövid válasz:** Távolítsa el a súlyosan fertőzött növényeket és az évelő gyomokat; az egészséges maradványokat megfelelően komposztálja. Ha szerves anyagra van szükség, terítsen érett komposztot a talaj felszínére. Fedje az ágyást mulccsal, vagy időben vessen odaillő zöldtrágyanövényt. Ásványi tápanyagot csak a talaj és a következő növény tényleges igénye szerint pótoljon.

## 1. Tisztítsa meg az ágyást, de ne bolygassa feleslegesen

Az évelő gyomokat és az erősen beteg növényi részeket távolítsa el. Az egészséges maradványok megfelelő körülmények között komposztálhatók, de a házi komposzt nem mindig melegszik fel eléggé a növényi kórokozók ártalmatlanításához. Vegye figyelembe a helyi zöldhulladék-kezelési szabályokat. Jegyezze fel, hol termett paradicsom, burgonya és káposztaféle, hogy jövőre tervezni tudja a vetésforgót.

Ha őszi fokhagymát ültet, olvassa el a külön [fokhagyma- és hagymaágyásról szóló útmutatót](/hu/blog/fokhagyma-es-hagyma-tragyazas-osszel). Ez a cikk elsősorban a *betakarítás után üresen maradt* zöldségeságyásról szól.

## 2. Először vizsgálja meg a talajt

Nézze meg az állagát, a vízelvezetést és azt, hogyan viselkedik eső után. Átázott földön ne járjon és ne ásson: könnyen tömörödik. A gyenge növekedés oka nem mindig tápanyaghiány; vízhiány, pangó víz, kártevők vagy nem megfelelő pH is állhat mögötte. Visszatérő gondoknál vagy új veteményes kialakításakor hasznos a talajvizsgálat. Meszet, foszfort vagy káliumot ne adjon hozzá találomra. A címkék értelmezésében segít az [NPK-számokról szóló cikk](/hu/blog/npk-mutragya-jelentese).

## 3. Az érett komposzt a szerkezetet javítja

Az érett komposzt sötét, morzsalékos és földillatú. Szükség esetén mérsékelt rétegben terítse az ágyás felszínére; a talaj élőlényei fokozatosan bedolgozzák. Homokos talajon segíthet megtartani a nedvességet, kötött talajon idővel javíthatja a szerkezetet. Tápanyagot is tartalmaz, ezért vegye figyelembe a korábbi adagokat.

![Érett komposzt az őszi zöldségeságyáson](${compostImage})

A friss istállótrágya és az éretlen komposzt nem ugyanaz, mint az érett komposzt. Alkalmazásuk a növénytől és az ültetés időpontjától függ; érzékeny vetőanyag mellé ne helyezze őket általános indító adagként. Vásárolt készítménynél tartsa be a címkét.

## 4. Mulcs vagy zöldtrágya: takarja a talajt télre

A csupasz talajt a téli eső, az erózió és a gyomok is veszélyeztetik. Az egészséges lombból vagy érett komposztból készített mulcs védi a felszínt; ne fedje be vele az élő növények tövét. A zöldtrágyanövények élő hajtásaikkal és gyökereikkel takarják a földet. Fajt és vetési időt az időjáráshoz és a következő ültetéshez válasszon. Októberben már nem minden keverék tud kikelni és megerősödni.

![Lombbal mulcsozott ágyás és zöldtrágyával bevetett ágyás](${mulchImage})

| Helyzet | Javasolt lépés |
| --- | --- |
| Még megfelelő az idő a vetéshez | Vessen a helyi körülményekhez illő takarónövényt. |
| Már késő a vetés | Fedje a talajt egészséges mulccsal. |
| A talaj átázott | Ne járjon rajta; előbb a vízelvezetést rendezze. |
| Hamarosan fokhagymát ültet | Az ágyást a konkrét növény igényéhez készítse elő. |

## 5. Tápanyagot csak indokolt esetben pótoljon

A komposzt nem pontos összetételű műtrágya; a műtrágya pedig nem helyettesíti a jó talajszerkezetet. Egy jól termő, megfelelően táplált ágyásnak ősszel lehet, hogy nincs szüksége további trágyázásra. Hiány esetén a talajvizsgálat és a következő növény igénye alapján válasszon.

Az **aktívan növekvő zöldségek** tápanyagellátásához lásd a [zöldség műtrágya](/hu/zoldseg-mutragya) oldalt és a [zöldségek trágyázásáról szóló útmutatót](/hu/blog/hogyan-tragyazzuk-a-zoldsegeket). A lombtrágya nem helyettesíti az üres ágyás őszi ápolását; ne permetezze a csupasz földet megszokásból.

## Őszi ellenőrzőlista és gyakori hibák

1. Távolítsa el az erősen beteg maradványokat és az évelő gyomokat.
2. Jegyezze fel az előző növényt, és tervezze meg a következőt.
3. Ellenőrizze a vízelvezetést és a talajszerkezetet; indokolt esetben vizsgáltassa meg a talajt.
4. Szükség esetén terítsen ki érett komposztot, de kerülje a túlzott adagot.
5. Takarja a talajt mulccsal vagy időben vetett zöldtrágyanövénnyel.

Ne ássa az átázott talajt, ne termessze évről évre ugyanazt a növényt ugyanott, és talajismeret nélkül ne meszezzen vagy szórjon ki NPK-műtrágyát.

## GYIK

### Minden betakarítás után trágyázni kell?

Nem. Vegye figyelembe a talaj állapotát, a korábbi tápanyagpótlást és a következő növényt. A gyenge növekedés okát előbb tisztázza.

### A komposzt helyettesíti a műtrágyát?

Az érett komposzt javítja a talajt és némi tápanyagot is ad, de az összetétele változó. Kimutatott hiány esetén a következő növény igénye szerint pótolja a szükséges tápanyagot.

### Mi van, ha már késő a zöldtrágya vetése?

Használjon helyette megfelelő, egészséges mulcsot. Ne vessen későn fagyérzékeny keveréket pusztán azért, hogy zöld legyen az ágyás.

## Források és további olvasnivaló

- [RHS: Organic matter](https://www.rhs.org.uk/soil-composts-mulches/what-is-organic-matter)
- [RHS: Mulches and mulching](https://www.rhs.org.uk/soil-composts-mulches/mulch)
- [RHS: Green manures](https://www.rhs.org.uk/soil-composts-mulches/green-manures)
- [RHS: Soil pH and testing](https://www.rhs.org.uk/soil-composts-mulches/ph-and-testing-soil)`;

const translations = {
  sk: {
    slug,
    title: 'Ako pripraviť pôdu po zbere na ďalšiu sezónu: kompost, mulč a najčastejšie chyby',
    excerpt: 'Čo urobiť so zeleninovým záhonom po zbere? Praktický jesenný postup: vyzretý kompost, mulč alebo zelené hnojenie a výživa len podľa potreby.',
    content: contentSk,
    metaTitle: 'Príprava pôdy po zbere: kompost, mulč a chyby | GardenYX',
    metaDescription: 'Ako pripraviť zeleninový záhon po zbere na ďalší rok: čistenie, kompost, mulč či zelené hnojenie. Zistite, kedy pôdu nehnojiť naslepo.',
  },
  en: {
    slug: 'prepare-soil-after-harvest',
    title: 'How to prepare vegetable soil after harvest for next season',
    excerpt: 'A practical autumn checklist for vegetable beds: mature compost, mulch or green manure, and feeding only when your soil actually needs it.',
    content: contentEn,
    metaTitle: 'Prepare Soil After Harvest: Compost & Cover | GardenYX',
    metaDescription: 'Prepare your vegetable beds after harvest: clear diseased debris, assess soil, add mature compost where needed, and cover with mulch or green manure.',
  },
  hu: {
    slug: 'talaj-elokeszitese-betakaritas-utan',
    title: 'Talaj-előkészítés betakarítás után: komposzt, mulcs és gyakori hibák',
    excerpt: 'Gyakorlati őszi terv a zöldségeságyáshoz: érett komposzt, mulcs vagy zöldtrágya, és tápanyagpótlás csak szükség esetén.',
    content: contentHu,
    metaTitle: 'Talaj-előkészítés betakarítás után | GardenYX',
    metaDescription: 'Hogyan készítse elő a zöldségeságyást betakarítás után? Komposzt, mulcs, zöldtrágya és az indokolatlan őszi trágyázás elkerülése.',
  },
};

async function main() {
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    // Avoid replacing a later editor's changes when this reproducible script is run again.
    console.log(`Article already exists; not overwriting: ${slug}`);
    return;
  }
  await prisma.article.create({ data: { slug, status: 'published', publishedAt, coverImage, translations } });
  console.log(`Published article: ${slug}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
