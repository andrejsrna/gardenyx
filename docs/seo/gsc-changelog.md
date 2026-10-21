# GardenYX SEO changelog

Priebežný záznam SEO zmien, ich dôvodov a výsledkov v Google Search Console.

**Aktuálny pracovný plán:** [`2026-10-action-plan.md`](./2026-10-action-plan.md) — októbrové priority a GSC baseline; september je archivovaný v `2026-09-action-plan.md`. Do tohto changelogu patria iba skutočne nasadené zmeny.

## Pravidlá zápisu

- Jeden zápis = jedna nasadená zmena alebo jeden obsahový balík.
- Ku každej URL pridať dátum kontroly v GSC až po 4–6 týždňoch.
- Nepísať domnienky ako výsledok. Použiť konkrétne clicks, impressions, CTR a pozíciu z exportu.
- Pri novej URL najprv evidovať `nasadené`; až po dátach doplniť `výsledok`.
- GSC export uložiť mimo repozitára, pokiaľ neobsahuje iba verejné agregované dáta.

## GSC baseline

| Obdobie | Kliknutia | Zobrazenia | CTR | Priemerná pozícia | Zdroj |
|---|---:|---:|---:|---:|---|
| 2026-07-01 až 2026-07-31 | 50 | 1 411 | 3,54 % | 10,86 | Denný graf GSC exportu z 2026-08-04 |
| Posledné 3 mesiace k 2026-08-04 | 103 | 2 980 | 3,46 % | 11,36 | GSC export: Web |

## Otvorené GSC príležitosti

| Priorita | Dopyt / URL | Stav v exporte 2026-08-04 | Ďalší krok | Skontrolovať |
|---|---|---|---|---|
| 1 | `hnojivo na zeleninu` | 38 zobrazení, 0 kliknutí, pozícia 15,55 | Upraviť snippet a pridať interné odkazy z článkov o paprike/paradajkách. | 2026-09-15 |
| 1 | `najlepšie hnojivo na zeleninu` | 35 zobrazení, 0 kliknutí, pozícia 10,46 | Posilniť intent na landing page a interné odkazy. | 2026-09-15 |
| 2 | `hakofyt hnojivo` | 22 zobrazení, 0 kliknutí, pozícia 8,18 | Otestovať title/meta Hakofyt hubu. | 2026-09-15 |
| 2 | `/en/flower-fertilizer` | 211 zobrazení, CTR 1,42 %, pozícia 14,64 | Upraviť EN title/meta a doplniť relevantné interné odkazy. | 2026-09-15 |
| Watch | články hortenzie/paprika | Publikované 2026-07-13 / 2026-07-22; júl je priskorý na vyhodnotenie. | Kontrola indexácie, impressions a dopytov. | 2026-09-15 |

## Zmeny

### 2026-10-21 — Článok: Citrusy v zime

- **Publikované v DB a overené na produkcii:** `/sk/blog/citrusy-v-zime`, `/en/blog/citrus-care-in-winter`, `/hu/blog/citrusfelek-teleltetese` — HTTP 200, vlastné canonical, vzájomné hreflang, indexovateľnosť a Article schema URL. DB read-back potvrdil všetky texty a metadata.
- **Obsah:** svetlé bezmrazové zimovisko, rozdiely druhov, zálievka podľa substrátu, zimná výživa podľa rastu/etikety, diagnostika opadu a škodcov, prechod von na jar, 4 FAQ v každom jazyku. Zdroj RHS; bez plošného zákazu zimného hnojenia či neoverených dávok. Odkazy na citrusovú landing page, existujúci článok o hnojení a Hakofyt hub v každom locale; všetkých 9 cieľov live HTTP 200.
- **Obrázky:** tri nové AI ilustrácie `gardenyx/articles/citrusy-v-zime/{citrusy-zimovanie-hero,kontrola-zalievky,kontrola-listov}-20261021.png`; vizuálna kontrola, CDN GET 200 image/png, na každej verzii presne tri rôzne obrázky.
- **Overenie a zdrojový kód:** produkčný build prešiel; existujúci lint blocker typescript-eslint/TS7 zostáva. `scripts/upsert-citrusy-v-zime-article.ts` odmieta prepísať už existujúci záznam. Obsahový commit `a0e3528` pushnutý na main, vzdialený ref overený. Lokálna sitemap po builde po DB publikovaní obsahuje všetky tri URL; živá sitemap HTTP 200 ich pri opakovanej kontrole ešte nemala — zostáva kontrola po deployi/cache refreshi. Google indexácia nepotvrdená.
- **GSC:** nová URL bez vlastnej baseline. Sezónny redakčný návrh, nie tvrdenie o objeme dopytov. Kontrola po 4–6 týždňoch v porovnateľných oknách; bez tvrdenia o raste alebo Google indexácii.

### 2026-10-21 — Zeleninová landing page: intent, výber a interné odkazy

- **Nasadené:** `/sk/hnojivo-na-zeleninu`, commit `a30086b`, Coolify finished a živé HTML HTTP 200 s novým title a obsahom.
- Title/meta spresnené pre generické hľadanie; výber podľa fázy rastu, rozlíšenie základnej a listovej výživy, dve FAQ s rovnakým obsahom vo FAQPage schema. Päť odkazov na existujúce články (zelenina, paradajky, paprika, zemiaky, pôda po zbere). EN/HU copy ponechané, URL/canonical/hreflang nemeníme.
- **Overenie:** produkčný build OK; lokálny produkčný HTTP test title/canonical/5 odkazov/6 FAQ schema a EN/HU izolácie OK; päť cieľových článkov live HTTP 200. Lint blokovaný existujúcou nekompatibilitou TS7/typescript-eslint.
- **Baseline:** dopyt `hnojivo na zeleninu` 99 zobrazení, 0 klikov, pozícia 14,72; URL 7 klikov/471 zobrazení, CTR 1,49 % za 30. 6. – 29. 9. 2026. Ide o starší agregovaný export, nie aktuálne 28-dňové okno pred zmenou. Získať porovnateľný export a výsledky vyhodnotiť po 4–6 týždňoch; rast zatiaľ netvrdiť.
- **Uzavretá staršia kontrola:** živá sitemap už obsahuje článok o pôde po zbere a živý blog má canonical pre kategóriu. Google indexácia tým nie je potvrdená.

### 2026-10-11 — Článok: Príprava pôdy po zbere

- **Nasadené v DB a live overené:** SK `/sk/blog/ako-pripravit-podu-po-zbere`, EN `/en/blog/prepare-soil-after-harvest`, HU `/hu/blog/talaj-elokeszitese-betakaritas-utan` — HTTP 200, vlastné canonical, vzájomné hreflang, každá stránka obsahuje tri obrazové prvky (cover + 2 v tele).
- **Obsah:** samostatný zámer prázdneho zeleninového záhona po zbere; zdravie pôdy, vyzretý kompost, mulč vs. zelené hnojenie, opatrnosť pri minerálnej výžive, checklist, FAQ a overené zdroje RHS. Neodporúča aplikovať listové hnojivo na prázdny záhon.
- **Obrázky:** tri nové originálne PNG na R2/CDN `gardenyx/articles/priprava-pody-po-zbere/`, každý GET 200 image/png a vizuálne kontrolovaný. Interné odkazy na zeleninovú landing page a článok, NPK a cesnak/cibuľu; všetky odkazy overené HTTP 200.
- **Meranie:** nová URL nebola v dodanom GSC exporte 30. 6. – 29. 9.; pre toto obdobie neuvádzať vymyslené čísla. Stav indexácie a dopyty skontrolovať o 4–6 týždňov cez URL Inspection a GSC. Živá sitemap zatiaľ nový článok neuvádza, lokálne generovaná áno; sledovať po nasadení/reštarte kódu.
- **Reprodukovateľnosť:** `scripts/upsert-priprava-pody-po-zbere-article.ts` (bez prepisu existujúceho článku). Build prešiel; lint má existujúci TS7/typescript-eslint blocker.

### 2026-10-11 — Jahodový článok: jesenná výživa

- URL: `/sk/blog/kedy-hnojit-jahody`. Rozšírené telo existujúceho článku, nie nová URL: jesenná odpoveď, raz/stále rodiace jahody a nádoby, rozhodovacia tabuľka, 2 FAQ a zdroj RHS.
- Produktové odkazy zachované, odporúčanie podľa reálnej potreby a etikety; zdravý záhon nemusí potrebovať ďalšiu dávku. Zachované metadata, publikovanie a EN/HU; backup a read-back DB aj živé HTML overené.
- GSC baseline: dopyt `cim hnojit jahody na jesen`, 23 zobrazení, 0 klikov, pozícia 9,70 za 30. 6. – 29. 9. 2026. Výsledky hodnotiť po 4–6 týždňoch, nie tvrdiť už teraz.
- Reprodukovateľný, idempotentný patch: `scripts/update-strawberry-autumn-seo.ts`, chránený proti súbežnej redakčnej zmene.

### 2026-09-17 — Článok: Ako hnojiť trávnik na jeseň

- **Nasadené:** odborný článok k sezónnemu dopytu a existujúcej landing page trávnikového hnojiva, publikovaný vo všetkých podporovaných lokalizáciách:
  - SK: `/sk/blog/ako-hnojit-travnik-na-jesen`
  - EN: `/en/blog/how-to-fertilize-lawn-in-autumn`
  - HU: `/hu/blog/oszi-gyeptragyazas`
- **Obsah:** rozdiel medzi jesennou a jarnou výživou, vhodné načasovanie, draslík vs. neskorý dusík, posledné kosenie, odstránenie lístia, plán pre 100 m², FAQ a overiteľné odborné zdroje.
- **Médiá:** tri originálne obrázky sú uložené na R2/CDN pod prefixom `gardenyx/articles/hnojenie-travnika-na-jesen/`.
- **Interné prepojenia:** landing page hnojiva na trávnik, Hakofyt Max tráva, NPK vysvetlenie, jarný článok o trávniku a Hakofyt hub.
- **Stav v GSC:** nasadené; bez tvrdenia o výsledkoch pred získaním dát. Indexáciu, impressions a dopyty skontrolovať po 4–6 týždňoch.

### 2026-09-06 — Článok: Hnojivo na cesnak a cibuľu na jeseň

- **Typ:** nový poradenský obsah (sezónny, jesenný)
- **GSC vstup:** september export 28 dní neobsahoval samostatný dopyt pre cesnak/cibuľu; téma zvolená ako sezónna príležitosť pred peakom hľadania (október výsadba). Jesenné hnojenie a príprava pôdy má vysokú praktickú hodnotu a nadväzuje na existujúce zeleninové články.
- **URL:**
  - SK: `/sk/blog/hnojivo-na-cesnak-a-cibulu`
  - EN: `/en/blog/garlic-and-onion-fertilizer-autumn`
  - HU: `/hu/blog/fokhagyma-es-hagyma-tragyazas-osszel`
- **Obsah:** jesenný základ s draslíkom/fosforom/sírou (NPK 5-15-30), termíny hnojenia pred sadením, rozdiel cesnak vs. cibuľa, pH a priepustnosť pôdy, postup pre 10 m², časté chyby (dusík na jeseň, premokrenie, čerstvý hnoj) a FAQ; SK/EN/HU lokalizácia a 3 CDN obrázky (OpenRouter gemini-2.5-flash-image → R2 `gardenyx/articles/hnojivo-na-cesnak/`).
- **Prepojenia:** hnojivo-na-zeleninu, Hakofyt Plus zelenina, NPK článok, paradajky/zemiaky, záhradný hub.
- **Commit alebo deploy:** `hnojivo-na-cesnak-a-cibulu`.
- **GSC výsledok:** nová URL; doplniť po 4–6 týždňoch.
- **Dátum ďalšej kontroly:** 2026-10-15.

### 2026-09-06 — Zeleninový cluster: interné prelinkovanie na hnojivo-na-zeleninu

- **Typ:** interné SEO
- **URL:** `/sk/hnojivo-na-zeleninu` + články `/sk/blog/hnojivo-na-paradajky`, `/sk/blog/hnojivo-na-papriku`, `/sk/blog/ako-hnojit-zeleninu`
- **GSC pred zmenou (7. 8. – 3. 9. 2026):** `/sk/hnojivo-na-zeleninu` 2 kliky, 145 zobrazení, CTR 1,38 %, pozícia 10,68. Dopyt `najlepšie hnojivo na zeleninu` 1 klik, 37 zobrazení, CTR 2,70 %, pozícia 5,81; `hnojivo na zeleninu` 0/34/18,56.
- **Zmena:** v článku `hnojivo-na-paradajky` opravené 3 nefunkčné/nesprávne SK interné odkazy (`/hnojivo-na-zeleninu` → `/sk/hnojivo-na-zeleninu`, `/produkt/...` → `/sk/produkt/...`, `/blog/...` → `/sk/blog/...`) aby posilnili zeleninový cluster; články paprika/zemiaky/ako-hnojit-zeleninu už obsahujú správne SK odkazy. Title/meta landing page ostáva po augustovej úprave bez zmeny — sleduje sa CTR.
- **Dôvod / hypotéza:** Dopyt `najlepšie hnojivo na zeleninu` sa po augustovej úprave dostal z 10,46 na 5,81, ale generický dopyt je stále na 18,56 a CTR zostáva nízke. Správne kontextové prelinkovanie má preniesť relevanciu z podporných článkov na cieľovú landing page.
- **Commit alebo deploy:** `4ce792a`.
- **GSC výsledok:** doplniť po 4–6 týždňoch.
- **Dátum ďalšej kontroly:** 2026-10-10.

### 2026-09-06 — EN hub + tomato článok: CTR audit

- **Typ:** snippet / interné SEO
- **URL:** `/en/fertilizer`, `/en/blog/tomato-fertilizer`
- **GSC pred zmenou (7. 8. – 3. 9. 2026):** `/en/blog/tomato-fertilizer` 1 klik, 269 zobrazení, CTR 0,37 %, pozícia 10,90; `/en/fertilizer` 1 klik, 211 zobrazení, CTR 0,47 %, pozícia 14,04 (GSC alert -81 % zobrazení). Top EN dopyty v exporte: `flower fertilizer` 8/14,62, `vegetable fertilizer` 7/10,43.
- **Zmena (diagnostika najprv):** skontrolované prekrývanie dopytov/krajín pre obe URL; pre `/en/blog/tomato-fertilizer` EN title/metaTitle/metaDescription/excerpt preformulované na `When to Fertilize Tomatoes` s dôrazom na timing/dosage; pre `/en/fertilizer` EN metaTitle/metaDescription sprístupnené ako „Choose by Plant“.
- **Dôvod / hypotéza:** Obe EN URL majú vysoké zobrazenia s veľmi nízkym CTR a pozíciou okolo 11–14. Presnejší, otázkovo-úžitkový snippet má zvýšiť relevanciu voči reálnym EN dopytom bez tvorby novej URL.
- **Commit alebo deploy:** `de53eba`.
- **GSC výsledok:** doplniť po 4–6 týždňoch.
- **Dátum ďalšej kontroly:** 2026-10-10.

### 2026-09-06 — Článok: Kedy hnojiť jahody — CTR a cluster

- **Typ:** snippet / interné SEO
- **URL:** `/sk/blog/kedy-hnojit-jahody` (SK primárne; EN/HU nezmenené)
- **GSC pred zmenou (7. 8. – 3. 9. 2026):** 3 kliknutia, 305 zobrazení, CTR 0,98 %, pozícia 8,23. Dopyty: `kedy hnojit jahody` 48 zobrazení/pozícia 5,98; `hnojivo na jahody po zbere` 39/8,74; `hnojenie jahôd` 28/11,89. GSC pri URL hlási +115 % zobrazení.
- **Zmena:** SK title/metaTitle/metaDescription/excerpt zacielené na `kedy hnojiť jahody` + `hnojivo na jahody po zbere`; doplnené kontextové odkazy na landing page `/sk/hnojivo-na-jahody` v úvode aj v sekcii „Čím hnojiť jahody“.
- **Dôvod / hypotéza:** Najväčšia SK príležitosť v 28-dňovom exporte s viditeľnosťou približne na 1. strane, ale s veľmi nízkym CTR. Presnejší snippet a jasnejšia cesta k transakčnej stránke majú zvýšiť preklik bez novej URL.
- **Commit alebo deploy:** `b088a52`.
- **GSC výsledok:** doplniť po 4–6 týždňoch.
- **Dátum ďalšej kontroly:** 2026-10-10.

### 2026-08-05 — Článok: Ako hnojiť citrusy

- **Typ:** poradenský obsah / long-tail podpora
- **URL:**
  - SK: `/sk/blog/ako-hnojit-citrusy`
  - EN: `/en/blog/how-to-fertilize-citrus`
  - HU: `/hu/blog/hogyan-tragyazzuk-a-citrusfeleket`
- **Obsah:** výber hnojiva na citrusy, mikroprvky (železo, zinok), sezónny plán hnojenia, listová výživa, časté chyby a FAQ; SK/EN/HU lokalizácia a 3 CDN obrázky.
- **Prepojenia:** Hakofyt B citrusy, citrusová landing page `/hnojivo-na-citrusy`, Hakofyt hub, NPK článok, hnojivový hub.
- **Stav:** publikované v DB 2026-08-05.
- **Commit alebo deploy:** `ccefbd4`.
- **GSC výsledok:** nová URL; doplniť po 4–6 týždňoch.
- **Dátum ďalšej kontroly:** 2026-09-15.

### 2026-08-05 — Landing page: Štartovacie hnojivo

- **Typ:** nová transakčná SEO landing page
- **Témy:** `štartovacie hnojivo`, `starter fertilizer`, `indító műtrágya`, hnojivo po výsadbe a na zakorenenie.
- **URL:**
  - SK: `/sk/startovacie-hnojivo`
  - EN: `/en/starter-fertilizer`
  - HU: `/hu/indito-mutragya`
- **Obsah:** SK/EN/HU lokalizácia, metadata, canonical, alternate hreflang, Product + FAQPage JSON-LD, prelinkovanie na produkt `Hakofyt Plus štartovacie hnojivo` a hnojivový hub.
- **Prepojenia:** doplnené do sitemap, `i18n/routing.ts`, `Header.tsx` (dropdown), `Footer.tsx` a use-case karty `/hnojivo`.
- **Commit alebo deploy:** `ad318bf`.
- **GSC výsledok:** nová URL; doplniť po 4–6 týždňoch.
- **Dátum ďalšej kontroly:** 2026-09-15.

### 2026-06-30 — Článok: Hnojivo na čučoriedky

- **Typ:** poradenský obsah / long-tail podpora
- **URL:**
  - SK: `/sk/blog/hnojivo-na-cucoriedky`
  - EN: `/en/blog/blueberry-fertilizer`
  - HU: `/hu/blog/afonya-mutragya`
- **Obsah:** kyslá pôda a pH, sezónny plán hnojenia, dávkovanie tekutého hnojiva, časté chyby a FAQ; SK/EN/HU lokalizácia a 3 CDN obrázky.
- **Prepojenia:** Hakofyt B čučoriedky, Hakofyt hub, všeobecný hnojivový hub, články o jahodách, zelenine a NPK.
- **Stav:** publikované v DB 2026-06-30; seed aktualizovaný tak, aby reprodukoval publikovanú verziu.
- **Commit alebo deploy:** `925643c`.
- **GSC výsledok:** doplniť po ďalšom exporte.
- **Dátum ďalšej kontroly:** 2026-09-15.

### 2026-08-05 — Jahodový cluster: hub a produktové prepojenie

- **Typ:** interné SEO
- **URL:** `/sk/hnojivo`, `/sk/produkt/hakofyt-b-jahody` a localized EN/HU varianty.
- **Zmena:** hlavný hnojivový hub má novú use-case kartu pre jahody; detail produktu Hakofyt B jahody má kontextový odkaz na poradenskú landing page.
- **Dôvod / hypotéza:** nová landing page potrebuje kontextové odkazy z hlavného hubu aj priamo z transakčného produktu, aby Google aj návštevník videli jeden súvislý intentový cluster.
- **Commit alebo deploy:** `bddd947`.
- **GSC výsledok:** nová URL; doplniť po 4–6 týždňoch.
- **Dátum ďalšej kontroly:** 2026-09-15.

### 2026-08-05 — EN flower fertilizer: snippet a hydrangea prepojenie

- **Typ:** snippet / interné SEO
- **URL:** `/en/flower-fertilizer`
- **GSC pred zmenou:** 211 zobrazení, CTR 1,42 %, priemerná pozícia 14,64.
- **Zmena:** EN title a meta description teraz cielia na hydrangeas, balcony plants a flower beds; pridaný interný odkaz na existujúci EN článok o hnojení hortenzií.
- **Dôvod / hypotéza:** URL má najväčší organický objem s nízkym CTR. Konkrétnejší snippet a relevantné obsahové prepojenie majú zvýšiť relevanciu bez novej URL.
- **Commit alebo deploy:** `7b01333`.
- **GSC výsledok:** doplniť po 4–6 týždňoch.
- **Dátum ďalšej kontroly:** 2026-09-15.

### 2026-08-05 — Hakofyt hub: snippet a interné prepojenia

- **Typ:** snippet / interné SEO
- **URL:** `/sk/hnojiva-hakofyt`
- **GSC pred zmenou:** dopyt `hakofyt hnojivo` — 22 zobrazení, 0 kliknutí, priemerná pozícia 8,18.
- **Zmena:** nový title a meta description cielia na Hakofyt Plus, B a Max; hero jasne rozlišuje použitie podľa rastliny; hub priamo odkazuje na landing pages pre jahody, citrusy a čučoriedky v SK/EN/HU.
- **Dôvod / hypotéza:** prvostránkový brandovo-produktový dopyt bez kliknutí. Presnejší snippet a kvalitnejšie cesty k produktovým intentom majú zvýšiť CTR a posilniť relevantné landing pages.
- **Commit alebo deploy:** `de64339`.
- **GSC výsledok:** doplniť po 4–6 týždňoch.
- **Dátum ďalšej kontroly:** 2026-09-15.

### 2026-08-05 — Landing page: Hnojivo na jahody

- **Typ:** nová transakčná SEO landing page
- **Témy:** `hnojivo na jahody`, `eper műtrágya`, `strawberry fertilizer`, Hakofyt B jahody.
- **URL:**
  - SK: `/sk/hnojivo-na-jahody`
  - EN: `/en/strawberry-fertilizer`
  - HU: `/hu/eper-mutragya`
- **Obsah:** SK/EN/HU lokalizácia, metadata, canonical, alternate hreflang, Product + FAQPage JSON-LD schema, prelinkovanie na Hakofyt hub, produkt `Hakofyt B jahody` a poradenský článok `kedy-hnojit-jahody`.
- **Prepojenia:** doplnené do sitemap, `i18n/routing.ts`, `Header.tsx` a `Footer.tsx`.
- **Commit alebo deploy:** `ffaac1b`.
- **Dátum ďalšej kontroly:** 2026-09-15.

### 2026-08-05 — Článok: Hnojivo na zemiaky

- **Typ:** nový poradenský obsah
- **GSC vstup:** dopyt `hakofyt na zemiaky` mal 25 zobrazení, 1 kliknutie a pozíciu 9,72 v exporte z 2026-08-04. Presný článok pre tento intent pred publikovaním neexistoval.
- **URL:**
  - SK: `/sk/blog/hnojivo-na-zemiaky`
  - EN: `/en/blog/potato-fertilizer`
  - HU: `/hu/blog/burgonya-mutragya`
- **Obsah:** príprava pôdy, fázy rastu, NPK rovnováha, listová výživa, časté chyby a FAQ; 3 CDN obrázky; odkazy na Hakofyt Plus zelenina, zeleninovú landing page a NPK článok.
- **Commit alebo deploy:** `835f2f7`.
- **GSC výsledok:** doplniť po 4–6 týždňoch.
- **Dátum ďalšej kontroly:** 2026-09-15.

### 2026-08-04 — Snippet a intent: Hnojivo na zeleninu

- **Typ:** snippet / obsah / interné SEO
- **URL:** `/sk/hnojivo-na-zeleninu`
- **GSC pred zmenou:** URL: 14 kliknutí, 384 zobrazení, pozícia 9,54 (3-mesačný export). Dopyty `hnojivo na zeleninu`: 38 zobrazení, 0 kliknutí, pozícia 15,55; `najlepšie hnojivo na zeleninu`: 35 zobrazení, 0 kliknutí, pozícia 10,46.
- **Zmena:** title a meta description cielia na `najlepšie hnojivo na zeleninu`; pridaná SK sekcia výberu podľa fázy rastu; existujúci paprikový článok už odkazuje na landing page.
- **Dôvod / hypotéza:** URL má viditeľnosť na druhej polovici prvej/druhej strane, ale neberie kliknutia. Presnejší snippet a rozhodovací obsah majú zvýšiť relevanciu a CTR bez zmeny URL.
- **Commit alebo deploy:** `dcb7c0b`.
- **GSC výsledok:** doplniť po 4–6 týždňoch.
- **Dátum ďalšej kontroly:** 2026-09-15.

### 2026-07-27 — Bezpečný preview článkov

- **Typ:** technické SEO / redakčný workflow
- **Zmena:** Preview draftov a aktualizácií článkov cez HMAC token viazaný na aktuálnu uloženú verziu.
- **Súbory:** `app/lib/preview.ts`, `app/[locale]/blog/[slug]/page.tsx`, `proxy.ts`, admin článkov.
- **SEO ochrana:** bez tokenu draft vracia 404; preview má `noindex, nofollow`; neobsahuje Article JSON-LD.
- **URL:** všetky `/{locale}/blog/[slug]` preview URL.
- **Stav:** nasadené v commite `d636b5b`.
- **Výsledok:** nevyžaduje GSC meranie; preventívna ochrana proti indexácii konceptov.

### 2026-07-22 — Článok: Hnojivo na papriku

- **Typ:** nový poradenský obsah
- **Témy:** `hnojivo na papriku`, `hnojenie papriky`, výživa počas rastu/plodenia.
- **URL:**
  - SK: `/sk/blog/hnojivo-na-papriku`
  - EN: `/en/blog/pepper-fertilizer`
  - HU: `/hu/blog/paprika-mutragya`
- **Obsah:** SK/EN/HU preklad, lokalizované slugy, 3 CDN obrázky, SEO meta a interné obsahové prepojenie.
- **Stav:** publikované v commite `dff24f1`.
- **GSC výsledok:** čakať na samostatné dáta po indexácii.
- **Kontrola:** 2026-09-15.

### 2026-07-13 — Článok: Hnojivo na hortenzie

- **Typ:** nový poradenský obsah
- **Témy:** `hnojivo na hortenzie`, pH pôdy, farba hortenzií.
- **URL:** lokalizované SK/EN/HU blog URL.
- **Obsah:** SK/EN/HU preklad, SEO meta, 3 CDN obrázky.
- **Stav:** publikované v commite `6086189`.
- **GSC výsledok:** čakať na samostatné dáta po indexácii.
- **Kontrola:** 2026-09-15.

### 2026-07-06 — Týždenný newsletter digest

- **Typ:** distribúcia obsahu
- **Zmena:** automatický digest nových blog článkov v SK/EN/HU; najviac 3 články, locale podľa odberateľa, bez odoslania pri nulovom počte článkov.
- **Súbory:** `app/api/cron/newsletter-weekly/route.ts`, `app/lib/email/newsletter-digest.ts`.
- **Stav:** nasadené v commite `445b048`; následné opravy email template v júli.
- **Meranie:** kliknutia v Brevo; GSC hodnotiť nepriamo cez návštevnosť a indexáciu nových URL.

### 2026-06-27 — Landing page: Hnojivo na citrusy

- **Typ:** nová long-tail landing page a interné prelinkovanie
- **Témy:** `hnojivo na citrusy`, Hakofyt citrusy.
- **Zmena:** landing page, routing, sitemap, menu a footer odkazy v SK/EN/HU.
- **Stav:** nasadené v júni 2026.
- **Kontrola:** indexácia URL, impressions a CTR pri citrusových dopytoch.

### 2026-06-24 — Product schema identifikátory

- **Typ:** produktové structured data
- **Zmena:** doplnené offers a identifikátory na listingových stránkach hnojív.
- **Cieľ:** znížiť GSC upozornenia a podporiť produktové snippets.
- **Kontrola:** Merchant listings / product snippets v Google Search Console.

### 2026-06-12 až 2026-06-16 — Canonical URL a lokalizované články

- **Typ:** technické SEO / internacionalizácia
- **Zmena:** lokalizované canonical URL, hreflang/sitemap zladenie a správne localized slugy článkov pri language switcheri.
- **Cieľ:** eliminovať duplicitné jazykové URL a správne priradiť SK/EN/HU varianty.
- **Kontrola:** indexácia lokalizovaných URL a hreflang chyby v GSC.

## Overený výkon: 3-mesačný kontext k 2026-08-04

| Segment | Kliknutia | Zobrazenia | CTR | Pozícia | Poznámka |
|---|---:|---:|---:|---:|---|
| Slovensko | 68 | 1 502 | 4,53 % | 8,65 | Primárny trh, priemer na prvej strane. |
| Česko | 15 | 77 | 19,48 % | 6,75 | Nízky objem, vysoká relevancia pri zobrazení. |
| Mobil | 77 | 1 677 | 4,59 % | 7,84 | Najsilnejší organický segment. |
| Desktop | 25 | 1 238 | 2,02 % | 16,31 | Najväčší priestor na snippet a obsahové zlepšenie. |

## Šablóna nového zápisu

```md
### YYYY-MM-DD — Názov zmeny

- **Typ:** obsah / technické SEO / schema / interné linky / snippet / distribúcia
- **URL alebo dopyt:**
- **Zmena:**
- **Dôvod / hypotéza:**
- **Commit alebo deploy:**
- **GSC pred zmenou:** clicks, impressions, CTR, pozícia; alebo `nová URL`.
- **GSC výsledok:** doplniť po 4–6 týždňoch.
- **Dátum ďalšej kontroly:**
```

## Mesačný workflow

1. Exportovať GSC: Web, posledné 3 mesiace, denné dáta + dopyty + stránky + zariadenia.
2. Doplniť nový riadok do **GSC baseline**.
3. Pri každej otvorenej priorite zapísať výsledok alebo nový experiment.
4. Do reportu uvádzať iba čísla s jasným obdobím a zdrojom.
5. Nové SEO zmeny zapísať sem pri merge/deployi, nie až pri mesačnom reporte.
