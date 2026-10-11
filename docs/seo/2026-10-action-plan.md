# GardenYX — SEO plán na október 2026

**Stav:** plánované, nie nasadené. Pripravené 2. 10. 2026.
**Zdroj:** GSC Web export `gardenyx.eu-Performance-on-Search-2026-10-02.zip`, denné dáta 30. 6. – 29. 9. 2026. Stránkové a dopytové tabuľky sú za celé obdobie, nie samostatne za september.

## Východiskové údaje

- Celé obdobie: 120 kliknutí, 5 072 zobrazení, CTR 2,37 %, približná priemerná pozícia 11,59 (vážená impresiami z denného grafu).
- September 1.–29. 9.: 46 kliknutí, 1 652 zobrazení, CTR 2,78 %, približná pozícia 9,05. Export neobsahuje 30. september.
- Rovnaký počet dní v auguste 1.–29. 8.: 22 kliknutí, 1 861 zobrazení, CTR 1,18 %, približná pozícia 14,07.
- Stránkové súčty nenahrádzajú property totals; dopytová tabuľka je obmedzená anonymizáciou. Export neobsahuje objednávky ani tržby, ani stav indexácie/diagnostiku Merchant Center.

## Týždeň 1 — indexácia a diagnostika

- [ ] URL Inspection pre všetkých 6 jazykových URL nových článkov cesnak/cibuľa a jesenný trávnik; skontrolovať aj augustové jahodové a štartovacie landing pages a články citrusy/zemiaky. Nové septembrové URL nie sú v Strany.csv; to nie je dôkaz neindexácie. Live HTTP 200 a sitemap prítomnosť oboch nových SK slugov boli overené 2. 10.
- [x] Technický audit 11. 10.: šesť septembrových článkov má HTTP 200, vlastné canonical, vzájomné SK/EN/HU hreflang, index/follow a správnu schema URL; všetky sú v sitemap. Blog opravovaný: chýbajúce canonical/hreflang, normalizácia page v metadátach a odstránenie `cat` bezpečnostným filtrom. Google URL Inspection ostáva otvorené samostatne.
- [ ] Vyžiadať samostatné GSC exporty dopytov a stránok za 1.–29. august a 1.–29. september pre validné URL-level porovnanie.
- [ ] Overiť Merchant Center prístup, zdroj dát a schválené produkty. Feed vracia 200 a 20 položiek. GSC zaznamenal 1 kliknutie/3 zobrazenia typu Záznamy obchodníka; to nedokazuje kompletné schválenie feedu.

## Týždeň 2 — existujúci obsah a CTR

- [x] Jahody 11. 10.: rozšírený existujúci SK článok o jesennú výživu, rozhodovaciu tabuľku, rozlíšenie odrôd/nádob a 2 FAQ. Zdroj RHS; produktová podpora rešpektuje etiketu a neodporúča automatické neskoré hnojenie. Baseline `cim hnojit jahody na jesen`: 23 zobrazení, 0 klikov, pozícia 9,70 (30. 6. – 29. 9.). Zachované EN/HU, metadata aj publikovanie; DB backup pred zmenou a živý obsah overené.
- [ ] Zelenina: posilniť existujúcu landing page pre generický dopyt `hnojivo na zeleninu` (99 zobrazení, 0 klikov, pozícia 14,72) a otázky výberu podľa fázy rastu; overiť produktové a článkové odkazy. URL má 7 klikov/471 zobrazení, CTR 1,49 % za celé obdobie.
- [ ] EN: prioritne analyzovať `/en/blog/tomato-fertilizer` (3/624, CTR 0,48 %, pozícia 10,50), `/en/fertilizer` (2/455, CTR 0,44 %) a `/en/vegetable-fertilizer` (0/192, pozícia 11,41). Ďalšie kandidáty `/en/lawn-fertilizer` (1/163, pozícia 7,48) a `/en/hakofyt-fertilizers` (1/170, pozícia 7,71). Title/meta upraviť až podľa konkrétnych dopytov a krajín, nie naslepo. Neoptimalizovať predajné copy pre krajiny, kam obchod nedoručuje.

## Týždne 2–4 — obsahový záväzok

- [ ] Článok 1, návrh: **Ako pripraviť pôdu po zbere na ďalšiu sezónu: kompost, živiny a najčastejšie chyby.** Pred vytvorením audit existujúceho zeleninového/NPK/cesnakového obsahu; samostatná URL iba pri odlišnom intente. Téma je sezónny redakčný návrh, nie doložený objem vyhľadávania.
- [ ] Článok 2, návrh: **Citrusy v zime: svetlo, zálievka a kedy obmedziť hnojenie.** Nadviazať na existujúci článok a citrusový produkt bez duplicitného hnojivového intentu. Téma je sezónny návrh; existujúca SK citrusová landing page má 3 kliky/143 zobrazení, pozíciu 6,37 za celé obdobie.
- [ ] Každý schválený článok: SK/EN/HU, 3 vlastné obrázky na CDN, praktické FAQ, overené zdroje, odkazy na existujúci hub/produkt, kontrola URL a sitemap. Produktové odporúčania podriadiť sezóne a etikete, nie marketingu.

## Týždeň 4 — vyhodnotenie

- [ ] Zmerať 28-dňové výsledky pred a po zmene na rovnakých URL/dopytoch. Reportovať clicks, impressions, CTR a pozíciu so správnym rozsahom.
- [ ] Overiť produktové structured data, feedové ceny/dostupnosť/dopravu oproti checkoutu a diagnostiku zamietnutých produktov. Neprehlasovať feed za aktivovaný bez Merchant Center dôkazov.
- [ ] Klientsky report: realizované vs. plánované úlohy, bez garantovaného rastu a bez pripisovania objednávok GSC.

## Kritériá úspechu

- Dokončená kontrola indexácie 6 nových lokalizovaných URL a náprava konkrétnych zistení.
- Dva odlišné odborné články, šesť jazykových verzií a šesť obrázkov.
- Zdokumentované obsahové/CTR zásahy s baseline a následným meraním; priorita SK a obchodne relevantné dopyty.
- Potvrdený stav Merchant Center a riešenie konkrétnych chýb. Rýchlosť indexácie ani konkrétne pozície nevieme garantovať.
