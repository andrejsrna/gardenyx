# GardenYX — SEO plán na október 2026

**Stav:** rozpracované; časť vykonaná, technické nasadenie čaká. Pripravené 2. 10. 2026.

## Podklady pre mesačný klientsky reporting — 11. 10. 2026

- **Hotové na produkcii:** jesenná sekcia jahodového článku `/sk/blog/kedy-hnojit-jahody`, rozhodovacia tabuľka, 2 FAQ, odborný zdroj RHS; DB backup, read-back a HTTP 200 s novým obsahom overené. Kód reprodukovateľnej aktualizácie v commite `d99034a`.
- **Audit hotový:** 6 septembrových jazykových URL článkov cesnak/cibuľa a jesenný trávnik má správne canonical/hreflang/robots/schema URL a sitemap. Toto nie je potvrdenie indexácie Google; URL Inspection zostáva otvorené.
- **Pripravené, nie potvrdené na produkcii:** opravy blogových canonical/hreflang, normalizácie stránkovania a priechodu parametra `cat` v proxy. Commit `d99034a` pushnutý na main; produkčný build a 27 lokálnych kontrol metadata/schema pre SK/EN/HU úspešné.
- **Blokátor nasadenia pri poslednej kontrole:** Coolify DB recovery režim; log `No space left on device`. Živý blog vtedy stále nemal canonical a používal starú verziu. Pred mesačným reportom overiť aktuálny deploy/live HTML, neuvádzať samotný push ako nasadenie.
- **Lint:** existujúca nekompatibilita typescript-eslint s TypeScript 7; lint neprešiel, produkčný build prešiel.
- **Ďalej:** bezpečné uvoľnenie disku a dokončenie deployu; potom zeleninová landing page. Účinok SEO zatiaľ nemeraný, baseline z exportu 30. 6. – 29. 9. 2026; následné výsledky až z porovnateľných okien.

Klientsky reporting je mesačný. Po každej SEO práci doplniť stav, presné URL, dátum, commit, overenia a blokátory; nasadené zmeny patria do changelogu, čakajúce do plánu.
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
- [x] Zelenina — **21. 10. nasadené a live overené**, commit `a30086b`: SK title/meta pre generický intent, výber pred výsadbou/počas rastu/pri plodení, rozlíšenie pôdnej a listovej výživy, dve nové FAQ (aj v schema) a päť odkazov na zeleninové články vrátane prípravy pôdy po zbere. Build OK; lokálny produkčný HTTP test title/canonical/5 odkazov/6 FAQ a EN/HU bez SK sekcie prešiel; cieľové články live HTTP 200. Lint naďalej existujúci TS7/typescript-eslint blocker. Push na main úspešný; Coolify finished, živé HTML obsahuje nový title aj blok návodov. Baseline `hnojivo na zeleninu`: 99 zobrazení, 0 klikov, pozícia 14,72; URL 7 klikov/471 zobrazení, CTR 1,49 % (30. 6. – 29. 9. 2026). Výsledky vyhodnotiť až v porovnateľných 28-dňových oknách po nasadení.
- [ ] EN: prioritne analyzovať `/en/blog/tomato-fertilizer` (3/624, CTR 0,48 %, pozícia 10,50), `/en/fertilizer` (2/455, CTR 0,44 %) a `/en/vegetable-fertilizer` (0/192, pozícia 11,41). Ďalšie kandidáty `/en/lawn-fertilizer` (1/163, pozícia 7,48) a `/en/hakofyt-fertilizers` (1/170, pozícia 7,71). Title/meta upraviť až podľa konkrétnych dopytov a krajín, nie naslepo. Neoptimalizovať predajné copy pre krajiny, kam obchod nedoručuje.

## Týždne 2–4 — obsahový záväzok

- [x] Článok 1 (11. 10., DB live): **Ako pripraviť pôdu po zbere na ďalšiu sezónu: kompost, mulč a najčastejšie chyby.** Odlišný intent (prázdny záhon po zbere) oproti živinám pestovanej zeleniny, NPK a jesennej výsadbe cesnaku. Publikované `/sk/blog/ako-pripravit-podu-po-zbere`, `/en/blog/prepare-soil-after-harvest`, `/hu/blog/talaj-elokeszitese-betakaritas-utan`; 3 vlastné obrázky R2 `gardenyx/articles/priprava-pody-po-zbere/`, vizuálne aj GET `200 image/png` overené. Reprodukovateľný skript `scripts/upsert-priprava-pody-po-zbere-article.ts`, interné odkazy na zeleninový hub, NPK, cesnak/cibuľu, sezónnu zeleninu, odborné zdroje RHS, FAQ. Build OK, repo lint naďalej zlyháva pre TS7/typescript-eslint. Články + interné URL na produkcii HTTP 200, canonical/hreflang a 3 obrázky na každom locale overené; živá sitemap zatiaľ nový záznam neobsahuje (lokálne /sitemap.xml áno) — sledovať po nasadení/reštarte. Sezónny redakčný návrh, nie doložený objem vyhľadávania.
- [x] Článok 2 — **21. 10. publikované a live overené:** Citrusy v zime: svetlo, zálievka a kedy obmedziť hnojenie. SK `/sk/blog/citrusy-v-zime`, EN `/en/blog/citrus-care-in-winter`, HU `/hu/blog/citrusfelek-teleltetese`; 3 nové AI obrázky na R2 `gardenyx/articles/citrusy-v-zime/`, vizuálne a CDN GET 200 image/png overené. HTTP 200, vlastné canonical, vzájomné hreflang, Article schema a presne tri obrázky v každej jazykovej verzii; všetkých 9 interných cieľov HTTP 200. Zdroj RHS, 4 FAQ na locale, zimovanie odlíšené od celoročného hnojivového intentu. Výživa podľa rastu a etikety, nie automatické letné dávky ani plošný zákaz zimného hnojenia. Build OK, lint má existujúci TS7 blocker. Reprodukovateľný skript `scripts/upsert-citrusy-v-zime-article.ts`, DB read-back OK. Obsahový commit `a0e3528` pushnutý na main. Lokálna sitemap po builde vykonanom po DB publikovaní obsahuje všetky tri URL; živá sitemap pri opakovanej kontrole nové URL ešte nemá — zostáva otvorená kontrola po deployi/cache refreshi. Téma je sezónny návrh, nie doložený objem vyhľadávania; nová URL nemá vlastný GSC baseline. Existujúca SK citrusová landing page: 3 kliky/143 zobrazení, pozícia 6,37 za 30. 6. – 29. 9. 2026. Vyhodnotiť po 4–6 týždňoch v porovnateľných oknách.
- [ ] Každý schválený článok: SK/EN/HU, 3 vlastné obrázky na CDN, praktické FAQ, overené zdroje, odkazy na existujúci hub/produkt, kontrola URL a sitemap. Produktové odporúčania podriadiť sezóne a etikete, nie marketingu.

## Týždeň 4 — vyhodnotenie

- [ ] Zmerať 28-dňové výsledky pred a po zmene na rovnakých URL/dopytoch. Reportovať clicks, impressions, CTR a pozíciu so správnym rozsahom.
- [ ] Overiť produktové structured data, feedové ceny/dostupnosť/dopravu oproti checkoutu a diagnostiku zamietnutých produktov. Neprehlasovať feed za aktivovaný bez Merchant Center dôkazov.
- [ ] Klientsky report: realizované vs. plánované úlohy, bez garantovaného rastu a bez pripisovania objednávok GSC.

## Overenie otvorených bodov — 21. 10. 2026

- Živá `/sitemap.xml` už obsahuje článok `ako-pripravit-podu-po-zbere` (HTTP 200); predchádzajúci bod chýbajúcej sitemap je vyriešený.
- Živý blog `?cat=vegetables` vracia HTTP 200 a správny canonical vrátane kategórie; predchádzajúca oprava metadát/transportu kategórie je viditeľná na produkcii.
- Coolify deploy `a30086b` dokončený (`finished`); živé HTML potvrdzuje nový title a obsah zeleninovej landing page.

## Kritériá úspechu

- Dokončená kontrola indexácie 6 nových lokalizovaných URL a náprava konkrétnych zistení.
- Dva odlišné odborné články, šesť jazykových verzií a šesť obrázkov.
- Zdokumentované obsahové/CTR zásahy s baseline a následným meraním; priorita SK a obchodne relevantné dopyty.
- Potvrdený stav Merchant Center a riešenie konkrétnych chýb. Rýchlosť indexácie ani konkrétne pozície nevieme garantovať.
