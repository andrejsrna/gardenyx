# GardenYX — diagnostika GSC exportov z 21. 10. 2026

## Rozsah a obmedzenia

Analyzované tri ZIP prílohy: Coverage, Product snippets a Performance-on-Search. CSV načítané priamo z archívov cez utf-8-sig. Export Coverage je súhrnný, nie drilldown: neobsahuje zoznam konkrétnych URL ani detail chyby sitemap. Nenájdené udalosti v Cloudflare/Coolify podľa používateľa nie sú dôkazom, že Google nikdy nebol blokovaný.

## Indexácia

Posledný stav grafu **12. 10. 2026**: 67 indexovaných, 90 neindexovaných stránok. Nie je to stav k dátumu názvu archívu.

| Dôvod | Počet | Interpretácia |
|---|---:|---|
| Stránka s presmerovaním | 47 | Môžu to byť správne staré/alternatívne URL; neopravovať naslepo. |
| Vylúčená značkou noindex | 22 | Môžu byť zámerne vylúčené administratívne či transakčné stránky; potrebný zoznam. |
| Nenájdené (404) | 6 | Vyžiadať URL; relevantné staré adresy mapovať na vhodné živé náhrady, nie hromadne na homepage. |
| Duplikát bez používateľskej canonical | 1 | Potrebná konkrétna URL a live HTML. |
| Prehľadané, momentálne neindexované | 13 | Nie automaticky technická chyba; pozrieť URL, obsah a interné odkazy. |
| Google vybral inú canonical | 1 | Porovnať deklarovanú a Google canonical cez URL Inspection. |
| Blokovaná robots.txt | 0 | Súhrnný stav exportu, nie dôkaz aktuálnej dostupnosti sitemap. |

Nový citrusový článok publikovaný 21. 10. sa týmto historickým coverage grafom nedá hodnotiť.

## Produktové úryvky

Posledný stav **19. 10. 2026**: 0 neplatných, 34 platných položiek. Prázdna tabuľka závažných chýb. Voliteľné upozornenia: chýbajúce aggregateRating (34) a review (34). Môžu sa týkať rovnakých položiek, nesčítať ich na počet chybných produktov. Nevymýšľať recenzie ani hodnotenia. Export Product snippets nie je Merchant Center diagnostika a nepotvrdzuje schválenie produktového feedu.

## Výkon

Filter: Web (textové), Posledné 3 mesiace. Skutočný denný rozsah **19. 7. – 18. 10. 2026**: 112 kliknutí, 5 566 zobrazení, vypočítané CTR 2,01 %. Vážený priemer zaokrúhlených denných pozícií približne 11,41. Nie je porovnateľný celkovými súčtami so starším exportom 30. 6. – 29. 9.

Rovnaké denné okná v tomto exporte: 1.–29. august 22 kliknutí/1 861 zobrazení; 1.–29. september 46/1 652. Nepripisovať tento rozdiel príčinám bez ďalšieho dôkazu ani čerstvým zmenám z 21. 10.

Prioritné URL za celé nové obdobie:

- SK jahodový článok: 25 kliknutí/1 081 zobrazení, CTR 2,31 %, pozícia 7,25.
- EN tomato-fertilizer: 3/833, CTR 0,36 %, pozícia 10,70.
- EN fertilizer: 3/592, CTR 0,51 %, pozícia 15,47.
- SK hnojivo-na-zeleninu: 6/401, CTR 1,50 %, pozícia 9,83.
- Dopyt hnojivo na zeleninu: 0/97, pozícia 13,71; najlepšie hnojivo na zeleninu: 5/101, pozícia 6,51. Samostatné tabuľky dopytov a stránok nepreukazujú presnú query→URL väzbu.

Country tabuľka je pre celý web, nie len EN. Na cielenie EN vyžiadať samostatný export s filtrom /en/ a relevantnými krajinami.

## Záver k sitemap a ďalší postup

Tieto prílohy **nepreukazujú chybu formátu sitemap ani príčinu hlásenia Nedá sa načítať**. Predchádzajúci live audit potvrdil HTTP 200, 46 unikátnych URL s odpoveďou 200, syntakticky platné XML a oddelenú kontrolu základnej schémy/hreflang rozšírení. Nový citrusový článok už v sitemap bol. Štandardná XSD bez deklarácií hreflang rozšírení sama osebe nie je vhodným testom celého rozšíreného dokumentu.

Ďalšie potrebné vstupy: GSC Indexovanie → Stránky → Nenájdené (404) → Export; potom samostatné exporty oboch canonical kategórií a podľa potreby noindex. Detail sitemap (presná URL, posledné čítanie) alebo URL Inspection sitemap/live test môžu pomôcť s dostupnosťou, ale nemajú sa zamieňať s indexáciou XML dokumentu. Žiadne produkčné zmeny vykonané iba na základe týchto súhrnných počtov.
