# GardenYX SEO plan

_Vypracovane na zaklade aktualneho projektu `gardenyx-nextjs`, existujucich SEO podkladov `gardenyx-struktura-webu.html` a `gardenyx-seo-cenova-ponuka.html`, aktualnej URL struktury, sitemap, i18n routingu a sortimentu v `content/products`._

## 1. Strategicky ciel

GardenYX by mal v organike posilnit hlavne temu **hnojiva, listove hnojiva, NPK hnojiva a vyziva rastlin**. Projekt uz ma dobry zaklad: samostatny Hakofyt hub, landing page pre travnik, landing page pre ovocne stromy, produktove stranky, blog cez DB a schema komponenty.

Cielom planu nie je vyrabat desiatky slabych URL, ale systematicky vybudovat tematicku autoritu okolo maleho sortimentu:

- zachytit transakcny dopyt typu `hnojivo na travnik`, `hnojivo na ovocne stromy`, `hnojivo na kvety`, `hnojivo na zeleninu`,
- pokryt edukacny dopyt typu `kedy hnojit travnik`, `ako davkovat hnojivo`, `NPK hnojivo`, `organicke vs mineralne hnojivo`,
- prepojit kazdy poradensky clanok na konkretny produkt alebo landing page,
- udrzat vsetky nove SEO stranky lokalizovane pre SK, EN a HU, pretoze routing projektu s tym uz pocita.

## 2. Aktualny stav projektu

### Hotove SEO zaklady

- `app/[locale]/hnojiva-hakofyt/page.tsx` - silny hub pre Hakofyt ako organicke NPK hnojivo.
- `app/[locale]/hnojivo-na-travnik/page.tsx` - hotova landing page pre `Hakofyt Max trava`.
- `app/[locale]/hnojivo-na-ovocne-stromy/page.tsx` - hotova landing page pre `Hakofyt Plus na ovocne dreviny`.
- `i18n/routing.ts` - lokalizovane routy pre SK/EN/HU.
- `app/sitemap.ts` - staticke SEO stranky, produkty a publikovane clanky su v sitemap.
- `app/robots.ts` - zakladne blokovanie admin/api/checkout casti.
- `app/components/seo/*` - pripravene schema komponenty pre Article, Product, FAQ, CollectionPage, Organization a WebSite.
- `scripts/upsert-dusikate-vapno-article.ts` - pripraveny obsahovy clanok o dusikatom vapne v SK/EN/HU.

### Sortiment, z ktoreho ma SEO vychadzat

Hlavne obchodne SEO jadro:

- `hakofyt-max-trava` - travnik, vysoka potreba dusika, zelena farba, mach.
- `hakofyt-plus-na-ovocne-dreviny` - ovocne stromy, uroda, kvitnutie, kvalita plodov.
- `hakofyt-plus-zelenina` - zelenina, paradajky, uhorky, zemiaky, bylinky.
- `hakofyt-plus-startovacie-hnojivo` - sadenice, korene, start rastu.
- `hakofyt-b-kvety` - kvety, hortenzie, levandule, balkonove rastliny.
- `hakofyt-b-cucoriedky`, `hakofyt-b-jahody`, `hakofyt-b-citrusy` - specializovane pestovanie.
- `hakofyt-b-okrasne-dreviny` - okrasne dreviny, ihlicnany, tuje, chlorofyl.
- `bofix` - burina v travniku, herbicidny dopyt.
- `mospilan-20-sp` - ochrana rastlin, skodcovia.

## 3. URL mapa a priority

### Priorita A - najskor implementovat alebo dotiahnut

| URL | Stav | Primarne KW | Produktovy ciel | Akcia |
| --- | --- | --- | --- | --- |
| `/hnojivo-na-travnik/` | hotove | hnojivo na travnik, hnojivo na travu, jarne hnojivo na travu | Hakofyt Max trava | Doplnit interny clanok, opravit drobne copy chyby, sledovat CTR. |
| `/hnojivo-na-ovocne-stromy/` | hotove | hnojivo na ovocne stromy, kedy hnojit ovocne stromy | Hakofyt Plus ovocne dreviny | Doplnit clanok a porovnanie jar/leto/jesen. |
| `/hnojiva-hakofyt/` | hotove | Hakofyt, organicke NPK hnojivo, listove hnojivo | cely Hakofyt rad | Pouzit ako hlavny hub a interne prelinkovat vsetky nove landing pages. |
| `/hnojivo/` | chyba | hnojivo, zahradne hnojivo, NPK hnojivo | vsetky hnojiva | Vytvorit hlavnu kategoriu/hub pre hnojiva. |
| `/organicke-hnojivo/` | chyba | organicke hnojivo, prirodne hnojivo | Hakofyt rad | Vytvorit edukacno-predajnu landing page. |
| `/npk-hnojivo/` | chyba | NPK hnojivo, hnojivo NPK, co znamena NPK | Hakofyt rad | Vytvorit landing page alebo silny poradensky hub. |

### Priorita B - druha vlna

| URL | Stav | Primarne KW | Produktovy ciel | Akcia |
| --- | --- | --- | --- | --- |
| `/hnojivo-na-zeleninu/` | chyba | hnojivo na zeleninu, hnojivo na paradajky, hnojivo na uhorky | Hakofyt Plus zelenina | Vytvorit landing page + FAQ davkovanie. |
| `/hnojivo-na-kvety/` | chyba | hnojivo na kvety, hnojivo na hortenzie, hnojivo na levandule | Hakofyt B kvety | Vytvorit landing page, neskor clanky pre hortenzie/levandule. |
| `/startovacie-hnojivo/` | chyba | startovacie hnojivo, hnojivo na sadenice | Hakofyt Plus startovacie | Vytvorit pred sezonou vysadby. |
| `/hnojivo-na-cucoriedky/` | chyba | hnojivo na cucoriedky, hnojivo pre kyslomilne rastliny | Hakofyt B cucoriedky | Rychla long-tail stranka. |
| `/hnojivo-na-jahody/` | chyba | hnojivo na jahody | Hakofyt B jahody | Rychla long-tail stranka. |
| `/hnojivo-na-citrusy/` | chyba | hnojivo na citrusy | Hakofyt B citrusy | Long-tail + indoor/exoticke rastliny. |

### Priorita C - doplnkove obchodne temy

| URL | Stav | Primarne KW | Produktovy ciel | Akcia |
| --- | --- | --- | --- | --- |
| `/hnojivo-na-ihlicnany/` | chyba | hnojivo na ihlicnany, hnojivo na tuje | Hakofyt B okrasne dreviny | Vytvorit po kvetoch a zelenine. |
| `/burina-v-travniku/` | chyba | burina v travniku, postrek na burinu v travniku | Bofix | Vytvorit prakticku landing page. |
| `/postrek-na-skodcov/` | chyba | postrek na skodcov, mospilan | Mospilan 20 SP | Vytvorit az po prevereni regulatory/copy claimov. |

## 4. Obsahovy plan pre poradnu

Blog ma fungovat ako podpora predaja. Kazdy clanok musi mat jasny interny odkaz na landing page alebo produkt.

### Prvych 12 clankov

| Poradie | Slug | Téma | Interny odkaz |
| --- | --- | --- | --- |
| 1 | `/blog/ako-a-kedy-hnojit-travnik-na-jar/` | Ako a kedy hnojit travnik na jar | `/hnojivo-na-travnik/` + `hakofyt-max-trava` |
| 2 | `/blog/dusikate-vapno/` | Dusikate vapno: pouzitie, davkovanie, rizika | `/hnojivo-na-travnik/`, `/hnojivo-na-zeleninu/`, `/kupit/` |
| 3 | `/blog/npk-hnojivo-co-znamena/` | NPK hnojivo: co znamenaju cisla na obale | `/hnojiva-hakofyt/`, `/npk-hnojivo/` |
| 4 | `/blog/organicke-vs-mineralne-hnojivo/` | Organicke vs mineralne hnojivo | `/organicke-hnojivo/`, `/hnojiva-hakofyt/` |
| 5 | `/blog/hnojivo-na-paradajky/` | Hnojivo na paradajky: kedy a ako davkovat | `/hnojivo-na-zeleninu/`, `hakofyt-plus-zelenina` |
| 6 | `/blog/kedy-hnojit-ovocne-stromy/` | Kedy a ako hnojit ovocne stromy | `/hnojivo-na-ovocne-stromy/` |
| 7 | `/blog/hnojivo-na-hortenzie/` | Hnojivo na hortenzie a kyslomilne rastliny | `/hnojivo-na-kvety/`, `hakofyt-b-kvety` |
| 8 | `/blog/hnojivo-na-cucoriedky/` | Ako hnojit cucoriedky bez zmeny pH | `/hnojivo-na-cucoriedky/` |
| 9 | `/blog/startovacie-hnojivo-na-sadenice/` | Startovacie hnojivo pre sadenice | `/startovacie-hnojivo/` |
| 10 | `/blog/listove-hnojivo-vs-granulovane/` | Listove hnojivo vs granulovane hnojivo | `/hnojiva-hakofyt/` |
| 11 | `/blog/burina-v-travniku/` | Ako odstranit burinu z travnika | `/burina-v-travniku/`, `bofix` |
| 12 | `/blog/ako-davkovat-hnojivo/` | Ako spravne davkovat hnojivo a comu sa vyhnut | vsetky hlavne hnojivove landing pages |

### Mesacny rytmus

- 1 nova landing page alebo vacsia optimalizacia existujucej stranky.
- 2 poradenske clanky mesacne.
- 1 refresh existujucej produktovej stranky alebo FAQ bloku.
- 1 technicka kontrola indexacie, sitemap, canonical a internych odkazov.

## 5. On-page sablona pre nove landing pages

Kazda nova SEO landing page by mala mat tuto strukturu:

1. `generateMetadata` s lokalizovanym title, description, canonical a hreflang alternates.
2. Hero s H1, kratkym benefitom a CTA na produkt alebo kategoriu.
3. Odporucany produkt alebo produktovy grid z realnych produktov cez `getProductBySlug` / `getAllProducts`.
4. Sekcia "Kedy pouzit" podla intentu keywordu.
5. Sekcia "Ako aplikovat" alebo "Ako vybrat".
6. FAQ blok minimalne 4 otazky.
7. Interny odkaz na Hakofyt hub, shop a relevantne blog clanky.
8. JSON-LD: `WebPage`, `FAQPage`, pri produktovej intent stranke aj `Product` alebo `ItemList`.
9. Zapis v `i18n/routing.ts`.
10. Zapis v `app/sitemap.ts`.

## 6. Interné prelinkovanie

Odporucana hub struktura:

- Homepage -> `/hnojiva-hakofyt/`, `/hnojivo-na-travnik/`, `/hnojivo-na-ovocne-stromy/`, `/kupit/`.
- `/hnojiva-hakofyt/` -> vsetky hnojivove landing pages.
- Kazda landing page -> relevantny produkt + 2 blog clanky + Hakofyt hub.
- Kazdy blog clanok -> 1 hlavna landing page + 1 produkt + 1 suvisiaci clanok.
- Produktove stranky -> relevantna landing page v kratkom "Poradime s vyberom" bloku.

Najdolezitejsie interné linky:

- `hakofyt-max-trava` -> `/hnojivo-na-travnik/`
- `hakofyt-plus-na-ovocne-dreviny` -> `/hnojivo-na-ovocne-stromy/`
- `hakofyt-plus-zelenina` -> `/hnojivo-na-zeleninu/`
- `hakofyt-b-kvety` -> `/hnojivo-na-kvety/`
- `hakofyt-b-okrasne-dreviny` -> `/hnojivo-na-ihlicnany/`
- `bofix` -> `/burina-v-travniku/`

## 7. Technicke SEO TODO

### Rychle opravy

- Zjednotit `NEXT_PUBLIC_SITE_URL` defaulty: niekde je `https://gardenyx.eu`, inde `https://www.gardenyx.eu`.
- Opravit drobne SK copy chyby v hotovych landing pages:
  - `varovnicou jar sa zazelenáte skôr` na travnikovej CTA v `hnojivo-na-travnik`.
  - `jabloňe`, `väčšinu druhy`, `pôda dostatočne prehrejú` v ovocnych stromoch.
- Skontrolovat canonical pri lokalizovanych SK routach: niektore mapy pouzivaju `/sk/...`, realna default locale moze byt bez prefixu podla `next-intl` routingu.
- Overit, ci `scripts/upsert-dusikate-vapno-article.ts` bol spusteny na aktualnej DB a ci clanok realne existuje vo verejnom blogu.

### Strukturalne upravy

- Pri kazdej novej landing page pridat route aj do `i18n/routing.ts`.
- Pri kazdej novej landing page pridat sitemap entry v `app/sitemap.ts`.
- Doplnit `alternates.languages` tak, aby sedeli s realnymi URL v produkcii.
- Pri blogu zvazit Article schema s `breadcrumb`, `keywords` a `mainEntity` FAQ pri clankoch, ktore maju cast FAQ.
- Produktove stranky doplnit o viac internych odkazov na poradnu a landing pages.
- Admin/blog workflow doplnit o pole `keywords` alebo aspon internu poznamku pre cielovy keyword, aby clanky neboli len textovo spravne, ale strategicky mapovane.

## 8. Implementacny roadmap

### Faza 1 - 1 az 2 tyzdne

- Opravit copy chyby na existujucich landing pages.
- Overit canonical/hreflang pre `/hnojiva-hakofyt`, `/hnojivo-na-travnik`, `/hnojivo-na-ovocne-stromy`.
- Publikovat alebo overit clanok `dusikate-vapno`.
- Vytvorit `/hnojivo/` ako hlavny hnojivovy hub.
- Doplnit interny link z header/nav alebo z Hakofyt hubu na hlavnu SEO kategoriiu.

### Faza 2 - 3 az 4 tyzdne

- Vytvorit `/organicke-hnojivo/`.
- Vytvorit `/npk-hnojivo/`.
- Vytvorit a publikovat clanky:
  - `npk-hnojivo-co-znamena`,
  - `organicke-vs-mineralne-hnojivo`,
  - `ako-a-kedy-hnojit-travnik-na-jar`.
- Prepojit existujuce landing pages na tieto clanky.

### Faza 3 - 2. mesiac

- Vytvorit `/hnojivo-na-zeleninu/`.
- Vytvorit `/hnojivo-na-kvety/`.
- Vytvorit clanky:
  - `hnojivo-na-paradajky`,
  - `hnojivo-na-hortenzie`,
  - `kedy-hnojit-ovocne-stromy`.
- Doplnit CTA bloky na produktove stranky `hakofyt-plus-zelenina`, `hakofyt-b-kvety`, `hakofyt-plus-na-ovocne-dreviny`.

### Faza 4 - 3. mesiac

- Vytvorit long-tail landing pages pre cucoriedky, jahody, citrusy, startovacie hnojivo a ihlicnany.
- Vytvorit `/burina-v-travniku/` pre Bofix.
- Vyhodnotit prve data z Google Search Console:
  - impressions podla URL,
  - CTR pri landing pages,
  - dotazy s poziciou 8-30,
  - clanky, ktore treba doplnit alebo prelinkovat.

## 9. KPI

Sledovat mesacne:

- pocet indexovanych SEO landing pages,
- impressions a clicks pre hnojivove query v Google Search Console,
- CTR hlavnych URL,
- pozicie pre prioritne keywordy:
  - `hnojivo na travnik`,
  - `hnojivo na ovocne stromy`,
  - `organicke hnojivo`,
  - `NPK hnojivo`,
  - `hnojivo na zeleninu`,
  - `hnojivo na kvety`,
  - `dusikate vapno`,
- organicke vstupy na produktove stranky,
- kliky z clankov na produkt alebo kosik,
- tržby/asistovane konverzie z organiky.

## 10. Najblizsi prakticky krok

Najlepsia najblizsia exekucia je:

1. Opravit copy a canonical drobnosti na existujucich SEO landing pages.
2. Vytvorit `/hnojivo/` ako hlavny hnojivovy hub.
3. Publikovat/overit `dusikate-vapno` clanok.
4. Vytvorit `npk-hnojivo` a `organicke-hnojivo` ako dve autoritativne podporne stranky.
5. Nastavit internu linkovu strukturu tak, aby kazda nova URL posilnovala Hakofyt hub a relevantny produkt.

## 11. Realizovane 2026-05-10

Dokoncena prva implementacna cast SEO planu:

- Vytvorena nova hlavna SEO landing page `/hnojivo/` so SK/EN/HU lokalizaciami:
  - SK: `/sk/hnojivo`
  - EN: `/en/fertilizer`
  - HU: `/hu/mutragya`
- Stranka obsahuje SEO metadata, canonical, hreflang alternates, OpenGraph data, FAQ blok a `CollectionPage` + `FAQPage` JSON-LD.
- Produktovy grid sa taha z realnych Hakofyt produktov cez `getAllProducts(locale)`.
- Do navigacie pribudol odkaz `Vsetky hnojiva` pod sekciu `Hnojiva Hakofyt`.
- Doplnene route mapovanie v `i18n/routing.ts`.
- Doplnena sitemap entry pre novu landing page a zladene staticke sitemap URL na `/sk/...`, `/en/...`, `/hu/...`.
- Opraveny middleware/proxy problem, kde sa `/sitemap.xml` presmerovalo na neexistujuce `/sk/sitemap.xml`.
- Zjednotene fallback SEO hosty na `https://www.gardenyx.eu`.
- Opravene zjavne slovenske copy chyby na existujucich landing pages:
  - `/hnojivo-na-travnik`
  - `/hnojivo-na-ovocne-stromy`
- Overene, ze clanok `dusikate-vapno` existuje v DB ako `published` s datumom `2026-04-28` a ma SK/EN/HU preklady.
- Overenie po implementacii:
  - `npm run lint` preslo,
  - `npm run build` preslo,
  - `/sk/hnojivo` vracia `200`,
  - `/en/fertilizer` a `/hu/mutragya` maju spravne canonical,
  - `/sitemap.xml` vracia `200` a obsahuje novu `/sk/hnojivo` URL s hreflang alternates.

Najblizsia odporucana exekucia po tejto faze: vytvorit `/organicke-hnojivo/` a nasledne `/npk-hnojivo/`.
