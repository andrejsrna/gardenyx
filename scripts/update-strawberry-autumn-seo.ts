import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import prisma from '../app/lib/prisma';

const heading = '## Čím hnojiť jahody na jeseň a kedy už hnojenie obmedziť';
const section = `${heading}

**Na jeseň jahody nehnojte automaticky.** Zdravý záhon v dobrej, pravidelne mulčovanej pôde nemusí potrebovať ďalšiu dávku. Rozhoduje stav rastlín, predchádzajúce hnojenie a to, či ešte aktívne rastú alebo plodia. Hnojenie po letnom zbere nie je to isté ako neskorá októbrová aplikácia: keď rast ustáva a prichádzajú mrazy, výživu obmedzte a nesnažte sa vyvolať nový rast silnou dusíkatou dávkou.

### Záhon po zbere verzus stále rodiace jahody

- **Raz rodiace jahody:** regeneráciu riešte po ich letnom zbere, nie až tesne pred zimou. Na jeseň odstráňte choré listy a burinu, pri suchu zalejte a skontrolujte odtok vody. Zdravé zelené listy ponechajte; porast neskoro na jeseň neorezávajte plošne.
- **Stále rodiace jahody:** môžu plodiť až do prvých mrazov. Kým rastú a plodia, prípadná výživa sa riadi návodom konkrétneho výrobku a stavom porastu. Po skončení rastu ju obmedzte; neprenášajte automaticky režim z letných jahôd.
- **Jahody v nádobe:** majú menšiu zásobu vody a živín než záhon. Kontrolujte vlhkosť a drenáž, ale nehnojte preschnuté rastliny ani zamrznutý substrát. Pri ochladení chráňte nádobu pred premrznutím.

### Aké hnojivo vybrať a kedy ho radšej vynechať

Ak sa prejaví nedostatok živín, najprv vylúčte sucho, premokrenie, poškodené korene a nevhodnú pôdu. Draslík patrí k dôležitým živinám pre jahody, ale samotná jeseň nie je dôvod na vysokú dávku draslíka či fosforu. Zloženie a dávku voľte podľa pôdy, potreby rastliny a etikety; nesčítavajte viac prípravkov bez kontroly celkového prísunu živín. Čerstvý maštaľný hnoj nepatrí ku koreňom jahôd.

Prehľad možností nájdete na stránke [hnojivo na jahody](/sk/hnojivo-na-jahody). [Hakofyt B jahody](/sk/produkt/hakofyt-b-jahody) je sezónna listová podpora, nie automatické odporúčanie na neskoré zazimovacie hnojenie. Použite ho iba v podmienkach a termínoch uvedených na etikete. Keď rast ustáva, presuňte pozornosť na ochranu rastlín a vodný režim namiesto ďalšej dávky.

| Stav jahôd na jeseň | Odporúčaný postup |
| --- | --- |
| Zdravý záhon bez známok nedostatku | ďalšie hnojivo nie je automaticky potrebné; čistota záhona a primeraná vlaha |
| Aktívne rastúce alebo plodiace rastliny | prípadná výživa podľa etikety a reálnej potreby |
| Žltnutie, slabý rast alebo premokrenie | najprv zistiť príčinu; nepridávať hnojivo naslepo |
| Rast ustal alebo pôda je zamrznutá | nehnojiť s cieľom vyvolať rast; pripraviť vhodnú zimnú ochranu |

`;
const faq = `### Čím hnojiť jahody na jeseň?

Nie každý záhon potrebuje jesenné hnojivo. Ak jahody ešte rastú a majú preukázanú potrebu živín, vyberte prípravok podľa pôdy a etikety. Keď rast ustáva, obmedzte výživu; neskorou silnou dusíkatou dávkou nepodporujte nové listy. Letné hnojenie po zbere neodkladajte až na obdobie pred mrazmi.

### Treba prihnojovať aj zdravý jahodový záhon?

Nie automaticky. Jahody v dobrej, pravidelne mulčovanej pôde môžu prosperovať bez dodatočného hnojenia. Pri slabom raste najprv skontrolujte vodu, pôdu a korene, až potom riešte prípadný nedostatok živín.

`;
async function main() {
 const article = await prisma.article.findUniqueOrThrow({where:{slug:'kedy-hnojit-jahody'}});
 const translations = article.translations as Record<string, Record<string, string>>;
 const original = translations.sk.content;
 if (original.includes(heading)) { console.log('Autumn section already exists; no changes.'); return; }
 const anchor = '\n## Čím hnojiť jahody\n';
 const faqAnchor = '### Prečo majú jahody veľa listov, ale málo plodov?';
 if (!original.includes(anchor) || !original.includes(faqAnchor)) throw new Error('Expected editorial anchors missing');
 const backupDir = '/root/.hermes/outputs/gardenyx-october-backup';
 await mkdir(backupDir, {recursive:true});
 await writeFile(`${backupDir}/strawberry-${Date.now()}.json`,JSON.stringify(article,null,2));
 const next = original.replace(anchor, `\n${section}${anchor}`).replace(faqAnchor,`${faq}${faqAnchor}`) + '\n\n## Odborný zdroj k pestovaniu a výžive\n\n[RHS: How to grow strawberries](https://www.rhs.org.uk/fruit/strawberries/grow-your-own) rozlišuje letné a stále rodiace jahody a uvádza, že porast v dobrej, pravidelne mulčovanej pôde nemusí potrebovať ďalšie hnojenie. Pestovanie v nádobách má odlišné nároky.\n';
 // Preserve every locale and all original metadata and publication dates.
 const result = await prisma.article.updateMany({where:{id:article.id,updatedAt:article.updatedAt}, data:{translations:{...translations,sk:{...translations.sk,content:next}}}});
 if (result.count!==1) throw new Error('Concurrent article edit detected; no update applied');
 const saved = await prisma.article.findUniqueOrThrow({where:{id:article.id}});
 const verified = saved.translations as typeof translations;
 if (verified.sk.content !== next || JSON.stringify(verified.en)!==JSON.stringify(translations.en) || JSON.stringify(verified.hu)!==JSON.stringify(translations.hu)) throw new Error('Verification failed');
 console.log('Updated and verified SK autumn section + FAQ; EN/HU and existing metadata preserved.');
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>prisma.$disconnect());
