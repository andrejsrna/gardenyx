# GardenYX SEO changelog

Priebežný záznam SEO zmien, ich dôvodov a výsledkov v Google Search Console.

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

### 2026-08-05 — Článok: Hnojivo na zemiaky

- **Typ:** nový poradenský obsah
- **GSC vstup:** dopyt `hakofyt na zemiaky` mal 25 zobrazení, 1 kliknutie a pozíciu 9,72 v exporte z 2026-08-04. Presný článok pre tento intent pred publikovaním neexistoval.
- **URL:**
  - SK: `/sk/blog/hnojivo-na-zemiaky`
  - EN: `/en/blog/potato-fertilizer`
  - HU: `/hu/blog/burgonya-mutragya`
- **Obsah:** príprava pôdy, fázy rastu, NPK rovnováha, listová výživa, časté chyby a FAQ; 3 CDN obrázky; odkazy na Hakofyt Plus zelenina, zeleninovú landing page a NPK článok.
- **Commit alebo deploy:** doplniť po pushe.
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
