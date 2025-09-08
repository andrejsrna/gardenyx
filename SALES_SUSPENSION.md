# Systém pozastavenia predajov

Tento dokument popisuje, ako používať systém na dočasné pozastavenie predajov na webe.

## Ako pozastaviť predaje

### 1. Nastavenie environment variables

Pridajte do vášho `.env.local` súboru:

```bash
# Pozastavenie predajov (true/false)
SALES_SUSPENDED=true

# Správa, ktorá sa zobrazí používateľom
SALES_SUSPENSION_MESSAGE="Predaje sú dočasne pozastavené z dôvodu údržby. Ďakujeme za pochopenie."
```

### 2. Aktivácia pozastavenia

- Nastavte `SALES_SUSPENDED=true` v environment variables
- Reštartujte aplikáciu
- Predaje budú okamžite pozastavené

### 3. Deaktivácia pozastavenia

- Nastavte `SALES_SUSPENDED=false` alebo odstráňte premennú
- Reštartujte aplikáciu
- Predaje budú obnovené

## Čo sa deje pri pozastavení predajov

### Frontend (Client-side)
- **Banner**: Zobrazí sa červený banner na vrchu stránky s upozornením
- **Tlačidlá**: Všetky tlačidlá "Pridať do košíka" a "Kúpiť teraz" budú deaktivované
- **Košík**: Pridávanie produktov do košíka bude blokované
- **Pokladňa**: Dokončenie objednávky bude blokované
- **Platby**: Stripe platby budú blokované

### Backend (Server-side)
- **API endpointy**: Všetky API endpointy pre objednávky vrátia chybu 503
- **Stripe**: Payment intent a finalize endpointy budú blokované
- **WooCommerce**: Vytváranie objednávok bude blokované

## Implementované komponenty

### Utility funkcie
- `app/lib/utils/sales-suspension.ts` - Server-side a client-side funkcie pre kontrolu pozastavenia

### Komponenty
- `app/components/SalesSuspensionBanner.tsx` - Banner pre zobrazenie správy o pozastavení

### Aktualizované komponenty
- `app/layout.tsx` - Pridaný banner a server-side nastavenie globálnych premenných
- `app/components/ProductCard.tsx` - Kontrola pri pridávaní do košíka
- `app/context/CartContext.tsx` - Kontrola v cart kontexte
- `app/pokladna/CheckoutClient.tsx` - Kontrola pri dokončovaní objednávky
- `app/components/StripePayment.tsx` - Kontrola pri Stripe platbách
- `app/produkt/[slug]/BuyNowCTA.tsx` - Kontrola pri "Kúpiť teraz"
- `app/produkt/[slug]/AddToCartButton.tsx` - Kontrola pri pridávaní do košíka

### API endpointy
- `app/api/woocommerce/orders/route.ts` - Kontrola pri vytváraní objednávok
- `app/api/stripe/payment-intent/route.ts` - Kontrola pri Stripe payment intent
- `app/api/stripe/finalize/route.ts` - Kontrola pri finalizácii Stripe platby

## Bezpečnosť

- Kontroly sú implementované na viacerých úrovniach (frontend + backend)
- Backend kontroly zabezpečujú, že ani pri obchádzaní frontend kontrol sa nedajú vytvárať objednávky
- Všetky API endpointy vrátia HTTP 503 status pri pozastavení predajov

## Testovanie

1. Nastavte `SALES_SUSPENDED=true`
2. Reštartujte aplikáciu
3. Skontrolujte:
   - Banner sa zobrazuje na vrchu stránky
   - Tlačidlá sú deaktivované
   - Pridávanie do košíka nefunguje
   - Pokladňa nefunguje
   - API endpointy vrátia 503

## Poznámky

- Systém je navrhnutý tak, aby bol jednoduchý na používanie
- Zmeny sa prejavia okamžite po reštarte aplikácie
- Správa o pozastavení je konfigurovateľná cez environment variable
- Všetky kontroly sú implementované s ohľadom na UX - používatelia dostanú jasné upozornenie
